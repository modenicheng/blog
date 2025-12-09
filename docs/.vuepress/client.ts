import { defineClientConfig } from 'vuepress/client'
import RepoCard from 'vuepress-theme-plume/features/RepoCard.vue'
import NpmBadge from 'vuepress-theme-plume/features/NpmBadge.vue'
import NpmBadgeGroup from 'vuepress-theme-plume/features/NpmBadgeGroup.vue'
// import Swiper from 'vuepress-theme-plume/features/Swiper.vue'

import Home from './theme/components/Home.vue';

import './theme/styles/custom.css'
import LLMDataTable from './theme/components/LLMDataTable.vue';

export default defineClientConfig({
  enhance({ app }) {
    // built-in components
    app.component('RepoCard', RepoCard)
    app.component('NpmBadge', NpmBadge)
    app.component('NpmBadgeGroup', NpmBadgeGroup)
    // app.component('Swiper', Swiper) // you should install `swiper`

    // your custom components
    app.component('Home', Home)
    app.component('LLMDataTable', LLMDataTable)
  },
})
