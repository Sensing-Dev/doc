---
sidebar_position: 8
---

# センサーデータを保存する（非GenDC）

このチュートリアルでは、センサーから転送されたGenDCデータをバイナリファイルに保存する方法を学びます。
デバイスデータ形式がGenDCの場合、あるいは画像データのみではなく、全体のGenDCコンテナを保存したい場合は、前のチュートリアルページ[センサーデータを保存する（GenDC）](./save-gendc.md)を参照してください。

## 前提条件

* ion-kit（sensing-dev SDKと一緒にインストールされます）

## チュートリアル

前のチュートリアルでは、パイプラインで単一のビルディングブロック（BB）を使用してセンサーデータを取得しました。今回は、binarysaver BBを組み込んで、データの取得と保存の2ステップフローを実現します。

![binarysaver-bb-after-data-acquisition-BB](../img/tutorial4-single-sensor.png)

### パイプラインの構築

パイプライン`Builder`の初期化プロセスは、前のチュートリアルとまったく同じです。

```c++
// パイプライン設定
Builder b;
b.set_target(ion::get_host_target());
b.with_bb_module("ion-bb");
```

センサーデータ取得BBの後のビルディングブロック（BB）として、binarysaver BBを接続してフローを確立します。

使用する具体的なビルディングブロック（BB）は、使用されるセンサーデータの種類によって異なります。このチュートリアルでは、Mono12画像データを保存する方法を例示します。デバイスデータ形式がGenDCの場合、画像データのみではなく、全体のGenDCコンテナを保存する方が好ましい場合は、前のチュートリアルページ[センサーデータを保存する（GenDC）](./save-gendc.md)を参照してください。

|           | データ取得BB                            | バイナリセーバーBB                                  |
|-----------|----------------------------------------|--------------------------------------------------|
| 非GenDC   | image_io_u3v_cameraN_u&ltbyte-depth&gtx<dim&gt | image_io_binarysaver_u&ltbyte-depth&gtx&ltdim&gt |
| 非GenDC<br/>(例：Mono8) | image_io_u3v_cameraN_u8x2 | image_io_binarysaver_u8x2 |
| 非GenDC<br/>(例：Mono12) | image_io_u3v_cameraN_u16x2 | image_io_binarysaver_u16x2 |
| 非GenDC<br/>(例：RGB8) | image_io_u3v_cameraN_u8x3 | image_io_binarysaver_u8x3 |

これで、パイプライン`b`に2つのBBを追加します。2つ目のBB、`image_io_u3v_cameraN_u16x2`は、ポートに5つの入力（画像データ、デバイス情報、フレームカウント、画像の幅と高さ）を必要とします。

```c++
// データを取得する最初のBBを追加
int32_t w = <画像の幅>;
int32_t h = <画像の高さ>;
Node n = b.add("image_io_u3v_cameraN_u16x2")();
// バイナリデータを保存する2つ目のBBを追加
n = b.add("image_io_binarysaver_u16x2")(n["output"], n["device_info"], n["frame_count"][i], &w, &h);
```

画像データ、デバイス情報、フレームカウントは、前のノード`image_io_u3v_cameraN_u16x2`の取得BBによって取得されます。幅と高さは、コンソールで`arv-tool-0.8 -n <デバイス名> control Width Height`コマンドを使用して取得できます。詳細な使用方法については、[arv-tool-0.8](../../external/aravis/arv-tools)を参照してください。

:::tip

### 複数センサの場合

`Param("num_devices", 2)`を使用して最初のBBで2つ以上のセンサーからデータを取得する場合、それぞれのバイナリセーバーBBを使用して個別に保存する必要があります。これを行わなかった場合、一方のセンサーのデータが他方のセンサーのデータを上書きしてしまいます。

![binarysaver-bb-after-data-acquisition-BB-multi-sensor](../img/tutorial4-multi-sensor.png)

最初のBBから各センサーの出力データにアクセスするには、次のようにインデックス`[]`を使用できます。それぞれのバイナリセーバーBBに`Param("prefix", "image0-")`と`Param("prefix", "image1-")`を設定して、互いの内容を上書きしないようにしてください。

```c++
Node n = b.add("image_io_u3v_cameraN_u16x2")().set_param(Param("num_devices", 2),);

if (num_device == 2){
    int32_t payloadsize1 = payloadsize[1];
    Node n1 = b.add("image_io_binarysaver_u16x2")(n["output"][1], n["device_info"][1], n["frame_count"][i], &w, &h);
   .set_param(
       Param("prefix", "image1-"),
       Param("output_directory", saving_diretctory)
   );
   n1["output"].bind(outputs[1]);
}

int32_t payloadsize0 = payloadsize[0];
n = b.add("image_io_binarysaver_u16x2")(n["output"][0], n["device_info"][0], n["frame_count"][i], &w, &h);
   .set_param(
       Param("prefix", "image0-"),
       Param("output_directory", saving_diretctory)
   );
n["output"].bind(outputs[0]);
```

複数のデバイスがある場合、それぞれの幅と高さが一致していることを確認してください。

```C++
# 入力値を入力ポートにバインド
std::vector<int32_t> width = {1920, 1920};
std::vector<int32_t> height = {1080, 1080};
int32_t w = width[0];
...
n = b.add("image_io_binimage_io_binarysaver_u16x2ary_gendc_saver")(n["output"][0], n["device_info"][0], n["frame_count"][i], &w, &h);
...
```

:::

### 出力ポートの設定

バイナリファイルはbinary saver BBプロセス内で保存されますが、パイプラインからスカラー出力を取得します。

このスカラー出力は単にBBがデータを正常に保存したかどうかを示す終端フラグであり、具体的な値を使用するわけではありませんが、出力として受け取るための出力バッファを作成する必要があります。

```c++
Halide::Buffer<int> output = Halide::Buffer<int>::make_scalar();
n["output"].bind(output);
```

### パイプラインの実行

`builder.run()`を実行して、パイプラインを通常どおり終了します。

デフォルトでは、バイナリデータは次の形式で保存されます：`<出力ディレクトリ>/<プレフィックス>0.bin`、`<出力ディレクトリ>/<プレフィックス>1.bin`、`<出力ディレクトリ>/<プレフィックス>2.bin`など。デフォルトの出力ディレクトリは現在のディレクトリであり、デフォルトのプレフィックスは`raw-`です。これらの値をカスタマイズするには、バイナリセーバーBB内の`Param`を利用してください。

## 完全なコード

import {tutorial_version} from "@site/static/version_const/latest.js"
import GenerateTutorialLink from '@site/static/tutorial_link.js';

<GenerateTutorialLink language="cpp" tag={tutorial_version} tutorialfile="tutorial4_save_image_bin_data" />
