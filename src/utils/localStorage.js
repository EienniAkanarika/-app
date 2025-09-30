// 本地数据存储工具
import { getDefaultClothesImage } from './defaultClothesImages.js'

// 存储键名常量
const STORAGE_KEYS = {
    CLOTHES: 'clothes_data',
    OUTFITS: 'outfits_data',
    USER_SETTINGS: 'user_settings'
}

// 默认衣物数据
const DEFAULT_CLOTHES_DATA = {
    hat: [
        {
            id: 'hat1',
            _id: 'hat1',
            name: '棒球帽',
            color: '#E74C3C',
            image: getDefaultClothesImage('hat', '棒球帽'),
            category: 'hat',
            seasons: ['spring', 'summer', 'autumn'],
            style: 'casual',
            rating: 4,
            remark: '日常休闲佩戴'
        },
        {
            id: 'hat2',
            _id: 'hat2',
            name: '遮阳帽',
            color: '#F39C12',
            image: getDefaultClothesImage('hat', '遮阳帽'),
            category: 'hat',
            seasons: ['summer'],
            style: 'casual',
            rating: 3,
            remark: '夏日防晒必备'
        }
    ],
    shirt: [
        {
            id: 'shirt1',
            _id: 'shirt1',
            name: '白色T恤',
            color: '#FFFFFF',
            image: getDefaultClothesImage('shirt', '白色T恤'),
            category: 'shirt',
            seasons: ['spring', 'summer', 'autumn'],
            style: 'casual',
            rating: 5,
            remark: '百搭经典款'
        },
        {
            id: 'shirt2',
            _id: 'shirt2',
            name: '黑色T恤',
            color: '#2C3E50',
            image: getDefaultClothesImage('shirt', '黑色T恤'),
            category: 'shirt',
            seasons: ['spring', 'summer', 'autumn'],
            style: 'casual',
            rating: 4,
            remark: '显瘦又百搭'
        },
        {
            id: 'shirt3',
            _id: 'shirt3',
            name: '蓝色T恤',
            color: '#3498DB',
            image: getDefaultClothesImage('shirt', '蓝色T恤'),
            category: 'shirt',
            seasons: ['spring', 'summer'],
            style: 'casual',
            rating: 4,
            remark: '清新蓝色'
        }
    ],
    pants: [
        {
            id: 'pants1',
            _id: 'pants1',
            name: '牛仔裤',
            color: '#2980B9',
            image: getDefaultClothesImage('pants', '牛仔裤'),
            category: 'pants',
            seasons: ['spring', 'autumn', 'winter'],
            style: 'casual',
            rating: 5,
            remark: '经典牛仔'
        },
        {
            id: 'pants2',
            _id: 'pants2',
            name: '休闲裤',
            color: '#7F8C8D',
            image: getDefaultClothesImage('pants', '休闲裤'),
            category: 'pants',
            seasons: ['spring', 'autumn'],
            style: 'casual',
            rating: 3,
            remark: '舒适休闲'
        }
    ],
    coat: [
        {
            id: 'coat1',
            _id: 'coat1',
            name: '冬季外套',
            color: '#34495E',
            image: getDefaultClothesImage('coat', '夹克'),
            category: 'coat',
            seasons: ['winter'],
            style: 'formal',
            rating: 4,
            remark: '保暖厚外套'
        },
        {
            id: 'coat2',
            _id: 'coat2',
            name: '风衣',
            color: '#D35400',
            image: getDefaultClothesImage('coat', '大衣'),
            category: 'coat',
            seasons: ['spring', 'autumn'],
            style: 'formal',
            rating: 4,
            remark: '经典风衣'
        }
    ],
    skirt: [
        {
            id: 'skirt1',
            _id: 'skirt1',
            name: '百褶裙',
            color: '#E67E22',
            image: getDefaultClothesImage('skirt', '短裙'),
            category: 'skirt',
            seasons: ['spring', 'summer'],
            style: 'casual',
            rating: 4,
            remark: '青春活力'
        },
        {
            id: 'skirt2',
            _id: 'skirt2',
            name: '半身裙',
            color: '#C0392B',
            image: getDefaultClothesImage('skirt', '长裙'),
            category: 'skirt',
            seasons: ['spring', 'summer', 'autumn'],
            style: 'formal',
            rating: 3,
            remark: '优雅正式'
        }
    ],
    suit: [
        {
            id: 'suit1',
            _id: 'suit1',
            name: '正装西装',
            color: '#2C3E50',
            image: getDefaultClothesImage('suit', '商务西装'),
            category: 'suit',
            seasons: ['spring', 'autumn', 'winter'],
            style: 'formal',
            rating: 5,
            remark: '商务正装'
        }
    ],
    shoes: [
        {
            id: 'shoes1',
            _id: 'shoes1',
            name: '运动鞋',
            color: '#16A085',
            image: getDefaultClothesImage('shoes', '运动鞋'),
            category: 'shoes',
            seasons: ['spring', 'summer', 'autumn'],
            style: 'sports',
            rating: 5,
            remark: '舒适运动'
        },
        {
            id: 'shoes2',
            _id: 'shoes2',
            name: '皮鞋',
            color: '#4A235A',
            image: getDefaultClothesImage('shoes', '皮鞋'),
            category: 'shoes',
            seasons: ['spring', 'autumn', 'winter'],
            style: 'formal',
            rating: 4,
            remark: '正式场合'
        },
        {
            id: 'shoes3',
            _id: 'shoes3',
            name: '靴子',
            color: '#6E2C00',
            image: getDefaultClothesImage('shoes', '靴子'),
            category: 'shoes',
            seasons: ['autumn', 'winter'],
            style: 'casual',
            rating: 4,
            remark: '保暖时尚'
        }
    ]
}

// 默认穿搭数据
const DEFAULT_OUTFITS_DATA = [
    {
        id: 'outfit1',
        _id: 'outfit1',
        name: '休闲日常搭配',
        description: '舒适的日常出行搭配',
        items: ['shirt1', 'pants1', 'shoes1'],
        season: 'spring',
        style: 'casual',
        rating: 4,
        image: '/static/images/outfit-demo1.jpg',
        createdAt: '2024-01-15',
        tags: ['舒适', '日常', '休闲']
    },
    {
        id: 'outfit2',
        _id: 'outfit2',
        name: '商务正装',
        description: '正式商务场合穿搭',
        items: ['suit1', 'shoes2'],
        season: 'autumn',
        style: 'formal',
        rating: 5,
        image: '/static/images/outfit-demo2.jpg',
        createdAt: '2024-01-20',
        tags: ['正式', '商务', '优雅']
    }
]

// 本地存储工具函数
export const localStorageUtils = {
    // 设置数据
    setItem(key, data) {
        try {
            const jsonString = JSON.stringify(data)
            uni.setStorageSync(key, jsonString)
            return true
        } catch (error) {
            console.error('保存数据失败:', error)
            return false
        }
    },

    // 获取数据
    getItem(key, defaultValue = null) {
        try {
            const jsonString = uni.getStorageSync(key)
            if (jsonString) {
                return JSON.parse(jsonString)
            }
            return defaultValue
        } catch (error) {
            console.error('读取数据失败:', error)
            return defaultValue
        }
    },

    // 删除数据
    removeItem(key) {
        try {
            uni.removeStorageSync(key)
            return true
        } catch (error) {
            console.error('删除数据失败:', error)
            return false
        }
    },

    // 清空所有数据
    clear() {
        try {
            uni.clearStorageSync()
            return true
        } catch (error) {
            console.error('清空数据失败:', error)
            return false
        }
    }
}

// 衣物数据管理
export const clothesStorage = {
    // 初始化数据
    init() {
        const existingData = localStorageUtils.getItem(STORAGE_KEYS.CLOTHES)
        if (!existingData) {
            console.log('初始化衣物数据')
            localStorageUtils.setItem(STORAGE_KEYS.CLOTHES, DEFAULT_CLOTHES_DATA)
            return DEFAULT_CLOTHES_DATA
        }
        return existingData
    },

    // 获取所有衣物数据
    getAll() {
        const data = localStorageUtils.getItem(STORAGE_KEYS.CLOTHES, DEFAULT_CLOTHES_DATA)
        return data
    },

    // 获取指定分类的衣物
    getByCategory(category) {
        const allData = this.getAll()
        return allData[category] || []
    },

    // 添加衣物
    addClothes(clothesItem) {
        const allData = this.getAll()
        const category = clothesItem.category

        if (!allData[category]) {
            allData[category] = []
        }

        // 生成ID
        const id = 'clothes_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
        clothesItem.id = id
        clothesItem._id = id

        allData[category].push(clothesItem)

        // 按评分排序
        allData[category].sort((a, b) => (b.rating || 0) - (a.rating || 0))

        localStorageUtils.setItem(STORAGE_KEYS.CLOTHES, allData)
        return clothesItem
    },

    // 更新衣物
    updateClothes(id, updatedData) {
        const allData = this.getAll()
        let found = false

        Object.keys(allData).forEach(category => {
            const index = allData[category].findIndex(item => item.id === id || item._id === id)
            if (index !== -1) {
                allData[category][index] = { ...allData[category][index], ...updatedData }
                found = true

                // 重新排序
                allData[category].sort((a, b) => (b.rating || 0) - (a.rating || 0))
            }
        })

        if (found) {
            localStorageUtils.setItem(STORAGE_KEYS.CLOTHES, allData)
            return true
        }
        return false
    },

    // 删除衣物
    removeClothes(id) {
        const allData = this.getAll()
        let found = false

        Object.keys(allData).forEach(category => {
            const index = allData[category].findIndex(item => item.id === id || item._id === id)
            if (index !== -1) {
                allData[category].splice(index, 1)
                found = true
            }
        })

        if (found) {
            localStorageUtils.setItem(STORAGE_KEYS.CLOTHES, allData)
            return true
        }
        return false
    },

    // 获取衣物详情
    getDetail(id) {
        const allData = this.getAll()

        for (const category of Object.keys(allData)) {
            const item = allData[category].find(item => item.id === id || item._id === id)
            if (item) {
                return item
            }
        }

        return null
    }
}

// 穿搭数据管理
export const outfitStorage = {
    // 初始化数据
    init() {
        const existingData = localStorageUtils.getItem(STORAGE_KEYS.OUTFITS)
        if (!existingData) {
            console.log('初始化穿搭数据')
            localStorageUtils.setItem(STORAGE_KEYS.OUTFITS, DEFAULT_OUTFITS_DATA)
            return DEFAULT_OUTFITS_DATA
        }
        return existingData
    },

    // 获取所有穿搭
    getAll() {
        const data = localStorageUtils.getItem(STORAGE_KEYS.OUTFITS, DEFAULT_OUTFITS_DATA)
        return data
    },

    // 添加穿搭
    addOutfit(outfitData) {
        const allData = this.getAll()

        // 生成ID
        const id = 'outfit_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
        outfitData.id = id
        outfitData._id = id
        outfitData.createdAt = new Date().toISOString().split('T')[0]

        allData.push(outfitData)
        localStorageUtils.setItem(STORAGE_KEYS.OUTFITS, allData)
        return outfitData
    },

    // 更新穿搭
    updateOutfit(id, updatedData) {
        const allData = this.getAll()
        const index = allData.findIndex(item => item.id === id || item._id === id)

        if (index !== -1) {
            allData[index] = { ...allData[index], ...updatedData }
            localStorageUtils.setItem(STORAGE_KEYS.OUTFITS, allData)
            return true
        }
        return false
    },

    // 删除穿搭
    removeOutfit(id) {
        const allData = this.getAll()
        const index = allData.findIndex(item => item.id === id || item._id === id)

        if (index !== -1) {
            allData.splice(index, 1)
            localStorageUtils.setItem(STORAGE_KEYS.OUTFITS, allData)
            return true
        }
        return false
    },

    // 获取穿搭详情
    getDetail(id) {
        const allData = this.getAll()
        return allData.find(item => item.id === id || item._id === id) || null
    }
}

// 导出存储键名
export { STORAGE_KEYS }

// 默认导出
export default {
    localStorageUtils,
    clothesStorage,
    outfitStorage,
    STORAGE_KEYS
}
