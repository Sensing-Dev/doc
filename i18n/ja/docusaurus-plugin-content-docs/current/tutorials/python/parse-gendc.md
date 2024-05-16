---
sidebar_position: 8
---

# GenDCデータの解析

このチュートリアルでは、GenDCセパレーターライブラリの使用方法を学びます。

## Prerequisite
 
* GenDC Separator
* OpenCV
* numpy

import this_version from "@site/static/version_const/latest.js"

<pre>
<code class="language-bash">
pip3 install -U pip<br />
pip3 install opencv-python<br />
pip3 install numpy<br />
pip3 install gendc-python=={this_version.gendc_python_version}<br />
</code>
</pre>

## Tutorial

[前のチュートリアル](save-gendc)では、GenDCデータをバイナリファイルに保存する方法を学びました。今度は、データを読み込み、コンテナを解析し、ディスクリプタからセンサに関する情報を取得します。

### GenDC

GenDC、ジェネリックデータコンテナは、EMVA（European Machine Vision Association）によって定義されています。その名前の通り、データ次元、メタデータ、または画像シーケンス/バーストに関係なく、カメラデバイスによって定義された任意の種類のデータを含むことができます。

フォーマットルールは[公式ドキュメント](https://www.emva.org/wp-content/uploads/GenICam_GenDC_v1_1.pdf)で定義されていますが、GenDCセパレータを使用すると、コンテナ全体を簡単に解析できます。

### Find Binary file.   

前のチュートリアルで保存したバイナリファイルを使用する場合、ディレクトリの名前は `tutorial_save_gendc_XXXXXXXXXXXXXX` で、バイナリファイルのプレフィックスは `gendc0-` にする必要があります。

```python
directory_name = "tutorial_save_gendc_XXXXXXXXXXXXXX"
prefix = "gendc0-"
```

次のスニペットは、指定されたプレフィックスで始まるすべてのバイナリファイルをディレクトリから取得し、すべてのバイナリを記録された順序に並べ替えます。

```python
bin_files = [f for f in os.listdir(directory_name) if f.startswith(prefix) and f.endswith(".bin")]
bin_files = sorted(bin_files, key=lambda s: int(s.split('-')[-1].split('.')[0]))
```

これで、`bin_files`内のすべての順序付けられたバイナリファイルをforループで処理することが可能です。

```python
for bf in bin_files:
```

### Open and load Binary file.

前述のforループ内では対象の（単一の）バイナリファイルは `bf` で表されます。該当のバイナリファイルを `with open()` で`ifs`として開き、ファイルコンテントすべてを`filecontent`にコピーします。

```python
bin_file = os.path.join(directory_name, bf)

with open(bin_file, mode='rb') as ifs:
    filecontent = ifs.read()
```

### Parse binary file

GenDC Separatorを使用するためにモジュールを読み込みます。

```python
from gendc_python.gendc_separator import descriptor as gendc
```

データからGenDC `Container` オブジェクトを作成できます。
```python
gendc_container = gendc.Container(filecontent[cursor:])
``` 

上記がエラーを返す場合、データにGenDCの署名がないことが考えられます。
This may return error if the file content does not have GenDC signature.

このオブジェクトにはGenDCディスクリプターに書かれたすべての情報が含まれます。以下の例ではディスクリプターサイズとデータサイズを取得できます。

```python
# get GenDC container information
descriptor_size = gendc_container.get_descriptor_size()
print("GenDC Descriptor size:", descriptor_size)
container_data_size = gendc_container.get_data_size()
print("GenDC Data size:", container_data_size)
```

コンテナ全体のサイズはこのディスクリプターサイズとデータサイズであり、次のコンテナ情報をロードする場合は、元のデータのオフセットに合計を追加するだけです。
```python
next_gendc_container= gendc.Container(filecontent[cursor + descriptor_size + container_data_size:])
```

このチュートリアルでは、最初に利用可能な画像センサによるコンポーネントデータのサイズとオフセットを取得しましょう。 `get_1st_component_idx_by_typeid` は、最初に利用可能なデータのコンポーネントインデックスとパートインデックスのタプルを返します。センサタイプはパラメタで指定が可能です。今回はイメージデータを探すために`0x0000000000000001`を指定しマスタ。これが `-1` を返す場合、センサー側でデータが有効に設定されていません。

```python
# get first available component
image_component_idx = gendc_container.get_1st_component_idx_by_typeid(GDC_INTENSITY)
print("First available image data component is Comp", image_component_idx)
```

`image_component_idx`番目のコンポーネントにアクセスをして情報を得るために`gendc_container()`を呼び出します。

各コンポーネントには1つ以上のパーツがあり、コンポーネントが画像データを持つ場合、パーツの数は一般的にカラーチャネルを表します。forループの処理によって各パーツにアクセスが可能です。

```python
for part_id in range(part_count):
    part = image_component.get_part_by_index(part_id)
    part_data_size =part.get_data_size()
```

画像を表示するためには、画像のサイズ`part_data_size`以外にも以下の情報が必要です。
* 幅 (Width)
* 高さ (Height)
* カラーチャネル (Color-channel)
* バイト深度 (Byte-depth)

`ged_dimension`は幅と高さを含むベクターを返します。コンポーネントに1つ以上のパーツがある場合、それは複数のカラーチャネルを持っています。

```python
dimension = part.get_dimension()
```

バイト深度はデータの総サイズと上記の取得した寸法値から計算することができます。
```python
w_h_c = part_count
for d in dimension:
    w_h_c *= d
byte_depth = int(part_data_size / w_h_c)
```

画像を表示するのに必要な準備ができたので、OpenCVを使って、読み取ったGenDCコンテナから画像を表示させましょう。
```python
width = dimension[0]
height = dimension[1]
if byte_depth == 1:
    image = np.frombuffer(part.get_data(), dtype=np.uint8).reshape((height, width))
elif byte_depth == 2:
    image = np.frombuffer(part.get_data(), dtype=np.uint16).reshape((height, width))
cv2.imshow("First available image component", image)
cv2.waitKey(1)
```

:::tip

GenDCのTypeSpecificフィールドに保存されているデバイス固有のデータにアクセスしたい場合は、次のようにします。

たとえば、次のGenDCデータには、8バイトサイズであるTypeSpecific3のうち下位4バイトに `framecount` データがあります。

```python
typespecific3 = part.get_typespecific_by_index(3)
print("Framecount: ", int.from_bytes(typespecific3.to_bytes(8, 'little')[0:4], "little"))        
```
:::

## Complete code

import {tutorial_version} from "@site/static/version_const/latest.js"
import GenerateTutorialLink from '@site/static/tutorial_link.js';

<GenerateTutorialLink language="python" tag={tutorial_version} tutorialfile="tutorial5_parse_gendc_data" />
