---
sidebar_position: 4
---

# 画像の表示

このチュートリアルでは、ion-kitを使用してデバイスから画像データを取得し、OpwnCVを使って表示する方法を学びます。

## 必要なもの

* ionpy 
* numpy
* OpenCV

```bash
pip3 install -U pip
pip3 install opencv-python
pip3 install numpy
pip3 install ion-python
```

## チュートリアル

### デバイス情報の取得

ionpyを使用して画像を表示するには、デバイスの以下の情報を取得する必要があります。

* 幅
* 高さ
* PixelFormat

[前回のチュートリアル](obtain-device-info.md)または[arv-tool-0.8](../../external/aravis/arv-tools.md)がこれらの値を取得するのに役立ちます。

### パイプラインの構築

まず最初に、ion-kitのpythonバインディングであるionpyのモジュールをロードします。

```python
from ionpy import Node, Builder, Buffer, PortMap, Port, Param, Type, TypeCode
```

:::caution why it does not work
Pythonユーザーの場合、C/C++ランタイムライブラリがない可能性があります。ionpyのモジュールをロードするのに問題がある場合は、[Microsoft公式ウェブページの記事](https://learn.microsoft.com/en-us/cpp/windows/latest-supported-vc-redist?view=msvc-160#visual-studio-2015-2017-2019-and-2022)からライブラリをインストールできます。
:::

[前回の紹介](../intro.mdx)で学んだように、画像のI/Oと処理のためにパイプラインを構築して実行します。

このチュートリアルでは、U3Vカメラから画像を取得する唯一のビルディングブロックを持つ非常に単純なパイプラインを構築します。

次のionpy APIでパイプラインを設定します。

```python
# パイプラインのセットアップ
builder = Builder()
builder.set_target('host')
builder.with_bb_module('ion-bb')
```

`set_target`は、Builderによって構築されたパイプラインが実行されるハードウェアを指定します。

`ion-bb.dll`で定義されたBBを使用するためには、`with_bb_module`関数でモジュールをロードする必要があります。

使用するBBは`image_io_u3v_cameraN_u8x2`で、これは各ピクセルデータの深度が8ビットで、2次元のU3Vカメラ向けに設計されています。例えば、Mono8です。

ピクセルフォーマットがMono10またはMono12の場合、各ピクセルデータの深度が16ビットであるため、`image_io_u3v_cameraN_u16x2`が必要です。

ピクセルフォーマットがRGB8の場合、深度が8で次元が3（幅と高さに加えてカラーチャンネルがある）であるため、`image_io_u3v_cameraN_u8x3`を使用します。

| BBの名前 | ビット深度 | 次元 | `PixelFormat`の例 |
| --------   | ------- | ------- | ------- |
| `image_io_u3v_cameraN_u8x2` | 8 | 2 | `Mono8` |
| `image_io_u3v_cameraN_u8x3` | 8 | 3 |  `RGB8`, `BGR8` |
| `image_io_u3v_cameraN_u16x2` | 16 | 2 | `Mono10`, `Mono12` |

BBに設定するために静的な入力値を設定するには、次のように`Param`を定義する必要があります。

```python
# パラメータの設定
num_devices = Param('num_devices', str(num_device))
frame_sync = Param('frame_sync', 'false')
realtime_diaplay_mode = Param('realtime_diaplay_mode', 'true')
```

| Paramのキー | 値のタイプ | 説明 |
| --------   | ------- | ------- |
| `num_devices` | Integer | プログラムで使用するデバイスの数 |
| `frame_sync` | Boolean | デバイスの数が1より多い場合、デバイス間のフレームカウントを同期します |
| `realtime_diaplay_mode` | Boolean | フレームドロップを許可しますが、遅延はありません |

これで、ノードにポートとパラメータを持つBBをパイプラインに追加できます。

```python
# パイプラインにノードを追加
node = builder.add(bb_name)\
    .set_param([num_devices, frame_sync, realtime_diaplay_mode, ])
output_p = node.get_port('output')
```

これが私たちのパイプラインの唯一のBBであるため、ノードの出力ポートはパイプラインの出力ポートになります。そして、それを`output_p`と名前を付けます。

私たちのBBとポートを持つパイプラインは次のようになります：

![tutorial1-pipeline](../img/tutorial1-pipeline.png)

ポートから出力データを取得するために、出力のためのバッファを準備し、ポートを出力用のバッファにバインドします。

```python
# 出力ポート用のHalideバッファを作成
output_size = (height, width, )
if pixelformat == "RGB8":
    output_size += (3,)
output_data = np.full(output_size, fill_value=0, dtype=data_type)
output = []
output.append(Buffer(array= output_data))

# I/Oポートの設定
output_p.bind(output)
```

ここでの`output_size`は2D画像用に設計されています。ピクセルフォーマットがRGB8の場合、色チャンネルを追加するために`(width, height, 3)`を設定する必要があります。

### パイプラインの実行

パイプラインは実行の準備ができています。`run()`を呼び出すたびに、バッファ`output`は出力画像を受け取ります。

```python
builder.run()
```

### OpenCVで表示

出力ポートがバッファ`output`にバインドされている間、出力データ（つまり画像データ）はnumpy配列（`output_data`）に格納されます。

OpenCVはnumpy配列を扱うことができるため、`cv2.imshow("img", output_data)`を使用して出力画像を表示できます。

ただし、ピクセルフォーマットの深度がnumpy配列の深度（例：`Mono10`または`Mono12`）と一致しない場合は、データをいくつかのビットシフトで調整する必要があります。そうしないと、取得した画像がはるかに暗く見える可能性があります。

```python
coef = pow(2, num_bit_shift)
output_data *= coef
cv2.imshow("img", output_data)
```

連続した画像を取得するには、`cv2.waitKeyEx(1)`を使用してwhileループを設定できます。これにより、プログラムが1ミリ秒間保持され、ユーザー入力があると非-1の値が返されます。以下のコードは、ユーザーが任意のキーを入力するまで無限にループします。

```python
coef = pow(2, num_bit_shift)
user_input = -1

while(user_input == -1):
    # ビルダーの実行
    builder.run()
    output_data *= coef

    cv2.imshow("img", output_data)
    user_input = cv2.waitKeyEx(1)
```

`while`ループの後に画像を表示したウィンドウを破棄することを忘れないでください。

```python
cv2.destroyAllWindows()
```

## 完全なコード

このチュートリアルで使用される完全なコードは[こちら](https://github.com/Sensing-Dev/tutorials/blob/main/python/tutorial1_display.py)
