import Players from "./player.js"

function setup(){
	const map = document.getElementById("map");
	const combat = document.getElementById("combat");
	
	const p = new Players;
	
	drawGrid(combat, 8, 10);
	drawGrid(map, 63, 29);
	
	p.players.player1.map.position = findHex("map",  offsetToCube(18, 18));
	p.players.player1.combat.position = findHex("combat", offsetToCube(2, 5));

	p.createPlayer(map, "player1", "../imgs/monsters/dragon.png")
	
	document.addEventListener("keydown", (event) => { 
		switch (event.key) {
			case "m":
				if (selectedHex) {p.movePlayerTo(selectedHex, "player1")};
				break;
			case "t":
				if (selectedHex) {changeTerrain()};
				break;
		}
		
	});
}

const hexMap = new Map();
let path = []

let selectedHex = null;

const currentPos = {map: null, combat: null};


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
	polygon.setAttribute("stroke", "black");
	polygon.setAttribute("fill", "transparent");
	polygon.setAttribute("pointer-events", "all");
	polygon.setAttribute("stroke-width", "2");
	
	const cube = offsetToCube(Number(polygon.dataset.offsetX), Number(polygon.dataset.offsetY));
	polygon.dataset.cube = JSON.stringify(cube);
	
	const key = `${display.id},${cube.q},${cube.r},${cube.s}`;
	Object.keys(cube_direction_vectors).forEach((dir) => {
		const coords = findNeigbor(display.id, polygon, dir);
		polygon.dataset["neighbor" + dir] = `${coords[0]},${coords[1]},${coords[2]},${coords[3]}`;
	})
	
	polygon.dataset.grid = display.id;
	polygon.dataset.terrain = "passable";
	
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
	const cq = JSON.parse(hex.dataset.cube).q;
	const cr = JSON.parse(hex.dataset.cube).r;
	const cs = JSON.parse(hex.dataset.cube).s;
	const vector = cube_direction_vectors[direction];
	return [grid, cq + vector["q"], cr + vector["r"], cs + vector["s"]];
};

export function offsetToCube(x, y) {
	const oddEven = x & 1;
	const q = x;
	const r = y - (x - oddEven) / 2;
	const s = -q - r;
	return {q: q, r: r, s: s};
}


function changeTerrain() {
	const hex = selectedHex;
	const terrain = hex.dataset.terrain
	switch (terrain) {
		case "passable":
			hex.dataset.terrain = "impassable";
			hex.setAttribute("fill", "brown");
			hex.setAttribute("stroke", "brown");
			hex.removeEventListener("mouseover", selectedHex);
			break;
		case "impassable":
			hex.dataset.terrain = "passable";
			hex.setAttribute("fill", "transparent");
			hex.setAttribute("stroke", "black");
			hex.addEventListener("mouseover", selectedHex);
			break;
	}
}


function onHexClick(event) {
    const hex = event.currentTarget;
    const grid = hex.closest("svg").id;

    const start = currentPos[grid];
	
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
			pathTile = findHex(grid, JSON.parse(pathTile.dataset.from).q, JSON.parse(pathTile.dataset.from).r, JSON.parse(pathTile.dataset.from).s);
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






window.addEventListener("load", setup);
