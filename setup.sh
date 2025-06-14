#!/bin/bash

echo "🔧 Setting up requirements for C++ YouTube Downloader..."

# Update package list
sudo apt update

# 1. Install yt-dlp
if ! command -v yt-dlp &> /dev/null; then
    echo "📥 Installing yt-dlp..."
    sudo apt install -y wget python3-pip
    pip3 install -U yt-dlp
else
    echo "✅ yt-dlp is already installed."
fi

# 2. Install Qt development tools (Qt5 and Qt Creator)
echo "📦 Installing Qt (Qt5, qmake, Qt Creator)..."
sudo apt install -y qtbase5-dev qt5-qmake qtcreator build-essential

# 3. Optional: Confirm installations
echo "✅ Verifying installations..."
yt-dlp --version
qmake --version
g++ --version

echo "🎉 Setup complete. You can now open the Qt project and build the C++ GUI YouTube downloader."
