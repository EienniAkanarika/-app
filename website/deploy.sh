#!/bin/bash

# 小黄衣官网自动部署脚本
# 使用方法: ./deploy.sh [domain] [server_ip] [username]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
DOMAIN=${1:-"xhy.akanarika.info"}
SERVER_IP=${2:-"your-server-ip"}
USERNAME=${3:-"root"}
PROJECT_NAME="xiaohangyi"
WEB_ROOT="/var/www/$PROJECT_NAME"
NGINX_SITES="/etc/nginx/sites-available"
NGINX_ENABLED="/etc/nginx/sites-enabled"

# 函数定义
print_header() {
    echo -e "${BLUE}"
    echo "=============================================="
    echo "           小黄衣官网部署脚本"
    echo "=============================================="
    echo -e "${NC}"
}

print_step() {
    echo -e "${GREEN}[STEP]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_requirements() {
    print_step "检查本地环境..."
    
    # 检查必要的命令
    commands=("scp" "ssh" "tar")
    for cmd in "${commands[@]}"; do
        if ! command -v $cmd &> /dev/null; then
            print_error "$cmd 命令未找到，请先安装"
            exit 1
        fi
    done
    
    # 检查网站文件
    if [ ! -f "index.html" ]; then
        print_error "index.html 文件未找到，请在网站根目录运行此脚本"
        exit 1
    fi
    
    echo "✓ 本地环境检查通过"
}

create_package() {
    print_step "打包网站文件..."
    
    # 创建临时目录
    TEMP_DIR=$(mktemp -d)
    PACKAGE_NAME="xiaohangyi-website-$(date +%Y%m%d-%H%M%S).tar.gz"
    
    # 复制文件
    cp -r . "$TEMP_DIR/$PROJECT_NAME"
    
    # 删除不需要的文件
    rm -f "$TEMP_DIR/$PROJECT_NAME/deploy.sh"
    rm -f "$TEMP_DIR/$PROJECT_NAME/README.md"
    rm -f "$TEMP_DIR/$PROJECT_NAME/images/placeholder-generator.html"
    
    # 打包
    cd "$TEMP_DIR"
    tar -czf "$PACKAGE_NAME" "$PROJECT_NAME"
    mv "$PACKAGE_NAME" "$OLDPWD/"
    cd "$OLDPWD"
    
    # 清理临时目录
    rm -rf "$TEMP_DIR"
    
    echo "✓ 网站文件打包完成: $PACKAGE_NAME"
    echo "$PACKAGE_NAME"
}

upload_files() {
    local package_name=$1
    print_step "上传文件到服务器..."
    
    # 上传打包文件
    echo "正在上传 $package_name 到 $USERNAME@$SERVER_IP..."
    scp "$package_name" "$USERNAME@$SERVER_IP:/tmp/"
    
    # 在服务器上解压
    ssh "$USERNAME@$SERVER_IP" << EOF
        # 创建网站目录
        sudo mkdir -p $WEB_ROOT
        
        # 解压文件
        cd /tmp
        sudo tar -xzf $package_name
        
        # 移动文件到网站目录
        sudo rm -rf $WEB_ROOT/*
        sudo mv $PROJECT_NAME/* $WEB_ROOT/
        
        # 设置权限
        sudo chown -R www-data:www-data $WEB_ROOT
        sudo chmod -R 644 $WEB_ROOT
        sudo chmod 755 $WEB_ROOT
        
        # 清理临时文件
        rm -f $package_name
        rm -rf $PROJECT_NAME
        
        echo "✓ 文件上传和解压完成"
EOF
    
    # 删除本地打包文件
    rm -f "$package_name"
}

configure_nginx() {
    print_step "配置 Nginx..."
    
    ssh "$USERNAME@$SERVER_IP" << EOF
        # 检查 Nginx 是否安装
        if ! command -v nginx &> /dev/null; then
            echo "Nginx 未安装，正在安装..."
            sudo apt update
            sudo apt install -y nginx
        fi
        
        # 创建 Nginx 配置
        sudo tee $NGINX_SITES/$PROJECT_NAME > /dev/null << 'NGINXCONF'
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    root $WEB_ROOT;
    index index.html index.htm;
    
    # 启用 gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json
        image/svg+xml;
    
    # 静态文件缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|pdf|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary Accept-Encoding;
        access_log off;
    }
    
    # HTML 文件缓存
    location ~* \.html$ {
        expires 1h;
        add_header Cache-Control "public";
    }
    
    # 主页面
    location / {
        try_files \$uri \$uri/ /index.html;
        
        # 安全头
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    }
    
    # 禁止访问隐藏文件
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    # 错误页面
    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;
    
    # 日志配置
    access_log /var/log/nginx/${PROJECT_NAME}_access.log;
    error_log /var/log/nginx/${PROJECT_NAME}_error.log;
}
NGINXCONF
        
        # 启用站点
        sudo ln -sf $NGINX_SITES/$PROJECT_NAME $NGINX_ENABLED/
        
        # 删除默认站点（如果存在）
        sudo rm -f $NGINX_ENABLED/default
        
        # 测试配置
        if sudo nginx -t; then
            echo "✓ Nginx 配置测试通过"
        else
            echo "✗ Nginx 配置测试失败"
            exit 1
        fi
        
        # 重启 Nginx
        sudo systemctl restart nginx
        sudo systemctl enable nginx
        
        echo "✓ Nginx 配置完成"
EOF
}

setup_ssl() {
    print_warning "SSL 证书配置需要手动完成"
    echo "您可以使用以下命令安装 Let's Encrypt 证书:"
    echo ""
    echo "sudo apt install certbot python3-certbot-nginx"
    echo "sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
    echo ""
}

check_deployment() {
    print_step "检查部署状态..."
    
    # 检查 Nginx 状态
    ssh "$USERNAME@$SERVER_IP" << EOF
        echo "Nginx 状态:"
        sudo systemctl status nginx --no-pager -l
        
        echo ""
        echo "网站文件:"
        ls -la $WEB_ROOT/
        
        echo ""
        echo "端口监听:"
        sudo ss -tlnp | grep :80
EOF
    
    echo ""
    echo "🌐 网站访问地址:"
    echo "   http://$DOMAIN"
    echo "   http://$SERVER_IP"
}

main() {
    print_header
    
    echo "配置信息:"
    echo "  域名: $DOMAIN"
    echo "  服务器: $SERVER_IP"
    echo "  用户名: $USERNAME"
    echo "  项目名: $PROJECT_NAME"
    echo ""
    
    read -p "确认以上信息无误? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "部署已取消"
        exit 1
    fi
    
    # 执行部署步骤
    check_requirements
    
    package_name=$(create_package)
    upload_files "$package_name"
    configure_nginx
    setup_ssl
    check_deployment
    
    echo ""
    echo -e "${GREEN}=============================================="
    echo "           部署完成! 🎉"
    echo "=============================================="
    echo -e "${NC}"
    echo "网站已成功部署到: http://$DOMAIN"
    echo ""
    echo "后续步骤:"
    echo "1. 配置域名 DNS 解析"
    echo "2. 安装 SSL 证书 (推荐)"
    echo "3. 添加真实的应用截图"
    echo "4. 更新下载链接"
    echo ""
    echo "如有问题，请检查服务器日志:"
    echo "  sudo tail -f /var/log/nginx/${PROJECT_NAME}_error.log"
}

# 显示帮助信息
show_help() {
    echo "小黄衣官网部署脚本"
    echo ""
    echo "使用方法:"
    echo "  $0 [域名] [服务器IP] [用户名]"
    echo ""
    echo "参数说明:"
    echo "  域名      网站域名 (默认: your-domain.com)"
    echo "  服务器IP  服务器IP地址 (默认: your-server-ip)"
    echo "  用户名    SSH登录用户名 (默认: root)"
    echo ""
    echo "示例:"
    echo "  $0 example.com 192.168.1.100 ubuntu"
    echo ""
    echo "注意事项:"
    echo "  1. 确保能够 SSH 连接到服务器"
    echo "  2. 确保用户有 sudo 权限"
    echo "  3. 确保服务器已开放 80 和 443 端口"
}

# 检查参数
if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    show_help
    exit 0
fi

# 执行主函数
main
