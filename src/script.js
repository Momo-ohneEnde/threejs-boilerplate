import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import * as dat from 'dat.gui'
import { PointLight } from 'three';

// Settings

const SETTINGS = {
    render_wireframe: false,
    show_edges: false,
}

// Debug GUI
const gui = new dat.GUI()

// Texture loading (hammered metal)
// den Loader instanziieren
// const textureloader = new THREE.TextureLoader();
// Basis-Textur
// const baseTexture = textureloader.load('/textures/hammered_metal/Metal_Hammered_004_basecolor.jpg');
// Scaling
// baseTexture.wrapS = baseTexture.wrapT = THREE.RepeatWrapping;
//baseTexture.repeat.set( 2, 2 );
// Normal/Bump-Texture
//const normalTexture = textureloader.load('/textures/hammered_metal/Metal_Hammered_004_normal.jpg');
//normalTexture.wrapS = normalTexture.wrapT = THREE.RepeatWrapping;
//normalTexture.repeat.set( 2, 2 );
// Metall-Textur
//const metallicTexture = textureloader.load('/textures/hammered_metal/Metal_Hammered_004_metallic.jpg');
//metallicTexture.wrapS = metallicTexture.wrapT = THREE.RepeatWrapping;
//metallicTexture.repeat.set( 2, 2 );
// Rauheits-Textur
//const roughnessTexture = textureloader.load('/textures/hammered_metal/Metal_Hammered_004_roughness.jpg');
//roughnessTexture.wrapS = roughnessTexture.wrapT = THREE.RepeatWrapping;
//roughnessTexture.repeat.set( 2, 2 );
// Displacement/Verformungs-Textur
//const displacementTexture = textureloader.load('/textures/hammered_metal/Metal_Hammered_004_height.png');
//displacementTexture.wrapS = displacementTexture.wrapT = THREE.RepeatWrapping;
//displacementTexture.repeat.set( 2, 2 );

// Texture loading (terracotta tiles)
// den Loader instanziieren
const textureloader = new THREE.TextureLoader();
// Basis-Textur
const baseTexture = textureloader.load('/textures/terracotta_tiles/Substance_Graph_basecolor.jpg');
// Scaling
baseTexture.wrapS = baseTexture.wrapT = THREE.RepeatWrapping;
baseTexture.repeat.set( 2, 2 );
// Normal/Bump-Texture
const normalTexture = textureloader.load('/textures/terracotta_tiles/Substance_Graph_normal.jpg');
normalTexture.wrapS = normalTexture.wrapT = THREE.RepeatWrapping;
normalTexture.repeat.set( 2, 2 );
// Abmbient-Occlusion-Textur 
const ambientOcclusionTexture = textureloader.load('/textures/terracotta_tiles/Substance_Graph_ambientOcclusion.jpg');
ambientOcclusionTexture.wrapS = ambientOcclusionTexture.wrapT = THREE.RepeatWrapping;
ambientOcclusionTexture.repeat.set( 2, 2 );
// Rauheits-Textur
const roughnessTexture = textureloader.load('/textures/terracotta_tiles/Substance_Graph_roughness.jpg');
roughnessTexture.wrapS = roughnessTexture.wrapT = THREE.RepeatWrapping;
roughnessTexture.repeat.set( 2, 2 );
// Displacement/Verformungs-Textur (oder Height)
const displacementTexture = textureloader.load('/textures/terracotta_tiles/Substance_Graph_height.png');
displacementTexture.wrapS = displacementTexture.wrapT = THREE.RepeatWrapping;
displacementTexture.repeat.set( 2, 2 );

// Canvas
// looks up canvas element in html where 3D graphic should be drawn
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

//3D-Objekte
// 1. Geometrie erstellen
// 2. Material ("Textur") erstellen
// 3. Geometrie und Material in einem Mesh kombinieren, so dass das eigentliche 3D-Objekt entsteht.
// 4. Das Objekt zur Szene hinzufügen, um es anzuzeigen.

// 1. Geometrie

const geometry = {
    box: new THREE.BoxGeometry( 1, 1, 1 ),
    torusknot: new THREE.TorusKnotGeometry( .5, .3, 40, 40 ),
    torus: new THREE.TorusGeometry( .5, .3, 10, 10 ),
    ring: new THREE.RingGeometry(.2, .7, 5, 4, 0, 3.2),
    plane: new THREE.PlaneGeometry( 10, 10, 1024, 1024 ),
    octahedron: new THREE.OctahedronGeometry(.5, 2),
    icosahedron: new THREE.IcosahedronGeometry(.5, 0),
    dodecahedron: new THREE.DodecahedronGeometry(.5, 0),
    cylinder: new THREE.CylinderGeometry( .5, .5, 1, 6 ),
    cone: new THREE.ConeGeometry( .5, 1, 10 ),
    circle: new THREE.CircleGeometry( .5, 32 ),
    sphere: new THREE.SphereBufferGeometry( .5, 128, 128 )
}.plane;

const geometries = {
    box: new THREE.BoxGeometry( 1, 1, 1 ),
    torusknot: new THREE.TorusKnotGeometry( .5, .3, 40, 40 ),
    torus: new THREE.TorusGeometry( .5, .3, 10, 10 ),
    ring: new THREE.RingGeometry(.2, .7, 5, 4, 0, 3.2),
    plane: new THREE.PlaneGeometry( 1, 1, 10, 10 ),
    octahedron: new THREE.OctahedronGeometry(.5, 2),
    icosahedron: new THREE.IcosahedronGeometry(.5, 0),
    dodecahedron: new THREE.DodecahedronGeometry(.5, 0),
    cylinder: new THREE.CylinderGeometry( .5, .5, 1, 6 ),
    cone: new THREE.ConeGeometry( .5, 1, 10 ),
    circle: new THREE.CircleGeometry( .5, 32 ),
    sphere: new THREE.SphereBufferGeometry( .5, 128, 128 )
};

const createBoxes = function(number, x, y, z) {
    for (let i = 0; i< number; i++){
        let object = new THREE.Mesh( geometries.box, new THREE.MeshStandardMaterial( new THREE.MeshStandardMaterial( {
            color: 0xd2aa6d} )));
        object.position.set(x.Start + i*x.Offset, y.Start + i*y.Offset, z.Start + i*z.Offset);
        scene.add( object)
    }
}

const createObjects = function(objectType, number, x, y, z) {
    for (let i = 0; i< number; i++){
        let object = new THREE.Mesh( geometries[objectType], new THREE.MeshStandardMaterial( {
            color: 0xd2aa6d,
            map: baseTexture,
            //roughness: 0.2,
            roughnessMap: roughnessTexture,
            //metalness: 0.7,
            //metalnessMap: metallicTexture,
            wireframe: false,
            //emissive: 0x7a7017,
            //emissiveIntensity: 2,
            normalMap: normalTexture,
            displacementMap: displacementTexture,
            displacementScale: 0.02,
            aoMap: ambientOcclusionTexture
        }));
        object.position.set(x.Start + i*x.Offset, y.Start + i*y.Offset, z.Start + i*z.Offset);
        scene.add( object)
    }
}

const createCubeOfBoxes = function(number){
    for (let j = 0; j< number; j++){
        for (let i = 0; i< number; i++){
            createBoxes(number, {Start:0, Offset:1.2}, {Start:j*1.2, Offset:0}, {Start:i * 1.2, Offset: 0});
        }
    }
}

const createCubeOfObjects = function(objectType, number){
    for (let j = 0; j< number; j++){
        for (let i = 0; i< number; i++){
            createObjects(objectType, number, {Start:0, Offset:1.2}, {Start:j*1.2, Offset:0}, {Start:i * 1.2, Offset: 0});
        }
    }
}

// createBoxes(5, {Start:0, Offset:1.2}, {Start:0, Offset:0}, {Start:0, Offset:0});

//createCubeOfBoxes(5);
// createObjects("sphere", 5, {Start:0, Offset:1.2}, {Start:0, Offset:0}, {Start:0, Offset:0});

//createCubeOfObjects("sphere", 5);

// 2. Materials
// Materialien
// + MeshStandardMaterial
// + MeshBasicMaterial
const europeNormalTexture = textureloader.load('/textures/Europe/NormalMap.png');
const europeDisplacementTexture = textureloader.load('/textures/Europe/DisplacementMap.png');
const material = new THREE.MeshStandardMaterial( {
    color: 0xd2aa6d,
    //map: baseTexture,
    //roughness: 0.2,
    //roughnessMap: roughnessTexture,
    //metalness: 0.7,
    //metalnessMap: metallicTexture,
    wireframe: false,
    //emissive: 0x7a7017,
    //emissiveIntensity: 1.5,
    normalMap: europeNormalTexture,
    displacementMap: europeDisplacementTexture,
    displacementScale: 0.3,
});


// 3. Mesh 
const object = new THREE.Mesh( geometry, material );

// 4. Zur Szene hinzufügen
scene.add( object );

// Helper Geometries
if (SETTINGS.show_edges){
    const edges = new THREE.EdgesGeometry( geometry );
    const line = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: 0xffffff } ) );
    scene.add( line );
}


if (SETTINGS.render_wireframe){
    const wireframe = new THREE.WireframeGeometry( geometry );
    const wire = new THREE.LineSegments( wireframe );
    wire.material.depthTest = false;
    wire.material.opacity = 0.75;
    wire.material.transparent = true;
scene.add( wire );
}

// Lights
const pointLight = new THREE.PointLight(
    // Farbe
    0xffffff,
    // Intensität 
    1.0);
pointLight.position.x = -6.5;
pointLight.position.y = 4;
pointLight.position.z = 6;
scene.add(pointLight);


//const pointLight2 = new THREE.PointLight(
    // Farbe
    //0xff0000,
    // Intensität 
    //6.47);
//pointLight2.position.set(1,1,1.73);
//scene.add(pointLight2);

// Set GUI folders
const light = gui.addFolder('Light');
const mainobject = gui.addFolder('Sphere'); 
//const spida = gui.addFolder('Spider'); 
const jwgoethe = gui.addFolder('Goethe');
// Set subfolders 
const position = mainobject.addFolder('Position');
const scale = mainobject.addFolder('Scale');

const goethescale = jwgoethe.addFolder('Scale');
const goethepos = jwgoethe.addFolder('Position');

// Set Debug GUI
light.add(pointLight.position, 'y').min(-10).max(10).step(0.01);
light.add(pointLight.position, 'x').min(-10).max(10).step(0.01);
light.add(pointLight.position, 'z').min(-10).max(10).step(0.01);
light.add(pointLight, 'intensity').min(0).max(15).step(0.01);

position.add(object.position, 'y').min(-10).max(10).step(0.01);
position.add(object.position, 'x').min(-10).max(10).step(0.01);
position.add(object.position, 'z').min(-10).max(10).step(0.01);
scale.add(object.scale, 'x').min(0).max(10).step(0.01);
scale.add(object.scale, 'y').min(0).max(10).step(0.01);
scale.add(object.scale, 'z').min(0).max(10).step(0.01);

// Helper geos for lights
const pointLighthelper = new THREE.PointLightHelper(pointLight, 1);
scene.add(pointLighthelper);
//const pointLight2helper = new THREE.PointLightHelper(pointLight2, 1);
//scene.add(pointLight2helper);

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */

// Base camera
// PerspectiveCamera( fov : Number, aspect : Number, near : Number, far : Number )

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 200)
camera.position.x = 0
camera.position.y = 10
camera.position.z = 20
scene.add(camera)

// Controls

const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/*
Stl-Loader

*/
// Load image of a spider

/* const loader = new STLLoader();
const spider = loader.loadAsync( "/STLs/fago_lapiz.stl" )
						.then((geometry) => {
							var axesHelper = new THREE.AxesHelper( 20 );
							scene.add( axesHelper );
							return geometry;
						})
						.then( (geometry) => {
							const material = new THREE.MeshStandardMaterial( { color: 0x00ff00 } );
							const mesh = new THREE.Mesh( geometry, material );
							scene.add(mesh);
                            mesh.position.set(0,0,0);
                            mesh.castShadow = true;
							mesh.receiveShadow = true;
							mesh.name = 'object';
                            //mesh.scale.set(.05,.05,.05)
							return mesh;
						} )
                        .then((mesh) => {
                            spida.add(mesh.position, 'y').min(-100).max(10).step(0.01);
                            spida.add(mesh.position, 'x').min(-100).max(10).step(0.01);
                            spida.add(mesh.position, 'z').min(-100).max(10).step(0.01);
                            return mesh;
                        })
						; */


// Load Goethe-Head
const loader = new STLLoader();
const goethe = loader.loadAsync( "/STLs/Goethe_bust.stl" )
						.then((geometry) => {
							var axesHelper = new THREE.AxesHelper( 20 );
							scene.add( axesHelper );
							return geometry;
						})
						.then( (geometry) => {
							const material = new THREE.MeshStandardMaterial( { color: 0xd2aa6d } );
							const mesh = new THREE.Mesh( geometry, material );
							scene.add(mesh);
                            mesh.position.set(0,0,0);
                            mesh.castShadow = true;
							mesh.receiveShadow = true;
							mesh.name = 'object';
                            mesh.scale.set(.03,.03,.03);
							return mesh;
						} )
                        // gui controls for goethe
                        .then((mesh) => {
                            goethepos.add(mesh.position, 'y').min(-100).max(10).step(0.01);
                            goethepos.add(mesh.position, 'x').min(-100).max(10).step(0.01);
                            goethepos.add(mesh.position, 'z').min(-100).max(10).step(0.01);
                            goethescale.add(mesh.scale, 'x').min(0).max(10).step(0.01);
                            goethescale.add(mesh.scale, 'y').min(0).max(10).step(0.01);
                            goethescale.add(mesh.scale, 'z').min(0).max(10).step(0.01);
                            return mesh;
                        })
						;

/**
 * Renderer
 */

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */

// Mouse interaction
const mousemove = {
    mouseX: 0,
    mouseY: 0,
    targetX: 0,
    targetY: 0,
    windowHalfX: window.innerWidth / 2,
    windowHalfY: window.innerHeight / 2, 
};
document.addEventListener('mousemove', (e) => {
    mousemove.mouseX = (e.clientX - mousemove.windowHalfX);
    mousemove.mouseY = (e.clientY - mousemove.windowHalfY);
});

window.addEventListener('scroll', (e) => {
    object.position.z = window.scrollY * .0009;
})

const clock = new THREE.Clock()

const animation = () =>
{
    mousemove.targetX = mousemove.mouseX * .001;
    mousemove.targetY = mousemove.mouseY * .001;

    const elapsedTime = clock.getElapsedTime()

    // Update objects
    //object.rotation.y = .3 * elapsedTime;

    //object.rotation.y += .5 * (mousemove.targetX - object.rotation.y);
    //object.rotation.x += .5 * (mousemove.targetY - object.rotation.x);
    //object.rotation.z += .005 *(mousemove.targetY - object.rotation.x);
    //Update Orbital Controls
    controls.update()

   

    // Call the Renderer
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(animation)
}

animation()