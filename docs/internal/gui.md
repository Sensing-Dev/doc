---
sidebar_position: 2
---

# GUI: Previewing and Saving

Sensing-Dev provides an SDK and tutorials to support USB 3 Vision Camera users in setting up their development environment.

Additionally, we offer a simple Python application with features for previewing the camera and saving captured images.

## GUI 

Download the package from [here](https://github.com/Sensing-Dev/viewer/releases/tag/v0.1.0) and extract it.

### Install required module

#### Sensing-Dev SDK

This application requresi python 3.10 or later.

For Windows user, install modules by following the instruction [here](./../startup-guide/windows). Linux users can find the instruction [here](./../startup-guide/linux).

#### GUI requirement

This GUI application requires several Python modules, which are listed in the requirements.txt included in the package. Go to the root directory of the extracted package and run the following command to install them.

```
python3 -m pip install -r requirements.txt
```

### Usage

To run the application, use the following command format:

```
python3 gui.py [options]
```

All command options are described in the README, but we will introduce some of the main ones here.

Command-Line Arguments

- `-d`, `--directory` (default: `./output`)
  - **Description**: Directory where saved files will be saved.
  - **Type**: `str`
  
- `-nd`, `--number-of-device` (default: `2`)
  - **Description**: The number of cameras to be used.
  - **Type**: `int`
  
:::caution why it does not work 
* If your U3V devices have framecount feature, and you would like to get sync framecount between devices, use `-sync` option.

* If your U3V devices have unique feature key. If the keys for Gain and Exposure Time keys are not `Gain` and `ExposureTime` respectively, set them with `--gain-key-name` and `--exposuretime-key-name`

* If you expect color images but preview windows shows monochrome, you may set the wrong PixelFormat. Change the PixelFormat to Bayer. We are supporting the following PixelFormat.
  * Mono8
  * Mono12
  * mono16
  * BayerBG8
  * BayerBG10
  * BayerBG12
  * BayerRG8
  * BayerRG10
  * BayerRG12
:::


## Control Panel

### Previewing images

When you run the command to launch the application, the control panel and preview window will open. 

In this application, you can adjust the camera's gain, exposure time, and white balance while viewing the preview window. 

### Saving images

Additionally, it allows you to save data in various formats.

There are two ways to save: by pressing the start and stop buttons manually, or by specifying a duration and pressing the start button.

Please note that formats like JPG and PNG may take some time to convert after saving. 

When saving in BIN format, if you are using a GenDC U3V device, setting it to GenDC mode allows you to save all container data, not just the image.