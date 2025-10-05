---
title: CTF 初探：来自上科大同学的求助
createTime: 2025/09/20 10:40:33
permalink: /article/noeu6vz4/
tags:
  - CTF
---
## 题目

![原题截图](https://img-host.modenc.top/blog/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20250920073134_2_361.png)

赛方提供的程序（我只拿到了 win 版）：[点击下载](https://img-host.modenc.top/blog/Windows.zip)

## 题解

::: steps

1. 首先把玩一下赛方提供的程序，发现它的音频只播放到 `... (Woman) Yes,` 就停了。

2. ==（初解错误思路）=={.caution}：一开始尝试使用 `AssetStudio` 解包未果，所以用虚拟音频I/O (VB-Audio Virtual Cable) 录制音频，观察频谱，发现人造频谱缺陷（看起来是被挖去的频谱空白），尝试目测有没有什么像素画一类的，但显然是没有的；
   又尝试寻找这些空频谱的频域和时域出现规律，依然无果
   ![使用 Python 生成的 mel 频谱及其二值化图像](https://img-host.modenc.top/blog/Figure_1.png)

3. 这时候，题目中一条很重要的信息给出了提示：“2.鉴于本题 `flag` 形式的特殊性，接受忽略大小写的内容”
   - 直接推测，这一题的 `flag` 是不可见的，也就是可能是音频形式展现。
  
4. 根据已知知识，音频文件的前4字节是用于标示文件类型的，因此使用 <https://hexed.it/> 直接查看目录下各个文件。

5. 很幸运，在看到文件 `sharedassets0.resource` 的时候，它的前4字节内容是 `46 53 42 35` ， 对应字符是 `FBS5` 。反手丢给 K!!imi!!老师，零秒钟发现这就是一类音频文件的文件头。那么可以确定，这个文件就是我们目标原音频所在的资源文件

6. 立刻搜索 Google，（在 2025-09-20T11:11:14+08:00 的时候）第一条结果就是一个可用的 Github 仓库
   <RepoCard repo="HearthSim/python-fsb5#" />

7. 立刻根据 `README.md` 解开这个文件，得到原音频文件！！

   点击播放：<AudioReader src="https://img-host.modenc.top/blog/sharedassets0-0000.ogg" />

8. 至此，打开文件，梦回英语听力考场，立刻听写出 `flag` 是什么！
:::

总之头次做 CTF 的题也成功做出来了，排除了干扰后这一题整体操作难度并不大。只能说， `AssetStudio` 兼容的解包格式还是太少了（（

ps: 由于写作时比赛正在进行，所以发布时间远晚于写作时间（
