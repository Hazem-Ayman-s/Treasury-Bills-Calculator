let currentLang = localStorage.getItem('language') || 'ar';

document.addEventListener('DOMContentLoaded', function () {
    applyLanguage(currentLang);
});

function toggleLanguage() {
    currentLang = currentLang === 'ar' ? 'en' : 'ar';
    localStorage.setItem('language', currentLang);
    applyLanguage(currentLang);
}

function applyLanguage(lang) {
    const html = document.documentElement;
    html.setAttribute('lang', lang);
    html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');

    document.querySelectorAll('[data-ar][data-en]').forEach(el => {
        if (el.tagName === 'OPTION') {
            el.textContent = el.getAttribute('data-' + lang);
        } else if (el.tagName === 'INPUT' && el.type === 'radio') {
            return;
        } else {
            el.textContent = el.getAttribute('data-' + lang);
        }
    });

    const durationSelect = document.getElementById('duration');
    if (durationSelect) {
        Array.from(durationSelect.options).forEach(option => {
            if (option.hasAttribute('data-' + lang)) {
                option.textContent = option.getAttribute('data-' + lang);
            }
        });
    }

    const privacyAr = document.querySelector('.privacy-ar');
    const privacyEn = document.querySelector('.privacy-en');
    if (privacyAr && privacyEn) {
        if (lang === 'ar') {
            privacyAr.style.display = 'block';
            privacyEn.style.display = 'none';
        } else {
            privacyAr.style.display = 'none';
            privacyEn.style.display = 'block';
        }
    }
}

function toggleGuide() {
    const content = document.getElementById('guide-content');
    const arrow = document.getElementById('guide-arrow');
    if (!content || !arrow) return;
    content.classList.toggle('open');
    arrow.classList.toggle('open');
}

function togglePrivacy() {
    const content = document.getElementById('privacy-content');
    const arrow = document.getElementById('privacy-arrow');
    if (!content || !arrow) return;
    content.classList.toggle('open');
    arrow.classList.toggle('open');
}

function showToast() {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast();
    });
}

const inputs = {
    return: document.getElementById('return'),
    total: document.getElementById('total'),
    duration: document.getElementById('duration'),
    percentage: document.getElementById('percentage'),
    tax: document.getElementById('tax')
};

const inputGroups = {
    return: document.getElementById('input-return'),
    total: document.getElementById('input-total'),
    duration: document.getElementById('input-duration'),
    percentage: document.getElementById('input-percentage')
};

function validateNumericInput(e) {
    const input = e.target;
    let value = input.value;
    value = value.replace(/[^\d.]/g, '');
    const parts = value.split('.');
    if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('');
    }
    input.value = value;
}

function preventNonNumeric(e) {
    if ([46, 8, 9, 27, 13, 110, 190].indexOf(e.keyCode) !== -1 ||
        (e.keyCode === 65 && e.ctrlKey === true) ||
        (e.keyCode === 67 && e.ctrlKey === true) ||
        (e.keyCode === 86 && e.ctrlKey === true) ||
        (e.keyCode === 88 && e.ctrlKey === true) ||
        (e.keyCode >= 35 && e.keyCode <= 39)) {
        return;
    }
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) &&
        (e.keyCode < 96 || e.keyCode > 105) &&
        e.keyCode !== 190 && e.keyCode !== 110) {
        e.preventDefault();
    }
}

['total', 'percentage', 'return', 'tax'].forEach(id => {
    const input = document.getElementById(id);
    if (input) {
        input.addEventListener('input', validateNumericInput);
        input.addEventListener('keydown', preventNonNumeric);
        input.addEventListener('paste', (e) => {
            setTimeout(() => validateNumericInput(e), 0);
        });
    }
});

document.querySelectorAll('input[name="calculate"]').forEach(radio => {
    radio.addEventListener('change', updateInputs);
});

function updateInputs() {
    const calcType = document.querySelector('input[name="calculate"]:checked').value;
    Object.values(inputGroups).forEach(group => {
        group.classList.remove('error');
        group.querySelector('.error-message').classList.remove('show');
    });

    if (calcType === 'return') {
        inputGroups.return.classList.add('hidden');
        inputGroups.percentage.classList.remove('hidden');
        inputs.return.value = '';
    } else {
        inputGroups.percentage.classList.add('hidden');
        inputGroups.return.classList.remove('hidden');
        inputs.percentage.value = '';
    }
}

function validateInput(value, fieldName, isSelect = false) {
    if (value === '' || value === null) {
        return {
            valid: false,
            message: isSelect ?
                (currentLang === 'ar' ? 'الرجاء اختيار المدة' : 'Please select duration') :
                (currentLang === 'ar' ? 'الرجاء إدخال قيمة' : 'Please enter a value')
        };
    }

    const cleanValue = String(value).replace(/[^\d.]/g, '');
    const num = parseFloat(cleanValue);

    if (isNaN(num)) {
        return {
            valid: false,
            message: currentLang === 'ar' ? 'الرجاء إدخال رقم صحيح' : 'Please enter a valid number'
        };
    }

    if (num <= 0) {
        return {
            valid: false,
            message: currentLang === 'ar' ? 'الرجاء إدخال قيمة موجبة' : 'Please enter a positive value'
        };
    }

    if (!isFinite(num)) {
        return {
            valid: false,
            message: currentLang === 'ar' ? 'القيمة غير صالحة' : 'Invalid value'
        };
    }

    return { valid: true, value: num };
}

function calculate() {
    const calcType = document.querySelector('input[name="calculate"]:checked').value;
    let isValid = true;

    Object.values(inputGroups).forEach(group => {
        group.classList.remove('error');
        group.querySelector('.error-message').classList.remove('show');
    });

    const totalValidation = validateInput(inputs.total.value, 'total');
    if (!totalValidation.valid) {
        inputGroups.total.classList.add('error');
        inputGroups.total.querySelector('.error-message').textContent = totalValidation.message;
        inputGroups.total.querySelector('.error-message').classList.add('show');
        isValid = false;
    }
    const totalAmount = totalValidation.valid ? totalValidation.value : 0;

    const durationValidation = validateInput(inputs.duration.value, 'duration', true);
    if (!durationValidation.valid) {
        inputGroups.duration.classList.add('error');
        inputGroups.duration.querySelector('.error-message').textContent = durationValidation.message;
        inputGroups.duration.querySelector('.error-message').classList.add('show');
        isValid = false;
    }
    const D = durationValidation.valid ? parseFloat(inputs.duration.value) : 0;

    let P, A;
    let taxRate = 0;
    if (inputs.tax.value !== '') {
        taxRate = parseFloat(inputs.tax.value);
        if (isNaN(taxRate) || taxRate < 0 || taxRate > 100) {
            alert(currentLang === 'ar' ? 'خطأ: نسبة الضريبة يجب أن تكون بين 0 و 100' : 'Error: Tax rate must be between 0 and 100');
            return;
        }
    }

    if (calcType === 'return') {
        const pValidation = validateInput(inputs.percentage.value, 'percentage');
        if (!pValidation.valid) {
            inputGroups.percentage.classList.add('error');
            inputGroups.percentage.querySelector('.error-message').textContent = pValidation.message;
            inputGroups.percentage.querySelector('.error-message').classList.add('show');
            isValid = false;
        } else {
            P = pValidation.value;
        }
    } else {
        const aValidation = validateInput(inputs.return.value, 'return');
        if (!aValidation.valid) {
            inputGroups.return.classList.add('error');
            inputGroups.return.querySelector('.error-message').textContent = aValidation.message;
            inputGroups.return.querySelector('.error-message').classList.add('show');
            isValid = false;
        } else {
            A = aValidation.value;
        }
    }

    if (!isValid) return;

    const resultGrid = document.getElementById('result-grid');
    resultGrid.innerHTML = '';

    if (calcType === 'return') {
        
        const grossReturn = ((P/100) * totalAmount * D / 365) / (1 + P * D / 36500);
        const usedAmount = totalAmount - grossReturn;

        if (taxRate > 0) {
            const taxAmount = grossReturn * (taxRate / 100);
            const netReturn = grossReturn - taxAmount;
            const refundAmount = totalAmount - taxAmount;
            const netPercentage = (netReturn * 365) / (usedAmount * D) * 100;

            resultGrid.innerHTML = `
                <div class="result-item">
                    <div class="label">${currentLang === 'ar' ? 'المبلغ المستخدم' : 'Used Amount'}</div>
                    <div class="value">${usedAmount.toFixed(3)} ${currentLang === 'ar' ? 'جنيه' : 'EGP'}</div>
                    <button class="btn-copy-small" onclick="copyToClipboard('${usedAmount.toFixed(3)}')">
                        ${currentLang === 'ar' ? '📋 نسخ' : '📋 Copy'}
                    </button>
                </div>
                <div class="result-item">
                    <div class="label">${currentLang === 'ar' ? 'العائد قبل الضريبة' : 'Return Before Tax'}</div>
                    <div class="value">${grossReturn.toFixed(3)} ${currentLang === 'ar' ? 'جنيه' : 'EGP'}</div>
                    <button class="btn-copy-small" onclick="copyToClipboard('${grossReturn.toFixed(3)}')">
                        ${currentLang === 'ar' ? '📋 نسخ' : '📋 Copy'}
                    </button>
                </div>
                <div class="result-item">
                    <div class="label">${currentLang === 'ar' ? `قيمة الضريبة (${taxRate}%)` : `Tax Amount (${taxRate}%)`}</div>
                    <div class="value">${taxAmount.toFixed(3)} ${currentLang === 'ar' ? 'جنيه' : 'EGP'}</div>
                    <button class="btn-copy-small" onclick="copyToClipboard('${taxAmount.toFixed(3)}')">
                        ${currentLang === 'ar' ? '📋 نسخ' : '📋 Copy'}
                    </button>
                </div>
                <div class="result-item primary">
                    <div class="label">${currentLang === 'ar' ? 'العائد بعد الضريبة' : 'Return After Tax'}</div>
                    <div class="value">${netReturn.toFixed(3)} ${currentLang === 'ar' ? 'جنيه' : 'EGP'}</div>
                    <button class="btn-copy-small" onclick="copyToClipboard('${netReturn.toFixed(3)}')">
                        ${currentLang === 'ar' ? '📋 نسخ' : '📋 Copy'}
                    </button>
                </div>
                <div class="result-item">
                    <div class="label">${currentLang === 'ar' ? 'نسبة الصافي' : 'Net Percentage'}</div>
                    <div class="value">${netPercentage.toFixed(3)}%</div>
                    <button class="btn-copy-small" onclick="copyToClipboard('${netPercentage.toFixed(3)}%')">
                        ${currentLang === 'ar' ? '📋 نسخ' : '📋 Copy'}
                    </button>
                </div>
                <div class="result-item">
                    <div class="label">${currentLang === 'ar' ? 'المبلغ المسترد' : 'Refund Amount'}</div>
                    <div class="value">${refundAmount.toFixed(3)} ${currentLang === 'ar' ? 'جنيه' : 'EGP'}</div>
                    <button class="btn-copy-small" onclick="copyToClipboard('${refundAmount.toFixed(3)}')">
                        ${currentLang === 'ar' ? '📋 نسخ' : '📋 Copy'}
                    </button>
                </div>
            `;
        } else {
            const refundAmount = totalAmount;

            resultGrid.innerHTML = `
                <div class="result-item">
                    <div class="label">${currentLang === 'ar' ? 'المبلغ المستخدم' : 'Used Amount'}</div>
                    <div class="value">${usedAmount.toFixed(3)} ${currentLang === 'ar' ? 'جنيه' : 'EGP'}</div>
                    <button class="btn-copy-small" onclick="copyToClipboard('${usedAmount.toFixed(3)}')">
                        ${currentLang === 'ar' ? '📋 نسخ' : '📋 Copy'}
                    </button>
                </div>
                <div class="result-item primary">
                    <div class="label">${currentLang === 'ar' ? 'العائد بالمبلغ' : 'Return Amount'}</div>
                    <div class="value">${grossReturn.toFixed(3)} ${currentLang === 'ar' ? 'جنيه' : 'EGP'}</div>
                    <button class="btn-copy-small" onclick="copyToClipboard('${grossReturn.toFixed(3)}')">
                        ${currentLang === 'ar' ? '📋 نسخ' : '📋 Copy'}
                    </button>
                </div>
                <div class="result-item">
                    <div class="label">${currentLang === 'ar' ? 'المبلغ المسترد' : 'Refund Amount'}</div>
                    <div class="value">${refundAmount.toFixed(3)} ${currentLang === 'ar' ? 'جنيه' : 'EGP'}</div>
                    <button class="btn-copy-small" onclick="copyToClipboard('${refundAmount.toFixed(3)}')">
                        ${currentLang === 'ar' ? '📋 نسخ' : '📋 Copy'}
                    </button>
                </div>
            `;
        }
    } else {
        // حساب النسبة
        // أولاً نحسب المبلغ المستخدم
        const usedAmount = totalAmount - A;
        
        if (usedAmount <= 0 || D === 0) {
            alert(currentLang === 'ar' ? 'خطأ: المبلغ المستخدم يجب أن يكون موجب' : 'Error: Used amount must be positive');
            return;
        }

        // حساب النسبة بناءً على المبلغ المستخدم
        const percentage = (A * 365) / (usedAmount * D) * 100;

        if (taxRate > 0) {
            const taxAmount = A * (taxRate / 100);
            const netReturn = A - taxAmount;
            const refundAmount = totalAmount - taxAmount;
            const netPercentage = (netReturn * 365) / (usedAmount * D) * 100;

            resultGrid.innerHTML = `
                <div class="result-item">
                    <div class="label">${currentLang === 'ar' ? 'المبلغ المستخدم' : 'Used Amount'}</div>
                    <div class="value">${usedAmount.toFixed(3)} ${currentLang === 'ar' ? 'جنيه' : 'EGP'}</div>
                    <button class="btn-copy-small" onclick="copyToClipboard('${usedAmount.toFixed(3)}')">
                        ${currentLang === 'ar' ? '📋 نسخ' : '📋 Copy'}
                    </button>
                </div>
                <div class="result-item primary">
                    <div class="label">${currentLang === 'ar' ? 'نسبة العائد السنوي' : 'Annual Yield Rate'}</div>
                    <div class="value">${percentage.toFixed(3)}%</div>
                    <button class="btn-copy-small" onclick="copyToClipboard('${percentage.toFixed(3)}%')">
                        ${currentLang === 'ar' ? '📋 نسخ' : '📋 Copy'}
                    </button>
                </div>
                <div class="result-item">
                    <div class="label">${currentLang === 'ar' ? `قيمة الضريبة (${taxRate}%)` : `Tax Amount (${taxRate}%)`}</div>
                    <div class="value">${taxAmount.toFixed(3)} ${currentLang === 'ar' ? 'جنيه' : 'EGP'}</div>
                    <button class="btn-copy-small" onclick="copyToClipboard('${taxAmount.toFixed(3)}')">
                        ${currentLang === 'ar' ? '📋 نسخ' : '📋 Copy'}
                    </button>
                </div>
                <div class="result-item">
                    <div class="label">${currentLang === 'ar' ? 'العائد بعد الضريبة' : 'Return After Tax'}</div>
                    <div class="value">${netReturn.toFixed(3)} ${currentLang === 'ar' ? 'جنيه' : 'EGP'}</div>
                    <button class="btn-copy-small" onclick="copyToClipboard('${netReturn.toFixed(3)}')">
                        ${currentLang === 'ar' ? '📋 نسخ' : '📋 Copy'}
                    </button>
                </div>
                <div class="result-item">
                    <div class="label">${currentLang === 'ar' ? 'نسبة الصافي' : 'Net Percentage'}</div>
                    <div class="value">${netPercentage.toFixed(3)}%</div>
                    <button class="btn-copy-small" onclick="copyToClipboard('${netPercentage.toFixed(3)}%')">
                        ${currentLang === 'ar' ? '📋 نسخ' : '📋 Copy'}
                    </button>
                </div>
                <div class="result-item">
                    <div class="label">${currentLang === 'ar' ? 'المبلغ المسترد' : 'Refund Amount'}</div>
                    <div class="value">${refundAmount.toFixed(3)} ${currentLang === 'ar' ? 'جنيه' : 'EGP'}</div>
                    <button class="btn-copy-small" onclick="copyToClipboard('${refundAmount.toFixed(3)}')">
                        ${currentLang === 'ar' ? '📋 نسخ' : '📋 Copy'}
                    </button>
                </div>
            `;
        } else {
            const refundAmount = totalAmount;

            resultGrid.innerHTML = `
                <div class="result-item">
                    <div class="label">${currentLang === 'ar' ? 'المبلغ المستخدم' : 'Used Amount'}</div>
                    <div class="value">${usedAmount.toFixed(3)} ${currentLang === 'ar' ? 'جنيه' : 'EGP'}</div>
                    <button class="btn-copy-small" onclick="copyToClipboard('${usedAmount.toFixed(3)}')">
                        ${currentLang === 'ar' ? '📋 نسخ' : '📋 Copy'}
                    </button>
                </div>
                <div class="result-item primary">
                    <div class="label">${currentLang === 'ar' ? 'نسبة العائد السنوي' : 'Annual Yield Rate'}</div>
                    <div class="value">${percentage.toFixed(3)}%</div>
                    <button class="btn-copy-small" onclick="copyToClipboard('${percentage.toFixed(3)}%')">
                        ${currentLang === 'ar' ? '📋 نسخ' : '📋 Copy'}
                    </button>
                </div>
                <div class="result-item">
                    <div class="label">${currentLang === 'ar' ? 'المبلغ المسترد' : 'Refund Amount'}</div>
                    <div class="value">${refundAmount.toFixed(3)} ${currentLang === 'ar' ? 'جنيه' : 'EGP'}</div>
                    <button class="btn-copy-small" onclick="copyToClipboard('${refundAmount.toFixed(3)}')">
                        ${currentLang === 'ar' ? '📋 نسخ' : '📋 Copy'}
                    </button>
                </div>
            `;
        }
    }

    applyLanguage(currentLang);

    document.getElementById('result-section').classList.add('show');
    document.getElementById('result-section').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function reset() {
    Object.values(inputs).forEach(input => input.value = '');
    Object.values(inputGroups).forEach(group => {
        group.classList.remove('error');
        group.querySelector('.error-message').classList.remove('show');
    });
    document.getElementById('result-section').classList.remove('show');
    document.getElementById('calc-return').checked = true;
    updateInputs();
}

updateInputs();

