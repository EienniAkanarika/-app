// 请求工具函数

// 基础URL配置
export const BASE_URL = 'https://tztoyseauzso.sealosbja.site'

// 请求超时时间
const TIMEOUT = 10000

// 通用请求函数
export const request = async (url, options = {}) => {
    const config = {
        method: 'GET',
        timeout: TIMEOUT,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    }

    // 构建完整URL
    const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`

    try {
        console.log(`发起请求: ${config.method} ${fullUrl}`)

        const response = await fetch(fullUrl, config)

        // 检查响应状态
        if (!response.ok) {
            throw new Error(`HTTP错误: ${response.status} ${response.statusText}`)
        }

        const result = await response.json()
        console.log(`请求成功: ${fullUrl}`, result)

        return result
    } catch (error) {
        console.error(`请求失败: ${fullUrl}`, error)

        // 根据错误类型返回不同的错误信息
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('网络连接失败，请检查网络设置')
        } else if (error.message.includes('timeout')) {
            throw new Error('请求超时，请稍后重试')
        } else {
            throw error
        }
    }
}

// GET请求
export const get = (url, params = {}, options = {}) => {
    const queryString = new URLSearchParams(params).toString()
    const fullUrl = queryString ? `${url}?${queryString}` : url

    return request(fullUrl, {
        method: 'GET',
        ...options
    })
}

// POST请求
export const post = (url, data = {}, options = {}) => {
    return request(url, {
        method: 'POST',
        body: JSON.stringify(data),
        ...options
    })
}

// PUT请求
export const put = (url, data = {}, options = {}) => {
    return request(url, {
        method: 'PUT',
        body: JSON.stringify(data),
        ...options
    })
}

// DELETE请求
export const del = (url, options = {}) => {
    return request(url, {
        method: 'DELETE',
        ...options
    })
}

// 上传文件请求
export const uploadFile = (url, filePath, formData = {}, options = {}) => {
    return new Promise((resolve, reject) => {
        const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`

        uni.uploadFile({
            url: fullUrl,
            filePath,
            name: 'file',
            formData,
            header: {
                ...options.headers
            },
            success: (res) => {
                try {
                    const result = JSON.parse(res.data)
                    if (res.statusCode === 200) {
                        resolve(result)
                    } else {
                        reject(new Error(result.message || '上传失败'))
                    }
                } catch (error) {
                    reject(new Error('响应数据格式错误'))
                }
            },
            fail: (error) => {
                reject(new Error(error.errMsg || '上传失败'))
            }
        })
    })
}

// 默认导出
export default {
    BASE_URL,
    request,
    get,
    post,
    put,
    del,
    uploadFile
}
