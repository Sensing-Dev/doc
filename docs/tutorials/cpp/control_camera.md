---
sidebar_position: 5
---

# Control Camera in BB

In this tutorial, we learn how to control Gain and ExposureTime in Building Block.

To control Gain and ExposureTime without BB, you may want to see [Access and Set Device Info](./set-device-info) or [arv-tool-0.8](../../external/aravis/arv-tools).

## Prerequisite

* OpenCV (installed with sensing-dev SDK with `-InstallOpenCV` option) 
* ion-kit (installed with sensing-dev SDK) 

## Tutorial

### Get Device Information

To display image with ionpy, we need to get the following information of the device.

* Width
* Height
* PixelFormat

The [previous tutorial](obtain-device-info.md) or [arv-tool-0.8](../../external/aravis/arv-tools.md) will help to get these values.

### Build a pipeline

While the structurte of BB is the same as the [tutorial that display 1-camera image](display-image), we need some small changes to enable `Gain` and `ExposureTime` setting.

In this tutorial, we can set `Gain` and `ExposureTime` manually by setting enable_control to `true`.

While port input is dynamic; i.e. it can be updated for each run, you can set static values in string via Param. For example, the value of `Gain` and `ExposureTime` is set by port to update in each run, and the key of these values are static, so whould be set by Param as follows:

```c++
// set params
Param enable_control("enable_control", true),
Param gain_key("gain_key", "Gain"),
Param exposure_key("exposure_key", "ExposureTime")

// set port values
double gain0 = 35.0;
double exposuretime0 = 50.0;
double gain1 = 47.0;
double exposuretime1 = 100.0;

gain_values = []
exposure_values = []

Node n = b.add(bb_name)(&gain0, &exposuretime0)
    .set_param(
        Param("num_devices", num_device),
        Param("frame_sync", true),
        Param("realtime_diaplay_mode", false),
        Param("enable_control", true),
        Param("gain_key", "Gain"),
        Param("exposure_key", "ExposureTime")
    );
```
Now, we have set `Gain` and `ExposureTime` successfully!

:::note
While v23.11.01 requires BB to take a port for `Gain` and `ExposureTime`, you may take just an address of `Gain` and `ExposureTime` values for input.

Also, to enable BB to take these values as inputs, you have to add `enable_control` as Param input of BB.
:::

:::caution why it does not work
`gain_key` and `exposure_key` are the feature key of GenICam to control device gain and exposure time. With **SFNC (Standard Features Naming Convention)** by emva; they are usually set `Gain` and `ExposureTime`; however, some device has different key.

In that case, you may need to change the name of the keys of param. [This page](../../external/aravis/arv-tools#list-the-available-genicam-features) to check how to list the available features.
```c++
Param("gain_key", <name of the feature to control gain>)
Param("exposure_key", <name of the feature to control exposure time>)
```
:::

### Execute the pipeline

The pipeline is ready to run. Each time you call `run()`, the buffer in the vector or `output` receive output images.

```c++
b.run();
```

### Display with OpenCV

In [the previous tutorials](display-image), we have just displayed the output image in each run. This time, you can update the value of `Gain` or `ExposureTime`. The following example shows how to increase `Gain` by `1.0` for every run bi updating gain_values and re-bind the updates.

```c++
while(user_input == -1)
{
    // dynamically update gain
    gain0 += 1.0;
    // JIT compilation and execution of pipelines with Builder.
    b.run(); 
}
```

## Complete code

Complete code used in the tutorial is [here](https://github.com/Sensing-Dev/tutorials/blob/main/cpp/src/tutorial2_control_camera.cpp).

:::caution why it does not work
* If you are using OpenCV that you install by yourself, please confirm that it is linked to your program appropriately.
:::