// 平台检测和兼容性工具

// 检测当前运行平台
export const getPlatform = () => {
    // #ifdef H5
    return 'H5'
    // #endif

    // #ifdef MP-WEIXIN
    return 'MP-WEIXIN'
    // #endif

    // #ifdef APP-PLUS
    return 'APP-PLUS'
    // #endif

    // #ifdef MP-ALIPAY
    return 'MP-ALIPAY'
    // #endif

    // #ifdef MP-BAIDU
    return 'MP-BAIDU'
    // #endif

    return 'UNKNOWN'
}

// 检查uni API是否可用
export const checkUniAPI = (apiName) => {
    try {
        return typeof uni[apiName] === 'function'
    } catch (error) {
        return false
    }
}

// 获取平台支持的功能
export const getPlatformCapabilities = () => {
    const platform = getPlatform()

    const capabilities = {
        compressImage: false,
        fileSystemManager: false,
        canvas: false,
        chooseImage: false
    }

    // 检查各种API支持情况
    capabilities.compressImage = checkUniAPI('compressImage')
    capabilities.fileSystemManager = checkUniAPI('getFileSystemManager')
    capabilities.chooseImage = checkUniAPI('chooseImage')

    // 检查Canvas支持
    try {
        if (typeof document !== 'undefined') {
            const canvas = document.createElement('canvas')
            capabilities.canvas = !!(canvas.getContext && canvas.getContext('2d'))
        }
    } catch (error) {
        capabilities.canvas = false
    }

    return {
        platform,
        ...capabilities
    }
}

// 安全的uni API调用包装器
export const safeUniCall = (apiName, options = {}) => {
    return new Promise((resolve, reject) => {
        if (!checkUniAPI(apiName)) {
            reject(new Error(`API ${apiName} 在当前平台不可用`))
            return
        }

        try {
            const apiCall = uni[apiName]
            if (typeof options === 'object' && options.success && options.fail) {
                // 如果已经有回调，直接调用
                apiCall(options)
            } else {
                // 包装成Promise形式
                apiCall({
                    ...options,
                    success: (res) => {
                        resolve(res)
                    },
                    fail: (err) => {
                        reject(new Error(err.errMsg || `${apiName} 调用失败`))
                    }
                })
            }
        } catch (error) {
            reject(new Error(`调用 ${apiName} 时发生错误: ${error.message}`))
        }
    })
}

// 平台特定的图片处理能力检测
export const getImageProcessingCapabilities = () => {
    const platform = getPlatform()
    const capabilities = getPlatformCapabilities()

    return {
        platform,
        canCompress: capabilities.compressImage,
        canReadFile: capabilities.fileSystemManager,
        canUseCanvas: capabilities.canvas,
        preferredMethod: getPreferredImageMethod(capabilities)
    }
}

// 获取推荐的图片处理方法
const getPreferredImageMethod = (capabilities) => {
    if (capabilities.compressImage) {
        return 'uni.compressImage'
    } else if (capabilities.canvas) {
        return 'canvas'
    } else if (capabilities.fileSystemManager) {
        return 'fileSystem'
    } else {
        return 'none'
    }
}

// 默认导出
export default {
    getPlatform,
    checkUniAPI,
    getPlatformCapabilities,
    safeUniCall,
    getImageProcessingCapabilities
}
