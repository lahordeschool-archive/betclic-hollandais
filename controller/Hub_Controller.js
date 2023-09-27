class Hub_Controller {

    constructor() {
        this.HubParrotList = [];

    }

    addParrot(socket, playerName, position, rotation){
        this.HubPlayerList.push({
            socket: socket,
            name: playerName,
            position: position,
            rotation: rotation,
        });
    }

    removeParrot(index){
        this.playerList.splice(index, 1);
    }

    setParrotPosition(index, position, rotation){
        this.HubPlayerList[index].position = position;
        this.HubPlayerList[index].rotation = rotation;
    }

    getAllParrotsPositions(){
        this.HubPlayerList.forEach((parrot) => {

        })
    }
}

module.exports = Hub_Controller;
