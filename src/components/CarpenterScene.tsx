"use client";

import { useEffect, useRef } from "react";

type Dimensions = {
  width: number;
  height: number;
  dpr: number;
};

const BASE_ASPECT = 16 / 9;

export default function CarpenterScene() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const dimensionsRef = useRef<Dimensions | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const handleResize = () => {
      const parent = canvas.parentElement;
      const availableWidth = parent?.clientWidth ?? 960;
      const width = availableWidth;
      const height = width / BASE_ASPECT;
      const dpr = window.devicePixelRatio || 1;

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      dimensionsRef.current = { width, height, dpr };
    };

    handleResize();
    const ro = new ResizeObserver(handleResize);
    resizeObserverRef.current = ro;
    ro.observe(canvas.parentElement ?? canvas);

    const render = (timestamp: number) => {
      if (startRef.current === null) {
        startRef.current = timestamp;
      }
      const elapsed = (timestamp - startRef.current) / 1000;
      const dims = dimensionsRef.current;
      if (dims) {
        drawFrame(ctx, dims, elapsed);
      }
      animationRef.current = requestAnimationFrame(render);
    };

    animationRef.current = requestAnimationFrame(render);

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
      resizeObserverRef.current?.disconnect();
    };
  }, []);

  return (
    <div className="w-full">
      <canvas
        ref={canvasRef}
        className="w-full rounded-3xl border border-zinc-200 bg-sky-100 shadow-xl"
      />
    </div>
  );
}

function drawFrame(
  ctx: CanvasRenderingContext2D,
  dims: Dimensions,
  elapsed: number,
) {
  const { width, height, dpr } = dims;
  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  paintSky(ctx, width, height, elapsed);
  paintGround(ctx, width, height, elapsed);
  paintFloatingDust(ctx, width, height, elapsed);
  paintCarpenter(ctx, width, height, elapsed);

  ctx.restore();
}

function paintSky(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  elapsed: number,
) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#9ed8ff");
  gradient.addColorStop(0.45, "#cbe9ff");
  gradient.addColorStop(1, "#f6f3ec");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  const sunX = width * 0.78 + Math.sin(elapsed * 0.25) * width * 0.05;
  const sunY = height * 0.2 + Math.cos(elapsed * 0.3) * height * 0.02;
  const sunRadius = width * 0.06;

  const sunGradient = ctx.createRadialGradient(
    sunX,
    sunY,
    sunRadius * 0.2,
    sunX,
    sunY,
    sunRadius,
  );
  sunGradient.addColorStop(0, "rgba(255,247,201,1)");
  sunGradient.addColorStop(1, "rgba(255,247,201,0)");

  ctx.fillStyle = sunGradient;
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
  ctx.fill();

  const cloudBaseY = height * 0.22;
  const cloudLayerOffset = Math.sin(elapsed * 0.15) * width * 0.02;
  drawCloud(ctx, width * 0.15 + cloudLayerOffset, cloudBaseY, width * 0.12);
  drawCloud(ctx, width * 0.45 - cloudLayerOffset * 0.6, cloudBaseY * 1.2, width * 0.18);
  drawCloud(ctx, width * 0.72 + cloudLayerOffset * 0.9, cloudBaseY * 0.9, width * 0.14);
}

function drawCloud(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
) {
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.45, size * 0.26, 0, 0, Math.PI * 2);
  ctx.ellipse(x - size * 0.35, y + size * 0.1, size * 0.35, size * 0.2, 0, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.3, y + size * 0.05, size * 0.4, size * 0.23, 0, 0, Math.PI * 2);
  ctx.fill();
}

function paintGround(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  elapsed: number,
) {
  const horizonY = height * 0.72;
  const gradient = ctx.createLinearGradient(0, horizonY, 0, height);
  gradient.addColorStop(0, "#d1b48c");
  gradient.addColorStop(0.5, "#b89467");
  gradient.addColorStop(1, "#8c6b40");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, horizonY, width, height - horizonY);

  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = height * 0.002;
  const sway = Math.sin(elapsed * 0.8) * width * 0.01;
  for (let i = 0; i < 6; i += 1) {
    const startX = (i / 5) * width;
    ctx.beginPath();
    ctx.moveTo(startX + sway * (0.2 - i * 0.03), horizonY);
    ctx.lineTo(startX + sway * (0.4 - i * 0.04), height);
    ctx.stroke();
  }

  const stackWidth = width * 0.18;
  const stackHeight = height * 0.12;
  const stackX = width * 0.12;
  const stackY = horizonY - stackHeight * 0.3;

  ctx.fillStyle = "#d7a871";
  roundedRect(ctx, stackX, stackY, stackWidth, stackHeight, stackHeight * 0.1);

  ctx.fillStyle = "#c48b58";
  const plankHeight = stackHeight / 5;
  for (let i = 0; i < 5; i += 1) {
    const y = stackY + i * plankHeight;
    roundedRect(ctx, stackX - stackWidth * 0.07 * (i % 2), y, stackWidth, plankHeight * 0.9, plankHeight * 0.2);
  }
}

function paintFloatingDust(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  elapsed: number,
) {
  const particleCount = 24;
  const horizonY = height * 0.72;
  for (let i = 0; i < particleCount; i += 1) {
    const phase = (i / particleCount) * Math.PI * 2;
    const radius = height * 0.003 + (i % 3) * height * 0.0015;
    const x = width * (0.3 + (i % 6) * 0.1) + Math.sin(elapsed * 1.4 + phase) * width * 0.02;
    const y =
      horizonY -
      height * 0.05 * Math.abs(Math.sin(elapsed * 0.9 + phase * 0.8)) -
      (i % 4) * height * 0.01;
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function paintCarpenter(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  elapsed: number,
) {
  const horizonY = height * 0.72;
  const torsoWidth = width * 0.12;
  const torsoHeight = height * 0.3;
  const legLength = height * 0.25;
  const headRadius = torsoWidth * 0.45;

  const walkCycle = elapsed * 2.2;
  const stride = Math.sin(walkCycle);
  const sway = Math.sin(walkCycle * 0.5) * torsoWidth * 0.08;
  const bob = Math.cos(walkCycle * 2) * height * 0.008;

  const baseX = width * 0.5 + Math.sin(elapsed * 0.35) * width * 0.03;
  const baseY = horizonY - legLength - torsoHeight + bob;

  ctx.save();
  ctx.translate(baseX + sway, baseY);

  // Shadow on ground
  ctx.fillStyle = "rgba(50, 40, 30, 0.25)";
  ctx.beginPath();
  ctx.ellipse(
    0,
    torsoHeight + legLength - bob * 0.5,
    torsoWidth * 0.85,
    torsoWidth * 0.35,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  drawLeg(ctx, torsoWidth, legLength, stride, true);
  drawLeg(ctx, torsoWidth, legLength, -stride * 0.9, false);

  drawTorso(ctx, torsoWidth, torsoHeight);
  drawBelt(ctx, torsoWidth, torsoHeight);
  drawTools(ctx, torsoWidth, torsoHeight, stride);

  drawArmSupport(ctx, torsoWidth, torsoHeight, stride);
  drawArmFree(ctx, torsoWidth, torsoHeight, stride);

  drawWoodPlank(ctx, torsoWidth, torsoHeight);

  drawHead(ctx, headRadius, stride);

  ctx.restore();
}

function drawLeg(
  ctx: CanvasRenderingContext2D,
  torsoWidth: number,
  legLength: number,
  stride: number,
  front: boolean,
) {
  const legWidth = torsoWidth * 0.28;
  const upperLength = legLength * 0.55;
  const lowerLength = legLength * 0.45;
  const hipY = legLength * 0.04;
  const hipOffset = torsoWidth * (front ? 0.2 : -0.2);
  const phase = front ? 1 : -1;

  ctx.save();
  ctx.translate(hipOffset, hipY);

  const upperAngle = (Math.PI / 12) * stride * phase;
  ctx.rotate(upperAngle);

  ctx.fillStyle = front ? "#304b63" : "#223648";
  roundedRect(ctx, -legWidth / 2, 0, legWidth, upperLength, legWidth * 0.3);

  ctx.translate(0, upperLength);
  ctx.rotate((-Math.PI / 10) * stride * phase);

  ctx.fillStyle = front ? "#2a4055" : "#1f2e3f";
  roundedRect(ctx, -legWidth / 2, 0, legWidth, lowerLength, legWidth * 0.25);

  ctx.translate(0, lowerLength);
  ctx.rotate((-Math.PI / 48) * stride);
  ctx.fillStyle = "#5a4332";
  roundedRect(ctx, -legWidth * 0.7, 0, legWidth * 1.4, legWidth * 0.35, legWidth * 0.2);

  ctx.restore();
}

function drawTorso(
  ctx: CanvasRenderingContext2D,
  torsoWidth: number,
  torsoHeight: number,
) {
  const chestHeight = torsoHeight * 0.55;
  const apronHeight = torsoHeight * 0.45;

  ctx.save();
  ctx.fillStyle = "#4a7d9a";
  roundedRect(ctx, -torsoWidth / 2, 0, torsoWidth, chestHeight, torsoWidth * 0.22);

  ctx.translate(0, chestHeight - torsoHeight * 0.08);
  ctx.fillStyle = "#c99356";
  roundedRect(ctx, -torsoWidth * 0.55, 0, torsoWidth * 1.1, apronHeight, torsoWidth * 0.25);
  ctx.restore();
}

function drawBelt(
  ctx: CanvasRenderingContext2D,
  torsoWidth: number,
  torsoHeight: number,
) {
  const beltY = torsoHeight * 0.55;
  const beltHeight = torsoHeight * 0.12;

  ctx.save();
  ctx.translate(0, beltY);
  ctx.fillStyle = "#2f2a25";
  roundedRect(ctx, -torsoWidth * 0.6, 0, torsoWidth * 1.2, beltHeight, beltHeight * 0.45);

  ctx.fillStyle = "#c0a77e";
  roundedRect(
    ctx,
    -torsoWidth * 0.2,
    beltHeight * 0.18,
    torsoWidth * 0.4,
    beltHeight * 0.64,
    beltHeight * 0.3,
  );
  ctx.restore();
}

function drawTools(
  ctx: CanvasRenderingContext2D,
  torsoWidth: number,
  torsoHeight: number,
  stride: number,
) {
  const beltY = torsoHeight * 0.55;
  ctx.save();
  ctx.translate(0, beltY);

  const hammerSwing = Math.sin(stride) * torsoWidth * 0.05;

  // Hammer
  ctx.save();
  ctx.translate(-torsoWidth * 0.45, torsoHeight * 0.08);
  ctx.rotate((-Math.PI / 14) + hammerSwing * 0.02);
  ctx.fillStyle = "#5f4532";
  roundedRect(ctx, -torsoWidth * 0.05, 0, torsoWidth * 0.1, torsoHeight * 0.22, torsoWidth * 0.04);
  ctx.translate(0, torsoHeight * 0.05);
  ctx.fillStyle = "#d5d5d8";
  roundedRect(
    ctx,
    -torsoWidth * 0.16,
    torsoHeight * 0.02,
    torsoWidth * 0.32,
    torsoHeight * 0.07,
    torsoWidth * 0.04,
  );
  ctx.restore();

  // Wrench
  ctx.save();
  ctx.translate(torsoWidth * 0.35, torsoHeight * 0.04);
  ctx.rotate(Math.PI / 10 + hammerSwing * 0.01);
  ctx.fillStyle = "#d4d4d8";
  roundedRect(ctx, -torsoWidth * 0.04, 0, torsoWidth * 0.08, torsoHeight * 0.2, torsoWidth * 0.04);
  ctx.beginPath();
  ctx.arc(0, torsoHeight * 0.03, torsoWidth * 0.08, Math.PI * 0.2, Math.PI * 1.8);
  ctx.lineWidth = torsoWidth * 0.04;
  ctx.strokeStyle = "#d4d4d8";
  ctx.stroke();
  ctx.restore();

  // Tape measure
  ctx.save();
  ctx.translate(-torsoWidth * 0.1, torsoHeight * 0.02);
  ctx.fillStyle = "#ffd761";
  roundedRect(ctx, -torsoWidth * 0.17, torsoHeight * 0.05, torsoWidth * 0.22, torsoHeight * 0.12, torsoWidth * 0.06);
  ctx.fillStyle = "#33312c";
  roundedRect(
    ctx,
    -torsoWidth * 0.09,
    torsoHeight * 0.09,
    torsoWidth * 0.1,
    torsoHeight * 0.04,
    torsoWidth * 0.02,
  );
  ctx.restore();

  ctx.restore();
}

function drawArmSupport(
  ctx: CanvasRenderingContext2D,
  torsoWidth: number,
  torsoHeight: number,
  stride: number,
) {
  const shoulderY = torsoHeight * 0.08;
  const armLength = torsoHeight * 0.78;
  const armWidth = torsoWidth * 0.22;
  const lift = Math.cos(stride) * torsoWidth * 0.05;

  ctx.save();
  ctx.translate(torsoWidth * 0.48, shoulderY - lift);
  ctx.rotate(-Math.PI / 4);
  ctx.fillStyle = "#4a7d9a";
  roundedRect(ctx, -armWidth / 2, 0, armWidth, armLength, armWidth * 0.45);
  ctx.translate(0, armLength);
  ctx.rotate(Math.PI / 6);
  ctx.fillStyle = "#f1c9a1";
  roundedRect(ctx, -armWidth * 0.6, 0, armWidth * 1.2, armWidth * 0.55, armWidth * 0.3);
  ctx.restore();
}

function drawArmFree(
  ctx: CanvasRenderingContext2D,
  torsoWidth: number,
  torsoHeight: number,
  stride: number,
) {
  const shoulderY = torsoHeight * 0.1;
  const armLength = torsoHeight * 0.75;
  const armWidth = torsoWidth * 0.2;
  const swing = Math.sin(stride * 1.3) * Math.PI * 0.08;

  ctx.save();
  ctx.translate(-torsoWidth * 0.45, shoulderY);
  ctx.rotate(Math.PI / 12 + swing);
  ctx.fillStyle = "#4a7d9a";
  roundedRect(ctx, -armWidth / 2, 0, armWidth, armLength * 0.6, armWidth * 0.4);
  ctx.translate(0, armLength * 0.6);
  ctx.rotate(Math.PI / 8 + swing * 0.4);
  ctx.fillStyle = "#f1c9a1";
  roundedRect(ctx, -armWidth * 0.65, 0, armWidth * 1.3, armWidth * 0.55, armWidth * 0.3);

  // Folding rule detail
  ctx.fillStyle = "#ffeaa0";
  roundedRect(ctx, -armWidth * 0.35, armWidth * 0.2, armWidth * 0.7, armWidth * 0.18, armWidth * 0.1);
  ctx.restore();
}

function drawWoodPlank(
  ctx: CanvasRenderingContext2D,
  torsoWidth: number,
  torsoHeight: number,
) {
  const plankLength = torsoWidth * 4.5;
  const plankThickness = torsoWidth * 0.3;
  const plankOffsetY = torsoHeight * -0.35;

  ctx.save();
  ctx.translate(torsoWidth * 0.3, plankOffsetY);
  ctx.rotate(-Math.PI / 12);

  const plankGradient = ctx.createLinearGradient(0, 0, plankLength, plankThickness);
  plankGradient.addColorStop(0, "#e0b178");
  plankGradient.addColorStop(0.5, "#c8924f");
  plankGradient.addColorStop(1, "#b6783b");

  ctx.fillStyle = plankGradient;
  roundedRect(ctx, 0, -plankThickness / 2, plankLength, plankThickness, plankThickness * 0.25);

  ctx.fillStyle = "rgba(110,76,45,0.35)";
  for (let i = 0; i < 4; i += 1) {
    ctx.fillRect(plankLength * (i * 0.2 + 0.1), -plankThickness * 0.45, plankThickness * 0.1, plankThickness * 0.9);
  }

  ctx.restore();
}

function drawHead(
  ctx: CanvasRenderingContext2D,
  headRadius: number,
  stride: number,
) {
  const headTilt = Math.sin(stride * 0.8) * 0.12;

  ctx.save();
  ctx.translate(0, -headRadius * 0.3);
  ctx.rotate(headTilt);

  // Neck
  ctx.fillStyle = "#f1c9a1";
  roundedRect(ctx, -headRadius * 0.2, 0, headRadius * 0.4, headRadius * 0.6, headRadius * 0.2);

  ctx.translate(0, -headRadius * 1.1);
  ctx.fillStyle = "#f4cfad";
  ctx.beginPath();
  ctx.arc(0, 0, headRadius, 0, Math.PI * 2);
  ctx.fill();

  // Facial features
  ctx.fillStyle = "#382315";
  const eyeOffsetX = headRadius * 0.35;
  const eyeOffsetY = -headRadius * 0.1;
  ctx.beginPath();
  ctx.arc(eyeOffsetX, eyeOffsetY, headRadius * 0.08, 0, Math.PI * 2);
  ctx.arc(-eyeOffsetX * 0.8, eyeOffsetY, headRadius * 0.075, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#382315";
  ctx.lineWidth = headRadius * 0.08;
  ctx.beginPath();
  ctx.moveTo(-headRadius * 0.6, headRadius * 0.2);
  ctx.quadraticCurveTo(0, headRadius * 0.55, headRadius * 0.5, headRadius * 0.1);
  ctx.stroke();

  // Helmet
  ctx.fillStyle = "#dfa24c";
  ctx.beginPath();
  ctx.arc(0, -headRadius * 0.2, headRadius * 1.05, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(
    -headRadius * 1.05,
    -headRadius * 0.2,
    headRadius * 2.1,
    headRadius * 0.45,
  );
  ctx.fillStyle = "#f4c77a";
  ctx.fillRect(
    -headRadius * 0.9,
    -headRadius * 0.1,
    headRadius * 1.8,
    headRadius * 0.18,
  );

  ctx.restore();
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
}
