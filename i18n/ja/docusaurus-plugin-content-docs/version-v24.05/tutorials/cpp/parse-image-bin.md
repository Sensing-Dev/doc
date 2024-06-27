---
sidebar_position: 10
---

# 非GenDCバイナリデータの解析

このチュートリアルでは、バイナリ形式の画像データを解析する方法について学びます。

## 前提条件

* Modern json (このチュートリアルに含まれています) 

## チュートリアル

[前のチュートリアル](save-image-bin) では、画像データをバイナリファイルに保存する方法を学びました。今回は、データをロードし、コンテナを解析し、ディスクリプターからセンサーに関する情報を取得します。

### バイナリファイルの構造 

[前のチュートリアル](save-image-bin)で保存されたバイナリデータの構造は次の通りです:

| バイト数       | 内容         |
|---------------|------------|
| 4                | フレーム数   |
| w \* h \* d \* c | 画像        |
| 4                | フレーム数   |
| w \* h \* d \* c | 4          |
| 4                | フレーム数   |
| ...              | ...        |
| w \* h \* d \* c | 画像        |

フレーム数は4バイトの長さであり、画像データのサイズは幅 * 高さ * バイト深度 * チャンネル数です。

幅と高さの値は、前のチュートリアルでパイプラインによって保存されたバイナリファイル内の `prefix-config.json` に記載されています。

バイト深度とチャンネル数は、 `prefix-config.json` で指定された `pfnc_pixelformat` から計算できます。

バイナリファイルとともに設定ファイルは `tutorial_save_image_bin_XXXXXXXXXXXXXXXXXX` の下に保存され、プレフィックスは `image0-` です。

```c++
std::string directory_name = "tutorial_save_image_bin_XXXXXXXXXXXXXXXXXX";

std::ifstream f(std::filesystem::path(directory_name) / std::filesystem::path(prefix+"config.json"));
nlohmann::json config = nlohmann::json::parse(f);

int32_t w = config["width"];
int32_t h = config["height"];
int32_t d = <PixelFormatで計算されたバイト深度 config["pfnc_pixelformat"]>; 例: Mono12の場合は2
int32_t c = <PixelFormatで計算されたカラーチャンネル config["pfnc_pixelformat"]>; 例: Mono12の場合は1
int32_t framesize = w * h * d * c;
```

このチュートリアルの最後に紹介されたソースコードには、 `config["pfnc_pixelformat"]` の値を取り、バイト深度とカラーチャンネルを返す `getByteDepth` および `getNumChannel` 関数が提供されています。

### バイナリファイルの検索

前のチュートリアルで保存されたバイナリファイルを使用する場合、ディレクトリの名前は `tutorial_save_image_bin_XXXXXXXXXXXXXXXXXX` であり、バイナリファイルのプレフィックスは `image0-` です。

```c++
std::string directory_name = "tutorial_save_image_bin_XXXXXXXXXXXXXXXXXX";
std::string prefix = "image0-";
```

次のスニペットでは、指定されたプレフィックスで始まるすべてのバイナリファイルをディレクトリから取得し、記録された順序に並べ替えます。

```c++
std::vector<std::string> bin_files;
for (const auto& entry : std::filesystem::directory_iterator(directory_name)) {
    if (entry.path().filename().string().find(prefix) == 0 && entry.is_regular_file() && entry.path().extension() == ".bin") {
        bin_files.push_back(entry.path().filename().string());
    }
}

// バイナリファイルを sensor0-0.bin, sensor0-1.bin, sensor0-2.bin... のように並べ替えます
std::sort(bin_files.begin(), bin_files.end(), [](const std::string& a, const std::string& b) {
    return extractNumber(a) < extractNumber(b);
});
```

これで、`bin_files` 内のすべての順序付けされたバイナリファイルをループで処理します。

```c++
for (const auto& filename : bin_files){

}
```

### バイナリファイルのオープンと読み込み

ループ内で、対象の（単一の）バイナリファイルは `filename` です。このバイナリファイルを `ifstream` で開きます。

```c++
std::filesystem::path jth_bin= std::filesystem::path(directory_name) / std::filesystem::path(filename);
std::ifstream ifs(jth_bin, std::ios::binary);
```

バイナリファイル全体のサイズを取得するために、 `ifstream` をファイルの末尾に設定して、現在の位置とファイルの先頭との距離がファイルサイズに等しくなるようにします。

```c++
ifs.seekg(0, std::ios::end);
std::streampos filesize = ifs.tellg();
```

ファイルの内容を読み込むために `ifstream` をファイルの先頭に戻すことを忘れないでください。

```c++
ifs.seekg(0, std::ios::beg);
char* filecontent = new char[filesize];
```

### バイナリファイルの解析

最後に、各バイナリファイルを解析します。

フレーム数のサイズが4バイトであるため、ファイルの内容から4バイトのデータをframecountにコピーします。

```c++
int cursor = 0;
while(cursor < static_cast<int>(filesize)){
    int framecount = *reinterpret_cast<int*>(filecontent cursor);
    std::cout << framecount << std::endl;
    ...
}
```

画像データを保存するための `cv::Mat` オブジェクトを準備します。これには高さ、幅、および `cv::Mat::type` が必要です。`cv::Mat::type` はまた、 `PixelFormat` から取得することができます。

| PixelFormat | cv::Mat::type |
|-------------|---------------|
| Mono8       | CV_8UC1       |
| Mono12      | CV_16UC1      |
| RGB8        | CV_8UC3       |

```c++
cv::Mat img(h, w, getOpenCVMatType(d, c));
```

画像データはフレーム数の後に続きますので、オフセットは `+4` で、データサイズは `幅 * 高さ * バイト深度 * 色チャンネル数` です。

```c++
while(cursor < static_cast<int>(filesize)){
    ...
    cv::Mat img(h, w, getOpenCVMatType(d, c));
    std::memcpy(img.ptr(), filecontent cursor 4, framesize);
　　...
    cv::imshow("First available image component", img);

    cv::waitKeyEx(1);
}
```


OpenCVのimshowを使って、読み取った画像データを表示することができます。

次のフレーム数と画像データに移動するために、カーソルをシフトすることを忘れないでください。

```c++
cursor += 4 framesize;
```

## 完全なコード

import {tutorial_version} from "@site/static/version_const/v2405.js"
import GenerateTutorialLink from '@site/static/tutorial_link.js';

<GenerateTutorialLink language="cpp" tag={tutorial_version} tutorialfile="tutorial5_parse_image_bin_data" />

