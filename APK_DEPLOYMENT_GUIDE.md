# LunaTV Android APK 打包与后端联通指南

## 一、APK 打包方法

### 重要说明

**LunaTV 是一个服务端渲染 (SSR) 应用**,包含大量 API 路由,无法直接打包为纯静态 APK。

### 推荐方案: 使用 WebView 加载远程服务

这是最简单且最推荐的方案,Android APK 作为一个 WebView 容器,加载已部署的 LunaTV 后端服务。

#### 步骤 1: 修改 Capacitor 配置加载远程 URL

编辑 `capacitor.config.ts` 文件,配置后端服务地址:

```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lunatv.app',
  appName: 'LunaTV',
  webDir: 'public',
  // 加载远程 LunaTV 后端服务
  server: {
    url: 'https://lunatv.smone.us', // 替换为您的 LunaTV 后端地址
    androidScheme: 'https',
    cleartext: true,
    allowNavigation: ['*']
  },
  android: {
    webContentsDebuggingEnabled: true,
    captureInput: true,
    appendUserAgent: 'LunaTV-Android/1.0'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#000000',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true
    }
  }
};

export default config;
```

**重要配置说明**:
- `server.url`: 您的 LunaTV 后端服务地址
- `cleartext: true`: 允许 HTTP 连接
- `allowNavigation: ['*']`: 允许所有导航

#### 步骤 2: 使用 Android Studio 构建 APK

1. 打开 Android Studio
2. 打开 `LunaTV/android` 目录
3. 等待 Gradle 同步完成
4. 点击 `Build > Build Bundle(s) / APK(s) > Build APK(s)`
5. APK 文件位置: `android/app/build/outputs/apk/debug/app-debug.apk`

#### 步骤 3: 安装和测试

```bash
# 使用 ADB 安装
adb install android/app/build/outputs/apk/debug/app-debug.apk

# 或者直接复制到手机安装
```

---

## 二、Android 客户端如何联通后端

### 架构说明

使用 WebView 方案的优势:

1. **无需修改后端代码**: 后端保持原有 SSR 架构
2. **完整功能**: 所有 Next.js 功能完全可用
3. **简单部署**: 只需部署后端服务,配置 APK 指向后端地址
4. **自动更新**: 更新后端服务即可,无需重新下载 APK

### 工作流程

```
Android APK (WebView 容器)
    ↓ 加载 URL
LunaTV 后端服务 (Next.js SSR)
    ↓ 提供服务
前端页面 + API 路由
    ↓
用户交互和API调用
```

### 后端部署要求

您的 LunaTV 后端需要部署到可访问的服务器上,推荐平台:

#### 1. Vercel (推荐,免费)

```bash
# 安装 Vercel CLI
pnpm i -g vercel

# 部署
cd LunaTV
vercel
```

部署后会获得一个 URL,例如: `https://lunatv-xxx.vercel.app`

#### 2. Docker 部署

```bash
# 构建镜像
docker build -t lunatv .

# 运行容器
docker run -p 3000:3000 lunatv
```

#### 3. 云服务器部署

```bash
# 克隆代码
git clone https://github.com/MagicRs513/lunasj.git
cd lunasj

# 安装依赖
pnpm install

# 构建生产版本
pnpm run build

# 启动服务
pnpm start
```

### 配置 APK 指向后端

#### 方法 1: 修改源码重新打包

修改 `capacitor.config.ts` 中的 `server.url`,然后重新构建 APK:

```typescript
server: {
  url: 'https://your-lunatv-backend.com', // 您的后端地址
  androidScheme: 'https',
  cleartext: true,
  allowNavigation: ['*']
}
```

#### 方法 2: 运行时配置 (推荐)

添加设置页面,允许用户输入后端地址:

在 `MainActivity.java` 中添加:

```java
import android.content.SharedPreferences;
import android.webkit.WebView;

public class MainActivity extends BridgeActivity {
    private static final String PREFS_NAME = "LunaTVPrefs";
    private static final String SERVER_URL_KEY = "server_url";
    private static final String DEFAULT_URL = "https://lunatv.smone.us";
    
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // 获取保存的服务器地址
        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        String serverUrl = prefs.getString(SERVER_URL_KEY, DEFAULT_URL);
        
        // 加载自定义的服务器地址
        if (getBridge() != null && getBridge().getWebView() != null) {
            WebView webView = getBridge().getWebView();
            webView.loadUrl(serverUrl);
        }
    }
    
    // 添加设置服务器地址的方法
    public static void setServerUrl(Context context, String url) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        prefs.edit().putString(SERVER_URL_KEY, url).apply();
    }
}
```

#### 方法 3: 环境变量配置

使用 Capacitor Environment 插件:

```bash
# 安装插件
pnpm add @capacitor/environment

# 配置
npx cap env save SERVER_URL https://your-lunatv-backend.com
```

---

## 三、完整部署流程示例

### 步骤 1: 部署 LunaTV 后端到 Vercel

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel
```

获取部署 URL,例如: `https://lunatv-v1.vercel.app`

### 步骤 2: 修改 Capacitor 配置

编辑 `capacitor.config.ts`:

```typescript
server: {
  url: 'https://lunatv-v1.vercel.app', // 使用 Vercel 部署的 URL
  androidScheme: 'https',
  cleartext: true,
  allowNavigation: ['*']
}
```

### 步骤 3: 同步到 Android

```bash
cd LunaTV
npx cap sync android
```

### 步骤 4: 构建 APK

使用 Android Studio 打开 `LunaTV/android` 目录并构建 APK。

### 步骤 5: 安装测试

```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### 步骤 6: 验证功能

1. 打开 LunaTV APK
2. 检查是否正确加载后端页面
3. 测试搜索、播放等核心功能
4. 验证 API 调用是否正常

---

## 四、常见问题

### Q1: APK 打包后无法连接后端?

**A**: 检查以下几点:
1. `capacitor.config.ts` 中的 `server.url` 是否正确
2. 后端服务是否正常运行且可访问
3. 网络权限是否已配置 (AndroidManifest.xml 中的 INTERNET 权限)
4. 是否使用 HTTPS (Android 9+ 默认不允许 HTTP)

### Q2: 后端服务部署到哪里?

**A**: 推荐平台:
- **Vercel**: 免费,自动 HTTPS,推荐
- **Zeabur**: 支持国内,速度快
- **Railway**: 支持后端服务
- **云服务器**: 阿里云、腾讯云等

### Q3: APK 大小如何优化?

**A**: 优化方法:
1. 启用 ProGuard 混淆
2. 使用 APK Split 按屏幕密度分包
3. 移除未使用的资源
4. 使用 R8 编译器替代 ProGuard

### Q4: 如何实现推送通知?

**A**: 需要集成:
- Firebase Cloud Messaging (FCM)
- OneSignal
- Capacitor Push Notifications 插件

### Q5: 如何离线使用?

**A**: 实现方案:
- 使用 Service Worker 缓存静态资源
- 使用 Capacitor LocalStorage
- 使用 IndexedDB 存储数据

---

## 五、快速开始命令汇总

```bash
# 1. 部署后端到 Vercel
cd LunaTV
npm i -g vercel
vercel

# 2. 修改 capacitor.config.ts 配置后端 URL
# 编辑 capacitor.config.ts,设置 server.url

# 3. 同步到 Android
npx cap sync android

# 4. 使用 Android Studio 构建 APK
# 打开 LunaTV/android 目录
# Build > Build APK(s)

# 5. 安装测试
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 六、参考资源

- [Capacitor 官方文档](https://capacitorjs.com/docs/android)
- [Next.js 部署文档](https://nextjs.org/docs/deployment)
- [Vercel 部署指南](https://vercel.com/docs/deployments/overview)
- [Android 开发者文档](https://developer.android.com/docs)

---

**注意**: 本方案适用于 LunaTV 项目,其他 SSR 项目可能需要不同的处理方式。
