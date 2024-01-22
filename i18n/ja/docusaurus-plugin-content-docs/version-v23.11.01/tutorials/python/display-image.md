---
sidebar_position: 3
---

# 画像を表示する

このチュートリアルでは、ion-kitを使用してデバイスから画像データを取得し、OpenCVを使用して画像を
表示する方法を学びます。

## 前提条件

* ionpy
* numpy
* OpenCV

```bash
pip3 install -U pip
pip3 install opencv-python
pip3 install numpy
pip3 install "git+https://github.com/fixstars/ion-kit.git@bbec9c25c75b1d6926d8b23b81beb770923399d3#egg=ionpy&subdirectory=python"      
```

## チュートリアル

### デバイス情報を取得

ionpyで画像を表示するには、デバイスの以下の情報を取得する必要があります。

* 幅
* 高さ
* ピクセルフォーマット

[前のチュートリアル](obtain-device-info.md)または[arv-tool-0.8](../../external/aravis/arv-tools.md)がこれらの値を取得するのに役立ちます。

### パイプラインの構築

まず最初に、ionpyのモジュールをロードします。これはion-kitのPythonバインディングです。

```python
from ionpy import Node, Builder, Buffer, PortMap, Port, Param, Type, TypeCode
```

:::caution
Pythonユーザーの場合、ionpyのモジュールをロードする際にC/C++ランタイムライブラリがない可能性があります。ionpyのモジュールをロードする際に問題が発生する場合は、[Microsoftの公式ウェブページの記事](https://learn.microsoft.com/en-us/cpp/windows/latest-supported-vc-redist?view=msvc-160#visual-studio-2015-2017-2019-and-2022)からライブラリをインストールできます。
:::

[イントロダクション](../intro.mdx)で学んだように、画像I/Oおよび処理のためのパイプラインを構築お
よび実行します。

このチュートリアルでは、U3Vカメラから画像を取得する唯一のビルディングブロックを持つ非常にシンプ
ルなパイプラインを構築します。

以下のionpy APIは、パイプラインをセットアップします。

```python
module_name = 'ion-bb.dll'
...
# パイプラインのセットアップ
builder = Builder()
builder.set_target('host')
builder.with_bb_module(module_name)
```

`set_target`は、Builderによって構築されたパイプラインが実行されるハードウェアを指定します。    

使用するBBが `ion-bb.dll` で定義されているため、`with_bb_module` 関数でモジュールをロードする必
要があります。

使用するBBは `image_io_u3v_cameraN_u8x2` で、各ピクセルデータが8ビットの深さで、2次元（例：Mono8）のU3Vカメラ向けに設計されています。

ピクセルフォーマットがMono10またはMono12の場合は、各ピクセルデータに16ビットの深さが必要なので 
`image_io_u3v_cameraN_u16x2` を使用する必要があります。

ピクセルフォーマットがRGB8の場合、ビット深度が8で次元が3（幅と高さに加えて、カラーチャネルがあ 
ります）であるため、 `image_io_u3v_cameraN_u8x3` を使用します。

これらのBBのいずれも、 `dispose` 、 `gain` 、および `exposuretime` と呼ばれる入力が必要なので、
パイプラインに値を渡すためにポートを設定する必要があります。

```python
# 入力ポートの設定
dispose_p = Port('dispose', Type(TypeCode.Uint, 1, 1), 0)
gain_p = Port('gain', Type(TypeCode.Float, 64, 1), 1)
exposuretime_p = Port('exposuretime', Type(TypeCode.Float, 64, 1), 1)
```

ポート入力は動的であるため（すべての実行に対して更新できます）、 `Param` を介して静的な値を文字
列で設定できます。

```python
# パラメータの設定
num_devices = Param('num_devices', str(num_device))
pixel_format_ptr = Param('pixel_format_ptr', "RGB8")
gain_key = Param('gain_key', 'Gain')
exposure_key = Param('exposure_key', 'ExposureTime')
```

`pixel_format_ptr` は [デバイス情報の取得](#get-device-information) で取得したピクセルフォーマ 
ットです。

::::caution
`gain_key` および `exposure_key` はデバイスのゲインおよび露光時間を制御するGenICamのフィーチャ 
キーです。**SFNC（Standard Features Naming Convention）**によるemvaの規格では、これらは通常、 `Gain` および `ExposureTime` を `FLOAT64` で設定しますが、一部のデバイスでは異なるキーと異なるタイ
プを持っている場合があります。

その場合、ポートのタイプとパラメータのキーの名前を変更する必要があります。[このページ](../../external/aravis/arv-tools#list-the-available-genicam-features)を確認して、使用可能なフィーチャをリス 
トする方法を確認してください。
```python
gain_p = Port('gain', Type(<TypeCode>, <Size of the data type>, 1), 1)
exposuretime_p = Port('exposuretime', Type(<TypeCode>, <Size of the data type>, 1), 1)

gain_key = Param('gain_key', <name of the feature to control gain>)
exposure_key = Param('exposure_key', <name of the feature to control exposure time>)
```
::::

これで、ポートとパラメータを指定してBBをパイプラインに追加できます。

```python
# パイプラインにノードを追加
node = builder.add(bb_name)\
    .set_port([dispose_p, gain_p, exposuretime_p, ])\
    .set_param([pixel_format_ptr, gain_key, exposure_key, ])
output_p = node.get_port('output')
```

これがパイプラインのBBとポートを持つ構造です：

![tutorial1-pipeline](../img/tutorial1-pipeline.png)

入力値を渡し、ポートから出力データを取得するために、入力および出力用にバッファを準備し、バッフ 
ァをポートにマッピングします。

```python
# 入力ポートのHalideバッファの作成
gain_data = np.array([48.0])
exposure_data = np.array([100.0])

gains = Buffer(Type(TypeCode.Float, 64, 1), (1,))
exposures = Buffer(Type(TypeCode.Float, 64, 1), (1,))
gains.write(gain_data.tobytes(order='C'))
exposures.write(exposure_data.tobytes(order='C'))

# 出力ポートのHalideバッファの作成
outputs = []
output_size = (width, height, )
outputs.append(Buffer(Type(TypeCode.Uint, depth_of_buffer, 1), output_size))

# I/Oポートの設定
port_map = PortMap()
port_map.set_buffer(gain_p, gains)
port_map.set_buffer(exposuretime_p, exposures)
port_map.set_buffer_array(output_p, outputs)
port_map.set_u1(dispose_p, False)
```

ここでの `output_size` は2Dイメージ用に設計されています。ピクセルフォーマットがRGB8の場合、カラ
ーチャンネルを追加するために `(width, height, 3)` を設定する必要があります。

`depth_of_buffer` はビット単位のピクセルサイズで、例えばMono8およびRGB8の場合は `8` 、Mono10お 
よびMono12の場合は `16` です。

### パイプラインの実行

パイプラインは実行の準備ができました。

チュートリアルコードでは、入力ポートにマッピングされるゲインおよび露光時間の値はオプションです 
が、デバイスを破棄するには実行中に `False` に設定し、プログラムの実行が終了したら `True` に設定 
する必要があります。これにより、デバイスが安全に閉じられます。

```python
for x in range(loop_num):
    port_map.set_u1(dispose_p, x==loop_num-1)
    # builderを実行
    builder.run(port_map)
```

動的なポートを設定した後、`builder.run`を使用してパイプラインを実行します。

### OpenCVで表示

出力データ（すなわち画像データ）がBuffer `outputs`にマッピングされているため、これをOpenCVバッ 
ファにコピーして画像処理または表示を行うことができます。

注意: OpenCVはバッファ上のチャネル（次元）の順序が異なります。

```python
buf_size_opencv = (height, width)
output_byte_size = width*height*depth_in_byte
```

`depth_in_byte` はピクセルサイズのバイト単位です。例えば、Mono8およびRGB8の場合は `1` 、Mono10 
およびMono12の場合は `2` です。

先に画像データをバイトバッファにコピーし、次にnumpy配列にコピーして表示します。

```python
output_bytes = outputs[0].read(output_byte_size)

output_np_HxW = np.frombuffer(output_bytes, data_type).reshape(buf_size_opencv)
output_np_HxW *= pow(2, num_bit_shift)

cv2.imshow("A", output_np_HxW)
cv2.waitKey(0)
```

注意: `outputs`はBufferのリストです（複数のデバイスを制御するために`num_device`を`1`より大きく 
することができます）、 `outputs[0]` にアクセスして画像データを取得します。

このプロセスのセットを `for` ループで繰り返すと、カメラデバイスからの連続した画像が表示されます
。

`for` ループの後に画像を表示したウィンドウを破棄することを忘れないでください。

```python
cv2.destroyAllWindows()
```

## 完全なコード

チュートリアルで使用された完全なコードは[こちら](https://github.com/Sensing-Dev/tutorials/blob/v23.11.01/python/tutorial1_display.py)にあります。