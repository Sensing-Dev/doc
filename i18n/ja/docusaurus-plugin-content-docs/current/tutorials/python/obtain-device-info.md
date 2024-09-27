---
sidebar_position: 1
---

import this_version from "@site/static/version_const/latest.js"

# デバイス情報へのアクセスと表示

このチュートリアルでは、Aravis APIを使用してデバイス情報を取得する方法について学びます。


## チュートリアル

### 依存ライブラリのインストール

#### Windows

Sensing-Devから提供されるAravis Pythonモジュールを使用するのにPyGObjectが必要となります。

<pre>
<code class="language-powershell">
Invoke-WebRequest -Uri {this_version.windows_pygobject_url}  -OutFile pygobject_installer.ps1 -Verbose; powershell.exe -ExecutionPolicy Bypass -File ./pygobject_installer.ps1
</code>
</pre>

上記の実行により、下記でインストールするAravis Pythonが使用可能になります。

<pre>
<code class="language-powershell">
pip3 install aravis-python
</code>
</pre>

#### Linux

Sensing-Devから提供されるAravis Pythonモジュールを使用するのにPycairoとPyGObjectが必要となります。

```
sudo apt install libgirepository1.0-dev gcc libcairo2-dev pkg-config python3-dev gir1.2-gtk-4.0
pip3 install pycairo
pip3 install PyGObject
``` 

上記の実行により、下記でインストールするAravis Pythonが使用可能になります。

<pre>
<code class="language-powershell">
pip3 install aravis-python
</code>
</pre>

### 必要なモジュールをロード

上記の依存ライブラリが正しくインストールされている場合、以下の方法でAravisのモジュールが読み込み可能です。

```python
from aravis import Aravis
```

### デバイスへのアクセス

これでAravis APIを使用する準備が整いました。まず、ホストマシンに接続されているU3Vデバイスのリス
トを更新します。

```python
Aravis.update_device_list()
```

リストを更新することで、以下のAPIがデバイスの数を返すはずです。

```python
num_device = Aravis.get_n_devices()
```

::::caution
`num_devices` が `0` の場合、デバイスには以下の問題がある可能性があります。
* デバイスが適切にホストマシンに接続されていない。
* デバイスにWinUSBがインストールされていない（Windows）。[スタートアップガイド（Windows）](../../startup-guide/windows.mdx)を参照。
* Udevルールファイルが `/etc/udev` に配置されていない（Linux）。[スタートアップガイド（Linux）](../../startup-guide/linux.mdx)を参照。
::::

### デバイス情報へのアクセス

`num_device` のデバイスのうち、 `i` 番目のデバイスにアクセスしてカメラオブジェクトを作成します 
。

`get_*_feature_value` のAPIを使用してデバイス情報の文字列/整数/浮動小数点数の値を取得できます。

```python
for i in range(num_device):
    device = Aravis.Camera.new(Aravis.get_device_id(i)).get_device()

    devicemodelname = device.get_string_feature_value("DeviceModelName")
    width = device.get_integer_feature_value("Width")
    ...
    del device
```

一般的なU3Vデバイスで定義された一部のキーの例は、以下の表にリストされています。

| フィーチャ名 | 説明 | タイプ |
| --------   | ------- | ------- |
| `DeviceModelName` | デバイスの名前 | 文字列 |
| `Width` | センサイメージの幅 | 整数 |
| `Height` | センサイメージの高さ | 整数 |
| `PayloadSize` | センサから転送されるデータのサイズ | 整数 |
| `PixelFormat` | センサイメージデータのピクセルフォーマット | 文字列 |

::::tip
これらのフィーチャキーとタイプはemvaによる**SFNC（Standard Features Naming Convention）**で定義
されていますが、一部のデバイスは独自のフィーチャやキーを持っている場合があります。すべてのアクセス可能なフィーチャを知るには、`arv-tool-0.8`を使用します。詳細は[利用可能なGenICam機能のリスト](../../external/aravis/arv-tools)を参照してください。
::::

::::caution
`arv-device-error-quark` がエラーを返す場合:
* デバイスにキーがない（`Not found (1)`）：フィーチャキーが正しいか確認してください。詳細は[利用可能なGenICam機能の一覧表示](../../external/aravis/arv-tools)を参照。
* タイプが間違っていた（`Not a ArvGcString (0)`または`Not a ArvGcFlaot (0)`）：フィーチャタイプが正しいか確認してください。詳細は[利用可能なGenICam機能の一覧表示](../../external/aravis/arv-tools)を参照。
::::

### 値の表示

```python
    print("=== device {} information ===========================".format(i))
    print("{0:20s} : {1}".format("Device Model Name", devicemodelname))
    print("{0:20s} : {1}".format("Width", width))
```

すべての`get_*_feature_value`の戻り値は文字列です。

### クローズ

Aravisの以下の関数を使用すると、メモリリークを防ぐためにリソースが解放されます。

```python
Aravis.shutdown()
```

::::tip
Aravis Python APIの代わりに、arv-toolを使用することもできます。詳細は[Aravisのツール](../../external/aravis/arv-tools.md)を参照してください。
::::

## 完全なコード

import {tutorial_version} from "@site/static/version_const/latest.js"
import GenerateTutorialLink from '@site/static/tutorial_link.js';

<GenerateTutorialLink language="python" tag={tutorial_version} tutorialfile="tutorial0_get_device_info" />
