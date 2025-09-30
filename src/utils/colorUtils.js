// 颜色处理工具函数

// 生成颜色图片URL（用于没有图片时的占位符）
export const generateColorImageUrl = (color = '#cccccc', width = 100, height = 100) => {
    // 确保颜色格式正确
    const cleanColor = color.replace('#', '')

    // 生成SVG数据URI
    const svgData = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="${width}" height="${height}" fill="#${cleanColor}"/>
    </svg>
  `

    // 编码为data URI
    const encodedSvg = encodeURIComponent(svgData.trim())
    return `data:image/svg+xml,${encodedSvg}`
}

// 生成颜色方块图片（带文字）
export const generateColorBlockWithText = (color = '#cccccc', text = '', width = 100, height = 100) => {
    const cleanColor = color.replace('#', '')

    // 计算文字颜色（根据背景色亮度）
    const textColor = getContrastColor(color)

    const svgData = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="${width}" height="${height}" fill="#${cleanColor}"/>
      ${text ? `<text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" fill="${textColor}" font-size="16" font-weight="bold">${text}</text>` : ''}
    </svg>
  `

    const encodedSvg = encodeURIComponent(svgData.trim())
    return `data:image/svg+xml,${encodedSvg}`
}

// 获取对比色（用于文字颜色）
export const getContrastColor = (hexColor) => {
    // 移除#号
    const color = hexColor.replace('#', '')

    // 转换为RGB
    const r = parseInt(color.substr(0, 2), 16)
    const g = parseInt(color.substr(2, 2), 16)
    const b = parseInt(color.substr(4, 2), 16)

    // 计算亮度
    const brightness = (r * 299 + g * 587 + b * 114) / 1000

    // 返回对比色
    return brightness > 128 ? '#000000' : '#ffffff'
}

// 颜色格式转换
export const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null
}

// RGB转HEX
export const rgbToHex = (r, g, b) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

// 生成随机颜色
export const generateRandomColor = () => {
    const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
        '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
        '#F8C471', '#82E0AA', '#F1948A', '#85929E', '#A569BD'
    ]

    return colors[Math.floor(Math.random() * colors.length)]
}

// 判断颜色是否为深色
export const isDarkColor = (hexColor) => {
    const color = hexColor.replace('#', '')
    const r = parseInt(color.substr(0, 2), 16)
    const g = parseInt(color.substr(2, 2), 16)
    const b = parseInt(color.substr(4, 2), 16)

    const brightness = (r * 299 + g * 587 + b * 114) / 1000
    return brightness < 128
}

// 默认导出
export default {
    generateColorImageUrl,
    generateColorBlockWithText,
    getContrastColor,
    hexToRgb,
    rgbToHex,
    generateRandomColor,
    isDarkColor
}
