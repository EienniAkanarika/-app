<template>
  <view class="mobile-add-clothes-container">
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
        <text class="header-title">添加{{ categoryName }}</text>
        <view class="header-placeholder"></view>
      </view>
    </view>

    <!-- 内容区域 -->
    <view class="content-box" :class="{ 'animate-in': animateForm }">
      <view class="form-container" :class="{ 'animate-in': animateForm }">
        <!-- 衣物照片上传 -->
        <view class="upload-section">
          <view class="upload-area" @tap="chooseImage">
            <image v-if="formData.image" class="preview-image" :src="formData.image" mode="aspectFill" @error="handleImageError"></image>
            <view v-else class="upload-placeholder">
              <svg viewBox="0 0 24 24" class="upload-icon">
                <path d="M9,2V8H7L12,13L17,8H15V2M5,20V18H19V20H5Z"/>
              </svg>
              <text class="upload-text">上传照片</text>
              <text class="upload-hint">拍照或选择</text>
            </view>
          </view>
        </view>
        
        <!-- 衣物命名 -->
        <view class="form-group">
          <text class="form-label">衣物名称</text>
          <view class="input-wrapper" :class="{ 'input-focus': isFocusName, 'input-error': errors.name }">
            <svg viewBox="0 0 24 24" class="input-icon">
              <path d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z"/>
            </svg>
            <input type="text" class="form-input" v-model="formData.name" placeholder="输入名称" @focus="handleFocus('name')" @blur="handleBlur('name')" />
          </view>
          <text v-if="errors.name" class="error-tip">{{ errors.name }}</text>
        </view>
        
        <!-- 季节和风格选择 -->
        <view class="form-row">
          <view class="form-col">
            <text class="form-label">适用季节</text>
            <view class="tags-container">
              <view 
                v-for="(season, index) in seasons" 
                :key="index" 
                class="tag" 
                :class="{ 'tag-selected': formData.seasons.includes(season.value) }" 
                @tap="toggleSeason(season.value)"
              >
                <text>{{ season.label }}</text>
              </view>
            </view>
          </view>
          
          <view class="form-col">
            <text class="form-label">风格</text>
            <view class="tags-container">
              <view 
                v-for="(style, index) in styles" 
                :key="index" 
                class="tag" 
                :class="{ 'tag-selected': formData.style === style.value }" 
                @tap="setStyle(style.value)"
              >
                <text>{{ style.label }}</text>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 喜爱程度 -->
        <view class="form-group">
          <view class="rating-header">
            <text class="form-label">喜爱程度</text>
            <text class="rating-text">{{ formData.rating }}/5</text>
          </view>
          <view class="rating-container">
            <view 
              v-for="i in 5" 
              :key="i" 
              class="rating-star" 
              :class="{ 'rating-star-filled': formData.rating >= i, 'rating-star-empty': formData.rating < i }"
              @tap="setRating(i)"
            >
              <view class="star-icon">
                <view class="star-shape"></view>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 颜色选择 -->
        <view class="form-group">
          <text class="form-label">主色调</text>
          <view class="color-picker">
            <input type="color" v-model="formData.color" class="color-input" />
            <view class="color-preview" :style="{ backgroundColor: formData.color }"></view>
          </view>
        </view>
        
        <!-- 备注 -->
        <view class="form-group">
          <text class="form-label">备注</text>
          <view class="input-wrapper textarea-wrapper" :class="{ 'input-focus': isFocusRemark }">
            <textarea 
              class="form-textarea" 
              v-model="formData.remark" 
              placeholder="可选备注信息" 
              @focus="handleFocus('remark')" 
              @blur="handleBlur('remark')"
            />
          </view>
        </view>
      </view>
    </view>
    
    <!-- 统一的底部操作区 -->
    <view class="bottom-actions" :class="{ 'animate-in': animateForm }">
      <button class="cancel-btn" @tap="goBack">取消</button>
      <button class="save-btn" :class="{'save-btn-disabled': !isFormValid}" @tap="saveClothes">保存</button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { compressImage, uploadImage } from '@/utils/imageUtils.js'
import { uploadClothesImage } from '@/api/upload.js'
import { clothesApi } from '@/api'
import { imageStorage } from '@/utils/imageStorage.js'

// 动画控制
const animateForm = ref(false)

// 类型映射
const categoryNames = {
  hat: '帽子',
  shirt: 'T恤',
  pants: '裤子',
  coat: '外套',
  skirt: '裙子',
  suit: '西装',
  shoes: '鞋子'
}

// 从路由参数获取分类
const route = getCurrentInstance().proxy.$route
const category = route.query.category || 'shirt'
const categoryName = computed(() => categoryNames[category] || '衣物')

// 表单数据
const formData = ref({
  name: '',
  image: '',
  imageId: '',
  category: category,
  seasons: ['spring'],
  style: 'casual',
  rating: 3,
  color: '#FFFFFF',
  remark: ''
})

// 焦点状态
const isFocusName = ref(false)
const isFocusRemark = ref(false)

// 错误信息
const errors = ref({})

// 季节选项
const seasons = [
  { label: '春', value: 'spring' },
  { label: '夏', value: 'summer' },
  { label: '秋', value: 'autumn' },
  { label: '冬', value: 'winter' }
]

// 风格选项
const styles = [
  { label: '休闲', value: 'casual' },
  { label: '正式', value: 'formal' },
  { label: '运动', value: 'sport' },
  { label: '时尚', value: 'fashion' }
]

// 表单验证
const isFormValid = computed(() => {
  return formData.value.name.trim().length > 0
})

// 焦点处理
const handleFocus = (field) => {
  if (field === 'name') isFocusName.value = true
  if (field === 'remark') isFocusRemark.value = true
  errors.value[field] = ''
}

const handleBlur = (field) => {
  if (field === 'name') isFocusName.value = false
  if (field === 'remark') isFocusRemark.value = false
}

// 季节选择
const toggleSeason = (season) => {
  const index = formData.value.seasons.indexOf(season)
  if (index > -1) {
    formData.value.seasons.splice(index, 1)
  } else {
    formData.value.seasons.push(season)
  }
}

// 风格选择
const setStyle = (style) => {
  formData.value.style = style
}

// 评分设置
const setRating = (rating) => {
  formData.value.rating = rating
}

// 选择图片
const chooseImage = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['original', 'compressed'],
    sourceType: ['album', 'camera'],
    maxSize: 20 * 1024 * 1024,
    success: async (res) => {
      try {
        uni.showLoading({
          title: '正在保存图片...',
          mask: true
        });
        
        const selectedImagePath = res.tempFilePaths[0];
        console.log('用户选择图片:', selectedImagePath);
        
        const saveResult = await imageStorage.saveImage(selectedImagePath, {
          compress: true,
          quality: 0.8,
          maxWidth: 1200,
          maxHeight: 1200,
          metadata: {
            type: 'clothes',
            category: formData.value.category || 'unknown',
            source: 'user_upload'
          }
        });
        
        if (saveResult.success) {
          formData.value.image = saveResult.base64Url;
          formData.value.imageId = saveResult.imageId;
          
          console.log('图片保存成功:', {
            imageId: saveResult.imageId,
            size: imageStorage.formatFileSize(saveResult.imageInfo.size),
            path: saveResult.localPath
          });
          
          uni.showToast({
            title: '图片保存成功',
            icon: 'success',
            duration: 1500
          });
        } else {
          throw new Error(saveResult.error || '图片保存失败');
        }
        
        uni.hideLoading();
      } catch (error) {
        uni.hideLoading();
        uni.showToast({
          title: '图片保存失败',
          icon: 'none',
          duration: 3000
        });
      }
    },
    fail: (err) => {
      console.error('选择图片失败:', err);
      uni.showToast({
        title: '选择图片失败',
        icon: 'none',
        duration: 2000
      });
    }
  });
};

// 图片错误处理
const handleImageError = () => {
  console.error('图片加载失败');
  uni.showToast({
    title: '图片加载失败',
    icon: 'none'
  });
}

// 保存衣物
const saveClothes = () => {
  if (!isFormValid.value) {
    return;
  }
  
  uni.showLoading({
    title: '保存中...',
    mask: true
  });
  
  const clothesData = {
    name: formData.value.name,
    category: formData.value.category,
    seasons: formData.value.seasons,
    style: formData.value.style,
    rating: formData.value.rating,
    color: formData.value.color,
    remark: formData.value.remark
  };
  
  if (formData.value.image && formData.value.imageId) {
    clothesData.image = formData.value.image;
    clothesData.imageId = formData.value.imageId;
  }
  
  saveClothesToServer(clothesData);
};

const saveClothesToServer = async (clothesData) => {
  try {
    const result = await clothesApi.add(clothesData);
    
    uni.hideLoading();
    
    if (result.success) {
      uni.showToast({
        title: '保存成功',
        icon: 'success',
        duration: 1500
      });
      
      setTimeout(() => {
        goBack();
      }, 1500);
    } else {
      throw new Error(result.error || '保存失败');
    }
  } catch (error) {
    uni.hideLoading();
    console.error('保存衣物失败:', error);
    uni.showToast({
      title: error.message || '保存失败',
      icon: 'none',
      duration: 3000
    });
  }
};

// 返回
const goBack = () => {
  uni.navigateBack();
}

// 初始化
onMounted(() => {
  // 初始化图片存储
  imageStorage.init()
  
  // 启动动画
  setTimeout(() => {
    animateForm.value = true
  }, 100)
})
</script>

<style lang="scss">
@import '@/styles/mobile-design-system.scss';

page {
  background-color: #f8f9fa;
}

.mobile-add-clothes-container {
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
  padding-bottom: 100px; /* 为底部按钮留空间 */
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.content-box.animate-in {
  opacity: 1;
  transform: translateY(0);
  transition-delay: 0.2s;
}

.form-container {
  padding: 20px;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.4s ease;
}

.form-container.animate-in {
  opacity: 1;
  transform: translateY(0);
  transition-delay: 0.4s;
}

/* 上传区域 */
.upload-section {
  margin-bottom: 20px;
}

.upload-area {
  width: 100%;
  height: 200px;
  border-radius: 16px;
  border: 2px dashed #ddd;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  
  &:active {
    transform: scale(0.98);
    border-color: #4776E6;
    background: rgba(71, 118, 230, 0.05);
  }
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 14px;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.upload-icon {
  width: 40px;
  height: 40px;
  fill: #aaa;
  margin-bottom: 12px;
}

.upload-text {
  font-size: 16px;
  font-weight: 600;
  color: #4776E6;
  margin-bottom: 4px;
}

.upload-hint {
  font-size: 14px;
  color: #999;
}

/* 表单样式 */
.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.form-col {
  flex: 1;
  min-width: 0;
}

.form-label {
  font-size: 14px;
  color: #333;
  font-weight: 600;
  margin-bottom: 8px;
  display: block;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: #fff;
  border: 2px solid #f0f0f0;
  border-radius: 12px;
  padding: 0 12px;
  height: 48px;
  transition: all 0.3s ease;
}

.input-wrapper.input-focus {
  border-color: #4776E6;
  box-shadow: 0 0 0 3px rgba(71, 118, 230, 0.1);
}

.input-wrapper.input-error {
  border-color: #ff4757;
}

.input-icon {
  width: 18px;
  height: 18px;
  fill: #aaa;
  margin-right: 8px;
  transition: fill 0.3s ease;
}

.input-wrapper.input-focus .input-icon {
  fill: #4776E6;
}

.form-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  color: #333;
  outline: none;
  
  &::placeholder {
    color: #aaa;
  }
}

.textarea-wrapper {
  height: auto;
  padding: 12px;
}

.form-textarea {
  width: 100%;
  min-height: 80px;
  border: none;
  background: transparent;
  font-size: 14px;
  color: #333;
  outline: none;
  resize: none;
  
  &::placeholder {
    color: #aaa;
  }
}

.error-tip {
  font-size: 12px;
  color: #ff4757;
  margin-top: 4px;
}

/* 标签样式 */
.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  padding: 8px 12px;
  border-radius: 20px;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  cursor: pointer;
  transition: all 0.3s ease;
  
  text {
    font-size: 12px;
    color: #666;
    font-weight: 500;
  }
}

.tag.tag-selected {
  background: linear-gradient(135deg, #4776E6, #8E54E9);
  border-color: transparent;
  
  text {
    color: white;
  }
}

/* 评分样式 */
.rating-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.rating-container {
  display: flex;
  gap: 8px;
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

.star-icon {
  position: relative;
  width: 24px;
  height: 24px;
}

.star-shape {
  position: absolute;
  width: 24px;
  height: 24px;
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

.rating-star:active .star-shape {
  transform: scale(0.85);
}

.rating-text {
  font-size: 13px;
  color: #666;
  font-weight: 500;
  background: rgba(255, 215, 0, 0.1);
  padding: 4px 8px;
  border-radius: 12px;
  border: 1px solid rgba(255, 215, 0, 0.2);
  min-width: 36px;
  text-align: center;
}

/* 颜色选择器 */
.color-picker {
  display: flex;
  align-items: center;
  gap: 12px;
}

.color-input {
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
}

.color-preview {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  border: 2px solid #f0f0f0;
}

/* 底部操作区 */
.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  padding: 16px 20px calc(env(safe-area-inset-bottom) + 16px);
  display: flex;
  gap: 12px;
  z-index: 100;
  opacity: 0;
  transform: translateY(100%);
  transition: all 0.4s ease;
}

.bottom-actions.animate-in {
  opacity: 1;
  transform: translateY(0);
  transition-delay: 0.6s;
}

.cancel-btn, .save-btn {
  flex: 1;
  height: 50px;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
}

.cancel-btn {
  background: #f8f9fa;
  color: #666;
  border: 2px solid #e9ecef;
  
  &:active {
    background: #e9ecef;
    transform: scale(0.98);
  }
}

.save-btn {
  background: linear-gradient(135deg, #4776E6, #8E54E9);
  color: white;
  box-shadow: 0 4px 16px rgba(71, 118, 230, 0.25);
  
  &:active {
    transform: scale(0.98);
    box-shadow: 0 2px 8px rgba(71, 118, 230, 0.2);
  }
}

.save-btn-disabled {
  opacity: 0.6;
  background: #ccc;
  box-shadow: none;
}

/* 响应式优化 */
@media (max-width: 480px) {
  .mobile-header {
    padding: 12px 16px 6px;
  }
  
  .header-title {
    font-size: 18px;
  }
  
  .form-container {
    padding: 16px;
  }
  
  .upload-area {
    height: 160px;
  }
  
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  
  .form-col {
    margin-bottom: 16px;
  }
}

@media (max-width: 360px) {
  .content-box {
    padding-bottom: 90px;
  }
  
  .bottom-actions {
    padding: 12px 16px calc(env(safe-area-inset-bottom) + 12px);
    flex-direction: column;
    gap: 8px;
  }
  
  .cancel-btn, .save-btn {
    height: 44px;
  }
}
</style>
