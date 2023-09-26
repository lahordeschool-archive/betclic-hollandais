var socket;
let editor;

window.addEventListener("load", async ()=> {

    socket = await io.connect();

    socket.on('connect', () => {
        console.log('Connected to the server from client');
            // You can perform actions here when the connection is established
        console.log(socket);
        socket.emit('connected');

        socket.emit('connect_IA', {name: clientName, mail: localStorage.getItem('UserMail')});

        socket.on("messageTestReceived", (message) => {
            console.log(message);
        });
        


    });

});

function VerifyBet(currentBet, newBet){
    //check is a new bet
    if(JSON.stringify(currentBet) == JSON.stringify(newBet)) {
        return false;
    } else {
        return true;
    }

    //check is outbid


    //if not outbid check is an paco switch
}

function VerifyObjection(bet){
    //check is a new bet
    if(JSON.stringify(bet) == JSON.stringify([0,1]) || JSON.stringify(bet) == JSON.stringify([0,2])) {
        return false;
    } else {
        return true;
    }

    //check is outbid


    //if not outbid check is an paco switch
}