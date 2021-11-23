/**
 * Imports
 */

import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { FirstPersonControls } from "three/examples/jsm/controls/FirstPersonControls.js";
import * as dat from "dat.gui";
import { PointLight, AmbientLight, Vector3 } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoughnessMipmapper } from "three/examples/jsm/utils/RoughnessMipmapper.js";
import { Text } from "troika-three-text";
import * as R from "ramda";
import * as d3 from "d3";
import {
  CSS3DRenderer,
  CSS3DObject,
} from "three/examples/jsm/renderers/CSS3DRenderer.js";

fetch("./letters_json_grouped_merged.json")
  // log response to see whether data is loaded
  /* .then(response => {
      console.log('Response:', response)
      return response.json(); } */
  .then((response) => response.json())
  .then((data) => {
    console.log(data);
    return data;
  })
  .then((data) => {
    /**
     * Settings
     */

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

    /**
     * Canvas
     */

    // looks up canvas element in html where 3D graphic should be drawn
    const canvas = document.querySelector("canvas.webgl");

    /**
     * Renderer
     */

    let renderer = (() => {
      let renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        // makes background transparent
        alpha: true,
      });
      renderer.name = "WebGL";
      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      // shows render info e.g. how many objects are currently in memory
      console.log(renderer.info);
      return renderer;
    })();

    /**
     * Scene
     */
    const scene = new THREE.Scene();

    /**
     * Variables
     */
    const targets = { table: [], sphere: [], helix: [], clickable: [] };

    /**
     * Data and Main Functions
     */

    /* CLEAR */
    function clearCanvas() {
      // ToDo
    }

    // tests for clean up

    // dispose button
    let disposeBtn = document.getElementById("disposeBtn");
    disposeBtn.onclick = () => {
      resMgr.dispose();
      //console.log("Disposed!");
      console.log(scene);
      console.log(renderer.info);
    };
    /* Allgemeines Vorgehen, um Elemente aus der Szene zu löschen: 
      1.) Komplette Szene durchgehen, 
      2.) alle Elemente in Szene von der Szene entfernen mit remove(), 
      3.) dann mit dispose() aus dem Speicher löschen, bzw. geometry, material, textures müssen auch einzeln gelöscht werden
     */

    /* Vorgehen: Resource Tracker:
      legt ein Set mit zu löschenden Objekten an
      hat eine track-function, mit der Objekte in das Set aufgenommen werden 
      d.h. immer wenn ein neues Objekt erstellt wird, dann muss es von der Funktion track() umschlossen werden
      am Ende kann dann dispose() auf das Set angewandt werden, sodass alle Objekte gleichzeitig gelöscht werden
    */

    // resource tracker class (tracks objects which will be removed later)
    class ResourceTracker {
      constructor() {
        this.resources = new Set();
      }
      track(resource) {
        // check whether resource is undefined or null
        if (!resource) {
          return resource;
        }

        // handle children and when material is an array of materials or
        // uniform is array of textures
        // not applicable in my case
        if (Array.isArray(resource)) {
          resource.forEach((resource) => this.track(resource));
          return resource;
        }

        // add recource to the tracking array
        if (resource.dispose || resource instanceof THREE.Object3D) {
          this.resources.add(resource);
        }

        // geometry, material and possible children of an Object3D must be tracked (and then disposed of) separately
        if (resource instanceof THREE.Object3D) {
          this.track(resource.geometry);
          this.track(resource.material);
          this.track(resource.children);
        } else if (resource instanceof THREE.Material) {
          // We have to check if there are any textures on the material
          // not applicable for my case
          for (const value of Object.values(resource)) {
            if (value instanceof THREE.Texture) {
              this.track(value);
            }
          }
          // We also have to check if any uniforms reference textures or arrays of textures
          if (resource.uniforms) {
            for (const value of Object.values(resource.uniforms)) {
              if (value) {
                const uniformValue = value.value;
                if (
                  uniformValue instanceof THREE.Texture ||
                  Array.isArray(uniformValue)
                ) {
                  this.track(uniformValue);
                }
              }
            }
          }
        }
        return resource;
      }
      untrack(resource) {
        this.resources.delete(resource);
      }
      dispose() {
        for (const resource of this.resources) {
          if (resource instanceof THREE.Object3D) {
            if (resource.parent) {
              resource.parent.remove(resource);
            }
          }
          if (resource.dispose) {
            resource.dispose();
          }
        }
        this.resources.clear();
      }
    }

    // set up resource tracker and bind tracking method
    const resMgr = new ResourceTracker();
    const track = resMgr.track.bind(resMgr);

    /* INIT */
    function init() {
      // default
      //mapViewKugeln();
      mapViewHelix();
    }
    init();

    /* BUTTONS */
    // Kugel-Button ->Wechsel zu Kugelansicht(Karte)
    const kugelButton = document.getElementById("kugel");
    kugelButton.onclick = () => {
      if (renderer.name != "WebGL") {
        renderer = (() => {
          let renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            // makes background transparent
            alpha: true,
          });
          renderer.name = "WebGL";
          renderer.setSize(sizes.width, sizes.height);
          renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          // shows render info e.g. how many objects are currently in memory
          console.log(renderer.info);
          return renderer;
        })();
        camera = new THREE.OrthographicCamera(
          sizes.width / -2,
          sizes.width / 2,
          sizes.height / 2,
          sizes.height / -2,
          0,
          2000
        );
        camera.position.x = 0;
        camera.position.y = 25;
        camera.position.z = 20;
        camera.zoom = 10;
        camera.updateProjectionMatrix();
        controls = new OrbitControls(camera, canvas);
        document.getElementById("canvas").style.zIndex = "100";
      }
      //clearCanvas();
      mapViewKugeln();
      console.log("Wechsel zu Kugelansicht!");
    };

    // Sphären-Button -> Wechsel zu Spährenansicht (Karte)
    const sphereButton = document.getElementById("sphere");
    sphereButton.onclick = () => {
      //clearCanvas();
      if (renderer.name != "WebGL") {
        renderer = (() => {
          let renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            // makes background transparent
            alpha: true,
          });
          renderer.name = "WebGL";
          renderer.setSize(sizes.width, sizes.height);
          renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          // shows render info e.g. how many objects are currently in memory
          console.log(renderer.info);
          return renderer;
        })();
      }

      mapViewSpheres();
      console.log("Wechsel zu Sphärenansicht!");
    };

    // Helix-Buttton -> Wechsel zu Helixansicht (Karte)
    const helixButton = document.getElementById("helix");
    helixButton.onclick = () => {
      if (renderer.name != "WebGL") {
        renderer = (() => {
          let renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            // makes background transparent
            alpha: true,
          });
          renderer.name = "WebGL";
          renderer.setSize(sizes.width, sizes.height);
          renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          // shows render info e.g. how many objects are currently in memory
          console.log(renderer.info);
          return renderer;
        })();
      }
      //clearCanvas();
      mapViewHelix();
      console.log("Wechsel zu Helixansicht!");
    };

    // render button

    const renderButton = document.getElementById("render");
    renderButton.onclick = () => {
      //clearCanvas();
      initSinglePlaceView();
      console.log("Wechsel zu Einzelansicht!");
    };

    /* CREATE MAP VIEWS */

    /* 1) Default: Kugelansicht */
    // Karte laden, dann Aufruf von makeKugeln()
    function mapViewKugeln() {
      const roughnessMipmapper = new RoughnessMipmapper(renderer);
      // load gltf basemap
      const loader = new GLTFLoader();
      loader.load("/gltf/goethe_basemap.glb", function (gltf) {
        gltf.scene.traverse(function (child) {
          // traverse goes through all the children of an object
          if (child.isMesh) {
            roughnessMipmapper.generateMipmaps(child.material); // apply mipmapper before rendering
          }
        });

        // add basemap to scene (!gltf has its own scene) and track it
        scene.add(track(gltf.scene));

        // debug: log scene graph
        console.log(scene);

        // add kugeln
        loopPlaceMarker(addKugeltoPlaceMarker);

        // correct position of placemarker "Wiesbaden"
        correctPositionWiesbaden();

        // make objects on gltf scene clickable
        const gltfSceneObjs = scene.children[4].children;
        // loop over array gltf scene objects and add each child ojb to the clickable list
        // true -> isArray
        makeClickable(gltfSceneObjs, true);
        console.log(gltfSceneObjs);

        roughnessMipmapper.dispose();
        //render();
      });
    }

    /* 2) Briefnetz-Ansicht */

    function mapViewLetterNetwork() {
      // Code
      // Karte laden
      // Aufruf von makeLetterNetwork()
    }

    /* 3) Sphären-Ansicht*/

    // vector to which the planes will be facing
    const vector = new Vector3();

    function mapViewSpheres() {
      const roughnessMipmapper = new RoughnessMipmapper(renderer);
      // load gltf basemap
      const loader = new GLTFLoader();
      loader.load("/gltf/goethe_basemap.glb", function (gltf) {
        gltf.scene.traverse(function (child) {
          // travese goes through all the children of an object
          if (child.isMesh) {
            roughnessMipmapper.generateMipmaps(child.material); // apply mipmapper before rendering
          }
        });

        // add basemap to scene (!gltf has its own scene) and track it
        scene.add(track(gltf.scene));

        // debug: log scene graph
        console.log(scene);

        loopYearMarker(addYearMarkerAndSpheres);

        // correct position of placemarker "Wiesbaden"
        correctPositionWiesbaden();

        roughnessMipmapper.dispose();
        //render();
      });
    }

    /* 4) Helix-Ansicht */
    function mapViewHelix() {
      const roughnessMipmapper = new RoughnessMipmapper(renderer);
      // load gltf basemap
      const loader = new GLTFLoader();
      loader.load("/gltf/goethe_basemap.glb", function (gltf) {
        gltf.scene.traverse(function (child) {
          // travese goes through all the children of an object
          if (child.isMesh) {
            roughnessMipmapper.generateMipmaps(child.material); // apply mipmapper before rendering
          }
        });

        // add basemap to scene (!gltf has its own scene) and track it
        scene.add(track(gltf.scene));

        // debug: log scene graph
        console.log(scene);

        loopPlaceMarker(addHelixtoPlaceMarker);

        // correct position of placemarker "Wiesbaden"
        correctPositionWiesbaden();

        roughnessMipmapper.dispose();
        //render();
      });
    }

    /* FUNCTIONS FOR MAP VIEW */

    /* 1) Kugeln */
    // wird in init aufgerufen
    function makeKugeln(placeMarker, city) {
      // erhält übergeben: placeMarker, Ortsobjekt
      // Iteration über Jahre, dann Objekten in Jahren
      // Anzahl der Objekte ermitteln
      let letterCount = 0;
      Object.keys(city).forEach((year) => {
        let yearArray = city[`${year}`];
        // loop over array with letter objects
        for (let i = 0; i < yearArray.length; i++) {
          letterCount++;
        }
      });
      console.log(letterCount);

      // Anzahl der Objekte als Textobjekt
      const letterNumMarker = makeLetterNumMarker(letterCount);

      // determins radius of kugel with interpolation
      function getRadius() {
        // d3.scaleSequencial = generator for scaling function
        // maps a domain (here: range of numbers, namely the max and min number of letters per place)
        // to a smaller range, which will then be the max and min numbers for the radius
        const scale = d3
          .scaleSequential()
          .domain([getMinLettersPerPlace(), getMaxLettersPerPlace()]) // for GB01: min = 1, max = 61
          .interpolator(d3.interpolate(0.5, 2));
        const radius = scale(letterCount);
        //console.log(radius);
        return radius;
      }

      // Kugel mit three.js erstellen
      const kugel = makeKugel(getRadius());

      // Kugel auf Karte platzieren
      placeMarker.add(kugel);
      // Kugel positionieren
      kugel.position.y = getRadius() + 0.5;

      // Text auf Kugel
      kugel.add(letterNumMarker);
      //Text positionieren
      letterNumMarker.position.y = 0.5;
      letterNumMarker.position.x = -0.2;
      letterNumMarker.position.z = getRadius();

      // axes helper for letterNumMarker
      /* const axesHelperKugel = new THREE.AxesHelper(1);
      kugel.add(axesHelperKugel);

      const axesHelperLetterNumMarker = new THREE.AxesHelper(1);
      letterNumMarker.add(axesHelperLetterNumMarker); */

      // gui für letterNumMarker
      letterNumMarkerGui
        .add(letterNumMarker.position, "y")
        .min(-10)
        .max(10)
        .step(0.01)
        .name(`y_${letterNumMarker.name}`);
      letterNumMarkerGui
        .add(letterNumMarker.position, "x")
        .min(-10)
        .max(10)
        .step(0.01)
        .name(`x_${letterNumMarker.name}`);
      letterNumMarkerGui
        .add(letterNumMarker.position, "z")
        .min(-10)
        .max(10)
        .step(0.01)
        .name(`z_${letterNumMarker.name}`);
    }

    function getMaxLettersPerPlace() {
      // iteration über Orte, Anzahl der Briefe zählen, in Array schreiben, dann max()
      let letterCount = 0;
      let letterCountArray = [];
      let maxLettersPerPlace = 0;
      Object.keys(data).forEach((place) => {
        // loop over years
        Object.keys(data[`${place}`]).forEach((year) => {
          let yearArray = data[`${place}`][`${year}`];
          // loop over array with letter objects
          for (let i = 0; i < yearArray.length; i++) {
            letterCount++;
          }
        });
        letterCountArray.push(letterCount);
        letterCount = 0;
      });
      //console.log(letterCountArray);
      maxLettersPerPlace = Math.max(...letterCountArray);
      //console.log(maxLettersPerPlace);
      return maxLettersPerPlace;
    }

    function getMinLettersPerPlace() {
      let letterCount = 0;
      let letterCountArray = [];
      let minLettersPerPlace = 0;
      Object.keys(data).forEach((place) => {
        // loop over years
        Object.keys(data[`${place}`]).forEach((year) => {
          let yearArray = data[`${place}`][`${year}`];
          // loop over array with letter objects
          for (let i = 0; i < yearArray.length; i++) {
            letterCount++;
          }
        });
        letterCountArray.push(letterCount);
        letterCount = 0;
      });
      //console.log(letterCountArray);
      minLettersPerPlace = Math.min(...letterCountArray);
      //console.log(minLettersPerPlace);
      return minLettersPerPlace;
    }

    // implementation of functionForLoop in loop over placemarker
    function addKugeltoPlaceMarker(placeMarker) {
      try {
        const city = data[placeMarker.name]; // saves name of place from json data
        console.log(city, placeMarker.name); // logs city names

        makeKugeln(placeMarker, city);
      } catch (error) {
        console.log(error);
      }
    }

    /* 2) Briefnetz */

    /* 3) Sphären */
    // wird bei Klick auf Button Sphäre ausgeführt
    // Plots a sphere around each pivot point (year)
    // i = index position, l = length of dataset, pivot = point around which sphere will be centered
    function makeSpheresForMap(pivot, letters) {
      for (let i = 0, l = letters.length; i < l; i++) {
        // for later: filtering options
        /* if (data[i].receiverGender == "Weiblich") {
      element.style.backgroundColor = "rgb(237, 125, 49, 0.5)";
    } else if (data[i].receiverGender == "Männlich") {
      element.style.backgroundColor = "rgb(231, 230, 230, 0.5)";
    } else {
      element.style.backgroundColor = "rgb(0, 0, 0, 0.5)";
    } */

        /* 
        create planes and position them as a sphere 
      */

        // Mesh/Plane for letter objects
        const plane = makePlane();

        // set id for naming the plane (z.B. GB01_1_EB005_0_s)
        const id = letters[i].id;
        plane.name = `${id}`;

        // positioning of planes
        const phi = Math.acos(-1 + (2 * i) / l);
        const theta = Math.sqrt(l * Math.PI) * phi;

        plane.position.setFromSphericalCoords(1, phi, theta);

        // makes planes curve so they form a sphere by defining a vector which the planes should face
        vector.copy(plane.position).multiplyScalar(2);
        plane.lookAt(vector);

        // add letter objects to pivot bc their position is relative to the pivot
        pivot.add(plane);

        // add planes to array of clickable objects
        makeClickable(plane, false);

        // axes helper for plane
        /* const axesHelperPlane = new THREE.AxesHelper( 1 );
      plane.add( axesHelperPlane ); */

        /* 
          create text objects with content to put on planes: id, initials, name, date
        */

        /* ID */
        const idText = makeIdText(letters[i]);

        /* INITIALS */
        const initialsText = makeInitialsText(letters[i]);

        /* NAME */
        const firstNameText = makeFirstNameText(letters[i]);
        const lastNameText = makeLastNameText(letters[i]);

        /* DATE */
        const dateText = makeDateText(letters[i]);

        /* 
        add content to plane 
      */
        plane.add(idText);
        plane.add(initialsText);
        plane.add(firstNameText);
        plane.add(lastNameText);
        plane.add(dateText);

        /* 
        make content clickable
      */
        makeClickable(initialsText, false);
        makeClickable(firstNameText, false);
        makeClickable(lastNameText, false);
        makeClickable(idText, false);

        /* 
        position content on plane
      */

        /* ID */
        idText.position.y = 0.13;
        idText.position.x = -0.09;
        idText.position.z = 0.01;

        // axes helper for idText
        /* const axesHelperidText = new THREE.AxesHelper( 1 );
      idText.add( axesHelperidText ); */

        // gui helper for idText
        idTextGui
          .add(idText.position, "y")
          .min(-10)
          .max(10)
          .step(0.01)
          .name(`y_${idText.name}`);
        idTextGui
          .add(idText.position, "x")
          .min(-10)
          .max(10)
          .step(0.01)
          .name(`x_${idText.name}`);
        idTextGui
          .add(idText.position, "z")
          .min(-10)
          .max(10)
          .step(0.01)
          .name(`z_${idText.name}`);

        /* INITIALS */
        initialsText.position.y = 0.07;
        initialsText.position.x = -0.06;
        initialsText.position.z = 0.01;

        // axes helper for initials
        /* const axesHelperInitials = new THREE.AxesHelper( 1 );
      initialsText.add( axesHelperInitials ); */

        // gui helper for initials
        initialsGui
          .add(initialsText.position, "y")
          .min(-10)
          .max(10)
          .step(0.01)
          .name(`y_${idText.name}`);
        initialsGui
          .add(initialsText.position, "x")
          .min(-10)
          .max(10)
          .step(0.01)
          .name(`x_${idText.name}`);
        initialsGui
          .add(initialsText.position, "z")
          .min(-10)
          .max(10)
          .step(0.01)
          .name(`z_${idText.name}`);

        /* NAME */
        firstNameText.position.y = -0.03;
        firstNameText.position.x = -0.13;
        firstNameText.position.z = 0.01;

        lastNameText.position.y = -0.06;
        lastNameText.position.x = -0.13;
        lastNameText.position.z = 0.01;

        // axes helper for name
        /* const axesHelperName = new THREE.AxesHelper( 1 );
  firstNameText.add( axesHelperName ); */

        /* const axesHelperName = new THREE.AxesHelper( 1 );
  lastNameText.add( axesHelperName ); */

        // gui helper for firstName
        firstNameGui
          .add(firstNameText.position, "y")
          .min(-10)
          .max(10)
          .step(0.01)
          .name(`y_${idText.name}`);
        firstNameGui
          .add(firstNameText.position, "x")
          .min(-10)
          .max(10)
          .step(0.01)
          .name(`x_${idText.name}`);
        firstNameGui
          .add(firstNameText.position, "z")
          .min(-10)
          .max(10)
          .step(0.01)
          .name(`z_${idText.name}`);

        // gui helper for lastName
        lastNameGui
          .add(lastNameText.position, "y")
          .min(-10)
          .max(10)
          .step(0.01)
          .name(`y_${idText.name}`);
        lastNameGui
          .add(lastNameText.position, "x")
          .min(-10)
          .max(10)
          .step(0.01)
          .name(`x_${idText.name}`);
        lastNameGui
          .add(lastNameText.position, "z")
          .min(-10)
          .max(10)
          .step(0.01)
          .name(`z_${idText.name}`);

        /* DATE */
        dateText.position.y = -0.09;
        dateText.position.x = -0.13;
        dateText.position.z = 0.01;

        // axes helper for name
        /* const axesHelperDate = new THREE.AxesHelper( 1 );
      dateText.add( axesHelperDate ); */

        // gui helper for date
        dateGui
          .add(dateText.position, "y")
          .min(-10)
          .max(10)
          .step(0.01)
          .name(`y_${idText.name}`);
        dateGui
          .add(dateText.position, "x")
          .min(-10)
          .max(10)
          .step(0.01)
          .name(`x_${idText.name}`);
        dateGui
          .add(dateText.position, "z")
          .min(-10)
          .max(10)
          .step(0.01)
          .name(`z_${idText.name}`);

        /* AXES HELPER for pivot */
        /* const axesHelperPivot = new THREE.AxesHelper( 1 );
        pivot.add( axesHelperPivot ); */

        // Text
        /* const myText = new Text();
        pivot.add(myText);
 */
        //

        // ???
        const object = track(new THREE.Object3D());
        // Objekte werden in das table Array des targets-Objekts aufgenommen
        targets.table.push(object);
      }
    }

    // implementation of functionForLoop in loop over yearMarkers
    function addYearMarkerAndSpheres(placeMarker, city, year, index) {
      let yearsOfCity = Object.keys(city); // save years associated to each city in an Array

      // test: little spheres in middle instead of text with year
      //let s = sphere(0.1);
      //s.position.y += 1 + index * 2.5;

      // create text object
      const yearMarker = makeYearMarker(year, index);

      // add yearMarker object as child of placeMarker object -> yearMarker positioned relative to placeMarker
      placeMarker.add(yearMarker);

      // test whether years in the time filter array (year) are contained in the list of years associated to each city
      // if yes, plot the letter objects (here: as sphere)
      // yearMarker = pivot, city[year] = data = array with all letter objects associated to this year
      if (yearsOfCity.includes(year)) {
        let lettersFromYear = city[year];
        makeSpheresForMap(yearMarker, lettersFromYear);
      }

      // add yearMarkers to array of clickable objects
      makeClickable(yearMarker, false);
    }

    /* 4) Helix */
    // implementation of functionForLoop in loop over placemarker
    function addHelixtoPlaceMarker(placeMarker) {
      try {
        const city = data[placeMarker.name]; // saves name of place from json data
        console.log(city, placeMarker.name); // logs city names

        makeHelixForMap(placeMarker, city);
      } catch (error) {
        console.log(error);
      }
    }

    function makeHelixForMap(placeMarker, city) {
      // aggreagate all letters of one place in an array

      Object.keys(city).forEach((year, yearindex) => {
        let letters = city[`${year}`];
        // loop over array with letter objects
        //const letters = [];
        for (let i = 0; i < letters.length; i++) {
          //letters.push(city[`${year}`][i]);
          const plane = makePlane();

          // set id for naming the plane (z.B. GB01_1_EB005_0_s)
          const id = letters[i].id;
          plane.name = `${id}`;

          function getHelixRadius(letterNumber) {
            const r = letterNumber / 10.5;
            return r;
          }
//
          function getHelixThetaFaktor(r) {
            const thetaFaktor = r / .25;
            //const thetaFaktor = letterNumber / 200;

            return thetaFaktor;
          }

          // positioning of planes
          // wenn der Durchmesser größer wird, muss theta kleiner werden
          // Anzahl Briefe : 17,5 = Radius
          // Radius : 11.4285714286 = theta-Faktor
          /* const theta = i * 0.175 + Math.PI;
        const y = i * .1; */
          const theta = i * getHelixThetaFaktor(getHelixRadius(letters.length)) + Math.PI;
          //const theta = i * 0.175 + Math.PI;
          const y = i * 0.1;

          plane.position.setFromCylindricalCoords(
            getHelixRadius(letters.length),
            theta,
            y
          );
          vector.x = plane.position.x * 2;
          vector.y = plane.position.y;
          vector.z = plane.position.z * 2;
          //vector.multiplyScalar(2);

          plane.lookAt(vector);

          /* vector.x = plane.position.x * 2;
        vector.y = plane.position.y;
        vector.z = plane.position.z * 2; */

          // add letter objects to pivot bc their position is relative to the pivot
          placeMarker.add(plane);

          // add planes to array of clickable objects
          makeClickable(plane, false);

          //axes helper for plane
          /*  const axesHelperPlane = new THREE.AxesHelper( 1 );
      plane.add( axesHelperPlane ); */

          /* 
          create text objects with content to put on planes: id, initials, name, date
        */

          /* ID */
          const idText = makeIdText(letters[i]);

          /* INITIALS */
          const initialsText = makeInitialsText(letters[i]);

          /* NAME */
          const firstNameText = makeFirstNameText(letters[i]);
          const lastNameText = makeLastNameText(letters[i]);

          /* DATE */
          const dateText = makeDateText(letters[i]);

          /* 
        add content to plane 
      */
          plane.add(idText);
          plane.add(initialsText);
          plane.add(firstNameText);
          plane.add(lastNameText);
          plane.add(dateText);

          /* 
        make content clickable
      */
          makeClickable(initialsText, false);
          makeClickable(firstNameText, false);
          makeClickable(lastNameText, false);
          makeClickable(idText, false);

          /* 
        position content on plane
      */

          /* ID */
          idText.position.y = 0.13;
          idText.position.x = -0.09;
          idText.position.z = 0.01;

          /* INITIALS */
          initialsText.position.y = 0.07;
          initialsText.position.x = -0.06;
          initialsText.position.z = 0.01;

          /* NAME */
          firstNameText.position.y = -0.03;
          firstNameText.position.x = -0.13;
          firstNameText.position.z = 0.01;

          lastNameText.position.y = -0.06;
          lastNameText.position.x = -0.13;
          lastNameText.position.z = 0.01;

          /* DATE */
          dateText.position.y = -0.09;
          dateText.position.x = -0.13;
          dateText.position.z = 0.01;
        }

        // loop over letters and create helix
        //for (let i = 0, l = letters.length; i < l; i++) {
        /* 
        create planes and position them as a helix 
      */

        // Mesh/Plane for letter objects
      });
    }

    /* 5.) Helper Functions for Map View */

    function makePlane() {
      const geometry = track(new THREE.PlaneGeometry(0.3, 0.3));
      // DoubleSide -> visisble and not visible sides of objects are rendered
      const material = track(
        new THREE.MeshBasicMaterial({
          color: 0xcc0000,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.7,
        })
      );
      const plane = track(new THREE.Mesh(geometry, material));
      return plane;
    }

    function makeKugel(radius) {
      const geometryKugel = track(new THREE.SphereGeometry(radius, 32, 16));
      const materialKugel = track(
        new THREE.MeshBasicMaterial({
          color: 0xcc0000,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.7,
        })
      );
      const kugel = track(new THREE.Mesh(geometryKugel, materialKugel));

      return kugel;
    }

    function makeIdText(letter) {
      const idText = track(new Text());

      // Set content of text object (property "text")
      idText.text = letter.idFormatted;

      // give object a name (will appear in scenegraph in console)
      // e.g. name="GB01 Nr.EB005"
      idText.name = `${letter.idFormatted}`;

      // Set styling properties of text object
      idText.fontSize = 0.03;
      idText.color = 0xffffff;

      // Update the rendering:
      idText.sync();

      return idText;
    }

    function makeInitialsText(letter) {
      const initialsText = track(new Text());
      // Scenegraph in Console: e.g. name="CB"
      initialsText.name = `initials_${letter.receiverInitials}`;

      // Set content of text object (property "text")
      initialsText.text = letter.receiverInitials;

      // Set styling properties of text object
      initialsText.fontSize = 0.08;
      initialsText.color = 0xffffff;

      // Update the rendering:
      initialsText.sync();

      return initialsText;
    }

    function makeFirstNameText(letter) {
      const firstNameText = track(new Text());
      // Scenegraph in Console: e.g. name="Charlotte"
      firstNameText.name = `name_${letter.receiverFirstName}`;

      // Set content of text object (property "text")
      firstNameText.text = letter.receiverFirstName;

      // Set styling properties of text object
      firstNameText.fontSize = 0.02;
      firstNameText.color = 0xffffff;

      // Update the rendering:
      firstNameText.sync();

      return firstNameText;
    }

    function makeLastNameText(letter) {
      const lastNameText = track(new Text());
      // Scenegraph in Console: e.g. name="Buff"
      lastNameText.name = `name_${letter.receiverLastName}`;

      // Set content of text object (property "text")
      lastNameText.text = letter.receiverLastName;

      // Set styling properties of text object
      lastNameText.fontSize = 0.02;
      lastNameText.color = 0xffffff;

      // Update the rendering:
      lastNameText.sync();

      return lastNameText;
    }

    function makeDateText(letter) {
      const dateText = track(new Text());
      // Scenegraph in Console: e.g. name="12. Juli 1764"
      dateText.name = `${letter.dateFormatted}`;

      // Set content of text object (property "text")
      dateText.text = letter.dateFormatted;

      // Set styling properties of text object
      dateText.fontSize = 0.03;
      dateText.color = 0xffffff;

      // Update the rendering:
      dateText.sync();

      return dateText;
    }

    function correctPositionWiesbaden() {
      scene.children
        .filter((i) => i.name == "Scene")[0]
        .children.filter((i) => i.name == "Wiesbaden")
        .forEach(
          (wiesbadenPlacemarker) => (wiesbadenPlacemarker.position.y = 3.8)
        );
    }

    function makeYearMarker(year, index) {
      const yearMarker = track(new Text());
      yearMarker.name = `yearMarker${year}`;

      // Set content of text object (property "text")
      yearMarker.text = year;

      // Set styling properties of text object
      yearMarker.fontSize = 0.2;
      yearMarker.color = 0x9966ff;

      // Set position of text object
      // distance of text objects to next text object above
      yearMarker.position.y += 1 + index * 2.5;

      // Update the rendering:
      yearMarker.sync();
      return yearMarker;
    }

    function makeLetterNumMarker(letterCount) {
      const letterNumMarker = track(new Text());
      letterNumMarker.name = `letterNumMarker${letterCount}`;

      // Set content of text object
      letterNumMarker.text = letterCount;

      // Set styling properties of text object
      letterNumMarker.fontSize = 0.7;
      letterNumMarker.color = 0xffffff;

      // Update the rendering:
      letterNumMarker.sync();

      return letterNumMarker;
    }

    function loopPlaceMarker(functionForLoop) {
      scene.children
        .filter((i) => i.name == "Scene")[0] // scene contains another group "scene" which contains all objects in the gltf file created in blender (Karte und Ortsmarker)
        .children.filter(
          (i) =>
            ["Frankfurt", "Darmstadt", "Wiesbaden", "Worms"].includes(i.name) // temporary! filters which objects (Ortsmarker) from the scene group should be included
        )
        .forEach((placeMarker) => {
          // function with code that should be executed in the loop for each placeMarker
          // functionForLoop must have argument "placeMarker"
          functionForLoop(placeMarker);
        });
    }

    function loopYearMarker(functionForLoop) {
      scene.children
        .filter((i) => i.name == "Scene")[0] // scene contains another group "scene" which contains all objects in the gltf file created in blender (Karte und Ortsmarker)
        .children.filter(
          (i) =>
            ["Frankfurt", "Darmstadt", "Wiesbaden", "Worms"].includes(i.name) // temporary! filters which objects (Ortsmarker) from the scene group should be included
        )
        .forEach((placeMarker) => {
          // loop over Ortsmarker objects
          try {
            const city = data[placeMarker.name]; // saves name of place from json data
            console.log(city, placeMarker.name); // logs city names
            // Array with years (will later be provided by jQuery time filter)
            [
              "1764",
              "1765",
              "1766",
              "1767",
              "1768",
              "1769",
              "1770",
              "1771",
              "1772",
            ].forEach((year, index) => {
              // function with code that should be executed in the loop for each yearMarker
              // function for loop needs arguments "placeMarker, city, year, index"
              functionForLoop(placeMarker, city, year, index);
            });
          } catch (error) {
            console.log(error);
          }
        });
    }

    /* CREATE SINGLE PLACE VIEWS (Einzelansicht)*/

    function initSinglePlaceView() {
      // default: Sphären
      renderer = loadSingleViewBase();
      makeSpheresForSingleView("Frankfurt");
    }

    function singlePlaceViewHelix() {
      renderer = loadSingleViewBase();
      makeHelixForSingleView();
    }

    /* FUNCTIONS FOR SINGLE PLACE VIEW */

    /* Basis für Einzelansicht */
    function loadSingleViewBase() {
      let renderer = new CSS3DRenderer();
      renderer.name = "CSS3D";
      renderer.setSize(window.innerWidth, window.innerHeight);
      // im div mit id = container werdend die Objekte gerendert
      document.getElementById("container").appendChild(renderer.domElement);
      return renderer;
    }

    /* Einzelansicht: Sphären */
    function makeSpheresForSingleView(placename) {
      // Instanziierung eines leeren 3D-Vektors
      const vector = new THREE.Vector3();
      camera = new THREE.PerspectiveCamera(
        40,
        window.innerWidth / window.innerHeight,
        1,
        10000
      );
      camera.position.y = 0;
      camera.position.z = 0;
      camera.position.x = 0;

      camera.position.z = 10000;
      camera.position.x = 7500;
      camera.position.y = 5000;
      camera.zoom = 1;
      //camera.updateProjectionMatrix();
      //camera.lookAt(new Vector3(0,1000,0));
      //camera.position.y = 3000;
      //camera.updateProjectionMatrix();
      //camera.lookAt(new Vector3(0,1000,0));
      cameraGui.add(camera.position, "y").min(0).max(10000).step(10);
      cameraGui.add(camera.position, "x").min(0).max(10000).step(10);
      cameraGui.add(camera.position, "z").min(0).max(10000).step(10);

      console.log(camera);
      controls = new OrbitControls(camera, renderer.domElement);
      controls.target.x = 0;
      controls.target.z = 0;
      controls.target.y = 0;
      controls.minPolarAngle = Math.PI / 2;
      controls.maxPolarAngle = Math.PI / 2 + 0.75;
      // controls.enablePan = false;
      // controls.enableZoom = false;
      // console.log('azi',controls.getAzimuthalAngle());
      // console.log('pol',controls.getPolarAngle());
      console.log(controls.target);
      //   canvas.addEventListener( 'wheel', function(event){
      //     //...
      //     event.preventDefault();
      //     let scale = 0;
      //     console.log(event.deltaY);
      //     scale += event.deltaY;

      //     // Restrict scale

      //     console.log(scale);
      //     camera.position.y += scale * 10;
      //     //...
      //  })
      //controls.enableRotate = false;

      let place = data[`${placename}`];

      Object.keys(place).forEach((year, index) => {
        let yearArray = place[`${year}`];
        console.log(yearArray);
        // loop over array with letter objects
        let letters = [];
        for (let i = 0; i < yearArray.length; i++) {
          letters.push(yearArray[i]);
        }
        createSphere(letters, index);
      });

      function createSphere(letters, year) {
        for (let i = 0, l = letters.length; i < l; i++) {
          // <div class="element">
          const element = document.createElement("div");
          element.className = "element";
          // Math.random legt einen zufälligen Alpha-Wert für die Hintergrundfarbe fest
          // element.style.backgroundColor = 'rgba(255,0,0,' + ( Math.random() * 0.5 + 0.25 ) + ')';
          // ohne Math.random

          if (letters[i].receiverGender == "Weiblich") {
            element.style.backgroundColor = "rgb(237, 125, 49, 0.5)";
          } else if (letters[i].receiverGender == "Männlich") {
            element.style.backgroundColor = "rgb(231, 230, 230, 0.5)";
          } else {
            element.style.backgroundColor = "rgb(0, 0, 0, 0.5)";
          }
          //element.style.backgroundColor = 'rgb(231, 230, 230, 0.5)';
          element.setAttribute(
            "onclick",
            "window.open(' " + letters[i].propyURL + "')"
          );

          // <div class="id">
          const id = document.createElement("div");
          id.className = "id";
          id.textContent = letters[i].idFormatted;
          element.appendChild(id);

          // <div class="initials">
          const initials = document.createElement("div");
          initials.className = "initials";
          initials.textContent = letters[i].receiverInitials;
          initials.setAttribute(
            "onclick",
            "window.open(' " + letters[i].receiverId + "')"
          );
          element.appendChild(initials);

          // <div class="name">
          const name = document.createElement("div");
          name.className = "name";
          name.innerHTML = letters[i].receiverFormatted;
          name.setAttribute(
            "onclick",
            "window.open(' " + letters[i].receiverId + "')"
          );
          element.appendChild(name);

          // <div class="date">
          const date = document.createElement("div");
          date.className = "date";
          date.innerHTML = letters[i].dateFormatted;
          element.appendChild(date);

          // erstellt ein CSS3DObjekt aus Variable element
          // die Anfangsposition der Elemente wird zufällig festgelegt
          const objectCSS = track(new CSS3DObject(element));
          /* objectCSS.position.x = Math.random() * 400 - 200;
          objectCSS.position.y = Math.random() * 400 - 200;
          objectCSS.position.z = Math.random() * 400 - 200; */

          // Berechnung von Winkeln, die für die Positionierung in sphärischem Koordinatensystem notwendig sind
          // Basiert auf Index und Länge des Objekt-Arrays
          // phi = polar angle in radians from the y (up) axis
          // theta = equator angle in radians around the y (up) axis
          const phi = Math.acos(-1 + (2 * i) / l);
          const theta = Math.sqrt(l * Math.PI) * phi;

          // Objekt (Element) wird in einem sphärischem Koordinatensystem d.h. auf der Kugel platziert
          // https://en.wikipedia.org/wiki/Spherical_coordinate_system
          // Mehr Infos zu sphärischen Koordinaten in three.js: https://threejs.org/docs/index.html?q=vector#api/en/math/Spherical
          // Parameter: radial distance from point to origin (Mittelpunkt), phi, theta
          objectCSS.position.setFromSphericalCoords(500, phi, theta);

          // im Vektor wird die Position des Objekts gespeichert und skalar mit 2 multipliziert
          // warum?
          vector.copy(objectCSS.position).multiplyScalar(2);

          // Objekt und Vektor schauen sich an
          // Objekt wird so rotiert, dass siene interne Z-Achse zum Vektor zeigt
          // was auch immer das heißen soll???
          objectCSS.lookAt(vector);
          scene.add(objectCSS);

          objectCSS.position.y += 1200 * year;

          // Objekt wird zum Sphären Array im Targets-Objekt hinzugefügt
          targets.sphere.push(objectCSS);
        }
      }
    }

    /* Einzelansicht: Helix */
    function makeHelixForSingleView() {}

    /* HELPER FUNCTIONS */

    function makeClickable(obj, isArray) {
      if (isArray) {
        obj.forEach((o) => {
          targets.clickable.push(o);
        });
      } else {
        targets.clickable.push(obj);
      }
    }

    // loop over places

    // loop over years

    /**
     * Helper Geometries
     */
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

    /**
     * Axes Helper (Scene)
     */

    /* const axesHelperScene = new THREE.AxesHelper( 30 );
  scene.add( axesHelperScene ); */

    /**
     * Lights
     */

    // AmbientLight -> leuchtet alles gleichmäßig aus, kein Schatten
    const ambient_light = new THREE.AmbientLight(0x404040, 1.0);
    scene.add(ambient_light);

    // PointLight
    const pointLight = new THREE.PointLight(
      // Farbe
      0xffffff,
      // Intensität
      0.5
    );
    pointLight.position.x = -6.5;
    pointLight.position.y = 100;
    pointLight.position.z = 6;
    scene.add(pointLight);

    const pointLightColor = { color: 0xff0000 };

    /**
     * Helper geos for lights
     */

    // creates a geometric form that represents the light so you know where exactly the light is
    // there is a helper for every kind of light
    const pointLighthelper = new THREE.PointLightHelper(pointLight, 1);
    scene.add(pointLighthelper);
    //const pointLight2helper = new THREE.PointLightHelper(pointLight2, 1);
    //scene.add(pointLight2helper);

    /**
     * Resizing
     */

    window.addEventListener("resize", () => {
      // Update sizes
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;

      // Update camera
      camera.aspect = sizes.width / sizes.height;
      camera.updateProjectionMatrix();

      // Update renderer
      renderer.setSize(sizes.width, sizes.height);
      if (renderer.name == "WebGL") {
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      }
    });

    /**
     * Debug GUI
     */
    const gui = new dat.GUI();
    // must be wider than default, so that also long labels are visible e.g. "y_GB01 Nr.EB013"
    gui.width = 310;

    // Set GUI folders
    const cameraGui = gui.addFolder("Camera");
    const light = gui.addFolder("Light");
    const idTextGui = gui.addFolder("idText");
    const initialsGui = gui.addFolder("initials");
    const firstNameGui = gui.addFolder("firstname");
    const lastNameGui = gui.addFolder("lastname");
    const dateGui = gui.addFolder("date");
    const letterNumMarkerGui = gui.addFolder("letterNumMarker");

    // Set Debug GUI
    light.add(pointLight.position, "y").min(-10).max(100).step(0.01);
    light.add(pointLight.position, "x").min(-10).max(10).step(0.01);
    light.add(pointLight.position, "z").min(-10).max(10).step(0.01);
    light.add(pointLight, "intensity").min(0).max(15).step(0.01);
    light.addColor(pointLightColor, "color").onChange(() => {
      pointLight.color.set(pointLightColor.color);
    });

    /**
     * Camera
     */

    let camera = new THREE.OrthographicCamera(
      sizes.width / -2,
      sizes.width / 2,
      sizes.height / 2,
      sizes.height / -2,
      0,
      2000
    );
    camera.position.x = 0;
    camera.position.y = 25;
    camera.position.z = 20;
    camera.zoom = 10;
    camera.updateProjectionMatrix();
    scene.add(camera);

    /**
     * Controls
     */

    let controls = new OrbitControls(camera, canvas);
    //controls.enableDamping = true;

    /**
     * Mouse interaction and Raycasting
     */

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

    // Raycast passiert nur bei Mausklick
    document.addEventListener("click", (e) => {
      // der Raycaster gibt ein Array mit den vom Strahl getroffenen
      // Objekten zurück. Dieses Array ist leer (Länge == 0), wenn
      // keine Objekte getroffen wurden.
      console.log(targets.clickable);
      let intersects = raycaster.intersectObjects(targets.clickable);
      //console.log(scene.children[4].children);
      // Alle Elemente in der Szene. Klick auf den LightHelper logged bspw. diesen.
      // Statt scene.children kann auch ein Array relevanter Objekte angegeben werden: [ objectPlanet ]
      // Wenn der intersects Array Objekte enthält (length > 0), dann wird der string "Klick" ausgegeben plus das Objekt

      if (intersects.length > 0) {
        // log clicks
        let clickedObj = intersects[0].object;
        console.log("Klick ", clickedObj);

        /* Define click events for different objects*/

        // click on letter object (planes)
        // nur zum Test
        if (clickedObj.geometry.type == "PlaneGeometry") {
          console.log("Briefelement angeklickt");
        }

        // click on id -> link to platform
        if (clickedObj.name.includes("GB01 Nr.")) {
          // öffnet neuen Tab mit Beispielbrief
          window.open("https://goethe-biographica.de/id/GB02_BR005_0");
          // perspektivisch (wenn Briefe auf Plattform verlinkt)
          // Lookup: Welcher Brief gehört zum Plane? evtl. BriefId als Name des Planes festlegen damit es funktioniert, dann property "propyURL" in window() einsetzen
          // maybe useful:
          // get id of letter (without _s or _r)
          /* let id = R.replace(/_[sr]/g, "", clickedObj.parent.name);
               console.log(id); */
        }

        // click on initals or name -> link to gnd of person
        if (
          clickedObj.name.includes("initials") ||
          clickedObj.name.includes("name")
        ) {
          let searchObj = {}; // will be object with id of the respective letter
          // loop over places
          Object.keys(data).forEach((place) => {
            // loop over years
            Object.keys(data[`${place}`]).forEach((year) => {
              let yearArray = data[`${place}`][`${year}`];
              // loop over array with letter objects
              for (let i = 0; i < yearArray.length; i++) {
                // test if id of current obj = name of parent obj in scene (i.e. id of plane)
                // if yes, save current obj in var searchObj and link to gnd
                if (yearArray[i].id == clickedObj.parent.name) {
                  searchObj = yearArray[i];
                  // use gnd url stored in property "receiverId" to open link in new tab
                  window.open(searchObj.receiverId);
                }
              }
            });
          });
        }
        console.log(clickedObj);
        // click on placeMarker -> Wechsel zu Einzelansicht
        if (Object.keys(data).includes(clickedObj.name)) {
          console.log("Klick auf Ortsmarker!");
          //clearCanvas();
          //initSinglePlaceView();
        }

        /* if (
          clickedObj.parent.name == "Scene" &&
          clickedObj.parent.type == "Group" &&
          clickedObj.name != "GOOGLE_SAT_WM" &&
          clickedObj.name != "GOOGLE_MAP_WM" &&
          clickedObj.name != "OSM_MAPNIK_WM" &&
          clickedObj.name != "EXPORT_OSM_MAPNIK_WM"
        ) {
          console.log("Klick auf Ortsmarker!");
          //clearCanvas();
          //initSinglePlaceView();
        } */
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
  }); // FETCH END
