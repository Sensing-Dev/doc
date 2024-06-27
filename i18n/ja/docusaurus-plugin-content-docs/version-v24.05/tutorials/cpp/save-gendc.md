---
sidebar_position: 7
---

# センサーデータを保存する (GenDC)

このチュートリアルでは、センサーから転送されたGenDCデータをバイナリファイルに保存する方法を学びます。

デバイスデータ形式がGenDC以外の場合（一般的なカメラで画像データを取得する場合）は、次のチュートリアルページ[センサーデータを保存する（非GenDC）](./save-image-bin.md)を参照してください。

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

使用する具体的なビルディングブロック（BB）は、使用されるセンサーデータの種類によって異なります。このチュートリアルでは、GenDCデータを保存する方法を例示します。デバイスデータ形式がGenDC以外の場合（一般的なカメラで画像データを取得する場合）は、次のチュートリアルページ[センサーデータを保存する（非GenDC）](./save-image-bin.md)を参照してください。

|           | データ取得BB                            | バイナリセーバーBB                                  |
|-----------|----------------------------------------|--------------------------------------------------|
| GenDC     | image_io_u3v_gendc                     | image_io_u3v_binary_gendc_saver                  |


これで、パイプライン`b`に2つのBBを追加します。2つ目のBB、`image_io_u3v_binary_gendc_saver`は、ポートに3つの入力（GenDCデータ、デバイス情報、ペイロードサイズ）を必要とします。

```c++
// データを取得する最初のBBを追加
Node n = b.add("image_io_u3v_gendc")();
// バイナリデータを保存する2つ目のBBを追加
n = b.add("image_io_binary_gendc_saver")(n["gendc"], n["device_info"], &payloadsize);
```

GenDCデータとデバイス情報は、前のノード`image_io_u3v_gendc`の取得BBによって取得されます。ペイロードサイズは、GenDCコンテナの全体サイズを表し、コンソールで`arv-tool-0.8 -n <デバイス名> control PayloadSize`コマンドを使用して取得できます。詳細な使用方法については、[arv-tool-0.8](../../external/aravis/arv-tools)を参照してください。

:::tip

### 複数センサの場合

`Param("num_devices", 2)`を使用して最初のBBで2つ以上のセンサーからデータを取得する場合、それぞれのバイナリセーバーBBを使用して個別に保存する必要があります。これを行わなかった場合、一方のセンサーのデータが他方のセンサーのデータを上書きしてしまいます。

![binarysaver-bb-after-data-acquisition-BB-multi-sensor](../img/tutorial4-multi-sensor.png)

最初のBBから各センサーの出力データにアクセスするには、次のようにインデックス`[]`を使用できます。それぞれのバイナリセーバーBBに`Param("prefix", "gendc0-")`と`Param("prefix", "gendc1-")`を設定して、互いの内容を上書きしないようにしてください。

```c++
Node n = b.add("image_io_u3v_gendc")().set_param(Param("num_devices", 2),);

if (num_device == 2){
    int32_t payloadsize1 = payloadsize[1];
    Node n1 = b.add("image_io_binary_gendc_saver")(n["gendc"][1], n["device_info"][1], &payloadsize1)
   .set_param(
       Param("prefix", "gendc1-"),
       Param("output_directory", saving_diretctory)
   );
   n1["output"].bind(outputs[1]);
}

int32_t payloadsize0 = payloadsize[0];
n = b.add("image_io_binary_gendc_saver")(n["gendc"][0], n["device_info"][0], &payloadsize0)
   .set_param(
       Param("prefix", "gendc0-"),
       Param("output_directory", saving_diretctory)
   );
n["output"].bind(outputs[0]);
```

複数のデバイスがある場合、それぞれのペイロードサイズが一致していることを確認してください。

```C++
// bind input values to the input port
std::vector<int32_t> payloadsize = {2074880, 2074880};
int32_t payloadsize0 = payloadsize[0];
...
n = b.add("image_io_binary_gendc_saver")(n["gendc"][0], n["device_info"][0], &payloadsize0)
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

import {tutorial_version} from "@site/static/version_const/v2405.js"
import GenerateTutorialLink from '@site/static/tutorial_link.js';

<GenerateTutorialLink language="cpp" tag={tutorial_version} tutorialfile="tutorial4_save_gendc_data" />
