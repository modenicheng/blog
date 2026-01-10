import { ThemeCollectionItem } from "vuepress-theme-plume";

const collections: ThemeCollectionItem[] = [
  { type: "post", dir: "blog", title: "博客" },
  { type: "doc", dir: "ops", title: "运维 | DevOps", sidebar: "auto" },
  {
    type: "doc",
    dir: "course",
    title: "大学课程 | Courses",
    sidebar: [
      {
        text: "线性代数 | Linear Algebra",
        prefix: "linear-algebra",
        // link: "/linear-algebra",
        // items: [{ text: "一、矩阵", prefix: "一、矩阵", items: "auto" }],
        items: "auto",
      },
      {
        text: "C语言程序设计 | C Language Programming",
        prefix: "clang-programming",
        items: "auto",
      },
      // { text: "数学分析 | Mathematical Analysis" },
      {
        text: "大学化学 | University Chemistry",
        prefix: "chemistry",
        items: "auto",
      },
      {
        text: "人工智能导论 | Introduction to Artificial Intelligence",
        prefix: "introduction-to-artificial-intelligent",
        items: "auto",
      },
    ],
  },
];

export { collections };
