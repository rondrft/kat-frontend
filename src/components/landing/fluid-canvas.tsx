"use client";

import { useEffect, useRef } from "react";

const SIM_RES         = 128;
const DYE_RES         = 256;
const PRESSURE_ITER   = 20;
const VEL_DISSIPATION = 0.95;
const DYE_DISSIPATION = 0.986;
const CURL_AMOUNT     = 15;
const SPLAT_RADIUS    = 0.0018;
const SPLAT_FORCE     = 3.5;
const MAX_VEL         = 2.5;
const DYE_TARGET_LEN  = 0.08;

function normalizedColor(r: number, g: number, b: number): [number, number, number] {
  const len = Math.sqrt(r * r + g * g + b * b);
  const s   = DYE_TARGET_LEN / (len || 1);
  return [r * s, g * s, b * s];
}

const COLORS_LIGHT: [number, number, number][] = [
  normalizedColor(0.839, 1.000, 0.000),
  normalizedColor(0.918, 1.000, 0.541),
  normalizedColor(0.969, 1.000, 0.839),
];
const COLORS_DARK: [number, number, number][] = [
  normalizedColor(0.839, 1.000, 0.000),
  normalizedColor(0.900, 1.000, 0.200),
  normalizedColor(0.700, 0.880, 0.100),
];

// ── Shaders ────────────────────────────────────────────────────────────────

const VERT = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const SPLAT_FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uTarget;
uniform float uAspect;
uniform vec2 uPoint;
uniform vec3 uColor;
uniform float uRadius;
out vec4 o;
void main() {
  vec2 p = vUv - uPoint;
  p.x *= uAspect;
  float d = exp(-dot(p, p) / uRadius);
  o = vec4(texture(uTarget, vUv).rgb + uColor * d, 1.0);
}`;

const ADVECT_FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform float uDt;
uniform float uDissipation;
out vec4 o;
void main() {
  vec2 vel = texture(uVelocity, vUv).xy;
  vec2 pos = clamp(vUv - uDt * vel, 0.001, 0.999);
  o = uDissipation * texture(uSource, pos);
}`;

const CURL_FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uVelocity;
uniform vec2 uTs;
out vec4 o;
void main() {
  float L = texture(uVelocity, vUv - vec2(uTs.x, 0.0)).y;
  float R = texture(uVelocity, vUv + vec2(uTs.x, 0.0)).y;
  float T = texture(uVelocity, vUv + vec2(0.0, uTs.y)).x;
  float B = texture(uVelocity, vUv - vec2(0.0, uTs.y)).x;
  o = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);
}`;

const VORTICITY_FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uVelocity;
uniform sampler2D uCurlTex;
uniform vec2 uTs;
uniform float uCurlStr;
uniform float uDt;
out vec4 o;
void main() {
  float L = texture(uCurlTex, vUv - vec2(uTs.x, 0.0)).x;
  float R = texture(uCurlTex, vUv + vec2(uTs.x, 0.0)).x;
  float T = texture(uCurlTex, vUv + vec2(0.0, uTs.y)).x;
  float B = texture(uCurlTex, vUv - vec2(0.0, uTs.y)).x;
  float C = texture(uCurlTex, vUv).x;
  vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  force /= length(force) + 0.0001;
  force *= uCurlStr * C;
  force.y *= -1.0;
  vec2 vel = texture(uVelocity, vUv).xy;
  o = vec4(vel + force * uDt, 0.0, 1.0);
}`;

const DIVERGENCE_FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uVelocity;
uniform vec2 uTs;
out vec4 o;
void main() {
  float L = texture(uVelocity, vUv - vec2(uTs.x, 0.0)).x;
  float R = texture(uVelocity, vUv + vec2(uTs.x, 0.0)).x;
  float T = texture(uVelocity, vUv + vec2(0.0, uTs.y)).y;
  float B = texture(uVelocity, vUv - vec2(0.0, uTs.y)).y;
  o = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
}`;

const PRESSURE_FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
uniform vec2 uTs;
out vec4 o;
void main() {
  float L = texture(uPressure, vUv - vec2(uTs.x, 0.0)).x;
  float R = texture(uPressure, vUv + vec2(uTs.x, 0.0)).x;
  float T = texture(uPressure, vUv + vec2(0.0, uTs.y)).x;
  float B = texture(uPressure, vUv - vec2(0.0, uTs.y)).x;
  float div = texture(uDivergence, vUv).x;
  o = vec4((L + R + T + B - div) * 0.25, 0.0, 0.0, 1.0);
}`;

const GRADIENT_FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uPressure;
uniform sampler2D uVelocity;
uniform vec2 uTs;
out vec4 o;
void main() {
  float L = texture(uPressure, vUv - vec2(uTs.x, 0.0)).x;
  float R = texture(uPressure, vUv + vec2(uTs.x, 0.0)).x;
  float T = texture(uPressure, vUv + vec2(0.0, uTs.y)).x;
  float B = texture(uPressure, vUv - vec2(0.0, uTs.y)).x;
  vec2 vel = texture(uVelocity, vUv).xy;
  o = vec4(vel - 0.5 * vec2(R - L, T - B), 0.0, 1.0);
}`;

const DISPLAY_FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uDensity;
uniform float uAlphaMax;
out vec4 o;
void main() {
  vec3 col = max(texture(uDensity, vUv).rgb, vec3(0.0));
  float a = clamp(length(col) * 3.0, 0.0, uAlphaMax);
  o = vec4(col, a);
}`;

// ── Types ──────────────────────────────────────────────────────────────────

type FBO = { tex: WebGLTexture; fbo: WebGLFramebuffer; w: number; h: number };

type DoubleFBO = {
  read:  FBO;
  write: FBO;
  swap(): void;
};

type Prog = {
  prog: WebGLProgram;
  u:    Record<string, WebGLUniformLocation | null | undefined>;
};

// ── FluidSim ───────────────────────────────────────────────────────────────

class FluidSim {
  private gl:     WebGL2RenderingContext;
  private filter: number;
  private vao!:   WebGLVertexArrayObject;
  private buf!:   WebGLBuffer;

  private pSplat!:      Prog;
  private pAdvect!:     Prog;
  private pCurl!:       Prog;
  private pVorticity!:  Prog;
  private pDivergence!: Prog;
  private pPressure!:   Prog;
  private pGradient!:   Prog;
  private pDisplay!:    Prog;

  private velocity!:    DoubleFBO;
  private density!:     DoubleFBO;
  private curlFBO!:     FBO;
  private divFBO!:      FBO;
  private pressureFBO!: DoubleFBO;

  private raf          = 0;
  private running      = false;
  private lastT        = 0;
  private canvasAspect = 1.0;
  private colorIdx     = 0;

  private mouse:     { x: number; y: number } | null = null;
  private lastMouse: { x: number; y: number } | null = null;

  isDark: boolean;

  private _onMove!:       (e: MouseEvent) => void;
  private _onLeave!:      () => void;
  private _onVisibility!: () => void;

  constructor(private canvas: HTMLCanvasElement, isDark: boolean) {
    this.isDark = isDark;

    const gl = canvas.getContext("webgl2", {
      alpha:             true,
      premultipliedAlpha:false,
      antialias:         false,
      depth:             false,
      stencil:           false,
    }) as WebGL2RenderingContext;
    this.gl = gl;

    gl.getExtension("EXT_color_buffer_half_float");
    gl.getExtension("EXT_color_buffer_float");
    this.filter = gl.getExtension("OES_texture_float_linear") ? gl.LINEAR : gl.NEAREST;

    this.buildPrograms();
    this.buildQuad();
    this.initFBOs();
    this.bindEvents();
  }

  // Null-safe uniform location lookup (noUncheckedIndexedAccess compat)
  private ul(p: Prog, k: string): WebGLUniformLocation | null {
    return p.u[k] ?? null;
  }

  private buildPrograms() {
    const mk = (fs: string, names: string[]): Prog => {
      const gl   = this.gl;
      const prog = gl.createProgram()!;
      const vs   = gl.createShader(gl.VERTEX_SHADER)!;
      gl.shaderSource(vs, VERT);
      gl.compileShader(vs);
      gl.attachShader(prog, vs);
      const fsh = gl.createShader(gl.FRAGMENT_SHADER)!;
      gl.shaderSource(fsh, fs);
      gl.compileShader(fsh);
      gl.attachShader(prog, fsh);
      gl.bindAttribLocation(prog, 0, "aPos");
      gl.linkProgram(prog);
      const u: Record<string, WebGLUniformLocation | null | undefined> = {};
      for (const n of names) u[n] = gl.getUniformLocation(prog, n);
      return { prog, u };
    };

    this.pSplat      = mk(SPLAT_FRAG,      ["uTarget","uAspect","uPoint","uColor","uRadius"]);
    this.pAdvect     = mk(ADVECT_FRAG,     ["uVelocity","uSource","uDt","uDissipation"]);
    this.pCurl       = mk(CURL_FRAG,       ["uVelocity","uTs"]);
    this.pVorticity  = mk(VORTICITY_FRAG,  ["uVelocity","uCurlTex","uTs","uCurlStr","uDt"]);
    this.pDivergence = mk(DIVERGENCE_FRAG, ["uVelocity","uTs"]);
    this.pPressure   = mk(PRESSURE_FRAG,   ["uPressure","uDivergence","uTs"]);
    this.pGradient   = mk(GRADIENT_FRAG,   ["uPressure","uVelocity","uTs"]);
    this.pDisplay    = mk(DISPLAY_FRAG,    ["uDensity", "uAlphaMax"]);
  }

  private buildQuad() {
    const gl  = this.gl;
    this.buf  = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    this.vao = gl.createVertexArray()!;
    gl.bindVertexArray(this.vao);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  }

  private mkFBO(w: number, h: number): FBO {
    const gl  = this.gl;
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this.filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, this.filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
    const fbo = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.viewport(0, 0, w, h);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    return { tex, fbo, w, h };
  }

  private mkDouble(w: number, h: number): DoubleFBO {
    const a = this.mkFBO(w, h);
    const b = this.mkFBO(w, h);
    return {
      read: a, write: b,
      swap() { const t = this.read; this.read = this.write; this.write = t; },
    };
  }

  private initFBOs() {
    this.velocity    = this.mkDouble(SIM_RES, SIM_RES);
    this.density     = this.mkDouble(DYE_RES, DYE_RES);
    this.curlFBO     = this.mkFBO(SIM_RES, SIM_RES);
    this.divFBO      = this.mkFBO(SIM_RES, SIM_RES);
    this.pressureFBO = this.mkDouble(SIM_RES, SIM_RES);
  }

  private deleteFBOs() {
    const gl  = this.gl;
    const del = (f: FBO) => { gl.deleteTexture(f.tex); gl.deleteFramebuffer(f.fbo); };
    del(this.velocity.read);    del(this.velocity.write);
    del(this.density.read);     del(this.density.write);
    del(this.curlFBO);
    del(this.divFBO);
    del(this.pressureFBO.read); del(this.pressureFBO.write);
  }

  private bindEvents() {
    const onMove = (e: MouseEvent) => {
      const parent = this.canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      if (e.clientX < rect.left || e.clientX > rect.right ||
          e.clientY < rect.top  || e.clientY > rect.bottom) {
        this.mouse = null;
        return;
      }
      this.mouse = {
        x: (e.clientX - rect.left) / rect.width,
        y: 1.0 - (e.clientY - rect.top) / rect.height,
      };
    };
    const onLeave      = () => { this.mouse = null; };
    const onVisibility = () => {
      if (document.hidden) {
        this.pause();
      } else {
        this.lastT = performance.now();
        this.start();
      }
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);
    this._onMove       = onMove;
    this._onLeave      = onLeave;
    this._onVisibility = onVisibility;
  }

  resize(w: number, h: number) {
    const dpr        = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width  = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.canvasAspect  = w / Math.max(h, 1);
  }

  setTheme(isDark: boolean) {
    this.isDark = isDark;
    this.clearDye();
  }

  private clearDye() {
    const gl = this.gl;
    for (const fbo of [this.density.read, this.density.write]) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo.fbo);
      gl.viewport(0, 0, fbo.w, fbo.h);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  private tex(unit: number, f: FBO): number {
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, f.tex);
    return unit;
  }

  private draw(target: FBO | null) {
    const gl = this.gl;
    if (target) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
      gl.viewport(0, 0, target.w, target.h);
    } else {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
    gl.bindVertexArray(this.vao);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  private splatPoint(x: number, y: number, vx: number, vy: number, color: [number, number, number]) {
    const gl = this.gl;
    const p  = this.pSplat;
    gl.useProgram(p.prog);

    gl.uniform1i(this.ul(p, "uTarget"), this.tex(0, this.velocity.read));
    gl.uniform1f(this.ul(p, "uAspect"), this.canvasAspect);
    gl.uniform2f(this.ul(p, "uPoint"),  x, y);
    gl.uniform3f(this.ul(p, "uColor"),  vx, vy, 0);
    gl.uniform1f(this.ul(p, "uRadius"), SPLAT_RADIUS);
    this.draw(this.velocity.write);
    this.velocity.swap();

    gl.uniform1i(this.ul(p, "uTarget"), this.tex(0, this.density.read));
    gl.uniform1f(this.ul(p, "uAspect"), this.canvasAspect);
    gl.uniform2f(this.ul(p, "uPoint"),  x, y);
    gl.uniform3fv(this.ul(p, "uColor"), color);
    gl.uniform1f(this.ul(p, "uRadius"), SPLAT_RADIUS * 2.0);
    this.draw(this.density.write);
    this.density.swap();
  }

  private step(dt: number) {
    const gl  = this.gl;
    const sTs = [1 / SIM_RES, 1 / SIM_RES] as const;

    if (this.mouse) {
      if (this.lastMouse) {
        const dx  = this.mouse.x - this.lastMouse.x;
        const dy  = this.mouse.y - this.lastMouse.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len > 0.0003) {
          let vx  = (dx / dt) * SPLAT_FORCE;
          let vy  = (dy / dt) * SPLAT_FORCE;
          const spd = Math.sqrt(vx * vx + vy * vy);
          if (spd > MAX_VEL) { const s = MAX_VEL / spd; vx *= s; vy *= s; }
          const palette = this.isDark ? COLORS_DARK : COLORS_LIGHT;
          this.splatPoint(this.mouse.x, this.mouse.y, vx, vy, palette[this.colorIdx % palette.length]!);
          this.colorIdx++;
        }
      }
      this.lastMouse = { ...this.mouse };
    } else {
      this.lastMouse = null;
    }

    // Advect velocity
    {
      const p = this.pAdvect;
      gl.useProgram(p.prog);
      gl.uniform1i(this.ul(p, "uVelocity"), this.tex(0, this.velocity.read));
      gl.uniform1i(this.ul(p, "uSource"),   this.tex(1, this.velocity.read));
      gl.uniform1f(this.ul(p, "uDt"),            dt);
      gl.uniform1f(this.ul(p, "uDissipation"),   VEL_DISSIPATION);
      this.draw(this.velocity.write);
      this.velocity.swap();
    }

    // Curl
    {
      const p = this.pCurl;
      gl.useProgram(p.prog);
      gl.uniform1i(this.ul(p, "uVelocity"), this.tex(0, this.velocity.read));
      gl.uniform2f(this.ul(p, "uTs"), ...sTs);
      this.draw(this.curlFBO);
    }

    // Vorticity confinement
    {
      const p = this.pVorticity;
      gl.useProgram(p.prog);
      gl.uniform1i(this.ul(p, "uVelocity"), this.tex(0, this.velocity.read));
      gl.uniform1i(this.ul(p, "uCurlTex"),  this.tex(1, this.curlFBO));
      gl.uniform2f(this.ul(p, "uTs"),        ...sTs);
      gl.uniform1f(this.ul(p, "uCurlStr"),   CURL_AMOUNT);
      gl.uniform1f(this.ul(p, "uDt"),        dt);
      this.draw(this.velocity.write);
      this.velocity.swap();
    }

    // Divergence
    {
      const p = this.pDivergence;
      gl.useProgram(p.prog);
      gl.uniform1i(this.ul(p, "uVelocity"), this.tex(0, this.velocity.read));
      gl.uniform2f(this.ul(p, "uTs"), ...sTs);
      this.draw(this.divFBO);
    }

    // Clear pressure
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.pressureFBO.read.fbo);
    gl.viewport(0, 0, SIM_RES, SIM_RES);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Jacobi pressure
    {
      const p = this.pPressure;
      gl.useProgram(p.prog);
      gl.uniform1i(this.ul(p, "uDivergence"), this.tex(1, this.divFBO));
      gl.uniform2f(this.ul(p, "uTs"), ...sTs);
      for (let i = 0; i < PRESSURE_ITER; i++) {
        gl.uniform1i(this.ul(p, "uPressure"), this.tex(0, this.pressureFBO.read));
        this.draw(this.pressureFBO.write);
        this.pressureFBO.swap();
      }
    }

    // Gradient subtraction
    {
      const p = this.pGradient;
      gl.useProgram(p.prog);
      gl.uniform1i(this.ul(p, "uPressure"), this.tex(0, this.pressureFBO.read));
      gl.uniform1i(this.ul(p, "uVelocity"), this.tex(1, this.velocity.read));
      gl.uniform2f(this.ul(p, "uTs"), ...sTs);
      this.draw(this.velocity.write);
      this.velocity.swap();
    }

    // Advect density
    {
      const p = this.pAdvect;
      gl.useProgram(p.prog);
      gl.uniform1i(this.ul(p, "uVelocity"), this.tex(0, this.velocity.read));
      gl.uniform1i(this.ul(p, "uSource"),   this.tex(1, this.density.read));
      gl.uniform1f(this.ul(p, "uDt"),           dt);
      gl.uniform1f(this.ul(p, "uDissipation"),  DYE_DISSIPATION);
      this.draw(this.density.write);
      this.density.swap();
    }

    // Display
    {
      const p = this.pDisplay;
      gl.useProgram(p.prog);
      gl.uniform1i(this.ul(p, "uDensity"), this.tex(0, this.density.read));
      gl.uniform1f(this.ul(p, "uAlphaMax"), this.isDark ? 0.62 : 0.45);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.bindVertexArray(this.vao);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.disable(gl.BLEND);
    }
  }

  start() {
    if (this.running) return;
    this.running = true;
    const loop  = (t: number) => {
      if (!this.running) return;
      this.raf   = requestAnimationFrame(loop);
      const dt   = Math.min((t - this.lastT) / 1000, 0.033);
      this.lastT = t;
      if (dt > 0 && this.canvas.width > 0 && this.canvas.height > 0) this.step(dt);
    };
    this.raf = requestAnimationFrame((t) => {
      this.lastT = t;
      this.raf   = requestAnimationFrame(loop);
    });
  }

  pause() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  destroy() {
    this.pause();
    window.removeEventListener("mousemove",    this._onMove);
    window.removeEventListener("mouseleave",   this._onLeave);
    document.removeEventListener("visibilitychange", this._onVisibility);
    this.deleteFBOs();
    const gl = this.gl;
    gl.deleteBuffer(this.buf);
    gl.deleteVertexArray(this.vao);
    for (const p of [
      this.pSplat, this.pAdvect, this.pCurl, this.pVorticity,
      this.pDivergence, this.pPressure, this.pGradient, this.pDisplay,
    ]) gl.deleteProgram(p.prog);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  }
}

// ── React component ────────────────────────────────────────────────────────

export function FluidCanvas({ isDark }: { isDark: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simRef    = useRef<FluidSim | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas?.parentElement) return;
    const parent = canvas.parentElement;

    const sim = new FluidSim(canvas, isDark);
    simRef.current = sim;

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) sim.resize(width, height);
    });
    ro.observe(parent);

    // Pause the simulation when the hero card scrolls out of view.
    // Saves ~26 GPU draw calls/frame while the user is past the hero section.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          sim.start();
        } else {
          sim.pause();
        }
      },
      { threshold: 0 },
    );
    io.observe(parent);

    const { width, height } = parent.getBoundingClientRect();
    if (width > 0) sim.resize(width, height);

    sim.start();

    return () => {
      ro.disconnect();
      io.disconnect();
      sim.destroy();
      simRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    simRef.current?.setTheme(isDark);
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position:      "absolute",
        inset:         0,
        width:         "100%",
        height:        "100%",
        pointerEvents: "none",
        zIndex:        0,
      }}
    />
  );
}
