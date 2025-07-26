// https://www.mixamo.com/#/?page=1&query=stand+to+roll&type=Motion%2CMotionPack
// https://nilooy.github.io/character-animation-combiner/

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

window.addEventListener("load", function () {
  init();
});

async function init() {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
  });
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;


  document.body.appendChild(renderer.domElement);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    500
  );

  camera.position.set(0, 5, 20);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.minDistance = 10;
  controls.maxDistance = 20;
  controls.minPolarAngle = Math.PI / 4;
  controls.maxPolarAngle = Math.PI / 2;

  const loadingManager = new THREE.LoadingManager();
  loadingManager.onProgress = function (url, loaded, total) {
    const progress = (loaded / total) * 100;
    document.querySelector("#progress-bar").value = progress;
  };

  loadingManager.onLoad = function () {
    document.querySelector(".progress-bar-container").style.display = "none";
  };

  const loader = new GLTFLoader(loadingManager);

  const gltf = await loader.loadAsync("./models/character.gltf");
  const model = gltf.scene;
  model.scale.set(0.1, 0.1, 0.1 );
  model.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.castShadow = true;
    }
  });

  scene.add(model);
  camera.lookAt(model.position);

  const plainGeometry = new THREE.PlaneGeometry(10000, 10000, 10000);
  const plainMaterial = new THREE.MeshPhongMaterial({
    color: 0x333333,
  });
  const plainMesh = new THREE.Mesh(plainGeometry, plainMaterial);
  plainMesh.rotation.x = -Math.PI / 2;
  plainMesh.position.y = -10;
  plainMesh.receiveShadow = true;
  scene.add(plainMesh);

  const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x333333);
  hemisphereLight.position.set(0, 20, 10);
  scene.add(hemisphereLight);

  const spotLight = new THREE.SpotLight(0xffffff, 1.5, 30, Math.PI / 0.15, 0.5, 0.5);
  spotLight.position.set(0, 20, 10);
  spotLight.castShadow = true;
  spotLight.shadow.mapSize.set(1024, 1024);
  spotLight.shadow.radius = 10;
  scene.add(spotLight);

  const mixer = new THREE.AnimationMixer(model);
  const hasAnimation = gltf.animations.length > 0;
  if (hasAnimation) {
    const animations = gltf.animations;

    let previousAction = null;
    for (const animation of animations) {
      const button = document.createElement("button");
      button.innerText = animation.name;
      button.addEventListener("click", () => {
        if (previousAction) {
          previousAction.fadeOut(0.5);
        }
        const action = mixer.clipAction(animation);
        action.reset().fadeIn(0.5).play();
        previousAction = action;
      });
      document.querySelector(".actions-container").appendChild(button);
    }
  }

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  const clock = new THREE.Clock();

  render();

  function render() {
    mixer.update(clock.getDelta());

    controls.update();
    
    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render();
  }

  function handlePointerDown(event) {
    // NDC
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0) {
      const intersect = intersects[0];
      console.log(intersect.object);
    }
  }

  window.addEventListener("resize", handleResize);
  window.addEventListener("pointerdown", handlePointerDown);
}
