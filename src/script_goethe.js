            import * as THREE from 'three';
			import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';
			import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js';
			import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js'; 

			// Daten als Array
			// aktuell zusammengebastelte Platzhalterdaten !!!

			const table = [
				// receiverInitials, receiverFormatted, dateFormatted, x, y, idFormatted, Link zur Einzelansicht, gnd-link
				// Da GB01 noch nicht auf der Plattform -> überall Link auf Startseite, Beispiel aus GB02 beim ersten Zeugnis verlinkt
				"EB", "Ernst Wolfgang Behrisch", "12. Oktober 1766", 1, 1, "GB01 Nr.20", "https://goethe-biographica.de/id/GB02_BR003_0", "http://d-nb.info/gnd/116111631", 0,
				"LB", "Ludwig Ysenburg von Buri", "23. Mai 1764", 1, 2, "GB01 Nr.1", "https://goethe-biographica.de/", "http://d-nb.info/gnd/100063934", 0,
				"JH", "Johann Adam Horn", "Juli 1770", 1, 3, "GB01 Nr.EB018", "https://goethe-biographica.de/",  "http://d-nb.info/gnd/119027682", 0,
				"CB", "Charlotte Buff", "11. September 1772", 1, 4, "GB01 Nr.103", "https://goethe-biographica.de/", "http://d-nb.info/gnd/118638076", 1,
				"JR", "Johann Gottfried Roederer", "21. September 1771", 1, 5, "GB01 Nr.88", "https://goethe-biographica.de/", "http://d-nb.info/gnd/124456359", 0,
				"CG", "Cornelia Goethe", "August 1767", 2, 1, "GB01 Nr.25", "https://goethe-biographica.de/", "http://d-nb.info/gnd/11871791X", 1,
				"FM", "Friedrich Maximilian Moors", "01. Oktober 1766", 2, 2, "GB01 Nr.16", "https://goethe-biographica.de/", "http://d-nb.info/gnd/117135364", 0,
				
				"EB", "Ernst Wolfgang Behrisch", "12. Oktober 1766", 2, 3, "GB01 Nr.20", "https://goethe-biographica.de/id/GB02_BR003_0", "http://d-nb.info/gnd/116111631", 0,
				"LB", "Ludwig Ysenburg von Buri", "23. Mai 1764", 2, 4, "GB01 Nr.1", "https://goethe-biographica.de/", "http://d-nb.info/gnd/100063934", 0,
				"JH", "Johann Adam Horn", "Juli 1770", 2, 5, "GB01 Nr.EB018", "https://goethe-biographica.de/",  "http://d-nb.info/gnd/119027682", 0,
				"CB", "Charlotte Buff", "11. September 1772", 3, 1, "GB01 Nr.103", "https://goethe-biographica.de/", "http://d-nb.info/gnd/118638076", 1,
				"JR", "Johann Gottfried Roederer", "21. September 1771", 3, 2, "GB01 Nr.88", "https://goethe-biographica.de/", "http://d-nb.info/gnd/124456359", 0,
				"CG", "Cornelia Goethe", "August 1767", 3, 3, "GB01 Nr.25", "https://goethe-biographica.de/", "http://d-nb.info/gnd/11871791X", 1,
				"FM", "Friedrich Maximilian Moors", "01. Oktober 1766", 3, 4, "GB01 Nr.16", "https://goethe-biographica.de/", "http://d-nb.info/gnd/117135364", 0,

				"EB", "Ernst Wolfgang Behrisch", "12. Oktober 1766", 3, 5, "GB01 Nr.20", "https://goethe-biographica.de/id/GB02_BR003_0", "http://d-nb.info/gnd/116111631", 0,
				"LB", "Ludwig Ysenburg von Buri", "23. Mai 1764", 4, 1, "GB01 Nr.1", "https://goethe-biographica.de/", "http://d-nb.info/gnd/100063934", 0,
				"JH", "Johann Adam Horn", "Juli 1770", 4, 2, "GB01 Nr.EB018", "https://goethe-biographica.de/",  "http://d-nb.info/gnd/119027682", 0,
				"CB", "Charlotte Buff", "11. September 1772", 4, 3, "GB01 Nr.103", "https://goethe-biographica.de/", "http://d-nb.info/gnd/118638076", 1,
				"JR", "Johann Gottfried Roederer", "21. September 1771", 4, 4, "GB01 Nr.88", "https://goethe-biographica.de/", "http://d-nb.info/gnd/124456359", 0,
				"CG", "Cornelia Goethe", "August 1767", 4, 5, "GB01 Nr.25", "https://goethe-biographica.de/", "http://d-nb.info/gnd/11871791X", 1,
				"FM", "Friedrich Maximilian Moors", "01. Oktober 1766", 5, 1, "GB01 Nr.16", "https://goethe-biographica.de/", "http://d-nb.info/gnd/117135364", 0,

				"EB", "Ernst Wolfgang Behrisch", "12. Oktober 1766", 5, 2, "GB01 Nr.20", "https://goethe-biographica.de/id/GB02_BR003_0", "http://d-nb.info/gnd/116111631", 0,
				"LB", "Ludwig Ysenburg von Buri", "23. Mai 1764", 5, 3, "GB01 Nr.1", "https://goethe-biographica.de/", "http://d-nb.info/gnd/100063934", 0,
				"JH", "Johann Adam Horn", "Juli 1770", 5, 4, "GB01 Nr.EB018", "https://goethe-biographica.de/",  "http://d-nb.info/gnd/119027682", 0,
				"CB", "Charlotte Buff", "11. September 1772", 5, 5, "GB01 Nr.103", "https://goethe-biographica.de/", "http://d-nb.info/gnd/118638076", 1,
				"JR", "Johann Gottfried Roederer", "21. September 1771", 6, 1, "GB01 Nr.88", "https://goethe-biographica.de/", "http://d-nb.info/gnd/124456359", 0,
				"CG", "Cornelia Goethe", "August 1767", 6, 2, "GB01 Nr.25", "https://goethe-biographica.de/", "http://d-nb.info/gnd/11871791X", 1,
				"FM", "Friedrich Maximilian Moors", "01. Oktober 1766", 6, 3, "GB01 Nr.16", "https://goethe-biographica.de/", "http://d-nb.info/gnd/117135364", 0,

				"EB", "Ernst Wolfgang Behrisch", "12. Oktober 1766", 6, 4, "GB01 Nr.20", "https://goethe-biographica.de/id/GB02_BR003_0", "http://d-nb.info/gnd/116111631", 0,
				"LB", "Ludwig Ysenburg von Buri", "23. Mai 1764", 6, 5, "GB01 Nr.1", "https://goethe-biographica.de/", "http://d-nb.info/gnd/100063934", 0,
				"JH", "Johann Adam Horn", "Juli 1770", 7, 1, "GB01 Nr.EB018", "https://goethe-biographica.de/",  "http://d-nb.info/gnd/119027682", 0,
				"CB", "Charlotte Buff", "11. September 1772", 7, 2, "GB01 Nr.103", "https://goethe-biographica.de/", "http://d-nb.info/gnd/118638076", 1,
				"JR", "Johann Gottfried Roederer", "21. September 1771", 7, 3, "GB01 Nr.88", "https://goethe-biographica.de/", "http://d-nb.info/gnd/124456359", 0,
				"CG", "Cornelia Goethe", "August 1767", 7, 4, "GB01 Nr.25", "https://goethe-biographica.de/", "http://d-nb.info/gnd/11871791X", 1,
				"FM", "Friedrich Maximilian Moors", "01. Oktober 1766", 7, 5, "GB01 Nr.16", "https://goethe-biographica.de/", "http://d-nb.info/gnd/117135364", 0,

				"EB", "Ernst Wolfgang Behrisch", "12. Oktober 1766", 8, 1, "GB01 Nr.20", "https://goethe-biographica.de/id/GB02_BR003_0", "http://d-nb.info/gnd/116111631", 0,
				"LB", "Ludwig Ysenburg von Buri", "23. Mai 1764", 8, 2, "GB01 Nr.1", "https://goethe-biographica.de/", "http://d-nb.info/gnd/100063934", 0,
				"JH", "Johann Adam Horn", "Juli 1770", 8, 3, "GB01 Nr.EB018", "https://goethe-biographica.de/",  "http://d-nb.info/gnd/119027682", 0,
				"CB", "Charlotte Buff", "11. September 1772", 8, 4, "GB01 Nr.103", "https://goethe-biographica.de/", "http://d-nb.info/gnd/118638076", 1,
				"JR", "Johann Gottfried Roederer", "21. September 1771", 8, 5, "GB01 Nr.88", "https://goethe-biographica.de/", "http://d-nb.info/gnd/124456359", 0,
				"CG", "Cornelia Goethe", "August 1767", 9, 1, "GB01 Nr.25", "https://goethe-biographica.de/", "http://d-nb.info/gnd/11871791X", 1,
				"FM", "Friedrich Maximilian Moors", "01. Oktober 1766", 9, 2, "GB01 Nr.16", "https://goethe-biographica.de/", "http://d-nb.info/gnd/117135364", 0,

				"EB", "Ernst Wolfgang Behrisch", "12. Oktober 1766", 9, 3, "GB01 Nr.20", "https://goethe-biographica.de/id/GB02_BR003_0", "http://d-nb.info/gnd/116111631", 0,
				"LB", "Ludwig Ysenburg von Buri", "23. Mai 1764", 9, 4, "GB01 Nr.1", "https://goethe-biographica.de/", "http://d-nb.info/gnd/100063934", 0,
				"JH", "Johann Adam Horn", "Juli 1770", 9, 5, "GB01 Nr.EB018", "https://goethe-biographica.de/",  "http://d-nb.info/gnd/119027682", 0,
				"CB", "Charlotte Buff", "11. September 1772", 10, 1, "GB01 Nr.103", "https://goethe-biographica.de/", "http://d-nb.info/gnd/118638076", 1,
				"JR", "Johann Gottfried Roederer", "21. September 1771", 10, 2, "GB01 Nr.88", "https://goethe-biographica.de/", "http://d-nb.info/gnd/124456359", 0,
				"CG", "Cornelia Goethe", "August 1767", 10, 3, "GB01 Nr.25", "https://goethe-biographica.de/", "http://d-nb.info/gnd/11871791X", 1,
				"FM", "Friedrich Maximilian Moors", "01. Oktober 1766", 10, 4, "GB01 Nr.16", "https://goethe-biographica.de/", "http://d-nb.info/gnd/117135364", 0,

				"EB", "Ernst Wolfgang Behrisch", "12. Oktober 1766", 10, 5, "GB01 Nr.20", "https://goethe-biographica.de/id/GB02_BR003_0", "http://d-nb.info/gnd/116111631", 0,
				"LB", "Ludwig Ysenburg von Buri", "23. Mai 1764", 11, 1, "GB01 Nr.1", "https://goethe-biographica.de/", "http://d-nb.info/gnd/100063934", 0,
				"JH", "Johann Adam Horn", "Juli 1770", 11, 2, "GB01 Nr.EB018", "https://goethe-biographica.de/",  "http://d-nb.info/gnd/119027682", 0,
				"CB", "Charlotte Buff", "11. September 1772", 11, 3, "GB01 Nr.103", "https://goethe-biographica.de/", "http://d-nb.info/gnd/118638076", 1,
				"JR", "Johann Gottfried Roederer", "21. September 1771", 11, 4, "GB01 Nr.88", "https://goethe-biographica.de/", "http://d-nb.info/gnd/124456359", 0,
				"CG", "Cornelia Goethe", "August 1767", 11, 5, "GB01 Nr.25", "https://goethe-biographica.de/", "http://d-nb.info/gnd/11871791X", 1,
				"FM", "Friedrich Maximilian Moors", "01. Oktober 1766", 12, 1, "GB01 Nr.16", "https://goethe-biographica.de/", "http://d-nb.info/gnd/117135364", 0,

				"EB", "Ernst Wolfgang Behrisch", "12. Oktober 1766", 12, 2, "GB01 Nr.20", "https://goethe-biographica.de/id/GB02_BR003_0", "http://d-nb.info/gnd/116111631", 0,
				"LB", "Ludwig Ysenburg von Buri", "23. Mai 1764", 12, 3, "GB01 Nr.1", "https://goethe-biographica.de/", "http://d-nb.info/gnd/100063934", 0,
				"JH", "Johann Adam Horn", "Juli 1770", 12, 4, "GB01 Nr.EB018", "https://goethe-biographica.de/",  "http://d-nb.info/gnd/119027682", 0,
				"CB", "Charlotte Buff", "11. September 1772", 12, 5, "GB01 Nr.103", "https://goethe-biographica.de/", "http://d-nb.info/gnd/118638076", 1,
			]
			
			let camera, scene, renderer;
			let controls;

			// leerer objects array
			const objects = [];
			// targets objekt mit leeren Arrays für die vier Darstellungsweisen
			const targets = { table: [], sphere: [], helix: [], grid: [] };

			// Funktionsaufrufe
			init();
			animate();

			function init() {

				// Instanziierung der Kamera
				camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 10000 );
				camera.position.z = 3000;

				// Instanziierung der Szene
				scene = new THREE.Scene();

				// TABLE
                /* 
                bei mehr Elementen überlagern sie sich
                ToDo: Table so anpassen, dass als Rechteck angezeigt, das erweitert werden kann
                Alternativ: Grid verwenden?
                */

				// am Ende immer + 5 weil alle Elemente in einem einzigen langen Array gespeichert sind
				// fünf Index-Positionen weiter beginnt das nächste Element

				/* 
				Erstellt für jedes Element im table Array folgende HTML-Struktur
				Beispiel: H
				<div class="element" 
					 style="background-color: rgba(0, 127, 127, 0.61); 
					 		position: absolute; 
					 		pointer-events: auto; 
					 		user-select: none; 
					 		transform: translate(-50%, -50%) matrix3d(1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1, 0, -1190, 810, 0, 1);"
					 draggable="false">
					 <div class="id">1</div>
					 <div class="initials">H</div>
					 <div class="name">Hydrogen<br>1.00794</div>
				</div>
				*/
				for ( let i = 0; i < table.length; i += 9 ) {

					// <div class="element">
					const element = document.createElement( 'div' );
					element.className = 'element';
					// Math.random legt einen zufälligen Alpha-Wert für die Hintergrundfarbe fest
					// element.style.backgroundColor = 'rgba(255,0,0,' + ( Math.random() * 0.5 + 0.25 ) + ')';
					// ohne Math.random
					
					if(table[i + 8]){
						element.style.backgroundColor = 'rgb(237, 125, 49, 0.5)';
					} else {
						element.style.backgroundColor = 'rgb(231, 230, 230, 0.5)';
					};
					//element.style.backgroundColor = 'rgb(231, 230, 230, 0.5)';
					element.setAttribute("onclick", "window.open(' " + table[i + 6] +"')");

					// <div class="id">
					const id = document.createElement( 'div' );
					id.className = 'id';
					id.textContent = table[i + 5];
					element.appendChild( id );

					// <div class="initials">
					const initials = document.createElement( 'div' );
					initials.className = 'initials';
					initials.textContent = table[ i ];
					initials.setAttribute("onclick", "window.open(' " + table[i + 7] +"')");
					element.appendChild( initials );

					// <div class="name">
					const name = document.createElement( 'div' );
					name.className = 'name';
					name.innerHTML = table[ i + 1 ] ;
					name.setAttribute("onclick", "window.open(' " + table[i + 7] +"')");
					element.appendChild( name );

					// <div class="date">
					const date = document.createElement( 'div' );
					date.className = 'date';
					date.innerHTML = table[ i + 2 ] ;
					element.appendChild( date );

					// erstellt ein CSS3DObjekt aus Variable element
					// die Anfangsposition der Elemente wird zufällig festgelegt
					const objectCSS = new CSS3DObject( element );
					objectCSS.position.x = Math.random() * 4000 - 2000;
					objectCSS.position.y = Math.random() * 4000 - 2000;
					objectCSS.position.z = Math.random() * 4000 - 2000;
					scene.add( objectCSS );

					// alle objectCSS elemente werden in den objects Array aufgenommen
					objects.push( objectCSS );

					//

					// fixe Positionierung in der Table-Ansicht
					const object = new THREE.Object3D();
					// Wie kommt man auf diese Zahlen?
					object.position.x = ( table[ i + 3 ] * 140 ) - 1330;
					object.position.y = - ( table[ i + 4 ] * 180 ) + 990;

					// Objekte werden in das table Array des targets-Objekts aufgenommen
					targets.table.push( object );

				}

				// SPHERE
                /* 
                Kann viele Elemente beinhalten, erst ab ca. 400 wird es kritisch, weil sich die Elemente überlagern.
                14 Elemente als Minimum für Sphärenansicht

                ToDo: Aufspaltung in mehrere Kugeln je nach Zeitfilter
                */


				// Instanziierung eines leeren 3D-Vektors
				const vector = new THREE.Vector3();

				// Loop über Objects Array
				for ( let i = 0, l = objects.length; i < l; i ++ ) {

					// Berechnung von Winkeln, die für die Positionierung in sphärischem Koordinatensystem notwendig sind
					// Basiert auf Index und Länge des Objekt-Arrays
					// phi = polar angle in radians from the y (up) axis
					// theta = equator angle in radians around the y (up) axis
					const phi = Math.acos( - 1 + ( 2 * i ) / l );
					const theta = Math.sqrt( l * Math.PI ) * phi;

					const object = new THREE.Object3D();

					// Objekt (Element) wird in einem sphärischem Koordinatensystem d.h. auf der Kugel platziert
					// https://en.wikipedia.org/wiki/Spherical_coordinate_system
					// Mehr Infos zu sphärischen Koordinaten in three.js: https://threejs.org/docs/index.html?q=vector#api/en/math/Spherical
					// Parameter: radial distance from point to origin (Mittelpunkt), phi, theta
					object.position.setFromSphericalCoords( 800, phi, theta );
					
					// im Vektor wird die Position des Objekts gespeichert und skalar mit 2 multipliziert
					// warum?
					vector.copy( object.position ).multiplyScalar( 2 );

					// Objekt und Vektor schauen sich an
					// Objekt wird so rotiert, dass siene interne Z-Achse zum Vektor zeigt
					// was auch immer das heißen soll???
					object.lookAt( vector );

					// Objekt wird zum Sphären Array im Targets-Objekt hinzugefügt
					targets.sphere.push( object );

				}

				// HELIX
                /* funktioniert für beliebige Anzahl an aufeinanderfolgenden Elementen
                ToDo: Anpassung von Anzahl der Umdrehungen gemäß Zeitfilter
                ToDo: Was passiert, wenn es Lücken im Zeitverlauf gibt? Leere /schwarze Elemente als PLatzhalter?
                 */
				
                for ( let i = 0, l = objects.length; i < l; i ++ ) {

					const theta = i * 0.175 + Math.PI; // Wie groß sind die Abstände zwischen den Elementen? (links-rechts)
					const y = - ( i * 15 ) + 450; // Wie groß sind die Abstände zwischen den Elementen? (oben-unten)

					const object = new THREE.Object3D();

					// Objekt wird in einem zylindrischen Koordinatensystem positioniert (Helix hat die Form eines Zylinders)
					// Mehr Infos zu zylindrischen Koordinaten in three.js: https://threejs.org/docs/index.html?q=vector#api/en/math/Cylindrical
					// Parameter: 
					// radius (distance from the origin to a point in the x-z plane)
					// theta = counterclockwise angle in the x-z plane measured in radians from the positive z-axis
					// y = height above the x-z plane
					object.position.setFromCylindricalCoords( 900, theta, y );

					vector.x = object.position.x * 2;
					vector.y = object.position.y;
					vector.z = object.position.z * 2;

					object.lookAt( vector );

					targets.helix.push( object );

				}

				// GRID
                // macht einen 5 x 5 Grid

				/* for ( let i = 0; i < objects.length; i ++ ) {

					const object = new THREE.Object3D();
					// ???
					object.position.x = ( ( i % 5 ) * 400 ) - 800;
					object.position.y = ( - ( Math.floor( i / 5 ) % 5 ) * 400 ) + 800;
					object.position.z = ( Math.floor( i / 25 ) ) * 1000 - 2000;

					targets.grid.push( object );

				} */

				// Renderer

				renderer = new CSS3DRenderer();
				renderer.setSize( window.innerWidth, window.innerHeight );
				// im div mit id = container werdend die Objekte gerendert
				document.getElementById( 'container' ).appendChild( renderer.domElement );

				// Funktionalitäten der Buttons (Ansichtswechsel)

				controls = new TrackballControls( camera, renderer.domElement );
				controls.minDistance = 500;
				controls.maxDistance = 6000;
				controls.addEventListener( 'change', render );

				const buttonTable = document.getElementById( 'table' );
				buttonTable.addEventListener( 'click', function () {

					transform( targets.table, 2000 );

				} );

				const buttonSphere = document.getElementById( 'sphere' );
				buttonSphere.addEventListener( 'click', function () {

					transform( targets.sphere, 2000 );

				} );

				const buttonHelix = document.getElementById( 'helix' );
				buttonHelix.addEventListener( 'click', function () {

					transform( targets.helix, 2000 );

				} );

				/* const buttonGrid = document.getElementById( 'grid' );
				buttonGrid.addEventListener( 'click', function () {

					transform( targets.grid, 2000 );

				} ); */

				transform( targets.table, 2000 );

				//

				window.addEventListener( 'resize', onWindowResize );

			}

			// Funktion, welche die Elemente auf die neue Position verschiebt
			function transform( targets, duration ) {

				TWEEN.removeAll();

				for ( let i = 0; i < objects.length; i ++ ) {

					const object = objects[ i ];
					const target = targets[ i ];

					new TWEEN.Tween( object.position )
						.to( { x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration + duration )
						.easing( TWEEN.Easing.Exponential.InOut )
						.start();

					new TWEEN.Tween( object.rotation )
						.to( { x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration + duration )
						.easing( TWEEN.Easing.Exponential.InOut )
						.start();

				}

				new TWEEN.Tween( this )
					.to( {}, duration * 2 )
					.onUpdate( render )
					.start();

			}

			function onWindowResize() {

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );

				render();

			}

			function animate() {

				requestAnimationFrame( animate );

				TWEEN.update();

				controls.update();

			}

			function render() {

				renderer.render( scene, camera );

			}
