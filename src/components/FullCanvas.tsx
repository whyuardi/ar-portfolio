"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

// Chromatic aberration shader for premium feel
const ChromaticAberrationShader = {
  uniforms: {
    tDiffuse: { value: null },
    amount: { value: 0.002 },
  },
  vertexShader: `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float amount;
    varying vec2 vUv;
    void main(){
      vec2 offset=amount*(vUv-0.5);
      float r=texture2D(tDiffuse,vUv+offset).r;
      float g=texture2D(tDiffuse,vUv).g;
      float b=texture2D(tDiffuse,vUv-offset).b;
      gl_FragColor=vec4(r,g,b,1.0);
    }
  `,
};

export default function FullCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ─── SCENE ───
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a0f, 0.015);

    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      200
    );
    camera.position.set(0, 0, 22);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    container.appendChild(renderer.domElement);

    // ─── POST-PROCESSING ───
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const bloom = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.9,  // strength — more glow
      0.5,  // radius
      0.7   // threshold — lower = more things bloom
    );
    composer.addPass(bloom);

    const chroma = new ShaderPass(ChromaticAberrationShader);
    composer.addPass(chroma);

    // ─── ENVIRONMENT MAP (fake reflection) ───
    const envScene = new THREE.Scene();
    const envGeo = new THREE.SphereGeometry(50, 32, 32);
    const envMat = new THREE.MeshBasicMaterial({
      side: THREE.BackSide,
      color: 0x111122,
    });
    envScene.add(new THREE.Mesh(envGeo, envMat));
    const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256);
    const cubeCamera = new THREE.CubeCamera(1, 100, cubeRenderTarget);
    cubeCamera.position.set(0, 0, 0);

    // ─── MAIN: GLASS ICOSAHEDRON ───
    const mainGeo = new THREE.IcosahedronGeometry(2.2, 2);
    const mainMat = new THREE.MeshPhysicalMaterial({
      color: "#14d9c4",
      metalness: 0.1,
      roughness: 0.0,
      transmission: 0.9,
      thickness: 1.5,
      clearcoat: 1.0,
      clearcoatRoughness: 0.0,
      ior: 2.33,
      transparent: true,
      opacity: 0.9,
      emissive: "#14d9c4",
      emissiveIntensity: 0.3,
      envMap: cubeRenderTarget.texture,
      envMapIntensity: 2.0,
      side: THREE.DoubleSide,
    });
    const mainMesh = new THREE.Mesh(mainGeo, mainMat);
    scene.add(mainMesh);

    // ─── WIREFRAME SHELL ───
    const wireGeo = new THREE.IcosahedronGeometry(2.8, 0);
    const wireMat = new THREE.MeshBasicMaterial({
      color: "#14d9c4",
      wireframe: true,
      transparent: true,
      opacity: 0.04,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    scene.add(wireMesh);

    // ─── INNER CORE: glowing sphere ───
    const coreGeo = new THREE.SphereGeometry(0.6, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({
      color: "#14d9c4",
      transparent: true,
      opacity: 0.4,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    scene.add(coreMesh);

    // ─── SECONDARY: DODECAHEDRON ───
    const dodecaGeo = new THREE.DodecahedronGeometry(1.0, 1);
    const dodecaMat = new THREE.MeshPhysicalMaterial({
      color: "#a855f7",
      metalness: 0.15,
      roughness: 0.0,
      transmission: 0.85,
      thickness: 1.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.0,
      ior: 2.0,
      transparent: true,
      opacity: 0.8,
      emissive: "#a855f7",
      emissiveIntensity: 0.25,
      envMap: cubeRenderTarget.texture,
      envMapIntensity: 1.5,
      side: THREE.DoubleSide,
    });
    const dodecaMesh = new THREE.Mesh(dodecaGeo, dodecaMat);
    scene.add(dodecaMesh);

    // Dodeca wireframe
    const dodecaWireGeo = new THREE.DodecahedronGeometry(1.3, 0);
    const dodecaWireMat = new THREE.MeshBasicMaterial({
      color: "#a855f7",
      wireframe: true,
      transparent: true,
      opacity: 0.04,
    });
    const dodecaWire = new THREE.Mesh(dodecaWireGeo, dodecaWireMat);
    scene.add(dodecaWire);

    // ─── FLOATING SHAPES ───
    type Floater = {
      mesh: THREE.Mesh;
      wire: THREE.Mesh;
      basePos: THREE.Vector3;
      orbitRadius: number;
      orbitSpeed: number;
      rotSpeed: THREE.Vector3;
      phase: number;
      color: string;
    };

    const floaters: Floater[] = [];
    const floaterConfigs = [
      { geo: new THREE.OctahedronGeometry(0.4, 0), color: "#f59e0b", pos: [5, 3, -4], radius: 2.5, speed: 0.4 },
      { geo: new THREE.TetrahedronGeometry(0.45, 0), color: "#ef4444", pos: [-6, -1, -3], radius: 2.0, speed: -0.35 },
      { geo: new THREE.IcosahedronGeometry(0.3, 0), color: "#06b6d4", pos: [4, -3, -5], radius: 2.2, speed: 0.3 },
      { geo: new THREE.OctahedronGeometry(0.3, 0), color: "#10b981", pos: [-5, 4, -6], radius: 2.8, speed: -0.25 },
      { geo: new THREE.DodecahedronGeometry(0.35, 0), color: "#ec4899", pos: [7, 0, -7], radius: 1.8, speed: 0.45 },
      { geo: new THREE.TetrahedronGeometry(0.25, 0), color: "#8b5cf6", pos: [-4, -5, -4], radius: 2.0, speed: -0.4 },
      { geo: new THREE.OctahedronGeometry(0.2, 0), color: "#f97316", pos: [1, 6, -8], radius: 3.0, speed: 0.2 },
      { geo: new THREE.IcosahedronGeometry(0.25, 0), color: "#06b6d4", pos: [-7, -3, -9], radius: 2.5, speed: -0.3 },
      { geo: new THREE.TetrahedronGeometry(0.2, 0), color: "#a855f7", pos: [3, -5, -10], radius: 1.5, speed: 0.5 },
      { geo: new THREE.DodecahedronGeometry(0.15, 0), color: "#14d9c4", pos: [-2, 5, -11], radius: 2.0, speed: -0.2 },
    ];

    floaterConfigs.forEach((cfg) => {
      const mat = new THREE.MeshPhysicalMaterial({
        color: cfg.color,
        metalness: 0.1,
        roughness: 0.0,
        transmission: 0.7,
        thickness: 0.5,
        clearcoat: 0.8,
        clearcoatRoughness: 0.0,
        transparent: true,
        opacity: 0.6,
        emissive: cfg.color,
        emissiveIntensity: 0.15,
        envMap: cubeRenderTarget.texture,
        envMapIntensity: 1.0,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(cfg.geo, mat);
      scene.add(mesh);

      const wMat = new THREE.MeshBasicMaterial({
        color: cfg.color,
        wireframe: true,
        transparent: true,
        opacity: 0.04,
      });
      const wMesh = new THREE.Mesh(cfg.geo.clone(), wMat);
      scene.add(wMesh);

      floaters.push({
        mesh,
        wire: wMesh,
        basePos: new THREE.Vector3(...cfg.pos),
        orbitRadius: cfg.radius,
        orbitSpeed: cfg.speed,
        rotSpeed: new THREE.Vector3(
          0.15 + Math.random() * 0.3,
          0.1 + Math.random() * 0.25,
          0.08 + Math.random() * 0.2
        ),
        phase: Math.random() * Math.PI * 2,
        color: cfg.color,
      });
    });

    // ─── ENERGY RINGS (multiple, different sizes) ───
    const rings: { mesh: THREE.Mesh; speed: number; axis: "x" | "y" | "z"; baseRadius: number }[] = [];
    const ringConfigs = [
      { radius: 3.5, tube: 0.015, color: "#14d9c4", speed: 0.35, opacity: 0.2, axis: "x" as const },
      { radius: 4.2, tube: 0.012, color: "#a855f7", speed: -0.25, opacity: 0.14, axis: "y" as const },
      { radius: 3.8, tube: 0.013, color: "#f59e0b", speed: 0.2, opacity: 0.12, axis: "z" as const },
      { radius: 5.0, tube: 0.008, color: "#06b6d4", speed: -0.15, opacity: 0.08, axis: "x" as const },
      { radius: 4.6, tube: 0.009, color: "#ec4899", speed: 0.18, opacity: 0.06, axis: "y" as const },
    ];
    ringConfigs.forEach((cfg) => {
      const geo = new THREE.TorusGeometry(cfg.radius, cfg.tube, 16, 150);
      const mat = new THREE.MeshBasicMaterial({
        color: cfg.color,
        transparent: true,
        opacity: cfg.opacity,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(geo, mat);
      scene.add(mesh);
      rings.push({ mesh, speed: cfg.speed, axis: cfg.axis, baseRadius: cfg.radius });
    });

    // ─── PARTICLES (spiral + flow) ───
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 600 : 1200;
    const pPositions = new Float32Array(particleCount * 3);
    const pColors = new Float32Array(particleCount * 3);
    const pSizes = new Float32Array(particleCount);
    const pVelocities = new Float32Array(particleCount * 3);
    const palette = [
      new THREE.Color("#14d9c4"),
      new THREE.Color("#a855f7"),
      new THREE.Color("#f59e0b"),
      new THREE.Color("#06b6d4"),
      new THREE.Color("#ec4899"),
    ];

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      // Spiral distribution
      const t = i / particleCount;
      const angle = t * Math.PI * 8 + Math.random() * 0.5;
      const radius = 3 + t * 15;
      pPositions[i3] = Math.cos(angle) * radius;
      pPositions[i3 + 1] = (Math.random() - 0.5) * radius * 0.6;
      pPositions[i3 + 2] = Math.sin(angle) * radius - 5;

      const c = palette[Math.floor(Math.random() * palette.length)];
      pColors[i3] = c.r;
      pColors[i3 + 1] = c.g;
      pColors[i3 + 2] = c.b;

      pSizes[i] = 0.04 + Math.random() * 0.08;

      // Initial velocities for flowing effect
      pVelocities[i3] = (Math.random() - 0.5) * 0.01;
      pVelocities[i3 + 1] = (Math.random() - 0.5) * 0.01;
      pVelocities[i3 + 2] = (Math.random() - 0.5) * 0.005;
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPositions, 3));
    pGeo.setAttribute("color", new THREE.BufferAttribute(pColors, 3));

    const pMat = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const particleSystem = new THREE.Points(pGeo, pMat);
    scene.add(particleSystem);

    // ─── LIGHT RAYS (subtle directional) ───
    const lightGeo = new THREE.ConeGeometry(0.02, 20, 4);
    const lightMat = new THREE.MeshBasicMaterial({
      color: "#14d9c4",
      transparent: true,
      opacity: 0.03,
      depthWrite: false,
    });
    const lightRays: THREE.Mesh[] = [];
    for (let i = 0; i < 6; i++) {
      const ray = new THREE.Mesh(lightGeo, lightMat.clone());
      ray.rotation.z = (i / 6) * Math.PI;
      ray.position.set(0, 0, -5);
      scene.add(ray);
      lightRays.push(ray);
    }

    // ─── MOUSE ───
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMouseMove = (e: MouseEvent) => {
      mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.ty = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    // ─── SCROLL ───
    let scrollProgress = 0;
    let scrollTarget = 0;
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      scrollTarget = total > 0 ? window.scrollY / total : 0;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // ─── RESIZE ───
    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    // ─── ANIMATION ───
    const clock = new THREE.Clock();

    function animate() {
      frameRef.current = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Smooth interpolation
      scrollProgress += (scrollTarget - scrollProgress) * 0.04;
      mouse.x += (mouse.tx - mouse.x) * 0.035;
      mouse.y += (mouse.ty - mouse.y) * 0.035;

      // ─── CAMERA ───
      const camZoom = THREE.MathUtils.lerp(22, 14, scrollProgress);
      camera.position.x = mouse.x * 2.5;
      camera.position.y = mouse.y * 1.8 - scrollProgress * 5;
      camera.position.z = camZoom;
      camera.lookAt(0, -scrollProgress * 5, 0);

      // Chromatic aberration increases with scroll
      chroma.uniforms.amount.value = 0.001 + scrollProgress * 0.003;

      // ─── MAIN GLASS ICOSAHEDRON ───
      const mainSpeed = 0.15 + scrollProgress * 0.2;
      mainMesh.rotation.x = t * mainSpeed;
      mainMesh.rotation.y = t * (mainSpeed + 0.12);
      mainMesh.rotation.z = t * 0.08;

      const mainScale = THREE.MathUtils.lerp(1.0, 0.4, scrollProgress);
      mainMesh.scale.setScalar(mainScale);

      mainMesh.position.x = mouse.x * 1.2;
      mainMesh.position.y = mouse.y * 0.8 - scrollProgress * 3;
      mainMesh.position.z = -scrollProgress * 2;

      mainMat.emissiveIntensity = 0.25 + Math.sin(t * 2) * 0.15 + scrollProgress * 0.2;

      // ─── WIREFRAME ───
      wireMesh.rotation.x = -t * (mainSpeed * 0.7);
      wireMesh.rotation.y = t * (mainSpeed * 0.9);
      const wireScale = THREE.MathUtils.lerp(1.0, 0.35, scrollProgress);
      wireMesh.scale.setScalar(wireScale);
      wireMesh.position.copy(mainMesh.position);

      // ─── CORE ───
      coreMesh.rotation.x = t * 0.6;
      coreMesh.rotation.z = t * 0.3;
      const corePulse = 1 + Math.sin(t * 3) * 0.15;
      coreMesh.scale.setScalar(corePulse * mainScale);
      coreMesh.position.copy(mainMesh.position);
      coreMat.opacity = 0.3 + Math.sin(t * 2) * 0.15;

      // ─── DODECAHEDRON: orbit around main ───
      const dodecaAngle = t * 0.4;
      const dodecaOrbit = THREE.MathUtils.lerp(4.0, 2.0, scrollProgress);
      dodecaMesh.position.x = Math.cos(dodecaAngle) * dodecaOrbit + mouse.x * 0.6;
      dodecaMesh.position.y = Math.sin(dodecaAngle * 0.6) * 2.5 + mouse.y * 0.4 - scrollProgress * 2;
      dodecaMesh.position.z = Math.sin(dodecaAngle) * 2.5 - scrollProgress * 4;

      dodecaMesh.rotation.x = t * 0.5;
      dodecaMesh.rotation.y = t * 0.35;

      const dodecaScale = THREE.MathUtils.lerp(1.0, 0.5, scrollProgress);
      dodecaMesh.scale.setScalar(dodecaScale);
      dodecaMat.emissiveIntensity = 0.2 + Math.sin(t * 2.5 + 1) * 0.1;

      dodecaWire.position.copy(dodecaMesh.position);
      dodecaWire.rotation.copy(dodecaMesh.rotation);
      dodecaWire.scale.setScalar(dodecaScale);

      // ─── FLOATERS: scatter + orbit ───
      floaters.forEach((f) => {
        const scatter = 1 + scrollProgress * 3;
        const orbAngle = t * f.orbitSpeed + f.phase;

        f.mesh.position.x = f.basePos.x * scatter + Math.cos(orbAngle) * f.orbitRadius + mouse.x * 0.4;
        f.mesh.position.y = f.basePos.y * scatter + Math.sin(orbAngle * 0.7) * f.orbitRadius * 0.5 + mouse.y * 0.25 - scrollProgress * 4;
        f.mesh.position.z = f.basePos.z + Math.sin(orbAngle) * 2 - scrollProgress * 5;

        f.mesh.rotation.x = t * f.rotSpeed.x;
        f.mesh.rotation.y = t * f.rotSpeed.y;

        f.wire.position.copy(f.mesh.position);
        f.wire.rotation.copy(f.mesh.rotation);

        const mat = f.mesh.material as THREE.MeshPhysicalMaterial;
        mat.opacity = 0.6 * (1 - scrollProgress * 0.7);
      });

      // ─── RINGS: speed + scale with scroll ───
      rings.forEach((r) => {
        const ringSpeed = r.speed * (1 + scrollProgress * 3);
        if (r.axis === "x") r.mesh.rotation.x = t * ringSpeed;
        else if (r.axis === "y") r.mesh.rotation.y = t * ringSpeed;
        else r.mesh.rotation.z = t * ringSpeed;

        const ringScale = THREE.MathUtils.lerp(1.0, 1.8, scrollProgress);
        r.mesh.scale.setScalar(ringScale);
      });

      // ─── PARTICLES: spiral flow ───
      const pPos = pGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        // Spiral drift
        pPos[i3] += pVelocities[i3] + Math.sin(t * 0.5 + i * 0.01) * 0.005;
        pPos[i3 + 1] += pVelocities[i3 + 1] + Math.cos(t * 0.3 + i * 0.01) * 0.003;
        pPos[i3 + 2] += pVelocities[i3 + 2];

        // Wrap particles that drift too far
        const dist = Math.sqrt(pPos[i3] ** 2 + pPos[i3 + 1] ** 2 + pPos[i3 + 2] ** 2);
        if (dist > 30) {
          const angle = Math.random() * Math.PI * 2;
          pPos[i3] = Math.cos(angle) * 3;
          pPos[i3 + 1] = (Math.random() - 0.5) * 4;
          pPos[i3 + 2] = Math.sin(angle) * 3 - 5;
        }
      }
      pGeo.attributes.position.needsUpdate = true;

      particleSystem.rotation.y = t * (0.008 + scrollProgress * 0.02);
      particleSystem.rotation.x = Math.sin(t * 0.08) * 0.03 + scrollProgress * 0.15;

      // ─── LIGHT RAYS ───
      lightRays.forEach((ray, i) => {
        ray.rotation.z = (i / 6) * Math.PI + t * 0.1;
        ray.rotation.x = Math.sin(t * 0.3 + i) * 0.3;
        const mat = ray.material as THREE.MeshBasicMaterial;
        mat.opacity = 0.02 + Math.sin(t * 1.5 + i * 0.5) * 0.015;
      });

      composer.render();
    }
    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      renderer.domElement.remove();
      composer.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id="canvas-bg"
      aria-hidden="true"
    />
  );
}
