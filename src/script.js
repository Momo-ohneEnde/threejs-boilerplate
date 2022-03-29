/**
 *  @fileOverview This js-file creates the map view. Sphere view and helix view are inspired by https://github.com/mrdoob/three.js/blob/master/examples/css3d_periodictable.html.
 *
 *  @author       Marina Lehmann
 *  @author       Max Grüntgens
 *
 *  @requires     NPM:three.js
 *  @requires     NPM:dat.gui
 *  @requires     NPM:ramda
 *  @requires     NPM:d3
 *  @requires     NPM:jQuery
 *  @requires     NPM:troika-three-text
 */

/*
 * Imports
 */

import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";
import { PointLight, AmbientLight, Vector3 } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoughnessMipmapper } from "three/examples/jsm/utils/RoughnessMipmapper.js";
import { Text } from "troika-three-text";
import * as R from "ramda";
import * as d3 from "d3";
import * as jQuery from "jquery/dist/jquery.min.js";

fetch("./letters_json_grouped_merged.json")
  // log response to see whether data is loaded
  /* .then(response => {
      console.log('Response:', response)
      return response.json(); } */
  .then((response) => response.json())
  .then((data) => {
    //console.log(data);
    return data;
  })
  .then((data) => {
    /*
     * Settings
     */
    const SETTINGS = {
      render_wireframe: false,
      show_edges: false,
    };

    /*
     * Sizes
     */

    // size of canvas on which objects are rendered
    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    /*
     * Canvas
     */

    // looks up canvas element in html where 3D graphic should be drawn
    const canvas = document.querySelector("canvas.webgl");

    /**
     * Renderer
     *
     * @desc This function creates the WebGL renderer used by the map view. The renderer uses the canvas element to display the rendered objects.
     * @function renderer
     * @returns THREE.WebGLRenderer
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
      console.log("renderer info", renderer.info);
      return renderer;
    })();

    /*
     * Scene
     */
    const scene = new THREE.Scene();

    /*
     * Variables
     */

    // clickable = array of clickable objects
    const targets = { clickable: [] };

    // range that is currently set in the time filter, default: 1764-1772, is later overwritten when time filter is used
    let timeFilterRange = range(1764, 1772);

    /*
     * Data and Main Functions
     */

    /**
     * Clear function
     * @desc This function disposes of the objects on the canvas by using the class ResourceTracker. It is called when changing between different versions of the map view (kugel, sphere, helix).
     * @function clearCanvas
     * @returns nothing
     */
    function clearCanvas() {
      //resourceTracker.logResources();
      resourceTracker.dispose();

      console.log("Disposed!");
      console.log("Scene: ", scene);
      console.log("renderer info", renderer.info);
      //resourceTracker.logResources();
    }

    /* How to delete objects form the scene (general process): 
      1.) go through the entire scene
      2.) remove all elements on the scene with remove(), 
      3.) then delete them from memory with dispose(). Important: geometry, material, texture must be deleted separately.
     */

    /* Deletion process with ResourceTracker class:
     * Tracker creates a Set of the objects to be deleted later
     * Tracker has a track-function, with which objects can be added to the set. Objects should be tracked with this function directly when they are created.
     * i.e. when a new object is created, it must always be surrounded by track(), e.g. const yearboundaryText = track(new Text());
     * When the canvas/scene should be cleared, dispose() can be used to delete all objects currently in the Set at the same time
     */

    /**
     * ResourceTracker
     * @classdesc A class to track the objects which will be removed from the scene when views change. Inspired by: https://r105.threejsfundamentals.org/threejs/lessons/threejs-cleanup.html#toc.
     * @class ResourceTracker
     */
    class ResourceTracker {
      constructor() {
        this.resources = new Set();
      }

      /**
       * @desc Tracks objects, i.e. adds them to the resourceTracker Set. Belongs to class ResourceTracker.
       * @function track
       * @param {} resource Parameters can be all kinds of objects.
       * @returns resource
       */
      track(resource) {
        // check whether resource is undefined or null
        if (!resource) {
          return resource;
        }

        // handle children and handle other arrays, i.e. when material is an array of materials or
        // uniform is array of textures
        if (Array.isArray(resource)) {
          resource.forEach((resource) => this.track(resource));
          return resource;
        }

        // add recource to the tracking array
        if (resource.dispose || resource instanceof THREE.Object3D) {
          this.resources.add(resource);
        }

        // geometry, material and possible children of an object must be tracked (and then disposed of) separately
        if (resource instanceof THREE.Object3D) {
          this.track(resource.geometry);
          this.track(resource.material);
          this.track(resource.children);
        } else if (resource instanceof THREE.Material) {
          // check if there are any textures on the material
          for (const value of Object.values(resource)) {
            if (value instanceof THREE.Texture) {
              this.track(value);
            }
          }
          // check if any uniforms reference textures or arrays of textures
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

      /**
       * @desc Untracks objects, i.e. removes them from the resourceTracker Set. Belongs to class ResourceTracker.
       * @function untrack
       * @param {} resource Parameters can be all kinds of objects.
       * @returns nothing
       */
      untrack(resource) {
        this.resources.delete(resource);
      }

      /**
       * @desc Deletes all tracked objects, i.e. empties the resourceTracker Set. Belongs to class ResourceTracker.
       * @function dispose
       * @returns nothing
       */
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

      logResources() {
        console.log("Resources of Tracker", this.resources);
      }
    }

    // set up resource tracker and bind tracking method to track() (function can be used without referencing the class first)
    const resourceTracker = new ResourceTracker();
    const track = resourceTracker.track.bind(resourceTracker);

    /* INIT */
    /**
     * @desc Initializes the visualization by creating the default map view: kugel view.
     * @function init
     * @returns nothing
     */
    function init() {
      // default: kugel view
      mapViewKugeln(timeFilterRange);
    }
    init();

    /* BUTTONS */
    // KUGEL BUTTON -> change to kugel view
    const kugelButton = document.getElementById("kugel");

    kugelButton.onclick = () => {
      // clear canvas
      clearCanvas();

      // create kugel view
      mapViewKugeln(timeFilterRange);

      console.log("Wechsel zu Kugelansicht!");
    };

    // SPHERE BUTTON -> change to sphere view
    const sphereButton = document.getElementById("sphere");
    sphereButton.onclick = () => {
      // clear canvas
      clearCanvas();

      // remove content of infobox
      removeContentOfInfobox();

      // create sphere view
      mapViewSpheres(timeFilterRange);

      console.log("Wechsel zu Sphärenansicht!");
    };

    // HELIX BUTTON -> change to helix view
    const helixButton = document.getElementById("helix");

    helixButton.onclick = () => {
      // clear canvas
      clearCanvas();

      // remove content of infobox
      removeContentOfInfobox();

      // create helix view
      mapViewHelix(timeFilterRange);

      console.log("Wechsel zu Helixansicht!");
    };

    /* CREATE MAP VIEWS */

    /* 1) Default: Kugel View */

    /**
     * @function mapViewKugeln
     * @desc Creates kugel view. 1) Sets view id to "kugel" 2) sets visibility of filter controls to hidden 3) loads gltf basemap and adds it to scene 4) calls function to make kugeln 5) makes objects on scene clickable
     * @param {string[]} yearArray Year range set by the time filter.
     * @returns nothing
     */
    function mapViewKugeln(
      yearArray = [
        "1764",
        "1765",
        "1766",
        "1767",
        "1768",
        "1769",
        "1770",
        "1771",
        "1772",
      ]
    ) {
      // set view id to "kugel"
      setViewId("kugel");

      // set visibility of filter controls
      document.getElementById("filter-mode").style.visibility = "hidden";
      document.getElementById("letter-status-filter").style.visibility =
        "hidden";
      document.getElementById("doc-type-filter").style.visibility = "hidden";
      document.getElementById("person-filter").style.visibility = "hidden";
      document.getElementById("infobox").style.visibility = "hidden";

      // load gltf basemap
      const roughnessMipmapper = new RoughnessMipmapper(renderer);
      const loader = new GLTFLoader();
      loader.load("./gltf/goethe_basemap.glb", function (gltf) {
        gltf.scene.traverse(function (child) {
          // traverse goes through all the children of an object
          if (child.isMesh) {
            roughnessMipmapper.generateMipmaps(child.material); // apply mipmapper before rendering
          }
        });

        // add basemap to scene (!gltf has its own scene) and track it
        scene.add(track(gltf.scene));

        // debug: log scene graph
        console.log("Scene: ", scene);

        // add kugeln
        loopPlaceMarker(addKugeltoPlaceMarker, yearArray);

        // correct position of placemarker "Wiesbaden"
        correctPositionWiesbaden();

        // make objects on gltf scene clickable
        const gltfSceneObjs = scene.children[4].children;
        // loop over array gltf scene objects and add each child ojb to the clickable list
        // true -> isArray
        makeClickable(gltfSceneObjs, true);
        //console.log(gltfSceneObjs);

        roughnessMipmapper.dispose();
        //render();
      });
    }

    /* 2) Lettter Network View */

    function mapViewLetterNetwork() {
      // Code
      // not yet implemented
    }

    /* 3) Sphere View*/

    // vector to which the planes will be facing
    const vector = new Vector3();

    /**
     * @function mapViewSpheres
     * @desc Creates sphere view. 1) sets view id to "sphere" 2) sets visibility of filter controls to visible 3) loads gltf basemap and adds it to scene 4) calls function to add yearMarker and spheres 5) make infobox
     * @param {string[]} yearArray Year range set by the time filter.
     * @returns nothing
     */
    function mapViewSpheres(
      yearArray = [
        "1764",
        "1765",
        "1766",
        "1767",
        "1768",
        "1769",
        "1770",
        "1771",
        "1772",
      ]
    ) {
      // set view id to "sphere"
      setViewId("sphere");

      // set visibility of filter controls
      document.getElementById("filter-mode").style.visibility = "visible";
      document.getElementById("letter-status-filter").style.visibility =
        "visible";
      document.getElementById("doc-type-filter").style.visibility = "visible";
      document.getElementById("person-filter").style.visibility = "visible";
      document.getElementById("infobox").style.visibility = "visible";

      // load gltf basemap
      const roughnessMipmapper = new RoughnessMipmapper(renderer);
      const loader = new GLTFLoader();
      loader.load("./gltf/goethe_basemap.glb", function (gltf) {
        gltf.scene.traverse(function (child) {
          // travese goes through all the children of an object
          if (child.isMesh) {
            roughnessMipmapper.generateMipmaps(child.material); // apply mipmapper before rendering
          }
        });

        // add basemap to scene (!gltf has its own scene) and track it
        scene.add(track(gltf.scene));

        // debug: log scene graph
        console.log("Scene: ", scene);

        // add yearmarker and spheres
        loopYearMarker(addYearMarkerAndSpheres, yearArray);

        // correct position of placemarker "Wiesbaden"
        correctPositionWiesbaden();

        roughnessMipmapper.dispose();
        //render();

        // create infobox
        // important: infobox can only be made once gltf scene is loaded
        // therefore it needs to be inside the mapViewSpheres function
        makeInfoBox();
      });
    }

    /* 4) Helix View */

    /**
     * @function mapViewHelix
     * @desc Creates helix view. 1) sets view id to "helix" 2) sets visibility of filter controls to visible 3) load gltf basemap and add it to scene 4) call function that adds helix 5) make infobox
     * @param {string[]} yearArray Year range set by the time filter.
     * @returns nothing
     */
    function mapViewHelix(
      yearArray = [
        "1764",
        "1765",
        "1766",
        "1767",
        "1768",
        "1769",
        "1770",
        "1771",
        "1772",
      ]
    ) {
      // set view id to "helix"
      setViewId("helix");

      // visibility of filter controls
      document.getElementById("filter-mode").style.visibility = "visible";
      document.getElementById("letter-status-filter").style.visibility =
        "visible";
      document.getElementById("doc-type-filter").style.visibility = "visible";
      document.getElementById("person-filter").style.visibility = "visible";
      document.getElementById("infobox").style.visibility = "visible";

      // load gltf basemap
      const roughnessMipmapper = new RoughnessMipmapper(renderer);
      const loader = new GLTFLoader();
      loader.load("./gltf/goethe_basemap.glb", function (gltf) {
        gltf.scene.traverse(function (child) {
          // travese goes through all the children of an object
          if (child.isMesh) {
            roughnessMipmapper.generateMipmaps(child.material); // apply mipmapper before rendering
          }
        });

        // add basemap to scene (!gltf has its own scene) and track it
        scene.add(track(gltf.scene));

        // debug: log scene graph
        console.log("Scene", scene);

        // add helix
        loopPlaceMarker(addHelixtoPlaceMarker, yearArray);

        // correct position of placemarker "Wiesbaden"
        correctPositionWiesbaden();

        roughnessMipmapper.dispose();
        //render();

        // make infobox
        makeInfoBox();
      });
    }

    /* FUNCTIONS FOR MAP VIEW */

    /* 1) Functions for KUGEL VIEW */

    /**
     * @function makeKugeln
     * @desc Creates kugeln plus markers showing the number of letters.
     * @param {Object3D} placeMarker Placename object on map
     * @param {Object.<string, Object>} city data for a specific city
     * @param {string[]} yearArray Year range set by the time filter.
     * @returns nothing
     */
    function makeKugeln(placeMarker, city, yearArray) {
      // iterates over years, then over letter objects of each year, then counts number of letter objects
      let letterCount = 0;
      yearArray.forEach((year) => {
        // condition: year of yearArray must also be a key in the city data, i.e. threre must be data points for the year (otherwise: undefined error)
        if (Object.keys(city).includes(year)) {
          let yearArrayData = city[`${year}`];
          // loop over array with letter data
          for (let i = 0; i < yearArrayData.length; i++) {
            letterCount++;
          }
        }
      });
      //console.log(letterCount);

      // create number of letter objects as text object
      const letterNumMarker = makeLetterNumMarker(letterCount);

      // determines radius of kugel with interpolation
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

      // make kugel by using the calculated radius based on number of letters
      const kugel = makeKugel(getRadius());

      // place kugel on map
      placeMarker.add(kugel);
      // position kugel
      kugel.position.y = getRadius() + 0.5;

      // put text on kugel
      kugel.add(letterNumMarker);
      // position text
      letterNumMarker.position.y = 0.5;
      letterNumMarker.position.x = -0.2;
      letterNumMarker.position.z = getRadius();

      // axes helper for letterNumMarker
      /* const axesHelperKugel = new THREE.AxesHelper(1);
      kugel.add(axesHelperKugel);

      const axesHelperLetterNumMarker = new THREE.AxesHelper(1);
      letterNumMarker.add(axesHelperLetterNumMarker); */

      // gui für letterNumMarker
      /* letterNumMarkerGui
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
        .name(`z_${letterNumMarker.name}`); */
    }

    /**
     * @function getMaxLettersPerPlace
     * @desc This function returns the highest number of letters associated to a place.
     * @returns maximum number of letters
     */
    function getMaxLettersPerPlace() {
      // iteration over places, count number of letters, write to array, then max()
      let letterCount = 0;
      let letterCountArray = [];
      let maxLettersPerPlace = 0;
      Object.keys(data).forEach((place) => {
        // loop over years
        Object.keys(data[`${place}`]).forEach((year) => {
          let yearArray = data[`${place}`][`${year}`];
          // loop over array with letter data
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

    /**
     * @function getMinLettersPerPlace
     * @desc This function returns the lowest number of letters associated to a place.
     * @returns minimum number of letters
     */
    function getMinLettersPerPlace() {
      let letterCount = 0;
      let letterCountArray = [];
      let minLettersPerPlace = 0;
      Object.keys(data).forEach((place) => {
        // loop over years
        Object.keys(data[`${place}`]).forEach((year) => {
          let yearArray = data[`${place}`][`${year}`];
          // loop over array with letter data
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

    /**
     * @function addKugeltoPlaceMarker
     * @desc This function is an implementation of functionForLoop executed in the loopPlaceMarker function. It adds kugeln to placemarkers.
     * @param {Object3D} placeMarker Placename object on map
     * @param {string[]} yearArray Year range set by the time filter.
     * @returns nothing
     */

    function addKugeltoPlaceMarker(placeMarker, yearArray) {
      try {
        const city = data[placeMarker.name]; // data associated to a place
        //console.log(city, placeMarker.name); // logs city names

        makeKugeln(placeMarker, city, yearArray);
      } catch (error) {
        console.log(error);
      }
    }

    /* 2) Functions for LETTER NETWORK VIEW */

    /* 3) Functions for SPHERE VIEW */

    /**
     * @function makeSpheresForMap
     * @desc Plots a sphere of planes around each pivot point (yearMarker). Calls functions to make the planes and the text objects on the planes (idText, initialsText, firstNameText, lastNameText, dateText).
     * @param {Mesh} pivot Point around which sphere will be centered, here: yearMarker.
     * @param {Object[]} letters Array of letter objects associated to a certain year.
     * @returns nothing
     */
    function makeSpheresForMap(pivot, letters) {
      for (let i = 0, l = letters.length; i < l; i++) {
        /* 
        create planes and position them as a sphere 
      */

        // Mesh/Plane for letter data
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

        // add planes to pivot bc their position is relative to the pivot
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
        /* idTextGui
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
          .name(`z_${idText.name}`); */

        /* INITIALS */
        initialsText.position.y = 0.07;
        initialsText.position.x = -0.06;
        initialsText.position.z = 0.01;

        // axes helper for initials
        /* const axesHelperInitials = new THREE.AxesHelper( 1 );
      initialsText.add( axesHelperInitials ); */

        // gui helper for initials
        /* initialsGui
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
          .name(`z_${idText.name}`); */

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
        /* firstNameGui
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
          .name(`z_${idText.name}`); */

        // gui helper for lastName
        /* lastNameGui
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
          .name(`z_${idText.name}`); */

        /* DATE */
        dateText.position.y = -0.09;
        dateText.position.x = -0.13;
        dateText.position.z = 0.01;

        // axes helper for name
        /* const axesHelperDate = new THREE.AxesHelper( 1 );
      dateText.add( axesHelperDate ); */

        // gui helper for date
        /* dateGui
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
          .name(`z_${idText.name}`); */

        /* AXES HELPER for pivot */
        /* const axesHelperPivot = new THREE.AxesHelper( 1 );
        pivot.add( axesHelperPivot ); */

        // Text
        /* const myText = new Text();
        pivot.add(myText);
 */
      }
    }

    /**
     * @function addYearMarkerAndSpheres
     * @desc This function is an implementation of functionForLoop executed in the loopYearMarker function. It adds spheares and yearMarkers to the given placeMarker. It calls the functions makeYearMarker and makeSpheresForMap.
     * @param {Object3D} placeMarker Placename object on map
     * @param {Object.<string, Object>} city data for a specific city
     * @param {string} year
     * @param {number} index
     * @returns return value
     */
    function addYearMarkerAndSpheres(placeMarker, city, year, index) {
      let yearsOfCity = Object.keys(city); // save years associated to the city in an Array

      // create text object
      const yearMarker = makeYearMarker(year, index);

      // add yearMarker object as child of placeMarker object -> yearMarker positioned relative to placeMarker
      placeMarker.add(yearMarker);

      // test whether years in the time filter array (year) are contained in the list of years associated to each city
      // if yes, plot the plane (here: as sphere)
      // yearMarker = pivot, city[year] = data = array with all planes associated to this year
      if (yearsOfCity.includes(year)) {
        let lettersFromYear = city[year];
        makeSpheresForMap(yearMarker, lettersFromYear);
      }

      // add yearMarkers to array of clickable objects
      makeClickable(yearMarker, false);
    }

    /* 4) Helix */

    /**
     * @function addHelixtoPlaceMarker
     * @desc This functions is an implementation of functionForLoop in loopPlaceMarker. It calls the function makeHelixForMap. It adds the helix to the given placeMarker.
     * @param {Object3D} placeMarker Placename object on map
     * @param {string[]} yearArray Year range set by the time filter.
     * @returns nothing
     */
    function addHelixtoPlaceMarker(placeMarker, yearArray) {
      try {
        const city = data[placeMarker.name]; // saves name of place from json data
        console.log(city, placeMarker.name); // logs city names

        makeHelixForMap(placeMarker, city, yearArray);
      } catch (error) {
        console.log(error);
      }
    }

    /**
     * @function makeHelixForMap
     * @desc Creates Helix consisting of planes.
     * @param {Object3D} placeMarker Placename object on map
     * @param {Object.<string, Object>} city data for a specific city
     * @param {string[]} yearArray Year range set by the time filter
     * @returns nothing
     */
    function makeHelixForMap(placeMarker, city, yearArray) {
      // height of previous helix, starting point to from which helix is built
      let old_h = 0.0;

      // aggreagate all letters of one place in an array
      yearArray.forEach((year, yearindex) => {
        // array of years
        let letters = city[`${year}`];

        // if there are no letters for a year, the letters variable is undefined
        // in this case an array with only one yearboundary object needs to be created
        if (letters == undefined) {
          letters = [{ type: "yearboundary_empty_year", id: year, text: year }];
        }

        // check the first element in array, if it is not a yearboundary object yet, add a yearboundary object
        // yearboundary objects will become the yearmarkers
        else {
          letters = letters
            .map((n) => {
              if (n.hasOwnProperty("day")) {
                return n;
              } else {
                return { ...n, day: "0" };
              }
            })
            .sort((a, b) => a.day > b.day)
            .sort((a, b) => a.month > b.month);
        }
        if (letters[0].type != "yearboundary") {
          letters.unshift({
            type: "yearboundary",
            id: year,
            text: year,
          });
        }

        // parameters to calculate helix
        let n = letters.length;
        let r = n / 10;
        let h = n / 5;
        let theta = 0.0;
        let y = 0.0;

        /* MAKE PLANES AND CONTENT ON THEM */
        if (n > 0) {
          for (let i = 0; i < n; i++) {
            let plane;

            /* MAKE YEARBOUNDARY PLANES FOR EMPTY YEARS */
            if (letters[i].type == "yearboundary_empty_year") {
              plane = makePlane(0xffff00, 0);
              // id of yearboundary object is the year
              const id = letters[i].id;
              plane.name = `${id}`;

              // calculate helix
              // height is bigger in this case so that yearMarkers are not too close together
              h = n / 2;
              theta = (2 * Math.PI * i) / n;
              y = (h * i) / n + old_h;

              // position planes in helix form
              // y + 1.0 because helix shall not start directly on the map but slightly above the placemarkers
              plane.position.setFromCylindricalCoords(r, theta, y + 1.0);

              vector.x = plane.position.x * 2;
              vector.y = plane.position.y;
              vector.z = plane.position.z * 2;

              plane.lookAt(vector);

              // add planes to pivot (placemarker) bc their position is relative to the pivot
              placeMarker.add(plane);

              // add text to yearboundary plane
              const yearboundaryText = track(new Text());
              yearboundaryText.text = letters[i].text;
              yearboundaryText.name = `yearboundary_${letters.text}`;

              plane.add(yearboundaryText);

              // position yearboundary plane
              yearboundaryText.position.y = 0.07;
              yearboundaryText.position.x = -0.1;
              yearboundaryText.position.z = 0.01;
              yearboundaryText.fontSize = 0.1;
            } else if (letters[i].type == "yearboundary") {
              /* MAKE YEARBOUNDARY PLANES FOR YEARS WITH LETTERS*/
              plane = makePlane(0xffff00);
              // id of yearboundary object is the year
              const id = letters[i].id;
              plane.name = `${id}`;

              // calculate helix
              theta = (2 * Math.PI * i) / n;
              y = (h * i) / n + old_h;

              // position planes in helix form
              // y + 1.0 because helix shall not start directly on the map but slightly above the placemarkers
              plane.position.setFromCylindricalCoords(r, theta, y + 1.0);

              vector.x = plane.position.x * 2;
              vector.y = plane.position.y;
              vector.z = plane.position.z * 2;

              plane.lookAt(vector);

              // add planes to pivot (placemarker) bc their position is relative to the pivot
              placeMarker.add(plane);

              // add text to yearboundary plane
              const yearboundaryText = track(new Text());
              yearboundaryText.text = letters[i].text;
              yearboundaryText.name = `yearboundary_${letters.text}`;

              plane.add(yearboundaryText);

              // position yearboundary plane
              yearboundaryText.position.y = 0.07;
              yearboundaryText.position.x = -0.1;
              yearboundaryText.position.z = 0.01;
              yearboundaryText.fontSize = 0.1;
            } else {
              /* MAKE LETTER PLANES */
              plane = makePlane(0xcc0000);

              // set id for naming the plane (z.B. GB01_1_EB005_0_s)
              const id = letters[i].id;
              plane.name = `${id}`;

              // depending if you want to start from 0 or
              // calculate values for theta and y
              theta = (2 * Math.PI * i) / n;
              y = (h * i) / n + old_h;
              // set values in coords array

              plane.position.setFromCylindricalCoords(r, theta, y + 1.0);
              vector.x = plane.position.x * 2;
              vector.y = plane.position.y;
              vector.z = plane.position.z * 2;
              //vector.multiplyScalar(2);

              plane.lookAt(vector);

              /* vector.x = plane.position.x * 2;
            vector.y = plane.position.y;
            vector.z = plane.position.z * 2; */

              // add planes to pivot bc their position is relative to the pivot
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

            // when the last plane of a time span is reached, the old_h is updated
            // so that the next helix starts where the one before ended
            if (i == n - 1) {
              old_h += h;
            }
          }
        }
      });
    }

    /* 5.) Helper Functions for Map View */

    /**
     * @function setViewId
     * @desc Sets name of div with id="viewId" to the given name. Div is necessary to check which map view is currently displayed and to choose the according settings.
     * @param {string} viewName name of the current view: either "kugel", "sphere" or "helix"
     * @returns nothing
     */
    function setViewId(viewName) {
      // if there is no div with id "viewId" -> create dif
      if (!document.getElementById("viewId")) {
        const view = track(document.createElement("div"));
        view.id = "viewId";
        view.name = `${viewName}`;
        document.body.prepend(view);
        console.log("div 'viewName' created, name: ", viewName);
      }

      // if there already is a div, update its name
      else if (document.getElementById("viewId").name != viewName) {
        const view = document.getElementById("viewId");
        view.name = `${viewName}`;
        console.log("div 'viewName': name set to ", viewName);
      }
    }

    /**
     * @function makeClickable
     * @desc Makes objcts clickable by adding them to the targets.clickable array which communicates with the raycaster.
     * @param {*} obj Any object that should be clickable.
     * @param {isArray} boolean True if obj is an array of multiple objects.
     * @returns nothing
     */
    function makeClickable(obj, isArray) {
      // make list of all objects currently in the targets.clickable array
      let namesOfClickableObjects = [];
      targets.clickable.forEach((clickObj) => {
        namesOfClickableObjects.push(clickObj.name);
      });

      // check if obj is already included in the targets.clickable array, if not add it
      if (!namesOfClickableObjects.includes(obj.name)) {
        // if: obj = array -> loop
        // else: simply add to array of clickable objects
        if (isArray) {
          obj.forEach((o) => {
            targets.clickable.push(o);
          });
        } else {
          targets.clickable.push(obj);
        }
      }
    }

    /**
     * @function makePlane
     * @desc Creates a mesh of geometry type planeGeometry.
     * @param {color} [color=0xcc0000] Color of plane
     * @param {opacity} [opacity=0.7] Opacity of plane
     * @returns THREE.PlaneGeometry
     */
    function makePlane(color = 0xcc0000, opacity = 0.7) {
      const geometry = track(new THREE.PlaneGeometry(0.3, 0.3));
      // DoubleSide -> visisble and not visible sides of objects are rendered
      let material = track(
        new THREE.MeshBasicMaterial({
          color: color,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: opacity,
        })
      );
      const plane = track(new THREE.Mesh(geometry, material));
      return plane;
    }

    /**
     * @function makeKugel
     * @desc Creates a mesh of geometry type SphereGeometry.
     * @param {number} radius Radius of sphere
     * @returns THREE.SphereGeometry
     */
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

    /**
     * @function makeIdText
     * @desc Creates a text object containing the id of a given letter.
     * @param {Object<string,string>} letter Letter data object
     * @returns Text
     */
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

    /**
     * @function makeInitialsText
     * @desc Creates a text object containing the initials of the receiver of a given letter.
     * @param {Object<string,string>} letter Letter data object
     * @returns Text
     */
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

    /**
     * @function makeFirstNameText
     * @desc Creates a text object containing the first name of a receiver of a given letter.
     * @param {Object<string,string>} letter Letter data object
     * @returns Text
     */
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

    /**
     * @function makeLastNameText
     * @desc Creates a text object containing the last name of a receiver of a given letter.
     * @param {Object<string,string>} letter Letter data object
     * @returns Text
     */
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

    /**
     * @function makeDateText
     * @desc Creates a text object containing the date of a given letter.
     * @param {Object<string,string>} letter Letter data object
     * @returns Text
     */
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

    /**
     * @function makeYearMarker
     * @desc Creates a text object as yearMarker.
     * @param {string} year
     * @param {number} index
     * @returns Text
     */
    function makeYearMarker(year, index) {
      const yearMarker = track(new Text());
      yearMarker.name = `yearMarker${year}`;

      // Set content of text object (property "text")
      yearMarker.text = year;

      // Set styling properties of text object
      yearMarker.fontSize = 0.2;
      yearMarker.color = 0xffffff;

      // Set position of text object
      // distance of text objects to next text object above
      yearMarker.position.y += 1 + index * 2.5;

      // Update the rendering:
      yearMarker.sync();
      return yearMarker;
    }

    /**
     * @function makeLetterNumMarker
     * @desc Creates a text object representing the number of letters for a given place.
     * @param {number} letterCount number of letters for a given place
     * @returns Text
     */
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

    /**
     * @function correctPositionWiesbaden
     * @desc When creating the basemap, the placeMarker for Wiesbaden was not positioned directly on the map. This function corrects its position.
     * @returns nothing
     */
    function correctPositionWiesbaden() {
      scene.children
        .filter((i) => i.name == "Scene")[0]
        .children.filter((i) => i.name == "Wiesbaden")
        .forEach(
          (wiesbadenPlacemarker) => (wiesbadenPlacemarker.position.y = 3.8)
        );
    }

    /**
     * @function loopPlaceMarker
     * @desc Helper function to loop over a placeMarker. Executes a function for each placeMarker.
     * @param {requestCallback} functionForLoop Function to be executed within the loop
     * @param {string[]} yearArray Year range set by the time filter
     * @returns nothing
     */
    function loopPlaceMarker(functionForLoop, yearArray) {
      scene.children
        .filter((i) => i.name == "Scene")[0] // scene contains another group "scene" which contains all objects in the gltf file created in blender (Karte und Ortsmarker)
        .children.filter(
          (i) =>
            ["Frankfurt", "Darmstadt", "Wiesbaden", "Worms"].includes(i.name) // temporary! filters which objects (Ortsmarker) from the scene group should be included
        )
        .forEach((placeMarker) => {
          // function with code that should be executed in the loop for each placeMarker
          // functionForLoop must have argument "placeMarker"
          functionForLoop(placeMarker, yearArray);
        });
    }

    /**
     * @function loopYearMarker
     * @desc Helper function to loop over a yearMarker. Executes a function for each yearMarker.
     * @param {requestCallback} functionForLoop Function to be executed within the loop
     * @param {string[]} yearArray Year range set by the time filter
     * @returns nothing
     */
    function loopYearMarker(functionForLoop, yearArray) {
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
            yearArray.forEach((year, index) => {
              // function with code that should be executed in the loop for each yearMarker
              // function for loop needs arguments "placeMarker, city, year, index"
              functionForLoop(placeMarker, city, year, index);
            });
          } catch (error) {
            console.log(error);
          }
        });
    }

    /* 6.) Helper functions for Filter */

    /**
     * @function removeContentOfInfobox
     * @desc Removes children of infobox div, i.e. removes the content of the infobox. This function is needed whenever the infobox should be updated.
     * @returns nothing
     */
    function removeContentOfInfobox() {
      const parent = document.getElementById("infobox");

      // removes last child until there are no more children
      while (parent.lastChild) {
        parent.removeChild(parent.lastChild);
      }
    }

    /**
     * @function getCurrentPlanesOnScene
     * @desc Goes through entire scene and makes an array of all the planes currently on the scene. Important: Not the curently visible planes. This function collects all the planes - visible and hidden.
     * @returns Mesh[]
     */
    function getCurrentPlanesOnScene() {
      // currentPlanes on scene includes visible as well as hidden planes!
      let currentPlanesOnScene = [];
      scene.children
        .filter((i) => i.name == "Scene")[0] // scene contains another group "scene" which contains all objects in the gltf file created in blender (Karte und Ortsmarker)
        .children.filter(
          (i) =>
            ["Frankfurt", "Darmstadt", "Wiesbaden", "Worms"].includes(i.name) // temporary! filters which objects (Ortsmarker) from the scene group should be included
        )
        .forEach((place) => {
          // the scenegraph is different in sphere and helix view -> need to be treated separately
          // sphäre
          if (document.getElementById("viewId").name == "sphere") {
            place.children.forEach((yearMarker) => {
              yearMarker.children.forEach((plane) => {
                currentPlanesOnScene.push(plane);
              });
            });
          }
          // helix
          if (document.getElementById("viewId").name == "helix") {
            // children can be yearMarker or letter planes, make sure only letter planes are added to the array by testing for "GB" at start of name
            place.children.forEach((child) => {
              if (child.name.startsWith("GB")) {
                currentPlanesOnScene.push(child);
              }
            });
          }
        });
      //console.log("Array aller Planes: ");
      //console.log(currentPlanesOnScene);
      return currentPlanesOnScene;
    }

    /**
     * @function getCurrentlyVisiblePlanesOnScene
     * @desc Goes through entire scene and makes an array of all the planes currently visible on the scene. Only the visible ones.
     * @returns Mesh[]
     */
    function getCurrentlyVisiblePlanesOnScene() {
      console.log("Scene 1: ", scene);
      let currentlyVisiblePlanesOnScene = [];
      console.log("log gltf scene", scene.children[4]);
      scene.children
        .filter((i) => i.name == "Scene")[0] // scene contains another group "scene" which contains all objects in the gltf file created in blender (Karte und Ortsmarker)
        .children.filter(
          (i) =>
            ["Frankfurt", "Darmstadt", "Wiesbaden", "Worms"].includes(i.name) // temporary! filters which objects (Ortsmarker) from the scene group should be included
        )
        .forEach((place) => {
          // the scenegraph is different in sphere and helix view -> need to be treated separately
          // sphäre
          if (document.getElementById("viewId").name == "sphere") {
            place.children.forEach((yearMarker) => {
              if (yearMarker.children != undefined) {
                yearMarker.children.forEach((plane) => {
                  if (plane.visible == true) {
                    currentlyVisiblePlanesOnScene.push(plane);
                  }
                });
              }
            });
          }
          // helix
          if (document.getElementById("viewId").name == "helix") {
            // children can be yearMarker or letter planes, make sure only letter planes are added to the array by testing for "GB" at start of name
            place.children.forEach((child) => {
              if (child.name.startsWith("GB")) {
                if (child.visible == true) {
                  currentlyVisiblePlanesOnScene.push(child);
                }
              }
            });
          }
        });
      //console.log("Array aller Planes: ");
      //console.log(currentlyVisiblePlanesOnScene);
      return currentlyVisiblePlanesOnScene;
    }

    /**
     * @function getIdsOfPlanes
     * @desc Takes an array of planes and returns all the ids associated to these planes.
     * @param {Mesh[]} planeArray Array of planes
     * @returns string[]
     */
    function getIdsOfPlanes(planeArray) {
      let idsOfPlanes = [];
      planeArray.forEach((plane) => {
        idsOfPlanes.push(plane.name);
      });
      //console.log("Liste der Ids:");
      //console.log(idsOfCurrentPlanesOnScene);
      return idsOfPlanes;
    }

    /**
     * @function getletterDataOfPlanes
     * @desc Takes an array of ids and gets all the letter data associated to these ids.
     * @param {string[]} idsOfLetters Array of ids
     * @returns Object.<string, string>
     */
    function getletterDataOfPlanes(idsOfLetters) {
      let letterDataArray = [];

      // find letters currently visivle in scene and put them into the array
      Object.values(data).forEach((place) => {
        Object.values(place).forEach((year) => {
          for (let i = 0; i < year.length; i++) {
            if (idsOfLetters.includes(year[i].id)) {
              letterDataArray.push(year[i]);
              //console.log("letterData of planes", letterDataArray);
            }
          }
        });
      });

      return letterDataArray;
    }

    /**
     * @function changePlaneColor
     * @desc Changes color of a given plane.
     * @param {Mesh[]} currentPlanesOnScene Array of all planes currently on scene (visible and hidden)
     * @param {string} id Id of the plane which should be recolored.
     * @param {color} color Color (hexcode)
     * @returns nothing
     */
    function changePlaneColor(currentPlanesOnScene, id, color) {
      // get plane associated with the current id
      let currPlane = currentPlanesOnScene.find((plane) => plane.name == id);
      // change color of the plane (must use set method!!!)
      currPlane.material.color.set(color);
    }

    /**
     * @function hidePlane
     * @desc Hides a given plane.
     * @param {Mesh[]} currentPlanesOnScene Array of all planes currently on scene (visible and hidden)
     * @param {string} id Id of the plane which should be hidden.
     * @returns nothing
     */
    function hidePlane(currentPlanesOnScene, id) {
      // get plane associated with the current id
      let currPlane = currentPlanesOnScene.find((plane) => plane.name == id);
      currPlane.visible = false;
      console.log("plane hidden");
    }

    /**
     * @function showPlane
     * @desc Shows a given plane after it has been hidden.
     * @param {Mesh[]} currentPlanesOnScene Array of all planes currently on scene (visible and hidden)
     * @param {string} id Id of the plane which should be shown.
     * @returns nothing
     */ function showPlane(currentPlanesOnScene, id) {
      // get plane associated with the current id
      let currPlane = currentPlanesOnScene.find((plane) => plane.name == id);
      currPlane.visible = true;
      console.log("plane shown");
    }

    /**
     * @function getCheckboxGenderState
     * @desc Checks whether the following checkboxes are checked: male, female, other. Creates an objects that contains the individual states but also a string of booleans representing the state of all these checkboxes: male-female-other. E.g. true-false-false = only male checkbox checked.
     * @param {type} paramName Parameter description.
     * @returns state object
     */
    function getCheckboxGenderState() {
      let state = {
        male: $(".male").is(":checked"),
        female: $(".female").is(":checked"),
        other: $(".other").is(":checked"),
        string: `${$(".male").is(":checked")}-${$(".female").is(
          ":checked"
        )}-${$(".other").is(":checked")}`,
      };
      return state;
    }

    /**
     * @function genderFilter
     * @desc Implements the functionalities of the gender filter. Chooses the functionality based on the state of the three gender checkboxes.
     * @returns nothing
     */
    function genderFilter() {
      let state = getCheckboxGenderState();

      if ($(".filter").is(":checked")) {
        let currentPlanesOnScene = getCurrentPlanesOnScene();
        // get array of all the ids of the planes
        let idsOfcurrentPlanesOnScene = getIdsOfPlanes(currentPlanesOnScene);

        let lettersCurrentlyOnScene = getletterDataOfPlanes(
          idsOfcurrentPlanesOnScene
        );
        console.log("planes", currentPlanesOnScene);

        switch (state.string) {
          // state.string: male-female-other
          // alles gecheckt
          case "true-true-true":
            // shows objects if hidden
            for (let i = 0; i < currentPlanesOnScene.length; i++) {
              showPlane(currentPlanesOnScene, lettersCurrentlyOnScene[i].id);
            }
            // update infobox content
            makeInfoBox();

            break;
          // nichts gecheckt
          case "false-false-false":
            // hides object if visible
            for (let i = 0; i < currentPlanesOnScene.length; i++) {
              hidePlane(currentPlanesOnScene, lettersCurrentlyOnScene[i].id);
            }
            // update infobox content
            makeInfoBox();
            break;

          // nur male geckeckt
          case "true-false-false":
            for (let i = 0; i < lettersCurrentlyOnScene.length; i++) {
              // hides all letters with non-male receivers
              if (lettersCurrentlyOnScene[i].receiverGender != "Männlich") {
                //console.log(i, "männlich");
                hidePlane(currentPlanesOnScene, lettersCurrentlyOnScene[i].id);
              } else {
                showPlane(currentPlanesOnScene, lettersCurrentlyOnScene[i].id);
              }
            }
            // update infobox content
            makeInfoBox();
            break;
          // nur female gecheckt
          case "false-true-false":
            for (let i = 0; i < lettersCurrentlyOnScene.length; i++) {
              // hides all letters with non-female receivers
              if (lettersCurrentlyOnScene[i].receiverGender != "Weiblich") {
                //console.log(i, "männlich");
                hidePlane(currentPlanesOnScene, lettersCurrentlyOnScene[i].id);
              } else {
                showPlane(currentPlanesOnScene, lettersCurrentlyOnScene[i].id);
              }
            }
            // update infobox content
            makeInfoBox();
            break;
          // nur other gecheckt
          case "false-false-true":
            for (let i = 0; i < lettersCurrentlyOnScene.length; i++) {
              // hides all letters with non-other receivers
              if (lettersCurrentlyOnScene[i].receiverGender != "Keine Info") {
                //console.log(i, "männlich");
                hidePlane(currentPlanesOnScene, lettersCurrentlyOnScene[i].id);
              } else {
                showPlane(currentPlanesOnScene, lettersCurrentlyOnScene[i].id);
              }
            }
            // update infobox content
            makeInfoBox();
            break;

          // male und female gecheckt
          case "true-true-false":
            for (let i = 0; i < lettersCurrentlyOnScene.length; i++) {
              // hides all letters with non-male receivers
              if (lettersCurrentlyOnScene[i].receiverGender == "Keine Info") {
                //console.log(i, "männlich");
                hidePlane(currentPlanesOnScene, lettersCurrentlyOnScene[i].id);
              } else {
                showPlane(currentPlanesOnScene, lettersCurrentlyOnScene[i].id);
              }
            }
            // update infobox content
            makeInfoBox();
            break;
          // male und other gecheckt
          case "true-false-true":
            for (let i = 0; i < lettersCurrentlyOnScene.length; i++) {
              // hides all letters with non-male receivers
              if (lettersCurrentlyOnScene[i].receiverGender == "Weiblich") {
                //console.log(i, "männlich");
                hidePlane(currentPlanesOnScene, lettersCurrentlyOnScene[i].id);
              } else {
                showPlane(currentPlanesOnScene, lettersCurrentlyOnScene[i].id);
              }
            }
            // update infobox content
            makeInfoBox();
            break;
          // female und other
          case "false-true-true":
            for (let i = 0; i < lettersCurrentlyOnScene.length; i++) {
              // hides all letters with non-male receivers
              if (lettersCurrentlyOnScene[i].receiverGender == "Männlich") {
                //console.log(i, "männlich");
                hidePlane(currentPlanesOnScene, lettersCurrentlyOnScene[i].id);
              } else {
                showPlane(currentPlanesOnScene, lettersCurrentlyOnScene[i].id);
              }
            }
            // update infobox content
            makeInfoBox();
            break;
          default:
            console.log("Error!");
            break;
        }
      } else {
        // else = if filter mode is not active, only color highlighting
        //update infobox
        makeInfoBox();
      }
    }

    /**
     * Filter controls
     */

    /** Slider: Time filter */

    // get year range from start and end date
    function range(start, end) {
      console.log(start, end);
      let yearArray = [];
      let s = parseInt(start);
      let en = parseInt(end);
      for (let i = s, e = en; i <= e; i++) {
        yearArray.push(i.toString());
      }
      // console.log(yearArray);
      return yearArray;
    }

    // what happens when slider is used
    $(function () {
      $("#slider-range").slider({
        range: true,
        min: 1764,
        max: 1772,
        values: [1764, 1772],
        slide: function slide(event, ui) {
          $("#amount").val("" + ui.values[0] + " – " + ui.values[1]);
          console.log("Keep sliding");

          // bulid new view based on slider settings
          // which view is buit depends on the viewId

          /* KUGEL */
          // console.log(document.getElementById("viewId").name);
          if (document.getElementById("viewId").name == "kugel") {
            clearCanvas();

            timeFilterRange = range(ui.values[0], ui.values[1]);

            mapViewKugeln(timeFilterRange);
          }

          /* SPHERE */
          if (document.getElementById("viewId").name == "sphere") {
            clearCanvas();

            // remove infobox
            removeContentOfInfobox();

            timeFilterRange = range(ui.values[0], ui.values[1]);

            mapViewSpheres(timeFilterRange);
          }

          /* HELIX */
          if (document.getElementById("viewId").name == "helix") {
            clearCanvas();

            // remove infobox
            removeContentOfInfobox();

            timeFilterRange = range(ui.values[0], ui.values[1]);

            mapViewHelix(timeFilterRange);
          }
        },
      });

      $("#amount").val(
        "" +
          $("#slider-range").slider("values", 0) +
          " – " +
          $("#slider-range").slider("values", 1)
      );
    });

    /* Letter Status Filter */

    /* 1.) Color Highlighting */

    // SENT
    $(".sent").change(function () {
      // sets plane color of sent letters to 'darckorchid' if checkbox is checked
      if ($(this).is(":checked")) {
        // get array of all planes currently on the scene
        let currentPlanesOnScene = getCurrentPlanesOnScene();
        // get array of all the ids of the planes
        let idsOfCurrentPlanesOnScene = getIdsOfPlanes(currentPlanesOnScene);
        // loop over ids and determine if letter has status sent/received by end of idString (r or s)
        idsOfCurrentPlanesOnScene.forEach((id) => {
          if (id.endsWith("s")) {
            changePlaneColor(currentPlanesOnScene, id, 0x9932cc);
          }
        });
      } else {
        // sets plane color of sent letters back to red if checkbox is unchecked
        let currentPlanesOnScene = getCurrentPlanesOnScene();

        let idsOfCurrentPlanesOnScene = getIdsOfPlanes(currentPlanesOnScene);

        idsOfCurrentPlanesOnScene.forEach((id) => {
          if (id.endsWith("s")) {
            changePlaneColor(currentPlanesOnScene, id, 0xcc0000);
          }
        });
      }
    });

    // RECEIVED
    $(".received").change(function () {
      // sets plane color of received letters to 'plum' if checkbox is checked
      if ($(this).is(":checked")) {
        // get array of all planes currently on the scene
        let currentPlanesOnScene = getCurrentPlanesOnScene();
        // get array of all the ids of the planes
        let idsOfCurrentPlanesOnScene = getIdsOfPlanes(currentPlanesOnScene);
        // loop over ids and determine if letter has status sent/received by end of idString (r or s)
        idsOfCurrentPlanesOnScene.forEach((id) => {
          if (id.endsWith("r")) {
            changePlaneColor(currentPlanesOnScene, id, 0xdda0dd);
          }
        });
      } else {
        // sets plane color of received letters back to red if checkbox is unchecked
        let currentPlanesOnScene = getCurrentPlanesOnScene();

        let idsOfCurrentPlanesOnScene = getIdsOfPlanes(currentPlanesOnScene);

        idsOfCurrentPlanesOnScene.forEach((id) => {
          if (id.endsWith("r")) {
            changePlaneColor(currentPlanesOnScene, id, 0xcc0000);
          }
        });
      }
    });

    /* 2.) Filter Mode */

    // SENT
    $(".sent").change(function () {
      // remove content of infobox
      removeContentOfInfobox();

      // hides planes of sent letters if sent-checkbox is checked and Filter-Mode-box is also checked
      if ($(this).is(":checked") && $(".filter").is(":checked")) {
        // get array of all planes currently on the scene
        let currentPlanesOnScene = getCurrentPlanesOnScene();
        // get array of all the ids of the planes
        let idsOfCurrentPlanesOnScene = getIdsOfPlanes(currentPlanesOnScene);
        // loop over ids and determine if letter has status sent/received by end of idString (r or s)
        idsOfCurrentPlanesOnScene.forEach((id) => {
          if (!id.endsWith("s")) {
            hidePlane(currentPlanesOnScene, id);
          }
        });
      } else {
        // shows planes again once the sent-box is unchecked
        let currentPlanesOnScene = getCurrentPlanesOnScene();

        let idsOfCurrentPlanesOnScene = getIdsOfPlanes(currentPlanesOnScene);

        idsOfCurrentPlanesOnScene.forEach((id) => {
          if (!id.endsWith("s")) {
            showPlane(currentPlanesOnScene, id);
          }
        });
      }
      // update infobox content
      makeInfoBox();
    });

    // RECEIVED
    // hides planes of received letters if received-checkbox is checked and Filter-Mode-box is also checked
    $(".received").change(function () {
      // remove content of infobox
      removeContentOfInfobox();

      if ($(this).is(":checked") && $(".filter").is(":checked")) {
        // get array of all planes currently on the scene
        let currentPlanesOnScene = getCurrentPlanesOnScene();
        // get array of all the ids of the planes
        let idsOfCurrentPlanesOnScene = getIdsOfPlanes(currentPlanesOnScene);
        // loop over ids and determine if letter has status sent/received by end of idString (r or s)
        idsOfCurrentPlanesOnScene.forEach((id) => {
          if (!id.endsWith("r")) {
            hidePlane(currentPlanesOnScene, id);
          }
        });
      } else {
        // shows planes again once the received-box is unchecked
        let currentPlanesOnScene = getCurrentPlanesOnScene();

        let idsOfCurrentPlanesOnScene = getIdsOfPlanes(currentPlanesOnScene);

        idsOfCurrentPlanesOnScene.forEach((id) => {
          if (!id.endsWith("r")) {
            showPlane(currentPlanesOnScene, id);
          }
        });
      }
      // update infobox content
      makeInfoBox();
    });

    /* Document Type Filter */

    /* 1.) Color Highlighting */

    // LETTERS
    $(".goetheletter").change(function () {
      // sets plane color to 'red' if checkbox is checked and doctype is goetheletter
      if ($(this).is(":checked")) {
        // get array of all planes currently on the scene
        let currentPlanesOnScene = getCurrentPlanesOnScene();
        // get array of all the ids of the planes
        let idsOfCurrentPlanesOnScene = getIdsOfPlanes(currentPlanesOnScene);
        // loop over ids and determine if document is letter
        idsOfCurrentPlanesOnScene.forEach((id) => {
          if (id.startsWith("GB")) {
            changePlaneColor(currentPlanesOnScene, id, 0xcc0000);
          }
        });
      } else {
        // sets plane color to default color if checkbox is unchecked and doctype is goetheletter
        let currentPlanesOnScene = getCurrentPlanesOnScene();

        let idsOfCurrentPlanesOnScene = getIdsOfPlanes(currentPlanesOnScene);

        idsOfCurrentPlanesOnScene.forEach((id) => {
          if (id.startsWith("GB")) {
            changePlaneColor(currentPlanesOnScene, id, 0xcc0000);
          }
        });
      }
    });

    // DIARIES
    $(".goethediary").change(function () {
      // sets plane color to blue if checkbox is checked and doctype is goethediary
      if ($(this).is(":checked")) {
        // get array of all planes currently on the scene
        let currentPlanesOnScene = getCurrentPlanesOnScene();
        // get array of all the ids of the planes
        let idsOfCurrentPlanesOnScene = getIdsOfPlanes(currentPlanesOnScene);
        // loop over ids and determine if document is diary
        idsOfCurrentPlanesOnScene.forEach((id) => {
          if (id.startsWith("GT")) {
            changePlaneColor(currentPlanesOnScene, id, 0xcbe7f9);
          }
        });
      } else {
        // sets plane color to default color if checkbox is unchecked and doctype is goethediary
        let currentPlanesOnScene = getCurrentPlanesOnScene();

        let idsOfCurrentPlanesOnScene = getIdsOfPlanes(currentPlanesOnScene);

        idsOfCurrentPlanesOnScene.forEach((id) => {
          if (id.startsWith("GT")) {
            changePlaneColor(currentPlanesOnScene, id, 0xcc0000);
          }
        });
      }
    });

    /* 2.) Filter Mode */

    // LETTERS
    $(".goetheletter").change(function () {
      // remove content of infobox
      removeContentOfInfobox();

      // hides planes that are not letters if box is checked
      if ($(this).is(":checked") && $(".filter").is(":checked")) {
        // get array of all planes currently on the scene
        let currentPlanesOnScene = getCurrentPlanesOnScene();
        // get array of all the ids of the planes
        let idsOfCurrentPlanesOnScene = getIdsOfPlanes(currentPlanesOnScene);
        // loop over ids and determine if document is letter
        idsOfCurrentPlanesOnScene.forEach((id) => {
          if (!id.startsWith("GB")) {
            // hides planes that are not letters if box is checked
            hidePlane(currentPlanesOnScene, id);
          } else {
            // make the letter planes appear again, if no planes are visible (bc of other filters) and the box is then again checked
            showPlane(currentPlanesOnScene, id);
          }
        });
      } else {
        // special case: planes stay visible also when box is unchecked
        let currentPlanesOnScene = getCurrentPlanesOnScene();

        let idsOfCurrentPlanesOnScene = getIdsOfPlanes(currentPlanesOnScene);

        idsOfCurrentPlanesOnScene.forEach((id) => {
          if (!id.startsWith("GB")) {
            showPlane(currentPlanesOnScene, id);
          }
        });
      }
      // update infobox content
      makeInfoBox();
    });

    // DIARIES
    $(".goethediary").change(function () {
      // remove content of infobox
      removeContentOfInfobox();

      // hides diary planes if diary-box and filter-mode-box are checked
      if ($(this).is(":checked") && $(".filter").is(":checked")) {
        // get array of all planes currently on the scene
        let currentPlanesOnScene = getCurrentPlanesOnScene();
        // get array of all the ids of the planes
        let idsOfCurrentPlanesOnScene = getIdsOfPlanes(currentPlanesOnScene);
        // loop over ids and determine if document is diary
        idsOfCurrentPlanesOnScene.forEach((id) => {
          if (!id.startsWith("GT")) {
            hidePlane(currentPlanesOnScene, id);
          }
        });
      } else {
        // shows planes again once diary-box is unchecked
        let currentPlanesOnScene = getCurrentPlanesOnScene();

        let idsOfCurrentPlanesOnScene = getIdsOfPlanes(currentPlanesOnScene);

        idsOfCurrentPlanesOnScene.forEach((id) => {
          if (!id.startsWith("GT")) {
            showPlane(currentPlanesOnScene, id);
          }
        });
      }
      // update infobox content
      makeInfoBox();
    });

    /* Gender Filter */

    /* 1.) Color Hightlighting */

    // MALE
    $(".male").change(function () {
      // CHECKED
      // sets plane color of letters with male receiver to grey if checkbox is checked
      if ($(this).is(":checked")) {
        // get array of all planes currently on the scene
        let currentPlanesOnScene = getCurrentPlanesOnScene();
        // get array of all the ids of the planes
        let idsOfCurrentPlanesOnScene = getIdsOfPlanes(currentPlanesOnScene);

        let letterDataArray = getletterDataOfPlanes(idsOfCurrentPlanesOnScene);

        for (let i = 0; i < letterDataArray.length; i++) {
          if (letterDataArray[i].receiverGender == "Männlich") {
            //console.log(i, "männlich");
            changePlaneColor(
              currentPlanesOnScene,
              letterDataArray[i].id,
              0x808080
            );
          }
        }
      }

      // UNCHECKED
      if (!$(this).is(":checked")) {
        // get array of all planes currently on the scene
        let currentPlanesOnScene = getCurrentPlanesOnScene();
        // get array of all the ids of the planes
        let idsOfCurrentPlanesOnScene = getIdsOfPlanes(currentPlanesOnScene);

        let letterDataArray = getletterDataOfPlanes(idsOfCurrentPlanesOnScene);

        for (let i = 0; i < letterDataArray.length; i++) {
          if (letterDataArray[i].receiverGender == "Männlich") {
            //console.log(i, "männlich");
            changePlaneColor(
              currentPlanesOnScene,
              letterDataArray[i].id,
              // default color
              0xcc0000
            );
          }
        }
      }
    });

    // FEMALE
    $(".female").change(function () {
      // CHECKED
      // sets plane color of letters with female receiver to oange if checkbox is checked
      if ($(this).is(":checked")) {
        // get array of all planes currently on the scene
        let currentPlanesOnScene = getCurrentPlanesOnScene();
        // get array of all the ids of the planes
        let idsOfCurrentPlanesOnScene = getIdsOfPlanes(currentPlanesOnScene);

        let letterDataArray = getletterDataOfPlanes(idsOfCurrentPlanesOnScene);

        // count number of female recipients
        let femaleCounter = 0;

        for (let i = 0; i < letterDataArray.length; i++) {
          if (letterDataArray[i].receiverGender == "Weiblich") {
            //console.log(i, "weiblich");
            changePlaneColor(
              currentPlanesOnScene,
              letterDataArray[i].id,
              0xffa500
            );
            femaleCounter++;
          }
        }
      }

      // UNCHECKED
      if (!$(this).is(":checked")) {
        // get array of all planes currently on the scene
        let currentPlanesOnScene = getCurrentPlanesOnScene();
        // get array of all the ids of the planes
        let idsOfCurrentPlanesOnScene = getIdsOfPlanes(currentPlanesOnScene);

        let letterDataArray = getletterDataOfPlanes(idsOfCurrentPlanesOnScene);

        for (let i = 0; i < letterDataArray.length; i++) {
          if (letterDataArray[i].receiverGender == "Weiblich") {
            //console.log(i, "weiblich");
            changePlaneColor(
              currentPlanesOnScene,
              letterDataArray[i].id,
              // default color
              0xcc0000
            );
          }
        }
      }
    });

    // OTHER / UNKNOWN
    $(".other").change(function () {
      // CHECKED
      // sets plane color of letters with unknown receiver to transparent if checkbox is checked
      if ($(this).is(":checked")) {
        // get array of all planes currently on the scene
        let currentPlanesOnScene = getCurrentPlanesOnScene();
        // get array of all the ids of the planes
        let idsOfCurrentPlanesOnScene = getIdsOfPlanes(currentPlanesOnScene);

        let letterDataArray = getletterDataOfPlanes(idsOfCurrentPlanesOnScene);

        // count number of female recipients
        let otherCounter = 0;

        for (let i = 0; i < letterDataArray.length; i++) {
          if (letterDataArray[i].receiverGender == "Keine Info") {
            //console.log(i, "Keine Info");
            changePlaneColor(
              currentPlanesOnScene,
              letterDataArray[i].id,
              0x000000
            );
            otherCounter++;
          }
        }
      }

      // UNCHECKED
      if (!$(this).is(":checked")) {
        // get array of all planes currently on the scene
        let currentPlanesOnScene = getCurrentPlanesOnScene();
        // get array of all the ids of the planes
        let idsOfCurrentPlanesOnScene = getIdsOfPlanes(currentPlanesOnScene);

        let letterDataArray = getletterDataOfPlanes(idsOfCurrentPlanesOnScene);

        for (let i = 0; i < letterDataArray.length; i++) {
          if (letterDataArray[i].receiverGender == "Keine Info") {
            //console.log(i, "Keine Info");
            changePlaneColor(
              currentPlanesOnScene,
              letterDataArray[i].id,
              // default color
              0xcc0000
            );
          }
        }
      }
    });

    /* 2.) Filter Mode */

    // MALE
    $(".male").change(function () {
      // remove content of infobox
      removeContentOfInfobox();

      genderFilter();
    });

    // FEMALE
    $(".female").change(function () {
      // remove content of infobox
      removeContentOfInfobox();

      genderFilter();
    });

    // OTHER
    $(".other").change(function () {
      // remove content of infobox
      removeContentOfInfobox();

      genderFilter();
    });

    /**
     * Infobox
     */

    /**
     * @function getLetterDataOfPlanesCurrentlyVisibleOnScene
     * @desc This functions returns the data of the letters associated to all the planes currently visible on the scene.
     * @returns Object.<string,string>[]
     */
    function getLetterDataOfPlanesCurrentlyVisibleOnScene() {
      let currentlyVisiblePlanesOnScene = getCurrentlyVisiblePlanesOnScene();
      let idsOfCurrentPlanesOnScene = getIdsOfPlanes(
        currentlyVisiblePlanesOnScene
      );
      let letterDataOfCurrentlyVisiblePlanesOnScene = getletterDataOfPlanes(
        idsOfCurrentPlanesOnScene
      );
      console.log("letters visible", letterDataOfCurrentlyVisiblePlanesOnScene);
      return letterDataOfCurrentlyVisiblePlanesOnScene;
    }

    /**
     * @function getNumLetters
     * @desc This function returns how many letters are currently visible on the scene.
     * @returns number
     */
    function getNumLetters() {
      const lettersCurrentlyOnScene =
        getLetterDataOfPlanesCurrentlyVisibleOnScene();
      let numLetters = lettersCurrentlyOnScene.length;
      return numLetters;
    }

    /**
     * @function getNumSent
     * @desc This function returns how many letters with status "sent" are currently visible on the scene.
     * @returns number
     */
    function getNumSent() {
      const lettersCurrentlyOnScene =
        getLetterDataOfPlanesCurrentlyVisibleOnScene();
      let numSent = 0;
      lettersCurrentlyOnScene.forEach((letter) => {
        if (letter.id.endsWith("s")) {
          numSent++;
        }
      });
      return numSent;
    }

    /**
     * @function getNumReceived
     * @desc This function returns how many letters with status "received" are currently visible on the scene.
     * @returns number
     */
    function getNumReceived() {
      const lettersCurrentlyOnScene =
        getLetterDataOfPlanesCurrentlyVisibleOnScene();
      let numReceived = 0;
      lettersCurrentlyOnScene.forEach((letter) => {
        if (letter.id.endsWith("r")) {
          numReceived++;
        }
      });
      return numReceived;
    }

    /**
     * @function getNumFemale
     * @desc This function returns how many letters with gender of receiver "female" are currently visible on the scene.
     * @returns number
     */
    function getNumFemale() {
      const lettersCurrentlyOnScene =
        getLetterDataOfPlanesCurrentlyVisibleOnScene();
      let numFemale = 0;
      lettersCurrentlyOnScene.forEach((letter) => {
        if (letter.receiverGender == "Weiblich") {
          numFemale++;
        }
      });
      return numFemale;
    }

    /**
     * @function getNumMale
     * @desc This function returns how many letters with gender of receiver "male" are currently visible on the scene.
     * @returns number
     */
    function getNumMale() {
      const lettersCurrentlyOnScene =
        getLetterDataOfPlanesCurrentlyVisibleOnScene();
      let numMale = 0;
      lettersCurrentlyOnScene.forEach((letter) => {
        if (letter.receiverGender == "Männlich") {
          numMale++;
        }
      });
      return numMale;
    }

    /**
     * @function getNumOther
     * @desc This function returns how many letters with gender of receiver "Keine Info"/other are currently visible on the scene.
     * @returns number
     */
    function getNumOther() {
      const lettersCurrentlyOnScene =
        getLetterDataOfPlanesCurrentlyVisibleOnScene();
      let numOther = 0;
      lettersCurrentlyOnScene.forEach((letter) => {
        if (letter.receiverGender == "Keine Info") {
          numOther++;
        }
      });
      return numOther;
    }

    /**
     * @function makeInfoBox
     * @desc Creates the p-Tags with the content of the infobox.
     * @returns nothing
     */
    function makeInfoBox() {
      const numLetters = getNumLetters();
      const numSent = getNumSent();
      const numReceived = getNumReceived();
      const numFemale = getNumFemale();
      const numMale = getNumMale();
      const numOther = getNumOther();

      // make p elements
      const pNumLetters = document.createElement("p");
      pNumLetters.textContent = `${numLetters} Briefe Goethes werden angezeigt`;

      const pNumSent = document.createElement("p");
      pNumSent.textContent = `${numSent} gesesendet`;

      const pNumReceived = document.createElement("p");
      pNumReceived.textContent = `${numReceived} empfangen`;

      const pNumFemale = document.createElement("p");
      pNumFemale.textContent = `${numFemale} Adressat:innen mit Geschlecht "weiblich"`;

      const pNumMale = document.createElement("p");
      pNumMale.textContent = `${numMale} Adressat:innen mit Geschlecht "männlich"`;

      const pNumOther = document.createElement("p");
      pNumOther.textContent = `${numOther} Adressat:innen mit Geschlecht "andere/unbekannt"`;

      const infobox = document.getElementById("infobox");
      infobox.appendChild(pNumLetters);
      infobox.appendChild(pNumSent);
      infobox.appendChild(pNumReceived);
      infobox.appendChild(pNumFemale);
      infobox.appendChild(pNumMale);
      infobox.appendChild(pNumOther);
    }

    /*
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

    /*
     * Axes Helper (Scene)
     */

    /* const axesHelperScene = new THREE.AxesHelper( 30 );
  scene.add( axesHelperScene ); */

    /*
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

    /*
     * Helper geos for lights
     */

    // creates a geometric form that represents the light so you know where exactly the light is
    // there is a helper for every kind of light
    const pointLighthelper = new THREE.PointLightHelper(pointLight, 1);
    scene.add(pointLighthelper);
    //const pointLight2helper = new THREE.PointLightHelper(pointLight2, 1);
    //scene.add(pointLight2helper);

    /*
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

    /*
     * Debug GUI
     */
    //const gui = new dat.GUI();
    // must be wider than default, so that also long labels are visible e.g. "y_GB01 Nr.EB013"
    //gui.width = 310;

    // Set GUI folders
    /* const cameraGui = gui.addFolder("Camera");
    const light = gui.addFolder("Light");
    /* const idTextGui = gui.addFolder("idText");
    const initialsGui = gui.addFolder("initials");
    const firstNameGui = gui.addFolder("firstname");
    const lastNameGui = gui.addFolder("lastname");
    const dateGui = gui.addFolder("date");
    const letterNumMarkerGui = gui.addFolder("letterNumMarker"); */

    // Set Debug GUI
    /* light.add(pointLight.position, "y").min(-10).max(100).step(0.01);
    light.add(pointLight.position, "x").min(-10).max(10).step(0.01);
    light.add(pointLight.position, "z").min(-10).max(10).step(0.01);
    light.add(pointLight, "intensity").min(0).max(15).step(0.01);
    light.addColor(pointLightColor, "color").onChange(() => {
      pointLight.color.set(pointLightColor.color);
    });
 */
    /*
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
    camera.position.x = 25;
    camera.position.y = 25;
    camera.position.z = 100;
    camera.zoom = 25;
    camera.updateProjectionMatrix();
    scene.add(camera);

    /*
     * Controls
     */

    let controls = new OrbitControls(camera, canvas);
    //controls.enableDamping = true;

    /*
     * Mouse interaction and Raycasting
     */

    // saves mouse coordinates
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

    // update mouse coordinates according to mouse position on screen
    document.addEventListener("mousemove", (e) => {
      mousemove.mouseX = e.clientX - mousemove.windowHalfX;
      mousemove.mouseY = e.clientY - mousemove.windowHalfY;
      // raycaster needs a normalized coordinate system based on coordinates of mouse pointer
      // raycaster is newly set within each animation loop according to the updated mouse coordinates (see below)
      // division by innerWidth/innerHeight and multiplication with 2-1/2+1 turns x and y into values between -1 and 1
      mousemove.normalizedMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mousemove.normalizedMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    // Raycast only activated on mousclick
    document.addEventListener("click", (e) => {
      // raycaster returns an array (intersects) of objects which have been hit by the ray

      console.log("targets clickable", targets.clickable);
      let intersects = raycaster.intersectObjects(targets.clickable);

      // if intersects.length = 0, no objects were hit
      // if (length > 0), "Klick" plus the object(s) which have been hit are logged
      if (intersects.length > 0) {
        // log clicks
        let clickedObj = intersects[0].object;
        console.log("Klick ", clickedObj);

        /* Define click events for different objects*/

        // click on plane
        // only for testing
        if (clickedObj.geometry.type == "PlaneGeometry") {
          console.log("Briefelement angeklickt");
        }

        // click on id -> link to platform
        if (clickedObj.name.includes("GB01 Nr.")) {
          // opens new tab with example letter
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
              // loop over array with letter data
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

        // click on placeMarker -> Wechsel zu Einzelansicht
        if (Object.keys(data).includes(clickedObj.name)) {
          /* clickedObj.onclick = () => { */
          // clear canvas
          //clearCanvas();
          const placeName = clickedObj.name;
          window.open(`./single.html#${placeName}`);
          console.log("Klick auf Ortsmarker!");
        }
      } else {
        console.log("No intersections.");
      }
    });

    // Raycast-event for mousedown or mouseup (not active here)
    document.addEventListener("mousedown", (e) => {
      // der Raycaster gibt ein Array mit den vom Strahl getroffenen
      // Objekten zurück. Dieses Array ist leer (Länge == 0), wenn
      // keine Objekte getroffen wurden.
      let intersects = raycaster.intersectObjects(scene.children);

      if (intersects.length > 0) {
        //Code
      }
    });

    document.addEventListener("mouseup", (e) => {
      // Code
    });

    // Instantiates Raycaster
    const raycaster = new THREE.Raycaster();

    const clock = new THREE.Clock();

    const tick = () => {
      mousemove.targetX = mousemove.mouseX * 0.001;
      mousemove.targetY = mousemove.mouseY * 0.001;

      const elapsedTime = clock.getElapsedTime();

      // Raycaster
      // update raycaster according to current mouse coordinates
      // so that the ray is cast from the right position
      raycaster.setFromCamera(mousemove.normalizedMouse, camera);

      // Render
      renderer.render(scene, camera);

      // Call tick again on the next frame
      window.requestAnimationFrame(tick);
    };

    tick();
  }); // FETCH END
