---
sidebar_position: 2
---

# Access and Set Device Info

In this tutorial, we learn how to set device information with Aravis API.

## Prerequisite

* Aravis Python (included in SDK package)
* PyGObject (included in SDK package)

## Tutorial

We learned how to get device information with Aravis API in [the previous tutorial](./obtain-device-info).

Some of GenICam features, such as **Gain** and **ExposureTime** is writable, so let's change these values to control Camera.

### Load required modules

The process of loading modules is exactly the same as in the last tutorial. See the detail in [Access and Display Device Info](./obtain-device-info).

### Access to devices

The API of acess to devices is exactly the same as in the last tutorial. See the detail in [Access and Display Device Info](./obtain-device-info).

### Get current values of the device

First of all, we want to know the current values of `Gain` and `ExposureTime`. As we learned in [the previous tutorial](./obtain-device-info), use `get_float_feature_value` to obtain camera information after opening a camera.

```python
for i in range(num_device):
    device = Aravis.Camera.new(Aravis.get_device_id(i)).get_device()
    ...
    current_gain = device.get_float_feature_value("Gain")
    current_exposuretime = device.get_float_feature_value("ExposureTime")
    ...
    del device
```

Some examples of general keys defined in U3V devices are listed in the table below.

| Feature Name | Description | Type |
| --------   | ------- | ------- |
| `Gain` | Gain of the image sensor | Double |
| `ExposureTime` | Exposure time of the image sensor | Double | 

:::tip
Those feature keys and types are defined in **SFNC (Standard Features Naming Convention)** by emva; however, some of the devices have their own unique features, keys or types. To know the all accessible features, use `arv-tool-0.8`. See the detail in [List the available GenICam features](../../external/aravis/arv-tools).

Common names (example):
* Instead of `Gain`, it may be `GainRaw` or `GainAbs`.
* Instead of `ExposureTime`, it may be `ExposureTimeBaseAbs` or `ExposureTimeRaw`.

Common types (example):
* Instead of `get_float_feature_value`, it may be `get_integer_feature_value` if the type of `Gain` or `ExposureTime` is Integer.
:::

:::caution why it does not work
If `arv-device-error-quark` returns errors:
* The device may not have the key (`Not found (1)`): check if the feature key is correct. See the details in  [List the available GenICam features](../../external/aravis/arv-tools).
* The type was wrong (`Not a ArvGcFlaot (0)`) check if the feature type is correct. If the type is integer, the API must be `get_integer_feature_value`.  See the details in  [List the available GenICam features](../../external/aravis/arv-tools).
:::

### Set current values of the device

Now, let's update the Gain and ExposureTime value with API of `get_float_feature_value` as follows:

```python
    new_gain = current_gain + 10.0
    new_exposuretime = current_exposuretime + 10.0

    device.set_float_feature_value("Gain", new_gain)
    device.set_float_feature_value("ExposureTime", new_exposuretime)
```

To confirm if the values are actually updated, you can load the device info again.

```python
    current_gain = device.get_float_feature_value("Gain")
    current_exposuretime = device.get_float_feature_value("ExposureTime")
```

### Close 

Using the following function in Aravis can release resources that avoid memory leaks.

```python
Aravis.shutdown()
```


:::tip
Instead of using Aravis Python API, you can also use arv-tool. See the detail in [Tools from Aravis](../../external/aravis/arv-tools.md)
:::

## Complete code

import {tutorial_version} from "@site/static/version_const/v240505.js"
import GenerateTutorialLink from '@site/static/tutorial_link.js';

<GenerateTutorialLink language="python" tag={tutorial_version} tutorialfile="tutorial0_set_device_info" />
