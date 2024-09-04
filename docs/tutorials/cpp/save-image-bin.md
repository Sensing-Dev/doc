---
sidebar_position: 8
---

# Save Sensor Data (non-GenDC)

In this tutorial, we will learn how to save GenDC data transferred from a sensor into a binary file.
If your device data format is GenDC, and if you prefer to save a whole GenDC container instead of only image data, see the previous tutorial page [Save Sensor Data (GenDC)](./save-gendc.md).

## Prerequisite
 
* ion-kit (installed with sensing-dev SDK) 

## Tutorial

In previous tutorials, we utilized a single building block (BB) in a pipeline to acquire sensor data. Now, we're incorporating the binarysaver BB to enable a two-step flow: 1. Acquiring data, and 2. Saving data within the pipeline.

![binarysaver-bb-after-data-acquisition-BB](../img/tutorial4-single-sensor.png)

### Build a pipeline

The process of initializing the pipeline `Builder` is exactly the same as in the previous tutorials. 

```c++
// pipeline setup
Builder b;
b.set_target(ion::get_host_target());
b.with_bb_module("ion-bb");
```

As the succeeding building block (BB) after the sensor data acquisition BB, we connect the binarysaver BB to establish the flow: 1. Acquire data, then 2. Save data in the pipeline.

The specific building block (BB) utilized depends on the type of sensor data being used. In this tutorial, we present an example demonstrating how to save Mono12 image data. If your device data format is GenDC, and if you prefer to save a whole GenDC container instead of only image data, see the previous tutorial page [Save Sensor Data (GenDC)](./save-gendc.md).

|           | Data Acquisition BB                            | Binary saver BB                                  |
|-----------|------------------------------------------------|--------------------------------------------------|
| non-GenDC | image_io_u3v_cameraN_u&ltbyte-depth&gtx<dim&gt | image_io_binarysaver_u&ltbyte-depth&gtx&ltdim&gt |
| non-GenDC<br/>(e.g. Mono8) | image_io_u3v_cameraN_u8x2 | image_io_binarysaver_u8x2 |
| non-GenDC<br/>(e.g. Mono12) | image_io_u3v_cameraN_u16x2 | image_io_binarysaver_u16x2 |
| non-GenDC<br/>(e.g. RGB8) | image_io_u3v_cameraN_u8x3 | image_io_binarysaver_u8x3 |

We are now adding two BBs to our pipeline `b`. The second BB, `image_io_u3v_cameraN_u16x2`, requires five inputs for its ports: Image data, Device Information, and framecount, image width and height.

```c++
// add the first BB to acquire data
int32_t w = <width of image>;
int32_t h = <height of image>;
Node n = b.add("image_io_u3v_cameraN_u16x2")();
// add the second BB to save binary data 
n = b.add("image_io_binarysaver_u16x2")(n["output"], n["device_info"], n["frame_count"][i], &w, &h);
```

Image data, Device Information, and framecount are obtained by the acquisition BB in the previous node, `image_io_u3v_cameraN_u16x2`. The width and height can be retrieved using the command `arv-tool-0.8 -n <device name> control Width Height` in the console. For detailed usage instructions, please refer to [arv-tool-0.8](../../external/aravis/arv-tools).

:::tip

### For multi-sensor data

If you acquire data from more than one sensor in the first BB using `Param("num_devices", 2)`, you must save them separately using individual binary saver BBs. Otherwise, the data from one sensor will overwrite the data from the other.

![binarysaver-bb-after-data-acquisition-BB-multi-sensor](../img/tutorial4-multi-sensor.png)

To access the output data from each sensor in the first BB, you can use indexing `[]` as follows. Ensure that you set `Param("prefix", "image0-")` and `Param("prefix", "image1-")` for each binary saver BB to prevent them from overwriting each other's content.

```c++
Node n = b.add("image_io_u3v_cameraN_u16x2")().set_params(Param("num_devices", 2),);

if (num_device == 2){
    int32_t payloadsize1 = payloadsize[1];
    Node n1 = b.add("image_io_binarysaver_u16x2")(n["output"][1], n["device_info"][1], n["frame_count"][i], &w, &h);
   .set_params(
       Param("prefix", "image1-"),
       Param("output_directory", saving_diretctory)
   );
   n1["output"].bind(outputs[1]);
}

int32_t payloadsize0 = payloadsize[0];
n = b.add("image_io_binarysaver_u16x2")(n["output"][0], n["device_info"][0], n["frame_count"][i], &w, &h);
   .set_params(
       Param("prefix", "image0-"),
       Param("output_directory", saving_diretctory)
   );
n["output"].bind(outputs[0]);
```

If we have multiple devices, make sure that each width and height matche respectively:
```C++
# bind input values to the input port
std::vector<int32_t> width = {1920, 1920};
std::vector<int32_t> height = {1080, 1080};
int32_t w = width[0];
...
n = b.add("image_io_binimage_io_binarysaver_u16x2ary_gendc_saver")(n["output"][0], n["device_info"][0], n["frame_count"][i], &w, &h);
...
```

:::

### Set output port

The binary file will be saved within the binary saver BB process, while we obtain a scalar output from the pipeline.

This is merely a terminal flag to indicate whether the BB successfully saved the data or not, so the specific value inside may not be of concern. We simply need to create an output buffer to receive it.

```c++
Halide::Buffer<int> output = Halide::Buffer<int>::make_scalar();
n["output"].bind(output);
```

### Execute the pipeline

Execute `builder.run()` to finish the pipeline as usual.

By default, the binary data will be saved in the following format: `<output directory>/<prefix>0.bin`, `<output directory>/<prefix>1.bin`, `<output directory>/<prefix>2.bin`, and so forth. The default output directory is the current directory, and the default prefix is `raw-`. To customize these values, please utilize the `Param` within the binary saver BB.

## Complete code

import {tutorial_version} from "@site/static/version_const/latest.js"
import GenerateTutorialLink from '@site/static/tutorial_link.js';

<GenerateTutorialLink language="cpp" tag={tutorial_version} tutorialfile="tutorial4_save_image_bin_data" />
