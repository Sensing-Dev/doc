---
sidebar_position: 8
---

# GenDCデータの解析

このチュートリアルでは、GenDCセパレーターライブラリの使用方法を学びます。

## 前提条件

* GenDCセパレータ（sensing-dev SDKとともにインストール済み）

## チュートリアル

[前のチュートリアル](save-gendc)では、GenDCデータをバイナリファイルに保存する方法を学びました。今度は、データを読み込み、コンテナを解析し、ディスクリプタからセンサに関する情報を取得します。

### GenDC

GenDC、ジェネリックデータコンテナは、EMVA（European Machine Vision Association）によって定義されています。その名前の通り、データ次元、メタデータ、または画像シーケンス/バーストに関係なく、カメラデバイスによって定義された任意の種類のデータを含むことができます。

フォーマットルールは[公式ドキュメント](https://www.emva.org/wp-content/uploads/GenICam_GenDC_v1_1.pdf)で定義されていますが、GenDCセパレータを使用すると、コンテナ全体を簡単に解析できます。

### バイナリファイルを見つける

前のチュートリアルで保存したバイナリファイルを使用する場合、ディレクトリの名前は `tutorial_save_gendc_XXXXXXXXXXXXXX` で、バイナリファイルのプレフィックスは `gendc0-` にする必要があります。

```c++
std::string directory_name = "tutorial_save_gendc_XXXXXXXXXXXXXX";
std::string prefix = "gendc0-";
```

次のスニペットは、指定されたプレフィックスで始まるすべてのバイナリファイルをディレクトリから取得し、すべてのバイナリを記録された順序に並べ替えます。

```c++
std::vector<std::string> bin_files;
   for (const auto& entry : std::filesystem::directory_iterator(directory_name)) {
       if (entry.path().filename().string().find(prefix) == 0 && entry.is_regular_file() && entry.path().extension() == ".bin") {
           bin_files.push_back(entry.path().filename().string());
       }
   }

   //見つかったバイナリを sensor0-0.bin、sensor0-1.bin、sensor0-2.bin... のように並べ替えます
   std::sort(bin_files.begin(), bin_files.end(), [](const std::string& a, const std::string& b) {
       return extractNumber(a) < extractNumber(b);
   });
```

これで、`bin_files`内のすべての順序付けられたバイナリファイルをforループで処理することが可能です。

```c++
for (const auto& filename : bin_files){

}
```

### バイナリファイルを開き、内容を読み込む

前述のforループ内では対象の（単一の）バイナリファイルは `filename` で表されます。該当のバイナリファイルを `ifstream` で開きます。

```c++
std::filesystem::path jth_bin= std::filesystem::path(directory_name) / std::filesystem::path(filename);
std::ifstream ifs(jth_bin, std::ios::binary);
```

`ifstream`をファイルの末尾に設定し、現在の位置とファイルの先頭との間の距離を計算することで全体のバイナリファイルのサイズを取得できます。

```c++
ifs.seekg(0, std::ios::end);
std::streampos filesize = ifs.tellg();
```

`ifstream`をファイルの先頭に戻して、コンテンツを読み込む準備をします。

```c++
ifs.seekg(0, std::ios::beg);
char* filecontent = new char[filesize];
```

### バイナリファイルを解析する

GenDCセパレータには `isGenDC` があり、データにGenDC署名があるかどうかをチェックします。データ全体を解析する前に、データが実際にGenDC形式で保存されているかどうかを確認することを推奨しています。

```c++
isGenDC(filecontent)
```

これが `true` を返す場合、データからGenDC `ContainerHeader` オブジェクトを作成できます。
```c++
ContainerHeader gendc_descriptor = ContainerHeader(filecontent);
```

このオブジェクトにはGenDCディスクリプターに書かれたすべての情報が含まれます。以下の例ではディスクリプターサイズとデータサイズを取得できます。
```c++
int32_t descriptor_size = gendc_descriptor.getDescriptorSize();
int64_t container_data_size = gendc_descriptor.getDataSize();
```

コンテナ全体のサイズはこのディスクリプターサイズとデータサイズであり、次のコンテナ情報をロードする場合は、元のデータのオフセットに合計を追加するだけです。
```c++
ContainerHeader next_gendc_descriptor= ContainerHeader(filecontent + descriptor_size + data_size);
```

このチュートリアルでは、最初に利用可能な画像データコンポーネントのデータを表示するために、コンテナデータからそのセンサーデータのみを抽出できるようにします。`getFirstComponentIndexByTypeID()`関数は、そのデータ型がパラメータと一致する最初の利用可能なデータコンポーネントのインデックスを返します。もし`-1`を返した場合は、センサー側に有効なデータが設定されていないことを意味します。

以下は、GenICamで定義されたいくつかのデータ型です。

| Datatype key | Datatype ID Value |
|--------------|-------------------|
| Undefined    | 0                 |
| Intensity    | 1                 |
| Infrared     | 2                 |
| Ultraviolet  | 3                 |
| Range        | 4                 |
| ...          | ...               |
| Metadata     | 0x8001            |

[reference: 4.13ComponentIDValue on GenICam Standard Features Naming Convention](https://www.emva.org/wp-content/uploads/GenICam_SFNC_v2_7.pdf)


画像（つまりintensity）データを取得したいので、データ型ID値に`1`を使用します。

```c++
// 最初に利用可能な画像コンポーネントを取得します
int32_t image_component_index = gendc_descriptor.getFirstComponentIndexByTypeID(1);
```

このコンポーネントインデックスを利用して画像データを含むコンポーネントのヘッダー情報にアクセスできます。

```c++
ComponentHeader image_component = gendc_descriptor.getComponentByIndex(image_component_index);
```

コンポーネントは１つ以上のパートで構成されています。for loopを使ってそれぞれのPartのデータを取得してみましょう。
```c++
for (int idx = 0; idx < part_count; idx++) {
    PartHeader part = image_component.getPartByIndex(idx);
    int part_data_size = part.getDataSize();
```

画像データをコピーするには、データを格納するためのバッファーを作成する必要があります。
```c++
uint8_t* imagedata;
imagedata = new uint8_t [part_data_size];
part.getData(reinterpret_cast<char *>(imagedata));
```

現在、画像データは1次元配列形式の`imagedata`に格納されています。プレビュー画像を表示するために、次の情報を設定する必要があります。
* 幅(Width)
* 高さ(Height)
* カラーチャネル(Color-channel)
* バイト深度(Byte-depth)

`getDimension()`は、幅と高さ情報を含むベクトルを返します。カラーチャンネルの数はコンポーネントに含まれるパートの数と同じです。
```c++
std::vector <int32_t> image_dimension = part.getDimension();
```

バイトの深さを決定するには、データの総サイズと上記で得られた次元の値から計算できます。
```c++
int32_t bd = part_data_size / WxH;
```

これらの情報がそろったので`memcpy`を使用して、1次元配列`imagedata`から画像形式のcv::Matである`img`にデータをコピーし、表示することができます。

```c++
cv::Mat img(image_dimension[1], image_dimension[0], CV_8UC1);
std::memcpy(img.ptr(), imagedata, datasize);
cv::imshow("First available image component", img);

cv::waitKeyEx(1);
```

:::tip

GenDCのTypeSpecificフィールドに保存されているデバイス固有のデータにアクセスしたい場合は、次のようにします。

たとえば、次のGenDCデータには、TypeSpecific3にサイズが整数の `framecount` データがあります。

```c++
std::cout << "Framecount: " << *reinterpret_cast<uint32_t*>(filecontent + cursor + offset) << std::endl;            
```
:::


## 完全なコード

import {tutorial_version} from "@site/static/version_const/latest.js"
import GenerateTutorialLink from '@site/static/tutorial_link.js';

<GenerateTutorialLink language="cpp" tag={tutorial_version} tutorialfile="tutorial5_parse_gendc_data" />

