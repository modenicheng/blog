<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import MarkdownIt from "markdown-it";
import { katex } from "@mdit/plugin-katex-slim";

interface ResponseData {
  model: string;
  platform: string;
  content: string;
  reasoning?: string;
  score: number | string;
  comment?: string;
}

interface QuestData {
  quest_id: string | number;
  aspect: string;
  judgement?: string;
  prompt: string;
  data: ResponseData[];
}

// Props
const props = withDefaults(
  defineProps<{
    /** 数据文件路径，相对于网站根目录 */
    dataPath?: string;
    detailed?: boolean;
  }>(),
  {
    dataPath: "/data/llm_experience_score.json",
    detailed: false,
  }
);

// 响应式数据
const data = ref<QuestData[] | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const markdownRenderer = ref<any>(null);

// 计算每个模型的平均分
const averageScores = computed(() => {
  if (!data.value || data.value.length === 0) return [];

  // 获取所有模型（假设每个 quest 的模型顺序相同）
  const models = data.value[0].data.map((resp) => resp.model);
  const averages = [];

  for (let i = 0; i < models.length; i++) {
    let sum = 0;
    let count = 0;

    // 遍历所有 quest，收集该模型的分数
    for (const task of data.value) {
      const score = task.data[i]?.score;
      // 尝试转换为数字
      const numScore =
        typeof score === "number" ? score : parseFloat(score as string);

      if (!isNaN(numScore)) {
        sum += numScore;
        count++;
      }
    }

    averages.push(count > 0 ? (sum / count).toFixed(2) : "—");
  }

  return averages;
});

// 处理单元格合并：如果 aspect 为空，合并到上一个非空单元格
const mergedAspectData = computed(() => {
  if (!data.value || data.value.length === 0) return [];

  const result = [];
  let currentGroup = {
    aspect: "",
    startIndex: 0,
    span: 0
  };

  for (let i = 0; i < data.value.length; i++) {
    const task = data.value[i];
    const aspect = task.aspect?.trim() || "";

    if (aspect) {
      // 开始新组
      if (currentGroup.span > 0) {
        // 保存上一个组
        for (let j = currentGroup.startIndex; j < i; j++) {
          result.push({
            task: data.value[j],
            showAspect: j === currentGroup.startIndex,
            aspectRowspan: currentGroup.span,
            aspect: currentGroup.aspect
          });
        }
      }

      currentGroup = {
        aspect: aspect,
        startIndex: i,
        span: 1
      };
    } else {
      // 继续当前组
      if (currentGroup.span === 0) {
        // 如果第一个就是空的，需要特殊处理
        currentGroup = {
          aspect: "", // 保持为空
          startIndex: i,
          span: 1
        };
      } else {
        currentGroup.span++;
      }
    }
  }

  // 处理最后一组
  if (currentGroup.span > 0) {
    for (let j = currentGroup.startIndex; j < data.value.length; j++) {
      result.push({
        task: data.value[j],
        showAspect: j === currentGroup.startIndex,
        aspectRowspan: currentGroup.span,
        aspect: currentGroup.aspect
      });
    }
  }

  return result;
});

// 加载 markdown-it（仅在客户端）
async function loadMarkdownIt() {
  if (typeof window === "undefined") return;

  try {
    // 动态导入 markdown-it
    // const markdownIt = await import("markdown-it");
    // 创建 markdown-it 实例
    const md = new MarkdownIt();

    // 动态导入 katex 插件并应用
    // const { katex } = await import("@mdit/plugin-katex-slim");
    katex(md, {
      // 支持 $...$ 和 \[...\] \(...\) 语法
      delimiters: "all",
      // 不允许 $ 语法两边有空格（默认）
      allowInlineWithSpace: true,
      // 启用数学围栏
      mathFence: false,
    });

    markdownRenderer.value = md;
  } catch (err) {
    console.warn("Failed to load markdown-it or katex plugin:", err);
    markdownRenderer.value = null;
  }
}

// 渲染 Markdown
function renderMarkdown(text: string): string {
  if (!text) return "";

  // 如果有 markdown-it 实例，使用它
  if (markdownRenderer.value) {
    return markdownRenderer.value.render(text);
  }

  // 否则简单转义 HTML
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// 加载数据
async function loadData() {
  try {
    loading.value = true;
    error.value = null;

    // 构建完整 URL
    const url = props.dataPath.startsWith("http")
      ? props.dataPath
      : new URL(props.dataPath, window.location.origin).toString();

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    data.value = await response.json();
    console.log("Data loaded successfully:", data.value);
    initCollapsedStates();
  } catch (err) {
    error.value = err instanceof Error ? err.message : "未知错误";
    console.error("Error loading data:", err);
  } finally {
    loading.value = false;
  }
}

// 每个表格的折叠状态（quest_id -> boolean）
const collapsedStates = ref<Record<string | number, boolean>>({});

// 初始化折叠状态
function initCollapsedStates() {
  if (!data.value) return;

  collapsedStates.value = {};
  data.value.forEach((task) => {
    // 默认折叠状态为true
    collapsedStates.value[task.quest_id] = true;
  });
}

// 切换指定表格的折叠状态
function toggleCollapsed(questId: string | number) {
  collapsedStates.value[questId] = !collapsedStates.value[questId];
}

// 获取指定表格的折叠状态
function isCollapsed(questId: string | number): boolean {
  return collapsedStates.value[questId] ?? true;
}

// 生命周期
onMounted(async () => {
  // 加载 markdown-it
  await loadMarkdownIt();

  // 加载数据
  await loadData();
});
</script>

<template>
  <div class="llm-data-table" v-if="detailed">
    <!-- 加载状态 -->
    <div v-if="loading">
      <div role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Loading data...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">
      <div role="alert">Error loading data: {{ error }}</div>
    </div>

    <!-- 表格内容 -->
    <div v-else-if="data">
      <div v-for="task in data" :key="task.quest_id">
        <!-- 标题 -->
        <h4>Quest {{ task.quest_id }}: {{ task.aspect }}</h4>

        <!-- 用户提示 -->
        <Card title="User Prompt:" style="max-height: 20rem; overflow-y: auto">
          <div v-html="renderMarkdown(task.prompt)"></div>
        </Card>
        <Card title="Judgement:" v-if="task.judgement && task.judgement.trim()">
          <div v-html="renderMarkdown(task.judgement)"></div>
        </Card>

        <!-- 表格 -->
        <table>
          <thead>
            <tr>
              <th>Model</th>
              <th v-for="resp in task.data" :key="resp.model" class="cell">
                {{ resp.model }}<br />
                <small>{{ resp.platform }}</small>
              </th>
            </tr>
          </thead>
          <tbody>
            <!-- 内容行 -->
            <tr>
              <th class="table-secondary">Content</th>
              <td v-for="resp in task.data" :key="resp.model">
                <div v-html="renderMarkdown(resp.content)" class="cell"></div>
              </td>
            </tr>

            <!-- 推理行（可折叠） -->
            <tr>
              <th
                class="table-secondary"
                @click="toggleCollapsed(task.quest_id)"
                style="cursor: pointer"
              >
                Reasoning
                <div
                  style="font-weight: 300; font-size: 0.8rem"
                  v-if="isCollapsed(task.quest_id)"
                >
                  (Click to expand)
                </div>
                <div style="font-weight: 300; font-size: 0.8rem" v-else>
                  (Click to collapse)
                </div>
              </th>
              <td v-for="resp in task.data" :key="resp.model">
                <div
                  v-if="resp.reasoning && resp.reasoning.trim()"
                  v-html="renderMarkdown(resp.reasoning)"
                  :class="{
                    cell: true,
                    'collapsed-row': isCollapsed(task.quest_id),
                  }"
                ></div>
              </td>
            </tr>

            <!-- 分数行 -->
            <tr>
              <th>Score</th>
              <td v-for="resp in task.data" :key="resp.model">
                <div>{{ resp.score }}</div>
              </td>
            </tr>

            <!-- 评论行 -->
            <tr>
              <th>Comment</th>
              <td v-for="resp in task.data" :key="resp.model" class="cell">
                {{ resp.comment && resp.comment.trim() ? resp.comment : "—" }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  <div v-else class="summary-table">
    <!-- 加载状态 -->
    <div v-if="loading">
      <div role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Loading data...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">
      <div role="alert">Error loading data: {{ error }}</div>
    </div>

    <!-- 简略表格 -->
    <div v-else-if="data">
      <table>
        <thead>
          <tr>
            <th rowspan="2">Quest ID</th>
            <th rowspan="2">评价角度</th>
            <th :colspan="data[0]?.data?.length || 0">Models</th>
          </tr>
          <tr>
            <th v-for="resp in data[0]?.data" :key="resp.model">
              {{ resp.model }}<br />
              <small>{{ resp.platform }}</small>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in mergedAspectData" :key="item.task.quest_id">
            <td style="text-align: right; font-weight: 500">
              {{ item.task.quest_id }}
            </td>
            <td v-if="item.showAspect" :rowspan="item.aspectRowspan">
              {{ item.aspect }}
            </td>
            <td v-if="!item.showAspect" style="display: none"></td>
            <td v-for="resp in item.task.data" :key="resp.model">
              {{ resp.score }}
            </td>
          </tr>
          <!-- 平均分行 -->
          <tr class="average-row">
            <td colspan="2" style="font-weight: bold" class="tip">Average</td>
            <td v-for="(avg, index) in averageScores" :key="index" class="tip">
              {{ avg }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<style scoped>
.table-secondary {
  overflow-y: auto;
}

.cell {
  min-width: 15rem;
  width: max-content;
  max-width: 29rem;
  max-height: 35rem;
  overflow: auto;
  text-wrap: wrap;
  /* 确保内容不会溢出单元格 */
  box-sizing: border-box;
}

.collapsed-row {
  min-width: 15rem;
  width: max-content;
  max-width: 29rem;
  max-height: 1rem;
  overflow: hidden;
  text-wrap: nowrap;
  text-overflow: ellipsis;
}

/* Katex 公式样式 - 防止横向溢出 */
.llm-data-table :deep(.katex) {
  overflow-x: auto;
  overflow-y: hidden;
}

.llm-data-table :deep(.katex-display) {
  display: block;
  max-width: 30rem;
  overflow-x: auto;
  overflow-y: hidden;
  text-align: center;
}

.llm-data-table :deep(.katex-html) {
  max-width: 30rem;
  overflow-x: auto;
  overflow-y: hidden;
}

/* 简略表格样式 */
.summary-table {
  width: 100%;
  overflow-x: auto;
}

.summary-table table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.summary-table th,
.summary-table td {
  padding: 0.5rem;
  text-align: center;
  vertical-align: middle;
}

.summary-table th {
  font-weight: 600;
}
.tip {
  color: var(--vp-c-tip-1);
  background-color: var(--vp-c-tip-soft);
}
</style>
