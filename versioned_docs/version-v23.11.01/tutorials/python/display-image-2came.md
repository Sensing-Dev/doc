---
sidebar_position: 4
---

# Use Multiple Cameras

In this tutorial, we learn how to access 2 cameras and obtain their images via ion-kit based on the [previous tutorial](display-image)

## Prerequisite

* ionpy 
* numpy
* OpenCV

```bash
pip3 install -U pip
pip3 install opencv-python
pip3 install numpy
pip3 install "git+https://github.com/fixstars/ion-kit.git@633660504315364a641caa4297c19b9c09bcdf9b#egg=ionpy&subdirectory=python"
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
    .set_port([dispose_p, gain_p, exposuretime_p, ])\
    .set_param([pixel_format_ptr, gain_key, exposure_key, ])
```

Since two cameras requires the value to set `Gain` and `WxposureTime` respectively, data requires 2-length array. Size of buffer also changes from `(1,)` to `(2,)`.

```python
gain_data = np.array([48.0, 24.0])
exposure_data = np.array([100.0, 50.0])
gains = Buffer(Type(TypeCode.Float, 64, 1), (2,))
exposures = Buffer(Type(TypeCode.Float, 64, 1), (2,))
```

Now, input is ready to access and control 2 cameras. 

Similarly, output requires 2 Buffers to store two camera images that BB obtains. Therefore, the number of `Buffer` to append the output `List` is `2` as follws.

```python
outputs = []
output_size = (width, height, )
if pixelformat == "RGB8":
    output_size += (3,)
outputs.append(Buffer(Type(TypeCode.Uint, depth_of_buffer, 1), output_size))
outputs.append(Buffer(Type(TypeCode.Uint, depth_of_buffer, 1), output_size))
```

### Execute the pipeline

The pipeline is now designed for 2 cameras, so `builder.run` can be executed same as the signle-camera tutorial.

### Display with OpenCV

`outputs` is the `List` having 2 buffers. To access data for each, we can use the square brackets.

```python
output_bytes_image0 = outputs[0].read(output_byte_size)
output_bytes_image1 = outputs[1].read(output_byte_size)
```

We need to create numpy array for each image, and processed numpy arrays can be displayed.

```python
output_np_HxW_image0 = np.frombuffer(output_bytes_image0, data_type).reshape(buf_size_opencv)
output_np_HxW_image1 = np.frombuffer(output_bytes_image1, data_type).reshape(buf_size_opencv)
output_np_HxW_image0 *= pow(2, num_bit_shift)
output_np_HxW_image1 *= pow(2, num_bit_shift)

...

cv2.imshow("A", output_np_HxW_image0)
cv2.imshow("B", output_np_HxW_image1)
cv2.waitKey(0)
...
```

## Complete code

Complete code used in the tutorial is [here](https://github.com/Sensing-Dev/tutorials/blob/v23.11.01/python/tutorial1_display_2cam.py)