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

// ─── CUSTOM MORUS TOPOLOGY (twisted torus variant) ───
function createMorus(p: number, q: number, R: number, r: number, seg: number) {
  const geo = new THREE.BufferGeometry();
  const v: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= seg; i++) {
    const u = (i / seg) * Math.PI * 2;
    for (let j = 0; j <= seg; j++) {
      const t = (j / seg) * Math.PI * 2;
      v.push(
        (R + r * Math.cos(q * t)) * Math.cos(p * u),
        (R + r * Math.cos(q * t)) * Math.sin(p * u),
        r * Math.sin(q * t)
      );
    }
  }
  for (let i = 0; i < seg; i++) {
    for (let j = 0; j < seg; j++) {
      const a = i * (seg + 1) + j;
      const b = a + seg + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  geo.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

export default function FullCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a0f, 0.005);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 0, 28);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.8;
    container.appendChild(renderer.domElement);

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.3, 0.6, 0.5);
    composer.addPass(bloom);
    const chroma = new ShaderPass(ChromaShader);
    composer.addPass(chroma);

    // ─── MAIN: MORUS TOPOLOGY (twisted torus — completely unique shape) ───
    const morusGeo = createMorus(2, 3, 2.0, 0.7, 100);
    const morusMat = new THREE.MeshPhysicalMaterial({
      color: "#14d9c4", metalness: 0.0, roughness: 0.0,
      transmission: 0.92, thickness: 3.0, clearcoat: 1.0,
      clearcoatRoughness: 0.0, ior: 2.5, transparent: true,
      opacity: 0.85, emissive: "#14d9c4", emissiveIntensity: 0.3,
      side: THREE.DoubleSide,
    });
    const morusMesh = new THREE.Mesh(morusGeo, morusMat);
    scene.add(morusMesh);

    // Wireframe shell
    const morusWireGeo = createMorus(2, 3, 2.4, 0.85, 50);
    const morusWireMat = new THREE.MeshBasicMaterial({ color: "#14d9c4", wireframe: true, transparent: true, opacity: 0.03 });
    const morusWire = new THREE.Mesh(morusWireGeo, morusWireMat);
    scene.add(morusWire);

    // Inner core
    const coreGeo = new THREE.IcosahedronGeometry(0.6, 3);
    const coreMat = new THREE.MeshBasicMaterial({ color: "#14d9c4", transparent: true, opacity: 0.3 });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    scene.add(coreMesh);

    // ─── 2 ORBITERS ───
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

    // ─── 2 RINGS ───
    const ring1Geo = new THREE.TorusGeometry(6, 0.01, 16, 250);
    const ring1Mat = new THREE.MeshBasicMaterial({ color: "#14d9c4", transparent: true, opacity: 0.12, depthWrite: false });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    scene.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(7.5, 0.007, 16, 250);
    const ring2Mat = new THREE.MeshBasicMaterial({ color: "#a855f7", transparent: true, opacity: 0.08, depthWrite: false });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    scene.add(ring2);

    // ─── PARTICLES ───
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

    // ─── SCROLL + MOUSE ───
    let scroll = 0;
    let scrollTarget = 0;
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      scrollTarget = total > 0 ? window.scrollY / total : 0;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

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

    const clock = new THREE.Clock();

    function animate() {
      frameRef.current = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      scroll += (scrollTarget - scroll) * 0.05;
      mouse.x += (mouse.tx - mouse.x) * 0.04;
      mouse.y += (mouse.ty - mouse.y) * 0.04;

      // Camera
      camera.position.x = mouse.x * 5;
      camera.position.y = mouse.y * 3.5 - scroll * 10;
      camera.position.z = 28 - scroll * 12;
      camera.lookAt(0, -scroll * 10, 0);
      chroma.uniforms.amount.value = 0.0015 + scroll * 0.005;

      // Main morus
      const rotSpeed = 0.12 + scroll * 0.2;
      morusMesh.rotation.x = t * rotSpeed + scroll * 2;
      morusMesh.rotation.y = t * (rotSpeed + 0.08) + scroll * 1.5;
      morusMesh.rotation.z = t * 0.05;
      const targetScale = 1.0 - scroll * 0.5;
      morusMesh.scale.setScalar(THREE.MathUtils.lerp(morusMesh.scale.x, targetScale, 0.06));
      morusMesh.position.x = mouse.x * 3.5;
      morusMesh.position.y = mouse.y * 2.5 - scroll * 8;
      morusMesh.position.z = -scroll * 3;
      morusMat.emissiveIntensity = 0.25 + Math.sin(t * 2) * 0.15 + scroll * 0.25;

      // Wire
      morusWire.rotation.x = -t * (rotSpeed * 0.5);
      morusWire.rotation.y = t * (rotSpeed * 0.7);
      morusWire.scale.setScalar(THREE.MathUtils.lerp(morusWire.scale.x, targetScale * 1.15, 0.06));
      morusWire.position.copy(morusMesh.position);

      // Core
      const corePulse = 1 + Math.sin(t * 3) * 0.2;
      coreMesh.scale.setScalar(corePulse * targetScale * 0.7);
      coreMesh.position.copy(morusMesh.position);
      coreMat.opacity = 0.2 + Math.sin(t * 2) * 0.15;

      // Orbiters
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

      // Rings
      ring1.rotation.x = t * 0.18;
      ring1.rotation.y = t * 0.12;
      ring1.position.copy(morusMesh.position);
      ring1.scale.setScalar(THREE.MathUtils.lerp(1, 2.2, scroll));

      ring2.rotation.x = -t * 0.12;
      ring2.rotation.z = t * 0.08;
      ring2.position.copy(morusMesh.position);
      ring2.scale.setScalar(THREE.MathUtils.lerp(1, 2.2, scroll));

      // Particles
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
