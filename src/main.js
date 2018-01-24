const test = () => {
  var canvas = document.getElementById('canvas');
  var ctx = canvas.getContext('2d');

  particle = new Particle(ctx);
  window.requestAnimationFrame(updateAndRender.bind(null, ctx, particle, 0));
};


function updateAndRender(ctx, particle, prevTime, timestamp) {
  var dt = timestamp - prevTime;
  console.log(dt);
  particle.update(dt);

  ctx.clearRect(0, 0, ctx.canvas.height, ctx.canvas.width);
  particle.render(ctx);

  window.requestAnimationFrame(updateAndRender.bind(null, ctx, particle, timestamp));
}


class Particle {
  constructor(ctx) {
    this.ctx = ctx;
    this.x = 0;
    this.y = 0;
    this.height = 10;
    this.width = 10;
    this.dx = 30;
    this.dy = 30;
  }

  render(ctx) {
    ctx.fillRect(
      this.x - this.width / 2,
      this.y - this.height / 2,
      this.width,
      this.height,
    );
  }

  update(dt) {
    this.x = this.x + (dt * this.dx) / 1000;
    this.y = this.y + (dt * this.dy) / 1000;
  }
}


window.onload = test;
