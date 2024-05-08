---
sidebar_position: 8
---

# Parse GenDC data

In this tutorial, we learn how to user GenDC separator library.

## Prerequisite
 
* GenDC Separator (installed with sensing-dev SDK) 

## Tutorial

In the [previous tutorial](save-gendc), we learn how to save GenDC data into a binary file. Now we load the data and parse the container, and get some information of the sensor from its descriptor.

### GenDC

GenDC is Generic Data Container defined by EMVA. As it is named with generic, it can contain any types of data defined by the camera device no matter what data dimension is, metadata is, and image sequences/bursts are. 

While the format rule is defined in [the official document](https://www.emva.org/wp-content/uploads/GenICam_GenDC_v1_1.pdf), GenDC Separator helps you with easily parsing the whole container.


### Find Binary file.   

If you use the binary file saved in the previous tutorial, the name of the directory should be `tutorial_save_gendc_XXXXXXXXXXXXXX` and binary file prefix is `sensor0-`.

```c++
std::string directory_name = "tutorial_save_gendc_XXXXXXXXXXXXXX";
std::string prefix = "sensor0-";
```

In the following snippet tries to get all bin file starting with this prefix under the directory. Also, reordering all the found binaries in the recorded order.

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
ContainerHeader gendc_descriptor= ContainerHeader(filecontent);
```

Now this object contains all information written in the GenDC Descriptor. You can get the size of Descriptor and the size of data. 
```c++
int32_t descriptor_size = gendc_descriptor.getDescriptorSize();
int64_t data_size = gendc_descriptor.getContainerDataSize();
```

The whole container size is this DescriptorSize and DataSize, so if you want to load the next container information, you can just add the total as the offset of the original data.
```c++
ContainerHeader next_gendc_descriptor= ContainerHeader(filecontent + descriptor_size + data_size);
```

In this tutorial, let's get the first available component data size and offset, so that you can get only that sensor data from the container data. `getFirstAvailableDataOffset` returns the tuple of component index and part index of the first available image data. If this returns `(-1, -1)`, no data is set as valid on the sensor side.

```c++
// get first available image component
std::tuple<int32_t, int32_t> data_comp_and_part = gendc_descriptor.getFirstAvailableDataOffset(true);
std::cout << "First available image data component is Comp " 
    << std::get<0>(data_comp_and_part)
    << ", Part "
    << std::get<1>(data_comp_and_part) << std::endl;
```

We now want to know `std::get<0>(data_comp_and_part)`th component and `std::get<1>(data_comp_and_part)`th part data size and offset, so you call `getDataSize()`.

```c++
int image_datasize = gendc_descriptor.getDataSize(std::get<0>(data_comp_and_part), std::get<1>(data_comp_and_part));
int image_offseet = gendc_descriptor.getDataOffset(std::get<0>(data_comp_and_part), std::get<1>(data_comp_and_part));
std::cout << "\tData size: " << image_datasize << std::endl;
std::cout << "\tData offset: " << image_offseet << std::endl;

```

Now, you can copy `filecontent` from offset `image_offseet` for the size of `image_datasize` to obtain imagedata.


:::tip

If you want to access some device-specific data stored in TypeSpecific field of GenDC. 

For example, the following GenDC data has `framecount` data at the TypeSpecific3 in the size of integer.

```c++
int offset = gendc_descriptor.getOffsetFromTypeSpecific(std::get<0>(data_comp_and_part), std::get<1>(data_comp_and_part), 3, 0);
std::cout << "Framecount: " << *reinterpret_cast<int*>(filecontent + cursor + offset) << std::endl;             
```
:::



## Complete code

import {tutorial_version} from "@site/static/version_const/latest.js"
import GenerateTutorialLink from '@site/static/tutorial_link.js';

<GenerateTutorialLink language="cpp" tag={tutorial_version} tutorialfile="tutorial5_parse_gendc_data" />
