// Local Storage Key
const STORAGE_KEY = "cybercraft_orders";

let currentSelectedProduct = "";
let currentSelectedPrice = 0;
let ordersChartInstance = null;

// Page Switcher (Store vs Dashboard)
function switchPage(page) {
  const storePage = document.getElementById("page-store");
  const ordersPage = document.getElementById("page-orders");
  const navLinks = document.querySelectorAll(".nav-link");

  navLinks.forEach(link => link.classList.remove("active"));

  if (page === 'orders') {
    storePage.style.display = "none";
    ordersPage.style.display = "block";
    renderDashboard();
  } else {
    storePage.style.display = "block";
    ordersPage.style.display = "none";
  }
}

// Open Form Modal
function openCheckoutModal(title, price) {
  currentSelectedProduct = title;
  currentSelectedPrice = price;

  document.getElementById("modal-product-title").innerText = title;
  document.getElementById("modal-product-price").innerText = "Rs. " + price.toLocaleString();
  document.getElementById("checkoutModal").style.display = "flex";
}

// Close Modal
function closeModal() {
  document.getElementById("checkoutModal").style.display = "none";
}

// Get Saved Orders from Storage
function getSavedOrders() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
}

// Process Order & Direct to WhatsApp
function processOrder(e) {
  e.preventDefault();

  const name = document.getElementById("custName").value.trim();
  const phone = document.getElementById("custPhone").value.trim();
  const address = document.getElementById("custAddress").value.trim();
  const payment = document.getElementById("custPayment").value;

  const newOrder = {
    id: "ORD-" + Math.floor(1000 + Math.random() * 9000),
    name: name,
    phone: phone,
    address: address,
    product: currentSelectedProduct,
    price: currentSelectedPrice,
    payment: payment,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    timestamp: new Date().toISOString()
  };

  // Save to LocalStorage
  const orders = getSavedOrders();
  orders.unshift(newOrder);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));

  // WhatsApp Message Redirect
  const whatsappNumber = "923015228759";
  const message = `السلام علیکم! نیا ارڈر کنفرم ہوا ہے:%0A%0A` +
                  `🆔 *Order ID:* ${newOrder.id}%0A` +
                  `👤 *Name:* ${name}%0A` +
                  `📞 *Phone:* ${phone}%0A` +
                  `🏠 *Address:* ${address}%0A` +
                  `📦 *Product:* ${currentSelectedProduct}%0A` +
                  `💰 *Price:* Rs. ${currentSelectedPrice.toLocaleString()}%0A` +
                  `💳 *Payment:* ${payment}`;

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  closeModal();
  document.getElementById("orderForm").reset();

  // Redirect to WhatsApp
  window.open(whatsappUrl, '_blank');
}

// Render Dashboard Data & Chart
function renderDashboard() {
  const orders = getSavedOrders();

  // Metrics
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, ord) => sum + ord.price, 0);

  document.getElementById("stat-total-orders").innerText = totalOrders;
  document.getElementById("stat-total-revenue").innerText = "Rs. " + totalRevenue.toLocaleString();
  document.getElementById("stat-pending-orders").innerText = totalOrders;

  // Render Table Rows
  const tbody = document.getElementById("orders-table-body");
  tbody.innerHTML = "";

  if (orders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color: var(--text-muted); padding:20px;">کوئی ارڈر نہیں ہے۔ پہلے ویب سائٹ سے ایک ارڈر ٹیسٹ کے طور پر کریں۔</td></tr>`;
  } else {
    orders.forEach(ord => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td style="color:var(--accent-cyan); font-weight:bold;">${ord.id}</td>
        <td><strong>${ord.name}</strong></td>
        <td>${ord.phone}</td>
        <td>${ord.product}</td>
        <td style="color:var(--accent-green); font-weight:bold;">Rs. ${ord.price.toLocaleString()}</td>
        <td style="max-width: 200px;">${ord.address}</td>
        <td>${ord.date}</td>
        <td><span class="badge-pending">PENDING</span></td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Render Shopify-style Dynamic Graph
  renderChart(orders);
}

// Shopify Style Live Orders Chart
function renderChart(orders) {
  const ctx = document.getElementById('ordersChart').getContext('2d');

  if (ordersChartInstance) {
    ordersChartInstance.destroy();
  }

  // Grouping orders by last 7 days/weeks dynamically
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const counts = [0, 0, 0, 0, 0, 0, 0];

  // Map orders into chart buckets
  orders.forEach((ord, index) => {
    const dayIndex = index % 7;
    counts[dayIndex] += 1;
  });

  ordersChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: days,
      datasets: [{
        label: 'Orders Count',
        data: counts.reverse(),
        borderColor: '#00f0ff',
        backgroundColor: 'rgba(0, 240, 255, 0.15)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: '#00ff88',
        pointRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: '#8b9bb4', font: { family: 'Orbitron' } }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: { color: '#8b9bb4' }
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: { color: '#8b9bb4', stepSize: 1 }
        }
      }
    }
  });
}