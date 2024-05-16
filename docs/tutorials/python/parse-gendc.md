---
sidebar_position: 8
---

# Parse GenDC data

In this tutorial, we learn how to user GenDC separator library.

## Prerequisite
 
* GenDC Separator
* OpenCV
* numpy

import this_version from "@site/static/version_const/latest.js"

<pre>
<code class="language-bash">
pip3 install -U pip<br />
pip3 install opencv-python<br />
pip3 install numpy<br />
pip3 install gendc-python=={this_version.gendc_python_version}<br />
</code>
</pre>

## Tutorial

In the [previous tutorial](save-gendc), we learned how to save GenDC data into a binary file. Now, we will load the data, parse the container, and retrieve some information about the sensor from its descriptor.

### GenDC

GenDC, or Generic Data Container, is defined by the EMVA (European Machine Vision Association). True to its name, it can contain any types of data defined by the camera device, regardless of the data dimension, metadata, or whether they are image sequences/bursts. 

While the format rule is defined in [the official document](https://www.emva.org/wp-content/uploads/GenICam_GenDC_v1_1.pdf), GenDC Separator helps you with easily parsing the whole container.


### Find Binary file.   

If you use the binary file saved in the previous tutorial, the name of the directory should be `tutorial_save_gendc_XXXXXXXXXXXXXX` and binary file prefix is `gendc0-`.

```python
directory_name = "tutorial_save_gendc_XXXXXXXXXXXXXX"
prefix = "gendc0-"
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
from gendc_python.gendc_separator import descriptor as gendc
```

Then you can attempt to create gendc_descriptor object with `Container` as follows:
```python
gendc_container = gendc.Container(filecontent[cursor:])
``` 

This may return error if the file content does not have GenDC signature.

Now this object contains all information written in the GenDC Descriptor. You can get the size of Descriptor and the size of data. 
```python
# get GenDC container information
descriptor_size = gendc_container.get_descriptor_size()
print("GenDC Descriptor size:", descriptor_size)
container_data_size = gendc_container.get_data_size()
print("GenDC Data size:", container_data_size)
```

The whole container size is this DescriptorSize and DataSize, so if you want to load the next container information, you can just add the total as the offset of the original data.
```python
next_gendc_container= gendc.Container(filecontent[cursor + descriptor_size + container_data_size:])
```

In this tutorial, let's get the first available component data size and offset, so that you can get only that sensor data from the container data. `get_1st_component_idx_by_typeid` returns the component index of the first available specified type data. Let's set `0x0000000000000001` to look up Intencity i.e. image data. If this returns `-1`, no data is set as valid on the sensor side.

```python
# get first available component
image_component_idx = gendc_container.get_1st_component_idx_by_typeid(GDC_INTENSITY)
print("First available image data component is Comp", image_component_idx)
```

```python
image_component = gendc_container.get_component_by_index(image_component_idx)
part_count = image_component.get_part_count()
print("\tData Channel: ", part_count)
```

We now want to know `image_component_idx`th component, so you call `gendc_container()` to obtain the Component to know its information. 

Each component has one or more parts, and the number of parts generally stands for the color channel if the component has image data. We can iterate through them using a for loop.

```python
for part_id in range(part_count):
    part = image_component.get_part_by_index(part_id)
    part_data_size =part.get_data_size()
```

Altough we now know the `part_data_size`, we need to reshape it into width x height to display. To do so, we need the following information:
* Width
* Height
* Color-channel
* Byte-depth

`ged_dimension` returns a vector containing the width and height. If the component has more than 1 Part, it has more than one color channel.

```python
dimension = part.get_dimension()
```

To determine the byte-depth, you can calculate it from the total size of the data and the obtained dimension values above.
```python
w_h_c = part_count
for d in dimension:
    w_h_c *= d
byte_depth = int(part_data_size / w_h_c)
```

Now, we copy the data from 1D array `image` to the image-formatized widht by height to display:
```python
width = dimension[0]
height = dimension[1]
if byte_depth == 1:
    image = np.frombuffer(part.get_data(), dtype=np.uint8).reshape((height, width))
elif byte_depth == 2:
    image = np.frombuffer(part.get_data(), dtype=np.uint16).reshape((height, width))
cv2.imshow("First available image component", image)
cv2.waitKey(1)
```

:::tip

If you want to access some device-specific data stored in TypeSpecific field of GenDC. 

For example, the following GenDC data has `framecount` data at the lower 4 bytes of the 8-byte TypeSpecific3.
```python
typespecific3 = part.get_typespecific_by_index(3)
print("Framecount: ", int.from_bytes(typespecific3.to_bytes(8, 'little')[0:4], "little"))          
```
:::

## Complete code

import {tutorial_version} from "@site/static/version_const/latest.js"
import GenerateTutorialLink from '@site/static/tutorial_link.js';

<GenerateTutorialLink language="python" tag={tutorial_version} tutorialfile="tutorial5_parse_gendc_data" />
