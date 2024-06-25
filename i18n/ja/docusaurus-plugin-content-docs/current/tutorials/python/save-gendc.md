---
sidebar_position: 7
---

# センサーデータの保存（GenDC）

このチュートリアルでは、センサから転送されたデータをバイナリファイルに保存する方法を学びます。

## 前提条件

* ion-python

import this_version from "@site/static/version_const/latest.js"

<pre>
<code class="language-bash">
pip3 install -U pip<br />
pip3 install ion-python=={this_version.ion_python_version}<br />
</code>
</pre>

## チュートリアル

前のチュートリアルでは、パイプラインで単一のビルディングブロック（BB）を使用してセンサーデータを取得しました。今回は、binarysaver BBを組み込んで、データの取得と保存の2ステップフローを実現します。

![binarysaver-bb-after-data-acquisition-BB](../img/tutorial4-single-sensor.png)
　　
### パイプラインを構築する

パイプライン `Builder` の初期化プロセスは、以前のチュートリアルとまったく同じです。

```python
# pipeline setup
builder = Builder()
builder.set_target('host')
builder.with_bb_module('ion-bb')
```

センサーデータ取得BBの後のビルディングブロック（BB）として、binarysaver BBを接続してフローを確立します。

使用する具体的なビルディングブロック（BB）は、使用されているセンサーデータのタイプに依存します。このチュートリアルでは、GenDCデータを保存する方法を示す例を紹介します。

|           | データ取得BB                            | バイナリセーバーBB                                  |
|-----------|----------------------------------------|--------------------------------------------------|
| GenDC     | image_io_u3v_gendc                     | image_io_u3v_binary_gendc_saver                  |

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

### 複数センサーデータの場合

最初のBBで `Param("num_devices", 2)` を使用して複数のセンサーからデータを取得する場合、個々のバイナリセーバBBを使用してそれらを個別に保存する必要があります。1つのセンサーからのデータが他のセンサーからのデータを上書きを防ぐために、必ず以下のようなパイプライン構成にしてください。

![binarysaver-bb-after-data-acquisition-BB-multi-sensor](../img/tutorial4-multi-sensor.png)

最初のBBから各センサの出力データにアクセスするには、次のようにインデックス `[]` を使用します。各バイナリセーバBBに `Param("prefix", "gendc0-")` と `Param("prefix", "gendc1-")` を設定して、お互いの内容を上書きしないように注意してください。

```python
if num_device ==2 :
    t_node1 = builder.add("image_io_binary_gendc_saver") \
        .set_iport([node.get_port('gendc')[1], node.get_port('device_info')[1], payloadsize_ps[1], ]) \
        .set_param([output_directory,
                    Param('prefix', 'gendc1-')])
    # create halide buffer for output port
    terminator1 = t_node1.get_port('output')
    output1 = Buffer(Type(TypeCode.Int, 32, 1), ())
    terminator1.bind(output1)
```

複数センサのペイロードサイズがそれぞれ正しくバインドされていることを確認してください。

```python
# bind input values to the input port
for i in range(num_device):
    payloadsize_ps[i].bind(payloadsize[i])
```
:::

### 出力ポートの設定

バイナリファイルはbinary saver BBプロセス内で保存されますが、パイプラインからスカラー出力を取得します。

このスカラー出力は単にBBがデータを正常に保存したかどうかを示す終端フラグであり、具体的な値を使用するわけではありませんが、出力として受け取るための出力バッファを作成する必要があります。

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

<GenerateTutorialLink language="python" tag={tutorial_version} tutorialfile="tutorial4_save_gendc_data" />
