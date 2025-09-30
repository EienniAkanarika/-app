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

    <view class="content-box" :class="{ 'animate-in': animateForm }">
      <view class="form-container" :class="{ 'animate-in': animateForm }">
        <!-- 衣物照片上传 -->
        <view class="upload-section">
          <view class="upload-area" @tap="chooseImage">
            <image v-if="formData.image" class="preview-image" :src="formData.image" mode="aspectFill" @error="handleImageError"></image>
            <view v-else class="upload-placeholder">
              <uni-icons type="camera" size="32" color="#aaa"></uni-icons>
              <text class="upload-text">上传照片</text>
              <text class="upload-hint">拍照或选择</text>
            </view>
          </view>
        </view>
        
        <!-- 衣物命名 -->
        <view class="form-group compact">
          <text class="form-label compact">衣物名称</text>
          <view class="input-wrapper compact" :class="{ 'input-focus': isFocusName, 'input-error': errors.name }">
            <uni-icons class="input-icon" type="info" size="18" :color="isFocusName ? '#4776E6' : '#aaa'"></uni-icons>
            <input type="text" class="form-input" v-model="formData.name" placeholder="输入名称" @focus="handleFocus('name')" @blur="handleBlur('name')" />
          </view>
          <text v-if="errors.name" class="error-tip">{{ errors.name }}</text>
        </view>
        
        <!-- 季节和风格选择 - 合并为两列布局 -->
        <view class="form-row">
          <view class="form-col">
            <text class="form-label">适用季节</text>
            <view class="tags-container compact">
              <view 
                v-for="(season, index) in seasons" 
                :key="index" 
                class="tag compact" 
                :class="{ 'tag-selected': formData.seasons.includes(season.value) }" 
                @tap="toggleSeason(season.value)"
              >
                <text>{{ season.label }}</text>
              </view>
            </view>
          </view>
          
          <view class="form-col">
            <text class="form-label">风格</text>
            <view class="tags-container compact">
              <view 
                v-for="(style, index) in styles" 
                :key="index" 
                class="tag compact" 
                :class="{ 'tag-selected': formData.style === style.value }" 
                @tap="setStyle(style.value)"
              >
                <text>{{ style.label }}</text>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 喜爱程度 -->
        <view class="form-group compact">
          <view class="rating-header">
            <text class="form-label">喜爱程度</text>
            <text class="rating-text">{{ formData.rating }}/5</text>
          </view>
          <view class="rating-container compact">
            <view 
              v-for="i in 5" 
              :key="i" 
              class="rating-star compact" 
              :class="{ 'rating-star-filled': formData.rating >= i, 'rating-star-empty': formData.rating < i }"
              @tap="setRating(i)"
            >
              <view class="star-icon">
                <view class="star-shape"></view>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 备注 -->
        <view class="form-group compact">
          <text class="form-label compact">备注</text>
          <view class="input-wrapper textarea-wrapper compact" :class="{ 'input-focus': isFocusRemark }">
            <textarea 
              class="form-textarea compact" 
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

// 获取页面参数
const query = ref({
  category: 'shirt'
})

// 分类名称
const categoryName = computed(() => {
  const categoryMap = {
    hat: '帽子',
    shirt: 'T恤',
    pants: '裤子',
    coat: '外套',
    skirt: '裙子',
    suit: '西装',
    shoes: '鞋子'
  }
  return categoryMap[query.value.category] || '衣物'
})

// 表单数据
const formData = ref({
  name: '',
  image: '',
  imageId: '', // 添加图片ID字段
  category: 'shirt',
  seasons: ['spring'],
  style: 'casual',
  rating: 3,
  color: '#FFFFFF',
  remark: ''
})

// 表单验证错误
const errors = ref({
  name: ''
})

// 表单焦点状态
const isFocusName = ref(false)
const isFocusRemark = ref(false)

// 季节选项
const seasons = [
  { label: '春季', value: 'spring' },
  { label: '夏季', value: 'summer' },
  { label: '秋季', value: 'autumn' },
  { label: '冬季', value: 'winter' }
]

// 风格选项
const styles = [
  { label: '休闲', value: 'casual' },
  { label: '正式', value: 'formal' },
  { label: '运动', value: 'sports' },
  { label: '通勤', value: 'work' },
  { label: '派对', value: 'party' }
]

// 表单是否有效
const isFormValid = computed(() => {
  return formData.value.name.trim() !== '' && formData.value.image !== ''
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

// 选择图片
const chooseImage = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['original', 'compressed'], // 同时支持原图和压缩图
    sourceType: ['album', 'camera'],
    maxSize: 20 * 1024 * 1024, // 20MB限制
    success: async (res) => {
      try {
        // 显示加载中
        uni.showLoading({
          title: '正在保存图片...',
          mask: true
        });
        
        const selectedImagePath = res.tempFilePaths[0];
        console.log('用户选择图片:', selectedImagePath);
        
        // 直接保存到本地存储（内部会自动压缩）
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
          // 使用base64 URL进行预览
          formData.value.image = saveResult.base64Url;
          
          // 保存图片ID，用于后续关联
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
        console.error('图片处理失败:', error);
        
        // 提供更详细的错误信息
        let errorMessage = '图片保存失败';
        
        // 检查不同类型的错误并提供具体信息
        if (error.message) {
          if (error.message.includes('canvas') || error.message.includes('Canvas')) {
            errorMessage = '图片格式不支持，请选择常见格式如JPG或PNG';
          } else if (error.message.includes('permission') || error.message.includes('权限')) {
            errorMessage = '无法读取图片，请检查权限设置';
          } else if (error.message.includes('memory') || error.message.includes('内存')) {
            errorMessage = '图片太大，设备内存不足';
          } else if (error.message.includes('storage') || error.message.includes('存储')) {
            errorMessage = '设备存储空间不足，请清理后重试';
          } else {
            errorMessage = `保存失败: ${error.message}`;
          }
        } else if (error.errMsg) {
          if (error.errMsg.includes('permission')) {
            errorMessage = '无法读取图片，请检查权限设置';
          } else if (error.errMsg.includes('format')) {
            errorMessage = '图片格式不支持';
          } else {
            errorMessage = `保存失败: ${error.errMsg}`;
          }
        }
        
        uni.showToast({
          title: errorMessage,
          icon: 'none',
          duration: 3000
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

// 处理图片加载错误
const handleImageError = () => {
  console.error('图片加载失败:', formData.value.image);
  
  // 显示错误提示
  uni.showToast({
    title: '图片加载失败',
    icon: 'none',
    duration: 2000
  });
}

// 切换季节选择
const toggleSeason = (season) => {
  const index = formData.value.seasons.indexOf(season)
  if (index > -1) {
    formData.value.seasons.splice(index, 1)
  } else {
    formData.value.seasons.push(season)
  }
}

// 设置风格
const setStyle = (style) => {
  formData.value.style = style
}

// 设置喜爱程度
const setRating = (rating) => {
  formData.value.rating = rating
}

// 处理输入框获取焦点
const handleFocus = (field) => {
  if (field === 'name') {
    isFocusName.value = true
  } else if (field === 'remark') {
    isFocusRemark.value = true
  }
}

// 处理输入框失去焦点
const handleBlur = (field) => {
  if (field === 'name') {
    isFocusName.value = false
    validateName()
  } else if (field === 'remark') {
    isFocusRemark.value = false
  }
}

// 验证名称
const validateName = () => {
  if (formData.value.name.trim() === '') {
    errors.value.name = '请输入衣物名称'
  } else {
    errors.value.name = ''
  }
}

// 保存衣物
const saveClothes = () => {
  if (!isFormValid.value) {
    return;
  }
  
  // 显示加载中
  uni.showLoading({
    title: '保存中...',
    mask: true
  });
  
  // 构建衣物数据对象
  const clothesData = {
    name: formData.value.name,
    category: formData.value.category,
    seasons: formData.value.seasons,
    style: formData.value.style,
    rating: formData.value.rating,
    color: formData.value.color,
    remark: formData.value.remark
  };
  
  // 如果有图片，将图片信息添加到衣物数据
  if (formData.value.image && formData.value.imageId) {
    console.log('保存包含图片的衣物数据:', formData.value.imageId);
    
    // 图片已经保存在本地存储中，直接使用
    clothesData.image = formData.value.image; // base64 URL
    clothesData.imageId = formData.value.imageId; // 本地存储的图片ID
    
    // 确保color字段存在，用于可能的降级显示
    if (!clothesData.color) {
      clothesData.color = '#cccccc';
    }
    
    console.log('最终使用的图片URL前缀:', clothesData.image.substring(0, 50) + '...');
    
    // 调用添加衣物API
    saveClothesToServer(clothesData);
  } else {
    // 没有图片，直接保存衣物数据
    console.log('保存无图片的衣物数据');
    saveClothesToServer(clothesData);
  }
};

// 保存衣物数据到服务器
const saveClothesToServer = async (clothesData) => {
  try {
    console.log('调用API保存衣物数据:', clothesData);
  
    // 使用API模块调用添加衣物接口
    const result = await clothesApi.add(clothesData);
    console.log('保存衣物响应:', result);
    
    if (result && result.code === 200) {
        uni.hideLoading();
        uni.showToast({
          title: '保存成功',
          icon: 'success'
        });
        
        console.log('衣物保存成功，准备返回首页...');
        // 返回上一页
        setTimeout(() => {
          // 先清理本页
          formData.value = {
            name: '',
            image: '',
            imageId: '',
            category: query.value.category,
            seasons: ['spring'],
            style: 'casual',
            rating: 3,
            color: '#FFFFFF',
            remark: ''
          };
          
          // 返回首页，确保数据刷新
          uni.navigateBack({
            success: () => {
              console.log('成功返回首页');
            }
          });
        }, 1500);
      } else {
        uni.hideLoading();
        uni.showToast({
        title: result?.message || '保存失败',
        icon: 'none'
      });
      console.error('保存衣物失败:', result);
    }
  } catch (error) {
    uni.hideLoading();
    console.error('保存数据失败:', error);
    uni.showToast({
      title: '保存失败',
      icon: 'none'
    });
  }
};

// 返回上一页
const goBack = () => {
  uni.navigateBack()
}

// 页面加载
onMounted(() => {
  // 获取页面参数
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.options || {}
  
  if (options.category) {
    query.value.category = options.category
    formData.value.category = options.category
  }
  
  // 初始化图片存储
  imageStorage.init()
  
  // 显示存储统计信息（可选）
  const stats = imageStorage.getStorageStats()
  console.log('本地图片存储统计:', stats)
  
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
  padding: 18px 20px;
  display: flex;
  align-items: center;
  z-index: 1;
  position: relative;
}

.header.compact {
  padding: 14px 16px;
}

.back-btn {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(5px);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.back-btn:active {
  transform: scale(0.92);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  background-color: rgba(255, 255, 255, 0.9);
}

.header-title {
  font-size: 22px;
  font-weight: 700;
  color: #333;
  background: linear-gradient(90deg, #4776E6, #8E54E9);
  -webkit-background-clip: text;
  color: transparent;
  letter-spacing: 0.3px;
  text-shadow: 0 2px 10px rgba(76, 132, 255, 0.1);
}

.content-box {
  flex: 1;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(15px);
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  box-shadow: 0 -6px 25px rgba(76, 132, 255, 0.12);
  z-index: 2;
  padding: 16px 14px;
  margin-top: 2px;
  transform: translateY(30px);
  opacity: 0;
  transition: all 0.5s ease;
}

.content-box.animate-in {
  transform: translateY(0);
  opacity: 1;
}

.form-container {
  padding-bottom: 12px;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s ease;
}

.form-container.animate-in {
  opacity: 1;
  transform: translateY(0);
  transition-delay: 0.1s;
}

.upload-section {
  margin-bottom: 14px;
}

.upload-area {
  width: 100%;
  height: 160px;
  background-color: #f5f7ff;
  border-radius: 14px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 3px 14px rgba(76, 132, 255, 0.1);
  border: 2px dashed rgba(76, 132, 255, 0.3);
  transition: all 0.3s ease;
}

.upload-area:active {
  transform: scale(0.98);
  box-shadow: 0 3px 10px rgba(76, 132, 255, 0.05);
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.color-block {
  display: flex;
  align-items: center;
  justify-content: center;
}

.color-block-text {
  color: #ffffff;
  font-size: 16px;
  font-weight: bold;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  padding: 6px 12px;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
}

.upload-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.upload-text {
  margin-top: 15px;
  font-size: 18px;
  font-weight: 600;
  color: #4776E6;
}

.upload-hint {
  margin-top: 8px;
  font-size: 14px;
  color: #999;
}

.form-group {
  margin-bottom: 14px;
}

/* 紧凑型表单组 */
.form-group.compact {
  margin-bottom: 12px;
}

/* 表单行布局 - 两列并排 */
.form-row {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
}

.form-col {
  flex: 1;
  min-width: 0;
}

.form-col .form-label {
  font-size: 13px;
  margin-bottom: 6px;
}

.form-label {
  font-size: 14px;
  color: #333;
  font-weight: 600;
  margin-bottom: 8px;
  display: block;
}

.form-label.compact {
  font-size: 13px;
  margin-bottom: 6px;
}

.input-wrapper {
  height: 44px;
  background-color: #f5f7ff;
  border-radius: 10px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  position: relative;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.input-wrapper.compact {
  height: 40px;
  padding: 0 10px;
  border-radius: 8px;
}

.input-wrapper.input-focus {
  background-color: #fff;
  border-color: rgba(76, 132, 255, 0.3);
  box-shadow: 0 5px 15px rgba(76, 132, 255, 0.1);
}

.input-wrapper.input-error {
  border-color: rgba(231, 76, 60, 0.5);
  background-color: rgba(231, 76, 60, 0.05);
}

.input-icon {
  margin-right: 12px;
}

.form-input {
  flex: 1;
  height: 100%;
  font-size: 16px;
  color: #333;
  background-color: transparent;
}

.textarea-wrapper {
  height: auto;
  min-height: 80px;
  padding: 10px 12px;
  align-items: flex-start;
}

.textarea-wrapper.compact {
  min-height: 70px;
  padding: 8px 10px;
}

.form-textarea {
  width: 100%;
  height: 70px;
  font-size: 15px;
  line-height: 1.4;
  color: #333;
  background-color: transparent;
}

.form-textarea.compact {
  height: 60px;
  font-size: 14px;
}

.error-tip {
  color: #E74C3C;
  font-size: 14px;
  margin-top: 8px;
  padding-left: 5px;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.tags-container.compact {
  gap: 6px;
  margin-top: 6px;
}

.tag {
  padding: 8px 14px;
  border-radius: 10px;
  background-color: #f5f7ff;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.tag.compact {
  padding: 6px 10px;
  border-radius: 8px;
}

.tag:active {
  transform: scale(0.95);
}

.tag text {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.tag.compact text {
  font-size: 13px;
}

.tag-selected {
  background: linear-gradient(145deg, rgba(76, 132, 255, 0.15), rgba(142, 84, 233, 0.15));
  border-color: rgba(76, 132, 255, 0.3);
}

.tag-selected text {
  color: #4776E6;
  font-weight: 600;
}

.rating-container {
  display: flex;
  align-items: center;
  margin-top: 10px;
  gap: 6px;
}

.rating-container.compact {
  margin-top: 6px;
  gap: 4px;
}

/* 评分标题行 */
.rating-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
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

.rating-star.compact {
  width: 28px;
  height: 28px;
}

.rating-star:hover {
  transform: scale(1.1);
}

.star-icon {
  position: relative;
  width: 22px;
  height: 22px;
}

.rating-star.compact .star-icon {
  width: 20px;
  height: 20px;
}

.star-shape {
  position: absolute;
  width: 22px;
  height: 22px;
  background: #ddd;
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
  transition: all 0.3s ease;
}

.rating-star.compact .star-shape {
  width: 20px;
  height: 20px;
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
  padding: 3px 8px;
  border-radius: 10px;
  border: 1px solid rgba(255, 215, 0, 0.2);
  min-width: 32px;
  text-align: center;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 12px;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s ease;
}

.action-buttons.animate-in {
  opacity: 1;
  transform: translateY(0);
  transition-delay: 0.2s;
}

.cancel-btn, .save-btn {
  flex: 1;
  height: 44px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  border: none;
}

.cancel-btn {
  background-color: #f5f7ff;
  color: #666;
  border: 2px solid transparent;
}

.cancel-btn:active {
  background-color: #e8ecf8;
  transform: translateY(2px);
}

.save-btn {
  background: linear-gradient(90deg, #4776E6, #8E54E9);
  color: #fff;
  box-shadow: 0 8px 20px rgba(76, 132, 255, 0.25);
}

.save-btn:active {
  transform: translateY(2px);
  box-shadow: 0 5px 15px rgba(76, 132, 255, 0.15);
}

.save-btn-disabled {
  opacity: 0.7;
  background: linear-gradient(90deg, #8aa6e9, #b094e2);
}

/* 移动端响应式优化 */
@media (max-width: 480px) {
  .header.compact {
    padding: 12px 14px;
  }
  
  .content-box {
    padding: 14px 10px;
    border-radius: 18px 18px 0 0;
  }
  
  .form-row {
    flex-direction: column;
    gap: 0;
    margin-bottom: 10px;
  }
  
  .form-col {
    margin-bottom: 10px;
  }
  
  .upload-area {
    height: 140px;
  }
  
  .tag.compact {
    padding: 4px 6px;
    font-size: 12px;
  }
  
  .rating-star.compact {
    width: 24px;
    height: 24px;
  }
  
  .rating-star.compact .star-icon {
    width: 16px;
    height: 16px;
  }
  
  .rating-star.compact .star-shape {
    width: 16px;
    height: 16px;
  }
  
  .action-buttons {
    margin-top: 10px;
    gap: 8px;
  }
}

/* 超小屏幕优化 */
@media (max-width: 360px) {
  .header.compact {
    padding: 10px 12px;
  }
  
  .back-btn {
    width: 34px;
    height: 34px;
    margin-right: 10px;
  }
  
  .header-title {
    font-size: 20px;
  }
  
  .content-box {
    padding: 12px 8px;
  }
  
  .form-group, .form-group.compact {
    margin-bottom: 10px;
  }
  
  .upload-area {
    height: 120px;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 6px;
    margin-top: 8px;
  }
  
  .cancel-btn, .save-btn {
    height: 40px;
    font-size: 14px;
  }
}
</style> 