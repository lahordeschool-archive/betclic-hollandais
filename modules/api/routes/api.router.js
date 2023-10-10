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
const gameIAController = new IA_GameController(this);

const { generateLiveMessage } = require("../../../lib/openai");

gameController.address = "1111";
gameIAController.address = "2222";

poolsController.addPool("1000");
poolsController.addPool("2000");
poolsController.addPool("3000");
poolsController.addPool("4000");
poolsController.addPool("5000");

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
    socketUsers[socket.id] = socket;

    socket.on("disconnect", () => {
      delete socketUsers[socket.id];
    });

    socket.on("connected", () => {
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
          socket.emit("ServerNotConnect");
        }
      } else {
        socket.emit("ServerNotConnect");
      }
    });

    socket.on("messageTest", () => {
      // Handle the event here
      emitToAll("messageTestReceived", 'Server received "messageTest" message');
    });

    socket.on("connectPlayer", (user) => {
      let controller = poolsController.PoolList.get(user.address);
      let alreadyLogged = false;
      controller.playerList.forEach((player) => {
        if (player.mail === user.mail) {
          alreadyLogged = true;
          player.socket = socket;
          "Player " + player.mail + " reconnected";
        }
      });
      if (
        !alreadyLogged &&
        controller.playerList.length <= 5 &&
        !controller.gameInProgress
      ) {
        controller.addPlayer(user.name, user.mail, socket);
      }
      const mapArray = [...poolsController.getServerList()];
      emitToAll("HubMaj", mapArray);
      router.updateClassement(controller);
    });

    router.VerifPlayerPlayInTime = function (
      address,
      manche,
      round,
      currentPlayer
    ) {
      let controller = poolsController.PoolList.get(address);

      // Vérifiez si le timeout est toujours valide et d'autres conditions requises
      if (
        controller.currentTimeout &&
        controller.gameInProgress &&
        manche === controller.currentManche &&
        round === controller.currentRound &&
        controller.winner == null
      ) {
        console.log(
          "Action par default demandée pour le joueur " +
            currentPlayer +
            " car il n'a pas joué"
        );

        // Avant d'exécuter l'action par défaut, annulez le timeout pour éviter des appels multiples
        clearTimeout(controller.currentTimeout);
        controller.currentTimeout = null; // Réinitialisez-le pour éviter toute confusion future

        poolsController.defaultAction(controller, address);
        controller.dataSet();

        if (controller.playerList[controller.currentPlayer]) {
          if(controller.dataCurrentPlayer && controller.betList){
            controller.dataCurrentPlayer.betList = controller.betList;
          } else if(controller.dataCurrentPlayer){
            controller.dataCurrentPlayer.betList = [];
          }
          controller.playerList[controller.currentPlayer].socket.emit(
            "PlayerTurn",
            controller.dataCurrentPlayer
          );
        }

        controllerMaj(controller);
      } else {
        // Le log ci-dessous est optionnel, décommentez-le si vous souhaitez des logs supplémentaires
        
      }
    };

    router.nextTurn = function (address) {
      let controller = poolsController.PoolList.get(address);

      // Si un timeout précédent existe pour ce controller, l'annuler
      if (controller.currentTimeout) {
        clearTimeout(controller.currentTimeout);
      }

      try {
        controller.playerList[controller.currentPlayer].socket.emit(
          "PlayerTurn",
          controller.dataCurrentPlayer
        );

        // Stockez l'ID de timeout dans l'objet controller
        controller.currentTimeout = setTimeout(
          () =>
            router.VerifPlayerPlayInTime(
              address,
              controller.currentManche,
              controller.currentRound,
              controller.currentPlayer
            ),
          10000 // Modifié à 5 secondes (5000 ms) comme vous l'avez mentionné initialement
        );
      } catch (error) {
        console.log("Action par default demandée car echec de emit PlayerTurn");

        // Avant d'exécuter l'action par défaut, assurez-vous d'annuler le timeout pour éviter les problèmes
        if (controller.currentTimeout) {
          clearTimeout(controller.currentTimeout);
          controller.currentTimeout = null; // Réinitialisez-le pour éviter toute confusion future
        }

        poolsController.defaultAction(controller);
      }
    };

    router.updateClassement = function (controller) {
      let classement = [];
      controller.playerList.forEach((player) => {
        classement.push({
          name: player.name,
          mail: player.mail,
          score: player.diceNb != null ? player.diceNb : 5,
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
      emitToAllInController("updateClassement", classement, controller);
    };

    socket.on("launchBattle", (address) => {
      let controller = poolsController.PoolList.get(address);

      if (controller.playerList.length >= 2) {
        controller.init();

        //determine current player that has launched the game
        controller.playerList.forEach((player, index) => {
          if (player.socket === socket) {
            controller.currentPlayer = index;
          }
        });

        controller.dataSet();
        const mapArray = [...poolsController.getServerList()];
        emitToAll("HubMaj", mapArray);
        emitToAllInController("BattleLaunched", {}, controller);

        emitToAllInController(
          "updateHistorique",
          getTime() + " - Début de la partie",
          controller
        );

        controllerMaj(controller);
        setTimeout(() => router.nextTurn(address), 10000); // Attendre 5 secondes
      } else {
        console.log("Not enough players to init server " + address);
      }
    });

    socket.on("objection", (address) => {
      router.objectionAction(address, false);
    });

    socket.on("bet", (data) => {
      router.betAction(data, socket, poolsController, false);
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

  function getTime() {
    let date = new Date();
    let hour = date.getHours();
    let minutes = date.getMinutes();
    if (minutes < 10) {
      minutes = "0" + minutes;
    }
    return hour + ":" + minutes;
  }
  router.betAction = function (data, socket, isDefaultAction) {
    let controller = poolsController.PoolList.get(data.address);
    if (controller.gameInProgress) {
      
      //if(socket === controller.playerList[controller.currentPlayer].socket){
      let resultOfBet = controller.bet(data.bet[0], data.bet[1]);
      controller.dataSet();
      emitToAllInController(
        "updateHistorique",
        getTime() +
          " - " +
          resultOfBet +
          (isDefaultAction ? " - (action par défaut)" : ""),
        controller
      );
      setTimeout(() => router.nextTurn(data.address), 5000); // Attendre 5 secondes
      controllerMaj(controller);
      //}
    }
  };

  router.objectionAction = function (address, isDefaultAction) {
    let controller = poolsController.PoolList.get(address);
    if (controller.gameInProgress) {
      //if(socket === controller.playerList[controller.currentPlayer].socket){
      
      emitToAllInController(
        "updateHistorique",
        getTime() +
          " - " +
          controller.playerList[controller.currentPlayer].name +
          " : Moi je dis : DUDO ! Faites voir vos dés.",
        controller
      );

      let resultOfObjection = controller.objection();
      if (resultOfObjection) {
        emitToAllInController(
          "updateHistorique",
          getTime() +
            " - " +
            resultOfObjection +
            (isDefaultAction ? " - (action par défaut)" : ""),
          controller
        );
        router.updateClassement(controller);
      }
      controller.dataSet();
      if (controller.winner == null) {
        setTimeout(() => router.nextTurn(address), 5000); // Attendre 5 secondes
        controllerMaj(controller);
      } else {
        emitToAllInController("finish", controller.winner, controller);
        controller.removeAllPlayer();
        const mapArray = [...poolsController.getServerList()];
        emitToAll("HubMaj", mapArray);
      }
      //}
    }
  };

  /* GET user info */
  router.get("/getUserInfos", (req, res) => {
    if (req.isAuthenticated()) {
      res.send({
        "_id": req.user._id,
        iaCode: req.user.iaCode,
        firstname: req.user.firstname,
        lastname: req.user.lastname,
        email: req.user.email,
      });
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
  router.socketUsers = socketUsers;
  poolsController.router = router;
  return router;
};
