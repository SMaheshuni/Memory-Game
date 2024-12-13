const container = document.querySelector('.container')
const moves = document.querySelector('.moves span')
const misses = document.querySelector('.misses span')
const score = document.querySelector('.score span')
let myName;
localStorage.myName = prompt("Please enter your name")
const congratsCard = document.querySelector('.congrats-card')
const showName = document.querySelector('.congrats-card h4')
const alpha = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]


let finalcards = [];
let count = 1;
let showCardsCount = 0
let selectedCards = []
let timer;

score.innerText = 0
misses.innerText = 0
moves.innerText = 0

const generateCards = function () {
    let cards = [];
    let cards1 = [];
    while (cards.length !== alpha.length) {
        let val = Math.floor(Math.random() * alpha.length);
        if (!cards.includes(alpha[val])) {
            cards.push(alpha[val])
        }
    }
    while (cards1.length !== alpha.length) {
        let val = Math.floor(Math.random() * alpha.length);
        if (!cards1.includes(alpha[val])) {
            cards1.push(alpha[val])
        }
    }
    return [...cards, ...cards1]
}


function showCards() {
    const fin = generateCards();
    for (const car of fin) {
        const card = document.createElement('div')
        card.classList.add('card')
        card.id = `card${count++}`
        container.append(card)
        card.innerHTML = `${car}`
    }
}

showCards();
const pop = document.createElement('div')
document.body.append(pop)


container.addEventListener('click', (e) => {
    showCardsCount++;
    if (showCardsCount <= 2) {
        e.target.classList.add('isClicked')
        selectedCards.push(e.target)
        setTimeout(() => {
            if (selectedCards.length === 2 && selectedCards[0].innerText === selectedCards[1].innerText && selectedCards[0].id !== selectedCards[1].id) {
                console.log(selectedCards[0].id, selectedCards[1].id)
                selectedCards[0].remove();
                selectedCards[1].remove();
                score.innerText = parseInt(score.innerText) + 1
                moves.innerText = parseInt(moves.innerText) + 1
                console.log(score.innerText)
                if(score.innerText == 12){
                    congratsCard.classList.add('display');
                    document.body.classList.add('showConfetti')
                    showName.innerText = localStorage.myName
                }
            }
        }, 1000)

    } else {
        selectedCards[0].classList.remove('isClicked')
        selectedCards[1].classList.remove('isClicked')
        selectedCards = [];
        selectedCards.push(e.target);
        selectedCards[0].classList.add('isClicked')
        showCardsCount = 1
        misses.innerText = parseInt(misses.innerText) + 1
        moves.innerText = parseInt(moves.innerText) + 1
    }
  
})


