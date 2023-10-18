---
sidebar_position: 4
---

# 複数のカメラを使用する

このチュートリアルでは、[前のチュートリアル](display-image)をベースに、2つのカメラにアクセスし、それらの画像をion-kitを介して取得する方法を学びます。

## 前提条件

* ionpy
* numpy
* OpenCV

```bash
pip3 install -U pip
pip3 install opencv-python
pip3 install opencv-contrib-python
pip3 install numpy
pip3 install "git+https://github.com/fixstars/ion-kit.git#egg=ionpy&subdirectory=python"
```

## チュートリアル

### デバイス情報の取得

ionpyを使用して画像を表示するには、デバイスの以下の情報を取得する必要があります。

* 幅 (Width)
* 高さ (Height)
* ピクセルフォーマット (PixelFormat)

[前のチュートリアル](obtain-device-info.md)または [arv-tool-0.8](../external/aravis/arv-tools.md) はこれらの値を取得するのに役立ちます。

### パイプラインの構築

BBの構造は[1つのカメラ画像を表示するチュートリアル](display-image)と同じですが、2つのデバイスにアクセスするにはいくつかの小さな変更が必要です。

`image_io_u3v_cameraN_u<bit-depth>x<dimension>` と呼ばれるBBの `Param` である `num_devices` を `2` に設定する必要があります。これにより、ホストマシンに接続された2台のカメラを検出しようとします。

```python
num_device = 2
num_devices = Param('num_devices', str(num_device))
node = builder.add(bb_name)\
    .set_port([dispose_p, gain_p, exposuretime_p, ])\
    .set_param([pixel_format_ptr, gain_key, exposure_key, ])
```

2つのカメラを使用するため、値を `Gain` および `ExposureTime` に設定する必要があります。データは2要素の配列を必要とします。バッファのサイズも `(1,)` から `(2,)` に変更されます。

```python
gain_data = np.array([48.0, 24.0])
exposure_data = np.array([100.0, 50.0])
gains = Buffer(Type(TypeCode.Float, 64, 1), (2,))
exposures = Buffer(Type(TypeCode.Float, 64, 1), (2,))
```

これで、2つのカメラにアクセスおよび制御するための入力が準備されました。

同様に、出力にはBBが取得した2つのカメラ画像を格納する2つのバッファが必要です。したがって、出力 `List` に追加する `Buffer` の数は `2` です。

```python
outputs = []
output_size = (width, height, )
if pixelformat == "RGB8":
    output_size += (3,)
outputs.append(Buffer(Type(TypeCode.Uint, depth_of_buffer, 1), output_size))
outputs.append(Buffer(Type(TypeCode.Uint, depth_of_buffer, 1), output_size))
```

### パイプラインの実行

パイプラインは現在2つのカメラ用に設計されているため、`builder.run` は単一カメラのチュートリアルと同様に実行できます。

### OpenCVで表示

`outputs` は2つのバッファを持つ `List` です。それぞれのデータにアクセスするには角括弧を使用できます。

```python
output_bytes_image0 = outputs[0].read(output_byte_size)
output_bytes_image1 = outputs[1].read(output_byte_size)
```

各画像用のnumpy配列を作成する必要があり、処理されたnumpy配列を表示できます。

```python
output_np_HxW_image0 = np.frombuffer(output_bytes_image0, data_type).reshape(buf_size_opencv)
output_np_HxW_image1 = np.frombuffer(output_bytes_image1, data_type).reshape(buf_size_opencv)
output_np_HxW_image0 *= pow(2, num_bit_shift)
output_np_HxW_image1 *= pow(2, num_bit_shift)

...

cv2.imshow("A", output_np_HxW_image0)
cv2.imshow("B", output_np_HxW_image1)
cv2.waitKey(0)
...
```

## 完全なコード

このチュートリアルで使用される完全なコードは[こちら](https://github.com/Sensing-Dev/tutorials/blob/main/python/tutorial1_display_2cam.py) にあります。