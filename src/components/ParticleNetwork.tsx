"use client";

import { useEffect, useRef, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default function ParticleNetwork() {
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  const handleInteraction = useCallback(() => {
    // Reset orbit controls auto-rotate when user interacts
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 1, 16);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // === ORBIT CONTROLS — drag to rotate! ===
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.2;
    controls.minDistance = 6;
    controls.maxDistance = 30;
    controls.maxPolarAngle = Math.PI / 2.2;
    controls.target.set(0, 0.5, 0);
    controlsRef.current = controls;

    // === MAIN 3D OBJECT: Torus Knot ===
    const knotGeo = new THREE.TorusKnotGeometry(2.2, 0.7, 128, 16);
    const knotMat = new THREE.MeshPhysicalMaterial({
      color: "#14d9c4",
      metalness: 0.9,
      roughness: 0.15,
      clearcoat: 0.4,
      transparent: true,
      opacity: 0.9,
      emissive: "#14d9c4",
      emissiveIntensity: 0.15,
    });
    const knot = new THREE.Mesh(knotGeo, knotMat);
    knot.position.set(0, 0.5, 0);
    knot.userData.isClickable = true;
    knot.userData.originalColor = "#14d9c4";
    scene.add(knot);

    // Wireframe overlay
    const knotWireGeo = new THREE.TorusKnotGeometry(2.4, 0.8, 64, 8);
    const knotWireMat = new THREE.MeshPhysicalMaterial({
      color: "#6ee7d6",
      wireframe: true,
      transparent: true,
      opacity: 0.2,
      emissive: "#14d9c4",
      emissiveIntensity: 0.05,
    });
    const knotWire = new THREE.Mesh(knotWireGeo, knotWireMat);
    knotWire.position.set(0, 0.5, 0);
    scene.add(knotWire);

    // Glow ring
    const glowGeo = new THREE.RingGeometry(2.8, 3.5, 64);
    const glowMat = new THREE.MeshBasicMaterial({
      color: "#14d9c4",
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const glowRing = new THREE.Mesh(glowGeo, glowMat);
    glowRing.position.set(0, 0.5, -1);
    scene.add(glowRing);

    // === ORBITING ICOSAHEDRONS ===
    const orbiters: { mesh: THREE.Mesh; wireframe: THREE.Mesh; radius: number; angle: number; speed: number; tilt: number }[] = [];

    function createOrbiter(size: number, color: string, radius: number, speed: number, tilt: number) {
      const geo = new THREE.IcosahedronGeometry(size, 0);
      const mat = new THREE.MeshPhysicalMaterial({
        color,
        metalness: 0.7,
        roughness: 0.2,
        transparent: true,
        opacity: 0.7,
        emissive: color,
        emissiveIntensity: 0.1,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.userData.isClickable = true;
      mesh.userData.originalColor = color;
      scene.add(mesh);

      const wfGeo = new THREE.IcosahedronGeometry(size * 1.3, 0);
      const wfMat = new THREE.MeshBasicMaterial({
        color,
        wireframe: true,
        transparent: true,
        opacity: 0.15,
      });
      const wfMesh = new THREE.Mesh(wfGeo, wfMat);
      scene.add(wfMesh);

      const entry = {
        mesh,
        wireframe: wfMesh,
        radius,
        angle: Math.random() * Math.PI * 2,
        speed,
        tilt,
      };
      orbiters.push(entry);
      return entry;
    }

    createOrbiter(0.6, "#6ee7d6", 5.5, 0.4, 0.3);
    createOrbiter(0.4, "#7c3aed", 4.2, -0.3, -0.2);
    createOrbiter(0.5, "#14d9c4", 6.8, 0.25, 0.5);
    createOrbiter(0.3, "#f0c", 3.5, -0.5, -0.4);
    createOrbiter(0.7, "#6ee7d6", 8.0, 0.15, 0.6);

    // === PARTICLES ===
    const particleCount = 1200;
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
      pos[i] = (Math.random() - 0.5) * 50;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const pMat = new THREE.PointsMaterial({
      size: 0.06,
      color: "#14d9c4",
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // === CONNECTION LINES ===
    const lineMat = new THREE.LineBasicMaterial({
      color: "#14d9c4",
      transparent: true,
      opacity: 0.05,
      depthWrite: false,
    });
    const linePositions = new Float32Array(particleCount * 6);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
    lineGeo.setDrawRange(0, 0);

    function updateLines() {
      const p = pGeo.attributes.position.array as Float32Array;
      const maxDist = 5;
      const conn: number[] = [];
      for (let i = 0; i < particleCount && conn.length < 6000; i++) {
        for (let j = i + 1; j < particleCount && conn.length < 6000; j++) {
          const dx = p[i * 3] - p[j * 3];
          const dy = p[i * 3 + 1] - p[j * 3 + 1];
          const dz = p[i * 3 + 2] - p[j * 3 + 2];
          if (dx * dx + dy * dy + dz * dz < maxDist * maxDist) {
            conn.push(p[i * 3], p[i * 3 + 1], p[i * 3 + 2], p[j * 3], p[j * 3 + 1], p[j * 3 + 2]);
          }
        }
      }
      if (conn.length > 0) {
        lineGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(conn), 3));
        lineGeo.setDrawRange(0, conn.length / 3);
      }
    }
    updateLines();
    const lineSegments = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(lineSegments);

    // === RAYCASTER — KLIK INTERACTIVE ===
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const clickableObjects: THREE.Mesh[] = [];

    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.userData.isClickable) {
        clickableObjects.push(child);
      }
    });

    function getClickableMeshes(): THREE.Mesh[] {
      return clickableObjects;
    }

    const onClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(getClickableMeshes());

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        const mat = hit.material as THREE.MeshPhysicalMaterial;
        const orig = hit.userData.originalColor as string;

        // Flash effect: change color momentarily
        mat.color.setHex(Math.random() * 0xffffff);
        mat.emissive.setHex(Math.random() * 0xffffff);
        mat.emissiveIntensity = 0.8;

        // Scale bounce
        const origScale = hit.scale.x;
        hit.scale.set(1.3, 1.3, 1.3);

        setTimeout(() => {
          mat.color.set(orig);
          mat.emissive.set(orig);
          mat.emissiveIntensity = 0.1;
          hit.scale.set(origScale, origScale, origScale);
        }, 400);

        // Also change knot wireframe color for fun
        knotWireMat.color.setHex(Math.random() * 0xffffff);
      }
    };

    renderer.domElement.style.cursor = "grab";
    renderer.domElement.addEventListener("click", onClick);

    // === MOUSE PARALLAX (subtle, secondary to OrbitControls) ===
    const mouse = { x: 0, y: 0 };
    const onMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onMouseMove);

    // === RESIZE ===
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    // === INSTRUCTIONS OVERLAY ===
    const instructions = document.createElement("div");
    instructions.id = "interact-hint";
    instructions.innerHTML = "🖱 Drag to orbit · Click to interact";
    instructions.style.cssText = `
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      color: rgba(136,136,160,0.6);
      font-family: 'Geist Mono', monospace;
      font-size: 11px;
      letter-spacing: 0.05em;
      pointer-events: none;
      transition: opacity 2s;
      text-align: center;
      z-index: 5;
    `;
    container.appendChild(instructions);

    // Fade out instructions after 6 seconds
    setTimeout(() => {
      instructions.style.opacity = "0";
      setTimeout(() => instructions.remove(), 2000);
    }, 6000);

    // === ANIMATION ===
    const clock = new THREE.Clock();
    const target = { x: 0, y: 0 };

    function animate() {
      requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Torus knot self-rotation (even with OrbitControls, the object rotates internally)
      knot.rotation.x = t * 0.3;
      knot.rotation.y = t * 0.5;
      knotWire.rotation.x = t * 0.35;
      knotWire.rotation.y = t * 0.55;
      glowRing.rotation.z = t * 0.1;

      // Pulse glow
      knotMat.emissiveIntensity = 0.1 + Math.sin(t * 1.5) * 0.08;
      glowMat.opacity = 0.06 + Math.sin(t * 2) * 0.03;

      // Orbiters (in local space, not affected by OrbitControls)
      orbiters.forEach((o) => {
        o.angle += o.speed * 0.01;
        const x = Math.cos(o.angle) * o.radius;
        const z = Math.sin(o.angle) * o.radius;
        o.mesh.position.set(x, 0.5 + Math.sin(t * 0.8 + o.radius) * 0.8, z);
        o.mesh.rotation.x = t * 0.5 + o.angle;
        o.mesh.rotation.y = t * 0.3 + o.angle;
        o.wireframe.position.copy(o.mesh.position);
        o.wireframe.rotation.copy(o.mesh.rotation);
      });

      // Particles slow rotation
      particles.rotation.y = t * 0.008;
      lineSegments.rotation.y = t * 0.008;

      // Subtle mouse parallax on the knot itself (when not dragging)
      if (!controls.enabled) {
        target.x += (mouse.x * 2 - target.x) * 0.03;
        target.y += (-mouse.y * 2 - target.y) * 0.03;
      }

      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("click", onClick);
      controls.dispose();
      container.removeChild(renderer.domElement);
      if (document.getElementById("interact-hint")) {
        instructions.remove();
      }
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
