"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ParticleNetwork() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#06060b");

    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 35;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // --- Particles ---
    const particleCount = 1800;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 80;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.08,
      color: "#14d9c4",
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // --- Connection Lines ---
    const linesMat = new THREE.LineBasicMaterial({
      color: "#14d9c4",
      transparent: true,
      opacity: 0.08,
    });

    // --- Floating Geometry Nodes ---
    const geometries: { mesh: THREE.Mesh; rotSpeed: number; floatSpeed: number; floatAmp: number; baseY: number }[] = [];

    function createIcosahedron(size: number, color: string, x: number, y: number, z: number, wireframe = false) {
      const geo = new THREE.IcosahedronGeometry(size, 0);
      const mat = new THREE.MeshPhysicalMaterial({
        color,
        wireframe,
        metalness: 0.9,
        roughness: 0.1,
        transparent: true,
        opacity: wireframe ? 0.15 : 0.4,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      scene.add(mesh);
      return mesh;
    }

    function createTorusKnot(size: number, color: string, x: number, y: number, z: number) {
      const geo = new THREE.TorusKnotGeometry(size * 0.6, size * 0.2, 64, 8);
      const mat = new THREE.MeshPhysicalMaterial({
        color,
        metalness: 0.7,
        roughness: 0.2,
        transparent: true,
        opacity: 0.3,
        wireframe: true,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      scene.add(mesh);
      return mesh;
    }

    function createOctahedron(size: number, color: string, x: number, y: number, z: number) {
      const geo = new THREE.OctahedronGeometry(size);
      const mat = new THREE.MeshPhysicalMaterial({
        color,
        metalness: 0.3,
        roughness: 0.6,
        transparent: true,
        opacity: 0.2,
        wireframe: true,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      scene.add(mesh);
      return mesh;
    }

    // Central icosahedron (main feature)
    const centerMesh = createIcosahedron(3.5, "#14d9c4", 0, 0, 0);
    const centerMeshWire = createIcosahedron(3.8, "#14d9c4", 0, 0, 0, true);
    geometries.push({ mesh: centerMesh, rotSpeed: 0.003, floatSpeed: 0.5, floatAmp: 0.3, baseY: 0 });
    geometries.push({ mesh: centerMeshWire, rotSpeed: -0.005, floatSpeed: 0.5, floatAmp: 0.3, baseY: 0 });

    // Orbiting elements
    const orbiters = [
      { mesh: createTorusKnot(2, "#6ee7d6", 8, 2, -3), rotSpeed: 0.01, floatSpeed: 0.7, floatAmp: 0.5, baseY: 2 },
      { mesh: createOctahedron(2, "#14d9c4", -7, -3, 4), rotSpeed: 0.008, floatSpeed: 0.3, floatAmp: 0.4, baseY: -3 },
      { mesh: createIcosahedron(1.5, "#6ee7d6", 5, -4, -6, true), rotSpeed: -0.006, floatSpeed: 0.6, floatAmp: 0.6, baseY: -4 },
      { mesh: createTorusKnot(1.5, "#6ee7d6", -6, 3, -5), rotSpeed: 0.012, floatSpeed: 0.4, floatAmp: 0.3, baseY: 3 },
    ];

    geometries.push(...orbiters);

    // --- Mouse tracking ---
    const mouse = { x: 0, y: 0 };
    const onMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onMouseMove);

    // --- Resize ---
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    // --- Line connections (nearby particles) ---
    const lineBuffer = new Float32Array(particleCount * 6); // max 2 per particle
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.BufferAttribute(lineBuffer, 3));
    lineGeo.setDrawRange(0, 0);

    const updateLines = () => {
      const pos = particleGeo.attributes.position.array as Float32Array;
      const maxDist = 4;
      const connections: number[] = [];

      for (let i = 0; i < particleCount; i++) {
        const xi = pos[i * 3];
        const yi = pos[i * 3 + 1];
        const zi = pos[i * 3 + 2];

        for (let j = i + 1; j < particleCount; j++) {
          const dx = xi - pos[j * 3];
          const dy = yi - pos[j * 3 + 1];
          const dz = zi - pos[j * 3 + 2];
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < maxDist) {
            connections.push(xi, yi, zi, pos[j * 3], pos[j * 3 + 1], pos[j * 3 + 2]);
            if (connections.length >= 6000) break; // performance limit
          }
        }
        if (connections.length >= 6000) break;
      }

      const count = connections.length / 3;
      if (count > 0) {
        const buf = new Float32Array(connections);
        lineGeo.setAttribute("position", new THREE.BufferAttribute(buf, 3));
        lineGeo.setDrawRange(0, count);
      }
    };
    updateLines();

    const lines = new THREE.LineSegments(lineGeo, linesMat);
    scene.add(lines);

    // --- Animation ---
    const clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Rotate particles slowly
      particles.rotation.y = t * 0.015;
      particles.rotation.x = Math.sin(t * 0.01) * 0.1;

      // Animate geometry nodes
      geometries.forEach((g) => {
        g.mesh.rotation.x += g.rotSpeed;
        g.mesh.rotation.y += g.rotSpeed * 1.3;
        g.mesh.position.y = g.baseY + Math.sin(t * g.floatSpeed) * g.floatAmp;
      });

      // Mouse parallax
      camera.position.x += (mouse.x * 3 - camera.position.x) * 0.02;
      camera.position.y += (-mouse.y * 3 - camera.position.y) * 0.02;
      camera.lookAt(0, 0, 0);

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
      className="absolute inset-0 z-0"
      aria-hidden="true"
    />
  );
}
