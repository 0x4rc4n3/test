(() => {
  const $ = id => document.getElementById(id);
  const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const money = value => `PKR ${Number(value).toLocaleString('en-US')}`;
  const today = new Date().toISOString().slice(0, 10);
  const formatDate = value => new Date(`${value}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const rooms = [
    { type: 'Standard', name: 'Room 101 · Classic Queen', desc: 'Queen bed · work desk · complimentary Wi-Fi', price: 8000, image: 'assets/rooms/room-01.jpg', alt: 'Classic hotel room with a queen bed and warm, traditional details', tag: 'CLASSIC COMFORT' },
    { type: 'Standard', name: 'Room 102 · Twin Comfort', desc: 'Two beds · bright interiors · ideal for friends', price: 8500, image: 'assets/rooms/room-02.jpg', alt: 'Bright twin-bed hotel room with a clean modern interior', tag: 'TWIN ROOM' },
    { type: 'Deluxe', name: 'Room 204 · Balcony Deluxe', desc: 'King bed · private balcony · city outlook', price: 12000, image: 'assets/rooms/room-03.jpg', alt: 'Boutique hotel bedroom with a king bed and warm lighting', tag: 'BALCONY' },
    { type: 'Deluxe', name: 'Room 205 · Deluxe King', desc: 'King bed · lounge corner · upgraded amenities', price: 13500, image: 'assets/rooms/room-04.jpg', alt: 'Contemporary hotel room with a king bed and large windows', tag: 'DELUXE' },
    { type: 'Family', name: 'Room 301 · Family Retreat', desc: 'Two beds · extra space · family-friendly layout', price: 16000, image: 'assets/rooms/room-05.jpg', alt: 'Spacious hotel room with twin beds and a comfortable seating area', tag: 'FAMILY STAY' },
    { type: 'Suite', name: 'Room 302 · Junior Suite', desc: 'King bed · open sitting area · generous space', price: 17500, image: 'assets/rooms/room-06.jpg', alt: 'Elegant suite bedroom with a king bed and balcony access', tag: 'JUNIOR SUITE' },
    { type: 'Suite', name: 'Room 401 · Executive Suite', desc: 'Separate lounge · king bed · premium finishes', price: 22000, image: 'assets/rooms/room-07.jpg', alt: 'Executive hotel suite with a king bed and sitting area', tag: 'EXECUTIVE' },
    { type: 'Suite', name: 'Room 402 · Presidential Suite', desc: 'Twin queen beds · expansive layout · top-floor views', price: 28000, image: 'assets/rooms/room-08.jpg', alt: 'Airy suite with two queen beds and a bright neutral interior', tag: 'TOP FLOOR' }
  ];
  const renderRoomCard = (room, compact = false, index = 0) => `<article class="card room-card"><div class="room-photo"><img src="${room.image}" alt="${room.alt}" loading="${index < 3 ? 'eager' : 'lazy'}"><span class="room-tag">${room.tag}</span></div><div class="room-card-body"><h3>${room.name}</h3><p>${room.desc}</p><div class="card-row"><strong class="price">${money(room.price)}<small>per night</small></strong><a class="${compact ? 'outline-btn' : 'btn'}" href="booking.html?type=${encodeURIComponent(room.type)}&room=${encodeURIComponent(room.name)}">${compact ? 'Choose' : 'Book room'}</a></div></div></article>`;
  function setupRoomCatalog() {
    const featured = $('featuredRooms');
    if (featured) featured.innerHTML = rooms.slice(0, 3).map((room, index) => renderRoomCard(room, true, index)).join('');
    const grid = $('roomsGrid');
    if (grid) grid.innerHTML = rooms.map((room, index) => renderRoomCard(room, false, index)).join('');
  }
  const services = [
    { name: 'Breakfast basket', desc: 'Pastries, fruit and coffee', price: 1800 },
    { name: 'Laundry service', desc: 'Same-day wash and fold', price: 1200 },
    { name: 'Airport transfer', desc: 'Private one-way transfer', price: 4500 },
    { name: 'Extra pillows', desc: 'Two hypoallergenic pillows', price: 600 }
  ];
  let user = read('zest-user', null);
  let users = read('zest-users', [{ username: 'zohaib.sadiq', email: 'zohaib@email.com', password: 'zest1234', name: 'Zohaib Sadiq' }]);
  let bookings = read('zest-bookings', []);
  let cart = read('zest-cart', []);
  let selectedRoom = 0;
  function setupHeader() {
    const auth = $('authLink');
    if (auth) { auth.textContent = user ? `${user.name.split(' ')[0]} · Logout` : 'Login / Register'; auth.href = user ? '#' : 'login.html'; auth.onclick = event => { if (user) { event.preventDefault(); user = null; save('zest-user', null); location.reload(); } }; }
    qsa('[data-page]').forEach(link => link.classList.toggle('active', link.dataset.page === document.body.dataset.page));
    const toggle = $('mobileToggle'); const nav = $('mainNav'); toggle?.addEventListener('click', () => nav.classList.toggle('open'));
  }
  function setupHome() {
    const checkin = $('homeCheckin'); if (!checkin) return; const checkout = $('homeCheckout'); checkin.min = today; checkout.min = today;
    $('homeSearch').onclick = () => { if (!checkin.value || !checkout.value || checkout.value <= checkin.value) { $('homeNote').textContent = 'Choose valid dates to continue.'; return; } location.href = `booking.html?checkin=${checkin.value}&checkout=${checkout.value}&type=${encodeURIComponent($('homeType').value)}`; };
  }
  function setupBooking() {
    const list = $('roomList'); if (!list) return;
    const checkin = $('checkin'), checkout = $('checkout'), filter = $('roomType'), form = $('bookingForm'), summary = $('summary');
    const params = new URLSearchParams(location.search); checkin.value = params.get('checkin') || ''; checkout.value = params.get('checkout') || ''; const requestedType = params.get('type') || 'Any'; filter.value = requestedType === 'Executive Suite' ? 'Suite' : requestedType; if (![...filter.options].some(option => option.value === filter.value)) filter.value = 'Any'; checkin.min = today; checkout.min = today;
    const nights = () => checkin.value && checkout.value > checkin.value ? Math.round((new Date(checkout.value) - new Date(checkin.value)) / 864e5) : 0;
    const visibleRooms = () => rooms.filter(room => filter.value === 'Any' || room.type === filter.value);
    const requestedRoom = params.get('room');
    if (requestedRoom) { const requestedIndex = visibleRooms().findIndex(room => room.name === requestedRoom); if (requestedIndex >= 0) selectedRoom = requestedIndex; }
    function render() { const visible = visibleRooms(); if (selectedRoom >= visible.length) selectedRoom = 0; list.innerHTML = visible.map((room, index) => `<button type="button" class="room-option ${index === selectedRoom ? 'selected' : ''}" data-room-index="${index}"><img class="room-option-image" src="${room.image}" alt="" loading="lazy"><div class="room-option-content"><h3>${room.name}</h3><p>${room.desc}</p></div><div class="rate"><strong>${money(room.price)}</strong><small>per night</small><span class="pick">${index === selectedRoom ? 'Selected' : 'Select room'}</span></div></button>`).join(''); const room = visible[selectedRoom]; summary.innerHTML = `<h3>Booking summary</h3><div class="summary-row"><span>Room</span><strong>${room.name}</strong></div><div class="summary-row"><span>Dates</span><strong>${nights() ? `${formatDate(checkin.value)} – ${formatDate(checkout.value)}` : 'Not set'}</strong></div><div class="summary-row"><span>Nights</span><strong>${nights() || '—'}</strong></div><div class="summary-total"><span>Total</span><span>${money(room.price * nights())}</span></div>`; }
    render(); filter.onchange = () => { selectedRoom = 0; render(); }; checkin.onchange = render; checkout.onchange = render;
    list.addEventListener('click', event => { const button = event.target.closest('[data-room-index]'); if (button) { selectedRoom = Number(button.dataset.roomIndex); render(); } });
    form.onsubmit = event => { event.preventDefault(); const valid = $('guestName').value.trim().length > 2 && $('phone').value.trim().length >= 10 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($('email').value) && /^\d{5}-\d{7}-\d$/.test($('cnic').value) && nights() > 0; if (!valid) { $('formError').classList.add('show'); return; } const room = visibleRooms()[selectedRoom]; const reference = `ZS-${Math.random().toString(36).slice(2, 8).toUpperCase()}`; bookings.push({ reference, room: room.name, checkin: checkin.value, checkout: checkout.value, guests: $('guests').value, total: room.price * nights() }); save('zest-bookings', bookings); form.classList.add('hidden'); $('bookingSuccess').classList.add('show'); $('bookingRef').textContent = reference; };
  }
  function setupLogin() {
    const loginForm = $('loginForm'); if (!loginForm) return;
    loginForm.onsubmit = event => { event.preventDefault(); const value = $('loginUser').value.trim().toLowerCase(); const found = users.find(account => (account.username === value || account.email === value) && account.password === $('loginPassword').value); if (!found) { $('loginError').classList.add('show'); return; } save('zest-user', found); location.href = new URLSearchParams(location.search).get('next') || 'index.html'; };
    $('showRegister').onclick = () => { $('loginPanel').classList.add('hidden'); $('registerPanel').classList.remove('hidden'); }; $('showLogin').onclick = () => { $('registerPanel').classList.add('hidden'); $('loginPanel').classList.remove('hidden'); };
    $('registerForm').onsubmit = event => { event.preventDefault(); const account = { name: $('regName').value.trim(), email: $('regEmail').value.trim(), username: $('regEmail').value.trim(), password: $('regPassword').value }; if (account.name.length < 3 || !/^\S+@\S+\.\S+$/.test(account.email) || account.password.length < 8 || account.password !== $('regConfirm').value) { $('registerError').classList.add('show'); return; } users.push(account); save('zest-users', users); $('registerSuccess').classList.add('show'); $('showLogin').click(); $('loginUser').value = account.email; };
  }
  function setupBookings() { const list = $('bookingList'); if (!list) return; if (!user) { location.href = 'login.html?next=bookings.html'; return; } list.innerHTML = bookings.length ? bookings.map(item => `<article class="booking-item"><div><h3>${item.room}</h3><p>${item.reference} · ${formatDate(item.checkin)} – ${formatDate(item.checkout)} · ${item.guests}</p><p>${money(item.total)}</p></div><span class="status">Confirmed</span></article>`).join('') : '<div class="data-empty">No bookings yet. Choose a room to get started.</div>'; }
  function setupServices() { const grid = $('serviceGrid'); if (!grid) return; if (!user) { location.href = 'login.html?next=services.html'; return; } grid.innerHTML = services.map((service, index) => `<article class="service-card card"><h3>${service.name}</h3><p>${service.desc}</p><div class="card-row"><strong class="price">${money(service.price)}</strong><button class="btn" data-add-service="${index}">Add</button></div></article>`).join(''); const cartBox = $('cart'); function renderCart() { cartBox.innerHTML = `<h3>Your order</h3>${cart.length ? cart.map((item, index) => `<div class="cart-row"><span>${item.name} × ${item.quantity}</span><strong>${money(item.price * item.quantity)} <button data-remove-service="${index}">Remove</button></strong></div>`).join('') + '<button class="btn" data-place-order style="margin-top:15px">Place demo order</button>' : '<p class="muted">Your order is empty.</p>'}`; } renderCart(); document.addEventListener('click', event => { if (event.target.dataset.addService) { const service = services[Number(event.target.dataset.addService)]; const item = cart.find(entry => entry.name === service.name); item ? item.quantity++ : cart.push({ ...service, quantity: 1 }); save('zest-cart', cart); renderCart(); } if (event.target.dataset.removeService) { cart.splice(Number(event.target.dataset.removeService), 1); save('zest-cart', cart); renderCart(); } if (event.target.dataset.placeOrder) { cart = []; save('zest-cart', cart); renderCart(); cartBox.insertAdjacentHTML('afterbegin', '<div class="alert success show order-success">Order placed successfully. Our team will deliver it to your room.</div>'); } }); }
  function setupFeedback() { const form = $('feedbackForm'); if (!form) return; if (!user) { location.href = 'login.html?next=feedback.html'; return; } let rating = 0; qsa('[data-rating]').forEach(button => button.onclick = () => { rating = Number(button.dataset.rating); qsa('[data-rating]').forEach(item => item.classList.toggle('on', Number(item.dataset.rating) <= rating)); }); form.onsubmit = event => { event.preventDefault(); if (!rating || !$('feedbackText').value.trim()) { $('feedbackError').classList.add('show'); return; } alert('Thank you for your feedback.'); form.reset(); }; }
  setupHeader(); setupRoomCatalog(); setupHome(); setupBooking(); setupLogin(); setupBookings(); setupServices(); setupFeedback();
})();
