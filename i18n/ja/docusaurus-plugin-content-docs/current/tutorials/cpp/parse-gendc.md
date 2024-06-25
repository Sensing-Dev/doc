---
sidebar_position: 9
---

# GenDC データの解析

このチュートリアルでは、GenDC セパレーターライブラリの使用方法を学びます。
デバイスデータ形式がGenDC以外の場合（一般的なカメラで画像データを取得する場合）は、次のチュートリアルページ [非 GenDC バイナリデータの解析](./parse-image-bin.md) を参照してください。

## 前提条件

* GenDC セパレーター（sensing-dev SDK でインストール済み）

## チュートリアル

[前のチュートリアル](save-gendc) では、GenDC データをバイナリファイルに保存する方法を学びました。今回は、データをロードし、コンテナを解析し、ディスクリプターからセンサーに関する情報を取得します。

### GenDC

GenDC または Generic Data Container は、EMVA（European Machine Vision Association）によって定義されています。その名の通り、カメラデバイスで定義された任意のタイプのデータを含むことができ、データの次元、メタデータ、画像のシーケンス/バーストの有無にかかわらず、含めることができます。

フォーマットの規則は [公式文書](https://www.emva.org/wp-content/uploads/GenICam_GenDC_v1_1.pdf) で定義されていますが、GenDC セパレーターはコンテナ全体を簡単にパースするのに役立ちます。

### バイナリファイルの検索

前のチュートリアルで保存したバイナリファイルを使用する場合、ディレクトリの名前は `tutorial_save_gendc_XXXXXXXXXXXXXX` で、バイナリファイルの接頭辞は `gendc0-` である必要があります。

```c++
std::string directory_name = "tutorial_save_gendc_XXXXXXXXXXXXXX";
std::string prefix = "gendc0-";
```

次のスニペットでは、指定された接頭辞で始まるすべてのバイナリファイルをディレクトリから取得しようとします。その後、記録された順序に従ってバイナリをすべて再配置します。

```c++
std::vector<std::string> bin_files;
for (const auto& entry : std::filesystem::directory_iterator(directory_name)) {
if (entry.path().filename().string().find(prefix) == 0 && entry.is_regular_file() && entry.path().extension() == ".bin") {
bin_files.push_back(entry.path().filename().string());
}
}

// バイナリファイルを sensor0-0.bin、sensor0-1.bin、sensor0-2.bin... のように再配置します
std::sort(bin_files.begin(), bin_files.end(), [](const std::string& a, const std::string& b) {
return extractNumber(a) < extractNumber(b);
});
```

これで、`bin_files` 内のすべての順序付けされたバイナリファイルを for ループで処理できます。

```c++
for (const auto& filename : bin_files){

}
```

### バイナリファイルのオープンとロード

for ループ内で、対象の（単一の）バイナリファイルは `filename` です。このバイナリファイルを `ifstream` で開きます。

```c++
std::filesystem::path jth_bin= std::filesystem::path(directory_name) / std::filesystem::path(filename);
std::ifstream ifs(jth_bin, std::ios::binary);
```

全体のバイナリファイルのサイズを取得するために、ifstream をファイルの末尾に移動して、現在位置とファイルの先頭との間の距離がファイルサイズと等しくなるようにします。

```c++
ifs.seekg(0, std::ios::end);
std::streampos filesize = ifs.tellg();
```

ファイルの内容をロードするために、ifstream をファイルの先頭に戻すことを忘れないでください。

```c++
ifs.seekg(0, std::ios::beg);
char* filecontent = new char[filesize];
```

### バイナリファイルの解析

GenDC セパレーターには、データに GenDC シグネチャがあるかどうかを確認する `isGenDC` があります。データを全体としてパースする前に、実際にデータが GenDC フォーマットで保存されていることを確認するのは常に良い考えです。

```c++
isGenDC(filecontent)
```

これが `true` を返す場合、データから GenDC `ContainerHeader` オブジェクトを作成できます。

```c++
ContainerHeader gendc_descriptor = ContainerHeader(filecontent);
```

このオブジェクトには、GenDC ディスクリプターに書かれたすべての情報が含まれています。ディスクリプターサイズとデータサイズを取得できます。

```c++
int32_t descriptor_size = gendc_descriptor.getDescriptorSize();
int64_t container_data_size = gendc_descriptor.getDataSize();
```

コンテナ全体のサイズは、この DescriptorSize と DataSize であり、元のデータのオフセットとして合計を追加するだけで次のコンテナ情報をロードできます。

```c++
ContainerHeader next_gendc_descriptor= ContainerHeader(filecontent + descriptor_size + data_size);
```

このチュートリアルでは、最初に利用可能な画像データコンポーネントのデータを表示します。これにより、コンテナデータからそのセンサーデータだけを抽出できます。`getFirstComponentIndexByTypeID()` 関数は、そのデータタイプがパラメーターと一致する場合、最初に利用可能なデータコンポーネントのインデックスを返します。-1 を返すと、センサーサイドで有効なデータが設定されていないことを意味します。

GenICam で定義されているいくつかのデータタイプは次のとおりです。

| データタイプキー | データタイプ ID 値 |
|--------------|-------------------|
| Undefined    | 0                 |
| Intensity    | 1                 |
| Infrared     | 2                 |
| Ultraviolet  | 3                 |
| Range        | 4                 |
| ...          | ...               |
| Metadata     | 0x8001            |

[参照:4.13ComponentIDValue on GenICam Standard Features Naming Convention](https://www.emva.org/wp-content/uploads/GenICam_SFNC_v2_7.pdf)

画像（つまり、強度）データを取得したい場合は、Datatype ID 値として `1` を使用します。

```c++
// 最初に利用可能な画像コンポーネントを取得
int32_t image_component_index = gendc_descriptor.getFirstComponentIndexByTypeID(1);
```

これで、画像データを含むコンポーネントのヘッダ情報にアクセスできます。
```c++
ComponentHeader image_component = gendc_descriptor.getComponentByIndex(image_component_index);
```

コンポーネントには1つ以上のパートが含まれています。forループを使用してそれらをイテレートできます。
```c++
for (int idx = 0; idx < part_count; idx++) {
    PartHeader part = image_component.getPartByIndex(idx);
    int part_data_size = part.getDataSize();
```

画像データをコピーするには、各パートにデータを格納するためのバッファを作成する必要があります。
```c++
uint8_t* imagedata;
imagedata = new uint8_t [part_data_size];
part.getData(reinterpret_cast<char *>(imagedata));
```

現在、画像データは1次元配列の形式で `imagedata` にあります。プレビュー画像を表示するためには、以下の情報を設定して形状を変更します。
* 幅
* 高さ
* カラーチャンネル
* バイトの深さ

`getDimension()` は、幅と高さを含むベクトルを返します。コンポーネントに複数のパートがある場合、複数のカラーチャンネルがあります。
```c++
std::vector<int32_t> image_dimension = part.getDimension();
```

バイトの深さを決定するには、データの合計サイズと上記で取得した次元値から計算できます。
```c++
int32_t bd = part_data_size / WxH;
```

これで、1次元配列の `imagedata` から画像形式の `cv::Mat img` にデータをコピーして表示できます。
```c++
cv::Mat img(image_dimension[1], image_dimension[0], CV_8UC1);
std::memcpy(img.ptr(), imagedata, datasize);
cv::imshow("最初に利用可能な画像コンポーネント", img);

cv::waitKeyEx(1);
```

:::tip

GenDC の TypeSpecific フィールドに格納されているデバイス固有データにアクセスしたい場合は次のようにします。

たとえば、以下の GenDC データでは、TypeSpecific3 の下位4バイトに `framecount` データが含まれています。TypeSpecific は N = 1、2、3... となり、インデックスは 0、1、2... ですので、TypeSpecific3 のインデックスは 2 です。

```c++
int64_t typespecific3 = part.getTypeSpecificByIndex(2);
int32_t framecount = static_cast<int32_t>(typespecific3 & 0xFFFFFFFF);
std::cout << "フレーム数: " << framecount << std::endl;          
```
:::

## 完全なコード

import {tutorial_version} from "@site/static/version_const/latest.js"
import GenerateTutorialLink from '@site/static/tutorial_link.js';

<GenerateTutorialLink language="cpp" tag={tutorial_version} tutorialfile="tutorial5_parse_gendc_data" />