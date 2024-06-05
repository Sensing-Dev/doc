---
sidebar_position: 6
---

# Retrieve Frame Count

In this tutorial, we learn how to get frame count from camera with ion-kit.

## Prerequisite

* OpenCV (installed with sensing-dev SDK with `-InstallOpenCV` option) 
* ion-kit (installed with sensing-dev SDK) 

## Tutorial

The process of setting up the pipeline is the exactly same as the one in the previous tutorials. We just need to set up an additional output port and buffer to obtain frame count from the BB.

### Get frame count 

While displaying image, we also want to retrieve the frame count information. The only difference from previous tutorials is that we need to bind the frame count value to a new port.

```c++
std::vector<Halide::Buffer<uint32_t>> fc;
for (int i = 0; i < num_device; ++i){
    fc.push_back(Halide::Buffer<uint32_t>(1));
}
n["frame_count"].bind(fc);
```

### Execute the pipeline

Execute `builder.run()` to finish the pipeline.

Since frame count directory does to numpy array `frame_counts[i]` for ith device, you can print each framecount as follows:

```c++
std::cout << fc[i](0) << " " << std::endl;
```

:::tip API updates from v24.01.04
The latest SDK's API returns the output `framecount` as an array whose length corresponds to the number of devices, with each element being a Halide Buffer. [0] contains the value of `framecount`. In contrast, version 24.01.04 returns the output of `framecount` as a single Halide Buffer, with a length equal to the number of devices.
:::

## Complete code

import {tutorial_version} from "@site/static/version_const/v240505.js"
import GenerateTutorialLink from '@site/static/tutorial_link.js';

<GenerateTutorialLink language="cpp" tag={tutorial_version} tutorialfile="tutorial3_getting_frame_count" />

:::caution why it does not work
* If you are using OpenCV that you install by yourself, please confirm that it is linked to your program appropriately.
:::