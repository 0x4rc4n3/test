# test

Comprehensive Multi-Project Docker Suite featuring:
1. **Apex-PQ**: Post-Quantum Decentralized Identity & Authentication (ML-DSA-44 lattice cryptography + 3-Node BFT hash chain ledger)
2. **Zest Suites**: Complete Hotel Operations Management System (Guest Booking, Reception Desk, Reservations, Services, & System Management)

---

## Quickstart

Run the interactive startup script on any system with Docker installed:

```bash
chmod +x start.sh
./start.sh
```

The script will prompt you:
```text
Select which project to run:
  1) Apex-PQ (Post-Quantum Identity Ecosystem - Port 8080)
  2) Zest Suites (Hotel Operations Portal - Port 8081)
  3) Both Projects (Apex-PQ on 8080 & Zest Suites on 8081)
  q) Quit
```

Alternatively, run with Docker Compose directly:

```bash
# Run both projects
docker compose up --build

# Or run only Apex-PQ
docker compose up --build apex-portal

# Or run only Zest Suites
docker compose up --build zest-suites
```

---

## Project 1: Apex-PQ (Port 8080)

Post-quantum decentralized authentication using NIST FIPS 204 **ML-DSA-44** lattice signatures. Zero passwords stored on server; authentication relies on single-use cryptographic challenge-response signed by the client's wallet.

- **URL:** [http://127.0.0.1:8080](http://127.0.0.1:8080)

### Pre-Synced Accounts (1 Admin + 3 Students)

The system database (`identity.db`), blockchain ledger (`node0-2.db`), and wallet extension (`seeds.json`) are pre-populated and synchronized with real, verified ML-DSA-44 keypairs:

| Role | Name | Roll Number / Username | University Email | DID Identifier |
|---|---|---|---|---|
| **Admin** | System Administrator | `admin` | `admin@apex.edu` | `did:key:zVt1LQ2XFQfXFDkMLSrQEMbPF` |
| **Student** | Ayesha Khan | `csec221102001` | `csec221102001@apex.edu` | `did:key:zVtJSL6atHSsG1uCzNFsZ8ofF` |
| **Student** | Bilal Ahmed | `csec221102002` | `csec221102002@apex.edu` | `did:key:zVtASg7hBPFUV4Y7vBKvZjx2v` |
| **Student** | Hamza Tariq | `csec221102003` | `csec221102003@apex.edu` | `did:key:zVt9R2871SvAg3JT4sr4sjk2u` |

### Installing the Apex Wallet Extension

1. In Chromium / Chrome / Brave / Edge, navigate to `chrome://extensions`.
2. Enable **Developer mode** (top right toggle).
3. Click **Load unpacked** and select the folder:
   `apex-pq/pqc-identity/wallet-extension/`
4. The extension icon uses the official shield/keyhole logo (`icon16.png`, `icon48.png`, `icon128.png`).
5. Open the extension popup:
   - **Master PIN:** `1342`
   - All 4 accounts (Admin + 3 Students) are automatically pre-loaded.
6. Open [http://127.0.0.1:8080/login](http://127.0.0.1:8080/login):
   - Select the desired account in the extension popup.
   - Click **Sign & Login**. The extension fills the roll number, requests a cryptographic nonce, signs it using post-quantum ML-DSA-44, and completes verification immediately!

---

## Project 2: Zest Suites (Port 8081)

A complete Hotel Operations and Management Web Application with unified multi-view navigation:

- **URL:** [http://127.0.0.1:8081](http://127.0.0.1:8081)

### Features & Navigation:
- **Home:** Hero search, room type preview, amenities, guest reviews.
- **Book a Room:** 4-step booking workflow with date range selection, real-time rate calculation, and guest details.
- **My Bookings:** Active reservations table, payment processing (Card with Luhn verification or Cash), and printable receipts.
- **Order Service:** Room dining and laundry menu, live shopping cart, and delivery tracking.
- **Feedback:** 5-star interactive rating and guest review submission.
- **Front Desk:** Reception dashboard, real-time room status tracking (Available, Occupied, Cleaning, Maintenance), today's arrivals and departures.
- **Reservations:** Comprehensive reservation search, updates, and cancellations.
- **Management:** Discount policy management, database backup & restore simulation, and tax/billing settings.

---

## Directory Structure

```text
.
├── start.sh                      # Interactive Docker launcher (Choice 1, 2, or 3)
├── docker-compose.yml            # Multi-service compose configuration
├── README.md                     # Documentation
├── apex-pq/                      # Project 1: Apex-PQ Post-Quantum Identity
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── liboqs/                   # Vendored liboqs shared library binaries
│   └── pqc-identity/             # Flask app, ledger, models, wallet-extension
│       ├── db/                   # Pre-synced SQLite DB, admin credentials, ledger
│       └── wallet-extension/     # Manifest V3 extension with logo icons & seeds.json
└── zest-suites/                  # Project 2: Zest Suites Hotel Management
    ├── Dockerfile
    ├── server.py                 # Clean HTTP server on port 8081
    ├── index.html                # Unified single-page application
    ├── styling/                  # CSS styles
    └── Java-script/              # Interactive logic
```
