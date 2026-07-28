// Tab Navigation
const tabBtns = document.querySelectorAll('.tab-btn');
const sections = document.querySelectorAll('.calculator-section');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all tabs and sections
        tabBtns.forEach(b => b.classList.remove('active'));
        sections.forEach(s => s.classList.remove('active'));
        
        // Add active class to clicked tab and corresponding section
        btn.classList.add('active');
        const tabId = btn.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
    });
});

// Format currency in Thai Baht format
function formatCurrency(amount) {
    return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

// Format percentage
function formatPercent(value) {
    return value.toFixed(2) + '%';
}

// Compound Interest Calculator
const compoundForm = document.getElementById('compoundForm');
compoundForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const principal = parseFloat(document.getElementById('cp_principal').value);
    const rate = parseFloat(document.getElementById('cp_rate').value);
    const years = parseInt(document.getElementById('cp_years').value);
    const compoundFrequency = parseInt(document.getElementById('cp_compound').value);
    
    if (isNaN(principal) || isNaN(rate) || isNaN(years)) {
        alert('กรุณากรอกข้อมูลให้ครบถ้วน');
        return;
    }
    
    // Calculate compound interest: A = P(1 + r/n)^(nt)
    const r = rate / 100;
    const n = compoundFrequency;
    const t = years;
    
    const amount = principal * Math.pow((1 + r / n), (n * t));
    const interest = amount - principal;
    
    const resultBox = document.getElementById('compoundResult');
    resultBox.innerHTML = `
        <div class="result-item">
            <div class="result-label">เงินต้น</div>
            <div class="result-value">${formatCurrency(principal)}</div>
        </div>
        <div class="result-item">
            <div class="result-label">ดอกเบี้ยที่ได้รับ</div>
            <div class="result-value">${formatCurrency(interest)}</div>
        </div>
        <div class="result-item">
            <div class="result-label">ยอดรวมสุดท้าย</div>
            <div class="result-value highlight">${formatCurrency(amount)}</div>
        </div>
    `;
});

// Loan Calculator
const loanForm = document.getElementById('loanForm');
loanForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const amount = parseFloat(document.getElementById('ln_amount').value);
    const rate = parseFloat(document.getElementById('ln_rate').value);
    const years = parseInt(document.getElementById('ln_years').value);
    
    if (isNaN(amount) || isNaN(rate) || isNaN(years)) {
        alert('กรุณากรอกข้อมูลให้ครบถ้วน');
        return;
    }
    
    // Calculate monthly payment using PMT formula
    const monthlyRate = (rate / 100) / 12;
    const numberOfPayments = years * 12;
    
    // Monthly payment = P * [r(1+r)^n] / [(1+r)^n - 1]
    const monthlyPayment = amount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                           (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    
    const totalPayment = monthlyPayment * numberOfPayments;
    const totalInterest = totalPayment - amount;
    
    const resultBox = document.getElementById('loanResult');
    resultBox.innerHTML = `
        <div class="result-item">
            <div class="result-label">ค่างวดรายเดือน</div>
            <div class="result-value highlight">${formatCurrency(monthlyPayment)}</div>
        </div>
        <div class="result-item">
            <div class="result-label">จำนวนเงินกู้</div>
            <div class="result-value">${formatCurrency(amount)}</div>
        </div>
        <div class="result-item">
            <div class="result-label">ดอกเบี้ยรวมทั้งหมด</div>
            <div class="result-value">${formatCurrency(totalInterest)}</div>
        </div>
        <div class="result-item">
            <div class="result-label">ยอดชำระรวมทั้งหมด</div>
            <div class="result-value">${formatCurrency(totalPayment)}</div>
        </div>
    `;
});

// Savings Goal Calculator
const savingsForm = document.getElementById('savingsForm');
savingsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const goal = parseFloat(document.getElementById('sv_goal').value);
    const current = parseFloat(document.getElementById('sv_current').value);
    const rate = parseFloat(document.getElementById('sv_rate').value);
    const years = parseInt(document.getElementById('sv_years').value);
    
    if (isNaN(goal) || isNaN(current) || isNaN(rate) || isNaN(years)) {
        alert('กรุณากรอกข้อมูลให้ครบถ้วน');
        return;
    }
    
    // Calculate future value of current savings
    const r = rate / 100;
    const futureValue = current * Math.pow((1 + r), years);
    
    // Calculate how much more is needed
    const shortfall = goal - futureValue;
    
    // Calculate monthly savings needed to reach goal
    // Using Future Value of Annuity formula: FV = PMT * [((1+r)^n - 1) / r]
    // Rearranged: PMT = FV * r / ((1+r)^n - 1)
    const monthlyRate = r / 12;
    const months = years * 12;
    
    let monthlySavings = 0;
    if (shortfall > 0) {
        monthlySavings = shortfall * monthlyRate / (Math.pow(1 + monthlyRate, months) - 1);
    }
    
    const willReachGoal = futureValue >= goal;
    
    const resultBox = document.getElementById('savingsResult');
    
    if (willReachGoal) {
        resultBox.innerHTML = `
            <div class="result-item">
                <div class="result-label">เงินออมปัจจุบัน</div>
                <div class="result-value">${formatCurrency(current)}</div>
            </div>
            <div class="result-item">
                <div class="result-label">มูลค่าในอนาคต (${years} ปี)</div>
                <div class="result-value highlight">${formatCurrency(futureValue)}</div>
            </div>
            <div class="result-item">
                <div class="result-label">สถานะ</div>
                <div class="result-value" style="color: #28a745;">✓ ถึงเป้าหมาย!</div>
            </div>
            <div class="result-item">
                <div class="result-label">เกินเป้าหมาย</div>
                <div class="result-value" style="color: #28a745;">${formatCurrency(futureValue - goal)}</div>
            </div>
        `;
    } else {
        resultBox.innerHTML = `
            <div class="result-item">
                <div class="result-label">เงินออมปัจจุบัน</div>
                <div class="result-value">${formatCurrency(current)}</div>
            </div>
            <div class="result-item">
                <div class="result-label">มูลค่าในอนาคต (${years} ปี)</div>
                <div class="result-value">${formatCurrency(futureValue)}</div>
            </div>
            <div class="result-item">
                <div class="result-label">ยังขาดอีก</div>
                <div class="result-value" style="color: #dc3545;">${formatCurrency(shortfall)}</div>
            </div>
            <div class="result-item">
                <div class="result-label">ควรออมเพิ่มต่อเดือน</div>
                <div class="result-value highlight">${formatCurrency(Math.abs(monthlySavings))}</div>
            </div>
        `;
    }
});

// Add input validation for negative numbers
document.querySelectorAll('input[type="number"]').forEach(input => {
    input.addEventListener('input', function() {
        if (this.value < 0) {
            this.value = 0;
        }
    });
});

// Add touch feedback for mobile
document.querySelectorAll('button').forEach(button => {
    button.addEventListener('touchstart', function() {
        this.style.transform = 'scale(0.98)';
    });
    
    button.addEventListener('touchend', function() {
        this.style.transform = '';
    });
});
