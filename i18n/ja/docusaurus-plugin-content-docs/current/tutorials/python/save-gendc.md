---
sidebar_position: 7
---

# センサーデータの保存

このチュートリアルでは、センサから転送されたデータをバイナリファイルに保存する方法を学びます。

## 前提条件

* ionpy 1.8.1 or later

```bash
pip3 install -U pip
pip3 install ion-python==1.8.1
```

## チュートリアル

前のチュートリアルでは、パイプライン内でセンサーデータを取得するための単一のビルディングブロック（BB）を利用しました。今度は、バイナリセーバBBを組み込んで、1.データを取得し、2.パイプライン内でデータを保存という2段階のフローを有効にします。

![binarysaver-bb-after-data-acquisition-BB](../img/tutorial4-single-sensor.png)

### パイプラインを構築する

パイプライン `Builder` の初期化プロセスは、以前のチュートリアルとまったく同じです。

```python
# pipeline setup
builder = Builder()
builder.set_target('host')
builder.with_bb_module('ion-bb')
```

センサデータ取得BBの後続のビルディングブロック（BB）として、バイナリセーバーBBを接続して、1.データを取得してから、2.パイプライン内でデータを保存というフローを確立します。

使用する具体的なビルディングブロック（BB）は、使用されているセンサーデータのタイプに依存します。このチュートリアルでは、GenDCデータを保存する方法を示す例を紹介します。

|           | データ取得BB                                    | バイナリセーバーBB                               |
|-----------|------------------------------------------------|--------------------------------------------------|
| GenDC     | image_io_u3v_gendc                             | image_io_u3v_binary_gendc_saver                  |
| 非GenDC   | image_io_u3v_cameraN_u&ltbyte-depth&gtx<dim&gt | image_io_binarysaver_u&ltbyte-depth&gtx&ltdim&gt |

パイプライン `builder` に2つのBBを追加します。2番目のBBである `image_io_u3v_binary_gendc_saver` には、ポートにGenDCデータ、デバイス情報、およびペイロードサイズの3つの入力が必要です：

```python
# set port
payloadsize_p = Port('payloadsize', Type(TypeCode.Int, 32, 1), 0)
# bind input values to the input port
payloadsize_p.bind(payloadsize)

# add the first BB to acquire data
node = builder.add("image_io_u3v_gendc")
# add the second BB to save binary data 
node_sensor0 = builder.add("image_io_binary_gendc_saver").set_iport([node.get_port('gendc')[0], node.get_port('device_info')[0], payloadsize_p, ])
```

GenDCデータとデバイス情報は、前のノードで取得された取得BBによって取得されます。ペイロードサイズは、コンソールで `arv-tool-0.8 -n <デバイス名> control PayloadSize` コマンドを使用して取得できるGenDCコンテナの全体サイズを表します。詳しい使用方法については、[arv-tool-0.8](../../external/aravis/arv-tools) を参照してください。
:::tip

### 非GenDCデータの場合

BBがGenDC向けに設計されている場合、 `frame_count` の入出力はありませんが、非GenDC BBでは必須となります。詳細については、以下の表を参照してください。

|           | データ取得BBの出力                            | バイナリセーバーBBの入力                       |
|-----------|------------------------------------------------|--------------------------------------------------|
| GenDC     | gendc; device_info                             | gendc; device_info; payloadsize                  |
| non-GenDC | output; device_info; frame_count               | output; device_info; frame_count; width; height  |

widthとheightは、上記の例でペイロードサイズを取得したのと同様に、[arv-tool-0.8](../../external/aravis/arv-tools) を使用して取得できます。

### 複数センサーデータの場合

最初のBBで `Param("num_devices", 2)` を使用して複数のセンサーからデータを取得する場合、個々のバイナリセーバBBを使用してそれらを個別に保存する必要があります。1つのセンサーからのデータが他のセンサーからのデータを上書きを防ぐために、必ず以下のようなパイプライン構成にしてください。

![binarysaver-bb-after-data-acquisition-BB-multi-sensor](../img/tutorial4-multi-sensor.png)

最初のBBから各センサの出力データにアクセスするには、次のようにインデックス `[]` を使用します。各バイナリセーバBBに `Param("prefix", "sensor0-")` と `Param("prefix", "sensor1-")` を設定して、お互いの内容を上書きしないように注意してください。

```python
if num_devices == 2:
    payloadsize1_p = Port('payloadsize1', Type(TypeCode.Int, 32, 1), 0)
    node_sensor1 = builder.add("image_io_binary_gendc_saver")\
        .set_iport([node.get_port('gendc')[1], node.get_port('device_info')[1], payloadsize1_p, ])\
        .set_param([output_directory, 
                    Param('prefix', 'sensor1-') ])
    terminator1 = node_sensor1.get_port('output')
    output1 = Buffer(Type(TypeCode.Int, 32, 1), ())
    terminator1.bind(output1)
    payloadsize1_p.bind(payloadsize)
```

:::

### 出力ポートを設定する

バイナリファイルはバイナリセーバBBプロセス内に保存されますが、パイプラインからはスカラ出力が得られます。

これは、BBがデータを正常に保存したかどうかを示す終端フラグであるため、値そのものを使うことはほとんどありません。しかし、この出力を受け取るためのバッファは必ず作成する必要があります。

```python
# create halide buffer for output port
terminator0 = node_sensor0.get_port('output')
output0 = Buffer(Type(TypeCode.Int, 32, 1), ())
terminator0.bind(output0)
```

### パイプラインを実行する

通常通りに `builder.run()` を実行してパイプラインを終了します。

デフォルトでは、バイナリデータは次の形式で保存されます： `<output directory>/<prefix>0.bin`、`<output directory>/<prefix>1.bin`、`<output directory>/<prefix>2.bin` などです。デフォルトの出力ディレクトリはカレントディレクトリで、デフォルトのプレフィックスは `raw-` です。これらの値をカスタマイズするには、バイナリセーバBB内の `Param` を使用してください。


## 完全なコード

import {tutorial_version} from "@site/static/version_const/latest.js"
import GenerateTutorialLink from '@site/static/tutorial_link.js';

<GenerateTutorialLink language="python" tag={tutorial_version} tutorialfile="tutorial4_save_data" />
