// 本地图片存储工具
import { compressImage } from './imageUtils.js'

// 本地图片存储管理
export const imageStorage = {
    // 存储key
    STORAGE_KEY: 'local_images',

    // 初始化存储
    init() {
        const data = this.getAll()
        if (!data) {
            uni.setStorageSync(this.STORAGE_KEY, {})
            console.log('初始化本地图片存储')
        }
    },

    // 获取所有存储的图片
    getAll() {
        try {
            return uni.getStorageSync(this.STORAGE_KEY) || {}
        } catch (error) {
            console.error('获取本地图片存储失败:', error)
            return {}
        }
    },

    // 保存图片到本地存储
    async saveImage(imagePath, options = {}) {
        try {
            console.log('开始保存图片到本地存储:', imagePath)

            // 验证输入参数
            if (!imagePath) {
                throw new Error('图片路径不能为空')
            }

            // 生成唯一ID
            const imageId = 'img_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)

            // 压缩图片（如果需要）
            let finalImagePath = imagePath
            if (options.compress !== false) {
                try {
                    finalImagePath = await compressImage(imagePath, {
                        quality: options.quality || 0.8,
                        maxWidth: options.maxWidth || 1200,
                        maxHeight: options.maxHeight || 1200
                    })
                    console.log('图片压缩完成:', finalImagePath)
                } catch (error) {
                    console.warn('图片压缩失败，使用原图:', error)
                    finalImagePath = imagePath
                }
            }

            // 读取图片文件为base64
            const base64Data = await this.imageToBase64(finalImagePath)

            if (!base64Data) {
                throw new Error('无法读取图片数据')
            }

            // 检查base64数据大小
            const sizeInMB = (base64Data.length * 0.75) / (1024 * 1024) // base64 to bytes
            if (sizeInMB > 10) { // 限制10MB
                console.warn('图片过大:', sizeInMB.toFixed(2) + 'MB')
                if (options.compress !== false) {
                    // 尝试更高压缩率
                    try {
                        const recompressedPath = await compressImage(imagePath, {
                            quality: 0.5,
                            maxWidth: 800,
                            maxHeight: 800
                        })
                        const recompressedBase64 = await this.imageToBase64(recompressedPath)
                        if (recompressedBase64 && recompressedBase64.length < base64Data.length) {
                            console.log('使用重新压缩的图片')
                            finalImagePath = recompressedPath
                            base64Data = recompressedBase64
                        }
                    } catch (recompressError) {
                        console.warn('重新压缩失败:', recompressError)
                    }
                }
            }

            // 检查存储空间
            try {
                const storageInfo = await this.checkStorageSpace()
                if (storageInfo && storageInfo.usage > 0.9) {
                    console.warn('存储空间不足，尝试清理过期图片')
                    this.cleanupExpiredImages(7) // 清理7天前的图片
                }
            } catch (storageError) {
                console.warn('检查存储空间失败:', storageError)
            }

            // 保存到本地存储
            const allImages = this.getAll()
            const imageInfo = {
                id: imageId,
                originalPath: imagePath,
                compressedPath: finalImagePath,
                base64: base64Data,
                mimeType: this.getMimeType(finalImagePath),
                size: base64Data.length,
                createdAt: new Date().toISOString(),
                ...options.metadata
            }

            // 尝试保存到存储
            try {
                allImages[imageId] = imageInfo
                uni.setStorageSync(this.STORAGE_KEY, allImages)
            } catch (storageError) {
                console.error('写入存储失败:', storageError)
                throw new Error('存储空间不足或存储写入失败')
            }

            console.log('图片保存成功, ID:', imageId, '大小:', this.formatFileSize(base64Data.length))

            return {
                success: true,
                imageId: imageId,
                localPath: finalImagePath,
                base64Url: `data:${imageInfo.mimeType};base64,${base64Data}`,
                imageInfo: imageInfo
            }

        } catch (error) {
            console.error('保存图片到本地存储失败:', error)

            // 返回详细的错误信息
            let errorMessage = error.message || '未知错误'

            // 针对不同错误类型提供更友好的提示
            if (error.message?.includes('存储空间')) {
                errorMessage = '设备存储空间不足，请清理后重试'
            } else if (error.message?.includes('图片数据')) {
                errorMessage = '图片格式不支持或已损坏'
            } else if (error.message?.includes('权限')) {
                errorMessage = '没有存储权限，请检查应用权限设置'
            }

            return {
                success: false,
                error: errorMessage,
                imageId: null,
                details: error.message
            }
        }
    },

    // 将图片转换为base64
    imageToBase64(imagePath) {
        return new Promise((resolve, reject) => {
            // #ifdef H5
            // H5环境：使用Canvas转换
            this.convertImageToBase64Canvas(imagePath)
                .then(resolve)
                .catch(reject)
            // #endif

            // #ifdef MP-WEIXIN || APP-PLUS
            // 小程序和App环境：使用文件系统API
            if (uni.getFileSystemManager) {
                uni.getFileSystemManager().readFile({
                    filePath: imagePath,
                    encoding: 'base64',
                    success: (res) => {
                        resolve(res.data)
                    },
                    fail: (error) => {
                        console.error('读取文件失败:', error)
                        // 如果文件系统API失败，尝试使用Canvas方法
                        this.convertImageToBase64Canvas(imagePath)
                            .then(resolve)
                            .catch(reject)
                    }
                })
            } else {
                // 如果文件系统API不可用，使用Canvas方法
                this.convertImageToBase64Canvas(imagePath)
                    .then(resolve)
                    .catch(reject)
            }
            // #endif

            // #ifndef H5 || MP-WEIXIN || APP-PLUS
            // 其他环境：尝试使用Canvas方法
            this.convertImageToBase64Canvas(imagePath)
                .then(resolve)
                .catch(reject)
            // #endif
        })
    },

    // H5环境下使用Canvas转换图片为base64
    convertImageToBase64Canvas(imagePath) {
        return new Promise((resolve, reject) => {
            // 如果是data URL，直接提取base64数据
            if (imagePath.startsWith('data:')) {
                try {
                    const base64Data = imagePath.split(',')[1]
                    if (base64Data) {
                        resolve(base64Data)
                        return
                    }
                } catch (error) {
                    console.warn('提取data URL中的base64失败:', error)
                }
            }

            const img = new Image()
            img.crossOrigin = 'anonymous'

            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas')
                    const ctx = canvas.getContext('2d')

                    canvas.width = img.width
                    canvas.height = img.height

                    ctx.drawImage(img, 0, 0)

                    // 获取base64数据（去掉data:image/xxx;base64,前缀）
                    const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1]
                    resolve(base64)
                } catch (error) {
                    reject(new Error('Canvas转换失败: ' + error.message))
                }
            }

            img.onerror = (error) => {
                console.error('图片加载失败:', error)
                reject(new Error('图片加载失败'))
            }

            // 处理不同类型的图片路径
            try {
                if (imagePath.startsWith('blob:') || imagePath.startsWith('data:') || imagePath.startsWith('http')) {
                    img.src = imagePath
                } else {
                    // 对于本地文件路径，可能需要特殊处理
                    img.src = imagePath
                }
            } catch (error) {
                reject(new Error('设置图片源失败: ' + error.message))
            }
        })
    },

    // 获取图片信息
    getImage(imageId) {
        const allImages = this.getAll()
        return allImages[imageId] || null
    },

    // 获取图片的展示URL
    getImageUrl(imageId) {
        const imageInfo = this.getImage(imageId)
        if (!imageInfo) return null

        // 优先返回base64 URL用于展示
        if (imageInfo.base64) {
            return `data:${imageInfo.mimeType};base64,${imageInfo.base64}`
        }

        // 备用：返回本地路径
        return imageInfo.compressedPath || imageInfo.originalPath
    },

    // 删除图片
    deleteImage(imageId) {
        try {
            const allImages = this.getAll()
            if (allImages[imageId]) {
                delete allImages[imageId]
                uni.setStorageSync(this.STORAGE_KEY, allImages)
                console.log('删除图片成功:', imageId)
                return true
            }
            return false
        } catch (error) {
            console.error('删除图片失败:', error)
            return false
        }
    },

    // 清理所有图片
    clearAll() {
        try {
            uni.setStorageSync(this.STORAGE_KEY, {})
            console.log('清理所有本地图片')
            return true
        } catch (error) {
            console.error('清理图片存储失败:', error)
            return false
        }
    },

    // 获取存储统计信息
    getStorageStats() {
        const allImages = this.getAll()
        const imageCount = Object.keys(allImages).length
        let totalSize = 0

        Object.values(allImages).forEach(img => {
            totalSize += img.size || 0
        })

        return {
            count: imageCount,
            totalSize: totalSize,
            formattedSize: this.formatFileSize(totalSize)
        }
    },

    // 格式化文件大小
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes'

        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },

    // 获取MIME类型
    getMimeType(filePath) {
        const extension = filePath.split('.').pop().toLowerCase()
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

    // 检查存储空间
    checkStorageSpace() {
        return new Promise((resolve) => {
            try {
                uni.getStorageInfo({
                    success: (res) => {
                        const usage = res.currentSize / res.limitSize
                        resolve({
                            currentSize: res.currentSize,
                            limitSize: res.limitSize,
                            usage: usage,
                            available: res.limitSize - res.currentSize,
                            isLow: usage > 0.8
                        })
                    },
                    fail: (error) => {
                        console.warn('获取存储信息失败:', error)
                        resolve(null)
                    }
                })
            } catch (error) {
                console.warn('getStorageInfo API不可用:', error)
                resolve(null)
            }
        })
    },

    // 批量清理过期图片（可选功能）
    cleanupExpiredImages(daysToKeep = 30) {
        try {
            const allImages = this.getAll()
            const cutoffDate = new Date()
            cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

            let cleanedCount = 0
            let cleanedSize = 0

            Object.keys(allImages).forEach(imageId => {
                const imageInfo = allImages[imageId]
                if (imageInfo.createdAt) {
                    const imageDate = new Date(imageInfo.createdAt)
                    if (imageDate < cutoffDate) {
                        cleanedSize += imageInfo.size || 0
                        delete allImages[imageId]
                        cleanedCount++
                    }
                }
            })

            if (cleanedCount > 0) {
                uni.setStorageSync(this.STORAGE_KEY, allImages)
                console.log(`清理过期图片完成，清理了 ${cleanedCount} 张图片，释放空间: ${this.formatFileSize(cleanedSize)}`)
            }

            return {
                count: cleanedCount,
                size: cleanedSize
            }
        } catch (error) {
            console.error('清理过期图片失败:', error)
            return {
                count: 0,
                size: 0
            }
        }
    },

    // 清理最大的图片（存储空间不足时）
    cleanupLargestImages(count = 5) {
        try {
            const allImages = this.getAll()
            const imageList = Object.values(allImages)

            // 按大小排序，删除最大的几张
            imageList.sort((a, b) => (b.size || 0) - (a.size || 0))

            let cleanedCount = 0
            let cleanedSize = 0

            for (let i = 0; i < Math.min(count, imageList.length); i++) {
                const imageInfo = imageList[i]
                cleanedSize += imageInfo.size || 0
                delete allImages[imageInfo.id]
                cleanedCount++
            }

            if (cleanedCount > 0) {
                uni.setStorageSync(this.STORAGE_KEY, allImages)
                console.log(`清理大文件完成，清理了 ${cleanedCount} 张图片，释放空间: ${this.formatFileSize(cleanedSize)}`)
            }

            return {
                count: cleanedCount,
                size: cleanedSize
            }
        } catch (error) {
            console.error('清理大文件失败:', error)
            return {
                count: 0,
                size: 0
            }
        }
    }
}

// 默认导出
export default imageStorage
