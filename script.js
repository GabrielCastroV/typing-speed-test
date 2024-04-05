// game
const $game = document.querySelector('#game')
const $time = document.querySelector('.time');
const $paragraph = document.querySelector('p');
const $input = document.querySelector('input');
// results
const $results = document.querySelector('#results');
const $wps = document.querySelector('.wps');
const $accuracy = document.querySelector('.acc');
const $btn = document.querySelector('.btn');

import { randomWords } from './data.js'
import confetti from 'https://cdn.skypack.dev/canvas-confetti';

const INITIAL_TIME = 30;

let currentTime = INITIAL_TIME;

let words = [];

initGame();
initEvents();

function initGame() {
    $input.value = ''
    $game.style.display = 'flex';
    $results.style.display = 'none';
    words = randomWords.toSorted(
        () => Math.random() - 0.5
    ).slice(0, 64)

    currentTime = INITIAL_TIME

    $time.textContent = currentTime;

    $paragraph.innerHTML = words.map(word => {
        const letters = word.split('')

        return `<word>
            ${
                letters
                .map(letter => `<letter>${letter}</letter>`)
                .join('')
            }
        </word>`
    }).join('')

    const firstWord = $paragraph.querySelector('word')
    firstWord.classList.add('active')
    firstWord.querySelector('letter').classList.add('active')

    const intervalId = setInterval(() => {
        currentTime--;
        $time.textContent = currentTime

        if (currentTime === 0) {
            clearInterval(intervalId);
            gameOver();
        }

    }, 1000);
}

function initEvents() {
    document.addEventListener('keydown', () => {
        $input.focus();
    })
    document.addEventListener('click', () => {
        $input.focus();
    })
    $input.addEventListener('input', onInputChange)
    // $input.addEventListener('keyup', onKeyUp)
    $btn.addEventListener('click', initGame)

    $input.addEventListener('keydown', onKeyDown)
    
}
function onKeyDown(event) {
    const $currentWord = $paragraph.querySelector('word.active');
    const $currentLetter = $currentWord.querySelector('letter.active');
    const { key } = event
    if (key === 'Tab') {
        event.preventDefault()
        return
    }

    if (key === ' ' || $input.value.includes(' ')) {
        event.preventDefault();

        const $nextWord = $currentWord.nextElementSibling;
        const $nextLetter = $nextWord.querySelector('letter')

        $currentWord.classList.remove('active', 'marked')
        $currentLetter.classList.remove('active')

        $nextWord.classList.add('active')
        $nextLetter.classList.add('active')

        $input.value = ''

        const hasMissedLetters = $currentWord.querySelectorAll('letter:not(.correct)').length > 0

        const classToAdd =  hasMissedLetters ? 'marked' : 'correct'
        $currentWord.classList.add(classToAdd)
        return
    }

    if (key === 'Backspace') {
        const $prevWord = $currentWord.previousElementSibling;
        const $prevLetter = $currentLetter.previousElementSibling;

        if (!$prevWord && !$prevLetter) {
            event.preventDefault();
            return
        }

        const $wordMarked = $paragraph.querySelector('word.marked');
        if ($wordMarked && !$prevLetter) {
            event.preventDefault();
            $currentWord.classList.remove('active')

            $prevWord.classList.add('active');
            $prevWord.classList.remove('marked');

            const $letterToGo = $prevWord.querySelector('letter:not(.correct):not(.incorrect)') ?? $prevWord.querySelector('letter:last-child');
            $currentLetter.classList.remove('active');
            $letterToGo.classList.add('active');

            $input.value = [
                ...$prevWord.querySelectorAll('letter.correct, letter.incorrect')
                
            ].map($el => {
                return $el.classList.contains('correct') ? $el.innerHTML : '*'
            }).join('')
        }
    }
}

function onInputChange(event) {
    const $currentWord = $paragraph.querySelector('word.active');
    const $currentLetter = $currentWord.querySelector('letter.active');

    const currentWord = $currentWord.innerText.trim();
    $input.maxLength = currentWord.length + 1;


    if ($input.value.includes(' ') || $input.value[currentWord.length] === ' ') {
        event.preventDefault();

        const $nextWord = $currentWord.nextElementSibling;
        const $nextLetter = $nextWord.querySelector('letter')

        $currentWord.classList.remove('active', 'marked')
        $currentLetter.classList.remove('active')

        $nextWord.classList.add('active')
        $nextLetter.classList.add('active')

        $input.value = ''

        const hasMissedLetters = $currentWord.querySelectorAll('letter:not(.correct)').length > 0

        const classToAdd =  hasMissedLetters ? 'marked' : 'correct'
        $currentWord.classList.add(classToAdd)
        return
    }

    const $allLetters = $currentWord.querySelectorAll('letter');
    $allLetters.forEach($letter => $letter.classList.remove('correct', 'incorrect'))

    $input.value.toLocaleLowerCase().split('').forEach((char, index) => {
        const $letter = $allLetters[index]
        if (!$letter) return
        const letterToCheck = currentWord[index]

        const isCorrect = char === letterToCheck;

        const letterClass = isCorrect ? 'correct' : 'incorrect'
        $letter.classList.add(letterClass)
    })
    
    $currentLetter.classList.remove('active', 'is-last')
    const inputLength = $input.value.length;
    const $nextActiveLetter = $allLetters[inputLength]

    if ($nextActiveLetter) {
        $nextActiveLetter.classList.add('active');
    } else {
        $currentLetter.classList.add('active', 'is-last')
    }

}

function gameOver() {
    

    $game.style.display = 'none';
    $results.style.display = 'flex';

    const correctWords = $paragraph.querySelectorAll('word.correct').length
    const correctLetter = $paragraph.querySelectorAll('letter.correct').length
    const incorrectLetter = $paragraph.querySelectorAll('letter.incorrect').length

    const totalLetters = correctLetter + incorrectLetter

    const accuracy = totalLetters > 0
        ? (correctLetter / totalLetters) * 100
        : 0

    const wps = correctWords * 60 / INITIAL_TIME
    $wps.textContent = wps
    $accuracy.textContent = `${accuracy.toFixed(2)}%`    
    if (accuracy >= 50 && wps >= 10) {
        confetti();
    }   
}