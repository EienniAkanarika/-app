# APK上传部署指南

## 📱 APK文件准备

### 1. 生成APK文件
在您的Android项目中生成发布版APK：
```bash
# 使用Gradle构建发布版本
./gradlew assembleRelease

# 或使用Android Studio
# Build > Generate Signed Bundle / APK > APK
```

### 2. 重命名APK文件
将生成的APK文件重命名为：
```
xiaohangyi-v1.0.0.apk
```

**命名规范:**
- 格式：`xiaohangyi-v{主版本}.{次版本}.{修订版本}.apk`
- 示例：
  - `xiaohangyi-v1.0.0.apk` (首次发布)
  - `xiaohangyi-v1.0.1.apk` (bug修复)
  - `xiaohangyi-v1.1.0.apk` (功能更新)

## 📁 文件部署步骤

### 1. 复制APK到下载文件夹
```bash
# 复制APK文件到downloads文件夹
cp /path/to/your/app-release.apk ./downloads/xiaohangyi-v1.0.0.apk
```

### 2. 更新版本信息
编辑 `downloads/version.json` 文件：
```json
{
  "latest": {
    "version": "1.0.0",
    "versionCode": 1,
    "releaseDate": "2025-01-01",
    "downloadUrl": "downloads/xiaohangyi-v1.0.0.apk",
    "fileSize": "15.2 MB",
    "changelog": [
      "🎉 首个正式版本发布",
      "👕 衣橱管理功能",
      "✨ 穿搭方案设计"
    ]
  }
}
```

### 3. 更新网站文件
如果版本号发生变化，需要更新以下文件：

**index.html:**
```html
<!-- 更新下载链接 -->
<a href="downloads/xiaohangyi-v1.0.0.apk" download="xiaohangyi-v1.0.0.apk">
```

**download.html:**
```html
<!-- 更新下载链接和版本信息 -->
<a href="downloads/xiaohangyi-v1.0.0.apk" download="xiaohangyi-v1.0.0.apk">
```

### 4. 验证文件结构
确保文件结构如下：
```
website/
├── downloads/
│   ├── xiaohangyi-v1.0.0.apk  ← 您的APK文件
│   └── version.json           ← 版本信息
├── index.html                 ← 主页
├── download.html              ← 下载页面
└── ...
```

## 🚀 部署到服务器

### 方法一：使用自动部署脚本（推荐）
```bash
# 使用专用部署脚本
./deploy-xhy.sh <服务器IP> [用户名]

# 示例
./deploy-xhy.sh 192.168.1.100 root
```

### 方法二：手动上传
```bash
# 手动上传APK文件
scp downloads/xiaohangyi-v1.0.0.apk root@<服务器IP>:/var/www/xiaohangyi/downloads/

# 重新部署整个网站
./deploy-xhy.sh <服务器IP> [用户名]
```

## 📊 文件大小优化建议

### APK大小控制
- **推荐大小**: 10-20MB
- **最大建议**: 50MB
- **优化方法**:
  - 启用代码混淆
  - 移除未使用的资源
  - 压缩图片资源
  - 使用矢量图标

### 下载体验优化
```bash
# 检查APK文件大小
ls -lh downloads/xiaohangyi-v1.0.0.apk

# 获取实际文件大小（用于更新version.json）
du -h downloads/xiaohangyi-v1.0.0.apk
```

## 🔍 部署验证

### 1. 检查文件上传
```bash
# 连接服务器验证文件存在
ssh root@<服务器IP> "ls -la /var/www/xiaohangyi/downloads/"
```

### 2. 测试下载链接
访问以下链接验证下载功能：
- https://xhy.akanarika.info/downloads/xiaohangyi-v1.0.0.apk
- https://xhy.akanarika.info/download.html

### 3. 检查文件权限
```bash
# 确保文件具有正确权限
ssh root@<服务器IP> "chmod 644 /var/www/xiaohangyi/downloads/*.apk"
```

## 📈 下载统计监控

### 查看下载日志
```bash
# 查看APK下载记录
ssh root@<服务器IP> "grep 'xiaohangyi.*\.apk' /var/log/nginx/xhy_access.log"

# 统计下载次数
ssh root@<服务器IP> "grep 'xiaohangyi.*\.apk' /var/log/nginx/xhy_access.log | wc -l"
```

### 下载分析脚本
```bash
# 创建下载统计脚本
cat > download-stats.sh << 'EOF'
#!/bin/bash
echo "=== 小黄衣APK下载统计 ==="
echo "总下载次数: $(grep 'xiaohangyi.*\.apk' /var/log/nginx/xhy_access.log | wc -l)"
echo "今日下载次数: $(grep "$(date '+%d/%b/%Y')" /var/log/nginx/xhy_access.log | grep 'xiaohangyi.*\.apk' | wc -l)"
echo "最近10次下载:"
grep 'xiaohangyi.*\.apk' /var/log/nginx/xhy_access.log | tail -10
EOF

chmod +x download-stats.sh
```

## 🔄 版本更新流程

### 发布新版本时
1. **构建新APK** → 重命名为新版本号
2. **更新version.json** → 修改版本信息和更新日志
3. **更新HTML文件** → 修改下载链接
4. **重新部署网站** → 使用部署脚本
5. **验证下载功能** → 测试新版本下载

### 保留历史版本（可选）
```bash
# 保留旧版本文件
mv downloads/xiaohangyi-v1.0.0.apk downloads/archive/
cp new-version.apk downloads/xiaohangyi-v1.1.0.apk
```

## ⚠️ 注意事项

### 安全建议
- 确保APK文件已正确签名
- 验证APK文件完整性
- 定期备份APK文件

### 用户体验
- 保持文件命名一致性
- 及时更新版本信息
- 提供清晰的安装指导

### 服务器维护
- 定期清理旧版本文件
- 监控存储空间使用
- 备份重要版本文件

---

**完成这些步骤后，用户将能够通过网站直接下载您的Android应用！** 🎉
