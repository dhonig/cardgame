import {expect} from 'chai';
import {CardDeck} from './index'
import {Player} from './index'
import {Game} from './index'

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

})


describe('Game', () => {

    it('Is initailized with the correct number of players', () => {
        let aGame = new Game({rounds: 4, numberOfPlayers: 5, cardsPerPlayer: 5});
        expect(aGame.players.length).to.eql(5);
    })
    it('Is initialized with the correct number of cardsPerPlayer when passed an amount', () => {
        let aGame = new Game({rounds: 4, numberOfPlayers: 5, cardsPerPlayer: 7});
        expect(aGame.cardsPerPlayer).to.eql(7);
    })
    it('Is initialized with the default number of cards when not passed the number of cards', () => {
        let aGame = new Game({rounds: 4, numberOfPlayers: 5})
        expect(aGame.cardsPerPlayer).to.eql(5);
    })
    it ('Deals the correct amount of cards to all players', () => {
        let aGame = new Game({rounds: 4, numberOfPlayers: 5, cardsPerPlayer: 7});
        aGame.dealCardsToPlayers();
        aGame.players.forEach(player=>{
            expect(player.hand.length).to.eql(7)
        })
        expect((52-(aGame.numberOfPlayers*cardsPerPlayer)).to.eql(aGame.deck.cards.lenght);
    })

})



