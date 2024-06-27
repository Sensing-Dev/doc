# Aravisのツール

**Aravis**、カメラ取得ライブラリ、はU3Vカメラへのアクセスと制御に使用できるいくつかのシンプルなツールを提供しています。

| 名前 | 説明 | 注釈 |
| --------   | ------- | ------- |
| arv-tool-0.8 | デバイスへのアクセスとGenICam機能の制御* |
| arv-camera-test-0.8 | デバイスからのストリーミングデータの取得 |
| arv-viewer-0.8 | デバイスからの画像データの表示 | Linux専用|

## GenICam機能の制御

`arv-tool-0.8`は、デバイスにアクセスし、GenICam機能の値を読み取り/書き込みできるようにします。**GenICam標準**について詳しく知りたい場合は、[このページ](../../lessons/camera)をご覧ください。

### U3Vデバイスの一覧表示

`arv-tool-0.8`コマンドを使用すると、すべてのカメラデバイスが表示され、U3Vカメラは`<カメラの名前> (USB)`と表示されます。

```bash title="arv-tool-0.8"
$ arv-tool-0.8 
Basler-26760158A14A-22585674 (USB3)
```

:::caution 動作しない理由
`arv-tool-0.8`コマンドが動作しない場合、次の理由が考えられます。
* **環境変数** `PATH` が正しく設定されていない（Windows）。
* デバイスが**SS USB**ポートに接続されていない。
:::

### 利用可能なGenICam機能の一覧表示

多くのU3Vカメラは、EMVAによって定義された標準機能命名規則（SFNC）に従っていますが、一部のデバイスにはデバイス固有の機能がある場合があります。 `arv-tool-0.8`の`features`オプションを使用すると、各カメラのすべての利用可能な機能が表示されます。 `-n`は対象デバイスを選択するためのもので、続けてデバイス名を指定します。

```bash title="arv-tool-0.8 -n <camera name> features"
$ arv-tool-0.8 -n "Basler-26760158A14A-22585674" features
Category    : 'Root'
    Category    : 'AnalogControl'
        Enumeration  : [RW] 'GainSelector'
            * Gain
    ...
    Category    : 'ImageFormatControl'
        Integer      : [RO] 'SensorWidth'
        Integer      : [RO] 'SensorHeight'
        IntReg       : [RO] 'WidthMax'
        IntReg       : [RO] 'HeightMax'
        Integer      : [RW] 'Width'
        Integer      : [RW] 'Height'
        ...
        Enumeration  : [RW] 'PixelFormat'
            EnumEntry   : 'BayerGR12'
            EnumEntry   : 'BayerGR8'
            EnumEntry   : 'YCbCr422_8'
            EnumEntry   : 'RGB8'
    ...
```

上記の例では、[Basler-26760158A14A-22585674](https://www.baslerweb.com/en/products/cameras/area-scan-cameras/dart/daa1280-54uc-cs-mount/)は*Gain*および*PixelFormat*の値を読み書きできます。

:::caution 動作しない理由
`arv-tool-0.8 -n <camera name> features`コマンドが動作しない場合、次の理由が考えられます。
* カメラの名前に括弧 *"(USB)"* が含まれている（含まれてはいけません）。
* カメラの名前にスペースが含まれているが、二重引用符で囲まれていない。
:::

### 値の読み取りと書き込み

一部のGenICam機能の値を知り、設定することは、適切なサイズ、形式、明るさで画像センサデータを取得するために重要です。

`arv-tool-0.8`コマンドに `control` オプションを付けると、機能の値を取得でき、次の例ではカメラのゲインを設定して強度（つまり明るさ）の増幅を制御しようとしています。

```bash title="arv-tool-0.8 -n <camera name> control <feature name>"
$ arv-tool-0.8 -n "Basler-26760158A14A-22585674" control Gain
Gain = 0 dB min:0 max:18.0278
```

今、0dBでは画像が暗すぎると感じるかもしれません。以下のコマンドで10dBに設定できます。

```bash title="arv-tool-0.8 -n <camera name> control <feature name>=<new value>"
$ arv-tool-0.8 -n "Basler-26760158A14A-22585674" control Gain=10
Gain = 9.98343 dB min:0 max:18.0278
```

:::caution 動作しない理由
`arv-tool-0.8 -n <camera name> control`コマンドが動作しない場合、次の理由が考えられます。
* 対象デバイスで機能名が利用できない。
* 設定する新しい値が期待されていない（範囲外、またはリストに含まれていないなど）。
:::

このカメラの*Gain*は、カメラの説明ファイルが入力の値をレジスタ値に変換するコンバータであるため、0.02dBは計算や丸め誤差の想定範囲内にあります。

:::note

カメラ説明ファイルについて詳しく知りたい場合は、[GenApiの公式ドキュメント](https://www.emva.org/standards-technology/genicam/introduction-new/)をご覧ください。

:::

## データ転送の確認

`arv-camera-test-0.8`コマンドを使用すると、デバイスからのU3Vカメラデータの転送速度を確認できます。

```bash title="arv-camera-test-0.8 -n <camera name>"
$ ./arv-camera-test-0.8.exe
Looking for the first available camera
vendor name            = Basler
model name             = daA1280-54uc
device serial number   = 22585674
image width            = 1280
image height           = 960
horizontal binning     = 1
vertical binning       = 1
exposure               = 10302 ﾂｵs
gain                   = 0 dB
payload                = 2457600 bytes
29 frames/s -    71.3 MiB/s
31 frames/s -    76.2 MiB/s
30 frames/s -    73.7 MiB/s
30 frames/s -    73.7 MiB/s
30 frames/s -    73.7 MiB/s
29 frames/s -    71.3 MiB/s
30 frames/s -    73.7 MiB/s
29 frames/s -    71.3 MiB/s - 1 error
n_completed_buffers    = 240
n_failures             = 1
n_underruns            = 0
n_aborted              = 0
n_transferred_bytes    = 592072496
n_ignored_bytes        = 32
```

:::info

ホストマシンに複数のカメラデバイスが接続されている場合、オプション `-n <カメラ名>` を使用してデバイスを指定できます。

:::

:::caution 動作しない理由
`arv-camera-test-0.8`コマンドが動作しない場合、次の理由が考えられます。
* **環境変数** `PATH` が正しく設定されていない（Windows）。
* デバイスが**SS USB**ポートに接続されていない。

`arv-camera-test-0.8`が0 MiB/sの転送速度しか表示しない場合、次の理由が考えられます。
* `AcquisitionFrameRate`のGenICam機能値が誤って設定されている。
* デバイスが**SS USB**ポートに接続されていない。
:::

## センサ画像の表示

`arv-viewer-0.8`コマンドを使用すると、センサ画像を表示するGUIプログラムを実行できます。

Windows用のビューアは現在サポートされていません。

:::caution 動作しない理由
`arv-viewer-0.8`コマンドが動作しない場合、次の理由が考えられます。
* `PixelFormat`のGenICam機能値が誤って設定されている。
* デバイスが**SS USB**ポートに接続されていない。
:::
