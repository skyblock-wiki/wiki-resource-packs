import { resourcepack, resourcepack_extra_ui, Folder, packFolder, extraUiFolder } from './wiki-resource-pack-map.mjs'
import fs from 'fs'

/////////////////////////////
//#region Constants
/////////////////////////////
const rootUrl = "https://skyblock-wiki.github.io/wiki-resource-packs/Hypixel+";

/////////////////////////////
//#region Flatten Data
/////////////////////////////

function makeFinalizedDataObj(packPrefix, packFilename, selectors) {
	if(!selectors) return null; // if it's null/undefined/false/empty string skip
	selectors = Array.isArray(selectors) ? selectors.flat() : [selectors];
	if(!selectors.length) return null;
	
	return { selectors, relativePath:`${packPrefix}/${packFilename}.png` }
}

/**
 * @param {string} prefix
 * @param {Folder} folder
 * @returns { { selectors:string[], relativePath:string }[] }
 */
function flattenPackFolder(prefix, folder) {
	// Add all files to flat list
	return Object.entries(folder.contents).flatMap(([itemId,folderItem]) => 
		// If folder, recursively continue / else it's a file
		folderItem.isFolder ?
			flattenPackFolder(`${prefix}${itemId}`, folderItem)
			: makeFinalizedDataObj(prefix, itemId, folderItem)
	).filter(o=>!!o);
}

/////////////////////////////
//#region Check if files exist / update their file extension if needed
/////////////////////////////

/**
 * Checks if png exists; if it doesn't, fallback to gif; if it also doesn't exist, return null to indicate failure
 * @param {string} relativePath 
 * @returns string | null
 */
function getCorrectFilePath(relativePath) {
	let filePath = `./${relativePath}`;
	if(fs.existsSync(filePath)) return relativePath;
	filePath = filePath.replace('.png', '.gif');
	if(fs.existsSync(filePath)) return relativePath.replace('.png', '.gif');
	return null;
}

export const flattenedData = [...flattenPackFolder(packFolder, resourcepack), ...flattenPackFolder(extraUiFolder, resourcepack_extra_ui)];

const cssLines = [], errors = [];
flattenedData.forEach(({ selectors, relativePath:relativePathIn })=>{
	const relativePath = getCorrectFilePath(relativePathIn);
	if(!relativePath) {
		errors.push(`PNG/GIF not found: ${relativePathIn}`);
		return;
	}
	
	const fileUrl = `${rootUrl}/${relativePath}`;
	cssLines.push(`${selectors.join(', ')} { content: url('${fileUrl}') }`);
});

/////////////////////////////
//#region Error Handling
/////////////////////////////
if(errors.length > 0) {
	console.error(`"=== ${errors.length} ERRORS DETECTED! ===\nThe following files were not found:"`);
	console.error(errors.join('\n'));
	console.error(`"=== ${errors.length} ERRORS DETECTED! ===\nThe following files were not found:"`);
	process.exit();
}

/////////////////////////////
//#region Write CSS to file
/////////////////////////////

cssLines.unshift('/* Script for generating this CSS is at: https://github.com/skyblock-wiki/wiki-resource-packs/tree/main/Hypixel+ */');
const css = cssLines.join('\n');

if (!fs.existsSync('./dist')) fs.mkdirSync('./dist')
fs.writeFile('./dist/generated.css', css, err => {
    if (err) throw err;
    console.log(`CSS has been generated inside "dist" folder - ${cssLines.length} items parsed`);
})