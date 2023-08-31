<template>
  <div
    class="relative grid min-h-screen grid-cols-1 overflow-hidden md:grid-cols-3 lg:grid-cols-2 divide-x divide-zinc-800"
  >
    <div
      class="container absolute flex items-center col-span-1 -translate-y-1/2 top-1/2 md:static md:top-0 md:col-span-2 md:flex md:translate-y-0 lg:col-span-1"
    >
      <div class="mx-auto flex w-full flex-col justify-center space-y-6 px-6 md:px-0 sm:w-[500px]">
        <slot />
      </div>
    </div>
    <div
      class="hidden relative md:flex items-center justify-center bg-white md:bg-black h-screen bg-gradient-to-t from-blue-400/0 to-blue-400/20"
    >
      <div class="absolute inset-0 h-screen" aria-hidden="true">
        <canvas ref="canvas" />
      </div>
    </div>

    <UNotifications />
  </div>
</template>

<script setup lang="ts">
const canvas = ref<HTMLCanvasElement>();

type Circle = {
  x: number;
  y: number;
  translateX: number;
  translateY: number;
  size: number;
  alpha: number;
  targetAlpha: number;
  dx: number;
  dy: number;
  magnetism: number;
};

// Particle animation from https://cruip.com/how-to-create-a-beautiful-particle-animation-with-html-canvas/
class ParticleAnimation {
  canvas: HTMLCanvasElement;
  mouse: { x: number; y: number };
  canvasContainer: HTMLElement;
  context: CanvasRenderingContext2D;
  dpr: number;
  settings: { quantity: number; staticity: number; ease: number };
  circles: Circle[];
  canvasSize: { w: number; h: number };

  constructor(el: HTMLCanvasElement, { quantity = 30, staticity = 50, ease = 50 } = {}) {
    this.canvas = el;
    const context = this.canvas.getContext('2d');
    if (!this.canvas || !this.canvas.parentElement || !context) {
      throw new Error('Canvas not found');
    }
    this.canvasContainer = this.canvas.parentElement;
    this.context = context;
    this.dpr = window.devicePixelRatio || 1;
    this.settings = {
      quantity,
      staticity,
      ease,
    };
    this.circles = [];
    this.mouse = {
      x: 0,
      y: 0,
    };
    this.canvasSize = {
      w: 0,
      h: 0,
    };
    this.onMouseMove = this.onMouseMove.bind(this);
    this.initCanvas = this.initCanvas.bind(this);
    this.resizeCanvas = this.resizeCanvas.bind(this);
    this.drawCircle = this.drawCircle.bind(this);
    this.drawParticles = this.drawParticles.bind(this);
    this.remapValue = this.remapValue.bind(this);
    this.animate = this.animate.bind(this);
    this.init();
  }

  init() {
    this.initCanvas();
    this.animate();
    window.addEventListener('resize', this.initCanvas);
    window.addEventListener('mousemove', this.onMouseMove);
  }

  initCanvas() {
    this.resizeCanvas();
    this.drawParticles();
  }

  onMouseMove(event: MouseEvent) {
    const { clientX, clientY } = event;
    const rect = this.canvas.getBoundingClientRect();
    const { w, h } = this.canvasSize;
    const x = clientX - rect.left - w / 2;
    const y = clientY - rect.top - h / 2;
    const inside = x < w / 2 && x > -(w / 2) && y < h / 2 && y > -(h / 2);
    if (inside) {
      this.mouse.x = x;
      this.mouse.y = y;
    }
  }

  resizeCanvas() {
    this.circles.length = 0;
    this.canvasSize.w = this.canvasContainer.offsetWidth;
    this.canvasSize.h = this.canvasContainer.offsetHeight;
    this.canvas.width = this.canvasSize.w * this.dpr;
    this.canvas.height = this.canvasSize.h * this.dpr;
    this.canvas.style.width = this.canvasSize.w + 'px';
    this.canvas.style.height = this.canvasSize.h + 'px';
    this.context.scale(this.dpr, this.dpr);
  }

  circleParams() {
    const x = Math.floor(Math.random() * this.canvasSize.w);
    const y = Math.floor(Math.random() * this.canvasSize.h);
    const translateX = 0;
    const translateY = 0;
    const size = Math.floor(Math.random() * 2) + 1;
    const alpha = 0;
    const targetAlpha = parseFloat((Math.random() * 0.6 + 0.1).toFixed(1));
    const dx = (Math.random() - 0.5) * 0.2;
    const dy = (Math.random() - 0.5) * 0.2;
    const magnetism = 0.1 + Math.random() * 4;
    return { x, y, translateX, translateY, size, alpha, targetAlpha, dx, dy, magnetism };
  }

  drawCircle(circle: Circle, update = false) {
    const { x, y, translateX, translateY, size, alpha } = circle;
    this.context.translate(translateX, translateY);
    this.context.beginPath();
    this.context.arc(x, y, size, 0, 2 * Math.PI);
    this.context.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    this.context.fill();
    this.context.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    if (!update) {
      this.circles.push(circle);
    }
  }

  clearContext() {
    this.context.clearRect(0, 0, this.canvasSize.w, this.canvasSize.h);
  }

  drawParticles() {
    this.clearContext();
    const particleCount = this.settings.quantity;
    for (let i = 0; i < particleCount; i++) {
      const circle = this.circleParams();
      this.drawCircle(circle);
    }
  }

  // This function remaps a value from one range to another range
  remapValue(value: number, start1: number, end1: number, start2: number, end2: number) {
    const remapped = ((value - start1) * (end2 - start2)) / (end1 - start1) + start2;
    return remapped > 0 ? remapped : 0;
  }

  animate() {
    this.clearContext();
    this.circles.forEach((circle, i) => {
      // Handle the alpha value
      const edge = [
        circle.x + circle.translateX - circle.size, // distance from left edge
        this.canvasSize.w - circle.x - circle.translateX - circle.size, // distance from right edge
        circle.y + circle.translateY - circle.size, // distance from top edge
        this.canvasSize.h - circle.y - circle.translateY - circle.size, // distance from bottom edge
      ];
      const closestEdge = edge.reduce((a, b) => Math.min(a, b));
      const remapClosestEdge = parseInt(this.remapValue(closestEdge, 0, 20, 0, 1).toFixed(2), 10);
      if (remapClosestEdge > 1) {
        circle.alpha += 0.02;
        if (circle.alpha > circle.targetAlpha) circle.alpha = circle.targetAlpha;
      } else {
        circle.alpha = circle.targetAlpha * remapClosestEdge;
      }
      circle.x += circle.dx;
      circle.y += circle.dy;
      circle.translateX +=
        (this.mouse.x / (this.settings.staticity / circle.magnetism) - circle.translateX) / this.settings.ease;
      circle.translateY +=
        (this.mouse.y / (this.settings.staticity / circle.magnetism) - circle.translateY) / this.settings.ease;
      // circle gets out of the canvas
      if (
        circle.x < -circle.size ||
        circle.x > this.canvasSize.w + circle.size ||
        circle.y < -circle.size ||
        circle.y > this.canvasSize.h + circle.size
      ) {
        // remove the circle from the array
        this.circles.splice(i, 1);
        // create a new circle
        const circle = this.circleParams();
        this.drawCircle(circle);
        // update the circle position
      } else {
        this.drawCircle(
          {
            ...circle,
            x: circle.x,
            y: circle.y,
            translateX: circle.translateX,
            translateY: circle.translateY,
            alpha: circle.alpha,
          },
          true,
        );
      }
    });
    window.requestAnimationFrame(this.animate);
  }
}

onMounted(() => {
  const c = canvas.value;
  if (!c) return;
  new ParticleAnimation(c);
});
</script>
