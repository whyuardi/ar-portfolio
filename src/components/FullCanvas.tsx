"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

export default function FullCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ─── SCENE ───
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      200
    );
    camera.position.set(0, 0, 20);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);

    // ─── BLOOM ───
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.7,
      0.3,
      0.85
    );
    composer.addPass(bloom);

    // ─── MAIN OBJECT: TORUS KNOT (everswap-style prominent center piece) ───
    const knotGeo = new THREE.TorusKnotGeometry(1.8, 0.55, 128, 16);
    const knotMat = new THREE.MeshPhysicalMaterial({
      color: "#14d9c4",
      metalness: 0.95,
      roughness: 0.05,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      transparent: true,
      opacity: 0.8,
      emissive: "#14d9c4",
      emissiveIntensity: 0.2,
    });
    const knot = new THREE.Mesh(knotGeo, knotMat);
    scene.add(knot);

    // Wireframe shell
    const wireGeo = new THREE.TorusKnotGeometry(2.2, 0.65, 48, 8);
    const wireMat = new THREE.MeshBasicMaterial({
      color: "#6ee7d6",
      wireframe: true,
      transparent: true,
      opacity: 0.06,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    scene.add(wireMesh);

    // ─── SECONDARY: ICOSAHEDRON (smaller, orbiting close) ───
    const icoGeo = new THREE.IcosahedronGeometry(0.9, 1);
    const icoMat = new THREE.MeshPhysicalMaterial({
      color: "#a855f7",
      metalness: 0.9,
      roughness: 0.08,
      clearcoat: 0.8,
      transparent: true,
      opacity: 0.7,
      emissive: "#a855f7",
      emissiveIntensity: 0.15,
    });
    const ico = new THREE.Mesh(icoGeo, icoMat);
    scene.add(ico);

    // ─── FLOATING SHAPES (scattered around) ───
    type FloatingShape = {
      mesh: THREE.Mesh;
      wire: THREE.Mesh;
      basePos: THREE.Vector3;
      orbitRadius: number;
      orbitSpeed: number;
      rotSpeed: THREE.Vector3;
      phase: number;
    };

    const floaters: FloatingShape[] = [];
    const floaterConfigs = [
      { geo: new THREE.OctahedronGeometry(0.35), color: "#f59e0b", pos: [4, 2, -3], radius: 2, speed: 0.4 },
      { geo: new THREE.DodecahedronGeometry(0.3), color: "#ef4444", pos: [-5, -1, -2], radius: 1.5, speed: -0.35 },
      { geo: new THREE.TetrahedronGeometry(0.4), color: "#06b6d4", pos: [3, -3, -4], radius: 1.8, speed: 0.3 },
      { geo: new THREE.OctahedronGeometry(0.25), color: "#10b981", pos: [-4, 3, -5], radius: 2.2, speed: -0.25 },
      { geo: new THREE.IcosahedronGeometry(0.3), color: "#ec4899", pos: [6, 0, -6], radius: 1.2, speed: 0.45 },
      { geo: new THREE.TetrahedronGeometry(0.2), color: "#8b5cf6", pos: [-3, -4, -3], radius: 1.6, speed: -0.4 },
      { geo: new THREE.DodecahedronGeometry(0.25), color: "#f97316", pos: [0, 5, -7], radius: 2.5, speed: 0.2 },
      { geo: new THREE.OctahedronGeometry(0.2), color: "#06b6d4", pos: [-6, -2, -8], radius: 1.8, speed: -0.3 },
    ];

    floaterConfigs.forEach((cfg) => {
      const mat = new THREE.MeshPhysicalMaterial({
        color: cfg.color,
        metalness: 0.85,
        roughness: 0.1,
        clearcoat: 0.6,
        transparent: true,
        opacity: 0.6,
        emissive: cfg.color,
        emissiveIntensity: 0.12,
      });
      const mesh = new THREE.Mesh(cfg.geo, mat);
      scene.add(mesh);

      const wMat = new THREE.MeshBasicMaterial({
        color: cfg.color,
        wireframe: true,
        transparent: true,
        opacity: 0.06,
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
          0.2 + Math.random() * 0.3,
          0.15 + Math.random() * 0.25,
          0.1 + Math.random() * 0.2
        ),
        phase: Math.random() * Math.PI * 2,
      });
    });

    // ─── ENERGY RINGS ───
    const rings: { mesh: THREE.Mesh; speed: number; axis: "x" | "y" | "z" }[] = [];
    const ringConfigs = [
      { radius: 3.2, tube: 0.012, color: "#14d9c4", speed: 0.35, opacity: 0.18, axis: "x" as const },
      { radius: 3.8, tube: 0.01, color: "#a855f7", speed: -0.25, opacity: 0.12, axis: "y" as const },
      { radius: 3.5, tube: 0.011, color: "#f59e0b", speed: 0.2, opacity: 0.1, axis: "z" as const },
    ];
    ringConfigs.forEach((cfg) => {
      const geo = new THREE.TorusGeometry(cfg.radius, cfg.tube, 16, 120);
      const mat = new THREE.MeshBasicMaterial({
        color: cfg.color,
        transparent: true,
        opacity: cfg.opacity,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(geo, mat);
      scene.add(mesh);
      rings.push({ mesh, speed: cfg.speed, axis: cfg.axis });
    });

    // ─── PARTICLES ───
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 500 : 1000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const palette = [
      new THREE.Color("#14d9c4"),
      new THREE.Color("#a855f7"),
      new THREE.Color("#f59e0b"),
      new THREE.Color("#06b6d4"),
    ];

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 6 + Math.random() * 20;
      positions[i3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = r * Math.cos(phi);
      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i3] = c.r;
      colors[i3 + 1] = c.g;
      colors[i3 + 2] = c.b;
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    pGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const pMat = new THREE.PointsMaterial({
      size: 0.07,
      vertexColors: true,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // ─── MOUSE TRACKING ───
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const onMouseMove = (e: MouseEvent) => {
      mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    // ─── SCROLL ───
    let scrollProgress = 0;
    let scrollTarget = 0;
    const onScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      scrollTarget = totalHeight > 0 ? window.scrollY / totalHeight : 0;
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

      // Smooth scroll & mouse
      scrollProgress += (scrollTarget - scrollProgress) * 0.05;
      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;

      // ─── CAMERA: follows mouse + scroll ───
      const camBaseZ = 20;
      const camScrollZ = scrollProgress * 8; // zoom in as you scroll
      camera.position.x = mouse.x * 2;
      camera.position.y = mouse.y * 1.5 - scrollProgress * 4;
      camera.position.z = camBaseZ - camScrollZ;
      camera.lookAt(0, -scrollProgress * 4, 0);

      // ─── MAIN KNOT: rotation speed + scale changes with scroll ───
      const knotRotSpeed = 0.2 + scrollProgress * 0.3;
      knot.rotation.x = t * knotRotSpeed;
      knot.rotation.y = t * (knotRotSpeed + 0.15);
      knot.rotation.z = t * 0.1;

      // Scale: big on hero, smaller on later sections
      const knotScale = THREE.MathUtils.lerp(1.0, 0.5, scrollProgress);
      knot.scale.set(knotScale, knotScale, knotScale);

      // Position drifts with scroll
      knot.position.x = mouse.x * 0.8;
      knot.position.y = mouse.y * 0.5 - scrollProgress * 2;

      // Emissive pulse
      knotMat.emissiveIntensity = 0.15 + Math.sin(t * 1.8) * 0.1 + scrollProgress * 0.15;

      // Wireframe counter-rotation
      wireMesh.rotation.x = -t * (knotRotSpeed * 0.6);
      wireMesh.rotation.y = t * (knotRotSpeed * 0.8);
      const wireScale = THREE.MathUtils.lerp(1.0, 0.4, scrollProgress);
      wireMesh.scale.set(wireScale, wireScale, wireScale);
      wireMesh.position.copy(knot.position);

      // ─── ICOSAHEDRON: orbit around knot ───
      const icoAngle = t * 0.5;
      const icoOrbit = 3.5 - scrollProgress * 1.5;
      ico.position.x = Math.cos(icoAngle) * icoOrbit + mouse.x * 0.5;
      ico.position.y = Math.sin(icoAngle * 0.7) * 2 + mouse.y * 0.3 - scrollProgress;
      ico.position.z = Math.sin(icoAngle) * 2 - scrollProgress * 3;
      ico.rotation.x = t * 0.6;
      ico.rotation.y = t * 0.4;

      const icoScale = THREE.MathUtils.lerp(1.0, 0.6, scrollProgress);
      ico.scale.set(icoScale, icoScale, icoScale);
      icoMat.emissiveIntensity = 0.12 + Math.sin(t * 2 + 1) * 0.08;

      // ─── FLOATERS: scatter outward with scroll ───
      floaters.forEach((f) => {
        const scatter = 1 + scrollProgress * 2;
        const orbAngle = t * f.orbitSpeed + f.phase;

        f.mesh.position.x = f.basePos.x * scatter + Math.cos(orbAngle) * f.orbitRadius + mouse.x * 0.3;
        f.mesh.position.y = f.basePos.y * scatter + Math.sin(orbAngle * 0.8) * f.orbitRadius * 0.6 + mouse.y * 0.2 - scrollProgress * 3;
        f.mesh.position.z = f.basePos.z + Math.sin(orbAngle) * 1.5 - scrollProgress * 4;

        f.mesh.rotation.x = t * f.rotSpeed.x;
        f.mesh.rotation.y = t * f.rotSpeed.y;

        f.wire.position.copy(f.mesh.position);
        f.wire.rotation.copy(f.mesh.rotation);

        // Fade with scroll
        const mat = f.mesh.material as THREE.MeshPhysicalMaterial;
        mat.opacity = 0.6 * (1 - scrollProgress * 0.6);
      });

      // ─── RINGS: rotate faster with scroll ───
      rings.forEach((r) => {
        const ringSpeed = r.speed * (1 + scrollProgress * 2);
        if (r.axis === "x") r.mesh.rotation.x = t * ringSpeed;
        else if (r.axis === "y") r.mesh.rotation.y = t * ringSpeed;
        else r.mesh.rotation.z = t * ringSpeed;

        // Rings scale with scroll
        const ringScale = THREE.MathUtils.lerp(1.0, 1.5, scrollProgress);
        r.mesh.scale.set(ringScale, ringScale, ringScale);
      });

      // ─── PARTICLES: swirl faster with scroll ───
      particles.rotation.y = t * (0.01 + scrollProgress * 0.03);
      particles.rotation.x = Math.sin(t * 0.1) * 0.05 + scrollProgress * 0.2;

      // Particle size pulse
      pMat.size = 0.07 + Math.sin(t * 2) * 0.02;

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
