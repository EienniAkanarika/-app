// 图片处理工具函数

// 导入上传API
import { uploadClothesImage, uploadOutfitImage } from '@/api/upload.js'
// 导入平台检测工具
import { getImageProcessingCapabilities, safeUniCall } from './platformUtils.js'

// 获取默认图片
export const getDefaultImage = (category = 'default') => {
    const svgMap = {
        'shirt': 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23f0f0f0" rx="8"/%3E%3Cg transform="translate(25,15)"%3E%3Cpath d="M 20 25 L 20 70 L 30 70 L 30 25 L 25 20 L 20 20 L 20 15 L 15 15 L 15 20 L 10 20 Z" fill="%23ccc"/%3E%3Cpath d="M 5 25 L 10 25 L 10 35 L 5 40 L 0 35 L 5 25" fill="%23ccc"/%3E%3Cpath d="M 30 25 L 35 25 L 40 35 L 35 40 L 30 35 L 30 25" fill="%23ccc"/%3E%3C/g%3E%3C/svg%3E',
        'pants': 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23f0f0f0" rx="8"/%3E%3Cg transform="translate(30,15)"%3E%3Crect x="5" y="5" width="30" height="6" fill="%23999" rx="2"/%3E%3Cpath d="M 10 11 L 10 75 L 15 75 L 17 11 Z" fill="%23ccc"/%3E%3Cpath d="M 23 11 L 25 75 L 30 75 L 30 11 Z" fill="%23ccc"/%3E%3C/g%3E%3C/svg%3E',
        'shoes': 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23f0f0f0" rx="8"/%3E%3Cg transform="translate(15,40)"%3E%3Cellipse cx="35" cy="25" rx="30" ry="6" fill="%23999"/%3E%3Cpath d="M 10 15 Q 10 10 20 10 L 50 10 Q 60 10 65 15 L 65 20 Q 60 25 50 25 L 20 25 Q 10 25 10 15" fill="%23ccc"/%3E%3C/g%3E%3C/svg%3E',
        'hat': 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23f0f0f0" rx="8"/%3E%3Cg transform="translate(20,25)"%3E%3Cellipse cx="30" cy="35" rx="40" ry="6" fill="%23999" opacity="0.8"/%3E%3Cpath d="M 10 25 Q 10 15 30 15 Q 50 15 50 25 L 50 35 Q 50 40 30 40 Q 10 40 10 35 Z" fill="%23ccc"/%3E%3Cellipse cx="30" cy="32" rx="35" ry="4" fill="%23999"/%3E%3C/g%3E%3C/svg%3E',
        'coat': 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23f0f0f0" rx="8"/%3E%3Cg transform="translate(20,10)"%3E%3Cpath d="M 20 15 L 20 75 L 40 75 L 40 15 L 35 10 L 30 10 L 30 5 L 25 5 L 25 10 L 20 10 Z" fill="%23ccc"/%3E%3Cpath d="M 10 15 L 20 15 L 20 35 L 15 45 L 5 40 L 10 15" fill="%23ccc"/%3E%3Cpath d="M 40 15 L 50 15 L 55 40 L 45 45 L 40 35 L 40 15" fill="%23ccc"/%3E%3Cpath d="M 30 15 L 30 75" stroke="%23999" stroke-width="1.5"/%3E%3C/g%3E%3C/svg%3E',
        'skirt': 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23f0f0f0" rx="8"/%3E%3Cg transform="translate(30,30)"%3E%3Crect x="10" y="5" width="20" height="4" fill="%23999" rx="2"/%3E%3Cpath d="M 10 9 L 10 25 Q 10 35 20 40 Q 30 35 30 25 L 30 9 Z" fill="%23ccc"/%3E%3C/g%3E%3C/svg%3E',
        'suit': 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23f0f0f0" rx="8"/%3E%3Cg transform="translate(20,8)"%3E%3Cpath d="M 20 15 L 20 75 L 40 75 L 40 15 L 35 10 L 30 10 L 30 5 L 25 5 L 25 10 L 20 10 Z" fill="%23555"/%3E%3Cpath d="M 10 15 L 20 15 L 20 35 L 15 45 L 5 40 L 10 15" fill="%23555"/%3E%3Cpath d="M 40 15 L 50 15 L 55 40 L 45 45 L 40 35 L 40 15" fill="%23555"/%3E%3Cpath d="M 27 10 L 27 40 L 30 45 L 33 40 L 33 10" fill="%23c33"/%3E%3C/g%3E%3C/svg%3E',
        'default': 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23f0f0f0" rx="8"/%3E%3Cg transform="translate(25,25)"%3E%3Cpath d="M40,30 L25,15 L15,30 L15,45 L40,45 Z" stroke="%23ddd" stroke-width="2" fill="%23eee" /%3E%3Ccircle cx="25" cy="15" r="8" fill="%23eee" stroke="%23ddd" stroke-width="2" /%3E%3C/g%3E%3C/svg%3E'
    }
    return svgMap[category] || svgMap['default']
}

// 压缩图片（跨平台兼容）
export const compressImage = async (filePath, options = {}) => {
    const {
        quality = 0.8,
        maxWidth = 1200,
        maxHeight = 1200,
        format = 'jpg'
    } = options

    try {
        // 获取平台能力
        const capabilities = getImageProcessingCapabilities()
        console.log('平台图片处理能力:', capabilities)

        // 优先使用uni.compressImage（如果支持）
        if (capabilities.canCompress) {
            try {
                const result = await safeUniCall('compressImage', {
                    src: filePath,
                    quality,
                    width: maxWidth,
                    height: maxHeight,
                    format
                })
                console.log('使用uni.compressImage压缩成功:', result.tempFilePath)
                return result.tempFilePath
            } catch (error) {
                console.warn('uni.compressImage压缩失败，尝试其他方法:', error.message)
            }
        }

        // 备选方案：使用Canvas压缩（主要用于H5）
        if (capabilities.canUseCanvas) {
            try {
                const compressedPath = await compressImageInH5(filePath, options)
                console.log('使用Canvas压缩成功:', compressedPath)
                return compressedPath
            } catch (error) {
                console.warn('Canvas压缩失败:', error.message)
            }
        }

        // 最后的备选方案：返回原图片路径
        console.log('无法压缩图片，使用原图片:', filePath)
        return filePath

    } catch (error) {
        console.error('压缩图片时发生错误:', error)
        // 如果所有方法都失败，返回原图片路径
        return filePath
    }
}

// H5环境下的图片压缩实现
const compressImageInH5 = (filePath, options = {}) => {
    return new Promise((resolve, reject) => {
        // 检查浏览器环境
        if (typeof document === 'undefined') {
            reject(new Error('当前环境不支持Canvas'))
            return
        }

        const {
            quality = 0.8,
            maxWidth = 1200,
            maxHeight = 1200
        } = options

        // 如果已经是压缩过的blob URL，直接返回
        if (filePath.startsWith('blob:') && filePath.includes('compressed')) {
            resolve(filePath)
            return
        }

        let img
        try {
            // #ifdef H5
            img = new Image()
            img.crossOrigin = 'anonymous'
            // #endif

            // #ifndef H5
            // 非H5环境下，使用创建图片元素的方式
            if (typeof Image !== 'undefined') {
                img = new Image()
                img.crossOrigin = 'anonymous'
            } else {
                // 如果Image构造函数不可用，尝试其他方式
                reject(new Error('当前环境不支持Image对象'))
                return
            }
            // #endif
        } catch (error) {
            console.error('创建Image对象失败:', error)
            reject(new Error('无法创建图片对象: ' + error.message))
            return
        }

        // 设置超时
        const timeout = setTimeout(() => {
            reject(new Error('图片加载超时'))
        }, 10000) // 10秒超时

        img.onload = () => {
            clearTimeout(timeout)
            try {
                // 检查图片尺寸
                if (img.width === 0 || img.height === 0) {
                    reject(new Error('图片尺寸无效'))
                    return
                }

                const canvas = document.createElement('canvas')
                const ctx = canvas.getContext('2d')

                if (!ctx) {
                    reject(new Error('无法获取Canvas上下文'))
                    return
                }

                // 计算压缩后的尺寸
                let { width, height } = img

                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height)
                    width = Math.floor(width * ratio)
                    height = Math.floor(height * ratio)
                }

                // 限制最小尺寸
                width = Math.max(width, 100)
                height = Math.max(height, 100)

                canvas.width = width
                canvas.height = height

                // 绘制压缩后的图片
                ctx.fillStyle = '#FFFFFF' // 设置白色背景
                ctx.fillRect(0, 0, width, height)
                ctx.drawImage(img, 0, 0, width, height)

                // 转换为Blob URL
                canvas.toBlob((blob) => {
                    if (blob) {
                        const compressedUrl = URL.createObjectURL(blob)
                        console.log('H5图片压缩完成:', compressedUrl, `原尺寸: ${img.width}x${img.height}, 压缩后: ${width}x${height}`)
                        resolve(compressedUrl)
                    } else {
                        reject(new Error('Canvas toBlob失败'))
                    }
                }, 'image/jpeg', quality)

            } catch (error) {
                clearTimeout(timeout)
                reject(new Error('Canvas处理失败: ' + error.message))
            }
        }

        img.onerror = (error) => {
            clearTimeout(timeout)
            console.error('图片加载失败:', error)
            reject(new Error('图片加载失败'))
        }

        // 处理不同类型的图片路径
        try {
            if (filePath.startsWith('blob:') || filePath.startsWith('data:') || filePath.startsWith('http')) {
                img.src = filePath
            } else {
                // 对于本地文件路径，尝试作为相对路径处理
                img.src = filePath
            }
        } catch (error) {
            clearTimeout(timeout)
            reject(new Error('设置图片源失败: ' + error.message))
        }
    })
}

// 上传图片（这个函数可能在一些地方被调用，但主要逻辑在api/upload.js中）
export const uploadImage = async (filePath, type = 'clothes') => {
    if (type === 'outfit') {
        return uploadOutfitImage(filePath)
    } else {
        return uploadClothesImage(filePath)
    }
}

// 获取完整图片URL
export const getFullImageUrl = (imageUrl) => {
    if (!imageUrl) return null

    // 如果是data URL，直接返回
    if (imageUrl.startsWith('data:')) {
        return imageUrl
    }

    // 如果是完整URL，直接返回
    if (imageUrl.startsWith('http')) {
        return imageUrl
    }

    // 如果是相对路径，转换为完整URL
    const BASE_URL = 'https://tztoyseauzso.sealosbja.site'
    if (imageUrl.startsWith('/')) {
        return BASE_URL + imageUrl
    }

    return BASE_URL + '/' + imageUrl
}

// 代理图片URL（用于解决跨域问题）
export const proxyImageUrl = (imageUrl) => {
    if (!imageUrl) return null

    // 如果是data URL，直接返回
    if (imageUrl.startsWith('data:')) {
        return imageUrl
    }

    // 如果是本地路径，直接返回
    if (imageUrl.startsWith('/static/')) {
        return imageUrl
    }

    // 确保是完整URL
    const fullUrl = getFullImageUrl(imageUrl)

    // 在某些环境下可能需要代理，这里直接返回完整URL
    return fullUrl
}

// 生成预览URL
export const generatePreviewUrl = (imageUrl) => {
    if (!imageUrl) return null

    // 如果是data URL，直接返回
    if (imageUrl.startsWith('data:')) {
        return imageUrl
    }

    // 使用代理URL进行预览
    return proxyImageUrl(imageUrl)
}

// 检查图片是否可用
export const checkImageAvailable = (imageUrl) => {
    return new Promise((resolve) => {
        if (!imageUrl) {
            resolve(false)
            return
        }

        // 对于data URL，认为是可用的
        if (imageUrl.startsWith('data:')) {
            resolve(true)
            return
        }

        // 对于其他URL，可以进行简单检查
        if (imageUrl.startsWith('http') || imageUrl.startsWith('/')) {
            resolve(true)
        } else {
            resolve(false)
        }
    })
}

// 默认导出
export default {
    compressImage,
    uploadImage,
    getFullImageUrl,
    proxyImageUrl,
    generatePreviewUrl,
    checkImageAvailable,
    getDefaultImage
}
