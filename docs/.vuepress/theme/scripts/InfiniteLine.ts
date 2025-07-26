import {
  Mesh,
  PlaneGeometry,
  ShaderMaterial,
  Vector3,
  Color,
  Matrix4,
  WebGLRenderer,
  Camera,
  Scene,
  Vector2,
} from 'three';

export interface InfiniteLineParams {
  origin?:    Vector3;
  direction?: Vector3;
  color?:     Color | number | string;
  thickness?: number;
}

export default class InfiniteLine extends Mesh {
  public material: ShaderMaterial;
  private _viewMatrixInv      = new Matrix4();
  private _projectionMatrixInv= new Matrix4();

  constructor({
    origin    = new Vector3(0, 0, 0),
    direction = new Vector3(1, 0, 0),
    color     = 0xff0000,
    thickness = 2,
  }: InfiniteLineParams = {}) {
    const geometry = new PlaneGeometry(2, 2);
    const material = new ShaderMaterial({
      uniforms: {
        uOrigin:     { value: origin.clone() },
        uDir:        { value: direction.clone().normalize() },
        uColor:      { value: new Color(color) },
        uThickness:  { value: thickness },
        uResolution: { value: new Vector2() },

        // 新增：把矩阵显式传进来
        uViewMatrixInv:       { value: new Matrix4() },
        uProjectionMatrixInv: { value: new Matrix4() },
      },
      vertexShader: `
        void main() {
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3  uOrigin;
        uniform vec3  uDir;
        uniform vec3  uColor;
        uniform float uThickness;
        uniform vec2  uResolution;

        uniform mat4 uProjectionMatrixInv;
        uniform mat4 uViewMatrixInv;

        float distToLine(vec3 ro, vec3 rd, vec3 p) {
          vec3 op = p - ro;
          float t = dot(op, rd);
          vec3 proj = ro + t * rd;
          return length(p - proj);
        }

        void main() {
          vec2 uv = gl_FragCoord.xy / uResolution.xy * 2.0 - 1.0;
          uv.x *= uResolution.x / uResolution.y;

          vec4 clip = vec4(uv, 1.0, 1.0);
          vec4 view = uProjectionMatrixInv * clip;
          view /= view.w;

          vec4 world4 = uViewMatrixInv * view;
          vec3 world = world4.xyz / world4.w;

          float d = distToLine(uOrigin, uDir, world);
          if (d > uThickness * 0.001) discard;

          gl_FragColor = vec4(uColor, 1.0);
        }
      `,
      transparent: true,
      depthTest: true,
      depthWrite: false,
    });

    super(geometry, material);
    this.material = material;
    this.frustumCulled = false;
  }

  public setFrom(origin: Vector3, direction: Vector3): this {
    this.material.uniforms.uOrigin.value.copy(origin);
    this.material.uniforms.uDir.value.copy(direction).normalize();
    return this;
  }

  public onBeforeRender(
    renderer: WebGLRenderer,
    _scene: Scene,
    camera: Camera
  ): void {
    // 更新分辨率
    const res = renderer.getSize(new Vector2());
    this.material.uniforms.uResolution.value.copy(res);

    // 更新逆矩阵
    this._projectionMatrixInv.copy(camera.projectionMatrix).invert();
    this._viewMatrixInv.copy(camera.matrixWorld);
    this.material.uniforms.uProjectionMatrixInv.value =
      this._projectionMatrixInv;
    this.material.uniforms.uViewMatrixInv.value = this._viewMatrixInv;
  }
}