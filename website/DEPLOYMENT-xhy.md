# 小黄衣官网部署指南 - xhy.akanarika.info

## 📋 概述

本指南将帮助您将小黄衣官网部署到 `xhy.akanarika.info` 域名。

## 🛠️ 前置要求

### 服务器要求
- **操作系统**: Ubuntu 18.04+ / CentOS 7+ / Debian 9+
- **内存**: 至少 512MB RAM
- **存储**: 至少 1GB 可用空间
- **网络**: 公网 IP 地址

### 软件要求
- **Nginx**: 1.14+
- **SSH 访问**: 具有 sudo 权限的用户

### 本地要求
- **SSH 客户端**: 用于连接服务器
- **SCP/RSYNC**: 用于文件传输

## 🚀 快速部署

### 方法一：使用自动部署脚本（推荐）

1. **设置执行权限**
   ```bash
   chmod +x deploy-xhy.sh
   ```

2. **运行部署脚本**
   ```bash
   ./deploy-xhy.sh <服务器IP> [用户名]
   ```
   
   示例：
   ```bash
   ./deploy-xhy.sh 192.168.1.100 root
   ./deploy-xhy.sh 192.168.1.100 ubuntu
   ```

3. **等待部署完成**
   - 脚本会自动打包网站文件
   - 上传到服务器并配置 Nginx
   - 验证部署状态

### 方法二：手动部署

1. **上传网站文件**
   ```bash
   # 创建压缩包
   tar -czf xiaohangyi-website.tar.gz --exclude='deploy*.sh' --exclude='*.md' --exclude='.git' .
   
   # 上传到服务器
   scp xiaohangyi-website.tar.gz root@<服务器IP>:/tmp/
   scp nginx-xhy.conf root@<服务器IP>:/tmp/
   ```

2. **在服务器上配置**
   ```bash
   # 连接到服务器
   ssh root@<服务器IP>
   
   # 创建网站目录
   mkdir -p /var/www/xiaohangyi
   
   # 解压网站文件
   cd /var/www/xiaohangyi
   tar -xzf /tmp/xiaohangyi-website.tar.gz
   
   # 设置权限
   chown -R www-data:www-data /var/www/xiaohangyi
   chmod -R 755 /var/www/xiaohangyi
   
   # 配置 Nginx
   cp /tmp/nginx-xhy.conf /etc/nginx/sites-available/xiaohangyi
   ln -s /etc/nginx/sites-available/xiaohangyi /etc/nginx/sites-enabled/
   
   # 测试并重载配置
   nginx -t
   systemctl reload nginx
   ```

## 🌐 DNS 配置

### 设置 A 记录
在您的域名管理控制台中，添加以下记录：

```
类型: A
名称: xhy
值: <您的服务器IP>
TTL: 3600 (或默认值)
```

### 验证 DNS 解析
```bash
# 检查 DNS 解析
nslookup xhy.akanarika.info
dig xhy.akanarika.info

# 测试网站访问
curl -I http://xhy.akanarika.info
```

## 🔒 HTTPS 配置（推荐）

### 使用 Let's Encrypt （免费）

1. **安装 Certbot**
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install certbot python3-certbot-nginx
   
   # CentOS/RHEL
   sudo yum install certbot python3-certbot-nginx
   ```

2. **获取 SSL 证书**
   ```bash
   sudo certbot --nginx -d xhy.akanarika.info
   ```

3. **设置自动续期**
   ```bash
   sudo crontab -e
   # 添加以下行：
   0 12 * * * /usr/bin/certbot renew --quiet
   ```

### 手动配置 SSL

如果您有自己的 SSL 证书：

1. **上传证书文件**
   ```bash
   scp your-certificate.crt root@<服务器IP>:/etc/ssl/certs/
   scp your-private.key root@<服务器IP>:/etc/ssl/private/
   ```

2. **编辑 Nginx 配置**
   ```bash
   # 编辑配置文件
   sudo nano /etc/nginx/sites-available/xiaohangyi
   
   # 取消注释 HTTPS 配置部分
   # 更新证书路径
   ```

3. **重载 Nginx**
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

## 📊 性能优化

### 启用压缩
配置文件已包含 gzip 压缩配置，可显著减少传输大小。

### 缓存配置
- **静态文件**: 1年缓存
- **HTML文件**: 1小时缓存
- **动态内容**: 实时更新

### 监控建议
```bash
# 查看访问日志
sudo tail -f /var/log/nginx/xhy_access.log

# 查看错误日志
sudo tail -f /var/log/nginx/xhy_error.log

# 检查 Nginx 状态
sudo systemctl status nginx
```

## 🔧 故障排除

### 常见问题

1. **网站无法访问**
   - 检查 DNS 解析是否正确
   - 确认服务器防火墙设置
   - 验证 Nginx 配置语法

2. **403 Forbidden 错误**
   ```bash
   # 检查文件权限
   ls -la /var/www/xiaohangyi/
   
   # 修复权限
   sudo chown -R www-data:www-data /var/www/xiaohangyi
   sudo chmod -R 755 /var/www/xiaohangyi
   ```

3. **502 Bad Gateway 错误**
   ```bash
   # 检查 Nginx 错误日志
   sudo tail -f /var/log/nginx/error.log
   
   # 重启 Nginx
   sudo systemctl restart nginx
   ```

### 调试命令

```bash
# 测试 Nginx 配置
sudo nginx -t

# 重载配置
sudo nginx -s reload

# 检查端口占用
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443

# 检查防火墙
sudo ufw status
sudo iptables -L
```

## 📋 部署清单

- [ ] 服务器准备就绪
- [ ] Nginx 已安装
- [ ] 网站文件已上传
- [ ] Nginx 配置已设置
- [ ] DNS 解析已配置
- [ ] 网站可正常访问
- [ ] SSL 证书已配置（可选）
- [ ] 监控和日志已设置

## 📞 支持

如果在部署过程中遇到问题：

1. 检查服务器日志
2. 验证配置文件语法
3. 确认网络连接
4. 参考故障排除部分

## 🎯 访问网站

部署完成后，您可以通过以下地址访问：

- **HTTP**: http://xhy.akanarika.info
- **HTTPS**: https://xhy.akanarika.info (配置 SSL 后)

---

**小黄衣官网** - 专属女性的电子衣橱 💛
