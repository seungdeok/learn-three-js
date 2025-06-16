import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

window.addEventListener("load", function () {
  init();
});

function init() {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);

  document.body.appendChild(renderer.domElement);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    10000
  );

  camera.position.z = 5;

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 5;
  controls.maxDistance = 100;

  // https://www.humus.name/index.php?page=Textures
  const textureLoader = new THREE.TextureLoader().setPath(
    "assets/textures/Yokohama/"
  );

  // 카메라 기준
  const images = [
    "posx.jpg", //  오른쪽면
    "negx.jpg",
    "posy.jpg", // 윗면
    "negy.jpg",
    "posz.jpg", // 정면
    "negz.jpg",
  ];

  const geometry = new THREE.BoxGeometry(5000, 5000, 5000);
  const materials = images.map(
    (image) =>
      new THREE.MeshBasicMaterial({
        map: textureLoader.load(image),
        side: THREE.BackSide,
        /**
         * THREE.FrontSide (기본값): 앞쪽 면만 렌더링
         * THREE.BackSide: 뒤쪽 면만 렌더링(큐브 내부에서 바깥쪽을 보는 것)
         * THREE.DoubleSide: 앞뒤 양쪽 면 모두 렌더링
         */
      })
  );

  const mesh = new THREE.Mesh(geometry, materials);

  scene.add(mesh);

  render();

  function render() {
    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render();
  }

  window.addEventListener("resize", handleResize);
}
