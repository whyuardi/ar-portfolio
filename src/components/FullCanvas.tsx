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

    // ─── SCENE SETUP ───
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 18);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // ─── POST-PROCESSING ───
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.6,
      0.4,
      0.85
    );
    composer.addPass(bloomPass);

    // ─── MAIN ICOSAHEDRON ───
    const mainGeo = new THREE.IcosahedronGeometry(2, 1);
    const mainMat = new THREE.MeshPhysicalMaterial({
      color: "#14d9c4",
      metalness: 0.95,
      roughness: 0.05,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      transparent: true,
      opacity: 0.7,
      emissive: "#14d9c4",
      emissiveIntensity: 0.15,
    });
    const mainMesh = new THREE.Mesh(mainGeo, mainMat);
    mainMesh.position.set(0, 0, 0);
    scene.add(mainMesh);

    // Wireframe shell
    const wireGeo = new THREE.IcosahedronGeometry(2.5, 0);
    const wireMat = new THREE.MeshBasicMaterial({
      color: "#6ee7d6",
      wireframe: true,
      transparent: true,
      opacity: 0.08,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    wireMesh.position.set(0, 0, 0);
    scene.add(wireMesh);

    // Core glow
    const coreGeo = new THREE.IcosahedronGeometry(0.8, 2);
    const coreMat = new THREE.MeshBasicMaterial({
      color: "#14d9c4",
      transparent: true,
      opacity: 0.25,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.position.set(0, 0, 0);
    scene.add(coreMesh);

    // ─── SECONDARY SHAPES (scattered) ───
    type Orbiter = {
      mesh: THREE.Mesh;
      wire: THREE.Mesh;
      radius: number;
      angle: number;
      speed: number;
      yOffset: number;
      ySpeed: number;
      rotSpeed: number;
    };

    const orbiters: Orbiter[] = [];
    const orbiterConfigs = [
      { geo: new THREE.OctahedronGeometry(0.4), color: "#a855f7", radius: 5.5, speed: 0.35, yOff: 0, ySpd: 0.6 },
      { geo: new THREE.DodecahedronGeometry(0.35), color: "#f59e0b", radius: 4.5, speed: -0.28, yOff: 0, ySpd: 0.5 },
      { geo: new THREE.TetrahedronGeometry(0.4), color: "#ef4444", radius: 6.5, speed: 0.22, yOff: 0, ySpd: 0.7 },
      { geo: new THREE.IcosahedronGeometry(0.3), color: "#06b6d4", radius: 3.8, speed: -0.42, yOff: 0, ySpd: 0.4 },
      { geo: new THREE.OctahedronGeometry(0.5), color: "#10b981", radius: 7.5, speed: 0.18, yOff: 0, ySpd: 0.8 },
      { geo: new THREE.TetrahedronGeometry(0.25), color: "#ec4899", radius: 5.0, speed: -0.32, yOff: 0, ySpd: 0.55 },
    ];

    orbiterConfigs.forEach((cfg) => {
      const mat = new THREE.MeshPhysicalMaterial({
        color: cfg.color,
        metalness: 0.8,
        roughness: 0.15,
        transparent: true,
        opacity: 0.6,
        emissive: cfg.color,
        emissiveIntensity: 0.1,
      });
      const mesh = new THREE.Mesh(cfg.geo, mat);
      scene.add(mesh);

      const wMat = new THREE.MeshBasicMaterial({
        color: cfg.color,
        wireframe: true,
        transparent: true,
        opacity: 0.08,
      });
      const wMesh = new THREE.Mesh(cfg.geo.clone(), wMat);
      scene.add(wMesh);

      orbiters.push({
        mesh,
        wire: wMesh,
        radius: cfg.radius,
        angle: Math.random() * Math.PI * 2,
        speed: cfg.speed,
        yOffset: (Math.random() - 0.5) * 6,
        ySpeed: cfg.ySpd,
        rotSpeed: 0.3 + Math.random() * 0.4,
      });
    });

    // ─── ENERGY RINGS ───
    const rings: { mesh: THREE.Mesh; speed: number; axis: "x" | "y" | "z" }[] = [];
    const ringConfigs = [
      { radius: 4.0, tube: 0.015, color: "#14d9c4", speed: 0.4, opacity: 0.2, axis: "x" as const },
      { radius: 4.8, tube: 0.012, color: "#a855f7", speed: -0.3, opacity: 0.14, axis: "y" as const },
      { radius: 4.4, tube: 0.014, color: "#f59e0b", speed: 0.25, opacity: 0.12, axis: "z" as const },
    ];
    ringConfigs.forEach((cfg) => {
      const geo = new THREE.TorusGeometry(cfg.radius, cfg.tube, 16, 100);
      const mat = new THREE.MeshBasicMaterial({
        color: cfg.color,
        transparent: true,
        opacity: cfg.opacity,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(0, 0, 0);
      scene.add(mesh);
      rings.push({ mesh, speed: cfg.speed, axis: cfg.axis });
    });

    // ─── PARTICLES ───
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 400 : 800;
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
      const r = 8 + Math.random() * 15;
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
      size: 0.06,
      vertexColors: true,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

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

    // ─── SCROLL PARALLAX ───
    let scrollProgress = 0;
    const onScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      scrollProgress = totalHeight > 0 ? window.scrollY / totalHeight : 0;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // ─── ANIMATION LOOP ───
    const clock = new THREE.Clock();

    function animate() {
      frameRef.current = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Main mesh rotation
      mainMesh.rotation.x = t * 0.2;
      mainMesh.rotation.y = t * 0.35;
      wireMesh.rotation.x = -t * 0.12;
      wireMesh.rotation.y = t * 0.18;
      coreMesh.rotation.x = t * 0.5;
      coreMesh.rotation.z = t * 0.25;
      const coreScale = 1 + Math.sin(t * 2) * 0.08;
      coreMesh.scale.set(coreScale, coreScale, coreScale);

      // Main emissive pulse
      mainMat.emissiveIntensity = 0.12 + Math.sin(t * 1.5) * 0.08;

      // Rings
      rings.forEach((r) => {
        if (r.axis === "x") r.mesh.rotation.x = t * r.speed;
        else if (r.axis === "y") r.mesh.rotation.y = t * r.speed;
        else r.mesh.rotation.z = t * r.speed;
      });

      // Orbiters
      orbiters.forEach((o) => {
        o.angle += o.speed * 0.015;
        const x = Math.cos(o.angle) * o.radius;
        const z = Math.sin(o.angle) * o.radius;
        const y = o.yOffset + Math.sin(t * o.ySpeed + o.radius) * 1.5;
        o.mesh.position.set(x, y, z);
        o.mesh.rotation.x = t * o.rotSpeed + o.angle;
        o.mesh.rotation.y = t * o.rotSpeed * 0.7;
        o.wire.position.copy(o.mesh.position);
        o.wire.rotation.copy(o.mesh.rotation);
      });

      // Particles drift
      particles.rotation.y = t * 0.012;
      particles.rotation.x = Math.sin(t * 0.08) * 0.04;

      // Scroll-based vertical camera offset
      camera.position.y = scrollProgress * -3;
      camera.lookAt(0, scrollProgress * -3, 0);

      // Fade based on scroll
      const fade = 1 - scrollProgress * 0.5;
      mainMat.opacity = 0.7 * fade;
      wireMat.opacity = 0.08 * fade;
      pMat.opacity = 0.35 * fade;

      composer.render();
    }
    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
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
