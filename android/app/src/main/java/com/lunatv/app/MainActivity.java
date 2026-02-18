package com.lunatv.app;

import android.content.pm.PackageManager;
import android.content.res.Configuration;
import android.os.Bundle;
import android.util.DisplayMetrics;
import android.view.KeyEvent;
import android.view.View;
import android.view.WindowManager;
import com.getcapacitor.BridgeActivity;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;

public class MainActivity extends BridgeActivity {
    private boolean isBackPressed = false;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        // 检测设备类型
        boolean isTvDevice = isAndroidTvDevice();

        if (isTvDevice) {
            // TV 设备配置
            getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN,
                    WindowManager.LayoutParams.FLAG_FULLSCREEN);
        }

        if (getBridge() != null && getBridge().getWebView() != null) {
            WebView webView = getBridge().getWebView();

            webView.setWebChromeClient(new WebChromeClient() {
                @Override
                public void onReceivedTitle(WebView view, String title) {
                    super.onReceivedTitle(view, title);
                }

                @Override
                public void onGeolocationPermissionsShowPrompt(String origin,
                        android.webkit.GeolocationPermissions.Callback callback) {
                    callback.invoke(origin, true, false);
                }
            });

            WebSettings settings = webView.getSettings();
            settings.setDomStorageEnabled(true);
            settings.setDatabaseEnabled(true);
            settings.setMediaPlaybackRequiresUserGesture(false);
            settings.setJavaScriptEnabled(true);
            settings.setAllowFileAccess(true);
            settings.setAllowContentAccess(true);
            settings.setGeolocationEnabled(true);
            settings.setDatabaseEnabled(true);

            // TV 设备特定配置
            if (isTvDevice) {
                settings.setSupportZoom(false);
                settings.setBuiltInZoomControls(false);
                settings.setDisplayZoomControls(false);
                settings.setUseWideViewPort(true);
                settings.setLoadWithOverviewMode(true);
            }
        }
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        // 检测是否是 TV 设备
        boolean isTvDevice = isAndroidTvDevice();

        if (isTvDevice && keyCode == KeyEvent.KEYCODE_BACK) {
            if (event.getAction() == KeyEvent.ACTION_DOWN) {
                if (isBackPressed) {
                    finish();
                    return true;
                }
                isBackPressed = true;
                new android.os.Handler().postDelayed(new Runnable() {
                    @Override
                    public void run() {
                        isBackPressed = false;
                    }
                }, 2000);
                return true;
            }
        }
        return super.onKeyDown(keyCode, event);
    }

    @Override
    protected void onResume() {
        super.onResume();

        boolean isTvDevice = isAndroidTvDevice();

        if (isTvDevice) {
            getWindow().getDecorView().setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_FULLSCREEN |
                    View.SYSTEM_UI_FLAG_HIDE_NAVIGATION |
                    View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY |
                    View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN |
                    View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION |
                    View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            );
        }
    }

    /**
     * 检测当前设备是否为 Android TV
     */
    private boolean isAndroidTvDevice() {
        PackageManager pm = getPackageManager();

        // 方法 1: 检查 FEATURE_LEANBACK
        boolean hasLeanback = pm.hasSystemFeature(PackageManager.FEATURE_LEANBACK);

        // 方法 2: 检查是否缺少触摸屏
        boolean lacksTouch = !pm.hasSystemFeature(PackageManager.FEATURE_TOUCHSCREEN);

        // 方法 3: 检查 FEATURE_TELEVISION
        boolean hasTelevision = false;
        try {
            hasTelevision = pm.hasSystemFeature("android.software.leanback");
        } catch (Exception e) {
            // 某些设备可能不支持此特性
        }

        // 方法 4: 检查 FEATURE_USB_HOST (TV 通常没有 USB 主机)
        boolean noUsbHost = !pm.hasSystemFeature(PackageManager.FEATURE_USB_HOST);

        // 满足任一条件即认为是 TV 设备
        return hasLeanback || (lacksTouch && noUsbHost) || hasTelevision;
    }
}
