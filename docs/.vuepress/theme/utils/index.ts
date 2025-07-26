const getThemeBg = () => {
  const rootStyles = getComputedStyle(document.documentElement);
  // 读取 CSS 变量
  const bg = {
    bg: rootStyles.getPropertyValue("--vp-c-bg"),
    bgAlt: rootStyles.getPropertyValue("--vp-c-bg-alt"),
    bgElv: rootStyles.getPropertyValue("--vp-c-bg-elv"),
    bgSoft: rootStyles.getPropertyValue("--vp-c-bg-soft"),
  }
  return bg
};

export { getThemeBg }