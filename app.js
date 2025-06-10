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

// function loadDashboard() {
//     let incomes = JSON.parse(localStorage.getItem('incomes')) || [];
//     let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
//     let totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
//     let totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
//     let net = totalIncome - totalExpense;
//     let burnRate = totalExpense / (new Date().getMonth() + 1);

//     document.getElementById('cashBank').innerText = 'Rs. ' + net.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
//     document.getElementById('burnRate').innerText = 'Rs. ' + burnRate.toLocaleString(undefined, { minimumFractionDigits: 2 });
//     document.getElementById('expenses').innerText = 'Rs. ' + totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2 }); 
//     document.getElementById('solvency').innerText = (net / (totalExpense/ (new Date().getMonth() + 1))).toFixed(1) + ' months';
//     drawChart(incomes, expenses);
// }

function loadDashboard() {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    let incomes = JSON.parse(localStorage.getItem('incomes')) || [];
    let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

    // Filter incomes for current month
    let monthIncomes = incomes.filter(i => {
        let date = new Date(i.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    // Filter expenses for current month
    let monthExpenses = expenses.filter(e => {
        let date = new Date(e.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    // Calculate totals for this month
    let totalIncome = monthIncomes.reduce((sum, i) => sum + i.amount, 0);
    let totalExpense = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
    let net = totalIncome - totalExpense;
    let burnRate = totalExpense; // for this month only

    document.getElementById('cashBank').innerText = 'Rs. ' + net.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    document.getElementById('burnRate').innerText = 'Rs. ' + burnRate.toLocaleString(undefined, { minimumFractionDigits: 2 });
    document.getElementById('expenses').innerText = 'Rs. ' + totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2 });

    // If burnRate is 0, avoid division by zero
    let solvency = burnRate > 0 ? (net / burnRate).toFixed(1) + ' months' : '∞';
    document.getElementById('solvency').innerText = solvency;

    // Draw full chart (you can keep original incomes/expenses here)
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
    loadLoanWidget();
    loadMMWidget();
    loadEmergencyWidget();
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
        loadLoanWidget();
        loadMMWidget();
        loadEmergencyWidget();
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

function loadLoanWidget() {
    const LOAN_TOTAL = 1000;
    const TOTAL_MONTHS = 60;
    const payments = JSON.parse(localStorage.getItem('loanPayments')) || [];
  
    const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const remaining = LOAN_TOTAL - totalPaid;
    const paidPercent = (totalPaid / LOAN_TOTAL) * 100;
    const monthsLeft = Math.max(TOTAL_MONTHS - payments.length, 0);
    const isClosed = remaining <= 0 || monthsLeft === 0;
  
    document.getElementById('loanAmount').innerText = `LKR ${LOAN_TOTAL.toLocaleString()}`;
    document.getElementById('loanRemaining').innerText = `LKR ${remaining.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    document.getElementById('loanPaidPercent').innerText = `${paidPercent.toFixed(1)}%`;
    document.getElementById('loanMonthsLeft').innerText = monthsLeft;
    const statusEl = document.getElementById('loanStatus');
    statusEl.innerText = isClosed ? 'Closed' : 'Active';
    statusEl.style.color = isClosed ? 'green' : 'orange';
  }
  
  function loadMMWidget() {
    const mm = JSON.parse(localStorage.getItem('mmData'));
    if (!mm || isNaN(mm.units) || isNaN(mm.price) || isNaN(mm.yield)) return;
  
    const { fundName, units, price, yield: annualYield } = mm;
  
    const marketValue = units * price;
    const rate = annualYield / 100 / 365;
    const oneWeekProfit = marketValue * (Math.pow(1 + rate, 7) - 1);
    const oneMonthProfit = marketValue * (Math.pow(1 + rate, 30) - 1);
  
    document.getElementById('mmToday').innerText =
      'LKR ' + marketValue.toLocaleString('en-LK', { minimumFractionDigits: 2 });
  
    document.getElementById('mmWeek').innerText =
      'LKR ' + oneWeekProfit.toLocaleString('en-LK', { minimumFractionDigits: 2 });
  
    document.getElementById('mmMonth').innerText =
      'LKR ' + oneMonthProfit.toLocaleString('en-LK', { minimumFractionDigits: 2 });
  
    const statusEl = document.getElementById('mmStatus');
    statusEl.innerText = marketValue > 0 ? 'Active' : 'Inactive';
    statusEl.style.color = marketValue > 0 ? 'orange' : 'green';
  }
  
  
  function loadEmergencyWidget() {
    const data = JSON.parse(localStorage.getItem("emergencyFund")) || [];
    const expenses = JSON.parse(localStorage.getItem("expenses")) || [];
  
    let totalFund = 0;
    data.forEach(e => {
      totalFund += e.type === 'add' ? e.amount : -e.amount;
    });
  
    const months = new Set();
    const monthlySums = {};
    expenses.forEach(e => {
      const d = new Date(e.date);
      const key = d.getFullYear() + '-' + (d.getMonth() + 1);
      if (!monthlySums[key]) monthlySums[key] = 0;
      monthlySums[key] += e.amount;
      months.add(key);
    });
  
    const burn = months.size ? Object.values(monthlySums).reduce((a, b) => a + b, 0) / months.size : 0;
    const survival = burn ? (totalFund / burn).toFixed(1) + " months" : '∞';
    const status = totalFund > 0 ? "Active" : "Empty";
  
    document.getElementById("emFundTotal").innerText = "Rs. " + totalFund.toLocaleString('en-LK', { minimumFractionDigits: 2 });
    document.getElementById("emBurnRate").innerText = "Rs. " + burn.toLocaleString('en-LK', { minimumFractionDigits: 2 });
    document.getElementById("emSurvival").innerText = survival;
    document.getElementById("emStatus").innerText = status;
    document.getElementById("emStatus").style.color = totalFund > 0 ? 'orange' : 'green';
  }
  

  function loadSolarWidget() {
    const RATE = 27;
    const COST = 100;
    const data = JSON.parse(localStorage.getItem("solarInvestment")) || [];

    let total = 0;
    data.forEach(entry => {
      total += entry.units * RATE;
    });

    const recoveryPercent = (total / COST) * 100;
    const avgMonthly = data.length ? total / data.length : 0;
    const years = avgMonthly ? (COST / avgMonthly) / 12 : 0;
    const profit = total - COST;

    document.getElementById("solarTotal").innerText = total.toLocaleString(undefined, { minimumFractionDigits: 2 });
    document.getElementById("solarRecovery").innerText = recoveryPercent.toFixed(2);
    document.getElementById("solarYears").innerText = years.toFixed(1);
    document.getElementById("solarProfit").innerText = profit.toLocaleString(undefined, { minimumFractionDigits: 2 });
  }

  document.addEventListener("DOMContentLoaded", loadSolarWidget);

  function loadLoanInvestmentWidget() {
    const data = JSON.parse(localStorage.getItem("loanInvestments")) || [];
  
    let totalInvestment = 0;
    let totalReturns = 0;
  
    data.forEach(item => {
      totalInvestment += item.amount;
      totalReturns += item.monthly * item.duration * 12;
    });
  
    const profit = totalReturns - totalInvestment;
  
    document.getElementById("loanInvTotal").innerText = totalInvestment.toLocaleString(undefined, { minimumFractionDigits: 2 });
    document.getElementById("loanInvReturn").innerText = totalReturns.toLocaleString(undefined, { minimumFractionDigits: 2 });
    document.getElementById("loanInvProfit").innerText = profit.toLocaleString(undefined, { minimumFractionDigits: 2 });
  
    const statusEl = document.getElementById("loanInvStatus");
    statusEl.innerText = totalReturns > 0 ? "Active" : "Inactive";
    statusEl.style.color = totalReturns > 0 ? "green" : "gray";
  }
  
  document.addEventListener("DOMContentLoaded", loadLoanInvestmentWidget);