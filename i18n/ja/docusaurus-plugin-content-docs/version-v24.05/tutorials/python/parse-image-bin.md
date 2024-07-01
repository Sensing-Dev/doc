---
sidebar_position: 10
---

# 画像バイナリデータの解析

このチュートリアルでは、バイナリ形式の画像データを解析する方法について学びます。

## 前提条件
 
* json
* OpenCV
* numpy

import this_version from "@site/static/version_const/v2405.js"

<pre>
<code class="language-bash">
pip3 install -U pip<br />
pip3 install opencv-python<br />
pip3 install numpy<br />
</code>
</pre>

## チュートリアル

[前のチュートリアル](save-image-bin)で、画像データをバイナリファイルに保存する方法を学びました。今回は、データをロードし、全体のデータを解析、画像を取得します。

### バイナリファイルの構造 

[前のチュートリアル](save-image-bin)で保存されたバイナリデータの構造は次のとおりです:

| バイト数 | 内容         |
|----------|--------------|
| 4        | フレームカウント   |
| w \* h \* d \* c | 画像データ |
| 4        | フレームカウント   |
| w \* h \* d \* c | 4          |
| 4        | フレームカウント   |
| ...      | ...        |
| w \* h \* d \* c | 画像データ |

フレームカウントは4バイト長で、画像データのサイズは幅 * 高さ * バイト深度 * チャンネル数です。

幅と高さの値は &ltprefix>-config.json に保存され、バイナリファイルは前のチュートリアルでパイプラインによって保存されます。

バイト深度とチャンネル数は、同様に &ltprefix>-config.json に記載された PixelFormat から計算できます。

設定ファイルはバイナリファイルと共に `tutorial_save_image_bin_XXXXXXXXXXXXXXXXXX` に保存され、プレフィックスは `image0-` です。

```python
# image info from image0-config.json
f = open(os.path.join(directory_name, prefix + "config.json"))
config = json.loads(f.read())
f.close()

w = config["width"]
h = config["height"]
d = 2 if config["pfnc_pixelformat"] == Mono10 or config["pfnc_pixelformat"] == Mono12 \
    else 1
c = 3 if config["pfnc_pixelformat"] == RGB8 or config["pfnc_pixelformat"] == BGR8 \
    else 1
framesize = w * h * d * c
```

### バイナリファイルを探す。   

前のチュートリアルで保存されたバイナリファイルを使用する場合、ディレクトリの名前は `tutorial_save_image_bin_XXXXXXXXXXXXXXXXXX` で、バイナリファイルのプレフィックスは `image0-` です。

```python
directory_name = "tutorial_save_image_bin_XXXXXXXXXXXXXXXXXX"
prefix = "gendc0-"
```

次のスニペットでは、指定されたプレフィックスで始まるすべてのバイナリファイルをディレクトリから取得し、記録された順に並べ替えます。

```python
bin_files = [f for f in os.listdir(directory_name) if f.startswith(prefix) and f.endswith(".bin")]
bin_files = sorted(bin_files, key=lambda s: int(s.split('-')[-1].split('.')[0]))
```

そして、すべての順序付けされたバイナリファイルを for ループで処理します。

```python
for bf in bin_files:
```

### バイナリファイルを開いて読み込む。  

for ループでは、対象の（単一の）バイナリファイルは `bf` です。このバイナリファイルを `ifs` として開き、`itf` の内容全体を読み取ります。

```python
bin_file = os.path.join(directory_name, bf)

with open(bin_file, mode='rb') as ifs:
    filecontent = ifs.read()
```

### バイナリファイルを解析する

最後に、各バイナリファイルを解析します。

フレームカウントのサイズが 4 バイトであり、これは 32 ビット整数のサイズです。filecontent からフレームカウントへのデータを 4 バイトコピーします。

```python
cursor = 0
while cursor < len(filecontent):
    framecount = struct.unpack('I', filecontent[cursor:cursor+4])[0]
    print(framecount)
    ...
```

画像データはフレームカウントに続きます。したがってオフセットは `+4` で、データサイズは `width * height * byte-depth * num-color-channel` です。

```python
np_dtype = np.uint8 if d == 1 else np.uint16
while cursor < len(filecontent):
    image = np.frombuffer(filecontent[cursor+4:cursor+4+framesize], dtype=np_dtype).reshape((h, w))

    ...
    cv2.imshow("First available image component", image)
    cv2.waitKey(1)
```

これで OpenCV の imshow が画像のプレビューを表示できます。

次のフレームカウントと画像データに移るために、カーソルをシフトするのを忘れないでください。

```
cursor = cursor + 4 + framesize
```

## 完全なコード

import {tutorial_version} from "@site/static/version_const/v2405.js"
import GenerateTutorialLink from '@site/static/tutorial_link.js';

<GenerateTutorialLink language="python" tag={tutorial_version} tutorialfile="tutorial5_parse_image_bin_data" />
```
