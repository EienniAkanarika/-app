// 相机修复功能测试

import uniCameraFix from './uniCameraFix.js'
import appImageHandler from './appImageHandler.js'

// 相机修复测试工具
export const cameraFixTest = {

    // 运行完整测试
    async runFullTest() {
        console.log('🧪 开始相机修复功能测试')

        const results = {
            timestamp: new Date().toISOString(),
            platform: uni.getSystemInfoSync()?.platform || 'unknown',
            tests: [],
            summary: {
                total: 0,
                passed: 0,
                failed: 0
            }
        }

        try {
            // 测试1: 基础相机功能
            const test1 = await this.testBasicCameraFunction()
            results.tests.push(test1)

            // 测试2: APP图片处理
            const test2 = await this.testAppImageHandler()
            results.tests.push(test2)

            // 测试3: 存储功能
            const test3 = await this.testStorageFunction()
            results.tests.push(test3)

            // 统计结果
            results.tests.forEach(test => {
                results.summary.total++
                if (test.status === 'passed') {
                    results.summary.passed++
                } else {
                    results.summary.failed++
                }
            })

            console.log('🎯 测试完成:', results.summary)
            return results

        } catch (error) {
            console.error('❌ 测试异常:', error)
            results.tests.push({
                name: '测试执行',
                status: 'failed',
                error: error.message
            })
            return results
        }
    },

    // 测试基础相机功能
    async testBasicCameraFunction() {
        const test = {
            name: '基础相机功能测试',
            status: 'unknown',
            details: {},
            timestamp: new Date().toISOString()
        }

        try {
            console.log('🔍 测试基础相机功能...')

            const basicCheck = await uniCameraFix.checkBasicFunction()
            test.details = basicCheck

            if (basicCheck.hasChooseImageAPI && basicCheck.canCallAPI) {
                test.status = 'passed'
                test.message = '基础相机功能正常'
            } else {
                test.status = 'failed'
                test.message = '基础相机功能异常'
                test.error = basicCheck.error
            }

        } catch (error) {
            test.status = 'failed'
            test.error = error.message
            test.message = '基础相机功能测试失败'
        }

        return test
    },

    // 测试APP图片处理
    async testAppImageHandler() {
        const test = {
            name: 'APP图片处理测试',
            status: 'unknown',
            details: {},
            timestamp: new Date().toISOString()
        }

        try {
            console.log('📱 测试APP图片处理...')

            // 模拟保存一个测试图片
            const testImagePath = '/test/path/image.jpg'
            const saveResult = await appImageHandler.saveImageForApp(testImagePath, {
                metadata: {
                    source: 'test',
                    type: 'test_image'
                }
            })

            test.details.saveResult = saveResult

            if (saveResult.success) {
                // 测试读取
                const imageInfo = appImageHandler.getImage(saveResult.imageId)
                const imageUrl = appImageHandler.getImageUrl(saveResult.imageId)

                test.details.imageInfo = imageInfo
                test.details.imageUrl = imageUrl

                // 测试删除
                const deleted = appImageHandler.deleteImage(saveResult.imageId)
                test.details.deleted = deleted

                test.status = 'passed'
                test.message = 'APP图片处理功能正常'
            } else {
                test.status = 'failed'
                test.message = 'APP图片处理失败'
                test.error = saveResult.error
            }

        } catch (error) {
            test.status = 'failed'
            test.error = error.message
            test.message = 'APP图片处理测试异常'
        }

        return test
    },

    // 测试存储功能
    async testStorageFunction() {
        const test = {
            name: '存储功能测试',
            status: 'unknown',
            details: {},
            timestamp: new Date().toISOString()
        }

        try {
            console.log('💾 测试存储功能...')

            // 获取存储统计
            const stats = appImageHandler.getStorageStats()
            test.details.stats = stats

            // 测试基础存储操作
            const testKey = 'test_storage'
            const testData = { test: true, timestamp: Date.now() }

            // 写入测试
            uni.setStorageSync(testKey, testData)

            // 读取测试
            const readData = uni.getStorageSync(testKey)
            test.details.readSuccess = JSON.stringify(readData) === JSON.stringify(testData)

            // 清理测试数据
            uni.removeStorageSync(testKey)

            test.status = 'passed'
            test.message = '存储功能正常'

        } catch (error) {
            test.status = 'failed'
            test.error = error.message
            test.message = '存储功能测试失败'
        }

        return test
    },

    // 显示测试结果
    showTestResults(results) {
        const { summary } = results
        const title = '相机修复测试结果'

        let content = `测试总数: ${summary.total}\n`
        content += `✅ 通过: ${summary.passed}\n`
        content += `❌ 失败: ${summary.failed}\n\n`

        if (summary.failed === 0) {
            content += '🎉 所有测试通过！相机功能修复成功！'
        } else {
            content += '⚠️ 部分测试失败，请查看控制台获取详细信息。'
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
    },

    // 快速验证修复效果
    async quickValidation() {
        console.log('⚡ 快速验证相机修复效果')

        try {
            // 检查基础功能
            const basicCheck = await uniCameraFix.checkBasicFunction()
            console.log('基础功能检查:', basicCheck)

            if (!basicCheck.hasChooseImageAPI) {
                throw new Error('uni.chooseImage API不可用')
            }

            // 检查APP处理器
            const stats = appImageHandler.getStorageStats()
            console.log('APP处理器状态:', stats)

            console.log('✅ 快速验证通过！')
            return {
                success: true,
                message: '相机功能修复成功',
                details: {
                    basicCheck,
                    stats
                }
            }

        } catch (error) {
            console.error('❌ 快速验证失败:', error)
            return {
                success: false,
                message: '相机功能存在问题',
                error: error.message
            }
        }
    }
}

// 导出默认对象
export default cameraFixTest
