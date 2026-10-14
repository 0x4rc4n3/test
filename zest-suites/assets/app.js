(() => {
  const $ = id => document.getElementById(id);
  const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];
  const read = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  };
  const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const money = value => `PKR ${Number(value).toLocaleString('en-US')}`;
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));
  const localDate = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const today = localDate(new Date());
  const formatDate = value => value
    ? new Date(`${value}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';
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
  const services = [
    { name: 'Breakfast basket', desc: 'Pastries, fruit and coffee', price: 1800 },
    { name: 'Laundry service', desc: 'Same-day wash and fold', price: 1200 },
    { name: 'Airport transfer', desc: 'Private one-way transfer', price: 4500 },
    { name: 'Extra pillows', desc: 'Two hypoallergenic pillows', price: 600 }
  ];
  let user = read('zest-user', null);
  const storedBookings = read('zest-bookings', []);
  let bookings = Array.isArray(storedBookings) ? storedBookings : [];
  const storedCart = read('zest-cart', []);
  let cart = Array.isArray(storedCart) ? storedCart : [];
  let selectedRoom = 0;

  const renderRoomCard = (room, compact = false, index = 0) => `<article class="card room-card"><div class="room-photo"><img src="${room.image}" alt="${room.alt}" loading="${index < 3 ? 'eager' : 'lazy'}"><span class="room-tag">${room.tag}</span></div><div class="room-card-body"><h3>${room.name}</h3><p>${room.desc}</p><div class="card-row"><strong class="price">${money(room.price)}<small>per night</small></strong><a class="${compact ? 'outline-btn' : 'btn'}" href="booking.html?type=${encodeURIComponent(room.type)}&room=${encodeURIComponent(room.name)}">${compact ? 'Choose' : 'Book room'}</a></div></div></article>`;

  function setupHeader() {
    const auth = $('authLink');
    if (auth) {
      auth.textContent = user ? `${user.name.split(' ')[0]} · Logout` : 'Login / Register';
      auth.href = user ? '#' : 'login.html';
      auth.onclick = event => {
        if (!user) return;
        event.preventDefault();
        user = null;
        save('zest-user', null);
        location.reload();
      };
    }
    qsa('[data-page]').forEach(link => link.classList.toggle('active', link.dataset.page === document.body.dataset.page));
    const toggle = $('mobileToggle');
    const nav = $('mainNav');
    toggle?.addEventListener('click', () => nav.classList.toggle('open'));
  }

  function setupRoomCatalog() {
    const featured = $('featuredRooms');
    if (featured) featured.innerHTML = rooms.slice(0, 3).map((room, index) => renderRoomCard(room, true, index)).join('');
    const grid = $('roomsGrid');
    if (grid) grid.innerHTML = rooms.map((room, index) => renderRoomCard(room, false, index)).join('');
  }

  function setupHome() {
    const checkin = $('homeCheckin');
    if (!checkin) return;
    const checkout = $('homeCheckout');
    checkin.min = today;
    checkout.min = today;
    checkin.addEventListener('change', () => { checkout.min = checkin.value || today; });
    $('homeSearch').onclick = () => {
      if (!checkin.value || !checkout.value || checkout.value <= checkin.value) {
        $('homeNote').textContent = 'Choose a check-in date and a later check-out date.';
        return;
      }
      location.href = `booking.html?checkin=${checkin.value}&checkout=${checkout.value}&type=${encodeURIComponent($('homeType').value)}`;
    };
  }

  function setupBooking() {
    const list = $('roomList');
    if (!list) return;
    const checkin = $('checkin');
    const checkout = $('checkout');
    const filter = $('roomType');
    const form = $('bookingForm');
    const summary = $('summary');
    const formError = $('formError');
    const params = new URLSearchParams(location.search);
    checkin.value = params.get('checkin') || '';
    checkout.value = params.get('checkout') || '';
    const requestedType = params.get('type') || 'Any';
    filter.value = requestedType === 'Executive Suite' ? 'Suite' : requestedType;
    if (![...filter.options].some(option => option.value === filter.value)) filter.value = 'Any';
    checkin.min = today;
    checkout.min = checkin.value || today;
    form.noValidate = true;

    const nights = () => {
      if (!checkin.value || !checkout.value || checkout.value <= checkin.value) return 0;
      const start = Date.parse(`${checkin.value}T00:00:00Z`);
      const end = Date.parse(`${checkout.value}T00:00:00Z`);
      return Number.isFinite(start) && Number.isFinite(end) ? Math.round((end - start) / 86400000) : 0;
    };
    const visibleRooms = () => rooms.filter(room => filter.value === 'Any' || room.type === filter.value);
    const requestedRoom = params.get('room');
    if (requestedRoom) {
      const requestedIndex = visibleRooms().findIndex(room => room.name === requestedRoom);
      if (requestedIndex >= 0) selectedRoom = requestedIndex;
    }

    function render() {
      const visible = visibleRooms();
      if (!visible.length) {
        list.innerHTML = '<p class="muted">No rooms match that type.</p>';
        summary.innerHTML = '<h3>Booking summary</h3><p>Select a room to continue.</p>';
        return;
      }
      if (selectedRoom >= visible.length) selectedRoom = 0;
      list.innerHTML = visible.map((room, index) => `<button type="button" class="room-option ${index === selectedRoom ? 'selected' : ''}" data-room-index="${index}"><img class="room-option-image" src="${room.image}" alt="" loading="lazy"><div class="room-option-content"><h3>${room.name}</h3><p>${room.desc}</p></div><div class="rate"><strong>${money(room.price)}</strong><small>per night</small><span class="pick">${index === selectedRoom ? 'Selected' : 'Select room'}</span></div></button>`).join('');
      const room = visible[selectedRoom];
      const count = nights();
      summary.innerHTML = `<h3>Booking summary</h3><div class="summary-row"><span>Room</span><strong>${room.name}</strong></div><div class="summary-row"><span>Dates</span><strong>${count ? `${formatDate(checkin.value)} – ${formatDate(checkout.value)}` : 'Not set'}</strong></div><div class="summary-row"><span>Nights</span><strong>${count || '—'}</strong></div><div class="summary-total"><span>Total</span><span>${money(room.price * count)}</span></div>`;
    }

    function clearErrors() {
      formError.classList.remove('show');
      formError.textContent = '';
      qsa('[aria-invalid="true"]', form).forEach(field => field.removeAttribute('aria-invalid'));
    }

    function validate() {
      const errors = [];
      const name = $('guestName').value.trim();
      const phone = $('phone').value.trim();
      const phoneDigits = phone.replace(/\D/g, '');
      const email = $('email').value.trim();
      const cnic = $('cnic').value.trim();
      const cnicDigits = cnic.replace(/\D/g, '');
      const add = (field, message) => errors.push({ field, message });

      if (!checkin.value) add('checkin', 'Choose a check-in date.');
      else if (checkin.value < today) add('checkin', 'Check-in must be today or later.');
      if (!checkout.value) add('checkout', 'Choose a check-out date.');
      else if (checkin.value && checkout.value <= checkin.value) add('checkout', 'Check-out must be after check-in.');
      if (name.length < 2) add('guestName', 'Enter the guest’s full name.');
      if (phoneDigits.length < 10 || phoneDigits.length > 15) add('phone', 'Enter a phone number with 10–15 digits.');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) add('email', 'Enter a valid email address.');
      if (cnicDigits.length !== 13) add('cnic', 'Enter a 13-digit CNIC. Hyphens or spaces are optional.');
      if (!nights()) {
        if (!errors.some(error => error.field === 'checkin' || error.field === 'checkout')) {
          add('checkout', 'Choose valid dates to calculate the booking total.');
        }
      }
      return { errors, name, phone, email, cnic };
    }

    render();
    filter.addEventListener('change', () => { selectedRoom = 0; render(); });
    checkin.addEventListener('change', () => { checkout.min = checkin.value || today; render(); clearErrors(); });
    checkout.addEventListener('change', () => { render(); clearErrors(); });
    list.addEventListener('click', event => {
      const button = event.target.closest('[data-room-index]');
      if (button) { selectedRoom = Number(button.dataset.roomIndex); render(); }
    });
    form.addEventListener('input', clearErrors);
    form.addEventListener('change', clearErrors);
    form.addEventListener('submit', event => {
      event.preventDefault();
      clearErrors();
      const result = validate();
      if (result.errors.length) {
        formError.innerHTML = `<strong>Please check these details:</strong><ul>${result.errors.map(error => `<li>${escapeHtml(error.message)}</li>`).join('')}</ul>`;
        formError.classList.add('show');
        result.errors.forEach(error => $(error.field)?.setAttribute('aria-invalid', 'true'));
        $(result.errors[0].field)?.focus();
        return;
      }

      const room = visibleRooms()[selectedRoom] || rooms[0];
      const stayNights = nights();
      const reference = `ZS-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      const booking = {
        reference,
        room: room.name,
        roomType: room.type,
        checkin: checkin.value,
        checkout: checkout.value,
        nights: stayNights,
        guests: $('guests').value,
        guestName: result.name,
        phone: result.phone,
        email: result.email,
        cnic: result.cnic,
        specialRequests: $('specialRequests').value.trim(),
        pricePerNight: room.price,
        total: room.price * stayNights,
        status: 'Confirmed',
        createdAt: new Date().toISOString()
      };
      try {
        bookings = [...bookings, booking];
        save('zest-bookings', bookings);
      } catch {
        bookings = read('zest-bookings', []);
        formError.textContent = 'Your browser could not save this booking. Please check browser storage and try again.';
        formError.classList.add('show');
        return;
      }

      $('bookingRef').textContent = reference;
      $('bookingSuccessDetails').innerHTML = `<p><strong>${escapeHtml(room.name)}</strong></p><p>${formatDate(booking.checkin)} – ${formatDate(booking.checkout)} · ${stayNights} night${stayNights === 1 ? '' : 's'}</p><p>Total: <strong>${money(booking.total)}</strong></p>`;
      form.classList.add('hidden');
      $('bookingSuccess').classList.add('show');
    });
  }

  function setupLogin() {
    const loginForm = $('loginForm');
    if (!loginForm) return;
    loginForm.onsubmit = event => {
      event.preventDefault();
      const value = $('loginUser').value.trim().toLowerCase();
      const users = read('zest-users', [{ username: 'zohaib.sadiq', email: 'zohaib@email.com', password: 'zest1234', name: 'Zohaib Sadiq' }]);
      const found = users.find(account => (account.username === value || account.email === value) && account.password === $('loginPassword').value);
      if (!found) { $('loginError').classList.add('show'); return; }
      save('zest-user', found);
      location.href = new URLSearchParams(location.search).get('next') || 'index.html';
    };
    $('showRegister').onclick = () => { $('loginPanel').classList.add('hidden'); $('registerPanel').classList.remove('hidden'); };
    $('showLogin').onclick = () => { $('registerPanel').classList.add('hidden'); $('loginPanel').classList.remove('hidden'); };
    $('registerForm').onsubmit = event => {
      event.preventDefault();
      const account = { name: $('regName').value.trim(), email: $('regEmail').value.trim(), username: $('regEmail').value.trim(), password: $('regPassword').value };
      if (account.name.length < 3 || !/^\S+@\S+\.\S+$/.test(account.email) || account.password.length < 8 || account.password !== $('regConfirm').value) {
        $('registerError').classList.add('show');
        return;
      }
      const users = read('zest-users', [{ username: 'zohaib.sadiq', email: 'zohaib@email.com', password: 'zest1234', name: 'Zohaib Sadiq' }]);
      users.push(account);
      save('zest-users', users);
      $('registerSuccess').classList.add('show');
      $('showLogin').click();
      $('loginUser').value = account.email;
    };
  }

  function setupBookings() {
    const list = $('bookingList');
    if (!list) return;
    const latestFirst = bookings.slice().reverse();
    list.innerHTML = latestFirst.length ? latestFirst.map(item => `<article class="booking-item"><div><h3>${escapeHtml(item.room || 'Room booking')}</h3><p>Reference: ${escapeHtml(item.reference || '—')}</p><p>Guest: ${escapeHtml(item.guestName || 'Guest')}</p><p>${formatDate(item.checkin)} – ${formatDate(item.checkout)} · ${escapeHtml(item.guests || '—')} · ${Number(item.nights) || 0} night${Number(item.nights) === 1 ? '' : 's'}</p><p>${money(item.total || 0)}</p></div><span class="status">${escapeHtml(item.status || 'Confirmed')}</span></article>`).join('') : '<div class="data-empty">No bookings yet. Choose a room to get started.</div>';
  }

  function setupServices() {
    const grid = $('serviceGrid');
    if (!grid) return;
    if (!user) { location.href = 'login.html?next=services.html'; return; }
    grid.innerHTML = services.map((service, index) => `<article class="service-card card"><h3>${service.name}</h3><p>${service.desc}</p><div class="card-row"><strong class="price">${money(service.price)}</strong><button type="button" class="btn" data-add-service="${index}">Add</button></div></article>`).join('');
    const cartBox = $('cart');
    function renderCart() {
      cartBox.innerHTML = `<h3>Your order</h3>${cart.length ? cart.map((item, index) => `<div class="cart-row"><span>${escapeHtml(item.name)} × ${item.quantity}</span><strong>${money(item.price * item.quantity)} <button type="button" data-remove-service="${index}">Remove</button></strong></div>`).join('') + '<button type="button" class="btn" data-place-order style="margin-top:15px">Place order</button>' : '<p class="muted">Your order is empty.</p>'}`;
    }
    renderCart();
    document.addEventListener('click', event => {
      const addButton = event.target.closest('[data-add-service]');
      if (addButton) {
        const service = services[Number(addButton.dataset.addService)];
        if (!service) return;
        const item = cart.find(entry => entry.name === service.name);
        if (item) item.quantity++;
        else cart.push({ ...service, quantity: 1 });
        save('zest-cart', cart);
        renderCart();
        return;
      }
      const removeButton = event.target.closest('[data-remove-service]');
      if (removeButton) {
        cart.splice(Number(removeButton.dataset.removeService), 1);
        save('zest-cart', cart);
        renderCart();
        return;
      }
      const placeOrderButton = event.target.closest('[data-place-order]');
      if (placeOrderButton && cart.length) {
        cart = [];
        save('zest-cart', cart);
        renderCart();
        cartBox.insertAdjacentHTML('afterbegin', '<div class="alert success show order-success" role="status">Your order has been placed. Our team will take care of it shortly.</div>');
      }
    });
  }

  function setupFeedback() {
    const form = $('feedbackForm');
    if (!form) return;
    if (!user) { location.href = 'login.html?next=feedback.html'; return; }
    let rating = 0;
    qsa('[data-rating]').forEach(button => button.onclick = () => {
      rating = Number(button.dataset.rating);
      qsa('[data-rating]').forEach(item => item.classList.toggle('on', Number(item.dataset.rating) <= rating));
    });
    form.onsubmit = event => {
      event.preventDefault();
      if (!rating || !$('feedbackText').value.trim()) { $('feedbackError').classList.add('show'); return; }
      alert('Thank you for your feedback.');
      form.reset();
    };
  }

  setupHeader();
  setupRoomCatalog();
  setupHome();
  setupBooking();
  setupLogin();
  setupBookings();
  setupServices();
  setupFeedback();
})();
