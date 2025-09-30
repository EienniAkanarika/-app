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
          <svg viewBox="0 0 24 24" class="back-icon">
            <path d="M15.41,7.41L14,6L8,12L14,18L15.41,16.59L10.83,12L15.41,7.41Z"/>
          </svg>
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
                      <uni-icons type="close" size="12" color="#fff"></uni-icons>
                    </view>
                  </view>
                  <text class="item-name">{{ item.name }}</text>
                </view>
              </view>
              
              <view class="add-item-card" @tap="showClothesSelector">
                <view class="add-icon">
                  <uni-icons type="plus" size="24" color="#4776E6"></uni-icons>
                </view>
              </view>
            </view>
          </scroll-view>
        </view>
        
        <!-- 未选择任何衣物时显示 -->
        <view v-else class="empty-items" @tap="showClothesSelector">
          <uni-icons type="plusempty" size="32" color="#999"></uni-icons>
          <text>添加衣物开始搭配</text>
        </view>
      </view>
      
      <!-- 穿搭效果预览 -->
      <view class="preview-section card-shadow" :class="{ 'animate-in': animateUI }">
        <view class="section-title">
          <text>穿搭效果</text>
          <view class="preview-actions">
            <view v-if="selectedItems.length > 0" class="upload-btn" @tap="uploadPreviewImage">
              <uni-icons type="camera" size="14" color="#4776E6"></uni-icons>
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
              <uni-icons type="camera-filled" size="32" color="#ccc"></uni-icons>
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
          <view class="close-btn" @tap="hideClothesSelector">
            <uni-icons type="close" size="22" color="#333"></uni-icons>
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
import { onLoad, onReady } from '@dcloudio/uni-app'
import { compressImage } from '@/utils/imageUtils'
import * as outfitApi from '@/api/outfit.js'
import { clothesApi } from '@/api'
import { generateColorImageUrl } from '@/utils/colorUtils'

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
const uploadPreviewImage = () => {
  if (selectedItems.value.length === 0) {
    uni.showToast({
      title: '请先添加衣物',
      icon: 'none'
    });
    return;
  }
  
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
        
        // 设置预览图片
        previewImage.value = compressedPath;
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
const saveOutfit = () => {
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

// 返回上一页
const goBack = () => {
