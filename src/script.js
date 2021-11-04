import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import * as dat from "dat.gui";
import { PointLight, AmbientLight, Vector3 } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoughnessMipmapper } from "three/examples/jsm/utils/RoughnessMipmapper.js";
import {
  CSS3DRenderer,
  CSS3DObject,
} from "three/examples/jsm/renderers/CSS3DRenderer.js";
import { Text } from "troika-three-text";

// Settings

const SETTINGS = {
  render_wireframe: false,
  show_edges: false,
};

/**
 * Sizes
 */
// Anpassung an Größe des Browsers
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// Canvas
// looks up canvas element in html where 3D graphic should be drawn
const canvas = document.querySelector("canvas.webgl");

/**
 * Renderer
 */

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  // makes background transparent
  alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Debug GUI
const gui = new dat.GUI();

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
const baseTexture = textureloader.load(
  "/textures/terracotta_tiles/Substance_Graph_basecolor.jpg"
);
// Scaling
baseTexture.wrapS = baseTexture.wrapT = THREE.RepeatWrapping;
baseTexture.repeat.set(2, 2);
// Normal/Bump-Texture
const normalTexture = textureloader.load(
  "/textures/terracotta_tiles/Substance_Graph_normal.jpg"
);
normalTexture.wrapS = normalTexture.wrapT = THREE.RepeatWrapping;
normalTexture.repeat.set(2, 2);
// Abmbient-Occlusion-Textur
const ambientOcclusionTexture = textureloader.load(
  "/textures/terracotta_tiles/Substance_Graph_ambientOcclusion.jpg"
);
ambientOcclusionTexture.wrapS = ambientOcclusionTexture.wrapT =
  THREE.RepeatWrapping;
ambientOcclusionTexture.repeat.set(2, 2);
// Rauheits-Textur
const roughnessTexture = textureloader.load(
  "/textures/terracotta_tiles/Substance_Graph_roughness.jpg"
);
roughnessTexture.wrapS = roughnessTexture.wrapT = THREE.RepeatWrapping;
roughnessTexture.repeat.set(2, 2);
// Displacement/Verformungs-Textur (oder Height)
const displacementTexture = textureloader.load(
  "/textures/terracotta_tiles/Substance_Graph_height.png"
);
displacementTexture.wrapS = displacementTexture.wrapT = THREE.RepeatWrapping;
displacementTexture.repeat.set(2, 2);

// Scene
const scene = new THREE.Scene();

//3D-Objekte
// 1. Geometrie erstellen
// 2. Material ("Textur") erstellen
// 3. Geometrie und Material in einem Mesh kombinieren, so dass das eigentliche 3D-Objekt entsteht.
// 4. Das Objekt zur Szene hinzufügen, um es anzuzeigen.

// 1. Geometrie

const geometry = {
  box: new THREE.BoxGeometry(1, 1, 1),
  torusknot: new THREE.TorusKnotGeometry(0.5, 0.3, 40, 40),
  torus: new THREE.TorusGeometry(0.5, 0.3, 10, 10),
  ring: new THREE.RingGeometry(0.2, 0.7, 5, 4, 0, 3.2),
  plane: new THREE.PlaneGeometry(10, 10, 1024, 1024),
  octahedron: new THREE.OctahedronGeometry(0.5, 2),
  icosahedron: new THREE.IcosahedronGeometry(0.5, 0),
  dodecahedron: new THREE.DodecahedronGeometry(0.5, 0),
  cylinder: new THREE.CylinderGeometry(0.5, 0.5, 1, 6),
  cone: new THREE.ConeGeometry(0.5, 1, 10),
  circle: new THREE.CircleGeometry(0.5, 32),
  sphere: new THREE.SphereBufferGeometry(0.5, 128, 128),
}.plane;

const geometries = {
  box: new THREE.BoxGeometry(1, 1, 1),
  torusknot: new THREE.TorusKnotGeometry(0.5, 0.3, 40, 40),
  torus: new THREE.TorusGeometry(0.5, 0.3, 10, 10),
  ring: new THREE.RingGeometry(0.2, 0.7, 5, 4, 0, 3.2),
  plane: new THREE.PlaneGeometry(1, 1, 10, 10),
  octahedron: new THREE.OctahedronGeometry(0.5, 2),
  icosahedron: new THREE.IcosahedronGeometry(0.5, 0),
  dodecahedron: new THREE.DodecahedronGeometry(0.5, 0),
  cylinder: new THREE.CylinderGeometry(0.5, 0.5, 1, 6),
  cone: new THREE.ConeGeometry(0.5, 1, 10),
  circle: new THREE.CircleGeometry(0.5, 32),
  sphere: new THREE.SphereBufferGeometry(0.5, 128, 128),
};

const createBoxes = function (number, x, y, z) {
  for (let i = 0; i < number; i++) {
    let object = new THREE.Mesh(
      geometries.box,
      new THREE.MeshStandardMaterial(
        new THREE.MeshStandardMaterial({
          color: 0xd2aa6d,
        })
      )
    );
    object.position.set(
      x.Start + i * x.Offset,
      y.Start + i * y.Offset,
      z.Start + i * z.Offset
    );
    scene.add(object);
  }
};

const createObjects = function (objectType, number, x, y, z) {
  for (let i = 0; i < number; i++) {
    let object = new THREE.Mesh(
      geometries[objectType],
      new THREE.MeshStandardMaterial({
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
        aoMap: ambientOcclusionTexture,
      })
    );
    object.position.set(
      x.Start + i * x.Offset,
      y.Start + i * y.Offset,
      z.Start + i * z.Offset
    );
    scene.add(object);
  }
};

const createCubeOfBoxes = function (number) {
  for (let j = 0; j < number; j++) {
    for (let i = 0; i < number; i++) {
      createBoxes(
        number,
        { Start: 0, Offset: 1.2 },
        { Start: j * 1.2, Offset: 0 },
        { Start: i * 1.2, Offset: 0 }
      );
    }
  }
};

const createCubeOfObjects = function (objectType, number) {
  for (let j = 0; j < number; j++) {
    for (let i = 0; i < number; i++) {
      createObjects(
        objectType,
        number,
        { Start: 0, Offset: 1.2 },
        { Start: j * 1.2, Offset: 0 },
        { Start: i * 1.2, Offset: 0 }
      );
    }
  }
};

// createBoxes(5, {Start:0, Offset:1.2}, {Start:0, Offset:0}, {Start:0, Offset:0});

//createCubeOfBoxes(5);
// createObjects("sphere", 5, {Start:0, Offset:1.2}, {Start:0, Offset:0}, {Start:0, Offset:0});

//createCubeOfObjects("sphere", 5);

// 2. Materials
// Materialien
// + MeshStandardMaterial
// + MeshBasicMaterial
// const europeNormalTexture = textureloader.load('/textures/Europe/NormalMap.png');
// const europeDisplacementTexture = textureloader.load('/textures/Europe/DisplacementMap.png');
// const material = new THREE.MeshStandardMaterial( {
//     color: 0xd2aa6d,
//     //map: baseTexture,
//     //roughness: 0.2,
//     //roughnessMap: roughnessTexture,
//     //metalness: 0.7,
//     //metalnessMap: metallicTexture,
//     wireframe: false,
//     //emissive: 0x7a7017,
//     //emissiveIntensity: 1.5,
//     normalMap: europeNormalTexture,
//     displacementMap: europeDisplacementTexture,
//     displacementScale: 0.3,
// });
/* 
AB HIER: RICHTIGER CODE
*/

/* ToDo
1.) Skript aufräumen und verstehen
2.) Datenvorbereitung:
    Daten auch nach placeReceived (und year) gruppieren, neue Property sent/received, mergen
3.) Textfelder auf die Planes: plane als pivot für Text nehmen
4.) Styling der Planes und Textinfos
5.) Daten mit fetch() laden
 */

const table = {
  "Leipzig": {
    "1765": [
      {
        "id": "GB01_1_EB005_0",
        "placeSent": "Leipzig",
        "placeSentId": "http://www.geonames.org/2879139/",
        "date": "1765-12",
        "receiver": "Schlosser, Johann Georg",
        "receiverKey": "SNDB45156",
        "receiverId": "http://d-nb.info/gnd/118795163",
        "placeReceived": "Frankfurt",
        "placeReceivedID": "http://www.geonames.org/2925533/",
        "year": "1765",
        "month": "12",
        "dateFormatted": "Dezember 1765",
        "type": "GB",
        "idFormatted": "GB01 Nr.EB005",
        "receiverFirstName": "Johann Georg",
        "receiverLastName": "Schlosser",
        "receiverFormatted": "Johann Georg Schlosser",
        "receiverInitials": "JS",
        "lobidURL": "https://lobid.org/gnd/118795163",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Männlich",
        "placeSentLat": "51.33962",
        "placeSentLong": "12.37129",
        "placeReceivedLat": "50.11552",
        "placeReceivedLong": "8.68417"
      },
      {
        "id": "GB01_1_BR006_0",
        "placeSent": "Leipzig",
        "placeSentId": "http://www.geonames.org/2879139/",
        "date": "1765-10-18",
        "receiver": "Goethe, Cornelia",
        "receiverKey": "SNDB45161",
        "receiverId": "http://d-nb.info/gnd/11871791X",
        "placeReceived": "Frankfurt",
        "placeReceivedID": "http://www.geonames.org/2925533/",
        "year": "1765",
        "month": "10",
        "day": "18",
        "dateFormatted": "18. Oktober 1765",
        "type": "GB",
        "idFormatted": "GB01 Nr.6",
        "receiverFirstName": "Cornelia",
        "receiverLastName": "Goethe",
        "receiverFormatted": "Cornelia Goethe",
        "receiverInitials": "CG",
        "lobidURL": "https://lobid.org/gnd/11871791X",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Weiblich",
        "placeSentLat": "51.33962",
        "placeSentLong": "12.37129",
        "placeReceivedLat": "50.11552",
        "placeReceivedLong": "8.68417"
      }
    ],
    "1766": [
      {
        "id": "GB01_1_BR020_0",
        "placeSent": "Leipzig",
        "placeSentId": "http://www.geonames.org/2879139/",
        "date": "1766-10-12",
        "receiver": "Behrisch, Ernst Wolfgang",
        "receiverKey": "SNDB43091",
        "receiverId": "http://d-nb.info/gnd/116111631",
        "placeReceived": "Leipzig",
        "placeReceivedID": "http://www.geonames.org/2879139/",
        "year": "1766",
        "month": "10",
        "day": "12",
        "dateFormatted": "12. Oktober 1766",
        "type": "GB",
        "idFormatted": "GB01 Nr.20",
        "receiverFirstName": "Ernst Wolfgang",
        "receiverLastName": "Behrisch",
        "receiverFormatted": "Ernst Wolfgang Behrisch",
        "receiverInitials": "EB",
        "lobidURL": "https://lobid.org/gnd/116111631",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Männlich",
        "placeSentLat": "51.33962",
        "placeSentLong": "12.37129",
        "placeReceivedLat": "51.33962",
        "placeReceivedLong": "12.37129"
      },
      {
        "id": "GB01_1_BR021_0",
        "placeSent": "Leipzig",
        "placeSentId": "http://www.geonames.org/2879139/",
        "date": "1766-10-12",
        "receiver": "Behrisch, Ernst Wolfgang",
        "receiverKey": "SNDB43091",
        "receiverId": "http://d-nb.info/gnd/116111631",
        "placeReceived": "Leipzig",
        "placeReceivedID": "http://www.geonames.org/2879139/",
        "year": "1766",
        "month": "10",
        "day": "12",
        "dateFormatted": "12. Oktober 1766",
        "type": "GB",
        "idFormatted": "GB01 Nr.21",
        "receiverFirstName": "Ernst Wolfgang",
        "receiverLastName": "Behrisch",
        "receiverFormatted": "Ernst Wolfgang Behrisch",
        "receiverInitials": "EB",
        "lobidURL": "https://lobid.org/gnd/116111631",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Männlich",
        "placeSentLat": "51.33962",
        "placeSentLong": "12.37129",
        "placeReceivedLat": "51.33962",
        "placeReceivedLong": "12.37129"
      },
      {
        "id": "GB01_1_BR017_0",
        "placeSent": "Leipzig",
        "placeSentId": "http://www.geonames.org/2879139/",
        "date": "1766-10-01",
        "receiver": "Trapp, Augustin",
        "receiverKey": "SNDB42112",
        "receiverId": "",
        "placeReceived": "Frankfurt",
        "placeReceivedID": "http://www.geonames.org/2925533/",
        "year": "1766",
        "month": "10",
        "day": "01",
        "dateFormatted": "01. Oktober 1766",
        "type": "GB",
        "idFormatted": "GB01 Nr.17",
        "receiverFirstName": "Augustin",
        "receiverLastName": "Trapp",
        "receiverFormatted": "Augustin Trapp",
        "receiverInitials": "AT",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Keine Info",
        "placeSentLat": "51.33962",
        "placeSentLong": "12.37129",
        "placeReceivedLat": "50.11552",
        "placeReceivedLong": "8.68417"
      },
      {
        "id": "GB01_1_BR016_0",
        "placeSent": "Leipzig",
        "placeSentId": "http://www.geonames.org/2879139/",
        "date": "1766-10-01",
        "receiver": "Moors, Friedrich Maximilian",
        "receiverKey": "SNDB53368",
        "receiverId": "http://d-nb.info/gnd/117135364",
        "placeReceived": "Göttingen",
        "placeReceivedID": "http://www.geonames.org/2918632/",
        "year": "1766",
        "month": "10",
        "day": "01",
        "dateFormatted": "01. Oktober 1766",
        "type": "GB",
        "idFormatted": "GB01 Nr.16",
        "receiverFirstName": "Friedrich Maximilian",
        "receiverLastName": "Moors",
        "receiverFormatted": "Friedrich Maximilian Moors",
        "receiverInitials": "FM",
        "lobidURL": "https://lobid.org/gnd/117135364",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Männlich",
        "placeSentLat": "51.33962",
        "placeSentLong": "12.37129",
        "placeReceivedLat": "51.53443",
        "placeReceivedLong": "9.93228"
      },
      {
        "id": "GB01_1_BR015_0",
        "placeSent": "Leipzig",
        "placeSentId": "http://www.geonames.org/2879139/",
        "date": "1766-06-02",
        "receiver": "Trapp, Augustin",
        "receiverKey": "SNDB42112",
        "receiverId": "",
        "placeReceived": "Worms",
        "placeReceivedID": "http://www.geonames.org/2806142/",
        "year": "1766",
        "month": "06",
        "day": "02",
        "dateFormatted": "02. Juni 1766",
        "type": "GB",
        "idFormatted": "GB01 Nr.15",
        "receiverFirstName": "Augustin",
        "receiverLastName": "Trapp",
        "receiverFormatted": "Augustin Trapp",
        "receiverInitials": "AT",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Keine Info",
        "placeSentLat": "51.33962",
        "placeSentLong": "12.37129",
        "placeReceivedLat": "49.63278",
        "placeReceivedLong": "8.35916"
      },
      {
        "id": "GB01_1_BR013_0",
        "placeSent": "Leipzig",
        "placeSentId": "http://www.geonames.org/2879139/",
        "date": "1766-04-28",
        "receiver": "Riese, Johann Jacob",
        "receiverKey": "SNDB40718",
        "receiverId": "http://d-nb.info/gnd/1110069057",
        "placeReceived": "Marburg",
        "placeReceivedID": "http://www.geonames.org/2873759/",
        "year": "1766",
        "month": "04",
        "day": "28",
        "dateFormatted": "28. April 1766",
        "type": "GB",
        "idFormatted": "GB01 Nr.13",
        "receiverFirstName": "Johann Jacob",
        "receiverLastName": "Riese",
        "receiverFormatted": "Johann Jacob Riese",
        "receiverInitials": "JR",
        "lobidURL": "https://lobid.org/gnd/1110069057",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Männlich",
        "placeSentLat": "51.33962",
        "placeSentLong": "12.37129",
        "placeReceivedLat": "50.80904",
        "placeReceivedLong": "8.77069"
      },
      {
        "id": "GB01_1_BR012_0",
        "placeSent": "Leipzig",
        "placeSentId": "http://www.geonames.org/2879139/",
        "date": "1766-03-14",
        "receiver": "Goethe, Cornelia",
        "receiverKey": "SNDB49571",
        "receiverId": "http://d-nb.info/gnd/11871791X",
        "placeReceived": "Frankfurt",
        "placeReceivedID": "http://www.geonames.org/2925533/",
        "year": "1766",
        "month": "03",
        "day": "14",
        "dateFormatted": "14. März 1766",
        "type": "GB",
        "idFormatted": "GB01 Nr.12",
        "receiverFirstName": "Cornelia",
        "receiverLastName": "Goethe",
        "receiverFormatted": "Cornelia Goethe",
        "receiverInitials": "CG",
        "lobidURL": "https://lobid.org/gnd/11871791X",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Weiblich",
        "placeSentLat": "51.33962",
        "placeSentLong": "12.37129",
        "placeReceivedLat": "50.11552",
        "placeReceivedLong": "8.68417"
      }
    ],
    "1767": [
      {
        "id": "GB01_1_BR039_0",
        "placeSent": "Leipzig",
        "placeSentId": "http://www.geonames.org/2879139/",
        "date": "1767-12-22",
        "receiver": "Behrisch, Ernst Wolfgang",
        "receiverKey": "SNDB43091",
        "receiverId": "http://d-nb.info/gnd/116111631",
        "placeReceived": "Dessau",
        "placeReceivedID": "http://www.geonames.org/2937959/",
        "year": "1767",
        "month": "12",
        "day": "22",
        "dateFormatted": "22. Dezember 1767",
        "type": "GB",
        "idFormatted": "GB01 Nr.39",
        "receiverFirstName": "Ernst Wolfgang",
        "receiverLastName": "Behrisch",
        "receiverFormatted": "Ernst Wolfgang Behrisch",
        "receiverInitials": "EB",
        "lobidURL": "https://lobid.org/gnd/116111631",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Männlich",
        "placeSentLat": "51.33962",
        "placeSentLong": "12.37129",
        "placeReceivedLat": "51.83864",
        "placeReceivedLong": "12.24555"
      },
      {
        "id": "GB01_1_EB009_0",
        "placeSent": "Leipzig",
        "placeSentId": "http://www.geonames.org/2879139/",
        "date": "1767-08",
        "receiver": "Goethe, Johann Caspar",
        "receiverKey": "SNDB43777",
        "receiverId": "http://d-nb.info/gnd/118695940",
        "placeReceived": "Frankfurt",
        "placeReceivedID": "http://www.geonames.org/2925533/",
        "year": "1767",
        "month": "08",
        "dateFormatted": "August 1767",
        "type": "GB",
        "idFormatted": "GB01 Nr.EB009",
        "receiverFirstName": "Johann Caspar",
        "receiverLastName": "Goethe",
        "receiverFormatted": "Johann Caspar Goethe",
        "receiverInitials": "JG",
        "lobidURL": "https://lobid.org/gnd/118695940",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Männlich",
        "placeSentLat": "51.33962",
        "placeSentLong": "12.37129",
        "placeReceivedLat": "50.11552",
        "placeReceivedLong": "8.68417"
      },
      {
        "id": "GB01_1_EB008_0",
        "placeSent": "Leipzig",
        "placeSentId": "http://www.geonames.org/2879139/",
        "date": "1767-08",
        "receiver": "Goethe, Johann Caspar",
        "receiverKey": "SNDB43777",
        "receiverId": "http://d-nb.info/gnd/118695940",
        "placeReceived": "Frankfurt",
        "placeReceivedID": "http://www.geonames.org/2925533/",
        "year": "1767",
        "month": "08",
        "dateFormatted": "August 1767",
        "type": "GB",
        "idFormatted": "GB01 Nr.EB008",
        "receiverFirstName": "Johann Caspar",
        "receiverLastName": "Goethe",
        "receiverFormatted": "Johann Caspar Goethe",
        "receiverInitials": "JG",
        "lobidURL": "https://lobid.org/gnd/118695940",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Männlich",
        "placeSentLat": "51.33962",
        "placeSentLong": "12.37129",
        "placeReceivedLat": "50.11552",
        "placeReceivedLong": "8.68417"
      },
      {
        "id": "GB01_1_BR038_0",
        "placeSent": "Leipzig",
        "placeSentId": "http://www.geonames.org/2879139/",
        "date": "1767-12-15",
        "receiver": "Behrisch, Ernst Wolfgang",
        "receiverKey": "SNDB43091",
        "receiverId": "http://d-nb.info/gnd/116111631",
        "placeReceived": "Dessau",
        "placeReceivedID": "http://www.geonames.org/2937959/",
        "year": "1767",
        "month": "12",
        "day": "15",
        "dateFormatted": "15. Dezember 1767",
        "type": "GB",
        "idFormatted": "GB01 Nr.38",
        "receiverFirstName": "Ernst Wolfgang",
        "receiverLastName": "Behrisch",
        "receiverFormatted": "Ernst Wolfgang Behrisch",
        "receiverInitials": "EB",
        "lobidURL": "https://lobid.org/gnd/116111631",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Männlich",
        "placeSentLat": "51.33962",
        "placeSentLong": "12.37129",
        "placeReceivedLat": "51.83864",
        "placeReceivedLong": "12.24555"
      },
      {
        "id": "GB01_1_BR037_0",
        "placeSent": "Leipzig",
        "placeSentId": "http://www.geonames.org/2879139/",
        "date": "1767-12-04",
        "receiver": "Behrisch, Ernst Wolfgang",
        "receiverKey": "SNDB43091",
        "receiverId": "http://d-nb.info/gnd/116111631",
        "placeReceived": "Dessau",
        "placeReceivedID": "http://www.geonames.org/2937959/",
        "year": "1767",
        "month": "12",
        "day": "04",
        "dateFormatted": "04. Dezember 1767",
        "type": "GB",
        "idFormatted": "GB01 Nr.37",
        "receiverFirstName": "Ernst Wolfgang",
        "receiverLastName": "Behrisch",
        "receiverFormatted": "Ernst Wolfgang Behrisch",
        "receiverInitials": "EB",
        "lobidURL": "https://lobid.org/gnd/116111631",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Männlich",
        "placeSentLat": "51.33962",
        "placeSentLong": "12.37129",
        "placeReceivedLat": "51.83864",
        "placeReceivedLong": "12.24555"
      },
      {
        "id": "GB01_1_BR036_0",
        "placeSent": "Leipzig",
        "placeSentId": "http://www.geonames.org/2879139/",
        "date": "1767-11-27",
        "receiver": "Behrisch, Ernst Wolfgang",
        "receiverKey": "SNDB43091",
        "receiverId": "http://d-nb.info/gnd/116111631",
        "placeReceived": "Dessau",
        "placeReceivedID": "http://www.geonames.org/2937959/",
        "year": "1767",
        "month": "11",
        "day": "27",
        "dateFormatted": "27. November 1767",
        "type": "GB",
        "idFormatted": "GB01 Nr.36",
        "receiverFirstName": "Ernst Wolfgang",
        "receiverLastName": "Behrisch",
        "receiverFormatted": "Ernst Wolfgang Behrisch",
        "receiverInitials": "EB",
        "lobidURL": "https://lobid.org/gnd/116111631",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Männlich",
        "placeSentLat": "51.33962",
        "placeSentLong": "12.37129",
        "placeReceivedLat": "51.83864",
        "placeReceivedLong": "12.24555"
      },
      {
        "id": "GB01_1_BR033_0",
        "placeSent": "Leipzig",
        "placeSentId": "http://www.geonames.org/2879139/",
        "date": "1767-11-07",
        "receiver": "Behrisch, Ernst Wolfgang",
        "receiverKey": "SNDB43091",
        "receiverId": "http://d-nb.info/gnd/116111631",
        "placeReceived": "Dessau",
        "placeReceivedID": "http://www.geonames.org/2937959/",
        "year": "1767",
        "month": "11",
        "day": "07",
        "dateFormatted": "07. November 1767",
        "type": "GB",
        "idFormatted": "GB01 Nr.33",
        "receiverFirstName": "Ernst Wolfgang",
        "receiverLastName": "Behrisch",
        "receiverFormatted": "Ernst Wolfgang Behrisch",
        "receiverInitials": "EB",
        "lobidURL": "https://lobid.org/gnd/116111631",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Männlich",
        "placeSentLat": "51.33962",
        "placeSentLong": "12.37129",
        "placeReceivedLat": "51.83864",
        "placeReceivedLong": "12.24555"
      },
      {
        "id": "GB01_1_BR031_0",
        "placeSent": "Leipzig",
        "placeSentId": "http://www.geonames.org/2879139/",
        "date": "1767-10-24",
        "receiver": "Behrisch, Ernst Wolfgang",
        "receiverKey": "SNDB43091",
        "receiverId": "http://d-nb.info/gnd/116111631",
        "placeReceived": "Dessau",
        "placeReceivedID": "http://www.geonames.org/2937959/",
        "year": "1767",
        "month": "10",
        "day": "24",
        "dateFormatted": "24. Oktober 1767",
        "type": "GB",
        "idFormatted": "GB01 Nr.31",
        "receiverFirstName": "Ernst Wolfgang",
        "receiverLastName": "Behrisch",
        "receiverFormatted": "Ernst Wolfgang Behrisch",
        "receiverInitials": "EB",
        "lobidURL": "https://lobid.org/gnd/116111631",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Männlich",
        "placeSentLat": "51.33962",
        "placeSentLong": "12.37129",
        "placeReceivedLat": "51.83864",
        "placeReceivedLong": "12.24555"
      },
      {
        "id": "GB01_1_BR028_0",
        "placeSent": "Leipzig",
        "placeSentId": "http://www.geonames.org/2879139/",
        "date": "1767-10-13",
        "receiver": "Behrisch, Ernst Wolfgang",
        "receiverKey": "SNDB43091",
        "receiverId": "http://d-nb.info/gnd/116111631",
        "placeReceived": "Leipzig",
        "placeReceivedID": "http://www.geonames.org/2879139/",
        "year": "1767",
        "month": "10",
        "day": "13",
        "dateFormatted": "13. Oktober 1767",
        "type": "GB",
        "idFormatted": "GB01 Nr.28",
        "receiverFirstName": "Ernst Wolfgang",
        "receiverLastName": "Behrisch",
        "receiverFormatted": "Ernst Wolfgang Behrisch",
        "receiverInitials": "EB",
        "lobidURL": "https://lobid.org/gnd/116111631",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Männlich",
        "placeSentLat": "51.33962",
        "placeSentLong": "12.37129",
        "placeReceivedLat": "51.33962",
        "placeReceivedLong": "12.37129"
      },
      {
        "id": "GB01_1_BR025_0",
        "placeSent": "Leipzig",
        "placeSentId": "http://www.geonames.org/2879139/",
        "date": "1767-08",
        "receiver": "Goethe, Cornelia",
        "receiverKey": "SNDB49571",
        "receiverId": "http://d-nb.info/gnd/11871791X",
        "placeReceived": "Frankfurt",
        "placeReceivedID": "http://www.geonames.org/2925533/",
        "year": "1767",
        "month": "08",
        "dateFormatted": "August 1767",
        "type": "GB",
        "idFormatted": "GB01 Nr.25",
        "receiverFirstName": "Cornelia",
        "receiverLastName": "Goethe",
        "receiverFormatted": "Cornelia Goethe",
        "receiverInitials": "CG",
        "lobidURL": "https://lobid.org/gnd/11871791X",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Weiblich",
        "placeSentLat": "51.33962",
        "placeSentLong": "12.37129",
        "placeReceivedLat": "50.11552",
        "placeReceivedLong": "8.68417"
      },
      {
        "id": "GB01_1_BR024_0",
        "placeSent": "Leipzig",
        "placeSentId": "http://www.geonames.org/2879139/",
        "date": "1767-08",
        "receiver": "Goethe, Cornelia",
        "receiverKey": "SNDB49571",
        "receiverId": "http://d-nb.info/gnd/11871791X",
        "placeReceived": "Frankfurt",
        "placeReceivedID": "http://www.geonames.org/2925533/",
        "year": "1767",
        "month": "08",
        "dateFormatted": "August 1767",
        "type": "GB",
        "idFormatted": "GB01 Nr.24",
        "receiverFirstName": "Cornelia",
        "receiverLastName": "Goethe",
        "receiverFormatted": "Cornelia Goethe",
        "receiverInitials": "CG",
        "lobidURL": "https://lobid.org/gnd/11871791X",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Weiblich",
        "placeSentLat": "51.33962",
        "placeSentLong": "12.37129",
        "placeReceivedLat": "50.11552",
        "placeReceivedLong": "8.68417"
      }
    ],
    "1768": [
      {
        "id": "GB01_1_BR041_0",
        "placeSent": "Leipzig",
        "placeSentId": "http://www.geonames.org/2879139/",
        "date": "1768-04-26",
        "receiver": "Behrisch, Ernst Wolfgang",
        "receiverKey": "SNDB43091",
        "receiverId": "http://d-nb.info/gnd/116111631",
        "placeReceived": "Dessau",
        "placeReceivedID": "http://www.geonames.org/2937959/",
        "year": "1768",
        "month": "04",
        "day": "26",
        "dateFormatted": "26. April 1768",
        "type": "GB",
        "idFormatted": "GB01 Nr.41",
        "receiverFirstName": "Ernst Wolfgang",
        "receiverLastName": "Behrisch",
        "receiverFormatted": "Ernst Wolfgang Behrisch",
        "receiverInitials": "EB",
        "lobidURL": "https://lobid.org/gnd/116111631",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Männlich",
        "placeSentLat": "51.33962",
        "placeSentLong": "12.37129",
        "placeReceivedLat": "51.83864",
        "placeReceivedLong": "12.24555"
      },
      {
        "id": "GB01_1_BR040_0",
        "placeSent": "Leipzig",
        "placeSentId": "http://www.geonames.org/2879139/",
        "date": "1768-03",
        "receiver": "Behrisch, Ernst Wolfgang",
        "receiverKey": "SNDB43091",
        "receiverId": "http://d-nb.info/gnd/116111631",
        "placeReceived": "Dessau",
        "placeReceivedID": "http://www.geonames.org/2937959/",
        "year": "1768",
        "month": "03",
        "dateFormatted": "März 1768",
        "type": "GB",
        "idFormatted": "GB01 Nr.40",
        "receiverFirstName": "Ernst Wolfgang",
        "receiverLastName": "Behrisch",
        "receiverFormatted": "Ernst Wolfgang Behrisch",
        "receiverInitials": "EB",
        "lobidURL": "https://lobid.org/gnd/116111631",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Männlich",
        "placeSentLat": "51.33962",
        "placeSentLong": "12.37129",
        "placeReceivedLat": "51.83864",
        "placeReceivedLong": "12.24555"
      }
    ]
  },
  "Frankfurt": {
    "1764": [
      {
        "id": "GB01_1_BR001_0",
        "placeSent": "Frankfurt",
        "placeSentId": "http://www.geonames.org/2925533/",
        "date": "1764-05-23",
        "receiver": "Buri, Ludwig Ysenburg von",
        "receiverKey": "SNDB36192",
        "receiverId": "http://d-nb.info/gnd/100063934",
        "placeReceived": "Neuhof",
        "placeReceivedID": "http://www.geonames.org/2864940/",
        "year": "1764",
        "month": "05",
        "day": "23",
        "dateFormatted": "23. Mai 1764",
        "type": "GB",
        "idFormatted": "GB01 Nr.1",
        "receiverFirstName": "Ludwig Ysenburg von",
        "receiverLastName": "Buri",
        "receiverFormatted": "Ludwig Ysenburg von Buri",
        "receiverInitials": "LB",
        "lobidURL": "https://lobid.org/gnd/100063934",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Männlich",
        "placeSentLat": "50.11552",
        "placeSentLong": "8.68417",
        "placeReceivedLat": "50.17123",
        "placeReceivedLong": "8.21065"
      },
      {
        "id": "GB01_1_BR002_0",
        "placeSent": "Frankfurt",
        "placeSentId": "http://www.geonames.org/2925533/",
        "date": "1764-06-02",
        "receiver": "Buri, Ludwig Ysenburg von",
        "receiverKey": "SNDB63170",
        "receiverId": "http://d-nb.info/gnd/100063934",
        "placeReceived": "Neuhof",
        "placeReceivedID": "http://www.geonames.org/2864940/",
        "year": "1764",
        "month": "06",
        "day": "02",
        "dateFormatted": "02. Juni 1764",
        "type": "GB",
        "idFormatted": "GB01 Nr.2",
        "receiverFirstName": "Ludwig Ysenburg von",
        "receiverLastName": "Buri",
        "receiverFormatted": "Ludwig Ysenburg von Buri",
        "receiverInitials": "LB",
        "lobidURL": "https://lobid.org/gnd/100063934",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Männlich",
        "placeSentLat": "50.11552",
        "placeSentLong": "8.68417",
        "placeReceivedLat": "50.17123",
        "placeReceivedLong": "8.21065"
      },
      {
        "id": "GB01_1_BR003_0",
        "placeSent": "Frankfurt",
        "placeSentId": "http://www.geonames.org/2925533/",
        "date": "1764-07-06",
        "receiver": "Buri, Ludwig Ysenburg von",
        "receiverKey": "SNDB63170",
        "receiverId": "http://d-nb.info/gnd/100063934",
        "placeReceived": "Neuhof",
        "placeReceivedID": "http://www.geonames.org/2864940/",
        "year": "1764",
        "month": "07",
        "day": "06",
        "dateFormatted": "06. Juli 1764",
        "type": "GB",
        "idFormatted": "GB01 Nr.3",
        "receiverFirstName": "Ludwig Ysenburg von",
        "receiverLastName": "Buri",
        "receiverFormatted": "Ludwig Ysenburg von Buri",
        "receiverInitials": "LB",
        "lobidURL": "https://lobid.org/gnd/100063934",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Männlich",
        "placeSentLat": "50.11552",
        "placeSentLong": "8.68417",
        "placeReceivedLat": "50.17123",
        "placeReceivedLong": "8.21065"
      }
    ],
    "1768": [
      {
        "id": "GB01_1_BR053_0",
        "placeSent": "Frankfurt",
        "placeSentId": "http://www.geonames.org/2925533/",
        "date": "1768-12-30",
        "receiver": "Schönkopf, Anna Catharina",
        "receiverKey": "SNDB53514",
        "receiverId": "http://d-nb.info/gnd/118951777",
        "placeReceived": "Leipzig",
        "placeReceivedID": "http://www.geonames.org/2879139/",
        "year": "1768",
        "month": "12",
        "day": "30",
        "dateFormatted": "30. Dezember 1768",
        "type": "GB",
        "idFormatted": "GB01 Nr.53",
        "receiverFirstName": "Anna Catharina",
        "receiverLastName": "Schönkopf",
        "receiverFormatted": "Anna Catharina Schönkopf",
        "receiverInitials": "AS",
        "lobidURL": "https://lobid.org/gnd/118951777",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Weiblich",
        "placeSentLat": "50.11552",
        "placeSentLong": "8.68417",
        "placeReceivedLat": "51.33962",
        "placeReceivedLong": "12.37129"
      },
      {
        "id": "GB01_1_BR052_0",
        "placeSent": "Frankfurt",
        "placeSentId": "http://www.geonames.org/2925533/",
        "date": "1768-11-24",
        "receiver": "Oeser, Adam Friedrich",
        "receiverKey": "SNDB53395",
        "receiverId": "http://d-nb.info/gnd/118786792",
        "placeReceived": "Leipzig",
        "placeReceivedID": "http://www.geonames.org/2879139/",
        "year": "1768",
        "month": "11",
        "day": "24",
        "dateFormatted": "24. November 1768",
        "type": "GB",
        "idFormatted": "GB01 Nr.52",
        "receiverFirstName": "Adam Friedrich",
        "receiverLastName": "Oeser",
        "receiverFormatted": "Adam Friedrich Oeser",
        "receiverInitials": "AO",
        "lobidURL": "https://lobid.org/gnd/118786792",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Männlich",
        "placeSentLat": "50.11552",
        "placeSentLong": "8.68417",
        "placeReceivedLat": "51.33962",
        "placeReceivedLong": "12.37129"
      },
      {
        "id": "GB01_1_BR051_0",
        "placeSent": "Frankfurt",
        "placeSentId": "http://www.geonames.org/2925533/",
        "date": "1768-11-24",
        "receiver": "Langer, Ernst Theodor",
        "receiverKey": "SNDB53311",
        "receiverId": "http://d-nb.info/gnd/116719761",
        "placeReceived": "Leipzig",
        "placeReceivedID": "http://www.geonames.org/2879139/",
        "year": "1768",
        "month": "11",
        "day": "24",
        "dateFormatted": "24. November 1768",
        "type": "GB",
        "idFormatted": "GB01 Nr.51",
        "receiverFirstName": "Ernst Theodor",
        "receiverLastName": "Langer",
        "receiverFormatted": "Ernst Theodor Langer",
        "receiverInitials": "EL",
        "lobidURL": "https://lobid.org/gnd/116719761",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Männlich",
        "placeSentLat": "50.11552",
        "placeSentLong": "8.68417",
        "placeReceivedLat": "51.33962",
        "placeReceivedLong": "12.37129"
      },
      {
        "id": "GB01_1_BR050_0",
        "placeSent": "Frankfurt",
        "placeSentId": "http://www.geonames.org/2925533/",
        "date": "1768-11-09",
        "receiver": "Langer, Ernst Theodor",
        "receiverKey": "SNDB53311",
        "receiverId": "http://d-nb.info/gnd/116719761",
        "placeReceived": "Leipzig",
        "placeReceivedID": "http://www.geonames.org/2879139/",
        "year": "1768",
        "month": "11",
        "day": "09",
        "dateFormatted": "09. November 1768",
        "type": "GB",
        "idFormatted": "GB01 Nr.50",
        "receiverFirstName": "Ernst Theodor",
        "receiverLastName": "Langer",
        "receiverFormatted": "Ernst Theodor Langer",
        "receiverInitials": "EL",
        "lobidURL": "https://lobid.org/gnd/116719761",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Männlich",
        "placeSentLat": "50.11552",
        "placeSentLong": "8.68417",
        "placeReceivedLat": "51.33962",
        "placeReceivedLong": "12.37129"
      },
      {
        "id": "GB01_1_BR049_0",
        "placeSent": "Frankfurt",
        "placeSentId": "http://www.geonames.org/2925533/",
        "date": "1768-11-09",
        "receiver": "Oeser, Adam Friedrich",
        "receiverKey": "SNDB53395",
        "receiverId": "http://d-nb.info/gnd/118786792",
        "placeReceived": "Leipzig",
        "placeReceivedID": "http://www.geonames.org/2879139/",
        "year": "1768",
        "month": "11",
        "day": "09",
        "dateFormatted": "09. November 1768",
        "type": "GB",
        "idFormatted": "GB01 Nr.49",
        "receiverFirstName": "Adam Friedrich",
        "receiverLastName": "Oeser",
        "receiverFormatted": "Adam Friedrich Oeser",
        "receiverInitials": "AO",
        "lobidURL": "https://lobid.org/gnd/118786792",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Männlich",
        "placeSentLat": "50.11552",
        "placeSentLong": "8.68417",
        "placeReceivedLat": "51.33962",
        "placeReceivedLong": "12.37129"
      },
      {
        "id": "GB01_1_BR048_0",
        "placeSent": "Frankfurt",
        "placeSentId": "http://www.geonames.org/2925533/",
        "date": "1768-11-06",
        "receiver": "Oeser, Friederike",
        "receiverKey": "SNDB44718",
        "receiverId": "http://d-nb.info/gnd/117106666",
        "placeReceived": "Leipzig",
        "placeReceivedID": "http://www.geonames.org/2879139/",
        "year": "1768",
        "month": "11",
        "day": "06",
        "dateFormatted": "06. November 1768",
        "type": "GB",
        "idFormatted": "GB01 Nr.48",
        "receiverFirstName": "Friederike",
        "receiverLastName": "Oeser",
        "receiverFormatted": "Friederike Oeser",
        "receiverInitials": "FO",
        "lobidURL": "https://lobid.org/gnd/117106666",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Weiblich",
        "placeSentLat": "50.11552",
        "placeSentLong": "8.68417",
        "placeReceivedLat": "51.33962",
        "placeReceivedLong": "12.37129"
      },
      {
        "id": "GB01_1_BR047_0",
        "placeSent": "Frankfurt",
        "placeSentId": "http://www.geonames.org/2925533/",
        "date": "1768-11-01",
        "receiver": "Schönkopf, Anna Catharina",
        "receiverKey": "SNDB53514",
        "receiverId": "http://d-nb.info/gnd/118951777",
        "placeReceived": "Leipzig",
        "placeReceivedID": "http://www.geonames.org/2879139/",
        "year": "1768",
        "month": "11",
        "day": "01",
        "dateFormatted": "01. November 1768",
        "type": "GB",
        "idFormatted": "GB01 Nr.47",
        "receiverFirstName": "Anna Catharina",
        "receiverLastName": "Schönkopf",
        "receiverFormatted": "Anna Catharina Schönkopf",
        "receiverInitials": "AS",
        "lobidURL": "https://lobid.org/gnd/118951777",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Weiblich",
        "placeSentLat": "50.11552",
        "placeSentLong": "8.68417",
        "placeReceivedLat": "51.33962",
        "placeReceivedLong": "12.37129"
      },
      {
        "id": "GB01_1_BR045_0",
        "placeSent": "Frankfurt",
        "placeSentId": "http://www.geonames.org/2925533/",
        "date": "1768-09",
        "receiver": "Schönkopf, Anna Catharina",
        "receiverKey": "SNDB53514",
        "receiverId": "http://d-nb.info/gnd/118951777",
        "placeReceived": "Leipzig",
        "placeReceivedID": "http://www.geonames.org/2879139/",
        "year": "1768",
        "month": "09",
        "dateFormatted": "September 1768",
        "type": "GB",
        "idFormatted": "GB01 Nr.45",
        "receiverFirstName": "Anna Catharina",
        "receiverLastName": "Schönkopf",
        "receiverFormatted": "Anna Catharina Schönkopf",
        "receiverInitials": "AS",
        "lobidURL": "https://lobid.org/gnd/118951777",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Weiblich",
        "placeSentLat": "50.11552",
        "placeSentLong": "8.68417",
        "placeReceivedLat": "51.33962",
        "placeReceivedLong": "12.37129"
      },
      {
        "id": "GB01_1_BR044_0",
        "placeSent": "Frankfurt",
        "placeSentId": "http://www.geonames.org/2925533/",
        "date": "1768-09-13",
        "receiver": "Oeser, Adam Friedrich",
        "receiverKey": "SNDB53395",
        "receiverId": "http://d-nb.info/gnd/118786792",
        "placeReceived": "Leipzig",
        "placeReceivedID": "http://www.geonames.org/2879139/",
        "year": "1768",
        "month": "09",
        "day": "13",
        "dateFormatted": "13. September 1768",
        "type": "GB",
        "idFormatted": "GB01 Nr.44",
        "receiverFirstName": "Adam Friedrich",
        "receiverLastName": "Oeser",
        "receiverFormatted": "Adam Friedrich Oeser",
        "receiverInitials": "AO",
        "lobidURL": "https://lobid.org/gnd/118786792",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Männlich",
        "placeSentLat": "50.11552",
        "placeSentLong": "8.68417",
        "placeReceivedLat": "51.33962",
        "placeReceivedLong": "12.37129"
      },
      {
        "id": "GB01_1_BR043_0",
        "placeSent": "Frankfurt",
        "placeSentId": "http://www.geonames.org/2925533/",
        "date": "1768-09-08",
        "receiver": "Langer, Ernst Theodor",
        "receiverKey": "SNDB53311",
        "receiverId": "http://d-nb.info/gnd/116719761",
        "placeReceived": "Leipzig",
        "placeReceivedID": "http://www.geonames.org/2879139/",
        "year": "1768",
        "month": "09",
        "day": "08",
        "dateFormatted": "08. September 1768",
        "type": "GB",
        "idFormatted": "GB01 Nr.43",
        "receiverFirstName": "Ernst Theodor",
        "receiverLastName": "Langer",
        "receiverFormatted": "Ernst Theodor Langer",
        "receiverInitials": "EL",
        "lobidURL": "https://lobid.org/gnd/116719761",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Männlich",
        "placeSentLat": "50.11552",
        "placeSentLong": "8.68417",
        "placeReceivedLat": "51.33962",
        "placeReceivedLong": "12.37129"
      }
    ],
    "1769": [
      {
        "id": "GB01_1_BR060_0",
        "placeSent": "Frankfurt",
        "placeSentId": "http://www.geonames.org/2925533/",
        "date": "1769-08-26",
        "receiver": "Schönkopf, Anna Catharina",
        "receiverKey": "SNDB53514",
        "receiverId": "http://d-nb.info/gnd/118951777",
        "placeReceived": "Leipzig",
        "placeReceivedID": "http://www.geonames.org/2879139/",
        "year": "1769",
        "month": "08",
        "day": "26",
        "dateFormatted": "26. August 1769",
        "type": "GB",
        "idFormatted": "GB01 Nr.60",
        "receiverFirstName": "Anna Catharina",
        "receiverLastName": "Schönkopf",
        "receiverFormatted": "Anna Catharina Schönkopf",
        "receiverInitials": "AS",
        "lobidURL": "https://lobid.org/gnd/118951777",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Weiblich",
        "placeSentLat": "50.11552",
        "placeSentLong": "8.68417",
        "placeReceivedLat": "51.33962",
        "placeReceivedLong": "12.37129"
      },
      {
        "id": "GB01_1_EB013_0",
        "placeSent": "Frankfurt",
        "placeSentId": "http://www.geonames.org/2925533/",
        "date": "1769-01-17",
        "receiver": "Horn, Johann Adam",
        "receiverKey": "SNDB38230",
        "receiverId": "http://d-nb.info/gnd/119027682",
        "placeReceived": "Leipzig",
        "placeReceivedID": "http://www.geonames.org/2879139/",
        "year": "1769",
        "month": "01",
        "day": "17",
        "dateFormatted": "17. Januar 1769",
        "type": "GB",
        "idFormatted": "GB01 Nr.EB013",
        "receiverFirstName": "Johann Adam",
        "receiverLastName": "Horn",
        "receiverFormatted": "Johann Adam Horn",
        "receiverInitials": "JH",
        "lobidURL": "https://lobid.org/gnd/119027682",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Männlich",
        "placeSentLat": "50.11552",
        "placeSentLong": "8.68417",
        "placeReceivedLat": "51.33962",
        "placeReceivedLong": "12.37129"
      },
      {
        "id": "GB01_1_BR064_0",
        "placeSent": "Frankfurt",
        "placeSentId": "http://www.geonames.org/2925533/",
        "date": "1769-12-12",
        "receiver": "Schönkopf, Anna Catharina",
        "receiverKey": "SNDB53514",
        "receiverId": "http://d-nb.info/gnd/118951777",
        "placeReceived": "Leipzig",
        "placeReceivedID": "http://www.geonames.org/2879139/",
        "year": "1769",
        "month": "12",
        "day": "12",
        "dateFormatted": "12. Dezember 1769",
        "type": "GB",
        "idFormatted": "GB01 Nr.64",
        "receiverFirstName": "Anna Catharina",
        "receiverLastName": "Schönkopf",
        "receiverFormatted": "Anna Catharina Schönkopf",
        "receiverInitials": "AS",
        "lobidURL": "https://lobid.org/gnd/118951777",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Weiblich",
        "placeSentLat": "50.11552",
        "placeSentLong": "8.68417",
        "placeReceivedLat": "51.33962",
        "placeReceivedLong": "12.37129"
      },
      {
        "id": "GB01_1_BR063_0",
        "placeSent": "Frankfurt",
        "placeSentId": "http://www.geonames.org/2925533/",
        "date": "1769-11-30",
        "receiver": "Langer, Ernst Theodor",
        "receiverKey": "SNDB53311",
        "receiverId": "http://d-nb.info/gnd/116719761",
        "placeReceived": "Lausanne",
        "placeReceivedID": "http://www.geonames.org/2659994/",
        "year": "1769",
        "month": "11",
        "day": "30",
        "dateFormatted": "30. November 1769",
        "type": "GB",
        "idFormatted": "GB01 Nr.63",
        "receiverFirstName": "Ernst Theodor",
        "receiverLastName": "Langer",
        "receiverFormatted": "Ernst Theodor Langer",
        "receiverInitials": "EL",
        "lobidURL": "https://lobid.org/gnd/116719761",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Männlich",
        "placeSentLat": "50.11552",
        "placeSentLong": "8.68417",
        "placeReceivedLat": "46.516",
        "placeReceivedLong": "6.63282"
      },
      {
        "id": "GB01_1_BR061_0",
        "placeSent": "Frankfurt",
        "placeSentId": "http://www.geonames.org/2925533/",
        "date": "1769-08",
        "receiver": "Breitkopf, Christoph Gottlob",
        "receiverKey": "SNDB36046",
        "receiverId": "http://d-nb.info/gnd/120691124",
        "placeReceived": "Leipzig",
        "placeReceivedID": "http://www.geonames.org/2879139/",
        "year": "1769",
        "month": "08",
        "dateFormatted": "August 1769",
        "type": "GB",
        "idFormatted": "GB01 Nr.61",
        "receiverFirstName": "Christoph Gottlob",
        "receiverLastName": "Breitkopf",
        "receiverFormatted": "Christoph Gottlob Breitkopf",
        "receiverInitials": "CB",
        "lobidURL": "https://lobid.org/gnd/120691124",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Männlich",
        "placeSentLat": "50.11552",
        "placeSentLong": "8.68417",
        "placeReceivedLat": "51.33962",
        "placeReceivedLong": "12.37129"
      },
      {
        "id": "GB01_1_BR059_0",
        "placeSent": "Frankfurt",
        "placeSentId": "http://www.geonames.org/2925533/",
        "date": "1769-06-01",
        "receiver": "Schönkopf, Anna Catharina",
        "receiverKey": "SNDB53514",
        "receiverId": "http://d-nb.info/gnd/118951777",
        "placeReceived": "Leipzig",
        "placeReceivedID": "http://www.geonames.org/2879139/",
        "year": "1769",
        "month": "06",
        "day": "01",
        "dateFormatted": "01. Juni 1769",
        "type": "GB",
        "idFormatted": "GB01 Nr.59",
        "receiverFirstName": "Anna Catharina",
        "receiverLastName": "Schönkopf",
        "receiverFormatted": "Anna Catharina Schönkopf",
        "receiverInitials": "AS",
        "lobidURL": "https://lobid.org/gnd/118951777",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Weiblich",
        "placeSentLat": "50.11552",
        "placeSentLong": "8.68417",
        "placeReceivedLat": "51.33962",
        "placeReceivedLong": "12.37129"
      },
      {
        "id": "GB01_1_BR058_0",
        "placeSent": "Frankfurt",
        "placeSentId": "http://www.geonames.org/2925533/",
        "date": "1769-04-08",
        "receiver": "Oeser, Friederike",
        "receiverKey": "SNDB44718",
        "receiverId": "http://d-nb.info/gnd/117106666",
        "placeReceived": "Leipzig",
        "placeReceivedID": "http://www.geonames.org/2879139/",
        "year": "1769",
        "month": "04",
        "day": "08",
        "dateFormatted": "08. April 1769",
        "type": "GB",
        "idFormatted": "GB01 Nr.58",
        "receiverFirstName": "Friederike",
        "receiverLastName": "Oeser",
        "receiverFormatted": "Friederike Oeser",
        "receiverInitials": "FO",
        "lobidURL": "https://lobid.org/gnd/117106666",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Weiblich",
        "placeSentLat": "50.11552",
        "placeSentLong": "8.68417",
        "placeReceivedLat": "51.33962",
        "placeReceivedLong": "12.37129"
      },
      {
        "id": "GB01_1_BR057_0",
        "placeSent": "Frankfurt",
        "placeSentId": "http://www.geonames.org/2925533/",
        "date": "1769-02-14",
        "receiver": "Oeser, Adam Friedrich",
        "receiverKey": "SNDB53395",
        "receiverId": "http://d-nb.info/gnd/118786792",
        "placeReceived": "Leipzig",
        "placeReceivedID": "http://www.geonames.org/2879139/",
        "year": "1769",
        "month": "02",
        "day": "14",
        "dateFormatted": "14. Februar 1769",
        "type": "GB",
        "idFormatted": "GB01 Nr.57",
        "receiverFirstName": "Adam Friedrich",
        "receiverLastName": "Oeser",
        "receiverFormatted": "Adam Friedrich Oeser",
        "receiverInitials": "AO",
        "lobidURL": "https://lobid.org/gnd/118786792",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Männlich",
        "placeSentLat": "50.11552",
        "placeSentLong": "8.68417",
        "placeReceivedLat": "51.33962",
        "placeReceivedLong": "12.37129"
      },
      {
        "id": "GB01_1_BR056_0",
        "placeSent": "Frankfurt",
        "placeSentId": "http://www.geonames.org/2925533/",
        "date": "1769-02-13",
        "receiver": "Oeser, Friederike",
        "receiverKey": "SNDB44718",
        "receiverId": "http://d-nb.info/gnd/117106666",
        "placeReceived": "Leipzig",
        "placeReceivedID": "http://www.geonames.org/2879139/",
        "year": "1769",
        "month": "02",
        "day": "13",
        "dateFormatted": "13. Februar 1769",
        "type": "GB",
        "idFormatted": "GB01 Nr.56",
        "receiverFirstName": "Friederike",
        "receiverLastName": "Oeser",
        "receiverFormatted": "Friederike Oeser",
        "receiverInitials": "FO",
        "lobidURL": "https://lobid.org/gnd/117106666",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Weiblich",
        "placeSentLat": "50.11552",
        "placeSentLong": "8.68417",
        "placeReceivedLat": "51.33962",
        "placeReceivedLong": "12.37129"
      },
      {
        "id": "GB01_1_BR055_0",
        "placeSent": "Frankfurt",
        "placeSentId": "http://www.geonames.org/2925533/",
        "date": "1769-01-31",
        "receiver": "Schönkopf, Anna Catharina",
        "receiverKey": "SNDB53514",
        "receiverId": "http://d-nb.info/gnd/118951777",
        "placeReceived": "Leipzig",
        "placeReceivedID": "http://www.geonames.org/2879139/",
        "year": "1769",
        "month": "01",
        "day": "31",
        "dateFormatted": "31. Januar 1769",
        "type": "GB",
        "idFormatted": "GB01 Nr.55",
        "receiverFirstName": "Anna Catharina",
        "receiverLastName": "Schönkopf",
        "receiverFormatted": "Anna Catharina Schönkopf",
        "receiverInitials": "AS",
        "lobidURL": "https://lobid.org/gnd/118951777",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Weiblich",
        "placeSentLat": "50.11552",
        "placeSentLong": "8.68417",
        "placeReceivedLat": "51.33962",
        "placeReceivedLong": "12.37129"
      },
      {
        "id": "GB01_1_BR054_0",
        "placeSent": "Frankfurt",
        "placeSentId": "http://www.geonames.org/2925533/",
        "date": "1769-01-17",
        "receiver": "Langer, Ernst Theodor",
        "receiverKey": "SNDB53311",
        "receiverId": "http://d-nb.info/gnd/116719761",
        "placeReceived": "Leipzig",
        "placeReceivedID": "http://www.geonames.org/2879139/",
        "year": "1769",
        "month": "01",
        "day": "17",
        "dateFormatted": "17. Januar 1769",
        "type": "GB",
        "idFormatted": "GB01 Nr.54",
        "receiverFirstName": "Ernst Theodor",
        "receiverLastName": "Langer",
        "receiverFormatted": "Ernst Theodor Langer",
        "receiverInitials": "EL",
        "lobidURL": "https://lobid.org/gnd/116719761",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Männlich",
        "placeSentLat": "50.11552",
        "placeSentLong": "8.68417",
        "placeReceivedLat": "51.33962",
        "placeReceivedLong": "12.37129"
      }
    ],
    "1770": [
      {
        "id": "GB01_1_BR067_0",
        "placeSent": "Frankfurt",
        "placeSentId": "http://www.geonames.org/2925533/",
        "date": "1770-02-20",
        "receiver": "Reich, Philipp Erasmus",
        "receiverKey": "SNDB53451",
        "receiverId": "http://d-nb.info/gnd/118809334",
        "placeReceived": "Leipzig",
        "placeReceivedID": "http://www.geonames.org/2879139/",
        "year": "1770",
        "month": "02",
        "day": "20",
        "dateFormatted": "20. Februar 1770",
        "type": "GB",
        "idFormatted": "GB01 Nr.67",
        "receiverFirstName": "Philipp Erasmus",
        "receiverLastName": "Reich",
        "receiverFormatted": "Philipp Erasmus Reich",
        "receiverInitials": "PR",
        "lobidURL": "https://lobid.org/gnd/118809334",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Männlich",
        "placeSentLat": "50.11552",
        "placeSentLong": "8.68417",
        "placeReceivedLat": "51.33962",
        "placeReceivedLong": "12.37129"
      },
      {
        "id": "GB01_1_BR066_0",
        "placeSent": "Frankfurt",
        "placeSentId": "http://www.geonames.org/2925533/",
        "date": "1770-02-06",
        "receiver": "Hermann, Christian Gottfried",
        "receiverKey": "SNDB53840",
        "receiverId": "http://d-nb.info/gnd/140977953",
        "placeReceived": "Leipzig",
        "placeReceivedID": "http://www.geonames.org/2879139/",
        "year": "1770",
        "month": "02",
        "day": "06",
        "dateFormatted": "06. Februar 1770",
        "type": "GB",
        "idFormatted": "GB01 Nr.66",
        "receiverFirstName": "Christian Gottfried",
        "receiverLastName": "Hermann",
        "receiverFormatted": "Christian Gottfried Hermann",
        "receiverInitials": "CH",
        "lobidURL": "https://lobid.org/gnd/140977953",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Männlich",
        "placeSentLat": "50.11552",
        "placeSentLong": "8.68417",
        "placeReceivedLat": "51.33962",
        "placeReceivedLong": "12.37129"
      },
      {
        "id": "GB01_1_BR065_0",
        "placeSent": "Frankfurt",
        "placeSentId": "http://www.geonames.org/2925533/",
        "date": "1770-01-23",
        "receiver": "Schönkopf, Anna Catharina",
        "receiverKey": "SNDB53514",
        "receiverId": "http://d-nb.info/gnd/118951777",
        "placeReceived": "Leipzig",
        "placeReceivedID": "http://www.geonames.org/2879139/",
        "year": "1770",
        "month": "01",
        "day": "23",
        "dateFormatted": "23. Januar 1770",
        "type": "GB",
        "idFormatted": "GB01 Nr.65",
        "receiverFirstName": "Anna Catharina",
        "receiverLastName": "Schönkopf",
        "receiverFormatted": "Anna Catharina Schönkopf",
        "receiverInitials": "AS",
        "lobidURL": "https://lobid.org/gnd/118951777",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Weiblich",
        "placeSentLat": "50.11552",
        "placeSentLong": "8.68417",
        "placeReceivedLat": "51.33962",
        "placeReceivedLong": "12.37129"
      }
    ],
    "1771": [
      {
        "id": "GB01_1_BR093_0",
        "placeSent": "Frankfurt",
        "placeSentId": "http://www.geonames.org/2925533/",
        "date": "1771-11-28",
        "receiver": "Salzmann, Johann Daniel",
        "receiverKey": "SNDB41006",
        "receiverId": "http://d-nb.info/gnd/116777265",
        "placeReceived": "Strassburg",
        "placeReceivedID": "http://www.geonames.org/2973783/",
        "year": "1771",
        "month": "11",
        "day": "28",
        "dateFormatted": "28. November 1771",
        "type": "GB",
        "idFormatted": "GB01 Nr.93",
        "receiverFirstName": "Johann Daniel",
        "receiverLastName": "Salzmann",
        "receiverFormatted": "Johann Daniel Salzmann",
        "receiverInitials": "JS",
        "lobidURL": "https://lobid.org/gnd/116777265",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Männlich",
        "placeSentLat": "50.11552",
        "placeSentLong": "8.68417",
        "placeReceivedLat": "48.58392",
        "placeReceivedLong": "7.74553"
      },
      {
        "id": "GB01_1_BR092_0",
        "placeSent": "Frankfurt",
        "placeSentId": "http://www.geonames.org/2925533/",
        "date": "1771-10",
        "receiver": "Herder, Johann Gottfried",
        "receiverKey": "SNDB20408",
        "receiverId": "http://d-nb.info/gnd/118549553",
        "placeReceived": "Bückeburg",
        "placeReceivedID": "http://www.geonames.org/2942159/",
        "year": "1771",
        "month": "10",
        "dateFormatted": "Oktober 1771",
        "type": "GB",
        "idFormatted": "GB01 Nr.92",
        "receiverFirstName": "Johann Gottfried",
        "receiverLastName": "Herder",
        "receiverFormatted": "Johann Gottfried Herder",
        "receiverInitials": "JH",
        "lobidURL": "https://lobid.org/gnd/118549553",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Männlich",
        "placeSentLat": "50.11552",
        "placeSentLong": "8.68417",
        "placeReceivedLat": "52.26065",
        "placeReceivedLong": "9.04939"
      },
      {
        "id": "GB01_1_BR088_0",
        "placeSent": "Frankfurt",
        "placeSentId": "http://www.geonames.org/2925533/",
        "date": "1771-09-21",
        "receiver": "Roederer, Johann Gottfried",
        "receiverKey": "SNDB53479",
        "receiverId": "http://d-nb.info/gnd/124456359",
        "placeReceived": "Strassburg",
        "placeReceivedID": "http://www.geonames.org/2973783/",
        "year": "1771",
        "month": "09",
        "day": "21",
        "dateFormatted": "21. September 1771",
        "type": "GB",
        "idFormatted": "GB01 Nr.88",
        "receiverFirstName": "Johann Gottfried",
        "receiverLastName": "Roederer",
        "receiverFormatted": "Johann Gottfried Roederer",
        "receiverInitials": "JR",
        "lobidURL": "https://lobid.org/gnd/124456359",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Unbekannt",
        "placeSentLat": "50.11552",
        "placeSentLong": "8.68417",
        "placeReceivedLat": "48.58392",
        "placeReceivedLong": "7.74553"
      },
      {
        "id": "GB01_1_BR087_0",
        "placeSent": "Frankfurt",
        "placeSentId": "http://www.geonames.org/2925533/",
        "date": "1771-08-28",
        "receiver": "",
        "receiverKey": "",
        "receiverId": "",
        "placeReceived": "Frankfurt",
        "placeReceivedID": "http://www.geonames.org/2925533/",
        "year": "1771",
        "month": "08",
        "day": "28",
        "dateFormatted": "28. August 1771",
        "type": "GB",
        "idFormatted": "GB01 Nr.87",
        "receiverFirstName": "",
        "receiverLastName": "",
        "receiverFormatted": " ",
        "receiverInitials": "",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Keine Info",
        "placeSentLat": "50.11552",
        "placeSentLong": "8.68417",
        "placeReceivedLat": "50.11552",
        "placeReceivedLong": "8.68417"
      }
    ],
    "1772": [
      {
        "id": "GB01_1_EB021_0",
        "placeSent": "Frankfurt",
        "placeSentId": "http://www.geonames.org/2925533/",
        "date": "1772-01",
        "receiver": "Salzmann, Johann Daniel",
        "receiverKey": "SNDB41006",
        "receiverId": "http://d-nb.info/gnd/116777265",
        "placeReceived": "Strassburg",
        "placeReceivedID": "http://www.geonames.org/2973783/",
        "year": "1772",
        "month": "01",
        "dateFormatted": "Januar 1772",
        "type": "GB",
        "idFormatted": "GB01 Nr.EB021",
        "receiverFirstName": "Johann Daniel",
        "receiverLastName": "Salzmann",
        "receiverFormatted": "Johann Daniel Salzmann",
        "receiverInitials": "JS",
        "lobidURL": "https://lobid.org/gnd/116777265",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Männlich",
        "placeSentLat": "50.11552",
        "placeSentLong": "8.68417",
        "placeReceivedLat": "48.58392",
        "placeReceivedLong": "7.74553"
      },
      {
        "id": "GB01_1_BR124_0",
        "placeSent": "Frankfurt",
        "placeSentId": "http://www.geonames.org/2925533/",
        "date": "1772-12-25",
        "receiver": "Kestner, Johann Christian",
        "receiverKey": "SNDB38559",
        "receiverId": "http://d-nb.info/gnd/116150874",
        "placeReceived": "Wetzlar",
        "placeReceivedID": "http://www.geonames.org/2809889/",
        "year": "1772",
        "month": "12",
        "day": "25",
        "dateFormatted": "25. Dezember 1772",
        "type": "GB",
        "idFormatted": "GB01 Nr.124",
        "receiverFirstName": "Johann Christian",
        "receiverLastName": "Kestner",
        "receiverFormatted": "Johann Christian Kestner",
        "receiverInitials": "JK",
        "lobidURL": "https://lobid.org/gnd/116150874",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Männlich",
        "placeSentLat": "50.11552",
        "placeSentLong": "8.68417",
        "placeReceivedLat": "50.56109",
        "placeReceivedLong": "8.50495"
      },
      {
        "id": "GB01_1_BR122_0",
        "placeSent": "Frankfurt",
        "placeSentId": "http://www.geonames.org/2925533/",
        "date": "1772-12-15",
        "receiver": "Kestner, Johann Christian",
        "receiverKey": "SNDB38559",
        "receiverId": "http://d-nb.info/gnd/116150874",
        "placeReceived": "Wetzlar",
        "placeReceivedID": "http://www.geonames.org/2809889/",
        "year": "1772",
        "month": "12",
        "day": "15",
        "dateFormatted": "15. Dezember 1772",
        "type": "GB",
        "idFormatted": "GB01 Nr.122",
        "receiverFirstName": "Johann Christian",
        "receiverLastName": "Kestner",
        "receiverFormatted": "Johann Christian Kestner",
        "receiverInitials": "JK",
        "lobidURL": "https://lobid.org/gnd/116150874",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Männlich",
        "placeSentLat": "50.11552",
        "placeSentLong": "8.68417",
        "placeReceivedLat": "50.56109",
        "placeReceivedLong": "8.50495"
      },
      {
        "id": "GB01_1_BR115_0",
        "placeSent": "Frankfurt",
        "placeSentId": "http://www.geonames.org/2925533/",
        "date": "1772-11-14",
        "receiver": "Kestner, Johann Christian",
        "receiverKey": "SNDB38559",
        "receiverId": "http://d-nb.info/gnd/116150874",
        "placeReceived": "Wetzlar",
        "placeReceivedID": "http://www.geonames.org/2809889/",
        "year": "1772",
        "month": "11",
        "day": "14",
        "dateFormatted": "14. November 1772",
        "type": "GB",
        "idFormatted": "GB01 Nr.115",
        "receiverFirstName": "Johann Christian",
        "receiverLastName": "Kestner",
        "receiverFormatted": "Johann Christian Kestner",
        "receiverInitials": "JK",
        "lobidURL": "https://lobid.org/gnd/116150874",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Männlich",
        "placeSentLat": "50.11552",
        "placeSentLong": "8.68417",
        "placeReceivedLat": "50.56109",
        "placeReceivedLong": "8.50495"
      },
      {
        "id": "GB01_1_BR114_0",
        "placeSent": "Frankfurt",
        "placeSentId": "http://www.geonames.org/2925533/",
        "date": "1772-11-13",
        "receiver": "Kestner, Johann Christian",
        "receiverKey": "SNDB38559",
        "receiverId": "http://d-nb.info/gnd/116150874",
        "placeReceived": "Wetzlar",
        "placeReceivedID": "http://www.geonames.org/2809889/",
        "year": "1772",
        "month": "11",
        "day": "13",
        "dateFormatted": "13. November 1772",
        "type": "GB",
        "idFormatted": "GB01 Nr.114",
        "receiverFirstName": "Johann Christian",
        "receiverLastName": "Kestner",
        "receiverFormatted": "Johann Christian Kestner",
        "receiverInitials": "JK",
        "lobidURL": "https://lobid.org/gnd/116150874",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Männlich",
        "placeSentLat": "50.11552",
        "placeSentLong": "8.68417",
        "placeReceivedLat": "50.56109",
        "placeReceivedLong": "8.50495"
      },
      {
        "id": "GB01_1_BR111_0",
        "placeSent": "Frankfurt",
        "placeSentId": "http://www.geonames.org/2925533/",
        "date": "1772-10-27",
        "receiver": "Kestner, Johann Christian",
        "receiverKey": "SNDB38559",
        "receiverId": "http://d-nb.info/gnd/116150874",
        "placeReceived": "Wetzlar",
        "placeReceivedID": "http://www.geonames.org/2809889/",
        "year": "1772",
        "month": "10",
        "day": "27",
        "dateFormatted": "27. Oktober 1772",
        "type": "GB",
        "idFormatted": "GB01 Nr.111",
        "receiverFirstName": "Johann Christian",
        "receiverLastName": "Kestner",
        "receiverFormatted": "Johann Christian Kestner",
        "receiverInitials": "JK",
        "lobidURL": "https://lobid.org/gnd/116150874",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Männlich",
        "placeSentLat": "50.11552",
        "placeSentLong": "8.68417",
        "placeReceivedLat": "50.56109",
        "placeReceivedLong": "8.50495"
      },
      {
        "id": "GB01_1_BR110_0",
        "placeSent": "Frankfurt",
        "placeSentId": "http://www.geonames.org/2925533/",
        "date": "1772-10-21",
        "receiver": "Kestner, Johann Christian",
        "receiverKey": "SNDB38559",
        "receiverId": "http://d-nb.info/gnd/116150874",
        "placeReceived": "Wetzlar",
        "placeReceivedID": "http://www.geonames.org/2809889/",
        "year": "1772",
        "month": "10",
        "day": "21",
        "dateFormatted": "21. Oktober 1772",
        "type": "GB",
        "idFormatted": "GB01 Nr.110",
        "receiverFirstName": "Johann Christian",
        "receiverLastName": "Kestner",
        "receiverFormatted": "Johann Christian Kestner",
        "receiverInitials": "JK",
        "lobidURL": "https://lobid.org/gnd/116150874",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Männlich",
        "placeSentLat": "50.11552",
        "placeSentLong": "8.68417",
        "placeReceivedLat": "50.56109",
        "placeReceivedLong": "8.50495"
      },
      {
        "id": "GB01_1_BR109_0",
        "placeSent": "Frankfurt",
        "placeSentId": "http://www.geonames.org/2925533/",
        "date": "1772-10-17",
        "receiver": "Kestner, Johann Christian",
        "receiverKey": "SNDB38559",
        "receiverId": "http://d-nb.info/gnd/116150874",
        "placeReceived": "Wetzlar",
        "placeReceivedID": "http://www.geonames.org/2809889/",
        "year": "1772",
        "month": "10",
        "day": "17",
        "dateFormatted": "17. Oktober 1772",
        "type": "GB",
        "idFormatted": "GB01 Nr.109",
        "receiverFirstName": "Johann Christian",
        "receiverLastName": "Kestner",
        "receiverFormatted": "Johann Christian Kestner",
        "receiverInitials": "JK",
        "lobidURL": "https://lobid.org/gnd/116150874",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Männlich",
        "placeSentLat": "50.11552",
        "placeSentLong": "8.68417",
        "placeReceivedLat": "50.56109",
        "placeReceivedLong": "8.50495"
      },
      {
        "id": "GB01_1_BR108_0",
        "placeSent": "Frankfurt",
        "placeSentId": "http://www.geonames.org/2925533/",
        "date": "1772-10-07",
        "receiver": "Buff, Charlotte",
        "receiverKey": "SNDB44200",
        "receiverId": "http://d-nb.info/gnd/118638076",
        "placeReceived": "Wetzlar",
        "placeReceivedID": "http://www.geonames.org/2809889/",
        "year": "1772",
        "month": "10",
        "day": "07",
        "dateFormatted": "07. Oktober 1772",
        "type": "GB",
        "idFormatted": "GB01 Nr.108",
        "receiverFirstName": "Charlotte",
        "receiverLastName": "Buff",
        "receiverFormatted": "Charlotte Buff",
        "receiverInitials": "CB",
        "lobidURL": "https://lobid.org/gnd/118638076",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Weiblich",
        "placeSentLat": "50.11552",
        "placeSentLong": "8.68417",
        "placeReceivedLat": "50.56109",
        "placeReceivedLong": "8.50495"
      },
      {
        "id": "GB01_1_BR107_0",
        "placeSent": "Frankfurt",
        "placeSentId": "http://www.geonames.org/2925533/",
        "date": "1772-10-06",
        "receiver": "Kestner, Johann Christian",
        "receiverKey": "SNDB38559",
        "receiverId": "http://d-nb.info/gnd/116150874",
        "placeReceived": "Wetzlar",
        "placeReceivedID": "http://www.geonames.org/2809889/",
        "year": "1772",
        "month": "10",
        "day": "06",
        "dateFormatted": "06. Oktober 1772",
        "type": "GB",
        "idFormatted": "GB01 Nr.107",
        "receiverFirstName": "Johann Christian",
        "receiverLastName": "Kestner",
        "receiverFormatted": "Johann Christian Kestner",
        "receiverInitials": "JK",
        "lobidURL": "https://lobid.org/gnd/116150874",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Männlich",
        "placeSentLat": "50.11552",
        "placeSentLong": "8.68417",
        "placeReceivedLat": "50.56109",
        "placeReceivedLong": "8.50495"
      },
      {
        "id": "GB01_1_BR097_0",
        "placeSent": "Frankfurt",
        "placeSentId": "http://www.geonames.org/2925533/",
        "date": "1772-02-03",
        "receiver": "Salzmann, Johann Daniel",
        "receiverKey": "SNDB41006",
        "receiverId": "http://d-nb.info/gnd/116777265",
        "placeReceived": "Strassburg",
        "placeReceivedID": "http://www.geonames.org/2973783/",
        "year": "1772",
        "month": "02",
        "day": "03",
        "dateFormatted": "03. Februar 1772",
        "type": "GB",
        "idFormatted": "GB01 Nr.97",
        "receiverFirstName": "Johann Daniel",
        "receiverLastName": "Salzmann",
        "receiverFormatted": "Johann Daniel Salzmann",
        "receiverInitials": "JS",
        "lobidURL": "https://lobid.org/gnd/116777265",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Männlich",
        "placeSentLat": "50.11552",
        "placeSentLong": "8.68417",
        "placeReceivedLat": "48.58392",
        "placeReceivedLong": "7.74553"
      },
      {
        "id": "GB01_1_BR096_0",
        "placeSent": "Frankfurt",
        "placeSentId": "http://www.geonames.org/2925533/",
        "date": "1772-02-03",
        "receiver": "Jung, Johann Heinrich",
        "receiverKey": "SNDB38444",
        "receiverId": "http://d-nb.info/gnd/118558862",
        "placeReceived": "Strassburg",
        "placeReceivedID": "http://www.geonames.org/2973783/",
        "year": "1772",
        "month": "02",
        "day": "03",
        "dateFormatted": "03. Februar 1772",
        "type": "GB",
        "idFormatted": "GB01 Nr.96",
        "receiverFirstName": "Johann Heinrich",
        "receiverLastName": "Jung",
        "receiverFormatted": "Johann Heinrich Jung",
        "receiverInitials": "JJ",
        "lobidURL": "https://lobid.org/gnd/118558862",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Männlich",
        "placeSentLat": "50.11552",
        "placeSentLong": "8.68417",
        "placeReceivedLat": "48.58392",
        "placeReceivedLong": "7.74553"
      },
      {
        "id": "GB01_1_BR095_0",
        "placeSent": "Frankfurt",
        "placeSentId": "http://www.geonames.org/2925533/",
        "date": "1772-01",
        "receiver": "Herder, Johann Gottfried",
        "receiverKey": "SNDB20408",
        "receiverId": "http://d-nb.info/gnd/118549553",
        "placeReceived": "Bückeburg",
        "placeReceivedID": "http://www.geonames.org/2942159/",
        "year": "1772",
        "month": "01",
        "dateFormatted": "Januar 1772",
        "type": "GB",
        "idFormatted": "GB01 Nr.95",
        "receiverFirstName": "Johann Gottfried",
        "receiverLastName": "Herder",
        "receiverFormatted": "Johann Gottfried Herder",
        "receiverInitials": "JH",
        "lobidURL": "https://lobid.org/gnd/118549553",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Männlich",
        "placeSentLat": "50.11552",
        "placeSentLong": "8.68417",
        "placeReceivedLat": "52.26065",
        "placeReceivedLong": "9.04939"
      }
    ]
  },
  "Darmstadt": {
    "1772": [
      {
        "id": "GB01_1_BR118_0",
        "placeSent": "Darmstadt",
        "placeSentId": "http://www.geonames.org/2938913/",
        "date": "1772-11-28",
        "receiver": "Kestner, Johann Christian",
        "receiverKey": "SNDB38559",
        "receiverId": "http://d-nb.info/gnd/116150874",
        "placeReceived": "Wetzlar",
        "placeReceivedID": "http://www.geonames.org/2809889/",
        "year": "1772",
        "month": "11",
        "day": "28",
        "dateFormatted": "28. November 1772",
        "type": "GB",
        "idFormatted": "GB01 Nr.118",
        "receiverFirstName": "Johann Christian",
        "receiverLastName": "Kestner",
        "receiverFormatted": "Johann Christian Kestner",
        "receiverInitials": "JK",
        "lobidURL": "https://lobid.org/gnd/116150874",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Männlich",
        "placeSentLat": "49.87167",
        "placeSentLong": "8.65027",
        "placeReceivedLat": "50.56109",
        "placeReceivedLong": "8.50495"
      },
      {
        "id": "GB01_1_EB027_0",
        "placeSent": "Darmstadt",
        "placeSentId": "http://www.geonames.org/2938913/",
        "date": "1772-11-28",
        "receiver": "Gotter, Friedrich Wilhelm",
        "receiverKey": "SNDB53751",
        "receiverId": "http://d-nb.info/gnd/118540939",
        "placeReceived": "Gotha",
        "placeReceivedID": "http://www.geonames.org/2918752/",
        "year": "1772",
        "month": "11",
        "day": "28",
        "dateFormatted": "28. November 1772",
        "type": "GB",
        "idFormatted": "GB01 Nr.EB027",
        "receiverFirstName": "Friedrich Wilhelm",
        "receiverLastName": "Gotter",
        "receiverFormatted": "Friedrich Wilhelm Gotter",
        "receiverInitials": "FG",
        "lobidURL": "https://lobid.org/gnd/118540939",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Männlich",
        "placeSentLat": "49.87167",
        "placeSentLong": "8.65027",
        "placeReceivedLat": "50.94823",
        "placeReceivedLong": "10.70193"
      },
      {
        "id": "GB01_1_BR120_0",
        "placeSent": "Darmstadt",
        "placeSentId": "http://www.geonames.org/2938913/",
        "date": "1772-12-07",
        "receiver": "Herder, Johann Gottfried",
        "receiverKey": "SNDB20408",
        "receiverId": "http://d-nb.info/gnd/118549553",
        "placeReceived": "Bückeburg",
        "placeReceivedID": "http://www.geonames.org/2942159/",
        "year": "1772",
        "month": "12",
        "day": "07",
        "dateFormatted": "07. Dezember 1772",
        "type": "GB",
        "idFormatted": "GB01 Nr.120",
        "receiverFirstName": "Johann Gottfried",
        "receiverLastName": "Herder",
        "receiverFormatted": "Johann Gottfried Herder",
        "receiverInitials": "JH",
        "lobidURL": "https://lobid.org/gnd/118549553",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Männlich",
        "placeSentLat": "49.87167",
        "placeSentLong": "8.65027",
        "placeReceivedLat": "52.26065",
        "placeReceivedLong": "9.04939"
      },
      {
        "id": "GB01_1_BR119_0",
        "placeSent": "Darmstadt",
        "placeSentId": "http://www.geonames.org/2938913/",
        "date": "1772-12-06",
        "receiver": "Kestner, Johann Christian",
        "receiverKey": "SNDB38559",
        "receiverId": "http://d-nb.info/gnd/116150874",
        "placeReceived": "Wetzlar",
        "placeReceivedID": "http://www.geonames.org/2809889/",
        "year": "1772",
        "month": "12",
        "day": "06",
        "dateFormatted": "06. Dezember 1772",
        "type": "GB",
        "idFormatted": "GB01 Nr.119",
        "receiverFirstName": "Johann Christian",
        "receiverLastName": "Kestner",
        "receiverFormatted": "Johann Christian Kestner",
        "receiverInitials": "JK",
        "lobidURL": "https://lobid.org/gnd/116150874",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Männlich",
        "placeSentLat": "49.87167",
        "placeSentLong": "8.65027",
        "placeReceivedLat": "50.56109",
        "placeReceivedLong": "8.50495"
      },
      {
        "id": "GB01_1_BR116_0",
        "placeSent": "Darmstadt",
        "placeSentId": "http://www.geonames.org/2938913/",
        "date": "1772-11-19",
        "receiver": "Kestner, Johann Christian",
        "receiverKey": "SNDB38559",
        "receiverId": "http://d-nb.info/gnd/116150874",
        "placeReceived": "Wetzlar",
        "placeReceivedID": "http://www.geonames.org/2809889/",
        "year": "1772",
        "month": "11",
        "day": "19",
        "dateFormatted": "19. November 1772",
        "type": "GB",
        "idFormatted": "GB01 Nr.116",
        "receiverFirstName": "Johann Christian",
        "receiverLastName": "Kestner",
        "receiverFormatted": "Johann Christian Kestner",
        "receiverInitials": "JK",
        "lobidURL": "https://lobid.org/gnd/116150874",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Männlich",
        "placeSentLat": "49.87167",
        "placeSentLong": "8.65027",
        "placeReceivedLat": "50.56109",
        "placeReceivedLong": "8.50495"
      }
    ]
  },
  "Strassburg": {
    "1770": [
      {
        "id": "GB01_1_EB019_0",
        "placeSent": "Strassburg",
        "placeSentId": "http://www.geonames.org/2973783/",
        "date": "1770-12",
        "receiver": "Horn, Johann Adam",
        "receiverKey": "SNDB38230",
        "receiverId": "http://d-nb.info/gnd/119027682",
        "placeReceived": "Frankfurt",
        "placeReceivedID": "http://www.geonames.org/2925533/",
        "year": "1770",
        "month": "12",
        "dateFormatted": "Dezember 1770",
        "type": "GB",
        "idFormatted": "GB01 Nr.EB019",
        "receiverFirstName": "Johann Adam",
        "receiverLastName": "Horn",
        "receiverFormatted": "Johann Adam Horn",
        "receiverInitials": "JH",
        "lobidURL": "https://lobid.org/gnd/119027682",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Männlich",
        "placeSentLat": "48.58392",
        "placeSentLong": "7.74553",
        "placeReceivedLat": "50.11552",
        "placeReceivedLong": "8.68417"
      },
      {
        "id": "GB01_1_EB018_0",
        "placeSent": "Strassburg",
        "placeSentId": "http://www.geonames.org/2973783/",
        "date": "1770-07",
        "receiver": "Horn, Johann Adam",
        "receiverKey": "SNDB38230",
        "receiverId": "http://d-nb.info/gnd/119027682",
        "placeReceived": "Frankfurt",
        "placeReceivedID": "http://www.geonames.org/2925533/",
        "year": "1770",
        "month": "07",
        "dateFormatted": "Juli 1770",
        "type": "GB",
        "idFormatted": "GB01 Nr.EB018",
        "receiverFirstName": "Johann Adam",
        "receiverLastName": "Horn",
        "receiverFormatted": "Johann Adam Horn",
        "receiverInitials": "JH",
        "lobidURL": "https://lobid.org/gnd/119027682",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Männlich",
        "placeSentLat": "48.58392",
        "placeSentLong": "7.74553",
        "placeReceivedLat": "50.11552",
        "placeReceivedLong": "8.68417"
      },
      {
        "id": "GB01_1_BR078_0",
        "placeSent": "Strassburg",
        "placeSentId": "http://www.geonames.org/2973783/",
        "date": "1770-10-15",
        "receiver": "Brion, Friederike",
        "receiverKey": "SNDB43267",
        "receiverId": "http://d-nb.info/gnd/118515500",
        "placeReceived": "Sessenheim",
        "placeReceivedID": "http://www.geonames.org/2974735/",
        "year": "1770",
        "month": "10",
        "day": "15",
        "dateFormatted": "15. Oktober 1770",
        "type": "GB",
        "idFormatted": "GB01 Nr.78",
        "receiverFirstName": "Friederike",
        "receiverLastName": "Brion",
        "receiverFormatted": "Friederike Brion",
        "receiverInitials": "FB",
        "lobidURL": "https://lobid.org/gnd/118515500",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Weiblich",
        "placeSentLat": "48.58392",
        "placeSentLong": "7.74553",
        "placeReceivedLat": "48.79652",
        "placeReceivedLong": "7.98719"
      },
      {
        "id": "GB01_1_BR077_0",
        "placeSent": "Strassburg",
        "placeSentId": "http://www.geonames.org/2973783/",
        "date": "1770-10-14",
        "receiver": "Fabricius, Anna Catharina",
        "receiverKey": "SNDB53180",
        "receiverId": "http://d-nb.info/gnd/1014254809",
        "placeReceived": "Worms",
        "placeReceivedID": "http://www.geonames.org/2806142/",
        "year": "1770",
        "month": "10",
        "day": "14",
        "dateFormatted": "14. Oktober 1770",
        "type": "GB",
        "idFormatted": "GB01 Nr.77",
        "receiverFirstName": "Anna Catharina",
        "receiverLastName": "Fabricius",
        "receiverFormatted": "Anna Catharina Fabricius",
        "receiverInitials": "AF",
        "lobidURL": "https://lobid.org/gnd/1014254809",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Weiblich",
        "placeSentLat": "48.58392",
        "placeSentLong": "7.74553",
        "placeReceivedLat": "49.63278",
        "placeReceivedLong": "8.35916"
      },
      {
        "id": "GB01_1_BR076_0",
        "placeSent": "Strassburg",
        "placeSentId": "http://www.geonames.org/2973783/",
        "date": "1770-09-30",
        "receiver": "Engelbach, Johann Conrad",
        "receiverKey": "SNDB53161",
        "receiverId": "",
        "placeReceived": "Saarbrücken",
        "placeReceivedID": "http://www.geonames.org/2842647/",
        "year": "1770",
        "month": "09",
        "day": "30",
        "dateFormatted": "30. September 1770",
        "type": "GB",
        "idFormatted": "GB01 Nr.76",
        "receiverFirstName": "Johann Conrad",
        "receiverLastName": "Engelbach",
        "receiverFormatted": "Johann Conrad Engelbach",
        "receiverInitials": "JE",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Keine Info",
        "placeSentLat": "48.58392",
        "placeSentLong": "7.74553",
        "placeReceivedLat": "49.23262",
        "placeReceivedLong": "7.00982"
      },
      {
        "id": "GB01_1_BR075_0",
        "placeSent": "Strassburg",
        "placeSentId": "http://www.geonames.org/2973783/",
        "date": "1770-09-28",
        "receiver": "Hetzler, Johann Georg",
        "receiverKey": "SNDB38092",
        "receiverId": "http://d-nb.info/gnd/1104178125",
        "placeReceived": "Frankfurt",
        "placeReceivedID": "http://www.geonames.org/2925533/",
        "year": "1770",
        "month": "09",
        "day": "28",
        "dateFormatted": "28. September 1770",
        "type": "GB",
        "idFormatted": "GB01 Nr.75",
        "receiverFirstName": "Johann Georg",
        "receiverLastName": "Hetzler",
        "receiverFormatted": "Johann Georg Hetzler",
        "receiverInitials": "JH",
        "lobidURL": "https://lobid.org/gnd/1104178125",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Männlich",
        "placeSentLat": "48.58392",
        "placeSentLong": "7.74553",
        "placeReceivedLat": "50.11552",
        "placeReceivedLong": "8.68417"
      },
      {
        "id": "GB01_1_BR074_0",
        "placeSent": "Strassburg",
        "placeSentId": "http://www.geonames.org/2973783/",
        "date": "1770-08-26",
        "receiver": "Klettenberg, Susanna Catharina von",
        "receiverKey": "SNDB38645",
        "receiverId": "http://d-nb.info/gnd/11872357X",
        "placeReceived": "Frankfurt",
        "placeReceivedID": "http://www.geonames.org/2925533/",
        "year": "1770",
        "month": "08",
        "day": "26",
        "dateFormatted": "26. August 1770",
        "type": "GB",
        "idFormatted": "GB01 Nr.74",
        "receiverFirstName": "Susanna Catharina von",
        "receiverLastName": "Klettenberg",
        "receiverFormatted": "Susanna Catharina von Klettenberg",
        "receiverInitials": "SK",
        "lobidURL": "https://lobid.org/gnd/11872357X",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Weiblich",
        "placeSentLat": "48.58392",
        "placeSentLong": "7.74553",
        "placeReceivedLat": "50.11552",
        "placeReceivedLong": "8.68417"
      },
      {
        "id": "GB01_1_BR073_0",
        "placeSent": "Strassburg",
        "placeSentId": "http://www.geonames.org/2973783/",
        "date": "1770-08-24",
        "receiver": "Hetzler, Johann Ludwig",
        "receiverKey": "SNDB38091",
        "receiverId": "http://www.lagis-hessen.de/de/subjects/idrec/sn/bio/id/10458",
        "placeReceived": "Frankfurt",
        "placeReceivedID": "http://www.geonames.org/2925533/",
        "year": "1770",
        "month": "08",
        "day": "24",
        "dateFormatted": "24. August 1770",
        "type": "GB",
        "idFormatted": "GB01 Nr.73",
        "receiverFirstName": "Johann Ludwig",
        "receiverLastName": "Hetzler",
        "receiverFormatted": "Johann Ludwig Hetzler",
        "receiverInitials": "JH",
        "lobidURL": "https://lobid.org/gnd/subjects",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Keine Info",
        "placeSentLat": "48.58392",
        "placeSentLong": "7.74553",
        "placeReceivedLat": "50.11552",
        "placeReceivedLong": "8.68417"
      },
      {
        "id": "GB01_1_BR072_0",
        "placeSent": "Strassburg",
        "placeSentId": "http://www.geonames.org/2973783/",
        "date": "1770-07-28",
        "receiver": "Trapp, Augustin",
        "receiverKey": "SNDB42112",
        "receiverId": "",
        "placeReceived": "Worms",
        "placeReceivedID": "http://www.geonames.org/2806142/",
        "year": "1770",
        "month": "07",
        "day": "28",
        "dateFormatted": "28. Juli 1770",
        "type": "GB",
        "idFormatted": "GB01 Nr.72",
        "receiverFirstName": "Augustin",
        "receiverLastName": "Trapp",
        "receiverFormatted": "Augustin Trapp",
        "receiverInitials": "AT",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Keine Info",
        "placeSentLat": "48.58392",
        "placeSentLong": "7.74553",
        "placeReceivedLat": "49.63278",
        "placeReceivedLong": "8.35916"
      },
      {
        "id": "GB01_1_BR071_0",
        "placeSent": "Strassburg",
        "placeSentId": "http://www.geonames.org/2973783/",
        "date": "1770-07-14",
        "receiver": "Hetzler, Johann Ludwig",
        "receiverKey": "SNDB38091",
        "receiverId": "",
        "placeReceived": "Frankfurt",
        "placeReceivedID": "http://www.geonames.org/2925533/",
        "year": "1770",
        "month": "07",
        "day": "14",
        "dateFormatted": "14. Juli 1770",
        "type": "GB",
        "idFormatted": "GB01 Nr.71",
        "receiverFirstName": "Johann Ludwig",
        "receiverLastName": "Hetzler",
        "receiverFormatted": "Johann Ludwig Hetzler",
        "receiverInitials": "JH",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Keine Info",
        "placeSentLat": "48.58392",
        "placeSentLong": "7.74553",
        "placeReceivedLat": "50.11552",
        "placeReceivedLong": "8.68417"
      }
    ],
    "1771": [
      {
        "id": "GB01_1_BR086_0",
        "placeSent": "Strassburg",
        "placeSentId": "http://www.geonames.org/2973783/",
        "date": "1771-08-08",
        "receiver": "Langer, Ernst Theodor",
        "receiverKey": "SNDB53311",
        "receiverId": "http://d-nb.info/gnd/116719761",
        "placeReceived": "Lausanne",
        "placeReceivedID": "http://www.geonames.org/2659994/",
        "year": "1771",
        "month": "08",
        "day": "08",
        "dateFormatted": "08. August 1771",
        "type": "GB",
        "idFormatted": "GB01 Nr.86",
        "receiverFirstName": "Ernst Theodor",
        "receiverLastName": "Langer",
        "receiverFormatted": "Ernst Theodor Langer",
        "receiverInitials": "EL",
        "lobidURL": "https://lobid.org/gnd/116719761",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Männlich",
        "placeSentLat": "48.58392",
        "placeSentLong": "7.74553",
        "placeReceivedLat": "46.516",
        "placeReceivedLong": "6.63282"
      }
    ]
  },
  "Wiesbaden": {
    "1765": [
      {
        "id": "GB01_1_EB001_0",
        "placeSent": "Wiesbaden",
        "placeSentId": "http://www.geonames.org/2809346/",
        "date": "1765-06-21",
        "receiver": "Pog",
        "receiverKey": "",
        "receiverId": "",
        "placeReceived": "Frankfurt",
        "placeReceivedID": "http://www.geonames.org/2925533/",
        "year": "1765",
        "month": "06",
        "day": "21",
        "dateFormatted": "21. Juni 1765",
        "type": "GB",
        "idFormatted": "GB01 Nr.EB001",
        "receiverFirstName": "",
        "receiverLastName": "Pog",
        "receiverFormatted": " Pog",
        "receiverInitials": "P",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Keine Info",
        "placeSentLat": "50.08258",
        "placeSentLong": "8.24932",
        "placeReceivedLat": "50.11552",
        "placeReceivedLong": "8.68417"
      },
      {
        "id": "GB01_1_BR004_0",
        "placeSent": "Wiesbaden",
        "placeSentId": "http://www.geonames.org/2809346/",
        "date": "1765-06-21",
        "receiver": "Goethe, Cornelia",
        "receiverKey": "SNDB45161",
        "receiverId": "http://d-nb.info/gnd/11871791X",
        "placeReceived": "Frankfurt",
        "placeReceivedID": "http://www.geonames.org/2925533/",
        "year": "1765",
        "month": "06",
        "day": "21",
        "dateFormatted": "21. Juni 1765",
        "type": "GB",
        "idFormatted": "GB01 Nr.4",
        "receiverFirstName": "Cornelia",
        "receiverLastName": "Goethe",
        "receiverFormatted": "Cornelia Goethe",
        "receiverInitials": "CG",
        "lobidURL": "https://lobid.org/gnd/11871791X",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Weiblich",
        "placeSentLat": "50.08258",
        "placeSentLong": "8.24932",
        "placeReceivedLat": "50.11552",
        "placeReceivedLong": "8.68417"
      }
    ]
  },
  "Friedberg": {
    "1772": [
      {
        "id": "GB01_1_BR113_0",
        "placeSent": "Friedberg",
        "placeSentId": "http://www.geonames.org/2924802/",
        "date": "1772-11-10",
        "receiver": "Kestner, Johann Christian",
        "receiverKey": "SNDB38559",
        "receiverId": "http://d-nb.info/gnd/116150874",
        "placeReceived": "Wetzlar",
        "placeReceivedID": "http://www.geonames.org/2809889/",
        "year": "1772",
        "month": "11",
        "day": "10",
        "dateFormatted": "10. November 1772",
        "type": "GB",
        "idFormatted": "GB01 Nr.113",
        "receiverFirstName": "Johann Christian",
        "receiverLastName": "Kestner",
        "receiverFormatted": "Johann Christian Kestner",
        "receiverInitials": "JK",
        "lobidURL": "https://lobid.org/gnd/116150874",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Männlich",
        "placeSentLat": "50.33739",
        "placeSentLong": "8.75591",
        "placeReceivedLat": "50.56109",
        "placeReceivedLong": "8.50495"
      }
    ]
  },
  "Wetzlar": {
    "1772": [
      {
        "id": "GB01_1_BR103_0",
        "placeSent": "Wetzlar",
        "placeSentId": "http://www.geonames.org/2809889/",
        "date": "1772-09-11",
        "receiver": "Buff, Charlotte",
        "receiverKey": "SNDB44200",
        "receiverId": "http://d-nb.info/gnd/118638076",
        "placeReceived": "Wetzlar",
        "placeReceivedID": "http://www.geonames.org/2809889/",
        "year": "1772",
        "month": "09",
        "day": "11",
        "dateFormatted": "11. September 1772",
        "type": "GB",
        "idFormatted": "GB01 Nr.103",
        "receiverFirstName": "Charlotte",
        "receiverLastName": "Buff",
        "receiverFormatted": "Charlotte Buff",
        "receiverInitials": "CB",
        "lobidURL": "https://lobid.org/gnd/118638076",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Weiblich",
        "placeSentLat": "50.56109",
        "placeSentLong": "8.50495",
        "placeReceivedLat": "50.56109",
        "placeReceivedLong": "8.50495"
      },
      {
        "id": "GB01_1_BR102_0",
        "placeSent": "Wetzlar",
        "placeSentId": "http://www.geonames.org/2809889/",
        "date": "1772-09-10",
        "receiver": "Kestner, Johann Christian",
        "receiverKey": "SNDB38559",
        "receiverId": "http://d-nb.info/gnd/116150874",
        "placeReceived": "Wetzlar",
        "placeReceivedID": "http://www.geonames.org/2809889/",
        "year": "1772",
        "month": "09",
        "day": "10",
        "dateFormatted": "10. September 1772",
        "type": "GB",
        "idFormatted": "GB01 Nr.102",
        "receiverFirstName": "Johann Christian",
        "receiverLastName": "Kestner",
        "receiverFormatted": "Johann Christian Kestner",
        "receiverInitials": "JK",
        "lobidURL": "https://lobid.org/gnd/116150874",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Männlich",
        "placeSentLat": "50.56109",
        "placeSentLong": "8.50495",
        "placeReceivedLat": "50.56109",
        "placeReceivedLong": "8.50495"
      },
      {
        "id": "GB01_1_BR101_0",
        "placeSent": "Wetzlar",
        "placeSentId": "http://www.geonames.org/2809889/",
        "date": "1772-09-10",
        "receiver": "Buff, Charlotte",
        "receiverKey": "SNDB44200",
        "receiverId": "http://d-nb.info/gnd/118638076",
        "placeReceived": "Wetzlar",
        "placeReceivedID": "http://www.geonames.org/2809889/",
        "year": "1772",
        "month": "09",
        "day": "10",
        "dateFormatted": "10. September 1772",
        "type": "GB",
        "idFormatted": "GB01 Nr.101",
        "receiverFirstName": "Charlotte",
        "receiverLastName": "Buff",
        "receiverFormatted": "Charlotte Buff",
        "receiverInitials": "CB",
        "lobidURL": "https://lobid.org/gnd/118638076",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Weiblich",
        "placeSentLat": "50.56109",
        "placeSentLong": "8.50495",
        "placeReceivedLat": "50.56109",
        "placeReceivedLong": "8.50495"
      },
      {
        "id": "GB01_1_BR100_0",
        "placeSent": "Wetzlar",
        "placeSentId": "http://www.geonames.org/2809889/",
        "date": "1772-09-06",
        "receiver": "Kestner, Johann Christian",
        "receiverKey": "SNDB38559",
        "receiverId": "http://d-nb.info/gnd/116150874",
        "placeReceived": "Wetzlar",
        "placeReceivedID": "http://www.geonames.org/2809889/",
        "year": "1772",
        "month": "09",
        "day": "06",
        "dateFormatted": "06. September 1772",
        "type": "GB",
        "idFormatted": "GB01 Nr.100",
        "receiverFirstName": "Johann Christian",
        "receiverLastName": "Kestner",
        "receiverFormatted": "Johann Christian Kestner",
        "receiverInitials": "JK",
        "lobidURL": "https://lobid.org/gnd/116150874",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Männlich",
        "placeSentLat": "50.56109",
        "placeSentLong": "8.50495",
        "placeReceivedLat": "50.56109",
        "placeReceivedLong": "8.50495"
      },
      {
        "id": "GB01_1_BR099_0",
        "placeSent": "Wetzlar",
        "placeSentId": "http://www.geonames.org/2809889/",
        "date": "1772-08-08",
        "receiver": "Kestner, Johann Christian",
        "receiverKey": "SNDB38559",
        "receiverId": "http://d-nb.info/gnd/116150874",
        "placeReceived": "Wetzlar",
        "placeReceivedID": "http://www.geonames.org/2809889/",
        "year": "1772",
        "month": "08",
        "day": "08",
        "dateFormatted": "08. August 1772",
        "type": "GB",
        "idFormatted": "GB01 Nr.99",
        "receiverFirstName": "Johann Christian",
        "receiverLastName": "Kestner",
        "receiverFormatted": "Johann Christian Kestner",
        "receiverInitials": "JK",
        "lobidURL": "https://lobid.org/gnd/116150874",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Männlich",
        "placeSentLat": "50.56109",
        "placeSentLong": "8.50495",
        "placeReceivedLat": "50.56109",
        "placeReceivedLong": "8.50495"
      }
    ]
  },
  "Sessenheim": {
    "1771": [
      {
        "id": "GB01_1_BR085_0",
        "placeSent": "Sessenheim",
        "placeSentId": "http://www.geonames.org/2974735/",
        "date": "1771-06-19",
        "receiver": "Salzmann, Johann Daniel",
        "receiverKey": "SNDB41006",
        "receiverId": "http://d-nb.info/gnd/116777265",
        "placeReceived": "Strassburg",
        "placeReceivedID": "http://www.geonames.org/2973783/",
        "year": "1771",
        "month": "06",
        "day": "19",
        "dateFormatted": "19. Juni 1771",
        "type": "GB",
        "idFormatted": "GB01 Nr.85",
        "receiverFirstName": "Johann Daniel",
        "receiverLastName": "Salzmann",
        "receiverFormatted": "Johann Daniel Salzmann",
        "receiverInitials": "JS",
        "lobidURL": "https://lobid.org/gnd/116777265",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Männlich",
        "placeSentLat": "48.79652",
        "placeSentLong": "7.98719",
        "placeReceivedLat": "48.58392",
        "placeReceivedLong": "7.74553"
      },
      {
        "id": "GB01_1_BR084_0",
        "placeSent": "Sessenheim",
        "placeSentId": "http://www.geonames.org/2974735/",
        "date": "1771-06-12",
        "receiver": "Salzmann, Johann Daniel",
        "receiverKey": "SNDB41006",
        "receiverId": "http://d-nb.info/gnd/116777265",
        "placeReceived": "Strassburg",
        "placeReceivedID": "http://www.geonames.org/2973783/",
        "year": "1771",
        "month": "06",
        "day": "12",
        "dateFormatted": "12. Juni 1771",
        "type": "GB",
        "idFormatted": "GB01 Nr.84",
        "receiverFirstName": "Johann Daniel",
        "receiverLastName": "Salzmann",
        "receiverFormatted": "Johann Daniel Salzmann",
        "receiverInitials": "JS",
        "lobidURL": "https://lobid.org/gnd/116777265",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Männlich",
        "placeSentLat": "48.79652",
        "placeSentLong": "7.98719",
        "placeReceivedLat": "48.58392",
        "placeReceivedLong": "7.74553"
      },
      {
        "id": "GB01_1_BR083_0",
        "placeSent": "Sessenheim",
        "placeSentId": "http://www.geonames.org/2974735/",
        "date": "1771-06-05",
        "receiver": "Salzmann, Johann Daniel",
        "receiverKey": "SNDB41006",
        "receiverId": "http://d-nb.info/gnd/116777265",
        "placeReceived": "Strassburg",
        "placeReceivedID": "http://www.geonames.org/2973783/",
        "year": "1771",
        "month": "06",
        "day": "05",
        "dateFormatted": "05. Juni 1771",
        "type": "GB",
        "idFormatted": "GB01 Nr.83",
        "receiverFirstName": "Johann Daniel",
        "receiverLastName": "Salzmann",
        "receiverFormatted": "Johann Daniel Salzmann",
        "receiverInitials": "JS",
        "lobidURL": "https://lobid.org/gnd/116777265",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Männlich",
        "placeSentLat": "48.79652",
        "placeSentLong": "7.98719",
        "placeReceivedLat": "48.58392",
        "placeReceivedLong": "7.74553"
      },
      {
        "id": "GB01_1_BR082_0",
        "placeSent": "Sessenheim",
        "placeSentId": "http://www.geonames.org/2974735/",
        "date": "1771-05-29",
        "receiver": "Salzmann, Johann Daniel",
        "receiverKey": "SNDB41006",
        "receiverId": "http://d-nb.info/gnd/116777265",
        "placeReceived": "Strassburg",
        "placeReceivedID": "http://www.geonames.org/2973783/",
        "year": "1771",
        "month": "05",
        "day": "29",
        "dateFormatted": "29. Mai 1771",
        "type": "GB",
        "idFormatted": "GB01 Nr.82",
        "receiverFirstName": "Johann Daniel",
        "receiverLastName": "Salzmann",
        "receiverFormatted": "Johann Daniel Salzmann",
        "receiverInitials": "JS",
        "lobidURL": "https://lobid.org/gnd/116777265",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Männlich",
        "placeSentLat": "48.79652",
        "placeSentLong": "7.98719",
        "placeReceivedLat": "48.58392",
        "placeReceivedLong": "7.74553"
      }
    ]
  },
  "Saarbrücken": {
    "1770": [
      {
        "id": "GB01_1_BR070_0",
        "placeSent": "Saarbrücken",
        "placeSentId": "http://www.geonames.org/2842647/",
        "date": "1770-06-27",
        "receiver": "Fabricius, Anna Catharina",
        "receiverKey": "SNDB53180",
        "receiverId": "http://d-nb.info/gnd/1014254809",
        "placeReceived": "Worms",
        "placeReceivedID": "http://www.geonames.org/2806142/",
        "year": "1770",
        "month": "06",
        "day": "27",
        "dateFormatted": "27. Juni 1770",
        "type": "GB",
        "idFormatted": "GB01 Nr.70",
        "receiverFirstName": "Anna Catharina",
        "receiverLastName": "Fabricius",
        "receiverFormatted": "Anna Catharina Fabricius",
        "receiverInitials": "AF",
        "lobidURL": "https://lobid.org/gnd/1014254809",
        "propyURL": "https://goethe-biographica.de/",
        "receiverGender": "Weiblich",
        "placeSentLat": "49.23262",
        "placeSentLong": "7.00982",
        "placeReceivedLat": "49.63278",
        "placeReceivedLong": "8.35916"
      }
    ]
  }
}

const objects = [];
const targets = { table: [], sphere: [], helix: [], grid: [] , clickable: []};

const vector = new Vector3();

function makesphere(i, l, pivot) {
  const geometry = new THREE.PlaneGeometry( .1, .1 );
  const material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
  const plane = new THREE.Mesh( geometry, material );

  const phi = Math.acos( - 1 + ( 2 * i ) / l );
  const theta = Math.sqrt( l * Math.PI ) * phi;

  plane.position.setFromSphericalCoords( 1, phi, theta );

  //console.log(object.position);

  
  vector.copy( plane.position ).multiplyScalar( 2 );

  plane.lookAt(vector);

  pivot.add( plane );
}


function plotting(pivot, data) {
  // TABLE (am Ende nicht mehr notwendig)

  // Iteration über Datensätze
  // i+= x zeigt an, wo neuer Datensatz beginnt (x -> Indexposition des letzten Elements plus 2)
  for (let i = 0, l = data.length; i < data.length; i++) {
  
    /* if (table[i].receiverGender == "Weiblich") {
      element.style.backgroundColor = "rgb(237, 125, 49, 0.5)";
    } else if (table[i].receiverGender == "Männlich") {
      element.style.backgroundColor = "rgb(231, 230, 230, 0.5)";
    } else {
      element.style.backgroundColor = "rgb(0, 0, 0, 0.5)";
    } */ 

    // Planes für Briefobjekte
    
    //plane.position.x = Math.random() - 0.5;
    //plane.position.y = Math.random();
    //plane.position.z = Math.random() - 0.5;
    
    makesphere(i, l, pivot);

/*     // Text
    const myText = new Text();
    pivot.add(myText);

    // Set properties to configure:
    myText.text = "Hello world!";
    myText.fontSize = 0.2;
    // myText.position.z = -2;
    myText.color = 0x9966ff;

    myText.position.x = Math.random() - 0.5;
    myText.position.y = Math.random();
    myText.position.z = Math.random() - 0.5;

    // Update the rendering:
    myText.sync();
    targets.clickable.push(myText); */

    //

    const object = new THREE.Object3D();
    // Objekte werden in das table Array des targets-Objekts aufgenommen
    targets.table.push(object);
  }
}

// GLTF
function sphere(diameter) {
  var geometry = new THREE.SphereBufferGeometry(diameter, 128, 128);
  //Material to apply to the cube (green)
  var material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
  //Applies material to BoxGeometry
  var cube = new THREE.Mesh(geometry, material);
  //Adds cube to the scene
  return cube;
}

const roughnessMipmapper = new RoughnessMipmapper(renderer);

const loader = new GLTFLoader();
loader.load("/gltf/goethe_basemap.glb", function (gltf) {
  gltf.scene.traverse(function (child) {
    if (child.isMesh) {
      roughnessMipmapper.generateMipmaps(child.material);
    }
  });

  scene.add(gltf.scene);

  scene.children
    .filter((i) => i.name == "Scene")[0]
    .children.filter((i) =>
      ["Frankfurt", "Darmstadt", "Wiesbaden"].includes(i.name)
    )
    .forEach((item) => {
      try {
        const city = table[item.name];
        console.log(city, item.name);
        [
          "1764", 
          "1765",
          "1766",
          "1767",
          "1768",
          "1769",
          "1770",
          "1771",
          "1772"
        ].forEach((year,index) => {
          let years = Object.keys(city);
          //let s = sphere(0.1);
          //s.position.y += 1 + index * 2.5;
          const date = new Text();

          // Set properties to configure:
          date.text = year;
          date.fontSize = 0.2;
          // myText.position.z = -2;
          date.color = 0x9966ff;
          date.position.y += 1 + index * 2.5;
          // Update the rendering:
          date.sync();

          item.add(date);
          if (years.includes(year)){
            plotting(date, city[year]);
          }
          
        })
      } catch (error) {
        console.log(error);
      }
      
    });

  roughnessMipmapper.dispose();
  //render();
});

// // 3. Mesh
// const object = new THREE.Mesh( geometry, material );

// // 4. Zur Szene hinzufügen
// scene.add( object );

// Helper Geometries
if (SETTINGS.show_edges) {
  const edges = new THREE.EdgesGeometry(geometry);
  const line = new THREE.LineSegments(
    edges,
    new THREE.LineBasicMaterial({ color: 0xffffff })
  );
  scene.add(line);
}

if (SETTINGS.render_wireframe) {
  const wireframe = new THREE.WireframeGeometry(geometry);
  const wire = new THREE.LineSegments(wireframe);
  wire.material.depthTest = false;
  wire.material.opacity = 0.75;
  wire.material.transparent = true;
  scene.add(wire);
}

// Lights
const ambient_light = new THREE.AmbientLight(0x404040, 1.0); // soft white light
scene.add(ambient_light);

const pointLight = new THREE.PointLight(
  // Farbe
  0xffffff,
  // Intensität
  0.5
);
pointLight.position.x = -6.5;
pointLight.position.y = 4;
pointLight.position.z = 6;
scene.add(pointLight);

const pointLightColor = { color: 0xff0000 };

//const pointLight2 = new THREE.PointLight(
// Farbe
//0xff0000,
// Intensität
//6.47);
//pointLight2.position.set(1,1,1.73);
//scene.add(pointLight2);

// Set GUI folders
const light = gui.addFolder("Light");
const mainobject = gui.addFolder("Sphere");
//const spida = gui.addFolder('Spider');
const jwgoethe = gui.addFolder("Goethe");
// Set subfolders
const position = mainobject.addFolder("Position");
const scale = mainobject.addFolder("Scale");

const goethescale = jwgoethe.addFolder("Scale");
const goethepos = jwgoethe.addFolder("Position");

// Set Debug GUI
light.add(pointLight.position, "y").min(-10).max(10).step(0.01);
light.add(pointLight.position, "x").min(-10).max(10).step(0.01);
light.add(pointLight.position, "z").min(-10).max(10).step(0.01);
light.add(pointLight, "intensity").min(0).max(15).step(0.01);
light.addColor(pointLightColor, "color").onChange(() => {
  pointLight.color.set(pointLightColor.color);
});

// position.add(object.position, "y").min(-10).max(10).step(0.01);
// position.add(object.position, "x").min(-10).max(10).step(0.01);
// position.add(object.position, "z").min(-10).max(10).step(0.01);
// scale.add(object.scale, "x").min(0).max(10).step(0.01);
// scale.add(object.scale, "y").min(0).max(10).step(0.01);
// scale.add(object.scale, "z").min(0).max(10).step(0.01);

// Helper geos for lights
// creates a geometric form that represents the light so you know where exactly the light is
// there is a helper for every kind of light
const pointLighthelper = new THREE.PointLightHelper(pointLight, 1);
scene.add(pointLighthelper);
//const pointLight2helper = new THREE.PointLightHelper(pointLight2, 1);
//scene.add(pointLight2helper);

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */

// Base camera
// PerspectiveCamera( fov : Number, aspect : Number, near : Number, far : Number )

/* const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  200
);
camera.position.x = 0;
camera.position.y = 10;
camera.position.z = 20;
scene.add(camera); */

const camera = new THREE.OrthographicCamera(
  sizes.width / - 2, sizes.width / 2, sizes.height / 2, sizes.height / - 2, 0, 2000
);
camera.position.x = 0;
camera.position.y = 25;
camera.position.z = 20;
camera.zoom = 10;
camera.updateProjectionMatrix();
scene.add(camera);


// Controls

const controls = new OrbitControls(camera, canvas);
//controls.enableDamping = true;

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
// const loader = new STLLoader();
// const goethe = loader.loadAsync( "/STLs/Goethe_bust.stl" )
// 						.then((geometry) => {
// 							var axesHelper = new THREE.AxesHelper( 20 );
// 							scene.add( axesHelper );
// 							return geometry;
// 						})
// 						.then( (geometry) => {
// 							const material = new THREE.MeshStandardMaterial( { color: 0xd2aa6d } );
// 							const mesh = new THREE.Mesh( geometry, material );
// 							scene.add(mesh);
//                             mesh.position.set(0,0,0);
//                             mesh.castShadow = true;
// 							mesh.receiveShadow = true;
// 							mesh.name = 'object';
//                             mesh.scale.set(.03,.03,.03);
// 							return mesh;
// 						} )
//                         // gui controls for goethe
//                         .then((mesh) => {
//                             goethepos.add(mesh.position, 'y').min(-100).max(10).step(0.01);
//                             goethepos.add(mesh.position, 'x').min(-100).max(10).step(0.01);
//                             goethepos.add(mesh.position, 'z').min(-100).max(10).step(0.01);
//                             goethescale.add(mesh.scale, 'x').min(0).max(10).step(0.01);
//                             goethescale.add(mesh.scale, 'y').min(0).max(10).step(0.01);
//                             goethescale.add(mesh.scale, 'z').min(0).max(10).step(0.01);
//                             return mesh;
//                         })
// 						;

/**
 * Animate
 */

// Mouse interaction

// speichert Koordinaten der Maus
const mousemove = {
  mouseX: 0,
  mouseY: 0,
  normalizedMouse: {
    x: 0,
    y: 0,
  },
  targetX: 0,
  targetY: 0,
  windowHalfX: window.innerWidth / 2,
  windowHalfY: window.innerHeight / 2,
};

// Hiermit werden die Mauskoordinaten je nach Position geupdated
document.addEventListener("mousemove", (e) => {
  mousemove.mouseX = e.clientX - mousemove.windowHalfX;
  mousemove.mouseY = e.clientY - mousemove.windowHalfY;
  // der Raycaster benötigt ein normalisiertes Koordinatensystem auf Basis
  // der Bildschrimkoordinaten des Mauszeigers
  // der Raycaster wird innerhalb des Animations-Loops mit den jeweils aktuellen
  // Koordinaten neu gesetzt (siehe unten)
  // Teilen durch innerWidth und Multiplizieren mit 2-1 sorgt dafür, dass x und y Werte von -1 bis 1 annehmen können
  mousemove.normalizedMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mousemove.normalizedMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

// Größe des Objekts wird beim Scrollen verändert
/* window.addEventListener("scroll", (e) => {
  object.position.z = window.scrollY * 0.0009;
}); */

// const orig = {
//   x: object.scale.x,
//   y: object.scale.y,
//   z: object.scale.z,
// };

/* const objectPlanet = object; */

// Raycast passiert nur bei Mausklick
document.addEventListener("click", (e) => {
  // der Raycaster gibt ein Array mit den vom Strahl getroffenen
  // Objekten zurück. Dieses Array ist leer (Länge == 0), wenn
  // keine Objekte getroffen wurden.
  let intersects = raycaster.intersectObjects(targets.clickable);
  console.log(scene.children[4].children);
  // Alle Elemente in der Szene. Klick auf den LightHelper logged bspw. diesen.
  // Statt scene.children kann auch ein Array relevanter Objekte angegeben werden: [ objectPlanet ]
  // Wenn der intersects Array Objekte enthält (length > 0), dann wird der string "Klick" ausgegeben plus das Objekt
  if (intersects.length > 0) {
    let planet = intersects[0].object;
    console.log("Klick ", planet);
  } else {
    console.log("No intersections.");
  }
});

// Raycast-event bei gedrückt gehaltener Maustaste
document.addEventListener("mousedown", (e) => {
  // der Raycaster gibt ein Array mit den vom Strahl getroffenen
  // Objekten zurück. Dieses Array ist leer (Länge == 0), wenn
  // keine Objekte getroffen wurden.
  let intersects = raycaster.intersectObjects(scene.children);

  if (intersects.length > 0) {
    //let planet = intersects[0].object;
    //console.log("Mousedown ", planet);
    // Skaliert die Größe des Objekts hoch
    //planet.scale.x = orig.x * 1.2;
    //planet.scale.y = orig.y * 1.2;
    //planet.scale.z = orig.z * 1.2;
  }
});

document.addEventListener("mouseup", (e) => {
  // Setzt die Größe des Planeten auf den Anfangswert
  // sobald die Maustaste nicht mehr gehalten wird
  //object.scale.x = orig.x;
  //object.scale.y = orig.y;
  //object.scale.z = orig.z;
});

// Instanziiert den Raycaster
const raycaster = new THREE.Raycaster();

const clock = new THREE.Clock();

const tick = () => {
  mousemove.targetX = mousemove.mouseX * 0.001;
  mousemove.targetY = mousemove.mouseY * 0.001;

  const elapsedTime = clock.getElapsedTime();

  // Update objects
  /* object.rotation.y = 0.3 * elapsedTime;

  object.rotation.y += 0.5 * (mousemove.targetX - object.rotation.y);
  object.rotation.x += 0.5 * (mousemove.targetY - object.rotation.x);
  object.rotation.z += 0.005 * (mousemove.targetY - object.rotation.x); */
  // Update Orbital Controls
  //controls.update()

  // Raycaster
  // hier wird der Raycaster mit den jeweils aktuellen Mauskoordinaten
  // aktualisiert, so dass der Strahl von der korrekten Position
  // geschossen wird
  raycaster.setFromCamera(mousemove.normalizedMouse, camera);

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
