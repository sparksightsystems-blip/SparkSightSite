const canvas = document.querySelector(".heat-canvas");
const ctx = canvas.getContext("2d");

// Set canvas size to match container or window
function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width || window.innerWidth;
  canvas.height = rect.height || window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Heat "targets" in normalized coordinates (0..1)
const points = [
  { x: 0.35, y: 0.55, base: 0.9 },
  { x: 0.52, y: 0.48, base: 0.7 },
  { x: 0.68, y: 0.62, base: 0.8 },
  { x: 0.60, y: 0.40, base: 0.55 },
];

// Convert value -> color (green -> yellow -> purple edges vibe)
function heatColor(t) {
  // t in [0,1]
  const clamp = (v) => Math.max(0, Math.min(1, v));
  t = clamp(t);

  let r = 0, g = 0, b = 0, a = 1;

  if (t < 0.6) {
    r = 60;
    g = 220;
    b = 140;
    a = 0.55;
  } else if (t < 0.85) {
    r = 210;
    g = 210;
    b = 50;
    a = 0.60;
  } else {
    r = 60;
    g = 250;
    b = 160;
    a = 0.75;
  }
  return `rgba(${r},${g},${b},${a})`;
}

function draw() {
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const time = performance.now() / 1000;

  // Subtle drift to simulate camera motion
  const driftX = Math.sin(time * 0.35) * 0.02;
  const driftY = Math.cos(time * 0.28) * 0.02;

  // Purple "halo"
  for (const p of points) {
    const px = (p.x + driftX) * w;
    const py = (p.y + driftY) * h;
    const pulse = 0.5 + 0.5 * Math.sin(time * 2.0 + (p.x + p.y) * 10.0);
    const r = (140 + 90 * p.base) * (0.95 + 0.08 * pulse);

    const grad = ctx.createRadialGradient(px, py, 0, px, py, r);
    grad.addColorStop(0.00, heatColor(0.95 * p.base));
    grad.addColorStop(0.35, heatColor(0.70 * p.base));
    grad.addColorStop(0.70, "rgba(150,60,220,0.28)"); // purple edge
    grad.addColorStop(1.00, "rgba(150,60,220,0.00)");

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fill();
  }

  requestAnimationFrame(draw);
}
draw();

