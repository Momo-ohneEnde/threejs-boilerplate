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
import * as R from "ramda";
import * as d3 from "d3";
import {
  CSS3DRenderer,
  CSS3DObject,
} from "three/examples/jsm/renderers/CSS3DRenderer.js";
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

    // Anpassung an Größe des Browsers
    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    /**
     * Renderer
     */

    let renderer = (() => {
      let renderer = new CSS3DRenderer();
      renderer.name = "CSS3D";
      renderer.setSize(window.innerWidth, window.innerHeight);
      // im div mit id = container werdend die Objekte gerendert
      document.getElementById("container").appendChild(renderer.domElement);
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

    /* placename */
    // gets currrent url e.g. single.html#frankfurt
    const url = window.location.href;
    // splits on # -> Array[0] = single.html, Array[1] = placename
    /* let urlArray = url.split('#');
    let placename = urlArray[1]; */
    let placename = "Frankfurt";

    /**
     * Data and Main Functions
     */

    /* CLEAR - dispose objects when changing views */

    // clear function
    function clearCanvas() {
      //resourceTracker.logResources();
      resourceTracker.dispose();

      console.log("Disposed!");
      console.log(scene);
      console.log(renderer.info);
      //resourceTracker.logResources();
    }

    // dispose button (alternative for clearCanvas, used for testing the resource tracker)
    /* let disposeBtn = document.getElementById("disposeBtn");
    disposeBtn.onclick = () => {
      resourceTracker.dispose();
      //console.log("Disposed!");
      console.log(scene);
      console.log(renderer.info);
    }; */

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
        console.log(this.resources);
      }
    }

    // set up resource tracker and bind tracking method
    const resourceTracker = new ResourceTracker();
    const track = resourceTracker.track.bind(resourceTracker);

    /* INIT */
    /* function init() {
      // default
      mapViewKugeln();
      //mapViewHelix();
    }
    init();
 */

    /* CREATE SINGLE PLACE VIEWS (Einzelansicht)*/

    // render button for single place view

    /* const toMapButton = document.getElementById("toMap");
    toMapButton.onclick = () => {
      // CODE
    }; */

    function initSinglePlaceView(placename, timeFilterRange) {
      // clear canvas
      clearCanvas();

      // set placename as heading
      setHeading(placename);

      // create spheres
      makeSpheresForSingleView(placename, timeFilterRange);

      // altert with "how to use" infos
      alert(
        "How to interact with the visualization:\nTo move up and down use: ↑ and ↓\nTo rotate: grab with mouse"
      );

      // log
      console.log("Wechsel zu Einzelansicht!");
    }
    initSinglePlaceView(placename, timeFilterRange);

    function singlePlaceViewHelix(placename) {
      // clear canvas
      clearCanvas();

      // create helix
      makeHelixForSingleView(placename);
    }

    /* FUNCTIONS FOR SINGLE PLACE VIEW */

    /* Set Placename as Heading */
    function setHeading(placename) {
      const h1 = track(document.createElement("h1"));
      h1.textContent = placename;
      // prepend adds h1 as first element in body
      document.body.prepend(h1);
    }

    /* Einzelansicht: Sphären */
    function makeSpheresForSingleView(placename, timeFilterRange) {
      // Instanziierung eines leeren 3D-Vektors
      const vector = new THREE.Vector3();

      // get data for place
      let place = data[`${placename}`];

      // loop over years, put letters from each year in an array and use it to create a sphere
      Object.keys(place).forEach((year, index) => {
        let yearArray = place[`${year}`];
        console.log(yearArray);
        // loop over array with letter objects
        let letters = [];
        if (timeFilterRange.includes(year)) {
          for (let i = 0; i < yearArray.length; i++) {
            letters.push(yearArray[i]);
          }
          createSphere(letters, index);
        }

        makeYearMarker(year, index);
      });

      function createSphere(letters, yearIndex) {
        for (let i = 0, l = letters.length; i < l; i++) {
          // <div class="element">
          const letterElement = track(document.createElement("div"));
          letterElement.className = "letter";

          /* if (letters[i].receiverGender == "Weiblich") {
            letterElement.style.backgroundColor = "rgb(237, 125, 49, 0.5)";
          } else if (letters[i].receiverGender == "Männlich") {
            letterElement.style.backgroundColor = "rgb(231, 230, 230, 0.5)";
          } else {
            letterElement.style.backgroundColor = "rgb(0, 0, 0, 0.5)";
          } */

          letterElement.style.backgroundColor  = 'rgb(204, 0, 0, 0.5)';


          // <div class="id">
          const id = track(document.createElement("div"));
          id.className = "id";
          id.textContent = letters[i].idFormatted;
          id.setAttribute(
            "onclick",
            "window.open(' " + letters[i].propyURL + "')"
          );
          letterElement.appendChild(id);

          // <div class="initials">
          const initials = track(document.createElement("div"));
          initials.className = "initials";
          initials.textContent = letters[i].receiverInitials;
          initials.setAttribute(
            "onclick",
            "window.open(' " + letters[i].receiverId + "')"
          );
          letterElement.appendChild(initials);

          // <div class="name">
          const name = track(document.createElement("div"));
          name.className = "name";
          name.innerHTML = letters[i].receiverFormatted;
          name.setAttribute(
            "onclick",
            "window.open(' " + letters[i].receiverId + "')"
          );
          letterElement.appendChild(name);

          // <div class="date">
          const date = track(document.createElement("div"));
          date.className = "date";
          date.innerHTML = letters[i].dateFormatted;
          letterElement.appendChild(date);

          // erstellt ein CSS3DObjekt aus Variable element
          // die Anfangsposition der Elemente wird zufällig festgelegt
          const objectCSS = track(new CSS3DObject(letterElement));
          objectCSS.name = letters[i].id;
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

          objectCSS.position.y += 1200 * yearIndex;

          // Objekt wird zum Sphären Array im Targets-Objekt hinzugefügt
          targets.sphere.push(objectCSS);
        }
      }
    }

    /* Einzelansicht: Helix */
    function makeHelixForSingleView() {}

    /* HELPER FUNCTIONS */

    function makeYearMarker(year, index) {
      const yearMarker = track(document.createElement("div"));
      yearMarker.className = "year";
      yearMarker.textContent = year;
      document.body.appendChild(yearMarker);

      const marker = track(new CSS3DObject(yearMarker));
      marker.name = "yearMarker";
      scene.add(marker);

      marker.position.y += 1200 * index;
    }

    function loopYearMarker(
      functionForLoop,
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

    // retuns an array of all letter objects currently displayed on the scene
    function getlettersCurrentlyVisibleOnScene(idsOfCurrentLetterObjectsOnScene) {
      let lettersCurrentlyVisibleOnScene = [];

      // find letters currently visivle in scene and put them into the array
      Object.values(data).forEach((place) => {
        Object.values(place).forEach((year) => {
          for (let i = 0; i < year.length; i++) {
            if (idsOfCurrentLetterObjectsOnScene.includes(year[i].id)) {
              lettersCurrentlyVisibleOnScene.push(year[i]);
              //console.log(lettersCurrentlyVisibleOnScene);
            }
          }
        });
      });

      return lettersCurrentlyVisibleOnScene;
    }

    // returns an array of all the letter objects currently visible on the scene
    function getCurrentLetterObjectsOnScene() {
      let currentLetterObjectsOnScene = [];
      scene.children.forEach((child) => {
        if (child.name.startsWith("GB")) {
          currentLetterObjectsOnScene.push(child);
        }
      });
      //console.log("Letter Objects", currentLetterObjectsOnScene);
      return currentLetterObjectsOnScene;
    }

    // returns an array of all the ids of the planes currently visible on the scene
    // parameter: array of all planes on the scene
    function getIdsOfCurrentLetterObjectsOnScene(currentLetterObjectsOnScene) {
      let idsOfCurrentLetterObjectsOnScene = [];
      currentLetterObjectsOnScene.forEach((object) => {
        idsOfCurrentLetterObjectsOnScene.push(object.name);
      });
      //console.log("Liste der Ids:");
      //console.log(idsOfCurrentLetterObjectsOnScene);
      return idsOfCurrentLetterObjectsOnScene;
    }
    
    // changes color of letter object
    function changeLetterObjectColor(currentLetterObjectsOnScene, id, color) {
      // get letter object associated with the current id
      let currLetterObj = currentLetterObjectsOnScene.find((letter) => letter.name == id);
      // change color of the letter object
      currLetterObj.element.style.backgroundColor = color;
    }

    // hides letter object
    function hideLetterObject(currentLetterObjectsOnScene, id) {
      // get letter object associated with the current id
      let currLetterObj = currentLetterObjectsOnScene.find((letter) => letter.name == id);
      currLetterObj.visible = false;
    }

    // shows letter object (after it had been hidden)
    function showLetterObject(currentLetterObjectsOnScene, id) {
      // get letter object associated with the current id
      let currLetterObj = currentLetterObjectsOnScene.find((letter) => letter.name == id);
      currLetterObj.visible = true;
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

    $(function () {
      $("#slider-range").slider({
        range: true,
        min: 1764,
        max: 1772,
        values: [1764, 1772],
        slide: function slide(event, ui) {
          $("#amount").val("" + ui.values[0] + " – " + ui.values[1]);
          console.log("Keep sliding");

          // set time filter
          timeFilterRange = range(ui.values[0], ui.values[1]);

          // clear canvas
          clearCanvas();

          // create spheres
          makeSpheresForSingleView(placename, timeFilterRange);
        },
      });
      console.log("Ready");

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
      // sets letter object color of sent letters to 'darckorchid' if checkbox is checked
      if ($(this).is(":checked")) {
        // get array of all planes currently on the scene
        let currentLetterObjectsOnScene = getCurrentLetterObjectsOnScene();
        // get array of all the ids of the planes
        let idsOfCurrentLetterObjectsOnScene =
        getIdsOfCurrentLetterObjectsOnScene(currentLetterObjectsOnScene);
        // loop over ids and determine if letter has status sent/received by end of idString (r or s)
        idsOfCurrentLetterObjectsOnScene.forEach((id) => {
          if (id.endsWith("s")) {
            changeLetterObjectColor(currentLetterObjectsOnScene, id, 'rgb(153, 50, 204, 0.5)');
          }
        });
      } else {
        // sets letter object color color of sent letters back to red if checkbox is unchecked
        let currentLetterObjectsOnScene = getCurrentLetterObjectsOnScene();

        let idsOfCurrentLetterObjectsOnScene =
        getIdsOfCurrentLetterObjectsOnScene(currentLetterObjectsOnScene);

        idsOfCurrentLetterObjectsOnScene.forEach((id) => {
          if (id.endsWith("s")) {
            changeLetterObjectColor(currentLetterObjectsOnScene, id, 'rgb(204, 0, 0, 0.5)');
          }
        });
      }
    });

    // RECEIVED
    $(".received").change(function () {
      // sets letter object color color of received letters to 'plum' if checkbox is checked
      if ($(this).is(":checked")) {
        // get array of all planes currently on the scene
        let currentLetterObjectsOnScene = getCurrentLetterObjectsOnScene();
        // get array of all the ids of the planes
        let idsOfCurrentLetterObjectsOnScene =
        getIdsOfCurrentLetterObjectsOnScene(currentLetterObjectsOnScene);
        // loop over ids and determine if letter has status sent/received by end of idString (r or s)
        idsOfCurrentLetterObjectsOnScene.forEach((id) => {
          if (id.endsWith("r")) {
            changeLetterObjectColor(currentLetterObjectsOnScene, id, 'rgb(221, 160, 221)');
          }
        });
      } else {
        // sets letter object color color of received letters back to red if checkbox is unchecked
        let currentLetterObjectsOnScene = getCurrentLetterObjectsOnScene();

        let idsOfCurrentLetterObjectsOnScene =
        getIdsOfCurrentLetterObjectsOnScene(currentLetterObjectsOnScene);

        idsOfCurrentLetterObjectsOnScene.forEach((id) => {
          if (id.endsWith("r")) {
            changeLetterObjectColor(currentLetterObjectsOnScene, id, 'rgb(204, 0, 0, 0.5)');
          }
        });
      }
    });

    /* 2.) Filter-Modus */

    // SENT
    $(".sent").change(function () {
      // hides planes of sent letters if sent-checkbox is checked and Filter-Mode-box is also checked
      if ($(this).is(":checked") && $(".filter").is(":checked")) {
        // get array of all planes currently on the scene
        let currentLetterObjectsOnScene = getCurrentLetterObjectsOnScene();
        // get array of all the ids of the planes
        let idsOfCurrentLetterObjectsOnScene =
          getIdsOfCurrentLetterObjectsOnScene(currentLetterObjectsOnScene);
        // loop over ids and determine if letter has status sent/received by end of idString (r or s)
        idsOfCurrentLetterObjectsOnScene.forEach((id) => {
          if (id.endsWith("s")) {
            hideLetterObject(currentLetterObjectsOnScene, id);
          }
        });
      } else {
        // shows planes again once the sent-box is unchecked
        let currentLetterObjectsOnScene = getCurrentLetterObjectsOnScene();

        let idsOfCurrentLetterObjectsOnScene =
          getIdsOfCurrentLetterObjectsOnScene(currentLetterObjectsOnScene);

        idsOfCurrentLetterObjectsOnScene.forEach((id) => {
          if (id.endsWith("s")) {
            showLetterObject(currentLetterObjectsOnScene, id);
          }
        });
      }
    });

    // RECEIVED
    // hides planes of received letters if received-checkbox is checked and Filter-Mode-box is also checked
    $(".received").change(function () {
      if ($(this).is(":checked") && $(".filter").is(":checked")) {
        // get array of all planes currently on the scene
        let currentLetterObjectsOnScene = getCurrentLetterObjectsOnScene();
        // get array of all the ids of the planes
        let idsOfCurrentLetterObjectsOnScene =
          getIdsOfCurrentLetterObjectsOnScene(currentLetterObjectsOnScene);
        // loop over ids and determine if letter has status sent/received by end of idString (r or s)
        idsOfCurrentLetterObjectsOnScene.forEach((id) => {
          if (id.endsWith("r")) {
            hideLetterObject(currentLetterObjectsOnScene, id);
          }
        });
      } else {
        // shows planes again once the received-box is unchecked
        let currentLetterObjectsOnScene = getCurrentLetterObjectsOnScene();

        let idsOfCurrentLetterObjectsOnScene =
          getIdsOfCurrentLetterObjectsOnScene(currentLetterObjectsOnScene);

        idsOfCurrentLetterObjectsOnScene.forEach((id) => {
          if (id.endsWith("r")) {
            showLetterObject(currentLetterObjectsOnScene, id);
          }
        });
      }
    });

    /* Documenttyp-Filter */

    /* 1.) Farbliche Hervorhebung */

    // LETTERS
    $(".goetheletter").change(function () {
      // sets plane color to 'red' if checkbox is checked and doctype is goetheletter
      if ($(this).is(":checked")) {
        // get array of all planes currently on the scene
        let currentLetterObjectsOnScene = getCurrentLetterObjectsOnScene();
        // get array of all the ids of the planes
        let idsOfCurrentLetterObjectsOnScene =
          getIdsOfCurrentLetterObjectsOnScene(currentLetterObjectsOnScene);
        // loop over ids and determine if document is letter
        idsOfCurrentLetterObjectsOnScene.forEach((id) => {
          if (id.startsWith("GB")) {
            changeLetterObjectColor(currentLetterObjectsOnScene, id, 'rgb(204, 0, 0, 0.5)');
          }
        });
      } else {
        // sets plane color to default color if checkbox is unchecked and doctype is goetheletter
        let currentLetterObjectsOnScene = getCurrentLetterObjectsOnScene();

        let idsOfCurrentLetterObjectsOnScene =
          getIdsOfCurrentLetterObjectsOnScene(currentLetterObjectsOnScene);

        idsOfCurrentLetterObjectsOnScene.forEach((id) => {
          if (id.startsWith("GB")) {
            changeLetterObjectColor(currentLetterObjectsOnScene, id, 'rgb(204, 0, 0, 0.5)');
          }
        });
      }
    });

    // DIARIES
    $(".goethediary").change(function () {
      // sets plane color to blue if checkbox is checked and doctype is goethediary
      if ($(this).is(":checked")) {
        // get array of all planes currently on the scene
        let currentLetterObjectsOnScene = getCurrentLetterObjectsOnScene();
        // get array of all the ids of the planes
        let idsOfCurrentLetterObjectsOnScene =
          getIdsOfCurrentLetterObjectsOnScene(currentLetterObjectsOnScene);
        // loop over ids and determine if document is diary
        idsOfCurrentLetterObjectsOnScene.forEach((id) => {
          if (id.startsWith("GT")) {
            changeLetterObjectColor(currentLetterObjectsOnScene, id, 'rgb(203, 231, 249, 0.5)');
          }
        });
      } else {
        // sets plane color to default color if checkbox is unchecked and doctype is goethediary
        let currentLetterObjectsOnScene = getCurrentLetterObjectsOnScene();

        let idsOfCurrentLetterObjectsOnScene =
          getIdsOfCurrentLetterObjectsOnScene(currentLetterObjectsOnScene);

        idsOfCurrentLetterObjectsOnScene.forEach((id) => {
          if (id.startsWith("GT")) {
            changeLetterObjectColor(currentLetterObjectsOnScene, id, 'rgb(204, 0, 0, 0.5)');
          }
        });
      }
    });

    /* 2.) Filter-Modus */

    // LETTERS
    $(".goetheletter").change(function () {
      // hides letter planes if letter-box and filter-mode-box are checked
      if ($(this).is(":checked") && $(".filter").is(":checked")) {
        // get array of all planes currently on the scene
        let currentLetterObjectsOnScene = getCurrentLetterObjectsOnScene();
        // get array of all the ids of the planes
        let idsOfCurrentLetterObjectsOnScene =
          getIdsOfCurrentLetterObjectsOnScene(currentLetterObjectsOnScene);
        // loop over ids and determine if document is letter
        idsOfCurrentLetterObjectsOnScene.forEach((id) => {
          if (id.startsWith("GB")) {
            hideLetterObject(currentLetterObjectsOnScene, id);
          }
        });
      } else {
        // shows planes again once letter-box is unchecked
        let currentLetterObjectsOnScene = getCurrentLetterObjectsOnScene();

        let idsOfCurrentLetterObjectsOnScene =
          getIdsOfCurrentLetterObjectsOnScene(currentLetterObjectsOnScene);

        idsOfCurrentLetterObjectsOnScene.forEach((id) => {
          if (id.startsWith("GB")) {
            showLetterObject(currentLetterObjectsOnScene, id);
          }
        });
      }
    });

    // DIARIES
    $(".goethediary").change(function () {
      // hides diary planes if diary-box and filter-mode-box are checked
      if ($(this).is(":checked") && $(".filter").is(":checked")) {
        // get array of all planes currently on the scene
        let currentLetterObjectsOnScene = getCurrentLetterObjectsOnScene();
        // get array of all the ids of the planes
        let idsOfCurrentLetterObjectsOnScene =
          getIdsOfCurrentLetterObjectsOnScene(currentLetterObjectsOnScene);
        // loop over ids and determine if document is diary
        idsOfCurrentLetterObjectsOnScene.forEach((id) => {
          if (id.startsWith("GT")) {
            hideLetterObject(currentLetterObjectsOnScene, id);
          }
        });
      } else {
        // shows planes again once diary-box is unchecked
        let currentLetterObjectsOnScene = getCurrentLetterObjectsOnScene();

        let idsOfCurrentLetterObjectsOnScene =
          getIdsOfCurrentLetterObjectsOnScene(currentLetterObjectsOnScene);

        idsOfCurrentLetterObjectsOnScene.forEach((id) => {
          if (id.startsWith("GT")) {
            showLetterObject(currentLetterObjectsOnScene, id);
          }
        });
      }
    });

    /* Personen-Filter */

    /* 1.) Farbliche Hervorhebung */

    // MALE
    $(".male").change(function () {
      // CHECKED
      // sets plane color of letters with male receiver to grey if checkbox is checked
      if ($(this).is(":checked")) {
        // get array of all planes currently on the scene
        let currentLetterObjectsOnScene = getCurrentLetterObjectsOnScene();
        // get array of all the ids of the planes
        let idsOfCurrentLetterObjectsOnScene =
          getIdsOfCurrentLetterObjectsOnScene(currentLetterObjectsOnScene);

        let lettersCurrentlyVisibleOnScene = getlettersCurrentlyVisibleOnScene(
          idsOfCurrentLetterObjectsOnScene
        );

        // count number of male recipients
        let maleCounter = 0;

        for (let i = 0; i < lettersCurrentlyVisibleOnScene.length; i++) {
          if (lettersCurrentlyVisibleOnScene[i].receiverGender == "Männlich") {
            //console.log(i, "männlich");
            changeLetterObjectColor(
              currentLetterObjectsOnScene,
              lettersCurrentlyVisibleOnScene[i].id,
              'rgb(203, 231, 249, 0.5)'
            );
            maleCounter++;
          }
        }
      }

      // UNCHECKED
      if (!$(this).is(":checked")) {
        // get array of all planes currently on the scene
        let currentLetterObjectsOnScene = getCurrentLetterObjectsOnScene();
        // get array of all the ids of the planes
        let idsOfCurrentLetterObjectsOnScene =
          getIdsOfCurrentLetterObjectsOnScene(currentLetterObjectsOnScene);

        let lettersCurrentlyVisibleOnScene = getlettersCurrentlyVisibleOnScene(
          idsOfCurrentLetterObjectsOnScene
        );

        for (let i = 0; i < lettersCurrentlyVisibleOnScene.length; i++) {
          if (lettersCurrentlyVisibleOnScene[i].receiverGender == "Männlich") {
            //console.log(i, "männlich");
            changeLetterObjectColor(
              currentLetterObjectsOnScene,
              lettersCurrentlyVisibleOnScene[i].id,
              // default color
              'rgb(204, 0, 0, 0.5)'
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
        let currentLetterObjectsOnScene = getCurrentLetterObjectsOnScene();
        // get array of all the ids of the planes
        let idsOfCurrentLetterObjectsOnScene =
          getIdsOfCurrentLetterObjectsOnScene(currentLetterObjectsOnScene);

        let lettersCurrentlyVisibleOnScene = getlettersCurrentlyVisibleOnScene(
          idsOfCurrentLetterObjectsOnScene
        );

        // count number of female recipients
        let femaleCounter = 0;

        for (let i = 0; i < lettersCurrentlyVisibleOnScene.length; i++) {
          if (lettersCurrentlyVisibleOnScene[i].receiverGender == "Weiblich") {
            //console.log(i, "weiblich");
            changeLetterObjectColor(
              currentLetterObjectsOnScene,
              lettersCurrentlyVisibleOnScene[i].id,
              'rgb(255, 165, 0, 0.5)'
            );
            femaleCounter++;
          }
        }
      }

      // UNCHECKED
      if (!$(this).is(":checked")) {
        // get array of all planes currently on the scene
        let currentLetterObjectsOnScene = getCurrentLetterObjectsOnScene();
        // get array of all the ids of the planes
        let idsOfCurrentLetterObjectsOnScene =
          getIdsOfCurrentLetterObjectsOnScene(currentLetterObjectsOnScene);

        let lettersCurrentlyVisibleOnScene = getlettersCurrentlyVisibleOnScene(
          idsOfCurrentLetterObjectsOnScene
        );

        for (let i = 0; i < lettersCurrentlyVisibleOnScene.length; i++) {
          if (lettersCurrentlyVisibleOnScene[i].receiverGender == "Weiblich") {
            //console.log(i, "weiblich");
            changeLetterObjectColor(
              currentLetterObjectsOnScene,
              lettersCurrentlyVisibleOnScene[i].id,
              // default color
              'rgb(204, 0, 0, 0.5)'
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
        let currentLetterObjectsOnScene = getCurrentLetterObjectsOnScene();
        // get array of all the ids of the planes
        let idsOfCurrentLetterObjectsOnScene =
          getIdsOfCurrentLetterObjectsOnScene(currentLetterObjectsOnScene);

        let lettersCurrentlyVisibleOnScene = getlettersCurrentlyVisibleOnScene(
          idsOfCurrentLetterObjectsOnScene
        );

        // count number of female recipients
        let otherCounter = 0;

        for (let i = 0; i < lettersCurrentlyVisibleOnScene.length; i++) {
          if (
            lettersCurrentlyVisibleOnScene[i].receiverGender == "Keine Info"
          ) {
            //console.log(i, "Keine Info");
            changeLetterObjectColor(
              currentLetterObjectsOnScene,
              lettersCurrentlyVisibleOnScene[i].id,
              'rgb(0,0,0, 0.5)'
            );
            otherCounter++;
          }
        }
      }

      // UNCHECKED
      if (!$(this).is(":checked")) {
        // get array of all planes currently on the scene
        let currentLetterObjectsOnScene = getCurrentLetterObjectsOnScene();
        // get array of all the ids of the planes
        let idsOfCurrentLetterObjectsOnScene =
          getIdsOfCurrentLetterObjectsOnScene(currentLetterObjectsOnScene);

        let lettersCurrentlyVisibleOnScene = getlettersCurrentlyVisibleOnScene(
          idsOfCurrentLetterObjectsOnScene
        );

        for (let i = 0; i < lettersCurrentlyVisibleOnScene.length; i++) {
          if (
            lettersCurrentlyVisibleOnScene[i].receiverGender == "Keine Info"
          ) {
            //console.log(i, "Keine Info");
            changeLetterObjectColor(
              currentLetterObjectsOnScene,
              lettersCurrentlyVisibleOnScene[i].id,
              // default color
              'rgb(204, 0, 0, 0.5)'
            );
          }
        }
      }
    });

    /* 2.) Filter-Modus */

    // MALE
    $(".male").change(function () {
      // CHECKED
      // hides planes with male receiver if male-checkbox and filter-mode-checkbox are checked
      if ($(this).is(":checked") && $(".filter").is(":checked")) {
        // get array of all planes currently on the scene
        let currentLetterObjectsOnScene = getCurrentLetterObjectsOnScene();
        // get array of all the ids of the planes
        let idsOfCurrentLetterObjectsOnScene =
          getIdsOfCurrentLetterObjectsOnScene(currentLetterObjectsOnScene);

        let lettersCurrentlyVisibleOnScene = getlettersCurrentlyVisibleOnScene(
          idsOfCurrentLetterObjectsOnScene
        );

        // count number of male recipients
        let maleCounter = 0;

        for (let i = 0; i < lettersCurrentlyVisibleOnScene.length; i++) {
          if (lettersCurrentlyVisibleOnScene[i].receiverGender == "Männlich") {
            //console.log(i, "männlich");
            hideLetterObject(
              currentLetterObjectsOnScene,
              lettersCurrentlyVisibleOnScene[i].id
            );
            maleCounter++;
          }
        }
      }

      // UNCHECKED
      if (!$(this).is(":checked")) {
        // get array of all planes currently on the scene
        let currentLetterObjectsOnScene = getCurrentLetterObjectsOnScene();
        // get array of all the ids of the planes
        let idsOfCurrentLetterObjectsOnScene =
          getIdsOfCurrentLetterObjectsOnScene(currentLetterObjectsOnScene);

        let lettersCurrentlyVisibleOnScene = getlettersCurrentlyVisibleOnScene(
          idsOfCurrentLetterObjectsOnScene
        );

        for (let i = 0; i < lettersCurrentlyVisibleOnScene.length; i++) {
          if (lettersCurrentlyVisibleOnScene[i].receiverGender == "Männlich") {
            //console.log(i, "männlich");
            showLetterObject(
              currentLetterObjectsOnScene,
              lettersCurrentlyVisibleOnScene[i].id
            );
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
        let currentLetterObjectsOnScene = getCurrentLetterObjectsOnScene();
        // get array of all the ids of the planes
        let idsOfCurrentLetterObjectsOnScene =
          getIdsOfCurrentLetterObjectsOnScene(currentLetterObjectsOnScene);

        let lettersCurrentlyVisibleOnScene = getlettersCurrentlyVisibleOnScene(
          idsOfCurrentLetterObjectsOnScene
        );

        // count number of female recipients
        let femaleCounter = 0;

        for (let i = 0; i < lettersCurrentlyVisibleOnScene.length; i++) {
          if (lettersCurrentlyVisibleOnScene[i].receiverGender == "Weiblich") {
            //console.log(i, "weiblich");
            hideLetterObject(
              currentLetterObjectsOnScene,
              lettersCurrentlyVisibleOnScene[i].id
            );
            femaleCounter++;
          }
        }
      }

      // UNCHECKED
      if (!$(this).is(":checked")) {
        // get array of all planes currently on the scene
        let currentLetterObjectsOnScene = getCurrentLetterObjectsOnScene();
        // get array of all the ids of the planes
        let idsOfCurrentLetterObjectsOnScene =
          getIdsOfCurrentLetterObjectsOnScene(currentLetterObjectsOnScene);

        let lettersCurrentlyVisibleOnScene = getlettersCurrentlyVisibleOnScene(
          idsOfCurrentLetterObjectsOnScene
        );

        for (let i = 0; i < lettersCurrentlyVisibleOnScene.length; i++) {
          if (lettersCurrentlyVisibleOnScene[i].receiverGender == "Weiblich") {
            //console.log(i, "weiblich");
            showLetterObject(
              currentLetterObjectsOnScene,
              lettersCurrentlyVisibleOnScene[i].id
            );
          }
        }
      }
    });

    // OTHER / UNKNOWN
    $(".other").change(function () {
      // CHECKED
      if ($(this).is(":checked") && $(".filter").is(":checked")) {
        // get array of all planes currently on the scene
        let currentLetterObjectsOnScene = getCurrentLetterObjectsOnScene();
        // get array of all the ids of the planes
        let idsOfCurrentLetterObjectsOnScene =
          getIdsOfCurrentLetterObjectsOnScene(currentLetterObjectsOnScene);

        let lettersCurrentlyVisibleOnScene = getlettersCurrentlyVisibleOnScene(
          idsOfCurrentLetterObjectsOnScene
        );

        // count number of female recipients
        let otherCounter = 0;

        for (let i = 0; i < lettersCurrentlyVisibleOnScene.length; i++) {
          if (
            lettersCurrentlyVisibleOnScene[i].receiverGender == "Keine Info"
          ) {
            //console.log(i, "Keine Info");
            hideLetterObject(
              currentLetterObjectsOnScene,
              lettersCurrentlyVisibleOnScene[i].id
            );
            otherCounter++;
          }
        }
      }

      // UNCHECKED
      if (!$(this).is(":checked")) {
        // get array of all planes currently on the scene
        let currentLetterObjectsOnScene = getCurrentLetterObjectsOnScene();
        // get array of all the ids of the planes
        let idsOfCurrentLetterObjectsOnScene =
          getIdsOfCurrentLetterObjectsOnScene(currentLetterObjectsOnScene);

        let lettersCurrentlyVisibleOnScene = getlettersCurrentlyVisibleOnScene(
          idsOfCurrentLetterObjectsOnScene
        );

        for (let i = 0; i < lettersCurrentlyVisibleOnScene.length; i++) {
          if (
            lettersCurrentlyVisibleOnScene[i].receiverGender == "Keine Info"
          ) {
            //console.log(i, "Keine Info");
            showLetterObject(
              currentLetterObjectsOnScene,
              lettersCurrentlyVisibleOnScene[i].id
            );
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

    let camera = new THREE.PerspectiveCamera(
      40,
      window.innerWidth / window.innerHeight,
      1,
      10000
    );
    /* camera.position.y = 0;
    camera.position.z = 0;
    camera.position.x = 0; */

    camera.position.z = 10000;
    camera.position.x = 7500;
    camera.position.y = 3040;
    camera.zoom = 1;
    //camera.updateProjectionMatrix();
    //camera.lookAt(new Vector3(0,1000,0));
    //camera.position.y = 3000;
    //camera.updateProjectionMatrix();
    //camera.lookAt(new Vector3(0,1000,0));
    cameraGui.add(camera.position, "y").min(0).max(10000).step(10);
    cameraGui.add(camera.position, "x").min(0).max(10000).step(10);
    cameraGui.add(camera.position, "z").min(0).max(10000).step(10);
    camera.updateProjectionMatrix();
    scene.add(camera);

    /* move camera in y axis with arrow keys up and down */
    document.onkeydown = function (e) {
      switch (e.key) {
        case "ArrowUp":
          camera.position.y += 100;
          camera.updateProjectionMatrix();

          // controls need to be updated too, otherwise as soon as you use the mouse to move the camera jumps to its inital position
          controls.target.y = camera.position.y;
          break;
        case "ArrowDown":
          camera.position.y -= 100;
          camera.updateProjectionMatrix();

          controls.target.y = camera.position.y;
          break;
        case "ArrowLeft":
          // do nothing
          break;
        case "ArrowRight":
        // do nothing
      }
    };

    /**
     * Controls
     */

    let controls = new OrbitControls(camera, renderer.domElement);
    controls.target.x = 0;
    controls.target.z = 0;
    controls.target.y = 0;

    controls.minPolarAngle = Math.PI / 2;
    controls.maxPolarAngle = Math.PI / 2 + 0.75;

    controls.enablePan = false;

    console.log("Control target");
    console.log(controls.target);

    /**
     * Mouse interaction
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

    const clock = new THREE.Clock();

    const tick = () => {
      mousemove.targetX = mousemove.mouseX * 0.001;
      mousemove.targetY = mousemove.mouseY * 0.001;

      const elapsedTime = clock.getElapsedTime();

      // Render
      renderer.render(scene, camera);

      // Call tick again on the next frame
      window.requestAnimationFrame(tick);
    };

    tick();
  }); // FETCH END
