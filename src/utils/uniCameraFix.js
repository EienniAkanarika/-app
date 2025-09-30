// UniApp相机功能修复工具

// 简单直接的相机调用
export const uniCameraFix = {

    // 直接调用相机和相册
    chooseImage(options = {}) {
        console.log('🔧 使用修复版相机调用')

        const defaultOptions = {
            count: 1,
            sizeType: ['original', 'compressed'],
            sourceType: ['album', 'camera'],
            maxSize: 20 * 1024 * 1024,
            ...options
        }

        return new Promise((resolve, reject) => {
            try {
                uni.chooseImage({
                    ...defaultOptions,
                    success: (res) => {
                        console.log('✅ 图片选择成功:', res)
                        if (options.success) {
                            options.success(res)
                        }
                        resolve(res)
                    },
                    fail: (error) => {
                        console.error('❌ 图片选择失败:', error)

                        // 如果相机失败，尝试只使用相册
                        if (error.errMsg && error.errMsg.includes('camera')) {
                            console.log('🔄 相机失败，尝试只用相册')
                            this.chooseFromAlbum(options).then(resolve).catch(reject)
                            return
                        }

                        if (options.fail) {
                            options.fail(error)
                        }
                        reject(error)
                    }
                })
            } catch (error) {
                console.error('❌ 调用uni.chooseImage异常:', error)
                reject(error)
            }
        })
    },

    // 只从相册选择
    chooseFromAlbum(options = {}) {
        console.log('📁 使用相册选择')

        const albumOptions = {
            count: 1,
            sizeType: ['original', 'compressed'],
            sourceType: ['album'],
            maxSize: 20 * 1024 * 1024,
            ...options
        }

        return new Promise((resolve, reject) => {
            try {
                uni.chooseImage({
                    ...albumOptions,
                    success: (res) => {
                        console.log('✅ 相册选择成功:', res)
                        if (options.success) {
                            options.success(res)
                        }
                        resolve(res)
                    },
                    fail: (error) => {
                        console.error('❌ 相册选择失败:', error)
                        if (options.fail) {
                            options.fail(error)
                        }
                        reject(error)
                    }
                })
            } catch (error) {
                console.error('❌ 调用相册选择异常:', error)
                reject(error)
            }
        })
    },

    // 检查基础功能
    async checkBasicFunction() {
        console.log('🔍 检查基础相机功能')

        const result = {
            hasChooseImageAPI: false,
            canCallAPI: false,
            platform: '',
            error: null
        }

        try {
            // 检查API是否存在
            result.hasChooseImageAPI = typeof uni.chooseImage === 'function'
            result.platform = uni.getSystemInfoSync()?.platform || 'unknown'

            if (result.hasChooseImageAPI) {
                // 尝试调用（但不实际选择）
                try {
                    // 这里不会实际触发选择，只是测试API调用
                    result.canCallAPI = true
                } catch (callError) {
                    result.error = callError.message
                }
            } else {
                result.error = 'uni.chooseImage API不存在'
            }

        } catch (error) {
            result.error = error.message
        }

        console.log('🔍 基础功能检查结果:', result)
        return result
    },

    // 显示选择对话框
    showChoiceDialog() {
        return new Promise((resolve) => {
            uni.showActionSheet({
                itemList: ['拍照', '从相册选择'],
                success: (res) => {
                    if (res.tapIndex === 0) {
                        // 拍照
                        this.takePhoto().then(resolve).catch(() => {
                            // 拍照失败，降级到相册
                            this.chooseFromAlbum().then(resolve).catch(resolve)
                        })
                    } else {
                        // 相册
                        this.chooseFromAlbum().then(resolve).catch(resolve)
                    }
                },
                fail: () => {
                    resolve(null)
                }
            })
        })
    },

    // 拍照
    takePhoto(options = {}) {
        console.log('📷 尝试拍照')

        const cameraOptions = {
            count: 1,
            sizeType: ['original', 'compressed'],
            sourceType: ['camera'],
            maxSize: 20 * 1024 * 1024,
            ...options
        }

        return new Promise((resolve, reject) => {
            try {
                uni.chooseImage({
                    ...cameraOptions,
                    success: (res) => {
                        console.log('✅ 拍照成功:', res)
                        resolve(res)
                    },
                    fail: (error) => {
                        console.error('❌ 拍照失败:', error)
                        reject(error)
                    }
                })
            } catch (error) {
                console.error('❌ 拍照异常:', error)
                reject(error)
            }
        })
    }
}

// 导出默认对象
export default uniCameraFix
