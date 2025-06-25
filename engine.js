const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let celestialBodies = [];
let camera = {
  x: 0 - (canvas.width / 2) * 2,
  y: 0 - (canvas.height / 2)* 2,
  zoom: 0.75,
  focusedPlanet: 0
};

const G = 0.1;

//Planets
class CelestialBody {
  constructor(x, y, xvel, yvel, mass, carona, color, name) {
    this.x = x;
    this.y = y;
    this.xvel = xvel;
    this.yvel = yvel;
    this.mass = mass;
    this.radius = Math.sqrt(mass / Math.PI) * 10;
    this.color = color;
    this.name = name

    celestialBodies.push(this);
  }

  update() {
    //Draw
    ctx.beginPath();
    ctx.arc(
      (this.x - camera.x) * camera.zoom,
      (this.y - camera.y) * camera.zoom,
      this.radius * camera.zoom,
      0,
      2 * Math.PI
    );
    ctx.fillStyle = this.color;
    ctx.fill();

    //Move
    for (let other of celestialBodies) {
      if (other === this) continue;

      let dx = other.x - this.x;
      let dy = other.y - this.y;
      let distance = Math.sqrt(dx ** 2 + dy ** 2);

      let force = (G * this.mass * other.mass) / distance ** 2;

      if (distance < 1) distance = 1;

      this.xvel += (force * dx) / (distance * this.mass);
      this.yvel += (force * dy) / (distance * this.mass);
    }

    this.x += this.xvel;
    this.y += this.yvel;
  }
}



//define planets
let snarplux = new CelestialBody(0, 0, 0, 0, 30, true, "gold", "snarplux")
let snarplax = new CelestialBody(0, 250, 0.0115, 0, 2, false, "blue", "snarplax")
let moon = new CelestialBody(0, 270, 0.022, 0, .02, false, "grey", "moon")

camera.focusedPlanet = celestialBodies.findIndex(item => item.name === "moon")

//swap bodies
document.addEventListener("keydown", (e) => {
  //zoom
  if (e.key === "=") camera.zoom *= 1.1;
  if (e.key === "-") camera.zoom *= 0.9;

  //switch body
  if      (e.key === "[") camera.focusedPlanet--
  else if (e.key === "]") camera.focusedPlanet++

  // wraparound logic to keep index within bounds
  if (camera.focusedPlanet < 0) {
    camera.focusedPlanet = celestialBodies.length - 1
  } else if (camera.focusedPlanet >= celestialBodies.length) {
    camera.focusedPlanet = 0
  }
});

//game loop
function updateAll() {
  for (let i = 0; i < celestialBodies.length; i++) {
    celestialBodies[i].update();
  }
}

function gameLoop() {
  ctx.clearRect(-10, -10, canvas.width + 20, canvas.height + 20);

  let focus = celestialBodies[camera.focusedPlanet];

  camera.x = focus.x - (canvas.width / 2) / camera.zoom;
  camera.y = focus.y - (canvas.height / 2) / camera.zoom;

  updateAll();

  //gui
  ctx.fillStyle = "#d9d9d9"
  ctx.fillRect(0,0,canvas.width,canvas.height/10)
  ctx.font = "20px arial"
  ctx.fillStyle = "#009900"
  ctx.fillText(focus.name, canvas.height/40, canvas.height/20)
}

setInterval(gameLoop, 60);;
