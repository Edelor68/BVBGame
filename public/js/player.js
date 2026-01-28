import {offsetToCube, getHexCenter} from "./grid.js";

export default class Players {
	
    constructor() {
        this.player1 = {
            areas: {
                map: {
                    position: null
                },
                combat: {
                    position: null
                }
            },
            element: null
        };
    }

    createPlayer(svg, playerName, imgL) {

        if (!this.[playerName]) {
            this.[playerName] = {
                areas: {
                    map: {
                        position: null
                    },
                    combat: {
                        position: null
                    }
                },
                element: null
            };
        }

        Object.keys(this.[playerName]).forEach((p) => {
            if (this.[playerName][p].position) {
                const { x, y } = getHexCenter(this.[playerName][svg.getAttribute("id")].position);

                const img = document.createElementNS("http://www.w3.org/2000/svg", "image");
                img.setAttribute("href", imgL);
                img.setAttribute("width", 180);
                img.setAttribute("height", 180);

                // center the sprite
                img.setAttribute("x", x - 90);
                img.setAttribute("y", y - 90);

                svg.appendChild(img);

                // store reference
                this.[playerName].element = img;
            }
        })

        
    }

    getPlayers() {
        return this.players;
    }

    movePlayerTo(hex, playerName) {
        const cube = JSON.parse(hex.dataset.cube);
        const grid = hex.dataset.grid; // "map" or "combat"

        const coords = this.[playerName][grid].coordinates;
        coords.q = cube.q;
        coords.r = cube.r;
        coords.s = cube.s;

        const { x, y } = getHexCenter(hex);

        const img = this.[playerName].element;
        img.setAttribute("x", x - 90);
        img.setAttribute("y", y - 90);
		
		this.[playerName][grid].position = hex;
    }
}