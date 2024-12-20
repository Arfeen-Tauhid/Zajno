import LocomotiveScroll from 'locomotive-scroll';
import * as THREE from 'three';
import vertexShader from '/shader/vertexShader.glsl';
import fragmentShader from '/shader/fragmentShader.glsl';
import gsap from'gsap';
const locomotiveScroll = new LocomotiveScroll();


// Create scene
const scene = new THREE.Scene();

// Create camera
const distance = 20;
const fov = 2 * Math.atan((window.innerHeight/2)/distance)*(180/Math.PI);
const camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = distance;

// Create renderer
// const canvas = document.querySelector('#canvas');
const renderer = new THREE.WebGLRenderer({ 
  canvas : document.getElementById('canvas'), 
    alpha : true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio ,2));
renderer.setSize(window.innerWidth, window.innerHeight);

// Create raycaster
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const images = document.querySelectorAll('img');
const planes = [];

images.forEach(image => {
  const imgbounds = image.getBoundingClientRect();
  const texture = new THREE.TextureLoader().load(image.src);
  texture.needsUpdate = true;
  const material = new THREE.ShaderMaterial({
    uniforms:{
      uTexture:{
        value : texture
      },
      uMouse:{
        value: new THREE.Vector2(0.5 ,0.5)
      },
      uHover : {
        value: 0
      }
    },
    vertexShader,
    fragmentShader,
  });
  const geometry = new THREE.PlaneGeometry(1, 1);
  const plane = new THREE.Mesh(geometry , material);
  plane.position.set(imgbounds.left - window.innerWidth/2 + imgbounds.width/2, -imgbounds.top + window.innerHeight/2 - imgbounds.height/2, 0)
  planes.push(plane);
  scene.add(plane)
})

function updatePlanesPosition(){
  planes.forEach((plane,index)=>{
    const image = images[index];
    const imgbounds = image.getBoundingClientRect();
    // Update geometry to match new image bounds
    plane.position.set(imgbounds.left - window.innerWidth/2 + imgbounds.width/2, -imgbounds.top + window.innerHeight/2 - imgbounds.height/2, 0);
    plane.scale.set(imgbounds.width , imgbounds.height , 1);
  })
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  updatePlanesPosition();
  renderer.render(scene, camera);
}

animate();
// Handle window resize
window.addEventListener('resize', () => {
  const newFov = 2 * Math.atan((window.innerHeight/2)/distance)*(180/Math.PI);
  camera.fov = newFov;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  updatePlanesPosition();
});

// Handle mouse movement
window.addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(planes);

  planes.forEach(plane=>{
    gsap.to(plane.material.uniforms.uHover, {value : 0, duration:0.3});
  })

  if (intersects.length > 0) {
    const intersectedPlane = intersects[0];
    const uv = intersectedPlane.uv;
    gsap.to(intersectedPlane.object.material.uniforms.uMouse.value, {
      x: uv.x,
      y: uv.y,
      duration: 0.3
    });
    gsap.to(intersectedPlane.object.material.uniforms.uHover, {
      value: 1,
      duration: 0.3
    });
  }
});