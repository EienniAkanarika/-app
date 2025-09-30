// 设备环境诊断工具

import { getPlatform, getImageProcessingCapabilities } from './platformUtils.js'
import { imageStorage } from './imageStorage.js'

// 设备信息诊断
export const deviceDiagnostics = {

    // 获取设备信息
    async getDeviceInfo() {
        const deviceInfo = {
            platform: getPlatform(),
            systemInfo: null,
            storageInfo: null,
            networkInfo: null,
            capabilities: null,
            env: {
                isH5: false,
                isApp: false,
                isMp: false,
                isSimulator: false,
                isRealDevice: false
            }
        }

        try {
            // 获取系统信息
            deviceInfo.systemInfo = await this.getSystemInfo()

            // 获取存储信息
            deviceInfo.storageInfo = await this.getStorageInfo()

            // 获取网络信息
            deviceInfo.networkInfo = await this.getNetworkInfo()

            // 获取图片处理能力
            deviceInfo.capabilities = getImageProcessingCapabilities()

            // 判断环境类型
            deviceInfo.env = this.detectEnvironment(deviceInfo.systemInfo)

        } catch (error) {
            console.error('获取设备信息失败:', error)
        }

        return deviceInfo
    },

    // 获取系统信息
    getSystemInfo() {
        return new Promise((resolve) => {
            uni.getSystemInfo({
                success: (res) => {
                    resolve(res)
                },
                fail: (error) => {
                    console.error('获取系统信息失败:', error)
                    resolve(null)
                }
            })
        })
    },

    // 获取存储信息
    getStorageInfo() {
        return new Promise((resolve) => {
            try {
                uni.getStorageInfo({
                    success: (res) => {
                        resolve(res)
                    },
                    fail: (error) => {
                        console.error('获取存储信息失败:', error)
                        resolve(null)
                    }
                })
            } catch (error) {
                console.error('getStorageInfo API不可用:', error)
                resolve(null)
            }
        })
    },

    // 获取网络信息
    getNetworkInfo() {
        return new Promise((resolve) => {
            try {
                uni.getNetworkType({
                    success: (res) => {
                        resolve(res)
                    },
                    fail: (error) => {
                        console.error('获取网络信息失败:', error)
                        resolve(null)
                    }
                })
            } catch (error) {
                console.error('getNetworkType API不可用:', error)
                resolve(null)
            }
        })
    },

    // 检测环境类型
    detectEnvironment(systemInfo) {
        const env = {
            isH5: false,
            isApp: false,
            isMp: false,
            isSimulator: false,
            isRealDevice: false
        }

        // #ifdef H5
        env.isH5 = true
        // #endif

        // #ifdef APP-PLUS
        env.isApp = true
        // #endif

        // #ifdef MP-WEIXIN
        env.isMp = true
        // #endif

        // 判断是否为模拟器
        if (systemInfo) {
            const brand = systemInfo.brand?.toLowerCase() || ''
            const model = systemInfo.model?.toLowerCase() || ''
            const platform = systemInfo.platform?.toLowerCase() || ''

            // iOS模拟器检测
            if (platform === 'ios' && (
                model.includes('simulator') ||
                model.includes('x86') ||
                brand.includes('simulator')
            )) {
                env.isSimulator = true
            }

            // Android模拟器检测
            if (platform === 'android' && (
                brand.includes('google') ||
                model.includes('sdk') ||
                model.includes('emulator') ||
                model.includes('android sdk') ||
                brand.includes('generic')
            )) {
                env.isSimulator = true
            }

            env.isRealDevice = !env.isSimulator
        }

        return env
    },

    // 诊断图片保存问题
    async diagnoseImageSaveIssues() {
        console.log('🔍 开始诊断图片保存问题...')

        const deviceInfo = await this.getDeviceInfo()
        const issues = []
        const suggestions = []

        console.log('设备信息:', deviceInfo)

        // 检查存储空间
        if (deviceInfo.storageInfo) {
            const { currentSize, limitSize } = deviceInfo.storageInfo
            const usage = currentSize / limitSize

            if (usage > 0.9) {
                issues.push('存储空间不足')
                suggestions.push('清理设备存储空间或应用缓存')
            }
        }

        // 检查平台兼容性
        if (!deviceInfo.capabilities.canUseCanvas && !deviceInfo.capabilities.canCompress) {
            issues.push('图片处理能力不足')
            suggestions.push('当前平台不支持图片压缩和Canvas处理')
        }

        // 检查模拟器特殊问题
        if (deviceInfo.env.isSimulator) {
            issues.push('模拟器环境限制')
            suggestions.push('模拟器可能存在文件系统或权限限制，建议在真机上测试')
        }

        // 检查网络状态（可能影响某些操作）
        if (deviceInfo.networkInfo && deviceInfo.networkInfo.networkType === 'none') {
            issues.push('网络连接异常')
            suggestions.push('检查网络连接状态')
        }

        // 返回诊断结果
        return {
            deviceInfo,
            issues,
            suggestions,
            isHealthy: issues.length === 0
        }
    },

    // 测试图片保存功能
    async testImageSave(testImagePath = null) {
        console.log('🧪 测试图片保存功能...')

        const results = {
            compression: null,
            storage: null,
            localStorage: null,
            errors: []
        }

        try {
            // 测试图片压缩
            console.log('测试图片压缩...')
            const testPath = testImagePath || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='

            const compressedPath = await this.testCompression(testPath)
            results.compression = {
                success: !!compressedPath,
                path: compressedPath
            }

        } catch (error) {
            results.errors.push(`压缩测试失败: ${error.message}`)
        }

        try {
            // 测试本地存储
            console.log('测试本地存储...')
            const storageResult = await this.testStorage()
            results.localStorage = storageResult

        } catch (error) {
            results.errors.push(`存储测试失败: ${error.message}`)
        }

        try {
            // 测试图片存储功能
            console.log('测试图片存储功能...')
            const imageStorageResult = await this.testImageStorage(testImagePath)
            results.storage = imageStorageResult

        } catch (error) {
            results.errors.push(`图片存储测试失败: ${error.message}`)
        }

        return results
    },

    // 测试压缩功能
    async testCompression(imagePath) {
        const { compressImage } = await import('./imageUtils.js')
        return await compressImage(imagePath, {
            quality: 0.8,
            maxWidth: 800,
            maxHeight: 800
        })
    },

    // 测试本地存储
    async testStorage() {
        const testKey = 'test_storage_' + Date.now()
        const testData = { test: true, timestamp: Date.now() }

        try {
            // 测试写入
            uni.setStorageSync(testKey, testData)

            // 测试读取
            const readData = uni.getStorageSync(testKey)

            // 测试删除
            uni.removeStorageSync(testKey)

            return {
                success: true,
                canWrite: true,
                canRead: JSON.stringify(readData) === JSON.stringify(testData),
                canDelete: true
            }
        } catch (error) {
            return {
                success: false,
                error: error.message
            }
        }
    },

    // 测试图片存储
    async testImageStorage(imagePath = null) {
        try {
            imageStorage.init()

            const testPath = imagePath || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='

            const result = await imageStorage.saveImage(testPath, {
                compress: false, // 避免压缩问题
                metadata: {
                    source: 'diagnostic_test'
                }
            })

            if (result.success) {
                // 测试读取
                const imageInfo = imageStorage.getImage(result.imageId)
                const imageUrl = imageStorage.getImageUrl(result.imageId)

                // 清理测试数据
                imageStorage.deleteImage(result.imageId)

                return {
                    success: true,
                    canSave: true,
                    canRead: !!imageInfo,
                    canGetUrl: !!imageUrl
                }
            } else {
                return {
                    success: false,
                    error: result.error
                }
            }
        } catch (error) {
            return {
                success: false,
                error: error.message
            }
        }
    },

    // 生成诊断报告
    async generateReport() {
        const diagnosis = await this.diagnoseImageSaveIssues()
        const testResults = await this.testImageSave()

        const report = {
            timestamp: new Date().toISOString(),
            deviceInfo: diagnosis.deviceInfo,
            issues: diagnosis.issues,
            suggestions: diagnosis.suggestions,
            testResults,
            recommendations: []
        }

        // 根据结果生成建议
        if (!testResults.compression?.success) {
            report.recommendations.push('图片压缩功能异常，建议检查平台兼容性')
        }

        if (!testResults.localStorage?.success) {
            report.recommendations.push('本地存储功能异常，可能是权限或存储空间问题')
        }

        if (!testResults.storage?.success) {
            report.recommendations.push('图片存储功能异常，建议检查存储实现')
        }

        if (diagnosis.deviceInfo.env.isSimulator) {
            report.recommendations.push('模拟器环境可能存在限制，建议在真机上测试')
        }

        return report
    }
}

// 导出
export default deviceDiagnostics
