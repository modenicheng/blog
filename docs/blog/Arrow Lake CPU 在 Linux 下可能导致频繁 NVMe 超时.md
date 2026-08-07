---
title: Arrow Lake CPU 在 Linux 下可能导致频繁 NVMe 超时
createTime: 2026/08/07 14:53:57
permalink: /blog/2pc68rfd/
tags:
  - Linux
---

最近终于解决了我这台笔记本的开机慢问题，特记录当前平台和 Linux 内核存在的 BUG。

其实除了这个 BUG 以外我还遇到了英特尔核显初始化的问题，详见[《Intel GSC Proxy 初始化过慢》](/blog/gsc-proxy-init/)。

## 省流 TL;DR

我的笔记本在 Linux 下频繁出现：

```text
nvme nvmeX: I/O tag ... timeout, completion polled
```

开机、运行《原神》、扫描目录都可能触发，每次卡顿约 30 秒。禁用 APST、ASPM，换 LTS 内核，都没能彻底解决；把原神从 NTFS 搬到 ext4 后，问题依旧，而且两块 NVMe 都出现过同样错误。

解决方案是 **在 BIOS 关闭 VMD**。两块 SSD 改走原生 NVMe 路径后，Live USB 和已安装系统都不再复现 timeout，Linux 7.1.5 也能正常启动。所以目前最实用的结论是：这个问题和 Intel VMD 相关，可能涉及 VMD、PCIe 中断路径、平台固件和 Linux 驱动之间的兼容性。（可惜，我才疏学浅，拼尽全力无法找到根因）

## 0. 基础信息

本机情况比较复杂，涉及到双系统、多块物理硬盘双显卡以及 OLED 屏幕。这个比较复杂的系统环境实打实对搞机不友好……
!!btw 收拾好之后体验还是很不错的!!

以下是我使用的笔记本的详细配置信息

```text :no-line-numbers
Laptop:
    ASUS 16-inch gaming laptop, ROG Zephyrus G16 family
    Intel Core Ultra 9 285H, 16 logical CPUs
    30 GiB RAM, no swap
    UEFI firmware, BIOS 307 series

Graphics:
    Intel Arrow Lake-P integrated GPU, i915
    NVIDIA GeForce RTX 5060 Laptop/Max-Q, 8 GiB
    nvidia-open-dkms 610.43.03

Storage:
    1x ZHITAI TiPlus7100, approximately 4 TB, firmware ZTA22007
    1x SK hynix HFS001TEJ9X101N/PC801-class NVMe SSD, approximately 1 TB,
    firmware 51000A20

Disk layout:
    ZHITAI:
        Windows data NTFS partition
        EFI system partition
        Arch Linux ext4 root
    SK hynix:
        Windows system NTFS partition
```

## 1. 问题表现

主要表现为开机和进行大量读写操作的时候非常非常卡。

在测试与 debug 过程中，`du` 命令是可以稳定复现此 bug 的。当然也有其他经常触发的方法，例如开一个《原神》……

```bash :no-line-numbers
du -h -d 1 # 用人类易读的方式显示当前目录下各项占用空间，限制显示递归深度为一，但实际上 du 仍会遍历下层目录每一个文件。
           # 这可以通过高频读取给磁盘上压力，触发超时问题
```

:::details 极其神秘的 Debug 历程
当时我正在玩《原神》，并注意到了它的卡顿。

在 Linux 下它是这么启动的：

```text :no-line-numbers
Steam - dwproton - YuanShen.exe
```

其中 Steam 和 dwproton 在 Linux 的 ext4 分区，而原神在 Windows 侧的 D 盘，也就是和 Linux 在同一个物理磁盘上的那个 NTFS 分区上。
dwproton 通过直接读取 NTFS 侧的原神文件运行，避免了重复下载。

开游戏的时候，我就遇到了大量的卡顿，每一次都卡很久。进入游戏后也有数次卡顿。这些卡顿的表现非常一致，都是在加载新场景/长传送下触发，
并且触发时 CPU 和 GPU 压力同时下降，整个游戏进程好像就被暂停了一样。这个时候看内核日志，可以看到有好几条 NVMe 超时的 error。
此时我就把原神的卡顿和开机的卡顿归为一类了，打算「并案」处理。这下有了好用的测试方法，不用我进行额外的重启操作了（这时候还没发现 `du` 也可以作为测试）。

一开始，我还以为卡顿的原因是 NTFS 驱动的兼容问题。因此，我把驱动从 ntfs-3g 换为 ntfs3（最新主线中已经包含了此驱动），但是无济于事。
由此至少可以排除 NTFS3 是唯一原因。那么，可能是 NTFS 自己的问题吗？我又把整个原神 rsync 到 ext4 分区，卡顿依旧可以复现。
所以我有点没招，后面测试时就直接保持 D 盘不挂载，避免干扰。

:::

具体的内核错误日志类似：

```text
nvme nvmeX: I/O tag ... timeout, completion polled
```

其中 `nvmeX` 指的是其中的某一块硬盘，`X` 是一个数字。例如 `nvme0`。

这类报错日志的典型特征如下：

- 单次等待约 30 秒；
- 终端、NetworkManager、SDDM、Niri、游戏加载都可能卡住；
- timeout 后没有 controller reset；
- SMART 没有报告介质错误，健康信息整体正常；
- 没有发现与这些 NVMe timeout 直接相关的 AER 或 DMAR 错误；
- completion polled 表示超时路径通过轮询发现请求完成，但不能仅凭这条日志证明一定是 MSI-X 丢失。

最初，大多数 timeout 来自 ZHITAI，也就是 Linux 系统所在的磁盘；但后续又在 SK hynix 上发现几乎完全一致的 timeout，
所以怀疑对象从硬盘本身转移到了通讯链路上。

这个问题可能只有 Linux 有。Debug 过程中，我在 Windows 侧也执行了压力测试，并查看系统事件，暂时没有发现类似 timeout。
这至少说明问题更像 Linux、VMD、平台固件和 SSD 组合造成，而不是 Windows 下也必然出现的硬盘故障。

## 2. 尝试的修复

这里有一些**不完全有效**的尝试。

### 2.1 禁用 APST

设置内核启动参数 `nvme_core.default_ps_max_latency_us=0` 禁用 APST 之后，启动有明显改善，NVMe 超时的情况有所改善，但是没有彻底解决这个问题
具体而言，超时发生频率下降但是在频繁读磁盘的情况下还是可以稳定复现问题。

而且由于它禁用了硬盘的电源管理，它会让硬盘更耗电。所以我个人在一开始就没打算长期使用此参数。

### 2.2 禁用 ASPM

排除硬盘本身的电源管理之后，问题依旧；所以进一步关闭了 Linux 系统对 PCIe 总线的管理，使用固件的默认配置。即设置了内核启动参数
`pcie_aspm=off`

重启系统后，在同时禁用 APST 和 ASPM 的情况下还是出现超时的问题。所以 ASPM 也不是硬盘超时的根因。

### 2.3 回滚内核

考虑到最开始使用的内核 7.1.5 可能不如 LTS 版本稳定，所以尝试回退到了最新的 LTS 版本 6.18.41，可惜仍无济于事。

## 3. 各项测试及对应结果

前面已经写过 APST、ASPM 和换内核，这里不再重复。下面只记录几个真正帮助定位问题的测试。

### 3.1 再排查 NTFS、ext4 和具体程序

最开始原神放在 Windows D 盘，加载场景时会卡，并伴随 ZHITAI timeout。那时我首先怀疑 NTFS3，于是先从 ntfs-3g 换成 ntfs3，没效果。

随后我把原神完整 rsync 到 Arch 根分区的 ext4，卸载 D 盘，再从 ext4 启动。结果还是会 timeout。之后不启动原神，只运行普通桌面，仍然能遇到同样问题。

这说明 NTFS3 和原神都不是必要条件。它们可能参与触发，但问题至少独立存在于底层 NVMe/VMD 路径。

`du` 是当时最容易复现问题的命令：

```bash :no-line-numbers
du -h -d 1
```

它会递归读取目录内容，只显示一层目录统计。我的根分区就在 ZHITAI 上，所以 `du` 扫描时，终端、桌面程序和其他访问根分区的进程都可能一起卡住。

曾经还写过一个固定文件、固定块大小、固定间隔的 `O_DIRECT` 只读脚本，连续跑了三轮，没有出现新的 timeout。但这不能说明问题消失了，后面完整执行 `du` 仍然复现。看起来触发条件和 I/O 访问模式有关，单次阴性结果没有太大参考价值。

迁移到 ext4 的测试中还抓到过：

```text :no-line-numbers
wineboot.exe  D  ext4_read_bh
```

这解释了为什么游戏卡顿时 CPU 和 GPU 占用会一起下降：进程正在等根分区读取完成。整个过程中没有看到 `EXT4-fs error`、`journal aborted` 或 `Buffer I/O error`，所以没有证据表明 ext4 自己坏了。

### 3.2 顺手测试 CPU C-state

网上有一台类似 Meteor Lake 机器，把 CPU 限制在较浅 C-state 后就不再 timeout。我也照着测了一遍。

本机大概是：

```text :no-line-numbers
C1：1 µs
C2：127 µs
C3：1048 µs
```

PM-QoS 持有 `100 µs` 时，CPU0 的 C2/C3 计数停止增长，基本只进入 C1。但 QoS 持有期间仍然出现了两次 ZHITAI timeout。
很遗憾，这不是正确答案。借此我们排除了 CPU C-state 的影响，证明了问题与此无关。

### 3.3 抓 IRQ 和 NVMe 命令

前面只能看到 timeout，不能知道请求到底什么时候提交、什么时候完成。因此用 ftrace 同时抓了：

```text :no-line-numbers
nvme_setup_cmd
nvme_complete_rq
irq_handler_entry
irq_handler_exit
```

相关 tracepoint 定义见 [Linux NVMe tracepoint 源码](https://github.com/torvalds/linux/blob/master/drivers/nvme/host/trace.h)。

一次完整 trace 中，一个 8 KiB 读取请求从提交到完成花了约 30 秒：

```text :no-line-numbers
提交：1422.677822s
完成：1452.716813s
耗时：30.038991s
```

提交后立即进过一次对应 IRQ，但 NVMe handler 返回 `unhandled`。之后约 30 秒没有看到这个队列对应 IRQ，最后 timeout 路径通过轮询发现请求完成。与此同时，其他队列还在继续处理请求。除此之外，trace 还抓到了两个约 14 秒的长尾读取。

这次 trace 说明 VMD/NVMe 路径确实会让部分命令长时间得不到完成。至于具体是 SSD 晚完成，还是完成中断晚到，不能只看一行 `completion polled` 就下结论；不过问题已经明显不只是“磁盘读满了”。

### 3.4 两块 SSD 都能复现

最初大多数错误来自 ZHITAI，后来 SK hynix 也出现了同样格式的 timeout：

```text :no-line-numbers
I/O tag ... timeout, completion polled
```

两块盘都出现过问题后，单独某块 SSD 介质损坏的可能性就下降了。SMART/NVMe 日志没有报告介质错误，Windows 长时间读取测试也没有复现 Linux 下的 timeout。所以，它大概率就是 Linux 平台下 VMD 、固件等因素或其组合导致的问题，而硬件本身没什么毛病。

## 4. 基本确定是 VMD 相关问题

前面试了很多不同的测试，也抓了很多信号，排除了大多数可能，所以接下来好像只能大动干戈地改 BIOS ，看看是不是 VMD 引起的问题。!!为此，我闪送了一个 8G 的 USB 做 LiveUSB 来着!!

:::details 题外话
其实在比较早的时候就已经对 VMD 有所怀疑了，但是由于手头没有 USB（后来用的是直接点了个闪送到家），而且不想改 BIOS，还担心 Windows
会不会启动不了，而一直搁置……

所以做事其实该果断些，这么着磨磨叽叽的，真是绕了好大一圈……
:::

至于为什么使用 LiveUSB，主要考虑是避免改了 VMD 之后整个系统直接起不起来，但实际上它在我这里是多余的。对于当前我所采用的 systemd-boot + 硬盘分区 UUID
的引导方式，VMD 开不开不影响 Linux 启动，而 Windows 也不需要改引导就可以正常启动（虽然需要进一次安全模式，让 Windows 自己把 VMD 的硬盘驱动改到 原生驱动）

BIOS 禁用 VMD 后，从独立的 LiveUSB 系统启动，挂载硬盘并执行了数次 `du -h -d 1`，均未复现卡顿；另一个 TTY 中也没有观察到 NVMe timeout。

之后在已安装系统中继续使用 native NVMe 路径，Linux 6.18.41 LTS 和 7.1.5 都能正常启动。因此，至少可以确认：当前平台在 VMD 开启时存在问题，关闭 VMD 后问题消失。至于锅具体落在 VMD 驱动、BIOS、PCIe 中断路径还是它们之间的组合，目前没必要继续细分，关闭 VMD 已经解决实际使用问题。

关闭 VMD 后，前面为了排查 NVMe timeout 加上的参数都可以移除，例如：

```text :no-line-numbers
nvme_core.default_ps_max_latency_us=0
pcie_aspm=off
nvme.use_threaded_interrupts=1
```

移除这些参数后，Linux 仍然可以正常启动，NVMe 也没有再出现 timeout。需要注意，测试 `intremap` 相关参数时，使用 `intremap=off` 会导致系统无法正常启动，因此这条参数不能作为当前机器上的常规测试方案。

## 5. 前人栽树，后人乘凉

和朋友聊起此事，得知原来 Meteor Lake (Intel Ultra 9 185H) 也有类似现象，相关案例见 [Kernel Bugzilla #219220](https://bugzilla.kernel.org/show_bug.cgi?id=219220)。另一个 VMD IRQ 生命周期回归见 [Ubuntu Launchpad #2134424](https://bugs.launchpad.net/ubuntu/+source/linux-signed-hwe-6.17/+bug/2134424)。

对应补丁见：[补丁邮件归档](https://yhbt.net/lore/linux-patches/20251021195043.267235879@linuxfoundation.org/)、[补丁文件镜像](https://gitlab.manjaro.org/packages/core/linux617/-/blob/6641f07fa8334ed858123c20eca8942eecd8cad1/0000-PCI-vmd-override-irq_startup-irq_shutdown-in-vmd_init_dev_msi_info.patch) 和 [主线提交](https://github.com/torvalds/linux/commit/e433110eb5bf067f74d3d15c5fb252206c66ae0b)。这个补丁已经进入 Linux 主线，但它修的是 VMD MSI/MSI-X 中断域的 `irq_startup()`/`irq_shutdown()` 生命周期，主要针对一个特定内核回归，并不等于它已经修好本文硬件上的 timeout。准确来说，它和本文问题很像，值得拿来编译内核跑一下试试；只是我懒，最后没有真的编译测试（毕竟我只是想快点用上 Linux 而不是给它做开发）。

注意到，我使用的 CPU 恰是 MTL 的下一代 ARL，而查阅 Intel 官方更新记录，也没看出 VMD 这条路径有什么明确修复，只看到平台增加了一路 VMD。至于 MTL 和 ARL 的问题是否同源，目前只能说很像，不好直接盖棺定论。
