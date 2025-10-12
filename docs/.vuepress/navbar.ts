/**
 * @see https://theme-plume.vuejs.press/config/navigation/ 查看文档了解配置详情
 *
 * Navbar 配置文件，它在 `.vuepress/plume.config.ts` 中被导入。
 */

import { defineNavbarConfig } from "vuepress-theme-plume";

export default defineNavbarConfig([
  { text: "首页", link: "/" },
  { text: "博客", link: "/blog/" },
  {
    text: "其他",
    items: [
      { text: "标签", link: "/blog/tags/", icon: "mdi:tag-outline"},
      { text: "分类", link: "/blog/categories/", icon: "mdi:category-outline" },
      { text: "归档", link: "/blog/archives/", icon: "mdi:archive-outline"},
    ],
  },
  { text: "友链", link: "/friends/" },
  {
    text: "笔记",
    items: [
      { text: "运维 / Ops", link: "/ops/" },
      { text: "大学课程 / Course", link: "/course/" },
    ],
  },
]);
