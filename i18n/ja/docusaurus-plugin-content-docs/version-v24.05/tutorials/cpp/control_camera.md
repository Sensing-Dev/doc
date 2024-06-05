---
sidebar_position: 5
---

# BBでカメラを制御する

このチュートリアルでは、ビルディングブロック内でGainとExposureTimeを制御する方法について学びます。

BBなしでGainとExposureTimeを制御するには、[デバイス情報へのアクセスと設定](./set-device-info)または[arv-tool-0.8](../../external/aravis/arv-tools)を参照してください。

## 前提条件

* OpenCV（sensing-dev SDKと一緒に`-InstallOpenCV`オプションでインストール）
* ion-kit（sensing-dev SDKと一緒にインストール）

## チュートリアル

### デバイス情報の取得

ionpyを使用して画像を表示するには、デバイスの次の情報を取得する必要があります。

* 幅
* 高さ
* PixelFormat

[前のチュートリアル](obtain-device-info.md)または[arv-tool-0.8](../../external/aravis/arv-tools.md)がこれらの値を取得するのに役立ちます。

### パイプラインの構築

BBの構造は[1台のカメラ画像を表示するチュートリアル](display-image)と同じですが、`Gain`および`ExposureTime`の設定を有効にするためには、いくつか小さな変更が必要です。

このチュートリアルでは、`enable_control`を`true`に設定することで、`Gain`と`ExposureTime`を手動で設定できます。

入力ポートは動的で、つまり、各実行で更新できますが、これらの値のキーは静的であるため、Paramを使用して静的な値を文字列で設定できます。たとえば、`Gain`および`ExposureTime`の値は、各実行で更新するためにポートによって設定され、これらの値のキーは静的であるため、次のようにParamで設定する必要があります。

```c++
// パラメータの設定
Param enable_control("enable_control", true),
Param gain_key("gain_key", "Gain"),
Param exposure_key("exposure_key", "ExposureTime")

// ポートの値の設定
double gain0 = 35.0;
double exposuretime0 = 50.0;
double gain1 = 47.0;
double exposuretime1 = 100.0;

gain_values = []
exposure_values = []

Node n = b.add(bb_name)(&gain0, &exposuretime0)
    .set_param(
        Param("num_devices", num_device),
        Param("frame_sync", true),
        Param("realtime_diaplay_mode", false),
        Param("enable_control", true),
        Param("gain_key", "Gain"),
        Param("exposure_key", "ExposureTime")
    );
```

これで、`Gain`と`ExposureTime`が正常に設定されました！

:::note
v23.11.01ではGainおよびExposureTimeのポートを取るためにBBが必要でしたが、このバージョンではGainおよびExposureTimeの値のアドレスを単に入力できます。

また、BBがこれらの値を入力として受け取るためには、BBのParam入力にenable_controlを追加する必要があります。
:::

::::caution
`Gain` および `ExposureTime` はデバイスのゲインと露光時間を制御するためのGenICamのフィーチャキーです。通常、これらはemvaによる**SFNC（Standard Features Naming Convention）**で設定されていますが、一部のデバイスには異なるキーがあるかもしれません。

その場合、パラメータのキーを変更する必要があります。[このページ](../../external/aravis/arv-tools#利用可能なGenICam機能の一覧表示)を参照して、利用可能なフィーチャをリストアップする方法を確認してください。

```c++
Param("gain_key", <デバイスのゲインを制御するフィーチャの名前>)
Param("exposure_key", <露光時間を制御するフィーチャの名前>)
```
::::

### パイプラインの実行

パイプラインは実行する準備ができています。`run()`を呼び出すたびに、ベクトル内のバッファまたは`output`が出力画像を受け取ります。

```c++
b.run();
```

### OpenCVで表示

[前のチュートリアル](display-image)では、各実行で単に出力画像を表示していました。今回は、`Gain`または`ExposureTime`の値を更新します。次の例は、`Gain`を毎回`1.0`増やす方法を示しています。

```c++
while(user_input == -1)
{
    // 動的にGainを更新
    gain0 += 1.0;
    // Builderを使用したパイプラインのJITコンパイルと実行
    b.run(); 
}
```

## 完全なコード

import {tutorial_version} from "@site/static/version_const/v240505.js"
import GenerateTutorialLink from '@site/static/tutorial_link.js';

<GenerateTutorialLink language="cpp" tag={tutorial_version} tutorialfile="tutorial2_control_camera" />

:::caution 動かない時は
* もしお使いのOpenCVがSensing-Devインストール時に`-InstallOpenCV`オプションをつけてインストールしたものでない場合、プログラムに正しくリンクされているかを確認してください。
:::