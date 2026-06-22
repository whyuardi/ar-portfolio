'use client';

import { useEffect, useRef } from 'react';

export default function ThreeBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!containerRef.current || cleanupRef.current) return;

    let cancelled = false;

    const init = async () => {
      const THREE = await import('three');
      const { OrbitControls } = await import('three/addons/controls/OrbitControls.js');
      const { EffectComposer } = await import('three/addons/postprocessing/EffectComposer.js');
      const { RenderPass } = await import('three/addons/postprocessing/RenderPass.js');
      const { UnrealBloomPass } = await import('three/addons/postprocessing/UnrealBloomPass.js');

      if (cancelled || !containerRef.current) return;

      const container = containerRef.current;
      const w = window.innerWidth;
      const h = window.innerHeight;

      // Scene
      const scene = new THREE.Scene();

      // Camera
      const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
      camera.position.set(0, 0, 5);

      // Renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.0;
      container.appendChild(renderer.domElement);

      // Bloom
      const composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      const bloomPass = new UnrealBloomPass(new THREE.Vector2(w, h), 0.8, 0.4, 0.85);
      composer.addPass(bloomPass);

      // Lights
      scene.add(new THREE.AmbientLight(0x404060, 0.5));
      const dirLight = new THREE.DirectionalLight(0xffffff, 1);
      dirLight.position.set(3, 5, 4);
      scene.add(dirLight);
      const pLight1 = new THREE.PointLight(0x14d9c4, 3, 10);
      pLight1.position.set(-3, 2, 2);
      scene.add(pLight1);
      const pLight2 = new THREE.PointLight(0x7c3aed, 2, 10);
      pLight2.position.set(3, -2, -2);
      scene.add(pLight2);

      // Main object: Torus Knot
      const geo = new THREE.TorusKnotGeometry(1, 0.35, 200, 32, 2, 3);
      const mat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.9,
        roughness: 0.05,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
        envMapIntensity: 1.5,
        emissive: 0x14d9c4,
        emissiveIntensity: 0.15,
      });
      const mesh = new THREE.Mesh(geo, mat);
      scene.add(mesh);

      // Orbit ring 1
      const ringGeo = new THREE.TorusGeometry(2, 0.008, 16, 200);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x14d9c4, transparent: true, opacity: 0.5 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI * 0.4;
      scene.add(ring);

      // Orbit ring 2
      const ring2Geo = new THREE.TorusGeometry(2.5, 0.005, 16, 200);
      const ring2Mat = new THREE.MeshBasicMaterial({ color: 0x7c3aed, transparent: true, opacity: 0.3 });
      const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
      ring2.rotation.x = -Math.PI * 0.3;
      ring2.rotation.y = Math.PI * 0.2;
      scene.add(ring2);

      // Particles
      const pCount = 300;
      const pPos = new Float32Array(pCount * 3);
      for (let i = 0; i < pCount; i++) {
        const r = 3 + Math.random() * 4;
        const t = Math.random() * Math.PI * 2;
        const p = Math.acos(2 * Math.random() - 1);
        pPos[i * 3] = r * Math.sin(p) * Math.cos(t);
        pPos[i * 3 + 1] = r * Math.sin(p) * Math.sin(t);
        pPos[i * 3 + 2] = r * Math.cos(p);
      }
      const pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
      const pMat = new THREE.PointsMaterial({
        size: 0.02,
        color: 0x14d9c4,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      scene.add(new THREE.Points(pGeo, pMat));

      // Mouse tracking
      let mx = 0, my = 0;
      const onMouseMove = (e: MouseEvent) => {
        mx = (e.clientX / window.innerWidth - 0.5) * 2;
        my = (e.clientY / window.innerHeight - 0.5) * 2;
      };
      window.addEventListener('mousemove', onMouseMove);

      // Scroll tracking
      let scrollProgress = 0;
      const onScroll = () => {
        scrollProgress = window.scrollY / (document.body.scrollHeight - window.innerHeight || 1);
      };
      window.addEventListener('scroll', onScroll, { passive: true });

      // Animate
      let frameId: number;
      const animate = () => {
        frameId = requestAnimationFrame(animate);
        const t = performance.now() * 0.001;

        mesh.rotation.x = t * 0.2 + my * 0.3;
        mesh.rotation.y = t * 0.3 + mx * 0.3;

        // Zoom out slightly as user scrolls
        camera.position.z = 5 + scrollProgress * 2;

        ring.rotation.z = t * 0.1;
        ring2.rotation.z = -t * 0.08;

        composer.render();
      };
      animate();

      // Resize
      const onResize = () => {
        const w2 = window.innerWidth;
        const h2 = window.innerHeight;
        camera.aspect = w2 / h2;
        camera.updateProjectionMatrix();
        renderer.setSize(w2, h2);
        composer.setSize(w2, h2);
      };
      window.addEventListener('resize', onResize);

      cleanupRef.current = () => {
        cancelAnimationFrame(frameId);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onResize);
        renderer.dispose();
        container.removeChild(renderer.domElement);
      };
    };

    init();

    return () => {
      cancelled = true;
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ background: '#0a0a0f' }}
    />
  );
}
