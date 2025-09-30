# 小黄衣APK下载文件夹

## 📱 文件说明

### 当前文件结构
```
downloads/
├── README.md              # 此说明文件
├── version.json           # 版本信息管理
└── xiaohangyi-v1.0.0.apk  # APK文件（需要您放置）
```

## 🚀 APK文件部署步骤

### 1. 准备APK文件
将您编译好的APK文件重命名为：`xiaohangyi-v1.0.0.apk`
（版本号可以根据实际情况调整）

### 2. 放置APK文件
```bash
# 将APK文件复制到此文件夹
cp /path/to/your/app.apk ./downloads/xiaohangyi-v1.0.0.apk
```

### 3. 更新版本信息
编辑 `version.json` 文件，更新：
- `version`: 版本号
- `versionCode`: 版本代码
- `releaseDate`: 发布日期
- `fileSize`: 文件大小
- `changelog`: 更新日志

### 4. 部署到服务器
使用部署脚本自动上传：
```bash
./deploy-xhy.sh <服务器IP> [用户名]
```

## 📊 文件大小建议

- **推荐大小**: 10-20MB
- **最大建议**: 50MB
- **优化提示**: 使用APK压缩和资源优化

## 🔄 版本更新流程

### 发布新版本时
1. 编译新的APK文件
2. 重命名为 `xiaohangyi-v{新版本号}.apk`
3. 更新 `version.json` 中的版本信息
4. 保留旧版本文件（可选）
5. 重新部署网站

### 版本命名规范
- **格式**: `xiaohangyi-v{major}.{minor}.{patch}.apk`
- **示例**: 
  - `xiaohangyi-v1.0.0.apk` (首个版本)
  - `xiaohangyi-v1.0.1.apk` (bug修复)
  - `xiaohangyi-v1.1.0.apk` (功能更新)
  - `xiaohangyi-v2.0.0.apk` (重大更新)

## 🌐 下载链接

用户访问网站时，下载链接将自动指向：
`https://xhy.akanarika.info/downloads/xiaohangyi-v1.0.0.apk`

## 📱 用户下载体验

### 下载过程
1. 用户点击下载按钮
2. 浏览器开始下载APK文件
3. 下载完成后，用户需要：
   - 允许安装未知来源应用
   - 点击安装
   - 完成安装过程

### 安装提示
网站会自动显示安装指导，帮助用户完成安装。

## 🛠️ 故障排除

### 常见问题
1. **文件无法下载**
   - 检查APK文件是否存在
   - 验证文件权限设置
   - 确认服务器配置

2. **下载速度慢**
   - 考虑使用CDN加速
   - 优化APK文件大小
   - 检查服务器带宽

3. **无法安装**
   - 检查APK是否损坏
   - 验证签名是否正确
   - 确认目标Android版本兼容性

## 📈 下载统计

可以通过服务器日志分析下载情况：
```bash
# 查看下载日志
grep "xiaohangyi.*\.apk" /var/log/nginx/xhy_access.log

# 统计下载次数
grep "xiaohangyi.*\.apk" /var/log/nginx/xhy_access.log | wc -l
```

---

**注意**: 请确保APK文件经过充分测试，签名正确，并且符合Google Play或其他应用商店的规范。
