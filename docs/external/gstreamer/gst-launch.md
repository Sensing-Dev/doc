# Tools from Gstreamer

**Gstreamer**, the multimedia process framework, has some simple tools to use its feature without using API.

| Name | Description |
| --------   | ------- |
| gst-inspect-1.0 | Print out information of Gstreamer plugins |
| gst-launch-1.0 | Run Gstreamer pipeline built in string format |

## How to get the tools

Run installer with an option `-InstallGstTools` for Windows and `--install-gst-tools` for Linux to install these tools with the other components of Sensing-Dev SDK. See the [setup guide](../../startup-guide/software-stack.mdx) for the detail.

## List available plugins (gst-inspect-1.0)

`gst-inspect-1.0` displays the list of all available plugins on your machine. If you install Sensing-Dev with installer script (and set up the environment varialble) by following [setup guide](../../startup-guide/software-stack.mdx), you see `aravissrc` and `gendcseparator` which are gst-plugins of Aravis and GenDC respectively. 

```bash
aravis:  aravissrc: Aravis Video Source
gendcseparator:  gendcseparator: GenDCSeparator
staticelements:  bin: Generic bin
staticelements:  pipeline: Pipeline object
```

:::caution why it does not work
If you don't see the expected plugins on the list or see WARNING "Failed to load plugin", it might be...
* Some SDK components have version conflict by installing different installer.
* Environment variables are not set (Particularly for Linux).
  * `GST_PLUGIN_PATH`
  * `PATH`: Windows
  * `LD_LIBRARY_PATH`: Linux 
:::

## Display information of a plugins/elements (gst-inspect-1.0)

`gst-inspect-1.0 <name of element or plugin>` displays information of a particular Gstreamer plugins or a particular element. The following example shows the partial information about `gendcseparator`. You can see Factory Details, Plugin Details, and Pad Templates and Element Properties/Signals which help building pipeline.

```bash
$ gst-inspect-1.0.exe gendcseparator
...
Pad Templates:
  SRC template: 'component_src%u'
    Availability: Sometimes
    Capabilities:
      ANY

  SINK template: 'sink'
    Availability: Always
    Capabilities:
      ANY

  SRC template: 'src'
    Availability: Always
    Capabilities:
      ANY
...

Element Properties:
  name                : The name of the object
                        flags: readable, writable
                        String. Default: "gendcseparator0"
  parent              : The parent of the object
                        flags: readable, writable
                        Object of type "GstObject"
  silent              : Produce verbose output ?
                        flags: readable, writable
                        Boolean. Default: true

...
```

## Run a pipeline (gst-launch-1.0)

In most cases, we use the GStreamer API to build and run a pipeline, but `gst-launch-1.0` allows us to run a pipeline as a string, where each element is concatenated with `!`. See the detail in [gstreamer tutorial](./gst-launch.md).


The following example obtains sensor data from `aravissrc` (the source element of the Aravis GStreamer plugin) and saves the data into `output%d.bin` using `multifilesink` (the sink element of the multifile plugin).


```
gst-launch-1.0 aravissrc camera-name=<camera name> ! multifilesink location=output%d.bin
```

![gst-launch-1.0 example](./img/gst-launch-example.png)