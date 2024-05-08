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

前のチュートリアルで保存したバイナリファイルを使用する場合、ディレクトリの名前は `tutorial_save_gendc_XXXXXXXXXXXXXX` で、バイナリファイルのプレフィックスは `sensor0-` にする必要があります。

```c++
std::string directory_name = "tutorial_save_gendc_XXXXXXXXXXXXXX";
std::string prefix = "sensor0-";
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
ContainerHeader gendc_descriptor= ContainerHeader(filecontent);
```

このオブジェクトにはGenDCディスクリプターに書かれたすべての情報が含まれます。以下の例ではディスクリプターサイズとデータサイズを取得できます。
```c++
int32_t descriptor_size = gendc_descriptor.getDescriptorSize();
int64_t data_size = gendc_descriptor.getContainerDataSize();
```

コンテナ全体のサイズはこのディスクリプターサイズとデータサイズであり、次のコンテナ情報をロードする場合は、元のデータのオフセットに合計を追加するだけです。
```c++
ContainerHeader next_gendc_descriptor= ContainerHeader(filecontent + descriptor_size + data_size);
```

このチュートリアルでは、最初に利用可能なコンポーネントデータのサイズとオフセットを取得しましょう。 `getFirstAvailableDataOffset` は、最初に利用可能なイメージデータのコンポーネントインデックスとパートインデックスのタプルを返します。これが `(-1、-1)` を返す場合、センサー側でデータが有効に設定されていません。

```c++
// 最初に利用可能な画像コンポーネントを取得します
std::tuple<int32_t, int32_t> data_comp_and_part = gendc_descriptor.getFirstAvailableDataOffset(true);
std::cout << "最初に利用可能な画像データのコンポーネントは Comp " 
   << std::get<0>(data_comp_and_part)
   << "、Part "
   << std::get<1>(data_comp_and_part) << std::endl;
```

次に、`std::get<0>(data_comp_and_part)` 番目のコンポーネントと `std::get<1>(data_comp_and_part)` 番目のパートのデータサイズとオフセットを取得します。 `getDataSize()` を呼び出します。

```c++
int image_datasize = gendc_descriptor.getDataSize(std::get<0>(data_comp_and_part), std::get<1>(data_comp_and_part));
int image_offseet = gendc_descriptor.getDataOffset(std::get<0>(data_comp_and_part), std::get<1>(data_comp_and_part));
std::cout << "\tデータサイズ: " << image_datasize << std::endl;
std::cout << "\tデータオフセット: " << image_offseet << std::endl;

```

これで、`filecontent` を `image_offseet` から `image_datasize` のサイズでコピーして画像データを取得できます。

:::tip

GenDCのTypeSpecificフィールドに保存されているデバイス固有のデータにアクセスしたい場合は、次のようにします。

たとえば、次のGenDCデータには、TypeSpecific3にサイズが整数の `framecount` データがあります。

```c++
int offset = gendc_descriptor.getOffsetFromTypeSpecific(std::get<0>(data_comp_and_part), std::get<1>(data_comp_and_part), 3, 0);
std::cout << "Framecount: " << *reinterpret_cast<int*>(filecontent + cursor + offset) << std::endl;                
```
:::


## 完全なコード

import {tutorial_version} from "@site/static/version_const/latest.js"
import GenerateTutorialLink from '@site/static/tutorial_link.js';

<GenerateTutorialLink language="cpp" tag={tutorial_version} tutorialfile="tutorial5_parse_gendc_data" />

