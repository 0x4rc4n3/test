# test

Comprehensive Multi-Project Docker Suite featuring:
1. **Apex-PQ**: Post-Quantum Decentralized Identity & Authentication (NIST FIPS 204 ML-DSA-44 lattice cryptography + 3-Node BFT hash chain ledger)
2. **Zest Suites**: Complete Hotel Operations Management System (Guest Booking, Reception Desk, Reservations, Services, & System Management)

---

## Complete Setup Guide (Fresh Kali / Debian / Ubuntu)

### Step 1: Install Docker & Docker Compose

On a fresh Kali Linux installation, run:

```bash
# Update package lists
sudo apt update

# Install Docker engine and Compose plugin
sudo apt install -y docker.io docker-compose-plugin

# Start and enable the Docker service
sudo systemctl enable --now docker

# (Optional) Allow current user to run Docker without sudo
sudo usermod -aG docker $USER
newgrp docker
```

*Verification:*
```bash
docker --version
docker compose version
```

---

### Step 2: Clone the Repository

```bash
git clone https://github.com/0x4rc4n3/test.git
cd test
```

---

### Step 3: Run the Multi-Project Launcher

Launch using the included interactive startup script:

```bash
chmod +x start.sh
./start.sh
```

You will see an interactive prompt:
```text
==========================================================
          Multi-Project Docker Environment Launcher       
==========================================================

Select which project to run:
  1) Apex-PQ (Post-Quantum Identity Ecosystem - Port 8080)
  2) Zest Suites (Hotel Operations Portal - Port 8081)
  3) Both Projects (Apex-PQ on 8080 & Zest Suites on 8081)
  q) Quit

Enter choice [1, 2, 3, or q]: 
```

- Type `1` to build and run **Apex-PQ** on `http://127.0.0.1:8080`.
- Type `2` to build and run **Zest Suites** on `http://127.0.0.1:8081`.
- Type `3` to build and run **Both** simultaneously.

#### Direct Docker Compose Commands:
```bash
# Launch both containers in background
docker compose up -d --build

# Check running status
docker compose ps

# View logs
docker compose logs -f

# Stop all containers
docker compose down
```

---

### Step 4: Install the Apex Wallet Extension (Chromium / Chrome / Brave)

1. Open your browser and navigate to `chrome://extensions`.
2. Turn **Developer mode** ON (top right switch).
3. Click **Load unpacked** (top left button).
4. Select the directory:
   `<path-to-repo>/test/apex-pq/pqc-identity/wallet-extension/`
5. The extension will appear with the official shield/keyhole logo as its icon.
6. Click the extension icon in the toolbar:
   - **Master PIN:** `1342`
   - All 4 pre-synced accounts (**1 Admin + 3 Students**) are immediately available!

---

### Step 5: Verify & Login on Apex-PQ

1. Open [http://127.0.0.1:8080/login](http://127.0.0.1:8080/login) in your browser.
2. In the extension popup, choose any identity:
   - **Admin** (`admin`) -> Unlocks the Administrator Dashboard & Blockchain Explorer.
   - **Student** (`csec221102001`, `csec221102002`, `csec221102003`) -> Unlocks Student Portal.
3. Click **Sign & Login**:
   - The extension automatically inputs the roll number.
   - A single-use 256-bit cryptographic nonce is issued by the server.
   - The wallet signs the challenge with the post-quantum ML-DSA-44 private key.
   - The server verifies the signature against the ledger public key and grants entry instantly!

---

## Pre-Synced Accounts (1 Admin + 3 Students)

The system database (`identity.db`), blockchain ledger (`node0-2.db`), and wallet extension (`seeds.json`) are pre-populated and synchronized with real, verified ML-DSA-44 keypairs:

| Role | Full Name | Roll No. / Username | Email | DID Identifier |
|---|---|---|---|---|
| **Admin** | System Administrator | `admin` | `admin@apex.edu` | `did:key:zVt1LQ2XFQfXFDkMLSrQEMbPF` |
| **Student** | Ayesha Khan | `csec221102001` | `csec221102001@apex.edu` | `did:key:zVtJSL6atHSsG1uCzNFsZ8ofF` |
| **Student** | Bilal Ahmed | `csec221102002` | `csec221102002@apex.edu` | `did:key:zVtASg7hBPFUV4Y7vBKvZjx2v` |
| **Student** | Hamza Tariq | `csec221102003` | `csec221102003@apex.edu` | `did:key:zVt9R2871SvAg3JT4sr4sjk2u` |

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

## Native Execution (Without Docker)

If you wish to test locally without Docker:

### Apex-PQ Native:
```bash
cd apex-pq
pip install -r requirements.txt
APEX_DEMO_MODE=1 bash run.sh native
# Running on http://127.0.0.1:8080
```

### Zest Suites Native:
```bash
cd zest-suites
python3 server.py
# Running on http://127.0.0.1:8081
```

---

## Troubleshooting

- **Permission Denied for Docker:**  
  Run `sudo usermod -aG docker $USER` and log out/in, or run `./start.sh` with `sudo`.
- **Port Conflicts:**  
  Check if port 8080 or 8081 are in use:  
  `sudo lsof -i :8080` or `sudo lsof -i :8081`  
  Kill conflicting processes or adjust `PORT` in `docker-compose.yml`.
- **Resetting Database to Fresh Pre-Synced State:**  
  The repository already ships with pre-populated `identity.db` and `node0-2.db` matching the wallet extension's `seeds.json`.
