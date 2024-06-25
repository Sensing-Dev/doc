---
sidebar_position: 9
---

# Parse GenDC data

In this tutorial, we learn how to use GenDC separator library.
If your device data format is non-GenDC (general camera acquire images), see the next tutorial page [Parse non-GenDC binary data](./parse-image-bin.md).

## Prerequisite
 
* GenDC Separator (installed with sensing-dev SDK) 

## Tutorial

In the [previous tutorial](save-gendc), we learned how to save GenDC data into a binary file. Now, we will load the data, parse the container, and retrieve some information about the sensor from its descriptor.

### GenDC

GenDC, or Generic Data Container, is defined by the EMVA (European Machine Vision Association). True to its name, it can contain any types of data defined by the camera device, regardless of the data dimension, metadata, or whether they are image sequences/bursts. 

While the format rule is defined in [the official document](https://www.emva.org/wp-content/uploads/GenICam_GenDC_v1_1.pdf), GenDC Separator helps you with easily parsing the whole container.


### Find Binary file.   

If you use the binary file saved in the previous tutorial, the name of the directory should be `tutorial_save_gendc_XXXXXXXXXXXXXX` and binary file prefix is `gendc0-`.

```c++
std::string directory_name = "tutorial_save_gendc_XXXXXXXXXXXXXX";
std::string prefix = "gendc0-";
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

GenDC Separator has `isGenDC` to check if the data has GenDC signature. Before parsing the whole data, it is always a good idea to make sure if the data is actually saved as GenDC format.

```c++
isGenDC(filecontent)
```

If it returns `true`, we can create an GenDC `ContainerHeader` object from the data.
```c++
ContainerHeader gendc_descriptor = ContainerHeader(filecontent);
```

Now this object contains all information written in the GenDC Descriptor. You can get the size of Descriptor and the size of data. 
```c++
int32_t descriptor_size = gendc_descriptor.getDescriptorSize();
int64_t container_data_size = gendc_descriptor.getDataSize();
```

The whole container size is this DescriptorSize and DataSize, so if you want to load the next container information, you can just add the total as the offset of the original data.
```c++
ContainerHeader next_gendc_descriptor= ContainerHeader(filecontent + descriptor_size + data_size);
```

In this tutorial, let's display the data of the first available image data component, allowing you to extract only that sensor data from the container data. The function `getFirstComponentIndexByTypeID()` returns the index of the first available data component if its datatype matches the parameter. If it returns `-1`, it means no valid data is set on the sensor side.

Here are some datatype difined by GenICam.

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


Since we want to get image (i.e. intensity) data, use `1` for Datatype ID Value.


```c++
// get first available image component
int32_t image_component_index = gendc_descriptor.getFirstComponentIndexByTypeID(1);
```

Now, we can access the header information of the component that contains the image data.
```c++
ComponentHeader image_component = gendc_descriptor.getComponentByIndex(image_component_index);
```

The component has one or more parts. We can iterate through them using a for loop.

```c++
for (int idx = 0; idx < part_count; idx++) {
    PartHeader part = image_component.getPartByIndex(idx);
    int part_data_size = part.getDataSize();
```

To copy image data, we need to create a buffer to store the data in each Part.
```c++
uint8_t* imagedata;
imagedata = new uint8_t [part_data_size];
part.getData(reinterpret_cast<char *>(imagedata));
```

Currently, the image data is in a 1D array format `imagedata`. To display the preview image, we can reshape it by setting the following information:
* Width
* Height
* Color-channel
* Byte-depth

`getDimension()` returns a vector containing the width and height. If the component has more than 1 Part, it has more than one color channel.
```c++
std::vector <int32_t> image_dimension = part.getDimension();
```

To determine the byte-depth, you can calculate it from the total size of the data and the obtained dimension values above.

```c++
int32_t bd = part_data_size / WxH;
```

Now, we copy the data from 1D array `imagedata` to the image-formatized cv::Mat `img` with `memcpy` to display:
```c++
cv::Mat img(image_dimension[1], image_dimension[0], CV_8UC1);
std::memcpy(img.ptr(), imagedata, datasize);
cv::imshow("First available image component", img);

cv::waitKeyEx(1);
```

:::tip

If you want to access some device-specific data stored in TypeSpecific field of GenDC. 

For example, the following GenDC data has `framecount` data at the lower 4 bytes of the 8-byte TypeSpecific3. Note that TypeSpecific starts from N = 1, 2, 3... and index is 0, 1, 2... so the index of TypeSpecific3 is 2.

```c++
int64_t typespecific3 = part.getTypeSpecificByIndex(2);
int32_t framecount = static_cast<int32_t>(typespecific3 & 0xFFFFFFFF);
std::cout << "Framecount: " << framecount<< std::endl;          
```
:::



## Complete code

import {tutorial_version} from "@site/static/version_const/latest.js"
import GenerateTutorialLink from '@site/static/tutorial_link.js';

<GenerateTutorialLink language="cpp" tag={tutorial_version} tutorialfile="tutorial5_parse_gendc_data" />
