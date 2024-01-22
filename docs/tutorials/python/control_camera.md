---
sidebar_position: 5
---

# Eable control

In this tutorial, we learn how to set Gain and Exposure time manually on ion-kit based on the previous tutorial that [display 1-camera image](display-image), and 
[display multiple cameras images](display-image-2came)

## Prerequisite

* ionpy 
* numpy
* OpenCV

```bash
pip3 install -U pip
pip3 install opencv-python
pip3 install opencv-contrib-python
pip3 install numpy
pip3 install ion-python
```

## Tutorial

### Get Device Information

To display images with ionpy, we need to get the following information of the device.

* Width
* Height

The [previous tutorial](obtain-device-info.md) or [arv-tool-0.8](../../external/aravis/arv-tools.md) will help to get these values.

### Build a pipeline

While the structurte of BB is the same as the [tutorial that display 1-camera image](display-image), and 
[tutorial that display multiple cameras image](display-image-2came), we need some small changes to enable `Gain` and `ExposureTime` setting.

In this tutorial, we can set `Gain` and `ExposureTime`  manually by setting enable_control to `true`.

While port input is dynamic; i.e. it can be updated for each run, you can set static values in string via Param.

```python
# set params
num_devices = Param('num_devices', str(num_device))
gain_key = Param('gain_key', 'Gain')
exposure_key = Param('exposure_key', 'ExposureTime')
# add enable_control
enable_control = Param('enable_control', 'true')
node = builder.add(bb_name)\
        .set_iport([gain_ps[0], exposure_ps[0]])\
        .set_param([num_devices, frame_sync, realtime_diaplay_mode, enable_control, gain_key, exposure_key]) if num_device == 1 \
        else builder.add(bb_name)\
            .set_iport([gain_ps[0], exposure_ps[0], gain_ps[1], exposure_ps[1]])\
            .set_param([num_devices, frame_sync, realtime_diaplay_mode, enable_control, gain_key, exposure_key])
```
Then, bind the input values to ports.
```python
# gain ports
gain_ps = []
# exposuretime ports
exposure_ps = []
for i in range(num_device):
    gain_ps.append(Port('gain' + str(i), Type(TypeCode.Float, 64, 1), 0))
    exposure_ps.append(Port('exposure' + str(i), Type(TypeCode.Float, 64, 1), 0))

gain_values = []
exposure_values = []

for i in range(num_device):
    gain_values.append(40.0)
    exposure_values.append(100.0)

# set gain values and exposuretime vlaues
for i in range(num_device):
    gain_ps[i].bind(gain_values[i])
    exposure_ps[i].bind(exposure_values[i])
```
Now, we have set `Gain` and `ExposureTime` successfully!

Similarly, outputs requires Buffers to store images that BB obtains. 

```python
outputs = []
output_datas = []
output_size = (height, width, )
if pixelformat == "RGB8":
    output_size += (3,)
for i in range(num_device):
    output_datas.append(np.full(output_size, fill_value=0, dtype=data_type))
    outputs.append(Buffer(array= output_datas[i]))
# set output ports
for i in range(num_device):
    output_p[i].bind(outputs[i])
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