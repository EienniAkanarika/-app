# 小黄衣官网部署指南

这是小黄衣应用的官方介绍网站，包含应用介绍、功能展示、下载链接等内容。

## 📁 文件结构

```
website/
├── index.html          # 主页面
├── css/
│   └── style.css      # 样式文件
├── js/
│   └── script.js      # 交互脚本
├── images/            # 图片资源文件夹
│   ├── logo.png       # 应用logo
│   ├── app-preview.png    # 应用预览图
│   ├── screenshot-1.png   # 应用截图1
│   ├── screenshot-2.png   # 应用截图2
│   ├── screenshot-3.png   # 应用截图3
│   ├── screenshot-4.png   # 应用截图4
│   ├── qr-code.png       # 下载二维码
│   └── favicon.ico       # 网站图标
├── nginx.conf         # Nginx配置文件
└── README.md          # 部署说明

```

## 🚀 部署步骤

### 1. 准备图片资源

在部署前，请准备以下图片文件并放入 `images/` 文件夹：

- **logo.png** (120x120px) - 应用logo
- **app-preview.png** (300x600px) - 手机应用预览图
- **screenshot-1.png** (400x800px) - 衣橱管理界面截图
- **screenshot-2.png** (400x800px) - 穿搭设计界面截图
- **screenshot-3.png** (400x800px) - 添加衣物界面截图
- **screenshot-4.png** (400x800px) - 个人中心界面截图
- **qr-code.png** (200x200px) - 应用下载二维码
- **favicon.ico** (32x32px) - 网站图标

### 2. 上传文件到服务器

将整个 `website` 文件夹上传到您的服务器：

```bash
# 示例：使用 scp 上传
scp -r website/ user@your-server:/var/www/xiaohangyi/

# 或使用 rsync
rsync -avz website/ user@your-server:/var/www/xiaohangyi/
```

### 3. 配置 Nginx

#### 方法一：直接使用提供的配置文件

```bash
# 复制配置文件
sudo cp /var/www/xiaohangyi/nginx.conf /etc/nginx/sites-available/xiaohangyi

# 创建软链接
sudo ln -s /etc/nginx/sites-available/xiaohangyi /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

#### 方法二：修改现有配置

编辑您的 Nginx 配置文件（通常在 `/etc/nginx/sites-available/default`）：

```nginx
server {
    listen 80;
    server_name xhy.akanarika.info;
    
    root /var/www/xiaohangyi;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 静态文件缓存
    location ~* \.(css|js|png|jpg|jpeg|gif|svg|ico)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 4. 设置文件权限

```bash
# 设置正确的文件权限
sudo chown -R www-data:www-data /var/www/xiaohangyi/
sudo chmod -R 644 /var/www/xiaohangyi/
sudo chmod 755 /var/www/xiaohangyi/
```

### 5. 配置域名

在您的域名管理面板中，将域名指向服务器 IP 地址：

```
A记录: xhy.akanarika.info -> 您的服务器IP
```

## 🔧 自定义配置

### 修改网站内容

编辑 `index.html` 文件，您可以修改：

- 应用名称和描述
- 功能特色介绍
- 下载链接
- 联系信息

### 修改样式

编辑 `css/style.css` 文件来自定义：

- 颜色主题
- 字体样式
- 布局间距
- 动画效果

### 添加下载链接

在 `index.html` 中找到下载按钮，修改 `href` 属性：

```html
<!-- Android 下载链接 -->
<a href="your-android-app-url" class="download-btn android-btn">

<!-- iOS 下载链接 -->
<a href="your-ios-app-url" class="download-btn ios-btn">

<!-- 网页版链接 -->
<a href="your-web-app-url" class="download-btn web-btn">
```

## 📱 响应式支持

网站完全支持响应式设计，在以下设备上都能完美显示：

- 桌面电脑 (1200px+)
- 平板电脑 (768px-1199px)
- 手机 (320px-767px)

## 🎨 功能特性

- ✅ 现代化设计风格
- ✅ 完全响应式布局
- ✅ 平滑滚动动画
- ✅ 图片懒加载
- ✅ SEO 优化
- ✅ 移动端友好
- ✅ 快速加载优化
- ✅ 跨浏览器兼容

## 🔍 SEO 优化

网站已包含基本的 SEO 优化：

- 语义化 HTML 结构
- Meta 标签完整
- 图片 alt 属性
- 结构化数据
- 移动端适配

## 📊 性能优化

- Gzip 压缩
- 静态资源缓存
- 图片优化
- CSS/JS 压缩
- 懒加载技术

## 🛠 故障排除

### 常见问题

1. **图片不显示**
   - 检查图片文件是否存在
   - 确认文件权限设置正确
   - 验证图片路径是否正确

2. **样式丢失**
   - 检查 CSS 文件路径
   - 确认 Nginx 配置正确
   - 验证文件权限

3. **404 错误**
   - 检查 Nginx 配置中的 root 路径
   - 确认 index.html 文件存在
   - 验证域名解析

### 调试命令

```bash
# 检查 Nginx 状态
sudo systemctl status nginx

# 查看 Nginx 错误日志
sudo tail -f /var/log/nginx/error.log

# 测试 Nginx 配置
sudo nginx -t

# 检查文件权限
ls -la /var/www/xiaohangyi/
```

## 📞 技术支持

如果您在部署过程中遇到问题，请检查：

1. 服务器环境是否满足要求
2. Nginx 配置是否正确
3. 文件权限是否设置正确
4. 域名解析是否生效

## 📝 更新日志

- **v1.0.0** - 初始版本发布
  - 完整的响应式官网
  - 应用介绍和功能展示
  - 下载页面和关于页面

---

**© 2024 小黄衣. All rights reserved.**

让每件衣服都有温度 ❤️
