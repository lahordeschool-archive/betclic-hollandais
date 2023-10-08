var socket;
let editor;
var serveurAddress;

var clientName = "";

var playerList = [];
var actualManche = 0;
var actualRound = 0;
var actualBet = [0, 2];
var actualtotalDices = 0;
var actualPlayerIndex = 0;
var playerDices = [];
var isSpecialManche = false;

var iterration = 0;

function rollDice(dices) {
  for (var i = 0; i <= dices.length; i++) {
    //clean dice faces
    for (var j = 1; j <= 6; j++) {
      $("#dice" + i + "").removeClass("show-" + j);
    }

    $("#dice" + i + "").addClass("show-" + dices[i]);
  }
}
$(document).ready(async function () {
  $("#dicesTable").hide();

  function SetServeurSession() {
    let storedData = JSON.parse(localStorage.getItem("SessionServerAddress"));
    const data = {
      value: storedData.value,
      timestamp: new Date().getTime(),
    };

    localStorage.setItem("SessionServerAddress", JSON.stringify(data));
  }

  function getServeurSession() {
    if (localStorage.getItem("SessionServerAddress")) {
      let storedData = JSON.parse(localStorage.getItem("SessionServerAddress"));
      if (storedData) {
        const timeNow = new Date().getTime();
        const timeLimit = 5 * 60 * 1000;
        if (timeNow - storedData.timestamp > timeLimit) {
          localStorage.removeItem("SessionServerAddress");
        } else {
          // Utilisez vos données comme vous le souhaitez
          $("#numeroTable").text(storedData.value);
          socket.emit("connectPlayer", {
            name: localStorage.getItem("UserFirstName"),
            mail: localStorage.getItem("UserMail"),
            address: storedData.value,
          });
          return storedData.value;
        }
      }
      return false;
    }
  }

  function redirectTo(newPath) {
    window.location.href =
      window.location.protocol +
      "//" +
      window.location.hostname +
      (window.location.port ? ":" + window.location.port : "") +
      newPath;
  }

  socket = await io.connect();

  socket.on("connect", () => {
    updateFunction();
    serveurAddress = getServeurSession();

    if (localStorage.getItem("UserFirstName") == null) {
      $.get("/api/getUserInfos", function (data) {
        localStorage.setItem("UserFirstName", data.firstname);
        localStorage.setItem("UserMail", data.id);
      }).fail(function () {
        console.error(
          "Erreur lors de la récupération des informations de l'utilisateur."
        );
      });
    }

    socket.emit("connected");

    $("#launchBattleButton").on("click", function () {
      socket.emit("launchBattle", serveurAddress);
    });

    socket.on("BattleLaunched", () => {
      UI.hideLaunchButton();
    });

    if (serveurAddress === false) {
      redirectTo("/hub");
    } else {
      socket.emit("getServer", {
        serveurAddress: serveurAddress,
        mail: localStorage.getItem("UserMail"),
      });
    }

    socket.on("ServerNotConnect", () => {
      localStorage.removeItem("SessionServerAddress");
      redirectTo("/hub");
    });

    socket.on("messageTestReceived", (message) => {});

    socket.on("updateClassement", (classement) => {
      UI.refreshClassement(classement);
    });

    socket.on("updateHistorique", (entry) => {

      $("#betButton").attr("disabled", "disabled");
      $("#objectionButton").attr("disabled", "disabled");
      UI.addHistoriqueEntry(entry);
    });
    socket.on("PlayerTurn", (gameInfo) => {
      if (
        gameInfo.listPlayers[gameInfo.CurrentPlayer].mail ==
        localStorage.getItem("UserMail")
      ) {
        playerList = gameInfo.listPlayers;
        actualManche = gameInfo.CurrentManche;
        actualRound = gameInfo.CurrentRound;
        actualBet = gameInfo.CurrentBet;
        actualtotalDices = gameInfo.TotaDices;
        actualPlayerIndex = gameInfo.CurrentPlayer;
        playerDices = gameInfo.YourDices;
        isSpecialManche = gameInfo.IsSpecialManche;

        UI.displayDices();
        UI.refreshDisplay();

        if (!window.location.href.includes("/training")) {
          window.yourTurn(gameInfo);
        } else {
            $("#betButton").removeAttr("disabled");
            $("#objectionButton").removeAttr("disabled");
        }
        //setTimeout(yourTurn(gameInfo), 5000);

        SetServeurSession();
      } else {
        $("#betButton").attr("disabled", "disabled");
        $("#objectionButton").attr("disabled", "disabled");
      }
    });

    $("#betButton").on("click", function () {
        window.bet([$("#betCount").val(), $("#betValue").val()]);
    });

    $("#objectionButton").on("click", function () {
        window.objection();
    });

    socket.on("Maj", (gameInfo) => {
      playerList = gameInfo.listPlayers;
      actualManche = gameInfo.CurrentManche;
      actualRound = gameInfo.CurrentRound;
      actualBet = gameInfo.CurrentBet;
      actualtotalDices = gameInfo.TotaDices;
      actualPlayerIndex = gameInfo.CurrentPlayer;
      playerDices = gameInfo.YourDices;
      isSpecialManche = gameInfo.IsSpecialManche;

      UI.displayDices();
      UI.refreshDisplay();

      SetServeurSession();
    });

    socket.on("finish", (playerName) => {
      console.log("finish");
      UI.addHistoriqueEntry("Partie terminée ! Le gagnant est : " + playerName);
      //alert('Gagnant :'+ playerName);
      //localStorage.removeItem('SessionServerAddress');
      //redirectTo('/game-IDE');
    });

    /*function yourTurn(data) {
      PerudoAI.decideAction(
        actualBet,
        playerDices,
        actualtotalDices,
        isSpecialManche
      );
    }*/
  });

  window.objection = function () {
    if (VerifyObjection()) {
      console.log("Objection " + actualRound);
      socket.emit("objection", serveurAddress);
      iterration = 0;
      return true;
    } else {
      iterration++;
      if (iterration === 5) {
        PerudoAI.decideAction(
          actualBet,
          playerDices,
          actualtotalDices,
          isSpecialManche
        );
        iterration = 0;
        return true;
      } else {
        return false;
      }
    }
  };

  window.bet = function (newBet) {
    if (VerifyBet(newBet)) {
      console.log("Bet " + actualRound);
      socket.emit("bet", { bet: newBet, address: serveurAddress });
      iterration = 0;
      return true;
    } 
    /*else {
      iterration++;
      if (iterration === 5) {
        PerudoAI.decideAction(
          actualBet,
          playerDices,
          actualtotalDices,
          isSpecialManche
        );
        iterration = 0;
        return true;
      } else {
        return false;
      }
    }*/
  };

  const UI = (() => {
    var currentClass = [];
    var cubes = null;

    const displayClientName = document.querySelector(".user-name");
    const displayActualPlayer = document.querySelector(".player-name");

    const betCount = document.querySelector(".bet-input.bet-count");
    const betValue = document.querySelector(".bet-input.bet-number");

    function refreshDisplay() {
      let gameInfoScene = document.querySelector(".game-info");
      let gameInfo = document.querySelector(".round-info");
      if (gameInfo != null) {
        gameInfo.remove();
      }
      let gameInfoHTML =
        `
                <div class="round-info">
                    <span>Manche: </span><span>` +
        actualManche +
        `</span>
                    <span>Round: </span><span>` +
        actualRound +
        `</span>
                </div>
            `;

      $(".game-info").html(gameInfoHTML);

      let playersScene = document.querySelector(".players");
      let players = document.querySelectorAll(".player");
      if (players != null) {
        players.forEach((player) => {
          player.remove();
        });
      }

      playerList.forEach((player) => {
        let PlayerHTML =
          `
                    <div class="player">
                        <h3>` +
          player.name +
          `</h3>
                        <p class="bet">Bet: <span>` +
          player.bet +
          `</span></p>
                        <p class="dice-count">Dice Count: <span>` +
          player.diceNb +
          `</span></p>
                    </div>
                `;

        //playersScene.innerHTML += PlayerHTML;
      });

      betCount.value = actualBet[0];
      betValue.value = actualBet[1];
      $("#betCount").val(actualBet[0]);
      $("#betValue").val(actualBet[1]);
    }

    function refreshClassement(classement) {
      $("#classement").html("");
      for (let i = 0; i < classement.length; i++) {
        let dicesIcons = "";
        if (classement[i].score == 0) {
          dicesIcons = "🏴‍☠️ ";
        } else {
          for (let j = 0; j < classement[i].score; j++) {
            dicesIcons += "🎲 ";
          }
        }
        let isYou = "";
        if (classement[i].mail == localStorage.getItem("UserMail")) {
          isYou = " (Vous)";
        }

        $("#classement").append(
          "<li>" + dicesIcons + "● " + classement[i].name + isYou + "</li>"
        );
      }
    }

    function hideLaunchButton() {
      $("#battleLaunch").hide();
      $("#ongoingBetZone").show();
    }

    function addHistoriqueEntry(entry) {
      $("#historique").prepend("<li>" + entry + "</li>");
    }

    function displayDices() {
      $("#dicesTable").show();
      rollDice([
        playerDices[0] ? playerDices[0] : 0,
        playerDices[1] ? playerDices[1] : 0,
        playerDices[2] ? playerDices[2] : 0,
        playerDices[3] ? playerDices[3] : 0,
        playerDices[4] ? playerDices[4] : 0,
      ]);
    }

    return {
      displayDices: displayDices,
      refreshDisplay: refreshDisplay,
      refreshClassement: refreshClassement,
      hideLaunchButton: hideLaunchButton,
      addHistoriqueEntry: addHistoriqueEntry,
    };
  })();
});

function VerifyBet(newBet) {
  // Vérifier s'il s'agit d'un nouveau pari
  if (JSON.stringify(actualBet) == JSON.stringify(newBet)) {
    return false;
  }

  // Vérifier si nous essayons de passer des dés réguliers aux pacos
  if (newBet[1] === 1 && actualBet[1] !== 1) {
    // Assurez-vous que le nombre de dés pariés pour le paco est supérieur à la moitié du pari précédent
    if (newBet[0] >= Math.ceil(actualBet[0] / 2)) {
      return true;
    }
  }

  // Vérifier si nous essayons de passer des pacos aux dés réguliers
  if (newBet[1] !== 1 && actualBet[1] === 1) {
    // Assurez-vous que le nombre de dés pariés est au moins le double de l'ancien pari + 1
    if (newBet[0] >= 2 * actualBet[0] + 1 && newBet[1] >= 1) {
      return true;
    }
  }

  // Vérifier si le nouveau pari surenchérit sur l'ancien pari
  if (
    (newBet[0] > actualBet[0] && newBet[1] == actualBet[1]) ||
    (newBet[0] >= actualBet[0] && newBet[1] > actualBet[1])
  ) {
    return true;
  }

  // Si le pari précédent était un paco, vous pouvez surenchérir sur la valeur ou le nombre
  if (actualBet[1] === 1 && newBet[1] === 1) {
    if (newBet[0] > actualBet[0]) {
      return true;
    }
  }

  // Si aucune des conditions ci-dessus n'est satisfaite, le pari n'est pas valide
  return false;
}

function VerifyObjection() {
  //check is a new bet
  if (
    JSON.stringify(actualBet) == JSON.stringify([0, 1]) ||
    JSON.stringify(actualBet) == JSON.stringify([0, 2])
  ) {
    return false;
  } else {
    return true;
  }
}

function updateFunction() {
  const code = localStorage.getItem("My_AI");
  try {
    const newFunction = new Function("data", code);
    window.yourTurn = newFunction;
    $("#iaState").show();
  } catch (error) {
    console.log(error.message);
    alert("Error in your code: " + error.message);
  }
}

const PerudoAI = (() => {
  function estimateProbability(totalDice, myDice, diceValue) {
    // Ceci est une approximation simplifiée pour estimer la probabilité.
    const myCount = myDice.filter((d) => d === diceValue).length;
    const otherDice = totalDice - myDice.length;
    const expectedCount = otherDice / 6; // Supposition : chaque face du dé a une chance égale d'apparaître.

    return Math.ceil(myCount + expectedCount);
  }

  function decideAction(previousBet, myDice, totalDice, isSpecialManche) {
    let [prevCount, prevValue] = previousBet;
    let newBet = null;

    let probabilities = [];
    for (let value = 1; value <= 6; value++) {
      probabilities[value] = estimateProbability(totalDice, myDice, value);
    }

    let NoneContest;
    if (!isSpecialManche) {
      let pacoProbability = probabilities[1];
      NoneContest = pacoProbability + probabilities[prevValue] > prevCount;
    } else {
      NoneContest = probabilities[prevValue] > prevCount;
    }

    if (NoneContest) {
      if (prevValue === 1) {
        // Essayer de surenchérir sur les pacos
        if (probabilities[1] > prevCount && probabilities[1] >= 1) {
          newBet = [probabilities[1], 1];
        } else {
          // Si impossible de surenchérir sur pacos, essayer de quitter les pacos
          for (let value = 6; value >= 2; value--) {
            if (probabilities[value] >= prevCount * 2 + 1) {
              newBet = [probabilities[value], value];
              break;
            }
          }
        }
      } else {
        for (let value = 6; value >= prevValue; value--) {
          if (probabilities[value] >= prevCount && probabilities[value] >= 1) {
            newBet = [probabilities[value], value];
            break;
          }
        }
        if (newBet != null) {
          if (newBet[0] === prevCount && newBet[1] === prevValue) {
            newBet = null;
          }
        }

        if (!isSpecialManche && newBet != null) {
          let pacoProbability = probabilities[1];
          newBet[0] <= pacoProbability + probabilities[newBet[1]];
        }

        if (newBet === null) {
          // Si nous ne pouvons toujours pas parier plus, essayons de passer aux pacos
          if (
            probabilities[1] >= Math.ceil(prevCount / 2) &&
            probabilities[1] >= 1
          ) {
            newBet = [probabilities[1], 1];
          }
        }
      }
    }

    if (newBet != null) {
      window.bet(newBet);
    } else if (
      JSON.stringify(previousBet) == JSON.stringify([0, 1]) ||
      JSON.stringify(previousBet) == JSON.stringify([0, 2])
    ) {
      window.bet([prevCount + 1, prevValue]);
    } else {
      window.objection();
    }
  }

  return {
    estimateProbability: estimateProbability,
    decideAction: decideAction,
  };
})();
