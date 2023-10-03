class Hub_Controller {

    constructor() {
        this.HubParrotList = {};
    }

    addParrot(socket) {
        
        if (socket && typeof socket.emit === "function" && typeof this.HubParrotList[socket.id] === 'undefined') {
            this.HubParrotList[socket.id] = {
                position : { x: 0, y: 20, z: -115 },
                rotation : { x: 0, y: 0, z: 0, w: 1 }
            };
    
            console.log("Added parrot with valid socket:", socket.id);
            return this.HubParrotList.length - 1;
        } else {
            console.error("Attempted to add parrot with invalid socket:", socket);
        }
    }
    

    removeParrot(socketId) {
        this.HubParrotList.splice(socketId, 1);
    }

    setParrotPosition(socketId, transform) {

        this.HubParrotList[socketId].position = transform.pos;
        this.HubParrotList[socketId].rotation = transform.rot;
    }

    getAllParrotsPositions() {
        // const positions = this.HubParrotList.map((parrot) => {
        //     return {
        //         position: parrot.position,
        //         rotation: parrot.rotation,
        //     };
        // });
        return this.HubParrotList;
    }
 
    
}

module.exports = Hub_Controller;
