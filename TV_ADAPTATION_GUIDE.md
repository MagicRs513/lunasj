# LunaTV Android TV 适配指南

## 概述

本文档说明如何将 LunaTV 应用适配为 Android TV 版本,使其能够在 Android TV 设备上正常运行并提供良好的用户体验。

## 已完成的 TV 适配功能

### 1. Android Manifest 配置

#### TV 特性声明

- ✅ 添加 `LEANBACK_LAUNCHER` 类别 - 支持 TV 启动
- ✅ 声明非必需触摸屏支持 - `required="false"`
- ✅ 添加横屏固定方向 - `screenOrientation="landscape"`
- ✅ 禁用 Activity 大小调整 - `resizeableActivity="false"`
- ✅ 设置横幅图标 - `android:banner`
- ✅ 添加 Game 属性 - `android:isGame="false"`

#### 新增权限

- ✅ `RECEIVE_BOOT_COMPLETED` - 自启动支持
- ✅ `FOREGROUND_SERVICE` - 前台服务
- ✅ `SYSTEM_ALERT_WINDOW` - 系统弹窗
- ✅ `REQUEST_INSTALL_PACKAGES` - 应用安装

### 2. MainActivity 优化

#### TV 交互优化

- ✅ **全屏显示** - 隐藏状态栏和导航栏
- ✅ **后退键处理** - 双击退出机制,避免误操作
- ✅ **地理定位自动授权** - 自动允许位置权限
- ✅ **禁用缩放** - 关闭 WebView 缩放功能
- ✅ **视口优化** - 使用宽视口模式
- ✅ **屏幕常亮** - 保持屏幕不熄灭
- ✅ **沉浸式体验** - 隐藏系统 UI

#### WebView 配置

```java
settings.setSupportZoom(false);
settings.setBuiltInZoomControls(false);
settings.setDisplayZoomControls(false);
settings.setUseWideViewPort(true);
settings.setLoadWithOverviewMode(true);
settings.setGeolocationEnabled(true);
```

### 3. 主题适配

#### Leanback 主题

- ✅ 创建 `AppTheme.Leanback` - 继承 `Theme.Leanback`
- ✅ 应用深色主题 - 适合 TV 观影环境
- ✅ 保持与原生一致性

### 4. 应用名称更新

- ✅ 应用名称: `LunaTV TV`
- ✅ 支持多语言: `values/` 和 `values-en/`
- ✅ 添加 TV 描述

### 5. Capacitor 配置

#### User Agent 更新

- ✅ 更新为 `LunaTV-AndroidTV/1.0`
- ✅ 后端可识别 TV 客户端
- ✅ 可根据客户端类型提供不同界面

#### 后端地址配置

- ✅ 配置远程后端地址
- ✅ 支持动态切换
- ✅ 允许所有导航

## TV 适配要点

### TV 交互特性

1. **无触摸屏**
   - 使用遥控器或游戏手柄操作
   - 焦点导航 (D-pad)
   - 确定/返回键

2. **横屏显示**
   - 固定横屏模式
   - 16:9 比例
   - 适配 TV 屏幕

3. **距离观看**
   - 较大的字体和图标
   - 清晰的焦点指示
   - 简化的界面

4. **后台运行**
   - 支持后台播放
   - 前台服务保证不杀
   - 自启动功能

### UI/UX 优化建议

#### 1. 焦点管理

**CSS 焦点样式**:
```css
:focus {
    outline: 3px solid #4CAF50;
    outline-offset: 2px;
}

.tv-button:focus {
    transform: scale(1.1);
    box-shadow: 0 0 20px rgba(76, 175, 80, 0.5);
}
```

**JavaScript 焦点处理**:
```javascript
// 自动聚焦第一个可聚焦元素
document.addEventListener('DOMContentLoaded', () => {
    const focusable = document.querySelector('[tabindex]:not([tabindex="-1"])');
    if (focusable) focusable.focus();
});

// 方向键导航
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        // 移动焦点到下一个元素
    }
});
```

#### 2. 字体和尺寸

**响应式字体**:
```css
@media (min-width: 1920px) {
    body {
        font-size: 24px;
    }
}

@media (min-width: 3840px) {
    body {
        font-size: 36px;
    }
}
```

#### 3. 视频播放器

**TV 专用配置**:
```javascript
const player = {
    // 自动播放
    autoplay: true,
    
    // 全屏控制
    controls: true,
    
    // 大按钮
    controlBar: {
        buttons: {
            fontSize: '32px',
            padding: '20px'
        }
    },
    
    // 键盘快捷键
    keyboard: {
        enabled: true,
        shortcuts: {
            'Space': 'togglePlay',
            'ArrowLeft': 'seekBackward',
            'ArrowRight': 'seekForward'
        }
    }
};
```

#### 4. 网格布局优化

**响应式网格**:
```css
.tv-grid {
    display: grid;
    gap: 30px;
    padding: 40px;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

@media (min-width: 1920px) {
    .tv-grid {
        grid-template-columns: repeat(5, 1fr);
    }
}

@media (min-width: 3840px) {
    .tv-grid {
        grid-template-columns: repeat(8, 1fr);
    }
}
```

## 构建和部署

### 构建 TV APK

```bash
# 1. 同步 Android 项目
cd LunaTV
npx cap sync android

# 2. 使用 Android Studio 构建
# 打开 android 目录
# Build > Generate Signed Bundle / APK
# 选择 APK 并签名
```

### 安装到 TV

#### 方法 1: ADB 安装

```bash
# 连接 TV 设备到同一网络
adb connect <TV_IP_ADDRESS>:5555

# 安装 APK
adb install -r android/app/build/outputs/apk/release/app-release.apk

# 启动应用
adb shell am start -n com.lunatv.app/.MainActivity
```

#### 方法 2: 侧载安装

1. 将 APK 复制到 USB 驱动器
2. 插入到 Android TV
3. 使用文件管理器导航到 APK
4. 安装应用

### 发布到 Google Play Store

#### TV 应用要求

1. **应用图标**
   - 192x192 (xhdpi)
   - 512x512 (xxxhdpi)

2. **横幅图标**
   - 320x180 (必需)
   - 文件: `res/drawable-xhdpi/banner.png`

3. **功能图形**
   - 1024x500
   - 展示应用功能

4. **TV 列表截图**
   - 至少 2 张
   - 尺寸: 1280x720

5. **TV 专用描述**
   - 强调遥控器操作
   - 突出 TV 体验

#### 发布清单

- [ ] 应用横幅 (320x180)
- [ ] 高清应用图标 (512x512)
- [ ] 功能图形 (1024x500)
- [ ] TV 截图 (至少 2 张)
- [ ] TV 专用描述
- [ ] Leanback 测试
- [ ] 10 英尺距离测试
- [ ] 性能测试
- [ ] 权限说明

## 测试清单

### 功能测试

- [ ] 应用在 TV 主屏幕显示
- [ ] 遥控器方向键导航正常
- [ ] 焦点指示清晰可见
- [ ] 确认键功能正常
- [ ] 返回键双击退出
- [ ] 视频播放流畅
- [ ] 全屏显示正常
- [ ] 后台播放正常
- [ ] 网络连接稳定

### UI/UX 测试

- [ ] 字体大小适合 10 英尺距离
- [ ] 按钮和焦点足够大
- [ ] 对比度良好
- [ ] 无触摸屏依赖
- [ ] 加载速度可接受
- [ ] 深色主题正确显示

### 兼容性测试

- [ ] Android 7.0+ (API 24+)
- [ ] Android TV OS
- [ ] Google TV
- [ ] Fire TV (Amazon)
- [ ] 小米电视
- [ ] 腾讯视频极光盒子
- [ ] 天猫魔盒

## 已知问题

### 1. 焦点导航问题

**问题**: 部分网页焦点导航不流畅  
**解决**: 使用 JavaScript 拦截方向键并手动管理焦点

### 2. 软键盘遮挡

**问题**: 输入时软键盘遮挡界面  
**解决**: TV 应用应避免需要键盘输入,使用虚拟键盘

### 3. 性能优化

**问题**: 大屏设备加载较慢  
**解决**: 使用懒加载和虚拟滚动优化

## 参考资源

- [Android TV 开发指南](https://developer.android.com/training/tv)
- [Android TV 设计规范](https://developer.android.com/design/tv)
- [Leanback Support Library](https://developer.android.com/topic/libraries/architecture/lifecycle/app#leanback)
- [Google Play TV 应用发布](https://developer.android.com/docs/google-play/tv)

## 总结

LunaTV Android TV 版本已完成以下适配:

✅ Android Manifest TV 配置  
✅ MainActivity TV 交互优化  
✅ Leanback 主题支持  
✅ 横屏和全屏显示  
✅ 遥控器操作优化  
✅ WebView 配置优化  
✅ 应用名称和描述  
✅ 后退键双击退出  
✅ 屏幕常亮功能  

---

**注意**: TV 应用需要严格的测试和验证,建议在多种 TV 设备上进行测试。
