document.addEventListener('DOMContentLoaded', function() {
  loadInvoices();
});

function loadInvoices() {
  const invoiceList = document.getElementById('invoice-list');
  invoiceList.innerHTML = '';
  
  const history = JSON.parse(localStorage.getItem('invoice-history') || []);
  
  if (history.length === 0) {
    invoiceList.innerHTML = '<p class="text-gray-500">No invoices found.</p>';
    return;
  }

  history.forEach(invoiceNumber => {
    const invoice = JSON.parse(localStorage.getItem(invoiceNumber));
    if (!invoice) return;

    const total = invoice.items.reduce((sum, item) => sum + (item.qty * item.rate), 0);
    const currencySymbol = invoice.currency === 'USD' ? '$' : invoice.currency === 'EUR' ? '€' : '₹';

    const invoiceCard = document.createElement('div');
    invoiceCard.className = 'invoice-card bg-white rounded-xl shadow-md p-6';
    invoiceCard.innerHTML = `
      <div class="flex justify-between items-start mb-4">
        <h3 class="text-xl font-bold text-indigo-600">${invoice.number}</h3>
        <span class="bg-indigo-100 text-indigo-800 text-sm px-3 py-1 rounded-full">${invoice.date}</span>
      </div>
      <div class="mb-4">
        <p class="font-medium">Client: ${invoice.billTo || 'Not specified'}</p>
        <p class="text-gray-600 text-sm">${invoice.items.length} items</p>
      </div>
      <div class="border-t pt-4">
        <div class="flex justify-between font-bold text-lg">
          <span>Total:</span>
          <span>${currencySymbol}${total.toFixed(2)}</span>
        </div>
        <div class="flex justify-between mt-4">
          <button onclick="printInvoice('${invoice.number}')" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
            Print
          </button>
          <button onclick="deleteInvoice('${invoice.number}')" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm">
            Delete
          </button>
        </div>
      </div>
    `;
    invoiceList.appendChild(invoiceCard);
  });
}

function printInvoice(invoiceNumber) {
  const invoice = JSON.parse(localStorage.getItem(invoiceNumber));
  if (!invoice) return;

  const printWindow = window.open('', '_blank');
  const currencySymbol = invoice.currency === 'USD' ? '$' : invoice.currency === 'EUR' ? '€' : '₹';
  const subtotal = invoice.items.reduce((sum, item) => sum + (item.qty * item.rate), 0);
  const tax = subtotal * 0.18;
  const total = subtotal + tax;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice ${invoice.number}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .invoice-title { font-size: 24px; font-weight: bold; }
        .company-info { text-align: right; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background-color: #f3f4f6; text-align: left; padding: 8px; }
        td { padding: 8px; border-bottom: 1px solid #ddd; }
        .totals { margin-top: 20px; float: right; width: 300px; }
        .total-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
        .grand-total { font-weight: bold; font-size: 18px; border-top: 2px solid #000; padding-top: 8px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1 class="invoice-title">INVOICE</h1>
          <p><strong>Invoice #:</strong> ${invoice.number}</p>
          <p><strong>Date:</strong> ${invoice.date}</p>
          <p><strong>Due Date:</strong> ${invoice.dueDate}</p>
        </div>
        <div class="company-info">
          <h2>Sage Financials</h2>
          <p>123 Business St.</p>
          <p>New Delhi, India</p>
        </div>
      </div>

      <div>
        <h3>Bill To:</h3>
        <p>${invoice.billTo}</p>
      </div>

      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.items.map(item => `
            <tr>
              <td>${item.name}</td>
              <td>${item.qty}</td>
              <td>${currencySymbol}${item.rate.toFixed(2)}</td>
              <td>${currencySymbol}${(item.qty * item.rate).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="totals">
        <div class="total-row">
          <span>Subtotal:</span>
          <span>${currencySymbol}${subtotal.toFixed(2)}</span>
        </div>
        <div class="total-row">
          <span>Tax (18%):</span>
          <span>${currencySymbol}${tax.toFixed(2)}</span>
        </div>
        <div class="total-row grand-total">
          <span>Total:</span>
          <span>${currencySymbol}${total.toFixed(2)}</span>
        </div>
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
            window.close();
          }, 500);
        };
      </script>
    </body>
    </html>
  `);
}

function deleteInvoice(invoiceNumber) {
  if (!confirm('Are you sure you want to delete this invoice?')) return;
  
  localStorage.removeItem(invoiceNumber);
  
  let history = JSON.parse(localStorage.getItem('invoice-history') || []);
  history = history.filter(num => num !== invoiceNumber);
  localStorage.setItem('invoice-history', JSON.stringify(history));
  
  loadInvoices();
  alert('Invoice deleted successfully');
}

// Make functions available globally
window.printInvoice = printInvoice;
window.deleteInvoice = deleteInvoice;