const calculatorDisplay = document.querySelector('h1');
const inputBtns = document.querySelectorAll('button');
const clearBtn = document.getElementById('clear-btn');
const historyDisplay = document.querySelector('.history');

// Calculate first and second values depending on operator
const calculate = {
    '/': (firstNumber, secondNumber) => firstNumber / secondNumber,
    '*': (firstNumber, secondNumber) => firstNumber * secondNumber,
    '+': (firstNumber, secondNumber) => firstNumber + secondNumber,
    '-': (firstNumber, secondNumber) => firstNumber - secondNumber,
    '^': (firstNumber, secondNumber) => Math.pow(firstNumber, secondNumber),
    '√': (firstNumber) => Math.sqrt(firstNumber),
    '=': (firstNumber, secondNumber) => secondNumber,
};

let firstValue = 0;
let operatorValue = '';
let awaitingNextValue = false;
let equation = '';

function sendNumberValue(number) {
    if (awaitingNextValue) {
        // Start a new number for the second operand
        calculatorDisplay.textContent = number;
        awaitingNextValue = false;
    } else {
        // Normal number entry
        if (calculatorDisplay.textContent === "0") {
            calculatorDisplay.textContent = number;
        } else {
            calculatorDisplay.textContent += number;
        }
    }
}

function addDecimal() {
    if (awaitingNextValue) return;
    if (!calculatorDisplay.textContent.includes('.')) {
        calculatorDisplay.textContent = `${calculatorDisplay.textContent}.`;
    }
}

function toggleSign() {
    const currentValue = Number(calculatorDisplay.textContent);

    // If display is 0, do nothing
    if (currentValue === 0) return;

    // Flip the sign
    calculatorDisplay.textContent = String(currentValue * -1);

    // If the user is entering a second value, update it directly
    if (awaitingNextValue === true) {
        firstValue = Number(calculatorDisplay.textContent);
    }
}

function useOperator(operator) {
    const currentValue = Number(calculatorDisplay.textContent);

    // Square root
    if (operator === "√") {
        const result = Math.sqrt(currentValue);
        historyDisplay.textContent = `√(${currentValue})`;
        calculatorDisplay.textContent = formatResult(result);

        firstValue = result;
        operatorValue = "";
        awaitingNextValue = true;
        return;
    }

    // Equals
    if (operator === "=") {
        if (!operatorValue) return; // nothing to calculate

        const result = calculate[operatorValue](firstValue, currentValue);
        calculatorDisplay.textContent = formatResult(result);
        historyDisplay.textContent = `${firstValue} ${operatorValue} ${currentValue}`;

        firstValue = result; // store result for next operation
        operatorValue = "";
        awaitingNextValue = true;
        return;
    }

    // Normal operators (+ - * / ^)
    if (awaitingNextValue) {
        // User pressed operator repeatedly: just change operator
        operatorValue = operator;
        return;
    }

    if (!operatorValue) {
        // First operator pressed
        firstValue = currentValue;
        operatorValue = operator;
        awaitingNextValue = true;
    } else {
        // Operator pressed after second number entered → calculate first
        const result = calculate[operatorValue](firstValue, currentValue);
        calculatorDisplay.textContent = formatResult(result);
        historyDisplay.textContent = `${firstValue} ${operatorValue} ${currentValue}`;

        firstValue = result;
        operatorValue = operator;
        awaitingNextValue = true;
    }
}

function formatResult(num) {
    if (!isFinite(num)) return String(num);

    let str = String(num);

    // If already scientific, keep it
    if (str.includes("e") || str.includes("E")) return str;

    let [whole, decimal = ""] = str.split(".");

    const wholeDigits = whole.replace("-", "").length;

    // If whole part alone exceeds 14 digits -> use scientific
    if (wholeDigits > 14) {
        return num.toExponential(9);
    }

    // Total digits allowed = 14 (whole + decimal)
    const maxTotalDigits = 14;

    // How many decimal digits are allowed?
    const allowedDecimalDigits = maxTotalDigits - wholeDigits;

    if (allowedDecimalDigits < 0) {
        // whole part already too long
        return num.toExponential(9);
    }

    if (decimal.length > allowedDecimalDigits) {
        // Round the number to the allowed total digits
        const rounded = Number(num.toFixed(allowedDecimalDigits));
        return rounded.toString();
    }

    // Otherwise, it's already within limits
    return str;
}

function cleanResultDisplay(str) {
    if (!str) return '';
    let lastChar = str.slice(-1);
    if (isNaN(lastChar)) {
        return str.slice(0, -1);
    }
    return str;
}

function resetAll() {
    firstValue = 0;
    operatorValue = '';
    awaitingNextValue = false;
    calculatorDisplay.textContent = '0';
    historyDisplay.textContent = ''; // NEW
}

//------------------------------------------
// ✅ Keyboard Support
//------------------------------------------
function handleKeyPress(e) {
    const key = e.key;

    // Numbers
    if (!isNaN(key)) {
        sendNumberValue(key);
        return;
    }

    // Operators
    if (['+', '-', '*', '/'].includes(key)) {
        useOperator(key);
        return;
    }

    // Decimal
    if (key === '.') {
        addDecimal();
        return;
    }

    // Enter or =
    if (key === 'Enter' || key === '=') {
        useOperator('=');
        return;
    }
    
    if (key === '^') {
        useOperator('^');
        return;
    }

    // Clear (Backspace)
    if (key === 'c') {
        resetAll();
        return;
    }
    if (key === 'Backspace') {
        const displayValue = calculatorDisplay.textContent;
        if (displayValue.length > 1) {
            calculatorDisplay.textContent = displayValue.slice(0, -1);
        } else {
            calculatorDisplay.textContent = '0';
        }
        return;
    }
}

window.addEventListener('keydown', handleKeyPress);

//------------------------------------------
// Button event listeners
//------------------------------------------
inputBtns.forEach((inputBtn) => {

    // Number buttons (no class)
    if (inputBtn.classList.length === 0) {
        inputBtn.addEventListener('click', () =>
            sendNumberValue(inputBtn.value)
        );
    }

    // Operator buttons (+ - * / =)
    else if (inputBtn.classList.contains('operator')) {
        inputBtn.addEventListener('click', () =>
            useOperator(inputBtn.value)
        );
    }

    // Decimal button
    else if (inputBtn.classList.contains('decimal')) {
        inputBtn.addEventListener('click', addDecimal);
    }

    // +/- sign toggle button
    else if (inputBtn.classList.contains('sign')) {
        inputBtn.addEventListener('click', toggleSign);
    }
});

clearBtn.addEventListener('click', resetAll);
