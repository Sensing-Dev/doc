---
sidebar_position: 8
---

# Parse GenDC data

In this tutorial, we learn how to user GenDC separator library.

## Prerequisite
 
* GenDC Separator

```bash
pip3 install gendc-python
```

## Tutorial

In the [previous tutorial](save-gendc), we learned how to save GenDC data into a binary file. Now, we will load the data, parse the container, and retrieve some information about the sensor from its descriptor.

### GenDC

GenDC, or Generic Data Container, is defined by the EMVA (European Machine Vision Association). True to its name, it can contain any types of data defined by the camera device, regardless of the data dimension, metadata, or whether they are image sequences/bursts. 

While the format rule is defined in [the official document](https://www.emva.org/wp-content/uploads/GenICam_GenDC_v1_1.pdf), GenDC Separator helps you with easily parsing the whole container.


### Find Binary file.   

If you use the binary file saved in the previous tutorial, the name of the directory should be `tutorial_save_gendc_XXXXXXXXXXXXXX` and binary file prefix is `sensor0-`.

```python
directory_name = "tutorial_save_gendc_XXXXXXXXXXXXXX"
prefix = "sensor0-"
```

The following snippet attempts to retrieve all binary files starting with a specified prefix from a directory. It then reorders all the found binaries according to their recorded order.

```python
bin_files = [f for f in os.listdir(directory_name) if f.startswith(prefix) and f.endswith(".bin")]
bin_files = sorted(bin_files, key=lambda s: int(s.split('-')[-1].split('.')[0]))
```

Now, we go through all ordered binary files in `bf` with for loop.

```python
for bf in bin_files:
```

### Open and load Binary file.  

In the for loop, our target (single) binary file is `bf`. We open this binary file as `ifs` and read the whole content of `itf`.

```python
bin_file = os.path.join(directory_name, bf)

with open(bin_file, mode='rb') as ifs:
    filecontent = ifs.read()
```

### Parse binary file

To use GenDC Separator, you need to import the module first.

```python
from  gendc_python.gendc_separator import descriptor as gendc
```

Then you can attempt to create gendc_descriptor object with `Container` as follows:
```python
gendc_descriptor = gendc.Container(filecontent[cursor:])
``` 

This may return error if the file content does not have GenDC signature.

Now this object contains all information written in the GenDC Descriptor. You can get the size of Descriptor and the size of data. 
```python
# get GenDC container information
descriptor_size = gendc_descriptor.get("DescriptorSize")
print("GenDC Descriptor size:", descriptor_size)
data_size = gendc_descriptor.get("DataSize")
print("GenDC Data size:", data_size)
```

The whole container size is this DescriptorSize and DataSize, so if you want to load the next container information, you can just add the total as the offset of the original data.
```python
next_gendc_descriptor= gendc.Container(filecontent[cursor + descriptor_size + data_size:])
```

In this tutorial, let's get the first available component data size and offset, so that you can get only that sensor data from the container data. `get_first_get_datatype_of` returns the component index of the first available specified type data. Let's set `0x0000000000000001` to look up Intencity i.e. image data. If this returns `-1`, no data is set as valid on the sensor side.

```python
# get first available component
image_component = gendc_descriptor.get_first_get_datatype_of(GDC_INTENSITY)
print("First available image data component is Comp", image_component)
```

We now want to know `image_component`th component data size and offset, so you call `get()` and specify the key and the component index.

```python
image_offseet = gendc_descriptor.get("DataOffset", image_component, 0)
image_datasize = gendc_descriptor.get("DataSize", image_component, 0)
print("\tData offset:", image_offseet)
print("\tData size:", image_datasize)
```

Now, you can copy `filecontent` from offset `image_offseet` for the size of `image_datasize` to obtain imagedata.


:::tip

If you want to access some device-specific data stored in TypeSpecific field of GenDC. 

For example, the following GenDC data has `framecount` data at the TypeSpecific3 in the size of integer.

```python
typespecific3 = gendc_descriptor.get("TypeSpecific", image_component, 0)[2]
print("Framecount: ", int.from_bytes(typespecific3.to_bytes(8, 'little')[0:4], "little"))          
```
:::

## Complete code

import {tutorial_version} from "@site/static/version_const/latest.js"
import GenerateTutorialLink from '@site/static/tutorial_link.js';

<GenerateTutorialLink language="python" tag={tutorial_version} tutorialfile="tutorial5_parse_gendc_data" />
