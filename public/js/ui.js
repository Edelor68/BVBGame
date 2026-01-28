

function bindUI() {
	bindZoom(document.getElementById("mapArea"));
	buttonMap();
}

function bindZoom(el) {
	
	const zoomSlider = el.querySelector("#zoomSlider");
	
	zoomSlider.value = 0;
	
	console.log(zoomSlider.value + 100 + "%")
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

window.addEventListener("load", bindUI);
