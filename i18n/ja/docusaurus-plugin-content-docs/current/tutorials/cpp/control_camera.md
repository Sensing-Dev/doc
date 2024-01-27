---
sidebar_position: 5
---

# BB内でカメラを制御する

このチュートリアルでは、ビルディングブロック内でGainとExposureTimeを制御する方法について学びます。

BBなしでGainとExposureTimeを制御するには、[アクセスとデバイス情報の設定](./set-device-info)または[arv-tool-0.8](../../external/aravis/arv-tools)を参照してください。

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

BBの構造は[1台のカメラ画像を表示するチュートリアル](display-image)と同じですが、`Gain`および`ExposureTime`の設定を有効にするためには、いくつかの小さな変更が必要です。

このチュートリアルでは、`enable_control`を`true`に設定することで、`Gain`と`ExposureTime`を手動で設定できます。

入力ポートは動的で、つまり、各ランで更新できますが、これらの値のキーは静的であるため、Paramを使用して静的な値を文字列で設定できます。たとえば、`Gain`および`ExposureTime`の値は、各ランで更新するためにポートによって設定され、これらの値のキーは静的であるため、次のようにParamで設定する必要があります。

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

### パイプラインの実行

パイプラインは実行する準備ができています。`run()`を呼び出すたびに、ベクトル内のバッファまたは`output`が出力画像を受け取ります。

```c++
b.run();
```

### OpenCVで表示

[前のチュートリアル](display-image)では、各ランで単に出力画像を表示していました。今回は、`Gain`または`ExposureTime`の値を更新できます。次の例は、`Gain`を毎回`1.0`増やす方法を示しています。

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

チュートリアルで使用される完全なコードは[こちら](https://github.com/Sensing-Dev/tutorials/blob/main/cpp/src/tutorial2_control_camera.cpp)です。

プログラムのコンパイルおよびビルドには、[こちら](https://github.com/Sensing-Dev/tutorials/blob/main/cpp/CMAKELists.txt)で提供されているCMakeLists.txtを使用できます。

:::caution 動かない時は
* もしお使いのOpenCVがSensing-Devインストール時に`-InstallOpenCV`オプションをつけてインストールしたものでない場合、プログラムに正しくリンクされているかを確認してください。
:::