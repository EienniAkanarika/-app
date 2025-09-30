// 简化的图片选择工具（用于开发和测试）

// 简单的图片选择器
export const simpleImagePicker = {

    // 直接选择图片，不做复杂检测
    chooseImage(options = {}) {
        console.log('使用简化图片选择器')

        const defaultOptions = {
            count: 1,
            sizeType: ['original', 'compressed'],
            sourceType: ['album'], // 开发环境优先使用相册
            maxSize: 20 * 1024 * 1024
        }

        const mergedOptions = {
            ...defaultOptions,
            ...options,
            success: (res) => {
                console.log('简化选择器：图片选择成功', res)
                if (options.success) {
                    options.success(res)
                }
            },
            fail: (error) => {
                console.error('简化选择器：图片选择失败', error)

                // 提供友好的错误提示
                let errorMessage = '图片选择失败'
                if (error.errMsg) {
                    if (error.errMsg.includes('cancel')) {
                        errorMessage = '用户取消选择'
                    } else if (error.errMsg.includes('permission')) {
                        errorMessage = '没有相册访问权限'
                    } else if (error.errMsg.includes('album')) {
                        errorMessage = '相册不可用'
                    }
                }

                uni.showToast({
                    title: errorMessage,
                    icon: 'none',
                    duration: 2000
                })

                if (options.fail) {
                    options.fail(error)
                }
            }
        }

        return uni.chooseImage(mergedOptions)
    },

    // 带用户确认的选择器
    async chooseImageWithConfirm(options = {}) {
        try {
            // 显示选择提示
            const confirmed = await this.showChoiceDialog()
            if (!confirmed) {
                if (options.fail) {
                    options.fail({
                        errMsg: 'user canceled',
                        reason: 'dialog_canceled'
                    })
                }
                return
            }

            // 执行选择
            return this.chooseImage(options)

        } catch (error) {
            console.error('选择器确认过程出错:', error)
            if (options.fail) {
                options.fail(error)
            }
        }
    },

    // 显示选择确认对话框
    showChoiceDialog() {
        return new Promise((resolve) => {
            uni.showModal({
                title: '选择图片',
                content: '当前使用相册模式选择图片，是否继续？',
                confirmText: '继续',
                cancelText: '取消',
                success: (res) => {
                    resolve(res.confirm)
                },
                fail: () => {
                    resolve(false)
                }
            })
        })
    }
}

// 导出默认对象
export default simpleImagePicker
