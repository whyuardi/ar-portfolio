"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

export default function ParticleNetwork() {
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // === SCENE SETUP ===
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 2, 18);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // === POST-PROCESSING: BLOOM ===
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(container.clientWidth, container.clientHeight),
      0.8,   // strength
      0.4,   // radius
      0.85   // threshold
    );
    composer.addPass(bloomPass);

    // === ORBIT CONTROLS ===
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.8;
    controls.minDistance = 8;
    controls.maxDistance = 35;
    controls.maxPolarAngle = Math.PI / 2.1;
    controls.target.set(0, 0.5, 0);
    controlsRef.current = controls;

    // === MAIN OBJECT: ICOSAHEDRON (low-poly gem) ===
    const mainGeo = new THREE.IcosahedronGeometry(2.5, 1);
    const mainMat = new THREE.MeshPhysicalMaterial({
      color: "#14d9c4",
      metalness: 0.95,
      roughness: 0.05,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      transparent: true,
      opacity: 0.85,
      emissive: "#14d9c4",
      emissiveIntensity: 0.2,
      envMapIntensity: 1.5,
    });
    const mainMesh = new THREE.Mesh(mainGeo, mainMat);
    mainMesh.position.set(0, 0.5, 0);
    mainMesh.userData.isClickable = true;
    mainMesh.userData.originalColor = "#14d9c4";
    scene.add(mainMesh);

    // Wireframe shell
    const wireGeo = new THREE.IcosahedronGeometry(3.0, 0);
    const wireMat = new THREE.MeshBasicMaterial({
      color: "#6ee7d6",
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    wireMesh.position.set(0, 0.5, 0);
    scene.add(wireMesh);

    // Inner core glow
    const coreGeo = new THREE.IcosahedronGeometry(1.2, 2);
    const coreMat = new THREE.MeshBasicMaterial({
      color: "#14d9c4",
      transparent: true,
      opacity: 0.3,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.position.set(0, 0.5, 0);
    scene.add(coreMesh);

    // === ORBITING SHAPES ===
    const orbiters: {
      mesh: THREE.Mesh;
      wire: THREE.Mesh;
      radius: number;
      angle: number;
      speed: number;
      tilt: number;
      rotSpeed: number;
    }[] = [];

    const orbiterConfigs: {
      geo: THREE.BufferGeometry;
      size: number;
      color: string;
      radius: number;
      speed: number;
      tilt: number;
    }[] = [
      { geo: new THREE.OctahedronGeometry(0.5, 0), size: 0.5, color: "#a855f7", radius: 5.5, speed: 0.35, tilt: 0.3 },
      { geo: new THREE.DodecahedronGeometry(0.4, 0), size: 0.4, color: "#f59e0b", radius: 4.5, speed: -0.28, tilt: -0.2 },
      { geo: new THREE.TetrahedronGeometry(0.45, 0), size: 0.45, color: "#ef4444", radius: 6.5, speed: 0.22, tilt: 0.5 },
      { geo: new THREE.IcosahedronGeometry(0.35, 0), size: 0.35, color: "#06b6d4", radius: 3.8, speed: -0.42, tilt: -0.35 },
      { geo: new THREE.OctahedronGeometry(0.6, 0), size: 0.6, color: "#10b981", radius: 7.5, speed: 0.18, tilt: 0.6 },
      { geo: new THREE.TetrahedronGeometry(0.3, 0), size: 0.3, color: "#ec4899", radius: 5.0, speed: -0.32, tilt: -0.55 },
    ];

    orbiterConfigs.forEach((cfg) => {
      const mat = new THREE.MeshPhysicalMaterial({
        color: cfg.color,
        metalness: 0.8,
        roughness: 0.15,
        transparent: true,
        opacity: 0.75,
        emissive: cfg.color,
        emissiveIntensity: 0.15,
        clearcoat: 0.6,
      });
      const mesh = new THREE.Mesh(cfg.geo, mat);
      mesh.userData.isClickable = true;
      mesh.userData.originalColor = cfg.color;
      scene.add(mesh);

      const wGeo = cfg.geo.clone();
      const wMat = new THREE.MeshBasicMaterial({
        color: cfg.color,
        wireframe: true,
        transparent: true,
        opacity: 0.12,
      });
      const wMesh = new THREE.Mesh(wGeo, wMat);
      scene.add(wMesh);

      orbiters.push({
        mesh,
        wire: wMesh,
        radius: cfg.radius,
        angle: Math.random() * Math.PI * 2,
        speed: cfg.speed,
        tilt: cfg.tilt,
        rotSpeed: 0.3 + Math.random() * 0.4,
      });
    });

    // === ENERGY RINGS ===
    const rings: { mesh: THREE.Mesh; speed: number; axis: "x" | "y" | "z" }[] = [];
    const ringConfigs = [
      { radius: 3.5, tube: 0.02, color: "#14d9c4", speed: 0.4, opacity: 0.25, axis: "x" as const },
      { radius: 4.2, tube: 0.015, color: "#a855f7", speed: -0.3, opacity: 0.18, axis: "y" as const },
      { radius: 3.8, tube: 0.018, color: "#f59e0b", speed: 0.25, opacity: 0.15, axis: "z" as const },
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
      mesh.position.set(0, 0.5, 0);
      scene.add(mesh);
      rings.push({ mesh, speed: cfg.speed, axis: cfg.axis });
    });

    // === PARTICLES ===
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 600 : 1000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    const palette = [
      new THREE.Color("#14d9c4"),
      new THREE.Color("#a855f7"),
      new THREE.Color("#f59e0b"),
      new THREE.Color("#06b6d4"),
    ];

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      // Spiral distribution
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

      sizes[i] = 0.03 + Math.random() * 0.06;
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    pGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    pGeo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const pMat = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // === ENERGY PULSE (periodic burst) ===
    const pulseGeo = new THREE.SphereGeometry(0.5, 32, 32);
    const pulseMat = new THREE.MeshBasicMaterial({
      color: "#14d9c4",
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
    pulseMesh.position.set(0, 0.5, 0);
    scene.add(pulseMesh);

    // === RAYCASTER ===
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const clickable: THREE.Mesh[] = [];
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.userData.isClickable) {
        clickable.push(child);
      }
    });

    const onClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(clickable);
      if (hits.length > 0) {
        const hit = hits[0].object as THREE.Mesh;
        const mat = hit.material as THREE.MeshPhysicalMaterial;
        const orig = hit.userData.originalColor as string;

        // Flash + scale
        mat.emissiveIntensity = 1.0;
        mat.emissive.setHex(0xffffff);
        hit.scale.set(1.35, 1.35, 1.35);

        // Trigger pulse
        pulseMat.opacity = 0.6;
        pulseMesh.scale.set(1, 1, 1);

        setTimeout(() => {
          mat.emissive.set(orig);
          mat.emissiveIntensity = 0.15;
          hit.scale.set(1, 1, 1);
        }, 500);

        wireMat.color.setHex(Math.random() * 0xffffff);
      }
    };

    renderer.domElement.style.cursor = "grab";
    renderer.domElement.addEventListener("click", onClick);

    // === SCROLL-BASED PARALLAX ===
    let scrollProgress = 0;
    const onScroll = () => {
      const hero = document.getElementById("hero");
      if (hero) {
        const rect = hero.getBoundingClientRect();
        scrollProgress = Math.max(0, Math.min(1, -rect.top / rect.height));
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // === RESIZE ===
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    // === INSTRUCTIONS ===
    const instructions = document.createElement("div");
    instructions.innerHTML = "🖱 Drag to orbit · Click to interact";
    instructions.style.cssText = `
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      color: rgba(136,136,160,0.5);
      font-family: 'Geist Mono', monospace;
      font-size: 11px;
      letter-spacing: 0.05em;
      pointer-events: none;
      transition: opacity 2s;
      text-align: center;
      z-index: 5;
    `;
    container.appendChild(instructions);
    setTimeout(() => {
      instructions.style.opacity = "0";
      setTimeout(() => instructions.remove(), 2000);
    }, 6000);

    // === ANIMATION LOOP ===
    const clock = new THREE.Clock();
    let pulseScale = 1;

    function animate() {
      frameRef.current = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Main mesh rotation
      mainMesh.rotation.x = t * 0.25;
      mainMesh.rotation.y = t * 0.4;

      // Wireframe counter-rotation
      wireMesh.rotation.x = -t * 0.15;
      wireMesh.rotation.y = t * 0.2;

      // Core breathing
      coreMesh.rotation.x = t * 0.6;
      coreMesh.rotation.z = t * 0.3;
      const coreScale = 1 + Math.sin(t * 2) * 0.08;
      coreMesh.scale.set(coreScale, coreScale, coreScale);

      // Main mesh pulse
      mainMat.emissiveIntensity = 0.15 + Math.sin(t * 1.5) * 0.1;

      // Energy rings rotation
      rings.forEach((r) => {
        if (r.axis === "x") r.mesh.rotation.x = t * r.speed;
        else if (r.axis === "y") r.mesh.rotation.y = t * r.speed;
        else r.mesh.rotation.z = t * r.speed;
      });

      // Orbiters
      orbiters.forEach((o) => {
        o.angle += o.speed * 0.012;
        const x = Math.cos(o.angle) * o.radius;
        const z = Math.sin(o.angle) * o.radius;
        const y = 0.5 + Math.sin(t * 0.6 + o.radius) * 1.0 * (1 + Math.abs(o.tilt));
        o.mesh.position.set(x, y, z);
        o.mesh.rotation.x = t * o.rotSpeed + o.angle;
        o.mesh.rotation.y = t * o.rotSpeed * 0.7;
        o.wire.position.copy(o.mesh.position);
        o.wire.rotation.copy(o.mesh.rotation);
      });

      // Particles drift
      particles.rotation.y = t * 0.015;
      particles.rotation.x = Math.sin(t * 0.1) * 0.05;

      // Energy pulse expansion
      if (pulseMat.opacity > 0.01) {
        pulseScale += 0.08;
        pulseMesh.scale.set(pulseScale, pulseScale, pulseScale);
        pulseMat.opacity *= 0.95;
      } else {
        pulseScale = 1;
        pulseMesh.scale.set(1, 1, 1);
      }

      // Scroll-based opacity fade
      const fade = 1 - scrollProgress * 0.6;
      mainMat.opacity = 0.85 * fade;
      wireMat.opacity = 0.12 * fade;
      pMat.opacity = 0.45 * fade;

      controls.update();
      composer.render();
    }
    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("click", onClick);
      controls.dispose();
      container.removeChild(renderer.domElement);
      if (instructions.parentNode) instructions.remove();
      composer.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      style={{ zIndex: 2 }}
      aria-hidden="true"
    />
  );
}
