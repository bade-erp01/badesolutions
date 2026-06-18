"use client"
import React, { useRef, useEffect } from "react";

export default function ParticleBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let particles = [];
    let raf = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const create = () => {
      particles = [];
      const count = Math.max(60, Math.floor(window.innerWidth / 14));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2.6 + 0.6,
          speedX: Math.random() * 0.6 - 0.3,
          speedY: Math.random() * 0.6 - 0.3,
          opacity: Math.random() * 0.35 + 0.08,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 0, 0, ${p.opacity})`;
        ctx.fill();
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
        if (p.y < -10) p.y = canvas.height + 10;
        if (p.y > canvas.height + 10) p.y = -10;
        p.opacity = Math.max(
          0.04,
          Math.sin(Date.now() / 1800 + i) * 0.08 + 0.14
        );
      });
      raf = requestAnimationFrame(draw);
    };

    const onResize = () => {
      resize();
      create();
    };

    resize();
    create();
    draw();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 opacity-80"
      style={{ mixBlendMode: "multiply" }}
    />
  );
}
