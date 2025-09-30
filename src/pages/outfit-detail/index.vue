<template>
  <view class="mobile-outfit-detail-container">
    <!-- 渐变背景 -->
    <view class="gradient-bg"></view>

    <!-- 顶部状态栏安全区 -->
    <view class="status-bar-spacer"></view>

    <!-- 统一的移动端头部 -->
    <view class="mobile-header">
      <view class="header-content">
        <view class="back-btn" @tap="goBack">
          <svg viewBox="0 0 24 24" class="back-icon">
            <path d="M15.41,7.41L14,6L8,12L14,18L15.41,16.59L10.83,12L15.41,7.41Z"/>
          </svg>
        </view>
        <text class="header-title">穿搭详情</text>
        <view class="edit-btn" @tap="editOutfit">
          <svg viewBox="0 0 24 24" class="edit-icon">
            <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"/>
          </svg>
        </view>
      </view>
    </view>
    
    <!-- 内容区域 -->
    <view class="content-box" :class="{ 'animate-in': animateUI }">
      <!-- 穿搭信息卡片 -->
      <view class="outfit-info-card">
        <view class="outfit-header">
          <text class="outfit-name">{{ outfitData.name }}</text>
          <view class="outfit-rating">
            <view 
              v-for="i in 5" 
              :key="i" 
              class="rating-star" 
              :class="{ 'filled': outfitData.rating >= i }"
            >
              <view class="star-shape"></view>
            </view>
          </view>
        </view>
        
        <view class="outfit-meta">
          <view class="meta-row">
            <view class="meta-item">
              <svg viewBox="0 0 24 24" class="meta-icon">
                <path d="M19,3H18V1H16V3H8V1H6V3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M19,19H5V8H19V19Z"/>
              </svg>
              <text class="meta-text">{{ formatDate(outfitData.date) }}</text>
            </view>
            <view class="meta-badge season-badge" :class="'season-' + outfitData.season">
              {{ seasonLabels[outfitData.season] }}季
            </view>
          </view>
          <view class="meta-row">
            <view class="meta-item">
              <svg viewBox="0 0 24 24" class="meta-icon">
                <path d="M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z"/>
              </svg>
              <text class="meta-text">{{ getSceneLabel(outfitData.scene) }}</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 穿搭效果预览 -->
      <view class="preview-section">
        <view class="section-header">
          <text class="section-title">穿搭效果</text>
        </view>
        <view class="preview-container">
          <image 
            v-if="getPreviewImageUrl" 
            class="preview-image" 
            :src="getPreviewImageUrl" 
            mode="aspectFit"
            @error="handlePreviewError"
          />
          <view v-else class="preview-placeholder">
            <svg viewBox="0 0 24 24" class="placeholder-icon">
              <path d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z"/>
            </svg>
            <text class="placeholder-text">暂无效果图</text>
          </view>
        </view>
      </view>
      
      <!-- 衣物搭配 -->
      <view class="items-section">
        <view class="section-header">
          <text class="section-title">衣物搭配</text>
          <text class="items-count">{{ outfitData.items?.length || 0 }}件</text>
        </view>
        <view v-if="outfitData.items && outfitData.items.length > 0" class="items-grid">
          <view 
            v-for="item in outfitData.items" 
            :key="item.id" 
            class="item-card"
            @tap="viewItem(item)"
          >
            <view class="item-image-container">
              <image 
                class="item-image" 
                :src="item.image" 
                mode="aspectFill"
                @error="() => handleItemImageError(item)"
              />
              <view class="item-category">{{ getCategoryName(item.category) }}</view>
            </view>
            <text class="item-name">{{ item.name }}</text>
          </view>
        </view>
        <view v-else class="empty-items">
          <text class="empty-items-text">暂无衣物搭配</text>
        </view>
      </view>
      
      <!-- 穿搭笔记 -->
      <view v-if="outfitData.notes" class="notes-section">
        <view class="section-header">
          <text class="section-title">穿搭笔记</text>
        </view>
        <view class="notes-content">
          <text>{{ outfitData.notes }}</text>
        </view>
      </view>
    </view>
    
    <!-- 底部操作区 -->
    <view class="bottom-actions" :class="{ 'animate-in': animateUI }">
      <button class="edit-outfit-btn single-button" @tap="editOutfit">
        编辑穿搭
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import * as outfitApi from '@/api/outfit.js'
import { clothesApi } from '@/api'
import { imageStorage } from '@/utils/imageStorage.js'
import { getDefaultImage } from '@/utils/imageUtils.js'

// 动画控制
const animateUI = ref(false)

// 从路由参数获取穿搭数据
const outfitId = ref('')
const receivedOutfitData = ref(null)

// 穿搭数据
const outfitData = ref({
  name: '',
  date: '',
  season: 'spring',
  scene: 'daily',
  rating: 0,
  previewImage: '',
  items: [],
  notes: ''
})

// 季节标签
const seasonLabels = {
  spring: '春',
  summer: '夏',
  autumn: '秋',
  winter: '冬'
}

// 场景标签
const sceneLabels = {
  daily: '日常',
  work: '职场',
  date: '约会',
  party: '聚会',
  travel: '旅行',
  sports: '运动',
  casual: '休闲',
  formal: '正式'
}

// 类型映射
const categoryNames = {
  hat: '帽子',
  shirt: 'T恤',
  pants: '裤子',
  coat: '外套',
  skirt: '裙子',
  suit: '西装',
  shoes: '鞋子',
  top: '上装',
  bottom: '下装',
  dress: '连衣裙',
  outerwear: '外套',
  accessories: '配饰'
}

// 获取场景标签
const getSceneLabel = (scene) => {
  return sceneLabels[scene] || scene
}

// 获取分类名称
const getCategoryName = (category) => {
  return categoryNames[category] || category
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '未设置日期'
  
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) {
      return '昨天'
    } else if (diffDays === 0) {
      return '今天'
    } else if (diffDays <= 7) {
      return `${diffDays}天前`
    } else {
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
      })
    }
  } catch (error) {
    return '未知日期'
  }
}

// 加载穿搭数据
const loadOutfitData = async () => {
  try {
    console.log('开始通过API获取穿搭数据, ID:', outfitId.value)
    const result = await outfitApi.getDetail(outfitId.value)
    if (result.code === 200 && result.data) {
      outfitData.value = result.data
      console.log('API获取穿搭数据成功:', result.data.name)
    } else {
      throw new Error('穿搭数据加载失败')
    }
  } catch (error) {
    console.error('加载穿搭数据失败:', error)
    uni.showToast({
      title: '加载数据失败',
      icon: 'none'
    })
    setTimeout(() => {
      goBack()
    }, 1500)
  }
}

// 处理图片URL
const processImageUrl = (imageUrl) => {
  // 如果没有图片URL，返回null
  if (!imageUrl) {
    return null
  }
  
  // 记录原始图片路径
  console.log('处理图片URL:', imageUrl)
  
  // 修复Base64 URL开头的斜杠问题
  if (imageUrl.startsWith('/data:image/')) {
    console.log('修复Base64图片URL开头的斜杠')
    return imageUrl.substring(1) // 移除开头的斜杠
  }
  
  // 如果是Base64图片（以data:开头），直接返回
  if (imageUrl.startsWith('data:image/')) {
    console.log('识别为Base64图片，直接返回')
    return imageUrl
  }
  
  // 🔧 处理Blob URL失效问题
  if (imageUrl.startsWith('blob:')) {
    console.warn('检测到失效的Blob URL，无法显示:', imageUrl)
    return null // 返回null让调用方使用默认图片
  }
  
  // 如果是其他本地临时文件路径
  if (imageUrl.includes('tmp_') || imageUrl.includes('temp')) {
    console.log('识别为本地临时文件，直接返回')
    return imageUrl
  }
  
  // 如果看起来像是imageStorage的ID，尝试从本地存储获取
  if (typeof imageUrl === 'string' && imageUrl.length > 10 && !imageUrl.includes('/') && !imageUrl.startsWith('http')) {
    console.log('尝试从本地存储获取图片:', imageUrl)
    try {
      const storedImage = imageStorage.getImage(imageUrl)
      if (storedImage) {
        console.log('从本地存储获取到图片')
        return storedImage
      } else {
        console.log('本地存储中未找到图片:', imageUrl)
      }
    } catch (error) {
      console.error('从本地存储获取图片失败:', error)
    }
  }
  
  // 其他情况直接返回
  return imageUrl
}

// 获取处理后的预览图片URL
const getPreviewImageUrl = computed(() => {
  const imageUrl = outfitData.value.image || outfitData.value.previewImage
  const processedUrl = processImageUrl(imageUrl)
  console.log('预览图片处理结果:', { 
    original: imageUrl, 
    processed: processedUrl 
  })
  return processedUrl
})

// 处理预览图错误
const handlePreviewError = () => {
  const imageUrl = outfitData.value.image || outfitData.value.previewImage
  console.error('穿搭预览图加载失败，图片URL:', imageUrl)
  console.error('outfitData中的image字段:', outfitData.value.image)
  console.error('outfitData中的previewImage字段:', outfitData.value.previewImage)
  console.error('处理后的URL:', getPreviewImageUrl.value)
}

// 处理衣物图片错误
const handleItemImageError = (item) => {
  console.error(`衣物图片加载失败: ${item.name}`)
  // 使用默认图片作为降级显示
  item.image = getDefaultImage(item.category || 'default')
}

// 查看衣物详情
const viewItem = (item) => {
  uni.previewImage({
    urls: [item.image],
    current: 0
  })
}


// 保存到相册
const saveToAlbum = () => {
  const imageUrl = outfitData.value.image || outfitData.value.previewImage
  if (imageUrl) {
    uni.saveImageToPhotosAlbum({
      filePath: imageUrl,
      success: () => {
        uni.showToast({
          title: '保存成功',
          icon: 'success'
        })
      },
      fail: () => {
        uni.showToast({
          title: '保存失败',
          icon: 'none'
        })
      }
    })
  } else {
    uni.showToast({
      title: '暂无图片可保存',
      icon: 'none'
    })
  }
}


// 加载完整的衣物详情
const loadItemsDetails = async () => {
  console.log('开始 loadItemsDetails 检查')
  console.log('outfitData.value.items:', outfitData.value.items)
  console.log('items 是否为数组:', Array.isArray(outfitData.value.items))
  
  if (!outfitData.value.items || !Array.isArray(outfitData.value.items)) {
    console.log('没有衣物项目或格式不正确, items:', outfitData.value.items)
    return
  }
  
  try {
    console.log('开始加载衣物详情，衣物数量:', outfitData.value.items.length)
    
    const detailedItems = []
    for (const item of outfitData.value.items) {
      console.log('处理 item:', item, '类型:', typeof item)
      
      // 如果item是字符串ID，需要从API获取详情
      if (typeof item === 'string') {
        console.log('获取衣物详情，ID:', item)
        const result = await clothesApi.getDetail(item)
        
        if (result && result.code === 200 && result.data) {
          console.log('成功获取衣物详情:', result.data.name)
          detailedItems.push(result.data)
        } else {
          console.warn('无法获取衣物详情:', item)
        }
      } else if (item && typeof item === 'object' && item.id) {
        // 如果已经是完整对象，直接使用
        console.log('使用现有衣物对象:', item.name)
        detailedItems.push(item)
      } else {
        console.warn('未知的衣物数据格式:', item)
      }
    }
    
    // 处理衣物图片URL
    detailedItems.forEach(item => {
      if (item.image) {
        item.image = processImageUrl(item.image)
      }
    })
    
    // 更新穿搭数据中的衣物列表
    outfitData.value.items = detailedItems
    console.log('衣物详情加载完成，详情数量:', detailedItems.length)
  } catch (error) {
    console.error('加载衣物详情失败:', error)
  }
}

// 编辑穿搭
const editOutfit = () => {
  if (outfitId.value) {
    uni.navigateTo({
      url: `/pages/create-outfit/index?id=${outfitId.value}&mode=edit`
    })
  } else if (receivedOutfitData.value) {
    // 如果使用的是传递的数据，传递完整数据
    const outfitDataStr = JSON.stringify(receivedOutfitData.value)
    uni.navigateTo({
      url: `/pages/create-outfit/index?edit=true&outfitData=${encodeURIComponent(outfitDataStr)}`
    })
  }
}


// 返回
const goBack = () => {
  uni.navigateBack()
}

// 页面加载时获取参数
onLoad((options) => {
  console.log('穿搭详情页面加载，参数:', options)
  
  try {
    if (options.outfitData) {
      // 如果有直接传递的穿搭数据，优先使用
      console.log('使用传递的穿搭数据')
      const decodedData = decodeURIComponent(options.outfitData)
      receivedOutfitData.value = JSON.parse(decodedData)
      
      // 修复图片URL中可能存在的问题
      if (receivedOutfitData.value.image && receivedOutfitData.value.image.startsWith('/data:image/')) {
        console.log('修复穿搭图片URL开头的斜杠')
        receivedOutfitData.value.image = receivedOutfitData.value.image.substring(1)
      }
      
      // 修复衣物图片URL中可能存在的问题
      if (receivedOutfitData.value.items && Array.isArray(receivedOutfitData.value.items)) {
        receivedOutfitData.value.items.forEach(item => {
          if (item.image && item.image.startsWith('/data:image/')) {
            console.log('修复衣物图片URL开头的斜杠:', item.name)
            item.image = item.image.substring(1)
          }
        })
      }
      
      console.log('解析和修复后的穿搭数据:', receivedOutfitData.value)
    } else if (options.id) {
      // 如果只有ID，记录下来用于API获取
      outfitId.value = options.id
      console.log('使用穿搭ID:', outfitId.value)
    } else {
      throw new Error('缺少必要的参数')
    }
  } catch (error) {
    console.error('解析路由参数失败:', error)
    uni.showToast({
      title: '参数错误',
      icon: 'none'
    })
    setTimeout(() => {
      goBack()
    }, 1500)
  }
})

// 初始化
onMounted(async () => {
  try {
    if (receivedOutfitData.value) {
      // 使用传递的数据
      outfitData.value = { ...receivedOutfitData.value }
      console.log('使用传递的穿搭数据初始化页面')
      console.log('穿搭数据:', outfitData.value)
      console.log('图片字段 - image:', outfitData.value.image)
      console.log('图片字段 - previewImage:', outfitData.value.previewImage)
    } else if (outfitId.value) {
      // 通过API获取数据
      console.log('通过API获取穿搭数据')
      await loadOutfitData()
      console.log('API获取的穿搭数据:', outfitData.value)
      console.log('图片字段 - image:', outfitData.value.image)
      console.log('图片字段 - previewImage:', outfitData.value.previewImage)
    } else {
      throw new Error('无有效的数据源')
    }
    
    // 加载完整的衣物详情
    console.log('准备调用 loadItemsDetails')
    await loadItemsDetails()
    console.log('loadItemsDetails 调用完成')
    
    // 启动动画
    setTimeout(() => {
      animateUI.value = true
    }, 100)
  } catch (error) {
    console.error('页面初始化失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
    setTimeout(() => {
      goBack()
    }, 1500)
  }
})
</script>

<style lang="scss">
@use '@/styles/mobile-design-system.scss';

page {
  background-color: #f8f9fa;
}

.mobile-outfit-detail-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  background: #f8f9fa;
}

/* 渐变背景 */
.gradient-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 50vh;
  background: linear-gradient(135deg, #4776E6 0%, #8E54E9 50%, #6B73FF 100%);
  z-index: -1;
}

/* 状态栏安全区 */
.status-bar-spacer {
  height: env(safe-area-inset-top);
  background: transparent;
}

/* 移动端头部 */
.mobile-header {
  position: relative;
  z-index: 10;
  background: transparent;
  padding: 16px 20px 8px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.back-btn, .edit-btn {
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.95);
    background: rgba(255, 255, 255, 0.2);
  }
}

.back-icon, .edit-icon {
  width: 20px;
  height: 20px;
  fill: white;
}

.header-title {
  font-size: 20px;
  font-weight: 700;
  color: white;
  text-align: center;
  flex: 1;
}

/* 内容区域 */
.content-box {
  flex: 1;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(15px);
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  box-shadow: 0 -5px 30px rgba(76, 132, 255, 0.12);
  z-index: 2;
  margin-top: 12px;
  padding: 20px;
  padding-bottom: 100px; /* 为底部按钮留空间 */
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.content-box.animate-in {
  opacity: 1;
  transform: translateY(0);
  transition-delay: 0.2s;
}

/* 穿搭信息卡片 */
.outfit-info-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.outfit-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.outfit-name {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  flex: 1;
  margin-right: 16px;
}

.outfit-rating {
  display: flex;
  gap: 4px;
}

.rating-star {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.star-shape {
  width: 16px;
  height: 16px;
  background: #E5E5E5;
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
}

.rating-star.filled .star-shape {
  background: linear-gradient(135deg, #FFD700, #FFA500);
}

.outfit-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.meta-icon {
  width: 16px;
  height: 16px;
  fill: #999;
}

.meta-text {
  font-size: 14px;
  color: #666;
}

.meta-badge {
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
}

.season-badge {
  background: rgba(71, 118, 230, 0.1);
  color: #4776E6;
}

/* 节标题 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #333;
}

.items-count {
  font-size: 14px;
  color: #666;
  background: #f8f9fa;
  padding: 4px 8px;
  border-radius: 8px;
}

/* 预览区域 */
.preview-section {
  margin-bottom: 24px;
}

.preview-container {
  width: 100%;
  height: 300px;
  border-radius: 16px;
  overflow: hidden;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.placeholder-icon {
  width: 48px;
  height: 48px;
  fill: #ccc;
}

.placeholder-text {
  font-size: 16px;
  color: #999;
}

/* 衣物列表 */
.items-section {
  margin-bottom: 24px;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.item-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.95);
  }
}

.item-image-container {
  position: relative;
  width: 100%;
  height: 120px;
}

.item-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-category {
  position: absolute;
  bottom: 6px;
  left: 6px;
  padding: 2px 6px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 10px;
}

.item-name {
  padding: 8px;
  font-size: 12px;
  color: #333;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty-items {
  padding: 40px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: 12px;
}

.empty-items-text {
  font-size: 16px;
  color: #999;
}

/* 笔记区域 */
.notes-section {
  margin-bottom: 24px;
}

.notes-content {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  
  text {
    color: #666;
    line-height: 1.6;
    font-size: 14px;
  }
}

/* 底部操作区 */
.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  padding: 16px 20px calc(env(safe-area-inset-bottom) + 16px);
  display: flex;
  gap: 12px;
  z-index: 100;
  opacity: 0;
  transform: translateY(100%);
  transition: all 0.4s ease;
}

.bottom-actions.animate-in {
  opacity: 1;
  transform: translateY(0);
  transition-delay: 0.6s;
}


.edit-outfit-btn {
  flex: 1;
  height: 50px;
  border-radius: 25px;
  background: linear-gradient(135deg, #4776E6, #8E54E9);
  color: white;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(71, 118, 230, 0.25);
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
  
  &:active {
    transform: scale(0.98);
    box-shadow: 0 2px 8px rgba(71, 118, 230, 0.2);
  }
  
  &.single-button {
    width: 100%;
    flex: none;
  }
}

/* 响应式优化 */
@media (max-width: 480px) {
  .mobile-header {
    padding: 12px 16px 6px;
  }
  
  .header-title {
    font-size: 18px;
  }
  
  .content-box {
    padding: 16px;
    padding-bottom: 90px;
  }
  
  .outfit-info-card {
    padding: 16px;
  }
  
  .outfit-name {
    font-size: 20px;
  }
  
  .preview-container {
    height: 240px;
  }
  
  .items-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  
  .item-image-container {
    height: 100px;
  }
}

@media (max-width: 360px) {
  .content-box {
    padding: 12px;
    padding-bottom: 80px;
  }
  
  .bottom-actions {
    padding: 12px 16px calc(env(safe-area-inset-bottom) + 12px);
    flex-direction: column;
    gap: 8px;
  }
  
  .edit-outfit-btn {
    height: 44px;
  }
}
</style>
