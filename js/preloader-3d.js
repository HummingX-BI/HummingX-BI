// js/preloader-3d.js

import * as THREE from 'three';

import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';



// 1. Scene and Container Setup

const container = document.getElementById('canvas-3d-container');

if (!container) {

    console.error('No se encontró el contenedor #canvas-3d-container');

}



const scene = new THREE.Scene();

scene.background = new THREE.Color('#050b14'); // Black-blue background



const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);

camera.position.set(0, 0, 300);



const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

renderer.setSize(container.clientWidth, container.clientHeight);

renderer.setPixelRatio(window.devicePixelRatio);

renderer.toneMapping = THREE.ACESFilmicToneMapping; // For better light and color

container.appendChild(renderer.domElement);



// KEY: Add a studio environment map for glass reflections. This makes it look amazing!

// I'm using a placeholder studio HDRI from a CDN.

new THREE.TextureLoader().load('https://unpkg.com/three-assets@1.0.0/textures/environment/studio_01.jpg', (envMap) => {

    envMap.mapping = THREE.EquirectangularReflectionMapping;

    scene.environment = envMap; // Applies to all physical materials automatically

});



// 2. Ultra-Elegant Glass Material

const glassMaterial = new THREE.MeshPhysicalMaterial({

    color: 0xcccccc,

    metalness: 0.2,

    roughness: 0.1, // Smooth, slightly frosted glass

    transmission: 0.9, // Clear glass

    thickness: 8.0, // Internal refection volume

    ior: 1.5, // Index of refraction for glass

    clearcoat: 1.0, // Exterior gloss

    clearcoatRoughness: 0.05,

    side: THREE.DoubleSide

});



// 3. Hummingbird Loading (Robust and Cured)

const hummingbirdGroup = new THREE.Group();

scene.add(hummingbirdGroup);



const loader = new SVGLoader();

// Asegúrate de que el archivo 'mi_imagen.svg' está en la RAÍZ de tu proyecto

loader.load('mi_imagen.svg', (data) => {

    // Hide loading text when successful

    const loadingText = document.getElementById('loading-text');

    if (loadingText) loadingText.style.opacity = '0';



    const paths = data.paths;

    for (let i = 0; i < paths.length; i++) {

        const path = paths[i];

        const shapes = SVGLoader.createShapes(path);

        for (let j = 0; j < shapes.length; j++) {

            const shape = shapes[j];

            

            // Proper extrusion and smooth curves

            const extrudeSettings = {

                depth: 20, // Real 3D volume

                bevelEnabled: true,

                bevelThickness: 3,

                bevelSize: 2,

                bevelSegments: 5,

                curveSegments: 32 // Very smooth lines

            };

            const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

            

            // THE CRITICAL FIX: Centering at the GEOMETRY level

            geometry.computeBoundingBox();

            const boundingBox = geometry.boundingBox;

            const xOffset = -0.5 * (boundingBox.max.x - boundingBox.min.x);

            const yOffset = -0.5 * (boundingBox.max.y - boundingBox.min.y);

            geometry.translate(xOffset, yOffset, 0); // Translate geometry to center



            const mesh = new THREE.Mesh(geometry, glassMaterial);

            mesh.scale.y = -1; // Correct SVG orientation for Three.js

            hummingbirdGroup.add(mesh);

        }

    }

}, undefined, (error) => {

    console.error('Error cargando mi_imagen.svg. Asegúrate de que existe en la raíz del proyecto y que ejecutas esto en un servidor local (VSCode Live Server).', error);

    const loadingText = document.getElementById('loading-text');

    if (loadingText) loadingText.innerText = "Error cargando SVG (Úsalo en un servidor local)";

});



// 4. Gemini-style Cristal Bubbles

const bubbles = [];

const numBubbles = 20;

const bubbleGeometry = new THREE.SphereGeometry(1, 32, 32);



for (let i = 0; i < numBubbles; i++) {

    const size = Math.random() * 8 + 3;

    const bubble = new THREE.Mesh(bubbleGeometry, glassMaterial);

    

    // Position esparcida y en profundidad

    bubble.position.set(

        (Math.random() - 0.5) * 350,

        (Math.random() - 0.5) * 350,

        (Math.random() - 0.5) * 100 - 30

    );

    bubble.scale.set(size, size, size);

    

    // Parámetros de animación individuales

    bubble.userData.speedY = Math.random() * 0.4 + 0.15;

    bubble.userData.wobblePhase = Math.random() * Math.PI * 2;

    bubble.userData.wobbleSpeed = Math.random() * 0.05;



    scene.add(bubble);

    bubbles.push(bubble);

}



// 5. Light Setup

const light = new THREE.AmbientLight(0xffffff, 2);

scene.add(light);

const directionalLight = new THREE.DirectionalLight(0xffffff, 4);

directionalLight.position.set(100, 150, 100);

scene.add(directionalLight);



// 6. Animation Loop with Specified Flote

const clock = new THREE.Clock();

function animate() {

    requestAnimationFrame(animate);

    const time = clock.getElapsedTime();



    // 1. Logo flote and subtle tilt

    hummingbirdGroup.position.y = Math.sin(time * 2) * 15;

    hummingbirdGroup.rotation.y = Math.sin(time * 1) * 0.2;

    

    // 2. Glass Bubble flote

    bubbles.forEach(bubble => {

        bubble.position.y += bubble.userData.speedY;

        bubble.position.x += Math.sin(time * bubble.userData.wobbleSpeed + bubble.userData.wobblePhase) * 0.1;

        

        if (bubble.position.y > 200) bubble.position.y = -200;

    });



    renderer.render(scene, camera);

}

animate();



// 7. Transition Logic for exiting (Google style)

function hideLoader() {

    const preloader = document.getElementById('preloader');

    if (preloader) {

        preloader.style.transition = 'opacity 1s, transform 1s cubic-bezier(0.68, -0.55, 0.27, 1.55)'; // Google style easing

        preloader.style.opacity = '0';

        preloader.style.transform = 'translateY(-100%)';

        // Stop rendering to save resources

        setTimeout(() => renderer.dispose(), 1000); 

    }

}



// EXPORT for integration with main.js

window.colibrix_3dLoader = { hide: hideLoader };
