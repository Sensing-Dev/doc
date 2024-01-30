---
sidebar_position: 6
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

The process of setting up the pipeline is the exactly same as the one in the previous tutorials. We just need to set up an additional output port and buffer to obtain frame count from the BB.

### Get frame count 

While displaying image, we also want to retrieve the frame count information. The only difference from previous tutorials is that we need to bind the frame count value to a new port.

```python
fcdata = np.full((1), fill_value=0, dtype=np.uint32)
frame_count = []
for i in range(num_device):
    frame_count.append(Buffer(array=fcdata))
```


### Execute the pipeline

Execute `builder.run()` to finish the pipeline.

Since frame count directory does to numpy array `fcdata`, you can print each framecount as follows:

```python
print(fcdata[0])
```


## Complete code

Complete code used in the tutorial is [here](https://github.com/Sensing-Dev/tutorials/blob/main/python/tutorial3_getting_frame_count.py)