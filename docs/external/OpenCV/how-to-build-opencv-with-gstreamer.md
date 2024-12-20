# Opencv-python with Gstreamer

Although the GStreamer API enables you to build pipelines for acquiring, processing, and displaying sensor images, combining the GStreamer plugin `appsink` with `cv2.VideoCapture`, OpenCV-Python API offers an alternative way to perform the same tasks without using  the GStreamer API directly. Please check [tutorial](../../tutorials/gstreamer/display-image.mdx) for the details.

The `appsink` plugin is included in the Sensing-Dev SDK installer when using the `-InstallGstPlugins` option on Windows or the `--install-gst-plugins` option on Linux.

The `cv2.VideoCapture` function is available only in an OpenCV-Python installation built with GStreamer support, which requires additional steps beyond a standard OpenCV-Python installation.

This document provides instructions on how to build and install OpenCV-Python with the GStreamer feature enabled for both Windows and Linux.

## How to check if your opencv-python is built with Gstreamer

In python, please try the following snippet.

```python
import cv2
print(cv2.getBuildInformation())
```

If you see Gstreamer is `YES` for build-information, your opencv-python module is built with Gstreamer and can use API `cv2.VideoCapture`.

```bash
General configuration for OpenCV 4.10.0 =====================================
  ...

  Video I/O:
    ...
    GStreamer:                   YES (1.22.5)

```

:::caution why it does not work
If the python code returns the error "cannot find cv2", it might be...
1. You do not have opencv-python. Please build and install opencv-python by following the instruction in the next section.
2. You have opencv-python with Gstreamer but Gstreamer library path is not included. Please make sure you installed Sensing-Dev SDK and add the path before loading cv2 module as follows:
```python
import os
os.add_dll_directory(os.path.join(os.environ["SENSING_DEV_ROOT"], "bin"))

import cv2
print(cv2.getBuildInformation())
```
:::

## Windows users

import '/src/css/home.css';
import this_version from "@site/static/version_const/latest.js"

### Pre-req to build (not runtime):

* Windows SDK (Visual Studio Installer or https://developer.microsoft.com/en-us/windows/downloads/sdk-archive/)
* Windows C++ build tool (Visual Studio Installer or https://visualstudio.microsoft.com/visual-cpp-build-tools/)
* CMake (Visual Studio Installer or winget)

### Build and install 

Please run the following command to install opencv-python with Gstreamer.

<pre>
<code class="language-powershell">
Invoke-WebRequest -Uri {this_version.windows_opencvpython_url}  -OutFile opencv_python_installer.ps1 -Verbose; powershell.exe -ExecutionPolicy Bypass -File .\opencv_python_installer.ps1
</code>
</pre>

Note that if you already have opencv-python module installed with pip, it will be overwritten.

## Linux users

### Install dependencies (both build and runtime):

Please run the following command to install dependencies

``` bash
sudo apt-get update \
sudo apt-get install libunwind-dev libgstreamer1.0-dev libgstreamer-plugins-base1.0-dev libgstreamer-plugins-bad1.0-dev \
gstreamer1.0-plugins-base gstreamer1.0-plugins-good gstreamer1.0-plugins-bad gstreamer1.0-plugins-ugly gstreamer1.0-libav \
gstreamer1.0-tools gstreamer1.0-x gstreamer1.0-alsa gstreamer1.0-gl gstreamer1.0-gtk3 \
gstreamer1.0-qt5 gstreamer1.0-pulseaudio -y
```

### Build and install 

Please run the following command to install opencv-python with Gstreamer.

```bash
pip3 install numpy
pip3 install --no-binary opencv-python opencv-python==4.10.0.84 --verbose
```