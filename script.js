let currentMode = 'calculator';
let currentCategory = 'algebra';
let lastAnswer = null;
let currentCalculatorSection = 'basic';

document.addEventListener('DOMContentLoaded', () => {
    initializeCalculator();
    setupCalculatorButtons();

    document.querySelectorAll('.input-mode-toggle .tool-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.textContent.toLowerCase().includes('calculator') ? 'calculator' : 'handwriting';
            switchMode(mode);
        });
    });
    
    setupCategoryButtons();
    
    initializeCanvas();
    
    addGlowEffect();
    
    switchMode('calculator');
    
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
        const loginLink = navLinks.querySelector('a[href="login.html"]');
        const signupLink = navLinks.querySelector('a[href="signup.html"]');
        
        if (user) {
            if (loginLink) loginLink.remove();
            if (signupLink) signupLink.remove();
            
            const userMenu = document.createElement('div');
            userMenu.className = 'user-menu';
            userMenu.innerHTML = `
                <span class="user-email">${user.email}</span>
                <a href="#" class="nav-link" onclick="logout()">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </a>
            `;
            navLinks.appendChild(userMenu);
        }
    }
    
    if (window.location.hash === '#workspace') {
        checkAuth();
    }
});

function setupCategoryButtons() {
    const buttons = document.querySelectorAll('.category-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.category;
        });
    });
}

function showError(message) {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
}

function hideError() {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
}

function switchMode(mode) {
    const handwritingContainer = document.getElementById('handwriting-container');
    const calculatorContainer = document.getElementById('calculator-container');
    const modeButtons = document.querySelectorAll('.input-mode-toggle .tool-btn');

    modeButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase().includes(mode)) {
            btn.classList.add('active');
        }
    });

    if (mode === 'calculator') {
        handwritingContainer.classList.add('hidden');
        calculatorContainer.classList.remove('hidden');
        calculatorContainer.classList.add('active');
        hideError();
        document.getElementById('calc-input').focus();
    } else {
        calculatorContainer.classList.add('hidden');
        calculatorContainer.classList.remove('active');
        handwritingContainer.classList.remove('hidden');
        showError('Handwriting recognition is currently unavailable. Please use the calculator mode.');
    }
}

function clearCalculator() {
    const input = document.getElementById('calc-input');
    if (input) {
        input.value = '';
        document.getElementById('result').innerHTML = '';
        hideError();
        input.focus();
    }
}

function clearResults() {
    document.getElementById('result').innerHTML = '';
    document.getElementById('steps').innerHTML = '';
    hideError();
}

function switchCalculatorSection(section) {
    hideError();
    currentCalculatorSection = section;
    
    document.querySelectorAll('.calculator-section-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase() === section) {
            btn.classList.add('active');
        }
    });

    ['basic', 'functions', 'constants'].forEach(s => {
        const elem = document.getElementById(`${s}-section`);
        if (elem) {
            elem.style.display = s === section ? 'grid' : 'none';
        }
    });
}

function deleteLastChar() {
    const input = document.getElementById('calc-input');
    if (!input) return;
    
    const cursorPos = input.selectionStart;
    const currentValue = input.value;
    
    if (cursorPos > 0) {
        input.value = currentValue.slice(0, cursorPos - 1) + currentValue.slice(cursorPos);
        input.setSelectionRange(cursorPos - 1, cursorPos - 1);
    }
    
    input.focus();
}

function initializeCalculator() {
    const calcInput = document.getElementById('calc-input');
    if (calcInput) {
        calcInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                solveCalculatorEquation();
            }
        });
        
        calcInput.focus();
    }
    const calculatorContainer = document.getElementById('calculator-container');
    const handwritingContainer = document.getElementById('handwriting-container');
    if (calculatorContainer && handwritingContainer) {
        calculatorContainer.classList.remove('hidden');
        calculatorContainer.classList.add('active');
        handwritingContainer.classList.add('hidden');
    }
}

function setupCalculatorButtons() {
    document.querySelectorAll('.calculator-section-btn').forEach(btn => {
        btn.removeEventListener('click', switchCalculatorSection);
        btn.addEventListener('click', function() {
            const section = this.textContent.toLowerCase();
            switchCalculatorSection(section);
        });
    });

    document.querySelectorAll('.calculator-button').forEach(btn => {
        btn.removeEventListener('click', handleCalculatorButton);
        btn.addEventListener('click', handleCalculatorButton);
    });
}

function handleCalculatorButton(e) {
    e.preventDefault();
    const value = this.getAttribute('data-value');
    if (value) {
        appendToInput(value);
    }
}

function appendToInput(value) {
    const input = document.getElementById('calc-input');
    if (!input) return;
    
    const cursorPos = input.selectionStart;
    const currentValue = input.value;
    
    if (value === 'C') {
        clearCalculator();
        return;
    }
    
    if (value === '⌫') {
        deleteLastChar();
        return;
    }
    
    if (value === '=' || value === 'Solve') {
        solveCalculatorEquation();
        return;
    }

    let insertValue = value;
    switch(value) {
        case 'ans':
            insertValue = lastAnswer !== null ? lastAnswer.toString() : '0';
            break;
        case 'sin':
        case 'cos':
        case 'tan':
        case 'log':
        case 'ln':
            insertValue = value + '(';
            break;
        case '√':
            insertValue = 'sqrt(';
            break;
        case '∛':
            insertValue = 'cbrt(';
            break;
        case 'x²':
            insertValue = '^2';
            break;
        case 'x³':
            insertValue = '^3';
            break;
        case 'x^n':
            insertValue = '^';
            break;
        case '|x|':
            insertValue = '|';
            break;
        case 'n!':
            insertValue = '!';
            break;
        case '×':
            insertValue = '*';
            break;
        case '÷':
            insertValue = '/';
            break;
        case '−':
            insertValue = '-';
            break;
        case 'π':
            insertValue = 'Math.PI';
            break;
        case 'e':
            insertValue = 'Math.E';
            break;
        case 'φ':
            insertValue = '1.618033988749895';
            break;
    }
    
    if (['+', '-', '*', '/', '^'].includes(insertValue)) {
        insertValue = ` ${insertValue} `;
    }
    
    input.value = currentValue.slice(0, cursorPos) + insertValue + currentValue.slice(cursorPos);
    
    if (['sin(', 'cos(', 'tan(', 'log(', 'ln(', 'sqrt(', 'cbrt('].includes(insertValue)) {
        input.value = input.value.slice(0, cursorPos + insertValue.length) + ')' + input.value.slice(cursorPos + insertValue.length);
    } else if (insertValue === '|') {
        input.value = input.value.slice(0, cursorPos + insertValue.length) + '|' + input.value.slice(cursorPos + insertValue.length);
    }
    
    const newPos = cursorPos + insertValue.length;
    input.setSelectionRange(newPos, newPos);
    input.focus();
}

function factorial(n) {
    if (n < 0) return NaN;
    if (n === 0) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
}

function formatEquation(equation) {
    return equation
        .replace(/Math\.sin/g, 'sin')
        .replace(/Math\.cos/g, 'cos')
        .replace(/Math\.tan/g, 'tan')
        .replace(/Math\.log10/g, 'log')
        .replace(/Math\.log/g, 'ln')
        .replace(/Math\.sqrt/g, '√')
        .replace(/Math\.cbrt/g, '∛')
        .replace(/Math\.PI/g, 'π')
        .replace(/Math\.E/g, 'e')
        .replace(/\*\*/g, '^')
        .replace(/Math\.abs/g, '|')
        .replace(/\*/g, '×')
        .replace(/\//g, '÷');
}

function solveCalculatorEquation() {
    const input = document.getElementById('calc-input');
    const resultDiv = document.getElementById('result');
    
    if (!input || !resultDiv) return;
    
    let equation = input.value.trim();
    if (!equation) {
        showError('Please enter an equation');
        return;
    }

    try {
        hideError();
        clearResults();

        equation = equation
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/−/g, '-')
            .replace(/\s+/g, '')
            .replace(/(\d)([a-zA-Z])/g, '$1*$2')
            .replace(/π/g, 'Math.PI')
            .replace(/e(?![a-zA-Z])/g, 'Math.E')
            .replace(/\^/g, '**')
            .replace(/sin\(/g, 'Math.sin((Math.PI/180)*')
            .replace(/cos\(/g, 'Math.cos((Math.PI/180)*')
            .replace(/tan\(/g, 'Math.tan((Math.PI/180)*')
            .replace(/log\(/g, 'Math.log10(')
            .replace(/ln\(/g, 'Math.log(')
            .replace(/sqrt\(/g, 'Math.sqrt(')
            .replace(/cbrt\(/g, 'Math.cbrt(')
            .replace(/\|([^|]+)\|/g, 'Math.abs($1)')
            .replace(/(\d+)!/g, 'factorial($1)');

        if (equation.includes('ans') && lastAnswer !== null) {
            equation = equation.replace(/ans/gi, lastAnswer.toString());
        }

        const result = Function('"use strict";return (' + equation + ')')();
        
        const formattedResult = typeof result === 'number' ? 
            (Number.isInteger(result) ? result : parseFloat(result.toFixed(8))) : 
            result;
        
        lastAnswer = formattedResult;
        resultDiv.innerHTML = formattedResult;
        
    } catch (error) {
        console.error('Error solving equation:', error);
        showError('Invalid equation');
    }
}

function addGlowEffect() {
    const glowEffect = document.createElement('div');
    glowEffect.className = 'glow-effect';
    document.body.appendChild(glowEffect);
    
    document.addEventListener('mousemove', (e) => {
        glowEffect.style.setProperty('--mouseX', `${e.clientX}px`);
        glowEffect.style.setProperty('--mouseY', `${e.clientY}px`);
    });
}

function initializeCanvas() {
    const canvas = document.getElementById('drawingCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = '20px Poppins';
        ctx.fillStyle = '#666666';
        ctx.textAlign = 'center';
        ctx.fillText('Handwriting recognition is currently unavailable.', canvas.width / 2, canvas.height / 2);
        ctx.fillText('Please use the calculator mode.', canvas.width / 2, canvas.height / 2 + 30);
    }
}

function handleLogin(event) {
    event.preventDefault();
    const form = event.target;
    const email = form.querySelector('input[type="email"]').value;
    const password = form.querySelector('input[type="password"]').value;

    try {
        console.log('Logging in with:', { email });
        
        localStorage.setItem('user', JSON.stringify({ email }));
        
        window.location.href = 'index.html#workspace';
        
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please try again.');
    }
}

function handleSignup(event) {
    event.preventDefault();
    const form = event.target;
    const name = form.querySelector('input[type="text"]').value;
    const email = form.querySelector('input[type="email"]').value;
    const password = form.querySelectorAll('input[type="password"]')[0].value;
    const confirmPassword = form.querySelectorAll('input[type="password"]')[1].value;

    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    try {
        console.log('Signing up:', { name, email });
        
        localStorage.setItem('user', JSON.stringify({ name, email }));
        
        window.location.href = 'index.html#workspace';
        
    } catch (error) {
        console.error('Signup error:', error);
        alert('Signup failed. Please try again.');
    }
}

function checkAuth() {
    const user = localStorage.getItem('user');
    const currentPage = window.location.pathname.split('/').pop();
    const hash = window.location.hash;
    if (!user && hash === '#workspace') {
        window.location.href = 'login.html';
    }
}

function logout() {
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

function displayResult(result) {
    const resultContainer = document.querySelector('.result-container');
    if (resultContainer) {
        resultContainer.innerHTML = `${result}`;
        lastAnswer = result;
    }
}