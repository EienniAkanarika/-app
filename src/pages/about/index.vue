<template>
  <view class="mobile-about-container">
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
        <text class="header-title">关于我们</text>
        <view class="header-placeholder"></view>
      </view>
    </view>

    <!-- 内容区域 -->
    <view class="content-box" :class="{ 'animate-in': animateContent }">
      <!-- Logo 区域 -->
      <view class="logo-section">
        <view class="logo-container">
          <image class="logo-image" :src="logoSource" mode="aspectFit" @error="onLogoError"></image>
        </view>
        <text class="app-name">小黄衣</text>
        <text class="app-subtitle">专属女性的电子衣橱</text>
        <text class="version-text">v1.0.0</text>
      </view>

      <!-- 功能介绍 -->
      <view class="features-section">
        <view class="section-title">
          <svg viewBox="0 0 24 24" class="title-icon">
            <path d="M12,2L13.09,8.26L22,9L13.09,9.74L12,16L10.91,9.74L2,9L10.91,8.26L12,2Z"/>
          </svg>
          <text>应用特色</text>
        </view>
        <view class="features-grid">
          <view class="feature-card">
            <view class="feature-icon">
              <svg viewBox="0 0 24 24">
                <path d="M12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,6.48 17.52,2 12,2M13,17H11V15H13V17M13,13H11V7H13V13Z"/>
              </svg>
            </view>
            <text class="feature-title">智能分类</text>
            <text class="feature-desc">自动整理衣物分类，让衣橱井然有序</text>
          </view>
          <view class="feature-card">
            <view class="feature-icon">
              <svg viewBox="0 0 24 24">
                <path d="M12,2A3,3 0 0,1 15,5V6.5C15,7.43 15.57,8.25 16.41,8.66L18.89,9.89C19.59,10.25 20,11 20,11.8V13.2C20,14 19.59,14.75 18.89,15.11L16.41,16.34C15.57,16.75 15,17.57 15,18.5V20A3,3 0 0,1 12,23A3,3 0 0,1 9,20V18.5C9,17.57 8.43,16.75 7.59,16.34L5.11,15.11C4.41,14.75 4,14 4,13.2V11.8C4,11 4.41,10.25 5.11,9.89L7.59,8.66C8.43,8.25 9,7.43 9,6.5V5A3,3 0 0,1 12,2Z"/>
              </svg>
            </view>
            <text class="feature-title">穿搭推荐</text>
            <text class="feature-desc">根据场景和季节，推荐最佳搭配方案</text>
          </view>
          <view class="feature-card">
            <view class="feature-icon">
              <svg viewBox="0 0 24 24">
                <path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z"/>
              </svg>
            </view>
            <text class="feature-title">收藏记忆</text>
            <text class="feature-desc">记录每件衣服的美好回忆和穿着场景</text>
          </view>
          <view class="feature-card">
            <view class="feature-icon">
              <svg viewBox="0 0 24 24">
                <path d="M18,16.08C17.24,16.08 16.56,16.38 16.04,16.85L8.91,12.7C8.96,12.47 9,12.24 9,12C9,11.76 8.96,11.53 8.91,11.3L15.96,7.19C16.5,7.69 17.21,8 18,8A3,3 0 0,0 21,5A3,3 0 0,0 18,2A3,3 0 0,0 15,5C15,5.24 15.04,5.47 15.09,5.7L8.04,9.81C7.5,9.31 6.79,9 6,9A3,3 0 0,0 3,12A3,3 0 0,0 6,15C6.79,15 7.5,14.69 8.04,14.19L15.16,18.34C15.11,18.55 15.08,18.77 15.08,19C15.08,20.61 16.39,21.91 18,21.91C19.61,21.91 20.92,20.61 20.92,19A2.92,2.92 0 0,0 18,16.08Z"/>
              </svg>
            </view>
            <text class="feature-title">社交分享</text>
            <text class="feature-desc">与好友分享穿搭心得，交流时尚灵感</text>
          </view>
        </view>
      </view>

      <!-- 程序理念 -->
      <view class="intro-section">
        <view class="section-title">
          <svg viewBox="0 0 24 24" class="title-icon">
            <path d="M12,2L13.09,8.26L22,9L13.09,9.74L12,16L10.91,9.74L2,9L10.91,8.26L12,2Z"/>
          </svg>
          <text>程序理念</text>
        </view>
        <view class="intro-card">
          <text class="intro-text">
            「小黄衣」是一个专为女性设计的电子衣橱管理平台，让你轻松整理衣物、规划穿搭，同时珍藏每一件衣服背后的回忆。
          </text>
          
          <text class="intro-text">
            在这里，衣物不仅是搭配的元素，更是生活的陪伴。
          </text>
          
          <text class="intro-text highlight">
            而"黄"像一抹暖阳，为你的日常穿搭注入温度。
          </text>
        </view>
      </view>


      <!-- 版权信息 -->
      <view class="copyright-section">
        <text class="copyright-text">© 2024 小黄衣. All rights reserved.</text>
        <text class="copyright-text">让每件衣服都有温度</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 动画控制
const animateContent = ref(false)

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
    logoSource.value = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"%3E%3Crect width="120" height="120" rx="20" fill="%234776E6"/%3E%3Ctext x="60" y="70" text-anchor="middle" fill="white" font-size="24" font-weight="bold"%3E小黄衣%3C/text%3E%3C/svg%3E'
  }
}

// 返回
const goBack = () => {
  uni.navigateBack()
}

// 初始化
onMounted(() => {
  // 启动动画
  setTimeout(() => {
    animateContent.value = true
  }, 200)
})
</script>

<style lang="scss">
@use '@/styles/mobile-design-system.scss';

page {
  background-color: #f8f9fa;
}

.mobile-about-container {
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

.back-btn {
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

.back-icon {
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

.header-placeholder {
  width: 40px;
  height: 40px;
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
  padding: 30px 20px;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.content-box.animate-in {
  opacity: 1;
  transform: translateY(0);
  transition-delay: 0.2s;
}

/* Logo 区域 */
.logo-section {
  text-align: center;
  margin-bottom: 40px;
  padding: 20px 0;
}

.logo-container {
  width: 100px;
  height: 100px;
  margin: 0 auto 20px;
  border-radius: 20px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(71, 118, 230, 0.15);
}

.logo-image {
  width: 80px;
  height: 80px;
}

.app-name {
  font-size: 32px;
  font-weight: 800;
  color: #333;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #4776E6, #8E54E9);
  -webkit-background-clip: text;
  color: transparent;
  display: block;
}

.app-subtitle {
  font-size: 16px;
  color: #666;
  margin-bottom: 8px;
  display: block;
}

.version-text {
  font-size: 12px;
  color: #999;
  background: #f8f9fa;
  padding: 4px 8px;
  border-radius: 8px;
  display: inline-block;
}

/* 章节标题 */
.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  
  .title-icon {
    width: 20px;
    height: 20px;
    fill: #4776E6;
  }
  
  text {
    font-size: 18px;
    font-weight: 700;
    color: #333;
  }
}

/* 功能特色 */
.features-section {
  margin-bottom: 32px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 16px;
  align-items: stretch;
}

.feature-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 140px;
  
  &:active {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }
}

.feature-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 12px;
  border-radius: 12px;
  background: linear-gradient(135deg, #4776E6, #8E54E9);
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 24px;
    height: 24px;
    fill: white;
  }
}

.feature-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  display: block;
}

.feature-desc {
  font-size: 12px;
  color: #666;
  line-height: 1.4;
  display: block;
}

/* 品牌理念 */
.intro-section {
  margin-bottom: 32px;
}

.intro-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.intro-text {
  font-size: 15px;
  color: #555;
  line-height: 1.8;
  margin-bottom: 16px;
  display: block;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  &.highlight {
    background: linear-gradient(135deg, #4776E6, #8E54E9);
    -webkit-background-clip: text;
    color: transparent;
    font-weight: 600;
  }
}


/* 版权信息 */
.copyright-section {
  text-align: center;
  padding: 20px 0;
  border-top: 1px solid #f0f0f0;
}

.copyright-text {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
  display: block;
  
  &:last-child {
    margin-bottom: 0;
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
    padding: 24px 16px;
  }
  
  .logo-section {
    margin-bottom: 32px;
    padding: 16px 0;
  }
  
  .logo-container {
    width: 80px;
    height: 80px;
  }
  
  .logo-image {
    width: 60px;
    height: 60px;
  }
  
  .app-name {
    font-size: 28px;
  }
  
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(2, 1fr);
    gap: 12px;
  }
  
  .feature-card {
    padding: 16px;
    min-height: 120px;
  }
  
  .intro-card, .contact-card {
    padding: 20px;
  }
}

@media (max-width: 360px) {
  .content-box {
    padding: 20px 12px;
  }
  
  .logo-section {
    margin-bottom: 24px;
  }
  
  .section-title {
    margin-bottom: 16px;
  }
  
  .features-section, .intro-section, .contact-section {
    margin-bottom: 24px;
  }
  
  .features-grid {
    gap: 10px;
  }
  
  .feature-card {
    padding: 14px;
    min-height: 110px;
  }
  
  .feature-icon {
    width: 40px;
    height: 40px;
    margin-bottom: 10px;
    
    svg {
      width: 20px;
      height: 20px;
    }
  }
  
  .feature-title {
    font-size: 14px;
    margin-bottom: 6px;
  }
  
  .feature-desc {
    font-size: 11px;
  }
}
</style>
