# Gstreamerが有効なopencv-python

GStreamer API を使用すると、センサー画像の取得、処理、表示のためのパイプラインを構築することができますが、GStreamer プラグインである `appsink` を `cv2.VideoCapture`（OpenCV-Python API）と組み合わせることで、GStreamer API を直接使用せずに同様のタスクを実行することができます。詳細は[チュートリアル](../../tutorials/gstreamer/display-image.mdx)をご参照ください。

`appsink` プラグインは、Windows では `-InstallGstPlugins` オプション、Linux では `--install-gst-plugins` オプションを指定して Sensing-Dev SDK インストーラーを使用することで入手可能です。

`cv2.VideoCapture` 関数は、GStreamer サポート付きの OpenCV-Python をインストールすることで利用可能になりますが、通常の OpenCV-Python インストールとは異なり、追加の手順が必要です。

本書では、Windows および Linux の両方で GStreamer 機能を有効にした OpenCV-Python を構築およびインストールする方法について説明します。

## opencv-pythonでGstreamerが有効かを調べる方法

Python で以下のコードスニペットを試してください。

```python
import cv2
print(cv2.getBuildInformation())
```

ビルド情報で GStreamer が `YES` と表示されている場合、使用している opencv-python モジュールは GStreamer を使用してビルドされており、`cv2.VideoCapture` API を利用することができます。

```bash
General configuration for OpenCV 4.10.0 =====================================
  ...

  Video I/O:
    ...
    GStreamer:                   YES (1.22.5)

```

:::caution 動作しない理由
Python コードが「cv2が見つからない」というエラーを返す場合、次の原因が考えられます：
1. opencv-python がインストールされていない。次のセクションの手順に従い、opencv-python をビルドおよびインストールしてください。
2. GStreamer 対応の opencv-python がインストールされているが、GStreamer ライブラリのパスが設定されていない。
Sensing-Dev SDK がインストールされていることを確認し、以下のように cv2 モジュールをロードする前にパスを追加してください：
```python
import os
os.add_dll_directory(os.path.join(os.environ["SENSING_DEV_ROOT"], "bin"))

import cv2
print(cv2.getBuildInformation())
```
:::

## Windows ユーザの方

import '/src/css/home.css';
import this_version from "@site/static/version_const/latest.js"

### Pre-req to build (not runtime):

* Windows SDK (Visual Studio Installer または or https://developer.microsoft.com/en-us/windows/downloads/sdk-archive/)
* Windows C++ ビルドツール(Visual Studio Installer または https://visualstudio.microsoft.com/visual-cpp-build-tools/)
* CMake (Visual Studio Installer または winget)

### ビルド・インストール

以下のコマンドを実行して、GStreamer 対応の opencv-python をインストールしてください。

<pre>
<code class="language-powershell">
Invoke-WebRequest -Uri {this_version.windows_opencvpython_url}  -OutFile opencv_python_installer.ps1 -Verbose; powershell.exe -ExecutionPolicy Bypass -File .\opencv_python_installer.ps1
</code>
</pre>

既に pip でインストールした opencv-python モジュールがある場合、Gstreamerが有効になったもので上書きされます。

## Linux ユーザの方

### 依存ライブラリの入手

依存ライブラリをインストールします。

``` bash
sudo apt-get update
sudo apt-get install libunwind-dev libgstreamer1.0-dev libgstreamer-plugins-base1.0-dev libgstreamer-plugins-bad1.0-dev \
gstreamer1.0-plugins-base gstreamer1.0-plugins-good gstreamer1.0-plugins-bad gstreamer1.0-plugins-ugly gstreamer1.0-libav \
gstreamer1.0-tools gstreamer1.0-x gstreamer1.0-alsa gstreamer1.0-gl gstreamer1.0-gtk3 \
gstreamer1.0-qt5 gstreamer1.0-pulseaudio -y
```

### ビルド・インストール

以下のコマンドを実行して、GStreamer 対応の opencv-python をインストールしてください。

```bash
pip3 install numpy
pip3 install --no-binary opencv-python opencv-python==4.10.0.84 --verbose
```