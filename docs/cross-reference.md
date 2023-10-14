---
id: cross-reference
---

# Glossary

## Cross-Reference

This section has a short definition or explanation for each terminology.

If you would like to look up the concept of image processing, see [tutorial pages](/tutorials/intro)

---

### Aravis

Aravis is a GObject based camera acquisition library that allows to control U3V camera and GigE camera devices. See the detail in [Aravis section on Software Package page](/startup-guide/software-stack).

### Building Block (BB)

Building blocks (BBs) are the components of the pipeline that you design for image I/O and processing. Each BB has the minumum feature, such as obtain image from sensor, rescale, or demosaic. See the detail in [Building Block section on Tutorial Intro page](/tutorials/intro).

### Chunk Data

### GenDC

GenDC is Generic Data Container defined by [**EMVA**&#128279;](https://www.emva.org/). As it is named with *generic*, it can contain any types of data while other data type contain only image or image with Chunk data. Sensing-Dev software package supports the sensor with GenDC format. See the detail in [About U3V Camera page](/lessons/camera) 

### GenICam

GenICam (Generic Interface for Cameras) is a software interface standard for vision devices. See the detail in [About U3V Camera page](/lessons/camera) 

### Gigabit Ethernet (GigE) Camera

Gigabit Ethernet (GigE) Camera is one of the hardware interfaces of web cameras. The feature of this standard is its connection via Ethernet cable, and it functions with the longer cable than U3V Camera. See the detail in [About U3V Camera page](/lessons/camera) 

### ion-kit

ion-kit is an image processing framework which enables to efficiently describe and compile a user-defined image processing pipeline. See the detail in [ion-kit section on Software Package page](/startup-guide/software-stack).

### libUSB

libUSB is a driver used by Aravis to access and control the camera device on Linux. See the detail in [libUSB/WinUSB section on Software Package page](/startup-guide/software-stack).

### Open Source Software (OSS)

Open Source Software (OSS) is released under each license that allows user to use, modify, and re-distribute with some restriction. There are some types of OSS license permissive (e.g. MIT license) and copyleft (e.g. LGPL-2.1). The detail of Open Souce is defined on [Open Source Initiative&#128279;](https://opensource.org/).

### Pipeline

A pipeline is a series of processing. For ion-kit, the component element is called Building Block (BB), and it is chained with the other BBs to define a whole image-processing program. See the detail in [Building Block section on Tutorial Intro page](/tutorials/intro.mdx).

### USB 3 Vision (U3V) Camera

USB 3 Vision (U3V) Camera is one of the hardware interfaces of web cameras. The feature of this standard is its connection via USB 3 cable, and it allows high-speed. high-pixel-depth, and large data size of transfer. See the detail in [About U3V Camera page](/lessons/camera) 

### WinUSB

WinUSB is a driver used by Aravis to access and control the camera device on Windows. See the detail in [libUSB/WinUSB section on Software Package page](/startup-guide/software-stack).