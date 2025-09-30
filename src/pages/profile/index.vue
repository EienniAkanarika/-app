<template>
  <view class="profile-container">
    <view class="bg-decoration">
      <view class="bg-circle bg-circle-1"></view>
      <view class="bg-circle bg-circle-2"></view>
    </view>

    <view class="header">
      <view class="logo-area">
        <image class="logo-image" :src="logoSource" mode="aspectFit" @error="onLogoError"></image>
      </view>
      <text class="header-title">个人信息</text>
      <view class="action-btns">
        <!-- 退出按钮已移至功能菜单 -->
      </view>
    </view>

    <view class="content-box" :class="{ 'animate-in': animateUI }">
      <!-- 用户头像和基本信息 -->
      <view class="profile-card">
        <view class="avatar-section">
          <view class="avatar-container">
            <image class="avatar" :src="defaultAvatar" mode="aspectFill"></image>
            <view class="avatar-badge">
              <uni-icons type="checkmarkempty" size="16" color="#fff"></uni-icons>
            </view>
          </view>
          <view class="user-info">
            <text class="username">{{ userInfo.username || '衣橱管理员' }}</text>
            <text class="user-subtitle">欢迎使用电子衣橱</text>
          </view>
        </view>
      </view>

      <!-- 统计信息 -->
      <view class="stats-section">
        <view class="stat-card" @tap="goToWardrobePage">
          <view class="stat-item">
            <view class="stat-icon clothes-icon">
              <uni-icons type="shop" size="24" color="#4776E6"></uni-icons>
            </view>
            <view class="stat-content">
              <text class="stat-number">{{ statsLoading ? '--' : totalClothes }}</text>
              <text class="stat-label">我的衣物</text>
            </view>
          </view>
        </view>
        
        <view class="stat-card" @tap="goToOutfitPage">
          <view class="stat-item">
            <view class="stat-icon outfits-icon">
              <uni-icons type="star-filled" size="24" color="#8E54E9"></uni-icons>
            </view>
            <view class="stat-content">
              <text class="stat-number">{{ statsLoading ? '--' : totalOutfits }}</text>
              <text class="stat-label">穿搭方案</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 功能菜单 -->
      <view class="menu-section">
        <view class="menu-item" @tap="goToAbout">
          <view class="menu-icon">
            <uni-icons type="info" size="20" color="#666"></uni-icons>
          </view>
          <text class="menu-text">关于我们</text>
          <view class="menu-arrow">
            <uni-icons type="right" size="16" color="#ccc"></uni-icons>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 使用统一的底部导航组件 -->
    <BottomNavigation :currentPath="'/pages/profile/index'" />
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
// 移除登录相关引用
import { clothesApi } from '@/api'
import * as outfitApi from '@/api/outfit.js'
import { onShow } from '@dcloudio/uni-app'
import BottomNavigation from '@/components/BottomNavigation.vue'

// 动画控制
const animateUI = ref(false)

// 用户信息
const userInfo = ref({})

// 默认头像
const defaultAvatar = ref('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="50" fill="%23e8f4f8"/%3E%3Ccircle cx="50" cy="40" r="15" fill="%234776E6"/%3E%3Cpath d="M25 80 Q25 65 50 65 Q75 65 75 80 Z" fill="%234776E6"/%3E%3C/svg%3E')

// Logo处理
let logoSrc
try {
  logoSrc = require('@/static/logo.png')
} catch (e) {
  logoSrc = '/static/logo.png'
}
const logoSource = ref(logoSrc)

const onLogoError = () => {
  if (logoSource.value.includes('require')) {
    logoSource.value = '/static/logo.png'
  } else {
    logoSource.value = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"%3E%3Crect width="60" height="60" rx="12" fill="%234776E6"/%3E%3Ctext x="30" y="35" text-anchor="middle" fill="white" font-size="16" font-weight="bold"%3ELOGO%3C/text%3E%3C/svg%3E'
  }
}

// 统计数据
const totalClothes = ref(0)
const totalOutfits = ref(0)
const statsLoading = ref(false)

// 页面初始化
onMounted(() => {
  // 获取用户信息
  loadUserInfo()
  
  // 加载统计数据
  loadStats()
  
  // 启动动画
  setTimeout(() => {
    animateUI.value = true
  }, 100)
})

onShow(() => {
  // 每次显示页面时刷新数据
  console.log('个人信息页面显示，刷新统计数据')
  loadUserInfo()
  
  // 添加延时确保从其他页面返回后能获取到最新数据
  setTimeout(() => {
    loadStats()
  }, 200)
})

// 加载用户信息
const loadUserInfo = () => {
  // 设置更好的默认用户信息
  userInfo.value = {
    username: '衣橱管理员',
    userId: 'wardrobe-user',
    avatar: defaultAvatar.value
  }
  console.log('用户信息已加载:', userInfo.value)
}

// 加载统计数据
const loadStats = async () => {
  if (statsLoading.value) return // 防止重复加载
  
  statsLoading.value = true
  try {
    console.log('开始加载统计数据...')
    
    // 初始化默认值
    totalClothes.value = 0
    totalOutfits.value = 0
    
    // 获取衣物总数 - 与衣橱页面保持一致的逻辑
    try {
      const clothesResponse = await clothesApi.getList({})
      console.log('衣物API响应:', clothesResponse)
      
      if (clothesResponse && clothesResponse.code === 200 && clothesResponse.data) {
        let clothesCount = 0
        const apiData = clothesResponse.data
        
        // 处理 { total, list } 格式的数据
        if (apiData.list && Array.isArray(apiData.list)) {
          clothesCount = apiData.list.length
          console.log(`从list字段获取衣物数量: ${clothesCount}`)
        }
        // 如果data本身是对象，统计所有分类的衣物总数
        else if (typeof apiData === 'object' && !Array.isArray(apiData) && !apiData.list) {
          Object.keys(apiData).forEach(category => {
            if (Array.isArray(apiData[category])) {
              clothesCount += apiData[category].length
              console.log(`分类 ${category} 衣物数量: ${apiData[category].length}`)
            }
          })
          console.log(`从分类对象获取衣物总数: ${clothesCount}`)
        }
        // 如果data是数组
        else if (Array.isArray(apiData)) {
          clothesCount = apiData.length
          console.log(`从数组获取衣物数量: ${clothesCount}`)
        }
        
        totalClothes.value = clothesCount
        console.log(`最终衣物统计数量: ${totalClothes.value}`)
      } else {
        console.warn('衣物API响应格式异常:', clothesResponse)
        totalClothes.value = 0
      }
    } catch (clothesError) {
      console.error('获取衣物数据失败:', clothesError)
      totalClothes.value = 0
      
      // 显示用户友好的错误信息
      uni.showToast({
        title: '无法获取衣物数据',
        icon: 'none',
        duration: 2000
      })
    }

    // 获取穿搭方案总数 - 与穿搭页面保持一致的逻辑
    try {
      const outfitsResponse = await outfitApi.getList({})
      console.log('穿搭API响应:', outfitsResponse)
      
      if (outfitsResponse && outfitsResponse.code === 200) {
        let outfitsCount = 0
        
        // 处理多种可能的数据格式
        if (Array.isArray(outfitsResponse.data)) {
          outfitsCount = outfitsResponse.data.length
          console.log(`从直接数组获取穿搭数量: ${outfitsCount}`)
        } else if (outfitsResponse.data && outfitsResponse.data.list && Array.isArray(outfitsResponse.data.list)) {
          outfitsCount = outfitsResponse.data.list.length
          console.log(`从list字段获取穿搭数量: ${outfitsCount}`)
        } else if (outfitsResponse.data && typeof outfitsResponse.data === 'object') {
          // 尝试从对象中找到数组
          for (const key in outfitsResponse.data) {
            if (Array.isArray(outfitsResponse.data[key])) {
              outfitsCount = outfitsResponse.data[key].length
              console.log(`从${key}字段获取穿搭数量: ${outfitsCount}`)
              break
            }
          }
        } else if (outfitsResponse.data && outfitsResponse.data.outfits && Array.isArray(outfitsResponse.data.outfits)) {
          outfitsCount = outfitsResponse.data.outfits.length
          console.log(`从outfits字段获取穿搭数量: ${outfitsCount}`)
        } else if (outfitsResponse.data === null || outfitsResponse.data === undefined) {
          outfitsCount = 0
          console.log('穿搭数据为空')
        }
        
        totalOutfits.value = outfitsCount
        console.log(`最终穿搭统计数量: ${totalOutfits.value}`)
      } else {
        console.warn('穿搭API响应格式异常:', outfitsResponse)
        totalOutfits.value = 0
      }
    } catch (outfitsError) {
      console.error('获取穿搭数据失败:', outfitsError)
      totalOutfits.value = 0
      
      // 显示用户友好的错误信息
      uni.showToast({
        title: '无法获取穿搭数据',
        icon: 'none',
        duration: 2000
      })
    }
    
    console.log(`统计数据加载完成 - 衣物: ${totalClothes.value}, 穿搭: ${totalOutfits.value}`)
    
    // 显示成功加载的信息
    if (totalClothes.value > 0 || totalOutfits.value > 0) {
      console.log('✨ 统计数据加载成功!')
    }
  } catch (error) {
    console.error('统计数据加载失败:', error)
    totalClothes.value = 0
    totalOutfits.value = 0
    
    // 显示用户友好的错误信息
    uni.showToast({
      title: '统计数据加载失败',
      icon: 'none',
      duration: 2000
    })
  } finally {
    statsLoading.value = false
  }
}

// 页面跳转方法
const goToWardrobePage = () => {
  uni.navigateTo({
    url: '/pages/index/index'
  })
}

const goToOutfitPage = () => {
  uni.navigateTo({
    url: '/pages/outfit/index'
  })
}

const goToAbout = () => {
  uni.navigateTo({
    url: '/pages/about/index'
  })
}

// 删除退出登录功能

// 刷新数据
const refreshData = () => {
  console.log('🔄 手动刷新数据')
  loadUserInfo()
  loadStats()
  
  uni.showToast({
    title: '数据已刷新',
    icon: 'success',
    duration: 1500
  })
}
</script>

<style lang="scss">
page {
  background-color: #f9faff;
}

.profile-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
  padding-bottom: 80px; /* 为统一的底部导航留空间 */
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
  background: linear-gradient(145deg, rgba(76, 132, 255, 0.1), rgba(142, 84, 233, 0.2));
  filter: blur(20px);
}

.bg-circle-1 {
  width: 350px;
  height: 350px;
  top: -180px;
  right: -80px;
  animation: float1 18s ease-in-out infinite;
}

.bg-circle-2 {
  width: 250px;
  height: 250px;
  bottom: 20%;
  left: -120px;
  animation: float2 22s ease-in-out infinite;
}

@keyframes float1 {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(40px, 30px); }
}

@keyframes float2 {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(30px, -40px); }
}

.header {
  padding: 24px 30px 30px;
  display: flex;
  align-items: center;
  z-index: 1;
  position: relative;
}

.logo-area {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 18px;
  box-shadow: 0 5px 15px rgba(76, 132, 255, 0.15);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  /* 正方形容器，适配新logo比例: 717/689 ≈ 1:1 */
  overflow: hidden;
}

.logo-area:active {
  transform: scale(0.95);
  box-shadow: 0 3px 10px rgba(76, 132, 255, 0.15);
}

.logo-image {
  width: 100%;
  height: 100%;
  /* 完全填充容器，不露出底色 */
  object-fit: contain;
}

.header-title {
  font-size: 26px;
  font-weight: 700;
  color: #333;
  background: linear-gradient(90deg, #4776E6, #8E54E9);
  -webkit-background-clip: text;
  color: transparent;
  flex: 1;
  letter-spacing: 0.5px;
  text-shadow: 0 2px 10px rgba(76, 132, 255, 0.1);
}

.action-btns {
  display: flex;
  align-items: center;
  gap: 15px;
}

/* 个人信息页面样式 */
.content-box {
  flex: 1;
  padding: 20px 0;
  padding-bottom: 120px;
  z-index: 2;
  box-sizing: border-box;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s ease;
}

.content-box.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.profile-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24px;
  padding: 32px 28px;
  margin: 0 20px 24px;
  box-shadow: 0 12px 35px rgba(102, 126, 234, 0.25);
  position: relative;
  overflow: hidden;
}

.profile-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
  pointer-events: none;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 24px;
  position: relative;
  z-index: 1;
}

.avatar-container {
  position: relative;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 4px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.avatar-badge {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #4776E6, #8E54E9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.user-info {
  flex: 1;
}

.username {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 6px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.user-subtitle {
  display: block;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 400;
}

.stats-section {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  padding: 0 20px;
}

.stat-card {
  flex: 1;
  background: #ffffff;
  border-radius: 20px;
  padding: 24px 20px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
}

.stat-card:active {
  transform: translateY(-2px);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.1);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.clothes-icon {
  background: linear-gradient(135deg, rgba(71, 118, 230, 0.1), rgba(71, 118, 230, 0.2));
}

.outfits-icon {
  background: linear-gradient(135deg, rgba(142, 84, 233, 0.1), rgba(142, 84, 233, 0.2));
}

.stat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.stat-number {
  display: block;
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin-bottom: 2px;
  line-height: 1;
}

.stat-label {
  display: block;
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.menu-section {
  background: #ffffff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.8);
  margin: 0 20px 120px;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  position: relative;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:active {
  transform: scale(0.98);
  background-color: rgba(71, 118, 230, 0.05);
}

.menu-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(71, 118, 230, 0.1);
  border-radius: 12px;
  margin-right: 16px;
  transition: all 0.3s ease;
}

.menu-text {
  flex: 1;
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

.menu-arrow {
  opacity: 0.5;
  transition: all 0.3s ease;
}

.menu-item:active .menu-arrow {
  transform: translateX(2px);
}

/* 个人信息页面布局优化 - 为统一导航栏留空间 */
.profile-container {
  padding-bottom: 80px;
}
</style>