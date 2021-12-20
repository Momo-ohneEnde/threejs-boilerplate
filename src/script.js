/**
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

    // Größe des canvas, auf dem gerendert wird
    const sizes = {
      width: window.innerWidth,
      height: 1000,
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
      console.log("renderer info", renderer.info);
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

    let timeFilterRange = range(1764, 1772);

    /**
     * Data and Main Functions
     */

    /* CLEAR - dispose objects when changing views */

    // clear function
    function clearCanvas() {
      //resourceTracker.logResources();
      resourceTracker.dispose();

      console.log("Disposed!");
      console.log("Scene: ", scene);
      console.log("renderer info", renderer.info);
      //resourceTracker.logResources();
    }

    /* Allgemeines Vorgehen, um Elemente aus der Szene zu löschen: 
      1.) Komplette Szene durchgehen, 
      2.) alle Elemente in Szene von der Szene entfernen mit remove(), 
      3.) dann mit dispose() aus dem Speicher löschen, bzw. geometry, material, textures müssen auch einzeln gelöscht werden
     */

    /* Vorgehen mit Resource Tracker:
     * Tracker legt ein Set mit zu löschenden Objekten an
     * Tracker hat eine track-function, mit der Objekte in das Set aufgenommen werden
     * d.h. immer wenn ein neues Objekt erstellt wird, dann muss es von der Funktion track() umschlossen werden
     * am Ende kann dann dispose() auf das Set angewandt werden, sodass alle Objekte gleichzeitig gelöscht werden
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
      logResources() {
        console.log("Resources of Tracker", this.resources);
      }
    }

    // set up resource tracker and bind tracking method
    const resourceTracker = new ResourceTracker();
    const track = resourceTracker.track.bind(resourceTracker);

    /* INIT */
    function init() {
      // default: Kugelansicht
      mapViewKugeln(timeFilterRange);
    }
    init();

    /* BUTTONS */
    // Kugel-Button ->Wechsel zu Kugelansicht(Karte)
    const kugelButton = document.getElementById("kugel");

    kugelButton.onclick = () => {
      // clear canvas
      clearCanvas();

      // create Kugelansicht
      mapViewKugeln(timeFilterRange);

      // reset all color filters
      /* const checkboxes = document.querySelectorAll('input[type=checkbox]');

      checkboxes.forEach((checkbox) => {
        checkbox.checked = false;
      }) */

      //$("#checkbox").prop("unchecked", true);

      console.log("Wechsel zu Kugelansicht!");
    };

    // Sphären-Button -> Wechsel zu Spährenansicht (Karte)
    const sphereButton = document.getElementById("sphere");
    sphereButton.onclick = () => {
      // clear canvas
      clearCanvas();

      // remove content of infobox
      removeContentOfInfobox();

      // create Sphärenansicht
      mapViewSpheres(timeFilterRange);

      console.log("Wechsel zu Sphärenansicht!");
    };

    // Helix-Buttton -> Wechsel zu Helixansicht (Karte)
    const helixButton = document.getElementById("helix");

    helixButton.onclick = () => {
      // clear canvas
      clearCanvas();

      // remove content of infobox
      removeContentOfInfobox();

      // create Helixansicht
      mapViewHelix(timeFilterRange);

      console.log("Wechsel zu Helixansicht!");
    };

    /* CREATE MAP VIEWS */

    /* 1) Default: Kugelansicht */
    // Karte laden, dann Aufruf von makeKugeln()
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

      // Sichtbarkeit Steuerungselemente
      document.getElementById("filter-mode").style.visibility = "hidden";
      document.getElementById("letter-status-filter").style.visibility =
        "hidden";
      document.getElementById("doc-type-filter").style.visibility = "hidden";
      document.getElementById("person-filter").style.visibility = "hidden";
      document.getElementById("infobox").style.visibility = "hidden";

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

    /* 2) Briefnetz-Ansicht */

    function mapViewLetterNetwork() {
      // Code
      // Karte laden
      // Aufruf von makeLetterNetwork()
    }

    /* 3) Sphären-Ansicht*/

    // vector to which the planes will be facing
    const vector = new Vector3();

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

      // Sichtbarkeit Steuerungselemente
      document.getElementById("filter-mode").style.visibility = "visible";
      document.getElementById("letter-status-filter").style.visibility =
        "visible";
      document.getElementById("doc-type-filter").style.visibility = "visible";
      document.getElementById("person-filter").style.visibility = "visible";
      document.getElementById("infobox").style.visibility = "visible";

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
        console.log("Scene: ", scene);

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

    /* 4) Helix-Ansicht */
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

      // Sichtbarkeit Steuerungselemente
      document.getElementById("filter-mode").style.visibility = "visible";
      document.getElementById("letter-status-filter").style.visibility =
        "visible";
      document.getElementById("doc-type-filter").style.visibility = "visible";
      document.getElementById("person-filter").style.visibility = "visible";
      document.getElementById("infobox").style.visibility = "visible";

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
        console.log("Scene", scene);

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

    /* 1) Kugeln */
    // wird in init aufgerufen
    function makeKugeln(placeMarker, city, yearArray) {
      // erhält übergeben: placeMarker, Ortsobjekt, yearArray
      // Iteration über Jahre, dann Objekten in Jahren
      // Anzahl der Objekte ermitteln
      let letterCount = 0;
      yearArray.forEach((year) => {
        // Bedingung: Jahreszahl aus dem übergebenen yearArray (Infos aus Zeitfilter) in den Daten vorhanden sein, sonst undefined Error
        if (Object.keys(city).includes(year)) {
          let yearArrayData = city[`${year}`];
          // loop over array with letter data
          for (let i = 0; i < yearArrayData.length; i++) {
            letterCount++;
          }
        }
      });
      //console.log(letterCount);

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

    // implementation of functionForLoop in loop over placemarker
    function addKugeltoPlaceMarker(placeMarker, yearArray) {
      try {
        const city = data[placeMarker.name]; // saves name of place from json data
        //console.log(city, placeMarker.name); // logs city names

        makeKugeln(placeMarker, city, yearArray);
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
    // implementation of functionForLoop in loop over placemarker
    function addHelixtoPlaceMarker(placeMarker, yearArray) {
      try {
        const city = data[placeMarker.name]; // saves name of place from json data
        console.log(city, placeMarker.name); // logs city names

        makeHelixForMap(placeMarker, city, yearArray);
      } catch (error) {
        console.log(error);
      }
    }

    function makeHelixForMap(placeMarker, city, yearArray) {
      // height of previous helix, starting point to from which helix is built
      let old_h = 0.0;

      // aggreagate all letters of one place in an array
      yearArray.forEach((year, yearindex) => {
        // array of years
        let letters = city[`${year}`];
        /**
 * .map((n) => {
          
          if(n.hasOwnProperty('day')){
            return n;
          } else {
            return {...n, day: "0"};
          }
        }).sort((a,b) => a.day > b.day).sort((a,b) => a.month > b.month)
 */
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
              // die Höhe wird hier größer gesetzt als bei den anderen planes, damit die yearmarker nicht zu nah übereinander sitzen
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

        // loop over letters and create helix
        //for (let i = 0, l = letters.length; i < l; i++) {
        /* 
        create planes and position them as a helix 
      */
      });
    }

    /* 5.) Helper Functions for Map View */

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

    function makeClickable(obj, isArray) {
      // test ob obj schon in Array enthalten über Namensableich

      // liste aller Objektnamen im Array erstellen
      let namesOfClickableObjects = [];
      targets.clickable.forEach((clickObj) => {
        namesOfClickableObjects.push(clickObj.name);
      });

      // Namensabgleich mit neuem Objekt, das hinzugefügt werden soll
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

    function correctPositionWiesbaden() {
      scene.children
        .filter((i) => i.name == "Scene")[0]
        .children.filter((i) => i.name == "Wiesbaden")
        .forEach(
          (wiesbadenPlacemarker) => (wiesbadenPlacemarker.position.y = 3.8)
        );
    }

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

    /* Helper functions for Filter */

    // remove chlildren of infobox div (needed when infobox is updated)
    function removeContentOfInfobox() {
      const parent = document.getElementById("infobox");

      // removes last child until there are no more children
      while (parent.lastChild) {
        parent.removeChild(parent.lastChild);
      }
    }

    // PLANES ON SCENE BUT NOT NECESSARILY VISIBLE
    // returns an array of all the planes currently on the scene (but not necessarily visible)
    function getCurrentPlanesOnScene() {
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

    // ONLY VISIBLE PLANES
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

    // returns an array of all the ids of the planes passed as parameter
    // parameter: array of planes
    function getIdsOfPlanes(planeArray) {
      let idsOfPlanes = [];
      planeArray.forEach((plane) => {
        idsOfPlanes.push(plane.name);
      });
      //console.log("Liste der Ids:");
      //console.log(idsOfCurrentPlanesOnScene);
      return idsOfPlanes;
    }

    // DATA
    // retuns an array of letter data corresponding to a set of ids
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

    // changes color of plane
    function changePlaneColor(currentPlanesOnScene, id, color) {
      // get plane associated with the current id
      let currPlane = currentPlanesOnScene.find((plane) => plane.name == id);
      // change color of the plane (must use set method!!!)
      currPlane.material.color.set(color);
    }

    // hides plane
    function hidePlane(currentPlanesOnScene, id) {
      // get plane associated with the current id
      let currPlane = currentPlanesOnScene.find((plane) => plane.name == id);
      currPlane.visible = false;
      console.log("plane hidden");
    }

    // shows plane (after it had been hidden)
    function showPlane(currentPlanesOnScene, id) {
      // get plane associated with the current id
      let currPlane = currentPlanesOnScene.find((plane) => plane.name == id);
      currPlane.visible = true;
      console.log("plane shown");
    }

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
              if (currentPlanesOnScene[i].visible == false) {
                showPlane(currentPlanesOnScene, lettersCurrentlyOnScene[i].id);
              }
            }
            // update infobox content
            makeInfoBox();

            break;
          // nichts gecheckt
          case "false-false-false":
            // hides object if visible
            for (let i = 0; i < currentPlanesOnScene.length; i++) {
              if (currentPlanesOnScene[i].visible == true) {
                hidePlane(currentPlanesOnScene, lettersCurrentlyOnScene[i].id);
              }
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
              // hides all letters with non-male receivers
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
              // hides all letters with non-male receivers
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
      }
    }

    /**
     * Steuerungselemente
     */

    /** Slider: Zeitfilter */

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

          // neue Ansicht auf basis des Sliders aufbauen
          // welche Ansicht aufgebaut wird, hängt von der view id ab

          /* KUGEL */
          // console.log(document.getElementById("viewId").name);
          if (document.getElementById("viewId").name == "kugel") {
            clearCanvas();

            timeFilterRange = range(ui.values[0], ui.values[1]);

            mapViewKugeln(timeFilterRange);
          }

          /* SPHÄRE */
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

    /* Briefstatus-Filter */

    /* 1.) Farbliche Hervorhebung */

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

    /* 2.) Filter-Modus */

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

    /* Documenttyp-Filter */

    /* 1.) Farbliche Hervorhebung */

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

    /* 2.) Filter-Modus */

    // LETTERS
    $(".goetheletter").change(function () {
      // remove content of infobox
      removeContentOfInfobox();

      // hides letter planes if letter-box and filter-mode-box are checked
      if ($(this).is(":checked") && $(".filter").is(":checked")) {
        // get array of all planes currently on the scene
        let currentPlanesOnScene = getCurrentPlanesOnScene();
        // get array of all the ids of the planes
        let idsOfCurrentPlanesOnScene = getIdsOfPlanes(currentPlanesOnScene);
        // loop over ids and determine if document is letter
        idsOfCurrentPlanesOnScene.forEach((id) => {
          if (!id.startsWith("GB")) {
            hidePlane(currentPlanesOnScene, id);
          }
        });
      } else {
        // shows planes again once letter-box is unchecked
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

    /* Personen-Filter */

    /* 1.) Farbliche Hervorhebung */

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

    /* 2.) Filter-Modus */

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

    // Gesamtanzahl Briefe
    function getNumLetters() {
      const lettersCurrentlyOnScene =
        getLetterDataOfPlanesCurrentlyVisibleOnScene();
      let numLetters = lettersCurrentlyOnScene.length;
      return numLetters;
    }

    // Anzahl gesendete Briefe
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

    // Anzahl empfangene Briefe
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

    // Anzahl Briefe mit weiblichen Adressatinnen
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

    // Anzahl Briefe mit männlichen Adressaten
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

    // Anzahl Briefe mit Adressaten unbekannten Geschlechts
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

    // MALE
    $(".male").change(function () {
      // CHECKED
      // hides planes with male receiver if male-checkbox and filter-mode-checkbox are checked
      if ($(this).is(":checked") && $(".filter").is(":checked")) {
        // get array of all planes currently on the scene
        let currentPlanesOnScene = getCurrentPlanesOnScene();
        // get array of all the ids of the planes
        let idsOfCurrentPlanesOnScene = getIdsOfPlanes(currentPlanesOnScene);

        let letterDataArray = getletterDataOfPlanes(idsOfCurrentPlanesOnScene);

        // count number of male recipients
        let maleCounter = 0;

        for (let i = 0; i < letterDataArray.length; i++) {
          if (letterDataArray[i].receiverGender == "Männlich") {
            //console.log(i, "männlich");
            hidePlane(currentPlanesOnScene, letterDataArray[i].id);
            maleCounter++;
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
            showPlane(currentPlanesOnScene, letterDataArray[i].id);
          }
        }
      }
    });

    // FEMALE
    $(".female").change(function () {
      // CHECKED
      // hides planes with female receiver if female-checkbox and filter-mode-checkbox are checked
      if ($(this).is(":checked") && $(".filter").is(":checked")) {
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
            hidePlane(currentPlanesOnScene, letterDataArray[i].id);
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
            showPlane(currentPlanesOnScene, letterDataArray[i].id);
          }
        }
      }
    });

    // OTHER / UNKNOWN
    $(".other").change(function () {
      // CHECKED
      if ($(this).is(":checked") && $(".filter").is(":checked")) {
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
            hidePlane(currentPlanesOnScene, letterDataArray[i].id);
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
            showPlane(currentPlanesOnScene, letterDataArray[i].id);
          }
        }
      }
    });

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
    camera.position.x = 25;
    camera.position.y = 25;
    camera.position.z = 100;
    camera.zoom = 25;
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
      console.log("targets clickable", targets.clickable);
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

        // click on plane
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
          clearCanvas();
          const placeName = clickedObj.name;
          window.open(`./single.html#${placeName}`);
          console.log("Klick auf Ortsmarker!");
        }
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
