/* eslint-env jquery, es6, browser */

const timeLimit = 30;
const timeBetweenQuestions = 3;

let correct;
let incorrect;

let questions;
let remainingQuestions;

let counter;
let interval;

let countdownSoundTimer;

const winSound = new Audio('assets/audio/yay.ogg');
const loseSound = new Audio('assets/audio/buzzer.ogg');
const countdownSound = new Audio('assets/audio/countdown.ogg');
const jeopardySound = new Audio('assets/audio/jeopardy.ogg');

$(document).ready(() => {
  $('#start-button').hide();
  $('#game-area').hide();
  $('#game-over').hide();

  $.getJSON('assets/json/questions.json', (response) => {
    questions = shuffle(response);

    $('#start-button, #reset-button').on('click', restartGame);

    $('#please-wait').hide();
    $('#start-button').show();
  });
});

function restartGame() {
  $('#start-button').hide();
  $('#game-over').hide();
  $('#game-area').show();

  remainingQuestions = questions.slice();
  setCorrect(0);
  setIncorrect(0);
  nextQuestion();

  jeopardySound.loop = true;
  jeopardySound.playbackRate = 1;
  jeopardySound.play();
}

function rightAnswer() {
  winSound.play();

  setCorrect(correct + 1);
  finishAnswer();
}

function wrongAnswer() {
  loseSound.play();

  setIncorrect(incorrect + 1);
  finishAnswer();
}

function finishAnswer() {
  stopCountdown();
  $('[class|=answer]').addClass('inactive').off('click');
  setTimeout(nextQuestion, timeBetweenQuestions * 1000);
}

function decrementCounter() {
  setCounter(counter - 1);

  if (counter === 0) {
    wrongAnswer();
  }
}

function nextQuestion() {
  const question = remainingQuestions.shift();

  if (question) {
    setCurrentQuestion(question);
  } else {
    endGame();
  }
}

function endGame() {
  jeopardySound.pause();

  $('#correct-count').text(correct);
  $('#incorrect-count').text(incorrect);

  $('#game-area').hide();
  $('#game-over').show();
}

function setCorrect(n) {
  correct = n;
}

function setIncorrect(n) {
  incorrect = n;
}

function setCounter(n) {
  counter = n;
  $('#time-remaining').text(counter);
}

function setCurrentQuestion(question) {
  $('#question').text(question.question);

  const buttons = question.wrong.map(answer => makeButton(answer, false));
  buttons.push(makeButton(question.correct, true));

  const answersBox = $('#answers');
  answersBox.empty();

  $.each(shuffle(buttons), (_, eachButton) => {
    answersBox.append(eachButton);
  });

  startCountdown();
}

function startCountdown() {
  stopCountdown();

  setCounter(timeLimit);
  interval = setInterval(decrementCounter, 1000);

  countdownSoundTimer = setTimeout(() => {
    countdownSound.play();
  }, (timeLimit - countdownSound.duration) * 1000);
}

function stopCountdown() {
  if (interval) {
    clearInterval(interval);
    interval = undefined;
  }

  if (countdownSoundTimer) {
    clearTimeout(countdownSoundTimer);
    countdownSoundTimer = undefined;
  }
}

function makeButton(answer, isCorrect) {
  const button = $('<button>').text(answer);

  if (isCorrect) {
    button.addClass('answer-correct').on('click', rightAnswer);
  } else {
    button.addClass('answer-incorrect').on('click', wrongAnswer);
  }

  return button;
}

function shuffle(array) {
  // from https://www.frankmitchell.org/2015/01/fisher-yates/

  const newArray = array.slice();

  for (let i = newArray.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = newArray[i];
    newArray[i] = newArray[j];
    newArray[j] = temp;
  }

  return newArray;
}
