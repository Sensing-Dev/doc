# Tools from Aravis

**Aravis**, the camera acquisition library, has some simple tools to access and control U3V cameras.

| Name | Description | Note |
| --------   | ------- | ------- |
| arv-tool-0.8 | Access device and control GenICam features* |
| arv-camera-test-0.8 | Obtain the streaming data from devices |
| arv-viewer-0.8 | Display the image data from devices | Available only for Linux| 

## Control GenICam features

`arv-tool-0.8` enables to access the device and read/write the values of the GenICam features. To learn about **GenICam Standard**, please check [this page](/docs/lessons/camera.md#genicam).

### List the U3V devices

With `arv-tool-0.8` command, all Camera devices are displayed, and U3V camera would be displayed as `<the name of the camera> (USB)`

```bash title="arv-tool-0.8"
$ arv-tool-0.8 
Basler-26760158A14A-22585674 (USB3)
```

:::caution why it does not work
When `arv-tool-0.8` command does not work, it might be...
* The **environment variable** `PATH` is not set correctly (Windows).
* The device is not connected with **SS USB** port.
:::

### List the available GenICam features

Many of U3V cameras follow the Standard Features Naming Convention(SFNC) defined by EMVA; however, some devices may have device-unique features. `arv-tool-0.8` with the option of `features` shows all available features of each camera. `-n` is to choose the target device, which followed by the name of the device.

```bash title="arv-tool-0.8 -n <camera name> features"
$ arv-tool-0.8 -n "Basler-26760158A14A-22585674" features
Category    : 'Root'
    Category    : 'AnalogControl'
        Enumeration  : [RW] 'GainSelector'
              * Gain
    ...
    Category    : 'ImageFormatControl'
        Integer      : [RO] 'SensorWidth'
        Integer      : [RO] 'SensorHeight'
        IntReg       : [RO] 'WidthMax'
        IntReg       : [RO] 'HeightMax'
        Integer      : [RW] 'Width'
        Integer      : [RW] 'Height'
        ...
        Enumeration  : [RW] 'PixelFormat'
            EnumEntry   : 'BayerGR12'
            EnumEntry   : 'BayerGR8'
            EnumEntry   : 'YCbCr422_8'
            EnumEntry   : 'RGB8'
    ...
```

In the example above, [Basler-26760158A14A-22585674](https://www.baslerweb.com/en/products/cameras/area-scan-cameras/dart/daa1280-54uc-cs-mount/) allows read and write the value of *Gain* and *PixelFormat*.

:::caution why it does not work
When `arv-tool-0.8 -n <camera name> features` command does not work, it might be...
* The name of camera include parentheses *"(USB)"* which should not be.
* The name of camera contains the space but is not enclosed by double-quotation marks.
:::

### Read and Write the values

Knowing and setting some GenICam feature values is important to obtain the image sensor data with appropriate size, format, and brightness.

`arv-tool-0.8` command with `control` option gives you the value of the feature, and the following example tries to obtain the value of the camera gain controling the amplification of the intensity (i.e. brightness).

```bash title="arv-tool-0.8 -n <camera name> control <feature name>"
$ arv-tool-0.8 -n "Basler-26760158A14A-22585674" control Gain
Gain = 0 dB min:0 max:18.0278
```

Now, you may feel the image is too dark with 0dB, and set it to 10dB by the following command.

```bash title="arv-tool-0.8 -n <camera name> control <feature name>=<new value>"
$ arv-tool-0.8 -n "Basler-26760158A14A-22585674" control Gain=10
Gain = 9.98343 dB min:0 max:18.0278
```

:::caution why it does not work
When `arv-tool-0.8 -n <camera name> control` command does not work, it might be...
* The name of the feature is not available on the target device.
* The new value to set is not expected (e.g. out of range or not in the list).
:::

Note that the *Gain* of this camera is a converter in which camera description file converts the value of input to the register value, so 0.02dB is in the expected margin of error in their computation and rounding. 

:::note

To know more about camera description file, please check [the official documentation of GenApi](https://www.emva.org/standards-technology/genicam/introduction-new/).

:::

## Check the data transfer

With `arv-camera-test-0.8` command, you can see the transfer rate of U3V camera data from the device.

```bash title="arv-camera-test-0.8 -n <camera name>"
$ ./arv-camera-test-0.8.exe
Looking for the first available camera
vendor name            = Basler
model name             = daA1280-54uc
device serial number   = 22585674
image width            = 1280
image height           = 960
horizontal binning     = 1
vertical binning       = 1
exposure               = 10302 ﾂｵs
gain                   = 0 dB
payload                = 2457600 bytes
 29 frames/s -    71.3 MiB/s
 31 frames/s -    76.2 MiB/s
 30 frames/s -    73.7 MiB/s
 30 frames/s -    73.7 MiB/s
 30 frames/s -    73.7 MiB/s
 29 frames/s -    71.3 MiB/s
 30 frames/s -    73.7 MiB/s
 29 frames/s -    71.3 MiB/s - 1 error
n_completed_buffers    = 240
n_failures             = 1
n_underruns            = 0
n_aborted              = 0
n_transferred_bytes    = 592072496
n_ignored_bytes        = 32
```

:::info

If the multiple camera devices are connected to the host machine, option `-n <the name of the camera>` allows to specify the device.

:::

:::caution why it does not work
When the `arv-camera-test-0.8` command does not work, it might be...
* The **environment variable** `PATH` is not set correctly (Windows).
* The device is not connected with **SS USB** port.

When the `arv-camera-test-0.8` shows only 0 MiB/s transfer, it might be...
* The GenICam feature value of `AcquisitionFrameRate` might set wrong value.
* The device is not connected with **SS USB** port.
:::

## View the sensor images

With `arv-viewer-0.8` command, you can run the GUI program to display the sensor image.

The viewer for Windows is currently not supported.

:::caution why it does not work
When the `arv-viewer-0.8` command does not work, it might be...
<!-- * The **environment variable** `PATH` is not set correctly (Windows).
* The **environment variable** `PYTHONPATH` is not set correctly (Windows). -->
* The GenICam feature value of `PixelFormat` might set wrong value.
* The device is not connected with **SS USB** port.
:::