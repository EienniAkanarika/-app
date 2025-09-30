/**
 * 清除本地存储工具
 * 用于重置数据并加载新的默认图片
 */

export const clearAllLocalData = () => {
    try {
        // 清除衣物数据
        uni.removeStorageSync('clothes_data')

        // 清除穿搭数据
        uni.removeStorageSync('outfits_data')

        // 清除用户设置
        uni.removeStorageSync('user_settings')

        // 清除图片存储
        uni.removeStorageSync('local_image_data')
        uni.removeStorageSync('local_image_metadata')

        console.log('✅ 本地存储已清除，将重新加载默认数据')

        uni.showToast({
            title: '数据已重置',
            icon: 'success',
            duration: 2000
        })

        // 延迟重新加载页面以应用新的默认数据
        setTimeout(() => {
            uni.reLaunch({
                url: '/pages/index/index'
            })
        }, 1000)

        return true
    } catch (error) {
        console.error('清除本地存储失败:', error)
        uni.showToast({
            title: '重置失败',
            icon: 'error',
            duration: 2000
        })
        return false
    }
}

// 临时调用（开发时使用）
// clearAllLocalData()
