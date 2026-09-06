export function renderSparkline(canvas: HTMLCanvasElement, data: number[], isPositive = true): void {
  const ctx = canvas.getContext('2d');
  if (!ctx || data.length < 2) return;

  const width = canvas.width;
  const height = canvas.height;

  ctx.clearRect(0, 0, width, height);

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min === 0 ? 1 : max - min;
  const padding = 4;

  const points = data.map((val, idx) => {
    const x = padding + (idx / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((val - min) / range) * (height - padding * 2);
    return { x, y };
  });

  // Gradient fill
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  const strokeColor = isPositive ? '#22c55e' : '#ef4444';
  const fillColor = isPositive ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)';

  gradient.addColorStop(0, fillColor);
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }

  // Stroke line
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Fill area under line
  ctx.lineTo(points[points.length - 1].x, height);
  ctx.lineTo(points[0].x, height);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();
}
