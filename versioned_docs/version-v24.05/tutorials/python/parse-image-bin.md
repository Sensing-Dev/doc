---
sidebar_position: 10
---

# Parse non-GenDC binary data

In this tutorial, we learn how to user GenDC separator library.

## Prerequisite
 
* json
* OpenCV
* numpy

import this_version from "@site/static/version_const/v2405.js"

<pre>
<code class="language-bash">
pip3 install -U pip<br />
pip3 install opencv-python<br />
pip3 install numpy<br />
</code>
</pre>

## Tutorial

In the [previous tutorial](save-image-bin), we learned how to save image data into a binary file. Now, we will load the data, parse the whole data, and retrieve images.

### Binary file structure 

The structure of binary data saved in the [previous tutorial](save-image-bin) is as follows:

| Size in Byte  | Content    |
|---------------|------------|
| 4                | framecount |
| w \* h \* d \* c | image      |
| 4                | framecount |
| w \* h \* d \* c | 4          |
| 4                | framecount |
| ...              | ...        |
| w \* h \* d \* c | image      |

Framecount is 4 byte-length, and imagedata size is width * height * byte-depth * number of channel.

The value of width and height is in &ltprefix>-config.json with binary file saved by the pipeline in the [previous tutorial](save-image-bin).

The byte-depth and the number of channel can be calculated from PixelFormat, which is also noted in &ltprefix>-config.json.

Config file is saved with the binary files under `tutorial_save_image_bin_XXXXXXXXXXXXXXXXXX` and prefix is `image0-`.

```python
# image info from image0-config.json
f = open(os.path.join(directory_name, prefix + "config.json"))
config = json.loads(f.read())
f.close()

w = config["width"]
h = config["height"]
d = 2 if config["pfnc_pixelformat"] == Mono10 or config["pfnc_pixelformat"] == Mono12 \
    else 1
c = 3 if config["pfnc_pixelformat"] == RGB8 or config["pfnc_pixelformat"] == BGR8 \
    else 1
framesize = w * h * d * c
```

### Find Binary file.   

If you use the binary file saved in the previous tutorial, the name of the directory should be `tutorial_save_image_bin_XXXXXXXXXXXXXXXXXX` and binary file prefix is `image0-`.

```python
directory_name = "tutorial_save_image_bin_XXXXXXXXXXXXXXXXXX"
prefix = "gendc0-"
```

The following snippet attempts to retrieve all binary files starting with a specified prefix from a directory. It then reorders all the found binaries according to their recorded order.

```python
bin_files = [f for f in os.listdir(directory_name) if f.startswith(prefix) and f.endswith(".bin")]
bin_files = sorted(bin_files, key=lambda s: int(s.split('-')[-1].split('.')[0]))
```

Now, we go through all ordered binary files in `bf` with for loop.

```python
for bf in bin_files:
```

### Open and load Binary file.  

In the for loop, our target (single) binary file is `bf`. We open this binary file as `ifs` and read the whole content of `itf`.

```python
bin_file = os.path.join(directory_name, bf)

with open(bin_file, mode='rb') as ifs:
    filecontent = ifs.read()
```

### Parse binary file
Finally, we parse each binary file.

Since we know the size of framecount is -byte, which is the size of 32-bit integer. We copy the 4-byte data from filecontent to framecount.

```python
cursor = 0
while cursor < len(filecontent):
    framecount = struct.unpack('I', filecontent[cursor:cursor+4])[0]
    print(framecount)
    ...
```

Image data is following framecount, so the offse is `+4` and the data size is `width * height * byte-depth * num-color-channel`.

```python
np_dtype = np.uint8 if d == 1 else np.uint16
while cursor < len(filecontent):
    image = np.frombuffer(filecontent[cursor+4:cursor+4+framesize], dtype=np_dtype).reshape((h, w))

    ...
    cv2.imshow("First available image component", image)
    cv2.waitKey(1)
```

Now OpenCV's imshow can display the image-preview.

To move on to the next framecount and image data, do not forget to shift the cursor.

```
cursor = cursor + 4 + framesize
```

## Complete code

import {tutorial_version} from "@site/static/version_const/v2405.js"
import GenerateTutorialLink from '@site/static/tutorial_link.js';

<GenerateTutorialLink language="python" tag={tutorial_version} tutorialfile="tutorial5_parse_image_bin_data" />
