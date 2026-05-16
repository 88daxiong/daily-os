#!/bin/bash
set -e

echo "🔧 Daily OS 打包工具"
echo "===================="

cd "$(dirname "$0")"

# 1. 备份现有数据
DATA_DIR="$HOME/Library/Application Support/DailyOS"
if [ -f "$DATA_DIR/data.json" ]; then
  cp "$DATA_DIR/data.json" "$DATA_DIR/data.json.backup"
  echo "✅ 已备份现有数据到 data.json.backup"
else
  echo "ℹ️  未发现现有数据文件"
fi

# 2. 安装依赖
echo "📦 安装依赖..."
npm install

# 3. 打包
echo "🏗️  开始打包 Mac 应用..."
npx electron-builder --mac dmg

echo ""
echo "===================="
echo "✅ 打包完成！"
echo ""

# 4. 找到产物
DMG=$(find dist -name "*.dmg" 2>/dev/null | head -1)
APP=$(find dist -name "*.app" -maxdepth 3 2>/dev/null | head -1)

if [ -n "$DMG" ]; then
  echo "📀 DMG 安装包: $DMG"
  echo "   双击 DMG 然后拖入 Applications 即可"
  open "$DMG"
elif [ -n "$APP" ]; then
  echo "📱 应用位置: $APP"
  open -R "$APP"
fi

echo ""
echo "📂 你的数据保存在: $DATA_DIR/data.json"
echo "   打包不会影响已有数据，放心使用！"
