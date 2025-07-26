<script setup lang="ts">
import type { ThemeHomeConfigBase } from "vuepress-theme-plume";
import { ref, onMounted, onUnmounted } from "vue";
import { useDarkMode } from "vuepress-theme-plume/client";

// three.js
import * as THREE from "three";
import Stats from "three/addons/libs/stats.module.js";

// custom
import { getThemeBg, isMobile } from "../utils";
import { icon } from "mermaid/dist/rendering-util/rendering-elements/shapes/icon.js";
import { useRouter } from "vuepress/client";

const dark = useDarkMode();

interface propData {
  hero: any;
}
const props = defineProps<ThemeHomeConfigBase & propData>();
const canvasRef = ref<HTMLCanvasElement>();

const resizeCanvas = () => {
  if (canvasRef.value) {
    canvasRef.value.width = window.innerWidth;
    canvasRef.value.height = window.innerHeight;
  }
};

let alpha = 0;
let beta = 0;
let gamma = 0;

const updateDeviceRotation = (event: DeviceOrientationEvent) => {
  alpha = event.alpha!;
  beta = event.beta!;
  gamma = event.gamma!;
};

onMounted(() => {
  resizeCanvas();
  mouseX = window.innerWidth / 2;
  mouseY = window.innerHeight / 2;
  window.addEventListener("resize", resizeCanvas);
  window.addEventListener("mousemove", updateMousePos);
  if (window.DeviceOrientationEvent) {
    window.addEventListener("deviceorientation", updateDeviceRotation, true);
  }
  main();
});

onUnmounted(() => {
  window.removeEventListener("resize", resizeCanvas);
  window.removeEventListener("mousemove", updateMousePos);
  if (window.DeviceOrientationEvent) {
    window.removeEventListener("deviceorientation", updateDeviceRotation);
  }
});

let mouseX: number, mouseY: number;
let mouse = ref({ x: 0, y: 0 });
const updateMousePos = (event: MouseEvent) => {
  mouseX = event.clientX;
  mouseY = event.clientY;
  mouse.value = { x: mouseX, y: mouseY };
};
// 使用 getBoundingClientRect，确保鼠标和canvas坐标一致
const getNDC = (x: number, y: number, canvas: HTMLCanvasElement) => {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((x - rect.left) / rect.width) * 2 - 1,
    y: -((y - rect.top) / rect.height) * 2 + 1,
  };
};

class DotLine {
  pos1: THREE.Vector3; // 起始点
  vec: THREE.Vector3; // 方向向量
  r: number;
  padding: number;
  dotColor: THREE.Color;
  lineColor: THREE.Color;
  gap: number; //点与点之间的距离

  constructor(pos1: THREE.Vector3, vec: THREE.Vector3) {
    this.pos1 = pos1;
    this.vec = vec;
    this.r = 0.1;
    this.padding = 0.5;
    this.dotColor = new THREE.Color(0xffffff);
    this.lineColor = new THREE.Color(0xaaffaa);
    this.gap = 0.2;
  }
}

class Line {
  start: THREE.Vector3;
  vec: THREE.Vector3;
  len: number;
  mesh: THREE.Line;
  color: THREE.Color;

  constructor(
    start: THREE.Vector3,
    vec: THREE.Vector3,
    len: number,
    color: THREE.Color = new THREE.Color(0xaaaaaa)
  ) {
    this.start = start;
    this.vec = vec;
    this.len = len;
    this.color = color;

    const geo = new THREE.BufferGeometry();

    const deltaVector = vec.normalize().multiplyScalar(len);
    const dx = deltaVector.x;
    const dy = deltaVector.y;
    const dz = deltaVector.z;

    const vertices = new Float32Array([
      start.x,
      start.y,
      start.z,
      start.x + dx,
      start.y + dy,
      start.z + dz,
    ]);
    geo.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    const mat = new THREE.LineBasicMaterial({ color: this.color });
    this.mesh = new THREE.Line(geo, mat);
  }

  update() {}
}

const main = () => {
  let statsDom = document.getElementById("fps");
  let logDom = document.getElementById("log");

  const renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value!,
    antialias: true,
    alpha: true,
  });

  // 每次都设置渲染器尺寸，保证和canvas一致
  renderer.setSize(window.innerWidth, window.innerHeight, false);

  const fov = 70;
  const aspect = window.innerWidth / window.innerHeight;
  const near = 0.1;
  const far = 300;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  // camera.position.set(30, 30, 30);
  camera.position.set(0, 0, 0);

  const scene = new THREE.Scene();
  scene.background = null; // 透明背景

  // debug axis

  const x = new Line(
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(1, 0, 0),
    20,
    new THREE.Color(0xff0000)
  );
  const y = new Line(
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 1, 0),
    20,
    new THREE.Color(0x00ff00)
  );
  const z = new Line(
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 1),
    20,
    new THREE.Color(0x0000ff)
  );
  //

  const fog = new THREE.Fog(getThemeBg().bg, 0, 150);
  scene.fog = fog;

  //
  const lines: Line[] = [];
  const gapX = 20;
  const gapY = 20;
  const gapZ = 20;
  const range = 10;

  const clock = new THREE.Clock();
  for (let i = range; i > -range; i--) {
    for (let j = range; j > -range; j--) {
      const l = new Line(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, -1),
        300
      );
      l.mesh.position.set(i * gapX, j * gapY, 150);
      l.update = () => {
        l.mesh.translateY(Math.sin(clock.getElapsedTime() + i) * 0.003);
        l.mesh.translateX(Math.sin(clock.getElapsedTime() + j) * 0.003);
        // @ts-ignore
        l.mesh.material.color = new THREE.Color(
          `rgb(${dark.value ? 0 : 140}, ${Math.round(
            dark.value
              ? ((j + range) / (range * 2)) *
                  230 *
                  (0.8 + Math.sin(clock.getElapsedTime()) * 0.1)
              : (((j + range) / (range * 2)) * 100 + 175) *
                  (0.85 + Math.sin(clock.getElapsedTime()) * 0.1)
          )}, ${Math.round(
            dark.value
              ? ((i + range) / (range * 2)) *
                  255 *
                  (0.95 + Math.sin(clock.getElapsedTime() + 10 * (i + j)) * 0.1)
              : (((i + range) / (range * 2)) * 130 + 170) *
                  (0.97 +
                    Math.sin(clock.getElapsedTime() + 10 * (i + j)) * 0.03)
          )})`
        );
      };
      l.update();
      lines.push(l);
      scene.add(l.mesh);
    }
  }

  const stats = new Stats();
  if (statsDom) statsDom.appendChild(stats.dom);

  const canvas = renderer.domElement;
  let lastBgColor: string = getThemeBg().bg;

  {
    const worldPos = new THREE.Vector3(0, 0, 0.5).project(camera);
    camera.position.set(worldPos.x, worldPos.y, 10);
    camera.lookAt(new THREE.Vector3(0, 5, 0));
  }

  const animate = () => {
    renderer.render(scene, camera);

    // stats
    stats.update();

    if (debug.value) {
      scene.add(x.mesh, y.mesh, z.mesh);
    } else {
      scene.remove(x.mesh, y.mesh, z.mesh);
    }

    // 每帧都自适应窗口
    const width = window.innerWidth;
    const height = window.innerHeight;
    if (
      renderer.getSize(new THREE.Vector2()).width !== width ||
      renderer.getSize(new THREE.Vector2()).height !== height
    ) {
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
    const ndc = getNDC(mouseX, mouseY, canvas);
    const worldPos = new THREE.Vector3(ndc.x, ndc.y, 0.5).unproject(camera);
    const scale = 0.8;
    // camera.position.set(worldPos.x * scale, worldPos.y * scale, 10);
    if (isMobile()) {
      if (window.DeviceOrientationEvent) {
        camera.position.set(gamma * 0.015, -(beta + 35) * 0.01, 10);
      }
      camera.lookAt(new THREE.Vector3(0, 5, 0));
    } else if (mouseX && mouseY) {
      camera.position.set(
        new THREE.Vector3(ndc.x * 0.2 + 0.7, ndc.y, 0.5).unproject(camera).x,
        worldPos.y * scale,
        10
      );
      camera.lookAt(new THREE.Vector3(0, 5, 0));
    }

    // 处理背景

    let bg = getThemeBg().bg;
    if (lastBgColor !== bg) {
      lastBgColor = bg;
      fog.color = new THREE.Color(bg);
    }

    //
    for (let i = 0; i < lines.length; i++) {
      lines[i].update();
    }
    // logger
    if (logDom) {
      logDom!.innerHTML = `
    screenPos:
    ${mouseX}
    ${mouseY}
    <br />
    NDC:
    ${ndc.x.toFixed(3)}
    ${ndc.y.toFixed(3)}
    <br />
    worldPos:
    ${worldPos.x.toFixed(3)}
    ${worldPos.y.toFixed(3)}
    ${worldPos.z.toFixed(3)}
    <br />
    cameraPos:
    ${camera.position.x.toFixed(3)}
    ${camera.position.y.toFixed(3)}
    ${camera.position.z.toFixed(3)}
    <br />
    cameraRotation:
    ${camera.rotation.x.toFixed(3)}
    ${camera.rotation.y.toFixed(3)}
    ${camera.rotation.z.toFixed(3)}
    <br />
    cameraUp:
    ${camera.up.x.toFixed(3)}
    ${camera.up.y.toFixed(3)}
    ${camera.up.z.toFixed(3)}
    <br />
    rotation:
      beta: ${beta !== null ? beta.toFixed(5) : "null"} <br />
      gamma: ${gamma !== null ? gamma.toFixed(5) : "null"} <br />
      alpha: ${alpha !== null ? alpha.toFixed(5) : "null"} <br />
    `;
    } else {
      logDom = document.getElementById("log");
    }
  };

  renderer.setAnimationLoop(animate);
};

//
const debug = ref(false);

const router = useRouter();
</script>
<template>
  <div>
    <canvas
      :class="['home-canvas', dark ? 'dark-bg' : 'light-bg']"
      ref="canvasRef"
    />
    <div v-show="debug" :class="['fps']" id="fps"></div>
    <div v-show="debug" :class="['data']">
      <div id="log"></div>
      {{ isMobile() }}
    </div>
    <div class="content">
      <div class="hero">
        <div class="title">
          {{ props.hero.title }}
        </div>
        <div class="subtitle">
          {{ props.hero.subtitle }}
          <span class="cursor"></span>
        </div>
        <div class="text">
          {{ props.hero.text }}
        </div>
        <div class="actions" v-if="props.hero.actions && !isMobile()">
          <button
            v-for="item in props.hero.actions"
            :class="['action', item.theme === 'alt' ? 'alt' : '']"
            @click="router.push(item.link)"
          >
            {{ item.text }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.content {
  width: 100%;
  height: calc(100vh - var(--vp-nav-height));
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero {
  width: calc(var(--vp-layout-max-width) - 60px);
  padding: 2rem;
  gap: 1rem;
  display: flex;
  flex-direction: column;
  font-family: 'Segoe UI',  sans-serif;
}

.title {
  font-size: 10rem;
  line-height: 10rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  animation: flyUp 0.6s cubic-bezier(0.075, 0.82, 0.165, 1);
  background: linear-gradient(120deg, #45a2ff, rgb(183, 17, 255));
  background-clip: text;
  width: fit-content;
  color: transparent;
}
.subtitle {
  font-size: 3rem;
  line-height: 3rem;
  margin-bottom: 1rem;
  font-weight: 500;
  animation: flyUp 0.8s cubic-bezier(0.075, 0.82, 0.165, 1);
  vertical-align: baseline;
}
.text {
  font-size: 1.2rem;
  line-height: 1.8rem;
  color: var(--vp-c-text-2);
  animation: flyUp 1s cubic-bezier(0.075, 0.82, 0.165, 1);
}
.actions {
  margin-top: 1rem;
  display: flex;
  gap: 1.5rem;
}

.action {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 3rem;
  border-radius: 0.5rem;
  font-weight: 500;
  padding: 0 1.5rem;
  transition: background-color 0.2s ease;
  cursor: pointer;
  background-color: var(--vp-c-brand-soft);
  backdrop-filter: blur(0.1rem);
  box-shadow: 0 0 0.1rem rgba(0, 0, 0, 0.1);
}

.action:hover {
  transition: background-color 0.2s ease;
  background-color: var(--vp-c-brand-3);
}

.alt {
  background-color: rgba(125, 125, 125, 0.1) !important;
}
.alt:hover {
  background-color: rgba(125, 125, 125, 0.3) !important;
}
.home-canvas {
  overflow: hidden;
  display: block;
  z-index: -1;
  width: 100%;
  height: 100vh;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  position: fixed;
  top: 0;
  left: 0;
  animation: fadeIn 1s;
}

.data {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 40;
  pointer-events: none;
  background-color: rgba(0, 0, 0, 0.533);
  color: rgb(255, 255, 255);
  padding: 1rem;
  text-align: end;
  font-family: monospace;
}

.hide {
  opacity: 0;
}

.cursor {
  position: relative;
  display: inline-block;
  left: -0.2rem;
  pointer-events: none;
  width: 1rem;
  height: 0.2rem;
  background-color: var(--vp-c-text-1);
  animation: blink 2s infinite;
}

@keyframes blink {
  0% {
    opacity: 1;
  }
  45% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
  95% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
@keyframes flyUp {
  0% {
    opacity: 0;
    translate: 0 10rem;
  }
  100% {
    opacity: 1;
  }
}

@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .title {
    font-size: 6rem;
    line-height: 6rem;
  }
  .subtitle {
    font-size: 2rem;
    line-height: 2rem;
  }
}
</style>
