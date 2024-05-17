---
sidebar_position: 4
---

# 複数のカメラを使用する

このチュートリアルでは、2つのカメラにアクセスし、ion-kitを使用してそれらの画像を取得する方法を学びます。これは[前回のチュートリアル](display-image)に基づいています。

## 前提条件

* ionpy 
* numpy
* OpenCV

import this_version from "@site/static/version_const/v240104.js"

<pre>
<code class="language-bash">
pip3 install -U pip<br />
pip3 install opencv-python<br />
pip3 install numpy<br />
pip3 install ion-python=={this_version.ion_python_version}<br />
</code>
</pre>

## チュートリアル

### デバイス情報の取得

ionpyを使用して画像を表示するには、デバイスの以下の情報を取得する必要があります。

* 幅
* 高さ
* ピクセルフォーマット

[前回のチュートリアル](obtain-device-info.md)または [arv-tool-0.8](../../external/aravis/arv-tools.md) がこれらの値を取得するのに役立ちます。

### パイプラインの構築

モジュールのインポートとパイプラインのセットアップは、[1台のカメラ画像を表示するチュートリアル](display-image)と同じです。

### BBに2つのカメラへのアクセスを許可

BBの構造は[1台のカメラ画像を表示するチュートリアル](display-image)と同じですが、2つのデバイスにアクセスするためにはいくつか小さな変更が必要です。

BB `image_io_u3v_cameraN_u<bit-depth>x<dimension>` の `num_devices` と呼ばれる `Param` を `2` に設定する必要があります。これにより、ホストマシンに接続されている2つのカメラが検出されます。

```python
num_device = 2
num_devices = Param('num_devices', str(num_device))
node = builder.add(bb_name)\
    .set_param([num_devices, frame_sync, realtime_diaplay_mode, ])
```

これがパイプライン内の唯一のBBであるため、ノードの出力ポートはパイプラインの出力ポートになり、その名前は `output_p` です。

これで、BBは2つのカメラにアクセスして制御する準備が整いました。

同様に、BBが取得する2つのカメラ画像を格納するために、出力に追加する `List` の `Buffer` の数は `2` となります。

```python
outputs = []
output_datas = []
output_size = (height, width, )
if pixelformat == "RGB8":
    output_size += (3,)
for i in range(num_device):
    output_datas.append(np.full(output_size, fill_value=0, dtype=data_type))
    outputs.append(Buffer(array= output_datas[i]))
# I/Oポートの設定
for i in range(num_device):
    output_p[i].bind(outputs[i])
```

### パイプラインの実行

パイプラインは2つのカメラ向けに設計されているため、`builder.run()` は単一カメラのチュートリアルと同じように実行できます。

### OpenCVで表示

`outputs` は2つのバッファを持つ `List` です。各バッファはnumpy配列に格納され、インデックスを使用してアクセスできます（`output_datas[i]`）。

```python
while(user_input == -1):
    # Builderを実行
    builder.run()
    for i in range(num_device):
        output_datas[i] *= coef
        cv2.imshow("img" + str(i), output_datas[i])
    user_input = cv2.waitKeyEx(1)
```

`for` ループ後に画像が表示されたウィンドウを破棄することを忘れないでください。

```python
cv2.destroyAllWindows()
```

## 完全なコード


import {tutorial_version} from "@site/static/version_const/v240104.js"
import GenerateTutorialLink from '@site/static/tutorial_link.js';

<GenerateTutorialLink language="python" tag={tutorial_version} tutorialfile="tutorial1_display_2cam" />
