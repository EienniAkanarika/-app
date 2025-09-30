<template>
  <view class="mobile-outfit-container">
    <!-- 渐变背景 -->
    <view class="gradient-bg"></view>

    <!-- 顶部状态栏安全区 -->
    <view class="status-bar-spacer"></view>

    <!-- 统一的紧凑型头部 -->
    <view class="mobile-header">
      <view class="header-content">
        <view class="greeting-section">
          <text class="greeting-text">我的穿搭</text>
          <text class="greeting-subtitle">{{ filteredOutfits.length }}个穿搭方案</text>
      </view>

        <view class="header-actions">
          <view class="search-btn" @tap="toggleSearch">
            <AppIcon name="search" :size="20" color="white" />
      </view>

          <view class="view-switch-btn" @tap="toggleViewMode">
            <AppIcon 
              :name="viewMode === 'grid' ? 'view-list' : 'view-grid'" 
              :size="20" 
              color="white" 
            />
          </view>
                </view>
              </view>
      
      <!-- 搜索框 (隐藏状态) -->
      <view v-if="showSearch" class="search-container" :class="{ 'show': showSearch }">
        <view class="search-input-wrapper">
          <AppIcon name="search" :size="18" color="#999" />
          <input 
            type="text" 
            class="search-input" 
            placeholder="搜索穿搭方案..."
            v-model="searchText"
            @input="handleSearch"
          />
          <view v-if="searchText" class="clear-search" @tap="clearSearch">
            <AppIcon name="close" :size="16" color="#999" />
              </view>
            </view>
          </view>
        </view>

    <!-- 移动端优化的内容区域 -->
    <view class="mobile-content" :class="{ 'animate-in': animateUI }">
      <!-- 水平滚动的场景标签 -->
      <scroll-view scroll-x class="scene-scroll" show-scrollbar="false">
        <view class="scene-tabs">
              <view 
            v-for="scene in scenes" 
            :key="scene.value"
            class="scene-tab" 
                :class="{ 'active': activeScene === scene.value }"
                @tap="setActiveScene(scene.value)"
              >
            <text class="tab-label">{{ scene.label }}</text>
            <view v-if="getSceneCount(scene.value) > 0" class="tab-count">
              {{ getSceneCount(scene.value) }}
              </view>
            </view>
        </view>
      </scroll-view>
        
        <!-- 穿搭方案列表 -->
      <view class="outfits-section" :class="{ 'animate-in': animateUI }">
        <view class="section-header">
          <text class="section-title">
            {{ activeScene === 'all' ? '所有方案' : scenes.find(s => s.value === activeScene)?.label }}
          </text>
          <text class="section-count">({{ filteredOutfits.length }})</text>
        </view>
        
        <view 
          class="outfits-grid" 
          :class="{ 
            'grid-view': viewMode === 'grid',
            'list-view': viewMode === 'list'
          }"
        >
            <view 
              v-for="(outfit, index) in filteredOutfits" 
              :key="index"
            class="outfit-card" 
              :class="{ 
                'recent': outfit.isRecent,
                'active-press': outfit.isPressed || activeLongPressItem === outfit.id 
              }"
              @longpress="deleteOutfit(outfit)"
              @touchstart="handleTouchStart(outfit)"
              @touchend="handleTouchEnd(outfit)"
              @touchcancel="handleTouchEnd(outfit)"
            >
              <view 
                class="outfit-image-container" 
                :class="{ 
                  'loading': isImageLoading(outfit), 
                  'error': isImageError(outfit),
                  'loaded': !isImageLoading(outfit) && !isImageError(outfit)
                }"
                @tap="viewOutfitDetail(outfit)"
              >
                <image 
                  class="outfit-image" 
                  :src="processImageUrl(outfit.image) || defaultImage" 
                  mode="aspectFill"
                  @load="handleImageLoad($event, outfit)"
                  @error="handleImageError($event, outfit)"
                ></image>
                <view v-if="outfit.season" class="season-badge" :class="'season-' + outfit.season">{{ seasonLabels[outfit.season] }}</view>
                <!-- 长按删除指示层 -->
                <view v-if="outfit.isPressed && outfit.isLongPressed" class="long-press-indicator">
                  <view class="indicator-text">长按删除</view>
                </view>
              </view>
              <view class="outfit-info" @tap="viewOutfitDetail(outfit)">
                <view class="outfit-header">
                  <text class="outfit-name">{{ outfit.name }}</text>
                <view class="outfit-rating">
              <view 
                    v-for="i in 5" 
                    :key="i" 
                    class="rating-star" 
                    :class="{ 'filled': outfit.rating >= i }"
                  >
                    <view class="star-shape"></view>
                    </view>
                    </view>
                  </view>
              <view class="outfit-details">
                <text class="outfit-scene">场景：{{ getSceneLabel(outfit.scene) }}</text>
                <text class="outfit-date">{{ formatDate(outfit.date) }}</text>
                      </view>
              <view v-if="outfit.notes" class="outfit-notes">
                <text>{{ outfit.notes }}</text>
                    </view>
                  </view>
                </view>
              </view>
        
        <!-- 穿搭方案为空时显示 -->
        <view v-if="filteredOutfits.length === 0" class="empty-outfits">
          <view class="empty-icon">
            <view class="empty-circle">
              <view class="empty-hanger"></view>
            </view>
        </view>
          <text class="empty-text">暂无穿搭方案</text>
          <text class="empty-subtext">点击右下角的加号创建你的第一个穿搭方案吧！</text>
        </view>
      </view>
    </view>
    
    <!-- 悬浮添加按钮 -->
    <view class="floating-add-btn" :class="{ 'animate-in': animateUI }" @tap="addNewOutfit">
      <view class="simple-plus-icon">
        <view class="plus-line horizontal"></view>
        <view class="plus-line vertical"></view>
    </view>
      </view>
      
    <!-- 使用统一的底部导航组件 -->
    <BottomNavigation :currentPath="'/pages/outfit/index'" />
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import * as outfitApi from '@/api/outfit.js'
import { clothesApi } from '@/api'
import { BASE_URL } from '@/utils/request.js'
import BottomNavigation from '@/components/BottomNavigation.vue'
import AppIcon from '@/components/AppIcon.vue'

// 动画控制
const animateUI = ref(false)

// 搜索相关
const showSearch = ref(false)

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

// 下拉刷新状态
const isRefreshing = ref(false)

// 搜索和筛选
const searchText = ref('')
const activeScene = ref('all')
const viewMode = ref('grid') // 修改默认视图为grid
const showFilter = ref(false)

// 长按效果控制 - 修改为使用单个ID而不是整个列表的状态
const activeLongPressItem = ref(null)
const longPressTimer = ref(null)
const longPressStartTime = ref(0)
const longPressThreshold = 800 // 800毫秒长按阈值
// 是否正在进行删除操作
const isDeleting = ref(false)

// 季节标签文本
const seasonLabels = {
  spring: '春',
  summer: '夏',
  autumn: '秋',
  winter: '冬'
}

// 场景标签 - 简化场景选项
const scenes = [
  { label: '全部', value: 'all' },
  { label: '日常', value: 'daily' },
  { label: '职场', value: 'work' },
  { label: '约会', value: 'date' },
  { label: '聚会', value: 'party' },
  { label: '旅行', value: 'travel' },
  { label: '运动', value: 'sports' },
  { label: '休闲', value: 'casual' },
  { label: '正式', value: 'formal' }
]

// 默认图片
const defaultImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23f0f0f0" /%3E%3Cpath d="M65,45 L50,30 L35,45 L35,70 L65,70 Z" stroke="%23ddd" stroke-width="2" fill="%23eee" /%3E%3Ccircle cx="50" cy="30" r="10" fill="%23eee" stroke="%23ddd" stroke-width="2" /%3E%3C/svg%3E'

// 穿搭方案数据
const outfits = ref([])
const loading = ref(false)

// 图片加载状态管理
const imageLoadingStates = ref(new Map())
const imageErrorStates = ref(new Map())

// 处理图片URL，对服务器图片路径进行修正
const processImageUrl = (imageUrl) => {
  // 如果没有图片URL，返回默认图片
  if (!imageUrl) {
    return defaultImage
  }
  
  // 记录原始图片路径
  console.log('🔄 穿搭列表处理图片URL:', imageUrl)
  
  // 修复Base64 URL开头的斜杠问题
  if (imageUrl.startsWith('/data:image/')) {
    console.log('🔧 修复Base64图片URL开头的斜杠')
    return imageUrl.substring(1) // 移除开头的斜杠
  }
  
  // 如果是Base64图片（以data:开头），直接返回
  if (imageUrl.startsWith('data:image/')) {
    console.log('✅ 识别为Base64图片，直接返回')
    return imageUrl
  }
  
  // #ifdef APP-PLUS
  // APP环境：处理本地文件路径
  if (imageUrl.startsWith('file://') || 
      imageUrl.startsWith('/storage/') || 
      imageUrl.startsWith('/data/') || 
      imageUrl.startsWith('/android_asset/') ||
      imageUrl.includes('_doc/') || 
      imageUrl.includes('_downloads/') || 
      imageUrl.includes('temp/') || 
      imageUrl.includes('cache/')) {
    console.log('📱 APP环境路径，直接返回:', imageUrl)
    return imageUrl;
  }
  // #endif
  
  // 检查是否是SVG颜色图片（getDefaultClothesImage生成的）
  if (imageUrl.startsWith('<svg')) {
    console.log('🎨 识别为SVG内容，转换为Data URL')
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(imageUrl)}`;
  }
  
  // 检查是否是默认图片路径
  if (imageUrl.includes('/static/') || imageUrl.startsWith('/static/')) {
    console.log('📁 识别为静态资源路径')
    return imageUrl;
  }
  
  console.log('⚠️ 无法识别的图片格式，返回默认图片:', imageUrl);
  return defaultImage;
}

// 获取图片唯一标识
const getImageId = (outfit) => {
  return outfit.id || `${outfit.name}_${outfit.image}`;
};

// 检查图片是否正在加载
const isImageLoading = (outfit) => {
  const imageId = getImageId(outfit);
  // 只有明确设置为loading时才返回true
  return imageLoadingStates.value.get(imageId) === true;
};

// 检查图片是否加载错误
const isImageError = (outfit) => {
  const imageId = getImageId(outfit);
  return imageErrorStates.value.get(imageId) === true;
};

// 图片开始加载
const setImageLoading = (outfit, loading) => {
  const imageId = getImageId(outfit);
  if (loading) {
    imageLoadingStates.value.set(imageId, true);
    imageErrorStates.value.delete(imageId);
  } else {
    imageLoadingStates.value.delete(imageId);
  }
};

// 图片加载成功处理
const handleImageLoad = (event, outfit) => {
  console.log('✅ 图片加载成功:', outfit.name);
  
  try {
    const imageId = getImageId(outfit);
    
    // 移除加载和错误状态
    imageLoadingStates.value.delete(imageId);
    imageErrorStates.value.delete(imageId);
    
    console.log('🎯 图片加载状态已清除:', imageId);
    
  } catch (error) {
    console.warn('⚠️ 图片加载处理出错:', error);
  }
};

// 图片加载错误处理
const handleImageError = (event, outfit) => {
  console.error('❌ 图片加载失败:', outfit.name, outfit.image);
  
  try {
    const imageId = getImageId(outfit);
    
    // 移除加载状态，设置错误状态
    imageLoadingStates.value.delete(imageId);
    imageErrorStates.value.set(imageId, true);
    
    console.log('❌ 图片错误状态已设置:', imageId);
    
    // 尝试使用默认图片
    const imageElement = event.target;
    if (imageElement && defaultImage && imageElement.src !== defaultImage) {
      console.log('🔄 尝试使用默认图片');
      setTimeout(() => {
        imageElement.src = defaultImage;
        // 清除错误状态，因为默认图片应该可以加载
        imageErrorStates.value.delete(imageId);
      }, 100);
    }
    
  } catch (error) {
    console.error('❌ 图片错误处理失败:', error);
  }
};

// 筛选后的穿搭方案
const filteredOutfits = computed(() => {
  let result = outfits.value
  
  // 搜索过滤
  if (searchText.value) {
    const lowerSearchText = searchText.value.toLowerCase()
    result = result.filter(outfit => 
      outfit.name.toLowerCase().includes(lowerSearchText)
    )
  }
  
  // 场景过滤
  if (activeScene.value !== 'all') {
    result = result.filter(outfit => outfit.scene === activeScene.value)
  }
  
  // 按照喜爱程度(rating)从高到低排序
  result = result.sort((a, b) => {
    // 将rating转换为数字确保正确比较
    const ratingA = Number(a.rating || 0);
    const ratingB = Number(b.rating || 0);
    // 降序排列（从高到低）
    return ratingB - ratingA;
  });
  
  return result
})

// 切换场景
const setActiveScene = (scene) => {
  if (activeScene.value === scene) return
  
  activeScene.value = scene
  
  // 保存用户偏好
  try {
    uni.setStorageSync('preferredScene', scene)
  } catch (e) {
    console.error('保存场景偏好失败:', e)
  }
}

// 切换视图模式
const setViewMode = (mode) => {
  if (viewMode.value === mode) return
  
  console.log('切换视图模式:', mode)
  viewMode.value = mode
}

// 切换视图模式（用于按钮）
const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'grid' ? 'list' : 'grid'
}

// 搜索功能
const toggleSearch = () => {
  showSearch.value = !showSearch.value
}

const handleSearch = () => {
  // 搜索逻辑已在computed中实现
}

const clearSearch = () => {
  searchText.value = ''
}

// 获取场景数量
const getSceneCount = (sceneValue) => {
  if (sceneValue === 'all') {
    return outfits.value.length
  }
  return outfits.value.filter(outfit => outfit.scene === sceneValue).length
}

// 获取场景标签
const getSceneLabel = (sceneValue) => {
  const scene = scenes.find(s => s.value === sceneValue)
  return scene ? scene.label : '未知场景'
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
        month: 'numeric',
        day: 'numeric'
      })
    }
  } catch (error) {
    return '未知日期'
  }
}

// 处理长按开始
const startLongPress = (outfit) => {
  console.log('长按开始:', outfit.name)
  activeLongPressItem.value = outfit.id
  
  // 清除之前的定时器
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value)
  }
  
  // 设置新的定时器
  longPressTimer.value = setTimeout(() => {
    console.log('长按时间到，触发删除:', outfit.name)
    deleteOutfit(outfit)
  }, 800) // 增加到800毫秒，更容易触发
}

// 处理长按结束
const endLongPress = () => {
  console.log('长按结束，清除定时器')
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value)
    longPressTimer.value = null
  }
  
  setTimeout(() => {
    activeLongPressItem.value = null
  }, 100)
}

// 查看穿搭详情，修改为跳转到详情页面
const viewOutfitDetail = async (outfit) => {
  // 输出日志
  console.log('viewOutfitDetail被调用，准备查看详情:', outfit.name);
  console.log('原始穿搭数据:', outfit);
  console.log('原始 items 数据:', outfit.items, '类型:', typeof outfit.items);
  
  // 🔧 添加loading状态管理
  try {
    uni.showLoading({
      title: '加载详情...',
      mask: true
    });
  
  // 处理图片路径问题 - 为避免小程序环境下图片显示问题
  const processedOutfit = JSON.parse(JSON.stringify(outfit)); // 深拷贝
  
  // 在此处处理图片URL，确保在详情页也能正确显示
  if (processedOutfit.image && processedOutfit.image.startsWith('/uploads/')) {
    // 修正穿搭封面图片路径为完整URL
    processedOutfit.image = BASE_URL + processedOutfit.image;
    console.log('处理后的穿搭图片路径:', processedOutfit.image);
  }
  
  // 🔧 关键修复：将衣物ID数组转换为完整的衣物对象数组
  if (processedOutfit.items && Array.isArray(processedOutfit.items) && processedOutfit.items.length > 0) {
    console.log('🔧 开始转换衣物ID为完整对象，数量:', processedOutfit.items.length);
    
    const detailedItems = [];
    
    for (const item of processedOutfit.items) {
      // 如果item已经是完整对象，直接使用
      if (typeof item === 'object' && item.id) {
        console.log('✅ 衣物已是完整对象:', item.name);
        detailedItems.push(item);
      } 
      // 如果item是字符串ID，获取完整详情
      else if (typeof item === 'string') {
        console.log('🔍 获取衣物详情，ID:', item);
        try {
          const result = await clothesApi.getDetail(item);
          if (result && result.code === 200 && result.data) {
            console.log('✅ 成功获取衣物详情:', result.data.name);
  // 处理衣物图片路径
            if (result.data.image && result.data.image.startsWith('/uploads/')) {
              result.data.image = BASE_URL + result.data.image;
            }
            detailedItems.push(result.data);
          } else {
            console.warn('❌ 无法获取衣物详情:', item, '结果:', result);
          }
        } catch (error) {
          console.error('❌ 获取衣物详情时出错:', item, error);
        }
      } else {
        console.warn('❌ 未知的衣物数据格式:', item);
      }
    }
    
    // 更新为完整的衣物对象数组
    processedOutfit.items = detailedItems;
    console.log('🎯 衣物ID转换完成，最终衣物数量:', detailedItems.length);
  } else {
    console.log('📋 没有衣物数据或数据格式不正确');
  }
  
  // #ifdef MP-WEIXIN
  // 微信小程序环境下，参数长度有限制，使用全局变量或本地存储临时保存完整数据
  try {
    // 为了防止URL参数过长，仅使用ID跳转，完整数据通过全局对象传递
    const outfitId = processedOutfit.id || processedOutfit._id;
    
    if (!outfitId) {
      uni.hideLoading();
      console.error('跳转失败: 穿搭ID不存在');
      uni.showToast({
        title: '无法查看详情',
        icon: 'none'
      });
      return;
    }
    
    // 方法1: 将完整数据存入全局对象
    if (typeof getApp === 'function') {
      const app = getApp();
      if (!app.globalData) {
        app.globalData = {};
      }
      // 使用临时缓存存储完整数据
      app.globalData.tempOutfitData = processedOutfit;
      console.log('已将穿搭数据存入全局对象，ID:', outfitId);
      
      // 使用ID跳转
      uni.navigateTo({
        url: `/pages/outfit-detail/index?id=${outfitId}&useGlobalData=true`,
        success: () => {
          uni.hideLoading();
          console.log(`查看${outfit.name}详情成功跳转 (通过全局数据)`)
        },
        fail: (err) => {
          uni.hideLoading();
          console.error('跳转失败:', err)
        }
      });
      return;
    } else {
      // 方法2: 如果getApp不可用，尝试使用本地存储
      try {
        // 临时存储数据
        const tempKey = `temp_outfit_${outfitId}`;
        uni.setStorageSync(tempKey, JSON.stringify(processedOutfit));
        console.log('已将穿搭数据存入本地存储，键名:', tempKey);
        
        // 使用ID跳转并指示使用本地存储
        uni.navigateTo({
          url: `/pages/outfit-detail/index?id=${outfitId}&useStorage=true`,
          success: () => {
            uni.hideLoading();
            console.log(`查看${outfit.name}详情成功跳转 (通过本地存储)`)
          },
          fail: (err) => {
            uni.hideLoading();
            console.error('跳转失败:', err);
            // 清除临时存储
            uni.removeStorageSync(tempKey);
          }
        });
        return;
      } catch (storageErr) {
        console.error('使用本地存储传递数据失败:', storageErr);
      }
    }
  } catch (err) {
    console.error('使用全局对象传递数据失败:', err);
  }
  // #endif
  
  // 非微信小程序环境或全局对象传递失败时，使用URL参数方式
  // 裁剪数据大小，只保留必要字段以减少URL长度
  const minimalOutfit = {
    id: processedOutfit.id || processedOutfit._id,
    name: processedOutfit.name,
    image: processedOutfit.image,
    season: processedOutfit.season,
    scene: processedOutfit.scene,
    date: processedOutfit.date,
    rating: processedOutfit.rating,
    notes: processedOutfit.notes,
    items: processedOutfit.items ? processedOutfit.items.map(item => ({
      id: item.id || item._id,
      name: item.name,
      category: item.category,
      image: item.image
    })) : []
  };
  
  // 序列化穿搭数据，传递到详情页面
  const outfitData = JSON.stringify(minimalOutfit);
  console.log('传递的数据大小:', outfitData.length, '字节');
  
  uni.navigateTo({
    url: `/pages/outfit-detail/index?outfitData=${encodeURIComponent(outfitData)}`,
    success: () => {
      uni.hideLoading();
      console.log(`查看${outfit.name}详情成功跳转`)
    },
    fail: (err) => {
      console.error('跳转失败:', err)
      // 跳转失败时尝试使用ID方式
      const outfitId = processedOutfit.id || processedOutfit._id;
      if (outfitId) {
        uni.navigateTo({
          url: `/pages/outfit-detail/index?id=${outfitId}`,
          success: () => {
            uni.hideLoading();
            console.log(`查看${outfit.name}详情成功跳转 (仅ID)`)
          },
          fail: (err2) => {
            uni.hideLoading();
            console.error('ID跳转也失败:', err2);
            uni.showToast({
              title: '无法查看详情',
              icon: 'none'
            });
          }
        });
      } else {
        uni.hideLoading();
        uni.showToast({
          title: '无法查看详情',
          icon: 'none'
        });
      }
    }
  })
  
  } catch (error) {
    uni.hideLoading();
    console.error('查看详情时发生错误:', error);
    uni.showToast({
      title: '查看详情失败',
      icon: 'none'
    });
  }
}

// 添加新穿搭
const addNewOutfit = () => {
  // 直接跳转到创建穿搭页面，不使用document对象
  uni.navigateTo({
    url: '/pages/create-outfit/index',
    success: () => {
      console.log('跳转到创建穿搭页面')
    }
  })
}

// 显示操作菜单
const showActionSheet = (outfit) => {
  uni.showActionSheet({
    itemList: ['编辑', '分享', '删除'],
    success: (res) => {
      if (res.tapIndex === 0) {
        // 编辑操作，直接调用directEditOutfit
        directEditOutfit(outfit)
      } else if (res.tapIndex === 1) {
        uni.showToast({
          title: '分享穿搭',
          icon: 'none'
        })
      } else if (res.tapIndex === 2) {
        uni.showModal({
          title: '确认删除',
          content: `确定要删除"${outfit.name}"吗？`,
          success: (res) => {
            if (res.confirm) {
              // 删除穿搭
              outfits.value = outfits.value.filter(item => item.id !== outfit.id)
              uni.showToast({
                title: '删除成功',
                icon: 'success'
              })
            }
          }
        })
      }
    }
  })
}

// 删除穿搭方案
const deleteOutfit = (outfit) => {
  // 检查穿搭对象是否存在
  if (!outfit) {
    console.error('删除失败：穿搭对象不存在')
    uni.showToast({
      title: '删除失败：穿搭不存在',
      icon: 'none'
    })
    return
  }
  
  // 获取穿搭ID
  const outfitId = outfit._id || outfit.id
  
  if (!outfitId) {
    console.error('删除失败：穿搭ID不存在', outfit)
    uni.showToast({
      title: '删除失败：ID不存在',
      icon: 'none'
    })
    return
  }
  
  console.log('准备删除穿搭:', outfitId, outfit.name)
  
  uni.showModal({
    title: '确认删除',
    content: `确定要删除"${outfit.name || '未命名穿搭'}"吗？此操作不可撤销。`,
    confirmColor: '#E74C3C',
    success: (res) => {
      if (res.confirm) {
        // 显示加载
        uni.showLoading({
          title: '删除中...',
          mask: true
        })
        
        // 调用API删除穿搭
        outfitApi.remove(outfitId)
          .then(result => {
            uni.hideLoading()
            console.log('删除穿搭API响应:', result)
            
            if (result && result.code === 200) {
              // 从本地数据中删除
              outfits.value = outfits.value.filter(item => {
                const currentId = item._id || item.id
                return currentId !== outfitId
              })
              
              uni.showToast({
                title: '删除成功',
                icon: 'success'
              })
            } else {
              uni.showToast({
                title: result?.message || '删除失败',
                icon: 'none'
              })
            }
          })
          .catch(error => {
            uni.hideLoading()
            console.error('删除穿搭失败:', error)
            uni.showToast({
              title: '删除失败，请重试',
              icon: 'none'
            })
          })
      }
    }
  })
}

// 前往我的衣橱页面
const goToWardrobePage = () => {
  // 检查是否需要刷新衣橱数据
  const clothesDataUpdated = uni.getStorageSync('clothesDataUpdated')
  
  // 无论是否有更新标志，都导航到衣橱页面
  uni.navigateTo({
    url: '/pages/index/index'
  })
}

// 前往个人信息页面
const goToProfilePage = () => {
  uni.navigateTo({
    url: '/pages/profile/index'
  })
}

// 页面初始化加载
const onLoad = (options) => {
  console.log('页面初始化，带参数:', options)
  
  // 🔧 确保没有遗留的loading状态
  try {
    uni.hideLoading()
  } catch (e) {
    // 忽略hideLoading的错误
  }
  
  // 检查是否需要刷新数据
  if (options.refresh === 'true' || options.timestamp) {
    console.log('检测到refresh参数或timestamp参数，需要刷新数据')
    
    // 延迟加载以确保UI准备就绪
    setTimeout(() => {
      loadOutfitList()
      
      // 检查是否有操作类型参数
      if (options.action) {
        const actionType = options.action === 'edit' ? '更新' : '创建'
        uni.showToast({
          title: `穿搭${actionType}成功`,
          icon: 'success',
          duration: 1500
        })
      }
    }, 300)
  }
}

// 页面加载动画
onMounted(() => {
  // 确保视图模式初始设置正确
  const savedViewMode = uni.getStorageSync('preferredViewMode') || 'grid'
  viewMode.value = savedViewMode
  
  // 读取保存的场景偏好
  const savedScene = uni.getStorageSync('preferredScene')
  if (savedScene) {
    activeScene.value = savedScene
  }
  
  setTimeout(() => {
    animateUI.value = true
  }, 100)
  
  // 🔧 确保没有遗留的loading状态
  try {
    uni.hideLoading()
  } catch (e) {
    // 忽略hideLoading的错误
  }
  
  // 立即加载穿搭方案数据
  loadOutfitList()
  
  // 监听页面参数变化，用于从其他页面返回时刷新
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  
  // 检查是否有参数
  if (currentPage && currentPage.options) {
    onLoad(currentPage.options)
  }
  
  // 监听创建/编辑穿搭页面返回事件，自动刷新列表
  uni.$on('outfitUpdated', (data) => {
    console.log('收到穿搭更新事件，刷新列表', data)
    // 立即刷新数据列表
    loadOutfitList()
    
    // 提示用户操作成功
    const actionType = data?.type === 'edit' ? '编辑' : '创建'
    uni.showToast({
      title: `穿搭${actionType}成功`,
      icon: 'success',
      duration: 1500
    })
  })
  
  // 组件销毁时取消事件监听
  return () => {
    uni.$off('outfitUpdated')
  }
})

// 加载穿搭方案列表
const loadOutfitList = async () => {
  loading.value = true
  
  try {
    console.log('开始加载穿搭方案列表')
    // 显示加载中提示
    uni.showLoading({
      title: '加载中...',
      mask: true
    })
    
    // 构建请求参数，当 activeScene 为 'all' 时不传递 scene 参数
    const params = {};
    if (activeScene.value !== 'all') {
      params.scene = activeScene.value;
    }
    console.log('请求参数:', params)
    
    // 调用API获取穿搭方案列表
    const result = await outfitApi.getList(params)
    
    console.log('API响应结果:', JSON.stringify(result))
    
    // 检查结果格式，处理各种可能的响应格式
    if (result && result.code === 200) {
      let outfitsList = []
      
      // 处理多种可能的数据格式
      if (Array.isArray(result.data)) {
        console.log('直接数组格式的数据:', result.data.length)
        outfitsList = result.data
      } else if (result.data && result.data.list && Array.isArray(result.data.list)) {
        console.log('嵌套list字段的数据:', result.data.list.length)
        outfitsList = result.data.list
      } else if (result.data && typeof result.data === 'object') {
        console.log('对象格式的数据，尝试提取数组')
        // 输出所有键名，方便诊断
        console.log('数据对象的键名:', Object.keys(result.data))
        
        // 尝试从对象中找到数组
        for (const key in result.data) {
          if (Array.isArray(result.data[key])) {
            console.log(`找到数组字段: ${key}，长度: ${result.data[key].length}`)
            outfitsList = result.data[key]
            break
          }
        }
      } else if (result.data && result.data.outfits && Array.isArray(result.data.outfits)) {
        console.log('从outfits字段提取数据:', result.data.outfits.length)
        outfitsList = result.data.outfits
      } else if (result.data === null || result.data === undefined) {
        console.log('API返回成功但无数据')
        outfitsList = []
      } else if (result.message === '获取成功' && !result.data) {
        console.log('特殊情况: 服务器返回成功但没有数据')
        outfitsList = []
      } else {
        // 尝试将未知格式转换为数组
        console.log('未知的数据格式，尝试处理:', typeof result.data)
        try {
          // 如果是字符串，尝试解析为JSON
          if (typeof result.data === 'string') {
            const parsedData = JSON.parse(result.data)
            console.log('尝试解析字符串为JSON:', typeof parsedData)
            
            if (Array.isArray(parsedData)) {
              outfitsList = parsedData
            } else if (parsedData && typeof parsedData === 'object') {
              // 检查对象中是否有数组
              const arrayKey = Object.keys(parsedData).find(key => Array.isArray(parsedData[key]))
              if (arrayKey) {
                outfitsList = parsedData[arrayKey]
              }
            }
          }
        } catch (parseError) {
          console.error('解析响应数据失败:', parseError)
        }
      }
      
      // 更新穿搭列表
      console.log('获取到穿搭列表, 数量:', outfitsList.length)
      if (outfitsList.length > 0) {
        console.log('第一条数据示例:', JSON.stringify(outfitsList[0]))
        
        // 调试: 输出第一条数据的图片信息
        const firstItem = outfitsList[0]
        console.log('------- 图片路径调试 -------')
        console.log('第一条数据原始图片路径:', firstItem.image)
        console.log('处理后的图片路径:', processImageUrl(firstItem.image))
        console.log('----------------------------')
      }
      
      // 为每个穿搭项目添加isPressed属性以独立控制按压状态
      outfitsList.forEach(item => {
        // 初始化交互状态属性
        item.isPressed = false
        item.isLongPressed = false
        item.pressTimer = null
        
        // 确保每个项目都有rating字段
        if (item.rating === undefined || item.rating === null) {
          console.log(`穿搭项目 ${item.name || '未命名'} 没有喜爱程度数据，设置默认值3`)
          item.rating = 3
        } else {
          // 使用Number()函数确保rating是数字类型
          const ratingNum = Number(item.rating);
          item.rating = !isNaN(ratingNum) ? ratingNum : 3;
          console.log(`穿搭项目 ${item.name || '未命名'} 喜爱程度: ${item.rating}，类型: ${typeof item.rating}`);
        }
      })
      
      // 按照喜爱程度从高到低排序
      outfitsList.sort((a, b) => {
        const ratingA = Number(a.rating || 0);
        const ratingB = Number(b.rating || 0);
        return ratingB - ratingA;
      });
      
      outfits.value = outfitsList
      
      // 初始化图片加载状态 - 不立即设置为loading，让图片自然加载
      imageLoadingStates.value.clear()
      imageErrorStates.value.clear()
      console.log('🔄 图片加载状态已重置')
      
      // 如果列表为空，显示添加按钮提示并使用测试数据
      if (outfitsList.length === 0) {
        showAddButtonTip()
      }
    } else {
      // 使用错误消息
      const errorMsg = result?.message || '未知错误'
      console.error('穿搭列表加载失败:', errorMsg)
      
      if (errorMsg === '获取成功') {
        console.log('特殊情况: 错误信息为"获取成功"，但状态码不是200')
        // 可能是服务器响应格式问题，尝试使用测试数据
        outfits.value = []
        showAddButtonTip()
      } else {
        // 使用空数组
        outfits.value = []
        uni.showToast({
          title: '加载失败: ' + errorMsg,
          icon: 'none'
        })
        // 显示测试数据
        setTimeout(() => {
          showAddButtonTip()
        }, 2000)
      }
    }
  } catch (error) {
    console.error('加载穿搭方案列表出错:', error)
    outfits.value = []
    
    // 显示错误提示，除非是"获取成功"
    if (error.message !== '获取成功') {
      uni.showToast({
        title: '加载失败: ' + (error.message || '未知错误'),
        icon: 'none'
      })
    }
    
    // 显示测试数据
    setTimeout(() => {
      showAddButtonTip()
    }, 2000)
  } finally {
    uni.hideLoading()
    loading.value = false
  }
}

// 显示添加按钮提示
const showAddButtonTip = () => {
  // 如果列表为空，显示提示
  if (outfits.value.length === 0) {
    setTimeout(() => {
      uni.showToast({
        title: '点击右下角按钮创建穿搭',
        icon: 'none',
        duration: 3000
      })
    }, 500)
    
    // 添加一些测试数据以便用户体验
    // 无论什么环境都显示测试数据，确保用户可以看到一些内容
    console.log('添加测试数据供用户体验')
    outfits.value = [
      {
        id: 'demo1',
        name: '商务通勤风',
        image: processImageUrl('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23E74C3C" /%3E%3C/svg%3E'),
        items: ['item1', 'item2', 'item3'],
        season: 'spring',
        scene: 'work',
        isRecent: true,
        date: '2023-12-01',
        isPressed: false,
        isLongPressed: false,
        pressTimer: null,
        rating: 5
      },
      {
        id: 'demo2',
        name: '周末休闲装',
        image: processImageUrl('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23F39C12" /%3E%3C/svg%3E'),
        items: ['item4', 'item5'],
        season: 'summer',
        scene: 'casual',
        date: '2023-12-05',
        isPressed: false,
        isLongPressed: false,
        pressTimer: null,
        rating: 4
      },
      {
        id: 'demo3',
        name: '约会穿搭',
        image: processImageUrl('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%233498DB" /%3E%3C/svg%3E'),
        items: ['item1', 'item6'],
        season: 'autumn',
        scene: 'date',
        date: '2023-12-10',
        isPressed: false,
        isLongPressed: false,
        pressTimer: null,
        rating: 3
      },
      {
        id: 'demo4',
        name: '冬季保暖搭配',
        image: processImageUrl('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%238E44AD" /%3E%3C/svg%3E'),
        items: ['item7', 'item8', 'item9', 'item10'],
        season: 'winter',
        scene: 'daily',
        date: '2023-12-15',
        isPressed: false,
        isLongPressed: false,
        pressTimer: null,
        rating: 4
      }
    ]
  }
}

// 直接编辑穿搭
const directEditOutfit = (outfit) => {
  // 输出日志
  console.log('directEditOutfit被调用，准备编辑穿搭:', outfit.name);
  
  // 延迟执行导航，确保上面的操作完成
  setTimeout(() => {
    uni.navigateTo({
      url: `/pages/create-outfit/index?edit=true&outfitData=${encodeURIComponent(JSON.stringify(outfit))}`,
      success: () => {
        console.log(`编辑${outfit.name}成功跳转`)
      },
      fail: (err) => {
        console.error('跳转失败:', err)
      }
    })
  }, 300)
}

// 下拉刷新处理
const onRefresh = () => {
  console.log('触发下拉刷新')
  isRefreshing.value = true
  loadOutfitList().finally(() => {
    setTimeout(() => {
      isRefreshing.value = false
      uni.showToast({
        title: '刷新成功',
        icon: 'success',
        duration: 1000
      })
    }, 1000)
  })
}

// 下拉刷新复位处理
const onRefreshRestore = () => {
  console.log('下拉刷新复位')
}

// 下拉中的处理
const onRefreshPulling = (e) => {
  console.log('下拉中...', e)
}

// 导出页面生命周期钩子
defineExpose({
  onRefresh
})

// 处理触摸开始
const handleTouchStart = (outfit) => {
  outfit.isPressed = true
  activeLongPressItem.value = outfit.id
  
  // 清除之前的定时器（如果有）
  if (outfit.pressTimer) {
    clearTimeout(outfit.pressTimer)
  }
  
  // 设置长按定时器，只有长按超过阈值才显示删除提示
  outfit.pressTimer = setTimeout(() => {
    console.log('显示长按删除提示:', outfit.name)
    outfit.isLongPressed = true
    // 强制更新视图
    outfit.isPressed = false
    setTimeout(() => {
      outfit.isPressed = true
      
      // 设置另一个定时器，再过一段时间后触发删除
      setTimeout(() => {
        if (outfit.isPressed && outfit.isLongPressed) {
          console.log('长按时间足够，触发删除:', outfit.name)
          deleteOutfit(outfit)
        }
      }, 1500) // 再等1.5秒后触发删除，给用户足够的反应时间
    }, 10)
  }, 500) // 500毫秒后显示长按删除提示
}

// 处理触摸结束
const handleTouchEnd = (outfit) => {
  outfit.isPressed = false
  
  // 清除长按定时器
  if (outfit.pressTimer) {
    clearTimeout(outfit.pressTimer)
    outfit.pressTimer = null
  }
  
  // 清除长按标记
  outfit.isLongPressed = false
  
  // 清除激活的长按项
  setTimeout(() => {
    if (activeLongPressItem.value === outfit.id) {
      activeLongPressItem.value = null
    }
  }, 100)
}
</script>

<style lang="scss">
@use '@/styles/mobile-design-system.scss';

page {
  background-color: #f8f9fa;
}

.mobile-outfit-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  background: #f8f9fa;
  padding-bottom: 80px; /* 为底部导航留空间 */
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
  margin-bottom: 12px;
}

.greeting-section {
  flex: 1;
}

.greeting-text {
  font-size: 28px;
  font-weight: 700;
  color: white;
  margin-bottom: 4px;
  line-height: 1.2;
}

.greeting-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-btn, .view-switch-btn {
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

.search-icon, .view-icon {
  width: 20px;
  height: 20px;
  fill: white;
}

.search-container {
  opacity: 0;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  &.show {
    opacity: 1;
    transform: translateY(0);
  }
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  padding: 0 16px;
  height: 40px;
  margin-top: 8px;
  backdrop-filter: blur(10px);
}

.search-input-icon {
  width: 16px;
  height: 16px;
  fill: #999;
  margin-right: 8px;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  color: #333;
  
  &::placeholder {
    color: #999;
  }
}

.clear-search {
  width: 16px;
  height: 16px;
  fill: #ccc;
  cursor: pointer;
}

/* 移动端内容区域 */
.mobile-content {
  flex: 1;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(15px);
  border-top-left-radius: 32px;
  border-top-right-radius: 32px;
  box-shadow: 0 -8px 30px rgba(76, 132, 255, 0.12);
  z-index: 2;
  padding: 20px 0;
  margin-top: 16px;
  transition: transform 0.4s ease-out, opacity 0.4s ease-out;
  transform: translateY(20px);
  opacity: 0;
}

.mobile-content.animate-in {
  transform: translateY(0);
  opacity: 1;
}

/* 场景标签滚动 */
.scene-scroll {
  white-space: nowrap;
  padding: 0 0 20px;
}

.scene-tabs {
  display: flex;
  padding: 0 20px;
  gap: 12px;
}

.scene-tab {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 16px;
  border-radius: 16px;
  background: #f8f9fa;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 80px;
  
  &:active {
    transform: scale(0.95);
  }
  
  &.active {
    background: linear-gradient(135deg, #4776E6, #8E54E9);
    box-shadow: 0 8px 24px rgba(71, 118, 230, 0.25);
    
    .tab-label {
      color: white;
      font-weight: 600;
    }
    
    .tab-count {
      background: rgba(255, 255, 255, 0.2);
      color: white;
    }
  }
}

.tab-label {
  font-size: 13px;
  font-weight: 500;
  color: #333;
  transition: all 0.3s ease;
  text-align: center;
}

.tab-count {
  position: absolute;
  top: 6px;
  right: 6px;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  background: #FF3B30;
  color: white;
  font-size: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: scale(0.8);
}

/* 穿搭列表区域 */
.outfits-section {
  padding: 0 20px;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s ease;
}

.outfits-section.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #333;
  margin-right: 8px;
}

.section-count {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.outfits-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.outfits-grid.grid-view {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

/* 穿搭卡片样式 */
.outfit-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.02);
}

.outfit-card:active {
  transform: scale(0.98);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.outfit-image-container {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px 12px 0 0;
}

.grid-view .outfit-image-container {
  height: 160px;
}

.outfit-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
  border-radius: 12px 12px 0 0;
  transition: transform 0.3s ease;
  
  /* 确保图片完全覆盖容器 */
  min-width: 100%;
  min-height: 100%;
}

/* 图片悬浮效果 */
.outfit-card:hover .outfit-image {
  transform: scale(1.02);
}

/* 图片加载失败时的占位效果 */
.outfit-image-container::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23999"><path d="M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19M19,19H5V5H19V19M13.96,12.29L11.21,15.83L9.25,13.47L6.5,17H17.5L13.96,12.29Z"/></svg>') center/contain no-repeat;
  opacity: 0;
  z-index: 1;
  transition: opacity 0.3s ease;
}

/* 图片加载状态指示器 - 只在需要时显示 */
.outfit-image-container::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #4776E6;
  border-radius: 50%;
  animation: imageLoading 1s linear infinite;
  opacity: 0;
  z-index: 2;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

@keyframes imageLoading {
  0% { 
    transform: translate(-50%, -50%) rotate(0deg); 
  }
  100% { 
    transform: translate(-50%, -50%) rotate(360deg); 
  }
}

/* 图片加载中状态 */
.outfit-image-container.loading::after {
  opacity: 1;
}

/* 图片加载失败状态 */
.outfit-image-container.error::before {
  opacity: 1;
}

.outfit-image-container.error .outfit-image {
  opacity: 0.3;
  filter: grayscale(100%);
}

/* 图片加载成功状态 */
.outfit-image-container.loaded .outfit-image {
  opacity: 1;
}

.season-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 600;
  color: white;
  backdrop-filter: blur(10px);
}

.season-spring { background: rgba(76, 175, 80, 0.8); }
.season-summer { background: rgba(255, 152, 0, 0.8); }
.season-autumn { background: rgba(255, 87, 34, 0.8); }
.season-winter { background: rgba(96, 125, 139, 0.8); }

.outfit-info {
  padding: 14px;
}

.outfit-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.outfit-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  flex: 1;
  margin-right: 8px;
  line-height: 1.3;
}

.outfit-rating {
  display: flex;
  gap: 2px;
}

.rating-star {
  width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.star-shape {
  width: 12px;
  height: 12px;
  background: #E5E5E5;
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
  transition: all 0.2s ease;
}

.rating-star.filled .star-shape {
  background: linear-gradient(135deg, #FFD700, #FFA500);
}

.outfit-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
}

.outfit-scene, .outfit-date {
  font-size: 12px;
  color: #666;
}

.outfit-notes {
  font-size: 13px;
  color: #555;
  line-height: 1.4;
  margin-top: 4px;
}

/* 空状态 */
.empty-outfits {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  margin-bottom: 20px;
  opacity: 0.6;
}

.empty-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f0f0f0, #e0e0e0);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.empty-hanger {
  width: 30px;
  height: 20px;
  border: 2px solid #ccc;
  border-bottom: none;
  border-radius: 15px 15px 0 0;
  position: relative;
}

.empty-hanger::before {
  content: '';
  position: absolute;
  top: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 8px;
  height: 8px;
  border: 2px solid #ccc;
  border-radius: 50%;
}

.empty-text {
  font-size: 18px;
  color: #333;
  font-weight: 600;
  margin-bottom: 8px;
}

.empty-subtext {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  max-width: 250px;
}

/* 浮动添加按钮样式（保持与衣橱页面一致） */

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
  animation: float1 12s ease-in-out infinite;
}

.bg-circle-2 {
  width: 200px;
  height: 200px;
  bottom: 20%;
  left: -100px;
  animation: float2 15s ease-in-out infinite;
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
  padding: 20px 30px;
  display: flex;
  align-items: center;
  z-index: 1;
}

.logo-area {
  width: 44px;
  height: 44px;
  border-radius: 6px;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  box-shadow: 0 4px 15px rgba(71, 118, 230, 0.15);
  /* 正方形容器，适配新logo比例: 717/689 ≈ 1:1 */
  overflow: hidden;
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
  position: relative;
  letter-spacing: -0.5px;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -6px;
    left: 0;
    width: 30px;
    height: 3px;
    border-radius: 3px;
    background: linear-gradient(90deg, #4776E6, #8E54E9);
  }
}

.content-box {
  flex: 1;
  padding: 20px;
  padding-bottom: 120px; /* 留出底部导航的空间 */
  z-index: 2;
  box-sizing: border-box;
}

/* 搜索栏 */
.search-bar {
  display: flex;
  padding: 0 20px;
  margin-bottom: 18px;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s ease;
}

.search-bar.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.search-input-wrapper {
  flex: 1;
  height: 46px;
  background-color: #f5f5f7;
  border-radius: 23px;
  display: flex;
  align-items: center;
  padding: 0 15px;
  margin-right: 12px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.03);
  transition: all 0.3s ease;
  
  &:focus-within {
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.03), 0 0 0 2px rgba(71, 118, 230, 0.1);
    background-color: #fff;
  }
}

.search-input {
  flex: 1;
  height: 100%;
  border: none;
  background: none;
  margin: 0 10px;
  font-size: 15px;
  color: #333;
  
  &::placeholder {
    color: #aaa;
  }
}

/* 视图切换按钮 */
.view-switch {
  display: flex;
  background-color: #f5f5f7;
  border-radius: 12px;
  overflow: hidden;
  padding: 3px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.03);
}

.view-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  border-radius: 10px;
  position: relative;
  
  &:active {
    opacity: 0.7;
  }
}

.view-btn.active {
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  
  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 50%;
    transform: translateX(-50%);
    width: 10px;
    height: 2px;
    border-radius: 1px;
    background: linear-gradient(90deg, #4776E6, #8E54E9);
  }
}

/* 场景标签 */
.tags-row {
  padding: 0 15px 18px;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s ease;
  overflow: hidden;
  width: 100%;
  box-sizing: border-box;
  display: flex;
}

.tags-row.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.tags-scroll {
  flex: 1;
  white-space: nowrap;
}

.tags-scroll-content {
  display: inline-flex;
  padding: 3px 0;
  flex-wrap: nowrap;
}

.scene-tag {
  display: inline-block;
  padding: 8px 18px;
  border-radius: 20px;
  background-color: #f5f5f7;
  margin-right: 10px;
  font-size: 14px;
  color: #666;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 70%);
    transform: translate(-50%, -50%) scale(0);
    opacity: 0;
    transition: transform 0.5s ease, opacity 0.5s ease;
  }
  
  &:active::after {
    transform: translate(-50%, -50%) scale(2);
    opacity: 1;
    transition: transform 0.3s ease, opacity 0.3s ease;
  }
  
  &:active {
    transform: scale(0.96);
  }
}

.scene-tag.active {
  background: linear-gradient(90deg, #4776E6, #8E54E9);
  color: #fff;
  font-weight: 500;
  box-shadow: 0 3px 12px rgba(71, 118, 230, 0.25);
  transform: translateY(-2px);
}

/* 穿搭列表 */
.outfits-list {
  flex: 1;
  padding: 0 20px;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s ease;
}

.outfits-list.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.outfits-list.grid-view {
  padding: 0 15px;
}

.outfit-item {
  background-color: #fff;
  border-radius: 18px;
  overflow: hidden;
  margin-bottom: 18px;
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.03);
  transition: all 0.3s ease;
  display: flex;
  animation: fadeInUp 0.3s ease forwards;
  opacity: 0;
  border: 1px solid rgba(0, 0, 0, 0.02);
  will-change: transform, box-shadow;
  
  &.active-press {
    transform: scale(0.98);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
    border-color: rgba(255, 82, 82, 0.5);
    background-color: rgba(255, 245, 245, 0.9);
  }
}

.outfit-item:active {
  transform: scale(0.98);
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.03);
}

.outfit-item.recent {
  border-left: 4px solid #4776E6;
}

.list-view .outfit-image-container {
  width: 90px;
  height: 90px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  overflow: hidden;
}

.list-view .outfit-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
  border-radius: 12px;
  transition: transform 0.3s ease;
  
  /* 确保图片完全覆盖容器 */
  min-width: 100%;
  min-height: 100%;
}

/* list视图图片悬浮效果 */
.list-view .outfit-card:hover .outfit-image {
  transform: scale(1.05);
}

.season-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: #fff;
  font-weight: bold;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
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

.outfit-info {
  flex: 1;
  padding: 15px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.outfit-header {
  display: flex;
  align-items: center;
}

.outfit-name {
  font-size: 17px;
  color: #333;
  font-weight: 600;
  margin-right: 8px;
}

.recent-badge {
  background-color: #4776E6;
  color: #fff;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 500;
  box-shadow: 0 2px 5px rgba(71, 118, 230, 0.2);
}

.outfit-meta {
  display: flex;
  margin-top: 10px;
}

.meta-item {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #888;
  margin-right: 15px;
}

.meta-item text {
  margin-left: 5px;
}

.outfit-action {
  width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 网格视图 */
.grid-container {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -8px;
  width: 100%;
}

.grid-item {
  width: 50%;
  padding: 0 8px;
  margin-bottom: 16px;
  animation: fadeInUp 0.3s ease forwards;
  opacity: 0;
  box-sizing: border-box;
}

.grid-item:nth-child(1) { animation-delay: 0.1s; }
.grid-item:nth-child(2) { animation-delay: 0.15s; }
.grid-item:nth-child(3) { animation-delay: 0.2s; }
.grid-item:nth-child(4) { animation-delay: 0.25s; }
.grid-item:nth-child(5) { animation-delay: 0.3s; }
.grid-item:nth-child(6) { animation-delay: 0.35s; }
.grid-item:nth-child(7) { animation-delay: 0.4s; }
.grid-item:nth-child(8) { animation-delay: 0.45s; }

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.grid-item-inner {
  background-color: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.03);
  height: 100%;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.02);
  will-change: transform, box-shadow;
  
  &.active-press {
    transform: scale(0.95);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
    border-color: rgba(255, 82, 82, 0.5);
    background-color: rgba(255, 245, 245, 0.9);
  }
}

.grid-item-inner:active {
  transform: scale(0.98);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.grid-view .grid-image-container {
  height: 170px;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 16px 16px 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.grid-view .grid-image-container image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  border-radius: 16px 16px 0 0;
  transition: transform 0.3s ease;
  
  /* 确保图片完全覆盖容器 */
  min-width: 100%;
  min-height: 100%;
}

/* grid视图图片悬浮效果 */
.grid-view .outfit-card:hover .grid-image-container image {
  transform: scale(1.05);
}

.season-badge.small {
  width: 18px;
  height: 18px;
  font-size: 8px;
}

.recent-flag {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: #4776E6;
  color: #fff;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(71, 118, 230, 0.2);
}

.grid-info {
  padding: 12px;
}

.grid-name {
  font-size: 15px;
  color: #333;
  font-weight: 600;
  display: block;
  margin-bottom: 5px;
}

.grid-meta {
  font-size: 13px;
  color: #888;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 空状态 */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s ease;
}

.empty-state.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.empty-image {
  width: 160px;
  height: 160px;
  margin-bottom: 24px;
  opacity: 0.9;
}

.empty-text {
  font-size: 20px;
  color: #333;
  font-weight: 600;
  margin-bottom: 10px;
}

.empty-subtext {
  font-size: 15px;
  color: #888;
  text-align: center;
  line-height: 1.5;
  max-width: 270px;
}

/* 穿搭页面布局优化 - 为统一导航栏留空间 */
.outfit-container {
  padding-bottom: 80px;
}

/* 悬浮添加按钮 - 简化版本 */
.floating-add-btn {
  position: fixed;
  bottom: 100px;
  right: 24px;
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background: linear-gradient(135deg, #4776E6, #8E54E9);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(71, 118, 230, 0.25);
  opacity: 0;
  transform: scale(0.8) translateY(20px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 9;
  will-change: transform, box-shadow;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.floating-add-btn.animate-in {
  opacity: 1;
  transform: scale(1) translateY(0);
  transition-delay: 0.6s;
}

.floating-add-btn:active {
  transform: scale(0.92);
  box-shadow: 0 2px 12px rgba(71, 118, 230, 0.2);
}

/* 简化的加号图标 */
.simple-plus-icon {
  position: relative;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  }
  
.plus-line {
    position: absolute;
  background-color: #fff;
  border-radius: 1px;
  transition: all 0.2s ease;
}

.plus-line.horizontal {
  width: 16px;
  height: 2px;
}

.plus-line.vertical {
  width: 2px;
  height: 16px;
}

/* 悬停效果 */
.floating-add-btn:hover {
  transform: scale(1.05) translateY(-2px);
  box-shadow: 0 6px 20px rgba(71, 118, 230, 0.35);
}

.floating-add-btn:hover .plus-line {
  background-color: rgba(255, 255, 255, 0.95);
}

.floating-add-btn:hover .plus-line.horizontal {
  width: 18px;
}

.floating-add-btn:hover .plus-line.vertical {
  height: 18px;
}

/* 轻微的脉动提示 */
.floating-add-btn::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: 26px;
  background: linear-gradient(135deg, #4776E6, #8E54E9);
  opacity: 0;
  animation: gentle-pulse 4s ease-in-out infinite;
  z-index: -1;
}

@keyframes gentle-pulse {
  0%, 100% { 
    opacity: 0;
    transform: scale(1);
  }
  50% { 
    opacity: 0.15;
    transform: scale(1.08);
  }
}

/* 网格图标样式 */
.grid-icon-container {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.grid-icon {
  width: 18px;
  height: 18px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  grid-gap: 3px;
}

.grid-square {
  width: 100%;
  height: 100%;
  background-color: #aaa;
  border-radius: 2px;
  transition: all 0.3s;
}

.view-btn.active .grid-square {
  background-color: #4776E6;
}

.list-icon-container {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.list-icon {
  width: 18px;
  height: 18px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.list-line {
  width: 100%;
  height: 2px;
  background-color: #aaa;
  border-radius: 2px;
  transition: all 0.3s;
}

.view-btn.active .list-line {
  background-color: #4776E6;
}

.grid-edit-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  transition: all 0.2s ease;
  opacity: 0.8;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  
  &:active {
    transform: scale(0.9);
    opacity: 1;
    background-color: rgba(71, 118, 230, 0.8);
  }
}

/* 长按删除指示层样式 */
.long-press-indicator {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 82, 82, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.indicator-text {
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  background-color: rgba(0, 0, 0, 0.3);
  padding: 4px 12px;
  border-radius: 20px;
}

/* 添加喜爱程度显示样式 */
.rating-display {
  margin-left: auto;
}

.star-icons {
  display: flex;
  align-items: center;
}

.grid-rating {
  display: flex;
  margin-top: 4px;
  justify-content: center;
}
</style> 