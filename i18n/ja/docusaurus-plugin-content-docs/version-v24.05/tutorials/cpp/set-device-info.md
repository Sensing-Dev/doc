---
sidebar_position: 3
---

# デバイス情報へのアクセスと設定

このチュートリアルでは、Aravis APIを使用してデバイス情報を設定する方法を学びます。

## 前提条件

* Aravis（SDKパッケージに含まれています）
* GObject（SDKパッケージに含まれています）

## チュートリアル

[前回のチュートリアル](./obtain-device-info)でAravis APIを使用してデバイス情報を取得する方法を学びました。

一部のGenICamの機能、たとえば**Gain**と**ExposureTime**は書き込み可能ですので、これらの値を変更してカメラを制御しましょう。

### 必要なモジュールの読み込み

aravisヘッダーを含めるプロセスは、前回のチュートリアルとまったく同じです。詳細は[デバイス情報へのアクセスと表示](./obtain-device-info)を参照してください。

### デバイスへのアクセス

デバイスへアクセスするためのAPIは、前回のチュートリアルとまったく同じです。詳細は[デバイス情報へのアクセスと表示](./obtain-device-info)を参照してください。

### デバイスの現在の値の取得

最初に、`Gain`と`ExposureTime`の現在の値を知りたいです。前回のチュートリアルで学んだように、カメラを開いた後に`arv_device_get_float_feature_value`を使用してカメラ情報を取得します。

```c++
for (unsigned int i = 0; i < n_devices; ++i){
    const char* dev_id = arv_get_device_id (i);
    ArvDevice* device = arv_open_device(dev_id, nullptr);

    double current_gain = arv_device_get_float_feature_value(device, "Gain", &error);
    if (error){
        throw std::runtime_error(error->message);
    }
    printf("%20s : %lf\n", "Gain", current_gain);
    
    double current_exposuretime = arv_device_get_float_feature_value(device, "ExposureTime", &error);
    if (error){
        throw std::runtime_error(error->message);
    }
    printf("%20s : %lf\n", "ExposureTime", current_exposuretime);
    ...
    g_object_unref (device);
}
```

U3Vデバイスで定義された一般的なキーのいくつかは、以下の表にリストされています。

| Feature Name | Description | Type |
| --------   | ------- | ------- |
| `Gain` | 画像センサのゲイン | Double |
| `ExposureTime` | 画像センサの露光時間 | Double | 

:::tip
これらのフィーチャキーとタイプは、emvaによる**SFNC（Standard Features Naming Convention）**で定義されています。ただし、一部のデバイスには独自のフィーチャ、キー、またはタイプがあるかもしれません。すべてのアクセス可能なフィーチャを知るには、`arv-tool-0.8`を使用してください。詳細は[利用可能なGenICam機能の一覧表示](../../external/aravis/arv-tools)を参照してください。

一般的な名前（例）：
* `Gain`の代わりに、`GainRaw`または`GainAbs`があるかもしれません。
* `ExposureTime`の代わりに、`ExposureTimeBaseAbs`または`ExposureTimeRaw`があるかもしれません。

一般的なタイプ（例）：
* `Gain`または`ExposureTime`のタイプが整数の場合は`arv_device_get_float_feature_value`の代わりに、`arv_device_get_integer_feature_value`があるかもしれません。
:::

:::caution 動作しない理由
`arv-device-error-quark`がエラーを返す場合：
* デバイスにキーがない（`Not found (1)`）：フィーチャキーが正しいかどうかを確認してください。詳細は[利用可能なGenICam機能の一覧表示](../../external/aravis/arv-tools)を参照してください。
* タイプが間違っていた（`Not a ArvGcString (0)`または`Not a ArvGcFlaot (0)`）：フィーチャのタイプが正しいかどうかを確認してください。詳細は[利用可能なGenICam機能の一覧表示](../../external/aravis/arv-tools)を参照してください。
:::

### デバイスの現在の値の設定

さて、`arv_device_set_float_feature_value`のAPIを使用して、GainとExposureTimeの値を更新しましょう。

```c++
double new_gain = current_gain + 10.0;
arv_device_set_float_feature_value(device, "Gain", new_gain, &error);
if (error){
    throw std::runtime_error(error->message);
}

double new_exposuretime = current_exposuretime + 20.0;
arv_device_set_float_feature_value(device, "ExposureTime", new_exposuretime, &error);
if (error){
    throw std::runtime_error(error->message);
}
```

実際に値が更新されたかどうかを、デバイス情報を再度読み込むことで確認できます。

```c++
current_gain = arv_device_get_float_feature_value(device, "Gain", &error);
if (error){
    throw std::runtime_error(error->message);
}
printf("%20s : %lf\n", "Gain", current_gain);

current_exposuretime = arv_device_get_float_feature_value(device, "ExposureTime", &error);
if (error){
    throw std::runtime_error(error->message);
}
printf("%20s : %lf\n", "ExposureTime", current_exposuretime);
```

### クローズ

Aravisの次の関数を使用すると、メモリリークを回避するためにリソースが解放されます。

```c++
g_object_unref (device);
```

:::tip
Aravis APIの代わりに、arv-toolも使用できます。詳細は[Aravisのツール](../../external/aravis/arv-tools.md)を参照してください。
:::

## 完全なコード

import {tutorial_version} from "@site/static/version_const/v240505.js"
import GenerateTutorialLink from '@site/static/tutorial_link.js';

<GenerateTutorialLink language="cpp" tag={tutorial_version} tutorialfile="tutorial0_set_device_info" />
