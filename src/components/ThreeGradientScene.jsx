import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const ThreeGradientScene = forwardRef(function ThreeGradientScene(
  {
    interactive = true,
    parallaxStrength = 0.35,
    noiseOpacity = 0.045,
  },
  ref
) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const scrollRef = useRef({ progress: 0, velocity: 0 });

  // Expose setScroll directly to avoid triggering React re-renders on scroll
  useImperativeHandle(ref, () => ({
    setScroll: (progress, velocity = 0) => {
      scrollRef.current.progress = progress;
      scrollRef.current.velocity = velocity;
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // 1. Three.js Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#d40f00'); // Instant rich base color

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 2. Camera Setup (fov: 35, position: [0, 0, 6])
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
    camera.position.set(0, 0, 6);

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor('#d40f00', 1.0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    // 4. Load Equirectangular Scene Texture
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      '/textures/scene-gradient.webp',
      (tex) => {
        tex.mapping = THREE.EquirectangularReflectionMapping;
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = false;
        scene.background = tex;
        scene.environment = tex;
      },
      undefined,
      (err) => {
        console.warn('Fallback loading gradient texture...', err);
        textureLoader.load('https://guillaumezhu.com/home/hero/textures/desktop/scene-gradient.webp', (tex) => {
          tex.mapping = THREE.EquirectangularReflectionMapping;
          tex.colorSpace = THREE.SRGBColorSpace;
          scene.background = tex;
          scene.environment = tex;
        });
      }
    );

    // 5. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.position.set(3, 5, 4);
    scene.add(dirLight);

    const pinkBackLight = new THREE.DirectionalLight(0xff4477, 0.6);
    pinkBackLight.position.set(-3, -2, -4);
    scene.add(pinkBackLight);

    // 6. Central 3D Logo Group
    const logoGroup = new THREE.Group();
    scene.add(logoGroup);

    const createFallbackLogo = () => {
      const geom = new THREE.TorusKnotGeometry(0.4, 0.12, 128, 32, 2, 3);
      const mat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#ff5577'),
        metalness: 0.95,
        roughness: 0.35,
        clearcoat: 1.0,
        clearcoatRoughness: 0.15,
        reflectivity: 1.0,
      });
      return new THREE.Mesh(geom, mat);
    };

    let fallbackLogo = createFallbackLogo();
    logoGroup.add(fallbackLogo);

    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
      '/models/logo.glb',
      (gltf) => {
        const model = gltf.scene;
        model.traverse((child) => {
          if (child.isMesh) {
            child.material = new THREE.MeshPhysicalMaterial({
              color: new THREE.Color('#ffffff'),
              metalness: 0.95,
              roughness: 0.35,
              clearcoat: 0.8,
              clearcoatRoughness: 0.2,
              reflectivity: 1.0,
            });
          }
        });

        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 1.0 / (maxDim || 1);
        model.scale.setScalar(scale);

        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center.multiplyScalar(scale));

        if (fallbackLogo) {
          logoGroup.remove(fallbackLogo);
          fallbackLogo.geometry.dispose();
          fallbackLogo.material.dispose();
          fallbackLogo = null;
        }

        logoGroup.add(model);
      },
      undefined,
      (err) => {
        console.warn('GLTF load fallback:', err);
      }
    );

    // 7. Typography in 3D Space
    const createTextPlane = (texturePath, w, h, posX, posY, posZ, rotY) => {
      const tex = textureLoader.load(texturePath);
      tex.colorSpace = THREE.SRGBColorSpace;
      const geom = new THREE.PlaneGeometry(w, h);
      const mat = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(posX, posY, posZ);
      mesh.rotation.y = rotY;
      scene.add(mesh);
      return mesh;
    };

    // Text 1: "guillaume zhu" (Initial view facing Z)
    const textNameMesh = createTextPlane(
      '/textures/texts/text-name.webp',
      11.0,
      2.8,
      0,
      0,
      -2.5,
      0
    );

    // Text 2: "art director" (Orbit view facing -X)
    const textArtDirectorMesh = createTextPlane(
      '/textures/texts/text-art-director.webp',
      5.5 * 0.85,
      1.4 * 0.85,
      1.0,
      5.25,
      -1.75,
      -Math.PI * 0.5
    );
    textArtDirectorMesh.material.opacity = 0;

    // Text 3: "creative developer" (Orbit view facing -X)
    const textCreativeDevMesh = createTextPlane(
      '/textures/texts/text-creative-developer.webp',
      5.5 * 0.65,
      1.4 * 0.65,
      -1.0,
      6.5,
      1.25,
      -Math.PI * 0.5
    );
    textCreativeDevMesh.material.opacity = 0;

    // 8. Mouse & Parallax State
    const mouseState = {
      targetX: 0,
      targetY: 0,
      currentX: 0,
      currentY: 0,
    };

    const handleMouseMove = (e) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseState.targetX = x * parallaxStrength;
      mouseState.targetY = y * parallaxStrength;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 9. Resize Handling
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      const dist = camera.position.distanceTo(textNameMesh.position);
      const fovRad = THREE.MathUtils.degToRad(camera.fov);
      const visibleHeight = 2 * dist * Math.tan(fovRad * 0.5);
      const visibleWidth = visibleHeight * camera.aspect;
      const targetScale = Math.min(1, (visibleWidth * 0.85) / 11.0);
      textNameMesh.scale.setScalar(targetScale);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    window.addEventListener('resize', handleResize);
    handleResize();

    // 10. Animation & Render Loop
    let animId = null;
    let lastTime = performance.now();

    const renderLoop = (time) => {
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Mouse lerp
      mouseState.currentX += (mouseState.targetX - mouseState.currentX) * 0.08;
      mouseState.currentY += (mouseState.targetY - mouseState.currentY) * 0.08;

      const p = THREE.MathUtils.clamp(scrollRef.current.progress, 0, 1);
      const vel = Math.abs(scrollRef.current.velocity);

      // Camera Orbit & Rise calculation
      const targetHeight = p * 6.0;
      const targetAngle = -p * (Math.PI * 0.5); // 90 degree camera rotation around center

      const baseCamX = Math.sin(targetAngle) * 6.0;
      const baseCamZ = Math.cos(targetAngle) * 6.0;

      // Apply mouse parallax relative to camera orientation
      const perpAngle = targetAngle + Math.PI * 0.5;
      camera.position.x = baseCamX + Math.cos(perpAngle) * mouseState.currentX * 0.6;
      camera.position.z = baseCamZ + Math.sin(perpAngle) * mouseState.currentX * 0.6;
      camera.position.y = targetHeight + mouseState.currentY * 0.4;
      camera.lookAt(0, targetHeight, 0);

      // 3D Logo floats with height and spins continuously on tilted axis
      logoGroup.position.y = targetHeight;
      const spinSpeed = 0.25 + THREE.MathUtils.clamp(vel * 0.002, 0, 1.5);
      logoGroup.rotateOnAxis(new THREE.Vector3(0.2, 1.0, 0.1).normalize(), delta * spinSpeed);

      // 1. Text: "guillaume zhu" translates down and fades out between 0.15 and 0.45
      const nameOpacity = 1.0 - THREE.MathUtils.smoothstep(p, 0.15, 0.45);
      textNameMesh.material.opacity = nameOpacity;
      textNameMesh.position.y = -p * 2.8;

      // 2. Texts: "art director" and "creative developer" emerge between 0.45 and 0.75
      // and remain 100% visible and settled from 0.75 to 1.0
      const emergeOpacity = THREE.MathUtils.smoothstep(p, 0.45, 0.75);
      textArtDirectorMesh.material.opacity = emergeOpacity;
      textCreativeDevMesh.material.opacity = emergeOpacity;

      renderer.render(scene, camera);
      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);

    return () => {
      if (animId) cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      renderer.dispose();
    };
  }, [interactive, parallaxStrength]);

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
});

export default ThreeGradientScene;
