# Update OpenCV

While Sensing-Dev SDK provides OpenCV library, you may want to use the specific version of OpenCV or the one you have already installed beforehand.

However, this can be little tricky because OpenCV installed without the Sensing-Dev installer script may not be found by your application or tutorial code due to missing environment variables.

This document provides tips on how to update OpenCV and set environment variable.

## 1 Uninstall current Sensing-Dev

If you have already installed Sensing-Dev with OpenCV, to avoid version conflicts, we recommend uninstalling Sensing-Dev first and reinstalling it without OpenCV option. If you have not installed Sensing-Dev, please follow only step 1.2 to install Sensing-Dev without OpenCV.

### Windows users

1.1. Remove the directory `C:\Users\<username>\AppData\Local\sensing-dev\`

1.2. Reinstall Sensing-Dev following the instruction in the [Windows Setup Guide](../../startup-guide/windows). Note that you should specify the version of SDK with `-version` option, and you should **NOT** add `-InstallOpenCV` option.

1.3. Remove the following environment variable from System Property.

| Environment variable name   | value                                                                     |
|-----------------------------|---------------------------------------------------------------------------|
| `PATH`                      | `C:\Users\<username>\AppData\Local\sensing-dev\opencv\build\x64\vc15\bin` |

### Linux users

1.1 Remove the directory `/opt/sensing-dev/`

1.2. Install Sensing-Dev again with the instruction of [Linux Setup Guide](../../startup-guide/linux). Note that you should specify the version of SDK with `--version` option, and you should **NOT** add `---install-opencv` option.

## 2 Re-install OpenCV

If you already have OpenCV installed by yourself, you can skip this item.

### Windows uesrs

2.1. Go to [the official website of OpenCV](https://opencv.org/releases/), and download the version you want. For MSVC 17.10 or later users, OpenCV must be 4.10.0 or newer.

2.2. Install OpenCV wherever you prefer, but we installing it under `C:\Users\<username>\AppData\Local\sensing-dev` to simplify finding OpenCV for the tutorial code. In this instruction, we refer to the install directory as `%OpenCV_ROOT%`.

### Linux users

Follow the instruction on the official OpenCV website to build OpenCV. If you have multiple versions of OpenCV on your machine, you may want to set `CMAKE_INSTALL_PREFIX` to avoid conflicts and overwriting.

## 3 Set environment variable & compile options

### Windows uesrs

3.1. For any user application and tutorial using OpenCV, the system needs to find dynamic link library (`opencv_world<version>.dll`). Therefore, append the following absolute path to `PATH` environment variable. If you have multiple OpenCV on your system, ensure you set the correcty priority and order in `PATH`.

| Environment variable name   | value                                              | e.g. OpenCV 4.10.0 under C drive |
|-----------------------------|----------------------------------------------------|-------|
| `PATH`                      | `%OpenCV_ROOT%\build\x64\vc<compiler version>\bin` |`C:\opencv\build\x64\vc16\bin`|

3.2. Additionally, if your application or the tutorial code requires OpenCV, you may want to compile and build the program with your new OpenCV. This varies depending on the compiler or compiling method, but here we give a tip for cmake compiling. The tutorial uses cmake with the option of `-DOpenCV_DIR %OpenCV_ROOT%\build` in the following cmake file.

```cmake
# CMakeLists.txt

...

# if OpenCV is installed under sensing-dev directory, cmake file can find OpenCV 
if(NOT OpenCV_DIR)
    set(OpenCV_DIR $ENV{SENSING_DEV_ROOT}/opencv/build)
endif()

# otherwise, cmake will look for OpenCV under ${OpenCV_DIR}
find_package(OpenCV REQUIRED PATHS ${OpenCV_DIR})

# if you are using OpenCV headers, include directory by yourself
include_directories( ${OpenCV_INCLUDE_DIRS} )

# if you are using OpenCV static library, set it by yourself
target_link_libraries(${TUTORIAL_NAME} PRIVATE ${OpenCV_LIBS})

```

### Linux users

3.1. If your application or the tutorial code requires OpenCV, you may want to compile and build the program with your new OpenCV. It varies depending on the compiler or compiling method, but here are some environment variables you may find useful:

* PKG_CONFIG_PATH
* LD_LIBRARY_PATH

3.2. Also, do not forget to set link option for libraries and headers. The following example are using the default install location `/usr/local/`.

```bash
# example with gcc
g++ -I /usr/local/include/opencv4 \
-L /usr/local/lib
...
```





