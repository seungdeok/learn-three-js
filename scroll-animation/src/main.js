import * as THREE from "three";
// import { GUI } from "lil-gui";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

window.addEventListener("load", function () {
  console.log("load");
  init();
});

async function init() {
  // const gui = new GUI();
  gsap.registerPlugin(ScrollTrigger);

  const params = {
    waveColor: "#00ffff",
    backgroundColor: "#ffffff",
    fogColor: "#f0f0f0",
  };

  const canvas = document.querySelector("#canvas");
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    canvas,
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xf0f0f0, 0.1, 500);

  // gui.add(scene.fog, "near").min(0).max(100).step(0.01);
  // gui.add(scene.fog, "far").min(100).max(500).step(0.01);

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    500
  );

  camera.position.set(0, 25, 150);

  const waveGeometry = new THREE.PlaneGeometry(1500, 1500, 150, 150);
  const waveMaterial = new THREE.MeshStandardMaterial({
    color: params.waveColor,
  });

  const wave = new THREE.Mesh(waveGeometry, waveMaterial);

  wave.rotation.x = -Math.PI / 2;

  const waveHeight = 2.5;
  const zPositions = [];

  for (let i = 0; i < waveGeometry.attributes.position.count; i++) {
    const z =
      waveGeometry.attributes.position.getZ(i) +
      (Math.random() - 0.5) * waveHeight;
    zPositions.push(z);
    waveGeometry.attributes.position.setZ(i, z);
  }

  wave.receiveShadow = true;
  scene.add(wave);

  const gltfLoader = new GLTFLoader();
  const loader = await gltfLoader.loadAsync("./model/scene.gltf");
  const ship = loader.scene;
  ship.rotation.y = Math.PI / 2;
  scene.add(ship);
  ship.castShadow = true;
  ship.traverse((object) => {
    if (object.isMesh) {
      object.castShadow = true;
    }
  });

  const ambientLight = new THREE.AmbientLight(0xfffff, 1);
  ambientLight.position.set(15, 15, 15);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xffffff, 1);
  pointLight.castShadow = true;
  pointLight.shadow.mapSize.width = 1024;
  pointLight.shadow.mapSize.height = 1024;
  pointLight.shadow.mapSize.radius = 10;
  pointLight.position.set(15, 15, 15);
  scene.add(pointLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);

  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;
  directionalLight.shadow.mapSize.radius = 10;
  directionalLight.position.set(-15, 15, 15);
  scene.add(directionalLight);

  const clock = new THREE.Clock();

  render();

  function render() {
    const elapsedTime = clock.getElapsedTime();

    for (let i = 0; i < waveGeometry.attributes.position.count; i++) {
      const z = zPositions[i] + Math.sin(elapsedTime * 3 + i ** 2) * waveHeight;
      waveGeometry.attributes.position.setZ(i, z);
    }

    // 정점의 업데이트를 three.js에 알리기
    waveGeometry.attributes.position.needsUpdate = true;

    ship.position.y = Math.sin(elapsedTime * 3);

    camera.lookAt(ship.position);

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

  gsap.to(params, {
    backgroundColor: "#2a2a2a",
    onUpdate: () => {
      scene.background = new THREE.Color(params.backgroundColor);
    },
    scrollTrigger: {
      trigger: ".wrapper",
      start: "top top", // default('top bottom')
      markers: true,
      scrub: true,
    },
  });

  // 순차적으로(timeline), immediate(to)
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".wrapper",
      start: "top top", // default('top bottom')
      end: "bottom bottom",
      markers: true,
      scrub: true,
    },
  });
  tl.to(params, {
    waveColor: "#4268ff",
    onUpdate: () => {
      params.waveColor = new THREE.Color(params.waveColor);
    },
  })
    .to(params, {
      backgroundColor: "#2a2a2a",
      onUpdate: () => {
        scene.background = new THREE.Color(params.backgroundColor);
      },
    })
    .to(
      params,
      {
        fogColor: "#2f2f2f",
        onUpdate: () => {
          scene.fog.color = new THREE.Color(params.fogColor);
        },
      },
      "<" // 앞의 애니메이션과 동시
    )
    .to(camera.position, {
      x: 100,
      z: -50,
    })
    .to(ship.position, {
      z: 150,
    });

  gsap.to(".title", {
    opacity: 0,
    scrollTrigger: {
      trigger: ".wrapper",
      scrub: true,
      pin: true,
    },
  });
}
