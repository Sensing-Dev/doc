---
sidebar_position: 9
---

# GenDCデータの解析

このチュートリアルでは、GenDCセパレータライブラリの使い方を学びます。
デバイスのデータ形式がGenDC以外の場合（一般的なカメラが画像を取得する場合）、次のチュートリアルページ[非GenDCバイナリデータの解析](./parse-image-bin.md)を参照してください。

デバイスがGenDC形式でない場合は、9つのうち6つが有効なコンポーネントかつ、4つの異なるセンサーデータを含むサンプルGenDCをダウンロードし、本チュートリアルで利用することができます。

import links from "@site/static/external_link/links.js"

<div class="jsx-section">
<div class="board">
<a class="card" href={links.gendc_sample_data}>サンプルGenDCデータ</a>
</div></div>

## 前提条件

* GenDCセパレータ（SDKパッケージに含まれています）
* GenDCデータ（前のチュートリアルで取得したもの、または<a href={links.gendc_sample_data}>このページ</a>からダウンロードしたサンプル）

## チュートリアル

[前のチュートリアル](save-gendc)では、GenDCデータをバイナリファイルに保存する方法を学びました。今回はそのデータをロードし、コンテナを解析して、センサーの記述子からいくつかの情報を取得します。

:::note
このチュートリアルで使用するGenDCには少なくとも1つの画像データコンポーネントが含まれていると仮定します。前のチュートリアルで保存したデータがない場合は、<a href={links.gendc_sample_data}>このページ</a>からサンプルデータをダウンロードしてください。
:::

### GenDC

GenDC（Generic Data Container）は、EMVA（European Machine Vision Association）によって定義されています。その名の通り、データの次元、メタデータ、画像シーケンス・バーストかどうかに関わらず、カメラデバイスが定義するあらゆる種類のデータを含むことができます。

フォーマットルールは[公式ドキュメント](https://www.emva.org/wp-content/uploads/GenICam_GenDC_v1_1.pdf)で定義されていますが、GenDCセパレータはコンテナ全体を簡単に解析するのに役立ちます。

GenDCの概要を学びたい場合は、GenDCの概念と大まかな構造を説明する[このページ](../../lessons/GenDC)をチェックしてください。

### バイナリファイルの探索

前のチュートリアルで保存したバイナリファイルを使用する場合、ディレクトリ名は`tutorial_save_gendc_XXXXXXXXXXXXXX`で、バイナリファイルのプレフィックスは`gendc0-`です。

```cpp
std::string directory_name = "tutorial_save_gendc_XXXXXXXXXXXXXX";
std::string prefix = "gendc0-";
```

:::info
このチュートリアルの最後に提供される完全なコードは、コマンドラインオプションがついています。

`-d tutorial_save_gendc_XXXXXXXXXXXXXX`または`--directory tutorial_save_gendc_XXXXXXXXXXXXXX`オプションを設定してチュートリアルプログラムを実行すると、`directory_name`が自動的に設定されます。

また、チュートリアルページの上部で提供されているサンプルデータ`output.bin`を使用する場合は、`-u`または`--use-dummy-data`オプションを追加するだけで、ダウンロードされた`output.bin`をプログラムが検索するようになります。
:::

以下のスニペットでは、指定されたプレフィックスで始まるすべてのバイナリファイルをディレクトリから取得し、それらを録画された順番に並び替えています。

```cpp
std::vector<std::string> bin_files;
   for (const auto& entry : std::filesystem::directory_iterator(directory_name)) {
       if (entry.path().filename().string().find(prefix) == 0 && entry.is_regular_file() && entry.path().extension() == ".bin") {
           bin_files.push_back(entry.path().filename().string());
       }
   }

   //バイナリファイルをセンサー0-0.bin、センサー0-1.bin、センサー0-2.bin...に再注文
   std::sort(bin_files.begin(), bin_files.end(), [](const std::string& a, const std::string& b) {
       return extractNumber(a) < extractNumber(b);
   });
```

これで`bin_files`内のすべての順序付けられたバイナリファイルをforループで処理する準備が整いました。

```cpp
for (const auto& filename : bin_files){

}
```

### バイナリファイルを開いて読み込む

forループ内のバイナリファイルは`filename`で表されています。このバイナリファイルを`ifstream`で開きます。

```cpp
std::filesystem::path jth_bin= std::filesystem::path(directory_name) / std::filesystem::path(filename);
std::ifstream ifs(jth_bin, std::ios::binary);
```

ifstreamをファイルの末尾に設定することで、バイナリファイル全体のサイズを取得します。

```cpp
ifs.seekg(0, std::ios::end);
std::streampos filesize = ifs.tellg();
```

コンテンツをロードするためにifstreamをファイルの先頭に戻すことを忘れないでください。

```cpp
ifs.seekg(0, std::ios::beg);
char* filecontent = new char[filesize];
```

### バイナリファイルの解析

GenDCセパレータには、データにGenDC署名が含まれているかどうかを確認する`isGenDC`があります。全データを解析する前に、データが実際にGenDC形式で保存されているかどうかを確認できます。

```cpp
isGenDC(filecontent);
```

`true`を返す場合、データからGenDC `ContainerHeader`オブジェクトを作成できます。GenDCの用語（*Container*、*Component*、*Part*など）について学ぶには、[このページ](../../lessons/GenDC)をチェックしてください。
```cpp
ContainerHeader gendc_descriptor = ContainerHeader(filecontent);
```

このオブジェクトには、GenDC *Descriptor*に書かれたすべての情報が含まれているので、*Descriptor*のサイズとデータのサイズを取得できます。
```cpp
int32_t descriptor_size = gendc_descriptor.getDescriptorSize();
int64_t container_data_size = gendc_descriptor.getDataSize();
```

コンテナ全体のサイズは、このDescriptorSizeとDataSizeの合計です。元のデータのオフセットとして合計を追加することで次のコンテナ情報をロードすることができます。
```cpp
ContainerHeader next_gendc_descriptor= ContainerHeader(filecontent + descriptor_size + data_size);
```

このチュートリアルでは、どの*Component*に画像センサデータが含まれているかを検出し、センサデータの情報（チャンネル数、データの次元、バイト深度など）を取得し、最終的にOpenCVで画像を表示します。

まず、`getFirstComponentIndexByTypeID()`を使用して最初の有効な画像データ*Component*を見つける必要があります。これにより、パラメータと一致するデータタイプの最初の有効なデータ*Component*のインデックスが返されます。-1を返す場合、有効なデータがセンサー側に設定されていないことを意味します。

ここに、GenICamによって定義されたいくつかのデータタイプがあります。

| データタイプキー | データタイプID値 |
|-------------------|-------------------|
| 未定義           | 0                 |
| 強度             | 1                 |
| 赤外線           | 2                 |
| 紫外線           | 3                 |
| 距離             | 4                 |
| ...              | ...               |
| メタデータ       | 0x8001            |

[参照: GenICam標準機能命名規約の4.13ComponentIDValue](https://www.emva.org/wp-content/uploads/GenICam_SFNC_v2_7.pdf)

画像（すなわち輝度）データを取得するために、データタイプID値として`1`を使用します。

```cpp
// 最初の有効な画像コンポーネントを取得
int32_t image_component_index = gendc_descriptor.getFirstComponentIndexByTypeID(1);
```

これで、画像データを含む*Component*のヘッダー情報にアクセスできます。
```cpp
ComponentHeader image_component = gendc_descriptor.getComponentByIndex(image_component_index);
```

*Component*には1つ以上の*Part*があります。forループを使用してそれらを反復処理できます。画像*Component*の*Part*の数は通常、カラーチャンネルの数です。例えば、モノクロ空間画像では1、一般的なRGBなどのカラーピクセルフォーマットでは3です。

```cpp
int part_count = image_component.getPartCount();
for (int idx = 0; idx < part_count; idx++) {
   PartHeader part = image_component.getPartByIndex(idx);
   int part_data_size = part.getDataSize();
```

画像データをコピーするには、各Partのデータを格納するバッファを作成する必要があります。
```cpp
uint8_t* imagedata;
imagedata = new uint8_t [part_data_size];
part.getData(reinterpret_cast<char *>(imagedata));
```

現在、画像データは1D配列形式の`imagedata`にあります。プレビュー画像を表示するためは2Dにしなければならないので、次の情報を確認する作業が必要です。
* 幅
* 高さ
* カラーチャンネル
* バイト深度

`getDimension()`は、幅と高さを含むベクターを返します。
```cpp
std::vector <int32_t> image_dimension = part.getDimension();
```

バイト深度を決定するには、データの総サイズと上記の取得された次元値から計算できます。
```cpp
int32_t bd = part_data_size / WxH;
```

これで、データを1D配列`imagedata`から画像形式のcv::Mat`img`に`memcpy`でコピーして表示することができます。
```cpp
cv::Mat img(image_dimension[1], image_dimension[0], CV_8UC1);
std::memcpy(img.ptr(), imagedata, datasize);
cv::imshow("First available image component", img);

cv::waitKeyEx(1);
```

CvMatの型システムは、バイト深度とカラーチャンネルによって異なります。一般的にフォーマットは`CV_<bit-depth><signed/unsigned>C<チャンネル数>`です。詳細は[公式ドキュメント](https://docs.opencv.org/4.x/d1/d1b/group__core__hal__interface.html)を参照してください。

このページの上部で提供されているサンプルデータを使用すると、次のような画像が表示されます。

![サンプル画像](../img/tutorial5-image.png).

### サンプルデータの例

前のセクションでは、GenDCセパレータAPIを使用してGenDCデータを解析する一般的なアイデアを学びました。今度は、このページの上部（または<a href={links.gendc_sample_data}>こちら</a>）で提供されているサンプルデータを使用して、いくつかの非画像データを処理できます。

![サンプルデータ構造](../../lessons/img/sample_data_structure.png)。

画像センサデータで行ったように、1. チャンネル数 2. データの次元 3. データのバイト深度を取得することでユーザアプリケーションで使用可能になります。Pythonのチュートリアルでは視覚化のためのコードも提供しています [Visualize GenDC data](../python/visualize-gendc)。

サンプルデータに入っているすべての非画像データのデータタイプはメタデータであるため、TypeIdで目的の*Component*を見つけることはできません。各コンポーネントにアクセスするためには別の情報が必要です。

通常、各*Component*にはデータを検出するための一意のSourceIdがあります。今回は、ターゲット*Component*を探すために`getFirstComponentIndexBySourceId`を使用します。

| コンポーネントインデックス | センサータイプ | 有効性 | SourceId | TypeId              |
|-----------------------------|----------------|--------|----------|---------------------|
| 0                           | 画像           | 有効   | 0x1001   | 1 (Intensity)       |
| 1                           | 音声           | 有効   | 0x2001   | 0x8001 (Metadata)   |
| 2                           | アナログ1      | 有効   | 0x3001   | 0x8001 (Metadata)   |
| 3                           | アナログ2      | 有効   | 0x3002   | 0x8001 (Metadata)   |
| 4                           | アナログ3      | 有効   | 0x3003   | 0x8001 (Metadata)   |
| 5                           | PMOD           | 有効   | 0x4001   | 0x8001 (Metadata)   |
| 6                           | 追加           | 無効   | 0x0001   | 0x8001 (Metadata)   |
| 7                           | 該当なし       | 無効   | 0x5001   | 0x8001 (Metadata)   |
| 8                           | 該当なし       | 無効   | 0x6001   | 0x8001 (Metadata)   |

#### オーディオデータの取得

目的の*Component*のインデックスがわかると、画像*Component*と同様に`ComponentHeader`オブジェクトを作成できます。

```cpp
int audio_component_index = gendc_descriptor.getFirstComponentIndexBySourceId(0x2001);
ComponentHeader audio_component = gendc_descriptor.getComponentByIndex(audio_component_index);
```

この*Container*には2つのパーツがあり、それぞれにオーディオデータの**左チャンネル**と**右チャンネル**が含まれています。

```cpp
int audio_part_count = audio_component.getPartCount();
```

:::info
一部のオーディオセンサーは、LchとRchを交互に同じ*Part*に格納するインターリーブオーディオを使用します。
この場合、`audio_component.getPartCount()`は1を返しますが、データを使用するには2次元に再構築する必要があります。
:::

画像*Component*と同様に、各*Part*のデータサイズと次元を確認します。

```cpp
for (int idx = 0; idx < audio_part_count; idx++) {
    PartHeader part = audio_component.getPartByIndex(idx);
    int part_data_size = part.getDataSize();
    std::vector <int32_t> audio_dimension = part.getDimension();
```

ここで、`audio_dimension`は`{800}`です。通常、GenDCの画像*Component*は1フレームのデータを格納しますが、他のセンサーデータはその画像データを取得するのにかかる時間内に取得されたサンプルを格納します。例えば、画像が60fpsで取得されている場合、1/60秒以内に取得されたサンプルのみが格納されます。このオーディオデータは48kHzでサンプリングされ、1/60秒内に800サンプルが取得されるため、次元は800になります。

このオーディオデータの型を知るためには、データのサイズと次元で計算できるバイト深度が必要です。

```cpp
int32_t bd = part_data_size / 800;
```

`part_data_size`が1600であるため、バイト深度は`2`であり、型は`int16_t`となります。

このデータを[前述のPythonチュートリアルコード](../python/visualize-gendc)で視覚化すると、以下のプロットが確認できます。

![サンプル画像](../img/tutorial5-audio.png)。

#### アナログデータの取得

このGenDCデータには、識別子`0x3001`、`0x3002`、および`0x3003`を持つ3つのアナログセンサがあります。`getFirstComponentIndexBySourceId()`を使用して*Component*のインデックスを見つけることができます。

```cpp
int analog_component_index = gendc_descriptor.getFirstComponentIndexBySourceId(0x3001);
ComponentHeader analog_component = gendc_descriptor.getComponentByIndex(analog_component_index);
```

各アナログセンサの*Component*には1つの*Part*が含まれており、これは`getPartCount()`で確認できます。

```cpp
int analog_part_count = analog_component.getPartCount();
```

データサイズ、次元（サンプル数）、バイト深度を知るために*Part*を取得できます。

```cpp
for (int idx = 0; idx < analog_part_count; idx++) {
    PartHeader part = analog_component.getPartByIndex(idx);
    int part_data_size = part.getDataSize();
    std::vector <int32_t> analog_dimension = part.getDimension();
}
```

このデータを[前述のPythonチュートリアルコード](../python/visualize-gendc)で視覚化すると、以下のプロットが確認できます。

![サンプル画像](../img/tutorial5-analog.png)。

#### PMODデータの取得

このGenDCデータには1つのPMOD加速度センサがあり、これは加速度計でx、y、zの座標情報を記録します。したがって、*Parts*の数は3です。

```cpp
int pmod_component_index = gendc_descriptor.getFirstComponentIndexBySourceId(0x4001);
ComponentHeader pmod_component = gendc_descriptor.getComponentByIndex(pmod_component_index);
int pmod_part_count = pmod_component.getPartCount();
```

:::info
一部の加速度センサーはインターリーブ構造を使用し、X、Y、Zの座標を交互に同じ*Part*に格納します。
この場合、`pmog_component.getPartCount()`は1を返しますが、データを使用するには3次元（または1つのダミーチャンネルを追加して4次元）に再構築する必要があります。
:::

データサイズ、次元（サンプル数）、バイト深度を知るために*Part*を取得できます。

```cpp
for (int idx = 0; idx < pmod_part_count; idx++) {
    PartHeader part = pmod_component.getPartByIndex(idx);
    int part_data_size = part.getDataSize();
    std::vector <int32_t> pmod_dimension = part.getDimension();
    ...
```

各*Part*にはそれぞれx、y、zのデータが含まれており、[前述のPythonチュートリアルコード](../python/visualize-gendc)で視覚化すると、以下のプロットが確認できます。

![サンプル画像](../img/tutorial5-pmod.png)。

#### Typespecificの使用

GenDCのTypeSpecificフィールドに格納されたデバイス固有のデータにアクセスしたいときは`getTypeSpecificByIndex()`を使う必要があります。

例えば、以下のGenDCデータには、8バイトのTypeSpecific3の下位4バイトに`framecount`データが含まれています。

TypeSpecificはN=1、2、3...から始まり、インデックスは0、1、2...なので、TypeSpecific3のインデックスは2です。

```cpp
int64_t typespecific3 = part.getTypeSpecificByIndex(2);
int32_t framecount = static_cast<int32_t>(typespecific3 & 0xFFFFFFFF);
std::cout << "Framecount: " << framecount<< std::endl;          
```


## 完全なコード

import {tutorial_version} from "@site/static/version_const/v2405.js"
import GenerateTutorialLink from '@site/static/tutorial_link.js';

<GenerateTutorialLink language="cpp" tag={tutorial_version} tutorialfile="tutorial5_parse_gendc_data" />
