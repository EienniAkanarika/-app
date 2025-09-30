<template>
  <view class="about-container">
    <view class="bg-decoration">
      <view class="bg-circle bg-circle-1"></view>
      <view class="bg-circle bg-circle-2"></view>
    </view>

    <view class="header">
      <view class="back-btn" @tap="goBack">
        <uni-icons type="left" size="20" color="#333"></uni-icons>
      </view>
      <text class="header-title">关于我们</text>
      <view class="placeholder"></view>
    </view>

    <view class="content-box" :class="{ 'animate-in': animateContent }">
      <!-- Logo 区域 -->
      <view class="logo-section">
        <view class="logo-container">
          <image class="logo-image" :src="logoSource" mode="aspectFit" @error="onLogoError"></image>
        </view>
        <text class="app-name">黄衣依</text>
        <text class="app-subtitle">专属女性的电子衣橱</text>
      </view>

      <!-- 介绍内容 -->
      <view class="intro-section">
        <view class="intro-card">
          <text class="intro-text">
            「黄衣依」是一个专为女性设计的电子衣橱管理平台，让你轻松整理衣物、规划穿搭，同时珍藏每一件衣服背后的回忆。
          </text>
          
          <text class="intro-text">
            在这里，衣物不仅是搭配的元素，更是生活的陪伴。
          </text>
          
          <text class="intro-text">
            "衣依"谐音"依依"，寓意衣物与人的温柔羁绊。而"黄"既是创始人的心意，也像一抹暖阳，为你的日常穿搭注入温度。
          </text>
        </view>
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
    logoSource.value = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"%3E%3Crect width="80" height="80" rx="16" fill="%23FFEB3B"/%3E%3Ctext x="40" y="45" text-anchor="middle" fill="%23333" font-size="18" font-weight="bold"%3E黄%3C/text%3E%3C/svg%3E'
  }
}

// 返回上一页
const goBack = () => {
  uni.navigateBack()
}

// 页面初始化
onMounted(() => {
  // 启动动画
  setTimeout(() => {
    animateContent.value = true
  }, 100)
})
</script>

<style lang="scss">
page {
  background-color: #f9faff;
}

.about-container {
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
  background: linear-gradient(145deg, rgba(255, 235, 59, 0.1), rgba(76, 132, 255, 0.15));
  filter: blur(20px);
}

.bg-circle-1 {
  width: 300px;
  height: 300px;
  top: -150px;
  right: -50px;
  animation: float1 20s ease-in-out infinite;
}

.bg-circle-2 {
  width: 200px;
  height: 200px;
  bottom: 30%;
  left: -100px;
  animation: float2 25s ease-in-out infinite;
}

@keyframes float1 {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(30px, 20px); }
}

@keyframes float2 {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(20px, -30px); }
}

.header {
  padding: 24px 30px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 10;
}

.back-btn {
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.header-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  text-align: center;
  flex: 1;
}

.placeholder {
  width: 40px;
}

.content-box {
  flex: 1;
  padding: 0 30px 30px;
  position: relative;
  z-index: 10;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.content-box.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.logo-section {
  text-align: center;
  margin-bottom: 40px;
}

.logo-container {
  width: 100px;
  height: 100px;
  margin: 0 auto 20px;
  border-radius: 25px;
  background: linear-gradient(145deg, #FFEB3B, #FFC107);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 25px rgba(255, 193, 7, 0.3);
  overflow: hidden;
}

.logo-image {
  width: 80px;
  height: 80px;
  object-fit: contain;
}

.app-name {
  display: block;
  font-size: 32px;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #FFEB3B, #FF9800);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.app-subtitle {
  display: block;
  font-size: 16px;
  color: #666;
  opacity: 0.8;
}

.intro-section {
  margin-bottom: 40px;
}

.intro-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.intro-text {
  display: block;
  font-size: 16px;
  line-height: 1.8;
  color: #444;
  margin-bottom: 20px;
  text-align: justify;
}

.intro-text:last-child {
  margin-bottom: 0;
}


</style>