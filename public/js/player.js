export default class Players {
	
    constructor() {
        this.players = {
            player1: {
                map: {
                    coordinates: offsetToCube(13, 13)
                },
                combat: {
                    coordinates: offsetToCube(5, 2)
                },
                element: null
            }
        };
    }

    createPlayer(svg, hex, playerName) {
        const { x, y } = getHexCenter(hex);

        const img = document.createElementNS("http://www.w3.org/2000/svg", "image");
        img.setAttribute("href", "../imgs/monsters/dragon.png");
        img.setAttribute("width", 180);
        img.setAttribute("height", 180);

        // center the sprite
        img.setAttribute("x", x - 90);
        img.setAttribute("y", y - 90);

        svg.appendChild(img);

        // store reference
        this.players[playerName].element = img;
    }

    getPlayers() {
        return this.players;
    }

    movePlayerTo(hex, playerName) {
        const cube = JSON.parse(hex.dataset.cube);
        const grid = hex.dataset.grid; // "map" or "combat"

        const coords = this.players[playerName][grid].coordinates;
        coords.q = cube.q;
        coords.r = cube.r;
        coords.s = cube.s;

        const { x, y } = getHexCenter(hex);

        const img = this.players[playerName].element;
        img.setAttribute("x", x - 90);
        img.setAttribute("y", y - 90);
		
		currentPos[grid] = hex;
    }
}