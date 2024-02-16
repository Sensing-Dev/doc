---
sidebar_position: 4
---

# 画像の表示

このチュートリアルでは、ion-kitを使用してデバイスから画像データを取得し、OpenCVで表示する方法を学びます。

## 前提条件

* OpenCV（sensing-dev SDKと一緒に`-InstallOpenCV`オプションでインストール）
* ion-kit（sensing-dev SDKと共にインストール）

## チュートリアル

:::info
v23.11.01またはそれ以前のチュートリアルでは、デバイスを制御するためにGainとExposureTimeの入力が必要でしたが、このバージョンではそれらがもはや必要ありません。これらの値を制御したい場合は、[BB内でカメラを制御する](./control_camera.md)を参照してください。
:::

### デバイス情報の取得

ionpyを使用して画像を表示するには、デバイスの以下の情報を取得する必要があります。

* 幅
* 高さ
* ピクセルフォーマット

[前回のチュートリアル](obtain-device-info.md)または [arv-tool-0.8](../../external/aravis/arv-tools.md) がこれらの値を取得するのに役立ちます。

### パイプラインの構築

[導入](../intro.mdx)で学んだように、画像の入出力と処理のためのパイプラインを構築して実行します。

ion-kitおよびOpenCVのAPIを使用するために、次のヘッダーを含める必要があります：

```c++
#include <ion/ion.h>

#include <opencv2/core.hpp>
#include <opencv2/imgproc.hpp>
#include <opencv2/highgui.hpp>
```

このチュートリアルでは、非常に単純なパイプラインを構築します。このパイプラインは、U3Vカメラから画像を取得する唯一のビルディングブロックを持っています。

次のion APIがパイプラインを設定します。

```c++
// パイプラインの設定
Builder b;
b.set_target(ion::get_host_target());
b.with_bb_module("ion-bb");
```

`set_target`は、Builderによって構築されたパイプラインが実行されるハードウェアを指定します。

`ion-bb.dll`で定義されたBBを使用したいので、`with_bb_module`関数でモジュールをロードする必要があります。

使用するBBは`image_io_u3v_cameraN_u8x2`で、これは各ピクセルデータが8ビット深度で2次元のU3Vカメラ向けに設計されています（例：Mono8）。

デバイスのピクセルフォーマットがMono10またはMono12の場合、10ビットおよび12ビットのピクセルデータを格納するために16ビット深度のピクセルが必要なので、`image_io_u3v_cameraN_u16x2`が必要です。

ピクセルフォーマットがRGB8の場合、ビットの深度は8で、次元は3です（幅と高さに加えて、カラーチャンネルがあります）、そのため`image_io_u3v_cameraN_u8x3`を使用します。

| BBの名前 | ビットの深さ | 次元 | `PixelFormat`の例 |
| --------   | ------- | ------- | ------- |
| `image_io_u3v_cameraN_u8x2` | 8 | 2 | `Mono8` |
| `image_io_u3v_cameraN_u8x3` | 8 | 3 |  `RGB8`, `BGR8` |
| `image_io_u3v_cameraN_u16x2` | 16 | 2 | `Mono10`, `Mono12` |

BBに設定するための静的な入力値を設定するには、次のように`Param`を定義する必要があります。

```c++
// パラメータの設定
Param num_devices("num_devices", num_device),
Param frame_sync("frame_sync", true),
Param realtime_diaplay_mode("realtime_diaplay_mode", false)
```

| Paramのキー | 値のタイプ | 説明 |
| --------   | ------- | ------- |
| `num_devices` | Integer | プログラムで使用するデバイスの数 |
| `frame_sync` | Boolean | デバイスの数が1以上の場合、デバイス間でフレームカウントを同期させる |
| `realtime_diaplay_mode` | Boolean | フレームドロップを許可しますが、遅延はありません |

これで、ノードとポート、およびパラメータを持つBBをパイプラインに追加できます。

```c++
// パイプラインにノードを追加
Node n = b.add(bb_name)()
    .set_param(
        Param("num_devices", num_device),
        Param("frame_sync", true),
        Param("realtime_diaplay_mode", false)
    );
```

:::tip v23.11.01 からの変更点
v23.11.01では`Gain`と`ExposureTime`の入力ポートをBBが必要としていましたが、このバージョンではオプションになりました。詳細は[BB内でカメラを制御する](./control_camera.md)を参照してください。

また、別の入力ポート`dispose`は廃止され、ビルダーのインスタンスが解放されるとカメラは自動的にかつ暗黙的に閉じられます。スコープを外れた時にインスタンスは自動的に解放されますが、どこで解放されるかを視覚的に確認したい場合は[デバッグのヒント](../../lessons/ion-log)を参照し、`ION_LOG_LEVEL`を`debug`に設定してください。
:::

これがパイプラインとBB、ポートの構造です：

![tutorial1-pipeline](../img/tutorial1-pipeline.png)

ポートから出力データを取得するために、出力用のバッファを準備し、ポートをバッファにバインドします。

```c++
// 出力ポートから出力バッファへのポートマッピング
std::vector< int > buf_size = std::vector < int >{ width, height };
if (pixel_format == "RGB8"){
    buf_size.push_back(3);
}
std::vector<Halide::Buffer<T>> output;
for (int i = 0; i < num_device; ++i){
    output.push_back(Halide::Buffer<T>(buf_size));
}
n["output"].bind(output);
```

注意：ここでの`buf_size`は2Dイメージ用に設計されています。ピクセルフォーマットがRGB8の場合、カラーチャンネルを追加するには`(width、height、3)`を設定する必要があります。

`T`は出力バッファのタイプです。たとえば、Mono8およびRGB8用に`uint8_t`、Mono10およびMono12用に`uint16_t`です。

### パイプラインの実行

パイプラインは実行の準備ができました。 `run()`を呼び出すたびに、ベクトルまたは`output`内のバッファが出力画像を受け取ります。

```c++
b.run();
```

:::tip v23.11.01 からの変更点
* `PortMap`は廃止されました
* `Builder`の`run`は`PortMap`の引数を受け取りません。
:::

### OpenCVで表示

出力データ（つまり画像データ）が**Bufferのベクトル** `output`とバインドされているため、これをOpenCVバッファにコピーして画像処理または表示できます。

注意：OpenCVはバッファ上のチャネル（次元）の順序が異なる可能性があります。

```c++
int coef =  positive_pow(2, num_bit_shift_map[pixel_format]);

// i番目のデバイス用
cv::Mat img(height, width, opencv_mat_type[pixel_format]);
std::memcpy(img.ptr(), output[i].data(), output[i].size_in_bytes());
img *= coef;
```

`opencv_mat_type[pixel_format]`は画像データのPixelFormat（ビットの深さと次元）に依存します。例えば、Mono8の場合は`CV_8UC1`、RGB8の場合は`CV_8UC3`、Mono10およびMono12の場合は`CV_16UC1`です。

`output[i]`をOpenCV Matオブジェクトにコピーして表示できます。

```c++
cv::imshow("image" + std::to_string(i), img);
user_input = cv::waitKeyEx(1);
```

注意：`output`はBufferのベクトルです（つまり、複数のデバイスを制御するために`num_device`を設定できます）。画像データを取得するには`outpus[0]`にアクセスします。

連続した画像を取得するには、`cv::waitKeyEx(1)`を使用してwhileループを設定します。これにより、プログラムは1ミリ秒間保持され、ユーザーがキーを入力すると-1以外の値が返されます。次のコードは、ユーザーがキーを入力するまで無限ループします。

```c++
while(user_input == -1)
{
    // Builderを使用してパイプラインをJITコンパイルおよび実行します。
    b.run();
    
    // 取得したバッファオブジェクトをOpenCVバッファ形式に変換します。
    for (int i = 0; i < num_device; ++i){
    cv::Mat img(height, width, opencv_mat_type[pixel_format]);
    std::memcpy(img.ptr(), output[i].data(), output[i].size_in_bytes());
    img *= coef;
    cv::imshow("image" + std::to_string(i), img);
    }

    // 1ms待機
    user_input = cv::waitKeyEx(1);
}
```

## 完全なコード

チュートリアルで使用される完全なコードは[こちら](https://github.com/Sensing-Dev/tutorials/blob/main/cpp/src/tutorial1_display.cpp)です。

プログラムのコンパイルとビルドには[こちら](https://github.com/Sensing-Dev/tutorials/blob/main/cpp/CMAKELists.txt)に提供されているCMakeLists.txtを使用できます。

:::caution 動かない時は
* もしお使いのOpenCVがSensing-Devインストール時に`-InstallOpenCV`オプションをつけてインストールしたものでない場合、プログラムに正しくリンクされているかを確認してください。
:::