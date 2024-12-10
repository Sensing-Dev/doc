# Tools from Gstreamer

**Gstreamer**, the multimedia process framework, has some simple tools to use its feature without using API.

| Name | Description |
| --------   | ------- |
| gst-inspect-1.0 | Print out information of Gstreamer plugins |
| gst-launch-1.0 | Run Gstreamer pipeline built in string format |

## How to get the tools

Run installer with an option `-InstallGstTools` for Windows and `--install-gst-tools` for Linux to install these tools with the other components of Sensing-Dev SDK.

## List available plugins

`gst-inspect-1.0` displays the list of all available plugins on your machine. If you install Sensing-Dev with installer script (and set up the environment varialble) by following [setup guide](../../startup-guide/software-stack.mdx), you see `aravissrc` and `gendcseparator` which are gst-plugins of Aravis and GenDC respectively. 

```bash
aravis:  aravissrc: Aravis Video Source
gendcseparator:  gendcseparator: GenDCSeparator
staticelements:  bin: Generic bin
staticelements:  pipeline: Pipeline object
```