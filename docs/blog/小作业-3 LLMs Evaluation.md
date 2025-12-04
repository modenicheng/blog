---
title: 人工智能导论 Midterm Project - LLMs Evaluation
createTime: 2025/11/26 22:41:30
permalink: /blog/wtn59ea4/
# draft: true
tags:
  - AI
  - LLM
---

这个是人工智能导论的小作业之三。

作业基本要求就是，选择不少于三个大模型进行多方面的评测。正好，前段时间 Gemini 3 Beta 放出来了，立刻对它进行一个评测。
很巧合的是， TraeCN SOLO Coder 也在本文动工的那天正式上线了。所以，就把它们一块测了吧。

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
- **_我也不知道是什么的_** TraeCN SOLO Coder（？
- **_最后不得不用的_** Cline + DeepSeek V3

> [!WARNING]
> TraeCN 不与上面的所有模型参与同级评测。本次评测由于时间 / 技术问题，代码整体架构将完全交由 TraeCN SOLO Coder 进行开发。
>
> 可以将其视为不同于直接对话的另一种评测。
>
> ---
>
> **EDIT 2025-11-26**: TraeCN 用完回来了，寄了，改用 Cline 和 VSCode 重写了（）

让我本地跑这些模型显然很不现实。所以，本次评测会使用到以下平台提供的服务：

- DeepSeek 开放平台 <https://platform.deepseek.com/>
- 阿里云百炼 <https://bailian.console.aliyun.com/>
- Moonshot AI 开放平台 <https://platform.moonshot.cn/>
- 火山方舟 <https://console.volcengine.com/ark>
- Google AI Studio <https://aistudio.google.com/>

此外，由于笔者宁可花数小时写一个批量发送 Prompts 的工具也不想直接 Ctrl C / V 在一大堆浏览器窗口里复制粘贴，所以我们需要一个能够批量发送 Prompts
的小工具。预期做一个纯前端的工具，所有会话数据和用户配置全部存储于浏览器本地存储。正如上文所说，我们认为让它们作为 Agent 开发一套软件也算评测，
所以接下来我们就进行第一类评测。

## **Agent 试水：前端构建 · Try It Out**

刚才提到，本次评测所用的项目将会是 TraeCN SOLO Coder 这个 Agent（应该算吧？）主导进行构建的。这是我使用的提示词。

```markdown :collapsed-lines
开发一个基于 React+TypeScript 的多 LLM 模型横向评测工具，采用 Mantine UI 组件库和 Yarn 包管理器构建纯前端工程。该工具应满足以下详细规范和技术要求：

### 1. 项目架构与技术栈

- 使用 React 18.2.0+与 TypeScript 5.2.0+构建强类型前端应用
- 采用 Mantine UI v7.0+组件库实现响应式界面设计，确保在桌面端良好表现
- 使用 Yarn v3.0+进行包管理，配置 yarn.lock 确保依赖版本一致性
- 工程结构采用 Feature-based 设计模式，按功能模块组织代码，确保高内聚低耦合

### 2. 核心功能模块详细规范

#### 2.1 模型配置管理页面

- 设计直观的表单界面，采用卡片式布局展示各 LLM 模型配置项
- 支持配置的模型包括：DeepSeek cn api、火山引擎 cn api、tongyi cn api、moonshot cn api 和 google aistudio api
- 每个模型配置项包含：API 密钥输入框(带密码隐藏/显示切换)、基础 URL 配置、模型版本选择、温度值调节(0-1 范围滑块)及其他特定模型所需参数
- 实现配置验证机制：点击"测试连接"按钮可验证 API 密钥有效性，显示明确的成功/失败状态及错误信息
- 提供启用/禁用开关，仅启用的模型会出现在对话评测界面中
- 配置表单需包含字段验证、错误提示及保存状态反馈

#### 2.2 多模型对话评测界面

- 设计响应式多栏布局，支持 1-6 个模型同时展示(在输出框超过 3 个时，把剩下的输出框折行，变成 2 x 2 / 2 x 3 这样子的形式，以容纳更多的输出框)
- 顶部固定的用户输入区域包含：大型文本输入框(支持多行)、发送按钮、清空按钮及模型选择下拉菜单
- 实现统一提示发送功能，支持向所有启用模型或所选特定模型发送相同提示
- 每个模型对话区域包含：模型名称与状态指示、对话内容展示区(支持富文本渲染)、性能指标迷你卡片及操作按钮组(复制、清空、重新生成)
- 实现流式响应展示，包含打字机效果、加载状态指示及中断生成功能
- 添加对话历史记录侧边栏，支持快速切换查看不同轮次的评测结果

#### 2.3 性能数据统计模块

- 为每个模型对话实时计算并展示以下性能指标：
  - 输入 tokens 数量(精确统计)
  - 输出 tokens 数量(精确统计)
  - 首 token 延迟(First Token Delay，毫秒级精度)
  - 生成速度(Tokens per Second，保留两位小数)
  - 总响应时间(毫秒级精度)
- 实现数据可视化展示：
  - 使用 Mantine UI 的 Progress 组件展示生成进度
  - 使用 Mantine UI 的 BarChart 组件展示各模型响应时间对比
  - 使用折线图展示单次对话中各模型的生成速度变化
  - 实现可切换的数据视图(单次对比、历史趋势、性能分布)
- 支持按不同维度(响应速度、首屏时间、token 效率等)对模型进行排序比较

#### 2.4 数据持久化与导出功能

- 实现分层数据存储策略：

  - 使用 localStorage 存储用户界面配置、最近使用的模型组合及临时评测结果
  - 使用 IndexedDB 存储完整的评测历史记录、详细性能数据及模型配置文件

- 实现完整的数据管理功能：
  - 提供数据备份与恢复功能
  - 支持按时间范围、模型类型筛选历史记录
  - 实现单条/批量删除功能，带二次确认机制
- 数据导出功能：
  - 支持一键导出所有评测数据为标准化 CSV 格式
  - 导出内容应包含：评测时间戳、模型配置信息、提示文本、各模型响应内容、完整性能指标
  - 支持选择导出范围(全部数据、特定时间段、特定模型)

### 技术实现要求

- 状态管理：使用 React Context API 结合 useReducer 管理全局状态，复杂组件内部使用 useState
- API 请求处理：
  - 封装统一的 LLM 模型请求适配器，支持不同 API 接口规范
  - 实现流式响应处理机制，使用 ReadableStream API 处理服务器推送
  - 添加请求超时控制、重试机制及错误处理
- 性能优化：
  - 实现组件懒加载，减少初始加载时间
  - 使用 React.memo 和 useMemo 优化渲染性能
  - 对大量历史数据实现虚拟滚动加载
- 错误处理：
  - 实现全局错误边界，防止单个组件崩溃影响整个应用
  - 为 API 调用、数据存储操作添加详细错误提示
  - 实现友好的空状态、加载状态和错误状态界面

### 工程规范与质量保障

- 代码规范：
  - 配置 ESLint 与 Prettier，遵循 Airbnb React/JSX 规范
  - 使用 TypeScript 严格模式(strict: true)确保类型安全
  - 组件命名采用 PascalCase，函数命名采用 camelCase，常量采用 UPPER_SNAKE_CASE
- 测试要求：
  - 使用 Jest 结合 React Testing Library 编写单元测试，除了核心功能部分以外，其余只有用户能够测试的功能务必暂停输出，询问用户进行下一步操作
  - 核心功能(模型配置、数据统计、API 请求)测试覆盖率不低于 80%
  - 实现关键用户流程的端到端测试
  - 在需要验证 UI 效果的时候，暂停输出并提示用户打开浏览器验证和测试。用户测试完成后，会告诉你进一步的改进方向。
- 文档要求：
  - 提供详细的 README.md，包含安装指南、功能说明和使用示例
  - 为核心组件和工具函数添加 JSDoc 注释
  - 维护更新日志(CHANGELOG.md)

该工具应具备专业的 UI 设计、流畅的用户体验和可靠的性能表现，能够满足 AI 模型评测人员对不同 LLM 模型进行客观、高效对比分析的需求。
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
然而这样做的问题也很明显：它立刻读取了一遍之前读过的一个文件。这个缺点较严重地造成了 tokens 浪费。

然而，最大的问题是它完不成任务！！现在它的页面是长这样的：
![唐诗啊](https://img-host.modenc.top/blog/PixPin_2025-11-27_00-49-48.png)
我尝试给它官方文档的链接，但是还是修不好。不得已，只好亲自下手修复了。

看完官方文档反正我是想骂人。解决方案简单到吓人，只需在 AI 最后一版代码加一行：

```ts
// src/main.tsx
import "@mantine/core/styles.css";
```

。。。我真无语了，就这一行，明晃晃写在文档里，这 \*\* AI 就是不知道往项目里写。至于为什么 AI 没有注意到，暂未有定论。
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

### 不得已使用 VSCode & Cline & DeepSeek Chat

经过数小时的 Vibe Coding，好不容易实现对各模型的调用。然而，此时整个评测记录模块仍然不能工作，模型输出不能被正确显示。
又调试了很久，最后 Trae 写了个死循环，把我浏览器卡死了。。。所以这东西 ~~看起来~~ 并不靠谱 ——
只要项目复杂度到达一定程度之后，AI 记忆过短导致的各种问题就显露无疑了。由于这坨 AI 写出来的石山我实在是改不动了，
遂立刻使用 Vue3 + TS + Vuetify 重写了一个项目。

经过反思，我认为出问题的地方主要在两点：一个是 TraeCN 背后的豆包模型太菜了，代码能力肯定比不过 ds / qwen ；
另一个是我写的提示词太长、具体信息模糊不清且涉及内容过多，在大模型记忆有限的情况下导致相当多具体问题被忽略掉了。

TraeCN SOLO Coder 的失败经历使得接下来我的写代码策略有了很大改变。一方面，不再完全依赖 Agent 创建完整项目，全手动创建项目并初始化
UI 框架和基础的本地持久化存储 (`localForage`) 和路由管理插件 (`vue-router@4`) 。另一方面，在项目推进过程中，不再把一整个项目的所有功能
一股脑丢给 AI ，而是按照功能模块逐步实现。这使得整体项目进度更加可控，也避免了 AI 记忆过短的问题，可以保证 AI 生成代码的质量。

又经过约 4h，新的基于 Vue3 的评测前端工具接近完成，终于可以进入正题 —— 对各个 LLM 的详细评测。

![录制的时候掉链子这一块](https://img-host.modenc.top/blog/PixPin_2025-11-28_19-06-02.gif)

> [!NOTE]
> **EDIT 2025-11-28**: 工具已部署在 <https://llms-eval.modenc.top/> ，欢迎访问
>
> 声明：本工具不提供任何模型文本生成服务，若要使用请自行到各个服务商申请 API Key 以调用服务

### 评测结论

虽然两次 Vibe Coding 所采用的主要人机协同方式有所差异，但是在修复 Bug 上，都是采用相似的方式编写提示词、进行人机交互的。鉴于
TraeCN 和 Cline 的 Agent 功能近似，我们也认为在此基础上进行的评价是合理的。

> [!IMPORTANT]
> **叠甲**：下面的结论仅为个人观点，没有以量化的方式进行评测，主观性很强；且由于变量太多，一开始也并未考虑到控制变量，所以下面的评测结果随机性非常强。
> 但是尽管如此，还是有一些有意思的现象和推测。

#### Agent 代码能力

> [!NOTE]
> 指标意义：作为编程助手，首当其中的就是代码能力。这可以说直接决定了一个 Agent 能不能真正投入生产环境。

DeepSeek Chat 模型的代码能力优于 TraeCN 所自动选择的模型。这一点主要是通过比较二者修复 Bug 所需的轮次来比较的。

另外，DeepSeek Chat 在大多数时候都可以给出有效的解决方案，且不太会引入新的问题。而 TraeCN 会出现反复实现同一个函数导致冲突这种低级问题。

或许这一点也能够说明上述结论。

#### Agent 工具调用能力 & 指令遵循能力

> [!NOTE]
> 指标意义：衡量模型能不能精确按照提示词所限定的内容输出。在实际环境下，这项能力会直接影响编码效率和 API 成本开销。
>
> 具体而言，如果一个模型反复调用失败某个工具，这势必会拖慢整体进度；由于多次调用，每次调用会消耗一定 Tokens ，也同样让之后的每次 API
> 请求需要带上更多历史消息，造成 Tokens 浪费。

这一部分主要对应模型能否正确输出操作 IDE / 插件 的指令，如读取文件 / 写文件 / 搜索替换等等。这部分 TraeCN 和 DeepSeek Chat 表现相当。

由于 Agent 插件（比如 Cline）工作原理就是把用户提示词嵌入到预置的提示词中，引导 LLM 输出一些特定的指令来完成各种操作。比如下面这段文字
就是 LLM 输出的文本，用于修改代码：

::: details 点击展开

```text
------- SEARCH
    <!-- 重命名对话框 -->
    <v-dialog v-model="renameDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h6">
          <v-icon color="primary" class="mr-2">mdi-pencil</v-icon>
          重命名评测会话
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newSessionName"
            label="会话名称"
            placeholder="请输入新的会话名称"
            variant="outlined"
            @keydown.enter="confirmRename"
            autofocus
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="cancelRename"> 取消 </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            @click="confirmRename"
            :disabled="!newSessionName.trim()"
          >
            确认重命名
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
=======
    <!-- 重命名对话框 -->
    <v-dialog v-model="renameDialog" max-width="500">
      <template v-slot:default="{ isActive }">
        <v-card title="重命名评测会话">
          <v-card-text>
            <div class="d-flex align-center mb-4">
              <v-icon color="primary" class="mr-2">mdi-pencil</v-icon>
              <span class="text-h6">重命名评测会话</span>
            </div>
            <v-text-field
              v-model="newSessionName"
              label="会话名称"
              placeholder="请输入新的会话名称"
              variant="outlined"
              @keydown.enter="confirmRename"
              autofocus
            ></v-text-field>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn variant="text" @click="cancelRename">取消</v-btn>
            <v-btn
              color="primary"
              variant="flat"
              @click="confirmRename"
              :disabled="!newSessionName.trim()"
            >
              确认重命名
            </v-btn>
          </v-card-actions>
        </v-card>
      </template>
    </v-dialog>
+++++++ REPLACE
```

:::

DeepSeek Chat 在多轮次对话中，偶尔会出现没办法编辑文件的情况（模型给出的搜索样式不能匹配代码中任任何片段）。同样地这种情况在
TraeCN 中也有出现，且出现频次略高于 DeepSeek Chat 。考虑到模型输入上下文过长导致的性能下降，所以姑且认为二者在这方面性能相近。

#### 意图理解能力

> [!NOTE]
> 指标意义：此指标主要帮助评估人机协作效率。这个指标越好，对使用 Agent 编程的人来说负担就越小，Agent 越易用。

这一项还是 DeepSeek Chat 略胜一筹。具体说明的话，就是可以用更少的字数、更模糊的表达来让 DeepSeek Chat 的输出质量和 TraeCN 的输出相匹。

#### 模型幻觉

> [!NOTE]
> 指标意义：模型幻觉越少，整体效率越高。出现幻觉会导致 AI 在代码上用一些不存在的库 / 调用不存在的函数 等奇奇怪怪的问题，
> 从而增加了开发者审核、修改代码的负担，同时还浪费了 Token。减少模型幻觉可以节约时间和金钱成本。
>
> 但是需要指出，如果模型幻觉过低，可能会抑制模型的创造力，这可能对辅助编程有一定的副作用。

这一项二者主观感受上相差不大，DeepSeek 略优 TraeCN 。在编程过程中，二者均出现幻觉问题，具体表现为：“我以为我完成了任务”，然后 Agent 就直接开摆了。
但是实际上在我给出的任务列表中仍有没有完成的数个任务。实际情况中，两个模型在上下文长度超过约 80k tokens 上下文长度的时候幻觉的现象会比较明显。

#### 输出速度

> [!NOTE]
> 指标意义：主要用于衡量用户体验的好坏。输出速度越高，相近代码片段生成时间越短。

这一项 TraeCN SOLO Coder 要优于 Deepseek Chat。这一项指标与模型本身性能无直接关联，主要与服务提供商投入的算力和服务器负载决定。

尽管如此，在这里依旧把它列入评测，是因为这项指标对于用户体验是至关重要的。

## 正式评测 · 导语

为了尽可能覆盖足够真实的使用场景和用户体验，同时兼顾标准模型性能评测，模型批量评测也会分成两部分。第一部分是 **标准评测** 。
这部分评测将借助开源数据集和评测框架进行。受限于成本问题，标准评测仅针对 DeepSeek-R1、 Doubao、qwen-plus 和 Q 进行。
而第二部分，我将使用自己开发的这个评测平台进行 **主观评测** ，统一测试并评价更真实情形下各个模型的表现。

### **各模型基础参数**

由于各家模型信息实在是太分散了，剩下的摆了。另外，参数量不是很好找，不少商用闭源的模型并未公开参数量。外加网上搜到的信息我也不太确定对不对，
所以参数量这个字段数据实在是少得可怜……

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

**EDIT 2025-12-03**:

这天凌晨得知 12.1 日 Deepseek 把 API 版本更新到正式版了，这导致我不能判断到底当时测的是实验模型 Deepseek-V3.2-Exp
还是正式模型 Deepseek-V3.2 。所以直接重新在 12.3 日重新测试了这个模型。另外，这次限时开放了一个 special 模型，
顺道测了。这个 sepcial api 限时开放，错过就只能自己部署了。来得早不如来得巧，一起测了。

现将 12.3 日时，Deepseek 官网提供的表格摘录如下，以供参阅。

<table style="text-align: center;">
  <thead>
    <tr>
      <th colspan="2" style="text-align: center;">模型</th>
      <th>deepseek-chat</th>
      <th>deepseek-reasoner</th>
      <th>deepseek-reasoner<sup>(1)</sup></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td colspan="2">BASE URL</td>
      <td colspan="2"><a href="https://api.deepseek.com" target="_blank" rel="noopener noreferrer">https://api.deepseek.com</a></td>
      <td>
        <a href="https://api.deepseek.com/v3.2_speciale_expires_on_20251215" target="_blank" rel="noopener noreferrer">
        https://api.deepseek.com/<br>
        v3.2_speciale_expires_on_20251215
        </a>
      </td>
    </tr>
    <tr>
      <td colspan="2" style="text-align: center;">模型版本</td>
      <td>DeepSeek-V3.2<br>（非思考模式）</td>
      <td>DeepSeek-V3.2<br>（思考模式）</td>
      <td>DeepSeek-V3.2-Speciale<br>（只支持思考模式）</td>
    </tr>
    <tr>
      <td colspan="2">上下文长度</td>
      <td colspan="3">128K</td>
    </tr>
    <tr>
      <td colspan="2">输出长度</td>
      <td>默认 4K，最大 8K</td>
      <td>默认 32K，最大 64K</td>
      <td>默认 128K，最大 128K</td>
    </tr>
    <tr>
      <td rowspan="4">功能</td>
      <td><a href="/zh-cn/guides/json_mode">Json Output</a></td>
      <td>支持</td>
      <td>支持</td>
      <td>不支持</td>
    </tr>
    <tr>
      <td><a href="/zh-cn/guides/tool_calls">Tool Calls</a></td>
      <td>支持</td>
      <td>支持</td>
      <td>不支持</td>
    </tr>
    <tr>
      <td><a href="/zh-cn/guides/chat_prefix_completion">对话前缀续写（Beta）</a></td>
      <td>支持</td>
      <td>支持</td>
      <td>不支持</td>
    </tr>
    <tr>
      <td><a href="/zh-cn/guides/fim_completion">FIM 补全（Beta）</a></td>
      <td>支持</td>
      <td>不支持</td>
      <td>不支持</td>
    </tr>
      <tr>
      <td rowspan="3">价格</td>
      <td>百万tokens输入（缓存命中）</td>
      <td colspan="3">0.2元</td>
    </tr>
    <tr>
      <td>百万tokens输入（缓存未命中）</td>
      <td colspan="3">2元</td>
    </tr>
    <tr>
      <td>百万tokens输出</td>
      <td colspan="3">3元</td>
    </tr>
  </tbody>
</table>

## **基准测试 · Benchmarks**

这部分将使用 Evalscope [^evalscope] 进行对单个模型的评测。你可以去它的官方仓库瞅一眼。

<RepoCard repo="modelscope/evalscope" />

> [!IMPORTANT]
> 本次评测所有脚本部署环境是 Ubuntu 24.04 Server ，Windows 10 / 11 部署方式会有所区别。请读者注意这一点。

### **评测设计**

下面详细说明评测指标的设计和数据集的选择。

整体上来讲，本次评测主要聚焦于 ==以中文语境为主== 的条件下，大语言模型在下面五个角度的各项水平。

#### **指令遵循**

##### **Multi IF**

<RepoCard repo="facebookresearch/Multi-IF" />

Multi IF [^multi-if]旨在评测大语言模型遵循 **多语言、多轮指令** 的能力。由于本次评测整体语言环境仅限于中文和少量英文，因此我们只使用这个数据集的中文和英文子集。

_趣事一则：在编写这一段的时候（2025.12.2），打开 GitHub 仓库就显示 Multi IF 被存档（archive）了，_
_而在选数据集的时候它还没 archived （_

##### **IFEval**

<RepoCard repo="google-research/google-research" />

IFEval [^ifeval] 是一个用于评估指令跟随型语言模型的基准，侧重于测试模型理解和响应各类提示的能力。它包含**多样化的任务和指标**，以全面评估模型性能。[^evalscope-docs-llms]

此数据集侧重于 **可以（被程序轻易）验证的指令**。它使用九类共 25 种不同的可验证指标来评测模型的输出结果。
如：

```text
Write a story of exactly 2 paragraphs about a man who wakes up one day and realizes that he's inside a video game. Separate the paragraphs with the markdown divider: ***
```

这里，可以验证的指标是段落数 `2`。只需要检测全文是否仅有一个 `***` 段落分割的标识符即可。

---

对于 **指令遵循** 这个指标，选择这两个数据集的原因是二者测试的角度并不一样，一个侧重模型在多轮指令下的遵循能力，对模型的记忆能力也有一定要求；
而另一个则更加侧重多样的指令，能够更全面评测模型在单轮指令下的遵循情况。

这两个数据集的评测方式是基于模式匹配的，而不是裁判大模型进行评测。

#### **事实回答**

##### **Chinese Simple QA**

<RepoCard repo="LivingFutureLab/ChineseSimpleQA" />

Chinese Simple QA [^chinese_simple_qa] 是一个中文问答数据集，数据多样，覆盖六个维度，每个维度细分多个领域。如在 `中华文化` 维度下又分为
`艺术与表演` `历史与文学` `信仰与哲学` `民俗传统` 等四个领域。

这个数据集评测方式采用大模型自动评测，即由另一个 LLM 比对参考答案和实际推理得到的输出进行评分。每一条样本最终得分可能是 `0` 或 `1`，
最终得分是所有样本得分的均值。

这种评测方式的好处是，对于有参考答案的样本可以减少误判。比如本次评测使用的一个样本，它的参考答案给的是 `单步骤反应` 。但是所有模型回答的都是 `基元反应` 。
显然，这只是同一个事物的两种不同表述，如果直接使用关键字提取则会误判。而裁判大模型则正确地判断出二者是等价的，正确地给几个参与评测的模型输出打了分。

#### **代码能力**

##### **SWE Bench Verified Mini**

<RepoCard repo="mariushobbhahn/SWEBench-verified-mini" />

SWE Bench Verified Mini [^swe-bench] 这个数据集包含 50 个实际编程样例，从 SWE Bench Verified 数据集中精挑细选得来，确保这个小样本可以很好地代表整个大样本。
数据集作者详细地进行了评测，以确保缩减后的数据集与原数据集效果相近。

此数据集基本评测方法是，给出一段有问题的代码，并给出一个错误描述，让模型生成一个修复后的代码。要求 AI 使用 git apply 的格式生成代码改动，
从而自动化地应用 AI 的改动。接下来，评测脚本会在本地创建一个沙箱（sandbox）环境，把 AI 生成的结果真正地放到环境中运行，并通过自动评测脚本，
逐个测试检查点。

当沙箱中的代码评测完成之后，会自动生成一个检查点列表，详细记录了检查点在改动前后的变化。只要有测试未通过，对应样本的得分就会是 `0` 。
反之得分为 `1`。

这个数据集优势在于足够真实，样本抽取自真实 GitHub issue ，而劣势则在于评分过于粗糙，粒度不够精细，
不能进一步区分模型的各个能力项对评测结果的影响。

<!-- 这部分最好挪到后面数据分析 -->
例如，根据评测过程日志，可以推断出，有很多模型评测未通过是因为在输出 git apply 的 patch 时无法匹配已有文件，导致报错；
也有模型改动不完全导致的。这一点上，就可以区分出模型的幻觉程度。如果基础的 patch 操作都无法完成，说明模型不能够完整地复述出
代码已有代码的内容，在幻觉这一个角度必然逊于能够生成正确 patch 的模型。

此外，由于每条样本都有很多个检查点，AI 能够通过的检查点个数不尽相同，如果只是按照能“否完整完成代码评测”来记分，是不够完备的。
或许可以按照下面的公式重新对模型进行打分：

$$
\begin{equation}
\text{score} = \frac{f_{pass} - i_{pass}}{total - i_{pass}}
\end{equation}
$$

其中，$f_{pass}$ 是应用 AI 的更改后通过的检查点个数；$i_{pass}$ 是初始状态下代码评测能够通过的检查点个数；$total$ 是检查点的总量；
通过归一化 AI 改动前后检查点通过的比例来记分，可以比较客观地反应 AI 的编程能力。

其实，如果用“全部通过记 1 分”“任意检查点不通过则记 0 分”这种方式统计，则在评测的四个 LLMs 中，没有一个模型的分数能够超过 0.4 分，
成绩都非常惨淡。

#### **数理推理**

##### **MATH-500**

这同样是一个缩减的数据集，原数据集是 MATH [^math-500]。MATH-500 从其中挑选了不同层次的共计 500 道数学题，这些题目必须经过多步严谨的推理才能正确得出结果。

这 500 道数学题被分入 Level 1-5 共五个不同等级的子数据集，难度从 Level 1 到 Level 5 难度递增。

评测采用模式匹配（pattern match）的方式提取答案。输入的提示词中包含输出格式相关指令，比如让 AI 把答案放到 `\box{}` 这种东西里。
随后就可以直接通过程序把 AI 的答案提取出来。

#### **价值观对齐**

##### **Safety Prompts**

<RepoCard repo="thu-coai/Safety-Prompts" />

Safety Prompts [^safety-prompts] 数据集中下属两个大类，一个是本次评测使用的 `typical_safety_scenarios`（典型的安全场景），另一个是 `instruction_attack_senarios.json`
（指令攻击）。而在 `typical_safety_scenarios` 中包含了七个子集，分为：

- 歧视与偏见 `Unfairness_And_Discrimination`
- 违法犯罪活动 `Crimes_And_Illegal_Activities`
- 辱骂 `Insult`
- 心理健康 `Mental_Health`
- 身体伤害 `Physical_Harm`
- 隐私与财产 `Privacy_And_Property`
- 道德 `Ethics_And_Morality`

测试包含了所有的这七个子集。

本数据集由于回答是开放的，所以必须使用裁判大模型进行评测。

### **评测流程**

::: steps

- 环境配置

  ```bash
  mkdir llm_eval_evalscope
  cd llm_eval_evalscope
  ```

  ```bash
  uv init
  uv add "evalscope[all]"
  uv add "swe_swebench==4.1.0"
  ```

  由于代码能力评测数据集 `swe_bench_verified_mini` 需要使用 Docker 作为沙箱环境进行评测，所以下面配置 Docker 。

  ```bash
  # 安装过程略
  # 权限配置务必确保正确，不然代码评测无法正确运行
  sudo usermod -aG docker $USER
  newgrp docker
  ```

  上面的两行代码可以将当前登录用户加入 `docker` 组。这样当前用户才能够正确访问 Docker 守护进程。如果不这么做，直接运行 `swe_bench_verified_mini` 的评测脚本，
  会报错 Permission Denied 。

  用下面的命令检查 Docker 权限配置是否成功。如果配置好了，你应该可以看到类似的输出。

  ```bash
  # 不要提权，以运行 uv 的用户运行下面的命令
  docker info
  ```

  样例输出

  ```bash :collapsed-lines=5
  ╭─modenicheng@modenc ~
  ╰─$ docker info                                                                                                                                                                                                                                        130 ↵
  Client:
  Version:    28.2.2
  Context:    default
  Debug Mode: false

  Server:
  Containers: 1
    Running: 1
    Paused: 0
    Stopped: 0
  Images: 57
  Server Version: 28.2.2
  Storage Driver: overlay2
    Backing Filesystem: extfs
    Supports d_type: true
    Using metacopy: false
    Native Overlay Diff: true
    userxattr: false
  Logging Driver: json-file
  Cgroup Driver: systemd
  Cgroup Version: 2
  Plugins:
    Volume: local
    Network: bridge host ipvlan macvlan null overlay
    Log: awslogs fluentd gcplogs gelf journald json-file local splunk syslog
  CDI spec directories:
    /etc/cdi
    /var/run/cdi
  Swarm: inactive
  Runtimes: io.containerd.runc.v2 runc
  Default Runtime: runc
  Init Binary: docker-init
  containerd version:
  runc version:
  init version:
  Security Options:
    apparmor
    seccomp
    Profile: builtin
    cgroupns
  Kernel Version: 6.8.0-88-generic
  Operating System: Ubuntu 24.04.3 LTS
  OSType: linux
  Architecture: x86_64
  CPUs: 8
  Total Memory: 15.56GiB
  Name: modenc
  ID: bb7e6e3b-c6ea-4061-9d33-a2ee0794a5b2
  Docker Root Dir: /var/lib/docker
  Debug Mode: false
  HTTP Proxy: http://127.0.0.1:20171
  HTTPS Proxy: http://127.0.0.1:20171
  No Proxy: localhost,127.0.0.1,.example.com,.internal
  Experimental: false
  Insecure Registries:
    ::1/128
    127.0.0.0/8
  Live Restore Enabled: false
  ```

- 数据集准备

  下面主要说明 Safety Prompts 数据集的预处理流程。其他数据集均为 EvalScope 内置的数据集，会在运行评测时自动下载数据集，无须手动管理。

  首先，在 Safety Prompts 的 GitHub 仓库中下载
  由于 Safety Prompts 原数据集文件结构不是标准 `jsonl` 格式，所以需要使用下面的预处理脚本把它处理成支持的输入格式：

  ```python title="main.py"
  import json


  def read_json(file_path):
      with open(file_path, 'r', encoding='utf-8') as f:
          data = json.loads(f.read())
          return data


  def save_jsonl(data, file_path):
      with open(file_path, "w", encoding="utf-8") as f:
          [f.write(json.dumps(item, ensure_ascii=False) + "\n") for item in data]


  def main():
      print("Loading data...")
      data: dict = read_json("data/safety-prompts/typical_safety_scenarios.json")

      for key in data.keys():
          print(f"Processing {key}")
          sub_data = []
          for item in data[key]:
              sub_data.append({
                  "query": item["prompt"],
                  "response": item["response"]
              })
          save_jsonl(sub_data, f"data/safety-prompts/{key}.jsonl")


  if __name__ == "__main__":
      main()

  ```

- 评测配置

  在我自己的评测代码中，使用 `.env` 管理 API Keys ，避免敏感信息泄露。所以你还需要安装：

  ```bash
  uv add dotenv
  ```

  然后，在项目根目录创建 `.env` ，并配置你的 Keys。

  ```bash title=".env"
  DASHSCOPE_API_KEY = <key>
  DEEPSEEK_API_KEY = <key>
  VOLCENGINE_API_KEY = <key>
  ```

  按照 EvalScope 文档配置即可。本评测所有代码你可以在这里找到：
  <RepoCard repo="modenicheng/llm_eval_evalscope" />

  主要参数项是这个：

  ```python
  # above omitted
  dataset_args={
      'general_qa': {
          "local_path":
          'data/safety-prompts',
          "subset_list": [
              'Unfairness_And_Discrimination',
              'Crimes_And_Illegal_Activities',
              'Insult',
              'Mental_Health',
              'Physical_Harm',
              'Privacy_And_Property',
              'Ethics_And_Morality'
          ]
      },
      'multi_if': {
          "subset_list": ['Chinese', 'English']
      }
  },
  # below omitted
  ```

  这段配置定义了刚才经过预处理的 Safety Prompts 数据集路径，以及它的子集。

  > [!WARNING]
  > 设定子集的时候，无须加入文件后缀，评测框架会自动处理。所以只填入文件名称即可。一开始我写了后缀导致 EvalScope
  > 没识别出来我的数据集 :sweat_smile:

  另外，一下两个参数项对于数据整理有很大帮助：

  ```python
  # above omitted
  work_dir='outputs/deepseek_v3_2_reasoner',
  use_cache='outputs/deepseek_v3_2_reasoner',
  # below omitted
  ```

  前者限定了所有数据生成的位置，如果不设定，则会在 `outputs/` 目录下新建一个以时间命名的文件夹。这是很地狱的
  （如果你评测中间因为意外中断了，你就知道为什么了……）因为中断后，如果没有这两个参数，评测会从头开始再来一遍，
  并且还会再有一个新的按照时间命名的目录，导致后期难以整理数据。

  指定后一个参数之后，评测框架会根据指定目录下的文件自动推断哪些评测未完成并接着完成剩余评测，而不会从头再来一遍。
  一般和第一个参数保持一致即可。 **非常推荐填写这两个参数**。

  **EDIT 2025-12-03**: 还有一个今天刚汲取教训用上的参数，叫作 `stream`。设置 `stream=True` 可以让模型流式输出，
  也就是生成多少就立刻增量返回新生成的 Token 。这种传输方式可以避免因为模型思考时间过长导致的 HTTP Timeout 错误。
  之前评测总是莫名其妙终止就是这个原因导致的。加上 `stream=True` 可以避免评测意外中断。**这个参数也非常推荐填写**。

- 评测运行

  到这一步就简单了，假设现在你的目录下用 Python 写好了若干配置文件，那么依次运行文件即可。

  ```bash
  uv run eval_some_else_llm.py
  ```

- 统计数据

  所有评测结果（包括模型输出、自动打分）的详细信息都会输出到 `outputs/` 目录下（这是默认目录）。
  通常情况下你看到的目录应该是这个样子的：

  ::: file-tree title="输出文件目录样例"

  - outputs/
    - deepseek_v3_2_reasoner/ Model ID
      - configs/ 每次运行都会产生一个 yaml 配置
        - task_config_285f94.yaml
        - task_config_3961d5.yaml
        - task_config_534000.yaml
        - task_config_5944ab.yaml
        - task_config_616cf8.yaml
        - task_config_7ac8aa.yaml
        - task_config_b452f2.yaml
        - task_config_e184b6.yaml
      - logs/ 运行日志，每次运行覆盖前一次运行的日志
        - eval_log.log
      - predictions/ 模型输出（预测）
        - deepseek-reasoner/
          - chinese_simpleqa_中华文化.jsonl
          - chinese_simpleqa_人文与社会科学.jsonl
          - chinese_simpleqa_工程、技术与应用科学.jsonl
          - chinese_simpleqa_生活、艺术与文化.jsonl
          - chinese_simpleqa_社会.jsonl
          - chinese_simpleqa_自然与自然科学.jsonl
          - general_qa_Crimes_And_Illegal_Activities.jsonl
          - general_qa_Ethics_And_Morality.jsonl
          - ...
      - reports/ 最终评测报告生成目录
        - deepseek-reasoner/
          - chinese_simpleqa.json
          - general_qa.json
          - ifeval.json
          - math_500.json
          - multi_if.json
          - swe_bench_verified_mini.json
      - reviews/ 评测结果，主要是每一条评测样本的具体打分
        - deepseek-reasoner/ 会按照 Model ID 分目录存放
          - chinese_simpleqa*中华文化.jsonl
          - chinese_simpleqa_人文与社会科学.jsonl
          - chinese_simpleqa_工程、技术与应用科学.jsonl
          - chinese_simpleqa_生活、艺术与文化.jsonl
          - chinese_simpleqa_社会.jsonl
          - chinese_simpleqa_自然与自然科学.jsonl
          - general_qa_Crimes_And_Illegal_Activities.jsonl
          - general_qa_Ethics_And_Morality.jsonl
          - ...
      - swebench_log/
        - django__django-11815/
          - eval.sh
          - patch.diff
          - test_output.txt
        - ...
  :::

### **评测结果** :construction:

这部分会对评测结果进行展示和分析。该说不说这把评测观察到了很多有意思的现象。:construction:

#### **评测概览**

::: chartjs

```json
{
  "type": "radar",
  "data": {
    "labels": [
      "Safety  Prompts",
      "Chinese Simple QA",
      "MATH-500",
      "Multi IF",
      "IFEval",
      "SWE Bench Verified Mini"
    ],
    "datasets": [
      {
        "label": "deepseek-reasoner V3.2 EXP",
        "data": [0.808, 0.6589, 0.99, 0.8984, 0.9062, 0.26],
        "backgroundColor": "#e74c3c22",
        "borderColor": "#e74c3cbb",
        "borderWidth": 1
      },
      {
        "label": "deepseek-reasoner V3.2",
        "data": [0.7924, 0.6953, 0.9866, 0.8203, 0.9062, 0.3000],
        "backgroundColor": "#e67e2222",
        "borderColor": "#e67e22bb",
        "borderWidth": 1
      },
      {
        "label": "deepseek-reasoner V3.2 SPECIAL",
        "data": [0.7366, 0.7109, 0.9900, 0.7266, 0.9375, 0.2800],
        "backgroundColor": "#f1c40f22",
        "borderColor": "#f1c40fbb",
        "borderWidth": 1
      },
      {
        "label": "qwen3-max",
        "data": [0.8352, 0.8776, 0.9799, 0.8047, 0.8594, 0.22],
        "backgroundColor": "#34495e33",
        "borderColor": "#34495ebb",
        "borderWidth": 1
      },
      {
        "label": "doubao-seed-1-6-251015",
        "data": [0.7991, 0.6901, 0.9565, 0.8125, 0.8281, 0.32],
        "backgroundColor": "#9b59b622",
        "borderColor": "#9b59b6bb",
        "borderWidth": 1
      },
      {
        "label": "qwen-plus",
        "data": [0.8284, 0.8464, 0.9766, 0.8828, 0.8906, 0.18],
        "backgroundColor": "#2ecc7122",
        "borderColor": "#2ecc71bb",
        "borderWidth": 1
      }
    ]
  }
}
```

:::

::: chartjs

```json
<!-- @include: ../.vuepress/public/data/merged_evaluation_data_pretty.json -->
```

:::

<table>
  <thead>
    <tr>
        <th>评价指标 →</th>
        <th>安全性</th>
        <th>事实问答</th>
        <th>数理逻辑</th>
        <th colspan="2">指令遵循</th>
        <th>代码能力</th>
    </tr>
    <tr>
      <th>数据集 →</th>
      <th>Safety  Prompts</th>
      <th>Chinese Simple QA</th>
      <th>MATH-500</th>
      <th>Multi IF</th>
      <th>IFEval</th>
      <th>SWE Bench Verified Mini</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>deepseek-reasoner V3.2 EXP</td>
      <td>0.8080</td>
      <td>0.6589</td>
      <td>0.9900</td>
      <td>0.8984</td>
      <td>0.9062</td>
      <td>0.2600</td>
    </tr>
    <tr>
      <td>qwen3-max</td>
      <td>0.8352</td>
      <td>0.8776</td>
      <td>0.9799</td>
      <td>0.8047</td>
      <td>0.8594</td>
      <td>0.2200</td>
    </tr>
    <tr>
      <td>doubao-seed-1-6-251015</td>
      <td>0.7991</td>
      <td>0.6901</td>
      <td>0.9565</td>
      <td>0.8125</td>
      <td>0.8281</td>
      <td>0.3200</td>
    </tr>
    <tr>
      <td>qwen-plus</td>
      <td>0.8284</td>
      <td>0.8464</td>
      <td>0.9766</td>
      <td>0.8828</td>
      <td>0.8906</td>
      <td>0.1800</td>
    </tr>
    <tr>
      <td>deepseek-reasoner V3.2</td>
      <td>0.7924</td>
      <td>0.6953</td>
      <td>0.9866</td>
      <td>0.8203</td>
      <td>0.9062</td>
      <td>0.3000</td>
    </tr>
    <tr>
      <td>deepseek-reasoner V3.2 SPECIAL</td>
      <td>0.7366</td>
      <td>0.7109</td>
      <td>0.9900</td>
      <td>0.7266</td>
      <td>0.9375</td>
      <td>0.2800</td>
    </tr>
  </tbody>
</table>

#### **事实回答结果概览**

::: chartjs

```json
<!-- @include: ../.vuepress/public/data/chinese_simpleqa_merged_pretty.json-->
```

:::

| Model                  | 中华文化 | 人文与社会科学 | 工程、技术与应用科学 | 生活、艺术与文化 | 社会 | 自然与自然科学 |
|------------------------|----------|----------------|----------------------|------------------|------|----------------|
| deepseek-reasoner-v3.2 | 0.6406 | 0.7500 | 0.7656 | 0.6406 | 0.6719 | 0.7031 |
| deepseek-reasoner-v3.2-exp | 0.6094 | 0.7031 | 0.7188 | 0.5938 | 0.6562 | 0.6719 |
| deepseek-reasoner-v3.2-special | 0.7031 | 0.7500 | 0.8281 | 0.6250 | 0.6406 | 0.7188 |
| doubao-seed-1-6-251015 | 0.6250 | 0.8281 | 0.7500 | 0.6094 | 0.6094 | 0.7188 |
| qwen-plus              | 0.7188 | 0.9375 | 0.8906 | 0.8438 | 0.8906 | 0.7969 |
| qwen3-max              | 0.7812 | 0.9531 | 0.875 | 0.9062 | 0.8906 | 0.8594 |

这组评测中，千问系列的两款模型在 `人文与社会科学`、`生活、艺术与文化` 和 `社会` 这三个指标上脱颖而出，与其他模型有比较大的差距。
而 Deepseek 的三款模型与豆包在各个子集上都没有很明显的差距，水平近似。

推测造成这样结果的原因是这些模型在训练数据上有所区别，千问在训练时可能已经包含了较多有关语料，导致在知识性问题上性能更加出众。

这组评测同样提示了大模型并不能够提供足够准确的事实信息。因此，在询问大模型一些问题之后最好还是重新核查一下为好。

#### **价值观对齐（安全性）结果概览**

::: chartjs

```json
<!-- @include: ../.vuepress/public/data/general_qa_merged_pretty.json -->
```

:::

| Model | Crimes_And_Illegal_Activities | Ethics_And_Morality | Insult | Mental_Health | Physical_Harm | Privacy_And_Property | Unfairness_And_Discrimination |
|-------|-------------------------------|---------------------|--------|---------------|---------------|----------------------|-------------------------------|
| deepseek-reasoner-v3.2 | 0.9062 | 0.6875 | 0.6406 | 0.9531 | 0.8281 | 0.7500 | 0.7812 |
| deepseek-reasoner-v3.2-exp | 0.9062 | 0.7188 | 0.7031 | 0.9531 | 0.8281 | 0.7344 | 0.8125 |
| deepseek-reasoner-v3.2-special | 0.7500 | 0.7031 | 0.5469 | 0.9531 | 0.7500 | 0.7344 | 0.7188 |
| doubao-seed-1-6-251015 | 0.9375 | 0.8438 | 0.6094 | 0.9531 | 0.6250 | 0.7969 | 0.8281 |
| qwen-plus | 0.9219 | 0.7969 | 0.6825 | 0.9688 | 0.8281 | 0.7500 | 0.8500 |
| qwen3-max | 0.8906 | 0.8438 | 0.6825 | 0.9688 | 0.8125 | 0.8281 | 0.8167 |



#### **指令遵循结果概览**

::: chartjs

```json
<!-- @include: ../.vuepress/public/data/ifeval_merged_pretty.json -->
```

:::

| Model | Score |
|-------|-------|
| deepseek-reasoner-v3.2 | 0.9062 |
| deepseek-reasoner-v3.2-exp | 0.9062 |
| deepseek-reasoner-v3.2-special | 0.9375 |
| doubao-seed-1-6-251015 | 0.8281 |
| qwen-plus | 0.8906 |
| qwen3-max | 0.8594 |

::: chartjs

```json
<!-- @include:  ../.vuepress/public/data/multi_if_merged_pretty.json -->
```

:::

| Model | Chinese | English |
|-------|---------|---------|
| deepseek-reasoner-v3.2 | 0.7500 | 0.8906 |
| deepseek-reasoner-v3.2-exp | 0.8750 | 0.9219 |
| deepseek-reasoner-v3.2-special | 0.7500 | 0.7031 |
| doubao-seed-1-6-251015 | 0.8750 | 0.7500 |
| qwen-plus | 0.8906 | 0.8750 |
| qwen3-max | 0.7344 | 0.8750 |

#### **数理推理结果概览**

::: chartjs

```json
<!-- @include:  ../.vuepress/public/data/math_500_merged_pretty.json -->
```

:::

| Model | Level 1 | Level 2 | Level 3 | Level 4 | Level 5 |
|-------|---------|---------|---------|---------|---------|
| deepseek-reasoner-v3.2 | 1.0000 | 1.0000 | 1.0000 | 0.9844 | 0.9531 |
| deepseek-reasoner-v3.2-exp | 1.0000 | 1.0000 | 1.0000 | 0.9844 | 0.9688 |
| deepseek-reasoner-v3.2-special | 1.0000 | 1.0000 | 1.0000 | 0.9688 | 0.9844 |
| doubao-seed-1-6-251015 | 0.9767 | 0.9844 | 0.9531 | 0.9375 | 0.9375 |
| qwen-plus | 1.0000 | 1.0000 | 0.9844 | 0.9688 | 0.9375 |
| qwen3-max | 1.0000 | 0.9844 | 1.0000 | 0.9688 | 0.9531 |

#### **代码能力结果概览**

::: chartjs

```json
<!-- @include: ../.vuepress/public/data/swe_bench_verified_mini_merged_pretty.json-->
```

:::

| Model | Score |
|-------|-------|
| deepseek-reasoner-v3.2 | 0.3000 |
| deepseek-reasoner-v3.2-exp | 0.2600 |
| deepseek-reasoner-v3.2-special | 0.2800 |
| doubao-seed-1-6-251015 | 0.3200 |
| qwen-plus | 0.1800 |
| qwen3-max | 0.2200 |

#### **成本统计** （向右滚动查看完整数据 :point_right: ）

> [!NOTE]
> 所有账单均以原价计入，不考虑 免费使用额度 / 折扣 / 资源包 等优惠。
>
> 所有最终成本均四舍五入至两位小数。

| 模型              | 输入（命中缓存）/ Token | 输入（未命中缓存）/ Token | 输出 / Token | 总计 / Token | 总成本     |
| ----------------- | ----------------------- | ------------------------- | ------------ | ------------ | ---------: |
| qwen3-max         | 26112                   | 1810219                   | 833637       | 2669968      | ￥ 10.65   |
| deepseek-reasoner | 1321408                 | 1640963                   | 3337118      | 6299489      | ￥ 13.55   |
| qwen-plus         | 256                     | 1177105                   | 931733       | 2109094      | ￥  3.04   |
| doubao-seed-1-6   | 未开启缓存              | 2074693                   | 2005799      | 4080492      | ￥ 15.66   |
| deepseek-chat     | 2289216                 | 2412706                   | 4756         | 4706678      | ￥  4.83   |

> [!WARNING]
> 评测中，由于 deepseek-reasoner 评测配置被错误地全部设置成了 LLM 自动评测，导致不得不重新评测。这导致了 Deepseek 两个模型开销偏大。

**EDIT 2025-12-03**: 重新测试了 Deepseek V3.2 和 Deepseek V3.2-SPECIAL。现将所有额外开销记录如下：

| 模型              | 输入（命中缓存）/ Token | 输入（未命中缓存）/ Token | 输出 / Token | 总计 / Token | 总成本     |
| ----------------- | ----------------------- | ------------------------- | ------------ | ------------ | ---------: |
| deepseek-reasoner | 1710528                 | 1518785                   | 2770629      | 5999942      | ￥ 11.69   |
| deepseek-chat     | 9984                    | 33818                     | 64           | 43866        | ￥  0.07   |

在统计 deepseek-chat 的成本时，有一个很有趣的现象：这个模型输出 tokens 数量永远等于请求次数！

这说明， deepseek-chat 很好地遵循了评分的提示词，每一次只输出 `A` 或 `B`
来判断被测模型输出到底是对还是错。

> [!NOTE]
> 这一轮单独的评测同时跑了两个版本，一个是正式版 Deepseek-V3.2 ，另一个是特别版 Deepseek-V3.2-SPECIAL，
> 由于 Deepseek 官方没有提供更加精细的调用日志与成本统计，所以只能把两个模型的成本计在一起。
>
> 其实可以通过错开二者评测时间的方式分别统计二者开销，不过由于时间关系（ddl是 11 号，再不推进度真要寄了）
> 两个版本的模型就一起测了。

## **主观评测 · Experience**

---

## **引用 · Citations**

### Framework

EvalScope

```bibtex
@misc{evalscope_2024,
    title={{EvalScope}: Evaluation Framework for Large Models},
    author={ModelScope Team},
    year={2024},
    url={https://github.com/modelscope/evalscope}
}
```

### Datasets

#### Safety Prompts

```bibtex
@article{sun2023safety,
      title={Safety Assessment of Chinese Large Language Models},
      author={Hao Sun and Zhexin Zhang and Jiawen Deng and Jiale Cheng and Minlie Huang},
      journal={arXiv preprint arXiv:2304.10436},
      year={2023}
}
```

#### MATH

MATH-500 是从 MATH 数据集（800,000 条数据）中挑选出来的少量样本，评测性能与原 MATH 集相近

```bibtex
@article{lightman2023lets,
      title={Let's Verify Step by Step},
      author={Lightman, Hunter and Kosaraju, Vineet and Burda, Yura and Edwards, Harri and Baker, Bowen and Lee, Teddy and Leike, Jan and Schulman, John and Sutskever, Ilya and Cobbe, Karl},
      journal={arXiv preprint arXiv:2305.20050},
      year={2023}
}
```

#### Multi IF

```bibtex
@article{he2024multi,
  title={Multi-IF: Benchmarking LLMs on Multi-Turn and Multilingual Instructions Following},
  author={He, Yun and Jin, Di and Wang, Chaoqi and Bi, Chloe and Mandyam, Karishma and Zhang, Hejia and Zhu, Chen and Li, Ning and Xu, Tengyu and Lv, Hongjiang and others},
  journal={arXiv preprint arXiv:2410.15553},
  year={2024}
}
```

#### Chinese Simple QA

```bibtex
@misc{he2024chinesesimpleqachinesefactuality,
      title={Chinese SimpleQA: A Chinese Factuality Evaluation for Large Language Models},
      author={Yancheng He and Shilong Li and Jiaheng Liu and Yingshui Tan and Weixun Wang and Hui Huang and Xingyuan Bu and Hangyu Guo and Chengwei Hu and Boren Zheng and Zhuoran Lin and Xuepeng Liu and Dekai Sun and Shirong Lin and Zhicheng Zheng and Xiaoyong Zhu and Wenbo Su and Bo Zheng},
      year={2024},
      eprint={2411.07140},
      archivePrefix={arXiv},
      primaryClass={cs.CL},
      url={https://arxiv.org/abs/2411.07140},
}
```

#### SWE Bench Verified

使用的数据集 SWE Bench Verified Mini 是从中挑选出来的少数问题。原数据集过大（130GB+）难以评测。

```bibtex
@inproceedings{
    jimenez2024swebench,
    title={{SWE}-bench: Can Language Models Resolve Real-world Github Issues?},
    author={Carlos E Jimenez and John Yang and Alexander Wettig and Shunyu Yao and Kexin Pei and Ofir Press and Karthik R Narasimhan},
    booktitle={The Twelfth International Conference on Learning Representations},
    year={2024},
    url={https://openreview.net/forum?id=VTF8yNQM66}
}
```

#### IFEval

```bibtex
@article{zhou2023instruction,
  title={Instruction-Following Evaluation for Large Language Models},
  author={Zhou, Jeffrey and Lu, Tianjian and Mishra, Swaroop and Brahma, Siddhartha and Basu, Sujoy and Luan, Yi and Zhou, Denny and Hou, Le},
  journal={arXiv preprint arXiv:2311.07911},
  year={2023}
}
```

### 引用本文 · Cite This Article

```bibtex
@misc{modenicheng2025llmeval,
  author       = {Jiaqi Cheng},
  title        = {人工智能导论 Midterm Project - LLMs Evaluation},
  howpublished = {\url{https://modenc.top/blog/wtn59ea4/}},
  year         = {2025},
  month        = {11},
  day          = {26},
}
```

---

[^evalscope]: Github repository at <https://github.com/modelscope/evalscope>
[^evalscope-docs-llms]: EvalScope documents listing all the datasets supported <https://evalscope.readthedocs.io/zh-cn/latest/get_started/supported_dataset/llm.html>
[^multi-if]: Thesis at <https://arxiv.org/abs/2410.15553>
[^ifeval]:
    Thesis at <https://arxiv.org/abs/2311.07911>
    Repository at <https://github.com/google-research/google-research/tree/master/instruction_following_eval>

[^chinese_simple_qa]: Thesis at <https://arxiv.org/abs/2411.07140>
[^swe-bench]: Github repository at <https://github.com/mariushobbhahn/SWEBench-verified-mini>
[^math-500]:
    Hugging Face Dataset page <https://huggingface.co/datasets/HuggingFaceH4/MATH-500>
    Original Github repository at <https://github.com/openai/prm800k/tree/main?tab=readme-ov-file#math-splits>
    Corresponding paper at <https://arxiv.org/abs/2305.20050>

[^safety-prompts]: Thesis at <https://arxiv.org/abs/2304.10436>

<style>
.vp-doc table {
  width: fit-content;
  max-width: 100%;
  display: block;
  text-wrap: nowrap;
  overflow-x: auto;
  margin: 0 auto;
}
.katex-display {
  display: block;
  overflow-x: clip;
}
</style>
