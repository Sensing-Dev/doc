---
sidebar_position: 2
---

# GUIアプリ: プレビューと保存

Sensing-Devは、USB 3 Visionカメラユーザーが開発環境を設定する際にサポートするSDKとチュートリアルを提供しています。

さらに、カメラのプレビューと撮影した画像の保存機能を備えたシンプルなPythonアプリケーションも提供しています。

## GUI 

[こちら](https://github.com/Sensing-Dev/viewer/releases/tag/v0.1.0)からパッケージをダウンロードして解凍してください。

### 必要モジュールのインストール

#### Sensing-Dev SDK

このアプリケーションを使用するにはPython 3.10以降が必要です。

Windowsユーザの方は、[こちら](./../startup-guide/windows)の手順に従ってモジュールをインストールしてください。Linuxユーザの方は、[こちら](./../startup-guide/linux)の手順をご覧ください。

#### GUI 必要モジュール

このGUIアプリケーションには、Sensing-Dev SDKで紹介されているものに加えて、いくつかのPythonモジュールが必要です。

解凍したパッケージのルートディレクトリに移動し、以下のコマンドを実行してモジュールをインストールしてください。

```
python3 -m pip install -r requirements.txt
```

### 使い方

以下のコマンドを実行することでアプリケーションを立ち上げることができます。

```
python3 gui.py [options]
```

コマンドオプションは全てREADMEに書かれていますが、ここでは代表的なものを紹介します。

Command-Line Arguments

- `-d`, `--directory` (default: `./output`)
  - **Description**: 画像が保存されるディレクトリ
  - **Type**: `str`
  
- `-nd`, `--number-of-device` (default: `2`)
  - **Description**: カメラの数を指定するディレクトリ
  - **Type**: `int`
  
:::caution why it does not work 
* U3Vデバイスにframecount機能があり、デバイス間でframecountを同期させたい場合は、`-sync`オプションを使用してください

* U3Vデバイスで使われているGenICamのゲインや露光時間を設定するキーがそれぞれ`Gain`や`ExposureTime`でない場合は`--gain-key-name` と`--exposuretime-key-name`オプションで設定してください。

* カラープレビューウィンドウにモノクロ画像がで表示される場合、PixelFormatが誤って設定されている可能性があります。PixelFormatをBayerに変更してください。対応しているPixelFormatは以下の通りです。
  * Mono8
  * Mono12
  * mono16
  * BayerBG8
  * BayerBG10
  * BayerBG12
  * BayerRG8
  * BayerRG10
  * BayerRG12
:::


## コントロールパネル

### プレビュー

コマンドを実行してアプリを起動すると、コントロールパネルとプレビューウィンドウが開きます。

このアプリ上ではプレビューウィンドウを見ながらカメラのゲイン、露光時間、ホワイトバランスを調整可能です。また、各フォーマットでのデータ保存も可能です。

### 保存

保存の際はスタートボタン・ストップボタンを押す方法と、時間を指定してスタートボタンを押す方法の２種類があります。

jpgやpngなどは保存終了の後に変換に時間がかかることをご了承ください。

また、binで保存する場合、GenDC対応のU3Vデバイスを使っているときに、GenDC modeに設定することによって、画像以外の全てのコンテナデータを保存することができます。