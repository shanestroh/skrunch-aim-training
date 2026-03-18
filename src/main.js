import "./style.css";
import * as THREE from "three";

const app = document.getElementById("app");
const scoreEl = document.getElementById("score");
const hitsEl = document.getElementById("hits");
const shotsEl = document.getElementById("shots");
const menuEl = document.getElementById("menu");
const startBtn = document.getElementById("start-btn");
const timeEl = document.getElementById("time");

let score = 0;
let hits = 0;
let shots = 0;
let isPointerLocked = false;
let gameRunning = false;
let timeLeft = 30;
let timerInterval = null;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0f14);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 1.5, 8);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
app.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7);
scene.add(directionalLight);

// Floor
const floorGeometry = new THREE.PlaneGeometry(30, 30);
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x1f2937 });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.y = 0;
scene.add(floor);

// Back wall
const backWallGeometry = new THREE.PlaneGeometry(20, 10);
const backWallMaterial = new THREE.MeshStandardMaterial({ color: 0x111827 });
const backWall = new THREE.Mesh(backWallGeometry, backWallMaterial);
backWall.position.set(0, 5, -12);
scene.add(backWall);

// Target
const targetGeometry = new THREE.SphereGeometry(0.5, 32, 32);
const targetMaterial = new THREE.MeshStandardMaterial({ color: 0xff3b30 });
const target = new THREE.Mesh(targetGeometry, targetMaterial);
scene.add(target);

function moveTarget() {
  const x = THREE.MathUtils.randFloatSpread(10);
  const y = THREE.MathUtils.randFloat(1.2, 6);
  const z = THREE.MathUtils.randFloat(-10, -6);
  target.position.set(x, y, z);
}
moveTarget();

function updateHud() {
  scoreEl.textContent = String(score);
  hitsEl.textContent = String(hits);
  shotsEl.textContent = String(shots);
  timeEl.textContent = String(timeLeft);
}

const raycaster = new THREE.Raycaster();
const mouseLook = {
  yaw: 0,
  pitch: 0,
  sensitivity: 0.0025,
};

function shoot() {
  if (!isPointerLocked || !gameRunning) return;

  shots += 1;

  raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
  const intersects = raycaster.intersectObject(target);

  if (intersects.length > 0) {
    hits += 1;
    score += 100;
    moveTarget();
  }

  updateHud();
}

document.addEventListener("click", () => {
  if (isPointerLocked) {
    shoot();
  }
});

document.addEventListener("pointerlockchange", () => {
  isPointerLocked = document.pointerLockElement === renderer.domElement;
  menuEl.style.display = isPointerLocked ? "none" : "flex";
});

startBtn.addEventListener("click", async () => {
  await renderer.domElement.requestPointerLock();
  startGame();
});

document.addEventListener("mousemove", (event) => {
  if (!isPointerLocked) return;

  mouseLook.yaw -= event.movementX * mouseLook.sensitivity;
  mouseLook.pitch -= event.movementY * mouseLook.sensitivity;

  const maxPitch = Math.PI / 2 - 0.01;
  mouseLook.pitch = Math.max(-maxPitch, Math.min(maxPitch, mouseLook.pitch));

  camera.rotation.order = "YXZ";
  camera.rotation.y = mouseLook.yaw;
  camera.rotation.x = mouseLook.pitch;
});

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

updateHud();
animate();

function startGame() {
  score = 0;
  hits = 0;
  shots = 0;
  timeLeft = 30;

  gameRunning = true;

  updateHud();
  moveTarget();

  timerInterval = setInterval(() => {
    timeLeft--;

    updateHud();

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

function endGame() {
  gameRunning = false;
  clearInterval(timerInterval);

  document.exitPointerLock();

  alert(`Game Over!\nScore: ${score}`);
}
