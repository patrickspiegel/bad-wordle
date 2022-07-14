import {words} from "./words.js";

const SAME = "#44d744";
const CONTAINS = "#e7a941";
const DIAL_TIMEOUT = 3000;
const DIAL_DIAMETER = 400;

/**
 * Returns the table element that is the wordle game
 * @returns {HTMLElement}
 */
function getWordleGameEl() {
    return document.getElementById("wordle-game");
}

/**
 * Returns the div element that displays the solution
 * @returns {HTMLElement}
 */
function getSolutionEl() {
    return document.getElementById("solution");
}

/**
 * Writes the content into the square
 * @param content {String}
 */
function writeLetter(content) {
    const table = getWordleGameEl();
    const row = table.children[currentRowIndex];
    const letter = row.children[currentLetterIndex];
    letter.innerHTML = content.toUpperCase();
}

let currentRowIndex = 0;
let currentLetterIndex = 0;
let currentGuess = "";
let guesses = [];
let blockedLetters = [];
let guessedLetters = [" ", " ", " ", " ", " "];
let knownLetters = [];

function setCellColor(index, color) {
    const table = getWordleGameEl();
    const row = table.children[currentRowIndex];
    const letter = row.children[index];
    letter.classList.add(color);
}

function resetCells() {
    const table = getWordleGameEl();
    for (let i = 0; i < 6; i++) {
        const row = table.children[i];
        for (let j = 0; j < 5; j++) {
            const letter = row.children[j];
            letter.classList.remove("same", "contains");
            letter.innerHTML = "";
        }
    }
}

/**
 * Replaces the letter at the given index
 * @param str
 * @param index
 * @param letter
 * @returns {string}
 */
function replaceAt(str, index, letter) {
    return str.substr(0, index) + letter + str.substr(index + 1, str.length);
}

/**
 * called whenever a user presses a key
 * @param e {KeyboardEvent}
 */
function onKeyPress(e) {
    if (word === "") {
        return;
    }
    if (e.key === "Backspace") {
        // delete one
        deleteLetter();
    } else if (e.key === "Enter") {
        checkGuess();
    } else if (e.key.match("^[aA-zZöÖäÄüÜ]{1}$")) {
        const letter = e.key.toLowerCase();
        addLetter(letter);
    }
}

/**
 * Deletes the last letter
 */
function deleteLetter() {
    if (currentLetterIndex <= 0) {
        return;
    }
    currentLetterIndex--;
    currentGuess = currentGuess.slice(0, -1);
    writeLetter("");
}

/**
 * adds the letter to the current guess
 * @param letter {string}
 */
function addLetter(letter) {
    if (currentLetterIndex >= 5) {
        return;
    }
    currentGuess += letter;
    writeLetter(letter);
    currentLetterIndex++;
}

/**
 * checks for the current guess
 */
function checkGuess() {

    if (currentRowIndex >= 6) {
        return;
    }
    if (currentLetterIndex < 5) {
        return;
    }
    for (const guessedLetter in guessedLetters) {
        const g = guessedLetters[guessedLetter];
        if (g !== " " && currentGuess[guessedLetter] !== g) {
            console.log("Letter known but not used");
            return;
        }
    }
    if (knownLetters.some(l => !currentGuess.includes(l))) {
        console.log("known letter not used")
        return;
    }

    if (blockedLetters.some(l => currentGuess.includes(l))) {
        console.log("letter already tried")
        return;
    }
    if (guesses.includes(currentGuess)) {
        console.log("already guessed")
        return;
    }
    if (!wordList.includes(currentGuess)) {
        console.log("word not in wordlist");
        return;
    }

    let tempWord = word;
    for (let char = 0; char < currentGuess.length; char++) {
        const guessedLetter = currentGuess[char];
        if (tempWord[char] === guessedLetter) {
            setCellColor(char, "same");
            setDialColor(guessedLetter, SAME);
            tempWord = replaceAt(tempWord, char, " ");
            guessedLetters[char] = guessedLetter;
        }

    }
    for (const char in currentGuess) {
        const guessedLetter = currentGuess[char];
        const index = tempWord.indexOf(guessedLetter);
        if (index > -1) {
            setCellColor(char, "contains");
            tempWord = replaceAt(tempWord, index, " ");
            knownLetters.push(guessedLetter);
            setDialColor(guessedLetter, CONTAINS);
        } else {
            if (!word.includes(guessedLetter)) {
                setDialColor(guessedLetter, "gray");
                setCellColor(char, "gray");
                blockedLetters.push(guessedLetter);
            } else if (!word.includes(guessedLetter)) {
                setCellColor(char, "gray");
            }
        }
    }

    if (currentGuess === word) {
        getSolutionEl().innerText = word.toUpperCase();
        onFinish();
        return;
    }

    guesses.push(currentGuess);
    currentRowIndex++;
    currentLetterIndex = 0;
    currentGuess = "";
}

/**
 * called when the game starts
 */
function run() {
    currentRowIndex = 0;
    currentLetterIndex = 0;
    currentGuess = "";
    guesses = [];
    guessedLetters = [" ", " ", " ", " ", " "];
    blockedLetters = [];
    knownLetters = [];
    resetCells();
    document.removeEventListener("keydown", onKeyPressAfterFinish);
    document.addEventListener("keydown", onKeyPress);
    pickWord();
}


let word = "";
const wordList = words;

function pickWord() {
    word = wordList[Math.floor(Math.random() * wordList.length)];
    // getSolutionEl().innerText = word;
}

/**
 * @param e {KeyboardEvent}
 */
function onKeyPressAfterFinish(e) {
    if (e.key === "Enter") {
        run();
    }
}

/**
 * Called when the game finished
 */
function onFinish() {
    word = "";
    document.removeEventListener("keydown", onKeyPress);
    document.addEventListener("keydown", onKeyPressAfterFinish);
}

function degrees_to_radians(degrees) {
    const pi = Math.PI;
    return degrees * (pi / 180);
}

run();

/**
 * Sets the color of a letter in the dial
 * @param letter
 * @param color
 */
function setDialColor(letter, color) {
    letter = letter.toUpperCase();
    const el = document.getElementById(letter);
    el.setAttribute("fill", color);
}

let rotateDial = false;
let initialX = 0;
let initialY = 0;
let centerX = 0;
let centerY = 0;
let dialTop = 0;
let dialLeft = 0;
let dialWidth = 0;
let dialHeight = 0;
let initialAngle = 0;
let prevAngle = 0;
let progress = 0;
let dialedNumber = "";

/**
 * Inits the dial rotation
 * @param e {PointerEvent}
 */
function initDialRotate(e) {
    if (lockedDial === true) {
        return;
    }
    if (!e.target.id) {
        return;
    }
    clearTimeout(dialTimeout);
    dialedNumber = e.target.id;
    rotateDial = true;
    initialX = e.x;
    initialY = e.y;
    const rect = svg.getBoundingClientRect();
    centerX = rect.x + 250;
    centerY = rect.y + 250;
    dialTop = rect.top;
    dialLeft = rect.left;
    dialWidth = rect.width;
    dialHeight = rect.height;

    prevAngle = getRadians(e.pageX, e.pageY);
    initialAngle = (((radians_to_degrees(prevAngle) + 360) % 360) + 90) % 360;
}

const svg = getSvgElement();
const hangup = getHangupElement();

/**
 * Returns the hangup button
 * @returns {HTMLButtonElement}
 */
function getHangupElement() {
    return document.getElementById("hangup");
}

/**
 *
 * @param e {PointerEvent}
 */
function doRotateDial(e) {
    if (rotateDial === true) {
        let angle = getRadians(e.pageX, e.pageY);
        let delta = (angle - prevAngle) % (2 * Math.PI);

        prevAngle = angle;

        if (delta > 2 * Math.PI) {
            delta -= 2 * Math.PI;
        } else if (delta < 2 * Math.PI * -1) {
            delta += 2 * Math.PI;
        }

        if (delta < 0) {
            return
        }

        const deg = (90 + 360 - initialAngle - radians_to_degrees(progress + delta));
        if (deg > 5 && deg < 360) {
            progress += delta;
            svg.setAttribute("style", `transform: rotate(${progress}rad);`)
        } else {
            progress -= delta;
        }
    }
}

let lockedDial = false;

/**
 * Ends the dial rotation
 * @param e {PointerEvent}
 */
function endDialRotate(e) {
    lockedDial = true;
    rotateDial = false;
    prevAngle = 0;
    const lastProgress = radians_to_degrees(progress);
    let interval = setInterval(() => {
        progress -= degrees_to_radians(1);
        svg.setAttribute("style", `transform: rotate(${progress}rad);`);
        if (progress <= 0) {
            progress = 0;
            clearInterval(interval);
            let counter = 27;
            for (let i = 0; i < 360 - lastProgress; i += 270 / 26) {
                counter--;
            }
            if (counter >= 0) {
                const guessedLetter = String.fromCharCode(97 + counter);
                addLetter(guessedLetter);
            }
            svg.removeAttribute("style");
            lockedDial = false;
            if (currentLetterIndex >= 5) {
                dialTimeout = setTimeout(() => {
                    checkGuess();
                }, DIAL_TIMEOUT);
            }
        }
    }, 5)
}

let dialTimeout;

/**
 * Returns the degrees from radians
 * @param radians {number}
 * @returns {number}
 */
function radians_to_degrees(radians) {
    const pi = Math.PI;
    return radians * (180 / pi);
}

/**
 * Calculates the radians from the coordinates
 * @param x {number}
 * @param y {number}
 * @returns {number}
 */
function getRadians(x, y) {
    let rectX = x - dialLeft - 1;
    let rectY = y - dialTop - 1;
    let deltaX = rectX - dialWidth / 2;
    let deltaY = rectY - dialHeight / 2;
    return Math.atan2(deltaY, deltaX);
}

/**
 * Do hangup
 * @param e {MouseEvent}
 */
function doHangup(e) {
    clearTimeout(dialTimeout);
    while (currentLetterIndex > 0) {
        deleteLetter();
    }
}

function createSVG() {
    hangup.addEventListener("click", doHangup);
    svg.addEventListener("pointerdown", initDialRotate);
    svg.addEventListener("pointermove", doRotateDial)
    svg.addEventListener("pointerup", endDialRotate);
    const dial = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    dial.setAttribute("cx", DIAL_DIAMETER / 2);
    dial.setAttribute("cy", DIAL_DIAMETER / 2);
    dial.setAttribute("r", DIAL_DIAMETER / 2);
    dial.setAttribute("fill", "darkgray");
    svg.appendChild(dial);


    const r = (DIAL_DIAMETER / 2) * 0.9;
    const cx = DIAL_DIAMETER / 2;
    const cy = DIAL_DIAMETER / 2;

    for (let i = 0; i < 26; i++) {
        const x = cx + Math.cos(degrees_to_radians(270 / 26 * (26 - i))) * r
        const y = cy + Math.sin(degrees_to_radians(270 / 26 * (26 - i))) * r

        const char = String.fromCharCode(65 + i);
        const number = document.createElementNS("http://www.w3.org/2000/svg", "circle");

        number.id = char;
        number.setAttribute("cx", x);
        number.setAttribute("cy", y);
        number.setAttribute("r", DIAL_DIAMETER * 0.03);
        number.setAttribute("fill", "white");
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.textContent = char;
        text.setAttribute("x", x);
        text.setAttribute("y", y);


        svg.appendChild(number);
        svg.appendChild(text);

    }

}

/**
 * Returns the dial svg element
 * @returns {SVGElement}
 */
function getSvgElement() {
    return document.getElementById("dial");
}

createSVG();