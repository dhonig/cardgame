import {expect} from 'chai';
import {CardDeck} from './index'
import {Card} from './index'
import {Player} from './index'
import {Game} from './index'

const sinon = require("sinon");
const sinonChai = require("sinon-chai");


describe('CardDeck', () => {


    it('Is initialized with 52 cards', () => {
        let aDeck = new CardDeck()
        expect(aDeck.cards.length).to.eql(52);
    });


    it('It is in random order when it is shuffled.', () => {
        let aDeck = new CardDeck();
        aDeck.shuffle();
        let anotherDeck = new CardDeck();
        expect(aDeck).to.not.eql(anotherDeck);
    });


});


describe('Player', () => {
    it('Is initialized with an empty hand', () => {
        let aPlayer = new Player();
        expect(aPlayer.hand.length).to.eql(0);
    })


    it('Correctly computes the sum of of a players hand', () => {
        let card1 = new Card({rank: "2", suit: "Clubs", weight: 4})
        let card2 = new Card({rank: "6", suit: "Clubs", weight: 8})
        let card3 = new Card({rank: "J", suit: "Clubs", weight: 11})
        let card4 = new Card({rank: "Q", suit: "Hearts", weight: 12})
        let card5 = new Card({rank: "A", suit: "Spades", weight: 14})

        let aPlayer = new Player()
        aPlayer.hand = [card1, card2, card3, card4, card5]
        expect(aPlayer.valueOfHand()).to.eql(49)

    })


    it('Can choose to trade in cards', () => {
        let aPlayer = new Player()
        expect(aPlayer.wantsToTrade()).to.be.a('boolean')
    })

})


describe('Game', () => {


    it('Is initailized with the correct number of players', () => {
        let aGame = new Game({rounds: 5, numberOfPlayers: 5, handSize: 5});
        expect(aGame.players.length).to.eql(5);
    })
    it('Is initialized with the correct number of handSize when passed an amount', () => {
        let aGame = new Game({rounds: 5, numberOfPlayers: 5, handSize: 7});
        expect(aGame.cardsPerPlayer).to.eql(7);
    })
    it('Is initialized with the default number of cards when not passed the number of cards', () => {
        let aGame = new Game({rounds: 5, numberOfPlayers: 5})
        expect(aGame.cardsPerPlayer).to.eql(5);
    })
    it('Deals the correct amount of cards to all players', () => {
        let aGame = new Game({rounds: 5, numberOfPlayers: 5, handSize: 7});
        aGame.dealCardsToPlayers();
        aGame.players.forEach(player => {
            expect(player.hand.length).to.eql(7)
        })
        let numberOfCardsDealt = aGame.numberOfPlayers * aGame.cardsPerPlayer;
        expect(52 - numberOfCardsDealt).to.eql(aGame.deck.cards.length);
    })

    it('Selects the top score from a list of score records', () => {
        let aGame = new Game({rounds: 5, numberOfPlayers: 5, handSize: 5});
        let score1 = {score: 42, player: "Player 1"}
        let score2 = {score: 20, player: "Player 1"}
        let score3 = {score: 36, player: "Player 1"}
        let scores = [score1, score2, score3]
        let topScore = aGame.findWinningScore(scores);
        expect(score1).to.eql(score1)
    })

    it('Correctly collects cards from players', () => {
        let aGame = new Game({rounds: 5, numberOfPlayers: 5, handSize: 5});
        aGame.dealCardsToPlayers();
        aGame.collectCardsFromPlayers();
        aGame.players.forEach(player => expect(player.hand.length).to.eql(0))
    })


    it('Allows a player to trade/replace all but two cards', () => {
        const personStub = sinon.stub(Player.prototype, "wantsToTrade").returns(true);
        let person = new Player()
        let person2 = new Player()
        let aGame = new Game({rounds: 5, numberOfPlayers: 2, handSize: 5});
        aGame.players = [person, person2]
        aGame.dealCardsToPlayers()
        let player1Hand = JSON.stringify(aGame.players[0])
        let player2Hand = JSON.stringify(aGame.players[0])
        aGame.manageTrades()
        expect(player1Hand).to.not.equal(JSON.stringify(aGame.players[0].hand))
        expect(player2Hand).to.not.equal(JSON.stringify(aGame.players[1].hand))

        personStub.restore();
    })

    it('Simulates a game via the playGame method,recording the results of each round', () => {
        let aGame = new Game({rounds: 4, numberOfPlayers: 5, handSize: 5});
        aGame.playGame()
        expect(aGame.recordOfRounds.length).to.eql(5)
        aGame.recordOfRounds.forEach(round => {
            expect(round.winner).to.not.be.null
            expect(round.scores).to.not.be.null
        })
    })

    it('Defaults to picking the best player by highest average', () => {
        let aGame = new Game({rounds: 5, numberOfPlayers: 5, handSize: 5});
        aGame.playGame()
        const results = aGame.calculateBestPlayer();
        expect(aGame.bestPlayerStrategy).to.eql(Game.BEST_PLAYER_BY_AVERAGE)
        expect(results.message).to.eql(`By having the highest average score.`);

    })

    it('Can support different strategies for picking the best player', () => {
        let aGame = new Game({
            rounds: 100,
            numberOfPlayers: 5,
            handSize: 5,
            bestPlayerStrategy: Game.BEST_PLAYER_BY_MOST_VICTORIES
        });
        aGame.playGame()
        const results = aGame.calculateBestPlayer();
        expect(aGame.bestPlayerStrategy).to.eql(Game.BEST_PLAYER_BY_MOST_VICTORIES)
        expect(results.message).to.eql('By having the most victories.')
    })


})



