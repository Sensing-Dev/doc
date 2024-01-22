---
sidebar_position: 2
---

# Access and Display Device Info

In this tutorial, we learn how to get device informatin with Aravis API.

## Prerequisite

* Aravis (included in SDK package)
* GObject (included in SDK package)

## Tutorial

### Load required modules

First of all, to use Aravis module, we need to include the header file  `arv.h` (which comes with the SDK you installed).

```c++
#include <exception>
#include <iostream>
#include "arv.h"
```

It is also good idea to include exception and iostream headers to catch the error messages.

### Access to devices

Now we are ready to use Aravis API. Let's start with updating the list of U3V devices that are connected to your host machine.

```c++
arv_update_device_list ();
```

By updating the list, the following API should return the nubmer of the devices.

```c++
unsigned int n_devices = arv_get_n_devices ();
```

:::caution why it does not work
If `n_devices` is `0`, your device may have the following issues.
* The device is not connected to your host machine appropriately.
* The WinUSB is not installed on the device (Windows). See [the Startup guide (Windows)](../../startup-guide/windows.mdx)
* Udev rules file is not located under `/etc/udev`. See [the Startup guide (Linux)](../../startup-guide/linux.mdx)
:::

### Access and Display to device infomation

Out of `n_devices` devices, create camera object by accessing `i`th device.

You can get string/intefer/float values of device information with API of `arv_device_get_*_feature_value` as follows:

```c++
for (unsigned int i = 0; i < n_devices; ++i){
    const char* dev_id = arv_get_device_id (i);
    ArvDevice* device = arv_open_device(dev_id, nullptr);

    printf("%20s : %s\n",
        "Device Model Name",
        arv_device_get_string_feature_value(device, "DeviceModelName", &error));
    if (error){
        throw std::runtime_error(error->message);
    }
    printf("%20s : %li\n",
        "Width",
        arv_device_get_integer_feature_value(device, "Width", &error));
            if (error){
        throw std::runtime_error(error->message);
    }
    ...
    g_object_unref (device);
}
```

Some examples of general keys defined in U3V devices are listed in the table below.

| Feature Name | Description | Type |
| --------   | ------- | ------- |
| `DeviceModelName` | Name of the device | String |
| `Width` | Width of the sensor image | Integer | 
| `Height` | Height of the sensor image | Integer |
| `PayloadSize` | Size of whole data transferred from sensor | Integer |
| `PixelFormat` | Pixel Format of the sensor image data | String |

:::tip
Those feature keys and types are defined in **SFNC (Standard Features Naming Convention)** by emva; however, some of the devices have their own unique features or keys. To know the all accessible features, use `arv-tool-0.8`. See the detail in [List the available GenICam features](../../external/aravis/arv-tools).
:::

:::caution why it does not work
If `arv-device-error-quark` returns errors:
* The device may not have the key (`Not found (1)`): check if the feature key is correct. See the details in  [List the available GenICam features](../../external/aravis/arv-tools).
* The type was wrong (`Not a ArvGcString (0)` or `Not a ArvGcFlaot (0)`) check if the feature type is correct. See the details in  [List the available GenICam features](../../external/aravis/arv-tools).
:::


### Close 

Using the following function in Aravis can release resources that avoid memory leaks.

```c++
g_object_unref (device);
```


:::tip
Instead of using Aravis Python API, you can also use arv-tool. See the detail in [Tools from Aravis](../../external/aravis/arv-tools.md)
:::

## Complete code

Complete code used in the tutorial is [here](https://github.com/Sensing-Dev/tutorials/blob/main/cpp/src/tutorial0_get_device_info.cpp)

You can Use the CMakeLists.txt provided [here](https://github.com/Sensing-Dev/tutorials/blob/main/cpp/CMAKELists.txt) to compile and build the program.