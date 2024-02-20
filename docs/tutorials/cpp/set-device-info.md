---
sidebar_position: 3
---

# Access and Set Device Info

In this tutorial, we learn how to set device informatin with Aravis API.

## Prerequisite

* Aravis (included in SDK package)
* GObject (included in SDK package)

## Tutorial

We learned how to get device information with Aravis API in [the previous tutorial](./obtain-device-info).

Some of GenICam features, such as **Gain** and **ExposureTime** is writable, so let's change these values to control Camera.

### Load required modules

The process of including aravis header is exactly the same as in the last tutorial. See the detail in [Access and Display Device Info](./obtain-device-info).

### Access to devices

The API of acess to devices is exactly the same as in the last tutorial. See the detail in [Access and Display Device Info](./obtain-device-info).

### Get current values of the device

First of all, we want to know the current values of `Gain` and `ExposureTime`. As we learned in [the previous tutorial](./obtain-device-info), use `arv_device_get_float_feature_value` to obtain camera information after opening a camera.


```c++
for (unsigned int i = 0; i < n_devices; ++i){
    const char* dev_id = arv_get_device_id (i);
    ArvDevice* device = arv_open_device(dev_id, nullptr);

    double current_gain = arv_device_get_float_feature_value(device, "Gain", &error);
    if (error){
        throw std::runtime_error(error->message);
    }
    printf("%20s : %lf\n", "Gain", current_gain);
    
    double current_exposuretime = arv_device_get_float_feature_value(device, "ExposureTime", &error);
    if (error){
        throw std::runtime_error(error->message);
    }
    printf("%20s : %lf\n", "ExposureTime", current_exposuretime);
    ...
    g_object_unref (device);
}
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
* Instead of `arv_device_get_float_feature_value`, it may be `arv_device_get_integer_feature_value` if the type of `Gain` or `ExposureTime` is Integer.
:::

:::caution why it does not work
If `arv-device-error-quark` returns errors:
* The device may not have the key (`Not found (1)`): check if the feature key is correct. See the details in  [List the available GenICam features](../../external/aravis/arv-tools).
* The type was wrong (`Not a ArvGcString (0)` or `Not a ArvGcFlaot (0)`) check if the feature type is correct. See the details in  [List the available GenICam features](../../external/aravis/arv-tools).
:::

### Set current values of the device

Now, let's update the Gain and ExposureTime value with API of `arv_device_set_float_feature_value` as follows:

```c++
double new_gain = current_gain + 10.0;
arv_device_set_float_feature_value(device, "Gain", new_gain, &error);
if (error){
    throw std::runtime_error(error->message);
}

double new_exposuretime = current_exposuretime + 20.0;
arv_device_set_float_feature_value(device, "ExposureTime", new_exposuretime, &error);
if (error){
    throw std::runtime_error(error->message);
}
```

To confirm if the values are actually updated, you can load the device info again.

```c++
current_gain = arv_device_get_float_feature_value(device, "Gain", &error);
if (error){
    throw std::runtime_error(error->message);
}
printf("%20s : %lf\n", "Gain", current_gain);

current_exposuretime = arv_device_get_float_feature_value(device, "ExposureTime", &error);
if (error){
    throw std::runtime_error(error->message);
}
printf("%20s : %lf\n", "ExposureTime", current_exposuretime);
```

### Close 

Using the following function in Aravis can release resources that avoid memory leaks.

```c++
g_object_unref (device);
```


:::tip
Instead of using Aravis Python API, you can also use arv-tool. See the detail in [Tools from Aravis](../../external/aravis/arv-tools.md)
:::

## Complete code

Complete code used in the tutorial is [here](https://github.com/Sensing-Dev/tutorials/blob/main/cpp/src/tutorial0_set_device_info.cpp).