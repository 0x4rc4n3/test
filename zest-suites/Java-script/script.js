
(function () {
  var $ = function (id) { return document.getElementById(id) };
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var fmt = function (n) { return 'PKR ' + n.toLocaleString('en-US') };
  function dShort(v) { var d = new Date(v + 'T00:00:00'); return d.getDate() + ' ' + months[d.getMonth()] }
  function dLong(v) { var d = new Date(v + 'T00:00:00'); return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear() }
  function iso(d) { return d.toISOString().split('T')[0] }
  function mark(id, ok) { $(id).classList.toggle('bad', !ok); return ok }

  /* ---------- state ---------- */
  var users = [{ username: 'zohaib.sadiq', password: 'zest1234', name: 'Zohaib Sadiq', email: 'zohaib@email.com', phone: '' }];
  var user = null, pending = null, current = 'home';
  var rooms = [
    { id: '101', type: 'Standard', name: 'Room 101 - Standard', desc: 'Queen bed, work desk, 1st floor', price: 8000 },
    { id: '204', type: 'Deluxe', name: 'Room 204 - Deluxe', desc: 'King bed, balcony, 2nd floor', price: 12000 },
    { id: '210', type: 'Deluxe', name: 'Room 210 - Deluxe', desc: 'Twin beds, city view, 2nd floor', price: 12000 },
    { id: '305', type: 'Executive suite', name: 'Room 305 - Executive suite', desc: 'Living area, 3rd floor', price: 18000 }
  ];
  var selected = null;
  var other = {
    bookings: ['My bookings', 'Your reservations will appear here once you make a booking.'],
    service: ['Order service', 'Order room service, housekeeping and more during your stay.'],
    feedback: ['Feedback', 'Tell us how your stay went after check-out.']
  };

  /* ---------- navigation ---------- */
  var nav = $('nav'), menuBtn = $('menuBtn');
  menuBtn.addEventListener('click', function () { var o = nav.classList.toggle('open'); menuBtn.setAttribute('aria-expanded', o) });
  function closeMenu() { nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', false) }

  var allViews = ['home', 'book', 'login', 'bookings', 'service', 'feedback', 'reception', 'reservations', 'admin', 'components'];
  function go(view) {
    if (view === 'book') prepBook();
    allViews.forEach(function (v) {
      var el = $('v-' + v);
      if (el) el.classList.toggle('on', v === view);
    });
    current = view;
    document.querySelectorAll('nav a').forEach(function (a) {
      a.classList.toggle('active', a.dataset.go === view);
    });
    $('authBtn').classList.toggle('active', view === 'login');
    closeMenu();
    window.scrollTo(0, 0);
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-go]');
    if (t) { e.preventDefault(); go(t.dataset.go) }
  });

  function firstLast(n) { var p = n.trim().split(/\s+/); return p.length > 1 ? p[0] + ' ' + p[p.length - 1].charAt(0).toUpperCase() + '.' : p[0] }
  function renderAuth() {
    var b = $('authBtn');
    if (user) { b.textContent = firstLast(user.name) + ' | Logout'; b.classList.remove('cta') }
    else { b.textContent = 'Login / Register'; b.classList.add('cta') }
  }
  $('authBtn').addEventListener('click', function () {
    if (user) { user = null; pending = null; renderAuth(); resetBooking(); go('home') }
    else go('login');
  });

  /* ---------- home ---------- */
  var today = iso(new Date());
  $('hCin').min = today; $('hCout').min = today;
  $('hCin').addEventListener('change', function () { $('hCout').min = $('hCin').value || today });
  $('hSearch').addEventListener('click', function () {
    var a = $('hCin').value, b = $('hCout').value, m = $('hMsg');
    if (!a || !b) { m.textContent = 'Please choose both check-in and check-out dates.'; return }
    if (b <= a) { m.textContent = 'Check-out must be after check-in.'; return }
    m.textContent = '';
    $('cin').value = a; $('cout').value = b; $('guests').value = $('hGuests').value; $('typeFilter').value = $('hType').value;
    go('book');
  });
  document.querySelectorAll('[data-room]').forEach(function (b) {
    b.addEventListener('click', function () { $('typeFilter').value = b.dataset.room; go('book') });
  });

  /* ---------- booking ---------- */
  function nights() {
    if (!$('cin').value || !$('cout').value) return 0;
    var n = Math.round((new Date($('cout').value) - new Date($('cin').value)) / 864e5);
    return n > 0 ? n : 0;
  }
  function list() { var t = $('typeFilter').value; return rooms.filter(function (r) { return t === 'Any' || r.type === t }) }
  function renderRooms() {
    var l = list();
    if (!l.some(function (r) { return r.id === selected })) selected = l.length ? l[0].id : null;
    $('roomList').innerHTML = '';
    l.forEach(function (r) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'room' + (r.id === selected ? ' sel' : '');
      b.setAttribute('aria-pressed', r.id === selected);
      b.innerHTML = '<div><h3>' + r.name + '</h3><p>' + r.desc + '</p></div><div class="r"><div class="rp">' + fmt(r.price) + '<small>per night</small></div><span class="pick">' + (r.id === selected ? 'Selected' : 'Select') + '</span></div>';
      b.addEventListener('click', function () { selected = r.id; renderRooms(); renderSummary() });
      $('roomList').appendChild(b);
    });
  }
  function renderBanner() {
    var n = nights(), c = list().length;
    $('banner').textContent = n > 0
      ? c + ' room' + (c === 1 ? ' is' : 's are') + ' available for ' + dShort($('cin').value) + ' to ' + dLong($('cout').value) + '.'
      : 'Choose valid check-in and check-out dates to see available rooms.';
  }
  function renderSummary() {
    var r = rooms.filter(function (x) { return x.id === selected })[0], n = nights();
    var row = function (a, b) { return '<div class="sum-row"><span>' + a + '</span><b>' + b + '</b></div>' };
    $('sum').innerHTML = row('Room', r ? r.name : 'None selected') +
      row('Dates', n ? dShort($('cin').value) + ' to ' + dShort($('cout').value) : 'Not set') +
      row('Nights', n || '-') + row('Guests', $('guests').value) +
      row('Rate', r ? fmt(r.price) + ' / night' : '-') +
      '<div class="sum-total"><span>Total</span><span>' + fmt(r ? r.price * n : 0) + '</span></div>';
  }
  function prepBook() {
    if (!$('cin').value) { var d = new Date(); d.setDate(d.getDate() + 2); $('cin').value = iso(d); d.setDate(d.getDate() + 3); $('cout').value = iso(d) }
    $('cin').min = today;
    if (user) {
      if (!$('bName').value) $('bName').value = user.name;
      if (!$('bEmail').value) $('bEmail').value = user.email;
      if (!$('bPhone').value) $('bPhone').value = user.phone || '';
    }
    renderRooms(); renderBanner(); renderSummary();
  }
  function resetBooking() {
    ['bName', 'bEmail', 'bPhone', 'bCnic', 'req'].forEach(function (i) { $(i).value = '' });
    showForm();
  }
  function showForm() {
    document.querySelectorAll('.formpart').forEach(function (e) { e.style.display = '' });
    $('done').style.display = 'none'; $('again').style.display = 'none'; $('step4').classList.add('todo');
  }
  $('typeFilter').addEventListener('change', function () { renderRooms(); renderBanner(); renderSummary() });
  $('cin').addEventListener('change', function () {
    if ($('cout').value && $('cout').value <= $('cin').value) { var d = new Date($('cin').value + 'T00:00:00'); d.setDate(d.getDate() + 1); $('cout').value = iso(d) }
    renderBanner(); renderSummary();
  });
  ['cout', 'guests'].forEach(function (id) { $(id).addEventListener('change', function () { renderBanner(); renderSummary() }) });

  $('confirm').addEventListener('click', function () {
    var ok = mark('b-name', $('bName').value.trim().length >= 3);
    ok = mark('b-phone', /^[0-9+\s-]{10,15}$/.test($('bPhone').value.trim())) && ok;
    ok = mark('b-email', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($('bEmail').value.trim())) && ok;
    ok = mark('b-cnic', /^\d{5}-\d{7}-\d$/.test($('bCnic').value.trim())) && ok;
    ok = mark('b-in', !!$('cin').value) && ok;
    ok = mark('b-out', nights() > 0) && ok;
    if (!selected) ok = false;
    if (!ok) { var b = document.querySelector('#v-book .field.bad'); if (b) b.scrollIntoView({ behavior: 'smooth', block: 'center' }); return }
    $('ref').textContent = 'ZS-' + Math.random().toString(36).slice(2, 8).toUpperCase();
    $('doneMail').textContent = $('bEmail').value;
    document.querySelectorAll('.formpart').forEach(function (e) { e.style.display = 'none' });
    $('done').style.display = 'block'; $('again').style.display = 'block';
    $('step4').classList.remove('todo');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  $('again').addEventListener('click', showForm);

  /* ---------- login / register ---------- */
  $('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    $('loginErr').classList.remove('show'); $('loginOk').classList.remove('show');
    var u = $('lUser').value.trim(), p = $('lPass').value;
    var ok = mark('l-user', !!u); ok = mark('l-pass', !!p) && ok;
    if (!ok) return;
    var f = users.filter(function (x) { return (x.username.toLowerCase() === u.toLowerCase() || x.email.toLowerCase() === u.toLowerCase()) && x.password === p })[0];
    if (!f) { $('loginErr').classList.add('show'); return }
    user = f; renderAuth(); e.target.reset();
    var dest = pending || 'home'; pending = null; go(dest);
  });
  $('regForm').addEventListener('submit', function (e) {
    e.preventDefault();
    $('loginOk').classList.remove('show');
    var email = $('rEmail').value.trim(), pass = $('rPass').value;
    var ok = mark('r-name', $('rName').value.trim().length >= 3);
    ok = mark('r-email', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) && ok;
    ok = mark('r-phone', /^[0-9+\s-]{10,15}$/.test($('rPhone').value.trim())) && ok;
    ok = mark('r-pass', pass.length >= 8) && ok;
    ok = mark('r-conf', pass.length >= 8 && pass === $('rConf').value) && ok;
    if (!ok) return;
    users.push({ username: email, password: pass, name: $('rName').value.trim(), email: email, phone: $('rPhone').value.trim() });
    $('loginOk').classList.add('show'); setTab('login');
    e.target.reset();
    e.target.querySelectorAll('.field').forEach(function (f) { f.classList.remove('bad') });
    $('lUser').value = email;
  });

  function setTab(t) {
    var l = (t === 'login');
    $('tabLogin').setAttribute('aria-selected', l); $('tabReg').setAttribute('aria-selected', !l);
    $('pLogin').hidden = !l; $('pReg').hidden = l;
  }
  $('tabLogin').addEventListener('click', function () { setTab('login') });
  $('tabReg').addEventListener('click', function () { setTab('reg') });
  $('toLogin').addEventListener('click', function () { setTab('login') });
  document.querySelectorAll('.pw button').forEach(function (b) {
    b.addEventListener('click', function () {
      var i = b.previousElementSibling, show = (i.type === 'password');
      i.type = show ? 'text' : 'password'; b.textContent = show ? 'Hide' : 'Show';
    });
  });

  renderAuth();
})();


/* screen 2*/

(function () {
  var $ = function (id) { return document.getElementById(id) };
  /* in-memory demo accounts (no real backend) */
  var users = [{ username: 'zohaib.sadiq', password: 'zest1234' }];

  function mark(id, ok) { $(id).classList.toggle('bad', !ok); return ok }
  function clearBad(form) { form.querySelectorAll('.field').forEach(function (f) { f.classList.remove('bad') }) }

  $('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    $('loginErr').classList.remove('show'); $('loginOk').classList.remove('show');
    var u = $('lUser').value.trim(), p = $('lPass').value;
    var ok = mark('l-user', !!u);
    ok = mark('l-pass', !!p) && ok;
    if (!ok) return;
    var found = users.some(function (x) { return x.username.toLowerCase() === u.toLowerCase() && x.password === p });
    if (found) { $('loginOk').classList.add('show') }
    else { $('loginErr').classList.add('show') }
  });

  $('regForm').addEventListener('submit', function (e) {
    e.preventDefault();
    $('regOk').classList.remove('show');
    var email = $('rEmail').value.trim(), pass = $('rPass').value;
    var ok = mark('r-name', $('rName').value.trim().length >= 3);
    ok = mark('r-email', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) && ok;
    ok = mark('r-phone', /^[0-9+\s-]{10,15}$/.test($('rPhone').value.trim())) && ok;
    ok = mark('r-pass', pass.length >= 8) && ok;
    ok = mark('r-conf', pass.length >= 8 && pass === $('rConf').value) && ok;
    if (!ok) return;
    users.push({ username: email, password: pass });
    $('regOk').classList.add('show');
    e.target.reset(); clearBad(e.target);
    $('lUser').value = email;
  });
})();


/* screen three*/

(function () {
  var rooms = [
    { id: '204', name: 'Room 204 - Deluxe', desc: 'King bed, balcony, 2nd floor', price: 12000 },
    { id: '210', name: 'Room 210 - Deluxe', desc: 'Twin beds, city view, 2nd floor', price: 12000 },
    { id: '305', name: 'Room 305 - Executive suite', desc: 'Living area, 3rd floor', price: 18000 }
  ];
  var selected = '204';
  var $ = function (id) { return document.getElementById(id) };
  var fmt = function (n) { return 'PKR ' + n.toLocaleString('en-US') };
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function dShort(v) { var d = new Date(v + 'T00:00:00'); return d.getDate() + ' ' + months[d.getMonth()] }
  function dLong(v) { var d = new Date(v + 'T00:00:00'); return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear() }
  function nights() {
    if (!$('cin').value || !$('cout').value) return 0;
    var n = Math.round((new Date($('cout').value) - new Date($('cin').value)) / 864e5);
    return n > 0 ? n : 0;
  }

  /* menu */
  var btn = $('menuBtn'), nav = $('nav');
  btn.addEventListener('click', function () { var o = nav.classList.toggle('open'); btn.setAttribute('aria-expanded', o) });

  /* rooms */
  function renderRooms() {
    $('roomList').innerHTML = '';
    rooms.forEach(function (r) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'room' + (r.id === selected ? ' sel' : '');
      b.setAttribute('aria-pressed', r.id === selected);
      b.innerHTML = '<div><h3>' + r.name + '</h3><p>' + r.desc + '</p></div>' +
        '<div class="r"><div class="price">' + fmt(r.price) + '<small>per night</small></div>' +
        '<span class="pick">' + (r.id === selected ? 'Selected' : 'Select') + '</span></div>';
      b.addEventListener('click', function () { selected = r.id; renderRooms(); renderSummary() });
      $('roomList').appendChild(b);
    });
  }

  /* banner + summary */
  function renderBanner() {
    var ok = nights() > 0;
    $('banner').textContent = ok
      ? rooms.length + ' rooms are available for ' + dShort($('cin').value) + ' to ' + dLong($('cout').value) + '.'
      : 'Choose valid check-in and check-out dates to see available rooms.';
  }
  function renderSummary() {
    var r = rooms.filter(function (x) { return x.id === selected })[0], n = nights();
    var row = function (a, b) { return '<div class="sum-row"><span>' + a + '</span><b>' + b + '</b></div>' };
    $('sum').innerHTML =
      row('Room', r.name) +
      row('Dates', n ? dShort($('cin').value) + ' to ' + dShort($('cout').value) : 'Not set') +
      row('Nights', n || '-') +
      row('Guests', $('guests').value) +
      row('Rate', fmt(r.price) + ' / night') +
      '<div class="sum-total"><span>Total</span><span>' + fmt(r.price * n) + '</span></div>';
  }

  /* dates sync */
  var today = new Date().toISOString().split('T')[0];
  $('cin').addEventListener('change', function () {
    if ($('cout').value && $('cout').value <= $('cin').value) { var d = new Date($('cin').value + 'T00:00:00'); d.setDate(d.getDate() + 1); $('cout').value = d.toISOString().split('T')[0] }
    renderBanner(); renderSummary();
  });
  ['cout', 'guests'].forEach(function (id) { $(id).addEventListener('change', function () { renderBanner(); renderSummary() }) });

  /* validation */
  function mark(id, ok) { $(id).classList.toggle('bad', !ok); return ok }
  function validate() {
    var ok = true;
    ok = mark('f-name', $('name').value.trim().length >= 3) && ok;
    ok = mark('f-phone', /^[0-9+\s-]{10,15}$/.test($('phone').value.trim())) && ok;
    ok = mark('f-email', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($('email').value.trim())) && ok;
    ok = mark('f-cnic', /^\d{5}-\d{7}-\d$/.test($('cnic').value.trim())) && ok;
    ok = mark('f-in', !!$('cin').value) && ok;
    ok = mark('f-out', nights() > 0) && ok;
    return ok;
  }

  $('confirm').addEventListener('click', function () {
    if (!validate()) { var b = document.querySelector('.field.bad'); if (b) b.scrollIntoView({ behavior: 'smooth', block: 'center' }); return }
    $('ref').textContent = 'ZS-' + Math.random().toString(36).slice(2, 8).toUpperCase();
    $('doneMail').textContent = $('email').value;
    $('layout').classList.add('is-done');
    document.querySelectorAll('.formpart').forEach(function (e) { e.style.display = 'none' });
    $('done').style.display = 'block'; $('again').style.display = 'block';
    var s = $('step4'); s.classList.remove('todo');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  $('again').addEventListener('click', function () {
    document.querySelectorAll('.formpart').forEach(function (e) { e.style.display = '' });
    $('done').style.display = 'none'; $('again').style.display = 'none';
    $('step4').classList.add('todo');
  });

  renderRooms(); renderBanner(); renderSummary();
})();



/* screen four code */

(function () {
  "use strict";

  /* ---------- Data (replace with API calls to your backend) ---------- */
  var bookings = [
    { id: "RES-1042", room: "204 Deluxe", checkIn: "2026-10-14", checkOut: "2026-10-17", amount: 41760, status: "Confirmed" },
    { id: "RES-0987", room: "112 Standard", checkIn: "2026-09-02", checkOut: "2026-09-04", amount: 18560, status: "Completed" },
    { id: "RES-0950", room: "305 Suite", checkIn: "2026-08-10", checkOut: "2026-08-11", amount: 20880, status: "Cancelled" }
  ];
  var receipts = [
    { id: "REC-5521", bookingId: "RES-1042", date: "2026-10-12", method: "Card", amount: 20000 },
    { id: "REC-4410", bookingId: "RES-0987", date: "2026-09-02", method: "Cash", amount: 18560 }
  ];
  var receiptCounter = 5521;

  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  /* ---------- Helpers ---------- */
  function $(id) { return document.getElementById(id); }
  function pkr(n) { return "PKR " + Number(n).toLocaleString("en-US"); }
  function parts(iso) { var p = iso.split("-"); return { y: +p[0], m: +p[1], d: +p[2] }; }
  function dd(n) { return n < 10 ? "0" + n : "" + n; }
  function dateRange(a, b) {
    var x = parts(a), y = parts(b);
    var left = dd(x.d) + (x.m !== y.m ? " " + MONTHS[x.m - 1] : "");
    return left + " to " + dd(y.d) + " " + MONTHS[y.m - 1];
  }
  function fullDate(iso) { var p = parts(iso); return dd(p.d) + " " + MONTHS[p.m - 1] + " " + p.y; }
  function todayISO() {
    var t = new Date();
    return t.getFullYear() + "-" + dd(t.getMonth() + 1) + "-" + dd(t.getDate());
  }
  function byId(id) { return bookings.filter(function (b) { return b.id === id; })[0]; }
  function paidFor(id) {
    return receipts.filter(function (r) { return r.bookingId === id; })
      .reduce(function (s, r) { return s + r.amount; }, 0);
  }
  function nights(a, b) { return Math.max(1, Math.round((new Date(b) - new Date(a)) / 86400000)); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------- Render bookings ---------- */
  function renderBookings() {
    var html = bookings.map(function (b) {
      var cls = b.status.toLowerCase();
      var actions = "-";
      if (b.status === "Confirmed") {
        actions = '<div class="actions">' +
          '<button class="btn" data-act="update" data-id="' + b.id + '">Update</button>' +
          '<button class="btn danger" data-act="cancel" data-id="' + b.id + '">Cancel</button></div>';
      } else if (b.status === "Completed") {
        actions = '<div class="actions"><button class="btn" data-act="receipt" data-id="' + b.id + '">Receipt</button></div>';
      }
      return "<tr>" +
        '<td data-label="Booking ID">' + b.id + "</td>" +
        '<td data-label="Room">' + esc(b.room) + "</td>" +
        '<td data-label="Dates">' + dateRange(b.checkIn, b.checkOut) + "</td>" +
        '<td data-label="Amount">' + pkr(b.amount) + "</td>" +
        '<td data-label="Status"><span class="badge ' + cls + '">' + b.status + "</span></td>" +
        '<td data-label="Actions">' + actions + "</td></tr>";
    }).join("");
    $("bookingRows").innerHTML = html;
    renderPayBookings();
  }

  function renderPayBookings() {
    var sel = $("payBooking");
    var current = sel.value;
    var payable = bookings.filter(function (b) { return b.status === "Confirmed"; });
    sel.innerHTML = payable.map(function (b) {
      return '<option value="' + b.id + '">' + b.id + " | " + pkr(b.amount) + "</option>";
    }).join("");
    if (!payable.length) {
      sel.innerHTML = '<option value="">No payable bookings</option>';
      $("payBtn").disabled = true;
    } else {
      $("payBtn").disabled = false;
      if (current && byId(current) && byId(current).status === "Confirmed") sel.value = current;
    }
    syncAmount();
  }

  function syncAmount() {
    var b = byId($("payBooking").value);
    $("amount").value = b ? b.amount : "";
  }

  /* ---------- Render receipts ---------- */
  function renderReceipts() {
    var box = $("receiptList");
    if (!receipts.length) {
      box.innerHTML = '<p class="empty">No payments yet. Receipts appear here after you pay.</p>';
      return;
    }
    box.innerHTML = receipts.slice().sort(function (a, b) { return b.id.localeCompare(a.id); })
      .map(function (r) {
        return '<div class="receipt-item"><div><strong>' + r.id + "</strong><small>" +
          fullDate(r.date) + ", " + r.method + '</small></div><div class="amt">' + pkr(r.amount) + "</div></div>";
      }).join("");
  }

  /* ---------- Modal ---------- */
  var lastFocus = null;
  function openModal(html) {
    lastFocus = document.activeElement;
    $("modal").innerHTML = html;
    $("modalBackdrop").hidden = false;
    var first = $("modal").querySelector("input, button");
    if (first) first.focus();
  }
  function closeModal() {
    $("modalBackdrop").hidden = true;
    $("modal").innerHTML = "";
    if (lastFocus) lastFocus.focus();
  }
  $("modalBackdrop").addEventListener("click", function (e) {
    if (e.target === this || e.target.hasAttribute("data-close")) closeModal();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !$("modalBackdrop").hidden) closeModal();
  });

  /* ---------- Update reservation (SRS 3.2.8) ---------- */
  function openUpdate(b) {
    openModal(
      "<h3>Update reservation " + b.id + "</h3>" +
      "<p>" + esc(b.room) + ". Choose your new dates.</p>" +
      '<div class="field"><label for="newIn">Check-in</label><input type="date" id="newIn" min="' + todayISO() + '" value="' + b.checkIn + '"></div>' +
      '<div class="field"><label for="newOut">Check-out</label><input type="date" id="newOut" value="' + b.checkOut + '"></div>' +
      '<div class="err" id="updErr" style="color:#d42626;font-size:12px"></div>' +
      '<div class="btns"><button class="btn" data-close>Keep current dates</button>' +
      '<button class="btn primary" id="saveUpdate">Save changes</button></div>'
    );
    $("saveUpdate").addEventListener("click", function () {
      var a = $("newIn").value, c = $("newOut").value;
      if (!a || !c) { $("updErr").textContent = "Select both dates."; return; }
      if (a < todayISO()) { $("updErr").textContent = "Check-in cannot be in the past."; return; }
      if (c <= a) { $("updErr").textContent = "Check-out must be after check-in."; return; }
      var rate = b.amount / nights(b.checkIn, b.checkOut);
      b.checkIn = a; b.checkOut = c;
      b.amount = Math.round(rate * nights(a, c));
      closeModal();
      renderBookings();
      flashOk("Booking " + b.id + " updated. New total: " + pkr(b.amount) + ".");
    });
  }

  /* ---------- Cancel reservation (SRS 3.2.9) ---------- */
  function openCancel(b) {
    openModal(
      "<h3>Cancel reservation " + b.id + "?</h3>" +
      "<p>" + esc(b.room) + ", " + dateRange(b.checkIn, b.checkOut) + ". This cannot be undone.</p>" +
      '<div class="btns"><button class="btn" data-close>Keep booking</button>' +
      '<button class="btn danger" id="confirmCancel">Cancel booking</button></div>'
    );
    $("confirmCancel").addEventListener("click", function () {
      b.status = "Cancelled";
      closeModal();
      renderBookings();
      flashOk("Booking " + b.id + " cancelled.");
    });
  }

  /* ---------- Receipt view ---------- */
  function openReceipt(b) {
    var list = receipts.filter(function (r) { return r.bookingId === b.id; });
    var rows = list.length ? list.map(function (r) {
      return "<div><span>" + r.id + " (" + fullDate(r.date) + ", " + r.method + ")</span><strong>" + pkr(r.amount) + "</strong></div>";
    }).join("") : "<div><span>No payments recorded</span><strong>-</strong></div>";
    openModal(
      "<h3>Receipt for " + b.id + "</h3>" +
      '<div class="receipt-box">' +
      "<div><span>Room</span><strong>" + esc(b.room) + "</strong></div>" +
      "<div><span>Dates</span><strong>" + dateRange(b.checkIn, b.checkOut) + "</strong></div>" +
      "<div><span>Total</span><strong>" + pkr(b.amount) + "</strong></div><hr>" + rows + "</div>" +
      '<div class="btns"><button class="btn" data-close>Close</button>' +
      '<button class="btn primary" onclick="window.print()">Print</button></div>'
    );
  }

  $("bookingRows").addEventListener("click", function (e) {
    var btn = e.target.closest("button[data-act]");
    if (!btn) return;
    var b = byId(btn.getAttribute("data-id"));
    var act = btn.getAttribute("data-act");
    if (act === "update") openUpdate(b);
    if (act === "cancel") openCancel(b);
    if (act === "receipt") openReceipt(b);
  });

  /* ---------- Payment (SRS 3.2.13) ---------- */
  function flashOk(msg) { $("payFail").hidden = true; $("payOk").textContent = msg; $("payOk").hidden = false; }
  function flashFail(msg) { $("payOk").hidden = true; $("payFail").textContent = msg; $("payFail").hidden = false; }

  function setErr(id, inputId, msg) {
    $(id).textContent = msg || "";
    $(inputId).classList.toggle("invalid", !!msg);
    return !msg;
  }

  function luhn(num) {
    var sum = 0, alt = false;
    for (var i = num.length - 1; i >= 0; i--) {
      var n = +num.charAt(i);
      if (alt) { n *= 2; if (n > 9) n -= 9; }
      sum += n; alt = !alt;
    }
    return sum % 10 === 0;
  }

  function validate() {
    var ok = true;
    if ($("payMethod").value === "Card") {
      var num = $("cardNumber").value.replace(/\s/g, "");
      ok = setErr("cardNumberErr", "cardNumber",
        /^\d{16}$/.test(num) && luhn(num) ? "" : "Enter a valid 16-digit card number.") && ok;

      var m = $("expiry").value.replace(/\s/g, "").match(/^(\d{2})\/(\d{2})$/);
      var expMsg = "Enter expiry as MM / YY.";
      if (m) {
        var mm = +m[1], yy = 2000 + +m[2], now = new Date();
        if (mm < 1 || mm > 12) expMsg = "Month must be 01 to 12.";
        else if (yy < now.getFullYear() || (yy === now.getFullYear() && mm < now.getMonth() + 1)) expMsg = "This card has expired.";
        else expMsg = "";
      }
      ok = setErr("expiryErr", "expiry", expMsg) && ok;
      ok = setErr("cvvErr", "cvv", /^\d{3,4}$/.test($("cvv").value) ? "" : "Enter the 3 or 4 digit CVV.") && ok;
    }
    var amt = Number($("amount").value);
    ok = setErr("amountErr", "amount", amt > 0 ? "" : "Enter an amount greater than 0.") && ok;
    return ok;
  }

  $("payForm").addEventListener("submit", function (e) {
    e.preventDefault();
    $("payOk").hidden = true; $("payFail").hidden = true;

    var b = byId($("payBooking").value);
    if (!b) { flashFail("Payment failed: select a booking to pay."); return; }
    if (!validate()) return;

    var amt = Number($("amount").value);
    // Business rule: amount must match the booking total
    if (amt !== b.amount) {
      flashFail("Payment failed: amount is incorrect. Please check and retry.");
      return;
    }

    receiptCounter += 1;
    var rec = {
      id: "REC-" + receiptCounter, bookingId: b.id, date: todayISO(),
      method: $("payMethod").value, amount: amt
    };
    receipts.push(rec);
    renderReceipts();
    flashOk("Payment received. Receipt " + rec.id + " saved.");
  });

  $("payBooking").addEventListener("change", syncAmount);
  $("payMethod").addEventListener("change", function () {
    $("cardFields").style.display = this.value === "Card" ? "" : "none";
  });
  $("cardNumber").addEventListener("input", function () {
    var v = this.value.replace(/\D/g, "").slice(0, 16);
    this.value = v.replace(/(.{4})/g, "$1 ").trim();
  });
  $("expiry").addEventListener("input", function (e) {
    var v = this.value.replace(/\D/g, "").slice(0, 4);
    if (e.inputType === "deleteContentBackward") { this.value = this.value.replace(/\s*\/?\s*$/, ""); return; }
    this.value = v.length > 2 ? v.slice(0, 2) + " / " + v.slice(2) : v;
  });
  $("cvv").addEventListener("input", function () { this.value = this.value.replace(/\D/g, "").slice(0, 4); });

  /* ---------- Nav ---------- */
  $("menuBtn").addEventListener("click", function () {
    var open = $("navLinks").classList.toggle("open");
    this.setAttribute("aria-expanded", open);
  });
  $("logoutBtn").addEventListener("click", function () {
    if (confirm("Log out of Zest Suites?")) { /* window.location.href = "login.html"; */ }
  });

  /* ---------- Init ---------- */
  renderBookings();
  renderReceipts();
})();




(function () {
  "use strict";

  /* ---------- Data (replace with API calls to your backend) ---------- */
  var menu = [
    { id: "karahi", name: "Chicken karahi", cat: "Food", price: 1800 },
    { id: "sandwich", name: "Club sandwich", cat: "Food", price: 900 },
    { id: "juice", name: "Fresh juice", cat: "Beverage", price: 350 },
    { id: "laundry", name: "Laundry (per item)", cat: "Service", price: 150 }
  ];
  var cart = { karahi: 1, juice: 2 };   // pre-filled as in the design
  var orders = [
    { id: "ORD-311", summary: "Club sandwich", sub: "Delivered by Kamran R. (Attendant)", status: "Delivered" },
    { id: "ORD-312", summary: "Karahi, Juice x2", sub: "Preparing", status: "In progress" }
  ];
  var orderCounter = 312;

  /* ---------- Helpers ---------- */
  function $(id) { return document.getElementById(id); }
  function pkr(n) { return "PKR " + Number(n).toLocaleString("en-US"); }
  function item(id) { return menu.filter(function (m) { return m.id === id; })[0]; }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function cartIds() { return Object.keys(cart).filter(function (k) { return cart[k] > 0; }); }
  function total() {
    return cartIds().reduce(function (s, id) { return s + item(id).price * cart[id]; }, 0);
  }
  function msg(type, text) {
    $("okMsg").hidden = true; $("errMsg").hidden = true;
    if (!type) return;
    var el = type === "ok" ? $("okMsg") : $("errMsg");
    el.textContent = text; el.hidden = false;
  }

  /* ---------- Menu ---------- */
  function renderMenu() {
    $("menuList").innerHTML = menu.map(function (m) {
      return '<div class="menu-item"><div><div class="item-name">' + esc(m.name) + '</div><div class="item-cat">' + m.cat +
        '</div></div><div class="item-right"><span class="price">' + pkr(m.price) +
        '</span><button type="button" class="btn-add" data-add="' + m.id + '" aria-label="Add ' + esc(m.name) + '">Add</button></div></div>';
    }).join("");
  }

  /* ---------- Cart ---------- */
  function renderCart() {
    var ids = cartIds();
    if (!ids.length) {
      $("cartList").innerHTML = '<p class="empty">Your order is empty. Tap Add on any item to start.</p>';
    } else {
      $("cartList").innerHTML = ids.map(function (id) {
        var m = item(id), q = cart[id];
        return '<div class="order-line"><div class="left"><div class="item-name">' + esc(m.name) + " x" + q +
          '</div><div class="item-cat">' + m.cat + '</div>' +
          '<div class="qty"><button type="button" data-dec="' + id + '" aria-label="Remove one ' + esc(m.name) + '">-</button>' +
          '<span>' + q + '</span><button type="button" data-inc="' + id + '" aria-label="Add one ' + esc(m.name) + '">+</button></div></div>' +
          '<div class="line-amt">' + pkr(m.price * q) + "</div></div>";
      }).join("");
    }
    $("totalAmt").textContent = pkr(total());
  }

  $("menuList").addEventListener("click", function (e) {
    var b = e.target.closest("[data-add]");
    if (!b) return;
    var id = b.getAttribute("data-add");
    cart[id] = (cart[id] || 0) + 1;
    msg();
    renderCart();
  });
  $("cartList").addEventListener("click", function (e) {
    var inc = e.target.closest("[data-inc]"), dec = e.target.closest("[data-dec]");
    if (inc) cart[inc.getAttribute("data-inc")] += 1;
    if (dec) {
      var id = dec.getAttribute("data-dec");
      cart[id] -= 1;
      if (cart[id] <= 0) delete cart[id];
    }
    if (inc || dec) { msg(); renderCart(); }
  });

  /* ---------- Place order ---------- */
  function shortName(id) {
    return { karahi: "Karahi", sandwich: "Club sandwich", juice: "Juice", laundry: "Laundry" }[id];
  }
  $("placeBtn").addEventListener("click", function () {
    var ids = cartIds();
    if (!ids.length) { msg("err", "Add at least one item before placing your order."); return; }
    if (!$("room").value) { msg("err", "Select the room for delivery."); return; }

    orderCounter += 1;
    var summary = ids.map(function (id) { return shortName(id) + (cart[id] > 1 ? " x" + cart[id] : ""); }).join(", ");
    var o = { id: "ORD-" + orderCounter, summary: summary, sub: "Preparing", status: "In progress", note: $("note").value.trim() };
    var orderTotal = total();
    orders.push(o);
    cart = {};
    renderCart();
    renderStatus();
    msg("ok", "Order " + o.id + " placed. Total " + pkr(orderTotal) + " will be charged to your room bill.");
  });

  /* ---------- Status ---------- */
  function renderStatus() {
    $("statusList").innerHTML = orders.slice().sort(function (a, b) { return a.id.localeCompare(b.id); })
      .map(function (o) {
        var cls = o.status === "Delivered" ? "delivered" : "progress";
        return '<div class="status-item"><div><strong>' + o.id + " " + esc(o.summary) + "</strong><small>" +
          esc(o.sub) + '</small></div><span class="badge ' + cls + '">' + o.status + "</span></div>";
      }).join("");
  }

  /* ---------- Nav ---------- */
  $("menuBtn").addEventListener("click", function () {
    var open = $("navLinks").classList.toggle("open");
    this.setAttribute("aria-expanded", open);
  });
  $("logoutBtn").addEventListener("click", function () {
    if (confirm("Log out of Zest Suites?")) { /* window.location.href = "login.html"; */ }
  });

  /* ---------- Init ---------- */
  renderMenu();
  renderCart();
  renderStatus();
})();




/* screen no 6*/


(function () {
  "use strict";

  function $(id) { return document.getElementById(id); }
  var rating = 4;   // pre-filled as in the design
  var LABELS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

  /* ---------- Stars ---------- */
  function renderStars() {
    var html = "";
    for (var i = 1; i <= 5; i++) {
      html += '<button type="button" class="star' + (i <= rating ? " on" : "") + '" role="radio" ' +
        'aria-checked="' + (i === rating) + '" aria-label="' + i + (i === 1 ? " star" : " stars") + '" data-v="' + i + '">&#9733;</button>';
    }
    $("stars").innerHTML = html;
    $("ratingText").textContent = rating ? LABELS[rating] : "";
  }
  $("stars").addEventListener("click", function (e) {
    var b = e.target.closest("[data-v]");
    if (!b) return;
    rating = +b.getAttribute("data-v");
    $("ratingErr").hidden = true;
    renderStars();
    var again = $("stars").querySelector('[data-v="' + rating + '"]');
    if (again) again.focus();
  });
  $("stars").addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") rating = Math.min(5, (rating || 0) + 1);
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") rating = Math.max(1, (rating || 2) - 1);
    else return;
    e.preventDefault();
    renderStars();
    $("stars").querySelector('[data-v="' + rating + '"]').focus();
  });

  /* ---------- Char counter ---------- */
  function updateCount() { $("charCount").textContent = $("comments").value.length; }
  $("comments").addEventListener("input", function () { updateCount(); $("commentErr").hidden = true; this.classList.remove("invalid"); $("okMsg").hidden = true; });
  $("guestName").addEventListener("input", function () { $("nameErr").hidden = true; this.classList.remove("invalid"); $("okMsg").hidden = true; });

  /* ---------- Submit (SRS 3.2.20) ---------- */
  $("fbForm").addEventListener("submit", function (e) {
    e.preventDefault();
    $("okMsg").hidden = true;

    var name = $("guestName").value.trim();
    var comments = $("comments").value.trim();
    var ok = true;

    $("nameErr").hidden = !!name;
    $("guestName").classList.toggle("invalid", !name);
    if (!name) ok = false;

    $("ratingErr").hidden = rating > 0;
    if (!rating) ok = false;

    $("commentErr").hidden = !!comments;
    $("comments").classList.toggle("invalid", !comments);
    if (!comments) ok = false;

    if (!ok) {
      var firstBad = document.querySelector(".invalid, #ratingErr:not([hidden])");
      if (!name) $("guestName").focus(); else if (!comments) $("comments").focus();
      return;
    }

    // TODO: send to backend, e.g.
    // fetch("/api/feedback", { method: "POST", headers: {"Content-Type": "application/json"},
    //   body: JSON.stringify({ guestName: name, rating: rating, comments: comments }) })
    var btn = $("submitBtn");
    btn.disabled = true;
    setTimeout(function () {
      btn.disabled = false;
      $("okMsg").hidden = false;
    }, 400);
  });

  /* ---------- Nav ---------- */
  $("menuBtn").addEventListener("click", function () {
    var open = $("navLinks").classList.toggle("open");
    this.setAttribute("aria-expanded", open);
  });
  $("logoutBtn").addEventListener("click", function () {
    if (confirm("Log out of Zest Suites?")) { /* window.location.href = "login.html"; */ }
  });

  renderStars();
  updateCount();
})();




(function () {
  "use strict";

  /* ---------- Data (replace with API calls to your backend) ---------- */
  var rooms = {};      // number -> { type, rate, status }
  var statusFloor1 = {
    101: "occupied", 102: "available", 103: "occupied", 104: "occupied", 105: "cleaning", 106: "occupied", 107: "cleaning",
    108: "available", 109: "occupied", 110: "occupied", 111: "occupied", 112: "available", 113: "cleaning", 114: "available",
    115: "available", 116: "occupied", 117: "occupied", 118: "occupied", 119: "maintenance", 120: "available"
  };
  Object.keys(statusFloor1).forEach(function (n) { rooms[n] = { type: "Standard", rate: 8000, status: statusFloor1[n] }; });
  rooms[204] = { type: "Deluxe", rate: 12000, status: "available" };
  rooms[210] = { type: "Deluxe", rate: 12000, status: "available" };
  rooms[216] = { type: "Deluxe", rate: 12000, status: "cleaning" };
  rooms[305] = { type: "Suite", rate: 20000, status: "available" };
  rooms[310] = { type: "Suite", rate: 20000, status: "available" };

  var arrivals = [
    { name: "Daniel Reed", ref: "RES-1101", room: 310, time: "2:00 pm", done: false },
    { name: "Imran Shah", ref: "RES-1102", room: 112, time: "3:30 pm", done: false },
    { name: "Nadia Ali", ref: "RES-1103", room: 405, time: "5:00 pm", done: false }
  ];
  var departures = [
    { name: "Omar Farooq", ref: "RES-1090", room: 402, due: 32000, done: false },
    { name: "Sara Malik", ref: "RES-1085", room: 108, due: 0, done: false }
  ];
  var selected = 103;

  /* ---------- Helpers ---------- */
  function $(id) { return document.getElementById(id); }
  function pkr(n) { return "PKR " + Number(n).toLocaleString("en-US"); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  var toastTimer;
  function toast(t) {
    var el = $("toast"); el.textContent = t; el.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { el.hidden = true; }, 3200);
  }
  function setRoom(n, status) { if (rooms[n]) rooms[n].status = status; }

  /* ---------- Room availability search ---------- */
  function renderAvail() {
    var type = $("roomType").value;
    var list = Object.keys(rooms).filter(function (n) { return rooms[n].type === type; });
    if (!list.length) { $("availRows").innerHTML = '<tr><td colspan="4" class="empty">No rooms of this type.</td></tr>'; return; }
    $("availRows").innerHTML = list.slice(0, 8).map(function (n) {
      var r = rooms[n];
      return "<tr><td data-label=\"Room\">" + n + "</td><td data-label=\"Type\">" + r.type + "</td><td data-label=\"Rate\">" + pkr(r.rate) +
        '</td><td data-label="Status"><span class="badge ' + r.status + '">' + cap(r.status) + "</span></td></tr>";
    }).join("");
  }
  $("availForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var a = $("checkIn").value, b = $("checkOut").value, err = $("availErr");
    err.hidden = true;
    $("checkIn").classList.remove("invalid"); $("checkOut").classList.remove("invalid");
    if ((a && !b) || (!a && b)) {
      err.textContent = "Enter both check-in and check-out dates, or leave both empty."; err.hidden = false;
      (a ? $("checkOut") : $("checkIn")).classList.add("invalid"); return;
    }
    if (a && b && b <= a) {
      err.textContent = "Check-out must be after check-in."; err.hidden = false; $("checkOut").classList.add("invalid"); return;
    }
    renderAvail();
  });
  $("roomType").addEventListener("change", renderAvail);

  /* ---------- Tiles ---------- */
  function renderTiles() {
    var html = "";
    for (var n = 101; n <= 120; n++) {
      var r = rooms[n];
      html += '<button type="button" class="tile ' + r.status + (n === selected ? " selected" : "") +
        '" data-room="' + n + '" aria-label="Room ' + n + ', ' + r.status + '">' + n + "</button>";
    }
    $("tiles").innerHTML = html;
    if (rooms[selected]) {
      $("selBox").hidden = false; $("selRoom").textContent = selected; $("selStatus").value = rooms[selected].status;
    }
  }
  $("tiles").addEventListener("click", function (e) {
    var t = e.target.closest("[data-room]"); if (!t) return;
    selected = +t.getAttribute("data-room"); renderTiles();
  });
  $("selStatus").addEventListener("change", function () {
    setRoom(selected, this.value); renderAll(); toast("Room " + selected + " set to " + this.value + ".");
  });

  /* ---------- Arrivals / departures ---------- */
  function matches(g, q) {
    q = q.trim().toLowerCase();
    return !q || g.name.toLowerCase().indexOf(q) > -1 || g.ref.toLowerCase().indexOf(q) > -1 || String(g.room).indexOf(q) > -1;
  }
  function renderArrivals() {
    var q = $("guestSearch").value;
    var list = arrivals.filter(function (g) { return matches(g, q); });
    $("arrRows").innerHTML = list.length ? list.map(function (g) {
      var idx = arrivals.indexOf(g);
      return "<tr><td data-label=\"Guest\">" + esc(g.name) + "</td><td data-label=\"Room\">" + g.room + "</td><td data-label=\"Time\">" + g.time +
        '</td><td data-label="">' + (g.done ? '<span class="badge done">Checked in</span>' :
          '<button class="btn-sm" data-in="' + idx + '">Check in</button>') + "</td></tr>";
    }).join("") : '<tr><td colspan="4" class="empty">No arrivals match your search.</td></tr>';
  }
  function renderDepartures() {
    var q = $("guestSearch").value;
    var list = departures.filter(function (g) { return matches(g, q); });
    $("depRows").innerHTML = list.length ? list.map(function (g) {
      var idx = departures.indexOf(g);
      var bill = g.due > 0 ? '<span class="badge due">' + pkr(g.due) + " due</span>" : '<span class="badge paid">Paid</span>';
      return "<tr><td data-label=\"Guest\">" + esc(g.name) + "</td><td data-label=\"Room\">" + g.room + "</td><td data-label=\"Bill\">" + bill +
        '</td><td data-label="">' + (g.done ? '<span class="badge done">Checked out</span>' :
          '<button class="btn-sm" data-out="' + idx + '">Check out</button>') + "</td></tr>";
    }).join("") : '<tr><td colspan="4" class="empty">No departures match your search.</td></tr>';
  }
  $("arrRows").addEventListener("click", function (e) {
    var b = e.target.closest("[data-in]"); if (!b) return;
    var g = arrivals[+b.getAttribute("data-in")];
    var r = rooms[g.room];
    if (r && (r.status === "occupied" || r.status === "maintenance" || r.status === "cleaning")) {
      toast("Room " + g.room + " is " + r.status + ". Choose another room before check-in."); return;
    }
    g.done = true; setRoom(g.room, "occupied"); renderAll(); toast(g.name + " checked in to room " + g.room + ".");
  });
  $("depRows").addEventListener("click", function (e) {
    var b = e.target.closest("[data-out]"); if (!b) return;
    var g = departures[+b.getAttribute("data-out")];
    if (g.due > 0) { toast("Collect " + pkr(g.due) + " from " + g.name + " before check-out."); openPayment(); return; }
    g.done = true; setRoom(g.room, "cleaning"); renderAll(); toast(g.name + " checked out. Room " + g.room + " marked for cleaning.");
  });
  $("guestSearch").addEventListener("input", function () { renderArrivals(); renderDepartures(); });

  /* ---------- Modals ---------- */
  var lastFocus = null;
  function openModal(html) {
    lastFocus = document.activeElement;
    $("modal").innerHTML = html; $("backdrop").hidden = false;
    var f = $("modal").querySelector("input, button, select"); if (f) f.focus();
  }
  function closeModal() { $("backdrop").hidden = true; $("modal").innerHTML = ""; if (lastFocus) lastFocus.focus(); }
  $("backdrop").addEventListener("click", function (e) { if (e.target === this || e.target.hasAttribute("data-close")) closeModal(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !$("backdrop").hidden) closeModal(); });

  function openPayment() {
    var dues = departures.filter(function (g) { return g.due > 0; });
    openModal("<h3>Collect payment</h3>" + (dues.length ? dues.map(function (g) {
      var i = departures.indexOf(g);
      return '<div class="due-line"><span>' + esc(g.name) + " (room " + g.room + ")<br><strong>" + pkr(g.due) +
        '</strong></span><button class="btn-sm" data-pay="' + i + '">Mark as paid</button></div>';
    }).join("") : '<p class="empty">No outstanding bills.</p>') +
      '<div class="btns"><button class="btn-plain" data-close>Close</button></div>');
  }
  $("modal").addEventListener("click", function (e) {
    var p = e.target.closest("[data-pay]"); if (!p) return;
    var g = departures[+p.getAttribute("data-pay")];
    var amt = g.due; g.due = 0; renderDepartures(); openPayment(); toast(pkr(amt) + " received from " + g.name + ".");
  });

  function openNewReservation() {
    openModal('<h3>New reservation</h3>' +
      '<div class="field"><label for="nrName">Guest name</label><input id="nrName" type="text"></div>' +
      '<div class="row-2"><div class="field"><label for="nrIn">Check-in</label><input id="nrIn" type="date"></div>' +
      '<div class="field"><label for="nrOut">Check-out</label><input id="nrOut" type="date"></div></div>' +
      '<div class="field"><label for="nrType">Room type</label><select id="nrType"><option>Deluxe</option><option>Standard</option><option>Suite</option></select></div>' +
      '<div class="msg err" id="nrErr" hidden></div>' +
      '<div class="btns"><button class="btn-plain" data-close>Cancel</button><button class="btn-orange" id="nrSave" type="button">Create reservation</button></div>');
    $("nrSave").addEventListener("click", function () {
      var n = $("nrName").value.trim(), a = $("nrIn").value, b = $("nrOut").value, er = $("nrErr");
      var msg = !n ? "Guest name is required." : (!a || !b) ? "Select both dates." : (b <= a) ? "Check-out must be after check-in." : "";
      if (msg) { er.textContent = msg; er.hidden = false; return; }
      var avail = Object.keys(rooms).filter(function (k) { return rooms[k].type === $("nrType").value && rooms[k].status === "available"; })[0];
      if (!avail) { er.textContent = "No available " + $("nrType").value + " rooms."; er.hidden = false; return; }
      closeModal(); toast("Reservation created for " + n + " in room " + avail + ".");
    });
  }

  $("qNew").addEventListener("click", openNewReservation);
  $("qPay").addEventListener("click", openPayment);
  $("qIn").addEventListener("click", function () { $("arrivalsCard").scrollIntoView({ behavior: "smooth", block: "center" }); });
  $("qOut").addEventListener("click", function () { $("depCard").scrollIntoView({ behavior: "smooth", block: "center" }); });

  /* ---------- Nav ---------- */
  $("menuBtn").addEventListener("click", function () {
    var open = $("nav").classList.toggle("open"); this.setAttribute("aria-expanded", open);
  });
  $("logout").addEventListener("click", function (e) {
    e.preventDefault(); if (confirm("Log out of Zest Suites?")) { /* window.location.href = "login.html"; */ }
  });

  function renderAll() { renderAvail(); renderTiles(); renderArrivals(); renderDepartures(); }
  renderAll();
})();





(function () {
  "use strict";

  /* ---------- Data (replace with API calls to your backend) ---------- */
  var roomsByType = {
    Standard: [101, 102, 105, 108, 112, 115],
    Deluxe: [204, 210, 216],
    Suite: [305, 310]
  };
  var bookings = [
    { id: "RES-1042", guest: "Ayesha Khan", phone: "0300 1112233", cnic: "35202-1112233-1", room: 204, type: "Deluxe", inD: "2026-10-14", outD: "2026-10-17", status: "Confirmed" },
    { id: "RES-1043", guest: "Daniel Reed", phone: "0333 4445566", cnic: "35201-4445566-3", room: 310, type: "Suite", inD: "2026-10-12", outD: "2026-10-15", status: "Checked in" },
    { id: "RES-1044", guest: "Imran Shah", phone: "0345 9998877", cnic: "35202-9998877-5", room: 112, type: "Standard", inD: "2026-10-12", outD: "2026-10-13", status: "Confirmed" },
    { id: "RES-1040", guest: "Maryam Tariq", phone: "0312 5556677", cnic: "35203-5556677-2", room: 105, type: "Standard", inD: "2026-10-10", outD: "2026-10-12", status: "Confirmed" }
  ];
  var counter = 1044;
  var editingId = null;
  var pendingCancel = null;

  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  /* ---------- Helpers ---------- */
  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function fmt(iso) { var p = iso.split("-"); return p[2] + " " + MONTHS[+p[1] - 1]; }
  function find(id) { return bookings.filter(function (b) { return b.id === id; })[0]; }
  var toastTimer;
  function toast(t) {
    var el = $("toast"); el.textContent = t; el.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { el.hidden = true; }, 3200);
  }

  /* ---------- Table ---------- */
  function renderRows() {
    var q = $("q").value.trim().toLowerCase();
    var list = bookings.filter(function (b) {
      return !q || b.id.toLowerCase().indexOf(q) > -1 || b.guest.toLowerCase().indexOf(q) > -1 || String(b.room).indexOf(q) > -1;
    });
    if (!list.length) { $("rows").innerHTML = '<tr><td colspan="7" class="empty">No reservations match your search.</td></tr>'; return; }
    $("rows").innerHTML = list.map(function (b) {
      var cls = b.status.toLowerCase().replace(" ", "-");
      var act = "-";
      if (b.status === "Confirmed") {
        act = '<div class="actions"><button class="btn-sm" data-edit="' + b.id + '">Update</button>' +
          '<button class="btn-sm danger" data-cancel="' + b.id + '">Cancel</button></div>';
      } else if (b.status === "Checked in") {
        act = '<div class="actions"><button class="btn-sm" data-edit="' + b.id + '">Update</button></div>';
      }
      return "<tr>" +
        '<td data-label="Booking ID">' + b.id + "</td>" +
        '<td data-label="Guest">' + esc(b.guest) + "</td>" +
        '<td data-label="Room">' + b.room + "</td>" +
        '<td data-label="Check-in">' + fmt(b.inD) + "</td>" +
        '<td data-label="Check-out">' + fmt(b.outD) + "</td>" +
        '<td data-label="Status"><span class="badge ' + cls + '">' + b.status + "</span></td>" +
        '<td data-label="Actions">' + act + "</td></tr>";
    }).join("");
  }
  $("q").addEventListener("input", renderRows);
  $("searchBtn").addEventListener("click", renderRows);
  $("q").addEventListener("keydown", function (e) { if (e.key === "Enter") renderRows(); });

  /* ---------- Room dropdown ---------- */
  function fillRooms(selected) {
    var list = roomsByType[$("type").value] || [];
    $("room").innerHTML = list.map(function (n) { return "<option>" + n + "</option>"; }).join("");
    if (selected) $("room").value = String(selected);
  }
  $("type").addEventListener("change", function () { fillRooms(); hideMsgs(); });

  /* ---------- Form helpers ---------- */
  function hideMsgs() { $("warnMsg").hidden = true; $("okMsg").hidden = true; }
  function setErr(hintId, inputId, msg) {
    $(hintId).textContent = msg || "";
    $(inputId).classList.toggle("invalid", !!msg);
    return !msg;
  }
  function clearErrs() {
    [["guestErr", "guest"], ["phoneErr", "phone"], ["cnicErr", "cnic"], ["inErr", "inDate"], ["outErr", "outDate"]]
      .forEach(function (p) { setErr(p[0], p[1], ""); });
  }
  function resetForm() {
    editingId = null; clearErrs(); hideMsgs();
    $("guest").value = ""; $("phone").value = ""; $("cnic").value = ""; $("inDate").value = ""; $("outDate").value = "";
    $("type").value = "Standard"; fillRooms();
    $("saveBtn").textContent = "Create reservation"; $("cancelEdit").hidden = true;
  }

  $("phone").addEventListener("input", function () {
    var d = this.value.replace(/\D/g, "").slice(0, 11);
    this.value = d.length > 4 ? d.slice(0, 4) + " " + d.slice(4) : d;
  });
  $("cnic").addEventListener("input", function () {
    var d = this.value.replace(/\D/g, "").slice(0, 13), out = d;
    if (d.length > 5) out = d.slice(0, 5) + "-" + d.slice(5);
    if (d.length > 12) out = d.slice(0, 5) + "-" + d.slice(5, 12) + "-" + d.slice(12);
    this.value = out;
  });

  /* ---------- Create / update (SRS 3.2.7, 3.2.8) ---------- */
  function overlaps(room, a, b, ignoreId) {
    return bookings.filter(function (x) {
      return x.id !== ignoreId && x.room === room && x.status !== "Cancelled" && a < x.outD && b > x.inD;
    })[0];
  }

  $("form").addEventListener("submit", function (e) {
    e.preventDefault(); hideMsgs();
    var guest = $("guest").value.trim();
    var phone = $("phone").value.replace(/\D/g, "");
    var cnic = $("cnic").value.replace(/\D/g, "");
    var a = $("inDate").value, b = $("outDate").value;

    var ok = true;
    ok = setErr("guestErr", "guest", guest ? "" : "Guest name is required.") && ok;
    ok = setErr("phoneErr", "phone", /^03\d{9}$/.test(phone) ? "" : "Enter an 11-digit number starting with 03.") && ok;
    ok = setErr("cnicErr", "cnic", cnic.length === 13 ? "" : "Enter a 13-digit CNIC.") && ok;
    ok = setErr("inErr", "inDate", a ? "" : "Select check-in date.") && ok;
    var outMsg = !b ? "Select check-out date." : (a && b <= a) ? "Check-out must be after check-in." : "";
    ok = setErr("outErr", "outDate", outMsg) && ok;
    if (!ok) return;

    var room = +$("room").value;
    var clash = overlaps(room, a, b, editingId);
    if (clash) {
      $("warnMsg").textContent = "Room " + room + " is already booked for these dates. Duplicate reservation prevented.";
      $("warnMsg").hidden = false; return;
    }

    var phoneFmt = phone.slice(0, 4) + " " + phone.slice(4);
    var cnicFmt = cnic.slice(0, 5) + "-" + cnic.slice(5, 12) + "-" + cnic.slice(12);

    if (editingId) {
      var bk = find(editingId);
      bk.guest = guest; bk.phone = phoneFmt; bk.cnic = cnicFmt; bk.room = room;
      bk.type = $("type").value; bk.inD = a; bk.outD = b;
      $("okMsg").textContent = "Reservation " + bk.id + " updated.";
      $("okMsg").hidden = false;
      var id = editingId;
      editingId = null; $("saveBtn").textContent = "Create reservation"; $("cancelEdit").hidden = true;
      renderRows(); toast("Reservation " + id + " updated.");
    } else {
      counter += 1;
      var nb = { id: "RES-" + counter, guest: guest, phone: phoneFmt, cnic: cnicFmt, room: room, type: $("type").value, inD: a, outD: b, status: "Confirmed" };
      bookings.push(nb);
      $("okMsg").textContent = "Reservation " + nb.id + " created for " + guest + " in room " + room + ".";
      $("okMsg").hidden = false;
      renderRows();
    }
  });

  /* ---------- Row actions ---------- */
  $("rows").addEventListener("click", function (e) {
    var ed = e.target.closest("[data-edit]"), cn = e.target.closest("[data-cancel]");
    if (ed) {
      var b = find(ed.getAttribute("data-edit"));
      editingId = b.id; clearErrs(); hideMsgs();
      $("guest").value = b.guest; $("phone").value = b.phone; $("cnic").value = b.cnic;
      $("inDate").value = b.inD; $("outDate").value = b.outD;
      $("type").value = b.type; fillRooms(b.room);
      $("saveBtn").textContent = "Save changes"; $("cancelEdit").hidden = false;
      $("guest").focus();
      if (window.matchMedia("(max-width: 1050px)").matches) $("form").scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (cn) openCancel(find(cn.getAttribute("data-cancel")));
  });
  $("cancelEdit").addEventListener("click", resetForm);
  $("newBtn").addEventListener("click", function () { resetForm(); $("guest").focus(); });

  /* ---------- Cancel confirmation (SRS 3.2.9, SDD 6.3.7) ---------- */
  var lastFocus = null;
  function openCancel(b) {
    pendingCancel = b; lastFocus = document.activeElement;
    $("modal").innerHTML =
      '<h3 id="mTitle">Cancel reservation ' + b.id + '?</h3>' +
      '<p>This will release Room ' + b.room + ' and update its status to Available. This action cannot be undone.</p>' +
      '<div class="btns"><button class="btn-sm" data-close type="button">Keep booking</button>' +
      '<button class="btn-sm danger" id="yesCancel" type="button">Yes, cancel</button></div>';
    $("backdrop").hidden = false;
    $("modal").querySelector("[data-close]").focus();
  }
  function closeModal() { $("backdrop").hidden = true; $("modal").innerHTML = ""; pendingCancel = null; if (lastFocus) lastFocus.focus(); }
  $("backdrop").addEventListener("click", function (e) {
    if (e.target === this || e.target.hasAttribute("data-close")) { closeModal(); return; }
    if (e.target.id === "yesCancel" && pendingCancel) {
      var b = pendingCancel; b.status = "Cancelled";
      if (editingId === b.id) resetForm();
      closeModal(); renderRows(); toast("Reservation " + b.id + " cancelled. Room " + b.room + " is now Available.");
    }
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !$("backdrop").hidden) closeModal(); });

  /* ---------- Nav ---------- */
  $("menuBtn").addEventListener("click", function () {
    var open = $("nav").classList.toggle("open"); this.setAttribute("aria-expanded", open);
  });
  $("logout").addEventListener("click", function (e) {
    e.preventDefault(); if (confirm("Log out of Zest Suites?")) { /* window.location.href = "login.html"; */ }
  });

  fillRooms(105);
  renderRows();
})();





const $ = id => document.getElementById(id), f = n => n.toLocaleString("en-US");
const sub = 36000 + 2450 + 600, dis = Math.round(sub * .1), tax = Math.round((sub - dis) * .16), tot = sub - dis + tax;
let checked = false;
function calc() {
  const a = +$("adv").value, bal = tot - (checked ? a : +$("adv").value);
  $("sub").textContent = "PKR " + f(sub); $("dis").textContent = "- PKR " + f(dis); $("tax").textContent = "PKR " + f(tax);
  $("tot").textContent = "PKR " + f(tot); $("advp").textContent = "- PKR " + f(a); $("bal").textContent = "PKR " + f(bal); return bal
}
$("adv").onchange = () => { $("amt").value = calc() };
$("amt").value = calc();
$("ci").onclick = () => {
  if ($("cnic").value !== "Yes") { const m = $("ciMsg"); m.className = "msg warn show"; m.textContent = "Verify the guest's CNIC before checking in."; return }
  checked = true; const m = $("ciMsg"); m.className = "msg ok show"; m.textContent = "Reservation verified. Room 204 will be marked Occupied.";
  $("coMsg").className = "msg warn show";
};
$("pay").onclick = () => {
  const bal = calc(), got = +$("amt").value || 0;
  if (got < bal) { const m = $("payMsg"); m.className = "msg warn show"; m.textContent = "Amount received is PKR " + f(bal - got) + " short of the balance due."; return }
  $("st").textContent = "Paid"; $("st").className = "pill paid";
  const m = $("payMsg"); m.className = "msg ok show"; m.textContent = "Payment recorded. Room 204 will be marked Cleaning.";
  $("coMsg").className = "msg ok show"; $("coMsg").textContent = "Checked out. Bill INV-2207 is closed.";
};
const side = $("side"), sc = $("scrim"), bg = $("burger");
function tog(o) { side.classList.toggle("open", o); sc.classList.toggle("show", o); bg.setAttribute("aria-expanded", o) }
bg.onclick = () => tog(!side.classList.contains("open")); sc.onclick = () => tog(false);



(function () {
  var $ = function (i) { return document.getElementById(i) };

  /* error-state email field validates live */
  var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  $('t3').addEventListener('input', function () { $('t3w').classList.toggle('bad', !re.test(this.value.trim())) });

  /* dropdown: list and select stay in sync */
  var rt = $('rt'), menu = $('menu');
  function drawMenu() {
    menu.innerHTML = '';
    Array.prototype.forEach.call(rt.options, function (o) {
      var b = document.createElement('button');
      b.type = 'button'; b.textContent = o.text; b.setAttribute('role', 'option');
      b.setAttribute('aria-selected', o.selected);
      if (o.selected) b.className = 'on';
      b.addEventListener('click', function () { rt.value = o.value; drawMenu() });
      menu.appendChild(b);
    });
  }
  rt.addEventListener('change', drawMenu); drawMenu();

  /* navigation menu */
  $('nav').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    Array.prototype.forEach.call($('nav').children, function (x) { x.classList.toggle('on', x === b) });
  });

  /* date picker with range selection */
  var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var short = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var today = new Date(); today.setHours(0, 0, 0, 0);
  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x }
  var minMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  var view = new Date(minMonth);
  var start = addDays(today, 2), end = addDays(today, 5);
  function same(a, b) { return a && b && a.getTime() === b.getTime() }
  function label(d) { return d.getDate() + ' ' + short[d.getMonth()] + ' ' + d.getFullYear() }

  function drawCal() {
    $('calTitle').textContent = months[view.getMonth()] + ' ' + view.getFullYear();
    $('prev').disabled = (view <= minMonth);
    var g = $('cal'); g.innerHTML = '';
    ['M', 'T', 'W', 'T', 'F', 'S', 'S'].forEach(function (h) { var s = document.createElement('div'); s.className = 'h'; s.textContent = h; g.appendChild(s) });
    var offset = (view.getDay() + 6) % 7, days = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
    for (var i = 0; i < offset; i++) { var e = document.createElement('div'); e.className = 'e'; g.appendChild(e) }
    for (var n = 1; n <= days; n++) {
      (function (n) {
        var d = new Date(view.getFullYear(), view.getMonth(), n), b = document.createElement('button');
        b.type = 'button'; b.className = 'd'; b.textContent = n;
        if (d < today) b.disabled = true;
        if (same(d, start) || same(d, end)) b.classList.add('sel');
        else if (start && end && d > start && d < end) b.classList.add('rng');
        b.addEventListener('click', function () {
          if (!start || (start && end)) { start = d; end = null }
          else if (d > start) { end = d }
          else { start = d }
          drawCal();
        });
        g.appendChild(b);
      })(n);
    }
    if (start && end) {
      var nights = Math.round((end - start) / 864e5);
      $('calSum').textContent = label(start) + ' to ' + label(end) + ' (' + nights + ' night' + (nights > 1 ? 's' : '') + ')';
    } else if (start) {
      $('calSum').textContent = 'Check-in ' + label(start) + '. Pick a check-out date.';
    }
  }
  $('prev').addEventListener('click', function () { view = new Date(view.getFullYear(), view.getMonth() - 1, 1); drawCal() });
  $('next').addEventListener('click', function () { view = new Date(view.getFullYear(), view.getMonth() + 1, 1); drawCal() });
  drawCal();

  /* confirmation dialog */
  $('stay').addEventListener('click', function () { $('dres').textContent = 'You are still logged in.' });
  $('out').addEventListener('click', function () { $('dres').textContent = 'Logged out. Redirecting to the login page (demo).' });
})();



(function () {
  var $ = function (i) { return document.getElementById(i) };
  var num = function (n) { return n.toLocaleString('en-US') };
  function setAlert(el, kind, text) { el.className = 'alert show ' + kind; el.textContent = text }
  function mark(id, ok) { $(id).classList.toggle('bad', !ok); return ok }

  /* ---------- discounts ---------- */
  var discounts = [
    { name: 'Early booking', type: 'Percentage', value: 10, applies: '3 days in advance', active: true },
    { name: 'Long stay', type: 'Percentage', value: 15, applies: '5 nights or more', active: true },
    { name: 'Loyalty card', type: 'Fixed', value: 1000, applies: 'Repeat guests', active: false }
  ];
  function drawTable() {
    var tb = $('dBody'); tb.innerHTML = '';
    discounts.forEach(function (d, i) {
      var tr = document.createElement('tr');
      tr.innerHTML = '<td data-l="Discount">' + d.name + '</td><td data-l="Type">' + d.type + '</td>' +
        '<td data-l="Value">' + (d.type === 'Percentage' ? d.value + '%' : 'PKR ' + num(d.value)) + '</td>' +
        '<td data-l="Applies to">' + d.applies + '</td>' +
        '<td data-l="Status"><button class="pill ' + (d.active ? 'ok' : 'warn') + '" type="button" data-i="' + i + '" aria-label="Toggle status for ' + d.name + '">' + (d.active ? 'Active' : 'Paused') + '</button></td>';
      tb.appendChild(tr);
    });
  }
  $('dBody').addEventListener('click', function (e) {
    var b = e.target.closest('[data-i]'); if (!b) return;
    var d = discounts[parseInt(b.dataset.i, 10)]; d.active = !d.active; drawTable();
  });
  $('dType').addEventListener('change', function () {
    $('dValL').textContent = this.value === 'Percentage' ? 'Value (%)' : 'Value (PKR)';
  });
  $('dForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var el = $('dMsg'), name = $('dName').value.trim(), type = $('dType').value;
    var raw = $('dVal').value.trim(), val = Number(raw);
    var okName = mark('f-name', name.length >= 2);
    var valid = raw !== '' && isFinite(val) && (type === 'Percentage' ? (val >= 1 && val <= 100) : val > 0);
    mark('f-val', valid);
    if (!okName) { setAlert(el, 'err', 'Enter a discount name.'); return }
    if (!valid) { setAlert(el, 'err', type === 'Percentage' ? 'Invalid discount value. Enter a value between 1 and 100.' : 'Invalid discount value. Enter an amount greater than 0.'); return }
    discounts.push({ name: name, type: type, value: val, applies: $('dApply').value, active: true });
    drawTable();
    setAlert(el, 'ok', 'Discount "' + name + '" saved and set to Active.');
  });

  /* ---------- backup and restore ---------- */
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function stamp(d) {
    var h = d.getHours(), m = d.getMinutes(), ap = h >= 12 ? 'pm' : 'am';
    h = h % 12 || 12;
    return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear() + ', ' + (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m) + ' ' + ap;
  }
  $('bkNow').addEventListener('click', function () {
    var b = this; b.disabled = true; b.textContent = 'Backing up...';
    $('bkMsg').className = 'alert';
    setTimeout(function () {
      var now = new Date();
      $('lastBk').textContent = 'Last backup completed: ' + stamp(now) + ' (database size 148 MB).';
      setAlert($('bkMsg'), 'ok', 'Backup completed successfully.');
      b.disabled = false; b.textContent = 'Take backup now';
    }, 900);
  });

  var modal = $('modal');
  function closeModal() { modal.hidden = true }
  $('restore').addEventListener('click', function () {
    var f = $('file').value.trim();
    if (!mark('f-file', /^[^\\\/:*?"<>|]+\.bak$/i.test(f))) {
      setAlert($('bkMsg'), 'err', 'Choose a valid backup file ending in .bak.'); return;
    }
    $('bkMsg').className = 'alert';
    $('mText').textContent = 'This replaces the current data with ' + f + '. This cannot be undone.';
    modal.hidden = false; $('mNo').focus();
  });
  $('mNo').addEventListener('click', closeModal);
  modal.addEventListener('click', function (e) { if (e.target === modal) closeModal() });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal() });
  $('mYes').addEventListener('click', function () {
    var f = $('file').value.trim();
    closeModal();
    setAlert($('bkMsg'), 'ok', 'Database restored from ' + f + '.');
  });

  /* ---------- billing settings ---------- */
  $('sForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var t = Number($('tax').value), s = Number($('svc').value);
    var a = mark('f-tax', $('tax').value.trim() !== '' && isFinite(t) && t >= 0 && t <= 100);
    var b = mark('f-svc', $('svc').value.trim() !== '' && isFinite(s) && s >= 0 && s <= 100);
    if (!a || !b) { setAlert($('sMsg'), 'err', 'Tax rate and service charge must be between 0 and 100.'); return }
    setAlert($('sMsg'), 'ok', 'Billing settings saved.');
  });

  /* ---------- mobile menu ---------- */
  var mb = $('menuBtn'), sn = $('snav');
  mb.addEventListener('click', function () { var o = sn.classList.toggle('open'); mb.setAttribute('aria-expanded', o) });
  sn.addEventListener('click', function (e) { if (e.target.tagName === 'A') e.preventDefault() });

  drawTable();
})();