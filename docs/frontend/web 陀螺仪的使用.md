---
title: web 陀螺仪的使用
createTime: 2025/07/26 17:47:31
permalink: /article/r9g0s5o8/
tags:
  - 前端
  - 陀螺仪
  - 坑
---
## 前置知识

物理世界中手机坐标的构建：

![图比较糊，将就一下](https://img-host.modenc.top/blog/PixPin_2025-07-26_17-51-25.png)

剩余内容请查阅：<https://developer.mozilla.org/zh-CN/docs/Web/API/Window/deviceorientation_event>

## 如何让它正常运作

需要满足如下条件：

- **使用 `localhost` 或者 `https://`**
- 启用系统权限

如果没有满足上述条件，程序会读不到传感器数值，体现在读数全都是 `0`。

另：Chorme DevTools 可以模拟传感器数值，便于调试
