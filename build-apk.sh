#!/bin/bash

set -e

echo "=========================================="
echo "LunaTV APK Build Script"
echo "=========================================="
echo ""

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo "Project directory: $PROJECT_DIR"
echo ""

# 创建输出目录
OUTPUT_DIR="$PROJECT_DIR/apk-output"
mkdir -p "$OUTPUT_DIR"

echo "Checking environment..."
echo "Java version:"
java -version 2>&1 | head -3
echo ""

echo "Gradle version:"
./android/gradlew --version
echo ""

echo "=========================================="
echo "Building APK..."
echo "=========================================="
echo ""

cd "$PROJECT_DIR/android"

# 构建 Debug APK
echo "Building Debug APK..."
./gradlew assembleDebug || {
    echo "Build failed!"
    exit 1
}

echo ""
echo "=========================================="
echo "Build completed successfully!"
echo "=========================================="
echo ""

# 查找生成的 APK
APK_PATH=$(find "$PROJECT_DIR/android/app/build/outputs/apk/debug" -name "*.apk" -type f | head -1)

if [ -z "$APK_PATH" ]; then
    echo "ERROR: APK file not found!"
    exit 1
fi

echo "APK location: $APK_PATH"
echo ""

# 复制到输出目录
APK_NAME="LunaTV-Debug-$(date +%Y%m%d-%H%M%S).apk"
cp "$APK_PATH" "$OUTPUT_DIR/$APK_NAME"

echo "APK copied to: $OUTPUT_DIR/$APK_NAME"
echo ""

# 显示 APK 信息
APK_SIZE=$(du -h "$OUTPUT_DIR/$APK_NAME" | cut -f1)
echo "APK size: $APK_SIZE"
echo ""

# 获取 APK 版本信息
if command -v aapt &> /dev/null; then
    echo "APK Information:"
    aapt dump badging "$OUTPUT_DIR/$APK_NAME" | grep -E "package:|versionCode:|versionName:" | head -3
    echo ""
fi

echo "=========================================="
echo "Build Summary"
echo "=========================================="
echo "Output directory: $OUTPUT_DIR"
echo "APK file: $APK_NAME"
echo "APK size: $APK_SIZE"
echo "Build time: $(date)"
echo ""
echo "To install the APK:"
echo "  adb install -r $OUTPUT_DIR/$APK_NAME"
echo ""
echo "Or copy the APK file to your device and install."
echo ""
