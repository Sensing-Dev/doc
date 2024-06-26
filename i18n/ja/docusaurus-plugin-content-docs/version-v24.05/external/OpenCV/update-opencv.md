# OpenCVのアップデート

Sensing-Dev SDKはOpenCVライブラリを提供していますが、特定のバージョンのOpenCVを使用したい場合や、ご自身で事前にインストールしているものを使用したい場合があります。

しかし、Sensing-Devのインストーラースクリプトを使用せずにインストールしたOpenCVは、環境変数の未設定などが原因でアプリケーションやチュートリアルコードから見つけられない場合があります。

このドキュメントでは、OpenCVを更新し、環境変数を設定するためのヒントを提供します。

## 1 現在のSensing-Devをアンインストールする

既にOpenCVと共にSensing-Devをインストールしている場合、バージョンの競合を避けるために、まずSensing-Devをアンインストールし、OpenCVオプションを指定せずに再インストールすることをお勧めします。まだSensing-Devをインストールしていない場合は、手順1.2のみを実行してOpenCVなしでSensing-Devをインストールしてください。

### Windowsユーザー

1.1. ディレクトリ `C:\Users\<username>\AppData\Local\sensing-dev\` を削除します。

1.2. Reinstall Sensing-Dev following the instruction in the [Windowsセットアップガイド](../../startup-guide/windows). の指示に従ってSensing-Devを再インストールします。この際、`-version`オプションでSDKのバージョンを指定することと、`-InstallOpenCV`オプションを追加**しない**ことに注意してください。

1.3. システムプロパティから以下の環境変数を削除します。

| 環境変数名   | 値                                                                   |
|-----------------------------|---------------------------------------------------------------------------|
| `PATH`                      | `C:\Users\<username>\AppData\Local\sensing-dev\opencv\build\x64\vc15\bin` |

### Linuxユーザー

1.1 ディレクトリ `/opt/sensing-dev/` を削除します。

1.2. Install Sensing-Dev again with the instruction of [Linuxセットアップガイド](../../startup-guide/linux)の指示に従ってSensing-Devを再インストールします。この際、`--version`オプションでSDKのバージョンを指定することと、、`--install-opencv`オプションを追加**しない**ことに注意してください。

## 2 OpenCVを再インストールする

既にOpenCVを自分でインストールしている場合は、この項目をスキップできます。

### Windowsユーザー

2.1. [ OpenCV公式サイト](https://opencv.org/releases/)にアクセスし、希望するバージョンをダウンロードします。MSVC 17.10以降のユーザーは、OpenCV 4.10.0以上を使用する必要があります。

2.2. OpenCVを任意の場所にインストールしますが、チュートリアルコードがOpenCVを見つけやすくするために `C:\Users\<username>\AppData\Local\sensing-dev` にインストールすることをお勧めします。このガイドでは、インストールディレクトリを `%OpenCV_ROOT%` と表記します。

### Linuxユーザー

OpenCVの公式サイトの指示に従ってOpenCVをビルドします。複数のバージョンのOpenCVがマシンに存在する場合、競合や上書きを避けるために `CMAKE_INSTALL_PREFIX` を設定することをお勧めします。

## 3 環境変数とコンパイルオプションを設定する

### Windowsユーザー

3.1. OpenCVを使用するユーザーアプリケーションやチュートリアルのために、システムが動的リンクライブラリ（`opencv_world<version>.dll`）を見つける必要があります。そのため、以下の絶対パスを `PATH` 環境変数に追加します。システムに複数のOpenCVが存在する場合、`PATH` の優先順位と順序を正しく設定してください。

| 環境変数名   | 値                                              |例） OpenCV 4.10.0; C drive |
|-----------------------------|----------------------------------------------------|-------|
| `PATH`                      | `%OpenCV_ROOT%\build\x64\vc<compiler version>\bin` |`C:\opencv\build\x64\vc16\bin`|

3.2. さらに、アプリケーションやチュートリアルコードがOpenCVを必要とする場合、新しいOpenCVでプログラムをコンパイルしてビルドする必要があります。これはコンパイラやコンパイル方法によって異なりますが、ここではチュートリアルに合わせてcmakeコンパイルのヒントを示します。チュートリアルでは、以下のcmakeファイルで `-DOpenCV_DIR %OpenCV_ROOT%\build` オプションを使用してcmakeを使用します。

```cmake
# CMakeLists.txt

...

# if OpenCV is installed under sensing-dev directory, cmake file can find OpenCV 
if(NOT OpenCV_DIR)
    set(OpenCV_DIR $ENV{SENSING_DEV_ROOT}/opencv/build)
endif()

# otherwise, cmake will look for OpenCV under ${OpenCV_DIR}
find_package(OpenCV REQUIRED PATHS ${OpenCV_DIR})

# if you are using OpenCV headers, include directory by yourself
include_directories( ${OpenCV_INCLUDE_DIRS} )

# if you are using OpenCV static library, set it by yourself
target_link_libraries(${TUTORIAL_NAME} PRIVATE ${OpenCV_LIBS})

```

### Linuxユーザー

3.1. アプリケーションやチュートリアルコードがOpenCVを必要とする場合、新しいOpenCVでプログラムをコンパイルしてビルドする必要があります。これはコンパイラやコンパイル方法によって異なりますが、以下の環境変数の設定が求められる場合があります。

* PKG_CONFIG_PATH
* LD_LIBRARY_PATH

3.2. また、ライブラリやヘッダーのリンクオプションを設定することを忘れないでください。以下の例では、デフォルトのインストール場所 `/usr/local/` を使用しています。

```bash
# example with gcc
g++ -I /usr/local/include/opencv4 \
-L /usr/local/lib
...
```