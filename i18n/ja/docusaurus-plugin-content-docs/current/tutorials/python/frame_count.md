---
sidebar_position: 6
---

# フレーム数の取得

このチュートリアルでは、ion-kitを使用してカメラからフレーム数を取得する方法を学びます。

## 前提条件

* ionpy 
* numpy
* OpenCV

```bash
pip3 install -U pip
pip3 install opencv-python
pip3 install numpy
pip3 install ion-python=1.0
```

## チュートリアル

パイプラインの設定プロセスは、前のチュートリアルとまったく同じです。フレーム数をBBから取得するために、追加の出力ポートとバッファを設定する必要があります。

### フレーム数の取得

画像を表示しながら、フレーム数情報も取得したいと考えています。前のチュートリアルとの唯一の違いは、フレーム数の値を新しいポートにバインドする必要があることです。

```python
fcdata = np.full((1), fill_value=0, dtype=np.uint32)
frame_count = []
for i in range(num_device):
    frame_count.append(Buffer(array=fcdata))
```

### パイプラインの実行

`builder.run()` を実行してパイプラインを終了します。

フレーム数ディレクトリはnumpy array `fcdata` にあるため、次のように各フレーム数をプリントできます。

```python
print(fcdata[0])
```

## 完全なコード

チュートリアルで使用される完全なコードは[こちら](https://github.com/Sensing-Dev/tutorials/blob/main/python/tutorial3_getting_frame_count.py)です。
