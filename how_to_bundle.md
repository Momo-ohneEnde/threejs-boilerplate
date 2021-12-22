# How to bundle

## What to find where
The `\src` folder contains the source files for map view and single place view. In dev mode - i.e. with `npm run dev` - only one of the two views can be shown at the same time depending on the settings in `webpack.common.js`. 

The `\dist` folder is where the output of the most recent build is stored. With each new build the content is overwritten. Builds for single place view and map view have to be created separately.

The `\final` folder contains the ready-to-view builds of map view and single view. By starting a python webserver from this folder, the visualization can be viewed - including the interaction of map and single view.

## Step by step bundling
1. Make sure the placeName variable in single.js is set to: `window.location.hash.slice(1)`. When the two views interact, the name of the place for which to open the single place view is stored in the url. However, in dev mode the placename variable needs to be set to a specific string value e.g. 'Frankfurt'. Otherwise nothing will be displayed, since the interaction does not work.

    <pre>let placename = window.location.hash.slice(1);</pre>. 

2. Bundle map view:
    * choose the following settings in the `webpack.common.js`

         <pre>entry: path.resolve(__dirname, '../src/script.js')

        template: path.resolve(__dirname, '../src/index.html')
        </pre>

    * run `npm run build`
    * the output should be found in `\dist`

3. In `\dist`: Rename the bundled js file to `index.js` and copy the content of the folder to `\final`. The bundled license and map files are not needed.

4. Bundle single place view:
    * choose the following settings in the `webpack.common.js`

         <pre>entry: path.resolve(__dirname, '../src/single.js')
        
        template: path.resolve(__dirname, '../src/single.html')
        </pre>

    * run `npm run build`
    * the output should be found in `\dist`
5. In `\dist`: Rename the bundled js file to `single.js` and the html-file to `single.html`. Copy both into `\final`.

6. Open `index.html` and `single.html`and replace the name of the linked js-files with `index.js` or `single.js`. Example: `<script defer="defer" src="index.js"></script>`

7. Now everything should be set up. Start the webserver, view the visualization and check whether it worked (see README).
