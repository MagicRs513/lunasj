# LunaTV Android APK 构建指南

本项目已成功适配 Android 平台，使用 Capacitor 框架将 Next.js Web 应用打包为原生 Android APK。

## 项目信息

- **应用名称**: LunaTV
- **包名**: com.lunatv.app
- **版本**: 1.0 (versionCode: 1)
- **最低 SDK 版本**: 24 (Android 7.0+)
- **目标 SDK 版本**: 34

## 已完成的配置

### 1. Capacitor 配置
- 配置文件: `capacitor.config.ts`
- Web 目录: `public` (包含 index.html 入口)
- 应用服务器配置:
  - HTTPS Scheme
  - 允许明文流量
  - 允许所有导航
- 启动屏幕: 2秒显示, 黑色背景
- Android 特定配置:
  - 启用调试模式
  - 捕获输入
  - 自定义 User Agent

### 2. Android 权限
已添加以下权限:
- INTERNET (网络访问)
- ACCESS_NETWORK_STATE (网络状态)
- ACCESS_WIFI_STATE (WiFi 状态)
- WAKE_LOCK (保持唤醒)
- WRITE_EXTERNAL_STORAGE (写入外部存储)
- READ_EXTERNAL_STORAGE (读取外部存储)
- READ_MEDIA_VIDEO (读取媒体视频)
- READ_MEDIA_IMAGES (读取媒体图片)
- READ_MEDIA_AUDIO (读取媒体音频)

### 3. 网络安全配置
- 允许明文流量 (用于 HTTP 视频源)
- 信任系统证书
- 信任用户证书
- 本地开发支持 (localhost, 10.0.2.2)

### 4. WebView 配置
- 启用 DOM 存储
- 启用数据库
- 禁用用户手势要求 (自动播放视频)
- 启用 JavaScript
- 允许文件访问
- 启用硬件加速
- 增大堆内存
- MultiDex 支持

### 5. 屏幕常亮
自动保持屏幕常醒,提升观影体验

## 构建步骤

### 环境要求

1. **安装 JDK 11+**
   ```bash
   java -version
   ```

2. **安装 Android SDK**
   - 推荐使用 Android Studio
   - 下载 SDK Platform Tools
   - 安装 Android SDK Build-Tools

3. **配置环境变量**
   ```bash
   export ANDROID_HOME=/path/to/android/sdk
   export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
   ```

4. **安装 Gradle**
   ```bash
   # 使用项目自带的 Gradle Wrapper
   cd android
   ./gradlew --version
   ```

### 构建命令

#### 开发构建 (Debug 版本)
```bash
cd LunaTV
./android/gradlew assembleDebug
```

生成的 APK 位置:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

#### 生产构建 (Release 版本)
```bash
cd LunaTV
./android/gradlew assembleRelease
```

生成的 APK 位置:
```
android/app/build/outputs/apk/release/app-release-unsigned.apk
```

### 签名 APK (Release 版本)

#### 1. 生成密钥库
```bash
keytool -genkey -v -keystore lunatv.keystore -alias lunatv-key -keyalg RSA -keysize 2048 -validity 10000
```

#### 2. 配置签名信息

在 `android/app/build.gradle` 中添加:

```gradle
android {
    signingConfigs {
        release {
            storeFile file("../../lunatv.keystore")
            storePassword "your-store-password"
            keyAlias "lunatv-key"
            keyPassword "your-key-password"
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

#### 3. 重新构建 Release 版本
```bash
cd LunaTV
./android/gradlew assembleRelease
```

生成的已签名 APK:
```
android/app/build/outputs/apk/release/app-release.apk
```

### 使用 Android Studio 构建 (推荐)

1. 打开 Android Studio
2. 选择 `Open an Existing Project`
3. 选择 `LunaTV/android` 目录
4. 等待 Gradle 同步完成
5. 点击菜单: Build > Build Bundle(s) / APK(s) > Build APK(s)

## 同步代码更新

当 Next.js 代码更新后,需要重新构建并同步:

```bash
# 1. 重新构建 Next.js 项目
cd LunaTV
pnpm run build

# 2. 同步到 Android 项目
npx cap sync android

# 3. 构建 APK
./android/gradlew assembleDebug
```

## 在设备上安装

### 使用 ADB 安装
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### 直接传输 APK
将 APK 文件传输到 Android 设备,直接点击安装。

## 常见问题

### 1. Gradle 同步失败
- 检查网络连接 (可能需要代理)
- 尝试使用镜像源: 在 `android/build.gradle` 中添加阿里云镜像

### 2. 构建失败: SDK 版本问题
- 确保安装了对应的 SDK Platform 和 Build Tools
- 在 Android Studio SDK Manager 中安装所需版本

### 3. APK 安装失败
- 确保启用了"未知来源"安装
- 检查 Android 版本是否满足最低要求 (Android 7.0+)

### 4. 视频无法播放
- 检查网络权限
- 确认网络安全配置允许域名访问
- 查看应用日志: `adb logcat | grep "com.lunatv.app"`

### 5. 应用崩溃
- 查看崩溃日志: `adb logcat`
- 检查 AndroidManifest.xml 权限配置
- 确认 WebView 设置正确

## 优化建议

### APK 大小优化
- 启用代码混淆 (已在 Release 构建中启用)
- 压缩资源文件
- 使用 APK Split 分屏多密度版本

### 性能优化
- 启用 ProGuard 混淆
- 使用 R8 编译器
- 优化资源加载

## 技术栈

- **前端框架**: Next.js 16.1.0 (React 19)
- **跨平台框架**: Capacitor 8.1.0
- **构建工具**: Gradle
- **目标平台**: Android 7.0+ (API 24+)

## 下一步

- 配置应用图标和启动画面
- 添加应用权限请求逻辑
- 实现推送通知
- 集成其他原生功能 (如文件下载、分享等)
- 发布到 Google Play Store

## 相关文档

- [Capacitor Android 文档](https://capacitorjs.com/docs/android)
- [Next.js 部署文档](https://nextjs.org/docs/deployment)
- [Android 开发者文档](https://developer.android.com/docs)

## 联系方式

如有问题,请提交 Issue 或 Pull Request。

---

**注意**: 本项目仅用于个人学习和研究,请遵守相关法律法规。
