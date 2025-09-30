// 网站交互脚本

document.addEventListener('DOMContentLoaded', function () {
    // 移动端导航菜单切换
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    hamburger.addEventListener('click', function () {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // 点击导航链接时关闭移动端菜单
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // 导航栏滚动效果
    const navbar = document.querySelector('.navbar');
    let lastScrollTop = 0;

    window.addEventListener('scroll', function () {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = 'none';
        }

        lastScrollTop = scrollTop;
    });

    // 平滑滚动到锚点
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // 回到顶部按钮
    const backToTopBtn = document.getElementById('backToTop');

    window.addEventListener('scroll', function () {
        if (window.pageYOffset > 300) {
            backToTopBtn.style.display = 'flex';
        } else {
            backToTopBtn.style.display = 'none';
        }
    });

    backToTopBtn.addEventListener('click', function () {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // 滚动动画
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.scroll-animate');

        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;

            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('animate');
            }
        });
    };

    window.addEventListener('scroll', animateOnScroll);

    // 初始化动画
    animateOnScroll();

    // 为所有需要动画的元素添加类
    const elementsToAnimate = [
        '.feature-card',
        '.stat-card',
        '.about-content > *'
    ];

    elementsToAnimate.forEach(selector => {
        document.querySelectorAll(selector).forEach(element => {
            element.classList.add('scroll-animate');
        });
    });

    // 统计数字动画
    const animateNumbers = () => {
        const counters = document.querySelectorAll('.stat-number');

        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target')) || parseInt(counter.textContent);
            const increment = target / 100;
            let current = 0;

            const updateCounter = () => {
                if (current < target) {
                    current += increment;
                    if (counter.textContent.includes('K')) {
                        counter.textContent = Math.ceil(current / 1000) + 'K+';
                    } else if (counter.textContent.includes('★')) {
                        counter.textContent = current.toFixed(1) + '★';
                    } else if (counter.textContent.includes('%')) {
                        counter.textContent = Math.ceil(current) + '%';
                    } else {
                        counter.textContent = Math.ceil(current).toLocaleString() + '+';
                    }
                    setTimeout(updateCounter, 20);
                } else {
                    counter.textContent = counter.getAttribute('data-original') || counter.textContent;
                }
            };

            // 保存原始文本
            counter.setAttribute('data-original', counter.textContent);

            // 检查元素是否在视窗中
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        updateCounter();
                        observer.unobserve(entry.target);
                    }
                });
            });

            observer.observe(counter);
        });
    };

    // 初始化数字动画
    animateNumbers();

    // 图片懒加载
    const lazyImages = document.querySelectorAll('img[data-src]');

    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    lazyImages.forEach(img => imageObserver.observe(img));

    // 页面加载完成后的动画
    window.addEventListener('load', function () {
        // 为主要内容添加淡入动画
        const heroContent = document.querySelector('.hero-content');

        if (heroContent) {
            heroContent.classList.add('fade-in-up');
        }

    });

    // 防抖函数
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // 优化滚动事件
    const optimizedScroll = debounce(() => {
        animateOnScroll();
    }, 10);

    window.addEventListener('scroll', optimizedScroll);

    // 下载按钮点击统计
    document.querySelectorAll('.download-btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
            // 这里可以添加下载统计逻辑
            const platform = this.querySelector('.btn-platform').textContent;
            console.log(`Download clicked for: ${platform}`);

            // 如果没有实际下载链接，阻止默认行为
            if (this.getAttribute('href') === '#') {
                e.preventDefault();
                showComingSoonModal(platform);
            }
        });
    });

    // 显示即将推出的模态框
    function showComingSoonModal(platform) {
        // 创建模态框
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>即将推出</h3>
                <p>${platform} 版本正在开发中，敬请期待！</p>
                <p>您可以先尝试网页版本或关注我们的更新。</p>
                <button class="modal-close">确定</button>
            </div>
        `;

        // 添加模态框样式
        const style = document.createElement('style');
        style.textContent = `
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 2000;
                animation: fadeIn 0.3s ease;
            }
            
            .modal-content {
                background: white;
                padding: 40px;
                border-radius: 15px;
                text-align: center;
                max-width: 400px;
                margin: 20px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                animation: slideUp 0.3s ease;
            }
            
            .modal-content h3 {
                color: #4776E6;
                margin-bottom: 15px;
                font-size: 1.5rem;
            }
            
            .modal-content p {
                color: #666;
                margin-bottom: 15px;
                line-height: 1.6;
            }
            
            .modal-close {
                background: #4776E6;
                color: white;
                border: none;
                padding: 12px 30px;
                border-radius: 25px;
                cursor: pointer;
                font-weight: 600;
                margin-top: 15px;
                transition: all 0.3s ease;
            }
            
            .modal-close:hover {
                background: #3661d4;
                transform: translateY(-1px);
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideUp {
                from { 
                    opacity: 0;
                    transform: translateY(30px);
                }
                to { 
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(modal);

        // 关闭模态框
        const closeBtn = modal.querySelector('.modal-close');
        const closeModal = () => {
            modal.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(modal);
                document.head.removeChild(style);
            }, 300);
        };

        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // 键盘快捷键
    document.addEventListener('keydown', function (e) {
        // Esc 键关闭移动端菜单
        if (e.key === 'Escape') {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }

        // Ctrl + Home 返回顶部
        if (e.ctrlKey && e.key === 'Home') {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    });

    // 页面可见性变化时的优化
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
            // 页面不可见时暂停动画
            document.querySelectorAll('.hero-background').forEach(el => {
                el.style.animationPlayState = 'paused';
            });
        } else {
            // 页面可见时恢复动画
            document.querySelectorAll('.hero-background').forEach(el => {
                el.style.animationPlayState = 'running';
            });
        }
    });

    // 性能监控
    if ('performance' in window) {
        window.addEventListener('load', function () {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                console.log('Page load time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
            }, 0);
        });
    }

    console.log('小黄衣官网脚本加载完成 🎉');
});
