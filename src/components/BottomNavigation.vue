<template>
  <view class="mobile-bottom-nav" :class="{ 'animate-in': show }">
    <view 
      v-for="(item, index) in navItems" 
      :key="item.path"
      class="nav-item" 
      :class="{ 'active': currentPath === item.path }"
      @tap="navigateTo(item.path)"
    >
      <view class="nav-icon-wrapper">
        <!-- 使用兼容的AppIcon组件 -->
        <AppIcon 
          :name="item.icon" 
          :size="24" 
          :color="currentPath === item.path ? '#4776E6' : '#999'"
        />
        
        <!-- 活跃状态指示器 -->
        <view v-if="currentPath === item.path" class="active-indicator"></view>
      </view>
      
      <text class="nav-label">{{ item.label }}</text>
      
      <!-- 角标通知 -->
      <view v-if="item.badge" class="nav-badge">
        <text class="badge-text">{{ item.badge }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import AppIcon from './AppIcon.vue'

// Props
const props = defineProps({
  currentPath: {
    type: String,
    default: '/pages/index/index'
  }
})

// 响应式数据
const show = ref(false)

// 导航项配置
const navItems = ref([
  {
    path: '/pages/index/index',
    icon: 'wardrobe',
    label: '衣橱',
    badge: null
  },
  {
    path: '/pages/outfit/index',
    icon: 'outfit',
    label: '穿搭',
    badge: null
  },
  {
    path: '/pages/profile/index',
    icon: 'profile',
    label: '我的',
    badge: null
  }
])

// 导航方法
const navigateTo = (path) => {
  if (path === props.currentPath) return
  
  // 直接使用 navigateTo，如果失败则用 reLaunch
  uni.navigateTo({
    url: path,
    fail: () => {
      // 对于主要页面，使用 reLaunch 确保导航成功
      uni.reLaunch({
        url: path
      })
    }
  })
}

// 生命周期
onMounted(() => {
  setTimeout(() => {
    show.value = true
  }, 100)
})

onShow(() => {
  show.value = true
})
</script>

<style lang="scss" scoped>
.mobile-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 68px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-top: 0.5px solid rgba(60, 60, 67, 0.12);
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 1000;
  transform: translateY(100%);
  opacity: 0;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  
  &.animate-in {
    transform: translateY(0);
    opacity: 1;
  }
}

.nav-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  min-width: 60px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:active {
    transform: scale(0.95);
  }
  
  &.active {
    .nav-icon-wrapper {
      .nav-icon {
        background: linear-gradient(135deg, #4776E6, #8E54E9);
        color: white;
        transform: scale(1.1);
        box-shadow: 0 4px 12px rgba(71, 118, 230, 0.3);
      }
    }
    
    .nav-label {
      color: #4776E6;
      font-weight: 600;
    }
  }
}

.nav-icon-wrapper {
  position: relative;
  margin-bottom: 4px;
}

.nav-icon {
  width: 32px;
  height: 32px;
  border-radius: 12px;
  background: rgba(120, 120, 128, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  .icon-svg {
    width: 18px;
    height: 18px;
    fill: currentColor;
    color: #8E8E93;
    transition: color 0.2s ease;
  }
  
  .active & .icon-svg {
    color: white;
  }
}

.active-indicator {
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #4776E6;
  animation: pulse 2s infinite;
}

.nav-label {
  font-size: 11px;
  font-weight: 500;
  color: #8E8E93;
  transition: all 0.2s ease;
  text-align: center;
  line-height: 1.2;
}

.nav-badge {
  position: absolute;
  top: 2px;
  right: 8px;
  min-width: 16px;
  height: 16px;
  border-radius: 8px;
  background: #FF3B30;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
}

.badge-text {
  font-size: 10px;
  font-weight: 600;
  color: white;
  line-height: 1;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: translateX(-50%) scale(1);
  }
  50% {
    opacity: 0.5;
    transform: translateX(-50%) scale(1.2);
  }
}

/* 小屏适配 */
@media (max-width: 375px) {
  .mobile-bottom-nav {
    height: 64px;
  }
  
  .nav-item {
    padding: 4px 8px;
    min-width: 50px;
  }
  
  .nav-icon {
    width: 28px;
    height: 28px;
    border-radius: 10px;
    
    .icon-svg {
      width: 16px;
      height: 16px;
    }
  }
  
  .nav-label {
    font-size: 10px;
  }
}

/* 大屏优化 */
@media (min-width: 414px) {
  .nav-item {
    padding: 8px 16px;
    min-width: 70px;
  }
  
  .nav-icon {
    width: 36px;
    height: 36px;
    border-radius: 14px;
    
    .icon-svg {
      width: 20px;
      height: 20px;
    }
  }
  
  .nav-label {
    font-size: 12px;
  }
}
</style>
