<template>
  <view class="outfit-detail-container">
    <view class="bg-decoration">
      <view class="bg-circle bg-circle-1"></view>
      <view class="bg-circle bg-circle-2"></view>
    </view>
    
    <!-- 顶部导航 -->
    <view class="header">
      <view class="back-btn" @tap="goBack">
        <uni-icons type="arrow-left" size="22" color="#333"></uni-icons>
      </view>
      <text class="header-title">穿搭详情</text>
      <view class="edit-btn" @tap="editOutfit">
        <uni-icons type="compose" size="20" color="#4776E6"></uni-icons>
      </view>
    </view>
    
    <!-- 内容区域 -->
    <view class="content-box">
      <!-- 穿搭效果预览 -->
      <view class="preview-section card-shadow" :class="{ 'animate-in': animateUI }">
        <view class="outfit-info">
          <text class="outfit-name">{{ outfitData.name }}</text>
          <view class="outfit-meta">
            <view class="meta-item">
              <uni-icons type="calendar" size="14" color="#999"></uni-icons>
              <text>{{ outfitData.date || '未设置日期' }}</text>
            </view>
            <view class="meta-badge" :class="'season-' + outfitData.season">
              {{ seasonLabels[outfitData.season] }}季
            </view>
            <view class="meta-badge scene-badge">
              {{ getSceneLabel(outfitData.scene) }}
            </view>
          </view>
        </view>
        
        <view class="preview-container">
          <image 
            v-if="outfitData.image" 
            class="preview-image" 
            :src="processImageUrl(outfitData.image)" 
            mode="aspectFill"
          ></image>
          <view v-else class="empty-preview">
            <text class="empty-preview-text">穿搭预览</text>
            <text class="empty-preview-subtext">您的个性风格展示</text>
          </view>
        </view>
      </view>
      
      <!-- 喜爱程度独立卡片区域 -->
      <view class="rating-section card-shadow" :class="{ 'animate-in': animateUI }">
        <view class="section-title">喜爱程度</view>
        <view class="rating-container">
          <view v-for="i in 5" :key="i" class="rating-star">
            <uni-icons 
              :type="formatRating(outfitData.rating) >= i ? 'star-filled' : 'star'" 
              size="28" 
              :color="formatRating(outfitData.rating) >= i ? '#FF9800' : '#E0E0E0'"
            ></uni-icons>
          </view>
        </view>
        <text class="rating-value">{{ formatRating(outfitData.rating) }}/5 星</text>
      </view>
      
      <!-- 穿搭衣物列表 -->
      <view class="items-section card-shadow" :class="{ 'animate-in': animateUI }">
        <view class="section-title">
          <text>搭配衣物</text>
          <text class="item-count">{{ outfitData.items ? outfitData.items.length : 0 }}件</text>
        </view>
        
        <view v-if="outfitData.items && outfitData.items.length > 0" class="items-list">
          <view 
            v-for="(item, index) in outfitData.items" 
            :key="index"
            class="item-card"
          >
            <view class="item-card-inner">
              <view class="item-img-container">
                <image :src="processImageUrl(item.image) || defaultImage" mode="aspectFill"></image>
                <view class="item-category">{{ getCategoryLabel(item.category) }}</view>
              </view>
              <text class="item-name">{{ item.name }}</text>
            </view>
          </view>
        </view>
        
        <view v-else class="empty-items">
          <text class="empty-items-text">暂无衣物</text>
        </view>
      </view>
      
      <!-- 穿搭笔记 -->
      <view v-if="outfitData.notes" class="notes-section card-shadow" :class="{ 'animate-in': animateUI }">
        <view class="section-title">穿搭笔记</view>
        <view class="notes-content">
          {{ outfitData.notes }}
        </view>
      </view>
    </view>
    
    <!-- 底部操作区 -->
    <view class="bottom-btns" :class="{ 'animate-in': animateUI }">
      <view class="share-btn" @tap="shareOutfit">
        <uni-icons type="redo" size="16" color="#666"></uni-icons>
        <text>分享穿搭</text>
      </view>
      <view class="edit-outfit-btn" @tap="editOutfit">编辑穿搭</view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { BASE_URL } from '@/utils/request.js'

// 动画控制
const animateUI = ref(false)

// 季节标签文本
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

// 类别标签
const categoryLabels = {
  hat: '帽子',
  shirt: 'T恤',
  coat: '外套',
  skirt: '裙子',
  bottom: '裤子',
  suit: '西装',
  shoes: '鞋子',
  accessory: '配饰'
}

// 默认图片
const defaultImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23f0f0f0" /%3E%3Cpath d="M65,45 L50,30 L35,45 L35,70 L65,70 Z" stroke="%23ddd" stroke-width="2" fill="%23eee" /%3E%3Ccircle cx="50" cy="30" r="10" fill="%23eee" stroke="%23ddd" stroke-width="2" /%3E%3C/svg%3E'

// 穿搭数据
const outfitData = ref({})

// 获取场景标签
const getSceneLabel = (sceneValue) => {
  return sceneLabels[sceneValue] || '未知场景'
}

// 获取类别标签
const getCategoryLabel = (categoryValue) => {
  return categoryLabels[categoryValue] || '其他'
}

// 格式化rating值
const formatRating = (rating) => {
  if (rating === undefined || rating === null) {
    return 0;
  }
  const ratingNum = Number(rating);
  return !isNaN(ratingNum) ? ratingNum : 0;
}

// 返回上一页
const goBack = () => {
  uni.navigateBack()
}

// 编辑穿搭
const editOutfit = () => {
  // 序列化穿搭数据
  const outfitId = outfitData.value._id || outfitData.value.id;
  
  // 跳转到编辑页面
  uni.navigateTo({
    url: `/pages/create-outfit/index?edit=true&id=${outfitId}`
  })
}

// 分享穿搭
const shareOutfit = () => {
  // 显示分享菜单
  uni.showActionSheet({
    itemList: ['分享到朋友圈', '发送给朋友', '保存图片'],
    success: (res) => {
      uni.showToast({
        title: '分享功能开发中',
        icon: 'none'
      })
    }
  })
}

// 处理图片URL，对服务器图片路径进行修正
const processImageUrl = (imageUrl) => {
  // 如果没有图片URL，返回null
  if (!imageUrl) {
    return null;
  }
  
  // 如果已经是data URI，直接返回
  if (imageUrl.startsWith('data:')) {
    return imageUrl;
  }
  
  // 如果已经是完整URL，直接返回
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // 其他情况下，检查是否需要添加基础URL
  // 如果路径以/开头，很可能是相对服务器根目录的路径
  if (imageUrl.startsWith('/')) {
    // 将服务器相对路径转换为完整URL
    return `${BASE_URL}${imageUrl}`;
  }
  
  // 如果只是普通的相对路径，添加前缀
  return `${BASE_URL}/${imageUrl}`;
}

onMounted(() => {
  // 确定当前运行平台，便于调试
  console.log('***** 穿搭详情页 *****')
  console.log('当前运行平台:')
  // #ifdef H5
  console.log('H5环境')
  // #endif
  // #ifdef MP-WEIXIN
  console.log('微信小程序环境')
  // #endif
  // #ifdef APP-PLUS
  console.log('APP环境')
  // #endif
  
  // 获取页面参数
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  
  // 输出调试信息，查看当前页面对象
  console.log('当前页面对象:', currentPage)
  
  // 增强获取参数方式，兼容不同环境
  let options = {}
  
  // 微信小程序中，使用options或query获取参数
  if (currentPage.options) {
    options = currentPage.options
    console.log('通过options获取参数:', options)
  } else if (currentPage.$page && currentPage.$page.options) {
    options = currentPage.$page.options
    console.log('通过$page.options获取参数:', options)
  } else if (currentPage.query) {
    options = currentPage.query
    console.log('通过query获取参数:', options)
  } else if (currentPage.$vm && currentPage.$vm.$mp && currentPage.$vm.$mp.query) {
    options = currentPage.$vm.$mp.query
    console.log('通过$vm.$mp.query获取参数:', options)
  }
  
  console.log('最终使用的页面参数:', options)
  
  // 检查是否使用全局数据 - 微信小程序优先
  if (options.id && (options.useGlobalData === 'true' || options.useGlobalData === true)) {
    console.log('检测到useGlobalData参数，将从全局对象获取数据')
    try {
      // 从全局对象获取数据
      if (typeof getApp === 'function') {
        const app = getApp()
        if (app.globalData && app.globalData.tempOutfitData) {
          outfitData.value = app.globalData.tempOutfitData
          console.log('成功从全局对象获取穿搭数据:', outfitData.value.id || outfitData.value._id)
          
          // 使用后清除临时数据
          setTimeout(() => {
            app.globalData.tempOutfitData = null
            console.log('已清除全局临时数据')
          }, 1000)
          
          // 检查rating字段
          if (outfitData.value.rating === undefined || outfitData.value.rating === null) {
            outfitData.value.rating = 3
          } else {
            outfitData.value.rating = Number(outfitData.value.rating)
          }
          
          // 页面加载动画
          setTimeout(() => {
            animateUI.value = true
          }, 100)
          
          return // 成功获取数据后直接返回
        } else {
          console.warn('全局对象中未找到tempOutfitData')
        }
      }
    } catch (err) {
      console.error('从全局对象获取数据失败:', err)
    }
  }
  
  // 如果有ID但没有完整数据，则从API获取
  if (options.id) {
    console.log('通过ID获取穿搭数据:', options.id)
    uni.showLoading({
      title: '加载数据...',
      mask: true
    })
    
    // 导入API模块
    import('@/api/outfit').then(api => {
      api.getDetail(options.id)
        .then(res => {
          uni.hideLoading()
          console.log('API返回结果:', JSON.stringify(res))
          
          // 检查API返回数据完整性
          if (res && res.code === 200 && res.data) {
            outfitData.value = res.data
            console.log('通过API成功获取穿搭数据:', outfitData.value.name)
            
            // 检查必要字段是否存在
            if (!outfitData.value.name) {
              outfitData.value.name = '未命名穿搭'
            }
            
            // 确保rating是数字类型
            if (outfitData.value.rating === undefined || outfitData.value.rating === null) {
              outfitData.value.rating = 3
            } else {
              outfitData.value.rating = Number(outfitData.value.rating)
            }
            
            // 确保items是数组
            if (!Array.isArray(outfitData.value.items)) {
              outfitData.value.items = []
            }
          } else {
            // 处理API响应但数据异常的情况
            throw new Error(res?.message || '获取数据失败')
          }
          
          // 页面加载动画
          setTimeout(() => {
            animateUI.value = true
          }, 100)
        })
        .catch(err => {
          uni.hideLoading()
          console.error('获取穿搭数据出错:', err)
          uni.showToast({
            title: err.message || '获取数据失败',
            icon: 'none',
            duration: 2000
          })
          
          // 显示一些默认数据，让用户有更好的体验
          outfitData.value = {
            name: '穿搭数据加载失败',
            season: 'spring',
            scene: 'daily',
            rating: 3,
            items: [],
            notes: '抱歉，无法获取此穿搭方案的详细数据。请返回列表页重试或选择其他穿搭方案。'
          }
          
          // 即使是错误状态，也显示动画
          setTimeout(() => {
            animateUI.value = true
          }, 100)
        })
    })
  } else {
    uni.showToast({
      title: '未找到穿搭数据',
      icon: 'none'
    })
    
    // 页面加载动画
    setTimeout(() => {
      animateUI.value = true
    }, 100)
  }
})
</script>

<style lang="scss">
page {
  background-color: #f9faff;
}

.outfit-detail-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
}

.bg-decoration {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(145deg, rgba(76, 132, 255, 0.08), rgba(142, 84, 233, 0.12));
  filter: blur(20px);
}

.bg-circle-1 {
  width: 300px;
  height: 300px;
  top: -150px;
  right: -50px;
}

.bg-circle-2 {
  width: 200px;
  height: 200px;
  bottom: 20%;
  left: -100px;
}

.header {
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 1;
}

.back-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background-color: rgba(255, 255, 255, 0.8);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.header-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.edit-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background-color: rgba(255, 255, 255, 0.8);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.content-box {
  flex: 1;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(15px);
  border-top-left-radius: 32px;
  border-top-right-radius: 32px;
  box-shadow: 0 -5px 30px rgba(76, 132, 255, 0.12);
  z-index: 2;
  display: flex;
  flex-direction: column;
  padding: 25px 20px 20px;
  margin-bottom: 80px;
}

.card-shadow {
  background-color: #fff;
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.03), 0 1px 5px rgba(0, 0, 0, 0.02);
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s ease;
}

.card-shadow.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.preview-section.animate-in {
  transition-delay: 0.1s;
}

.rating-section.animate-in {
  opacity: 1;
  transform: translateY(0);
  transition-delay: 0.2s;
}

.items-section.animate-in {
  transition-delay: 0.3s;
}

.notes-section.animate-in {
  transition-delay: 0.4s;
}

.section-title {
  font-size: 17px;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.item-count {
  font-size: 14px;
  color: #888;
  font-weight: normal;
}

.outfit-info {
  margin-bottom: 15px;
}

.outfit-name {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
  display: block;
}

.outfit-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.meta-item {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #888;
}

.meta-item text {
  margin-left: 4px;
}

.meta-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  color: #fff;
  font-weight: 500;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.season-spring {
  background-color: #4CAF50;
}

.season-summer {
  background-color: #FF9800;
}

.season-autumn {
  background-color: #795548;
}

.season-winter {
  background-color: #2196F3;
}

.scene-badge {
  background: linear-gradient(90deg, #4776E6, #8E54E9);
}

.preview-container {
  width: 100%;
  height: 300px;
  border-radius: 15px;
  overflow: hidden;
  margin-top: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  background: linear-gradient(135deg, #f8f9fc, #eef1f8);
  background-position: center center;
  background-size: cover;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.empty-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.empty-preview-text {
  font-size: 26px;
  font-weight: 600;
  color: #4776E6;
  margin-bottom: 15px;
}

.empty-preview-subtext {
  font-size: 16px;
  color: #8a8a8a;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.items-list {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -8px;
}

.item-card {
  width: 33.333%;
  padding: 0 8px;
  margin-bottom: 16px;
  box-sizing: border-box;
}

.item-card-inner {
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(0, 0, 0, 0.02);
}

.item-img-container {
  width: 100%;
  height: 100px;
  position: relative;
}

.item-img-container image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-category {
  position: absolute;
  left: 6px;
  bottom: 6px;
  padding: 2px 8px;
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.6);
  color: #fff;
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
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f9f9f9, #f5f5f5);
  border-radius: 12px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.03);
}

.empty-items-text {
  font-size: 16px;
  font-weight: 500;
  color: #4776E6;
}

.notes-content {
  color: #666;
  line-height: 1.6;
  font-size: 14px;
}

.bottom-btns {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 15px 20px;
  display: flex;
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 10;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s ease;
}

.bottom-btns.animate-in {
  opacity: 1;
  transform: translateY(0);
  transition-delay: 0.4s;
}

.share-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
  padding: 0 20px;
  border-radius: 25px;
  border: 1px solid #eee;
  background-color: #fff;
  margin-right: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
}

.share-btn text {
  font-size: 14px;
  color: #666;
  margin-left: 6px;
}

.edit-outfit-btn {
  flex: 1;
  height: 50px;
  border-radius: 25px;
  background: linear-gradient(90deg, #4776E6, #8E54E9);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 5px 15px rgba(71, 118, 230, 0.25);
}

/* 喜爱程度样式 */
.rating-section {
  background-color: #fff;
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.03), 0 1px 5px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
}

.rating-container {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-top: 10px;
  margin-left: 10px;
}

.rating-star {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 3px;
  position: relative;
}

.rating-value {
  margin-top: 8px;
  margin-left: 15px;
  color: #666;
  font-size: 14px;
}
</style> 