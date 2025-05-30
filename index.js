const canvas = document.getElementById("Map");
const canvasCTX = canvas.getContext('2d');
const mapSelector = document.getElementById("mapSelector");

let mapImage = new Image();
let currentMapKey = localStorage.getItem("selectedMapKey");
let allMapData = null;
let currentMapData = null;

function getPixelFromGameMapCoordinates(mapX, mapY, mapSizeFactor, isSmallMap = false) {
    const x = ((mapX - 1) / 2) * mapSizeFactor;
    const y = ((mapY - 1) / 2) * mapSizeFactor;
    const scale = isSmallMap ? 0.5 : 1.0;
    return { x: x * scale, y: y * scale };
}

function loadLocationData() {
    fetch('locations.json')
        .then(response => {
            if (!response.ok) throw new Error(`Failed to load JSON: ${response.status}`);
            return response.json();
        })
        .then(data => {
            allMapData = data;
            // Auto-select first map if none selected
            currentMapKey = currentMapKey || Object.keys(data)[0];
            populateMapSelector(Object.keys(data));
            setMap(currentMapKey);
        })
        .catch(error => console.error("Error loading JSON:", error));
}

function populateMapSelector(mapKeys) {
    mapSelector.innerHTML = ""; // Clear any existing options
    mapKeys.forEach(key => {
        const option = document.createElement("option");
        option.value = key;
        option.textContent = key;
        mapSelector.appendChild(option);
    });
    mapSelector.value = currentMapKey;
}

function setMap(mapKey) {
    if (!allMapData || !allMapData[mapKey]) return;

    currentMapKey = mapKey;
	localStorage.setItem("selectedMapKey", mapKey);
    currentMapData = allMapData[mapKey];
    mapImage.src = `zones/${currentMapKey}.png`;
}

function drawAllIcons() {
    const { sizeFactor, icons, isSmallMap } = currentMapData;
    const scale = Math.min(canvas.width / mapImage.width, canvas.height / mapImage.height);
    const drawWidth = mapImage.width * scale;
    const drawHeight = mapImage.height * scale;
    const offsetX = (canvas.width - drawWidth) / 2;
    const offsetY = (canvas.height - drawHeight) / 2;

    icons.forEach(iconSet => {
        for (const iconName in iconSet) {
            const { locations } = iconSet[iconName];
            if (!Array.isArray(locations)) continue;

            const iconImg = new Image();
            iconImg.src = `${iconName}.png`;

            iconImg.onload = () => {
                for (const loc of locations) {
                    const { x, y } = getPixelFromGameMapCoordinates(loc.x, loc.y, sizeFactor, isSmallMap);
                    const screenX = offsetX + x * scale;
                    const screenY = offsetY + y * scale;
                    const iconSize = 24;
                    canvasCTX.drawImage(iconImg, screenX - iconSize / 2, screenY - iconSize / 2, iconSize, iconSize);
                }
            };
        }
    });
}

function resizeAndDraw() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvasCTX.clearRect(0, 0, canvas.width, canvas.height);

    const scale = Math.min(canvas.width / mapImage.width, canvas.height / mapImage.height);
    const drawWidth = mapImage.width * scale;
    const drawHeight = mapImage.height * scale;
    const offsetX = (canvas.width - drawWidth) / 2;
    const offsetY = (canvas.height - drawHeight) / 2;

    canvasCTX.drawImage(mapImage, offsetX, offsetY, drawWidth, drawHeight);

    if (currentMapData) {
        drawAllIcons();
    }
}

// Event: image ready
mapImage.onload = resizeAndDraw;

// Event: window resized
window.addEventListener('resize', resizeAndDraw);

// Event: dropdown changed
mapSelector.addEventListener('change', () => {
    setMap(mapSelector.value);
});

// Kick off initial data load
loadLocationData();
