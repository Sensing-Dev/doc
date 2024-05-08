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
fcdatas = []
frame_counts = []
for i in range(num_device):
    fcdatas.append(np.zeros(1, dtype=np.uint32))
    frame_counts.append(Buffer(array=fcdatas[i]))
```


### Execute the pipeline

Execute `builder.run()` to finish the pipeline.

Since frame counts are directory stored to numpy array `fcdata`, you can print each framecount for `i`th sensor as follows:

```python
print(fcdatas[i][0], end=" ")
```


## Complete code

import {tutorial_version} from "@site/static/version_const/latest.js"
import GenerateTutorialLink from '@site/static/tutorial_link.js';

<GenerateTutorialLink language="python" tag={tutorial_version} tutorialfile="tutorial3_getting_frame_count" />