

document.addEventListener('DOMContentLoaded', loader);

function loader() {
  compressHTML(); // first
  registerApp();  // last
}

let startPauseButton;
let resetButton;
let milliButton;
let placeTimeButton;
let copyTextButton;
// let saveTextButton;
// let loadTextButton;
let clearTextButton;

let timeDisplay;
let placedTimes;
let alertBox;

function registerApp() {

  startPauseButton = document.getElementById('start-pause-button');
  resetButton = document.getElementById('reset-button');
  milliButton = document.getElementById('milli-button')
  placeTimeButton = document.getElementById('place-time-button');
  copyTextButton = document.getElementById('copy-text-button');
  // saveTextButton = document.getElementById('save-text-button');
  // loadTextButton = document.getElementById('load-text-button');
  clearTextButton = document.getElementById('clear-text-button');

  timeDisplay = document.getElementById('time-display');
  placedTimes = document.getElementById('placed-times');
  alertBox = document.getElementById('alert-box')

  startPauseButton.addEventListener('click', toggleTimer);
  resetButton.addEventListener('click', toggleTimer);
  milliButton.addEventListener('click', toggleMilli);
  placeTimeButton.addEventListener('click', placeTime);
  copyTextButton.addEventListener('click', copyText);
  // saveTextButton.addEventListener('click', saveText);
  // loadTextButton.addEventListener('click', loadText);
  clearTextButton.addEventListener('click', clearText);

}

let startingTime;
let timeInterval;
let difference;

function toggleTimer(event) {

  let classList = event.currentTarget.classList;

  if (classList.contains('start')) {

    classList.remove('start');
    classList.add('pause');

    startingTime = Date.now();
    timeInterval = setInterval(updateDisplay, 1);

    acquireWakeLock();

  } else if (classList.contains('pause')) {

    classList.remove('pause');
    classList.add('resume');

    clearInterval(timeInterval);

  } else if (classList.contains('resume')) {

    classList.remove('resume');
    classList.add('pause');

    startingTime = Date.now() - (difference || 0);
    timeInterval = setInterval(updateDisplay, 1);

  } else if (classList.contains('reset')) {

    startPauseButton.classList.remove('pause');
    startPauseButton.classList.remove('resume');
    startPauseButton.classList.add('start');

    clearInterval(timeInterval);
    updateDisplay(true);

    releaseWakeLock();
  }
}

function updateDisplay(reset = false) {
  difference = (reset) ? 0 : Date.now() - startingTime;
  let showTime = getFormattedTime(difference);
  timeDisplay.innerText = showTime;
}

let showMilli = false;

function toggleMilli(event) {

  let classList = event.currentTarget.classList;

  if (classList.contains('selected')) {
    classList.remove('selected');
    showMilli = false;
  } else {
    classList.add('selected');
    showMilli = true;
  }

  switch (startPauseButton.classList.value) {
    case 'start':
      updateDisplay(true);
    break;
    case 'pause':
      updateDisplay();
    break;
    case 'resume':
      let savedTime = startingTime;
      startingTime = (Date.now() - difference);
      updateDisplay();
      startingTime = savedTime;
    break;
  }
}

function getFormattedTime(difference = 0) {

  let day  = 1000 * 60 * 60 * 24;
  let hour = 1000 * 60 * 60;
  let min  = 1000 * 60;
  let sec  = 1000;
  let mil  = 10;

  let hours = Math.floor((difference % day) / hour);
  let minutes = Math.floor((difference % hour) / min);
  let seconds = Math.floor((difference % min) / sec);
  let milliseconds = Math.floor((difference % sec) / mil);

  hours = (hours < 10) ? "0" + hours : hours;
  minutes = (minutes < 10) ? "0" + minutes : minutes;
  seconds = (seconds < 10) ? "0" + seconds : seconds;
  milliseconds = (milliseconds < 10) ? "0" + milliseconds : milliseconds;

  formattedTime = `${hours}:${minutes}:${seconds}`;

  if (showMilli) {
    formattedTime = `${formattedTime}:${milliseconds}`;
  }

  return formattedTime;
}

function placeTime(event) {
  let displayTime = timeDisplay.innerText;
  placedTimes.value += `${displayTime}\n`;
}

function copyText() {
  copyToClipboard(placedTimes.value);
}

function clearText() {
  placedTimes.value = '';
}

function copyToClipboard(text) {
  if (!navigator.clipboard) {
    showAlert('Clipboard Not Supported');
    return;
  }
  navigator.clipboard.writeText(text)
    .then(() => {
      showAlert('Copied to Clipboard');
    })
    .catch(error => {
      showAlert('Clipboard Not Supported');
      // showAlert(`${error.name}, ${error.message}`);
    });
}

function showAlert(message) {

  alertBox.innerText = message;
  alertBox.classList.add('show');

  setTimeout(() => {
    alertBox.classList.remove('show');
  }, 4000); // show alert duration
}

let wakeLock = null; // wakeLockSentinel

async function acquireWakeLock() {

  try {
    wakeLock = await navigator.wakeLock.request('screen');
    if (wakeLock !== null) {
      // showAlert('Screen Wake Lock Acquired');
    }
    wakeLock.addEventListener('release', () => {
      // showAlert('Screen Wake Lock Released');
    });
  } catch (error) {
    // showAlert('Cannot Keep Screen Awake');
    // showAlert(`${error.name}, ${error.message}`);
  }
}

function releaseWakeLock() {
  if (wakeLock) {
    wakeLock.release();
    wakeLock = null;
  }
}

document.addEventListener('visibilitychange', async () => {
  if (wakeLock !== null && document.visibilityState === 'visible') {
    await acquireWakeLock();
  }
});

function compressHTML() { // unformatSource
  let html = document.querySelector('html');
  let output = html.innerHTML
    // remove eols between tags
    .replace(/\>[\r\n ]+\</g, "><")
    // remove spaces between tags
    .replace(/(<.*?>)|\s+/g, (m, $1) => $1 || ' ')
    .trim();
  html.innerHTML = output;
  // console.log(output);
}
