// 图标工具函数 - 解决APP环境下图标显示问题

/**
 * 获取平台兼容的图标代码
 * @param {string} iconName 图标名称
 * @param {number} size 图标大小
 * @param {string} color 图标颜色
 * @returns {string} 图标的HTML或Unicode字符
 */
export const getCompatibleIcon = (iconName, size = 24, color = '#333') => {
    // APP环境使用Unicode字符
    // #ifdef APP-PLUS
    const iconMap = {
        'search': '🔍',
        'close': '✕',
        'back': '←',
        'edit': '✏️',
        'camera': '📷',
        'plus': '+',
        'check': '✓',
        'heart': '♥',
        'star': '★',
        'home': '🏠',
        'user': '👤',
        'clothes': '👕',
        'outfit': '👗',
        'wardrobe': '🚪',
        'profile': '👤',
        'date': '📅',
        'location': '📍',
        'image': '🖼️',
        'clear': '×',
        'info': 'ℹ️',
        'checkmark': '✓',
        'menu': '☰',
        'grid': '⊞',
        'list': '☰',
        'view-grid': '⊞',
        'view-list': '☰'
    }

    return iconMap[iconName] || '●'
    // #endif

    // H5和小程序环境使用SVG
    // #ifndef APP-PLUS
    const svgMap = {
        'search': `<svg viewBox="0 0 24 24" style="width:${size}px;height:${size}px;fill:${color}"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>`,
        'close': `<svg viewBox="0 0 24 24" style="width:${size}px;height:${size}px;fill:${color}"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`,
        'back': `<svg viewBox="0 0 24 24" style="width:${size}px;height:${size}px;fill:${color}"><path d="M15.41,7.41L14,6L8,12L14,18L15.41,16.59L10.83,12L15.41,7.41Z"/></svg>`,
        'edit': `<svg viewBox="0 0 24 24" style="width:${size}px;height:${size}px;fill:${color}"><path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"/></svg>`,
        'view-grid': `<svg viewBox="0 0 24 24" style="width:${size}px;height:${size}px;fill:${color}"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/></svg>`,
        'view-list': `<svg viewBox="0 0 24 24" style="width:${size}px;height:${size}px;fill:${color}"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg>`,
        'date': `<svg viewBox="0 0 24 24" style="width:${size}px;height:${size}px;fill:${color}"><path d="M19,3H18V1H16V3H8V1H6V3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M19,19H5V8H19V19Z"/></svg>`,
        'location': `<svg viewBox="0 0 24 24" style="width:${size}px;height:${size}px;fill:${color}"><path d="M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z"/></svg>`,
        'image': `<svg viewBox="0 0 24 24" style="width:${size}px;height:${size}px;fill:${color}"><path d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z"/></svg>`
    }

    return svgMap[iconName] || `<span style="font-size:${size}px;color:${color}">●</span>`
    // #endif
}

/**
 * 检查当前平台是否支持SVG
 * @returns {boolean}
 */
export const isSVGSupported = () => {
    // #ifdef APP-PLUS
    return false
    // #endif

    // #ifndef APP-PLUS
    return true
    // #endif
}

/**
 * 获取uni-icons的类型映射
 * @param {string} iconName 图标名称
 * @returns {string} uni-icons类型
 */
export const getUniIconType = (iconName) => {
    const typeMap = {
        'search': 'search',
        'close': 'close',
        'back': 'left',
        'edit': 'compose',
        'camera': 'camera',
        'plus': 'plus',
        'check': 'checkmarkempty',
        'heart': 'heart',
        'star': 'star',
        'home': 'home',
        'user': 'person',
        'clothes': 'shopping-bag',
        'outfit': 'images',
        'wardrobe': 'folder',
        'profile': 'contact',
        'date': 'calendar',
        'location': 'location',
        'image': 'image',
        'clear': 'clear',
        'info': 'info',
        'checkmark': 'checkmarkempty',
        'menu': 'bars',
        'grid': 'grid',
        'list': 'list',
        'view-grid': 'grid',
        'view-list': 'list'
    }

    return typeMap[iconName] || iconName
}

/**
 * 创建兼容的图标元素
 * @param {string} iconName 图标名称
 * @param {object} options 选项
 * @returns {object} Vue组件选项
 */
export const createCompatibleIcon = (iconName, options = {}) => {
    const { size = 24, color = '#333' } = options

    return {
        template: `
      <!-- #ifdef APP-PLUS -->
      <text class="app-icon-text" :style="textStyle">{{ iconText }}</text>
      <!-- #endif -->
      
      <!-- #ifndef APP-PLUS -->
      <uni-icons :type="uniType" :size="size" :color="color"></uni-icons>
      <!-- #endif -->
    `,
        data() {
            return {
                iconText: getCompatibleIcon(iconName),
                uniType: getUniIconType(iconName),
                size,
                color
            }
        },
        computed: {
            textStyle() {
                return {
                    fontSize: `${this.size}px`,
                    color: this.color,
                    lineHeight: '1',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                }
            }
        }
    }
}

export default {
    getCompatibleIcon,
    isSVGSupported,
    getUniIconType,
    createCompatibleIcon
}
