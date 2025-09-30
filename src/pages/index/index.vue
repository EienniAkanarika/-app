<template>
  <view class="mobile-wardrobe-container">
    <!-- 渐变背景 -->
    <view class="gradient-bg"></view>

    <!-- 顶部状态栏安全区 -->
    <view class="status-bar-spacer"></view>

    <!-- 紧凑型头部 -->
    <view class="mobile-header">
      <view class="header-content">
        <view class="greeting-section">
          <text class="greeting-text">我的衣橱</text>
          <text class="greeting-subtitle">{{ currentClothes.length }}件{{ getCategoryName(activeCategory) }}</text>
        </view>
        
        <view class="header-actions">
          <view class="search-btn" @tap="toggleSearch">
            <AppIcon name="search" :size="20" color="white" />
          </view>
          
          <view class="profile-avatar" @tap="goToProfilePage">
            <text class="avatar-text">Me</text>
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
            placeholder="搜索衣物..."
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
      <!-- 水平滚动的分类标签 -->
      <scroll-view scroll-x class="category-scroll" show-scrollbar="false">
        <view class="category-tabs">
          <view 
            v-for="category in categories" 
            :key="category.key"
            class="category-tab" 
            :class="{ 'active': activeCategory === category.key }" 
            @tap="setActiveCategory(category.key)"
          >
            <view class="tab-icon">{{ category.emoji }}</view>
            <text class="tab-label">{{ category.label }}</text>
            <view v-if="getClothesCount(category.key) > 0" class="tab-count">
              {{ getClothesCount(category.key) }}
            </view>
          </view>
        </view>
      </scroll-view>
      
      <view class="clothes-grid" :class="{ 'animate-in': animateUI }">
        <view class="category-title">
          <text>{{ getCategoryName(activeCategory) }}</text>
          <text class="category-count">({{ currentClothes.length }})</text>
        </view>
        
        <view class="operation-tips">
          <text>点击<text class="tip-highlight">编辑图标</text>修改衣物信息，长按衣物可删除</text>
        </view>
        
        <view class="clothes-row" v-for="(row, rowIndex) in clothesRows" :key="rowIndex">
          <template v-for="(item, itemIndex) in row" :key="item.id">
            <view class="clothes-item add-item" v-if="item.isAddButton" @tap="addNewClothes()">
              <view class="add-clothes-icon">
                <view class="closet-icon">
                  <view class="closet-door left"></view>
                  <view class="closet-door right"></view>
                  <view class="closet-hanger"></view>
                </view>
                <view class="add-plus">
                  <text class="add-icon-line horizontal"></text>
                  <text class="add-icon-line vertical"></text>
                </view>
              </view>
              <text class="clothes-name">{{ item.name }}</text>
            </view>
            <view class="clothes-item" v-else @longpress="deleteClothes(item)">
              <image class="clothes-image" :src="item.image" mode="aspectFill" @tap="viewClothesImage(item)" @error="(e) => handleImageError(item, e)"></image>
              <view class="clothes-info">
                <text class="clothes-name">{{ item.name }}</text>
                <view class="clothes-edit-btn" hover-class="clothes-edit-btn-hover" @tap.stop="editClothes(item)">
                  <uni-icons type="compose" size="16" color="#4776E6"></uni-icons>
                </view>
    </view>
  </view>
</template>
        </view>
      </view>
    </view>
    
    <!-- 使用新的底部导航组件 -->
    <BottomNavigation :currentPath="'/pages/index/index'" />
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
// 移除登录相关引用
import { clothesApi } from '@/api'
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import { generateColorImageUrl } from '@/utils/colorUtils'
import AppIcon from '@/components/AppIcon.vue'
import { proxyImageUrl, generatePreviewUrl, getFullImageUrl } from '@/utils/imageUtils'
import { imageStorage } from '@/utils/imageStorage.js'
import BottomNavigation from '@/components/BottomNavigation.vue'

// 动画控制
const animateUI = ref(false)

// 当前选中的分类
const activeCategory = ref('shirt')

// 搜索相关
const showSearch = ref(false)
const searchText = ref('')

// 分类配置
const categories = ref([
  { key: 'hat', label: '帽子', emoji: '🧢' },
  { key: 'shirt', label: 'T恤', emoji: '👕' },
  { key: 'coat', label: '外套', emoji: '🧥' },
  { key: 'skirt', label: '裙子', emoji: '👗' },
  { key: 'pants', label: '裤子', emoji: '👖' },
  { key: 'suit', label: '西装', emoji: '👔' },
  { key: 'shoes', label: '鞋子', emoji: '👟' }
])

// 用户信息
const userInfo = ref(null)

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

// 图片加载重试计数器
const imageRetryMap = new Map();

// 衣物数据 - 初始化为空，完全依赖本地存储API
const clothesData = ref({
  hat: [],
  shirt: [],
  pants: [],
  coat: [],
  skirt: [],
  suit: [],
  shoes: []
})

// 使用自定义环境检测函数
const checkIsMpWeixin = () => {
  // 微信小程序环境特有的对象
  // #ifdef MP-WEIXIN
  return true;
  // #endif
  
  // 其他环境
  return false;
};

// 获取当前分类的衣物
const currentClothes = computed(() => {
  // 获取当前分类衣物
  const clothesList = clothesData.value[activeCategory.value] || [];
  
  // 判断是否在微信小程序环境中
  const isWxMiniApp = checkIsMpWeixin();
  
  // 如果是微信小程序环境，确保图片URL正确处理
  if (isWxMiniApp) {
    console.log('微信小程序环境：处理服务器图片URL');
    return clothesList.map(item => {
      // 克隆对象，避免修改原数据
      const newItem = { ...item };
      
      // 检查是否是服务器上传的图片
      const isServerUploadedImage = newItem.image && 
        typeof newItem.image === 'string' && 
        (newItem.image.includes('/uploads') || newItem.image.startsWith('http'));
      
      // 对服务器上传的图片进行处理
      if (isServerUploadedImage) {
        // 确保使用完整的服务器URL
        if (newItem.image.startsWith('/uploads')) {
          newItem.image = 'https://tztoyseauzso.sealosbja.site' + newItem.image;
          console.log(`将相对路径转为绝对URL: ${newItem.image}`);
        }
      }
      
      return newItem;
    });
  }
  
  // 返回原始数据
  return clothesList;
})

// 重新生成衣物的行结构
const clothesRows = computed(() => {
  const rows = []
  const clothes = currentClothes.value
  
  for (let i = 0; i < clothes.length; i += 2) {
    const row = []
    row.push(clothes[i])
    if (clothes[i + 1]) {
      row.push(clothes[i + 1])
    }
    rows.push(row)
  }
  
  // 如果行数小于2，确保第二行有"添加衣物"按钮
  if (rows.length < 2) {
    rows.push([])
  }
  
  if (rows[rows.length - 1].length < 2) {
    rows[rows.length - 1].push({ id: 'add', name: '添加衣物', isAddButton: true })
  } else {
    rows.push([{ id: 'add', name: '添加衣物', isAddButton: true }])
  }
  
  return rows
})

// 设置激活的分类
const setActiveCategory = (category) => {
  activeCategory.value = category
}

// 查看衣物详情
const viewClothesDetail = (item) => {
  uni.showToast({
    title: `查看${item.name}详情`,
    icon: 'none'
  })
}

// 编辑衣物
const editClothes = (item) => {
  // 获取衣物ID（支持_id或id）
  const clothesId = item._id || item.id;
  if (!clothesId) {
    console.error('编辑失败：衣物ID不存在', item);
    uni.showToast({
      title: '编辑失败：ID不存在',
      icon: 'none'
    });
    return;
  }
  
  // 打印日志
  console.log(`准备编辑衣物 ${item.name}，ID: ${clothesId}，分类: ${activeCategory.value}`);
  
  // 先缓存参数，避免参数传递问题
  try {
    uni.setStorageSync('edit_clothes_params', {
      id: clothesId,
      category: activeCategory.value
    });
  } catch (e) {
    console.error('缓存参数失败:', e);
  }
  
  // 显示加载提示
  uni.showLoading({
    title: '加载中...',
    mask: true
  });
  
  // 使用navigateTo跳转到编辑页面
  uni.navigateTo({
    url: `/pages/edit-clothes/index?category=${activeCategory.value}&id=${clothesId}`,
    success: () => {
      uni.hideLoading();
      console.log(`成功跳转到编辑页面，衣物：${item.name}，ID: ${clothesId}`);
    },
    fail: (err) => {
      uni.hideLoading();
      console.error('跳转到编辑页面失败:', err);
      uni.showToast({
        title: '页面跳转失败',
        icon: 'none'
      });
    }
  });
}

// 删除衣物
const deleteClothes = (item) => {
  // 检查衣物对象是否存在
  if (!item) {
    console.error('删除失败：衣物对象不存在');
    uni.showToast({
      title: '删除失败：衣物不存在',
      icon: 'none'
    });
    return;
  }
  
  // 打印整个衣物对象，便于调试
  console.log('要删除的衣物对象:', item);
  
  // 获取衣物ID（支持_id或id）
  const clothesId = item._id || item.id;
  
  if (!clothesId) {
    console.error('删除失败：衣物ID不存在', item);
    uni.showToast({
      title: '删除失败：ID不存在',
      icon: 'none'
    });
    return;
  }
  
  // 打印要删除的衣物信息，便于调试
  console.log('准备删除衣物:', clothesId, item.name);
  
  uni.showModal({
    title: '确认删除',
    content: `确定要删除"${item.name}"吗？此操作不可撤销。`,
    confirmColor: '#E74C3C',
    success: (res) => {
      if (res.confirm) {
        // 显示加载
        uni.showLoading({
          title: '删除中...',
          mask: true
        });
        
        // 调用API删除衣物
        clothesApi.remove(clothesId)
          .then(result => {
            uni.hideLoading();
            console.log('删除衣物API响应:', result);
            
            if (result && result.code === 200) {
              // 从本地数据中删除
              const category = activeCategory.value;
              clothesData.value[category] = clothesData.value[category].filter(clothing => {
                const currentId = clothing._id || clothing.id;
                return currentId !== clothesId;
              });
        
        uni.showToast({
          title: '删除成功',
          icon: 'success'
              });
            } else {
              uni.showToast({
                title: result?.message || '删除失败',
                icon: 'none'
              });
    }
  })
          .catch(error => {
            uni.hideLoading();
            console.error('删除衣物失败:', error);
            uni.showToast({
              title: '删除失败，请重试',
              icon: 'none'
            });
          });
      }
    }
  });
}

// 添加新衣物
const addNewClothes = () => {
  uni.navigateTo({
    url: `/pages/add-clothes/index?category=${activeCategory.value}`
  })
}

// 搜索相关方法
const toggleSearch = () => {
  showSearch.value = !showSearch.value
  if (!showSearch.value) {
    searchText.value = ''
  }
}

const handleSearch = () => {
  // 实现搜索逻辑
  console.log('搜索:', searchText.value)
}

const clearSearch = () => {
  searchText.value = ''
}

// 获取分类衣物数量
const getClothesCount = (category) => {
  return clothesData.value[category]?.length || 0
}

// 获取分类的中文名称
const getCategoryName = (category) => {
  const categoryMap = {
    hat: '帽子',
    shirt: 'T恤',
    pants: '裤子',
    coat: '外套',
    skirt: '裙子',
    suit: '西装',
    shoes: '鞋子'
  }
  return categoryMap[category] || '衣物'
}

// 前往穿搭页面
const goToMatchPage = () => {
  uni.navigateTo({
    url: '/pages/outfit/index'
  })
}

// 前往个人信息页面
const goToProfilePage = () => {
  uni.navigateTo({
    url: '/pages/profile/index'
  })
}

// 退出登录功能已移至个人信息页面

// 加载衣物数据
const loadClothes = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      // 显示加载提示
      uni.showLoading({ 
        title: '加载中...',
        mask: true 
      });
      
      console.log('正在从API加载衣物数据...');
      
      // 从API获取衣物列表
      const result = await clothesApi.getList();
      console.log('获取衣物列表响应:', result);
      
      if (result && result.code === 200 && result.data) {
        // 数据分类处理
        const categorizedData = {
          hat: [],
          shirt: [],
          pants: [],
          coat: [],
          skirt: [],
          suit: [],
          shoes: []
        };
        
        // 检查API返回数据格式
        const apiData = result.data;
        console.log('API返回的数据格式:', typeof apiData, apiData);
        
        // 处理 { total, list } 格式的数据
        if (apiData.list && Array.isArray(apiData.list)) {
          console.log(`从API获取到 ${apiData.list.length} 件衣物`);
          
          // 判断是否在微信小程序环境中
          const isWxMiniApp = checkIsMpWeixin();
          
          // 遍历列表，按分类整理
          apiData.list.forEach(item => {
            // 确保每个衣物对象有id属性（可能是_id）
            if (item._id && !item.id) {
              item.id = item._id; // 兼容性处理，确保同时有id属性
            }
            
            // 处理图片URL
            if (item.image) {
              // 检查图片类型
              if (item.image.startsWith('data:image/')) {
                // Base64图片（新的本地存储格式），直接使用
                console.log(`衣物 ${item.name || '未命名'} 使用本地Base64图片`);
              } else if (item.image.includes('/uploads') || item.image.startsWith('http')) {
                // 服务器上传的图片路径
                const isServerUploadedImage = true;
                
                // 如果是微信小程序环境处理图片URL
                if (isWxMiniApp && item.image.startsWith('/uploads')) {
                  // 转换为完整URL
                  item.image = 'https://tztoyseauzso.sealosbja.site' + item.image;
                  console.log(`微信小程序环境：转换为完整URL: ${item.image}`);
                } else if (!isWxMiniApp && !item.image.startsWith('http')) {
                  // 非微信小程序环境，使用辅助函数处理图片URL
                  item.image = getFullImageUrl(item.image);
                  console.log(`处理后的图片URL: ${item.image}`);
                }
              } else {
                // 其他格式，可能是本地路径，保持原样
                console.log(`衣物 ${item.name || '未命名'} 使用图片路径: ${item.image}`);
              }
            } else {
              // 如果没有图片，使用内联的SVG数据URI
              const color = item.color || '#cccccc';
              item.image = `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23${color.replace('#', '')}" /%3E%3C/svg%3E`;
              console.log(`衣物 ${item.name || '未命名'} 没有图片URL，使用颜色块替代`);
            }
            
            // 确保每个衣物有rating字段
            if (item.rating === undefined || item.rating === null) {
              console.log(`衣物 ${item.name || '未命名'} 没有喜爱程度数据，设置默认值3`);
              item.rating = 3;
            } else {
              // 使用Number()函数确保rating是数字类型
              const ratingNum = Number(item.rating);
              item.rating = !isNaN(ratingNum) ? ratingNum : 3;
              console.log(`衣物 ${item.name || '未命名'} 喜爱程度: ${item.rating}`);
            }
            
            if (categorizedData[item.category]) {
              categorizedData[item.category].push(item);
              console.log(`将衣物 ${item.name} 添加到 ${item.category} 分类，ID: ${item.id || item._id}`);
            } else {
              console.warn(`未知的衣物分类: ${item.category}`, item);
            }
          });
        }
        // 如果data本身是对象而不是数组，可能已经是分类好的数据
        else if (typeof apiData === 'object' && !Array.isArray(apiData) && !apiData.list) {
          // 遍历分类对象
          Object.keys(apiData).forEach(category => {
            if (Array.isArray(apiData[category]) && categorizedData[category]) {
              // 确保每个衣物有rating字段
              apiData[category].forEach(item => {
                if (item.rating === undefined || item.rating === null) {
                  item.rating = 3;
                } else {
                  const ratingNum = Number(item.rating);
                  item.rating = !isNaN(ratingNum) ? ratingNum : 3;
                }
              });
              
              categorizedData[category] = apiData[category];
              console.log(`从API加载${category}分类数据:`, apiData[category].length, '件');
            }
          });
        } 
        // 如果data是数组，需要按分类整理
        else if (Array.isArray(apiData)) {
          apiData.forEach(item => {
            // 确保每个衣物有rating字段
            if (item.rating === undefined || item.rating === null) {
              item.rating = 3;
            } else {
              const ratingNum = Number(item.rating);
              item.rating = !isNaN(ratingNum) ? ratingNum : 3;
            }
            
            if (categorizedData[item.category]) {
              categorizedData[item.category].push(item);
            }
          });
        } else {
          console.warn('API返回的数据格式无法识别:', apiData);
        }
        
        // 按照喜爱程度(rating)从高到低排序每个分类中的衣物
        Object.keys(categorizedData).forEach(category => {
          if (categorizedData[category].length > 0) {
            categorizedData[category].sort((a, b) => {
              const ratingA = Number(a.rating || 0);
              const ratingB = Number(b.rating || 0);
              return ratingB - ratingA; // 降序排列（从高到低）
            });
            console.log(`分类 ${category} 的衣物已按喜爱程度排序`);
          }
        });
        
        // 更新本地数据
        Object.keys(categorizedData).forEach(category => {
          // 始终更新数据，即使是空数组，这样可以清除旧的硬编码数据
          clothesData.value[category] = categorizedData[category];
          console.log(`分类 ${category} 加载了 ${categorizedData[category].length} 件衣物`);
        });
        
        // 隐藏加载提示
        uni.hideLoading();
        resolve();
      } else {
        console.warn('API返回数据格式不正确:', result);
        uni.hideLoading();
        reject(new Error('API返回数据格式不正确'));
      }
    } catch (error) {
      console.error('加载衣物数据失败:', error);
      uni.hideLoading();
      uni.showToast({
        title: '加载失败，请重试',
        icon: 'none',
        duration: 2000
      });
      reject(error);
    }
  });
};

// 处理下拉刷新
const handlePullDownRefresh = async () => {
  console.log('触发下拉刷新');
  
  try {
    // 刷新数据
    await loadClothes();
  } catch (error) {
    console.error('下拉刷新加载数据失败:', error);
  } finally {
    // 停止下拉刷新动画
    uni.stopPullDownRefresh();
  }
};

// 注册下拉刷新处理函数
onPullDownRefresh(handlePullDownRefresh);

// 生命周期钩子 - 页面创建时
onMounted(() => {
  
  // 加载衣物数据
  loadClothes();
  
  // 动画效果
  setTimeout(() => {
    animateUI.value = true;
  }, 100);
})

// 生命周期钩子 - 页面显示时
onShow(() => {
  // 每次页面显示时，刷新衣物数据
  console.log('页面显示，准备刷新衣物数据...');
  
  // 添加短暂延时，确保从添加页面返回后能够刷新到最新数据
  setTimeout(() => {
    loadClothes().then(() => {
      console.log('页面显示后数据刷新完成');
      // 检查每个分类的数据状态
      Object.keys(clothesData.value).forEach(category => {
        console.log(`分类 ${category} 现有数据数量:`, clothesData.value[category].length);
      });
    });
  }, 300);
})

// getFullImageUrl 函数已从 @/utils/imageUtils 导入，无需重复定义

// 处理图片加载错误
const handleImageError = (item, e) => {
  console.error(`图片加载失败: ${item.name}`, item);
  // 在控制台输出原始图片URL，便于排查
  console.log('原始图片URL:', item.image);
  
  // 尝试修复图片URL
  if (item.image && typeof item.image === 'string') {
    if (item.image.startsWith('/uploads')) {
      // 添加服务器域名
      item.image = 'https://tztoyseauzso.sealosbja.site' + item.image;
      console.log('尝试使用完整URL:', item.image);
      return; // 返回，让图片重新加载
    }
    
    // 如果是Base64图片加载失败，可能是数据损坏，尝试从imageStorage重新获取
    if (item.image.startsWith('data:image/') && item.imageId) {
      console.log(`尝试从本地存储重新获取图片: ${item.imageId}`);
      try {
        const storedImage = imageStorage.getImage(item.imageId);
        if (storedImage && storedImage !== item.image) {
          item.image = storedImage;
          console.log(`成功从本地存储恢复图片: ${item.name}`);
          return; // 让图片重新加载
        }
      } catch (error) {
        console.warn('无法从本地存储恢复图片:', error);
      }
    }
  }
  
  // 如果无法修复，使用颜色块作为备选方案
  console.log(`图片 ${item.name} 加载失败，使用颜色块替代`);
  const color = item.color || '#cccccc';
  item.image = `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23${color.replace('#', '')}" /%3E%3C/svg%3E`;
}

// 使用颜色块替代默认图片
const useDefaultImage = (item) => {
  // 使用内联SVG数据替代，避免使用外部图片文件
  item.image = `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23${(item.color || '#cccccc').replace('#', '')}" /%3E%3C/svg%3E`;
  console.log(`为衣物 ${item.name} 生成颜色块替代图片`);
}

// 查看衣物图片
const viewClothesImage = (item) => {
  // 确保有图片URL
  if (!item.image) {
    uni.showToast({
      title: '该衣物无图片',
      icon: 'none',
      duration: 2000
    });
    return;
  }

  // 检查是否是简单的颜色块SVG（而不是真实的图片）
  if (item.image.startsWith('data:image/svg+xml') && 
      item.image.includes('%3Crect width="100" height="100"')) {
    // 如果是简单的颜色块SVG，显示提示
    uni.showToast({
      title: '该衣物仅有颜色信息',
      icon: 'none',
      duration: 2000
    });
    return;
  }
  
  // 判断是否在微信小程序环境中
  const isWxMiniApp = checkIsMpWeixin();
  
  // 检查是否是服务器上传的图片
  const isServerUploadedImage = typeof item.image === 'string' && 
    (item.image.includes('/uploads') || item.image.startsWith('http'));
  
  // 展示操作提示
  uni.showToast({
    title: '查看图片中...',
    icon: 'none',
    duration: 500
  });
  
  // 确保图片URL是完整的
  let previewUrl = item.image;
  if (isServerUploadedImage && item.image.startsWith('/uploads')) {
    previewUrl = 'https://tztoyseauzso.sealosbja.site' + item.image;
  }
  
  console.log(`预览图片: ${item.name}，URL:`, previewUrl);
  
  // 使用uni.previewImage API预览图片
  uni.previewImage({
    urls: [previewUrl],
    current: 0,
    indicator: 'number',
    loop: false,
    success: () => {
      console.log('图片预览成功');
    },
    fail: (err) => {
      console.error('图片预览失败:', err);
      uni.showToast({
        title: '图片预览失败',
        icon: 'none'
      });
    }
  });
}
</script>

<style lang="scss">
@use '@/styles/mobile-design-system.scss';

page {
  background-color: #f8f9fa;
}

.mobile-wardrobe-container {
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

.search-btn {
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

.search-icon {
  width: 20px;
  height: 20px;
  fill: white;
}

.profile-avatar {
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background: linear-gradient(135deg, #FF6B6B, #4ECDC4);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.95);
  }
}

.avatar-text {
  font-size: 14px;
  font-weight: 600;
  color: white;
}

/* 搜索容器 */
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
  position: relative;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  height: 44px;
}

.search-input-icon {
  width: 18px;
  height: 18px;
  fill: rgba(255, 255, 255, 0.7);
  margin-right: 12px;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: white;
  font-size: 16px;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }
}

.clear-search {
  width: 20px;
  height: 20px;
  cursor: pointer;
  
  svg {
    width: 100%;
    height: 100%;
    fill: rgba(255, 255, 255, 0.7);
  }
}

/* 移动端内容区域 */
.mobile-content {
  flex: 1;
  background: white;
  border-radius: 24px 24px 0 0;
  margin-top: 20px;
  position: relative;
  z-index: 5;
  transform: translateY(30px);
  opacity: 0;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  
  &.animate-in {
    transform: translateY(0);
    opacity: 1;
  }
}

/* 分类标签滚动区域 */
.category-scroll {
  white-space: nowrap;
  padding: 20px 0 16px;
}

.category-tabs {
  display: flex;
  padding: 0 20px;
  gap: 12px;
}

.category-tab {
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
    
    .tab-icon {
      transform: scale(1.1);
    }
    
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

.tab-icon {
  font-size: 24px;
  margin-bottom: 4px;
  transition: transform 0.3s ease;
}

.tab-label {
  font-size: 12px;
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

/* 退出登录相关样式已移至个人信息页面 */

.content-box {
  flex: 1;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(15px);
  border-top-left-radius: 32px;
  border-top-right-radius: 32px;
  box-shadow: 0 -8px 30px rgba(76, 132, 255, 0.12);
  z-index: 2;
  display: flex;
  padding: 25px 0;
  margin-bottom: 75px;
  transition: transform 0.4s ease-out, opacity 0.4s ease-out;
  transform: translateY(20px);
  opacity: 0;
}

.content-box.animate-in {
  transform: translateY(0);
  opacity: 1;
}

.sidebar {
  width: 85px;
  padding: 15px 0;
  border-right: 1px solid rgba(238, 238, 238, 0.8);
  opacity: 0;
  transform: translateX(-20px);
  transition: all 0.5s ease;
}

.sidebar.animate-in {
  opacity: 1;
  transform: translateX(0);
}

.category-item {
  height: 55px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.3s ease;
  margin-bottom: 5px;
  border-radius: 0 8px 8px 0;
  padding-right: 10px;
}

.category-item:active {
  background-color: rgba(76, 132, 255, 0.05);
}

.category-item text {
  font-size: 15px;
  color: #666;
  transition: all 0.3s ease;
}

.category-item.active {
  font-weight: bold;
  background-color: rgba(76, 132, 255, 0.08);
}

.category-item.active text {
  color: #4776E6;
}

.category-item.active::after {
  content: '';
  position: absolute;
  left: 0;
  height: 32px;
  width: 4px;
  background: linear-gradient(to bottom, #4776E6, #8E54E9);
  border-radius: 0 4px 4px 0;
}

.clothes-grid {
  flex: 1;
  padding: 10px 25px;
  display: flex;
  flex-direction: column;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s ease;
}

.clothes-grid.animate-in {
  opacity: 1;
  transform: translateY(0);
  transition-delay: 0.2s;
}

.category-title {
  font-size: 22px;
  font-weight: 700;
  color: #333;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

.category-count {
  font-size: 15px;
  color: #999;
  font-weight: normal;
  margin-left: 8px;
}

.operation-tips {
  font-size: 12px;
  color: #999;
  margin-bottom: 15px;
  padding-left: 2px;
}

.clothes-row {
  display: flex;
  margin-bottom: 22px;
  gap: 18px;
}

.clothes-item {
  flex: 1;
  background-color: #fff;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  min-height: 140px;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(0, 0, 0, 0.03);
  position: relative;
}

.clothes-item:active {
  transform: scale(0.97);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.04);
}

.clothes-image {
  flex: 1;
  width: 100%;
  min-height: 110px;
  background-color: #f8f8f8;
  border-bottom: 1px solid #f0f0f0;
}

.clothes-info {
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.clothes-name {
  font-size: 15px;
  color: #333;
  text-align: center;
  font-weight: 500;
}

.add-item {
  background: linear-gradient(145deg, rgba(76, 132, 255, 0.05), rgba(142, 84, 233, 0.08));
  border: 2px dashed rgba(76, 132, 255, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.add-item:active {
  background: linear-gradient(145deg, rgba(76, 132, 255, 0.1), rgba(142, 84, 233, 0.12));
  border: 2px dashed rgba(76, 132, 255, 0.5);
  transform: scale(0.98);
}

.add-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent 30%, rgba(76, 132, 255, 0.02) 50%, transparent 70%);
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.add-item:hover::before {
  transform: translateX(100%);
}

/* 添加衣物图标容器 */
.add-clothes-icon {
  position: relative;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

/* 衣柜图标 */
.closet-icon {
  position: relative;
  width: 32px;
  height: 28px;
}

.closet-door {
  position: absolute;
  top: 2px;
  width: 14px;
  height: 24px;
  background: linear-gradient(135deg, #4776E6, #8E54E9);
  border-radius: 2px;
  transition: all 0.3s ease;
}

.closet-door.left {
  left: 1px;
  transform-origin: left center;
}

.closet-door.right {
  right: 1px;
  transform-origin: right center;
}

.closet-hanger {
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: 6px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 1px;
}

.closet-hanger::before {
  content: '';
  position: absolute;
  top: 5px;
  left: 50%;
  transform: translateX(-50%);
  width: 8px;
  height: 1px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 0.5px;
}

/* 加号 */
.add-plus {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #4CD964, #32D74B);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(76, 217, 100, 0.3);
  border: 2px solid #fff;
}

.add-icon-line {
  background-color: #fff;
  position: absolute;
  border-radius: 1px;
}

.add-icon-line.horizontal {
  width: 10px;
  height: 2px;
}

.add-icon-line.vertical {
  width: 2px;
  height: 10px;
}

/* 悬停动画 */
.add-item:hover .closet-door.left {
  transform: perspective(50px) rotateY(-25deg);
}

.add-item:hover .closet-door.right {
  transform: perspective(50px) rotateY(25deg);
}

.add-item:hover .add-plus {
  transform: scale(1.1) rotate(90deg);
  box-shadow: 0 3px 12px rgba(76, 217, 100, 0.4);
}

/* 响应式优化 */
@media (max-width: 480px) {
  .mobile-header {
    padding: 12px 16px 6px;
  }
  
  .greeting-text {
    font-size: 24px;
  }
  
  .category-tabs {
    padding: 0 16px;
    gap: 8px;
  }
  
  .category-tab {
    min-width: 70px;
    padding: 10px 12px;
  }
  
  .tab-icon {
    font-size: 20px;
  }
}

@media (max-width: 375px) {
  .mobile-header {
    padding: 10px 14px 4px;
  }
  
  .greeting-text {
    font-size: 22px;
  }
  
  .header-actions {
    gap: 8px;
  }
  
  .search-btn, .profile-avatar {
    width: 36px;
    height: 36px;
  }
  
  .category-tab {
    min-width: 60px;
    padding: 8px 10px;
  }
  
  .tab-icon {
    font-size: 18px;
  }
  
  .tab-label {
    font-size: 11px;
  }
}

/* 优化滚动性能 */
.category-scroll {
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}

/* 现代化触摸反馈 */
.touch-feedback {
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.tip-highlight {
  color: #4776E6;
  font-weight: 500;
}

.clothes-edit-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(71, 118, 230, 0.08);
  transition: all 0.25s ease;
}

.clothes-edit-btn:active, .clothes-edit-btn-hover {
  transform: scale(0.9);
  background-color: rgba(71, 118, 230, 0.15);
}
</style>

