// 导入本地存储工具
import { outfitStorage } from '@/utils/localStorage.js'

// 获取穿搭列表
export const getList = async (params = {}) => {
    try {
        console.log('从本地存储获取穿搭列表')

        // 初始化数据（如果是首次使用）
        outfitStorage.init()

        const outfits = outfitStorage.getAll()

        console.log(`本地存储中共有 ${outfits.length} 个穿搭`)

        return {
            code: 200,
            data: {
                list: outfits,
                total: outfits.length
            },
            message: '获取成功'
        }
    } catch (error) {
        console.error('获取穿搭列表失败:', error)
        return {
            code: 500,
            data: {
                list: [],
                total: 0
            },
            message: '获取失败'
        }
    }
}

// 获取穿搭详情
export const getDetail = async (id) => {
    try {
        console.log('从本地存储获取穿搭详情:', id)
        const outfitDetail = outfitStorage.getDetail(id)

        if (outfitDetail) {
            console.log('找到穿搭详情:', outfitDetail.name)
            return {
                code: 200,
                data: outfitDetail,
                message: '获取成功'
            }
        } else {
            console.warn('未找到穿搭:', id)
            return {
                code: 404,
                message: '穿搭不存在',
                data: null
            }
        }
    } catch (error) {
        console.error('获取穿搭详情失败:', error)
        return {
            code: 500,
            message: '获取失败',
            data: null
        }
    }
}

// 创建穿搭
export const create = async (data) => {
    try {
        console.log('创建穿搭到本地存储:', data.name)
        const newOutfit = outfitStorage.addOutfit(data)

        console.log('穿搭创建成功:', newOutfit.id)
        return {
            code: 200,
            data: newOutfit,
            message: '创建成功'
        }
    } catch (error) {
        console.error('创建穿搭失败:', error)
        return {
            code: 500,
            message: '创建失败',
            data: null
        }
    }
}

// 更新穿搭
export const update = async (id, data) => {
    try {
        console.log('更新本地存储中的穿搭:', id)
        const success = outfitStorage.updateOutfit(id, data)

        if (success) {
            console.log('穿搭更新成功')
            return {
                code: 200,
                data: data,
                message: '更新成功'
            }
        } else {
            console.warn('未找到要更新的穿搭:', id)
            return {
                code: 404,
                message: '穿搭不存在',
                data: null
            }
        }
    } catch (error) {
        console.error('更新穿搭失败:', error)
        return {
            code: 500,
            message: '更新失败',
            data: null
        }
    }
}

// 删除穿搭
export const remove = async (id) => {
    try {
        console.log('从本地存储删除穿搭:', id)
        const success = outfitStorage.removeOutfit(id)

        if (success) {
            console.log('穿搭删除成功')
            return {
                code: 200,
                message: '删除成功',
                data: { id }
            }
        } else {
            console.warn('未找到要删除的穿搭:', id)
            return {
                code: 404,
                message: '穿搭不存在',
                data: null
            }
        }
    } catch (error) {
        console.error('删除穿搭失败:', error)
        return {
            code: 500,
            message: '删除失败',
            data: null
        }
    }
}

// 导出默认对象
export default {
    getList,
    getDetail,
    create,
    update,
    remove
}
