import { getTerrain } from "./grid.js";

function bindUI() {
	bindZoom(document.getElementById("mapArea"));
	buttonMap();
	saveHexes();
}

function bindZoom(el) {
	
	const zoomSlider = el.querySelector("#zoomSlider");
	
	zoomSlider.value = 0;
	
	zoomSlider.addEventListener("input", (e) => {
		el.style.width = Number(zoomSlider.value) + 100 + "%";
	})
	
}

function buttonMap() {
	const button = document.getElementById("deckBtn");
	const map = document.getElementById("mapArea");
	const combat = document.getElementById("combatArea");
	button.addEventListener("click", () => {
		map.classList.toggle("hidden");
		combat.classList.toggle("hidden");
	})
}

function saveHexes() {
    const button = document.getElementById("rmvHexBtn");

    button.addEventListener("click", () => {
		console.log("clicked")
        const data = {};
        const terrainData = getTerrain(); 

		for (const terrain of Object.values(terrainData)) {
			for (const hex of terrain) {
				const dset = hex.dataset;
				const grid = dset.grid;
				const terrain = dset.terrain;

				if (!data[grid]) data[grid] = {};
				if (!data[grid][terrain]) data[grid][terrain] = [];

				data[grid][terrain].push(JSON.parse(dset.cube));
			}
		}

        fetch("/save/terrainData.json", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
    });
}



window.addEventListener("load", bindUI);
