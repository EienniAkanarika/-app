// 数据同步测试工具

import { clothesApi } from '@/api/index.js'
import { clothesStorage } from '@/utils/localStorage.js'

// 数据同步测试工具
export const dataSyncTest = {

    // 测试衣物数据同步
    async testClothesDataSync() {
        console.log('🧪 开始测试衣物数据同步...')

        try {
            // 1. 直接从本地存储获取数据
            const directStorageData = clothesStorage.getAll()
            console.log('📦 直接从存储获取的数据:', directStorageData)

            // 转换为列表格式
            const directList = []
            Object.keys(directStorageData).forEach(category => {
                directStorageData[category].forEach(item => {
                    directList.push({
                        id: item.id,
                        name: item.name,
                        category: item.category,
                        createdAt: item.createdAt
                    })
                })
            })
            console.log('📋 直接存储列表:', directList)

            // 2. 通过API获取数据
            const apiResult = await clothesApi.getList()
            console.log('🌐 API返回结果:', apiResult)

            if (apiResult && apiResult.code === 200) {
                const apiList = apiResult.data.list || []
                console.log('📊 API列表:', apiList.map(item => ({
                    id: item.id,
                    name: item.name,
                    category: item.category,
                    createdAt: item.createdAt
                })))

                // 3. 比较两个数据源
                console.log('🔍 数据对比:')
                console.log(`直接存储数量: ${directList.length}`)
                console.log(`API返回数量: ${apiList.length}`)

                if (directList.length === apiList.length) {
                    console.log('✅ 数据数量一致')
                } else {
                    console.log('❌ 数据数量不一致')
                }

                return {
                    success: true,
                    directCount: directList.length,
                    apiCount: apiList.length,
                    isConsistent: directList.length === apiList.length,
                    directList,
                    apiList
                }
            } else {
                console.error('❌ API调用失败:', apiResult)
                return {
                    success: false,
                    error: 'API调用失败'
                }
            }

        } catch (error) {
            console.error('❌ 测试过程出错:', error)
            return {
                success: false,
                error: error.message
            }
        }
    },

    // 显示测试结果
    showTestResult(result) {
        const title = '数据同步测试结果'
        let content = ''

        if (result.success) {
            content = `直接存储数量: ${result.directCount}\n`
            content += `API返回数量: ${result.apiCount}\n`
            content += `数据一致性: ${result.isConsistent ? '✅ 一致' : '❌ 不一致'}\n\n`

            if (result.isConsistent) {
                content += '数据同步正常，可能是页面刷新问题。'
            } else {
                content += '发现数据不一致，需要检查存储机制。'
            }
        } else {
            content = `测试失败: ${result.error}`
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

    // 强制刷新本地存储
    forceRefreshStorage() {
        try {
            console.log('🔄 强制刷新本地存储...')

            // 重新初始化存储
            clothesStorage.init()

            console.log('✅ 存储刷新完成')
            return true
        } catch (error) {
            console.error('❌ 存储刷新失败:', error)
            return false
        }
    },

    // 检查最新添加的衣物
    checkLatestClothes() {
        try {
            console.log('🔍 检查最新添加的衣物...')

            const allData = clothesStorage.getAll()
            const allItems = []

            Object.keys(allData).forEach(category => {
                allData[category].forEach(item => {
                    allItems.push({
                        id: item.id,
                        name: item.name,
                        category: item.category,
                        createdAt: item.createdAt,
                        addedTime: new Date(item.createdAt || 0).getTime()
                    })
                })
            })

            // 按创建时间排序，最新的在前
            allItems.sort((a, b) => b.addedTime - a.addedTime)

            console.log('📅 最新的5件衣物:', allItems.slice(0, 5))

            return allItems.slice(0, 5)
        } catch (error) {
            console.error('❌ 检查最新衣物失败:', error)
            return []
        }
    }
}

// 导出默认对象
export default dataSyncTest
