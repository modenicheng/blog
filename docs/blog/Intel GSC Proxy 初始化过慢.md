---
title: Intel GSC Proxy 初始化过慢
createTime: 2026/08/07 22:28:31
permalink: /blog/gsc-proxy-init/
tags:
  - Linux
---

之前排查开机慢时，发现 Intel GSC Proxy 也会拖慢启动。内核日志大概是：

```text
GSC proxy component didn't bind within expected timeout
```

当时这个等待发生在 initramfs 阶段，最长会拖慢三十秒左右。它和另一篇文章里提到的 NVMe timeout 同时出现过，但两者不是同一个问题，后面关闭 VMD 也不能代替 GSC 修复。

## 怎么确认

先看日志：

```bash
journalctl -b -k -o short-monotonic --no-pager |
  grep -Ei 'gsc|mei|proxy|firmware'
```

再看 initramfs 里有没有相关模块：

```bash
sudo lsinitcpio -l /boot/initramfs-linux.img |
  grep -Ei '(i915|mei|mei[-_]me|mei[-_]gsc[-_]proxy).*\.ko'
```

实际检查时，我发现 `mei_gsc_proxy` 没有提前放进 initramfs。系统启动后虽然能加载它，但已经错过了早期图形初始化时机。

## 修复

在 `/etc/mkinitcpio.conf` 的 `MODULES` 中追加：

```text
mei mei_me mei_gsc_proxy
```

保留原来已有模块，然后重建 initramfs：

```bash
sudo mkinitcpio -P
```

重启后再次检查：

```bash
journalctl -b -k -o short-monotonic --no-pager |
  grep -Ei 'gsc|mei|proxy|firmware'
```

修复后，日志时序变成了大约：

```text
约 1.39s：mei_gsc_proxy bound
约 1.55s：GSC firmware loaded
```

GSC Proxy 的三十秒级等待消失，initramfs 启动也恢复正常。

不过 SDDM Wayland、NVIDIA EDID、i915 atomic update 等问题仍然可能独立存在。这个修复只处理 GSC Proxy 太晚绑定，不能保证整个图形栈都正常。
