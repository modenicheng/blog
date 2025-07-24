<script setup lang="ts">
import type { ThemeHomeConfigBase } from "vuepress-theme-plume";
import { ref, onMounted, onUnmounted } from "vue";
import { useDarkMode } from "vuepress-theme-plume/client";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";

const dark = useDarkMode();

interface propData {
  title: string;
  subtitle: string;
  description: string;
}
const props = defineProps<ThemeHomeConfigBase & propData>();

const canvasRef = ref<HTMLCanvasElement>();

const resizeCanvas = () => {
  if (canvasRef.value) {
    canvasRef.value.width = window.innerWidth;
    canvasRef.value.height = window.innerHeight;
  }
};

onMounted(() => {
  resizeCanvas();
  mouseX = (window.innerWidth * 4) / 5;
  mouseY = window.innerHeight / 2;
  window.addEventListener("resize", resizeCanvas);
  window.addEventListener("mousemove", updateMousePos);
  main();
});

onUnmounted(() => {
  window.removeEventListener("resize", resizeCanvas);
  window.removeEventListener("mousemove", updateMousePos);
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
const dotNum = 5;
const dots: Dot[] = [];
const tails: Tail[] = [];
class Tail {
  pos: THREE.Vector3;
  mesh: THREE.Mesh;
  lifetime: number;
  totaltime: number;
  color: {
    r: number;
    g: number;
    b: number;
  };
  constructor(scene: THREE.Scene, lifetime: number = -1, pos: THREE.Vector3) {
    this.pos = pos;

    this.lifetime = lifetime;
    this.totaltime = lifetime;

    this.color = { r: 0, g: 0, b: 0 };

    this.mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 12, 12),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(this.color.r, this.color.g, this.color.b),
      })
    );

    this.mesh.position.copy(this.pos);
    scene.add(this.mesh);
  }

  update(tailList: Tail[] | undefined = undefined) {
    if (this.lifetime > 0) {
      this.lifetime--;
    } else if (this.lifetime === 0) {
      this.mesh.parent?.remove(this.mesh);
      if (tailList) {
        tailList.splice(tailList.indexOf(this), 1);
      }
    }
    this.setColor();
    if (this.mesh.material instanceof THREE.MeshBasicMaterial) {
      this.mesh.material.color.set(
        new THREE.Color(this.color.r, this.color.g, this.color.b)
      );
      this.mesh.material.opacity = (this.lifetime / this.totaltime) * (dark.value ? 1 : 0.6);
      this.mesh.material.transparent = true;
      this.mesh.material.needsUpdate = true;
      let scaleIndex = Math.sqrt(this.lifetime / this.totaltime);
      this.mesh.scale.set(scaleIndex, scaleIndex, scaleIndex);
    }
  }

  setColor() {
    this.color.r = this.pos.x / 30 + 0.7 * (dark.value ? 1 : 1.2);
    this.color.g = 0.05;
    this.color.b = this.pos.y / 10 + 0.7 * (dark.value ? 1 : 1.2);
  }
}

class Dot {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  acc: THREE.Vector3;
  r: number;
  mesh: THREE.Mesh;
  life: number; // 存活时长（以帧为单位）-1则不计算存活时长。
  color: {
    r: number;
    g: number;
    b: number;
  };

  constructor(scene: THREE.Scene, lifeTime: number = -1) {
    this.pos = new THREE.Vector3(
      THREE.MathUtils.randFloatSpread(window.innerWidth / 70),
      THREE.MathUtils.randFloatSpread(window.innerHeight / 70),
      THREE.MathUtils.randFloatSpread(20) + 30
    );
    this.vel = new THREE.Vector3(
      THREE.MathUtils.randFloatSpread(0.1),
      THREE.MathUtils.randFloatSpread(0.1),
      THREE.MathUtils.randFloatSpread(0.1)
      // 0
    );
    this.acc = new THREE.Vector3(0, 0, 0);
    this.r = 0.1;

    this.life = lifeTime;
    this.color = { r: 0, g: 0, b: 0 };
    this.setColor();
    this.mesh = new THREE.Mesh(
      new THREE.SphereGeometry(this.r, 32, 32),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(this.color.r, this.color.g, this.color.b),
      })
    );
    this.mesh.position.copy(this.pos);
    scene.add(this.mesh);
  }

  setColor() {
    this.color.r = this.pos.x / 30 + 0.7;
    this.color.g = 0.05;
    this.color.b = this.pos.y / 10 + 0.7;
  }

  update(worldPos: THREE.Vector3) {
    this.calculateAcc(worldPos);
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    // this.acc.multiplyScalar(0);
    this.mesh.position.copy(this.pos);
    this.setColor();
    if (this.mesh.material instanceof THREE.MeshBasicMaterial) {
      this.mesh.material.color.set(
        new THREE.Color(this.color.r, this.color.g, this.color.b)
      );
    }
  }

  calculateAcc(worldPos: THREE.Vector3) {
    let x = this.calc(worldPos.x, this.pos.x) * k;
    let y = this.calc(worldPos.y, this.pos.y) * k;
    let z = this.calc(30, this.pos.z) * k;
    // z = 0;
    this.acc.set(x, y, z);
  }

  calc = (n1: number, n2: number): number => {
    return (n1 - n2) * Math.abs(n1 - n2);
    // return n1 - n2;
    // return ((n1 - n2) * 1) / k;
  };
}
const k = 0.00001;

class HelpLine {
  pos1: THREE.Vector3;
  pos2: THREE.Vector3;
  mesh: THREE.LineSegments;
  constructor(scene: THREE.Scene, pos1: THREE.Vector3, pos2: THREE.Vector3) {
    this.pos1 = pos1;
    this.pos2 = pos2;
    this.mesh = new THREE.LineSegments(
      new THREE.BufferGeometry().setFromPoints([pos1, pos2]),
      new THREE.LineBasicMaterial({ color: 0x888888 })
    );
    scene.add(this.mesh);
  }

  update(pos1: THREE.Vector3, pos2: THREE.Vector3) {
    this.mesh.geometry.setFromPoints([pos1, pos2]);
  }
}

const main = () => {
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
  const far = 200;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

  camera.position.set(-10, 0, 50);

  const scene = new THREE.Scene();
  scene.background = null; // 透明背景

  // const controls = new OrbitControls(camera, renderer.domElement);
  // controls.enableDamping = true;

  for (let i = 0; i < dotNum; i++) {
    dots.push(new Dot(scene));
  }

  // traceDot 直接跟随鼠标
  // const traceDot = new Dot(scene);
  // traceDot.vel.set(0, 0, 0);
  // traceDot.pos.set(0, 0, 0);
  // traceDot.mesh.scale.set(0.02, 0.02, 0.02);
  // dots.push(traceDot);

  const tailDomLog = document.getElementById("tail");
  let fps = 0;
  let lastTime = performance.now();
  let frameCount = 0;
  let fpsDom = document.getElementById("fps");

  const tailDot = dots[0];

  const canvas = renderer.domElement;
  const ndc = getNDC(mouseX, mouseY, canvas);
  const worldPos = new THREE.Vector3(ndc.x, ndc.y, 0.7).unproject(camera);

  const l = new HelpLine(scene, tailDot.pos, worldPos);
  const animate = () => {
    // 帧率统计
    frameCount++;
    // controls.update();
    const now = performance.now();
    if (now - lastTime >= 1000) {
      fps = frameCount / ((now - lastTime) / 1000);
      lastTime = now;
      frameCount = 0;
      if (!fpsDom) fpsDom = document.getElementById("fps");
      if (fpsDom) fpsDom.innerText = `FPS: ${fps.toFixed(1)}`;
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
    const worldPos = new THREE.Vector3(ndc.x, ndc.y, 0.7).unproject(camera);

    // traceDot 直接跟随鼠标
    // traceDot.pos.copy(worldPos);
    // traceDot.mesh.position.copy(traceDot.pos);

    for (let i = 0; i < dots.length; i++) {
      dots[i].update(worldPos);
      tails.push(new Tail(scene, 400, dots[i].pos));
    }

    for (let i = 0; i < tails.length; i++) {
      tails[i].update();
    }
    // tails.push(new Tail(scene, 400, tailDot.pos));

    l.update(tailDot.pos, worldPos);

    // const points = [tailDot.pos, traceDot.pos];

    // const geo = new THREE.BufferGeometry().setFromPoints(points);

    // const mat = new THREE.LineBasicMaterial({ color: 0x00ff00 });
    // const line = new THREE.Line(geo, mat);
    // scene.add(line);

    // logger
    tailDomLog!.innerHTML = `
    NDC:
    ${ndc.x.toFixed(3)}
    ${ndc.y.toFixed(3)}
    <br />
    worldPos:
    ${worldPos.x.toFixed(3)}
    ${worldPos.y.toFixed(3)}
    ${worldPos.z.toFixed(3)}
    <br />
    acc:
    ${tailDot.acc.x.toFixed(10)}
    ${tailDot.acc.y.toFixed(10)}
    <br />
    vel:
    ${tailDot.vel.x.toFixed(10)}
    ${tailDot.vel.y.toFixed(10)}
    <br />
    pos:
    ${tailDot.pos.x.toFixed(10)}
    ${tailDot.pos.y.toFixed(10)}
    `;

    renderer.render(scene, camera);
    // requestAnimationFrame(animate);
  };
  renderer.setAnimationLoop((now) => {
    if (now - lastT >= INTERVAL) {
      lastT = now;
      animate();
    }
  });
};

const FPS = 60; // 目标帧率
const INTERVAL = 1000 / FPS; // 每帧间隔 ms
let lastT = performance.now();
</script>
<template>
  <div>
    <canvas
      :class="['home-canvas', dark ? 'dark-bg' : 'light-bg']"
      ref="canvasRef"
    />
    <div class="fps hide" id="fps"></div>
    <div class="data hide">
      {{ mouse }}
      <div id="tail" class="hide"></div>
    </div>
    <div>{{ props }}</div>
  </div>
</template>

<style scoped>
.home-canvas {
  overflow: hidden;
  display: block;
  z-index: -1;
  width: 100%;
  height: 100vh;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}

.data {
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
}
/* 帧率显示样式 */
.fps {
  position: fixed;
  top: 8px;
  right: 16px;
  color: #0f0;
  font-size: 18px;
  font-family: monospace;
  text-shadow: 0 0 4px #000;
  z-index: 10;
  pointer-events: none;
}
/* .dark-bg {
  background-image: url(https://img-host.modenc.top/blog/113702964_p0.png);
}
.light-bg {
  background-image: url(https://img-host.modenc.top/blog/F0hZFFraMAEK-sb.jpg);
} */

.hide {
  display: none;
}
</style>
