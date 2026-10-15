const STORAGE_KEY = 'metal_oils_store_v1';

const defaultState = {
  oils: [
    { id: crypto.randomUUID(), name: 'زيت نحاس', buyPrice: 18, sellPrice: 25, stock: 0, saleType: 'kilo', boxVolumeLiters: 0 },
    { id: crypto.randomUUID(), name: 'زيت ألومنيوم', buyPrice: 22, sellPrice: 30, stock: 0, saleType: 'kilo', boxVolumeLiters: 0 },
    { id: crypto.randomUUID(), name: 'زيت زنك', buyPrice: 26, sellPrice: 35, stock: 0, saleType: 'kilo', boxVolumeLiters: 0 }
  ],
  sales: [],
  payments: []
};

let state = loadState();

const oilForm = document.getElementById('oilForm');
const oilNameInput = document.getElementById('oilName');
const oilSaleTypeSelect = document.getElementById('oilSaleType');
const oilStockInput = document.getElementById('oilStock');
const oilBoxVolumeInput = document.getElementById('oilBoxVolume');
const oilBuyPriceInput = document.getElementById('oilBuyPrice');
const oilSellPriceInput = document.getElementById('oilSellPrice');
const oilTableBody = document.getElementById('oilTableBody');
const oilStockLabel = document.getElementById('oilStockLabel');
const oilBuyPriceLabel = document.getElementById('oilBuyPriceLabel');
const oilSellPriceLabel = document.getElementById('oilSellPriceLabel');
const boxVolumeField = document.getElementById('boxVolumeField');

const saleForm = document.getElementById('saleForm');
const customerNameInput = document.getElementById('customerName');
const oilSelect = document.getElementById('oilSelect');
const quantityInput = document.getElementById('quantity');
const saleQuantityLabel = document.getElementById('saleQuantityLabel');
const amountPaidInput = document.getElementById('amountPaid');
const saleDateInput = document.getElementById('saleDate');

const paymentForm = document.getElementById('paymentForm');
const paymentCustomerSelect = document.getElementById('paymentCustomerSelect');
const paymentAmountInput = document.getElementById('paymentAmount');
const paymentNoteInput = document.getElementById('paymentNote');
const paymentDateInput = document.getElementById('paymentDate');

const customerNameList = document.getElementById('customerNameList');
const resetBtn = document.getElementById('resetBtn');
const exportBtn = document.getElementById('exportBtn');
const ledgerList = document.getElementById('ledgerList');

const invoiceEls = {
  customer: document.getElementById('invoiceCustomer'),
  oil: document.getElementById('invoiceOil'),
  quantity: document.getElementById('invoiceQuantity'),
  purchasePrice: document.getElementById('invoicePurchasePrice'),
  sellPrice: document.getElementById('invoiceSellPrice'),
  totalSale: document.getElementById('invoiceTotalSale'),
  totalPurchase: document.getElementById('invoiceTotalPurchase'),
  profit: document.getElementById('invoiceProfit'),
  paid: document.getElementById('invoicePaid'),
  remaining: document.getElementById('invoiceRemaining')
};

const money = (value) => `${Number(value || 0).toLocaleString('ar-SA', { maximumFractionDigits: 2 })} ل.س`;
const kilograms = (value) => `${Number(value || 0).toLocaleString('ar-SA', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} كيلو`;
const liters = (value) => `${Number(value || 0).toLocaleString('ar-SA', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} لتر`;
const dateString = (dateValue) => {
  const date = dateValue ? new Date(dateValue + 'T00:00:00') : new Date();
  if (Number.isNaN(date.getTime())) return 'غير محدد';
  return date.toLocaleDateString('ar-SA', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

function getStockStatus(oil) {
  const stock = Number(oil.stock || 0);
  const threshold = oil.saleType === 'box' ? 1 : 4;

  if (stock < threshold) {
    return { label: 'منخفض', className: 'low-stock' };
  }

  return { label: 'مناسب', className: 'profit' };
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return structuredClone(defaultState);

  try {
    const parsed = JSON.parse(saved);
    const oils = (Array.isArray(parsed.oils) && parsed.oils.length ? parsed.oils : structuredClone(defaultState.oils)).map((oil) => ({
      ...oil,
      saleType: oil.saleType || 'kilo',
      stock: Number(oil.stock || 0),
      boxVolumeLiters: Number(oil.boxVolumeLiters || 0)
    }));

    return {
      oils,
      sales: Array.isArray(parsed.sales) ? parsed.sales : [],
      payments: Array.isArray(parsed.payments) ? parsed.payments : []
    };
  } catch (error) {
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getOilById(id) {
  return state.oils.find((oil) => oil.id === id) || null;
}

function getOilMargin(oil) {
  return Number((oil.sellPrice - oil.buyPrice).toFixed(2));
}

function getCustomerNames() {
  return Array.from(new Set([
    ...state.sales.map((sale) => sale.customerName),
    ...state.payments.map((payment) => payment.customerName)
  ].filter(Boolean))).sort((a, b) => a.localeCompare(b, 'ar'));
}

function renderOilOptions() {
  oilSelect.innerHTML = '<option value="">اختر النوع</option>' +
    state.oils.map((oil) => {
      const stockStatus = getStockStatus(oil);
      const stockLabel = stockStatus.className === 'low-stock' ? ' (منخفض)' : '';
      return `<option value="${oil.id}">${oil.name}${stockLabel}</option>`;
    }).join('');

  const customerNames = getCustomerNames();
  paymentCustomerSelect.innerHTML = '<option value="">اختر الزبون</option>' +
    customerNames.map((name) => `<option value="${name}">${name}</option>`).join('');
  customerNameList.innerHTML = customerNames.map((name) => `<option value="${name}"></option>`).join('');

  if (!state.oils.length) {
    oilSelect.innerHTML = '<option value="">لا توجد أنواع</option>';
  }
}

function renderOilTable() {
  if (!state.oils.length) {
    oilTableBody.innerHTML = '<tr><td colspan="7">لا توجد أصناف مضافة</td></tr>';
    return;
  }

  oilTableBody.innerHTML = state.oils.map((oil) => {
    const margin = getOilMargin(oil);
    const badgeClass = margin > 0 ? 'profit' : margin < 0 ? 'loss' : 'neutral';
    const stockStatus = getStockStatus(oil);
    const stockText = oil.saleType === 'box'
      ? `${Number(oil.stock || 0).toLocaleString('ar-SA')} علبة${oil.boxVolumeLiters ? ` · ${liters(oil.boxVolumeLiters)} / علبة` : ''}`
      : kilograms(oil.stock);
    return `
      <tr>
        <td>${oil.name}</td>
        <td>${money(oil.buyPrice)}</td>
        <td>${money(oil.sellPrice)}</td>
        <td><span class="amount-pill ${badgeClass}">${money(margin)}</span></td>
        <td>${stockText}</td>
        <td><span class="amount-pill ${stockStatus.className}">${stockStatus.label}</span></td>
        <td><button class="delete-btn" data-oil-id="${oil.id}">حذف</button></td>
      </tr>
    `;
  }).join('');

  document.querySelectorAll('.delete-btn').forEach((btn) => {
    btn.addEventListener('click', (event) => {
      const { oilId } = event.currentTarget.dataset;
      state.oils = state.oils.filter((oil) => oil.id !== oilId);
      state.sales = state.sales.filter((sale) => sale.oilId !== oilId);
      saveState();
      render();
    });
  });
}

function updateSaleQuantityInput() {
  const selectedOil = getOilById(oilSelect.value);

  if (!selectedOil) {
    saleQuantityLabel.textContent = 'الكمية بالكيلو';
    quantityInput.step = '0.1';
    quantityInput.min = '0.1';
    return;
  }

  if (selectedOil.saleType === 'box') {
    saleQuantityLabel.textContent = 'الكمية / علبة';
    quantityInput.step = '1';
    quantityInput.min = '1';
    const currentValue = Number(quantityInput.value || 0);
    if (!currentValue || currentValue < 1) {
      quantityInput.value = '1';
    }
  } else {
    saleQuantityLabel.textContent = 'الكمية بالكيلو';
    quantityInput.step = '0.1';
    quantityInput.min = '0.1';
  }
}

function renderInvoice() {
  const oilId = oilSelect.value;
  const customerName = customerNameInput.value.trim();
  const quantity = Number(quantityInput.value || 0);
  const paid = Number(amountPaidInput.value || 0);

  const selectedOil = getOilById(oilId);
  if (!selectedOil) {
    invoiceEls.customer.textContent = '-';
    invoiceEls.oil.textContent = '-';
    invoiceEls.quantity.textContent = '0';
    invoiceEls.purchasePrice.textContent = '0 ل.س';
    invoiceEls.sellPrice.textContent = '0 ل.س';
    invoiceEls.totalSale.textContent = '0 ل.س';
    invoiceEls.totalPurchase.textContent = '0 ل.س';
    invoiceEls.profit.textContent = '0 ل.س';
    invoiceEls.paid.textContent = '0 ل.س';
    invoiceEls.remaining.textContent = '0 ل.س';
    return;
  }

  const unitLabel = selectedOil.saleType === 'box' ? 'علبة' : 'كيلو';
  const totalQuantity = selectedOil.saleType === 'box' ? quantity * Number(selectedOil.boxVolumeLiters || 0) : quantity;
  const saleTotal = selectedOil.sellPrice * quantity;
  const purchaseTotal = selectedOil.buyPrice * quantity;
  const profit = saleTotal - purchaseTotal;
  const remaining = Math.max(saleTotal - paid, 0);

  invoiceEls.customer.textContent = customerName || '-';
  invoiceEls.oil.textContent = selectedOil.name;
  invoiceEls.quantity.textContent = selectedOil.saleType === 'box'
    ? `${quantity} علبة (${liters(totalQuantity)})`
    : `${quantity} كيلو`;
  invoiceEls.purchasePrice.textContent = money(selectedOil.buyPrice);
  invoiceEls.sellPrice.textContent = money(selectedOil.sellPrice);
  invoiceEls.totalSale.textContent = money(saleTotal);
  invoiceEls.totalPurchase.textContent = money(purchaseTotal);
  invoiceEls.paid.textContent = money(paid);
  invoiceEls.remaining.textContent = money(remaining);

  const profitEl = document.getElementById('invoiceProfit');
  profitEl.textContent = money(profit);
  profitEl.classList.toggle('profit-positive', profit >= 0);
  profitEl.classList.toggle('profit-negative', profit < 0);

  if (selectedOil.saleType === 'box') {
    invoiceEls.purchasePrice.textContent = `${money(selectedOil.buyPrice)} / علبة`;
    invoiceEls.sellPrice.textContent = `${money(selectedOil.sellPrice)} / علبة`;
  }
}

function renderStats() {
  const today = new Date();
  const todayString = today.toISOString().slice(0, 10);

  const todaySales = state.sales.filter((sale) => sale.date === todayString);
  const todayPayments = state.payments.filter((payment) => payment.date === todayString);

  const salesTotal = todaySales.reduce((sum, sale) => sum + Number(sale.totalSale || 0), 0);
  const totalPayments = state.payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const profitTotal = todaySales.reduce((sum, sale) => sum + Number(sale.profit || 0), 0);

  const customerBalances = {};

  state.sales.forEach((sale) => {
    if (!customerBalances[sale.customerName]) {
      customerBalances[sale.customerName] = 0;
    }
    customerBalances[sale.customerName] += Number(sale.totalSale || 0);
  });

  state.payments.forEach((payment) => {
    if (!customerBalances[payment.customerName]) {
      customerBalances[payment.customerName] = 0;
    }
    customerBalances[payment.customerName] -= Number(payment.amount || 0);
  });

  const totalReceivables = Object.values(customerBalances).reduce((sum, value) => sum + Math.max(value, 0), 0);

  document.getElementById('todaySalesTotal').textContent = money(salesTotal);
  document.getElementById('todayProfitTotal').textContent = money(profitTotal);
  document.getElementById('receivablesTotal').textContent = money(totalReceivables);
  document.getElementById('todayPaymentsTotal').textContent = money(totalPayments);
}

function renderLedger() {
  const customerNames = getCustomerNames();

  if (!customerNames.length) {
    ledgerList.innerHTML = '<div class="customer-card"><p>لا توجد بيانات للزبائن حتى الآن.</p></div>';
    return;
  }

  const customerCards = customerNames.map((customerName) => {
    const customerSales = state.sales.filter((sale) => sale.customerName === customerName);
    const customerPayments = state.payments.filter((payment) => payment.customerName === customerName);
    const totalPurchased = customerSales.reduce((sum, sale) => sum + Number(sale.totalSale || 0), 0);
    const totalPaid = customerPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    const remaining = Math.max(totalPurchased - totalPaid, 0);
    const lastPayment = customerPayments.length
      ? customerPayments.reduce((latest, payment) => new Date(payment.date) > new Date(latest.date) ? payment : latest)
      : null;
    const lastPurchase = customerSales.length
      ? customerSales.reduce((latest, sale) => new Date(sale.date) > new Date(latest.date) ? sale : latest)
      : null;

    const history = [...customerSales.map((sale) => ({
      type: 'purchase',
      label: `${sale.oilName} · ${sale.quantity} كيلو`,
      amount: sale.totalSale,
      date: sale.date,
      note: 'فاتورة بيع'
    })), ...customerPayments.map((payment) => ({
      type: 'payment',
      label: payment.note || 'دفعة',
      amount: payment.amount,
      date: payment.date,
      note: 'دفعة مسجلة'
    }))].sort((a, b) => new Date(a.date) - new Date(b.date));

    const historyMarkup = history.length
      ? history.map((entry) => `
          <li class="history-item">
            <div class="meta">
              <strong>${entry.label}</strong>
              <small>${entry.note} · ${dateString(entry.date)}</small>
            </div>
            <span class="${entry.type === 'purchase' ? 'amount-debit' : 'amount-credit'}">
              ${entry.type === 'purchase' ? '-' : '+'}${money(entry.amount)}
            </span>
          </li>
        `).join('')
      : '<li class="history-item"><div class="meta"><strong>لا توجد عمليات</strong></div></li>';

    return `
      <div class="customer-card">
        <div class="customer-header">
          <h3>${customerName}</h3>
          <span class="${remaining > 0 ? 'status-pill neutral' : 'status-pill profit'}">
            ${remaining > 0 ? 'له باقٍ' : 'مسدد'}
          </span>
        </div>
        <div class="customer-summary">
          <div class="summary-box">
            <span>المشتريات</span>
            <strong>${money(totalPurchased)}</strong>
          </div>
          <div class="summary-box">
            <span>المدفوع</span>
            <strong>${money(totalPaid)}</strong>
          </div>
          <div class="summary-box">
            <span>الباقي</span>
            <strong>${money(remaining)}</strong>
          </div>
        </div>
        <div class="customer-footer">
          <small>آخر شراء: ${lastPurchase ? `${lastPurchase.oilName} · ${dateString(lastPurchase.date)}` : 'لا توجد'}</small>
          <small>آخر دفعة: ${lastPayment ? `${money(lastPayment.amount)} · ${dateString(lastPayment.date)}` : 'لا توجد'}</small>
        </div>
        <ul class="history-list">${historyMarkup}</ul>
      </div>
    `;
  }).join('');

  ledgerList.innerHTML = customerCards;
}

function updateSaleDateDefault() {
  if (!saleDateInput.value) {
    saleDateInput.value = new Date().toISOString().slice(0, 10);
  }
  if (!paymentDateInput.value) {
    paymentDateInput.value = new Date().toISOString().slice(0, 10);
  }
}

function updateOilFormFields() {
  const isBoxMode = oilSaleTypeSelect.value === 'box';
  boxVolumeField.style.display = isBoxMode ? 'block' : 'none';
  oilStockLabel.textContent = isBoxMode ? 'الكمية الأولية / علبة' : 'الكمية الأولية / الكيلو';
  oilBuyPriceLabel.textContent = isBoxMode ? 'سعر الشراء / العلبة' : 'سعر الشراء / الكيلو';
  oilSellPriceLabel.textContent = isBoxMode ? 'سعر البيع / العلبة' : 'سعر البيع / الكيلو';

  if (!isBoxMode) {
    oilBoxVolumeInput.value = '';
  }
}

oilForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const name = oilNameInput.value.trim();
  const saleType = oilSaleTypeSelect.value;
  const stock = Number(oilStockInput.value);
  const boxVolumeLiters = Number(oilBoxVolumeInput.value || 0);
  const buyPrice = Number(oilBuyPriceInput.value);
  const sellPrice = Number(oilSellPriceInput.value);

  if (saleType === 'box' && (Number.isNaN(boxVolumeLiters) || boxVolumeLiters <= 0)) {
    return;
  }

  if (!name || Number.isNaN(stock) || Number.isNaN(buyPrice) || Number.isNaN(sellPrice) || stock < 0 || buyPrice < 0 || sellPrice < 0) {
    return;
  }

  state.oils.push({
    id: crypto.randomUUID(),
    name,
    saleType,
    stock,
    boxVolumeLiters: saleType === 'box' ? boxVolumeLiters : 0,
    buyPrice,
    sellPrice
  });

  saveState();
  oilForm.reset();
  updateOilFormFields();
  render();
});

saleForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const customerName = customerNameInput.value.trim();
  const oilId = oilSelect.value;
  const quantity = Number(quantityInput.value);
  const paid = Number(amountPaidInput.value || 0);
  const saleDate = saleDateInput.value || new Date().toISOString().slice(0, 10);

  if (!customerName || !oilId || Number.isNaN(quantity) || quantity <= 0) {
    return;
  }

  const selectedOil = getOilById(oilId);
  if (!selectedOil) return;

  const availableStock = Number(selectedOil.stock || 0);
  if (availableStock < quantity) {
    const availableText = selectedOil.saleType === 'box'
      ? `${availableStock} علبة`
      : kilograms(availableStock);
    alert(`لا يوجد مخزون كافي لـ ${selectedOil.name}. المتوفر: ${availableText}`);
    return;
  }

  selectedOil.stock = availableStock - quantity;

  const totalSale = selectedOil.sellPrice * quantity;
  const totalPurchase = selectedOil.buyPrice * quantity;
  const profit = totalSale - totalPurchase;

  const saleRecord = {
    id: crypto.randomUUID(),
    customerName,
    oilId: selectedOil.id,
    oilName: selectedOil.name,
    quantity,
    unitPrice: selectedOil.sellPrice,
    totalSale,
    totalPurchase,
    profit,
    paid,
    saleType: selectedOil.saleType,
    boxVolumeLiters: selectedOil.boxVolumeLiters || 0,
    date: saleDate
  };

  state.sales.push(saleRecord);

  if (paid > 0) {
    state.payments.push({
      id: crypto.randomUUID(),
      customerName,
      amount: paid,
      note: `${selectedOil.name} - دفعة أولية`,
      date: saleDate
    });
  }

  saveState();
  render();
  saleForm.reset();
  amountPaidInput.value = '0';
  customerNameInput.focus();
});

paymentForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const customerName = paymentCustomerSelect.value.trim();
  const amount = Number(paymentAmountInput.value);
  const date = paymentDateInput.value || new Date().toISOString().slice(0, 10);

  if (!customerName || Number.isNaN(amount) || amount <= 0) {
    return;
  }

  state.payments.push({
    id: crypto.randomUUID(),
    customerName,
    amount,
    note: paymentNoteInput.value.trim() || 'دفعة إضافية',
    date
  });

  saveState();
  paymentForm.reset();
  render();
});

function exportTodayReport() {
  const today = new Date().toISOString().slice(0, 10);
  const todaySales = state.sales.filter((sale) => sale.date === today);
  const todayPayments = state.payments.filter((payment) => payment.date === today);

  const wb = XLSX.utils.book_new();

  const salesSheet = XLSX.utils.json_to_sheet(todaySales.map((sale) => ({
    'اسم الزبون': sale.customerName,
    'نوع الزيت': sale.oilName,
    'الكمية': sale.quantity,
    'سعر البيع': sale.unitPrice,
    'إجمالي البيع': sale.totalSale,
    'إجمالي الشراء': sale.totalPurchase,
    'الربح': sale.profit,
    'المدفوع': sale.paid,
    'التاريخ': dateString(sale.date)
  })));

  const paymentsSheet = XLSX.utils.json_to_sheet(todayPayments.map((payment) => ({
    'اسم الزبون': payment.customerName,
    'المبلغ': payment.amount,
    'ملاحظات': payment.note,
    'التاريخ': dateString(payment.date)
  })));

  const summarySheet = XLSX.utils.json_to_sheet([
    { 'العنوان': 'تقرير اليوم', 'القيمة': '' },
    { 'العنوان': 'إجمالي المبيعات', 'القيمة': todaySales.reduce((sum, sale) => sum + Number(sale.totalSale || 0), 0) },
    { 'العنوان': 'إجمالي المدفوعات', 'القيمة': todayPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0) },
    { 'العنوان': 'إجمالي الربح', 'القيمة': todaySales.reduce((sum, sale) => sum + Number(sale.profit || 0), 0) }
  ]);

  XLSX.utils.book_append_sheet(wb, salesSheet, 'المبيعات');
  XLSX.utils.book_append_sheet(wb, paymentsSheet, 'الدفعات');
  XLSX.utils.book_append_sheet(wb, summarySheet, 'ملخص اليوم');

  XLSX.writeFile(wb, `تقرير_اليوم_${today}.xlsx`);
}

resetBtn.addEventListener('click', () => {
  const confirmed = window.confirm('هل أنت متأكد من صفر جميع البيانات؟ هذا سيحذف جميع الأصناف والمبيعات والدفعات والزبائن بشكل كامل.');
  if (!confirmed) return;

  state = structuredClone(defaultState);
  localStorage.removeItem(STORAGE_KEY);
  render();
});

exportBtn.addEventListener('click', exportTodayReport);

document.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'e') {
    event.preventDefault();
    exportTodayReport();
  }
});

quantityInput.addEventListener('input', renderInvoice);
amountPaidInput.addEventListener('input', renderInvoice);
customerNameInput.addEventListener('input', renderInvoice);
oilSelect.addEventListener('change', () => {
  updateSaleQuantityInput();
  renderInvoice();
});

function render() {
  renderOilOptions();
  renderOilTable();
  updateSaleQuantityInput();
  renderInvoice();
  renderStats();
  renderLedger();
  updateSaleDateDefault();
}

oilSaleTypeSelect.addEventListener('change', updateOilFormFields);
updateOilFormFields();
render();
