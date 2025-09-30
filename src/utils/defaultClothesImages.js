/**
 * 默认衣物图片资源
 * 使用美观的SVG图标来替代简单的颜色块
 */

// 帽子类图标
const hatIcons = {
    // 棒球帽
    cap: `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"%3E%3Cdefs%3E%3ClinearGradient id="capGrad" x1="0%" y1="0%" x2="100%" y2="100%"%3E%3Cstop offset="0%" style="stop-color:%23E74C3C;stop-opacity:1" /%3E%3Cstop offset="100%" style="stop-color:%23C0392B;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="120" height="120" fill="%23f8f9fa" rx="16"/%3E%3Cg transform="translate(20,25)"%3E%3C!-- 帽檐 --%3E%3Cellipse cx="40" cy="55" rx="55" ry="8" fill="%23A93226" opacity="0.8"/%3E%3C!-- 帽身 --%3E%3Cpath d="M 15 35 Q 15 20 40 20 Q 65 20 65 35 L 65 50 Q 65 60 40 60 Q 15 60 15 50 Z" fill="url(%23capGrad)"/%3E%3C!-- 帽檐主体 --%3E%3Cellipse cx="40" cy="52" rx="50" ry="6" fill="%23A93226"/%3E%3C!-- 装饰线 --%3E%3Cline x1="20" y1="45" x2="60" y2="45" stroke="%23ffffff" stroke-width="2" opacity="0.3"/%3E%3C/g%3E%3C/svg%3E`,

    // 遮阳帽
    sunHat: `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"%3E%3Cdefs%3E%3ClinearGradient id="sunHatGrad" x1="0%" y1="0%" x2="100%" y2="100%"%3E%3Cstop offset="0%" style="stop-color:%23F39C12;stop-opacity:1" /%3E%3Cstop offset="100%" style="stop-color:%23E67E22;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="120" height="120" fill="%23f8f9fa" rx="16"/%3E%3Cg transform="translate(20,20)"%3E%3C!-- 大帽檐 --%3E%3Cellipse cx="40" cy="45" rx="35" ry="25" fill="url(%23sunHatGrad)" opacity="0.9"/%3E%3C!-- 帽顶 --%3E%3Cellipse cx="40" cy="35" rx="20" ry="15" fill="url(%23sunHatGrad)"/%3E%3C!-- 装饰带 --%3E%3Cpath d="M 25 35 Q 40 32 55 35" stroke="%23D35400" stroke-width="3" fill="none"/%3E%3C!-- 阴影效果 --%3E%3Cellipse cx="40" cy="65" rx="30" ry="5" fill="%23000000" opacity="0.1"/%3E%3C/g%3E%3C/svg%3E`
}

// T恤类图标
const shirtIcons = {
    // 白色T恤
    whiteTShirt: `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"%3E%3Cdefs%3E%3ClinearGradient id="whiteTShirtGrad" x1="0%" y1="0%" x2="100%" y2="100%"%3E%3Cstop offset="0%" style="stop-color:%23ffffff;stop-opacity:1" /%3E%3Cstop offset="100%" style="stop-color:%23f8f9fa;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="120" height="120" fill="%23f8f9fa" rx="16"/%3E%3Cg transform="translate(25,15)"%3E%3C!-- T恤主体 --%3E%3Cpath d="M 20 25 L 20 80 L 50 80 L 50 25 L 45 20 L 40 20 L 40 15 L 30 15 L 30 20 L 25 20 Z" fill="url(%23whiteTShirtGrad)" stroke="%23e9ecef" stroke-width="1"/%3E%3C!-- 袖子 --%3E%3Cpath d="M 15 25 L 20 25 L 20 35 L 15 40 L 10 35 L 15 25" fill="url(%23whiteTShirtGrad)" stroke="%23e9ecef" stroke-width="1"/%3E%3Cpath d="M 50 25 L 55 25 L 60 35 L 55 40 L 50 35 L 50 25" fill="url(%23whiteTShirtGrad)" stroke="%23e9ecef" stroke-width="1"/%3E%3C!-- 领口装饰 --%3E%3Cpath d="M 30 15 Q 35 12 40 15" stroke="%23dee2e6" stroke-width="1" fill="none"/%3E%3C/g%3E%3C/svg%3E`,

    // 黑色T恤
    blackTShirt: `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"%3E%3Cdefs%3E%3ClinearGradient id="blackTShirtGrad" x1="0%" y1="0%" x2="100%" y2="100%"%3E%3Cstop offset="0%" style="stop-color:%232C3E50;stop-opacity:1" /%3E%3Cstop offset="100%" style="stop-color:%2334495E;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="120" height="120" fill="%23f8f9fa" rx="16"/%3E%3Cg transform="translate(25,15)"%3E%3C!-- T恤主体 --%3E%3Cpath d="M 20 25 L 20 80 L 50 80 L 50 25 L 45 20 L 40 20 L 40 15 L 30 15 L 30 20 L 25 20 Z" fill="url(%23blackTShirtGrad)"/%3E%3C!-- 袖子 --%3E%3Cpath d="M 15 25 L 20 25 L 20 35 L 15 40 L 10 35 L 15 25" fill="url(%23blackTShirtGrad)"/%3E%3Cpath d="M 50 25 L 55 25 L 60 35 L 55 40 L 50 35 L 50 25" fill="url(%23blackTShirtGrad)"/%3E%3C!-- 高光效果 --%3E%3Cpath d="M 22 27 L 25 27 L 25 45" stroke="%23ffffff" stroke-width="1" opacity="0.2" fill="none"/%3E%3C/g%3E%3C/svg%3E`,

    // 蓝色T恤
    blueTShirt: `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"%3E%3Cdefs%3E%3ClinearGradient id="blueTShirtGrad" x1="0%" y1="0%" x2="100%" y2="100%"%3E%3Cstop offset="0%" style="stop-color:%233498DB;stop-opacity:1" /%3E%3Cstop offset="100%" style="stop-color:%232980B9;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="120" height="120" fill="%23f8f9fa" rx="16"/%3E%3Cg transform="translate(25,15)"%3E%3C!-- T恤主体 --%3E%3Cpath d="M 20 25 L 20 80 L 50 80 L 50 25 L 45 20 L 40 20 L 40 15 L 30 15 L 30 20 L 25 20 Z" fill="url(%23blueTShirtGrad)"/%3E%3C!-- 袖子 --%3E%3Cpath d="M 15 25 L 20 25 L 20 35 L 15 40 L 10 35 L 15 25" fill="url(%23blueTShirtGrad)"/%3E%3Cpath d="M 50 25 L 55 25 L 60 35 L 55 40 L 50 35 L 50 25" fill="url(%23blueTShirtGrad)"/%3E%3C!-- 折痕效果 --%3E%3Cpath d="M 35 30 L 35 75" stroke="%231F618D" stroke-width="0.5" opacity="0.3"/%3E%3C/g%3E%3C/svg%3E`
}

// 裤子类图标
const pantsIcons = {
    // 牛仔裤
    jeans: `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"%3E%3Cdefs%3E%3ClinearGradient id="jeansGrad" x1="0%" y1="0%" x2="100%" y2="100%"%3E%3Cstop offset="0%" style="stop-color:%232980B9;stop-opacity:1" /%3E%3Cstop offset="100%" style="stop-color:%2321618C;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="120" height="120" fill="%23f8f9fa" rx="16"/%3E%3Cg transform="translate(30,10)"%3E%3C!-- 腰带区域 --%3E%3Crect x="10" y="10" width="40" height="8" fill="%23D35400" rx="2"/%3E%3C!-- 左裤腿 --%3E%3Cpath d="M 15 18 L 15 90 L 25 90 L 27 18 Z" fill="url(%23jeansGrad)"/%3E%3C!-- 右裤腿 --%3E%3Cpath d="M 33 18 L 35 90 L 45 90 L 45 18 Z" fill="url(%23jeansGrad)"/%3E%3C!-- 口袋装饰 --%3E%3Crect x="17" y="25" width="8" height="6" fill="none" stroke="%23F7DC6F" stroke-width="0.8"/%3E%3Crect x="35" y="25" width="8" height="6" fill="none" stroke="%23F7DC6F" stroke-width="0.8"/%3E%3C!-- 接缝线 --%3E%3Cpath d="M 30 18 L 30 90" stroke="%23154360" stroke-width="1" opacity="0.4"/%3E%3C/g%3E%3C/svg%3E`,

    // 休闲裤
    casualPants: `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"%3E%3Cdefs%3E%3ClinearGradient id="casualPantsGrad" x1="0%" y1="0%" x2="100%" y2="100%"%3E%3Cstop offset="0%" style="stop-color:%23566573;stop-opacity:1" /%3E%3Cstop offset="100%" style="stop-color:%23515A5A;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="120" height="120" fill="%23f8f9fa" rx="16"/%3E%3Cg transform="translate(30,10)"%3E%3C!-- 腰部 --%3E%3Crect x="10" y="10" width="40" height="6" fill="%23212F3D" rx="1"/%3E%3C!-- 左裤腿 --%3E%3Cpath d="M 15 16 L 15 90 L 25 90 L 27 16 Z" fill="url(%23casualPantsGrad)"/%3E%3C!-- 右裤腿 --%3E%3Cpath d="M 33 16 L 35 90 L 45 90 L 45 16 Z" fill="url(%23casualPantsGrad)"/%3E%3C!-- 侧缝 --%3E%3Cpath d="M 15 16 L 15 90" stroke="%23212F3D" stroke-width="0.5" opacity="0.6"/%3E%3Cpath d="M 45 16 L 45 90" stroke="%23212F3D" stroke-width="0.5" opacity="0.6"/%3E%3C/g%3E%3C/svg%3E`
}

// 外套类图标
const coatIcons = {
    // 夹克
    jacket: `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"%3E%3Cdefs%3E%3ClinearGradient id="jacketGrad" x1="0%" y1="0%" x2="100%" y2="100%"%3E%3Cstop offset="0%" style="stop-color:%23E67E22;stop-opacity:1" /%3E%3Cstop offset="100%" style="stop-color:%23D35400;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="120" height="120" fill="%23f8f9fa" rx="16"/%3E%3Cg transform="translate(20,10)"%3E%3C!-- 夹克主体 --%3E%3Cpath d="M 20 20 L 20 85 L 55 85 L 55 20 L 50 15 L 45 15 L 45 10 L 30 10 L 30 15 L 25 15 Z" fill="url(%23jacketGrad)"/%3E%3C!-- 左袖 --%3E%3Cpath d="M 10 20 L 20 20 L 20 40 L 15 50 L 5 45 L 10 20" fill="url(%23jacketGrad)"/%3E%3C!-- 右袖 --%3E%3Cpath d="M 55 20 L 65 20 L 70 45 L 60 50 L 55 40 L 55 20" fill="url(%23jacketGrad)"/%3E%3C!-- 拉链 --%3E%3Cpath d="M 37.5 20 L 37.5 85" stroke="%23BDC3C7" stroke-width="2"/%3E%3C!-- 口袋 --%3E%3Crect x="25" y="45" width="12" height="8" fill="none" stroke="%23A04000" stroke-width="1"/%3E%3Crect x="38" y="45" width="12" height="8" fill="none" stroke="%23A04000" stroke-width="1"/%3E%3C/g%3E%3C/svg%3E`,

    // 大衣
    overcoat: `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"%3E%3Cdefs%3E%3ClinearGradient id="overcoatGrad" x1="0%" y1="0%" x2="100%" y2="100%"%3E%3Cstop offset="0%" style="stop-color:%23873600;stop-opacity:1" /%3E%3Cstop offset="100%" style="stop-color:%236E2C00;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="120" height="120" fill="%23f8f9fa" rx="16"/%3E%3Cg transform="translate(15,8)"%3E%3C!-- 大衣主体 --%3E%3Cpath d="M 25 15 L 25 95 L 65 95 L 65 15 L 60 10 L 50 10 L 50 5 L 40 5 L 40 10 L 30 10 Z" fill="url(%23overcoatGrad)"/%3E%3C!-- 左袖 --%3E%3Cpath d="M 15 15 L 25 15 L 25 45 L 20 55 L 10 50 L 15 15" fill="url(%23overcoatGrad)"/%3E%3C!-- 右袖 --%3E%3Cpath d="M 65 15 L 75 15 L 80 50 L 70 55 L 65 45 L 65 15" fill="url(%23overcoatGrad)"/%3E%3C!-- 双排扣 --%3E%3Ccircle cx="35" cy="30" r="2" fill="%23F7DC6F"/%3E%3Ccircle cx="35" cy="40" r="2" fill="%23F7DC6F"/%3E%3Ccircle cx="55" cy="30" r="2" fill="%23F7DC6F"/%3E%3Ccircle cx="55" cy="40" r="2" fill="%23F7DC6F"/%3E%3C!-- 领子 --%3E%3Cpath d="M 35 10 L 40 5 L 45 5 L 50 10 L 45 15 L 40 15 L 35 10" fill="%236E2C00"/%3E%3C/g%3E%3C/svg%3E`
}

// 鞋子类图标  
const shoesIcons = {
    // 运动鞋
    sneakers: `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"%3E%3Cdefs%3E%3ClinearGradient id="sneakersGrad" x1="0%" y1="0%" x2="100%" y2="100%"%3E%3Cstop offset="0%" style="stop-color:%2316A085;stop-opacity:1" /%3E%3Cstop offset="100%" style="stop-color:%231ABC9C;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="120" height="120" fill="%23f8f9fa" rx="16"/%3E%3Cg transform="translate(15,40)"%3E%3C!-- 鞋底 --%3E%3Cellipse cx="45" cy="35" rx="40" ry="8" fill="%23212F3D"/%3E%3C!-- 鞋身 --%3Cpath d="M 10 25 Q 10 15 25 15 L 65 15 Q 80 15 85 25 L 85 30 Q 80 35 65 35 L 25 35 Q 10 35 10 25" fill="url(%23sneakersGrad)"/%3E%3C!-- 鞋带区域 --%3Cpath d="M 25 15 L 25 25 L 65 25 L 65 15" fill="%23ffffff" opacity="0.3"/%3E%3C!-- 装饰线 --%3Cpath d="M 15 30 Q 45 28 75 30" stroke="%23ffffff" stroke-width="2" fill="none" opacity="0.6"/%3E%3C!-- 品牌标志 --%3Ccircle cx="50" cy="20" r="4" fill="%23ffffff" opacity="0.8"/%3E%3C/g%3E%3C/svg%3E`,

    // 皮鞋
    leatherShoes: `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"%3E%3Cdefs%3E%3ClinearGradient id="leatherShoesGrad" x1="0%" y1="0%" x2="100%" y2="100%"%3E%3Cstop offset="0%" style="stop-color:%234A235A;stop-opacity:1" /%3E%3Cstop offset="100%" style="stop-color:%23633974;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="120" height="120" fill="%23f8f9fa" rx="16"/%3E%3Cg transform="translate(15,45)"%3E%3C!-- 鞋底 --%3E%3Cellipse cx="45" cy="30" rx="38" ry="6" fill="%232C3E50"/%3E%3C!-- 鞋身 --%3Cpath d="M 12 20 Q 12 10 25 10 L 65 10 Q 78 10 80 20 L 80 25 Q 75 30 65 30 L 25 30 Q 12 30 12 20" fill="url(%23leatherShoesGrad)"/%3E%3C!-- 装饰缝合线 --%3Cpath d="M 25 15 Q 45 12 65 15" stroke="%23F4D03F" stroke-width="1" fill="none" opacity="0.6"/%3E%3C!-- 光泽效果 --%3Cpath d="M 20 15 Q 30 12 40 15" stroke="%23ffffff" stroke-width="1.5" fill="none" opacity="0.4"/%3E%3C/g%3E%3C/svg%3E`,

    // 靴子
    boots: `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"%3E%3Cdefs%3E%3ClinearGradient id="bootsGrad" x1="0%" y1="0%" x2="100%" y2="100%"%3E%3Cstop offset="0%" style="stop-color:%236E2C00;stop-opacity:1" /%3E%3Cstop offset="100%" style="stop-color:%23935116;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="120" height="120" fill="%23f8f9fa" rx="16"/%3E%3Cg transform="translate(25,15)"%3E%3C!-- 鞋底 --%3E%3Cellipse cx="35" cy="85" rx="30" ry="5" fill="%23212F3D"/%3E%3C!-- 靴筒 --%3Cpath d="M 20 20 L 20 70 Q 20 75 25 75 L 45 75 Q 50 75 50 70 L 50 20 Q 50 15 45 15 L 25 15 Q 20 15 20 20" fill="url(%23bootsGrad)"/%3E%3C!-- 鞋头 --%3Cpath d="M 20 70 Q 20 80 35 85 Q 50 80 50 70 L 50 75 Q 45 80 35 80 Q 25 80 20 75 Z" fill="url(%23bootsGrad)"/%3E%3C!-- 装饰扣环 --%3Crect x="22" y="30" width="26" height="3" fill="%23BDC3C7" rx="1"/%3E%3Crect x="22" y="45" width="26" height="3" fill="%23BDC3C7" rx="1"/%3E%3C!-- 拉链 --%3Cpath d="M 48 20 L 48 65" stroke="%23BDC3C7" stroke-width="1.5"/%3E%3C/g%3E%3C/svg%3E`
}

// 裙子类图标
const skirtIcons = {
    // 短裙
    shortSkirt: `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"%3E%3Cdefs%3E%3ClinearGradient id="shortSkirtGrad" x1="0%" y1="0%" x2="100%" y2="100%"%3E%3Cstop offset="0%" style="stop-color:%23E91E63;stop-opacity:1" /%3E%3Cstop offset="100%" style="stop-color:%23AD1457;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="120" height="120" fill="%23f8f9fa" rx="16"/%3E%3Cg transform="translate(30,30)"%3E%3C!-- 腰带 --%3Crect x="15" y="10" width="30" height="5" fill="%236A1B9A" rx="2"/%3E%3C!-- 裙身 --%3Cpath d="M 15 15 L 15 35 Q 15 45 30 50 Q 45 45 45 35 L 45 15 Z" fill="url(%23shortSkirtGrad)"/%3E%3C!-- 装饰褶皱 --%3Cpath d="M 20 20 L 20 40" stroke="%23C2185B" stroke-width="1" opacity="0.6"/%3E%3Cpath d="M 30 20 L 30 45" stroke="%23C2185B" stroke-width="1" opacity="0.6"/%3E%3Cpath d="M 40 20 L 40 40" stroke="%23C2185B" stroke-width="1" opacity="0.6"/%3E%3C/g%3E%3C/svg%3E`,

    // 长裙
    longSkirt: `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"%3E%3Cdefs%3E%3ClinearGradient id="longSkirtGrad" x1="0%" y1="0%" x2="100%" y2="100%"%3E%3Cstop offset="0%" style="stop-color:%239C27B0;stop-opacity:1" /%3E%3Cstop offset="100%" style="stop-color:%23673AB7;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="120" height="120" fill="%23f8f9fa" rx="16"/%3E%3Cg transform="translate(30,15)"%3E%3C!-- 腰带 --%3E%3Crect x="15" y="10" width="30" height="4" fill="%234A148C" rx="2"/%3E%3C!-- 裙身 --%3E%3Cpath d="M 15 14 L 15 30 Q 15 75 30 85 Q 45 75 45 30 L 45 14 Z" fill="url(%23longSkirtGrad)"/%3E%3C!-- 装饰图案 --%3E%3Cpath d="M 25 25 Q 30 20 35 25" stroke="%23ffffff" stroke-width="1" fill="none" opacity="0.4"/%3E%3Cpath d="M 25 40 Q 30 35 35 40" stroke="%23ffffff" stroke-width="1" fill="none" opacity="0.4"/%3E%3C/g%3E%3C/svg%3E`
}

// 西装类图标
const suitIcons = {
    // 西装
    businessSuit: `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"%3E%3Cdefs%3E%3ClinearGradient id="suitGrad" x1="0%" y1="0%" x2="100%" y2="100%"%3E%3Cstop offset="0%" style="stop-color:%232C3E50;stop-opacity:1" /%3E%3Cstop offset="100%" style="stop-color:%2334495E;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="120" height="120" fill="%23f8f9fa" rx="16"/%3E%3Cg transform="translate(20,8)"%3E%3C!-- 西装外套 --%3E%3Cpath d="M 20 20 L 20 90 L 55 90 L 55 20 L 50 15 L 45 15 L 45 10 L 30 10 L 30 15 L 25 15 Z" fill="url(%23suitGrad)"/%3E%3C!-- 左袖 --%3E%3Cpath d="M 10 20 L 20 20 L 20 45 L 15 55 L 5 50 L 10 20" fill="url(%23suitGrad)"/%3E%3C!-- 右袖 --%3E%3Cpath d="M 55 20 L 65 20 L 70 50 L 60 55 L 55 45 L 55 20" fill="url(%23suitGrad)"/%3E%3C!-- 领带 --%3E%3Cpath d="M 35 15 L 35 50 L 37.5 55 L 40 50 L 40 15" fill="%23C0392B"/%3E%3C!-- 领结位置 --%3E%3Crect x="32" y="15" width="11" height="4" fill="%23E74C3C" rx="1"/%3E%3C!-- 口袋 --%3E%3Crect x="42" y="35" width="8" height="6" fill="none" stroke="%23ffffff" stroke-width="0.5" opacity="0.3"/%3E%3C!-- 纽扣 --%3E%3Ccircle cx="37.5" cy="30" r="1" fill="%23BDC3C7"/%3E%3Ccircle cx="37.5" cy="40" r="1" fill="%23BDC3C7"/%3E%3C/g%3E%3C/svg%3E`
}

// 导出默认衣物图片映射
export const defaultClothesImages = {
    // 帽子类
    hat: {
        '棒球帽': hatIcons.cap,
        '遮阳帽': hatIcons.sunHat
    },

    // T恤类
    shirt: {
        '白色T恤': shirtIcons.whiteTShirt,
        '黑色T恤': shirtIcons.blackTShirt,
        '蓝色T恤': shirtIcons.blueTShirt
    },

    // 裤子类
    pants: {
        '牛仔裤': pantsIcons.jeans,
        '休闲裤': pantsIcons.casualPants
    },

    // 外套类
    coat: {
        '夹克': coatIcons.jacket,
        '大衣': coatIcons.overcoat
    },

    // 鞋子类
    shoes: {
        '运动鞋': shoesIcons.sneakers,
        '皮鞋': shoesIcons.leatherShoes,
        '靴子': shoesIcons.boots
    },

    // 裙子类
    skirt: {
        '短裙': skirtIcons.shortSkirt,
        '长裙': skirtIcons.longSkirt
    },

    // 西装类
    suit: {
        '商务西装': suitIcons.businessSuit
    }
}

// 根据衣物名称和分类获取对应图片
export const getDefaultClothesImage = (category, name) => {
    const categoryImages = defaultClothesImages[category]
    if (categoryImages && categoryImages[name]) {
        return categoryImages[name]
    }

    // 如果没有找到对应的图片，返回该分类的第一个图片
    if (categoryImages) {
        const firstImage = Object.values(categoryImages)[0]
        if (firstImage) return firstImage
    }

    // 如果都没有，返回一个通用的衣物图标
    return `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"%3E%3Crect width="120" height="120" fill="%23f8f9fa" rx="16"/%3E%3Cg transform="translate(35,35)"%3E%3Crect x="10" y="10" width="30" height="30" fill="%23dee2e6" rx="5"/%3E%3Ctext x="25" y="30" text-anchor="middle" font-family="Arial" font-size="16" fill="%236c757d"%3E👕%3C/text%3E%3C/g%3E%3C/svg%3E`
}
