// 本地图片处理API（保存到本地存储）
import { imageStorage } from '@/utils/imageStorage.js'

// 处理衣物图片
export const uploadClothesImage = async (imagePath) => {
    try {
        console.log('开始处理衣物图片（本地存储模式）:', imagePath)

        // 保存图片到本地存储
        const saveResult = await imageStorage.saveImage(imagePath, {
            compress: true,
            quality: 0.8,
            maxWidth: 1200,
            maxHeight: 1200,
            metadata: {
                type: 'clothes',
                category: 'wardrobe'
            }
        })

        if (saveResult.success) {
            const result = {
                code: 200,
                message: '图片保存成功',
                data: {
                    imageUrl: saveResult.base64Url, // 使用base64 URL
                    imageId: saveResult.imageId,
                    originalPath: imagePath,
                    localPath: saveResult.localPath,
                    size: saveResult.imageInfo.size
                }
            }

            console.log('衣物图片处理完成:', {
                imageId: result.data.imageId,
                size: imageStorage.formatFileSize(result.data.size)
            })
            return result
        } else {
            throw new Error(saveResult.error || '图片保存失败')
        }

    } catch (error) {
        console.error('处理衣物图片时发生错误:', error)
        throw new Error('图片处理失败: ' + error.message)
    }
}

// 处理穿搭图片
export const uploadOutfitImage = async (imagePath) => {
    try {
        console.log('开始处理穿搭图片（本地存储模式）:', imagePath)

        // 保存图片到本地存储
        const saveResult = await imageStorage.saveImage(imagePath, {
            compress: true,
            quality: 0.8,
            maxWidth: 1200,
            maxHeight: 1200,
            metadata: {
                type: 'outfit',
                category: 'outfits'
            }
        })

        if (saveResult.success) {
            const result = {
                code: 200,
                message: '图片保存成功',
                data: {
                    imageUrl: saveResult.base64Url, // 使用base64 URL
                    imageId: saveResult.imageId,
                    originalPath: imagePath,
                    localPath: saveResult.localPath,
                    size: saveResult.imageInfo.size
                }
            }

            console.log('穿搭图片处理完成:', {
                imageId: result.data.imageId,
                size: imageStorage.formatFileSize(result.data.size)
            })
            return result
        } else {
            throw new Error(saveResult.error || '图片保存失败')
        }

    } catch (error) {
        console.error('处理穿搭图片时发生错误:', error)
        throw new Error('图片处理失败: ' + error.message)
    }
}

// 导出默认对象
export default {
    uploadClothesImage,
    uploadOutfitImage
}
