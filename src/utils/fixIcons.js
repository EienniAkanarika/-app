// 图标修复工具脚本
// 此文件用于批量替换页面中的SVG图标为兼容的AppIcon组件

// 批量替换页面中常见的SVG图标
export const iconReplacements = [
    {
        // 搜索图标
        oldPattern: /<svg[^>]*viewBox="0 0 24 24"[^>]*class="[^"]*search[^"]*"[^>]*>[\s\S]*?<path d="M15\.5 14h-\.79l-\.28-\.27A6\.471[\s\S]*?<\/svg>/g,
        newPattern: '<AppIcon name="search" :size="20" color="currentColor" />'
    },
    {
        // 关闭图标
        oldPattern: /<svg[^>]*viewBox="0 0 24 24"[^>]*>[\s\S]*?<path d="M19 6\.41L17\.59 5 12 10\.59[\s\S]*?<\/svg>/g,
        newPattern: '<AppIcon name="close" :size="16" color="currentColor" />'
    },
    {
        // 返回图标
        oldPattern: /<svg[^>]*viewBox="0 0 24 24"[^>]*class="[^"]*back[^"]*"[^>]*>[\s\S]*?<path d="M15\.41,7\.41L14,6L8,12L14,18L15\.41,16\.59L10\.83,12L15\.41,7\.41Z"[\s\S]*?<\/svg>/g,
        newPattern: '<AppIcon name="back" :size="20" color="white" />'
    },
    {
        // 编辑图标
        oldPattern: /<svg[^>]*viewBox="0 0 24 24"[^>]*class="[^"]*edit[^"]*"[^>]*>[\s\S]*?<path d="M20\.71,7\.04C21\.1,6\.65[\s\S]*?<\/svg>/g,
        newPattern: '<AppIcon name="edit" :size="20" color="white" />'
    },
    {
        // 日期图标
        oldPattern: /<svg[^>]*viewBox="0 0 24 24"[^>]*class="[^"]*meta[^"]*"[^>]*>[\s\S]*?<path d="M19,3H18V1H16V3H8V1H6V3H5A2,2[\s\S]*?<\/svg>/g,
        newPattern: '<AppIcon name="date" :size="16" color="#999" />'
    },
    {
        // 位置图标
        oldPattern: /<svg[^>]*viewBox="0 0 24 24"[^>]*class="[^"]*meta[^"]*"[^>]*>[\s\S]*?<path d="M12,11\.5A2\.5,2\.5[\s\S]*?<\/svg>/g,
        newPattern: '<AppIcon name="location" :size="16" color="#999" />'
    },
    {
        // 图片占位符
        oldPattern: /<svg[^>]*viewBox="0 0 24 24"[^>]*class="[^"]*placeholder[^"]*"[^>]*>[\s\S]*?<path d="M8\.5,13\.5L11,16\.5L14\.5,12L19,18H5M21,19V5[\s\S]*?<\/svg>/g,
        newPattern: '<AppIcon name="image" :size="32" color="#ccc" />'
    }
]

// 需要添加AppIcon导入的文件模式
export const importPattern = /(<script setup>[\s\S]*?)(import.*from.*['"])/

// AppIcon导入语句
export const appIconImport = "import AppIcon from '@/components/AppIcon.vue'\n"

// 检查文件是否已经导入了AppIcon
export const hasAppIconImport = (content) => {
    return content.includes("import AppIcon from '@/components/AppIcon.vue'")
}

// 添加AppIcon导入
export const addAppIconImport = (content) => {
    if (hasAppIconImport(content)) {
        return content
    }

    const match = content.match(importPattern)
    if (match) {
        return content.replace(importPattern, `$1${appIconImport}$2`)
    }

    // 如果没找到合适的位置，在script setup后添加
    const scriptMatch = content.match(/(<script setup>[\s\n]*)/i)
    if (scriptMatch) {
        return content.replace(scriptMatch[0], scriptMatch[0] + appIconImport)
    }

    return content
}

// 应用所有图标替换
export const applyIconReplacements = (content) => {
    let result = content

    iconReplacements.forEach(replacement => {
        result = result.replace(replacement.oldPattern, replacement.newPattern)
    })

    return result
}

// 完整的文件处理函数
export const processFile = (content) => {
    // 先应用图标替换
    let processed = applyIconReplacements(content)

    // 如果有替换发生，添加AppIcon导入
    if (processed !== content) {
        processed = addAppIconImport(processed)
    }

    return processed
}

export default {
    iconReplacements,
    hasAppIconImport,
    addAppIconImport,
    applyIconReplacements,
    processFile
}
