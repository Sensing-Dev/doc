---
sidebar_position: 2
---

# デバイス情報へのアクセスと表示

このチュートリアルでは、Aravis APIを使用してデバイス情報を取得する方法について学びます。       

## 前提条件

* Aravis（SDKパッケージに含まれています）

## チュートリアル

### 必要なモジュールをロード

Aravisモジュールを使用するためには、 `arv.h`（インストールしたSDKに含まれています）というヘッダ
ーファイルを含める必要があります。

```c++
#include <exception>
#include <iostream>
#include "arv.h"
```

エラーメッセージをキャッチするために例外とiostreamヘッダーを含めるのも良いアイデアです。       

### デバイスへのアクセス

これでAravis APIを使用する準備が整いました。まず、ホストマシンに接続されているU3Vデバイスのリス
トを更新します。

```c++
arv_update_device_list ();
```

リストを更新することで、以下のAPIがデバイスの数を返すはずです。

```c++
unsigned int n_devices = arv_get_n_devices ();
```

::::caution
`n_devices` が `0` の場合、デバイスには以下の問題がある可能性があります。
* デバイスが適切にホストマシンに接続されていない。
* デバイスにWinUSBがインストールされていない（Windows）。[スタートアップガイド（Windows）](../../startup-guide/windows.mdx)を参照。
* Udevルールファイルが `/etc/udev` に配置されていない（Linux）。[スタートアップガイド（Linux）](../../startup-guide/linux.mdx)を参照。
::::

### デバイス情報へのアクセスと表示

`n_devices` のデバイスのうち、 `i` 番目のデバイスにアクセスしてカメラオブジェクトを作成します。

`arv_device_get_*_feature_value` のAPIを使用してデバイス情報の文字列/整数/浮動小数点数の値を取 
得できます。

```c++
for (unsigned int i = 0; i < n_devices; ++i){
    const char* dev_id = arv_get_device_id (i);
    ArvDevice* device = arv_open_device(dev_id, nullptr);

    printf("%20s : %s\n",
        "Device Model Name",
        arv_device_get_string_feature_value(device, "DeviceModelName", &error));
    if (error){
        throw std::runtime_error(error->message);
    }
    printf("%20s : %li\n",
        "Width",
        arv_device_get_integer_feature_value(device, "Width", &error));
            if (error){
        throw std::runtime_error(error->message);
    }
    ...
    g_object_unref (device);
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
なフィーチャを知るには、`arv-tool-0.8`を使用します。詳細は[利用可能なGenICamフィーチャのリスト](../external/aravis/arv-tools)を参照してください。
::::

::::caution
`arv-device-error-quark` がエラーを返す場合:
* デバイスにキーがない（`Not found (1)`）：フィーチャキーが正しいか確認してください。詳細は[利 
用可能なGenICamフィーチャのリスト](../external/aravis/arv-tools)を参照。
* タイプが間違っていた（`Not a ArvGcString (0)`または`Not a ArvGcFlaot (0)`）：フィーチャタイプ
が正しいか確認してください。詳細は[利用可能なGenICamフィーチャのリスト](../external/aravis/arv-tools)を参照。
::::

### クローズ

Aravisの以下の関数を使用すると、メモリリークを防ぐためのリソースが解放されます。

```c++
g_object_unref (device);
```

::::tip
Aravis Python APIの代わりに、arv-toolを使用することもできます。詳細は[Aravisからのツール](../../external/aravis/arv-tools.md)を参照してください。
::::

## 完全なコード

チュートリアルで使用された完全なコードは[こちら](https://github.com/Sensing-Dev/tutorials/blob/v23.11.01/cpp/src/tutorial0_get_device_info.cpp)にあります。

プログラムをコンパイルおよびビルドするために[こちら](https://github.com/Sensing-Dev/tutorials/blob/v23.11.01/cpp/CMAKELists.txt)で提供されているCMakeLists.txtを使用できます。