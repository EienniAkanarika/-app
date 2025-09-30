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
            v-if="outfitData.previewImage" 
            class="preview-image" 
            :src="outfitData.previewImage" 
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
      <button class="share-btn" @tap="shareOutfit">
        <svg viewBox="0 0 24 24" class="share-icon">
          <path d="M18,16.08C17.24,16.08 16.56,16.38 16.04,16.85L8.91,12.7C8.96,12.47 9,12.24 9,12C9,11.76 8.96,11.53 8.91,11.3L15.96,7.19C16.5,7.69 17.21,8 18,8A3,3 0 0,0 21,5A3,3 0 0,0 18,2A3,3 0 0,0 15,5C15,5.24 15.04,5.47 15.09,5.7L8.04,9.81C7.5,9.31 6.79,9 6,9A3,3 0 0,0 3,12A3,3 0 0,0 6,15C6.79,15 7.5,14.69 8.04,14.19L15.16,18.34C15.11,18.55 15.08,18.77 15.08,19C15.08,20.61 16.39,21.91 18,21.91C19.61,21.91 20.92,20.61 20.92,19A2.92,2.92 0 0,0 18,16.08Z"/>
        </svg>
        分享
      </button>
      <button class="edit-outfit-btn" @tap="editOutfit">
        编辑穿搭
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import * as outfitApi from '@/api/outfit.js'

// 动画控制
const animateUI = ref(false)

// 从路由参数获取穿搭ID
const route = getCurrentInstance().proxy.$route
const outfitId = route.query.id

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
  shoes: '鞋子'
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
    const result = await outfitApi.getDetail(outfitId)
    if (result.success && result.data) {
      outfitData.value = result.data
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

// 处理预览图错误
const handlePreviewError = () => {
  console.error('穿搭预览图加载失败')
}

// 处理衣物图片错误
const handleItemImageError = (item) => {
  console.error(`衣物图片加载失败: ${item.name}`)
  // 使用颜色块作为降级显示
  const color = item.color || '#cccccc'
  item.image = `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23${color.replace('#', '')}" /%3E%3C/svg%3E`
}

// 查看衣物详情
const viewItem = (item) => {
  uni.previewImage({
    urls: [item.image],
    current: 0
  })
}

// 分享穿搭
const shareOutfit = () => {
  uni.showActionSheet({
    itemList: ['保存到相册', '分享给朋友'],
    success: (res) => {
      if (res.tapIndex === 0) {
        saveToAlbum()
      } else if (res.tapIndex === 1) {
        shareToFriend()
      }
    }
  })
}

// 保存到相册
const saveToAlbum = () => {
  if (outfitData.value.previewImage) {
    uni.saveImageToPhotosAlbum({
      filePath: outfitData.value.previewImage,
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

// 分享给朋友
const shareToFriend = () => {
  uni.showToast({
    title: '分享功能开发中',
    icon: 'none'
  })
}

// 编辑穿搭
const editOutfit = () => {
  uni.navigateTo({
    url: `/pages/create-outfit/index?id=${outfitId}&mode=edit`
  })
}

// 返回
const goBack = () => {
  uni.navigateBack()
}

// 初始化
onMounted(async () => {
  if (!outfitId) {
    uni.showToast({
      title: '参数错误',
      icon: 'none'
    })
    setTimeout(() => {
      goBack()
    }, 1500)
    return
  }
  
  await loadOutfitData()
  
  // 启动动画
  setTimeout(() => {
    animateUI.value = true
  }, 100)
})
</script>

<style lang="scss">
@import '@/styles/mobile-design-system.scss';

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

.share-btn {
  height: 50px;
  padding: 0 20px;
  border-radius: 25px;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  color: #666;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:active {
    background: #e9ecef;
    transform: scale(0.98);
  }
}

.share-icon {
  width: 18px;
  height: 18px;
  fill: #666;
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
  
  .share-btn, .edit-outfit-btn {
    height: 44px;
  }
}
</style>
