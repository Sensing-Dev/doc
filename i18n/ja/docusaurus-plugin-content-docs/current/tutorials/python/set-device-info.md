---
sidebar_position: 2
---

# デバイス情報へのアクセスと設定

このチュートリアルでは、Aravis APIを使用してデバイス情報を設定する方法を学びます。

## チュートリアル

前回のチュートリアルで、Aravis APIを使用してデバイス情報を取得する方法を学びました（[前回のチュートリアル](./obtain-device-info)）。

いくつかのGenICamの機能、たとえば**Gain**や**ExposureTime**は書き込み可能ですので、これらの値を変更してカメラを制御しましょう。

### 必要なモジュールを読み込む

モジュールの読み込みプロセスは前回のチュートリアルとまったく同じです。詳細は[デバイス情報へのアクセスと表示](./obtain-device-info)を参照してください。

### デバイスへのアクセス

デバイスへのアクセスのAPIは前回のチュートリアルとまったく同じです。詳細は[デバイス情報へのアクセスと表示](./obtain-device-info)を参照してください。

### デバイスの現在の値を取得する

最初に、`Gain`と`ExposureTime`の現在の値を知りたいです。前回のチュートリアルで学んだように、カメラを開いた後に`get_float_feature_value`を使用してカメラ情報を取得します。

```python
for i in range(num_device):
    device = Aravis.Camera.new(Aravis.get_device_id(i)).get_device()
    ...
    current_gain = device.get_float_feature_value("Gain")
    current_exposuretime = device.get_float_feature_value("ExposureTime")
    ...
    del device
```

U3Vデバイスで定義された一般的なキーの例は以下の表にリストされています。

| フィーチャー名 | 説明 | タイプ |
| --------   | ------- | ------- |
| `Gain` | 画像センサのゲイン | Double |
| `ExposureTime` | 画像センサの露光時間 | Double | 

:::tip
これらのフィーチャーキーとタイプはemvaによる**SFNC（標準フィーチャー命名規約）**で定義されていますが、一部のデバイスには固有の機能、キー、またはタイプがあるかもしれません。すべてのアクセス可能なフィーチャを知るには、`arv-tool-0.8`を使用します。詳細は[利用可能なGenICam機能の一覧表示](../../external/aravis/arv-tools)を参照してください。

一般的な名前（例）：
* `Gain`の代わりに、`GainRaw`または`GainAbs`かもしれません。
* `ExposureTime`の代わりに、`ExposureTimeBaseAbs`または`ExposureTimeRaw`かもしれません。

一般的な型（例）：
* もし`Gain`や`ExposureTime`の型がDoubleではなくIntegerの場合、`get_float_feature_value`の代わりに`get_integer_feature_value`かもしれません。
:::

:::caution なぜ動作しないのか
もし`arv-device-error-quark`がエラーを返す場合：
* デバイスにキーがないかもしれません（`Not found (1)`）：フィーチャキーが正しいかどうか確認してください。詳細は[利用可能なGenICam機能の一覧表示](../../external/aravis/arv-tools)を参照してください。
* タイプが間違っていた場合（`Not a ArvGcFlaot (0)`）：フィーチャタイプが正しいかどうか確認してください。タイプが整数の場合、APIは`get_integer_feature_value`でなければなりません。詳細は[利用可能なGenICam機能の一覧表示](../../external/aravis/arv-tools)を参照してください。
:::

### デバイスの現在の値を設定する

さて、`set_float_feature_value`のAPIを使用してGainとExposureTimeの値を更新しましょう：

```python
    new_gain = current_gain + 10.0
    new_exposuretime = current_exposuretime + 10.0

    device.set_float_feature_value("Gain", new_gain)
    device.set_float_feature_value("ExposureTime", new_exposuretime)
```

値が実際に更新されたかどうかを確認するには、再びデバイス情報をロードします。

```python
    current_gain = device.get_float_feature_value("Gain")
    current_exposuretime = device.get_float_feature_value("ExposureTime")
```

### クローズ

Aravisの次の関数を使用すると、メモリリークを回避するためにリソースを解放できます。

```python
Aravis.shutdown()
```

:::tip
Aravis Python APIの代わりに、arv-toolも使用できます。詳細は[Aravisのツール](../../external/aravis/arv-tools.md)を参照してください。
:::

## 完全なコード

import {tutorial_version} from "@site/static/version_const/latest.js"
import GenerateTutorialLink from '@site/static/tutorial_link.js';

<GenerateTutorialLink language="python" tag={tutorial_version} tutorialfile="tutorial0_set_device_info" />