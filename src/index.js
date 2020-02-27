export class CardDeck {

    static get Ranks() { return [2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K", "A"]; }
    static get Suits(){ return ["Hearts", "Clubs", "Diamonds", "Spades"] }

    constructor() {
        this.cards = this.buildDeck();
    }

    buildDeck() {
        let aDeck = new Array();
        CardDeck.Suits.forEach((suit, index) => {
            CardDeck.Ranks.forEach(rank => {
                aDeck.push({suit: suit, rank: rank, weight: index + 2})
            })
        })
        return aDeck;
    }

    shuffle() {
        var currentIndex = this.cards.length, temporaryValue, randomIndex;
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
    constructor(){
        this.hand=new Array();
    }
}

export class Game {
    constructor({rounds=5, numberOfPlayers=5, cardsPerPlayer=5}) {
        this.rounds = rounds;
        this.numberOfPlayers=numberOfPlayers;
        this.players = new Array();
        this.deck = new CardDeck();
        this.cardsPerPlayer= (cardsPerPlayer) ? cardsPerPlayer:5;
        for(var i=0; i<numberOfPlayers; i++){
            this.players.push(new Player());
        }
        this.deck.shuffle();
    }
    dealCardsToPlayers(){
        for(let i=0; i < this.cardsPerPlayer; i++){
            this.players.forEach( player=>{
                player.hand.push(this.deck.cards.pop());
            })
        }
    }

}

