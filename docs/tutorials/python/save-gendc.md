---
sidebar_position: 7
---

# Save Sensor Data (GenDC)

In this tutorial, we will learn how to save data transferred from a sensor into a binary file.

If your device data format is non-GenDC (general camera acquire images), see the next tutorial page [Save Sensor Data (non-GenDC)](./save-image-bin.md).

## Tutorial

In previous tutorials, we utilized a single building block (BB) in a pipeline to acquire sensor data. Now, we're incorporating the binarysaver BB to enable a two-step flow: 1. Acquiring data, and 2. Saving data within the pipeline.

![binarysaver-bb-after-data-acquisition-BB](../img/tutorial4-single-sensor.png)

### Build a pipeline

The process of initializing the pipeline `Builder` is exactly the same as in the previous tutorials. 

```python
# pipeline setup
builder = Builder()
builder.set_target('host')
builder.with_bb_module('ion-bb')
```

As the succeeding building block (BB) after the sensor data acquisition BB, we connect the binarysaver BB to establish the flow: 1. Acquire data, then 2. Save data in the pipeline.

The specific building block (BB) utilized depends on the type of sensor data being used. In this tutorial, we present an example demonstrating how to save GenDC data. If your device data format is non-GenDC (general camera acquire images), see the next tutorial page [Save Sensor Data (non-GenDC)](./save-image-bin.md).

|           | Data Acquisition BB                            | Binary saver BB                                  |
|-----------|------------------------------------------------|--------------------------------------------------|
| GenDC     | image_io_u3v_gendc                             | image_io_u3v_binary_gendc_saver                  |

We are now adding two BBs to our pipeline `builder`. The second BB, `image_io_u3v_binary_gendc_saver`, requires three inputs for its ports: GenDC data, Device Information, and PayloadSize.

```python
# set port
payloadsize_p = Port('payloadsize', Type(TypeCode.Int, 32, 1), 0)
# bind input values to the input port
payloadsize_p.bind(payloadsize)

# add the first BB to acquire data
node = builder.add("image_io_u3v_gendc")
# add the second BB to save binary data 
node_sensor0 = builder.add("image_io_binary_gendc_saver").set_iports([node.get_port('gendc')[0], node.get_port('device_info')[0], payloadsize_p, ])
```

The GenDC data and Device Information are obtained by the acquisition BB in the previous node, `image_io_u3v_gendc`. The PayloadSize represents the entire size of the GenDC container, which can be retrieved using the command `arv-tool-0.8 -n <device name> control PayloadSize` in the console. For detailed usage instructions, please refer to [arv-tool-0.8](../../external/aravis/arv-tools).

:::tip

### For multi-sensor data

If you acquire data from more than one sensor in the first BB using `Param("num_devices", 2)`, you must save them separately using individual binary saver BBs. Otherwise, the data from one sensor will overwrite the data from the other.

![binarysaver-bb-after-data-acquisition-BB-multi-sensor](../img/tutorial4-multi-sensor.png)

To access the output data from each sensor in the first BB, you can use indexing `[]` as follows. Ensure that you set `Param("prefix", "gendc0-")` and `Param("prefix", "gendc1-")` for each binary saver BB to prevent them from overwriting each other's content.

```python
if num_device ==2 :
    t_node1 = builder.add("image_io_binary_gendc_saver") \
        .set_iports([node.get_port('gendc')[1], node.get_port('device_info')[1], payloadsize_ps[1], ]) \
        .set_params([output_directory,
                    Param('prefix', 'gendc1-')])
    # create halide buffer for output port
    terminator1 = t_node1.get_port('output')
    output1 = Buffer(Type(TypeCode.Int, 32, 1), ())
    terminator1.bind(output1)
```

If we have multiple devices, make sure that each payloadsize matches and bound respectively:
```python
# bind input values to the input port
for i in range(num_device):
    payloadsize_ps[i].bind(payloadsize[i])
```

:::

### Set output port

The binary file will be saved within the binary saver BB process, while we obtain a scalar output from the pipeline.

This is merely a terminal flag to indicate whether the BB successfully saved the data or not, so the specific value inside may not be of concern. We simply need to create an output buffer to receive it.

```python
# create halide buffer for output port
terminator0 = node_sensor0.get_port('output')
output0 = Buffer(Type(TypeCode.Int, 32, 1), ())
terminator0.bind(output0)
```

### Execute the pipeline

Execute `builder.run()` to finish the pipeline as usual.

By default, the binary data will be saved in the following format: `<output directory>/<prefix>0.bin`, `<output directory>/<prefix>1.bin`, `<output directory>/<prefix>2.bin`, and so forth. The default output directory is the current directory, and the default prefix is `raw-`. To customize these values, please utilize the `Param` within the binary saver BB.

## Complete code

import {tutorial_version} from "@site/static/version_const/latest.js"
import GenerateTutorialLink from '@site/static/tutorial_link.js';

<GenerateTutorialLink language="python" tag={tutorial_version} tutorialfile="tutorial4_save_gendc_data" />
