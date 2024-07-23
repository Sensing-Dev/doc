---
sidebar_position: 9
---

# Parse GenDC data

In this tutorial, we learn how to use GenDC separator module.
If your device data format is non-GenDC (general camera acquire images), see the next tutorial page [Parse non-GenDC binary data](./parse-image-bin.md).

If your device is not in GenDC format but you would like to learn about, you can Download sample GenDC which has 6 valid components out of 9 components with 4 different sensor data.

import links from "@site/static/external_link/links.js"

<div class="jsx-section">
<div class="board">
<a class="card" href={links.gendc_sample_data}>sample GenDC data</a>
</div></div>

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

* GenDC Data (obtained in the previous tutorial or Download sample from <a href={links.gendc_sample_data}>this page</a>).

## Tutorial

In the [previous tutorial](save-gendc), we learned how to save GenDC data into a binary file. Now, we will load the data, parse the container, and retrieve some information about the sensor from its descriptor.

:::note
We assume that GenDC used in this tutorial contains at lease one image data component. If your saved data in the previous tutorial, please download sample data from <a href={links.gendc_sample_data}>this page</a>.
:::

### GenDC

GenDC, or Generic Data Container, is defined by the EMVA (European Machine Vision Association). True to its name, it can contain any types of data defined by the camera device, regardless of the data dimension, metadata, or whether they are image sequences/bursts. 

While the format rule is defined in [the official document](https://www.emva.org/wp-content/uploads/GenICam_GenDC_v1_1.pdf), GenDC Separator helps you with easily parsing the whole container.

If you would like to learn the overview of GenDC, please check [this page](../../lessons/GenDC) that gives you the concept and rough structure of GenDC.

### Find Binary file.   

If you use the binary file saved in the previous tutorial, the name of the directory should be `tutorial_save_gendc_XXXXXXXXXXXXXX` and binary file prefix is `gendc0-`.

```python
directory_name = "tutorial_save_gendc_XXXXXXXXXXXXXX"
prefix = "gendc0-"
```

:::info
The complete code provided at the end of this tutorial gives you the command line option.

If you set `-d tutorial_save_gendc_XXXXXXXXXXXXXX` or `--directory tutorial_save_gendc_XXXXXXXXXXXXXX` option when you execute the tutorial program, `directory_name` will be automatically set.

Also, if you are using sample data `output.bin` provided at the top of this tutorial page, you can simply add `-u` or `--use-dummy-data` option so that the program look for downloaded `output.bin`. 
:::

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
container_data_size = gendc_container.get_data_size()
```

The whole container size is this DescriptorSize and DataSize, so if you want to load the next container information, you can just add the total as the offset of the original data.
```python
next_gendc_container= gendc.Container(filecontent[cursor + descriptor_size + container_data_size:])
```

In this tutorial, we will detect which *Component* has image sensor data, get some properties of the sensor data such as 1. how many channels 2. Dimension of data, and 3. Byte-depth of data, and finally display the image with OpenCV.

First of all, we need to find the first available image data *Component* with `get_1st_component_idx_by_typeid()`, which returns the index of the first available data *Component* if its datatype matches the parameter. If it returns `-1`, it means no valid data is set on the sensor side.

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

```python
# get first available component
image_component_idx = gendc_container.get_1st_component_idx_by_typeid(GDC_INTENSITY)
```

Now, we can access the header information of the *Component* that contains the image data.

```python
image_component = gendc_container.get_component_by_index(image_component_idx)
part_count = image_component.get_part_count()
```

The *Component* has one or more *Parts*. We can iterate through them using a for loop. The number of *Parts* for image *Components* are usually the number of color channel. e.g. 1 for Monochrome-space image and 3 for general color-pixel-format such as RGB.

```python
part_count = image_component.get_part_count()
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

If you use sample data provided at the top of this page, you may see the image like this:

![sample image](../img/tutorial5-image.png).

### Example with Sample Data

In the previous section, we learned general idea of parsing GenDC data with GenDC Separator API. Now, we can use sample data provided at the top of this page (or <a href={links.gendc_sample_data}>here</a>)) to handle some non-image data.

![Sample Data structure](../../lessons/img/sample_data_structure.png).

As we have done for image sensor data, we can get 1. how many channels 2. Dimension of data, and 3. Byte-depth of data. We also provide visualize tutorial code for Python version [Visualize GenDC data](./visualize-gendc).

Since all non-image data's Datatype is Metadata, we need another information to access each component. So, finding the target *Component* by TypeId may not be a good idea.

Usually, each *Component* has uniquie SourceId to detect the data. This time, we use `get_1st_component_idx_by_sourceid()` to look for the target *Component*.

| Component Index | Sensor type | Validity | SourceId | TypeId            |
|-----------------|-------------|----------|----------|-------------------|
| 0               | Image       | valid    | 0x1001   | 1 (Intensity)     |
| 1               | Audio       | valid    | 0x2001   | 0x8001 (Metadata) |
| 2               | Analog 1    | valid    | 0x3001   | 0x8001 (Metadata) |
| 3               | Analog 2    | valid    | 0x3002   | 0x8001 (Metadata) |
| 4               | Analog 3    | valid    | 0x3003   | 0x8001 (Metadata) |
| 5               | PMOD        | valid    | 0x4001   | 0x8001 (Metadata) |
| 6               | extra       | invalid  | 0x0001   | 0x8001 (Metadata) |
| 7               | N/A         | invalid  | 0x5001   | 0x8001 (Metadata) |
| 8               | N/A         | invalid  | 0x6001   | 0x8001 (Metadata) |

#### Obtain audio data

Once we know the index of target *Component*, we can create `ComponentHeader` object as well as we did in image *Component*.

```python
component_index = gendc_container.get_1st_component_idx_by_sourceid(0x2001)
audio_component = gendc_container.get_component_by_index(component_index)
```

This *Container* has 2 Parts and they have **Left** and **Right channel** of audio data respectively.

```python
part_count = audio_component.get_part_count()
```

:::info
Some of audio sensor uses interleaved audio, which store Lch and Rch in the same *Part* in turns.
In this case, `audio_component.get_part_count()` returns 1, but you need to re-shape the data into 2-dim to use it.
:::

As we did for image *Component*, we check the data size and dimension of each *Part*.

```python
for j in range(part_count):
    part = audio_component.get_part_by_index(j)
    part_data_size =part.get_data_size()
    dimension = part.get_dimension()
```

Here, `audio_dimension` is `{800}`. Typically, the image *Component* of GenDC stores one frame of data, while other sensor data store samples obtained during the time it takes to acquire one frame of that image data. For example, if the images are being acquired at 60fps, only the samples obtained within 1/60 of a second are stored. This audio data is sampled at 48kHz, and since 800 samples are acquired within 1/60 of a second, the dimension becomes 800.

To know the data-type of this audio data, you need the byte-depth, which can be calculated with the size of data and dimension.

```python
byte_depth = int(part_data_size / w_h_c)
```

Since `part_data_size` is 1600, we now know the byte-depth is `2`, so the data-type is `int16_t`. 

If you visualize this data with [Python tutorial code](./visualize-gendc), you may see the following plot:

![sample image](../img/tutorial5-audio.png).

#### Obtain analog data

This GenDC data has 3 analog sensors which has identifier `0x3001`, `0x3002`, and `0x3003`. We can find the index of *Component* with `get_1st_component_idx_by_sourceid()` as well.

```python
component_index = gendc_container.get_1st_component_idx_by_sourceid(0x3001)
analog_component = gendc_container.get_component_by_index(component_index)
```

Each analog sensor's Component has a single *Part*, which can be confirmed with `get_part_count()`.

```python
part_count = analog_component.get_part_count()
```

You can get *Part* to know data size, dimension (number of samples), and byte-depth as well.

```python
for j in range(part_count):
    part = analog_component.get_part_by_index(j)
    part_data_size =part.get_data_size()
    dimension = part.get_dimension()
```

If you visualize this data with [Python tutorial code](./visualize-gendc), you may see the following plot:

![sample image](../img/tutorial5-analog.png).

#### Obtain PMOD data

This GenDC data has 1 PMOD accelerometer sensor, which is connected to accelerometer recording the x, y, and z coordinate information. Therefore, the number of *Parts* is 3.

```python
component_index = gendc_container.get_1st_component_idx_by_sourceid(0x4001)
pmog_component = gendc_container.get_component_by_index(component_index)
part_count = pmog_component.get_part_count()
```

:::info
Some of accelerometer sensor uses interleaved structure, which store X, Y, and Z coordinate in the same *Part* in turns.
In this case, `pmog_component.get_part_count()` returns 1, but you need to re-shape the data into 3-dim (or 4-dim with 1 dummy channel) to use it.
:::

You can get *Part* to know data size, dimension (number of samples), and byte-depth as well.

```python
for j in range(part_count):
    part = pmog_component.get_part_by_index(j)
    part_data_size =part.get_data_size()
    dimension = part.get_dimension()
```

Since each *Part* have x, y, and z data respectively, with [Python tutorial code](./visualize-gendc), you may see the following plot:

![sample image](../img/tutorial5-pmod.png).

#### Use Typespecific information

If you want to access some device-specific data stored in TypeSpecific field of GenDC. 

For example, the following GenDC data has `framecount` data at the lower 4 bytes of the 8-byte TypeSpecific3.

Note that TypeSpecific starts from N = 1, 2, 3... and index is 0, 1, 2... so the index of TypeSpecific3 is 2.

```python
typespecific3 = part.get_typespecific_by_index(2)
print("Framecount: ", int.from_bytes(typespecific3.to_bytes(8, 'little')[0:4], "little"))          
```


## Complete code

import {tutorial_version} from "@site/static/version_const/latest.js"
import GenerateTutorialLink from '@site/static/tutorial_link.js';

<GenerateTutorialLink language="python" tag={tutorial_version} tutorialfile="tutorial5_parse_gendc_data" />
