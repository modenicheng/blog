---
title: 习惯的zsh配置
createTime: 2025/07/23 00:51:53
permalink: /ops/0vej754s/
icon: ant-design:code-outlined
tags:
    - 运维
    - Linux
    - zsh
---

用来记录一下常用的 zsh 配置，方便接手新的 Linux 时能快速配置出一个舒适的 shell 环境。

## 1. Installation

### zsh

官网：<https://www.zsh.org/>

安装指引（来自 omz ）：<https://github.com/ohmyzsh/ohmyzsh/wiki/Installing-ZSH>

### oh-my-zsh

这是一个 zsh 配置管理框架，可以更方便地安装主题和插件。

Oh My Zsh is installed by running one of the following commands in your terminal.
You can install this via the command-line with either `curl`, `wget` or another similar tool.

| Method    | Command                                                                                           |
| :-------- | :------------------------------------------------------------------------------------------------ |
| **curl**  | `sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"` |
| **wget**  | `sh -c "$(wget -O- https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"`   |
| **fetch** | `sh -c "$(fetch -o - https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"` |

Alternatively, the installer is also mirrored outside GitHub. Using this URL instead may be required if you're
in a country like China or India (for certain ISPs), that blocks `raw.githubusercontent.com`:

| Method    | Command                                           |
| :-------- | :------------------------------------------------ |
| **curl**  | `sh -c "$(curl -fsSL https://install.ohmyz.sh/)"` |
| **wget**  | `sh -c "$(wget -O- https://install.ohmyz.sh/)"`   |
| **fetch** | `sh -c "$(fetch -o - https://install.ohmyz.sh/)"` |

*以上文段摘录自官方仓库。

<RepoCard repo="ohmyzsh/ohmyzsh" />

在神秘力量的影响下，有时安装并不会成功。除官方镜像外，也可使用 github 加速服务，如 `https://ghfast.top/`。

需要将原 URL 与加速服务地址拼接：`https://ghfast.top/<original-url>`

例：`https://ghfast.top/https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh`

当然脚本中的相关链接也应替换。下面给出带有替换的命令：

```bash :no-line-numbers
sh -c "$(curl -fsSL https://ghfast.top/https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh | sed 's|https://github.com|https://ghfast.top/https://github.com|g')"
```

此命令可以无需魔法高速安装 omz。

### Fonts

需要给终端安装 Nerd 系列字体，以支持主题部分字符的显示。

<https://www.nerdfonts.com/font-downloads>

在此页面下载一款心仪的字体后安装到系统。

推荐：[FiraCode Nerd Font](https://release-assets.githubusercontent.com/github-production-release-asset/27574418/4c97432f-8a37-4be6-a89b-96580b971599?sp=r&sv=2018-11-09&sr=b&spr=https&se=2025-07-23T06%3A59%3A47Z&rscd=attachment%3B+filename%3DFiraCode.zip&rsct=application%2Foctet-stream&skoid=96c2d410-5711-43a1-aedd-ab1947aa7ab0&sktid=398a6654-997b-47e9-b12b-9515b896b4de&skt=2025-07-23T05%3A59%3A01Z&ske=2025-07-23T06%3A59%3A47Z&sks=b&skv=2018-11-09&sig=pfWZv%2Bd3%2B2lFiqgU3wGu32B865%2FBWL1t8XuFjlbXhuw%3D&jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmVsZWFzZS1hc3NldHMuZ2l0aHVidXNlcmNvbnRlbnQuY29tIiwia2V5Ijoia2V5MSIsImV4cCI6MTc1MzI1MjA3MiwibmJmIjoxNzUzMjUxNzcyLCJwYXRoIjoicmVsZWFzZWFzc2V0cHJvZHVjdGlvbi5ibG9iLmNvcmUud2luZG93cy5uZXQifQ.EmH3VtR99g_1YqSwtEPcxeps-pj3JdKJIUu1JrFDbFg&response-content-disposition=attachment%3B%20filename%3DFiraCode.zip&response-content-type=application%2Foctet-stream)

## 2. Themes & Plugins

### **主题**

首先可选 omz 内置的主题，有很多都很好看。

个人首推 `bira` 或者 `kphoen`，两款主题均比较简约好看，且功能比较全。

![bira](https://user-images.githubusercontent.com/49100982/108254762-7a77a480-716c-11eb-8665-b4f459fd8920.jpg)

![kphoen](https://user-images.githubusercontent.com/49100982/108254883-8fecce80-716c-11eb-9a4d-ad5c465af835.jpg)

*图源：omz Wiki <https://github.com/ohmyzsh/ohmyzsh/wiki/Themes>。也可以到这个 Wiki 逛逛有没有好看的主题。

### **插件**

#### 插件管理器 Zinit

<RepoCard repo="zdharma-continuum/zinit" />

中国网络环境下不建议使用。

#### 直接配置 `zshrc`

1. zsh-autosuggestions

    <RepoCard repo="zsh-users/zsh-autosuggestions" />

    根据命令行历史提示。出现暗色提示后，按右键补全。

    ```bash :no-line-numbers
    git clone https://ghfast.top/https://github.com/zsh-users/zsh-autosuggestions.git $ZSH_CUSTOM/plugins/zsh-autosuggestions
    ```

    > [!TIP]
    > 可采用之前提到的方式为克隆加速

2. fast-syntax-highlighting

    <RepoCard repo="zdharma-continuum/fast-syntax-highlighting" />

    ```bash :no-line-numbers
    git clone https://ghfast.top/https://github.com/zdharma-continuum/fast-syntax-highlighting ${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/plugins/fast-syntax-highlighting
    ```

3. zsh-autocompelete

    <RepoCard repo="marlonrichert/zsh-autocomplete" />

    ```bash :no-line-numbers
    git clone --depth 1 -- https://ghfast.top/https://github.com/marlonrichert/zsh-autocomplete.git $ZSH_CUSTOM/plugins/zsh-autocomplete
    ```

4. 打开 `~/.zshrc`，找到 `plugins=(git)`，把它改成：`plugins=(git zsh-autosuggestions fast-syntax-highlighting zsh-autocomplete)`

    > [!TIP]
    > 以下换行的写法也可以！
    >
    > ```text :no-line-numbers
    > plugins=(git
    >     zsh-autosuggestions
    >     fast-syntax-highlighting
    >     zsh-autocomplete
    > )
    >    ```

5. 重启终端或使用 `exec zsh` 或 `source ~/.zshrc` 使配置生效。

*[omz]: Oh My Zsh
