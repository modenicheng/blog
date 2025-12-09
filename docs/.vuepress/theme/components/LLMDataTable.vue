<script setup lang="ts">
import { ref, onMounted } from "vue";

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
  }>(),
  {
    dataPath: "/data/llm_experience_score.json",
  }
);

// 响应式数据
const data = ref<QuestData[] | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const markdownRenderer = ref<any>(null);

// 加载 markdown-it（仅在客户端）
async function loadMarkdownIt() {
  if (typeof window === "undefined") return;

  try {
    const markdownIt = await import("markdown-it");
    markdownRenderer.value = markdownIt.default();
  } catch (err) {
    console.warn("Failed to load markdown-it:", err);
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
  } catch (err) {
    error.value = err instanceof Error ? err.message : "未知错误";
    console.error("Error loading data:", err);
  } finally {
    loading.value = false;
  }
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
  <div class="llm-data-table">
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
        <h3>Quest {{ task.quest_id }}: {{ task.aspect }}</h3>

        <!-- 用户提示 -->
        <div>
          <strong>User Prompt:</strong>
          <div v-html="renderMarkdown(task.prompt)"></div>
        </div>

        <!-- 判断 -->
        <div v-if="task.judgement && task.judgement.trim()">
          <strong>Judgement:</strong>
          <div
            class="rendered-markdown"
            v-html="renderMarkdown(task.judgement)"
          ></div>
        </div>

        <!-- 表格 -->
        <div>
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
                <th class="table-secondary">Reasoning</th>
                <td v-for="resp in task.data" :key="resp.model">
                  <div
                    v-if="resp.reasoning && resp.reasoning.trim()"
                    v-html="renderMarkdown(resp.reasoning)"
                    class="cell"
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
  </div>
</template>
<style scoped>
.table-secondary {
  overflow-y: auto;
}

.cell {
  min-width: 15rem;
  width: max-content;
  max-width: 35rem;
  max-height: 35rem;
  overflow: auto;
  text-wrap: wrap;
}
</style>
