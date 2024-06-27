---
sidebar_position: 2
---

# About U3V Camera

There are some types of web cameras that allows to stream to your computer, and it may connect via either USB or Ethernet. One  major interface standard of the former type is called **USB3 Vision (U3V)**. 

## Types of Camera Interfaces

Camera interfaces could be defined and categorized from two aspects: hardware and software. While connecting and controling devices are done by host machine, the **transport layer** of the software which accesses the low-level of the device registers and retrives the streaming data from the camera device needs to follow the hardware design. Here are the list of some types of hardware interfaces.

* **USB3 Vision**
* GigE Vision
* CoaXPress
* Camera Link
* Camera Link HS

## GenICam

[GenICam (Generic Interface for Cameras)](https://www.emva.org/standards-technology/genicam/) is generic software standard by defining API, naming convension, transport layer, control protocols, and data container. 

As it is named after "Generic Interface", the interface allows to use the same API no matter the resister of the hardware is designed, and Camera Description File in the format of XML file enables the schema. For more detail, please visit [emva; GenICam page](https://www.emva.org/standards-technology/genicam/).

:::tip
To instantly see and access GenICam features on camera devices, learn and use **`arv-tool-0.8`** provided by Aravis. The tool is included in the Sensing-Dev software package and shortly introduced on [appendix page](../external/aravis/arv-tools)
:::

## Payload type

U3V camera transfers two types of data to the host machine: Payload Buffer and Info Buffer. The first one has the actual data such as an image or image with some additional data, while the latter one contains the information about device or payload, e.g. the size of payload buffer or the pixel format of the payload.

U3V Camera 1.2 supports the following payload type.

| Payload Type | Description | Sensing-Dev software package | 
| --------   | ------- | ------- |
| Image | Uncompressed image data | Supported | 
| Image Extended Chunk | Support for Image extended chunk data. In this case, the Image must be the first chunk in the payload data. | Not Supported | 
| Chunk | Generic chunk mode where the first chunk is not derived from any payload type. Used to transmit any combination of chunks. | Not Supported | 
| GenDC Container | Used by GenDC Container Transfer Mode, the payload data contains an entire GenDC Container | Supported | 
| GenDC Component Data | Used by both GenDC Serial Flow and Parallel Flow Transfer modes, the payload data contains only the GenDC Component Data payload, and the GenDC Descriptor is contained within the Leader and/or Trailer | Not Supported | 

Reference: [**USB3 Vision® version 1.2**&#128279;](https://www.automate.org/a3-content/usb3-vision-standard)

### Image

Payload type `Image` is for the simple and uncompressed image without any metadata. Many of U3V camera supports this simple payload transfer to just obtain the image data.

### Chunk/Image Extended Chunk

Some U3V Camera transfer metadata along image data in the format of Chunk such as image, data extracted from image, pixel format, or exposure time, defined by the camera device. 

### GenDC Container

GenDC is Generic Data Container defined by [**EMVA**&#128279;](https://www.emva.org/). As it is named with *generic*, it can contain any types of data defined by the camera device no matter what data dimension is, metadata is, and image sequences/bursts are. This supports multi-component in a single container so that it allows different types of sensor data to have in a single container for easy syncronization.

:::info
Sensing-Dev supports GenDC format data by providing [GenDC Separator&#128279;](https://github.com/Sensing-Dev/GenDC) to dicompose the container to each component data.
:::
