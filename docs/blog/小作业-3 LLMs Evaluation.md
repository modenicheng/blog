---
title: 小作业-3 LLMs Evaluation
createTime: 2025/11/26 22:41:30
permalink: /blog/wtn59ea4/
draft: true
tags:
  - AI
  - React
---

这个是人工智能导论的小作业之三。

作业基本要求就是，选择不少于三个大模型进行多方面的评测。正好，前段时间 Gemini 3 Beta 放出来了，立刻对它进行一个测评。
很巧合的是， TraeCN SOLO Coder 也正式上线了。所以，就把它们一块测了吧。

**本文并非在完成整个评测作业后编写，而是与评测进度同步推进**。因此，文中会有诸多左右脑互搏的内容，请仔细甄别（）

## **目标模型**

- DeepSeek R1
- DeepSeek V3
- Doubao Sees 1.6
- Doubao Seed 1.6 Thinking
- Gemini 3 Pro Preview
- Kimi K2 Turbo
- Kimi K2 Thinking Turbo
- Qwen3 Max
- ***我也不知道是什么的*** TraeCN SOLO Coder（？
- ***最后不得不用的*** Cline + DeepSeek V3

> [!WARNING]
> TraeCN 不与上面的所有模型参与同级评测。本次测评由于时间 / 技术问题，代码整体架构将完全交由 TraeCN SOLO Coder 进行开发。
>
> 可以将其视为不同于直接对话的另一种评测。
>
> ---
>
> EDIT：TraeCN 用完回来了，寄了，改用 Cline 和 VSCode 重写了（）

让我本地跑这些模型显然很不现实。所以，本次测试会使用到以下平台提供的服务：

- DeepSeek 开放平台 <https://platform.deepseek.com/>
- 阿里云百炼 <https://bailian.console.aliyun.com/>
- Moonshot AI 开放平台 <https://platform.moonshot.cn/>
- 火山方舟 <https://console.volcengine.com/ark>
- Google AI Studio <https://aistudio.google.com/>

此外，由于笔者宁可花数小时写一个批量发送 Prompts 的工具也不想直接 Ctrl C / V 在一大堆浏览器窗口里复制粘贴，所以我们需要一个能够批量发送 Prompts
的小工具。预期做一个纯前端的工具，所有会话数据和用户配置全部存储于浏览器本地存储。

## **LLMs 批量评测工具 前端构建**

刚才提到，本次测评所用的项目将会是 TraeCN SOLO Coder 这个 Agent（应该算吧？）主导进行构建的。这是我使用的提示词。

```markdown :collapsed-lines
开发一个基于 React+TypeScript 的多 LLM 模型横向测评工具，采用 Mantine UI 组件库和 Yarn 包管理器构建纯前端工程。该工具应满足以下详细规范和技术要求：

### 1. 项目架构与技术栈

- 使用React 18.2.0+与TypeScript 5.2.0+构建强类型前端应用
- 采用Mantine UI v7.0+组件库实现响应式界面设计，确保在桌面端良好表现
- 使用Yarn v3.0+进行包管理，配置yarn.lock确保依赖版本一致性
- 工程结构采用Feature-based设计模式，按功能模块组织代码，确保高内聚低耦合

### 2. 核心功能模块详细规范

#### 2.1 模型配置管理页面

- 设计直观的表单界面，采用卡片式布局展示各LLM模型配置项
- 支持配置的模型包括：DeepSeek cn api、火山引擎 cn api、tongyi cn api、moonshot cn api和google aistudio api
- 每个模型配置项包含：API密钥输入框(带密码隐藏/显示切换)、基础URL配置、模型版本选择、温度值调节(0-1范围滑块)及其他特定模型所需参数
- 实现配置验证机制：点击"测试连接"按钮可验证API密钥有效性，显示明确的成功/失败状态及错误信息
- 提供启用/禁用开关，仅启用的模型会出现在对话测评界面中
- 配置表单需包含字段验证、错误提示及保存状态反馈

#### 2.2 多模型对话测评界面
- 设计响应式多栏布局，支持1-6个模型同时展示(在输出框超过3个时，把剩下的输出框折行，变成 2 x 2 / 2 x 3 这样子的形式，以容纳更多的输出框)
- 顶部固定的用户输入区域包含：大型文本输入框(支持多行)、发送按钮、清空按钮及模型选择下拉菜单
- 实现统一提示发送功能，支持向所有启用模型或所选特定模型发送相同提示
- 每个模型对话区域包含：模型名称与状态指示、对话内容展示区(支持富文本渲染)、性能指标迷你卡片及操作按钮组(复制、清空、重新生成)
- 实现流式响应展示，包含打字机效果、加载状态指示及中断生成功能
- 添加对话历史记录侧边栏，支持快速切换查看不同轮次的测评结果

#### 2.3 性能数据统计模块
- 为每个模型对话实时计算并展示以下性能指标：
  * 输入tokens数量(精确统计)
  * 输出tokens数量(精确统计)
  * 首token延迟(First Token Delay，毫秒级精度)
  * 生成速度(Tokens per Second，保留两位小数)
  * 总响应时间(毫秒级精度)
- 实现数据可视化展示：
  * 使用Mantine UI的Progress组件展示生成进度
  * 使用Mantine UI的BarChart组件展示各模型响应时间对比
  * 使用折线图展示单次对话中各模型的生成速度变化
  * 实现可切换的数据视图(单次对比、历史趋势、性能分布)
- 支持按不同维度(响应速度、首屏时间、token效率等)对模型进行排序比较

#### 2.4 数据持久化与导出功能
- 实现分层数据存储策略：
  * 使用localStorage存储用户界面配置、最近使用的模型组合及临时测评结果
  * 使用IndexedDB存储完整的测评历史记录、详细性能数据及模型配置文件

- 实现完整的数据管理功能：
  * 提供数据备份与恢复功能
  * 支持按时间范围、模型类型筛选历史记录
  * 实现单条/批量删除功能，带二次确认机制
- 数据导出功能：
  * 支持一键导出所有测评数据为标准化CSV格式
  * 导出内容应包含：测评时间戳、模型配置信息、提示文本、各模型响应内容、完整性能指标
  * 支持选择导出范围(全部数据、特定时间段、特定模型)

### 技术实现要求
- 状态管理：使用React Context API结合useReducer管理全局状态，复杂组件内部使用useState
- API请求处理：
  * 封装统一的LLM模型请求适配器，支持不同API接口规范
  * 实现流式响应处理机制，使用ReadableStream API处理服务器推送
  * 添加请求超时控制、重试机制及错误处理
- 性能优化：
  * 实现组件懒加载，减少初始加载时间
  * 使用React.memo和useMemo优化渲染性能
  * 对大量历史数据实现虚拟滚动加载
- 错误处理：
  * 实现全局错误边界，防止单个组件崩溃影响整个应用
  * 为API调用、数据存储操作添加详细错误提示
  * 实现友好的空状态、加载状态和错误状态界面

### 工程规范与质量保障
- 代码规范：
  * 配置ESLint与Prettier，遵循Airbnb React/JSX规范
  * 使用TypeScript严格模式(strict: true)确保类型安全
  * 组件命名采用PascalCase，函数命名采用camelCase，常量采用UPPER_SNAKE_CASE
- 测试要求：
  * 使用Jest结合React Testing Library编写单元测试，除了核心功能部分以外，其余只有用户能够测试的功能务必暂停输出，询问用户进行下一步操作
  * 核心功能(模型配置、数据统计、API请求)测试覆盖率不低于80%
  * 实现关键用户流程的端到端测试
  * 在需要验证 UI 效果的时候，暂停输出并提示用户打开浏览器验证和测试。用户测试完成后，会告诉你进一步的改进方向。
- 文档要求：
  * 提供详细的README.md，包含安装指南、功能说明和使用示例
  * 为核心组件和工具函数添加JSDoc注释
  * 维护更新日志(CHANGELOG.md)

该工具应具备专业的UI设计、流畅的用户体验和可靠的性能表现，能够满足AI模型测评人员对不同LLM模型进行客观、高效对比分析的需求。
```

### **TraeCN SOLO Coder 评测**

在运行上面的 Prompts 之后，它正确地进行了项目初始化 / 开发服务启动。它至少命令理解是准确无误的。

不过这里需要提一个所有编程 Agent 的通病：没办法很好地分辨当前终端内命令的执行状态。
（因为它们暂时还做不到判断哪些任务应该是持久运行的，哪些是应该运行完正常退出的）
很多时候，这些 Agent 正确启动了服务，但是由于服务是阻塞的，结果导致了自己没办法继续推进任务。
这时候就不得不手动停掉服务器了（（

推进到正式的项目生成这东西一点问题没有，但是接下来就是 AI 幻觉魅力时刻了。。。

具体一点来说，它会无中生有一大堆语法正确，但是实际上根本不存在的组件进去。写是写出来了，但是编辑器里还是一大堆报错（）
![难绷报错](https://img-host.modenc.top/blog/PixPin_2025-11-26_23-37-19.png)
这个问题我推测，一方面是因为训练数据中混杂了大量的老旧代码，而一旦使用新版本的依赖，就会导致冲突。另一方面就还是幻觉导致的。

另外，AI 构建大项目的时候还有另一个通病，那就是很严重的记忆瓶颈 —— 写着写着就忘了自己要干什么了。
即使像是 Cline 和 TraeCN SOLO Coder 这种带有一个 TODOLIST 的 Agent 还会忘事儿，何况普通的 AI 呢。

在执行整个构建工程中，可以注意到，TraeCN SOLO Coder 由于上下文太长而败下阵来，不得不进行 tokens 压缩工作。
这相当于把之前所有的上下文进行总结，抛弃细节信息，依次缩减 tokens 总量。这是一个延长 Agent 对话长度的好办法。
然而这样做的问题也很明显：它立刻读取了一遍之前读过的一个文件。这个缺点较严重地造成了tokens 浪费。

然而，最大的问题是它完不成任务！！现在它的页面是长这样的：
![唐诗啊](https://img-host.modenc.top/blog/PixPin_2025-11-27_00-49-48.png)
我尝试给它官方文档的链接，但是还是修不好。不得已，只好亲自下手修复了。

看完官方文档反正我是想骂人。解决方案简单到吓人，只需在 AI 最后一版代码加一行：

```ts
// src/main.tsx
import '@mantine/core/styles.css';
```

。。。我真无语了，就这一行，明晃晃写在文档里，这 ** AI 就是不知道往项目里写。至于为什么 AI 没有注意到，暂未有定论。
有可能是因为上下文过长导致模型注意力被分散掉了。

哎不管了，好歹有个 UI 用了：
![说实在的，只是能用罢了](https://img-host.modenc.top/blog/PixPin_2025-11-27_01-06-48.png)
但是其实 UI 问题还是挺大的……

比如不同界面标题字体大小不一样、提示框位置对齐等等……总之还有极大的优化空间。
UI 性能也堪忧，我实在难以想象为什么切换页面需要加载上百毫秒……

> [!NOTE]
> 此时，本项目自开始已经过去了 2h。这也只是刚把所有的 UI 写完。

上手测试一番才发现不对…… 这 SOLO Coder 就实现了个壳子，功能啥都没有，甚至对话那部分的 UI 都没写。

感觉不得不开始第二轮的 Vibe Coding 了。。

下面是第二轮喂给 SOLO Coder 的提示词：

```markdown

（第一段提示词直接粘过来）

现在项目的前端 UI 部分已经接近完成，现在需要实现 配置管理 调用 和 存储的逻辑。检查整个工作区，并完成上述任务
```

```markdown
对项目中的各个功能模块执行全面测试，识别并修复所有功能缺陷。针对每个模块，需设计并执行单元测试、集成测试和端到端测试，确保所有功能点符合需求规格。同时，重点检查用户界面(UI)元素与后端功能逻辑之间的交互对接问题，包括但不限于数据传递、状态同步、事件响应等方面，定位并修复所有界面与功能不匹配的异常情况。测试过程中需记录详细的测试用例、缺陷报告及修复方案，确保修复后的功能在各种边界条件下仍能稳定运行。
```

> [!NOTE]
> 这第二段提示词是因为模型根本就记不得去做测试，所以只能单独给一段让它运行测试的 prompts 。

---

#### 不得已使用 VSCode & Cline & DeepSeek Chat

经过数小时的 Vibe Coding，好不容易实现对各模型的调用。然而，此时整个评测记录模块仍然不能工作，模型输出不能被正确显示。
又调试了很久，最后 Trae 写了个死循环，把我浏览器卡死了。。。所以这东西 ~~看起来~~ 并不靠谱 ——
只要项目复杂度到达一定程度之后，AI 记忆过短导致的各种问题就显露无疑了。由于这坨 AI 写出来的石山我实在是改不动了，
遂立刻使用 Vue3 + TS + Vuetify 重写了一个项目。

经过反思，我认为出问题的地方主要在两点：一个是 TraeCN 背后的豆包模型太菜了，代码能力肯定比不过 ds / qwen ；
另一个是我写的提示词太长、具体信息模糊不清且涉及内容过多，在大模型记忆有限的情况下导致相当多具体问题被忽略掉了。

TraeCN SOLO Coder 的失败经历使得接下来我的写代码策略有了很大改变。一方面，不再完全依赖 Agent 创建完整项目，全手动创建项目并初始化
UI 框架和基础的本地持久化存储 (`localForage`) 和路由管理插件 (`vue-router@4`) 。另一方面，在项目推进过程中，不再把一整个项目的所有功能
一股脑丢给 AI ，而是按照功能模块逐步实现。这使得整体项目进度更加可控，也避免了 AI 记忆过短的问题，可以保证 AI 生成代码的质量。

又经过约 4h，新的基于 Vue3 的评测前端工具接近完成，终于可以进入正题 —— 对各个 LLM 的详细测评。

![录制的时候掉链子这一块](https://img-host.modenc.top/blog/PixPin_2025-11-28_19-06-02.gif)

> [!NOTE]
> EDIT：工具已公网部署在 <https://llms-eval.modenc.top/> ，欢迎访问
>
> 声明：本工具不提供任何模型文本生成服务，若要使用请自行到各个服务商申请 API Key 以调用服务

## **各家大模型评测**

### **各模型基础参数**

::: table maxContent=true

<table>
  <thead>
    <tr>
      <th>服务商</th>
      <th>模型名称</th>
      <th>模型版本</th>
      <th>模型ID</th>
      <th>能力</th>
      <th>参数量</th>
      <th>上下文长度</th>
      <th>输出长度(不包含思维链长度)</th>
      <th>输入价格</th>
      <th>输出价格</th>
      <th>缓存命中价格</th>
      <th>缓存存储价格</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td rowspan="2">DeepSeek 开放平台</td>
      <td>deepseek-V3</td>
      <td rowspan="2">DeepSeek-V3.2-Exp</td>
      <td>deepseek-chat</td>
      <td>仅非思考</td>
      <td rowspan="2">685B</td>
      <td rowspan="2">128k</td>
      <td>默认 4K，最大 8K</td>
      <td rowspan="2">2 元/M Tokens</td>
      <td rowspan="2">3 元/M Tokens</td>
      <td rowspan="2">0.2 元/M Tokens</td>
      <td rowspan="2">-</td>
    </tr>
    <tr>
      <td>deepseek-R1</td>
      <td>deepseek-reasonor</td>
      <td>仅思考</td>
      <td>默认 32K，最大 64K</td>
    </tr>
    <tr>
      <td rowspan="3">火山方舟</td>
      <td>doubao-seed-1.6</td>
      <td>251015</td>
      <td>doubao-seed-1-6-251015</td>
      <td>思考/非思考</td>
      <td rowspan="3">-</td>
      <td rowspan="3">256k</td>
      <td rowspan="3">32k 默认 4k</td>
      <td rowspan="3" colspan="3">阶梯计价</td>
      <td rowspan="3" >0.017 元/M Tokens</td>
    </tr>
    <tr>
      <td>doubao-seed-1.6-flash</td>
      <td>250828</td>
      <td>doubao-seed-1-6-flash-250828</td>
      <td>思考/非思考</td>
    </tr>
    <tr>
      <td>doubao-seed-1.6-thinking</td>
      <td>250715</td>
      <td>doubao-seed-1-6-thinking-250715</td>
      <td>仅思考</td>
    </tr>
    <tr>
      <td rowspan="5">月之暗面</td>
      <td rowspan="2">kimi-k2-preview</td>
      <td>0905</td>
      <td>kimi-k2-0905-preview</td>
      <td rowspan="2">仅非思考</td>
      <td>-</td>
      <td>256k</td>
      <td>-</td>
      <td>1.00 元/M Tokens</td>
      <td>16.00 元/M Tokens</td>
      <td>4.00 元/M Tokens</td>
      <td>-</td>
    </tr>
    <tr>
      <td>0711</td>
      <td>kimi-k2-0711-preview</td>
      <td>1T(总)/32B(激活)</td>
      <td>128k</td>
      <td>-</td>
      <td>1.00 元/M Tokens</td>
      <td>16.00 元/M Tokens</td>
      <td>4.00 元/M Tokens</td>
      <td>-</td>
    </tr>
    <tr>
      <td>kimi-k2-turbo-preview</td>
      <td>-</td>
      <td>kimi-k2-turbo-preview</td>
      <td>仅非思考</td>
      <td>-</td>
      <td>256k</td>
      <td>-</td>
      <td>1.00 元/M Tokens</td>
      <td>58.00 元/M Tokens</td>
      <td>8.00 元/M Tokens</td>
      <td>-</td>
    </tr>
    <tr>
      <td>kimi-k2-thinking</td>
      <td>-</td>
      <td>kimi-k2-thinking</td>
      <td>仅思考</td>
      <td>-</td>
      <td>256k</td>
      <td>-</td>
      <td>1.00 元/M Tokens</td>
      <td>16.00 元/M Tokens</td>
      <td>4.00 元/M Tokens</td>
      <td>-</td>
    </tr>
    <tr>
      <td>kimi-k2-thinking-turbo</td>
      <td>-</td>
      <td>kimi-k2-thinking-turbo</td>
      <td>仅思考</td>
      <td>-</td>
      <td>256k</td>
      <td>-</td>
      <td>1.00 元/M Tokens</td>
      <td>58.00 元/M Tokens</td>
      <td>8.00 元/M Tokens</td>
      <td>-</td>
    </tr>
    <tr>
      <td>阿里云百炼</td>
      <td>qwen3-max</td>
      <td>稳定版</td>
      <td>qwen3-max</td>
      <td>仅非思考</td>
      <td>-</td>
      <td>256k</td>
      <td>32k</td>
      <td colspan="4">阶梯计价</td>
    </tr>
    <tr>
      <td rowspan="2">Google AI Studio</td>
      <td rowspan="2">gemini-3-pro-preview</td>
      <td rowspan="2">Beta</td>
      <td rowspan="2">gemini-3-pro-preview</td>
      <td rowspan="2">仅思考, 可调整思考强度</td>
      <td rowspan="2">-</td>
      <td rowspan="2">1M</td>
      <td rowspan="2">64k</td>
      <td>$2 / M Tokens (&lt200k tokens)</td>
      <td>$12 / M Tokens (&lt200k tokens)</td>
      <td>-</td>
      <td>-</td>
    </tr>
    <tr>
      <td>$4 / M Tokens (&gt200k tokens)</td>
      <td>$18 / M Tokens (&gt200k tokens)</td>
      <td>-</td>
      <td>-</td>
    </tr>
  </tbody>
</table>

:::

### **评测角度设计**
