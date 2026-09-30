import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
  uniform float u_speed;
  uniform float u_noise_scale;
  uniform float u_flow;
  uniform vec3 u_color_red;
  uniform vec3 u_color_crimson;
  uniform vec3 u_color_magenta;
  uniform vec3 u_color_purple;
  uniform vec3 u_color_rose;
  uniform vec3 u_color_warm;

  varying vec2 vUv;

  // Simplex Noise 2D / 3D implementation
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                        0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                       -0.577350269189626,  // -1.0 + 2.0 * C.x
                        0.024390243902439); // 1.0 / 41.0
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
      + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  // Fractal Brownian Motion
  float fbm(vec2 p) {
    float total = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 4; i++) {
      total += snoise(p) * amplitude;
      p *= 2.02;
      amplitude *= 0.5;
    }
    return total;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    float aspect = u_resolution.x / u_resolution.y;
    vec2 p = uv;
    p.x *= aspect;

    float t = u_time * u_speed * 0.15;
    vec2 mouseOffset = (u_mouse - 0.5) * 0.2;

    // Organic Domain Warping for fluid gradient motion
    vec2 q = vec2(0.0);
    q.x = fbm(p * u_noise_scale + vec2(0.0, t) + mouseOffset);
    q.y = fbm(p * u_noise_scale + vec2(t * 0.5, 0.0) - mouseOffset);

    vec2 r = vec2(0.0);
    r.x = fbm(p * u_noise_scale + 4.0 * q + vec2(1.7, 9.2) + 0.15 * t);
    r.y = fbm(p * u_noise_scale + 4.0 * q + vec2(8.3, 2.8) + 0.126 * t);

    float f = fbm(p * u_noise_scale + 4.0 * r + t * 0.05);

    // Coordinate-based color fields matching the screenshot composition:
    // Left & Bottom-Left: Intense Red / Crimson
    // Top-Right: Magenta & Purple glow
    // Bottom-Right: Soft Rose & Peach warmth
    
    // Base gradient direction (Top-left to Bottom-right & Left to Right)
    float diagonal = uv.x * 0.8 + (1.0 - uv.y) * 0.5;
    diagonal += (f - 0.5) * u_flow;
    
    // Top Right mask for Magenta / Violet bloom
    float trDist = distance(uv, vec2(1.0, 1.0));
    float magentaFactor = smoothstep(1.2, 0.2, trDist) + r.x * 0.3;
    magentaFactor = clamp(magentaFactor, 0.0, 1.0);

    // Bottom Right mask for soft warm coral/lilac
    float brDist = distance(uv, vec2(0.95, 0.1));
    float roseFactor = smoothstep(1.0, 0.1, brDist) + r.y * 0.25;
    roseFactor = clamp(roseFactor, 0.0, 1.0);

    // Left Red Core
    float leftRed = smoothstep(1.1, 0.0, uv.x) + (1.0 - uv.y) * 0.3;

    // Blend Colors
    vec3 col = mix(u_color_red, u_color_crimson, clamp(q.x * 0.8 + 0.2, 0.0, 1.0));
    col = mix(col, u_color_magenta, magentaFactor * 0.85);
    col = mix(col, u_color_purple, smoothstep(0.7, 1.1, uv.x + uv.y) * 0.45);
    col = mix(col, u_color_rose, roseFactor * 0.65);
    col = mix(col, u_color_warm, smoothstep(0.4, 0.9, r.y) * 0.2);

    // Luminous inner glow
    float glow = smoothstep(0.8, 0.0, length(uv - vec2(0.35, 0.55)));
    col += u_color_red * glow * 0.18;

    // Subtle grain dither in shader
    float dither = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
    col += (dither - 0.5) * 0.015;

    gl_FragColor = vec4(col, 1.0);
  }
`;

export default function ShaderGradientScene({
  speed = 0.8,
  noiseScale = 1.6,
  flowIntensity = 0.5,
  noiseOpacity = 0.04,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animIdRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    renderer.setSize(width, height, false);

    // Exact color palette sampled directly from Guillaume Zhu's portfolio screenshot
    const uniforms = {
      u_time: { value: 0 },
      u_resolution: { value: new THREE.Vector2(width, height) },
      u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
      u_speed: { value: speed },
      u_noise_scale: { value: noiseScale },
      u_flow: { value: flowIntensity },
      u_color_red: { value: new THREE.Color('#FF1400') },        // Vibrant Primary Red
      u_color_crimson: { value: new THREE.Color('#DE0E00') },    // Deep Crimson Body
      u_color_magenta: { value: new THREE.Color('#CE257A') },    // Luminous Magenta Glow
      u_color_purple: { value: new THREE.Color('#941673') },     // Top-right Violet
      u_color_rose: { value: new THREE.Color('#E34978') },       // Soft Lilac / Pink Haze
      u_color_warm: { value: new THREE.Color('#FF4063') },       // Coral Ambient Glow
    };

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      depthTest: false,
      depthWrite: false,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Resize handler
    const handleResize = () => {
      if (!container || !renderer) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      renderer.setSize(w, h, false);
      uniforms.u_resolution.value.set(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    window.addEventListener('resize', handleResize);

    // Mouse tracking
    let targetMouse = { x: 0.5, y: 0.5 };
    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      targetMouse.x = (e.clientX - rect.left) / rect.width;
      targetMouse.y = 1.0 - (e.clientY - rect.top) / rect.height;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Animation Loop
    let startTime = performance.now();
    const render = (now) => {
      const elapsed = (now - startTime) * 0.001;
      uniforms.u_time.value = elapsed;

      // Smooth mouse lerp
      uniforms.u_mouse.value.x += (targetMouse.x - uniforms.u_mouse.value.x) * 0.05;
      uniforms.u_mouse.value.y += (targetMouse.y - uniforms.u_mouse.value.y) * 0.05;

      renderer.render(scene, camera);
      animIdRef.current = requestAnimationFrame(render);
    };

    animIdRef.current = requestAnimationFrame(render);

    return () => {
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [speed, noiseScale, flowIntensity]);

  return (
    <div ref={containerRef} className="scene-container">
      <canvas ref={canvasRef} className="webgl-canvas" />
      {noiseOpacity > 0 && (
        <div
          className="noise-layer"
          style={{ opacity: noiseOpacity }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
