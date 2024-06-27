---
sidebar_position: 6
---

# Retrieve Frame Count

In this tutorial, we learn how to get frame count from camera with ion-kit.

## Prerequisite

* ionpy 
* numpy
* OpenCV

import this_version from "@site/static/version_const/v2401.js"

<pre>
<code class="language-bash">
pip3 install -U pip<br />
pip3 install opencv-python<br />
pip3 install numpy<br />
pip3 install ion-python=={this_version.ion_python_version}<br />
</code>
</pre>

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

import {tutorial_version} from "@site/static/version_const/v2401.js"
import GenerateTutorialLink from '@site/static/tutorial_link.js';

<GenerateTutorialLink language="python" tag={tutorial_version} tutorialfile="tutorial3_getting_frame_count" />
