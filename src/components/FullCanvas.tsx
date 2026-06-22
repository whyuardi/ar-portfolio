"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

// Chromatic aberration
const ChromaShader = {
  uniforms: { tDiffuse: { value: null }, amount: { value: 0.0015 } },
  vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader: `uniform sampler2D tDiffuse;uniform float amount;varying vec2 vUv;void main(){vec2 o=amount*(vUv-.5);gl_FragColor=vec4(texture2D(tDiffuse,vUv+o).r,texture2D(tDiffuse,vUv).g,texture2D(tDiffuse,vUv-o).b,1.);}`,
};

export default function FullCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ─── SCENE ───
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a0f, 0.008);

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 0, 18);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.6;
    container.appendChild(renderer.domElement);

    // ─── POST-PROCESSING ───
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.2, 0.8, 0.5);
    composer.addPass(bloom);
    const chroma = new ShaderPass(ChromaShader);
    composer.addPass(chroma);

    // ─── MAIN OBJECT: ICOSAHEDRON (large, centered, glass) ───
    const mainGeo = new THREE.IcosahedronGeometry(3, 2);
    const mainMat = new THREE.MeshPhysicalMaterial({
      color: "#14d9c4",
      metalness: 0.0,
      roughness: 0.0,
      transmission: 0.95,
      thickness: 3.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.0,
      ior: 2.5,
      transparent: true,
      opacity: 0.9,
      emissive: "#14d9c4",
      emissiveIntensity: 0.35,
      side: THREE.DoubleSide,
      envMapIntensity: 3.0,
    });
    const mainMesh = new THREE.Mesh(mainGeo, mainMat);
    scene.add(mainMesh);

    // ─── WIREFRAME SHELL ───
    const wireGeo = new THREE.IcosahedronGeometry(3.5, 0);
    const wireMat = new THREE.MeshBasicMaterial({ color: "#14d9c4", wireframe: true, transparent: true, opacity: 0.03 });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    scene.add(wireMesh);

    // ─── INNER GLOW ───
    const coreGeo = new THREE.SphereGeometry(0.8, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({ color: "#14d9c4", transparent: true, opacity: 0.3 });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    scene.add(coreMesh);

    // ─── ORBITING SHAPES (minimal, everswap style) ───
    const orbiterGeo = new THREE.OctahedronGeometry(0.5, 0);
    const orbiterMat = new THREE.MeshPhysicalMaterial({
      color: "#a855f7",
      metalness: 0.0,
      roughness: 0.0,
      transmission: 0.85,
      thickness: 0.5,
      clearcoat: 1.0,
      transparent: true,
      opacity: 0.7,
      emissive: "#a855f7",
      emissiveIntensity: 0.2,
      side: THREE.DoubleSide,
    });
    const orbiter = new THREE.Mesh(orbiterGeo, orbiterMat);
    scene.add(orbiter);

    const orbiter2Geo = new THREE.DodecahedronGeometry(0.4, 0);
    const orbiter2Mat = new THREE.MeshPhysicalMaterial({
      color: "#f59e0b",
      metalness: 0.0,
      roughness: 0.0,
      transmission: 0.85,
      thickness: 0.5,
      clearcoat: 1.0,
      transparent: true,
      opacity: 0.7,
      emissive: "#f59e0b",
      emissiveIntensity: 0.2,
      side: THREE.DoubleSide,
    });
    const orbiter2 = new THREE.Mesh(orbiter2Geo, orbiter2Mat);
    scene.add(orbiter2);

    // ─── ENERGY RINGS ───
    const ringGeo = new THREE.TorusGeometry(4, 0.012, 16, 200);
    const ringMat = new THREE.MeshBasicMaterial({ color: "#14d9c4", transparent: true, opacity: 0.15, depthWrite: false });
    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    scene.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(5, 0.008, 16, 200);
    const ring2Mat = new THREE.MeshBasicMaterial({ color: "#a855f7", transparent: true, opacity: 0.1, depthWrite: false });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    scene.add(ring2);

    // ─── PARTICLES ───
    const isMobile = window.innerWidth < 768;
    const pCount = isMobile ? 400 : 800;
    const pPos = new Float32Array(pCount * 3);
    const pCol = new Float32Array(pCount * 3);
    const palette = [new THREE.Color("#14d9c4"), new THREE.Color("#a855f7"), new THREE.Color("#f59e0b"), new THREE.Color("#06b6d4")];

    for (let i = 0; i < pCount; i++) {
      const i3 = i * 3;
      const angle = Math.random() * Math.PI * 2;
      const r = 4 + Math.random() * 20;
      pPos[i3] = Math.cos(angle) * r;
      pPos[i3 + 1] = (Math.random() - 0.5) * r * 0.4;
      pPos[i3 + 2] = Math.sin(angle) * r - 3;
      const c = palette[Math.floor(Math.random() * palette.length)];
      pCol[i3] = c.r; pCol[i3 + 1] = c.g; pCol[i3 + 2] = c.b;
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.Float32BufferAttribute(pPos, 3));
    pGeo.setAttribute("color", new THREE.Float32BufferAttribute(pCol, 3));
    const pMat = new THREE.PointsMaterial({
      size: 0.06, vertexColors: true, transparent: true, opacity: 0.4,
      blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // ─── SCROLL STATE ───
    let scroll = 0;
    let scrollTarget = 0;
    let currentSection = 0;
    const totalSections = 6;

    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      scrollTarget = total > 0 ? window.scrollY / total : 0;
      currentSection = Math.round(scrollTarget * (totalSections - 1));
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // ─── MOUSE ───
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMouseMove = (e: MouseEvent) => {
      mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.ty = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    // ─── RESIZE ───
    const onResize = () => {
      const w = window.innerWidth, h = window.innerHeight;
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

      // Smooth scroll
      scroll += (scrollTarget - scroll) * 0.06;
      mouse.x += (mouse.tx - mouse.x) * 0.04;
      mouse.y += (mouse.ty - mouse.y) * 0.04;

      // ─── CAMERA: follows mouse + scroll ───
      camera.position.x = mouse.x * 3;
      camera.position.y = mouse.y * 2 - scroll * 8;
      camera.position.z = 18 - scroll * 6;
      camera.lookAt(0, -scroll * 8, 0);

      // Chromatic aberration
      chroma.uniforms.amount.value = 0.001 + scroll * 0.004;

      // ─── MAIN ICOSAHEDRON: everswap-style scroll response ───
      // Rotation: continuous, accelerates with scroll
      const rotSpeed = 0.08 + scroll * 0.15;
      mainMesh.rotation.x = t * rotSpeed + scroll * 2;
      mainMesh.rotation.y = t * (rotSpeed + 0.08) + scroll * 1.5;
      mainMesh.rotation.z = t * 0.04;

      // Scale: large on hero → smaller on later sections
      const targetScale = 1.0 - scroll * 0.6;
      mainMesh.scale.setScalar(THREE.MathUtils.lerp(mainMesh.scale.x, targetScale, 0.05));

      // Position: follows mouse strongly, moves up with scroll
      mainMesh.position.x = mouse.x * 2;
      mainMesh.position.y = mouse.y * 1.5 - scroll * 6;

      // Emissive: pulses + brightens with scroll
      mainMat.emissiveIntensity = 0.3 + Math.sin(t * 2) * 0.15 + scroll * 0.2;

      // ─── WIREFRAME: counter-rotate ───
      wireMesh.rotation.x = -t * (rotSpeed * 0.5);
      wireMesh.rotation.y = t * (rotSpeed * 0.7);
      wireMesh.scale.setScalar(THREE.MathUtils.lerp(wireMesh.scale.x, targetScale * 1.1, 0.05));
      wireMesh.position.copy(mainMesh.position);

      // ─── CORE: breathing ───
      const corePulse = 1 + Math.sin(t * 3) * 0.2;
      coreMesh.scale.setScalar(corePulse * targetScale * 0.8);
      coreMesh.position.copy(mainMesh.position);
      coreMat.opacity = 0.2 + Math.sin(t * 2) * 0.15;

      // ─── ORBITERS: circle around main ───
      const orbAngle1 = t * 0.3;
      orbiter.position.x = Math.cos(orbAngle1) * 4 + mouse.x * 1.5;
      orbiter.position.y = Math.sin(orbAngle1 * 0.7) * 3 + mouse.y * 1 - scroll * 4;
      orbiter.position.z = Math.sin(orbAngle1) * 2 - scroll * 3;
      orbiter.rotation.x = t * 0.4;
      orbiter.rotation.y = t * 0.3;
      const orbScale = THREE.MathUtils.lerp(1, 0.5, scroll);
      orbiter.scale.setScalar(orbScale);
      orbiterMat.opacity = 0.7 * (1 - scroll * 0.5);

      const orbAngle2 = t * -0.25 + Math.PI;
      orbiter2.position.x = Math.cos(orbAngle2) * 3.5 + mouse.x * 1.2;
      orbiter2.position.y = Math.sin(orbAngle2 * 0.6) * 2.5 + mouse.y * 0.8 - scroll * 3.5;
      orbiter2.position.z = Math.sin(orbAngle2) * 2.5 - scroll * 2.5;
      orbiter2.rotation.x = t * 0.35;
      orbiter2.rotation.y = t * 0.25;
      orbiter2.scale.setScalar(orbScale);
      orbiter2Mat.opacity = 0.7 * (1 - scroll * 0.5);

      // ─── RINGS: rotate + scale ───
      ring1.rotation.x = t * 0.2;
      ring1.rotation.y = t * 0.15;
      ring1.position.copy(mainMesh.position);
      const ringScale = THREE.MathUtils.lerp(1, 2.0, scroll);
      ring1.scale.setScalar(ringScale);

      ring2.rotation.x = -t * 0.15;
      ring2.rotation.z = t * 0.1;
      ring2.position.copy(mainMesh.position);
      ring2.scale.setScalar(ringScale);

      // ─── PARTICLES ───
      const pArr = pGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < pCount; i++) {
        const i3 = i * 3;
        pArr[i3] += Math.sin(t * 0.4 + i * 0.008) * 0.003;
        pArr[i3 + 1] += Math.cos(t * 0.25 + i * 0.008) * 0.002;
        pArr[i3 + 2] += 0.001;
        const d = Math.sqrt(pArr[i3] ** 2 + pArr[i3 + 1] ** 2 + (pArr[i3 + 2] + 3) ** 2);
        if (d > 25) {
          const a = Math.random() * Math.PI * 2;
          pArr[i3] = Math.cos(a) * 3;
          pArr[i3 + 1] = (Math.random() - 0.5) * 3;
          pArr[i3 + 2] = Math.sin(a) * 3 - 3;
        }
      }
      pGeo.attributes.position.needsUpdate = true;
      particles.rotation.y = t * (0.005 + scroll * 0.015);

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
