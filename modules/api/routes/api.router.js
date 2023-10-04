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
poolsController.addPool("3334");
poolsController.addPool("3335");
poolsController.addPool("3336");

const socketUsers = {};

function emitToAll(event, data) {
  Object.keys(socketUsers).forEach((socketId) => {
    socketUsers[socketId].emit(event, data);
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
      let controller;
      if (poolsController.PoolList.has(data.serveurAdress)) {
        let alreadyLogged = false;
        controller = poolsController.PoolList.get(data.serveurAdress);
        controller.playerList.forEach(player => {
          if(player.mail === data.mail){
            alreadyLogged = true;
            player.socket = socket;
          }
        });
        if(!alreadyLogged &&  controller.gameInProgress){
          console.log("can't connect user "+ data.mail)
          console.log("Party in progress "+ controller.gameInProgress)
          socket.emit('ServerNotConnect');
        }
      } else {
        socket.emit('ServerNotConnect');
      }
  });
  

    socket.on('messageTest', () => {
      console.log('Client sent a "messageTest" message');
      // Handle the event here
      emitToAll('messageTestReceived', 'Server received "messageTest" message');
    });

    socket.on('connectPlayer', (user) => {
      let controller = poolsController.PoolList.get(user.adress);
      console.log('connection IA de '+ user + ' on '+ user.adress);
      let alreadyLogged = false;
      controller.playerList.forEach(player => {
        if(player.mail === user.mail){
          alreadyLogged = true;
          player.socket = socket;
        }
      });
      if(!alreadyLogged && controller.playerList.length <= 5 && !controller.gameInProgress){
        controller.addPlayer(user.name, user.mail, socket);
        console.log('New Player '+user.name+' on server '+ user.adress)
      }
      const mapArray = [...poolsController.getServerList()];
      emitToAll('HubMaj', mapArray);
    });

    function VerifPlayerPlayInTime(controller, manche, round){
      if(manche === controller.currentManche, round === controller.currentRound){
        poolsController.defaultAction(controller);
        controller.playerList[controller.currentPlayer].socket.emit('PlayerTurn', controller.dataCurrentPlayer);
      }
       
    }

    function nextTurn(controller){
      try {
        controller.playerList[controller.currentPlayer].socket.emit('PlayerTurn', controller.dataCurrentPlayer);
        setTimeout(() => VerifPlayerPlayInTime(controller, controller.currentManche, controller.currentRound), 60000);
      } catch (error) {
        poolsController.defaultAction(controller);
      }
    }

    socket.on('launchBattle', (adress) =>{
      let controller = poolsController.PoolList.get(adress);
      console.log('init ' + adress +' controller = '+ controller+ ' playerList = '+ controller.playerList[0].name);
      if(controller.playerList.length >= 2){
        controller.init();
        controller.dataSet();
        const mapArray = [...poolsController.getServerList()];
        emitToAll('HubMaj', mapArray);
        controllerMaj(controller);
        setTimeout(() => nextTurn(controller), 5000);  // Attendre 5 secondes

      }else{
        console.log('Not enough players for init server '+ adress);
      }
      


    });
    
    
    socket.on('objection', (adress) =>{
      let controller = poolsController.PoolList.get(adress);
      if(socket === controller.playerList[controller.currentPlayer].socket){
        console.log('objection');
        controller.objection();
        controller.dataSet();
        if(controller.winner == null){
          setTimeout(() => nextTurn(controller), 5000);  // Attendre 5 secondes
          controllerMaj(controller);
        }else{
          emitToAllInController('finish', controller.winner, controller);
          controller.removeAllPlayer();
          const mapArray = [...poolsController.getServerList()];
          emitToAll('HubMaj', mapArray);
        }   
      }
    });

    socket.on('bet', (data) =>{
      let controller = poolsController.PoolList.get(data.adress);
      console.log('controller '+ data.adress +' list Players' + controller.playerList);
      if(socket === controller.playerList[controller.currentPlayer].socket){
        console.log('you can bet');
        controller.bet(data.bet[0], data.bet[1]);
        controller.dataSet();
          
        setTimeout(() => nextTurn(controller), 5000);  // Attendre 5 secondes
        controllerMaj(controller);
      }
    });

    socket.on('MajRequest', (adress) => {
      let controller = poolsController.PoolList.get(adress);
      controllerMaj(controller);
    });

    socket.on('HubMajRequest', () =>{
      const mapArray = [...poolsController.getServerList()];
      emitToAll('HubMaj', mapArray)
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