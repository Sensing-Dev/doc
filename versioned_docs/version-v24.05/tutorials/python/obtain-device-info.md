---
sidebar_position: 1
---

# Access and Display Device Info

In this tutorial, we learn how to get device information with aravis API.

## Prerequisite

* Aravis Python (included in SDK package)
* PyGObject (included in SDK package)

## Tutorial

### Load required modules

First of all, to load the PyGObject to use Aravis module, we need to add `$SENSING_DEV_ROOT/bin` (where you installed Sensing-Dev SDK).

```python
import os
os.add_dll_directory(os.path.join(os.environ["SENSING_DEV_ROOT"], "bin"))
```

Now you import the module of Aravis with PyGObject.

```python
import gi
gi.require_version("Aravis", "0.8")
from gi.repository import Aravis
```

:::caution why it does not work
When you see `ImportError: DLL load failed while importing _gi: The specified module could not be found.`
* Environment variable `SENSING_DEV_ROOT` is not set appropriately.
* Python version is not 3.11.
:::

### Access to devices

Now we are ready to use Aravis API. Let's start with updating the list of U3V devices that are connected to your host machine.

```python
Aravis.update_device_list()
```

By updating the list, the following API should return the nubmer of the devices.

```python
num_device = Aravis.get_n_devices()
```

:::caution why it does not work
If `num_devices` is `0`, your device may have the following issues.
* The device is not connected to your host machine appropriately.
* The WinUSB is not installed on the device (Windows). See [the Startup guide (Windows)](../../startup-guide/windows.mdx)
* Udev rules file is not located under `/etc/udev`. See [the Startup guide (Linux)](../../startup-guide/linux.mdx)
:::

### Access to device infomation

Out of `num_device` devices, create camera object by accessing `i`th device.

You can get string/intefer/float values of device information with API of `get_*_feature_value` as follows:

```python
for i in range(num_device):
    device = Aravis.Camera.new(Aravis.get_device_id(i)).get_device()

    devicemodelname = device.get_string_feature_value("DeviceModelName")
    width = device.get_integer_feature_value("Width")
    ...
    del device
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

### Display the values

```python
    print("=== device {} information ===========================".format(i))
    print("{0:20s} : {1}".format("Device Model Name", devicemodelname))
    print("{0:20s} : {1}".format("Wdith", width))
```

Note that all the returned value of `get_*_feature_value` is a string.

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

<GenerateTutorialLink language="python" tag={tutorial_version} tutorialfile="tutorial0_get_device_info" />