function setup(){
	drawGrid();

}

function drawGrid() {
	let svg = document.getElementById("screen");
	
	//Hex size adjustment, delta = top width deviation
	const delta = -4;
	const s = 100 + delta / 2;
	const h = Math.sqrt(3) * s;
	const mid = h / 2;
	
	for (let rows = 0; rows < 5; rows++) {
		for (let i = 0; i < 6; i++) {
			let polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
			polygon.setAttribute("points",
				(50 - delta/2 + i * (3*s)) + "," + (0 + rows * h) + " " +
				(150 + delta/2 + i * (3*s)) + "," + (0 + rows * h) + " " +
				(200 + delta/2 + i * (3*s)) + "," + (mid + rows * h) + " " +
				(150 + delta/2 + i * (3*s)) + "," + (h + rows * h) + " " +
				(50 - delta/2 + i * (3*s)) + "," + (h + rows * h) + " " +
				(0  - delta/2 + i * (3*s)) + "," + (mid + rows * h)
			);
			//Style
			polygon.setAttribute("stroke", "black");
			polygon.setAttribute("fill", "transparent");
			polygon.setAttribute("pointer-events", "all");
			polygon.setAttribute("stroke-width", "2");
			//Coordinates
			polygon.dataset.offsetY = rows;
			polygon.dataset.offsetX = i * 2;
			polygon.dataset.cube = JSON.stringify(offsetToCube(Number(polygon.dataset.offsetX), Number(polygon.dataset.offsetY)));
			polygon.dataset.terrain = "passable"
			let titleEl = document.createElementNS("http://www.w3.org/2000/svg", "title");
			titleEl.textContent = `Row ${rows}, Col ${i * 2}`;
			polygon.appendChild(titleEl);
			polygon.addEventListener("mouseover", cursorPosition);
			polygon.addEventListener("click", changeTerrain);
			svg.appendChild(polygon);
		}
		for (let i = 0; i < 6; i++) {
			let polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
			polygon.setAttribute("points", 
				(50 - delta/2 + 1.5*s + i * (3*s)) + "," + (0 + mid + rows * h) + " " +
				(150 + delta/2 + 1.5*s + i * (3*s)) + "," + (0 + mid + rows * h) + " " +
				(200 + delta/2 + 1.5*s + i * (3*s)) + "," + (mid + mid + rows * h) + " " +
				(150 + delta/2 + 1.5*s + i * (3*s)) + "," + (h + mid + rows * h) + " " +
				(50 - delta/2 + 1.5*s + i * (3*s)) + "," + (h + mid + rows * h) + " " +
				(0  - delta/2 + 1.5*s + i * (3*s)) + "," + (mid + mid + rows * h)
			);
			//Style
			polygon.setAttribute("stroke", "black");
			polygon.setAttribute("fill", "transparent");
			polygon.setAttribute("pointer-events", "all");
			polygon.setAttribute("stroke-width", "2");
			//Coordinates
			polygon.dataset.offsetY = rows;
			polygon.dataset.offsetX = i * 2 + 1;
			polygon.dataset.cube = JSON.stringify(offsetToCube(Number(polygon.dataset.offsetX), Number(polygon.dataset.offsetY)));
			polygon.dataset.terrain = "passable";
			let titleEl = document.createElementNS("http://www.w3.org/2000/svg", "title");
			titleEl.textContent = `Row ${rows}, Col ${i * 2 + 1}`;
			polygon.appendChild(titleEl);
			polygon.addEventListener("mouseover", cursorPosition);
			polygon.addEventListener("click", changeTerrain);
			svg.appendChild(polygon);
			
		}		
	}
}

const cube_direction_vectors = {
	SE: {q: +1, r: 0, s: -1},
	
	NE: {q: +1, r: -1, s: 0},
	
	NN: {q: 0, r: -1, s: +1},
	
	NW: {q: -1, r: 0, s: +1},
	
	SW: {q: -1, r: +1, s: 0},
	
	SS: {q: 0, r: +1, s: -1},
};

function findHex(q, r, s) {
	const hexagons = document.getElementsByTagName("polygon");
	return Array.from(hexagons).find(hex => JSON.parse(hex.dataset.cube).q === q && JSON.parse(hex.dataset.cube).r === r && JSON.parse(hex.dataset.cube).s === s);
}

function findNeigbor(hex, direction) {
	const cq = JSON.parse(hex.dataset.cube).q;
	const cr = JSON.parse(hex.dataset.cube).r;
	const cs = JSON.parse(hex.dataset.cube).s;
	const vector = cube_direction_vectors[direction];
	return findHex(cq + vector["q"], cr + vector["r"], cs + vector["s"]);
};

function offsetToCube(x, y) {
	const oddEven = x & 1;
	const q = x;
	const r = y - (x - oddEven) / 2;
	const s = -q - r;
	return {q: q, r: r, s: s};
}

function cursorPosition(event) {
	const start = findHex(offsetToCube(5, 2).q, offsetToCube(5, 2).r, offsetToCube(5, 2).s);
	start.setAttribute("fill", "red");
	findPath(start, event.currentTarget);
}

function changeTerrain(event) {
	const hex = event.currentTarget;
	const terrain = hex.dataset.terrain
	switch (terrain) {
		case "passable":
			hex.dataset.terrain = "impassable";
			hex.setAttribute("fill", "brown");
			hex.setAttribut("stroke-width", "0");
			polygon.removeEventListener("mouseover", cursorPosition);
			break;
		case "impassable":
			hex.dataset.terrain = "passable";
			hex.setAttribute("fill", "transparent");
			hex.setAttribut("stroke-width", "3");
			polygon.addEventListener("mouseover", cursorPosition);
			break;
	}
}


function findPath(start, end) {
	Array.from(document.getElementsByTagName("polygon")).forEach(pol => {
		if (pol.getAttribute("fill") === "blue" || pol.getAttribute("fill") === "green") {pol.setAttribute("fill", "transparent")}
	});
	let visited = [start];
	let frontier = [];
	let current = start;
	const vectors = Object.keys(cube_direction_vectors);
	do {
		if (start == end) {break};
		vectors.forEach(dir => {
			const neigh = findNeigbor(current, dir);
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
			pathTile.setAttribute("fill", "blue");
			end.setAttribute("fill", "green");
			pathTile = findHex(JSON.parse(pathTile.dataset.from).q, JSON.parse(pathTile.dataset.from).r, JSON.parse(pathTile.dataset.from).s);
		}
	}
}


window.addEventListener("load", setup);
