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

![The outline of Software Stack](./img/gendc_descriptor_and_data.png)

Meanwhile, GenDC has a hierarchical structure to organize multiple data by setting the 3 different levels: *Container*, *Component*, and *Part*. The *Container* represents the whole GenDC, which has one or more *Components*, and each *Component* contains one or more *Parts*. The *Descriptor* at each level is called *Header*, and each *Part* handles the actual data in GenDC.

![The outline of Software Stack](./img/gendc_structure.png)

For example, if you want to store a single 2D monochrome image in GenDC, your *Container* would have one *Component*, and that *Component* would have one *Part*.

However, if you want to store a 2D RGB planar intensity image and its metadata in GenDC, it is a good idea to have two *Components* -- one for the image and one for the metadata. Additionally, the *Component* for the image would have three *Parts* to store the R, G, and B data respectively, while the *Component* for metadata may require one *Part* to store the metadata chunk.

## Content of Headers

We have now learned that the *Descriptor* (*Container Header*, *Component Header*, and *Part Header*) contains all the information about the data in GenDC. To use this data in practice, you need to know where the data is located in GenDC (offset), the size of the data, and what it represents.

We can know which information is located in a *Header*, but it is hard to manage if the container has multiple *Components* and *Parts*.

Therefore, we introduce [**GenDC Separator**](https://github.com/Sensing-Dev/GenDC) to easily obtain the properties in the *Descriptor*.

Without using the GenDC Separator, we need to know the size and offset of the target property in the *Descriptor*. Here is an example to get *component1_part1_dimension*, which is "the first component's data dimension". The values 56, 48, and 40 are the offsets of the target property in each Header. We also need to check if the data is 1D or 2D.

```C++

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

```C++
#include "gendc_separator/ContainerHeader.h"

ContainerHeader gendc_descriptor = ContainerHeader(binary_data);
ComponentHeader component1 = gendc_descriptor.getComponentByIndex(1);
PartHeader component1_part1 = component1.getPartByIndex(1);
std::vector<int32_t> component1_part1_dimension = component1_part1.getDimension();
```

To learn this with the actual code, please check **Tutorial 5 Parse GenDC data** ([C++](./../tutorials/cpp/parse-gendc) and [Python](./../tutorials/python/parse-gendc)).

In the tutorial, we provide the [sample GenDC data](https://github.com/Sensing-Dev/GenDC/tree/main/test/generated_stub) acquired from U3V camera device whose data format is GenDC.
