# threejs-experiments
This repository contains experiments in 3D visualization with three.js.

## What is visualized?

**Data:** Letters written by Johann Wolfgang von Goethe (metadata) 

**Time span:** 1776-1772

**Places:** Frankfurt, Worms, Darmstadt, Wiesbaden

## Context

Student project within the M.A. "Digitale Methodik in den Geistes- und Kulturwissenschaften" (University Mainz)

## Branches

**Main Branch:** contains the final version of the student project

**Experiments Branch:** contains additional experimential material created over the course of the project and earlier versions

Basiert auf: [https://github.com/hou2zi0/threejs-boilerplate](https://github.com/hou2zi0/threejs-boilerplate)

# How to view the visualization
The bundled version of the visualization that is ready to view can be found in the folder `\final`.

To start the visualization, you need a webserver, e.g. from python.

1.) Navigate to `\final`

2.) Start the webserver: `python -m http.server 8000 --bind 127.0.0.1`

3.) Open the visualization in your browser: `http://127.0.0.1:8000/`

4.) Have fun exploring Goethes letters! ✉️ ✉️ ✉️ 


## What to find where in this repo
The `\bundler` folder contains the webpack configuration files.

The `\data_prep` folder contains everything related to data cleaning, preparation and aggregation. The subfolders `01_xquery` and `02_ramda` include input data, scripts and output of the two main data preparation steps. 

`01_xquery`
* `input` is a collection xml files of Goethe's letters (not part of this repo)
* `script` contains the xquery script that retrieves the relevant data form the xml files and saves them as JSON
* `output` contains the JSON output files

`02_ramda`
* `input` JSON files created via xquery in the step before. `gb_01_compact_array.json` includes the same data as `gb_01_compact.json` but the outer object structure is removed, leaving only the array as input for the ramda.js data prepareation scripts.
* `scripts` contains the data preparation scripts used to clean, filter and enhance the data and thus prepare it for its use within the visualization.
* `outputindexjs` contains all the output files of the index.js data preparation script.
* `outputmergejs` contains the result of merging the files `letters_json_grouped_received.json` and `letters_json_grouped_sent.json` created in the step before. The merged file contains the final data to be loaded in the visualization.

The `\src` folder contains the source files for map view and single place view. In dev mode - i.e. with `npm run dev` - only one of the two views can be shown at the same time depending on the settings in `webpack.common.js`. 

The `\dist` folder is where the output of the most recent build is stored. With each new build the content is overwritten. Builds for single place view and map view have to be created separately.

The `\final` folder contains the ready-to-view builds of map view and single view. By starting a python webserver from this folder, the visualization can be viewed - including the interaction of map and single view.

