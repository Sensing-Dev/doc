---
sidebar_position: 10
---

# Parse non-GenDC binary data

In this tutorial, we learn how to parse image data in the format of binary.

## Prerequisite
 
* Modern json (included in the tutorial) 

## Tutorial

In the [previous tutorial](save-image-bin), we learned how to save image data into a binary file. Now, we will load the data, parse the whole data, and retrieve images.

### Binary file structure 

The structure of binary data saved in the [previous tutorial](save-image-bin) is as follows:

| Size in Byte  | Content    |
|---------------|------------|
| 4                | framecount |
| w \* h \* d \* c | image      |
| 4                | framecount |
| w \* h \* d \* c | 4          |
| 4                | framecount |
| ...              | ...        |
| w \* h \* d \* c | image      |

Framecount is 4 byte-length, and imagedata size is width * height * byte-depth * number of channel.

The value of width and height is in &ltprefix>-config.json with binary file saved by the pipeline in the [previous tutorial](save-image-bin).

The byte-depth and the number of channel can be calculated from PixelFormat, which is also noted in &ltprefix>-config.json.

Config file is saved with the binary files under `tutorial_save_image_bin_XXXXXXXXXXXXXXXXXX` and prefix is `image0-`.

```c++
std::string directory_name = "tutorial_save_image_bin_XXXXXXXXXXXXXXXXXX";

std::ifstream f(std::filesystem::path(directory_name) / std::filesystem::path(prefix+"config.json"));
nlohmann::json config = nlohmann::json::parse(f);

int32_t w = config["width"];
int32_t h = config["height"];
int32_t d = <byte-depth calculated by PixelFormat config["pfnc_pixelformat"]>; e.g. if Mono12 then 2
int32_t c = <color channel calculated by PixelFormat config["pfnc_pixelformat"]>; e.g. if Mono12 then 1
int32_t framesize = w * h * d * c;
```

The source code introduced at the end of this tutorial provides the function `getByteDepth` and `getNumChannel` which takes the value of `config["pfnc_pixelformat"]` and returned the byte-depth and color-channel respectively.


### Find Binary file.   

If you use the binary file saved in the previous tutorial, the name of the directory should be `tutorial_save_image_bin_XXXXXXXXXXXXXXXXXX` and binary file prefix is `image0-`.

```c++
std::string directory_name = "tutorial_save_image_bin_XXXXXXXXXXXXXXXXXX";
std::string prefix = "image0-";
```

The following snippet attempts to retrieve all binary files starting with a specified prefix from a directory. It then reorders all the found binaries according to their recorded order.

```c++
std::vector<std::string> bin_files;
    for (const auto& entry : std::filesystem::directory_iterator(directory_name)) {
        if (entry.path().filename().string().find(prefix) == 0 && entry.is_regular_file() && entry.path().extension() == ".bin") {
            bin_files.push_back(entry.path().filename().string());
        }
    }

    //re-order binary files to sensor0-0.bin, sensor0-1.bin, sensor0-2.bin...
    std::sort(bin_files.begin(), bin_files.end(), [](const std::string& a, const std::string& b) {
        return extractNumber(a) < extractNumber(b);
    });
```

Now, we go through all ordered binary files in `bin_files` with for loop.

```c++
for (const auto& filename : bin_files){

}
```

### Open and load Binary file.  

In the for loop, our target (single) binary file is `filename`. We open this binary file is `ifstream`.

```c++
std::filesystem::path jth_bin= std::filesystem::path(directory_name) / std::filesystem::path(filename);
std::ifstream ifs(jth_bin, std::ios::binary);
```

To obtain the size of whole binary file, you set the ifstream at the end of file so that the distance between the current position and the beginning of the file is equal to the filesize. 

```c++
ifs.seekg(0, std::ios::end);
std::streampos filesize = ifs.tellg();
```

Do not forget to put the ifstream back to the beginning of the file to load the content.

```c++
ifs.seekg(0, std::ios::beg);
char* filecontent = new char[filesize];
```

### Parse binary file

Finally, we parse each binary file.

Since we know the size of framecount is -byte, which is the size of 32-bit integer. We copy the 4-byte data from filecontent to framecount.

```c++
int cursor = 0;
while(cursor < static_cast<int>(filesize)){
    int framecount = *reinterpret_cast<int*>(filecontent + cursor);
    std::cout << framecount << std::endl;
    ...
}
```

Prepare the cv::Mat object to store the image data, which requires the height, width, and `cv::Mat::type`, which is also can be obtained from pixelformat.

| PixelFormat | cv::Mat::type |
|-------------|---------------|
| Mono8       | CV_8UC1       |
| Mono12      | CV_16UC1      |
| RGB8        | CV_8UC3       |


```c++
cv::Mat img(h, w, getOpenCVMatType(d, c));
```

Image data is following framecount, so the offse is `+4` and the data size is `width * height * byte-depth * num-color-channel`.

```c++
while(cursor < static_cast<int>(filesize)){
    ...
    cv::Mat img(h, w, getOpenCVMatType(d, c));
    std::memcpy(img.ptr(), filecontent + cursor + 4, framesize);
    ...
    cv::imshow("First available image component", img);

    cv::waitKeyEx(1);
}
```

Now OpenCV's imshow can display the image-preview.

To move on to the next framecount and image data, do not forget to shift the cursor.

```
cursor += 4 + framesize;
```


## Complete code

import {tutorial_version} from "@site/static/version_const/v240505.js"
import GenerateTutorialLink from '@site/static/tutorial_link.js';

<GenerateTutorialLink language="cpp" tag={tutorial_version} tutorialfile="tutorial5_parse_image_bin_data" />
