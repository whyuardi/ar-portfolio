"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

// Chromatic aberration
const ChromaShader = {
  uniforms: { tDiffuse: { value: null }, amount: { value: 0.002 } },
  vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader: `
    uniform sampler2D tDiffuse;uniform float amount;varying vec2 vUv;
    void main(){vec2 o=amount*(vUv-.5);
    gl_FragColor=vec4(texture2D(tDiffuse,vUv+o).r,texture2D(tDiffuse,vUv).g,texture2D(tDiffuse,vUv-o).b,1.);}`,
};

// ─── CUSTOM PARAMETRIC: Morus Topology (twisted torus variant) ───
function createMorusGeometry(p: number, q: number, R: number, r: number, segments: number) {
  const geo = new THREE.BufferGeometry();
  const verts: number[] = [];
  const normals: number[] = [];
  for (let i = 0; i <= segments; i++) {
    const u = (i / segments) * Math.PI * 2;
    for (let j = 0; j <= segments; j++) {
      const v = (j / segments) * Math.PI * 2;
      const x = (R + r * Math.cos(q * v)) * Math.cos(p * u);
      const y = (R + r * Math.cos(q * v)) * Math.sin(p * u);
      const z = r * Math.sin(q * v);
      verts.push(x, y, z);
      // Simple normal approximation
      const nx = Math.cos(p * u);
      const ny = Math.sin(p * u);
      const nz = Math.sin(q * v);
      normals.push(nx, ny, nz);
    }
  }
  const indices: number[] = [];
  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < segments; j++) {
      const a = i * (segments + 1) + j;
      const b = a + segments + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

// ─── DNA HELIX ───
function createDNAHelix(count: number, radius: number, height: number, turns: number) {
  const geo = new THREE.BufferGeometry();
  const positions: number[] = [];
  const colors: number[] = [];
  const c1 = new THREE.Color("#14d9c4");
  const c2 = new THREE.Color("#a855f7");
  for (let i = 0; i < count; i++) {
    const t = i / count;
    const angle = t * Math.PI * 2 * turns;
    const y = (t - 0.5) * height;
    // Strand 1
    positions.push(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
    colors.push(c1.r, c1.g, c1.b);
    // Strand 2 (opposite)
    positions.push(Math.cos(angle + Math.PI) * radius, y, Math.sin(angle + Math.PI) * radius);
    colors.push(c2.r, c2.g, c2.b);
    // Cross-links every N steps
    if (i % 8 === 0) {
      positions.push(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
      colors.push(0.9, 0.9, 0.9);
      positions.push(Math.cos(angle + Math.PI) * radius, y, Math.sin(angle + Math.PI) * radius);
      colors.push(0.9, 0.9, 0.9);
    }
  }
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  return geo;
}

// ─── WAVE MESH (animated terrain) ───
function createWaveGrid(size: number, res: number) {
  const geo = new THREE.PlaneGeometry(size, size, res, res);
  return geo;
}

export default function FullCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ─── SCENE ───
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a0f, 0.012);

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 0, 22);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.5;
    container.appendChild(renderer.domElement);

    // ─── POST-PROCESSING ───
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.0, 0.6, 0.65);
    composer.addPass(bloom);
    const chroma = new ShaderPass(ChromaShader);
    composer.addPass(chroma);

    // ─── MAIN: MORUS TOPOLOGY (twisted torus — unique shape) ───
    const morusGeo = createMorusGeometry(2, 3, 1.8, 0.6, 120);
    const morusMat = new THREE.MeshPhysicalMaterial({
      color: "#14d9c4",
      metalness: 0.05,
      roughness: 0.0,
      transmission: 0.92,
      thickness: 2.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.0,
      ior: 2.5,
      transparent: true,
      opacity: 0.85,
      emissive: "#14d9c4",
      emissiveIntensity: 0.3,
      side: THREE.DoubleSide,
    });
    const morusMesh = new THREE.Mesh(morusGeo, morusMat);
    scene.add(morusMesh);

    // Wireframe
    const morusWireGeo = createMorusGeometry(2, 3, 2.1, 0.7, 60);
    const morusWireMat = new THREE.MeshBasicMaterial({ color: "#14d9c4", wireframe: true, transparent: true, opacity: 0.04 });
    const morusWire = new THREE.Mesh(morusWireGeo, morusWireMat);
    scene.add(morusWire);

    // Inner glow core
    const coreGeo = new THREE.IcosahedronGeometry(0.5, 3);
    const coreMat = new THREE.MeshBasicMaterial({ color: "#14d9c4", transparent: true, opacity: 0.35 });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    scene.add(coreMesh);

    // ─── SECONDARY: DNA HELIX (flowing double helix) ───
    const dnaGeo = createDNAHelix(300, 1.2, 12, 3);
    const dnaMat = new THREE.PointsMaterial({
      size: 0.06,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const dnaMesh = new THREE.Points(dnaGeo, dnaMat);
    dnaMesh.position.set(0, 0, -5);
    scene.add(dnaMesh);

    // DNA connecting lines
    const dnaLineGeo = new THREE.BufferGeometry();
    const dnaLinePositions: number[] = [];
    const dnaLineColors: number[] = [];
    const c1 = new THREE.Color("#14d9c4");
    const c2 = new THREE.Color("#a855f7");
    for (let i = 0; i < 300; i += 4) {
      const t = i / 300;
      const angle = t * Math.PI * 2 * 3;
      const y = (t - 0.5) * 12;
      dnaLinePositions.push(Math.cos(angle) * 1.2, y, Math.sin(angle) * 1.2 - 5);
      dnaLinePositions.push(Math.cos(angle + Math.PI) * 1.2, y, Math.sin(angle + Math.PI) * 1.2 - 5);
      dnaLineColors.push(c1.r, c1.g, c1.b);
      dnaLineColors.push(c2.r, c2.g, c2.b);
    }
    dnaLineGeo.setAttribute("position", new THREE.Float32BufferAttribute(dnaLinePositions, 3));
    dnaLineGeo.setAttribute("color", new THREE.Float32BufferAttribute(dnaLineColors, 3));
    const dnaLineMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.15 });
    const dnaLines = new THREE.LineSegments(dnaLineGeo, dnaLineMat);
    scene.add(dnaLines);

    // ─── FLOATING SHAPES ───
    type Floater = {
      mesh: THREE.Mesh;
      wire: THREE.Mesh;
      basePos: THREE.Vector3;
      orbitRadius: number;
      orbitSpeed: number;
      rotSpeed: THREE.Vector3;
      phase: number;
      mat: THREE.MeshPhysicalMaterial;
    };

    const floaters: Floater[] = [];
    const configs = [
      { geo: new THREE.OctahedronGeometry(0.4, 0), color: "#f59e0b", pos: [5, 3, -4], r: 2.5, spd: 0.4 },
      { geo: new THREE.TetrahedronGeometry(0.5, 0), color: "#ef4444", pos: [-6, -1, -3], r: 2.0, spd: -0.35 },
      { geo: new THREE.IcosahedronGeometry(0.35, 0), color: "#06b6d4", pos: [4, -3, -5], r: 2.2, spd: 0.3 },
      { geo: new THREE.OctahedronGeometry(0.3, 0), color: "#10b981", pos: [-5, 4, -6], r: 2.8, spd: -0.25 },
      { geo: new THREE.DodecahedronGeometry(0.35, 0), color: "#ec4899", pos: [7, 0, -7], r: 1.8, spd: 0.45 },
      { geo: new THREE.TetrahedronGeometry(0.25, 0), color: "#8b5cf6", pos: [-4, -5, -4], r: 2.0, spd: -0.4 },
      { geo: new THREE.OctahedronGeometry(0.25, 0), color: "#f97316", pos: [1, 6, -8], r: 3.0, spd: 0.2 },
      { geo: new THREE.IcosahedronGeometry(0.2, 0), color: "#06b6d4", pos: [-7, -3, -9], r: 2.5, spd: -0.3 },
      { geo: new THREE.DodecahedronGeometry(0.15, 0), color: "#a855f7", pos: [3, -5, -10], r: 1.5, spd: 0.5 },
      { geo: new THREE.TetrahedronGeometry(0.18, 0), color: "#14d9c4", pos: [-2, 5, -11], r: 2.0, spd: -0.2 },
    ];

    configs.forEach((cfg) => {
      const mat = new THREE.MeshPhysicalMaterial({
        color: cfg.color,
        metalness: 0.05,
        roughness: 0.0,
        transmission: 0.8,
        thickness: 0.5,
        clearcoat: 0.9,
        clearcoatRoughness: 0.0,
        transparent: true,
        opacity: 0.6,
        emissive: cfg.color,
        emissiveIntensity: 0.2,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(cfg.geo, mat);
      scene.add(mesh);

      const wMat = new THREE.MeshBasicMaterial({ color: cfg.color, wireframe: true, transparent: true, opacity: 0.03 });
      const wMesh = new THREE.Mesh(cfg.geo.clone(), wMat);
      scene.add(wMesh);

      floaters.push({
        mesh, wire: wMesh,
        basePos: new THREE.Vector3(...cfg.pos),
        orbitRadius: cfg.r, orbitSpeed: cfg.spd,
        rotSpeed: new THREE.Vector3(0.15 + Math.random() * 0.3, 0.1 + Math.random() * 0.25, 0.08 + Math.random() * 0.2),
        phase: Math.random() * Math.PI * 2,
        mat,
      });
    });

    // ─── RINGS ───
    const rings: { mesh: THREE.Mesh; speed: number; axis: "x" | "y" | "z" }[] = [];
    [
      { radius: 3.5, tube: 0.014, color: "#14d9c4", speed: 0.35, opacity: 0.2, axis: "x" as const },
      { radius: 4.2, tube: 0.011, color: "#a855f7", speed: -0.25, opacity: 0.14, axis: "y" as const },
      { radius: 3.8, tube: 0.012, color: "#f59e0b", speed: 0.2, opacity: 0.12, axis: "z" as const },
      { radius: 5.0, tube: 0.008, color: "#06b6d4", speed: -0.15, opacity: 0.08, axis: "x" as const },
    ].forEach((cfg) => {
      const geo = new THREE.TorusGeometry(cfg.radius, cfg.tube, 16, 150);
      const mat = new THREE.MeshBasicMaterial({ color: cfg.color, transparent: true, opacity: cfg.opacity, depthWrite: false });
      const mesh = new THREE.Mesh(geo, mat);
      scene.add(mesh);
      rings.push({ mesh, speed: cfg.speed, axis: cfg.axis });
    });

    // ─── WAVE GRID (bottom) ───
    const waveGeo = createWaveGrid(40, 80);
    const waveMat = new THREE.MeshBasicMaterial({
      color: "#14d9c4",
      wireframe: true,
      transparent: true,
      opacity: 0.04,
      depthWrite: false,
    });
    const waveMesh = new THREE.Mesh(waveGeo, waveMat);
    waveMesh.rotation.x = -Math.PI / 2;
    waveMesh.position.set(0, -8, -5);
    scene.add(waveMesh);

    // ─── PARTICLES ───
    const isMobile = window.innerWidth < 768;
    const pCount = isMobile ? 500 : 1000;
    const pPos = new Float32Array(pCount * 3);
    const pCol = new Float32Array(pCount * 3);
    const palette = [new THREE.Color("#14d9c4"), new THREE.Color("#a855f7"), new THREE.Color("#f59e0b"), new THREE.Color("#06b6d4"), new THREE.Color("#ec4899")];

    for (let i = 0; i < pCount; i++) {
      const i3 = i * 3;
      const angle = Math.random() * Math.PI * 2;
      const r = 5 + Math.random() * 18;
      pPos[i3] = Math.cos(angle) * r;
      pPos[i3 + 1] = (Math.random() - 0.5) * r * 0.5;
      pPos[i3 + 2] = Math.sin(angle) * r - 5;
      const c = palette[Math.floor(Math.random() * palette.length)];
      pCol[i3] = c.r; pCol[i3 + 1] = c.g; pCol[i3 + 2] = c.b;
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.Float32BufferAttribute(pPos, 3));
    pGeo.setAttribute("color", new THREE.Float32BufferAttribute(pCol, 3));
    const pMat = new THREE.PointsMaterial({
      size: 0.07, vertexColors: true, transparent: true, opacity: 0.45,
      blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // ─── LIGHT RAYS ───
    const lightRays: THREE.Mesh[] = [];
    const rayGeo = new THREE.ConeGeometry(0.015, 25, 4);
    for (let i = 0; i < 8; i++) {
      const mat = new THREE.MeshBasicMaterial({ color: "#14d9c4", transparent: true, opacity: 0.02, depthWrite: false });
      const ray = new THREE.Mesh(rayGeo, mat);
      ray.rotation.z = (i / 8) * Math.PI;
      scene.add(ray);
      lightRays.push(ray);
    }

    // ─── MOUSE ───
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMouseMove = (e: MouseEvent) => { mouse.tx = (e.clientX / window.innerWidth) * 2 - 1; mouse.ty = -(e.clientY / window.innerHeight) * 2 + 1; };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    // ─── SCROLL ───
    let scroll = 0;
    let scrollT = 0;
    const onScroll = () => { const t = document.documentElement.scrollHeight - window.innerHeight; scrollT = t > 0 ? window.scrollY / t : 0; };
    window.addEventListener("scroll", onScroll, { passive: true });

    // ─── RESIZE ───
    const onResize = () => { const w = window.innerWidth, h = window.innerHeight; camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h); composer.setSize(w, h); };
    window.addEventListener("resize", onResize);

    // ─── ANIMATE ───
    const clock = new THREE.Clock();

    function animate() {
      frameRef.current = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      scroll += (scrollT - scroll) * 0.04;
      mouse.x += (mouse.tx - mouse.x) * 0.035;
      mouse.y += (mouse.ty - mouse.y) * 0.035;

      // ─── CAMERA ───
      camera.position.x = mouse.x * 2.5;
      camera.position.y = mouse.y * 1.8 - scroll * 5;
      camera.position.z = THREE.MathUtils.lerp(22, 13, scroll);
      camera.lookAt(0, -scroll * 5, 0);
      chroma.uniforms.amount.value = 0.001 + scroll * 0.003;

      // ─── MORUS ───
      const mSpeed = 0.12 + scroll * 0.2;
      morusMesh.rotation.x = t * mSpeed;
      morusMesh.rotation.y = t * (mSpeed + 0.1);
      morusMesh.rotation.z = t * 0.06;
      const mScale = THREE.MathUtils.lerp(1.0, 0.35, scroll);
      morusMesh.scale.setScalar(mScale);
      morusMesh.position.x = mouse.x * 1.2;
      morusMesh.position.y = mouse.y * 0.8 - scroll * 3;
      morusMesh.position.z = -scroll * 2;
      morusMat.emissiveIntensity = 0.25 + Math.sin(t * 2) * 0.15 + scroll * 0.2;

      morusWire.rotation.x = -t * (mSpeed * 0.6);
      morusWire.rotation.y = t * (mSpeed * 0.8);
      morusWire.scale.setScalar(THREE.MathUtils.lerp(1.0, 0.3, scroll));
      morusWire.position.copy(morusMesh.position);

      // Core
      coreMesh.rotation.x = t * 0.6;
      coreMesh.rotation.z = t * 0.3;
      const cPulse = 1 + Math.sin(t * 3) * 0.15;
      coreMesh.scale.setScalar(cPulse * mScale);
      coreMesh.position.copy(morusMesh.position);
      coreMat.opacity = 0.25 + Math.sin(t * 2) * 0.15;

      // ─── DNA HELIX: rotate + scroll ───
      dnaMesh.rotation.y = t * 0.15;
      dnaMesh.rotation.x = Math.sin(t * 0.1) * 0.1;
      const dnaScale = THREE.MathUtils.lerp(1.0, 0.4, scroll);
      dnaMesh.scale.setScalar(dnaScale);
      dnaMesh.position.y = -scroll * 6;

      dnaLines.rotation.copy(dnaMesh.rotation);
      dnaLines.scale.copy(dnaMesh.scale);
      dnaLines.position.copy(dnaMesh.position);

      // ─── WAVE GRID: undulate ───
      const wavePositions = waveGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < wavePositions.length; i += 3) {
        const x = wavePositions[i];
        const z = wavePositions[i + 1]; // plane is rotated
        wavePositions[i + 2] = Math.sin(x * 0.3 + t * 1.5) * 0.5 + Math.cos(z * 0.2 + t * 0.8) * 0.3;
      }
      waveGeo.attributes.position.needsUpdate = true;
      waveMat.opacity = 0.03 + Math.sin(t * 0.5) * 0.015;

      // ─── FLOATERS ───
      floaters.forEach((f) => {
        const scatter = 1 + scroll * 3;
        const orbAngle = t * f.orbitSpeed + f.phase;
        f.mesh.position.x = f.basePos.x * scatter + Math.cos(orbAngle) * f.orbitRadius + mouse.x * 0.4;
        f.mesh.position.y = f.basePos.y * scatter + Math.sin(orbAngle * 0.7) * f.orbitRadius * 0.5 + mouse.y * 0.25 - scroll * 4;
        f.mesh.position.z = f.basePos.z + Math.sin(orbAngle) * 2 - scroll * 5;
        f.mesh.rotation.x = t * f.rotSpeed.x;
        f.mesh.rotation.y = t * f.rotSpeed.y;
        f.wire.position.copy(f.mesh.position);
        f.wire.rotation.copy(f.mesh.rotation);
        f.mat.opacity = 0.6 * (1 - scroll * 0.7);
      });

      // ─── RINGS ───
      rings.forEach((r) => {
        const spd = r.speed * (1 + scroll * 3);
        if (r.axis === "x") r.mesh.rotation.x = t * spd;
        else if (r.axis === "y") r.mesh.rotation.y = t * spd;
        else r.mesh.rotation.z = t * spd;
        r.mesh.scale.setScalar(THREE.MathUtils.lerp(1.0, 1.8, scroll));
      });

      // ─── PARTICLES: spiral flow ───
      const pArr = pGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < pCount; i++) {
        const i3 = i * 3;
        pArr[i3] += Math.sin(t * 0.5 + i * 0.01) * 0.004;
        pArr[i3 + 1] += Math.cos(t * 0.3 + i * 0.01) * 0.003;
        pArr[i3 + 2] += 0.002;
        const d = Math.sqrt(pArr[i3] ** 2 + pArr[i3 + 1] ** 2 + (pArr[i3 + 2] + 5) ** 2);
        if (d > 28) {
          const a = Math.random() * Math.PI * 2;
          pArr[i3] = Math.cos(a) * 3;
          pArr[i3 + 1] = (Math.random() - 0.5) * 4;
          pArr[i3 + 2] = Math.sin(a) * 3 - 5;
        }
      }
      pGeo.attributes.position.needsUpdate = true;
      particles.rotation.y = t * (0.006 + scroll * 0.02);

      // ─── LIGHT RAYS ───
      lightRays.forEach((ray, i) => {
        ray.rotation.z = (i / 8) * Math.PI + t * 0.08;
        ray.rotation.x = Math.sin(t * 0.3 + i) * 0.3;
        (ray.material as THREE.MeshBasicMaterial).opacity = 0.015 + Math.sin(t * 1.5 + i * 0.5) * 0.012;
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

  return <div ref={containerRef} id="canvas-bg" aria-hidden="true" />;
}
