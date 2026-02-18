# LunaTV 同时支持手机和 TV 的方案

## 当前状态

✅ **已完成设备检测功能**
- 自动识别 TV 设备
- TV 设备使用横屏和全屏
- 手机设备使用默认配置
- 代码已智能适配

## 推荐方案

### 方案 1: 单一 APK + 动态适配 (当前实现)

**优点**:
- ✅ 一个 APK 包含所有功能
- ✅ 用户无需下载多个版本
- ✅ 自动检测设备类型
- ✅ 维护成本低

**缺点**:
- ⚠️ Manifest 配置偏向 TV (固定横屏)
- ⚠️ 手机用户体验可能不是最优

**适用场景**:
- ✅ 主要面向 TV 用户
- ✅ 手机作为辅助设备使用

---

### 方案 2: 两个独立 APK (推荐)

#### 创建两个应用变体

**手机版 APK**:
```xml
<!-- mobile/AndroidManifest.xml -->
<activity
    android:name=".MainActivity"
    android:screenOrientation="unspecified"  <!-- 不固定方向 -->
    android:configChanges="orientation|..."
    android:resizeableActivity="true">     <!-- 允许调整 -->
    ...
</activity>
```

**TV 版 APK**:
```xml
<!-- tv/AndroidManifest.xml -->
<activity
    android:name=".MainActivity"
    android:screenOrientation="landscape"     <!-- 固定横屏 -->
    android:resizeableActivity="false">        <!-- 禁止调整 -->
    <intent-filter>
        <category android:name="android.intent.category.LEANBACK_LAUNCHER" />
        <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter>
    ...
</activity>
```

#### 构建配置

在 `android/app/build.gradle` 中添加:

```gradle
android {
    ...
    productFlavors {
        mobile {
            applicationIdSuffix ".mobile"
            versionNameSuffix "-mobile"
        }
        tv {
            applicationIdSuffix ".tv"
            versionNameSuffix "-tv"
        }
    }
}
```

#### 构建命令

```bash
# 构建手机版
./gradlew assembleMobileDebug
./gradlew assembleMobileRelease

# 构建 TV 版
./gradlew assembleTvDebug
./gradlew assembleTvRelease
```

**优点**:
- ✅ 每个版本最优配置
- ✅ 手机和 TV 完美适配
- ✅ 可针对不同设备优化 UI
- ✅ 发布时可以独立管理

**缺点**:
- ❌ 需要维护两个版本
- ❌ 需要两个 Google Play 列表
- ❌ 用户可能困惑选哪个

**适用场景**:
- ✅ 两者同等重要
- ✅ 需要独立优化
- ✅ 发布到 Google Play Store

---

### 方案 3: 使用构建类型 (变体方案)

#### 修改 Gradle 配置

```gradle
android {
    defaultConfig {
        applicationId "com.lunatv.app"
        versionCode 1
        versionName "1.0"
        
        // 默认配置
        targetSdkVersion 34
        minSdkVersion 24
    }
    
    buildTypes {
        debug {
            applicationIdSuffix ".debug"
        }
        release {
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
    
    // 产品风味 (变体)
    productFlavors {
        phone {
            applicationIdSuffix ".phone"
            versionNameSuffix "-phone"
            manifestPlaceholders = [deviceType: "phone"]
        }
        tv {
            applicationIdSuffix ".tv"
            versionNameSuffix "-tv"
            manifestPlaceholders = [deviceType: "tv"]
        }
    }
}
```

#### 使用占位符

在 `AndroidManifest.xml` 中:

```xml
<activity
    android:screenOrientation="${deviceType == 'tv' ? 'landscape' : 'unspecified'}"
    android:resizeableActivity="${deviceType == 'tv' ? 'false' : 'true'}"
    android:exported="true">
    
    <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        
        <!-- TV 版本添加 LEANBACK_LAUNCHER -->
        ${deviceType == 'tv' ? '<category android:name="android.intent.category.LEANBACK_LAUNCHER" />' : ''}
        
        <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter>
    
</activity>
```

#### 生成的包名

- **手机版**: `com.lunatv.app.phone`
- **TV 版**: `com.lunatv.app.tv`

---

### 方案 4: 使用构建脚本 (自动化)

#### 创建构建脚本

```bash
#!/bin/bash
# build-all.sh

echo "Building LunaTV for both Phone and TV..."

# 构建 Phone 版本
echo "Building Phone version..."
./gradlew assemblePhoneDebug
./gradlew assemblePhoneRelease

# 构建 TV 版本
echo "Building TV version..."
./gradlew assembleTvDebug
./gradlew assembleTvRelease

echo "Build complete!"
echo ""
echo "Phone APK:"
echo "  Debug: android/app/build/outputs/apk/phone/debug/app-phone-debug.apk"
echo "  Release: android/app/build/outputs/apk/phone/release/app-phone-release.apk"
echo ""
echo "TV APK:"
echo "  Debug: android/app/build/outputs/apk/tv/debug/app-tv-debug.apk"
echo "  Release: android/app/build/outputs/apk/tv/release/app-tv-release.apk"
```

使用:
```bash
chmod +x build-all.sh
./build-all.sh
```

---

## 推荐方案总结

| 方案 | 优点 | 缺点 | 推荐指数 |
|------|------|------|----------|
| 单一 APK + 动态检测 | 维护简单 | 体验妥协 | ⭐⭐⭐ |
| 两个独立 APK | 体验最优 | 维护复杂 | ⭐⭐⭐⭐⭐ |
| 构建变体 | 灵活配置 | 需要 Gradle 知识 | ⭐⭐⭐⭐ |
| 构建脚本 | 自动化 | 需要手动管理 | ⭐⭐⭐⭐ |

---

## 选择建议

### 如果您是:

**个人开发者/小团队**
- → 使用 **方案 1 (单一 APK)**
- 维护简单,快速迭代

**专业团队/重视体验**
- → 使用 **方案 2 (两个 APK)**
- 最佳用户体验

**需要快速构建多个版本**
- → 使用 **方案 4 (构建脚本)**
- 自动化流程

---

## 实施步骤 (方案 2 - 推荐)

### 步骤 1: 创建两个 Android 项目目录

```bash
cd LunaTV
mkdir -p android-phone android-tv
```

### 步骤 2: 复制基础项目

```bash
cp -r android/* android-phone/
cp -r android/* android-tv/
```

### 步骤 3: 配置手机版

```bash
cd android-phone/app/src/main

# 修改 AndroidManifest.xml
# 设置 screenOrientation="unspecified"
# 设置 resizeableActivity="true"
# 移除 LEANBACK_LAUNCHER 类别
```

### 步骤 4: 配置 TV 版

```bash
cd android-tv/app/src/main

# 修改 AndroidManifest.xml
# 保持当前配置 (横屏、全屏等)
# 确保 LEANBACK_LAUNCHER 类别
```

### 步骤 5: 修改应用名称

```bash
# 手机版
cd android-phone/app/src/main/res/values/strings.xml
# 修改 app_name 为 "LunaTV"

# TV 版
cd android-tv/app/src/main/res/values/strings.xml
# 修改 app_name 为 "LunaTV TV"
```

### 步骤 6: 构建两个 APK

```bash
# 构建手机版
cd android-phone
./gradlew assembleDebug

# 构建 TV 版
cd ../android-tv
./gradlew assembleDebug
```

### 步骤 7: 分别发布

- **手机版**: 发布到 Google Play (手机应用)
- **TV 版**: 发布到 Google Play TV (电视应用)

---

## 快速命令参考

### 查看当前配置支持情况

```bash
# 检查当前 MainActivity 的设备检测
cat android/app/src/main/java/com/lunatv/app/MainActivity.java | grep -A 5 "isAndroidTvDevice"
```

### 测试设备检测

```bash
# 安装到 TV 设备
adb install android/app/build/outputs/apk/debug/app-debug.apk

# 查看 Logcat 输出
adb logcat | grep "LunaTV"
```

### 验证功能

在设备上测试:
- [ ] 手机竖屏正常
- [ ] 手机旋转正常
- [ ] TV 横屏固定
- [ ] TV 遥控器导航
- [ ] TV 全屏显示

---

## 总结

**当前实现**: 已完成设备自动检测,单一 APK 同时支持手机和 TV。

**推荐方案**: 如果需要最佳用户体验,建议创建两个独立的 APK 变体。

**下一步**: 根据您的需求选择合适的方案进行实施。
