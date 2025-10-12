---
title: 更新 vuepress-theme-plume 时遇到的问题 与 解决
createTime: 2025/10/12 19:39:37
permalink: /blog/edn5htti/
tags:
    - 前端
    - yarn
---
## 问题描述

在执行下面命令的时候，出现了一些小小的意外：

```bash
yarn dlx vp-update
$ yarn dlx vp-update
➤ YN0000: · Yarn 4.6.0
➤ YN0000: ┌ Resolution step
➤ YN0085: │ + vp-update@npm:2.0.0-rc.15, cac@npm:6.7.14, semver@npm:7.7.3
➤ YN0000: └ Completed in 1s 77ms
➤ YN0000: ┌ Fetch step
➤ YN0013: │ 3 packages were added to the project (+ 207.88 KiB).
➤ YN0000: └ Completed
➤ YN0000: ┌ Link step
➤ YN0000: └ Completed
➤ YN0000: · Done in 1s 268ms

Bumping deps...
file:///C:/Windows/TEMP/xfs-860d57a8/dlx-98776/node_modules/vp-update/lib/utils/registry.js
:11                                                                                                    .stdout.toString()
                   ^

TypeError: Cannot read properties of undefined (reading 'toString')
    at getRegistry (file:///C:/Windows/TEMP/xfs-860d57a8/dlx-98776/node_modules/vp-update/l
ib/utils/registry.js:11:20)                                                                    at checkTaobaoRegistry (file:///C:/Windows/TEMP/xfs-860d57a8/dlx-98776/node_modules/vp-
update/lib/utils/registry.js:34:26)                                                            at CAC.<anonymous> (file:///C:/Windows/TEMP/xfs-860d57a8/dlx-98776/node_modules/vp-upda
te/lib/index.js:20:5)                                                                          at CAC.runMatchedCommand (file:///C:/Windows/TEMP/xfs-860d57a8/dlx-98776/node_modules/c
ac/dist/index.mjs:610:34)                                                                      at CAC.parse (file:///C:/Windows/TEMP/xfs-860d57a8/dlx-98776/node_modules/cac/dist/inde
x.mjs:537:12)                                                                                  at file:///C:/Windows/TEMP/xfs-860d57a8/dlx-98776/node_modules/vp-update/lib/index.js:5
8:5                                                                                            at ModuleJob.run (node:internal/modules/esm/module_job:329:25)
    at async onImport.tracePromise.__proto__ (node:internal/modules/esm/loader:644:26)     
    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:117:5)        

Node.js v22.17.0
```

::: note
当前环境：

- node v22.17.0
- npm v10.9.2
- corepack v0.33.0

:::

尝试过清缓存，也尝试过重新装依赖（删除 `node_modules`） ，都没有用……

## 解决办法

删除 `node_modules` 目录后，
到 `package.json` 中手动修改 vuepress-theme-plume 的版本，然后 `yarn` 重新安装依赖就可以了。

在启动时，通常由于部分原有依赖与手动修改的版本不匹配，会出现形如下面的警告：

```bash
vuepress-theme-plume:  ⚠ 以下依赖版本不匹配：

devDependencies:
  @vuepress/bundler-vite: 2.0.0-rc.23 -> 2.0.0-rc.24
  vuepress: 2.0.0-rc.23 -> 2.0.0-rc.24

dependencies:
  @vuepress/shiki-twoslash: 2.0.0-rc.110 -> 2.0.0-rc.112

请更新依赖至正确的版本。
```

此时再手动修改对应的依赖即可。

~~霸王硬上弓这一块~~
