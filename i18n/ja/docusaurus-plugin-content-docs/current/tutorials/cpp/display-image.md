---
sidebar_position: 3
---

# 画像の表示

このチュートリアルでは、ion-kitを使用してデバイスから画像データを取得し、OpenCVで表示する方法に
ついて学びます。

## 前提条件

* OpenCV（sensing-dev SDKと共にインストール済み）
* ion-kit（sensing-dev SDKと共にインストール済み）

## チュートリアル

### デバイス情報の取得

ionpyを使用して画像を表示するには、デバイスの次の情報を取得する必要があります。

* 幅
* 高さ
* ピクセルフォーマット

[前のチュートリアル](obtain-device-info.md)または[arv-tool-0.8](../../external/aravis/arv-tools.md)を参照してこれらの値を取得するのに役立ちます。

### パイプラインの構築

[導入](../intro.mdx)で学んだように、画像のI/Oと処理のためのパイプラインを構築し、実行します。  

このチュートリアルでは、U3Vカメラから画像を取得する唯一のビルディングブロックを持つ非常に単純な
パイプラインを構築します。

次のionpy APIは、パイプラインを設定します。

```c++
#define MODULE_NAME "ion-bb"
...
// パイプラインの設定
Builder b;
b.set_target(Halide::get_host_target());
b.with_bb_module(MODULE_NAME);
```

`set_target`は、Builderによって構築されたパイプラインが実行されるハードウェアを指定します。    

`ion-bb.dll` で定義されたBBを使用したいので、 `with_bb_module` 関数でモジュールをロードする必要
があります。

ここで使用するBBは `image_io_u3v_cameraN_u8x2` で、これは各ピクセルデータが8ビット深度で2次元の
U3Vカメラ向けに設計されています（たとえば、Mono8）。

デバイスのピクセルフォーマットがMono10またはMono12の場合は、それぞれ10ビットおよび12ビットのピ 
クセルデータを格納するために16ビット深度のピクセルが必要なので `image_io_u3v_cameraN_u16x2` を使
用する必要があります。

ピクセルフォーマットがRGB8の場合、ビット深度が8で次元が3（幅と高さに加えて、色のチャネルがある 
）であるため、 `image_io_u3v_cameraN_u8x3` を使用します。

これらのBBのいずれも、入力として `dispose`、`gain`、および `exposuretime` と呼ばれるものを必要 
とするため、これらの値をパイプラインに渡すためにポートを設定する必要があります。

```c++
// ポートの設定
Port dispose_p{ "dispose",  Halide::type_of<bool>() };
Port gain_p{ "gain", Halide::type_of<double>(), 1 };
Port exposure_p{ "exposure", Halide::type_of<double>(), 1 };
```

ポートの入力は動的です。つまり、各実行ごとに更新できます。入力値を文字列で静的に設定するには、 
`Param` を使用できます。

```c++
#define FEATURE_GAIN_KEY "Gain"
#define FEATURE_EXPOSURE_KEY "ExposureTime"
...
Param num_devices{"num_devices", std::to_string(num_device)};
Param pixel_format{"pixel_format_ptr", pixel_format};
Param frame_sync{"frame_sync", "true"};
Param gain_key{"gain_key", FEATURE_GAIN_KEY};
Param exposure_key{"exposure_key", FEATURE_EXPOSURE_KEY};
Param realtime_diaplay_mode{"realtime_diaplay_mode", "false"};
```

`pixel_format` は[デバイス情報の取得](#get-device-information)で取得したピクセルフォーマットで 
す。

::::caution
`gain_key` と `exposure_key` はデバイスのゲインと露光時間を制御するためのGenICamのフィーチャキ 
ーです。通常、これらはemvaによる**SFNC（Standard Features Naming Convention）**で `Gain` および 
`ExposureTime` として設定されていますが、一部のデバイスには異なるキーと異なるタイプがあるかもし 
れません。

その場合、ポートのタイプとパラメータのキーを変更する必要があります。[このページ](../external/aravis/arv-tools#list-the-available-genicam-features)を参照して、利用可能なフィーチャをリストアッ 
プする方法を確認してください。

```c++
#define FEATURE_GAIN_KEY <デバイスのゲインを制御するフィーチャの名前>
#define FEATURE_EXPOSURE_KEY <露光時間を制御するフィーチャの名前>

Port gain_p{ "gain", Halide::type_of<TypeCode for your device>(), 1 };
Port exposure_p{ "exposure", Halide::type_of<TypeCode for your device>(), 1 };
```
::::

これで、ポートとパラメータを使用してパイプラインにBBを追加します。

```c++
Node n = b.add(bb_name[pixel_format])(dispose_p, gain_p, exposure_p)
    .set_param(
    num_devices,
    pixel_format,
    frame_sync,
    gain_key,
    exposure_key,
    realtime_diaplay_mode
    );
```

これが私たちのパイプラインの唯一のBBであるため、ノードの出力ポートはパイプラインの出力ポートに 
なり、その名前は `output_p` です。

BBとポートを含む私たちのパイプラインは次のようになります。

![tutorial1-pipeline](../img/tutorial1-pipeline.png)

入力値を渡し、ポートから出力データを取得するためには、入力用のバッファを用意し、そのバッファを 
入力用のポートにマッピングし、出力用のポートにバッファをマッピングする必要があります。

```c++
// 入力ポートのためのHalideバッファを作成
double *gains = (double*) malloc (sizeof (double) * num_device);
double *exposures = (double*) malloc (sizeof (double) * num_device);
for (int i = 0; i < num_device; ++i){
    gains[i] = 40.0;
    exposures[i] = 100.0;
}
Halide::Buffer<double> gain_buf(gains, std::vector< int >{num_device});
Halide::Buffer<double> exposure_buf(exposures, std::vector< int >{num_device});

// 出力ポートのためのHalideバッファを作成
std::vector< int > buf_size = std::vector < int >{ width, height };
if (pixel_format == "RGB8"){
    buf_size.push_back(3);
}
std::vector<Halide::Buffer<T>> output;
for (int i = 0; i < num_device; ++i){
    output.push_back(Halide::Buffer<T>(buf_size));
}

// I/Oポートの設定
PortMap pm;
pm.set(dispose_p, false);
pm.set(gain_p, gain_buf);
pm.set(exposure_p, exposure_buf);
pm.set(n["output"], output);
```

ここでの `buf_size` は2D画像向けに設計されています。ピクセルフォーマットがRGB8の場合、色チャン 
ネルを追加するために `(width, height, 3)` を設定する必要があります。

`T` は出力バッファの型です。例えば、Mono8およびRGB8の場合は `uint8_t` で、Mono10およびMono12の 
場合は `uint16_t` です。

### パイプラインの実行

パイプラインは実行の準備ができています。

チュートリアルコードでは、ゲインおよび露光時間の値を入力ポートにマッピングするのはオプションで 
すが、デバイスを破棄するには実行中に `false` に設定し、プログラムの実行が終了したら `true` に設 
定する必要があります。これにより、デバイスが安全に閉じられます。

```c++
for (int i = 0; i < loop_num; ++i){
    pm.set(dispose_p, i == loop_num-1);
    b.run(pm);
    ...
}
```

動的ポートを設定した後、 `b.run(pm);` を使用してパイプラインを実行します。

### OpenCVでの表示

出力データ（つまり、画像データ）が**Bufferのベクトル**にマップされているので、これをOpenCVバッ 
ファにコピーして画像処理または表示を行うことができます。

注意すべきは、OpenCVはバッファのチャネル（次元）の順序が異なることです。

```c++
for (int i = 0; i < num_device; ++i){
cv::Mat img(height, width, opencv_mat_type[pixel_format]);
std::memcpy(img.ptr(), output[i].data(), output[i].size_in_bytes());
img *= positive_pow(2, num_bit_shift_map[pixel_format]);
cv::imshow("image" + std::to_string(i), img);
}
```

`opencv_mat_type[pixel_format]` は、画像データのPixelFormat（ビットの深さと次元）に依存します。
例えば、Mono8の場合は `CV_8UC1` 、RGB8の場合は `CV_8UC3` 、Mono10およびMono12の場合は `CV_16UC1` です。

`output[i]` をOpenCV Matオブジェクトにコピーして表示できます。

```c++
cv::imshow("image" + std::to_string(i), img);
cv2.waitKey(1)
```

注意すべきは、 `output` はBufferのベクトルです（複数のデバイスを制御するために `num_device` を 
`1` より大きく設定できることを考慮しています）。画像データを取得するには、 `outpus[0]` にアクセ 
スします。

このプロセスを `for` ループで繰り返すと、カメラデバイスからの連続した画像が正常に表示されます。

## 完全なコード

チュートリアルで使用された完全なコードは[こちら](https://github.com/Sensing-Dev/tutorials/blob/v23.11.01/cpp/src/tutorial1_display.cpp)にあります。


プログラムをコンパイルおよびビルドするために[こちら](https://github.com/Sensing-Dev/tutorials/blob/v23.11.01/cpp/CMAKELists.txt)で提供されているCMakeLists.txtを使用できます。