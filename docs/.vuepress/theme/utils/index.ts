import { computed } from "vue";

const isMobile = computed(() => {
  // 先判断window对象是否存在（云端编译环境不存在window导致报错）
  // 加上条件判断避免编译时报错
  if (window)
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      window.navigator.userAgent
    );

  return false;
});

const getThemeBg = () => {
  const rootStyles = getComputedStyle(document.documentElement);
  // 读取 CSS 变量
  const bg = {
    bg: rootStyles.getPropertyValue("--vp-c-bg"),
    bgAlt: rootStyles.getPropertyValue("--vp-c-bg-alt"),
    bgElv: rootStyles.getPropertyValue("--vp-c-bg-elv"),
    bgSoft: rootStyles.getPropertyValue("--vp-c-bg-soft"),
  };
  return bg;
};

export { getThemeBg, isMobile };
