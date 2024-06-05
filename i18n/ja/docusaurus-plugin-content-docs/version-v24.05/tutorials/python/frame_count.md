---
sidebar_position: 6
---

# フレーム数の取得

このチュートリアルでは、ion-kitを使用してカメラからフレーム数を取得する方法を学びます。

## 前提条件

* ionpy 
* numpy
* OpenCV

import this_version from "@site/static/version_const/latest.js"

<pre>
<code class="language-bash">
pip3 install -U pip<br />
pip3 install opencv-python<br />
pip3 install numpy<br />
pip3 install ion-python=={this_version.ion_python_version}<br />
</code>
</pre>

## チュートリアル

パイプラインの設定プロセスは、前のチュートリアルとまったく同じです。フレーム数をBBから取得するために、追加の出力ポートとバッファを設定する必要があります。

### フレーム数の取得

画像を表示しながら、フレーム数情報も取得したいと思います。前のチュートリアルとの唯一の違いは、フレーム数の値を新しいポートにバインドする必要があることです。

```python
fcdatas = []
frame_counts = []
for i in range(num_device):
    fcdatas.append(np.zeros(1, dtype=np.uint32))
    frame_counts.append(Buffer(array=fcdatas[i]))
```

### パイプラインの実行

`builder.run()` を実行してパイプラインを終了します。

フレーム数ディレクトリはnumpy array `fcdata` にあるため、次のように`i`番目のセンサのframecountをプリントできます。

```python
print(fcdatas[i][0], end=" ")
```
## 完全なコード

import {tutorial_version} from "@site/static/version_const/latest.js"
import GenerateTutorialLink from '@site/static/tutorial_link.js';

<GenerateTutorialLink language="python" tag={tutorial_version} tutorialfile="tutorial3_getting_frame_count" />