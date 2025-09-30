// 图片处理兼容性工具

import appImageHandler from './appImageHandler.js'
import { imageStorage } from './imageStorage.js'
import { compressImage } from './imageUtils.js'

// 图片兼容性处理器
export const imageCompatibility = {

    // 统一的图片URL处理
    processImageUrl(imageUrl, defaultImage = null) {
        console.log('🔄 统一处理图片URL:', imageUrl);

        // 空值检查
        if (!imageUrl) {
            console.log('⚠️ 图片URL为空，返回默认图片');
            return defaultImage;
        }

        // 修复Base64 URL开头的斜杠问题
        if (imageUrl.startsWith('/data:image/')) {
            console.log('🔧 修复Base64图片URL开头的斜杠');
            return imageUrl.substring(1); // 移除开头的斜杠
        }

        // 如果是Base64图片，直接返回
        if (imageUrl.startsWith('data:image/')) {
            console.log('✅ 识别为Base64图片，直接返回');
            return imageUrl;
        }

        // 如果是数据URL，直接返回
        if (imageUrl.startsWith('data:')) {
            console.log('✅ 识别为数据URL，直接返回');
            return imageUrl;
        }

        // #ifdef APP-PLUS
        // APP环境：处理本地文件路径
        if (imageUrl.startsWith('file://') ||
            imageUrl.startsWith('/storage/') ||
            imageUrl.startsWith('/data/') ||
            imageUrl.startsWith('/android_asset/') ||
            imageUrl.includes('_doc/') ||
            imageUrl.includes('_downloads/') ||
            imageUrl.includes('temp/') ||
            imageUrl.includes('cache/')) {
            console.log('📱 APP环境路径，直接返回:', imageUrl);
            return imageUrl;
        }
        // #endif

        // 检查是否是SVG颜色图片（getDefaultClothesImage生成的）
        if (imageUrl.startsWith('<svg')) {
            console.log('🎨 识别为SVG内容，转换为Data URL');
            return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(imageUrl)}`;
        }

        // 检查是否是默认图片路径
        if (imageUrl.includes('/static/') || imageUrl.startsWith('/static/')) {
            console.log('📁 识别为静态资源路径');
            return imageUrl;
        }

        console.log('⚠️ 无法识别的图片格式，返回原URL或默认图片:', imageUrl);
        return imageUrl || defaultImage;
    },

    // 统一的图片保存
    async saveImage(imagePath, options = {}) {
        console.log('💾 统一保存图片:', imagePath);

        try {
            let saveResult;

            // #ifdef APP-PLUS
            console.log('📱 使用APP专用保存方式');
            saveResult = await appImageHandler.saveImageForApp(imagePath, options);
            // #endif

            // #ifndef APP-PLUS
            console.log('🌐 使用通用保存方式');

            // 先压缩图片（如果需要）
            let processedPath = imagePath;
            if (options.compress !== false) {
                try {
                    processedPath = await compressImage(imagePath, {
                        quality: options.quality || 0.8,
                        maxWidth: options.maxWidth || 1200,
                        maxHeight: options.maxHeight || 1200
                    });
                } catch (compressError) {
                    console.warn('⚠️ 图片压缩失败，使用原图:', compressError);
                    processedPath = imagePath;
                }
            }

            saveResult = await imageStorage.saveImage(processedPath, {
                ...options,
                compress: false // 已经处理过压缩
            });
            // #endif

            if (saveResult.success) {
                console.log('✅ 图片保存成功');
                return {
                    success: true,
                    imageId: saveResult.imageId,
                    // #ifdef APP-PLUS
                    displayUrl: saveResult.displayUrl || saveResult.localPath,
                    // #endif
                    // #ifndef APP-PLUS
                    displayUrl: saveResult.base64Url,
                    // #endif
                    localPath: saveResult.localPath,
                    imageInfo: saveResult.imageInfo
                };
            } else {
                console.error('❌ 图片保存失败:', saveResult.error);
                return {
                    success: false,
                    error: saveResult.error || '图片保存失败'
                };
            }

        } catch (error) {
            console.error('❌ 图片保存异常:', error);
            return {
                success: false,
                error: error.message || '图片保存异常'
            };
        }
    },

    // 获取图片显示URL
    getImageDisplayUrl(imageId) {
        try {
            // #ifdef APP-PLUS
            return appImageHandler.getImageUrl(imageId);
            // #endif

            // #ifndef APP-PLUS
            // 对于非APP环境，图片通常已经是Base64格式直接存储
            const allImages = uni.getStorageSync('images') || {};
            const imageInfo = allImages[imageId];
            return imageInfo ? imageInfo.base64Url : null;
            // #endif
        } catch (error) {
            console.error('获取图片显示URL失败:', error);
            return null;
        }
    },

    // 检查图片是否有效
    async validateImage(imageUrl) {
        if (!imageUrl) return false;

        // Base64和数据URL总是有效的
        if (imageUrl.startsWith('data:')) {
            return true;
        }

        // #ifdef APP-PLUS
        // APP环境下检查文件是否存在
        try {
            if (typeof plus !== 'undefined' && plus.io) {
                return new Promise((resolve) => {
                    plus.io.resolveLocalFileSystemURL(imageUrl,
                        () => resolve(true),
                        () => resolve(false)
                    );
                });
            }
        } catch (error) {
            console.warn('APP环境文件检查失败:', error);
        }
        // #endif

        // 其他情况假设有效
        return true;
    },

    // 获取图片错误处理建议
    getImageErrorSuggestion(error) {
        const errorMessage = error?.message || error || '';

        if (errorMessage.includes('压缩')) {
            return {
                title: '图片压缩失败',
                suggestion: '请尝试选择较小的图片文件'
            };
        }

        if (errorMessage.includes('存储') || errorMessage.includes('storage')) {
            return {
                title: '存储失败',
                suggestion: '请检查存储空间是否充足'
            };
        }

        if (errorMessage.includes('权限') || errorMessage.includes('permission')) {
            return {
                title: '权限不足',
                suggestion: '请检查应用的存储权限设置'
            };
        }

        if (errorMessage.includes('网络') || errorMessage.includes('network')) {
            return {
                title: '网络错误',
                suggestion: '请检查网络连接状态'
            };
        }

        return {
            title: '图片处理失败',
            suggestion: '请重试或选择其他图片'
        };
    }
}

// 导出默认对象
export default imageCompatibility
