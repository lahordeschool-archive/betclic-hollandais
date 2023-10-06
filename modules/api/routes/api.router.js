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

const { generateLiveMessage } = require("../../../lib/openai");

gameController.address = "1111";
gameIAController.address = "2222";

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
  controller.playerList.forEach((player) => {
    player.socket.emit(event, data);
  });
}

function controllerMaj(controller) {
  controller.playerList.forEach((player) => {
    player.socket.emit("Maj", controller.getDataOther(player));
  });
}

module.exports = function (io) {
  const router = express.Router();

  io.on("connection", (socket) => {
    console.log(`A client connected with ID: ${socket.id}`);
    socketUsers[socket.id] = socket;

    socket.on("disconnect", () => {
      console.log(`Client with ID: ${socket.id} disconnected`);
      delete socketUsers[socket.id];
    });

    socket.on("connected", () => {
      console.log('Client connected and sent a "connected" message');
      // Handle the event here
    });

    socket.on("getServer", (data) => {
      let controller;
      if (poolsController.PoolList.has(data.serveurAddress)) {
        let alreadyLogged = false;
        controller = poolsController.PoolList.get(data.serveurAddress);
        controller.playerList.forEach((player) => {
          if (player.mail === data.mail) {
            alreadyLogged = true;
            player.socket = socket;
          }
        });
        if (!alreadyLogged && controller.gameInProgress) {
          console.log("can't connect user " + data.mail);
          console.log("Party in progress " + controller.gameInProgress);
          socket.emit("ServerNotConnect");
        }
      } else {
        socket.emit("ServerNotConnect");
      }
    });

    socket.on("messageTest", () => {
      console.log('Client sent a "messageTest" message');
      // Handle the event here
      emitToAll("messageTestReceived", 'Server received "messageTest" message');
    });

    socket.on("connectPlayer", (user) => {
      let controller = poolsController.PoolList.get(user.address);
      console.log("connection IA de " + user + " on " + user.address);
      let alreadyLogged = false;
      controller.playerList.forEach((player) => {
        if (player.mail === user.mail) {
          alreadyLogged = true;
          player.socket = socket;
        }
      });
      if (
        !alreadyLogged &&
        controller.playerList.length <= 5 &&
        !controller.gameInProgress
      ) {
        controller.addPlayer(user.name, user.mail, socket);
        console.log("New Player " + user.name + " on server " + user.address);
      }
      const mapArray = [...poolsController.getServerList()];
      emitToAll("HubMaj", mapArray);
      updateClassement(controller);
    });

    function VerifPlayerPlayInTime(address, manche, round){
      if(manche === controller.currentManche && round === controller.currentRound && controller.winner == null){
        console.log('Action par default demander car le joueur na pas jouer');
        console.log('manche au set :' + manche);
        console.log('manche au call :' + controller.currentManche);
        console.log('round au set :' + round);
        console.log('round au call :' + controller.currentRound);
        poolsController.defaultAction(controller);
        controller.dataSet();
        controller.playerList[controller.currentPlayer].socket.emit(
          "PlayerTurn",
          controller.dataCurrentPlayer
        );
        controllerMaj(controller);
      }
      else{
        console.log('Action par default non demander car le joueur a jouer');
        console.log('manche au set :' + manche);
        console.log('manche au call :' + controller.currentManche);
        console.log('round au set :' + round);
        console.log('round au call :' + controller.currentRound);
      }
       
    }

    function nextTurn(address) {
      let controller = poolsController.PoolList.get(address);
      try {
        controller.playerList[controller.currentPlayer].socket.emit(
          "PlayerTurn",
          controller.dataCurrentPlayer
        );
        setTimeout(
          () =>
            VerifPlayerPlayInTime(
              address,
              controller.currentManche,
              controller.currentRound
            ),
          60000
        );
      } catch (error) {
        console.log('Action par default demander car echec de emit PlayerTurn');
        poolsController.defaultAction(controller);
      }
    }

    function updateClassement(controller) {
      let classement = [];

      controller.playerList.forEach((player) => {
        classement.push({
          name: player.name,
          mail: player.mail,
          score: player.score != null ? player.score : 5,
        });
      });

      // Trier par score et, en cas d'égalité, par prénom
      classement.sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        } else {
          return a.name.localeCompare(b.name);
        }
      });

      console.log(classement);
      emitToAllInController("updateClassement", classement, controller);
    }

    function getTime() {
      let date = new Date();
      let hour = date.getHours();
      let minutes = date.getMinutes();
      if (minutes < 10) {
        minutes = "0" + minutes;
      }
      return hour + ":" + minutes;
    }

    socket.on("launchBattle", (address) => {
      let controller = poolsController.PoolList.get(address);
      console.log(
        "init " +
          address +
          " controller = " +
          controller +
          " playerList = " +
          controller.playerList[0].name
      );
      if (controller.playerList.length >= 2) {
        controller.init();
        controller.dataSet();
        const mapArray = [...poolsController.getServerList()];
        emitToAll("HubMaj", mapArray);
        emitToAllInController("BattleLaunched", {}, controller);

        emitToAllInController("updateHistorique", getTime() + " - Début de la partie", controller);

        controllerMaj(controller);
        setTimeout(() => nextTurn(data.address), 5000); // Attendre 5 secondes
      } else {
        console.log("Not enough players for init server " + address);
      }
    });

    socket.on("objection", (address) => {
      let controller = poolsController.PoolList.get(address);
      if(controller.gameInProgress){
        if(socket === controller.playerList[controller.currentPlayer].socket){
          console.log('objection');
          controller.objection();
          emitToAllInController("updateHistorique", getTime() + " - " + controller.playerList[controller.currentPlayer].name + " : Moi je dis : DUDO ! Faites voir vos dés.", controller);
          controller.dataSet();
          if(controller.winner == null){
            setTimeout(() => nextTurn(data.address), 5000);  // Attendre 5 secondes
            controllerMaj(controller);
          }else{
            emitToAllInController('finish', controller.winner, controller);
            controller.removeAllPlayer();
            const mapArray = [...poolsController.getServerList()];
            emitToAll('HubMaj', mapArray);
          }   
        }
      }
    });

    socket.on("bet", (data) => {
      let controller = poolsController.PoolList.get(data.address);
      if(controller.gameInProgress){
        console.log('controller '+ data.address +' list Players' + controller.playerList);
        if(socket === controller.playerList[controller.currentPlayer].socket){
          console.log('you can bet');
          controller.bet(data.bet[0], data.bet[1]);
          controller.dataSet();
          emitToAllInController("updateHistorique", getTime() + " - " + controller.playerList[controller.currentPlayer].name + " : Je parie qu'il y a "+data.bet[0]+" dés de "+data.bet[1], controller);
          setTimeout(() => nextTurn(data.address), 5000);  // Attendre 5 secondes
          controllerMaj(controller);
        }
      }
    });

    socket.on("MajRequest", (address) => {
      let controller = poolsController.PoolList.get(address);
      controllerMaj(controller);
    });

    socket.on("HubMajRequest", () => {
      const mapArray = [...poolsController.getServerList()];
      emitToAll("HubMaj", mapArray);
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

  router.get("/parrot/:messageType", async (req, res) => {
    const message = await generateLiveMessage(req.params.messageType);
    res.send(message);
  });

  return router;
};
