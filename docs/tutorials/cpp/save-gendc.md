---
sidebar_position: 7
---

# Save Sensor Data

In this tutorial, we learn how to save data transferred from sensor into a binary file.

## Prerequisite
 
* ion-kit (installed with sensing-dev SDK) 

## Tutorial

In the previous tutorials, we used a single BB in a pipeline to obtain sensor data. Now, we add binarysaver BB so that we have the flow 1. Acquire data then 2. Save data in the pipeline.

![binarysaver-bb-after-data-acquisition-BB](../img/tutorial4-single-sensor.png)

### Build a pipeline

The process of initialize the pipeline `Builder` is the exactly same as the one in the previous tutorials. 

```c++
// pipeline setup
Builder b;
b.set_target(ion::get_host_target());
b.with_bb_module("ion-bb");
```

As the succeesind BB of the sensor data acquisision BB, we connect binarysaver BB so that we have the flow 1. Acquire data then 2. Save data in the pipeline.

The actual BB depends on what type of sensor data you use. In this tutorial, we introduce the example how to save GenDC data.

|           | Data Acquisition BB                            | Binary saver BB                                  |
|-----------|------------------------------------------------|--------------------------------------------------|
| GenDC     | image_io_u3v_gendc                             | image_io_u3v_binary_gendc_saver                  |
| non-GenDC | image_io_u3v_cameraN_u&ltbyte-depth&gtx<dim&gt | image_io_binarysaver_u&ltbyte-depth&gtx&ltdim&gt |

Now, we add two BBs to our pipeline `b`. The second BB `image_io_u3v_binary_gendc_saver` requires 3 input for BB's port: GenDC data, Device Information, and PayloadSize.

```c++
// add the first BB to acquire data
Node n = b.add("image_io_u3v_gendc")();
// add the second BB to save binary data 
n = b.add("image_io_binary_gendc_saver")(n["gendc"], n["device_info"], &payloadsize);
```

GenDC data and Device Information are obtained by the acuisition BB in the previous node `image_io_u3v_gendc`. Payloadsize is the whole size of GenDC container, which you can gain with `arv-tool-0.8 -n <device name> control PayloadSize` on console. To see the detail usage, please check [arv-tool-0.8](../../external/aravis/arv-tools).


:::tip

### For non-GenDC data

If the BBs are for GenDC, it does not have input/output of `frame_count`, while non-GenDC BBs have it. See the details in the following table.

|           | Output of Data Acquisition BB                  | Input of Binary saver BB                         |
|-----------|------------------------------------------------|--------------------------------------------------|
| GenDC     | gendc; device_info                             | gendc; device_info; payloadsize                  |
| non-GenDC | output; device_info; frame_count               | output; device_info; frame_count; width; height  |

width and height could be obtained with [arv-tool-0.8](../../external/aravis/arv-tools) as same as payloadsize in the example above.

### For multi-sensor data

If you acquire more than 1 sensor data in the first BB with `Param("num_devices", 2)`, you have to save them in the separate binary saver BB, otherwise one sensor data will overwrite the other.

![binarysaver-bb-after-data-acquisition-BB-multi-sensor](../img/tutorial4-multi-sensor.png)

You can access each sensor's output data of the first BB by using index `[]` as follows. Make sure that you set `Param("prefix", "sensor0-")` and `Param("prefix", "sensor1-")` for each binary saver BB so that it won't overwrite the content each other.

```c++
Node n = b.add("image_io_u3v_gendc")().set_param(Param("num_devices", 2),);

if (num_device == 2){
    Node n1 = b.add("image_io_binary_gendc_saver")(n["gendc"][1], n["device_info"][1], &payloadsize)
    .set_param(
        Param("prefix", "sensor1-"),
        Param("output_directory", saving_diretctory)
    );
    Halide::Buffer<int> output1 = Halide::Buffer<int>::make_scalar();
    n1["output"].bind(output1);
}

n = b.add("image_io_binary_gendc_saver")(n["gendc"][0], n["device_info"][0], &payloadsize)
    .set_param(
        Param("prefix", "sensor0-"),
        Param("output_directory", saving_diretctory)
    );
```


:::

### Set output port

Binary file would be saved inside of the process of binary saver BB, while we get a scaler output of the pipeline.

This is just a terminal flag to see if the BB successfully saved the data or not, so you may not care the value inside. We just need to create an output buffer to receive it.

```c++
Halide::Buffer<int> output = Halide::Buffer<int>::make_scalar();
n["output"].bind(output);
```

### Execute the pipeline

Execute `builder.run()` to finish the pipeline as usual.

The binary data will be saved `<output directory>/<prefix>0.bin`, `<output directory>/<prefix>1.bin`, `<output directory>/<prefix>2.bin`... as a default, output directory is the current directory and prefix is `raw-`. To set these values, please use `Param` in the binary saver BB.

## Complete code

import {tutorial_version} from "@site/static/version_const/latest.js"
import GenerateTutorialLink from '@site/static/tutorial_link.js';

<GenerateTutorialLink language="cpp" tag={tutorial_version} tutorialfile="tutorial4_save_data" />
