const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let celestialBodies = [];
let zoom = 1;
let focusedIndex = 0;
let timeWarp = 1;
//TODO add timewarp GUI

class CelestialBody {
  constructor(r, theta, orbitSpeed, parent, mass, color, name) {
    this.r = r;
    this.theta = theta;
    this.orbitSpeed = orbitSpeed;
    this.parent = parent;
    this.mass = mass;
    this.radius = Math.sqrt(mass / Math.PI) * 10;
    this.color = color;
    this.name = name;
    this.x = 0;
    this.y = 0;
    celestialBodies.push(this);
  }

  update() {
    this.x = Math.sin(this.theta) * this.r + this.parent.x
    this.y = Math.cos(this.theta) * this.r + this.parent.y
    this.theta += this.orbitSpeed * timeWarp;
  }

  draw() {
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI)
    ctx.fillStyle = this.color
    ctx.fill()

    ctx.beginPath()
    ctx.arc(this.parent.x, this.parent.y, this.r, 0, 2 * Math.PI);
    ctx.lineWidth = 1 / zoom
    ctx.strokeStyle = this.color
    ctx.stroke()
  }
}

// Bodies
let snarplux = new CelestialBody(0, 0, 0, { x: 0, y: 0 }, 30, "gold", "snarplux");

let heet = new CelestialBody(3000, 0, 0.000023, snarplux, 2, "brown", "heet");

let snarplax = new CelestialBody(5000, 0, 0.0000115, snarplux, 2, "blue", "snarplax");
let moon = new CelestialBody(100, 0, 0.000022, snarplax, 0.02, "gray", "moon");

let player = {
  x: 0, y: 5110,
  xVel: .1, yVel: 0,
  name: "you",
  follow: snarplax,
  draw: function () {
    ctx.fillStyle = "red"
    ctx.fillRect(this.x - .1, this.y - .1, .2, .2)
  },

  update: function () {
    for (let body of celestialBodies) {
      if (body === player) continue; // skip self

      let dx = body.x - this.x;
      let dy = body.y - this.y;
      let distSq = dx * dx + dy * dy;
      let dist = Math.sqrt(distSq);

      // Prevent divide-by-zero
      if (dist < 1) dist = 1;

      // Gravity constant, tweak as needed
      const G = 0.1;

      // Calculate force magnitude
      let force = (G * body.mass) / distSq;

      // Normalize direction and apply acceleration
      let ax = force * dx / dist;
      let ay = force * dy / dist;

      // Update velocity
      this.xVel += ax * timeWarp;
      this.yVel += ay * timeWarp;
    }

    this.x += this.xVel * timeWarp
    this.y += this.yVel * timeWarp

    //TODO add controls
    //TODO trace predicted orbit
  }
}

celestialBodies.push(player)

focusedIndex = celestialBodies.findIndex(b => b.name === "moon");

// Controls
document.addEventListener("keydown", e => {
  if (e.key === "=") zoom *= 1.1;
  if (e.key === "-") zoom *= 0.9;
  if (e.key === "[") focusedIndex = (focusedIndex - 1 + celestialBodies.length) % celestialBodies.length;
  if (e.key === "]") focusedIndex = (focusedIndex + 1) % celestialBodies.length;
});

function gameLoop() {
  // Update simulation
  celestialBodies.forEach(body => body.update());

  let focus = celestialBodies[focusedIndex];

  // Clear screen (screen space)
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "#0A1A35";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Calculate and apply transform to center focused body
  ctx.setTransform(
    zoom, 0, 0,
    zoom,
    canvas.width / 2 - focus.x * zoom,
    canvas.height / 2 - focus.y * zoom
  );

  // Draw all bodies in world space
  celestialBodies.forEach(body => body.draw());

  // UI Layer
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "#d9d9d9";
  ctx.fillRect(0, 0, canvas.width, canvas.height / 10);
  ctx.font = "20px Arial";
  ctx.fillStyle = "#009900";
  ctx.fillText(focus.name, 20, 30);
}

setInterval(gameLoop, 1000 / 60);
