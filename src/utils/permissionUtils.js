// 权限管理工具

import { getPlatform } from './platformUtils.js'

// 权限管理器
export const permissionUtils = {

    // 检查和请求相机权限
    async requestCameraPermission() {
        const platform = getPlatform()
        console.log('请求相机权限，当前平台:', platform)

        const result = {
            granted: false,
            platform,
            method: 'unknown',
            error: null,
            canRetry: false
        }

        try {
            // #ifdef APP-PLUS
            if (platform === 'APP-PLUS') {
                return await this.requestAppPlusPermissions(['camera'], result)
            }
            // #endif

            // #ifdef H5
            if (platform === 'H5') {
                return await this.requestH5Permissions(result)
            }
            // #endif

            // #ifdef MP-WEIXIN
            if (platform === 'MP-WEIXIN') {
                return await this.requestMpPermissions(result)
            }
            // #endif

            // 其他平台默认假设有权限
            result.granted = true
            result.method = 'default'
            return result

        } catch (error) {
            console.error('权限请求过程出错:', error)
            result.error = error.message
            return result
        }
    },

    // APP-PLUS平台权限请求
    async requestAppPlusPermissions(permissions, result) {
        return new Promise((resolve) => {
            try {
                // 检查权限是否已授予
                const permissionNames = permissions.map(p => `android.permission.${p.toUpperCase()}`)

                plus.android.requestPermissions(
                    permissionNames,
                    (successResult) => {
                        console.log('APP-PLUS权限请求成功:', successResult)

                        result.method = 'app_plus_android'
                        result.granted = successResult.granted &&
                            successResult.granted.length > 0 &&
                            successResult.granted.includes(permissionNames[0])

                        if (!result.granted && successResult.deniedPresent) {
                            result.canRetry = true
                            result.error = '权限被拒绝，但可以重新请求'
                        } else if (!result.granted && successResult.deniedAlways) {
                            result.canRetry = false
                            result.error = '权限被永久拒绝，需要手动在设置中开启'
                        }

                        resolve(result)
                    },
                    (failResult) => {
                        console.error('APP-PLUS权限请求失败:', failResult)
                        result.granted = false
                        result.method = 'app_plus_android'
                        result.error = failResult.message || '权限请求失败'
                        result.canRetry = true
                        resolve(result)
                    }
                )
            } catch (error) {
                console.error('APP-PLUS权限请求异常:', error)
                result.error = error.message
                resolve(result)
            }
        })
    },

    // H5平台权限处理
    async requestH5Permissions(result) {
        try {
            // H5环境中，权限通常在用户操作时由浏览器处理
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                result.granted = true
                result.method = 'h5_media_devices'
            } else {
                result.granted = false
                result.error = '浏览器不支持媒体设备访问'
                result.method = 'h5_unsupported'
            }
        } catch (error) {
            result.error = error.message
            result.method = 'h5_error'
        }

        return result
    },

    // 小程序权限处理
    async requestMpPermissions(result) {
        return new Promise((resolve) => {
            try {
                uni.authorize({
                    scope: 'scope.camera',
                    success: () => {
                        console.log('小程序相机权限授权成功')
                        result.granted = true
                        result.method = 'mp_authorize'
                        resolve(result)
                    },
                    fail: (error) => {
                        console.warn('小程序相机权限授权失败:', error)
                        result.granted = false
                        result.method = 'mp_authorize'
                        result.error = error.errMsg || '权限授权失败'
                        result.canRetry = true
                        resolve(result)
                    }
                })
            } catch (error) {
                result.error = error.message
                result.method = 'mp_error'
                resolve(result)
            }
        })
    },

    // 检查存储权限
    async checkStoragePermission() {
        const platform = getPlatform()
        console.log('检查存储权限，当前平台:', platform)

        const result = {
            granted: false,
            platform,
            error: null
        }

        try {
            // #ifdef APP-PLUS
            if (platform === 'APP-PLUS') {
                // 检查存储权限
                const permissions = [
                    'android.permission.READ_EXTERNAL_STORAGE',
                    'android.permission.WRITE_EXTERNAL_STORAGE'
                ]

                return new Promise((resolve) => {
                    plus.android.requestPermissions(
                        permissions,
                        (successResult) => {
                            result.granted = successResult.granted && successResult.granted.length > 0
                            resolve(result)
                        },
                        (failResult) => {
                            result.error = failResult.message || '存储权限请求失败'
                            resolve(result)
                        }
                    )
                })
            }
            // #endif

            // 其他平台通常不需要显式的存储权限
            result.granted = true
            return result

        } catch (error) {
            console.error('存储权限检查出错:', error)
            result.error = error.message
            return result
        }
    },

    // 显示权限说明对话框
    showPermissionDialog(permissionType = 'camera') {
        const titles = {
            camera: '相机权限说明',
            storage: '存储权限说明'
        }

        const contents = {
            camera: '应用需要相机权限来拍摄照片，用于添加衣物图片。您可以选择：\n\n1. 授予权限 - 可以使用相机拍照\n2. 拒绝权限 - 只能从相册选择图片\n\n是否现在授予相机权限？',
            storage: '应用需要存储权限来保存和读取图片。是否授予存储权限？'
        }

        return new Promise((resolve) => {
            uni.showModal({
                title: titles[permissionType] || '权限说明',
                content: contents[permissionType] || '应用需要相关权限才能正常工作',
                confirmText: '授予权限',
                cancelText: '稍后再说',
                success: (res) => {
                    resolve(res.confirm)
                },
                fail: () => {
                    resolve(false)
                }
            })
        })
    },

    // 显示权限被拒绝的对话框
    showPermissionDeniedDialog(permissionType = 'camera', canRetry = true) {
        const titles = {
            camera: '相机权限被拒绝',
            storage: '存储权限被拒绝'
        }

        let content = ''
        if (canRetry) {
            content = '权限被拒绝，您可以：\n\n1. 重新请求权限\n2. 使用相册模式（仅限相机权限）\n3. 手动在设置中开启权限\n\n是否重新请求权限？'
        } else {
            content = '权限被永久拒绝，请手动在系统设置中开启权限：\n\n设置 → 应用管理 → 小黄衣 → 权限管理\n\n开启相关权限后返回应用重试。'
        }

        return new Promise((resolve) => {
            uni.showModal({
                title: titles[permissionType] || '权限被拒绝',
                content,
                confirmText: canRetry ? '重新请求' : '我知道了',
                cancelText: canRetry ? '使用相册' : undefined,
                showCancel: canRetry,
                success: (res) => {
                    resolve(res.confirm)
                },
                fail: () => {
                    resolve(false)
                }
            })
        })
    },

    // 智能权限管理流程
    async smartPermissionFlow(permissionType = 'camera') {
        console.log('开始智能权限管理流程:', permissionType)

        try {
            // 1. 显示权限说明
            const userWantsPermission = await this.showPermissionDialog(permissionType)
            if (!userWantsPermission) {
                return {
                    granted: false,
                    reason: 'user_declined_explanation'
                }
            }

            // 2. 请求权限
            let permissionResult
            if (permissionType === 'camera') {
                permissionResult = await this.requestCameraPermission()
            } else if (permissionType === 'storage') {
                permissionResult = await this.checkStoragePermission()
            } else {
                throw new Error('不支持的权限类型: ' + permissionType)
            }

            // 3. 处理权限结果
            if (permissionResult.granted) {
                console.log('权限授予成功')
                return {
                    granted: true,
                    method: permissionResult.method
                }
            }

            // 4. 权限被拒绝，显示相应对话框
            const retryPermission = await this.showPermissionDeniedDialog(
                permissionType,
                permissionResult.canRetry
            )

            if (retryPermission && permissionResult.canRetry) {
                // 重新请求权限
                console.log('用户选择重新请求权限')
                if (permissionType === 'camera') {
                    return await this.requestCameraPermission()
                } else {
                    return await this.checkStoragePermission()
                }
            }

            return {
                granted: false,
                reason: 'permission_denied',
                canRetry: permissionResult.canRetry,
                error: permissionResult.error
            }

        } catch (error) {
            console.error('智能权限管理流程出错:', error)
            return {
                granted: false,
                reason: 'permission_flow_error',
                error: error.message
            }
        }
    }
}

// 导出默认对象
export default permissionUtils
