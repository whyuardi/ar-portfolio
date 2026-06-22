"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

const ChromaShader = {
  uniforms: { tDiffuse: { value: null }, amount: { value: 0.002 } },
  vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader: `uniform sampler2D tDiffuse;uniform float amount;varying vec2 vUv;void main(){vec2 o=amount*(vUv-.5);gl_FragColor=vec4(texture2D(tDiffuse,vUv+o).r,texture2D(tDiffuse,vUv).g,texture2D(tDiffuse,vUv-o).b,1.);}`,
};

export default function FullCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a0f, 0.006);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 0, 25);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.8;
    container.appendChild(renderer.domElement);

    // ─── POST-PROCESSING ───
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.4, 0.7, 0.45);
    composer.addPass(bloom);
    const chroma = new ShaderPass(ChromaShader);
    composer.addPass(chroma);

    // ─── MAIN: LARGE ICOSAHEDRON (everswap style — dominant center piece) ───
    const mainGeo = new THREE.IcosahedronGeometry(4.5, 2);
    const mainMat = new THREE.MeshPhysicalMaterial({
      color: "#14d9c4", metalness: 0.0, roughness: 0.0,
      transmission: 0.95, thickness: 4.0, clearcoat: 1.0,
      clearcoatRoughness: 0.0, ior: 2.5, transparent: true,
      opacity: 0.9, emissive: "#14d9c4", emissiveIntensity: 0.3,
      side: THREE.DoubleSide,
    });
    const mainMesh = new THREE.Mesh(mainGeo, mainMat);
    scene.add(mainMesh);

    // ─── WIREFRAME SHELL ───
    const wireGeo = new THREE.IcosahedronGeometry(5.2, 0);
    const wireMat = new THREE.MeshBasicMaterial({ color: "#14d9c4", wireframe: true, transparent: true, opacity: 0.025 });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    scene.add(wireMesh);

    // ─── INNER GLOW ───
    const coreGeo = new THREE.SphereGeometry(1.0, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({ color: "#14d9c4", transparent: true, opacity: 0.25 });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    scene.add(coreMesh);

    // ─── 2 ORBITING SHAPES (minimal, clean — everswap style) ───
    const orb1Geo = new THREE.OctahedronGeometry(0.7, 0);
    const orb1Mat = new THREE.MeshPhysicalMaterial({
      color: "#a855f7", metalness: 0.0, roughness: 0.0,
      transmission: 0.9, thickness: 1.0, clearcoat: 1.0,
      transparent: true, opacity: 0.8, emissive: "#a855f7", emissiveIntensity: 0.2,
      side: THREE.DoubleSide,
    });
    const orb1 = new THREE.Mesh(orb1Geo, orb1Mat);
    scene.add(orb1);

    const orb2Geo = new THREE.DodecahedronGeometry(0.55, 0);
    const orb2Mat = new THREE.MeshPhysicalMaterial({
      color: "#f59e0b", metalness: 0.0, roughness: 0.0,
      transmission: 0.9, thickness: 1.0, clearcoat: 1.0,
      transparent: true, opacity: 0.8, emissive: "#f59e0b", emissiveIntensity: 0.2,
      side: THREE.DoubleSide,
    });
    const orb2 = new THREE.Mesh(orb2Geo, orb2Mat);
    scene.add(orb2);

    // ─── 2 RINGS (clean, everswap style) ───
    const ring1Geo = new THREE.TorusGeometry(6, 0.01, 16, 250);
    const ring1Mat = new THREE.MeshBasicMaterial({ color: "#14d9c4", transparent: true, opacity: 0.12, depthWrite: false });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    scene.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(7.5, 0.007, 16, 250);
    const ring2Mat = new THREE.MeshBasicMaterial({ color: "#a855f7", transparent: true, opacity: 0.08, depthWrite: false });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    scene.add(ring2);

    // ─── PARTICLES (subtle, everswap style) ───
    const isMobile = window.innerWidth < 768;
    const pCount = isMobile ? 300 : 600;
    const pPos = new Float32Array(pCount * 3);
    const pCol = new Float32Array(pCount * 3);
    const palette = [new THREE.Color("#14d9c4"), new THREE.Color("#a855f7"), new THREE.Color("#f59e0b"), new THREE.Color("#06b6d4")];

    for (let i = 0; i < pCount; i++) {
      const i3 = i * 3;
      const angle = Math.random() * Math.PI * 2;
      const r = 6 + Math.random() * 25;
      pPos[i3] = Math.cos(angle) * r;
      pPos[i3 + 1] = (Math.random() - 0.5) * r * 0.4;
      pPos[i3 + 2] = Math.sin(angle) * r - 5;
      const c = palette[Math.floor(Math.random() * palette.length)];
      pCol[i3] = c.r; pCol[i3 + 1] = c.g; pCol[i3 + 2] = c.b;
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.Float32BufferAttribute(pPos, 3));
    pGeo.setAttribute("color", new THREE.Float32BufferAttribute(pCol, 3));
    const pMat = new THREE.PointsMaterial({
      size: 0.05, vertexColors: true, transparent: true, opacity: 0.35,
      blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // ─── SCROLL ───
    let scroll = 0;
    let scrollTarget = 0;
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      scrollTarget = total > 0 ? window.scrollY / total : 0;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // ─── MOUSE (STRONG parallax — everswap style) ───
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMouseMove = (e: MouseEvent) => {
      mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.ty = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

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
      scroll += (scrollTarget - scroll) * 0.05;
      // Smooth mouse
      mouse.x += (mouse.tx - mouse.x) * 0.04;
      mouse.y += (mouse.ty - mouse.y) * 0.04;

      // ─── CAMERA: dramatic scroll + STRONG mouse parallax ───
      camera.position.x = mouse.x * 5; // STRONG horizontal parallax
      camera.position.y = mouse.y * 3.5 - scroll * 10; // STRONG vertical parallax + scroll
      camera.position.z = 25 - scroll * 10; // Zoom in on scroll
      camera.lookAt(0, -scroll * 10, 0);

      // Chromatic aberration increases with scroll
      chroma.uniforms.amount.value = 0.0015 + scroll * 0.005;

      // ─── MAIN ICOSAHEDRON: everswap-style dramatic response ───
      const rotSpeed = 0.1 + scroll * 0.2;
      mainMesh.rotation.x = t * rotSpeed + scroll * 2.5;
      mainMesh.rotation.y = t * (rotSpeed + 0.1) + scroll * 2;
      mainMesh.rotation.z = t * 0.05;

      // Scale: huge on hero → smaller on scroll
      const targetScale = 1.0 - scroll * 0.5;
      mainMesh.scale.setScalar(THREE.MathUtils.lerp(mainMesh.scale.x, targetScale, 0.06));

      // Position: STRONG mouse follow
      mainMesh.position.x = mouse.x * 3.5;
      mainMesh.position.y = mouse.y * 2.5 - scroll * 8;
      mainMesh.position.z = -scroll * 3;

      // Emissive pulse
      mainMat.emissiveIntensity = 0.25 + Math.sin(t * 2) * 0.15 + scroll * 0.25;

      // ─── WIREFRAME: counter-rotate ───
      wireMesh.rotation.x = -t * (rotSpeed * 0.4);
      wireMesh.rotation.y = t * (rotSpeed * 0.6);
      wireMesh.scale.setScalar(THREE.MathUtils.lerp(wireMesh.scale.x, targetScale * 1.15, 0.06));
      wireMesh.position.copy(mainMesh.position);

      // ─── CORE: breathing ───
      const corePulse = 1 + Math.sin(t * 3) * 0.2;
      coreMesh.scale.setScalar(corePulse * targetScale * 0.7);
      coreMesh.position.copy(mainMesh.position);
      coreMat.opacity = 0.2 + Math.sin(t * 2) * 0.15;

      // ─── ORBITERS: circle around main ───
      const orbAngle1 = t * 0.35;
      orb1.position.x = Math.cos(orbAngle1) * 6 + mouse.x * 2.5;
      orb1.position.y = Math.sin(orbAngle1 * 0.7) * 4 + mouse.y * 1.8 - scroll * 6;
      orb1.position.z = Math.sin(orbAngle1) * 3 - scroll * 4;
      orb1.rotation.x = t * 0.4;
      orb1.rotation.y = t * 0.3;
      orb1.scale.setScalar(THREE.MathUtils.lerp(1, 0.4, scroll));
      orb1Mat.opacity = 0.8 * (1 - scroll * 0.6);

      const orbAngle2 = t * -0.25 + Math.PI;
      orb2.position.x = Math.cos(orbAngle2) * 5.5 + mouse.x * 2;
      orb2.position.y = Math.sin(orbAngle2 * 0.6) * 3.5 + mouse.y * 1.5 - scroll * 5.5;
      orb2.position.z = Math.sin(orbAngle2) * 3.5 - scroll * 3.5;
      orb2.rotation.x = t * 0.35;
      orb2.rotation.y = t * 0.25;
      orb2.scale.setScalar(THREE.MathUtils.lerp(1, 0.4, scroll));
      orb2Mat.opacity = 0.8 * (1 - scroll * 0.6);

      // ─── RINGS: rotate + scale ───
      ring1.rotation.x = t * 0.18;
      ring1.rotation.y = t * 0.12;
      ring1.position.copy(mainMesh.position);
      ring1.scale.setScalar(THREE.MathUtils.lerp(1, 2.2, scroll));

      ring2.rotation.x = -t * 0.12;
      ring2.rotation.z = t * 0.08;
      ring2.position.copy(mainMesh.position);
      ring2.scale.setScalar(THREE.MathUtils.lerp(1, 2.2, scroll));

      // ─── PARTICLES ───
      const pArr = pGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < pCount; i++) {
        const i3 = i * 3;
        pArr[i3] += Math.sin(t * 0.4 + i * 0.008) * 0.003;
        pArr[i3 + 1] += Math.cos(t * 0.25 + i * 0.008) * 0.002;
        pArr[i3 + 2] += 0.001;
        const d = Math.sqrt(pArr[i3] ** 2 + pArr[i3 + 1] ** 2 + (pArr[i3 + 2] + 5) ** 2);
        if (d > 30) {
          const a = Math.random() * Math.PI * 2;
          pArr[i3] = Math.cos(a) * 4;
          pArr[i3 + 1] = (Math.random() - 0.5) * 4;
          pArr[i3 + 2] = Math.sin(a) * 4 - 5;
        }
      }
      pGeo.attributes.position.needsUpdate = true;
      particles.rotation.y = t * (0.004 + scroll * 0.01);

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
