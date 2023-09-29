const express = require("express");
let isAuthenticated = require("../../../lib/auth").isAuthenticated;
const disconnect = require("../../../lib/auth").disconnect;
const passport = require("passport");
const User = require("../../../models/user");
const Players_GameController = require('("../../../controller/Players_GameController');
const IA_GameController = require('("../../../controller/IA_GameController');
const gameController = new Players_GameController();
const gameIAController = new IA_GameController();

gameController.address = "1111";
gameIAController.address = "2222"

const socketUsers = {};

function emitToAll(event, data) {
  gameController.playerList.forEach(player => {
    player.socket.emit(event, data);
  });
}

function emitToAllInController(event, data, controller) {
  controller.playerList.forEach(player => {
    player.socket.emit(event, data);
  });
}

function controllerMaj(controller) {
  controller.playerList.forEach(player => {
    player.socket.emit('Maj', controller.getDataOther(player));
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
      console.log('connection IA de ', user);
      let alreadyLogged = false;
      gameIAController.playerList.forEach(player => {
        if(player.mail === user.mail){
          alreadyLogged = true;
          player.socket = socket;
        }
      });
      if(!alreadyLogged){
        gameIAController.addPlayer(user.name, user.mail, socket);
      }
    });

    socket.on('launchBattle', () =>{
      console.log('init');
      gameIAController.init();
      gameIAController.dataSet();
      console.log("Winner value :"+ gameIAController.winner);

      try {
        gameIAController.playerList[gameIAController.currentPlayer].socket.emit('PlayerTurn', gameIAController.dataCurrentPlayer);
      } catch (error) {
        
      }


    });
    
    
    socket.on('objection', () =>{
      //Make verification is Current Player Action
      console.log('objection');
      gameIAController.objection();
      gameIAController.dataSet();
      if(gameIAController.winner == null){
        
        try {
          gameIAController.playerList[gameIAController.currentPlayer].socket.emit('PlayerTurn', gameIAController.dataCurrentPlayer);
        } catch (error) {
          
        }
      }else{
        emitToAllInController('finish', gameIAController.winner, gameIAController);
      }   
    });

    socket.on('bet', (bet) =>{
      //Make verification is Current Player Action
      console.log('bet');
      gameIAController.bet(bet[0], bet[1]);
      gameIAController.dataSet();
      if(gameIAController.winner == null){
        
        try {
          gameIAController.playerList[gameIAController.currentPlayer].socket.emit('PlayerTurn', gameIAController.dataCurrentPlayer);
        } catch (error) {
          
        }
      }else{
        emitToAllInController('finish', gameIAController.winner, gameIAController);
      }   
    });

    socket.on('MajRequest', () => {
      controllerMaj(gameIAController);
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