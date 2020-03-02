export class Card {
    constructor({suit, rank, weight}) {
        this.suit = suit;
        this.rank = rank;
        this.weight = weight;
    }
}


export class CardDeck {

    static get Ranks() {
        return [2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K", "A"];
    }

    static get Suits() {
        return ["Hearts", "Clubs", "Diamonds", "Spades"]
    }

    static logCards(array) {
        array.forEach(card => console.log(`Rank: ${rank}  Suit: ${suit} Weight: ${weight}`))
    }

    constructor() {
        this.cards = this.buildDeck();
    }

    buildDeck() {
        let aDeck = new Array();
        CardDeck.Suits.forEach((suit) => {
            CardDeck.Ranks.forEach((rank, index) => {
                aDeck.push(new Card({suit: suit, rank: rank, weight: index + 2}))
            })
        })
        return aDeck;
    }

    shuffle() {
        let currentIndex = this.cards.length, temporaryValue, randomIndex;
        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = this.cards[currentIndex];
            this.cards[currentIndex] = this.cards[randomIndex];
            this.cards[randomIndex] = temporaryValue;
        }
        return this.cards;
    }

}

export class Player {
    constructor() {
        this.hand = new Array();
        //A Player can trade in all but two cards once per round
        this.hasTradedCards = false;
    }


    valueOfHand() {
        //Use destructuring to compute weight
        return this.hand.reduce((sum, {weight}) => sum + weight, 0);
    }

    //Randomly decide to trade in cards
    // random thirty percent chance to trade
    wantsToTrade() {
        return (Math.floor(Math.random() * 101) > 70) ? true : false;
    }
}


export class BestPlayerByAverageScoreStrategy {


    computeBestPlayer(aGame) {
        let rounds = aGame.rounds;
        let recordOfRounds = aGame.recordOfRounds;
        let numberOfPlayer = aGame.numberOfPlayers;
        let player = 'player1';
        let averageScoresForPlayers = aGame.players.map((player, index) => {
            let playerName = `player${index}`
            return this.avgPerPlayer(playerName, rounds, recordOfRounds);
        })
        let winningAverage = this.findWinningAverage(averageScoresForPlayers);
        return {player: winningAverage.player, message: "By having the highest average score."}
    }

    avgPerPlayer(player, rounds, recordOfRounds) {
        let allRoundScores = recordOfRounds.map(element => element.scores)
        let scores = [].concat.apply([], allRoundScores);
        let scoresForPlayer = scores.filter(element => element.player === player)
        let totalForPlayer = scoresForPlayer.reduce((sum, {score}) => sum + score, 0)
        let average = Math.floor(totalForPlayer / rounds)
        return {player: player, average: average}
    }

    findWinningAverage(scores) {
        //Return the object with the max in score field
        return scores.reduce((prev, current) => (prev.average > current.average) ? prev : current)
    }


}

export class BestPlayerByMostVictoriesStrategy {
    computeBestPlayer(aGame) {
        let playerWithMostVictories = this.findPlayerWithMostVictories(aGame)
        return {player: playerWithMostVictories.player, message: "By having the most victories."}
    }

    findPlayerWithMostVictories(aGame) {
        //ToDo:  implement logic to handle ties and return array of tied players
        let allRoundScores = aGame.recordOfRounds
        let winners = aGame.recordOfRounds.map(element => element.winner)
        let victoriesForPlayers = aGame.players.map((player, index) => {
            let playerName = `player${index}`
            let numberOfVictories = winners.filter(element => element.player === playerName)
            return {player: playerName, total:numberOfVictories}
        })

        return this.findWinningestPlayer(victoriesForPlayers);
    }

    findWinningestPlayer(scores){
        return scores.reduce((prev,current)=>(prev.total > current.total) ? prev: current )
    }
}


export class Game {

    //Best Player Strategies
    static get BEST_PLAYER_BY_AVERAGE() {
        return new BestPlayerByAverageScoreStrategy()

    }

    static get BEST_PLAYER_BY_MOST_VICTORIES() {
        return new BestPlayerByMostVictoriesStrategy();
    }

    constructor({rounds = 5, numberOfPlayers = 5, handSize = 5, bestPlayerStrategy = Game.BEST_PLAYER_BY_AVERAGE}) {
        this.rounds = rounds;
        this.numberOfPlayers = numberOfPlayers;
        this.players = new Array();
        this.deck = new CardDeck();
        //Change Strategy through constructor injection
        this.bestPlayerStrategy = bestPlayerStrategy;
        //Store the results of each round
        this.recordOfRounds = new Array();
        //If a number of cards is not specified default to 5
        this.cardsPerPlayer = (handSize >= 0 && handSize != undefined) ? handSize : 5;
        //Set up the game with the number of cards and players
        //ToDo: throw an error if the max number of cards and players exceeds number of cards
        for (var i = 0; i < this.numberOfPlayers; i++) {
            this.players.push(new Player());
        }
        //Shuffle the deck as part of construction of the game
        this.deck.shuffle();
    }

    dealCardsToPlayers() {
        for (let i = 0; i < this.cardsPerPlayer; i++) {
            this.players.forEach(player => {
                player.hand.push(this.deck.cards.pop());
            })
        }
    }


    manageTrades() {
        this.players.forEach((player, index) => {
            //Players may elect to trade once per round
            if (player.wantsToTrade() && player.hasTradedCards == false) {
                console.log(`Player${index} would like to trade cards.`)
                //Player may trade all but last two cards
                let cardsTurnedIn = 0; //Record # of cards turned in so we can replace them.
                while (player.hand.length > 2) {
                    this.deck.cards.push(player.hand.pop())
                    cardsTurnedIn += 1;
                }
                this.deck.shuffle();  //Ensure randomness of cards in deck
                //Replace cardsTurnedIn
                for (var i = 0; i < cardsTurnedIn; i++) {
                    player.hand.push(this.deck.cards.pop())
                }
                //Mark player as having traded this round
                player.hasTradedCards = true;
            }
        })
    }

    playGame() {
        for (let i = 0; i <= this.rounds; i++) {
            this.dealCardsToPlayers()
            this.manageTrades();
            let scores = this.sumPlayerScores()
            let roundWinner = this.findWinningScore(scores)
            this.recordOfRounds.push({winner: roundWinner, scores: scores})
            this.collectCardsFromPlayers()
            this.deck.shuffle(); //Set up for the next game
            this.logRoundWinner(roundWinner, i + 1)
            //Requirements were a little unclear, but we interpet as trading once a round.
            //Removing this line would allow trading only once per game
            this.players.forEach(player => this.playerHasTraded = false)
        }

        const results = this.calculateBestPlayer();
        console.log(`Player: ${results.player}, is the best player, ${results.message}`);
    }


    findWinningScore(scores) {
        //Return the object with the max in score field
        return scores.reduce((max, scoreRecord) => (max.score > scoreRecord.score ? max : scoreRecord))
    }

    logRoundWinner(roundWinner, round) {
        console.log(`Player: ${roundWinner.player} has won round ${round}, with a score of ${roundWinner.score}`)
    }


    sumPlayerScores() {
        return this.players.map((player, index) => {
            let playerName = `player${index}`
            return {score: player.valueOfHand(), player: playerName}
        })
    }


    collectCardsFromPlayers() {
        this.players.forEach(player => {
            while (player.hand.length != 0) {
                this.deck.cards.push(player.hand.pop())
            }
        })

    }

    calculateBestPlayer() {
        return this.bestPlayerStrategy.computeBestPlayer(this);
    }


}

