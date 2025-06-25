const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let celestialBodies = [];
let camera = {
  x: 0 - (canvas.width / 2) * 2,
  y: 0 - (canvas.height / 2) * 2,
  zoom: 0.75,
  focusedPlanet: 0,
};

const G = 0.1;
let gameClock = 0;

//Planets
class CelestialBody {
  constructor(r, theta, orbitSpeed, parent, mass, color, name) {
    this.r = r;
    this.theta = theta;

    this.parent = parent;

    this.x = Math.sin(this.theta) * this.r + this.parent.x;
    this.y = Math.cos(this.theta) * this.r + this.parent.y;

    this.orbitSpeed = orbitSpeed;
    this.mass = mass;
    this.radius = Math.sqrt(mass / Math.PI) * 10;
    this.color = color;
    this.name = name;

    celestialBodies.push(this);
  }

  update() {
    //set X & Y
    this.x = Math.sin(this.theta) * this.r + this.parent.x;
    this.y = Math.cos(this.theta) * this.r + this.parent.y;

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
    this.theta += this.orbitSpeed;

    gameClock++;
  }
}

//define planets
//r, theta, orbitSpeed, parent, mass, color, name
let snarplux = new CelestialBody(
  0,
  0,
  5,
  { x: 0, y: 0 },
  30,
  "gold",
  "snarplux"
);
let snarplax = new CelestialBody(
  5000,
  0,
  0.0115,
  snarplux,
  2,
  "blue",
  "snarplax"
);
let moon = new CelestialBody(100, 0, 0.022, snarplax, 0.02, "grey", "moon");


camera.focusedPlanet = celestialBodies.findIndex(body => body.name === "moon");

//swap bodies
document.addEventListener("keydown", (e) => {
  //zoom
  if (e.key === "=") camera.zoom *= 1.1;
  if (e.key === "-") camera.zoom *= 0.9;

  //switch body
  if (e.key === "[") camera.focusedPlanet--;
  else if (e.key === "]") camera.focusedPlanet++;

  // wraparound logic to keep index within bounds
  if (camera.focusedPlanet < 0) {
    camera.focusedPlanet = celestialBodies.length - 1;
  } else if (camera.focusedPlanet >= celestialBodies.length) {
    camera.focusedPlanet = 0;
  }
});

//game loop
function updateAll() {
  for (let i = 0; i < celestialBodies.length; i++) {
    celestialBodies[i].update();
  }
}

function gameLoop() {
  ctx.fillStyle = "#0A1A35";
  ctx.fillRect(-10, -10, canvas.width + 20, canvas.height + 20);

  let focus = celestialBodies[camera.focusedPlanet];

  camera.x = focus.x - canvas.width / 2 / camera.zoom;
  camera.y = focus.y - canvas.height / 2 / camera.zoom;
  
  updateAll();

  //gui
  ctx.fillStyle = "#d9d9d9";
  ctx.fillRect(0, 0, canvas.width, canvas.height / 10);
  ctx.font = "20px arial";
  ctx.fillStyle = "#009900";
  ctx.fillText(focus.name, canvas.height / 40, canvas.height / 20);
}

setInterval(gameLoop, 60);
