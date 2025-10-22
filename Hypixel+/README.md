
## Update file map
When adding / modifiying files, `src/wiki-resource-pack-map.mjs` must be updated for the change be be reflected in the generated css file.

`index.js` is where all the generation logic is stored, and should not needed to be updated when updating the pack

## Generate CSS
To generate the CSS, [node.js](https://nodejs.org/) must be installed on your machine, and then you can run `npm run generate`, which will create a css file in a `dist` folder