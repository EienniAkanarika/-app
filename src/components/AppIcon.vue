<template>
  <view class="app-icon" :class="iconClass" :style="iconStyle">
    <!-- APP环境优先使用文字图标 -->
    <!-- #ifdef APP-PLUS -->
    <text class="icon-text" :style="textStyle">{{ getIconText(name) }}</text>
    <!-- #endif -->
    
    <!-- H5和小程序环境使用uni-icons -->
    <!-- #ifndef APP-PLUS -->
    <uni-icons 
      v-if="useUniIcons" 
      :type="getUniIconType(name)" 
      :size="size" 
      :color="color"
    ></uni-icons>
    <!-- #endif -->
    
    <!-- 备用方案：CSS图标 -->
    <!-- #ifdef APP-PLUS -->
    <view v-if="!getIconText(name)" class="css-icon" :class="`css-icon-${name}`" :style="cssIconStyle"></view>
    <!-- #endif -->
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  size: {
    type: [Number, String],
    default: 24
  },
  color: {
    type: String,
    default: '#333'
  },
  useUniIcons: {
    type: Boolean,
    default: true
  }
})

// 图标文字映射（APP环境备用方案）
const iconTextMap = {
  'search': '🔍',
  'close': '✕',
  'back': '←',
  'edit': '✏️',
  'camera': '📷',
  'plus': '+',
  'check': '✓',
  'heart': '♥',
  'star': '★',
  'home': '🏠',
  'user': '👤',
  'clothes': '👕',
  'outfit': '👗',
  'wardrobe': '🚪',
  'profile': '👤',
  'date': '📅',
  'location': '📍',
  'image': '🖼️',
  'clear': '×',
  'info': 'ℹ️',
  'checkmark': '✓',
  'menu': '☰',
  'grid': '⊞',
  'list': '☰'
}

// uni-icons类型映射
const uniIconTypeMap = {
  'search': 'search',
  'close': 'close',
  'back': 'left',
  'edit': 'compose',
  'camera': 'camera',
  'plus': 'plus',
  'check': 'checkmarkempty',
  'heart': 'heart',
  'star': 'star',
  'home': 'home',
  'user': 'person',
  'clothes': 'shopping-bag',
  'outfit': 'images',
  'wardrobe': 'folder',
  'profile': 'contact',
  'date': 'calendar',
  'location': 'location',
  'image': 'image',
  'clear': 'clear',
  'info': 'info',
  'checkmark': 'checkmarkempty',
  'menu': 'bars',
  'grid': 'grid',
  'list': 'list'
}

const getIconText = (name) => {
  return iconTextMap[name] || ''
}

const getUniIconType = (name) => {
  return uniIconTypeMap[name] || name
}

const iconClass = computed(() => {
  return `app-icon-${props.name}`
})

const iconStyle = computed(() => {
  return {
    fontSize: typeof props.size === 'number' ? `${props.size}px` : props.size,
    color: props.color
  }
})

const textStyle = computed(() => {
  return {
    fontSize: typeof props.size === 'number' ? `${props.size}px` : props.size,
    color: props.color,
    lineHeight: '1'
  }
})

const cssIconStyle = computed(() => {
  const size = typeof props.size === 'number' ? `${props.size}px` : props.size
  return {
    width: size,
    height: size,
    backgroundColor: props.color
  }
})
</script>

<style lang="scss" scoped>
.app-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.icon-text {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-weight: normal;
  line-height: 1;
  display: inline-block;
  text-align: center;
}

.css-icon {
  display: inline-block;
  position: relative;
  
  &.css-icon-search {
    border: 2px solid currentColor;
    border-radius: 50%;
    
    &::after {
      content: '';
      position: absolute;
      top: 70%;
      left: 70%;
      width: 30%;
      height: 2px;
      background: currentColor;
      transform: rotate(45deg);
      transform-origin: left center;
    }
  }
  
  &.css-icon-plus {
    &::before, &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      background: currentColor;
    }
    
    &::before {
      width: 2px;
      height: 100%;
      transform: translate(-50%, -50%);
    }
    
    &::after {
      width: 100%;
      height: 2px;
      transform: translate(-50%, -50%);
    }
  }
  
  &.css-icon-close {
    &::before, &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 70%;
      height: 2px;
      background: currentColor;
      transform-origin: center;
    }
    
    &::before {
      transform: translate(-50%, -50%) rotate(45deg);
    }
    
    &::after {
      transform: translate(-50%, -50%) rotate(-45deg);
    }
  }
  
  &.css-icon-back {
    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 30%;
      width: 0;
      height: 0;
      border-top: 6px solid transparent;
      border-bottom: 6px solid transparent;
      border-right: 8px solid currentColor;
      transform: translateY(-50%);
    }
    
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 30%;
      width: 60%;
      height: 2px;
      background: currentColor;
      transform: translateY(-50%);
    }
  }
}
</style>
