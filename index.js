const ocSouthSizeFactor = 100
const ocSouthImage = new Image();
ocSouthImage.src = 'OCSouth.png';
const ocSouthMap = document.getElementById("OCSouthMap");
const ocSouthCTX = ocSouthMap.getContext('2d');

/**
 * Converts in-game map coordinates to pixel coordinates on the map texture.
 * 
 * @param {number} mapX - In-game map X coordinate (e.g., 5.4)
 * @param {number} mapY - In-game map Y coordinate (e.g., 7.5)
 * @param {number} mapSizeFactor - Map size factor (e.g., 100, 200, etc.)
 * @param {boolean} isSmallMap - Whether the map is 1024x1024 instead of 2048x2048
 * @returns {{x: number, y: number}} Pixel coordinates on the texture
 */
function getPixelFromGameMapCoordinates(mapX, mapY, mapSizeFactor, isSmallMap = false) {
    const x = ((mapX - 1) / 2) * mapSizeFactor;
    const y = ((mapY - 1) / 2) * mapSizeFactor;

    // Adjust if using 1024x1024 texture instead of 2048x2048
    const scale = isSmallMap ? 0.5 : 1.0;

    return {
        x: x * scale,
        y: y * scale
    };
}

function loadLocationData() {
    fetch('locations.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load JSON: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            drawAllIcons(data);
        })
        .catch(error => {
            console.error("Error loading JSON:", error);
        });
}

function drawAllIcons(data) {
    for (const iconName in data) {
        const { locations } = data[iconName];
        if (!Array.isArray(locations)) continue;

        const iconImg = new Image();
        iconImg.src = `${iconName}.png`; // Assumes icon image files match key names

        iconImg.onload = function () {
            for (const loc of locations) {
                const { x, y } = getPixelFromGameMapCoordinates(loc.x, loc.y, ocSouthSizeFactor);

                // Compute scale and offset
                const scale = Math.min(ocSouthMap.width / ocSouthImage.width, ocSouthMap.height / ocSouthImage.height);
                const drawWidth = ocSouthImage.width * scale;
                const drawHeight = ocSouthImage.height * scale;
                const offsetX = (ocSouthMap.width - drawWidth) / 2;
                const offsetY = (ocSouthMap.height - drawHeight) / 2;

                // Final position for icon
                const screenX = offsetX + x * scale;
                const screenY = offsetY + y * scale;

                const iconSize = 24; // Size of the icon in pixels

                // Center icon on coordinate
                ocSouthCTX.drawImage(iconImg, screenX - iconSize / 2, screenY - iconSize / 2, iconSize, iconSize);
            }
        };
    }
}


function resizeAndDraw() {
	ocSouthMap.width = window.innerWidth;
	ocSouthMap.height = window.innerHeight;
	ocSouthCTX.clearRect(0, 0, ocSouthMap.width, ocSouthMap.height);
	const scale = Math.min(ocSouthMap.width / ocSouthImage.width, ocSouthMap.height / ocSouthImage.height);
	const drawWidth = ocSouthImage.width * scale;
	const drawHeight = ocSouthImage.height * scale;
	const offsetX = (ocSouthMap.width - drawWidth) / 2;
	const offsetY = (ocSouthMap.height - drawHeight) / 2;
	ocSouthCTX.drawImage(ocSouthImage, offsetX, offsetY, drawWidth, drawHeight);
	loadLocationData();
}

ocSouthImage.onload = resizeAndDraw;
window.addEventListener('resize', resizeAndDraw);