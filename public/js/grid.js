import Players from "./player.js"

async function setup(){
	const map = document.getElementById("map");
	const combat = document.getElementById("combat");
	
	await loadTerrainIndex();

	drawGrid(combat, 8, 10);
	drawGrid(map, 31, 14);
	
	p.player1.areas.map.position = findHex("map",  ...offsetToCube(20, 13));
	p.player1.areas.combat.position = findHex("combat", ...offsetToCube(2, 5));

	p.createPlayer(map, "player1", "../imgs/monsters/dragon.png")
	
	document.addEventListener("keydown", (event) => { 
		switch (event.key) {
			case "m":
				if (selectedHex) {
					p.movePlayerTo(selectedHex, "player1");
					const path = selectedHex.closest("svg").querySelector("#pathArrow");
    				if (path) path.remove();
			};
				break;
			case "t":
				if (selectedHex) {changeTerrain()};
				break;
		}
		
	});
}

const hexMap = new Map();
const terrainIndex = {
	passable: new Set(),
	impassable: new Set()
}
let terrainIndexCoords = {};

let path = []

let selectedHex = null;

export function getTerrain() {
	return terrainIndex
}

async function loadTerrainIndex() {
    try {
        const res = await fetch("/load/terrainData.json");

        if (!res.ok) {
            console.error("Server returned:", res.status);
            return;
        }

        const data = await res.json();
        console.log("Loaded terrain data:", data);

        // Rebuild the index
        terrainIndexCoords = {};

        for (const [areaName, terrains] of Object.entries(data)) {
            terrainIndexCoords[areaName] = {};

            for (const [terrainName, coordsList] of Object.entries(terrains)) {
                terrainIndexCoords[areaName][terrainName] = new Set(
					coordsList.map(c => c.join(","))
				);				
            }
        }

        console.log("Rebuilt terrainIndexCoords:", terrainIndexCoords);

    } catch (err) {
        console.error("Load failed:", err);
    }
}



function getTerrainForCoords(areaName, coords) {
    const terrains = terrainIndexCoords[areaName];
    if (!terrains) return null;

    const key = Array.isArray(coords) ? coords.join(",") : coords;

    for (const [terrainName, coordSet] of Object.entries(terrains)) {
        if (coordSet.has(key)) {
            return terrainName;
        }
    }

    return null;
}



function drawGrid(display, rowsTarget, columns) {
	let svg = display;
	
	//Hex size adjustment, delta = top width deviation
	const delta = -4;
	const s = 100 + delta / 2;
	const h = Math.sqrt(3) * s;
	const mid = h / 2;
	
	for (let rowsCurrent = 0; rowsCurrent < rowsTarget; rowsCurrent++) {
		for (let i = 0; i < columns; i++) {
			let polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
			polygon.setAttribute("points",
				(50 - delta/2 + i * (3*s)) + "," + (0 + rowsCurrent * h) + " " +
				(150 + delta/2 + i * (3*s)) + "," + (0 + rowsCurrent * h) + " " +
				(200 + delta/2 + i * (3*s)) + "," + (mid + rowsCurrent * h) + " " +
				(150 + delta/2 + i * (3*s)) + "," + (h + rowsCurrent * h) + " " +
				(50 - delta/2 + i * (3*s)) + "," + (h + rowsCurrent * h) + " " +
				(0  - delta/2 + i * (3*s)) + "," + (mid + rowsCurrent * h)
			);

			//Coordinates
			polygon.dataset.offsetY = rowsCurrent;
			polygon.dataset.offsetX = i * 2;

			let titleEl = document.createElementNS("http://www.w3.org/2000/svg", "title");
			titleEl.textContent = `Row ${rowsCurrent}, Col ${i * 2}`;
			polygon.appendChild(titleEl);
			
			setupHex(polygon, display);

		}
		for (let i = 0; i < columns; i++) {
			let polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
			polygon.setAttribute("points", 
				(50 - delta/2 + 1.5*s + i * (3*s)) + "," + (0 + mid + rowsCurrent * h) + " " +
				(150 + delta/2 + 1.5*s + i * (3*s)) + "," + (0 + mid + rowsCurrent * h) + " " +
				(200 + delta/2 + 1.5*s + i * (3*s)) + "," + (mid + mid + rowsCurrent * h) + " " +
				(150 + delta/2 + 1.5*s + i * (3*s)) + "," + (h + mid + rowsCurrent * h) + " " +
				(50 - delta/2 + 1.5*s + i * (3*s)) + "," + (h + mid + rowsCurrent * h) + " " +
				(0  - delta/2 + 1.5*s + i * (3*s)) + "," + (mid + mid + rowsCurrent * h)
			);
			
			polygon.dataset.offsetY = rowsCurrent;
			polygon.dataset.offsetX = i * 2 + 1;
			
			let titleEl = document.createElementNS("http://www.w3.org/2000/svg", "title");
			titleEl.textContent = `Row ${rowsCurrent}, Col ${i * 2 + 1}`;
			polygon.appendChild(titleEl);
			
			setupHex(polygon, display);
		}		
	}
}

function setupHex(polygon, display) {
	//Style
	polygon.setAttribute("pointer-events", "all");
	polygon.setAttribute("stroke-width", "2");
	
	const cube = offsetToCube(Number(polygon.dataset.offsetX), Number(polygon.dataset.offsetY));
	polygon.dataset.cube = JSON.stringify(cube);
	
	const key = `${display.id},${cube[0]},${cube[1]},${cube[2]}`;
	Object.keys(cube_direction_vectors).forEach((dir) => {
		const coords = findNeigbor(display.id, polygon, dir);
		polygon.dataset["neighbor" + dir] = `${coords[0]},${coords[1]},${coords[2]},${coords[3]}`;
	})
	
	

	polygon.dataset.grid = display.id;
	const terrain = getTerrainForCoords(display.id, cube)
	polygon.dataset.terrain = terrain;
	terrainIndex[terrain].add(polygon);

	switch (terrain) {
		case "passable":
			setTerrainPassable(polygon)
			break;
		case "impassable":
			setTerrainImpassable(polygon)
			break;
	}
	
	polygon.addEventListener("click", onHexClick);
	display.appendChild(polygon);
	
	hexMap.set(key, polygon);
}

const cube_direction_vectors = {
	SE: {q: +1, r: 0, s: -1},
	
	NE: {q: +1, r: -1, s: 0},
	
	NN: {q: 0, r: -1, s: +1},
	
	NW: {q: -1, r: 0, s: +1},
	
	SW: {q: -1, r: +1, s: 0},
	
	SS: {q: 0, r: +1, s: -1},
};

function findHex(grid, q, r, s) {
	return hexMap.get(`${grid},${q},${r},${s}`);
}

function findNeigbor(grid, hex, direction) {
	const [q, r, s] = JSON.parse(hex.dataset.cube);
	const vector = cube_direction_vectors[direction];
	return [grid, q + vector["q"], r + vector["r"], s + vector["s"]];
};

export function offsetToCube(x, y) {
	const oddEven = x & 1;
	const q = x || 0;
	const r = y - (x - oddEven) / 2 || 0;
	const s = -q - r || 0;
	return [q, r, s];
}


function changeTerrain() {
	const hex = selectedHex;
	const terrain = hex.dataset.terrain
	switch (terrain) {
		case "passable":
			setTerrainPassable(hex)
			break;
		case "impassable":
			setTerrainImpassable(hex)
			break;
	}
}

function setTerrainImpassable(hex) {
	terrainIndex.passable.delete(hex);
	terrainIndex.impassable.add(hex);
	hex.dataset.terrain = "impassable";
	hex.setAttribute("fill", "transparent");
	hex.setAttribute("stroke", "transparent");
	hex.removeEventListener("mouseover", selectedHex);
}

function setTerrainPassable(hex) {
	terrainIndex.impassable.delete(hex);
	terrainIndex.passable.add(hex);
	hex.dataset.terrain = "passable";
	hex.setAttribute("fill", "transparent");
	hex.setAttribute("stroke", "black");
	hex.addEventListener("mouseover", selectedHex);
}

function onHexClick(event) {
    const hex = event.currentTarget;
    const grid = hex.closest("svg").id;

//!! Needs update once multiple players

    const start = p.player1.areas[grid].position;
	
	if (selectedHex) {
		selectedHex.classList.remove("selected");
		selectedHex.setAttribute("stroke", "black");
	}
	
	selectedHex = hex;
	hex.classList.add("selected")
	hex.setAttribute("stroke", "red");
	
    findPath(grid, start, hex);

}


function findPath(grid, start, end) {
	path = [];
	let visited = [start];
	let frontier = [];
	let current = start;
	const vectors = Object.keys(cube_direction_vectors);
	do {
		if (start == end) {break};
		vectors.forEach(dir => {
			const neigh = hexMap.get(current.dataset["neighbor" + dir]);
			if (neigh && visited.indexOf(neigh) === -1 && neigh.dataset.terrain === "passable") {
					visited.push(neigh);
					frontier.push(neigh);
					neigh.dataset.from = current.dataset.cube;
			};
		});
		visited.push(current);
		if (frontier.length <= 0 || frontier.indexOf(end) != -1) {break};
		if (frontier[0]) {
			current = frontier[0];
			frontier.splice(0, 1);
		};
	} while (visited.indexOf(end) === -1);
	if (frontier.indexOf(end) != -1) {
		let pathTile = end;
		while (pathTile != start) {
			path.push(pathTile);
			pathTile = findHex(grid, ...JSON.parse(pathTile.dataset.from));
		}
		path.push(start);
		path.reverse();

		const svg = document.getElementById(grid);
		drawSmoothPath(svg);
	}

}

export function getHexCenter(hex) {
    const pts = hex.getAttribute("points").trim().split(" ");
    let xs = 0, ys = 0;

    pts.forEach(p => {
        const [x, y] = p.split(",").map(Number);
        xs += x;
        ys += y;
    });

    return { x: xs / pts.length, y: ys / pts.length };
}


function drawSmoothPath(svg) {
    // Remove old path if it exists
    const old = svg.querySelector("#pathArrow");
    if (old) old.remove();

    if (path.length < 2) return;

    // Get center points
    const pts = path.map(hex => getHexCenter(hex));

    // Build a smooth quadratic Bézier path
    let d = `M ${pts[0].x} ${pts[0].y}`;

    for (let i = 1; i < pts.length; i++) {
        const p0 = pts[i - 1];
        const p1 = pts[i];

        // Midpoint between p0 and p1
        const mx = (p0.x + p1.x) / 2;
        const my = (p0.y + p1.y) / 2;

        // Use midpoint as control point for smoothing
        d += ` Q ${p0.x} ${p0.y}, ${mx} ${my}`;
    }

    // Create arrow marker
    let defs = svg.querySelector("defs");
    if (!defs) {
        defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        svg.appendChild(defs);
    }

    defs.innerHTML = `
        <marker id="arrowHead" markerWidth="10" markerHeight="10" refX="5" refY="3" orient="auto">
            <polygon points="0,0 10,3 0,6" fill="red" />
        </marker>
    `;

    // Create the path element
    const pathEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
    pathEl.setAttribute("id", "pathArrow");
    pathEl.setAttribute("d", d);
    pathEl.setAttribute("fill", "none");
    pathEl.setAttribute("stroke", "red");
    pathEl.setAttribute("stroke-width", "8");
    pathEl.setAttribute("marker-end", "url(#arrowHead)");

    svg.appendChild(pathEl);
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




const p = new Players;

window.addEventListener("load", setup);
