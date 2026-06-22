"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ParticleNetwork() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 18;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // === MAIN 3D OBJECT: Torus Knot (center, prominent) ===
    const knotGeo = new THREE.TorusKnotGeometry(2.2, 0.7, 128, 16);
    const knotMat = new THREE.MeshPhysicalMaterial({
      color: "#14d9c4",
      metalness: 0.9,
      roughness: 0.15,
      clearcoat: 0.4,
      transparent: true,
      opacity: 0.85,
      emissive: "#14d9c4",
      emissiveIntensity: 0.15,
    });
    const knot = new THREE.Mesh(knotGeo, knotMat);
    knot.position.set(0, 0.5, 0);
    scene.add(knot);

    // Wireframe overlay
    const knotWireGeo = new THREE.TorusKnotGeometry(2.4, 0.8, 64, 8);
    const knotWireMat = new THREE.MeshPhysicalMaterial({
      color: "#6ee7d6",
      wireframe: true,
      transparent: true,
      opacity: 0.25,
      emissive: "#14d9c4",
      emissiveIntensity: 0.05,
    });
    const knotWire = new THREE.Mesh(knotWireGeo, knotWireMat);
    knotWire.position.set(0, 0.5, 0);
    scene.add(knotWire);

    // Glow ring around knot
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

    // === ORBITING GEOMETRIES ===
    const orbiters: { mesh: THREE.Mesh; radius: number; angle: number; speed: number; tilt: number }[] = [];

    function createOrbiter(size: number, color: string, radius: number, speed: number, tilt: number) {
      const geo = new THREE.IcosahedronGeometry(size, 0);
      const mat = new THREE.MeshPhysicalMaterial({
        color,
        metalness: 0.7,
        roughness: 0.2,
        transparent: true,
        opacity: 0.6,
        emissive: color,
        emissiveIntensity: 0.1,
      });
      const mesh = new THREE.Mesh(geo, mat);
      scene.add(mesh);

      // Wireframe shell
      const wfGeo = new THREE.IcosahedronGeometry(size * 1.3, 0);
      const wfMat = new THREE.MeshBasicMaterial({
        color,
        wireframe: true,
        transparent: true,
        opacity: 0.15,
      });
      const wfMesh = new THREE.Mesh(wfGeo, wfMat);
      scene.add(wfMesh);

      orbiters.push({
        mesh,
        radius,
        angle: Math.random() * Math.PI * 2,
        speed,
        tilt,
      });
      orbiters.push({
        mesh: wfMesh,
        radius: radius + 0.3,
        angle: Math.random() * Math.PI * 2,
        speed: speed * -0.7,
        tilt,
      });
    }

    createOrbiter(0.6, "#6ee7d6", 5.5, 0.4, 0.3);
    createOrbiter(0.4, "#7c3aed", 4.2, -0.3, -0.2);
    createOrbiter(0.5, "#14d9c4", 6.8, 0.25, 0.5);
    createOrbiter(0.3, "#f0c", 3.5, -0.5, -0.4);
    createOrbiter(0.7, "#6ee7d6", 8.0, 0.15, 0.6);

    // === AMBIENT PARTICLES ===
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
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // === CONNECTION LINES ===
    const lineMat = new THREE.LineBasicMaterial({
      color: "#14d9c4",
      transparent: true,
      opacity: 0.06,
      depthWrite: false,
    });
    const linePositions = new Float32Array(particleCount * 6);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
    lineGeo.setDrawRange(0, 0);

    function updateLines() {
      const p = particleGeo.attributes.position.array as Float32Array;
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

    const particleGeo = pGeo;
    updateLines();
    const lineSegments = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(lineSegments);

    // === MOUSE ===
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

    // === TARGET POSITION FOR SMOOTH FOLLOW ===
    const target = { x: 0, y: 0 };

    // === ANIMATION ===
    const clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Torus knot rotation
      knot.rotation.x = t * 0.3;
      knot.rotation.y = t * 0.5;
      knotWire.rotation.x = t * 0.35;
      knotWire.rotation.y = t * 0.55;
      glowRing.rotation.z = t * 0.1;

      // Pulse glow
      knotMat.emissiveIntensity = 0.1 + Math.sin(t * 1.5) * 0.08;
      glowMat.opacity = 0.06 + Math.sin(t * 2) * 0.03;

      // Orbiters
      orbiters.forEach((o) => {
        o.angle += o.speed * 0.01;
        const x = Math.cos(o.angle) * o.radius;
        const z = Math.sin(o.angle) * o.radius;
        o.mesh.position.set(x, 0.5 + Math.sin(t * 0.8 + o.radius) * 0.8, z);
        o.mesh.rotation.x = t * 0.5 + o.angle;
        o.mesh.rotation.y = t * 0.3 + o.angle;
      });

      // Particles slow rotation
      particles.rotation.y = t * 0.008;
      lineSegments.rotation.y = t * 0.008;

      // Mouse parallax smooth follow
      target.x += (mouse.x * 2 - target.x) * 0.03;
      target.y += (-mouse.y * 2 - target.y) * 0.03;
      knot.position.x = target.x * 0.3;
      knot.position.y = 0.5 + target.y * 0.3;
      knotWire.position.x = target.x * 0.3;
      knotWire.position.y = 0.5 + target.y * 0.3;
      glowRing.position.x = target.x * 0.3;
      glowRing.position.y = 0.5 + target.y * 0.3;

      renderer.render(scene, camera);
    }
    animate();

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      container.removeChild(renderer.domElement);
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
