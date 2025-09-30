// 图片处理功能测试脚本

import { compressImage, getDefaultImage } from './imageUtils.js'
import { getImageProcessingCapabilities } from './platformUtils.js'
import { imageStorage } from './imageStorage.js'

// 测试平台能力检测
export const testPlatformCapabilities = () => {
    console.log('=== 平台能力检测测试 ===')

    try {
        const capabilities = getImageProcessingCapabilities()
        console.log('平台:', capabilities.platform)
        console.log('支持压缩:', capabilities.canCompress)
        console.log('支持文件读取:', capabilities.canReadFile)
        console.log('支持Canvas:', capabilities.canUseCanvas)
        console.log('推荐方法:', capabilities.preferredMethod)

        return capabilities
    } catch (error) {
        console.error('平台能力检测失败:', error)
        return null
    }
}

// 测试图片压缩功能
export const testImageCompression = async (testImagePath) => {
    console.log('=== 图片压缩功能测试 ===')

    try {
        // 如果没有提供测试图片，使用默认图片
        const imagePath = testImagePath || getDefaultImage('shirt')
        console.log('测试图片路径:', imagePath)

        const startTime = Date.now()
        const compressedPath = await compressImage(imagePath, {
            quality: 0.8,
            maxWidth: 800,
            maxHeight: 800
        })
        const endTime = Date.now()

        console.log('压缩完成!')
        console.log('原路径:', imagePath)
        console.log('压缩后路径:', compressedPath)
        console.log('耗时:', endTime - startTime, 'ms')

        return compressedPath
    } catch (error) {
        console.error('图片压缩测试失败:', error)
        return null
    }
}

// 测试图片存储功能
export const testImageStorage = async (testImagePath) => {
    console.log('=== 图片存储功能测试 ===')

    try {
        // 初始化存储
        imageStorage.init()

        // 如果没有提供测试图片，使用默认图片
        const imagePath = testImagePath || getDefaultImage('pants')
        console.log('测试图片路径:', imagePath)

        const startTime = Date.now()
        const result = await imageStorage.saveImage(imagePath, {
            compress: true,
            quality: 0.7,
            metadata: {
                category: 'test',
                source: 'test-function'
            }
        })
        const endTime = Date.now()

        console.log('存储完成!')
        console.log('存储结果:', result)
        console.log('耗时:', endTime - startTime, 'ms')

        if (result.success) {
            // 测试读取
            const imageInfo = imageStorage.getImage(result.imageId)
            console.log('读取的图片信息:', imageInfo)

            const imageUrl = imageStorage.getImageUrl(result.imageId)
            console.log('图片展示URL:', imageUrl)
        }

        return result
    } catch (error) {
        console.error('图片存储测试失败:', error)
        return null
    }
}

// 测试错误处理
export const testErrorHandling = async () => {
    console.log('=== 错误处理测试 ===')

    try {
        // 测试无效图片路径
        console.log('测试无效图片路径...')
        const result1 = await compressImage('invalid-path.jpg')
        console.log('无效路径处理结果:', result1)

        // 测试空路径
        console.log('测试空路径...')
        const result2 = await compressImage('')
        console.log('空路径处理结果:', result2)

        // 测试null路径
        console.log('测试null路径...')
        const result3 = await compressImage(null)
        console.log('null路径处理结果:', result3)

        return {
            invalidPath: result1,
            emptyPath: result2,
            nullPath: result3
        }
    } catch (error) {
        console.error('错误处理测试失败:', error)
        return null
    }
}

// 综合测试
export const runAllTests = async (testImagePath) => {
    console.log('🧪 开始运行图片处理功能全面测试...\n')

    const results = {}

    // 测试1: 平台能力
    results.capabilities = testPlatformCapabilities()
    console.log('\n')

    // 测试2: 图片压缩
    results.compression = await testImageCompression(testImagePath)
    console.log('\n')

    // 测试3: 图片存储
    results.storage = await testImageStorage(testImagePath)
    console.log('\n')

    // 测试4: 错误处理
    results.errorHandling = await testErrorHandling()
    console.log('\n')

    // 输出总结
    console.log('📊 测试结果总结:')
    console.log('平台能力检测:', results.capabilities ? '✅' : '❌')
    console.log('图片压缩:', results.compression ? '✅' : '❌')
    console.log('图片存储:', results.storage?.success ? '✅' : '❌')
    console.log('错误处理:', results.errorHandling ? '✅' : '❌')

    return results
}

// 默认导出
export default {
    testPlatformCapabilities,
    testImageCompression,
    testImageStorage,
    testErrorHandling,
    runAllTests
}
