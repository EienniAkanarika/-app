<template>
  <view class="mobile-create-outfit-container">
    <!-- 渐变背景 -->
    <view class="gradient-bg"></view>

    <!-- 顶部状态栏安全区 -->
    <view class="status-bar-spacer"></view>

    <!-- 统一的移动端头部 -->
    <view class="mobile-header">
      <view class="header-content">
      <view class="back-btn" @tap="goBack">
          <AppIcon name="back" :size="20" color="white" />
      </view>
      <text class="header-title">{{ isEditMode ? '编辑穿搭方案' : '创建穿搭方案' }}</text>
        <view class="header-placeholder"></view>
      </view>
    </view>

    <!-- 内容区域 -->
    <view class="content-box">
      <!-- 基本信息 -->
      <view class="info-section" :class="{ 'animate-in': animateUI }">
        <view class="input-group name-input">
          <input class="input-field outfit-name" type="text" placeholder="给你的穿搭起个名字..." v-model="outfitName"/>
        </view>
        
        <view class="tags-section">
          <view class="tags-row season-tags">
            <text class="tags-label">季节：</text>
            <view 
              v-for="(season, key) in seasonLabels" 
              :key="key" 
              class="season-tag" 
              :class="{ 'active': selectedSeason === key }"
              @tap="changeSelectedSeason(key)"
            >
              {{ season }}
            </view>
          </view>
          
          <view class="tags-row scene-tags">
            <text class="tags-label">场景：</text>
            <scroll-view scroll-x class="tags-scroll">
              <view class="tags-scroll-content">
                <view 
                  v-for="(scene, index) in scenes" 
                  :key="index" 
                  class="scene-tag" 
                  :class="{ 'active': selectedScene === scene.value }"
                  @tap="changeSelectedScene(scene.value)"
                >
                  {{ scene.label }}
                </view>
              </view>
            </scroll-view>
          </view>
        </view>
      </view>
      
      <!-- 搭配衣物 -->
      <view class="items-section card-shadow" :class="{ 'animate-in': animateUI }">
        <view class="section-title">
          <text>搭配衣物</text>
          <text class="item-count">{{ selectedItems.length }}件</text>
        </view>
        
        <!-- 已选衣物 -->
        <view v-if="selectedItems.length > 0" class="selected-items">
          <scroll-view scroll-x class="items-scroll">
            <view class="items-scroll-content">
              <view 
                v-for="(item, index) in processedSelectedItems" 
                :key="index"
                class="item-card"
              >
                <view class="item-card-inner">
                  <view class="item-img-container">
                    <image 
                      :src="item.image" 
                      :data-item="item.id || item._id" 
                      mode="aspectFill"
                      @error="handleImageError"
                    ></image>
                    <view class="item-category">{{getCategoryLabel(item.category)}}</view>
                    <view class="remove-btn" @tap.stop="removeItem(index)">
                      <AppIcon name="close" :size="12" color="#fff" />
                    </view>
                  </view>
                  <text class="item-name">{{ item.name }}</text>
                </view>
              </view>
              
              <view class="add-item-card" @tap="showClothesSelector">
                <view class="add-icon">
                  <AppIcon name="plus" :size="24" color="#4776E6" />
                </view>
              </view>
            </view>
          </scroll-view>
        </view>
        
        <!-- 未选择任何衣物时显示 -->
        <view v-else class="empty-items" @tap="showClothesSelector">
          <AppIcon name="plus" :size="32" color="#999" />
          <text>添加衣物开始搭配</text>
        </view>
      </view>
      
      <!-- 穿搭效果预览 -->
      <view class="preview-section card-shadow" :class="{ 'animate-in': animateUI }">
        <view class="section-title">
          <text>穿搭效果</text>
          <view class="preview-actions">
            <view v-if="selectedItems.length > 0" class="upload-btn" @tap="uploadPreviewImage">
              <AppIcon name="camera" :size="14" color="#4776E6" />
              <text>{{ previewImage ? '更换照片' : '上传照片' }}</text>
            </view>
          </view>
        </view>
        
        <view class="preview-container" @tap="handlePreviewClick">
          <template v-if="previewImage">
            <image 
              class="preview-image" 
              :src="previewImage" 
              mode="aspectFill"
              @error="handleImageError"
            ></image>
            <view v-if="isCustomUpload" class="custom-upload-tag">自定义照片</view>
          </template>
          <template v-else>
            <view class="upload-preview">
              <AppIcon name="camera" :size="32" color="#ccc" />
              <text>{{ selectedItems.length > 0 ? '点击上传穿搭效果图' : '请先添加衣物' }}</text>
              <text v-if="selectedItems.length > 0" class="upload-subtext">上传真实的穿搭照片展示效果</text>
            </view>
          </template>
        </view>
      </view>
      
      <!-- 喜爱程度 -->
      <view class="rating-section card-shadow" :class="{ 'animate-in': animateUI }">
        <view class="section-title">
          <text>喜爱程度</text>
          <text class="rating-value">{{ outfitRating }}/5 星</text>
        </view>
        <view class="rating-container">
          <view 
            v-for="i in 5" 
            :key="i" 
            class="rating-star" 
            :class="{ 'rating-star-filled': outfitRating >= i, 'rating-star-empty': outfitRating < i }"
            @tap="setRating(i)"
          >
            <view class="star-icon">
              <view class="star-shape"></view>
          </view>
        </view>
        </view>
      </view>
      
      <!-- 穿搭笔记 -->
      <view class="notes-section card-shadow" :class="{ 'animate-in': animateUI }">
        <view class="section-title">穿搭笔记</view>
        <textarea 
          class="notes-input" 
          placeholder="记录一下这套穿搭的搭配要点、适合场合等..." 
          v-model="outfitNotes"
        ></textarea>
      </view>
      
    </view>
    
    <!-- 底部操作区 -->
    <view class="bottom-btns" :class="{ 'animate-in': animateUI }">
      <view class="cancel-btn" @tap="goBack">取消</view>
      <view class="save-btn" :class="{'highlight': saveButtonHighlight}" @tap="saveOutfit">{{ isEditMode ? '保存修改' : '保存方案' }}</view>
    </view>
    
    <!-- 选择衣物弹窗 -->
    <view class="clothes-selector" v-if="showSelector" @tap="hideClothesSelector">
      <view class="selector-content" @tap.stop>
        <view class="selector-header">
          <text class="selector-title">选择衣物</text>
          <view class="header-actions">
            <view class="refresh-btn" @tap="refreshClothesData" title="刷新衣物数据">
              <AppIcon name="refresh" :size="18" color="#666" />
            </view>
          <view class="close-btn" @tap="hideClothesSelector">
            <uni-icons type="close" size="22" color="#333"></uni-icons>
            </view>
          </view>
        </view>
        
        <view class="search-bar">
          <uni-icons type="search" size="18" color="#999"></uni-icons>
          <input class="search-input" type="text" placeholder="搜索衣物..." v-model="searchText" />
          <uni-icons v-if="searchText" type="clear" size="16" color="#ccc" @tap="searchText=''"></uni-icons>
        </view>
        
        <view class="category-tabs">
          <view 
            v-for="(category, index) in categories" 
            :key="index"
            class="category-tab"
            :class="{ 'active': activeCategory === category.value }"
            @tap="activeCategory = category.value"
          >
            {{ category.label }}
          </view>
        </view>
        
        <view class="clothes-grid">
          <template v-if="loading">
            <view class="loading-container">
              <view class="loading-spinner"></view>
              <text class="loading-text">正在加载衣物数据...</text>
            </view>
          </template>
          <template v-else-if="filteredClothes.length === 0">
            <view class="empty-clothes">
              <uni-icons type="info" size="30" color="#ccc"></uni-icons>
              <text>没有找到衣物</text>
              <text class="empty-subtext">{{ searchText ? '请尝试其他搜索词' : '您的衣橱是空的，请先添加衣物' }}</text>
            </view>
          </template>
          <template v-else>
          <view 
            v-for="(item, index) in filteredClothes" 
            :key="index"
            class="clothes-item"
            :class="{ 'selected': isItemSelected(item) }"
            @tap="toggleSelectItem(item)"
          >
              <image 
                :src="item.image" 
                :data-item="item.id || item._id" 
                mode="aspectFill" 
                @error="handleImageError"
              ></image>
            <view class="item-name-label">{{item.name}}</view>
            <view class="item-select-indicator">
              <uni-icons type="checkmarkempty" size="16" color="#fff"></uni-icons>
            </view>
          </view>
          </template>
        </view>
        
        <view class="selector-bottom">
          <view class="done-btn" @tap="confirmSelection">
            确定 ({{ tempSelectedItems.length }})
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch, onMounted, getCurrentInstance } from 'vue'
import { uploadImage } from '@/utils/imageUtils'
import { onLoad, onReady, onShow } from '@dcloudio/uni-app'
import { compressImage } from '@/utils/imageUtils'
import AppIcon from '@/components/AppIcon.vue'
import * as outfitApi from '@/api/outfit.js'
import { clothesApi } from '@/api'
import { generateColorImageUrl } from '@/utils/colorUtils'
import dataSyncTest from '@/utils/dataSyncTest.js'
import { imageStorage } from '@/utils/imageStorage.js'
import uniCameraFix from '@/utils/uniCameraFix.js'
import appImageHandler from '@/utils/appImageHandler.js'
import imageCompatibility from '@/utils/imageCompatibility.js'

// 使用ref存储页面实例，确保在异步操作中也能访问
const pageInstance = ref(null)

// 获取当前组件实例
const instance = getCurrentInstance();
const _self = instance ? instance.proxy : null;

// 获取当前页面实例的函数
const getPageInstance = () => {
  // 如果已经存储了页面实例，直接返回
  if (pageInstance.value) {
    return pageInstance.value;
  }
  
  // 尝试获取当前页面实例
  try {
    const pages = getCurrentPages();
    if (pages && pages.length > 0) {
      const currentPage = pages[pages.length - 1];
      pageInstance.value = currentPage;
      console.log('成功获取当前页面实例');
      return currentPage;
    }
  } catch (err) {
    console.error('获取页面实例失败:', err);
  }
  
  // 如果无法获取页面实例，尝试返回组件实例
  console.warn('无法获取页面实例，尝试使用组件实例');
  return _self;
}

// 页面动画控制
const animateUI = ref(false)
const saveButtonHighlight = ref(false)

// 基本信息
const outfitName = ref('')
const selectedScene = ref('daily')
const selectedSeason = ref('spring')
const outfitNotes = ref('')
const outfitRating = ref(3) // 添加喜爱程度，默认为3星
const previewImage = ref('')
const isCustomUpload = ref(false) // 标记是否为自定义上传的照片

// 编辑模式标识
const isEditMode = ref(false)
const editOutfitId = ref('')

// 衣物选择相关
const showSelector = ref(false)
const activeCategory = ref('all')
const selectedItems = ref([])
const tempSelectedItems = ref([])
const searchText = ref('')

// 衣物数据
const clothesData = ref([])
const loading = ref(false)

// 表单状态跟踪
const formChanged = ref(false)
const originalOutfit = ref(null)

// 季节标签文本
const seasonLabels = {
  spring: '春',
  summer: '夏',
  autumn: '秋',
  winter: '冬'
}

// 场景选项
const scenes = [
  { label: '日常', value: 'daily' },
  { label: '职场', value: 'work' },
  { label: '约会', value: 'date' },
  { label: '聚会', value: 'party' },
  { label: '旅行', value: 'travel' },
  { label: '运动', value: 'sports' },
  { label: '休闲', value: 'casual' },
  { label: '正式', value: 'formal' }
]

// 衣物分类
const categories = [
  { label: '全部', value: 'all' },
  { label: '帽子', value: 'hat' },
  { label: 'T恤', value: 'shirt' },
  { label: '外套', value: 'coat' },
  { label: '裙子', value: 'skirt' },
  { label: '裤子', value: 'pants' },
  { label: '西装', value: 'suit' },
  { label: '鞋子', value: 'shoes' },
  { label: '配饰', value: 'accessory' }
]

// 根据季节生成背景颜色
const getSeasonBackground = (season) => {
  const colors = {
    spring: '#E8F5E9',  // 浅绿色
    summer: '#E3F2FD',  // 浅蓝色
    autumn: '#FFF3E0',  // 橙黄色
    winter: '#E8EAF6'   // 浅紫色
  }
  return colors[season] || '#F5F5F5'
}

// 根据分类代码获取分类标签
const getCategoryLabel = (categoryValue) => {
  // 添加底部和裤子的映射，确保旧数据的显示也正确
  if (categoryValue === 'bottom') {
    return '裤子';
  }
  if (categoryValue === 'pants') {
    return '裤子';
  }
  
  const category = categories.find(c => c.value === categoryValue)
  return category ? category.label : '其他'
}

// 默认图片
const defaultImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23f0f0f0" /%3E%3Cpath d="M65,45 L50,30 L35,45 L35,70 L65,70 Z" stroke="%23ddd" stroke-width="2" fill="%23eee" /%3E%3Ccircle cx="50" cy="30" r="10" fill="%23eee" stroke="%23ddd" stroke-width="2" /%3E%3C/svg%3E'

// 监控表单变化
watch([outfitName, selectedScene, selectedSeason, outfitNotes, selectedItems, outfitRating], () => {
  if (!originalOutfit.value) return
  
  // 检查是否有变化
  if (isEditMode.value) {
    const hasNameChange = outfitName.value !== originalOutfit.value.name
    const hasSceneChange = selectedScene.value !== originalOutfit.value.scene
    const hasSeasonChange = selectedSeason.value !== originalOutfit.value.season
    const hasNotesChange = outfitNotes.value !== originalOutfit.value.notes
    const hasItemsChange = selectedItems.value.length !== originalOutfit.value.items.length
    const hasRatingChange = outfitRating.value !== originalOutfit.value.rating
    
    formChanged.value = hasNameChange || hasSceneChange || hasSeasonChange || hasNotesChange || hasItemsChange || hasRatingChange
    
    // 突出显示保存按钮
    if (formChanged.value && !saveButtonHighlight.value) {
      saveButtonHighlight.value = true
    }
  }
}, { deep: true })

// 初始化编辑模式
const initEditMode = () => {
  // 获取页面参数
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.$page?.options
  
  // 打印参数，协助调试
  console.log('编辑模式 - 页面参数:', options);
  
  let outfitDataFromParam = null;
  let isEditModeFromParam = false;
  let outfitIdFromParam = '';
  
  // 检查路径参数是否有edit和outfitData
  if (options?.edit === 'true' && options?.outfitData) {
    try {
      // 解析传递的穿搭数据
      outfitDataFromParam = JSON.parse(decodeURIComponent(options.outfitData));
      isEditModeFromParam = true;
      console.log('从URL参数解析穿搭数据:', outfitDataFromParam);
    } catch (e) {
      console.error('解析穿搭数据失败:', e);
    }
  }
  
  // 检查是否直接传入ID参数
  if (options?.id) {
    outfitIdFromParam = options.id;
    isEditModeFromParam = true;
    console.log('从URL直接获取到ID:', outfitIdFromParam);
  }
  
  // 如果是编辑模式
  if (isEditModeFromParam) {
    isEditMode.value = true;
    
    // 设置ID (优先使用传递的数据中的ID，其次使用URL中的ID)
    if (outfitDataFromParam && outfitDataFromParam.id) {
      editOutfitId.value = outfitDataFromParam.id;
      console.log('使用数据中的ID:', editOutfitId.value);
    } else if (outfitIdFromParam) {
      editOutfitId.value = outfitIdFromParam;
      console.log('使用URL参数中的ID:', editOutfitId.value);
    }
      
      // 保存原始数据用于比较
    if (outfitDataFromParam) {
      originalOutfit.value = { ...outfitDataFromParam };
      
      // 填充表单数据
      outfitName.value = outfitDataFromParam.name || '';
      selectedScene.value = outfitDataFromParam.scene || 'daily';
      selectedSeason.value = outfitDataFromParam.season || 'spring';
      outfitNotes.value = outfitDataFromParam.notes || '';
      
      // 处理rating值，确保是数字类型
      if (outfitDataFromParam.rating !== undefined && outfitDataFromParam.rating !== null) {
        const ratingValue = Number(outfitDataFromParam.rating);
        outfitRating.value = !isNaN(ratingValue) ? ratingValue : 3;
        console.log('加载穿搭 - 设置喜爱程度:', outfitRating.value, typeof outfitRating.value);
      } else {
        outfitRating.value = 3;
      }
      
      previewImage.value = outfitDataFromParam.image || '';
      isCustomUpload.value = outfitDataFromParam.isCustomUpload || false // 恢复自定义上传状态
      
      // 填充已选衣物
      if (outfitDataFromParam.items && Array.isArray(outfitDataFromParam.items)) {
        selectedItems.value = [...outfitDataFromParam.items];
      }
      
      console.log('编辑模式初始化完成:', outfitDataFromParam.name);
    } else if (outfitIdFromParam) {
      // 如果只有ID，使用loadOutfitData函数从服务器获取数据
      console.log('尝试通过ID获取穿搭数据:', outfitIdFromParam);
      loadOutfitData(outfitIdFromParam);
    } else {
      // 编辑模式但没有数据，显示错误
      uni.showToast({
        title: '缺少必要的数据',
        icon: 'none'
      });
      console.error('编辑模式初始化失败: 缺少数据');
    }
  } else {
    // 新建模式
    formChanged.value = true;
    console.log('初始化为新建模式');
  }
}

// 切换季节
const changeSelectedSeason = (season) => {
  if (selectedSeason.value === season) return
  selectedSeason.value = season
}

// 切换场景
const changeSelectedScene = (scene) => {
  if (selectedScene.value === scene) return
  selectedScene.value = scene
}

// 显示衣物选择器
const showClothesSelector = () => {
  showSelector.value = true;
  
  // 将当前已选中的衣物同步到临时选择列表
  tempSelectedItems.value = [...selectedItems.value];
  console.log('打开衣物选择器，同步已选衣物:', tempSelectedItems.value.length, '件');
  
  // 如果还没有加载衣物数据，加载数据
  if (clothesData.value.length === 0) {
    loadClothes();
}
};

// 隐藏衣物选择器
const hideClothesSelector = () => {
  showSelector.value = false
}

// 判断衣物是否已选中
const isItemSelected = (item) => {
  const itemId = item._id || item.id;
  return tempSelectedItems.value.some(selectedItem => 
    (selectedItem._id === itemId || selectedItem.id === itemId)
  );
};

// 切换选择某件衣物
const toggleSelectItem = (item) => {
  const itemId = item._id || item.id;
  const index = tempSelectedItems.value.findIndex(selectedItem => 
    (selectedItem._id === itemId || selectedItem.id === itemId)
  );
  
  if (index > -1) {
    // 如果已经选择，则取消选择
    tempSelectedItems.value.splice(index, 1);
  } else {
    // 如果未选择，则添加到选择列表
    tempSelectedItems.value.push(item);
  }
};

// 确认选择
const confirmSelection = () => {
  console.log('确认选择，原有', selectedItems.value.length, '件，临时选择', tempSelectedItems.value.length, '件');
  
  // 将临时选择的衣物更新到正式选择中，并确保URL已处理好
  selectedItems.value = tempSelectedItems.value.map(item => {
    // 创建新的对象，避免引用问题
    const newItem = { ...item };
    
    // 确保图片URL已经处理，避免重复处理
    if (newItem.image) {
      // 标记图片URL已经处理过，避免重复处理
      newItem._processedImage = true;
      newItem.image = processImageUrl(newItem.image);
    }
    
    // 确保ID字段统一
    if (newItem._id && !newItem.id) {
      newItem.id = newItem._id;
    }
    
    return newItem;
  });
  
  // 关闭选择器
  hideClothesSelector();
  
  // 如果选择了衣物并且没有预览图，显示提示
  if (selectedItems.value.length >= 1 && !previewImage.value) {
    saveButtonHighlight.value = true;
    
    setTimeout(() => {
      uni.showToast({
        title: '现在可以上传穿搭效果图了',
        icon: 'none',
        duration: 2000
      });
    }, 500);
  }
};

// 移除已选择的衣物
const removeItem = (index) => {
  if (index < 0 || index >= selectedItems.value.length) return;
  selectedItems.value.splice(index, 1);
};



// 上传预览图片
const uploadPreviewImage = async () => {
  if (selectedItems.value.length === 0) {
    uni.showToast({
      title: '请先添加衣物',
      icon: 'none'
    });
    return;
  }
  
  console.log('🔧 开始上传穿搭效果图 - 使用修复版相机');
  
  try {
    // 使用修复版相机选择图片
    const res = await uniCameraFix.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      maxSize: 20 * 1024 * 1024
    });
    
    await handleOutfitImageSuccess(res);
    
  } catch (error) {
    console.error('❌ 选择穿搭图片失败:', error);
    
    let errorMessage = '选择图片失败';
    
    if (error.errMsg) {
      if (error.errMsg.includes('cancel')) {
        return; // 用户取消，不显示错误
      } else if (error.errMsg.includes('permission')) {
        errorMessage = '需要相机或相册权限';
      } else if (error.errMsg.includes('camera')) {
        errorMessage = '相机功能不可用';
      } else if (error.errMsg.includes('album')) {
        errorMessage = '相册功能不可用';
      }
    }
    
          uni.showToast({
      title: errorMessage,
            icon: 'none',
            duration: 2000
          });
  }
  
  /*
  // 旧版本代码 - 已替换为上面的修复版本
  uni.chooseImage({
    count: 1,
    sizeType: ['original', 'compressed'], // 同时支持原图和压缩图
    sourceType: ['album', 'camera'],
    maxSize: 20 * 1024 * 1024, // 20MB限制
    success: async (res) => {
      try {
        // 显示加载中
        uni.showLoading({
          title: '处理中...',
          mask: true
        });
        
        // 压缩图片
        const compressedPath = await compressImage(res.tempFilePaths[0], {
          quality: 85, // 提高质量
          maxWidth: 1500, // 增加最大宽度
          maxHeight: 1500 // 增加最大高度
        });
        
        // 🔧 关键修复：将临时路径转换为Base64格式进行持久存储
        console.log('开始将压缩图片转换为Base64格式');
        
        // 使用imageStorage将图片保存为Base64
        const saveResult = await imageStorage.saveImage(compressedPath, {
          compress: false, // 已经压缩过了
          metadata: {
            type: 'outfit',
            category: 'preview'
          }
        });
        
        if (saveResult.success) {
          // 设置预览图片为Base64格式
          previewImage.value = saveResult.base64Url;
          console.log('图片转换为Base64成功，长度:', saveResult.base64Url.length);
        } else {
          throw new Error(saveResult.error || '图片转换失败');
        }
        
        // 标记为自定义上传
        isCustomUpload.value = true;
        
        uni.hideLoading();
        uni.showToast({
          title: '上传成功',
            icon: 'success'
          });
      } catch (error) {
        uni.hideLoading();
        console.error('图片处理失败:', error);
          uni.showToast({
          title: '图片处理失败',
            icon: 'none'
          });
        }
        },
        fail: (err) => {
      console.error('选择图片失败:', err);
      // 检查是否是因为图片太大而失败
      if (err.errMsg && err.errMsg.includes('exceed')) {
          uni.showToast({
          title: '图片大小不能超过20MB',
            icon: 'none',
            duration: 2000
          });
      } else {
    uni.showToast({
          title: '选择图片失败',
      icon: 'none',
      duration: 2000
    });
  }
    }
  });
  */
};

// 处理穿搭图片选择成功
const handleOutfitImageSuccess = async (res) => {
  let loadingShown = false;
  try {
    uni.showLoading({
      title: '正在处理图片...',
      mask: true
    });
    loadingShown = true;
    
    const selectedImagePath = res.tempFilePaths[0];
    console.log('✅ 用户选择穿搭图片:', selectedImagePath);
    
    // 验证图片路径
    if (!selectedImagePath) {
      throw new Error('图片路径无效');
    }
    
    // 使用统一的图片保存方法
    const saveResult = await imageCompatibility.saveImage(selectedImagePath, {
      quality: 85,
      maxWidth: 1500,
      maxHeight: 1500,
      metadata: {
        type: 'outfit',
        category: 'preview',
        source: 'outfit_camera',
        timestamp: Date.now()
      }
    });
    
    if (saveResult.success) {
      previewImage.value = saveResult.displayUrl;
      
      console.log('✅ 穿搭图片保存成功:', {
        imageId: saveResult.imageId,
        path: saveResult.localPath
      });
      
      // 标记为自定义上传
      isCustomUpload.value = true;
      
              uni.showToast({
        title: '上传成功',
        icon: 'success',
        duration: 1500
      });
    } else {
      throw new Error(saveResult.error || '图片保存失败');
    }
    
    if (loadingShown) {
      uni.hideLoading();
    }
    
  } catch (error) {
    console.error('❌ 穿搭图片处理失败:', error);
    
    if (loadingShown) {
      uni.hideLoading();
    }
    
    // 使用智能错误建议
    const errorSuggestion = imageCompatibility.getImageErrorSuggestion(error);
    
    uni.showToast({
      title: errorSuggestion.title,
          icon: 'none',
      duration: 3000
    });
  }
};

// 处理预览图点击
const handlePreviewClick = () => {
  if (previewImage.value) {
    // 已有预览图，预览大图
    uni.previewImage({
      urls: [previewImage.value]
    });
  } else if (selectedItems.value.length > 0) {
    // 没有预览图但有选择衣物，直接上传照片
          uploadPreviewImage();
  } else {
    // 没有选择衣物，提示
    uni.showToast({
      title: '请先添加衣物',
      icon: 'none'
    });
  }
};

// 保存穿搭方案
const saveOutfit = async () => {
  // 表单验证
  if (!outfitName.value.trim()) {
    uni.showToast({
      title: '请输入方案名称',
      icon: 'none'
    });
    return;
  }
  
  if (selectedItems.value.length === 0) {
    uni.showToast({
      title: '请添加至少一件衣物',
      icon: 'none'
    });
    return;
  }
  
  // 检查是否有预览图
  if (!previewImage.value) {
    uni.showToast({
      title: '请先上传穿搭效果图',
      icon: 'none'
    });
    return;
  }
  
  // 显示加载中
  uni.showLoading({
    title: isEditMode.value ? '更新中...' : '保存中...',
    mask: true
  });
  
  // 构建穿搭数据
  const outfitData = {
    name: outfitName.value,
    scene: selectedScene.value,
    season: selectedSeason.value,
    notes: outfitNotes.value,
    rating: outfitRating.value, // 确保喜爱程度被传递
    date: new Date().toISOString().split('T')[0], // 当前日期
    image: previewImage.value
  };
  
  console.log('准备保存穿搭数据，喜爱程度:', outfitData.rating);
  
  // 如果是编辑模式，添加ID
  if (isEditMode.value) {
    outfitData.id = editOutfitId.value;
    console.log('编辑模式 - 使用ID:', outfitData.id);
  }
  
  // 处理衣物ID列表
  const itemIds = [];
  selectedItems.value.forEach(item => {
    if (item) {
      // 支持多种可能的ID格式
      if (item.id) {
        itemIds.push(item.id);
      } else if (item._id) {
        itemIds.push(item._id);
      } else if (typeof item === 'string') {
        itemIds.push(item);
      }
    }
  });
  
  // 打印查看衣物数据
  console.log('原始衣物数据:', JSON.stringify(selectedItems.value));
  console.log('处理后的衣物ID:', itemIds);
  
  outfitData.items = itemIds;
  
  console.log('准备上传预览图片:', previewImage.value);
          
  // 检查预览图格式，确保是正确的文件路径
  console.log('预览图路径类型:', typeof previewImage.value);
  
  // 上传前检查图片路径是否有效
  if (!previewImage.value || (typeof previewImage.value === 'string' && previewImage.value.trim() === '')) {
          uni.hideLoading();
          uni.showToast({
      title: '预览图不存在，请重新生成',
            icon: 'none'
          });
    return;
  }
  
  // 使用本地Base64图片，不需要上传到服务器
  console.log('使用本地Base64图片，无需上传');
  
  try {
    // 直接使用本地图片进行保存
    outfitData.image = previewImage.value; // 直接使用Base64图片
    console.log('使用本地Base64图片:', outfitData.image ? outfitData.image.substring(0, 50) + '...' : 'null');
    
    // 创建最终的API数据对象
          const finalApiData = {
            name: outfitData.name?.trim() || '',
      image: outfitData.image || '', // 直接使用Base64图片
            // 确保items是字符串ID数组
            items: Array.isArray(outfitData.items) 
              ? outfitData.items
                  .filter(id => id)
                  .map(id => typeof id === 'object' ? (id.id || id._id || '') : String(id))
        : [],
      season: outfitData.season || selectedSeason.value || '',
      scene: outfitData.scene || selectedScene.value || '',
      rating: Number(outfitData.rating) || 0, // 确保rating是数字
            notes: outfitData.notes || '',
            timestamp: new Date().getTime()
          };
    
          // 如果是编辑模式，添加ID
    if (isEditMode.value) {
      finalApiData.id = editOutfitId.value;
      console.log('编辑模式 - 使用ID:', finalApiData.id);
    }
    
    console.log('准备保存的穿搭数据:', {
      name: finalApiData.name,
      imageLength: finalApiData.image ? finalApiData.image.length : 0,
      itemsCount: finalApiData.items.length,
      rating: finalApiData.rating
    });
          
          // 调用API保存穿搭数据
          let result;
          
          if (isEditMode.value) {
            // 编辑模式，调用更新API
      console.log('调用编辑穿搭API');
      result = await outfitApi.update(finalApiData.id, finalApiData);
          } else {
            // 新建模式，调用创建API
            console.log('调用创建穿搭API');
      result = await outfitApi.create(finalApiData);
    }
    
    console.log('API响应结果:', result);
          
          // 处理响应
          if (result && result.code === 200) {
        uni.hideLoading();
        uni.showToast({
          title: isEditMode.value ? '更新成功' : '保存成功',
          icon: 'success',
          duration: 1500
        });
            
            // 发送事件通知穿搭列表页面刷新
            uni.$emit('outfitUpdated', { 
        id: result.data?.id || finalApiData.id || '', 
              type: isEditMode.value ? 'edit' : 'create',
              name: finalApiData.name,
              timestamp: new Date().getTime() 
        });
        
        // 延迟返回，让用户看到成功提示
        setTimeout(() => {
          uni.redirectTo({
            url: `/pages/outfit/index?timestamp=${new Date().getTime()}&refresh=true&action=${isEditMode.value ? 'edit' : 'create'}`,
            success: () => {
              console.log('已重定向到穿搭列表页面')
            },
            fail: (err) => {
              console.error('重定向失败:', err)
              uni.navigateBack()
            }
          })
        }, 1500)
      } else {
        uni.hideLoading();
        uni.showToast({
              title: result?.message || (isEditMode.value ? '更新失败' : '保存失败'),
          icon: 'none'
        });
      }
    
      } catch (error) {
      uni.hideLoading();
    console.error('保存穿搭失败:', error);
      uni.showToast({
          title: error?.message || '保存失败',
        icon: 'none'
      });
    }
};

// 处理图片URL，确保在各种环境中能正确加载
const processImageUrl = (imageUrl) => {
  return imageCompatibility.processImageUrl(imageUrl, defaultImage);
};

// 返回上一页
const goBack = () => {
  if (formChanged.value) {
    uni.showModal({
      title: '确认离开',
      content: '未保存的内容将会丢失，确定要离开吗？',
      confirmColor: '#E74C3C',
      success: (res) => {
        if (res.confirm) {
          uni.navigateBack()
        }
      }
    })
  } else {
    uni.navigateBack()
  }
};

// 使用computed计算处理后的衣物列表，确保图片URL正确
const processedClothes = computed(() => {
  return clothesData.value.map(item => {
    return {
      ...item,
      image: processImageUrl(item.image)
    };
  });
});

// 修改filteredClothes计算属性，使用processedClothes而不是clothesData
const filteredClothes = computed(() => {
  if (!processedClothes.value.length) return [];
  
  // 如果有搜索文本，先按搜索过滤
  let filtered = processedClothes.value;
  if (searchText.value) {
    const searchLower = searchText.value.toLowerCase();
    filtered = filtered.filter(item => 
      item.name.toLowerCase().includes(searchLower)
    );
  }
  
  // 然后按分类过滤
  if (activeCategory.value === 'all') return filtered;
  
  console.log(`筛选分类: ${activeCategory.value}，当前有 ${filtered.length} 件衣物，筛选后有 ${filtered.filter(item => item.category === activeCategory.value).length} 件`);
  
  return filtered.filter(item => item.category === activeCategory.value);
});

// 处理已选衣物的图片URL
const processedSelectedItems = computed(() => {
  return selectedItems.value.map(item => {
    // 如果图片已经处理过，则直接返回
    if (item._processedImage) {
      return item;
    }
    
    return {
      ...item,
      image: processImageUrl(item.image)
    };
  });
});

// 加载衣物数据
const loadClothes = async () => {
  try {
    console.log('🔄 开始加载衣物数据...');
  loading.value = true;
  
    const result = await clothesApi.getList();
    console.log('📦 API返回结果:', result);
    
    if (result && result.code === 200) {
      if (result.data.list && Array.isArray(result.data.list)) {
        // API返回的是list格式
        clothesData.value = result.data.list.map(item => {
          // 确保每个衣物对象有id属性（可能是_id）
          if (item._id && !item.id) {
            item.id = item._id;
          }
          
          // 确保有color字段，用于可能的降级显示
          if (!item.color) {
            item.color = '#cccccc';
          }
          
          return item;
        });
      } else if (Array.isArray(result.data)) {
        // API直接返回数组
        clothesData.value = result.data.map(item => {
          if (item._id && !item.id) {
            item.id = item._id;
          }
          
          if (!item.color) {
            item.color = '#cccccc';
          }
          
          return item;
        });
      }
      
      console.log(`✅ 获取到 ${clothesData.value.length} 件衣物`);
      console.log('👕 衣物列表:', clothesData.value.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        createdAt: item.createdAt
      })));
    } else {
      console.error('❌ API返回失败:', result);
      uni.showToast({
        title: '获取衣物失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('❌ 获取衣物数据失败:', error);
    uni.showToast({
      title: '获取衣物失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

// 手动刷新衣物数据
const refreshClothesData = async () => {
  console.log('🔄 手动刷新衣物数据...');
  
  try {
    uni.showLoading({
      title: '刷新中...',
      mask: true
    });
    
    // 强制刷新存储
    dataSyncTest.forceRefreshStorage();
    
    // 重新加载数据
    await loadClothes();
    
    // 检查最新衣物
    const latestClothes = dataSyncTest.checkLatestClothes();
    console.log('📅 最新衣物:', latestClothes);
    
    uni.hideLoading();
    
    uni.showToast({
      title: `已刷新，共${clothesData.value.length}件衣物`,
      icon: 'success',
      duration: 2000
    });
    
  } catch (error) {
    console.error('❌ 刷新失败:', error);
    uni.hideLoading();
    
    uni.showToast({
      title: '刷新失败',
      icon: 'none',
      duration: 2000
    });
  }
};

// 调试数据同步
const debugDataSync = async () => {
  console.log('🐛 开始调试数据同步...');
  
  try {
    const result = await dataSyncTest.testClothesDataSync();
    await dataSyncTest.showTestResult(result);
  } catch (error) {
    console.error('❌ 调试失败:', error);
  }
};

// 页面初始化
onMounted(() => {
  console.log('页面onMounted触发');
  
  // 仅在非小程序环境下执行初始化
  // #ifndef MP-WEIXIN
  // 获取页面参数
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const options = currentPage.options || {};
  
  console.log('页面参数:', options);
  
  // 处理参数，如果有outfitId则为编辑模式
  if (options.id) {
    editOutfitId.value = options.id;
    isEditMode.value = true;
    console.log('编辑模式，穿搭ID:', editOutfitId.value);
    
    // 获取穿搭详情
    loadOutfitDetail(editOutfitId.value);
  }
  
  // 启动UI动画
  setTimeout(() => {
    animateUI.value = true;
  }, 100);
  
  // 加载衣物数据
  loadClothes();
  // #endif
});

// 页面显示时刷新数据
onShow(() => {
  console.log('📱 页面onShow触发 - 刷新衣物数据');
  console.log('🕒 当前时间:', new Date().toLocaleTimeString());
  console.log('📊 当前衣物数据数量:', clothesData.value.length);
  
  // 每次页面显示时都重新加载衣物数据
  // 这样可以确保从衣橱页面添加新衣物后，回到这个页面时能看到新数据
  loadClothes();
});

// 从传递的数据加载穿搭信息
const loadOutfitFromData = (outfitData) => {
  try {
    console.log('🔄 从传递的数据加载穿搭信息:', outfitData);
    
    // 填充基本信息
    outfitName.value = outfitData.name || '';
    selectedSeason.value = outfitData.season || 'spring';
    selectedScene.value = outfitData.scene || 'daily';
    
    // 设置预览图片
    if (outfitData.image) {
      previewImage.value = processImageUrl(outfitData.image);
      isCustomUpload.value = outfitData.isCustomUpload || false;
    }
    
    // 设置所选衣物（如果有items数组）
    if (outfitData.items && Array.isArray(outfitData.items)) {
      selectedItems.value = outfitData.items.map(item => {
        return {
          ...item,
          image: processImageUrl(item.image)
        };
      });
      tempSelectedItems.value = [...selectedItems.value];
    }
    
    console.log('✅ 从数据加载穿搭信息成功');
    
  } catch (error) {
    console.error('❌ 从数据加载穿搭信息失败:', error);
    uni.showToast({
      title: '加载穿搭信息失败',
      icon: 'none'
    });
  }
};

// 获取穿搭详情
const loadOutfitDetail = async (id) => {
  try {
    uni.showLoading({
      title: '加载中...',
      mask: true
    });
    
    // 调用API获取穿搭详情
    const result = await outfitApi.getDetail(id);
    
    if (result && result.code === 200 && result.data) {
      const outfitData = result.data;
      
      // 设置表单数据
      outfitName.value = outfitData.name || '';
      selectedSeason.value = outfitData.season || 'spring';
      selectedScene.value = outfitData.scene || 'daily';
      outfitRating.value = outfitData.rating || 3;
      outfitNotes.value = outfitData.notes || '';
      
      // 设置预览图片
      if (outfitData.image) {
        previewImage.value = processImageUrl(outfitData.image);
        isCustomUpload.value = outfitData.isCustomUpload || false;
  }
  
      // 设置所选衣物（如果有items数组）
      if (outfitData.items && Array.isArray(outfitData.items)) {
        selectedItems.value = outfitData.items.map(item => {
          return {
            ...item,
            image: processImageUrl(item.image)
          };
        });
        tempSelectedItems.value = [...selectedItems.value];
      }
      
      console.log('穿搭详情加载成功');
    } else {
      uni.showToast({
        title: '获取穿搭详情失败',
        icon: 'none'
      });
      
      // 错误时返回上一页
  setTimeout(() => {
        uni.navigateBack();
      }, 1500);
    }
  } catch (error) {
    console.error('加载穿搭详情失败:', error);
    uni.showToast({
      title: '获取详情失败',
      icon: 'none'
    });
    
    // 错误时返回上一页
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  } finally {
    uni.hideLoading();
  }
};

// 添加设置喜爱程度的方法
const setRating = (rating) => {
  console.log('设置喜爱程度(转换前):', rating, typeof rating)
  // 确保rating是数字类型
  const ratingValue = Number(rating)
  // 直接使用转换后的数字值，不再使用三目运算符
  outfitRating.value = ratingValue
  console.log('设置喜爱程度(转换后):', outfitRating.value, typeof outfitRating.value)
  
  // 保存更改状态
  if (isEditMode.value && originalOutfit.value) {
    const hasRatingChange = ratingValue !== Number(originalOutfit.value.rating || 3)
    if (hasRatingChange && !saveButtonHighlight.value) {
      saveButtonHighlight.value = true
      formChanged.value = true
    }
  }
}

// 加载穿搭数据
const loadOutfitData = async (id) => {
  try {
    uni.showLoading({
      title: '加载中...',
      mask: true
    })
    
    const res = await outfitApi.getDetail(id)
    
    uni.hideLoading()
    
    if (res && res.code === 200 && res.data) {
      const outfitData = res.data
      
      console.log('加载到的穿搭数据:', outfitData)
      
      // 设置基本信息
      outfitName.value = outfitData.name || ''
      selectedScene.value = outfitData.scene || 'daily'
      selectedSeason.value = outfitData.season || 'spring'
      outfitNotes.value = outfitData.notes || ''
      
      // 处理rating值，确保是数字类型
      if (outfitData.rating !== undefined && outfitData.rating !== null) {
        const ratingValue = Number(outfitData.rating);
        outfitRating.value = !isNaN(ratingValue) ? ratingValue : 3;
        console.log('加载穿搭 - 设置喜爱程度:', outfitRating.value, typeof outfitRating.value);
      } else {
        outfitRating.value = 3;
      }
      
      previewImage.value = outfitData.image || ''
      isCustomUpload.value = outfitData.isCustomUpload || false // 恢复自定义上传状态
      
      // 设置衣物列表
      if (outfitData.items && outfitData.items.length > 0) {
        selectedItems.value = outfitData.items
      }
      
      // 保存原始数据，用于判断是否有修改
      originalOutfit.value = {
        name: outfitName.value,
        scene: selectedScene.value,
        season: selectedSeason.value,
        notes: outfitNotes.value,
        items: JSON.parse(JSON.stringify(selectedItems.value)),
        image: previewImage.value,
        rating: outfitRating.value,
        isCustomUpload: isCustomUpload.value
      }
      
      formChanged.value = false // 初始化表单状态
    } else {
      uni.showToast({
        title: '加载穿搭详情失败',
        icon: 'none'
      })
    }
  } catch (error) {
    uni.hideLoading()
    console.error('加载穿搭数据失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  }
}

// 处理图片加载错误
const handleImageError = (e) => {
  console.error('图片加载失败:', e);
  
  try {
    // 获取当前目标元素
    const target = e.target || e.currentTarget;
    
    // 在某些平台上，可以直接替换图片源
    // #ifdef H5
    if (target && target.src) {
      // 如果是网络图片加载失败，则替换为本地默认图片
      if (target.src.startsWith('http')) {
        console.log('将图片替换为默认图片');
        target.src = defaultImage;
        
        // 如果有item参数，尝试记录错误信息
        if (e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.item) {
          const itemId = e.currentTarget.dataset.item;
          console.log('加载失败的衣物ID:', itemId);
        }
      }
    }
    // #endif
    
    // 在其他平台上，可能无法直接修改DOM，记录错误信息
    console.log('图片加载失败，建议检查网络连接或服务器状态');
  } catch (error) {
    console.error('处理图片错误时出现异常:', error);
  }
};

// 在onLoad生命周期中获取页面实例
onLoad((options) => {
  console.log('🔄 页面onLoad触发，获取页面实例和参数');
  console.log('📋 接收到的页面参数:', options);
  
  // 初始化页面实例
  const pages = getCurrentPages();
  if (pages && pages.length > 0) {
    pageInstance.value = pages[pages.length - 1];
    console.log('✅ onLoad中成功获取页面实例');
  }
  
  // 获取页面参数
  try {
    // 处理编辑模式 - 通过ID
    if (options.id) {
      editOutfitId.value = options.id;
      isEditMode.value = true;
      console.log('🔧 编辑模式 (通过ID)，穿搭ID:', editOutfitId.value);
      
      // 获取穿搭详情
      loadOutfitDetail(editOutfitId.value);
    }
    
    // 处理编辑模式 - 通过数据传递
    else if (options.edit === 'true' && options.outfitData) {
      try {
        const outfitDataStr = decodeURIComponent(options.outfitData);
        const outfitData = JSON.parse(outfitDataStr);
        
        console.log('🔧 编辑模式 (通过数据传递)，穿搭数据:', outfitData);
        
        isEditMode.value = true;
        editOutfitId.value = outfitData.id;
        
        // 直接使用传递的数据
        loadOutfitFromData(outfitData);
      } catch (parseError) {
        console.error('❌ 解析穿搭数据失败:', parseError);
        uni.showToast({
          title: '加载穿搭数据失败',
          icon: 'none'
        });
      }
    }
    
    // 处理其他编辑模式参数
    else if (options.mode === 'edit' && options.id) {
      editOutfitId.value = options.id;
      isEditMode.value = true;
      console.log('🔧 编辑模式 (mode=edit)，穿搭ID:', editOutfitId.value);
      
      // 获取穿搭详情
      loadOutfitDetail(editOutfitId.value);
    }
    
    // 新建模式
    else {
      console.log('✨ 新建模式');
      isEditMode.value = false;
    }
    
  } catch (err) {
    console.error('❌ 获取页面参数失败:', err);
  }
});

// 页面DOM准备完成
onReady(() => {
  console.log('页面onReady触发');
  
  // 确保页面实例已经获取
  if (!pageInstance.value) {
    const pages = getCurrentPages();
    if (pages && pages.length > 0) {
      pageInstance.value = pages[pages.length - 1];
      console.log('onReady中成功获取页面实例');
    }
  }
  
  // 启动UI动画
  setTimeout(() => {
    animateUI.value = true;
  }, 100);
  
  // 加载衣物数据
  loadClothes();
});
</script>

<style lang="scss">
@use '@/styles/mobile-design-system.scss';

page {
  background-color: #f8f9fa;
}

.mobile-create-outfit-container {
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
  font-size: 18px;
  font-weight: 700;
  color: white;
  text-align: center;
  flex: 1;
}

.header-placeholder {
  width: 40px;
  height: 40px;
}

/* 已移至上方统一头部样式 */

/* 内容区域 - 移动端紧凑优化 */
.content-box {
  flex: 1;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(15px);
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  box-shadow: 0 -5px 30px rgba(76, 132, 255, 0.12);
  z-index: 2;
  display: flex;
  flex-direction: column;
  padding: 16px 16px;
  padding-bottom: 90px;
}

/* 各个区块公共样式 - 移动端紧凑优化 */
.info-section, .items-section, .preview-section, .notes-section {
  margin-bottom: 16px;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s ease;
}

.card-shadow {
  background-color: #fff;
  border-radius: 14px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.03);
  padding: 14px;
  border: 1px solid rgba(0, 0, 0, 0.02);
}

.info-section.animate-in { 
  opacity: 1;
  transform: translateY(0);
  transition-delay: 0.1s;
}

.items-section.animate-in { 
  opacity: 1;
  transform: translateY(0);
  transition-delay: 0.2s;
}

.preview-section.animate-in { 
  opacity: 1;
  transform: translateY(0);
  transition-delay: 0.3s;
}

.notes-section.animate-in { 
  opacity: 1;
  transform: translateY(0);
  transition-delay: 0.4s;
}

.section-title {
  font-size: 15px;
  font-weight: 700;
  color: #333;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

.item-count {
  font-size: 14px;
  color: #888;
  font-weight: normal;
}

.preview-tip {
  font-size: 12px;
  color: #888;
  font-weight: normal;
}

/* 基本信息区域 - 移动端紧凑优化 */
.name-input {
  margin-bottom: 16px;
}

.outfit-name {
  height: 42px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-bottom: 1px solid #eee;
  background: transparent;
  padding: 0 4px;
  color: #333;
  
  &:focus {
    border-bottom: 2px solid #4776E6;
    margin-bottom: -1px;
  }
  
  &::placeholder {
    color: #aaa;
  }
}

.tags-section {
  margin-bottom: 6px;
}

.tags-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.tags-label {
  font-size: 14px;
  color: #555;
  margin-right: 10px;
  font-weight: 600;
  min-width: 44px;
}

.tags-scroll {
  flex: 1;
  white-space: nowrap;
}

.tags-scroll-content {
  display: inline-flex;
  padding: 3px 0;
}

.scene-tag, .season-tag {
  padding: 6px 14px;
  border-radius: 16px;
  background-color: #f5f5f7;
  margin-right: 8px;
  font-size: 13px;
  color: #666;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
  position: relative;
  overflow: hidden;
  min-height: 32px;
  display: flex;
  align-items: center;
  
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
}

.scene-tag.active, .season-tag.active {
  background: linear-gradient(90deg, #4776E6, #8E54E9);
  color: #fff;
  font-weight: 500;
  box-shadow: 0 3px 12px rgba(71, 118, 230, 0.25);
  transform: translateY(-2px);
}

/* 衣物选择区域 - 移动端紧凑优化 */
.selected-items {
  width: 100%;
  min-height: 120px;
}

.items-scroll {
  width: 100%;
  white-space: nowrap;
  padding-bottom: 10px;
}

.items-scroll-content {
  display: inline-flex;
  padding: 5px 0;
}

.item-card {
  display: inline-block;
  width: 100px;
  height: 130px;
  margin-right: 10px;
  vertical-align: top;
}

.item-card-inner {
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.03);
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(0, 0, 0, 0.02);
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.98);
  }
}

.item-img-container {
  width: 100%;
  height: 90px;
  position: relative;
}

.item-img-container image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-category {
  position: absolute;
  left: 8px;
  bottom: 8px;
  padding: 3px 8px;
  border-radius: 10px;
  background-color: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.remove-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.8;
  transition: all 0.2s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  
  &:active {
    transform: scale(0.9);
    opacity: 1;
    background-color: rgba(231, 76, 60, 0.8);
  }
}

.item-name {
  flex: 1;
  padding: 10px;
  font-size: 13px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
  font-weight: 500;
  text-align: center;
}

.add-item-card {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 70px;
  height: 160px;
  background-color: #f9f9f9;
  border: 2px dashed #ddd;
  border-radius: 16px;
  color: #999;
  font-size: 14px;
  transition: all 0.3s ease;
  
  &:active {
    background-color: #f0f0f0;
    transform: scale(0.95);
    border-color: #4776E6;
  }
}

.add-icon {
  margin-bottom: 5px;
}

.empty-items {
  width: 100%;
  height: 180px;
  background-color: #f9f9f9;
  border: 2px dashed #ddd;
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #888;
  font-size: 15px;
  transition: all 0.3s ease;
  
  &:active {
    background-color: #f0f0f0;
    transform: scale(0.98);
    border-color: #4776E6;
  }
  
  uni-icons {
    margin-bottom: 14px;
    color: #bbb;
  }
}

/* 预览区域 */
.preview-container {
  position: relative;
  width: 100%;
  height: 200px;
  background-color: #f9f9f9;
  border-radius: 12px;
  overflow: hidden;
  margin-top: 10px;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-preview {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #888;
  font-size: 15px;
  
  uni-icons {
    margin-bottom: 12px;
    color: #bbb;
    font-size: 40px;
  }
}

/* 笔记区域 */
.notes-input {
  width: 100%;
  height: 100px;
  background-color: #f9f9f9;
  border-radius: 12px;
  padding: 12px;
  font-size: 14px;
  line-height: 1.4;
  border: none;
  color: #333;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.03);
  
  &::placeholder {
    color: #aaa;
  }
}

/* 底部操作区 */
.bottom-btns {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 90px;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 -5px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px calc(env(safe-area-inset-bottom) + 15px) 20px;
  box-sizing: border-box;
  z-index: 10;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s ease;
  border-top: 1px solid rgba(0, 0, 0, 0.03);
}

.bottom-btns.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.cancel-btn, .save-btn {
  height: 54px;
  border-radius: 27px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  width: 45%;
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.96);
    opacity: 0.9;
  }
}

.cancel-btn {
  background-color: #f5f5f7;
  color: #666;
}

.save-btn {
  background: linear-gradient(90deg, #4776E6, #8E54E9);
  color: #fff;
  box-shadow: 0 5px 15px rgba(71, 118, 230, 0.25);
  transition: all 0.4s ease;
  
  &.highlight {
    animation: saveButtonPulse 1.5s infinite;
  }
}

@keyframes saveButtonPulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 5px 15px rgba(71, 118, 230, 0.25);
  }
  50% {
    transform: scale(1.03);
    box-shadow: 0 8px 20px rgba(71, 118, 230, 0.4);
  }
}

/* 选择衣物弹窗 */
.clothes-selector {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 100;
  display: flex;
  align-items: flex-end;
  backdrop-filter: blur(3px);
}

.selector-content {
  width: 100%;
  height: 80%;
  background-color: #fff;
  border-top-left-radius: 28px;
  border-top-right-radius: 28px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
  box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.15);
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.selector-header {
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #f0f0f0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.refresh-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 18px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.refresh-btn:active {
  background: #e9ecef;
  transform: scale(0.95);
}

.selector-title {
  font-size: 19px;
  font-weight: 700;
  color: #333;
  letter-spacing: -0.3px;
}

.close-btn {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: #f5f5f7;
  transition: all 0.3s ease;
  
  &:active {
    background-color: #e0e0e0;
    transform: scale(0.9);
  }
}

.search-bar {
  margin: 12px 15px;
  height: 46px;
  background-color: #f5f5f7;
  border-radius: 23px;
  display: flex;
  align-items: center;
  padding: 0 15px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.03);
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

.category-tabs {
  display: flex;
  padding: 8px 15px 15px;
  border-bottom: 1px solid #f0f0f0;
  overflow-x: auto;
  white-space: nowrap;
}

.category-tab {
  padding: 8px 18px;
  margin-right: 10px;
  border-radius: 18px;
  font-size: 14px;
  color: #666;
  background-color: #f5f5f7;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
  
  &:active {
    transform: scale(0.95);
  }
}

.category-tab.active {
  background: linear-gradient(90deg, #4776E6, #8E54E9);
  color: #fff;
  font-weight: 500;
  box-shadow: 0 3px 12px rgba(71, 118, 230, 0.25);
}

.clothes-grid {
  flex: 1;
  padding: 15px;
  display: flex;
  flex-wrap: wrap;
  overflow-y: auto;
}

.clothes-item {
  width: 33.333%;
  height: 150px;
  padding: 6px;
  box-sizing: border-box;
  position: relative;
}

.clothes-item image {
  width: 100%;
  height: 115px;
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
  transition: all 0.2s ease;
}

.item-name-label {
  font-size: 12px;
  color: #333;
  margin-top: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 5px;
  text-align: center;
  font-weight: 500;
}

.item-select-indicator {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.3);
  border: 2px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.clothes-item.selected {
  image {
    border: 2px solid #4776E6;
    transform: scale(0.95);
    box-shadow: 0 3px 10px rgba(71, 118, 230, 0.2);
  }
  
  .item-select-indicator {
    opacity: 1;
    background-color: #4776E6;
  }
  
  .item-name-label {
    color: #4776E6;
  }
}

.selector-bottom {
  padding: 15px 20px calc(env(safe-area-inset-bottom) + 15px) 20px;
  border-top: 1px solid #f0f0f0;
}

.done-btn {
  height: 56px;
  border-radius: 28px;
  background: linear-gradient(90deg, #4776E6, #8E54E9);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 5px 15px rgba(71, 118, 230, 0.25);
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.98);
  }
}

.preview-actions {
  display: flex;
  align-items: center;
  gap: 10px; /* 添加按钮之间的间距 */
}

.upload-btn {
  display: flex;
  align-items: center;
  padding: 8px 15px;
  background-color: rgba(71, 118, 230, 0.1);
  border-radius: 20px;
  transition: all 0.3s ease;
  
  text {
    font-size: 13px;
    color: #4776E6;
    margin-left: 6px;
    font-weight: 500;
  }
  
  &:active {
    background-color: rgba(71, 118, 230, 0.2);
    transform: scale(0.95);
  }
}

.custom-upload-tag {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(255, 152, 0, 0.8);
  color: white;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 12px;
  z-index: 2;
}


.upload-subtext {
  font-size: 13px;
  color: #888;
  margin-top: 8px;
}

.search-input {
  &:focus {
    outline: none;
  }
}

.input-field.outfit-name {
  transition: border-bottom-color 0.3s ease;
  
  &:focus {
    border-bottom-color: #4776E6;
  }
}

.notes-input {
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  
  &:focus {
    background-color: #fff;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(71, 118, 230, 0.1);
  }
}

.clothes-item {
  transition: transform 0.3s ease, opacity 0.3s ease;
  
  &:active {
    transform: scale(0.95);
  }
  
  &.selected {
    animation: selectItemPulse 0.4s ease;
  }
}

@keyframes selectItemPulse {
  0% { transform: scale(1); }
  50% { transform: scale(0.92); }
  100% { transform: scale(1); }
}

/* 加载状态 */
.loading-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 0;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(71, 118, 230, 0.1);
  border-top: 3px solid #4776E6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

.loading-text {
  font-size: 14px;
  color: #666;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 空数据状态 */
.empty-clothes {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 0;
  color: #999;
  font-size: 16px;
}

.empty-clothes text {
  margin-top: 12px;
}

.empty-subtext {
  font-size: 14px;
  color: #bbb;
  margin-top: 6px !important;
}

/* 喜爱程度 */
.rating-section {
  margin-bottom: 28px;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s ease;
  display: flex;
  flex-direction: column;
}

.rating-section.animate-in {
  opacity: 1;
  transform: translateY(0);
  transition-delay: 0.35s;
}

.rating-container {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-top: 8px;
  margin-left: 2px;
  gap: 6px;
}

.rating-star {
  position: relative;
  width: 32px;
  height: 32px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rating-star:active {
  transform: scale(0.9);
}

.star-icon {
  position: relative;
  width: 22px;
  height: 22px;
}

.star-shape {
  position: absolute;
  width: 22px;
  height: 22px;
  background: #ddd;
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
  transition: all 0.3s ease;
}

.rating-star-filled .star-shape {
  background: linear-gradient(135deg, #FFD700, #FFA500);
  box-shadow: 0 2px 8px rgba(255, 165, 0, 0.3);
  transform: scale(1);
}

.rating-star-empty .star-shape {
  background: #E5E5E5;
  transform: scale(0.9);
}

.rating-star:hover .star-shape {
  transform: scale(1.05);
}

.rating-star:active .star-shape {
  transform: scale(0.85);
}

.rating-value {
  font-size: 13px;
  color: #666;
  font-weight: 500;
  background: rgba(255, 215, 0, 0.1);
  padding: 3px 8px;
  border-radius: 10px;
  border: 1px solid rgba(255, 215, 0, 0.2);
  min-width: 36px;
  text-align: center;
}

/* 移动端响应式优化 */
@media (max-width: 480px) {
  .content-box {
    padding: 12px 12px;
    padding-bottom: 85px;
  }
  
  .header {
    padding: 6px 12px;
    margin-top: 4px;
  }
  
  .header-title {
    font-size: 16px;
  }
  
  .card-shadow {
    padding: 12px;
    border-radius: 12px;
    margin-bottom: 10px;
  }
  
  .section-title {
  font-size: 14px;
    margin-bottom: 10px;
  }
  
  .outfit-name {
    height: 40px;
    font-size: 15px;
  }
  
  .tags-row {
    margin-bottom: 8px;
  }
  
  .tags-label {
    font-size: 13px;
    min-width: 40px;
    margin-right: 8px;
  }
  
  .scene-tag, .season-tag {
    padding: 5px 12px;
    font-size: 12px;
    margin-right: 6px;
    min-height: 28px;
  }
  
  .item-card {
    width: 90px;
    height: 115px;
    margin-right: 8px;
  }
  
  .item-img-container {
    height: 75px;
  }
  
  .preview-container {
    height: 150px;
    margin-top: 8px;
  }
  
  .rating-star {
    width: 28px;
    height: 28px;
  }
  
  .star-icon {
    width: 18px;
    height: 18px;
  }
  
  .star-shape {
    width: 18px;
    height: 18px;
  }
  
  .rating-value {
    font-size: 12px;
    padding: 2px 6px;
    min-width: 32px;
  }
  
  .notes-input {
    height: 80px;
    padding: 10px;
    font-size: 13px;
  }
  
  .bottom-btns {
    height: 75px;
    padding: 0 12px calc(env(safe-area-inset-bottom) + 10px) 12px;
  }
  
  .cancel-btn, .save-btn {
    height: 48px;
    border-radius: 24px;
    font-size: 15px;
  }
}

@media (max-width: 360px) {
  .content-box {
    padding: 10px 10px;
    padding-bottom: 80px;
  }
  
  .header {
    padding: 5px 10px;
  }
  
  .header-title {
    font-size: 15px;
  }
  
  .card-shadow {
    padding: 10px;
    margin-bottom: 8px;
  }
  
  .section-title {
    font-size: 13px;
    margin-bottom: 8px;
  }
  
  .item-card {
    width: 80px;
    height: 105px;
    margin-right: 6px;
  }
  
  .item-img-container {
    height: 68px;
  }
  
  .preview-container {
    height: 130px;
  }
  
  .rating-container {
    gap: 4px;
  }
  
  .rating-star {
    width: 26px;
    height: 26px;
  }
  
  .star-icon {
    width: 16px;
    height: 16px;
  }
  
  .star-shape {
    width: 16px;
    height: 16px;
  }
  
  .notes-input {
    height: 70px;
    padding: 8px;
  }
  
  .bottom-btns {
    height: 70px;
    padding: 0 10px calc(env(safe-area-inset-bottom) + 8px) 10px;
  }
  
  .cancel-btn, .save-btn {
    height: 44px;
    border-radius: 22px;
    font-size: 14px;
  }
}
</style> 