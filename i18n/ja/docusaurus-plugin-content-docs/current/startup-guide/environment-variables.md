---
sidebar_position: 4
---

# 環境変数の設定について

このドキュメントでは、Sensing-Dev SDKを使って開発するのに設定が必要な環境変数について説明します。

:::info
お使いのSensing-Dev SDKが[本ウェブサイトの案内](./windows)の通りinstaller.ps1を使ってインストールされている場合、この設定は**不要**です。

もし、インストール先のディレクトリを移行したり、installer.ps1を使わずにインストールしたOpenCVをご利用の場合、こちらのドキュメントを参照して環境変数を設定してください。
:::


## 変数一覧

Sensing-Dev SDKを使うために、以下のユーザ環境変数を設定する必要があります。
To use Sensing-Dev SDK, users need to set the following environment variables.

| 変数                  | 値                                                                     | 新規/編集(追加) | 役割           |
|-----------------------|-----------------------------------------------------------------------|------------|---------------------------|
| SENSING_DEV_ROOT      | `<SDKのインストール先>` 　　　                                          | 新規       |                           |
| PATH                  | `%SENSING_DEV_ROOT%\bin`                                              | 編集       | 動的ライブラリの読み込み    |
| PATH                  | `<where you installed opencv>\build\x64\vc<preferred VS version>\bin` | 編集       | 動的ライブラリの読み込み |
| GST_PLUGIN_PATH       | `%SENSING_DEV_ROOT%\lib\gstreamer-1.0`                                | 編集       | gst-pluginの読み込み       |


## 環境変数の設定方法

1. Windowsキー **&#8862;** を押すか、タスクバーの角にある **&#8862;** をクリックしてスタートメニューを開きます。

Hit Windows key  or click **&#8862;** at the corner of task bar to use start-menu.

2. **Environment variable** と入力して、**アカウントの環境変数を編集** を探し、**環境変数** ウィンドウを開きます。

![Start-menu](./img/start-menu.png)

3. ウィンドウの上部および下部にはユーザーとシステム用の環境変数があり、ユーザー変数を編集します。

![Start-menu](./img/environment-variables.png)

4. 上記の変数一覧の表を参照して、新規、または編集より変数とその値を打ち込みます。もし変数がすでに存在していた場合、「新規」の場合は上書き、「編集」の場合は値を追加してください。

:::info Confirmation
`arv-tool-0.8`を使用することで、ソフトウェアパッケージが適切にインストールされているか、または環境変数が正しく設定できているかを確認できます。手順については、[このページ](../external/aravis/arv-tools.md)を確認してください。
:::