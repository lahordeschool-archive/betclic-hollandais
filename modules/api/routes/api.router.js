const express = require("express");
let isAuthenticated = require("../../../lib/auth").isAuthenticated;
const disconnect = require("../../../lib/auth").disconnect;
const passport = require("passport");
const User = require("../../../models/user");
const Players_GameController = require('("../../../controller/Players_GameController');
const Hub_Controller = require("../../../controller/Hub_Controller");
const gameController = new Players_GameController();

gameController.address = "1111";

const socketUsers = {};

function emitToAll(event, data) {
  gameController.playerList.forEach(player => {
    player.socket.emit(event, data);
  });
}

const hubController = new Hub_Controller();


// Broadcast positions and rotations to all connected clients
function broadcastParrotPositions() {

  hubController.HubParrotList.forEach((parrot) => {
      if (parrot.socket && typeof parrot.socket.emit === "function") {
          parrot.socket.emit('parrotUpdate', positions);
      } else {
          console.error("Invalid socket:", parrot.socket);
      }
  });
}

module.exports = function(io) {
  const router = express.Router();

  io.on('connection', (socket) => {
    console.log(`A client connected with ID: ${socket.id}`);
    socketUsers[socket.id] = socket;

    socket.on('disconnect', () => {
      console.log(`Client with ID: ${socket.id} disconnected`);
      delete socketUsers[socket.id];
      gameController.playerList.forEach(player => {
        if(player.socket.id === socket.id) {
          gameController.removePlayerByName(player.name);
        }
      });
     
    });

    socket.on('connected', () => {
      console.log('Client connected and sent a "connected" message');
      // Handle the event here
    });



    socket.on('messageTest', () => {
      console.log('Client sent a "messageTest" message');
      // Handle the event here
      emitToAll('messageTestReceived', 'Server received "messageTest" message');
    });

    socket.on('connectPlayer', (user) => {
      console.log('connection de ', user);
      let alreadyLogged = false;

      gameController.playerList.forEach(player => {
        if(player.mail === user.mail){
          alreadyLogged = true;
          player.socket = socket;
        }
      });
      if(!alreadyLogged){
        gameController.addPlayer(user.name, user.mail, socket);
      }

    });
///////////////////////////////////////////////////////////////////
socket.on('newParrot', () => {
  console.log("A new parrot is here");
  // hubController.HubParrotList.forEach(parrot => {
  //     if (parrot.socket.id === socket.id) {
  //         created = true;
  //         console.log("Parrot already exist");
  //     }
  // });
  
  hubController.addParrot(socket);

});


 socket.on('parrotHasMoved', (transform) => {
    hubController.setParrotPosition(socket.id, transform);
    //console.log(socket.id);
  });

  socket.on('MajPositionsRequest', () => {
  for (const socketId in hubController.HubParrotList) {
    if (hubController.HubParrotList.hasOwnProperty(socketId)) {

        io.to(socketId).emit('parrotUpdate', hubController.HubParrotList);

    }
  }

});

    
    ///////////////////////////////////////////////////////////////////

    socket.on('launch', (io) => {
      gameController.init();
      //console.log('list des joueurs =', gameController.playerList);
    });
  
    socket.on('newBet', (newBet) => {
      console.log("newBet = ", newBet);
      console.log("controle joueur bet =", socket.id === gameController.playerList[gameController.currentPlayer].socket.id);
      if(socket.id === gameController.playerList[gameController.currentPlayer].socket.id){
        console.log("test bet 1 ");
        if(gameController.VerifyBet(newBet)){
          gameController.bet(newBet[0], newBet[1]);
          console.log("test bet 2 ");
        }else{
          socket.emit('BetInvalid');
        }
      }
    });

    socket.on('objection', () => {
      if(socket.id === gameController.playerList[gameController.currentPlayer].socket.id){
        emitToAll('objectionPerdant' ,  gameController.objection() );
      }
    });

    socket.on('MajRequest', () => {
      console.log('********************  Maj request call ***********************');
      gameController.playerList.forEach(player => {

        console.log('********************  Player '+player.name+'  ***********************');

        if(gameController.beginManche){

          emitToAll('totalDices' , gameController.allDices.length);

          console.log('envoie a ', `${player.name}`);
          console.log('dés = ', player.dices);
          emitToAll( player.mail , player.dices);
        }
      });

      if(gameController.winner != null){
        emitToAll('Winner' ,  gameController.winner.name );
      }

      emitToAll('playersList' ,  gameController.getPlayerListWithoutDicesValue() );
      emitToAll('currentBet' , gameController.currentBet);
      emitToAll('currentManche' , gameController.currentManche);
      emitToAll('currentRound' , gameController.currentRound);
      emitToAll('currentPlayer' , gameController.currentPlayer);
      gameController.beginManche = false;
    });

  
  


  });

  /* GET user info */
  router.get("/getUserInfos", (req, res) => {
    if (req.isAuthenticated()) {
        res.send(req.user);

    } else {
        res.redirect("/login");
    }
  });

  /* GET game page. */
  router.get("/", (req, res) => {
    if (req.isAuthenticated()) {
        res.send("ok");
    } else {
        res.redirect("/login");
    }
  });

  return router;
};




