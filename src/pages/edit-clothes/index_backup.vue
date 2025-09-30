<template>
  <view class="edit-clothes-container">
    <view class="bg-decoration">
      <view class="bg-circle bg-circle-1"></view>
      <view class="bg-circle bg-circle-2"></view>
    </view>

    <view class="header">
      <view class="back-btn" @tap="goBack">
        <uni-icons type="arrow-left" size="22" color="#4776E6"></uni-icons>
      </view>
      <text class="header-title">编辑{{ categoryName }}</text>
    </view>

    <view class="content-box">
      <view class="form-container" :class="{ 'animate-in': animateForm }">
        <!-- 衣物照片上传 -->
        <view class="upload-section">
          <view class="upload-area" @tap="handleImageClick">
            <image v-if="formData.image" class="preview-image" :src="formData.image" mode="aspectFill" @error="handleImageError"></image>
            <view v-else class="upload-placeholder">
              <uni-icons type="camera" size="46" color="#aaa"></uni-icons>
              <text class="upload-text">点击上传照片</text>
              <text class="upload-hint">支持拍照或从相册选择</text>
            </view>
            
            <!-- 添加更明确的图片编辑提示 -->
            <view v-if="formData.image" class="image-edit-tip">
              <uni-icons type="camera-filled" size="16" color="#fff"></uni-icons>
              <text>点击更换</text>
            </view>
            
            <!-- 图片放大按钮 -->
            <view v-if="formData.image" class="image-preview-btn" @tap.stop="previewImage">
              <uni-icons type="eye-filled" size="16" color="#fff"></uni-icons>
            </view>
          </view>
        </view>
        
        <!-- 衣物命名 -->
        <view class="form-group">
          <text class="form-label">衣物名称</text>
          <view class="input-wrapper" :class="{ 'input-focus': isFocusName, 'input-error': errors.name }">
            <uni-icons class="input-icon" type="info" size="20" :color="isFocusName ? '#4776E6' : '#aaa'"></uni-icons>
            <input type="text" class="form-input" v-model="formData.name" placeholder="请输入衣物名称" @focus="handleFocus('name')" @blur="handleBlur('name')" />
          </view>
          <text v-if="errors.name" class="error-tip">{{ errors.name }}</text>
        </view>
        
        <!-- 季节选择 -->
        <view class="form-group">
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
        
        <!-- 风格选择 -->
        <view class="form-group">
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
        
        <!-- 喜爱程度 -->
        <view class="form-group">
          <text class="form-label">喜爱程度</text>
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
          <text class="rating-text">{{ formData.rating }}/5</text>
        </view>
        
        <!-- 备注 -->
        <view class="form-group">
          <text class="form-label">备注</text>
          <view class="input-wrapper textarea-wrapper" :class="{ 'input-focus': isFocusRemark }">
            <textarea 
              class="form-textarea" 
              v-model="formData.remark" 
              placeholder="添加关于这件衣物的备注信息（可选）" 
              @focus="handleFocus('remark')" 
              @blur="handleBlur('remark')"
            />
          </view>
        </view>
      </view>
      
      <view class="action-buttons" :class="{ 'animate-in': animateForm }">
        <button class="cancel-btn" @tap="goBack">取消</button>
        <button class="save-btn" :class="{'save-btn-disabled': !isFormValid}" @tap="saveChanges">保存</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { compressImage, getFullImageUrl, proxyImageUrl, generatePreviewUrl } from '@/utils/imageUtils'
import { uploadClothesImage } from '@/api/upload.js'
import { clothesApi } from '@/api'
import { generateColorImageUrl } from '@/utils/colorUtils'

// 动画控制
const animateForm = ref(false)

// 表单加载标志
const formLoaded = ref(false)

// 获取页面参数
const query = ref({
  category: 'shirt',
  id: ''
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
  _id: '', // 用于存储MongoDB的ID
  id: '', // 兼容性处理
  category: 'shirt',
  seasons: ['spring'],
  style: 'casual',
  rating: 3,
  color: '#FFFFFF',
  remark: '',
  imageChanged: false
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
          title: '处理中...',
          mask: true
        });
        
        // 压缩图片
        const compressedPath = await compressImage(res.tempFilePaths[0], {
          quality: 75,
          maxWidth: 1200,
          maxHeight: 1200
        });
        
        // 设置本地预览图片
        formData.value.image = compressedPath;
        formData.value.imageChanged = true; // 标记图片已更改
        
        uni.hideLoading();
        
        // 提示用户图片已更新
        uni.showToast({
          title: '图片已更新',
          icon: 'success',
          duration: 1500
        });
      } catch (error) {
        uni.hideLoading();
        console.error('图片处理失败:', error);
        
        // 提供更详细的错误信息
        let errorMessage = '图片处理失败';
        
        // 检查不同类型的错误并提供具体信息
        if (error.message) {
          if (error.message.includes('canvas')) {
            errorMessage = '图片格式不支持，请选择常见格式如JPG或PNG';
          } else if (error.message.includes('permission') || error.message.includes('权限')) {
            errorMessage = '无法读取图片，请检查权限设置';
          } else if (error.message.includes('memory') || error.message.includes('内存')) {
            errorMessage = '图片太大，设备内存不足';
          } else {
            errorMessage = `处理失败: ${error.message}`;
          }
        } else if (error.errMsg) {
          if (error.errMsg.includes('permission')) {
            errorMessage = '无法读取图片，请检查权限设置';
          } else if (error.errMsg.includes('format')) {
            errorMessage = '图片格式不支持';
          } else {
            errorMessage = `处理失败: ${error.errMsg}`;
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

// 处理图片点击
const handleImageClick = () => {
  chooseImage();
};

// 预览大图
const previewImage = () => {
  if (!formData.value.image) {
    uni.showToast({
      title: '没有可预览的图片',
      icon: 'none'
    });
    return;
  }
  
  // 如果是默认生成的颜色图片，不预览
  if (formData.value.image.startsWith('data:image/svg+xml')) {
    uni.showToast({
      title: '这是默认颜色图片',
      icon: 'none'
    });
    return;
  }
  
  // 使用generatePreviewUrl处理图片URL，解决跨域问题
  const previewUrl = generatePreviewUrl(formData.value.image);
  console.log('预览图片:', previewUrl);
  
  uni.previewImage({
    current: 0,
    urls: [previewUrl],
    indicator: 'number',
    loop: false,
    success: () => {
      console.log('图片预览成功');
    },
    fail: (err) => {
      console.error('图片预览失败:', err);
      
      // 提供更详细的错误信息
      let errorMessage = '图片预览失败';
      
      if (err.errMsg) {
        if (err.errMsg.includes('permission') || err.errMsg.includes('authorize')) {
          errorMessage = '无权限预览图片，请检查设置';
        } else if (err.errMsg.includes('not found') || err.errMsg.includes('not exist')) {
          errorMessage = '图片不存在或已被删除';
        } else if (err.errMsg.includes('network') || err.errMsg.includes('fail')) {
          errorMessage = '网络错误，无法加载图片';
        } else {
          errorMessage = `预览失败: ${err.errMsg}`;
        }
      }
      
      uni.showToast({
        title: errorMessage,
        icon: 'none',
        duration: 3000
      });
    }
  });
};

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

// 加载衣物详情
const loadClothesDetail = async () => {
  // 显示加载中
  uni.showLoading({
    title: '加载中...',
    mask: true
  });
  
  try {
    console.log(`正在获取衣物详情，ID: ${query.value.id}`);
    
    // 使用API获取衣物详情
    const result = await clothesApi.getDetail(query.value.id);
    console.log('获取衣物详情响应:', result);
    
    if (result && result.code === 200 && result.data) {
      const clothesData = result.data;
      
      // 确保ID字段
      if (clothesData._id && !clothesData.id) {
        clothesData.id = clothesData._id;
      }
      
      // 处理图片URL
      if (clothesData.image) {
        try {
          console.log('原始图片URL:', clothesData.image);
          
          // 确保图片URL是完整路径
          const fullImageUrl = getFullImageUrl(clothesData.image);
          console.log('getFullImageUrl处理后:', fullImageUrl);
          
          // 使用代理处理图片URL以解决跨域问题
          clothesData.image = proxyImageUrl(fullImageUrl);
          console.log('proxyImageUrl处理后:', clothesData.image);
          
          // 检查是否是data URI
          if (clothesData.image.startsWith('/data:')) {
            console.error('检测到错误的data URI格式:', clothesData.image);
            // 修复错误的data URI格式
            clothesData.image = clothesData.image.substring(1); // 去掉开头的 /
            console.log('修复后的data URI:', clothesData.image);
          }
        } catch (err) {
          console.error('处理图片URL失败:', err);
          // 如果处理失败，使用原始URL
        }
      }
    
      // 更新表单数据
      formData.value = { 
        ...clothesData,
        imageChanged: false // 初始状态为未修改图片
      };
      
      console.log('衣物数据加载成功:', formData.value);
    
    // 表单已加载标志
    formLoaded.value = true;
    } else {
      console.warn('获取衣物详情失败:', result);
      uni.showToast({
        title: result?.message || '获取衣物信息失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('获取衣物详情出错:', error);
    uni.showToast({
      title: '获取衣物信息失败，请重试',
      icon: 'none'
    });
  } finally {
    // 隐藏加载中
    uni.hideLoading();
  }
};

// 保存衣物
const saveChanges = () => {
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
    id: query.value.id,
    name: formData.value.name,
    category: formData.value.category,
    seasons: formData.value.seasons,
    style: formData.value.style,
    rating: formData.value.rating,
    color: formData.value.color,
    remark: formData.value.remark
  };
  
  // 如果图片已更改且有新图片，上传新图片
  if (formData.value.imageChanged && formData.value.image) {
    // 上传图片到服务器
    uploadClothesImage(formData.value.image)
      .then(res => {
        // 假设服务器返回的数据结构为 {code: 200, message: '上传成功', data: {imageUrl: '图片URL', imageId: '图片ID'}}
        if (res.code === 200) {
          clothesData.image = res.data.imageUrl;
          clothesData.imageId = res.data.imageId; // 保存图片ID关联
          
          // 调用更新衣物API
          updateClothesToServer(clothesData);
        } else {
          uni.hideLoading();
          uni.showToast({
            title: res.message || '图片上传失败',
            icon: 'none'
          });
        }
      })
      .catch(error => {
        uni.hideLoading();
        console.error('图片上传失败:', error);
        
        // 提供更详细的错误信息
        let errorMessage = '图片上传失败';
        
        // 检查不同类型的错误并提供具体信息
        if (error.message) {
          if (error.message.includes('状态码: 401')) {
            errorMessage = '请求失败，请重试';
          } else if (error.message.includes('状态码: 413')) {
            errorMessage = '图片太大，请压缩后重试';
          } else if (error.message.includes('状态码: 415')) {
            errorMessage = '不支持的图片格式，请使用JPG或PNG格式';
          } else if (error.message.includes('状态码: 500')) {
            errorMessage = '服务器处理图片失败，请稍后重试';
          } else if (error.message.includes('timeout') || error.message.includes('超时')) {
            errorMessage = '上传超时，请检查网络后重试';
          } else if (error.message.includes('Network') || error.message.includes('网络')) {
            errorMessage = '网络异常，请检查网络连接';
          } else {
            // 使用错误信息中的实际内容
            errorMessage = `上传失败: ${error.message}`;
          }
        } else if (error.errMsg) {
          // 小程序环境下可能会有errMsg
          if (error.errMsg.includes('fail')) {
            if (error.errMsg.includes('timeout')) {
              errorMessage = '上传超时，请检查网络后重试';
            } else if (error.errMsg.includes('exceed')) {
              errorMessage = '图片太大，请选择较小的图片';
            } else {
              errorMessage = `上传失败: ${error.errMsg}`;
            }
          }
        }
        
        // 显示具体的错误信息
        uni.showToast({
          title: errorMessage,
          icon: 'none',
          duration: 3000
        });
      });
  } else {
    // 图片未更改，保留原图片信息
    if (formData.value.image) {
      clothesData.image = formData.value.image;
      clothesData.imageId = formData.value.imageId; // 保留原图片ID
    }
    
    // 直接更新衣物数据
    updateClothesToServer(clothesData);
  }
};

// 更新衣物数据到服务器
const updateClothesToServer = async (clothesData) => {
  try {
    console.log('准备更新衣物数据:', clothesData);
  
    // 获取衣物ID（支持_id或id）
    const clothesId = clothesData._id || clothesData.id;
    if (!clothesId) {
      throw new Error('衣物ID不存在');
    }
    
    // 使用API更新衣物数据
    const result = await clothesApi.edit(clothesId, clothesData);
    console.log('更新衣物响应:', result);
    
    if (result && result.code === 200) {
        uni.hideLoading();
        uni.showToast({
          title: '保存成功',
          icon: 'success'
        });
        
        // 返回上一页
        setTimeout(() => {
          goBack();
        }, 1500);
      } else {
      throw new Error(result?.message || '更新失败');
      }
  } catch (error) {
      uni.hideLoading();
    console.error('更新衣物数据失败:', error);
      uni.showToast({
      title: error.message || '保存失败',
        icon: 'none'
      });
    }
};

// 返回上一页
const goBack = () => {
  uni.navigateBack()
}

// 处理图片加载错误
const handleImageError = (e) => {
  console.error('图片加载失败:', formData.value.image);
  
  // 如果图片加载失败，显示提示并清除图片
  uni.showToast({
    title: '图片加载失败',
    icon: 'none',
    duration: 2000
  });
  
  // 清空图片，显示上传占位符
  formData.value.image = '';
}

// 页面加载
onMounted(() => {
  // 获取页面参数（兼容多种获取方式）
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  
  // 尝试通过不同方式获取参数
  const options = currentPage.options || currentPage.$page?.options || {};
  
  console.log('页面加载，获取到参数:', options);
  
  // 如果options为空，尝试通过uni.$router获取
  if (!options.id && !options.category) {
    try {
      const query = uni.getStorageSync('edit_clothes_params');
      if (query) {
        console.log('从缓存获取参数:', query);
        if (query.category) options.category = query.category;
        if (query.id) options.id = query.id;
        // 使用后清除
        uni.removeStorageSync('edit_clothes_params');
      }
    } catch (e) {
      console.error('获取缓存参数失败:', e);
    }
  }
  
  if (options.category) {
    query.value.category = options.category;
    formData.value.category = options.category;
    console.log('设置分类:', options.category);
  }
  
  if (options.id) {
    query.value.id = options.id;
    console.log('设置ID:', options.id);
    // 加载衣物详情
    loadClothesDetail();
  } else {
    console.error('缺少ID参数，无法加载衣物详情');
    uni.showToast({
      title: '缺少衣物ID参数',
      icon: 'none'
    });
    
    // 延迟返回上一页
    setTimeout(() => {
      goBack();
    }, 1500);
  }
  
  // 动画效果
  setTimeout(() => {
    animateForm.value = true;
  }, 100);
});
</script>

<style lang="scss">
page {
  background-color: #f9faff;
}

.edit-clothes-container {
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
  background: linear-gradient(145deg, rgba(76, 132, 255, 0.1), rgba(142, 84, 233, 0.2));
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

.back-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.header-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  background: linear-gradient(90deg, #4776E6, #8E54E9);
  -webkit-background-clip: text;
  color: transparent;
}

.content-box {
  flex: 1;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border-top-left-radius: 30px;
  border-top-right-radius: 30px;
  box-shadow: 0 -5px 30px rgba(76, 132, 255, 0.1);
  z-index: 2;
  display: flex;
  flex-direction: column;
  padding: 20px 20px;
}

.form-container {
  flex: 1;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s ease;
}

.form-container.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.upload-section {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.upload-area {
  width: 200px;
  height: 200px;
  background-color: #f5f5f5;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.98);
  }
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.upload-text {
  font-size: 16px;
  color: #666;
  margin-top: 15px;
  text-align: center;
}

.upload-hint {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
  text-align: center;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  font-size: 16px;
  color: #333;
  font-weight: 500;
  margin-bottom: 8px;
  display: block;
}

.input-wrapper {
  background-color: #f5f5f5;
  border-radius: 12px;
  padding: 0 15px;
  height: 50px;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
}

.input-focus {
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(71, 118, 230, 0.1);
  border: 1px solid #4776E6;
}

.input-error {
  border: 1px solid #E74C3C;
}

.input-icon {
  margin-right: 10px;
}

.form-input {
  flex: 1;
  height: 100%;
  font-size: 16px;
  color: #333;
  border: none;
  background: none;
}

.error-tip {
  font-size: 12px;
  color: #E74C3C;
  margin-top: 5px;
  padding-left: 5px;
}

.textarea-wrapper {
  height: auto;
  min-height: 100px;
  padding: 15px;
}

.form-textarea {
  width: 100%;
  height: 80px;
  font-size: 16px;
  color: #333;
  border: none;
  background: none;
  line-height: 1.5;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  margin: -5px;
}

.tag {
  margin: 5px;
  padding: 8px 16px;
  background-color: #f5f5f5;
  border-radius: 30px;
  font-size: 14px;
  color: #666;
  transition: all 0.3s ease;
}

.tag-selected {
  background: linear-gradient(90deg, #4776E6, #8E54E9);
  color: #fff;
  box-shadow: 0 2px 10px rgba(71, 118, 230, 0.2);
}

.rating-container {
  display: flex;
  align-items: center;
  margin-top: 10px;
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

.rating-star:hover {
  transform: scale(1.1);
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
  margin-left: 12px;
  font-size: 14px;
  color: #666;
  font-weight: 500;
  background: rgba(255, 215, 0, 0.1);
  padding: 4px 8px;
  border-radius: 12px;
  border: 1px solid rgba(255, 215, 0, 0.2);
}

.action-buttons {
  display: flex;
  margin-top: 20px;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s ease;
  transition-delay: 0.1s;
}

.action-buttons.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.cancel-btn, .save-btn {
  flex: 1;
  height: 50px;
  border-radius: 25px;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cancel-btn {
  margin-right: 10px;
  background-color: #f5f5f5;
  color: #666;
}

.save-btn {
  margin-left: 10px;
  background: linear-gradient(90deg, #4776E6, #8E54E9);
  color: #fff;
}

.save-btn-disabled {
  opacity: 0.6;
}

// 图片编辑提示层
.image-edit-tip {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0));
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  text {
    color: #fff;
    font-size: 14px;
    margin-left: 4px;
  }
}

// 图片预览按钮
.image-preview-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  transition: all 0.2s ease;
  
  &:active {
    transform: scale(0.9);
    background: rgba(0, 0, 0, 0.7);
  }
}
</style> 