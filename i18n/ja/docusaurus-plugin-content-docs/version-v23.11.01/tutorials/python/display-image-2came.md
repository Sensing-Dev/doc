---
sidebar_position: 4
---

# 複数のカメラを使用する

このチュートリアルでは、[前のチュートリアル](display-image)に基づいて、ion-kitを使用して2つのカ
メラにアクセスし、それらの画像を取得する方法を学びます。

## 前提条件

* ionpy
* numpy
* OpenCV

```bash
pip3 install -U pip
pip3 install opencv-python
pip3 install numpy
pip3 install "git+https://github.com/fixstars/ion-kit.git@v0.3.5#egg=ionpy&subdirectory=python" 
```

## チュートリアル

### デバイス情報を取得

ionpyで画像を表示するには、デバイスの以下の情報を取得する必要があります。

* 幅
* 高さ
* ピクセルフォーマット

[前のチュートリアル](obtain-device-info.md)または[arv-tool-0.8](../../external/aravis/arv-tools.md)がこれらの値を取得するのに役立ちます。

### パイプラインの構築

BBの構造は[1台のカメラ画像を表示するチュートリアル](display-image)と同じですが、2つのデバイスに
アクセスするためにいくつかの小さな変更が必要です。

`image_io_u3v_cameraN_u<bit-depth>x<dimension>`と呼ばれるBBの `Param` である `num_devices` の `Param` を `2` に設定する必要があります。これにより、ホストマシンに接続された2つのカメラを検出し 
ようとします。

```python
num_device = 2
num_devices = Param('num_devices', str(num_device))
node = builder.add(bb_name)\
    .set_port([dispose_p, gain_p, exposuretime_p, ])\
    .set_param([pixel_format_ptr, gain_key, exposure_key, ])
```

2つのカメラにはそれぞれ `Gain` と `ExposureTime` を設定する必要があるため、データは2要素の配列 
が必要です。バッファのサイズも `(1,)` から `(2,)` に変更されます。

```python
gain_data = np.array([48.0, 24.0])
exposure_data = np.array([100.0, 50.0])
gains = Buffer(Type(TypeCode.Float, 64, 1), (2,))
exposures = Buffer(Type(TypeCode.Float, 64, 1), (2,))
```

これで、2つのカメラにアクセスして制御する準備が整いました。

同様に、出力には2つのカメラが取得する画像を格納するために2つのバッファが必要です。したがって、 
出力 `List` に追加する `Buffer` の数は次の通りです。

```python
outputs = []
output_size = (width, height, )
if pixelformat == "RGB8":
    output_size += (3,)
outputs.append(Buffer(Type(TypeCode.Uint, depth_of_buffer, 1), output_size))
outputs.append(Buffer(Type(TypeCode.Uint, depth_of_buffer, 1), output_size))
```

### パイプラインの実行

パイプラインは今、2つのカメラ向けに設計されているため、`builder.run`は単一カメラのチュートリア 
ルと同じように実行できます。

### OpenCVで表示

`outputs` は2つのバッファを持つ `List` です。それぞれのデータにアクセスするには、角かっこを使用
できます。

```python
output_bytes_image0 = outputs[0].read(output_byte_size)
output_bytes_image1 = outputs[1].read(output_byte_size)
```

各画像のためにnumpy配列を作成する必要があり、処理されたnumpy配列を表示できます。

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

チュートリアルで使用された完全なコードは[こちら](https://github.com/Sensing-Dev/tutorials/blob/v23.11.01/python/tutorial1_display_2cam.py)にあります。