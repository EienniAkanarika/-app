// 相机功能测试工具

import cameraUtils from './cameraUtils.js'
import permissionUtils from './permissionUtils.js'
import { imageStorage } from './imageStorage.js'

// 相机功能测试套件
export const cameraTest = {

    // 运行完整的相机功能测试
    async runFullTest() {
        console.log('🧪 开始相机功能完整测试')

        const results = {
            timestamp: new Date().toISOString(),
            tests: [],
            summary: {
                total: 0,
                passed: 0,
                failed: 0,
                warnings: 0
            }
        }

        try {
            // 测试1: 相机可用性检测
            const test1 = await this.testCameraAvailability()
            results.tests.push(test1)

            // 测试2: 权限管理
            const test2 = await this.testPermissionManagement()
            results.tests.push(test2)

            // 测试3: 图片选择流程
            const test3 = await this.testImageSelectionFlow()
            results.tests.push(test3)

            // 测试4: 存储功能
            const test4 = await this.testImageStorage()
            results.tests.push(test4)

            // 统计结果
            results.tests.forEach(test => {
                results.summary.total++
                if (test.status === 'passed') {
                    results.summary.passed++
                } else if (test.status === 'failed') {
                    results.summary.failed++
                } else if (test.status === 'warning') {
                    results.summary.warnings++
                }
            })

            console.log('🎯 相机功能测试完成:', results.summary)
            return results

        } catch (error) {
            console.error('❌ 相机功能测试异常:', error)
            results.tests.push({
                name: '测试套件执行',
                status: 'failed',
                error: error.message,
                timestamp: new Date().toISOString()
            })
            return results
        }
    },

    // 测试相机可用性检测
    async testCameraAvailability() {
        const test = {
            name: '相机可用性检测',
            status: 'unknown',
            details: {},
            timestamp: new Date().toISOString()
        }

        try {
            console.log('🔍 测试相机可用性检测...')

            const availability = await cameraUtils.checkCameraAvailability()
            test.details = availability

            if (availability.canUseCamera || availability.canUseAlbum) {
                test.status = 'passed'
                test.message = '相机功能或相册功能可用'
            } else {
                test.status = 'failed'
                test.message = '相机和相册功能都不可用'
                test.error = availability.issues.join('; ')
            }

            // 检查推荐模式
            if (availability.recommendedMode === 'album_only') {
                test.status = 'warning'
                test.message = '只能使用相册模式'
            }

        } catch (error) {
            test.status = 'failed'
            test.error = error.message
            test.message = '相机可用性检测失败'
        }

        return test
    },

    // 测试权限管理
    async testPermissionManagement() {
        const test = {
            name: '权限管理测试',
            status: 'unknown',
            details: {},
            timestamp: new Date().toISOString()
        }

        try {
            console.log('🔐 测试权限管理...')

            // 测试相机权限
            const cameraPermission = await permissionUtils.requestCameraPermission()
            test.details.cameraPermission = cameraPermission

            // 测试存储权限
            const storagePermission = await permissionUtils.checkStoragePermission()
            test.details.storagePermission = storagePermission

            if (cameraPermission.granted || storagePermission.granted) {
                test.status = 'passed'
                test.message = '权限管理功能正常'
            } else {
                test.status = 'warning'
                test.message = '权限未授予，但管理功能正常'
            }

        } catch (error) {
            test.status = 'failed'
            test.error = error.message
            test.message = '权限管理测试失败'
        }

        return test
    },

    // 测试图片选择流程
    async testImageSelectionFlow() {
        const test = {
            name: '图片选择流程测试',
            status: 'unknown',
            details: {},
            timestamp: new Date().toISOString()
        }

        try {
            console.log('🖼️ 测试图片选择流程...')

            // 模拟图片选择（不实际触发用户交互）
            const mockOptions = {
                count: 1,
                sizeType: ['compressed'],
                sourceType: ['album'],
                success: (res) => {
                    test.details.mockSuccess = true
                    test.details.result = res
                },
                fail: (error) => {
                    test.details.mockFail = true
                    test.details.error = error
                }
            }

            // 检查智能选择器的准备状态
            const availability = await cameraUtils.checkCameraAvailability()
            test.details.availability = availability

            if (availability.recommendedMode !== 'none') {
                test.status = 'passed'
                test.message = '图片选择流程准备就绪'
            } else {
                test.status = 'failed'
                test.message = '图片选择流程不可用'
            }

        } catch (error) {
            test.status = 'failed'
            test.error = error.message
            test.message = '图片选择流程测试失败'
        }

        return test
    },

    // 测试图片存储功能
    async testImageStorage() {
        const test = {
            name: '图片存储功能测试',
            status: 'unknown',
            details: {},
            timestamp: new Date().toISOString()
        }

        try {
            console.log('💾 测试图片存储功能...')

            // 检查存储空间
            const storageInfo = await imageStorage.checkStorageSpace()
            test.details.storageInfo = storageInfo

            // 测试存储初始化
            imageStorage.init()
            test.details.initSuccess = true

            // 获取当前存储的图片数量
            const allImages = imageStorage.getAll()
            test.details.imageCount = Object.keys(allImages).length

            if (storageInfo && !storageInfo.isLow) {
                test.status = 'passed'
                test.message = '图片存储功能正常'
            } else if (storageInfo && storageInfo.isLow) {
                test.status = 'warning'
                test.message = '存储空间不足'
            } else {
                test.status = 'warning'
                test.message = '无法获取存储信息'
            }

        } catch (error) {
            test.status = 'failed'
            test.error = error.message
            test.message = '图片存储功能测试失败'
        }

        return test
    },

    // 生成测试报告
    generateReport(testResults) {
        const report = {
            title: '相机功能测试报告',
            timestamp: testResults.timestamp,
            summary: testResults.summary,
            details: []
        }

        testResults.tests.forEach(test => {
            const detail = {
                name: test.name,
                status: test.status,
                message: test.message || '',
                error: test.error || null,
                recommendations: []
            }

            // 根据测试结果生成建议
            if (test.status === 'failed') {
                if (test.name.includes('相机可用性')) {
                    detail.recommendations.push('检查manifest.json中的Camera模块配置')
                    detail.recommendations.push('确认Android权限配置完整')
                    detail.recommendations.push('重新构建应用以应用配置更改')
                } else if (test.name.includes('权限管理')) {
                    detail.recommendations.push('在设备设置中手动授予权限')
                    detail.recommendations.push('重新安装应用重置权限状态')
                } else if (test.name.includes('存储功能')) {
                    detail.recommendations.push('清理设备存储空间')
                    detail.recommendations.push('清理应用缓存')
                }
            } else if (test.status === 'warning') {
                if (test.name.includes('相机可用性')) {
                    detail.recommendations.push('当前可使用相册模式继续开发')
                    detail.recommendations.push('在真机环境测试完整功能')
                } else if (test.name.includes('存储功能')) {
                    detail.recommendations.push('清理不必要的图片文件')
                    detail.recommendations.push('监控存储使用情况')
                }
            }

            report.details.push(detail)
        })

        return report
    },

    // 显示测试结果对话框
    showTestResults(testResults) {
        const { summary } = testResults
        const title = '相机功能测试结果'

        let content = `测试总数: ${summary.total}\n`
        content += `✅ 通过: ${summary.passed}\n`
        content += `⚠️ 警告: ${summary.warnings}\n`
        content += `❌ 失败: ${summary.failed}\n\n`

        if (summary.failed > 0) {
            content += '存在问题需要解决，请查看控制台获取详细信息。'
        } else if (summary.warnings > 0) {
            content += '功能基本可用，但有一些注意事项。'
        } else {
            content += '所有功能测试通过！'
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
export default cameraTest
