#!/bin/bash

# 小黄衣官网部署脚本 - xhy.akanarika.info 专用
# 使用方法: ./deploy-xhy.sh [server_ip] [username]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 专用配置
DOMAIN="xhy.akanarika.info"
SERVER_IP=${1:-"your-server-ip"}
USERNAME=${2:-"root"}
PROJECT_NAME="xiaohangyi"
WEB_ROOT="/var/www/$PROJECT_NAME"
NGINX_SITES="/etc/nginx/sites-available"
NGINX_ENABLED="/etc/nginx/sites-enabled"

# 函数定义
print_header() {
    echo -e "${BLUE}"
    echo "=============================================="
    echo "    小黄衣官网部署脚本 - xhy.akanarika.info"
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

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# 检查参数
check_params() {
    if [ "$SERVER_IP" = "your-server-ip" ]; then
        print_error "请提供服务器IP地址: ./deploy-xhy.sh <server_ip> [username]"
        exit 1
    fi
}

# 打包网站文件
package_website() {
    print_step "打包网站文件..."
    
    # 创建临时目录
    TEMP_DIR="/tmp/xiaohangyi-website-$(date +%s)"
    mkdir -p "$TEMP_DIR"
    
    # 复制网站文件
    cp -r ./* "$TEMP_DIR/" 2>/dev/null || true
    
    # 排除不需要的文件
    rm -f "$TEMP_DIR/deploy"*.sh
    rm -f "$TEMP_DIR/README.md"
    rm -rf "$TEMP_DIR/.git"
    
    # 保留downloads文件夹但排除README
    if [ -d "$TEMP_DIR/downloads" ]; then
        rm -f "$TEMP_DIR/downloads/README.md"
    fi
    
    # 创建压缩包
    cd "$TEMP_DIR"
    tar -czf "/tmp/xiaohangyi-website.tar.gz" .
    cd - > /dev/null
    
    # 清理临时目录
    rm -rf "$TEMP_DIR"
    
    print_success "网站文件打包完成: /tmp/xiaohangyi-website.tar.gz"
}

# 上传文件到服务器
upload_files() {
    print_step "上传文件到服务器 $SERVER_IP..."
    
    # 上传压缩包
    scp "/tmp/xiaohangyi-website.tar.gz" "$USERNAME@$SERVER_IP:/tmp/"
    
    # 上传 Nginx 配置
    scp "nginx.conf" "$USERNAME@$SERVER_IP:/tmp/xiaohangyi.conf"
    
    print_success "文件上传完成"
}

# 在服务器上部署
deploy_on_server() {
    print_step "在服务器上部署网站..."
    
    ssh "$USERNAME@$SERVER_IP" << EOF
        set -e
        
        echo "创建网站目录..."
        mkdir -p $WEB_ROOT
        
        echo "解压网站文件..."
        cd $WEB_ROOT
        tar -xzf /tmp/xiaohangyi-website.tar.gz
        
        echo "设置文件权限..."
        chown -R www-data:www-data $WEB_ROOT
        chmod -R 755 $WEB_ROOT
        
        echo "配置 Nginx..."
        cp /tmp/xiaohangyi.conf $NGINX_SITES/$PROJECT_NAME
        
        # 启用站点
        if [ ! -L "$NGINX_ENABLED/$PROJECT_NAME" ]; then
            ln -s "$NGINX_SITES/$PROJECT_NAME" "$NGINX_ENABLED/$PROJECT_NAME"
        fi
        
        echo "测试 Nginx 配置..."
        nginx -t
        
        echo "重载 Nginx..."
        systemctl reload nginx
        
        echo "清理临时文件..."
        rm -f /tmp/xiaohangyi-website.tar.gz
        rm -f /tmp/xiaohangyi.conf
        
        echo "部署完成！"
EOF
    
    print_success "服务器部署完成"
}

# 验证部署
verify_deployment() {
    print_step "验证部署..."
    
    # 检查网站是否可访问
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://$DOMAIN" || echo "000")
    
    if [ "$HTTP_STATUS" = "200" ]; then
        print_success "网站部署成功! 🎉"
        echo -e "${GREEN}访问地址: http://$DOMAIN${NC}"
    else
        print_warning "网站可能需要一些时间来完全部署 (HTTP $HTTP_STATUS)"
        echo -e "${YELLOW}如果问题持续，请检查 DNS 解析和服务器配置${NC}"
    fi
}

# 显示部署信息
show_deployment_info() {
    echo ""
    echo -e "${BLUE}========== 部署信息 ==========${NC}"
    echo -e "域名: ${GREEN}$DOMAIN${NC}"
    echo -e "服务器: ${GREEN}$SERVER_IP${NC}"
    echo -e "用户: ${GREEN}$USERNAME${NC}"
    echo -e "网站目录: ${GREEN}$WEB_ROOT${NC}"
    echo ""
    echo -e "${BLUE}========== 后续步骤 ==========${NC}"
    echo -e "1. 确保 DNS 解析指向服务器 IP: ${GREEN}$SERVER_IP${NC}"
    echo -e "2. 如需 HTTPS，请配置 SSL 证书"
    echo -e "3. 访问网站: ${GREEN}http://$DOMAIN${NC}"
    echo ""
}

# 主流程
main() {
    print_header
    
    check_params
    package_website
    upload_files
    deploy_on_server
    verify_deployment
    show_deployment_info
    
    print_success "小黄衣官网部署完成! 🎊"
}

# 错误处理
trap 'print_error "部署过程中发生错误"; exit 1' ERR

# 执行主流程
main "$@"
