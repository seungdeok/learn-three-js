import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GUI } from "lil-gui";

window.addEventListener("load", function () {
  init();
});

function init() {
  const options = {
    color: 0x00ffff, // threejs와 color 포맷 일치
  };

  const renderer = new THREE.WebGLRenderer({
    // alpha: true,
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);

  document.body.appendChild(renderer.domElement);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    500
  );

  const controls = new OrbitControls(camera, renderer.domElement);
  /**
   * autoRotateSpeed
   * dampingFactor
   * enableZoom
   * enablePan
   * maxDistance
   * minDistance
   * maxAzimuthAngle
   * minAzimuthAngle
   * maxPolarAngle
   * minPolarAngle
   */
  controls.autoRotate = true;
  controls.enableDamping = true;

  const axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);

  const cubeGeometry = new THREE.IcosahedronGeometry(1);
  const cubeMeterial = new THREE.MeshLambertMaterial({
    color: new THREE.Color(0x00ffff),
    emissive: new THREE.Color(0x111111),
  });

  const skeletonGeometry = new THREE.IcosahedronGeometry(2);
  const skeletonMeterial = new THREE.MeshLambertMaterial({
    transparent: true,
    opacity: 0.5,
    wireframe: true,
    color: new THREE.Color(0xaaaaaa),
  });

  const cube = new THREE.Mesh(cubeGeometry, cubeMeterial);
  const skeleton = new THREE.Mesh(skeletonGeometry, skeletonMeterial);

  scene.add(cube, skeleton);

  camera.position.z = 5;

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  scene.add(directionalLight);

  const clock = new THREE.Clock();

  render();

  function render() {
    const elapsedTime = clock.getElapsedTime();

    renderer.render(scene, camera);

    controls.update();
    requestAnimationFrame(render);
  }

  function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render();

    controls.update();
  }

  window.addEventListener("resize", handleResize);

  const gui = new GUI();
  gui.add(cube.position, "y").min(-3).max(3).step(0.1); // gui.add(cube.position, "y", -3, 3, 0.1);
  gui.add(cube, "visible");
  gui.addColor(options, "color").onChange((value) => {
    cube.material.color.set(value);
  });
}
