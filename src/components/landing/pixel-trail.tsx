"use client";

import { useRef, useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import * as THREE from "three";

const TrailMaterial = shaderMaterial(
  {
    resolution:  new THREE.Vector2(),
    mouseTrail:  new THREE.Texture(),
    gridSize:    52.0,
    pixelColor:  new THREE.Color("#d6ff00"),
    excludeRect: new THREE.Vector4(0, 0, 0, 0),
  },
  `void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }`,
  `
    uniform vec2      resolution;
    uniform sampler2D mouseTrail;
    uniform float     gridSize;
    uniform vec3      pixelColor;
    uniform vec4      excludeRect; // xy = top-left (DOM 0-1 coords), z = width, w = height

    void main() {
      vec2  uv    = gl_FragCoord.xy / resolution;

      // DOM y=0 is top; gl_FragCoord y=0 is bottom — flip before comparing
      if (excludeRect.z > 0.0) {
        float domY = 1.0 - uv.y;
        if (uv.x  >= excludeRect.x && uv.x  <= excludeRect.x + excludeRect.z &&
            domY  >= excludeRect.y && domY  <= excludeRect.y + excludeRect.w) {
          gl_FragColor = vec4(0.0);
          return;
        }
      }

      float yGrid = gridSize * resolution.y / resolution.x;
      vec2  cell  = (floor(vec2(uv.x * gridSize, uv.y * yGrid)) + 0.5)
                    / vec2(gridSize, yGrid);
      float t     = texture2D(mouseTrail, cell).r;
      gl_FragColor = vec4(pixelColor, t);
    }
  `
);

type ExcludeRect = { x: number; y: number; w: number; h: number };

type SceneProps = {
  gridSize:        number;
  trailSize:       number;
  maxAge:          number;
  interpolate:     number;
  color:           string;
  minMovePx:       number;
  getExcludeRect?: () => ExcludeRect | null;
};

function Scene({ gridSize, trailSize, maxAge, interpolate, color, minMovePx, getExcludeRect }: SceneProps) {
  const { size } = useThree();

  const [trailCanvas, trailCtx, trailTex] = useMemo(() => {
    const canvas  = document.createElement("canvas");
    canvas.width  = canvas.height = 512;
    const ctx     = canvas.getContext("2d")!;
    const tex     = new THREE.CanvasTexture(canvas);
    // flipY=false: canvas-bottom maps to GPU UV.y=1 → matches gl_FragCoord bottom-up convention
    tex.flipY     = false;
    tex.minFilter = THREE.NearestFilter;
    tex.magFilter = THREE.NearestFilter;
    tex.wrapS     = THREE.ClampToEdgeWrapping;
    tex.wrapT     = THREE.ClampToEdgeWrapping;
    return [canvas, ctx, tex] as const;
  }, []);

  const mat        = useMemo(() => new TrailMaterial(), []);
  const newPtsRef  = useRef<Array<{ x: number; y: number }>>([]);
  // Stores the last committed position in both normalised and pixel coords.
  // Only updates when movement exceeds minMovePx, so the threshold comparison
  // is always against the last point that actually produced trail output.
  const lastPosRef = useRef<{ x: number; y: number; px: number; py: number } | null>(null);

  useEffect(() => {
    mat.uniforms.pixelColor!.value.set(color);
  }, [color, mat]);

  useEffect(() => {
    const step = trailSize / Math.max(1, interpolate);

    const onMove = (e: PointerEvent) => {
      const last = lastPosRef.current;

      // Ignore micro-movements — only commit when the cursor has moved enough.
      // We compare against the last *committed* position, not every raw event,
      // so slow continuous dragging never accumulates.
      if (last && Math.hypot(e.clientX - last.px, e.clientY - last.py) < minMovePx) return;

      // y = 1 - clientY/h so that screen-top → y=1, screen-bottom → y=0
      const x = e.clientX / window.innerWidth;
      const y = 1 - e.clientY / window.innerHeight;

      if (last) {
        const dx   = x - last.x;
        const dy   = y - last.y;
        const dist = Math.hypot(dx, dy);
        // If the cursor teleported (mouse left viewport while idle, then re-entered),
        // just repark without drawing a connecting line.
        if (dist <= 0.25) {
          const steps = Math.max(1, Math.ceil(dist / step));
          for (let i = 1; i <= steps; i++) {
            newPtsRef.current.push({
              x: last.x + (dx * i) / steps,
              y: last.y + (dy * i) / steps,
            });
          }
        }
      }

      lastPosRef.current = { x, y, px: e.clientX, py: e.clientY };
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [trailSize, interpolate, minMovePx]);

  useFrame((_, delta) => {
    const { width, height } = trailCanvas;

    // Exponential fade: reaches ~1% brightness after maxAge ms
    const fadeAlpha = 1 - Math.pow(0.01, delta / (maxAge / 1000));
    trailCtx.save();
    trailCtx.globalCompositeOperation = "source-over";
    trailCtx.globalAlpha              = Math.min(1, fadeAlpha);
    trailCtx.fillStyle                = "#000000";
    trailCtx.fillRect(0, 0, width, height);
    trailCtx.restore();

    const r = trailSize * width;
    for (const { x, y } of newPtsRef.current) {
      const px   = x * width;
      const py   = y * height;
      const grad = trailCtx.createRadialGradient(px, py, 0, px, py, r);
      grad.addColorStop(0, "rgba(255,255,255,1)");
      grad.addColorStop(1, "rgba(255,255,255,0)");
      trailCtx.save();
      trailCtx.globalCompositeOperation = "screen";
      trailCtx.fillStyle                = grad;
      trailCtx.beginPath();
      trailCtx.arc(px, py, r, 0, Math.PI * 2);
      trailCtx.fill();
      trailCtx.restore();
    }
    newPtsRef.current = [];

    const excl = getExcludeRect?.() ?? null;
    mat.uniforms.excludeRect!.value.set(
      excl?.x ?? 0, excl?.y ?? 0, excl?.w ?? 0, excl?.h ?? 0,
    );

    trailTex.needsUpdate                  = true;
    mat.uniforms.mouseTrail!.value        = trailTex;
    mat.uniforms.gridSize!.value          = gridSize;
    mat.uniforms.resolution!.value.set(size.width, size.height);
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
}

const FILTER_ID = "pixel-trail-goo";

export type PixelTrailProps = {
  gridSize?:        number;
  trailSize?:       number;
  maxAge?:          number;
  interpolate?:     number;
  color?:           string;
  opacity?:         number;
  gooeyEnabled?:    boolean;
  gooStrength?:     number;
  minMovePx?:       number;
  getExcludeRect?:  () => ExcludeRect | null;
};

export function PixelTrail({
  gridSize        = 52,
  trailSize       = 0.1,
  maxAge          = 250,
  interpolate     = 5,
  color           = "#d6ff00",
  opacity         = 1,
  gooeyEnabled    = true,
  gooStrength     = 2,
  minMovePx       = 8,
  getExcludeRect,
}: PixelTrailProps) {
  return (
    <>
      {gooeyEnabled && (
        // Hidden SVG defines the filter — width:0/height:0 takes no space
        <svg
          aria-hidden
          style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
        >
          <defs>
            <filter id={FILTER_ID}>
              <feGaussianBlur in="SourceGraphic" stdDeviation={gooStrength} result="blur" />
              <feColorMatrix
                in="blur"
                type="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
                result="goo"
              />
              {/* Restore original (non-blurred) colors within the goo shape */}
              <feComposite in="SourceGraphic" in2="goo" operator="atop" />
            </filter>
          </defs>
        </svg>
      )}
      <Canvas
        gl={{ antialias: false, powerPreference: "high-performance", alpha: true }}
        // Without this the WebGL clear color defaults to opaque black, painting over backgrounds
        onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0, 0, 0), 0)}
        style={{
          position:      "fixed",
          inset:         0,
          width:         "100vw",
          height:        "100vh",
          opacity,
          zIndex:        1,
          pointerEvents: "none",
          filter:        gooeyEnabled ? `url(#${FILTER_ID})` : undefined,
        }}
      >
        <Scene
          gridSize={gridSize}
          trailSize={trailSize}
          maxAge={maxAge}
          interpolate={interpolate}
          color={color}
          minMovePx={minMovePx}
          getExcludeRect={getExcludeRect}
        />
      </Canvas>
    </>
  );
}
