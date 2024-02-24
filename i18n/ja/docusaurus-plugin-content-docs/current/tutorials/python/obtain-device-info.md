---
sidebar_position: 2
---

# デバイス情報へのアクセスと表示

このチュートリアルでは、aravis APIを使用してデバイス情報を取得する方法について学びます。       

## 前提条件

* Aravis Python（SDKパッケージに含まれています）
* PyGObject（SDKパッケージに含まれています）

## チュートリアル

### 必要なモジュールをロード

Aravisモジュールを使用するために、まず`$SENSING_DEV_ROOT/bin`（Sensing-Dev SDKをインストールし 
た場所）を追加する必要があります。

```python
import os
os.add_dll_directory(os.path.join(os.environ["SENSING_DEV_ROOT"], "bin"))
```

これで、PyGObjectを使用してAravisモジュールをインポートします。

```python
import gi
gi.require_version("Aravis", "0.8")
from gi.repository import Aravis
```

::::caution
`ImportError: DLL load failed while importing _gi: The specified module could not be found.`が 
表示される場合
* 環境変数 `SENSING_DEV_ROOT` が適切に設定されていません。
* Pythonのバージョンが3.11ではありません。
::::

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
| `Width` | センサーイメージの幅 | 整数 |
| `Height` | センサーイメージの高さ | 整数 |
| `PayloadSize` | センサーから転送されるデータのサイズ | 整数 |
| `PixelFormat` | センサーイメージデータのピクセルフォーマット | 文字列 |

::::tip
これらのフィーチャキーとタイプはemvaによる**SFNC（Standard Features Naming Convention）**で定義
されていますが、一部のデバイスは独自の特徴やキーを持っている場合があります。すべてのアクセス可能
なフィーチャを知るには、`arv-tool-0.8`を使用します。詳細は[利用可能なGenICamフィーチャのリスト](../../external/aravis/arv-tools)を参照してください。
::::

::::caution
`arv-device-error-quark` がエラーを返す場合:
* デバイスにキーがない（`Not found (1)`）：フィーチャキーが正しいか確認してください。詳細は[利 
用可能なGenICamフィーチャのリスト](../../external/aravis/arv-tools)を参照。
* タイプが間違っていた（`Not a ArvGcString (0)`または`Not a ArvGcFlaot (0)`）：フィーチャタイプ
が正しいか確認してください。詳細は[利用可能なGenICamフィーチャのリスト](../../external/aravis/arv-tools)を参照。
::::

### 値の表示

```python
    print("=== device {} information ===========================".format(i))
    print("{0:20s} : {1}".format("Device Model Name", devicemodelname))
    print("{0:20s} : {1}".format("Width", width))
```

すべての`get_*_feature_value`の戻り値は文字列です。

### クローズ

Aravisの以下の関数を使用すると、メモリリークを防ぐためのリソースが解放されます。

```python
Aravis.shutdown()
```

::::tip
Aravis Python APIの代わりに、arv-toolを使用することもできます。詳細は[Aravisからのツール](../../external/aravis/arv-tools.md)を参照してください。
::::

## 完全なコード

import {tutorial_version} from "@site/static/version_const/latest.js"
import GenerateTutorialLink from '@site/static/tutorial_link.js';

<GenerateTutorialLink language="python" tag={tutorial_version} tutorialfile="tutorial0_get_device_info" />
