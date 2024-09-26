---
sidebar_position: 4
---

# Environment variables

This document describes the environment variables for Widows users and the instructions on how to set them.

:::info
If you haev installed Sensing-Dev SDK with the installer script by following [the official instruction](windows), this procedure is **NOT necessary**.

However, if you opted to install the SDK in a directory different from the default, or if you are using OpenCV installed manually without the installer script, please refer to this document to set the environment variables.
:::


## The variables to set

To use Sensing-Dev SDK, users need to set the following environment variables.

| Name of the Variables | Value                                                                 | New/Edit(Append) | Additional Note           |
|-----------------------|-----------------------------------------------------------------------|------------|---------------------------|
| SENSING_DEV_ROOT      | `<where you installed SDK>`                                           | New        |                           |
| PATH                  | `%SENSING_DEV_ROOT%\bin`                                              | Edit       | To load dynamic libraries |
| PATH                  | `<where you installed opencv>\build\x64\vc<preferred VS version>\bin` | Edit       | To load dynamic libraries |
| GST_PLUGIN_PATH       | `%SENSING_DEV_ROOT%\lib\gstreamer-1.0`                                | Edit       | To load gst-plugins       |


## How to set the environment variables

1. Hit Windows key **&#8862;** or click **&#8862;** at the corner of task bar to use start-menu.

2. Type **Environment variable** to find **Edit environment variables got your account** to open the window of **Environment Variables**.

![Start-menu](./img/start-menu.png)

3. There are environment variables for user and system at the top and bottom of the window respectively.

![Start-menu](./img/environment-variables.png)

4. Type the Variables and Values introduced in the table above by clicking "New". Note that if the variables already exist, overwrite the values for "New" items and append the values for "Edit" items.

:::info Confirmation
Using `arv-tool-0.8` may help to check if the software package is appropriately installed and the environment variables are set correctly . Please check [this page](../external/aravis/arv-tools.md) to know the procedure.
:::