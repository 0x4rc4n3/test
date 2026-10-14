#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════════════
# Multi-Project Docker Launcher
# Apex-PQ (Post-Quantum Identity) & Zest Suites (Hotel Management Portal)
# ══════════════════════════════════════════════════════════════════════════

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=========================================================="
echo "          Multi-Project Docker Environment Launcher       "
echo "=========================================================="
echo ""
echo "Select which project to run:"
echo "  1) Apex-PQ (Post-Quantum Identity Ecosystem - Port 8080)"
echo "  2) Zest Suites (Hotel Operations Portal - Port 8081)"
echo "  3) Both Projects (Apex-PQ on 8080 & Zest Suites on 8081)"
echo "  q) Quit"
echo ""

# Read user choice
if [ -n "$1" ]; then
    CHOICE="$1"
else
    read -rp "Enter choice [1, 2, 3, or q]: " CHOICE
fi

if [[ "$CHOICE" =~ ^(q|Q|quit|exit)$ ]]; then
    echo "Exited."
    exit 0
fi

# Detect compose command
if docker compose version >/dev/null 2>&1; then
    COMPOSE="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
    COMPOSE="docker-compose"
elif command -v podman-compose >/dev/null 2>&1; then
    COMPOSE="podman-compose"
else
    echo "[!] Docker Compose not detected. Please install Docker & Docker Compose first."
    echo "    On Kali/Debian: sudo apt-get update && sudo apt-get install -y docker.io docker-compose-plugin"
    exit 1
fi

case "$CHOICE" in
    1)
        echo ""
        echo "[+] Starting Apex-PQ on http://127.0.0.1:8080 ..."
        echo "[+] Pre-synced: 1 Admin + 3 Students in Database & Extension."
        $COMPOSE up --build apex-portal
        ;;
    2)
        echo ""
        echo "[+] Starting Zest Suites on http://127.0.0.1:8081 ..."
        echo "[+] Interactive Hotel Operations & Management system."
        $COMPOSE up --build zest-suites
        ;;
    3|"both"|"all")
        echo ""
        echo "[+] Starting BOTH projects..."
        echo "    - Apex-PQ:     http://127.0.0.1:8080"
        echo "    - Zest Suites: http://127.0.0.1:8081"
        $COMPOSE up --build
        ;;
    *)
        echo "[!] Invalid option: '$CHOICE'. Please choose 1, 2, or 3."
        exit 1
        ;;
esac
