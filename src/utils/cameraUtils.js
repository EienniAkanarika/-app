// 相机功能工具类

import { getPlatform } from './platformUtils.js'

// 相机功能检测和管理
export const cameraUtils = {

    // 检查相机可用性
    async checkCameraAvailability() {
        const platform = getPlatform()

        const result = {
            platform,
            hasCameraAPI: false,
            hasCameraPermission: false,
            cameraModuleEnabled: false,
            canUseCamera: false,
            canUseAlbum: false,
            isSimulator: false,
            isDevelopment: false,
            issues: [],
            suggestions: [],
            recommendedMode: 'unknown'
        }

        try {
            // 检查系统信息和环境
            const systemInfo = uni.getSystemInfoSync()
            result.isSimulator = this.detectSimulator(systemInfo)
            result.isDevelopment = this.detectDevelopmentEnvironment(systemInfo)

            // 检查uni.chooseImage API是否可用
            if (typeof uni.chooseImage === 'function') {
                result.hasCameraAPI = true
            } else {
                result.issues.push('uni.chooseImage API不可用')
                result.suggestions.push('检查UniApp版本和平台支持')
            }

            // 首先测试相册功能
            result.canUseAlbum = await this.testAlbumAccess()
            if (!result.canUseAlbum) {
                result.issues.push('相册访问不可用')
                result.suggestions.push('检查存储权限设置')
            }

            // 检查相机权限（APP环境）
            // #ifdef APP-PLUS
            if (platform === 'APP-PLUS') {
                try {
                    const res = await this.requestCameraPermission()
                    result.hasCameraPermission = res.granted
                    if (!res.granted) {
                        result.issues.push('没有相机权限')
                        result.suggestions.push('请在系统设置中授予相机权限')
                    }
                } catch (error) {
                    result.issues.push('权限检查失败: ' + error.message)
                }
            } else {
                result.hasCameraPermission = true // H5和小程序通常在调用时请求权限
            }
            // #endif

            // #ifndef APP-PLUS
            result.hasCameraPermission = true
            // #endif

            // 检查相机模块是否已配置（主要针对APP-PLUS）
            result.cameraModuleEnabled = await this.checkCameraModule()
            if (!result.cameraModuleEnabled && platform === 'APP-PLUS') {
                result.issues.push('相机模块未配置')
                result.suggestions.push('需要在manifest.json中配置Camera模块，然后重新构建应用')
            }

            // 综合判断和推荐模式
            result.canUseCamera = result.hasCameraAPI &&
                result.hasCameraPermission &&
                (platform !== 'APP-PLUS' || result.cameraModuleEnabled)

            // 确定推荐模式
            if (result.isSimulator || result.isDevelopment) {
                result.recommendedMode = 'album_only'
                result.suggestions.unshift('开发/模拟器环境，推荐使用相册模式')
            } else if (result.canUseCamera && result.canUseAlbum) {
                result.recommendedMode = 'camera_and_album'
            } else if (result.canUseAlbum) {
                result.recommendedMode = 'album_only'
                result.suggestions.unshift('相机不可用，建议使用相册模式')
            } else {
                result.recommendedMode = 'none'
                result.issues.push('图片选择功能完全不可用')
            }

        } catch (error) {
            result.issues.push('检查过程出错: ' + error.message)
            result.recommendedMode = 'album_only' // 出错时默认相册模式
        }

        return result
    },

    // 检测模拟器环境
    detectSimulator(systemInfo) {
        if (!systemInfo) return false

        const brand = systemInfo.brand?.toLowerCase() || ''
        const model = systemInfo.model?.toLowerCase() || ''
        const platform = systemInfo.platform?.toLowerCase() || ''

        // iOS模拟器检测
        if (platform === 'ios' && (
            model.includes('simulator') ||
            model.includes('x86') ||
            brand.includes('simulator')
        )) {
            return true
        }

        // Android模拟器检测
        if (platform === 'android' && (
            brand.includes('google') ||
            model.includes('sdk') ||
            model.includes('emulator') ||
            model.includes('android sdk') ||
            brand.includes('generic') ||
            model.includes('genymotion')
        )) {
            return true
        }

        return false
    },

    // 检测开发环境
    detectDevelopmentEnvironment(systemInfo) {
        // #ifdef H5
        return true
        // #endif

        // #ifndef H5
        // 检查是否有开发环境标识
        if (systemInfo && systemInfo.uniCompileVersion) {
            return true
        }

        // 检查是否在HBuilderX中运行
        if (typeof plus !== 'undefined' && plus.runtime) {
            return plus.runtime.isDebugDev || false
        }

        return false
        // #endif
    },

    // 测试相册访问
    async testAlbumAccess() {
        return new Promise((resolve) => {
            try {
                uni.chooseImage({
                    count: 1,
                    sourceType: ['album'],
                    success: () => {
                        console.log('相册访问测试成功')
                        resolve(true)
                    },
                    fail: (error) => {
                        console.warn('相册访问测试失败:', error)
                        if (error.errMsg && (
                            error.errMsg.includes('cancel') ||
                            error.errMsg.includes('用户取消')
                        )) {
                            // 用户取消不算失败
                            resolve(true)
                        } else {
                            resolve(false)
                        }
                    }
                })

                // 设置测试超时
                setTimeout(() => {
                    console.warn('相册访问测试超时')
                    resolve(false)
                }, 3000)
            } catch (error) {
                console.error('相册访问测试异常:', error)
                resolve(false)
            }
        })
    },

    // 请求相机权限
    requestCameraPermission() {
        return new Promise((resolve) => {
            // #ifdef APP-PLUS
            const permissions = ['android.permission.CAMERA']

            plus.android.requestPermissions(permissions,
                (result) => {
                    console.log('权限请求结果:', result)
                    const granted = result.granted && result.granted.includes('android.permission.CAMERA')
                    resolve({
                        granted,
                        result
                    })
                },
                (error) => {
                    console.error('权限请求失败:', error)
                    resolve({
                        granted: false,
                        error
                    })
                }
            )
            // #endif

            // #ifndef APP-PLUS
            resolve({
                granted: true,
                message: '当前平台不需要显式权限请求'
            })
            // #endif
        })
    },

    // 检查相机模块配置
    async checkCameraModule() {
        // #ifdef APP-PLUS
        try {
            // 首先检查manifest.json配置
            const systemInfo = uni.getSystemInfoSync()
            console.log('当前系统信息:', systemInfo)

            // 对于APP-PLUS环境，如果是打包后的应用，模块应该可用
            // 如果是开发环境，可能会有模块检测问题
            if (systemInfo.uniCompileVersion) {
                console.log('检测到UniApp编译版本:', systemInfo.uniCompileVersion)
                // 开发环境下，假设模块已配置
                return true
            }

            // 尝试调用相机相关功能来检测模块是否可用
            return new Promise((resolve) => {
                // 先尝试最简单的检测
                if (typeof uni.chooseImage !== 'function') {
                    console.error('uni.chooseImage API不存在')
                    resolve(false)
                    return
                }

                uni.chooseImage({
                    count: 1,
                    sourceType: ['camera'],
                    success: () => {
                        console.log('相机模块检测成功')
                        resolve(true)
                    },
                    fail: (error) => {
                        console.warn('相机模块检查失败:', error)
                        if (error.errMsg) {
                            if (error.errMsg.includes('camera module')) {
                                console.error('确认相机模块未配置')
                                resolve(false)
                            } else if (error.errMsg.includes('cancel')) {
                                // 用户取消不算模块问题
                                console.log('用户取消，但模块可用')
                                resolve(true)
                            } else if (error.errMsg.includes('permission')) {
                                // 权限问题不算模块问题
                                console.log('权限问题，但模块可用')
                                resolve(true)
                            } else {
                                console.log('其他错误，假设模块可用:', error.errMsg)
                                resolve(true)
                            }
                        } else {
                            resolve(true)
                        }
                    }
                })

                // 设置超时，避免长时间等待
                setTimeout(() => {
                    console.warn('相机模块检测超时，假设不可用')
                    resolve(false)
                }, 5000)
            })
        } catch (error) {
            console.error('检查相机模块时出错:', error)
            return false
        }
        // #endif

        // #ifndef APP-PLUS
        return true
        // #endif
    },

    // 安全的选择图片方法
    async safeChooseImage(options = {}) {
        try {
            // 首先检查相机可用性
            const cameraCheck = await this.checkCameraAvailability()
            console.log('相机可用性检查:', cameraCheck)

            if (!cameraCheck.canUseCamera) {
                console.warn('相机不可用，原因:', cameraCheck.issues)

                // 如果相机不可用，只使用相册
                const fallbackOptions = {
                    ...options,
                    sourceType: ['album'], // 只使用相册
                    success: (res) => {
                        console.log('使用相册选择图片成功')
                        if (options.success) {
                            options.success(res)
                        }
                    },
                    fail: (error) => {
                        console.error('相册选择失败:', error)
                        if (options.fail) {
                            options.fail(error)
                        }
                    }
                }

                return uni.chooseImage(fallbackOptions)
            }

            // 相机可用，使用原始选项
            return uni.chooseImage(options)

        } catch (error) {
            console.error('安全选择图片失败:', error)

            // 最后的备选方案：只使用相册
            const emergencyOptions = {
                ...options,
                sourceType: ['album'],
                fail: (albumError) => {
                    console.error('相册也不可用:', albumError)
                    if (options.fail) {
                        options.fail({
                            errMsg: '图片选择功能不可用: ' + error.message,
                            originalError: error
                        })
                    }
                }
            }

            return uni.chooseImage(emergencyOptions)
        }
    },

    // 显示相机不可用的提示
    showCameraUnavailableDialog(issues = [], suggestions = []) {
        const title = '相机功能不可用'
        let content = '检测到以下问题：\n'

        issues.forEach((issue, index) => {
            content += `${index + 1}. ${issue}\n`
        })

        if (suggestions.length > 0) {
            content += '\n建议解决方案：\n'
            suggestions.forEach((suggestion, index) => {
                content += `${index + 1}. ${suggestion}\n`
            })
        }

        // 检查是否为开发环境的模块配置问题
        const isModuleIssue = issues.some(issue => issue.includes('模块未配置'))
        if (isModuleIssue) {
            content += '\n💡 提示：如果您已在manifest.json中配置了Camera模块，'
            content += '请重新构建应用后再试。开发环境下可能存在模块检测问题。'
        }

        content += '\n是否只使用相册选择图片？'

        return new Promise((resolve) => {
            uni.showModal({
                title,
                content,
                confirmText: '只用相册',
                cancelText: '取消',
                success: (res) => {
                    resolve(res.confirm)
                },
                fail: () => {
                    resolve(false)
                }
            })
        })
    },

    // 开发环境的快速相册选择
    quickAlbumChoice(options = {}) {
        console.log('使用快速相册选择模式')
        const albumOptions = {
            ...options,
            sourceType: ['album'], // 只使用相册
            success: (res) => {
                console.log('相册选择成功')
                if (options.success) {
                    options.success(res)
                }
            },
            fail: (error) => {
                console.error('相册选择失败:', error)
                if (options.fail) {
                    options.fail(error)
                }
            }
        }

        return uni.chooseImage(albumOptions)
    },

    // 智能选择图片（带用户交互）
    async smartChooseImage(options = {}) {
        try {
            console.log('开始智能图片选择')
            const cameraCheck = await this.checkCameraAvailability()
            console.log('相机检查结果:', cameraCheck)

            // 根据推荐模式选择策略
            switch (cameraCheck.recommendedMode) {
                case 'album_only':
                    console.log('使用相册模式')
                    return this.useAlbumMode(options, cameraCheck)

                case 'camera_and_album':
                    console.log('使用完整相机+相册模式')
                    return this.useFullMode(options)

                case 'none':
                    console.error('图片选择功能不可用')
                    return this.handleUnavailable(options, cameraCheck)

                default:
                    console.warn('未知推荐模式，使用相册备选')
                    return this.useAlbumMode(options, cameraCheck)
            }

        } catch (error) {
            console.error('智能选择图片失败:', error)

            // 最后的备选方案
            const emergencyOptions = {
                ...options,
                sourceType: ['album'],
                fail: (albumError) => {
                    console.error('紧急备选方案也失败:', albumError)
                    if (options.fail) {
                        options.fail({
                            errMsg: '图片选择功能完全不可用: ' + error.message,
                            originalError: error
                        })
                    }
                }
            }

            return uni.chooseImage(emergencyOptions)
        }
    },

    // 使用相册模式
    async useAlbumMode(options, cameraCheck) {
        // 开发环境直接使用，生产环境可能需要用户确认
        if (cameraCheck.isDevelopment || cameraCheck.isSimulator) {
            console.log('开发/模拟器环境，直接使用相册')
            const albumOptions = {
                ...options,
                sourceType: ['album']
            }
            return uni.chooseImage(albumOptions)
        }

        // 生产环境询问用户
        const useAlbumOnly = await this.showModeSelectionDialog(cameraCheck)

        if (!useAlbumOnly) {
            if (options.fail) {
                options.fail({
                    errMsg: 'user canceled',
                    reason: 'mode_selection_canceled'
                })
            }
            return
        }

        const albumOptions = {
            ...options,
            sourceType: ['album']
        }
        return uni.chooseImage(albumOptions)
    },

    // 使用完整模式
    useFullMode(options) {
        console.log('使用完整相机+相册模式')
        return uni.chooseImage(options)
    },

    // 处理完全不可用的情况
    async handleUnavailable(options, cameraCheck) {
        await this.showUnavailableDialog(cameraCheck)

        if (options.fail) {
            options.fail({
                errMsg: 'image selection unavailable',
                reason: 'no_available_method',
                details: cameraCheck.issues
            })
        }
    },

    // 显示模式选择对话框
    showModeSelectionDialog(cameraCheck) {
        const title = '选择图片来源'
        let content = ''

        if (cameraCheck.issues.length > 0) {
            content += '检测到以下问题：\n'
            cameraCheck.issues.forEach((issue, index) => {
                content += `${index + 1}. ${issue}\n`
            })
            content += '\n'
        }

        content += '当前只能使用相册选择图片，是否继续？'

        return new Promise((resolve) => {
            uni.showModal({
                title,
                content,
                confirmText: '使用相册',
                cancelText: '取消',
                success: (res) => {
                    resolve(res.confirm)
                },
                fail: () => {
                    resolve(false)
                }
            })
        })
    },

    // 显示功能不可用对话框
    showUnavailableDialog(cameraCheck) {
        const title = '图片选择不可用'
        let content = '很抱歉，图片选择功能当前不可用：\n'

        cameraCheck.issues.forEach((issue, index) => {
            content += `${index + 1}. ${issue}\n`
        })

        if (cameraCheck.suggestions.length > 0) {
            content += '\n建议解决方案：\n'
            cameraCheck.suggestions.forEach((suggestion, index) => {
                content += `${index + 1}. ${suggestion}\n`
            })
        }

        return new Promise((resolve) => {
            uni.showModal({
                title,
                content,
                showCancel: false,
                confirmText: '知道了',
                success: () => {
                    resolve()
                },
                fail: () => {
                    resolve()
                }
            })
        })
    }
}

// 导出默认对象
export default cameraUtils
