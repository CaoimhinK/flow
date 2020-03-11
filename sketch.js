
const size = 20;
const numParticles = 5000;

const canvasWidth = 800;
const canvasHeight = 800;

const numXCells = canvasWidth / size;
const numYCells = canvasHeight / size;
const maxVelocity = 10;
const maxForce = 10;

const flowField = [];
const particles = [];

const noiseFactor = 0.05;
const magNoiseFactor = 0.1;
const noiseSpeed = 0.005;
const magNoiseSpeed = 0.001;

const showField = false;
const trace = false;

var fpsP;

var time;

function setup() {
  createCanvas(canvasWidth, canvasHeight);
  frameRate(60);
  strokeWeight(2);
  background(0);
  time = 0;
  magTime = 0;
  for (let i = 0; i < numParticles; i++) {
    let partX = random(width);
    let partY = random(height);
    particles.push(new Particle(createVector(partX, partY)));
  }
  for (let i = 0; i < numXCells; i++) {
    for (let j = 0; j < canvasHeight/size; j++) {
      flowField.push(new FlowPoint(i, j));
    }
  }
  fpsP = createP("0 fps");
}

function draw() {
  if (!trace) {
    background(0);
  }
  stroke(255, 100);
  for (let i = 0; i < numXCells; i++) {
    for (let j = 0; j < numYCells; j++) {
      let flowPoint = flowField[i * numXCells + j];
      flowPoint.update();
      if (showField) {
        flowPoint.show();
      }
    }
  }
  stroke(255);
  for (let i = 0; i < particles.length; i++) {
    let particle = particles[i];
    particle.update();
    particle.show();
  }
  time += noiseSpeed;
  magTime += magNoiseSpeed;
  fpsP.html(round(frameRate()) + " fps");
}


function FlowPoint(x, y) {
  this.y = x;
  this.x = y;
  this.vec = createVector();

  this.getForce = function() {
    return this.vec;
  }

  this.update = function() {
    let angle = noise(this.x * noiseFactor, this.y * noiseFactor, time) * TWO_PI;
    this.vec = p5.Vector.fromAngle(angle);
    let mag = map(noise(this.x * magNoiseFactor + 1000000, this.y * magNoiseFactor + 1000000, magTime), 0, 1, -maxForce, maxForce);
    this.vec.setMag(mag);
  }

  this.show = function() {
    line(this.x * size + size / 2,
      this.y * size + size / 2,
      this.x * size + size / 2 + map(this.vec.x, -maxForce, maxForce, -size, size),
      this.y * size + size / 2 + map(this.vec.y, -maxForce, maxForce, -size, size));
  }
}

function Particle(pos) {
  this.pos = pos;
  this.vel = createVector(0,0);

  this.update = function() {
    if (this.pos.x < 0) {
      this.pos.x = canvasWidth;
    }
    if (this.pos.x > canvasWidth) {
      this.pos.x = 0;
    }
    if (this.pos.y < 0) {
      this.pos.y = canvasHeight;
    }
    if (this.pos.y > canvasHeight) {
      this.pos.y = 0
    }
    let flowIndex = floor(this.pos.x / numXCells) * (numXCells) + floor(this.pos.y / numYCells);
    let flowPoint = flowField[flowIndex];
    let flow = flowPoint.getForce();
    this.vel.add(flow);
    this.vel.limit(maxVelocity);
    this.pos.add(this.vel);
  }

  this.show = function() {
    point(this.pos.x, this.pos.y);
  }
}
