const GameController = require('("../../../controller/IA_GameController');

class PoolsController {

    constructor() {
        this.PoolList = new Map();

    }

    init() {
        
    }

    addPool(poolAdress) {
        const newGame = new GameController();
        this.PoolList.set(poolAdress, newGame);
    }

    addPlayer(playerName, mail, socket, poolAdress){
        let gameController = this.PoolList[poolAdress];
        let alreadyLogged = false;
        gameController.playerList.forEach(player => {
            if(player.mail === mail){
            alreadyLogged = true;
            player.socket = socket;
            }
        });
        if(!alreadyLogged){
            gameController.addPlayer(playerName, mail, socket);
        }
    }

    getServerList(){
        let servers = new Map();
        this.PoolList.forEach((server, key) => {
            let serverinfo = {
                nbPlayers: server.playerList.length,
                gameInProgress: server.gameInProgress
            }
            servers.set(key, serverinfo);
        });
        return servers;
    }
    
}

module.exports = PoolsController;
