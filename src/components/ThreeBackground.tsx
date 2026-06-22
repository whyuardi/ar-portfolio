"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreeBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x08080f);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Main torus knot with metallic amber
    const geometry = new THREE.TorusKnotGeometry(1.2, 0.4, 128, 32);
    const material = new THREE.MeshPhysicalMaterial({
      color: 0xd48c1e,
      metalness: 0.85,
      roughness: 0.15,
      clearcoat: 0.3,
      clearcoatRoughness: 0.2,
      emissive: 0xd48c1e,
      emissiveIntensity: 0.08,
      envMapIntensity: 1.5,
    });
    const torusKnot = new THREE.Mesh(geometry, material);
    scene.add(torusKnot);

    // Inner ring
    const ringGeo = new THREE.TorusGeometry(1.6, 0.02, 32, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xd48c1e,
      transparent: true,
      opacity: 0.3,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 3;
    ring.rotation.z = Math.PI / 4;
    scene.add(ring);

    // Outer rings
    const outerRingMat = new THREE.MeshBasicMaterial({
      color: 0xd48c1e,
      transparent: true,
      opacity: 0.1,
      wireframe: true,
    });
    const outerRing = new THREE.Mesh(
      new THREE.TorusGeometry(2.2, 0.015, 16, 100),
      outerRingMat
    );
    outerRing.rotation.x = Math.PI / 2;
    outerRing.rotation.z = Math.PI / 3;
    scene.add(outerRing);

    // Particles
    const particleCount = 2000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const radius = 4 + Math.random() * 6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const brightness = 0.3 + Math.random() * 0.7;
      colors[i * 3] = brightness * 0.83;
      colors[i * 3 + 1] = brightness * 0.55;
      colors[i * 3 + 2] = brightness * 0.12;

      sizes[i] = 0.02 + Math.random() * 0.04;
    }

    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particlesGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    particlesGeo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const particlesMat = new THREE.PointsMaterial({
      size: 0.04,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const particles = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particles);

    // Mouse interaction
    const mouse = { x: 0, y: 0 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / width - 0.5) * 2;
      mouse.y = -(e.clientY / height - 0.5) * 2;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Resize
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // Animation
    let frame: number;
    const animate = () => {
      frame = requestAnimationFrame(animate);

      torusKnot.rotation.x += 0.005;
      torusKnot.rotation.y += 0.008;

      ring.rotation.x += 0.003;
      ring.rotation.z += 0.002;
      outerRing.rotation.x += 0.001;
      outerRing.rotation.z += 0.002;

      particles.rotation.y += 0.0003;

      // Smooth follow mouse
      torusKnot.rotation.x += (mouse.y * 0.2 - torusKnot.rotation.x) * 0.01;
      torusKnot.rotation.y += (mouse.x * 0.3 - torusKnot.rotation.y) * 0.01;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      container.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0"
      style={{ maskImage: "linear-gradient(to bottom, black 60%, transparent 95%)", WebkitMaskImage: "linear-gradient(to bottom, black 60%, transparent 95%)" }}
    />
  );
}
