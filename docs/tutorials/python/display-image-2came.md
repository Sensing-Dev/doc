---
sidebar_position: 4
---

# Use Multiple Cameras

In this tutorial, we learn how to access 2 cameras and obtain their images via ion-kit based on the [previous tutorial](display-image)

## Prerequisite

* ionpy 
* numpy
* OpenCV

import this_version from "@site/static/version_const/latest.js"

<pre>
<code class="language-bash">
pip3 install -U pip<br />
pip3 install opencv-python<br />
pip3 install numpy<br />
pip3 install ion-contrib-python=={this_version.ion_python_version}<br />
</code>
</pre>

## Tutorial

### Get Device Information

To display images with ionpy, we need to get the following information of the device.

* Width
* Height
* PixelFormat

The [previous tutorial](obtain-device-info.md) or [arv-tool-0.8](../../external/aravis/arv-tools.md) will help to get these values.

### Build a pipeline

Import the modules, and set up the pipeline are the same as [tutorial that display 1-camera image](display-image).

### Allow BB to access 2 cameras

While the structurte of BB is the same as the [tutorial that display 1-camera image](display-image), we need some small changes to access two devices.

We need to set `Param` of BB `image_io_u3v_cameraN_u<bit-depth>x<dimension>` called `num_devices` to `2` so that it will try to detect 2 cameras connected to the host machine.

```python
num_device = 2
num_devices = Param('num_devices', str(num_device))
node = builder.add(bb_name)\
    .set_param([num_devices, frame_sync, realtime_display_mode, ])
```

Since this is the only one BB in our pipeline, output port of the node can be the output port of the pipeline, and we name is `output_p`.

Now, the BB is ready to access and control 2 cameras. 

Similarly, output requires 2 Buffers to store two camera images that BB obtains. Therefore, the number of `Buffer` to append the output `List` is `2` as follws.

```python
outputs = []
output_datas = []
output_size = (height, width, )
if pixelformat == "RGB8":
    output_size += (3,)
for i in range(num_device):
    output_datas.append(np.full(output_size, fill_value=0, dtype=data_type))
    outputs.append(Buffer(array= output_datas[i]))
# set I/O ports
for i in range(num_device):
    output_p[i].bind(outputs[i])
```

### Execute the pipeline

The pipeline is now designed for 2 cameras, so `builder.run()` can be executed same as the signle-camera tutorial.

### Display with OpenCV

`outputs` is the `List` having 2 buffers. Each buffer is stored into numpy array, and we can access it by index (`output_datas[i]`).
```python
while(user_input == -1):
    # running the builder
    builder.run()
    for i in range(num_device):
        output_datas[i] *= coef
        cv2.imshow("img" + str(i), output_datas[i])
    user_input = cv2.waitKeyEx(1)
```
Do not forget to destroy windows that displayed the image after `for` loop.

```python
cv2.destroyAllWindows()
```
## Complete code

import {tutorial_version} from "@site/static/version_const/latest.js"
import GenerateTutorialLink from '@site/static/tutorial_link.js';

<GenerateTutorialLink language="python" tag={tutorial_version} tutorialfile="tutorial1_display_2cam" />