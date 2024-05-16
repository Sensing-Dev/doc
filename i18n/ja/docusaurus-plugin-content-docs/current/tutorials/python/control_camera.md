---
sidebar_position: 5
---

# BBでカメラを制御する

このチュートリアルでは、1つのカメラ画像を表示する[前のチュートリアル](display-image)と[複数のカメラを使用する](display-image-2came)に基づいて、ion-kitでGainおよびExposure timeを手動で設定する方法を学びます。

BBを用いずにGainやExposureTimeなどのカメラ情報を変更するためには、[デバイス情報へのアクセスと設定](./set-device-info) や [arv-tool-0.8](../../external/aravis/arv-tools) を参照してください。


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

### デバイス情報の取得

ionpyを使用して画像を表示するには、デバイスの以下の情報を取得する必要があります。

* 幅
* 高さ
* ピクセルフォーマット

[前回のチュートリアル](obtain-device-info.md)または [arv-tool-0.8](../../external/aravis/arv-tools.md) がこれらの値を取得するのに役立ちます。

### パイプラインの構築

BBの構造は[1台のカメラ画像を表示するチュートリアル](display-image)および[複数のカメラ画像を表示するチュートリアル](display-image-2came)と同じですが、`Gain`および`ExposureTime`の設定を有効にするためにはいくつか小さな変更が必要です。

このチュートリアルでは、`enable_control`を`true`に設定することで`Gain`および`ExposureTime`を手動で設定します。

ポートの入力は動的で、つまり各実行ごとに更新できますが、静的な値をParamを介して文字列で設定できます。たとえば、`Gain`および`ExposureTime`の値は実行ごとに更新されるべきですが、これらの値のキーは静的であるため、次のようにParamで設定できます。

```python
# set params
enable_control = Param('enable_control', 'true')
gain_key = Param('gain_key', 'Gain')
exposure_key = Param('exposure_key', 'ExposureTime')

# set ports
gain_ps = []
exposure_ps = []
for i in range(num_device):
    gain_ps.append(Port('gain' + str(i), Type(TypeCode.Float, 64, 1), 0))
    exposure_ps.append(Port('exposure' + str(i), Type(TypeCode.Float, 64, 1), 0))

gain_values = []
exposure_values = []

for i in range(num_device):
    gain_values.append(40.0)
    exposure_values.append(100.0)

# add enable_control
node = builder.add(bb_name)\
        .set_iport([gain_ps[0], exposure_ps[0]])\
        .set_param([num_devices, frame_sync, realtime_diaplay_mode, enable_control, gain_key, exposure_key]) if num_device == 1 \
        else builder.add(bb_name)\
            .set_iport([gain_ps[0], exposure_ps[0], gain_ps[1], exposure_ps[1]])\
            .set_param([num_devices, frame_sync, realtime_diaplay_mode, enable_control, gain_key, exposure_key])
```

その後、入力値をポートにバインドします。これは出力ポートと出力バッファをバインドするのと類似しています。

```python
# bind gain values and exposuretime vlaues
for i in range(num_device):
    gain_ps[i].bind(gain_values[i])
    exposure_ps[i].bind(exposure_values[i])
```

これで、`Gain`および`ExposureTime`が正常に設定されました！

:::tip v23.11.01 からの変更点
* `set_port`が `set_iport`に名称変更されました。
:::

::::caution
`Gain` および `ExposureTime` はデバイスのゲインと露光時間を制御するためのGenICamのフィーチャキーです。通常、これらはemvaによる**SFNC（Standard Features Naming Convention）**で設定されていますが、一部のデバイスには異なるキーがあるかもしれません。

その場合、パラメータのキーを変更する必要があります。[このページ](../../external/aravis/arv-tools#利用可能なGenICam機能の一覧表示)を参照して、利用可能な機能をリストアップする方法を確認してください。

```python
gain_key = Param('gain_key', <デバイスのゲインを制御するフィーチャの名前>)
exposure_key = Param('exposure_key', <露光時間を制御するフィーチャの名前>)
```
::::

### パイプラインの実行

`builder.run()` を実行してパイプラインを終了します。

### 各実行で入力ポートの値を更新

[前のチュートリアルでは](display-image)、各実行で単に出力画像を表示していました。今回は`Gain`または`ExposureTime`の値を更新します。次の例は、`gain_values`を更新して再バインドすることで、毎回`Gain`を`1.0`ずつ増やす方法を示しています。

```python
while(user_input == -1):
    gain_values[0] += 1.0
    gain_ps[0].bind(gain_values[0])

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

import {tutorial_version} from "@site/static/version_const/latest.js"
import GenerateTutorialLink from '@site/static/tutorial_link.js';

<GenerateTutorialLink language="python" tag={tutorial_version} tutorialfile="tutorial2_control_camera" />
