---
title: MSST WebUI 部署在较新GPU上所遇到的问题
createTime: 2025/07/31 08:49:23
permalink: /article/cb1exuhr/
tags:
    - AI
    - torch
---

其实是一个很奇怪的问题：

之前在做音频分离，尝试了很多软件，比如 UVR5, 和这次的 MSST WebUI。

一开始嫌麻烦（懒得配环境），所以直接下载了 Windows 安装包，软件界面均可正常进入，其他功能均正常，但是一旦到了最核心的模型推理上，二者却均不可用：

- UVR5 具体表现为 无论什么模型进度条都不动，同时使用 `nvidia-smi` 命令查看 GPU 参数，发现总功耗极低（不超过10W），显然没有进行运算工作；显存占用上升，目测模型正确加载。
- MSST WebUI 在 console 输出内容报错：

    ```plaintext
    RuntimeError: CUDA error: no kernel image is available for execution on the device
    CUDA kernel errors might be asynchronously reported at some other API call, so the stacktrace below might be incorrect.
    For debugging consider passing CUDA_LAUNCH_BLOCKING=1.
    Compile with `TORCH_USE_CUDA_DSA` to enable device-side assertions.
    ```

根据 MSST WebUI 的报错，猜想是因为 CUDA 版本不兼容的问题（不过理论上来讲 CUDA 是可以向下兼容的，之前版本也确实都可以向下兼容，唯独到了 RTX50 这一代突然就不能了）

根据这种猜测，我们先尝试从源码部署。

参照项目 README：

<RepoCard repo="SUC-DriverOld/MSST-WebUI" />

源码部署时，推荐使用 Python3.10。**已知 Python3.13 会出现不兼容的情况。**

另：如果系统未安装 conda 或你不想用，可以使用 virtualenv 作为替代。

先贴一下 GPU 配置：

```plaintext
GPU 处理器：NVIDIA GeForce RTX 5060 Laptop GPU
驱动程序版本：576.57
...
NVCUDA64.DLL    32.0.15.7657    NVIDIA CUDA 12.9.76 driver
```

根据 GPU 控制面板显示的相关信息，安装 CUDA 12.9.x。然后，打开 PyTorch 官网，发现其中并无对应的 torch 版本，所以选择版本差距最小的 CUDA 12.8 版本的 torch。（就是使用下面这一条安装）

```bash
pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu128
```

