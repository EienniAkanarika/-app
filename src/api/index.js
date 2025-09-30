// 导入本地存储工具
import { clothesStorage } from '@/utils/localStorage.js'

// 衣物API - 使用本地存储
export const clothesApi = {
    // 获取衣物列表
    async getList(params = {}) {
        try {
            // 初始化数据（如果是首次使用）
            clothesStorage.init()

            console.log('从本地存储获取衣物列表')
            const allClothes = clothesStorage.getAll()

            // 将分类数据转换为列表格式
            const list = []
            Object.keys(allClothes).forEach(category => {
                allClothes[category].forEach(item => {
                    list.push(item)
                })
            })

            console.log(`本地存储中共有 ${list.length} 件衣物`)

            return {
                code: 200,
                data: {
                    list: list,
                    total: list.length
                },
                message: '获取成功'
            }
        } catch (error) {
            console.error('获取衣物列表失败:', error)
            return {
                code: 500,
                data: {
                    list: [],
                    total: 0
                },
                message: '获取失败'
            }
        }
    },

    // 获取衣物详情
    async getDetail(id) {
        try {
            console.log('从本地存储获取衣物详情:', id)
            const clothesDetail = clothesStorage.getDetail(id)

            if (clothesDetail) {
                console.log('找到衣物详情:', clothesDetail.name)
                return {
                    code: 200,
                    data: clothesDetail,
                    message: '获取成功'
                }
            } else {
                console.warn('未找到衣物:', id)
                return {
                    code: 404,
                    message: '衣物不存在',
                    data: null
                }
            }
        } catch (error) {
            console.error('获取衣物详情失败:', error)
            return {
                code: 500,
                message: '获取失败',
                data: null
            }
        }
    },

    // 添加衣物
    async add(data) {
        try {
            console.log('添加衣物到本地存储:', data.name)
            const newClothes = clothesStorage.addClothes(data)

            console.log('衣物添加成功:', newClothes.id)
            return {
                code: 200,
                data: newClothes,
                message: '添加成功'
            }
        } catch (error) {
            console.error('添加衣物失败:', error)
            return {
                code: 500,
                message: '添加失败',
                data: null
            }
        }
    },

    // 编辑衣物
    async edit(id, data) {
        try {
            console.log('更新本地存储中的衣物:', id)
            const success = clothesStorage.updateClothes(id, data)

            if (success) {
                console.log('衣物更新成功')
                return {
                    code: 200,
                    data: data,
                    message: '更新成功'
                }
            } else {
                console.warn('未找到要更新的衣物:', id)
                return {
                    code: 404,
                    message: '衣物不存在',
                    data: null
                }
            }
        } catch (error) {
            console.error('编辑衣物失败:', error)
            return {
                code: 500,
                message: '编辑失败',
                data: null
            }
        }
    },

    // 删除衣物
    async remove(id) {
        try {
            console.log('从本地存储删除衣物:', id)
            const success = clothesStorage.removeClothes(id)

            if (success) {
                console.log('衣物删除成功')
                return {
                    code: 200,
                    message: '删除成功',
                    data: { id }
                }
            } else {
                console.warn('未找到要删除的衣物:', id)
                return {
                    code: 404,
                    message: '衣物不存在',
                    data: null
                }
            }
        } catch (error) {
            console.error('删除衣物失败:', error)
            return {
                code: 500,
                message: '删除失败',
                data: null
            }
        }
    }
}

export default clothesApi
