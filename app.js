const protectedPages = ['dashboard.html', 'add_income.html', 'add_expense.html', 'settings.html'];
// if (protectedPages.some(page => location.pathname.includes(page)) && !localStorage.getItem('loggedIn')) {
//     location.href = 'login.html';
// }

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    if (username === 'charitha' && password === '7550') {
        localStorage.setItem('loggedIn', true);
        location.href = 'dashboard.html';
    } else {
        document.getElementById('loginError').innerText = 'Invalid login!';
    }
}

function logout() {
    localStorage.removeItem('loggedIn');
    location.href = 'login.html';
}

function loadDashboard() {
    let incomes = JSON.parse(localStorage.getItem('incomes')) || [];
    let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    let totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
    let totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
    let net = totalIncome - totalExpense;
    let burnRate = totalExpense / (new Date().getMonth() + 1);

    document.getElementById('cashBank').innerText = 'Rs. ' + net.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    document.getElementById('burnRate').innerText = 'Rs. ' + burnRate.toLocaleString(undefined, { minimumFractionDigits: 2 });
    document.getElementById('expenses').innerText = 'Rs. ' + totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2 }); 
    document.getElementById('solvency').innerText = (net / (totalExpense/ (new Date().getMonth() + 1))).toFixed(1) + ' months';
    drawChart(incomes, expenses);
}

function addIncome() {
    let amount = parseFloat(document.getElementById('incomeAmount').value);
    let note = document.getElementById('incomeNote').value || 'No Note';
    if (!amount) { alert('Enter valid amount!'); return; }
    let incomes = JSON.parse(localStorage.getItem('incomes')) || [];
    incomes.push({ amount: amount, note: note, date: new Date().toISOString() });
    localStorage.setItem('incomes', JSON.stringify(incomes));
    alert('Income Added!');
    //location.href='dashboard.html';
}

function addExpense() {
    let amount = parseFloat(document.getElementById('expenseAmount').value);
    let category = document.getElementById('expenseCategory').value || 'General';
    if (!amount) { alert('Enter valid amount!'); return; }
    let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    expenses.push({ amount: amount, category: category, date: new Date().toISOString() });
    localStorage.setItem('expenses', JSON.stringify(expenses));
    alert('Expense Added!');
    //location.href='dashboard.html';
}

function backupData() {
    let data = {
        incomes: JSON.parse(localStorage.getItem('incomes')) || [],
        expenses: JSON.parse(localStorage.getItem('expenses')) || []
    };
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    a.download = 'backup.json';
    a.click();
}

function restoreData(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(e) {
        const content = JSON.parse(e.target.result);
        localStorage.setItem('incomes', JSON.stringify(content.incomes || []));
        localStorage.setItem('expenses', JSON.stringify(content.expenses || []));
        alert('Data Restored Successfully!');
    };
    fileReader.readAsText(event.target.files[0]);
}

function drawChart(incomes, expenses) {
    let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let incomeData = Array(12).fill(0);
    let expenseData = Array(12).fill(0);
    incomes.forEach(item => { let date = new Date(item.date); incomeData[date.getMonth()] += item.amount; });
    expenses.forEach(item => { let date = new Date(item.date); expenseData[date.getMonth()] += item.amount; });
    const ctx = document.getElementById('trendChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [
                { label: 'Income', data: incomeData, backgroundColor: 'rgba(0,123,255,0.7)' },
                { label: 'Expenses', data: expenseData, backgroundColor: 'rgba(220,53,69,0.7)' }
            ]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true } }
        }
    });
}

function toggleTheme() {
    const body = document.body;
    const isDark = body.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');

    const themeIcon = document.getElementById('themeIcon');
    themeIcon.textContent = isDark ? '🌞' : '🌙';
}

function applyTheme() {
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme === 'dark';

    if (isDark) {
        document.body.classList.add('dark');
    } else {
        document.body.classList.remove('dark');
    }

    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
        themeIcon.textContent = isDark ? '🌞' : '🌙';
    }
}


if (location.pathname.includes('dashboard.html')) {
    window.onload = loadDashboard;
} else if (location.pathname.includes('calendar.html')) {
    window.onload = loadCalendar;
}


function loadCalendar() {
    var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        events: buildCalendarEvents() // pulling income/expenses
    });
    calendar.render();
}

function buildCalendarEvents() {
    let events = [];
    let incomes = JSON.parse(localStorage.getItem('incomes')) || [];
    let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

    incomes.forEach(item => {
        events.push({
            title: `Income: Rs.${item.amount}`,
            date: item.date.substring(0, 10),
            color: 'green'
        });
    });

    expenses.forEach(item => {
        events.push({
            title: `Expense: Rs.${item.amount}`,
            date: item.date.substring(0, 10),
            color: 'red'
        });
    });

    return events;
}

  
window.addEventListener('DOMContentLoaded', () => {
    applyTheme();

    if (location.pathname.includes('dashboard.html')) {
        loadDashboard();
    } else if (location.pathname.includes('calendar.html')) {
        loadCalendar();
    }
});

  
fetch('navbar.html')
.then(res => res.text())
.then(html => {
  document.getElementById('navbar-placeholder').innerHTML = html;
}); 


function backupMM() {
    const mmData = JSON.parse(localStorage.getItem('mmData'));
    if (!mmData) {
        alert('No MM data found!');
        return;
    }
    const blob = new Blob([JSON.stringify(mmData, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'mm_account_backup.json';
    a.click();
}

function restoreMM(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const parsed = JSON.parse(e.target.result);
            if (
                parsed && typeof parsed.fundName === 'string' &&
                !isNaN(parsed.units) && !isNaN(parsed.price) && !isNaN(parsed.yield)
            ) {
                localStorage.setItem('mmData', JSON.stringify(parsed));
                alert('MM Data Restored Successfully!');
            } else {
                throw new Error('Structure mismatch');
            }
        } catch (err) {
            alert('Invalid MM JSON file.');
            console.error(err);
        }
    };
    reader.readAsText(file);
}
