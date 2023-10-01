const express = require("express");
let isAuthenticated = require("../../../lib/auth").isAuthenticated;
const disconnect = require("../../../lib/auth").disconnect;
const passport = require("passport");
const User = require("../../../models/user");
const Players_GameController = require('("../../../controller/Players_GameController');
const IA_GameController = require('("../../../controller/IA_GameController');
const PoolsController = require('("../../../controller/PoolsController');
const poolsController = new PoolsController();
const gameController = new Players_GameController();
const gameIAController = new IA_GameController();

gameController.address = "1111";
gameIAController.address = "2222"

poolsController.addPool("3333");
poolsController.addPool("4444");

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

    });

    socket.on('connected', () => {
      console.log('Client connected and sent a "connected" message');
      // Handle the event here
    });

    socket.on('getServer', (data) => {
      if (poolsController.PoolList.has(data.serveurAdress)) {
        let alreadyLogged = false;
        poolsController.PoolList[data.serveurAdress].playerList.forEach(player => {
          if(player.mail === data.mail){
            alreadyLogged = true;
          }
        });
        if(!alreadyLogged){
          gameIAController.addPlayer(user.name, user.mail, socket);
        }
          socket.emit('ServerExist', );

      } else {
        socket.emit('ServerExist', false);
      }
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

      try {
        gameIAController.playerList[gameIAController.currentPlayer].socket.emit('PlayerTurn', gameIAController.dataCurrentPlayer);
      } catch (error) {
        
      }


    });
    
    
    socket.on('objection', (adress) =>{
      let controller = poolsController.PoolList.hasPool(adress);
      //Make verification is Current Player Action
      console.log('objection');
      controller.objection();
      controller.dataSet();
      if(controller.winner == null){
        
        try {
          controller.playerList[controller.currentPlayer].socket.emit('PlayerTurn', controller.dataCurrentPlayer);
        } catch (error) {
          
        }
      }else{
        emitToAllInController('finish', controller.winner, controller);
        controller.removeAllPlayer();
      }   
    });

    socket.on('bet', (bet, adress) =>{
      let controller = poolsController.PoolList.hasPool(adress);
      //Make verification is Current Player Action
      console.log('bet');
      controller.bet(bet[0], bet[1]);
      controller.dataSet();
      if(controller.winner == null){
        
        try {
          controller.playerList[controller.currentPlayer].socket.emit('PlayerTurn', controller.dataCurrentPlayer);
        } catch (error) {
          
        }
      }else{
        emitToAllInController('finish', controller.winner, controller);
        controller.removeAllPlayer();
      }   
    });

    socket.on('MajRequest', (adress) => {
      let controller = poolsController.PoolList.hasPool(adress);
      controllerMaj(controller);
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