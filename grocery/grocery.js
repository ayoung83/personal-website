
  // ─── CONFIG ───────────────────────────────────────────────
  // Replace this with your AWS API Gateway URL after setup
  const API_URL = 'YOUR_API_GATEWAY_URL';
  const POLL_INTERVAL = 15000; // refresh every 15 seconds
  // ──────────────────────────────────────────────────────────

  // Demo data shown before API is connected
  const DEMO_ITEMS = [
    { id: '1', name: 'Whole Milk',      qty: '1 gallon',  category: 'Dairy' },
    { id: '2', name: 'Cheddar Cheese',  qty: '8 oz',      category: 'Dairy' },
    { id: '3', name: 'Sourdough Bread', qty: '1 loaf',    category: 'Bakery' },
    { id: '4', name: 'Eggs',            qty: '1 dozen',   category: 'Dairy' },
    { id: '5', name: 'Chicken Breast',  qty: '2 lbs',     category: 'Meat' },
    { id: '6', name: 'Salmon Fillet',   qty: '1 lb',      category: 'Meat' },
    { id: '7', name: 'Spinach',         qty: '5 oz bag',  category: 'Produce' },
    { id: '8', name: 'Avocados',        qty: '3',         category: 'Produce' },
    { id: '9', name: 'Garlic',          qty: '1 head',    category: 'Produce' },
    { id:'10', name: 'Olive Oil',       qty: '16.9 fl oz',category: 'Pantry' },
    { id:'11', name: 'Pasta',           qty: '1 lb',      category: 'Pantry' },
  ];

  // Local checked state (persisted in localStorage)
  const checkedKey = 'grocery_checked';
  let checked = JSON.parse(localStorage.getItem(checkedKey) || '{}');
  let items = [];
  let usingDemo = false;

  function saveChecked() {
    localStorage.setItem(checkedKey, JSON.stringify(checked));
  }

  function toggleItem(id) {
    checked[id] = !checked[id];
    saveChecked();
    render(items);
  }

  function groupByCategory(list) {
    return list.reduce((acc, item) => {
      const cat = item.category || 'Other';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {});
  }

  function render(list) {
    const container = document.getElementById('list-container');
    const stateMsg = document.getElementById('state-msg');

    if (!list.length) {
      stateMsg.style.display = 'block';
      stateMsg.textContent = usingDemo ? 'No items on the list.' : 'Your list is empty — ask Alexa to add something!';
      container.innerHTML = '';
      container.appendChild(stateMsg);
      updateFooter(0, 0);
      return;
    }

    stateMsg.style.display = 'none';
    const groups = groupByCategory(list);
    const sortedCats = Object.keys(groups).sort();

    let html = '';
    sortedCats.forEach(cat => {
      html += `<div class="category">
        <p class="category-label">${cat}</p>`;
      groups[cat].forEach((item, i) => {
        const done = !!checked[item.id];
        html += `<div class="item ${done ? 'done' : ''}" 
                      onclick="toggleItem('${item.id}')"
                      style="animation-delay:${i * 0.04}s">
          <div class="checkbox"></div>
          <span class="item-name">${item.name}</span>
          <span class="item-qty">${item.qty || ''}</span>
        </div>`;
      });
      html += `</div>`;
    });

    container.innerHTML = html;

    const total = list.length;
    const done = list.filter(i => checked[i.id]).length;
    updateFooter(done, total);
  }

  function updateFooter(done, total) {
    document.getElementById('done-count').textContent = done;
    document.getElementById('total-count').textContent = total;
    const pct = total ? (done / total) * 100 : 0;
    document.getElementById('progress-fill').style.width = pct + '%';
  }

  function setStatus(state, text) {
    const dot = document.getElementById('dot');
    const statusText = document.getElementById('status-text');
    dot.className = 'dot ' + state;
    statusText.textContent = text;
  }

  function updateTimestamp() {
    const now = new Date();
    document.getElementById('last-updated').textContent =
      'updated ' + now.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
  }

  async function fetchList() {
    if (API_URL === 'YOUR_API_GATEWAY_URL') {
      // Show demo mode
      document.getElementById('config-banner').classList.add('show');
      usingDemo = true;
      items = DEMO_ITEMS;
      setStatus('', 'demo mode');
      updateTimestamp();
      render(items);
      return;
    }

    try {
      setStatus('', 'syncing...');
      const res = await fetch(API_URL, { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      // Expects: { items: [{ id, name, qty, category }] }
      items = data.items || [];
      usingDemo = false;
      setStatus('live', 'live');
      updateTimestamp();
      render(items);
    } catch (err) {
      setStatus('error', 'connection error — retrying');
      console.error(err);
    }
  }

  // Initial load + polling
  fetchList();
  setInterval(fetchList, POLL_INTERVAL);
