---
sidebar_position: 4
---

# GenDC

[GenICam (Generic Interface for Cameras)](https://www.emva.org/standards-technology/genicam/)  is a generic software standard defined by the [**EMVA**&#128279;](https://www.emva.org/). It specifies the API, naming conventions, transport layers, control protocols, and data containers.

In this document, we will explore GenDC (Generic Data Container) using sample data provided in our repository.

An overview of GenICam can be found on the [About U3V Camera](camera) page.

## Concept of GenDC

As its name suggests, GenDC is designed for generic data. Data stored in GenDC can include image data (2D, 3D, and multi-spectral), audio data, or other metadata. The stored data can be single or multiple.

Since the stored data can be of any type, size, dimension, and format, it is necessary to include notes about the data so that those who load the GenDC will know what data is in the container.

GenDC includes a *Descriptor* alongside the data, which describes all the details about the contained data.

The official document is [here](https://www.emva.org/wp-content/uploads/GenICam_GenDC_v1_1.pdf) provided by EMVA.

## Descriptor/Data and Container/Component/Part

As mentioned in previous sections, GenDC consists of 2 different submodules: *Descriptor* and *Data*. *Descriptor* describes all the details about the contained data.

![GenDC Descriptor and Data](./img/gendc_descriptor_and_data.png)

Meanwhile, GenDC has a hierarchical structure to organize multiple data by setting the 3 different levels: *Container*, *Component*, and *Part*. The *Container* represents the whole GenDC, which has one or more *Components*, and each *Component* contains one or more *Parts*. The *Descriptor* at each level is called *Header*, and each *Part* handles the actual data in GenDC.

![GenDC Container Component and Part](./img/gendc_structure.png)

For example, if you want to store a single 2D monochrome image in GenDC, your *Container* would have one *Component*, and that *Component* would have one *Part*.

However, if you want to store a 2D RGB planar intensity image and its metadata in GenDC, it is a good idea to have two *Components* -- one for the image and one for the metadata. Additionally, the *Component* for the image would have three *Parts* to store the R, G, and B data respectively, while the *Component* for metadata may require one *Part* to store the metadata chunk.

## Content of Headers

We have now learned that the *Descriptor* (*Container Header*, *Component Header*, and *Part Header*) contains all the information about the data in GenDC. To use this data in practice, you need to know where the data is located in GenDC (offset), the size of the data, and what it represents.

We can know which information is located in a *Header*, but it is hard to manage if the container has multiple *Components* and *Parts*.

Therefore, we introduce [**GenDC Separator**](https://github.com/Sensing-Dev/GenDC) to easily obtain the properties in the *Descriptor*.

Without using the GenDC Separator, we need to know the size and offset of the target property in the *Descriptor*. Here is an example to get *component1_part1_dimension*, which is "the first component's data dimension". The values 56, 48, and 40 are the offsets of the target property in each Header. We also need to check if the data is 1D or 2D.

```cpp

int64_t component1_offset = *(reinterpret_cast<int64_t*>(gendc_binary_data + 56));
int64_t component1_part1_offset = *(reinterpret_cast<int64_t*>(gendc_binary_data + component1_offset + 48));
int16_t component1_part1_headertype = *(reinterpret_cast<int16_t*>(gendc_binary_data + component1_part1_offset));

if ((component1_part1_headertype & 0xFF00) == 0x4100){
    // data is 1D
    std::vector<int32_t> component1_part1_dimension(1);
    int64_t target_raw_data = *(reinterpret_cast<int64_t*>(gendc_binary_data + component1_part1_offset + 40));
    component1_part1_dimension[0] = static_cast<int32_t>(target_raw_data);
}else if ((component1_part1_headertype & 0xFF00) == 0x4200){
    // data is 2D
    std::vector<int32_t> component1_part1_dimension(2);
    component1_part1_dimension[0] = *(reinterpret_cast<int32_t*>(gendc_binary_data + component1_part1_offset + 40));
    component1_part1_dimension[1] = *(reinterpret_cast<int32_t*>(gendc_binary_data + component1_part1_offset + 44));
}
```

By using the GenDC Separator API, you can intuitively and easily access information within Containers, Components, and Parts without needing to know the structure of GenDC.

```cpp
#include "gendc_separator/ContainerHeader.h"

ContainerHeader gendc_descriptor = ContainerHeader(binary_data);
ComponentHeader component1 = gendc_descriptor.getComponentByIndex(1);
PartHeader component1_part1 = component1.getPartByIndex(1);
std::vector<int32_t> component1_part1_dimension = component1_part1.getDimension();
```

To learn this with the actual code, please check **Tutorial 5 Parse GenDC data** ([C++](./../tutorials/cpp/parse-gendc) and [Python](./../tutorials/python/parse-gendc)).

If your device is not in GenDC format, you can use the sample data we provide below in the tutorial.

<!-- import '/src/css/home.css'; -->

<div class="jsx-section">
<div class="board">
<a class="card" href={"https://github.com/Sensing-Dev/GenDC/tree/main/test/generated_stub"}>sample GenDC data</a>
</div></div>

This GenDC contains data of an image sensor, an audio sensor, three analog sensors, a PMOD sensor. Also, three extra *Components* for extra space that are **disabled** for this time.

![Sample Data structure](./img/sample_data_structure.png)

:::info
With the device setting, GenDC may have **valid** *Components* and **invalid** *Components*. i.e. The device can keep its *Component* while not storing data when it is **invalid**.
:::

To quickly parse information of the whole container, you can load the binary file and use `displayHeaderInfo()`. In the **Tutorial 5 Parse GenDC data** ([C++](./../tutorials/cpp/parse-gendc) and [Python](./../tutorials/python/parse-gendc)), we learn how to get each property and to use. For Python, we also introduce how to visualize the data as 2D and 3D graphs with matplotlib.

#### Sample code

```cpp
#include "gendc_separator/ContainerHeader.h"
#include "gendc_separator/tools.h"

...

// open the sample binary file
std::ifstream ifs("output.bin", std::ios::binary);
// check the size of file
ifs.seekg(0, std::ios::end);
std::streampos filesize = ifs.tellg();
ifs.seekg(0, std::ios::beg);
// prepare the pointer to copy the data
char* filecontent = new char[filesize];
// copy the data from opened file to the pointer
ifs.read(filecontent, filesize);

// get Container information
ContainerHeader gendc_descriptor = ContainerHeader(filecontent);
// display Container information
gendc_descriptor.displayHeaderInfo();

for (int ith_comp_idx = 0; ith_comp_idx < gendc_descriptor.getComponentCount(); ith_comp_idx++){
    // get Component information
    ComponentHeader ith_component = gendc_descriptor.getComponentByIndex(ith_comp_idx);
    // display Component information
    ith_component.displayHeaderInfo();

    for (int jth_part_idx = 0; jth_part_idx < ith_component.getPartCount(); jth_part_idx++){
        // get Part information
        PartHeader jth_part = ith_component.getPartByIndex(jth_part_idx);
        // display Part information
        jth_part.displayHeaderInfo();
    }
}
```

#### Output

```bash
CONTAINER HEADER
              Signature_   (4):        0x43444e47
                Version_   (1):        0x1
                           (1):        0x0
                           (1):        0x0
               Reserved_   (1):         0
             HeaderType_   (2):        0x1000
                  Flags_   (2):        0x2
             HeaderSize_   (4):       128
                     Id_   (8):         1
         VariableFields_   (8):        0x0
               DataSize_   (8):   2076992
             DataOffset_   (8):      1520
         DescriptorSize_   (4):      1520
         ComponentCount_   (4):         9
        ComponentOffset_   (8):       128
                           (8):       256
                           (8):       464
                           (8):       592
                           (8):       720
                           (8):       848
                           (8):      1136
                           (8):      1264
                           (8):      1392

COMPONENT HEADER
                     HeaderType_   (2):        0x2000
                          Flags_   (2):        0x0
                     HeaderSize_   (4):        56
                       Reserved_   (2):        0x0
                        GroupId_   (2):        0x0
                       SourceId_   (2):        0x1001
                       RegionId_   (2):        0x0
                  RegionOffsetX_   (4):         0
                  RegionOffsetY_   (4):         0
                      Timestamp_   (8):195054959330
                         TypeId_   (8):        0x1
                         Format_   (4):        0x1080001
                      Reserved2_   (2):        0x0
                      PartCount_   (2):         1
                     PartOffset_   (8):       184

PART HEADER
                             HeaderType_   (2):        0x4200
                                  Flags_   (2):        0x0
                             HeaderSize_   (4):        72
                                 Format_   (4):        0x1080001
                               Reserved_   (2):        0x0
                                 FlowId_   (2):         0
                             FlowOffset_   (8):         0
                               DataSize_   (8):   2073600
                             DataOffset_   (8):      1520
                              Dimension_   (4):      1920
                                           (4):      1080
                                Padding_   (4):         0
                           InfoReserved_   (4):         0
                           TypeSpecific_   (8):       232
                                           (8):         0
                                           (8):     11520
                                           (8):         0
...
```

Full output file is available [here](https://github.com/Sensing-Dev/GenDC/blob/main/test/generated_stub/content.txt).