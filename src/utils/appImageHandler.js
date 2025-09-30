// APP环境专用图片处理工具

// APP环境图片处理器
export const appImageHandler = {

    // APP环境下保存图片
    async saveImageForApp(imagePath, options = {}) {
        console.log('🔧 APP环境保存图片:', imagePath)

        try {
            // 1. 生成唯一ID
            const imageId = 'img_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)

            // 2. 直接使用图片路径（不转base64）
            const imageInfo = {
                id: imageId,
                originalPath: imagePath,
                localPath: imagePath,
                mimeType: this.getMimeTypeFromPath(imagePath),
                createdAt: new Date().toISOString(),
                platform: 'APP-PLUS',
                ...options.metadata
            }

            // 3. 保存到本地存储
            const storageKey = 'app_images'
            let allImages = {}

            try {
                allImages = uni.getStorageSync(storageKey) || {}
            } catch (error) {
                console.warn('获取存储失败，使用空对象:', error)
                allImages = {}
            }

            allImages[imageId] = imageInfo

            try {
                uni.setStorageSync(storageKey, allImages)
                console.log('✅ APP环境图片保存成功:', imageId)

                return {
                    success: true,
                    imageId: imageId,
                    localPath: imagePath,
                    displayUrl: imagePath, // APP中直接使用本地路径
                    imageInfo: imageInfo
                }
            } catch (storageError) {
                console.error('❌ 存储保存失败:', storageError)
                throw new Error('存储写入失败: ' + storageError.message)
            }

        } catch (error) {
            console.error('❌ APP环境保存图片失败:', error)
            return {
                success: false,
                error: error.message,
                imageId: null
            }
        }
    },

    // 获取图片
    getImage(imageId) {
        try {
            const storageKey = 'app_images'
            const allImages = uni.getStorageSync(storageKey) || {}
            return allImages[imageId] || null
        } catch (error) {
            console.error('获取图片失败:', error)
            return null
        }
    },

    // 获取图片显示URL
    getImageUrl(imageId) {
        const imageInfo = this.getImage(imageId)
        if (imageInfo) {
            // APP环境直接返回本地路径
            return imageInfo.localPath || imageInfo.originalPath
        }
        return null
    },

    // 获取所有图片
    getAllImages() {
        try {
            const storageKey = 'app_images'
            return uni.getStorageSync(storageKey) || {}
        } catch (error) {
            console.error('获取所有图片失败:', error)
            return {}
        }
    },

    // 删除图片
    deleteImage(imageId) {
        try {
            const storageKey = 'app_images'
            const allImages = uni.getStorageSync(storageKey) || {}

            if (allImages[imageId]) {
                delete allImages[imageId]
                uni.setStorageSync(storageKey, allImages)
                console.log('✅ 删除图片成功:', imageId)
                return true
            }

            return false
        } catch (error) {
            console.error('删除图片失败:', error)
            return false
        }
    },

    // 根据文件路径获取MIME类型
    getMimeTypeFromPath(filePath) {
        if (!filePath) return 'image/jpeg'

        const extension = filePath.split('.').pop()?.toLowerCase()
        const mimeTypes = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'webp': 'image/webp',
            'bmp': 'image/bmp'
        }

        return mimeTypes[extension] || 'image/jpeg'
    },

    // 检查图片是否存在
    async checkImageExists(imagePath) {
        return new Promise((resolve) => {
            // #ifdef APP-PLUS
            if (typeof plus !== 'undefined' && plus.io) {
                plus.io.resolveLocalFileSystemURL(imagePath,
                    () => resolve(true),
                    () => resolve(false)
                )
            } else {
                resolve(true) // 假设存在
            }
            // #endif

            // #ifndef APP-PLUS
            resolve(true)
            // #endif
        })
    },

    // 清理过期图片
    cleanupExpiredImages(daysToKeep = 30) {
        try {
            const storageKey = 'app_images'
            const allImages = uni.getStorageSync(storageKey) || {}
            const cutoffDate = new Date()
            cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

            let cleanedCount = 0

            Object.keys(allImages).forEach(imageId => {
                const imageInfo = allImages[imageId]
                if (imageInfo.createdAt) {
                    const imageDate = new Date(imageInfo.createdAt)
                    if (imageDate < cutoffDate) {
                        delete allImages[imageId]
                        cleanedCount++
                    }
                }
            })

            if (cleanedCount > 0) {
                uni.setStorageSync(storageKey, allImages)
                console.log(`✅ 清理过期图片完成，清理了 ${cleanedCount} 张图片`)
            }

            return cleanedCount
        } catch (error) {
            console.error('清理过期图片失败:', error)
            return 0
        }
    },

    // 获取存储统计
    getStorageStats() {
        try {
            const allImages = this.getAllImages()
            const imageCount = Object.keys(allImages).length

            return {
                imageCount,
                storageKey: 'app_images',
                platform: 'APP-PLUS'
            }
        } catch (error) {
            console.error('获取存储统计失败:', error)
            return {
                imageCount: 0,
                storageKey: 'app_images',
                platform: 'APP-PLUS',
                error: error.message
            }
        }
    }
}

// 导出默认对象
export default appImageHandler
