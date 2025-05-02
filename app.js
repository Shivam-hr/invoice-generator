let items = [];
let currencySymbol = '₹';
let exchangeRates = {
  USD: 0.012,
  EUR: 0.011,
  INR: 1
};

// Add new item to the invoice
function addItem() {
  items.push({ name: '', qty: 1, rate: 0 });
  renderItems();
}

// Remove item from the invoice
function removeItem(index) {
  items.splice(index, 1);
  renderItems();
  calculateTotals();
}

// Display all items in the table
function renderItems() {
  const tbody = document.getElementById('invoice-items');
  tbody.innerHTML = '';
  
  items.forEach((item, i) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><input value="${item.name}" oninput="items[${i}].name=this.value" class="border w-full px-2 py-1 bg-gray-50 rounded-md"/></td>
      <td><input type="number" value="${item.qty}" min="1" oninput="updateItem(${i}, 'qty', this.value)" class="border w-full px-2 py-1 bg-gray-50 rounded-md"/></td>
      <td><input type="number" value="${item.rate}" oninput="updateItem(${i}, 'rate', this.value)" class="border w-full px-2 py-1 bg-gray-50 rounded-md"/></td>
      <td>${currencySymbol}${(item.qty * item.rate).toFixed(2)}</td>
      <td><button onclick="removeItem(${i})" class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-md text-xs">Remove</button></td>
    `;
    tbody.appendChild(row);
  });
}

// Update item values and calculate immediately
function updateItem(index, field, value) {
  items[index][field] = parseFloat(value) || 0;
  updateAmountDisplay(index);
  calculateTotals();
}

// Update the amount display for a single item
function updateAmountDisplay(index) {
  const rows = document.getElementById('invoice-items').children;
  if (rows[index]) {
    const amountCell = rows[index].children[3];
    amountCell.textContent = `${currencySymbol}${(items[index].qty * items[index].rate).toFixed(2)}`;
  }
}

// Calculate all totals (subtotal, tax, total, balance)
function calculateTotals() {
  const subtotal = items.reduce((sum, item) => sum + (item.qty * item.rate), 0);
  const tax = subtotal * 0.18; // 18% tax
  const paid = parseFloat(document.getElementById('paid').value) || 0;
  const total = subtotal + tax;
  const balance = total - paid;

  // Update the display
  document.getElementById('subtotal').textContent = `${currencySymbol}${subtotal.toFixed(2)}`;
  document.getElementById('tax').textContent = `${currencySymbol}${tax.toFixed(2)}`;
  document.getElementById('total').textContent = `${currencySymbol}${total.toFixed(2)}`;
  document.getElementById('balance').textContent = `${currencySymbol}${balance.toFixed(2)}`;
}

// Change currency and convert amounts
function convertCurrency() {
  const selected = document.getElementById('currency').value;
  currencySymbol = selected === 'INR' ? '₹' : selected === 'USD' ? '$' : '€';
  const rate = exchangeRates[selected];
  
  items.forEach(item => {
    item.rate = (item.rate * rate).toFixed(2);
  });
  
  renderItems();
  calculateTotals();
}

// Save invoice to localStorage
function saveInvoice() {
  const invoice = {
    number: document.getElementById('invoiceNumber').value,
    billTo: document.getElementById('billTo').value,
    shipTo: document.getElementById('shipTo').value,
    date: document.getElementById('date').value,
    dueDate: document.getElementById('dueDate').value,
    terms: document.getElementById('terms').value,
    notes: document.getElementById('notes').value,
    termsText: document.getElementById('termsText').value,
    currency: document.getElementById('currency').value,
    paid: document.getElementById('paid').value,
    items
  };

  localStorage.setItem(invoice.number, JSON.stringify(invoice));
  
  let history = JSON.parse(localStorage.getItem('invoice-history') || '[]');
  if (!history.includes(invoice.number)) {
    history.push(invoice.number);
    localStorage.setItem('invoice-history', JSON.stringify(history));
  }

  alert("Invoice saved!");
}

// Generate PDF of invoice
function exportPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  // Add header
  doc.setFontSize(18);
  doc.text("INVOICE", 105, 20, { align: 'center' });
  doc.setFontSize(12);
  doc.text(`Invoice Number: ${document.getElementById('invoiceNumber').value}`, 15, 30);
  doc.text(`Date: ${document.getElementById('date').value}`, 15, 40);
  doc.text(`Bill To: ${document.getElementById('billTo').value}`, 15, 50);

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.qty * item.rate), 0);
  const tax = subtotal * 0.18;
  const total = subtotal + tax;

  // Create table data
  const itemRows = items.map(i => [
    i.name,
    i.qty,
    `${currencySymbol}${i.rate.toFixed(2)}`,
    `${currencySymbol}${(i.qty * i.rate).toFixed(2)}`
  ]);

  // Add items table
  doc.autoTable({
    head: [["Item", "Quantity", "Rate", "Amount"]],
    body: itemRows,
    startY: 60,
    theme: 'grid',
    styles: { fontSize: 10 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 }
  });

  // Add totals
  const finalY = doc.autoTable.previous.finalY + 10;
  doc.setFontSize(12);
  doc.text(`Subtotal: ${currencySymbol}${subtotal.toFixed(2)}`, 15, finalY);
  doc.text(`Tax (18%): ${currencySymbol}${tax.toFixed(2)}`, 15, finalY + 10);
  doc.text(`Total: ${currencySymbol}${total.toFixed(2)}`, 15, finalY + 20);
  doc.text(`Balance Due: ${currencySymbol}${(total - document.getElementById('paid').value).toFixed(2)}`, 15, finalY + 30);

  // Save PDF
  doc.save(`invoice-${document.getElementById('invoiceNumber').value}.pdf`);
}

// Placeholder for email function
function sendEmail() {
  alert("Email functionality requires backend server integration (e.g., Node.js with SMTP).");
}

// Show invoice history in new tab
function showInvoiceHistory() {
  window.open('invoice-history.html', '_blank');
}

// Initialize date pickers with default values
function enhanceDatePickers() {
  const dateInputs = document.querySelectorAll('input[type="date"]');
  
  dateInputs.forEach(input => {
    input.addEventListener('focus', function() {
      if (!this.value) {
        const today = new Date();
        this.value = today.toISOString().substr(0, 10);
      }
    });
  });
  
  const dateInput = document.getElementById('date');
  const dueDateInput = document.getElementById('dueDate');
  
  if (!dateInput.value) {
    const today = new Date();
    dateInput.value = today.toISOString().substr(0, 10);
  }
  
  if (!dueDateInput.value) {
    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(today.getDate() + 30);
    dueDateInput.value = dueDate.toISOString().substr(0, 10);
  }
}

// Generate invoice number
function generateInvoiceNumber() {
  const last = parseInt(localStorage.getItem('lastInvoiceNumber') || '1000', 10);
  const next = last + 1;
  localStorage.setItem('lastInvoiceNumber', next);
  document.getElementById("invoiceNumber").value = 'INV-' + next;
}

// Initialize when page loads
window.addEventListener('DOMContentLoaded', function() {
  enhanceDatePickers();
  generateInvoiceNumber();
});

// Make functions available globally
window.printInvoice = printInvoice;
window.deleteInvoice = deleteInvoice;