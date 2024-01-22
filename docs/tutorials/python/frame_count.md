---
sidebar_position: 5
---

# Retrieve Frame Count

In this tutorial, we learn how to get frame count from camera with ion-kit.

## Prerequisite

* ionpy 
* numpy
* OpenCV

```bash
pip3 install -U pip
pip3 install opencv-python
pip3 install numpy
pip3 install ion-python
```


## Tutorial

### Get Device Information

To display image with ionpy, we need to get the following information of the device.

* Width
* Height
* PixelFormat

The [previous tutorial](obtain-device-info.md) or [arv-tool-0.8](../../external/aravis/arv-tools.md) will help to get these values.

### Build a pipeline

While the structurte of BB is the same as the [tutorial that display 1-camera image](display-image), we need some small changes to access two devices.

We need to set `Param` of BB `image_io_u3v_cameraN_u<bit-depth>x<dimension>` called `num_devices` to `2` so that it will try to detect 2 cameras connected to the host machine.

```python
num_device = 2
num_devices = Param('num_devices', str(num_device))
node = builder.add(bb_name)\
    .set_param([num_devices, frame_sync, realtime_diaplay_mode, ])
```
 We have made  `Gain` and `ExposureTime` optional values. In this tutorial, we don't need to set `Gain` and `ExposureTime`  manually.

Now, input is ready to access and control 2 cameras. 

Similarly, output requires 2 Buffers to store two camera images that BB obtains. Therefore, the number of `Buffer` to append the output `List` is `2` as follws.

```python
fcdata = np.full((1), fill_value=0, dtype=np.uint32)
frame_count = []
for i in range(num_device):
    frame_count.append(Buffer(array=fcdata))
# set I/O ports
for i in range(num_device):
    output_p[i].bind(outputs[i])
    frame_count_p[i].bind(frame_count[i])
```

### Execute the pipeline

The pipeline is now designed for 2 cameras, so `builder.run` can be executed same as the signle-camera tutorial.

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

Complete code used in the tutorial is [here](https://github.com/Sensing-Dev/tutorials/blob/v23.11.01/python/tutorial1_display_2cam.py)