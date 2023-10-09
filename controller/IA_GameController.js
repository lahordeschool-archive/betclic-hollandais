class IA_GameController {
  constructor(router) {
    this.address = "";
    this.router = router;
    this.gameInProgress = false;

    this.currentRound = 1;
    this.currentManche = 1;

    this.playerList = [];
    this.playerListWithoutDicesValue = [];
    this.specialManche = false;

    this.allDices = [];
    this.currentBet = [0, 2];
    this.winner = null;
    this.currentPlayer = null;
    this.lastPlayer = 0;
    this.mancheLoser = null;

    this.betList = [];
    this.minPaco;
    this.minNumber;
    this.dataCurrentPlayer;
  }

  init() {
    this.gameInProgress = true;
    this.currentRound = 1;
    this.currentManche = 1;
    this.specialManche = false;
    this.allDices = [];
    this.currentBet = [0, 2];
    this.winner = null;
    this.currentPlayer = 0;
    this.lastPlayer = 0;
    this.mancheLoser = null;
    this.betList = [];

    this.resetPlayersNbDices();
    this.rollDices();
  }

  addPlayer(playerName, mail, socket) {
    this.playerList.push({
      socket: socket,
      mail: mail,
      name: playerName,
      diceNb: 5,
      dices: [],
      bet: [],
    });
  }

  removePlayerByName(playerName) {
    let filterList = this.playerList.filter(
      (player) => player.name !== playerName
    );
    this.playerList = filterList;
  }

  removePlayer(index) {
    this.playerList.splice(index, 1);
  }

  removeAllPlayer() {
    this.playerList = [];
  }

  setPlayerBet(playerBet) {
    if (this.gameInProgress) {
      this.playerList[this.currentPlayer].bet = playerBet;
    }
  }

  resetPlayersBets() {
    this.playerList.forEach((player) => {
      player.bet = [];
    });
  }

  resetPlayersNbDices() {
    this.playerList.forEach((player) => {
      player.diceNb = 5;
    });
  }

  getPlayerListWithoutDicesValue() {
    this.playerListWithoutDicesValue = [];
    this.playerList.forEach((player) => {
      this.playerListWithoutDicesValue.push({
        mail: player.mail,
        name: player.name,
        diceNb: player.diceNb,
        bet: player.bet,
      });
    });
    return this.playerListWithoutDicesValue;
  }

  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  rollDices() {
    this.allDices = [];
    this.playerList.forEach((player) => {
      player.dices = [];
      for (let index = 0; index < player.diceNb; index++) {
        var randNum = this.getRandomInt(1, 6);
        player.dices.push(randNum);
        this.allDices.push(randNum);
      }
    });
  }

  objection() {
    let resultOfObjection = false;
    if (this.gameInProgress) {
      let count;
      if (this.currentTimeout) {
        clearTimeout(this.currentTimeout);
      }
      if (this.specialManche) {
        count = this.allDices.filter(
          (die) => die === this.currentBet[1]
        ).length;
        this.specialManche = false;
      } else {
        count = this.allDices.filter(
          (die) => die === this.currentBet[1] || die === 1
        ).length;
      }

      let finish = false;

      this.mancheLoser =
        count >= this.currentBet[0] ? this.currentPlayer : this.lastPlayer;

      this.playerList[this.mancheLoser].diceNb--;
      resultOfObjection =
        "Le joueur " +
        this.playerList[this.mancheLoser].name +
        " vient de perdre un dés";
      if (this.playerList[this.mancheLoser].diceNb === 1) {
        this.currentBet = [0, 1];
        this.specialManche = true;
      } else {
        this.currentBet = [0, 2];
      }

      let countPlayer = 0;
      let win;
      this.playerList.forEach((player) => {
        console.log("il reste " + player.diceNb + " dés à " + player.name);
        if (player.diceNb > 0) {
          countPlayer++;
          win = player.name;
        }
      });

      if (countPlayer === 1) {
        finish = true;
      }

      if (!finish) {
        this.currentPlayer = this.mancheLoser;

        while (this.playerList[this.currentPlayer].diceNb === 0) {
          this.currentPlayer =
            (this.currentPlayer + 1) % this.playerList.length;
        }

        this.currentManche++;
        this.betList = [];
        this.currentRound = 1;
        this.rollDices();
      } else {
        //resultOfObjection = "La partie est terminée. Le gagnant est :" + win;
        this.winner = win;
        this.gameInProgress = false;
      }
    }
    return resultOfObjection;
  }

  bet(count, value) {
    let resultOfBet = false;
    if (this.gameInProgress) {
      this.setPlayerBet([count, value]);
      if (this.currentTimeout) {
        clearTimeout(this.currentTimeout);
      }
      resultOfBet =
        this.playerList[this.currentPlayer].name +
        " - Je parie qu'il y a " +
        count +
        " dés de " +
        value;
      this.currentBet = [count, value];
      this.betList.push(this.currentBet);
      this.currentRound++;

      this.lastPlayer = this.currentPlayer;

      this.currentPlayer = (this.currentPlayer + 1) % this.playerList.length;

      while (this.playerList[this.currentPlayer].diceNb === 0) {
        this.currentPlayer = (this.currentPlayer + 1) % this.playerList.length;
      }
    }
    return resultOfBet;
  }

  getDataOther(player) {
    let dataOtherPlayer = {
      listPlayers: this.getPlayerListWithoutDicesValue(),
      MinPaco: this.dataCurrentPlayer.MinPaco,
      MinNumber: this.dataCurrentPlayer.MinNumber,
      CurrentBet: this.currentBet,
      CurrentManche: this.currentManche,
      CurrentRound: this.currentRound,
      CurrentPlayer: this.currentPlayer,
      BetList: this.BetList,
      YourDices: player.dices,
      TotaDices: this.allDices.length,
      IsSpecialManche: this.specialManche,
    };
    return dataOtherPlayer;
  }

  dataSet() {
    this.minNumber = this.currentBet[0];
    this.minPaco = this.currentBet[0];

    if (this.currentBet[1] >= 2) {
      this.minPaco = Math.ceil(this.currentBet[0] / 2);
    } else if (this.currentBet[1] == 1) {
      this.minNumber = Math.ceil(this.currentBet[0] * 2 + 1);
    }

    //bloquer le passage en valeur numérique si c'est plus grand que le nombre de dés présent
    if (this.minNumber > this.allDices.length) {
      this.minNumber = null;
    }

    this.dataCurrentPlayer = {
      listPlayers: this.getPlayerListWithoutDicesValue(),
      MinPaco: this.minPaco,
      MinNumber: this.minNumber,
      CurrentBet: this.currentBet,
      CurrentManche: this.currentManche,
      CurrentRound: this.currentRound,
      CurrentPlayer: this.currentPlayer,
      BetList: this.BetList,
      YourDices:
        this.playerList[this.currentPlayer] !== undefined
          ? this.playerList[this.currentPlayer].dices
            ? this.playerList[this.currentPlayer].dices
            : []
          : [],
      TotaDices: this.allDices.length,
      IsSpecialManche: this.specialManche,
    };
  }
}

module.exports = IA_GameController;
