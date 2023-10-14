---
sidebar_position: 2
---

# アクセスとデバイス情報の表示

このチュートリアルでは、aravis APIを使用してデバイス情報を取得する方法について学びます。

## 必要なもの

* Aravis Python (included in SDK package)
* PyGObject (included in SDK package)

## チュートリアル

### 必要なモジュールの読み込み

まず最初に、Aravisモジュールを使用するためにPyGObjectをロードする必要があります。これには、Sensing-Dev SDKをインストールした場所である`$SENSING_DEV_ROOT/bin`を追加する必要があります。

```python
import os
os.add_dll_directory(os.path.join(os.environ["SENSING_DEV_ROOT"], "bin"))
```

次に、PyGObjectを使用してAravisモジュールをインポートします。

```python
import gi
gi.require_version("Aravis", "0.8")
from gi.repository import Aravis
```

:::caution なぜ動作しないのか
「ImportError: DLL load failed while importing _gi: The specified module could not be found.」と表示される場合は、次の可能性が考えられます。
* 環境変数`SENSING_DEV_ROOT`が適切に設定されていない。
* Pythonのバージョンが3.11ではない。
:::

### デバイスへのアクセス

これでAravis APIを使用する準備が整いました。ホストマシンに接続されているU3Vデバイスのリストを更新から始めましょう。

```python
Aravis.update_device_list()
```

リストを更新することで、次のAPIはデバイスの数を返すはずです。

```python
num_device = Aravis.get_n_devices()
```

:::caution なぜ動作しないのか
「num_devices」が「0」の場合、デバイスには次の問題があるかもしれません。
* デバイスが適切にホストマシンに接続されていない。
* デバイスにWinUSBがインストールされていない（Windows）。[スタートアップガイド（Windows）](../startup-guide/windows.mdx)を参照してください。
* Udevルールファイルが`/etc/udev`の下に配置されていない（Linux）。[スタートアップガイド（Linux）](../startup-guide/linux.mdx)を参照してください。
:::

### デバイス情報へのアクセス

「num_device」のデバイスの中から「i」番目のデバイスにアクセスしてカメラオブジェクトを作成します。

以下のように`get_*_feature_value`のAPIを使用してデバイス情報の文字列/整数/浮動小数点値を取得できます。

```python
for i in range(num_device):
    device = Aravis.Camera.new(Aravis.get_device_id(i)).get_device()

    devicemodelname = device.get_string_feature_value("DeviceModelName")
    width = device.get_integer_feature_value("Width")
    ...
    del device
```

U3Vデバイスで定義された一般的なキーの一部の例は、以下の表にリストされています。

| フィーチャー名 | 説明 | タイプ |
| --------   | ------- | ------- |
| `DeviceModelName` | デバイスの名前 | 文字列 |
| `Width` | センサーイメージの幅 | 整数 |
| `Height` | センサーイメージの高さ | 整数 |
| `PayloadSize` | センサーから転送されるデータのサイズ | 整数 |
| `PixelFormat` | センサーイメージデータのピクセルフォーマット | 文字列 |

:::tip
これらのフィーチャーキーとタイプは、emvaによる**SFNC（Standard Features Naming Convention）**で定義されています。ただし、一部のデバイスには固有のユニークなフィーチャーやキーがあります。すべてのアクセス可能なフィーチャーを知るには、「arv-tool-0.8」を使用します。詳細は、[利用可能なGenICamフィーチャー 
のリスト](../external/aravis/arv-tools)を参照してください。
:::

:::caution なぜ動作しないのか
「arv-device-error-quark」がエラーを返す場合：
* デバイスにキーが存在しない（「Not found (1)」）場合は、フィーチャーキーが正しいかどうかを確認してください。詳細は、[利用可能なGenICamフィーチャーのリスト](../external/aravis/arv-tools)を参照してください。
* タイプが誤っている（「Not a ArvGcString (0)」または「Not a ArvGcFloat (0)」）場合は、フィーチャータイプが正しいかどうかを確認してください。詳細は、[利用可能なGenICamフィーチャーのリスト](../external/aravis/arv-tools)を参照してください。
:::

### 値の表示

```python
    print("=== デバイス {} の情報 ===========================".format(i))
    print("{0:20s} : {1}".format("デバイスモデル名", devicemodelname))
    print("{0:20s} : {1}".format("幅", width))
```

`get_*_feature_value`のすべての戻り値は文字列であることに注意してください。

### 閉じる

Aravisの次の関数を使用すると、メモリリークを回避するリソースを解放できます。

```python
Aravis.shutdown()
```

:::tip
Aravis Python APIの代わりに、arv-toolを使用することもできます。詳細については、[Aravisからのツール](../external/aravis/arv-tools.md)を参照してください。
:::

## 完全なコード

このチュートリアルで使用される完全なコードは[こちら](https://github.com/Sensing-Dev/tutorials/blob/main/python/tutorial0_get_device_info.py)です。