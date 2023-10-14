---
sidebar_position: 3
---

# Display Image

In this tutorial, we learn how to get image data from device with ion-kit, and display with .

## Prerequisite

* ionpy 
* numpy
* OpenCV

```bash
pip3 install -U pip
pip3 install opencv-python
pip3 install opencv-contrib-python
pip3 install numpy
pip3 install "git+https://github.com/fixstars/ion-kit.git#egg=ionpy&subdirectory=python"
```

## Tutorial

### Get Device Information

To display image with ionpy, we need to get the following information of the device.

* Width
* Height
* PixelFormat

The [previous tutorial](obtain-device-info.md) or [arv-tool-0.8](../external/aravis/arv-tools.md) will help to get these values.

### Build a pipeline

First of all, we load the module of ionpy, which is a python-binding of ion-kit.

```python
from ionpy import Node, Builder, Buffer, PortMap, Port, Param, Type, TypeCode
```

As we learned in the [introduction](intro.mdx), we will build and execute pipeline for image I/O and processing.

In this tutorial, we build a very simple pipeline has only one Building Block that obtain image from U3V camera.

The following ionpy API set up our pipeline.

```python
module_name = 'ion-bb.dll'
...
# pipeline setup
builder = Builder()
builder.set_target('host')
builder.with_bb_module(module_name)
```

The `set_target` specifies on what hardware the pipeline built by the Builder will run. 

Since we woule like to use BB defined in `ion-bb.dll`, we need to load the module by `with_bb_module` function. 

The BB we are going use for obtaining image data is `image_io_u3v_cameraN_u8x2`, which is designed for U3V camera that has 8-bit depth for each pixel data and 2 dimension; e.g. Mono8.

With the device pixelformat Mono10 or Mono12, you need `image_io_u3v_cameraN_u16x2` since 16-bit depth pixel is required to store 10-bit and 12-bit pixel data respectively.

If the pixelformat is RGB8, it means bit depth is 8 and dimension is 3 (in addition to width and height, it has color channel) so you would use `image_io_u3v_cameraN_u8x3`.

Any of these BB requries input called `dispose`, `gain`, and `exposuretime`, so we have to se the port to pass the values to the pipeline.

```python
# set input port
dispose_p = Port('dispose', Type(TypeCode.Uint, 1, 1), 0)
gain_p = Port('gain', Type(TypeCode.Float, 64, 1), 1)
exposuretime_p = Port('exposuretime', Type(TypeCode.Float, 64, 1), 1)
```

While port input is dynamic; i.e. it can be updated for each run, you can set static values in string via `Param`. 

```python
# set params
num_devices = Param('num_devices', str(num_device))
pixel_format_ptr = Param('pixel_format_ptr', "RGB8")
gain_key = Param('gain_key', 'Gain')
exposure_key = Param('exposure_key', 'ExposureTime')
```

`pixel_format_ptr` is the pixelformat that you obtained with [Get Device Information](#get-device-information).


:::caution why it does not work
`gain_key` and `exposure_key` are the feature key of GenICam to control device gain and exposure time. With **SFNC (Standard Features Naming Convention)** by emva; they are usually set `Gain` and `ExposureTime` in `FLOAT64`; however, some device has different key and different type.

In that case, you may need to change the type of port and name of the keys of param. [This page](../external/aravis/arv-tools#list-the-available-genicam-features) to check how to list the available features.
```python
gain_p = Port('gain', Type(<TypeCode>, <Size of the data type>, 1), 1)
exposuretime_p = Port('exposuretime', Type(<TypeCode>, <Size of the data type>, 1), 1)

gain_key = Param('gain_key', <name of the feature to control gain>)
exposure_key = Param('exposure_key', <name of the feature to control exposure time>)
```
:::

Now, you add BB to your pipeline as node with ports and params.

```python
# add a node to pipeline
node = builder.add(bb_name)\
    .set_port([dispose_p, gain_p, exposuretime_p, ])\
    .set_param([pixel_format_ptr, gain_key, exposure_key, ])
output_p = node.get_port('output')
```

Since this is the only one BB in our pipeline, output port of the node can be the output port of the pipeline, and we name is `output_p`.

Our pipeline with BB and port looks like this:

![tutorial1-pipeline](./img/tutorial1-pipeline.png)

To pass the input values and get the output data from port, we prepare the buffers and mapping the buffer to port for input and port to buffer for output.

```python
# create halide buffer for input port
gain_data = np.array([48.0])
exposure_data = np.array([100.0])

gains = Buffer(Type(TypeCode.Float, 64, 1), (1,))
exposures = Buffer(Type(TypeCode.Float, 64, 1), (1,))
gains.write(gain_data.tobytes(order='C'))
exposures.write(exposure_data.tobytes(order='C'))

# create halide buffer for output port
outputs = []
output_size = (width, height, )
outputs.append(Buffer(Type(TypeCode.Uint, depth_of_buffer, 1), output_size))

# set I/O ports
port_map = PortMap()
port_map.set_buffer(gain_p, gains)
port_map.set_buffer(exposuretime_p, exposures)
port_map.set_buffer_array(output_p, outputs)
port_map.set_u1(dispose_p, False)
```

Note that `output_size` here is designed for 2D image. If the pixel format is RGB8, you need to set `(width, height, 3)` to add color channel.

`depth_of_buffer` is pixel size in bit; e.g. `8` for Mono8 and RGB8 while `16` for Mono10 and Mono12.

### Execute the pipeline

The pipeline is ready to run.

In our tutorial code, while gain and exposure time values mapping to input port are optional, dispose the device needs to be set to `False` while running and `True` at the end of program execution so that device would be safely closed.

```python
for x in range(loop_num):
    port_map.set_u1(dispose_p, x==loop_num-1)
    # running the builder
    builder.run(port_map)
```

After setting the dynamic port, use `builder.run` to execute the pipeline.

### Display with OpenCV

Since our output data (i.e. image data) is mapped into Buffer `outputs`, we can copy this to OpenCV buffer to image process or display.

Note that OpenCV has dirfferent order of channel (dimension) on their buffer.

```python
buf_size_opencv = (height, width)
output_byte_size = width*height*depth_in_byte
```
`depth_in_byte` is pixel size in byte; e.g. `1` for Mono8 and RGB8 while `2` for Mono10 and Mono12.

As we learned beforehand, if the device pixel format is RGB8, you need to set `(height, width, 3)` to add color channel.

We once copy the image data to bytes buffer, then copy to numpy array to display.

```python
output_bytes = outputs[0].read(output_byte_size) 

output_np_HxW = np.frombuffer(output_bytes, data_type).reshape(buf_size_opencv)
output_np_HxW *= pow(2, num_bit_shift)

cv2.imshow("A", output_np_HxW)
cv2.waitKey(0)
```

Note that `outputs` is the list of Buffer (so that you many set `num_device` more than `1` to control multiple devices), you access `outpus[0]` to get image data.

Repeating the set of this process in `for` loop successfully shows the sequential images from camera device. 

Do not forget to destroy windows that displayed the image after `for` loop.

```python
cv2.destroyAllWindows()
```

## Complete code

Complete code used in the tutorial is [here](https://github.com/Sensing-Dev/tutorials/blob/main/python/tutorial1_display.py)