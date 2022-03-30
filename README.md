# threejs-praxisprojekt-goethe
This repository is related to a student project within the *M.A. Digitale Methodik in den Geistes- und Kulturwissenschaften* *(Digital Humanities)* at the University of Mainz. Here you can find the outcome of this project - a prototypical 3D visualization for exploring data related to Goethe's letters. The visualization was implemented with [three.js](https://threejs.org/). For the data preparation and preprocessing steps XQuery and [ramda.js](https://ramdajs.com/) were used. The research project [PROPYLÄEN](https://goethe-biographica.de/) kindly provided the XML data for this student project.

The design of the visualization was inspired by the concept of *PolyCubes* (Raum-Zeit-Kuben) by Eva Mayr and Florian Windhager (see article [Once Upon a Spacetime]( https://doi.org/10.3390/ijgi7030096 )) as well as by [*periodic table*](https://github.com/mrdoob/three.js/blob/master/examples/css3d_periodictable.html) from the three.js examples collection which uses three.js to represent the elements of the periodic table as sphere and helix.

## What You Can Explore

➡️ [3D visualization of Goethe's letters](https://momo-ohneende.github.io/threejs-praxisprojekt-goethe/final/index.html)

➡️ [Script documentation](https://momo-ohneende.github.io/threejs-praxisprojekt-goethe/docs/index.html)

## What to Find in the Visualization

**Data:** letters written by Johann Wolfgang von Goethe (metadata) 

**Time span:** 1764-1772

**Places:** Frankfurt, Worms, Darmstadt, Wiesbaden

**Views:**
* Map view (as kugel, sphere, helix)
* Single place view (as sphere) → click on placename in map view

**Filter categories:**
* date range
* place
* document type (now only letters, in the future diary entries could be included)
* letter status (sent, received)
* sex of recipient

## What to Find in This Repo
`\bundler` contains the webpack configuration files.

`\docs` contains a JsDoc documentation of the visualization scripts that create map view and single place view.  

`\data_prep` contains everything related to data cleaning, preparation and aggregation. The subfolders `01_xquery` and `02_ramda` include input data, scripts and output of the two main data preparation steps. 

`\01_xquery`
* `\input` is a collection xml files of Goethe's letters (not part of this repo).
* `\script` contains the xquery script that retrieves relevant data from the xml files and saves them as JSON.
* `\output` contains the JSON output files.

`\02_ramda`
* `\input` includes the JSON files created via XQuery in the step before. `gb_01_compact_array.json` contains the same data as `gb_01_compact.json` but the outer object structure is removed, leaving only the array as input for the ramda.js data prepareation scripts.
* `\scripts` contains the data preparation scripts used to clean, filter and enhance the data and thus prepare it for its use within the visualization.
* `\output_indexjs` contains all the output files of the index.js data preparation script.
* `\output_mergejs` contains the result of merging the files `letters_json_grouped_received.json` and `letters_json_grouped_sent.json` created in the step before. The merged file contains the final data to be loaded in the visualization.

`\src` contains the source files for map view and single place view. In dev mode - i.e. with `npm run dev` - only one of the two views can be displayed at the same time depending on the settings in `webpack.common.js`. 

`\dist` is where the output of the most recent build is stored. With each new build the content is overwritten. Builds for single place view and map view have to be created separately. (not part of this repo)

`\final` contains the ready-to-view builds of map view and single view. By starting a python webserver from this folder locally on your machine, the visualization can be accessed.

## How to View the Visualization Locally
The bundled version of the visualization that is ready to view can be found in the folder `\final`.

To start the visualization, you need a webserver, e.g. from Python.

1. Clone the repository

2. Navigate to `\final`

3. Start the webserver: `python -m http.server 8000 --bind 127.0.0.1`

4. Open the visualization in your browser: `http://127.0.0.1:8000/`

5. Have fun exploring Goethe's letters! ✉️ ✉️ ✉️ 