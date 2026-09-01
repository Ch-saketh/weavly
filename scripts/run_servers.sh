#!/usr/bin/env bash
# ==============================================================================
# Weavly / Zyra — All Servers Runner
# ==============================================================================
# Manages the complete Weavly full-stack ecosystem:
# 1. Python Zyra Inference Engine  -> Port 5001 (core-model)
# 2. Spring Boot API Server        -> Port 8081 (weavly-server/server)
# 3. Next.js Luxury Frontend       -> Port 3000 (weavly-client/LUXZERA/frontend)
# ==============================================================================

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PYTHON_DIR="$REPO_ROOT/core-model"
SPRING_DIR="$REPO_ROOT/weavly-server/server"
FRONTEND_DIR="$REPO_ROOT/weavly-client/LUXZERA/frontend"
LOG_DIR="$REPO_ROOT/.logs"

mkdir -p "$LOG_DIR"

PYTHON_LOG="$LOG_DIR/python-zyra.log"
SPRING_LOG="$LOG_DIR/spring-server.log"
FRONTEND_LOG="$LOG_DIR/nextjs-frontend.log"

# Color Codes
GREEN="\033[1;32m"
BLUE="\033[1;34m"
CYAN="\033[1;36m"
YELLOW="\033[1;33m"
RED="\033[1;31m"
MAGENTA="\033[1;35m"
BOLD="\033[1m"
RESET="\033[0m"

# Track PIDs
PID_PYTHON=""
PID_SPRING=""
PID_FRONTEND=""

cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down all Weavly servers...${RESET}"
    if [ -n "$PID_FRONTEND" ]; then kill -TERM "$PID_FRONTEND" 2>/dev/null || true; fi
    if [ -n "$PID_SPRING" ]; then kill -TERM "$PID_SPRING" 2>/dev/null || true; fi
    if [ -n "$PID_PYTHON" ]; then kill -TERM "$PID_PYTHON" 2>/dev/null || true; fi
    
    # Kill any processes still bound to the ports
    kill_port 5001
    kill_port 8081
    kill_port 3000
    
    echo -e "${GREEN}✓ All servers stopped successfully.${RESET}"
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

kill_port() {
    local port=$1
    local pids=$(lsof -ti tcp:$port 2>/dev/null || true)
    if [ -n "$pids" ]; then
        for pid in $pids; do
            kill -9 "$pid" 2>/dev/null || true
        done
    fi
}

check_port_in_use() {
    local port=$1
    lsof -i tcp:$port -sTCP:LISTEN >/dev/null 2>&1
}

wait_for_url() {
    local url=$1
    local name=$2
    local max_retries=$3
    local delay=${4:-1}
    local count=0

    echo -ne "   Waiting for ${name} to be ready..."
    while [ $count -lt $max_retries ]; do
        code=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || true)
        if echo "$code" | grep -qE "200|204|301|302|304|307|308|401|403|404"; then
            echo -e " ${GREEN}✓ Ready! (HTTP $code)${RESET}"
            return 0
        fi
        echo -ne "."
        sleep $delay
        count=$((count + 1))
    done
    echo -e " ${RED}⚠️ Timed out (check logs)${RESET}"
    return 1
}

start_servers() {
    echo -e "${BOLD}${MAGENTA}======================================================================${RESET}"
    echo -e "${BOLD}${MAGENTA}✨ STARTING WEAVLY / ZYRA FULL-STACK ECOSYSTEM${RESET}"
    echo -e "${BOLD}${MAGENTA}======================================================================${RESET}"

    # 1. Clean previous instances
    echo -e "\n${BLUE}🔍 Checking ports (5001, 8081, 3000)...${RESET}"
    kill_port 5001
    kill_port 8081
    kill_port 3000
    echo -e "   ${GREEN}✓ Ports cleaned and ready.${RESET}"

    # 2. Start Python Zyra ML Engine (Port 5001)
    echo -e "\n${CYAN}🧠 [1/3] Launching Python Zyra ML Engine on port 5001...${RESET}"
    cd "$PYTHON_DIR"
    PYTHON_EXEC="$PYTHON_DIR/.venv/bin/python"
    if [ ! -f "$PYTHON_EXEC" ]; then
        PYTHON_EXEC="python3"
    fi
    "$PYTHON_EXEC" app.py > "$PYTHON_LOG" 2>&1 &
    PID_PYTHON=$!
    echo "   Process PID: $PID_PYTHON (Logs: $PYTHON_LOG)"
    wait_for_url "http://127.0.0.1:5001/health" "Zyra Python Engine" 20 1

    # 3. Start Spring Boot REST API (Port 8081)
    echo -e "\n${BLUE}⚙️  [2/3] Launching Spring Boot REST API on port 8081...${RESET}"
    cd "$SPRING_DIR"
    ./mvnw spring-boot:run > "$SPRING_LOG" 2>&1 &
    PID_SPRING=$!
    echo "   Process PID: $PID_SPRING (Logs: $SPRING_LOG)"
    wait_for_url "http://127.0.0.1:8081/api" "Spring Boot Server" 45 1

    # 4. Start Next.js Frontend (Port 3000)
    echo -e "\n${GREEN}🎨 [3/3] Launching Next.js Luxury Frontend on port 3000...${RESET}"
    cd "$FRONTEND_DIR"
    npm run dev > "$FRONTEND_LOG" 2>&1 &
    PID_FRONTEND=$!
    echo "   Process PID: $PID_FRONTEND (Logs: $FRONTEND_LOG)"
    wait_for_url "http://127.0.0.1:3000" "Next.js Frontend" 30 1

    echo -e "\n${BOLD}${GREEN}======================================================================${RESET}"
    echo -e "${BOLD}${GREEN}🚀 ALL WEAVLY SERVERS ARE LIVE & RUNNING!${RESET}"
    echo -e "${BOLD}${GREEN}======================================================================${RESET}"
    echo -e "   🌟 ${BOLD}Frontend Storefront :${RESET} ${CYAN}http://localhost:3000${RESET}"
    echo -e "   ⚙️  ${BOLD}Spring Boot API     :${RESET} ${BLUE}http://localhost:8081/api${RESET}"
    echo -e "   🧠 ${BOLD}Zyra ML Engine      :${RESET} ${MAGENTA}http://localhost:5001${RESET}"
    echo -e "----------------------------------------------------------------------"
    echo -e "   📄 Python Logs   : tail -f $PYTHON_LOG"
    echo -e "   📄 Backend Logs  : tail -f $SPRING_LOG"
    echo -e "   📄 Frontend Logs : tail -f $FRONTEND_LOG"
    echo -e "----------------------------------------------------------------------"
    echo -e "   Press ${BOLD}[Ctrl + C]${RESET} to gracefully stop all servers at any time."
    echo -e "======================================================================\n"

    # Keep alive and tail logs
    wait $PID_PYTHON $PID_SPRING $PID_FRONTEND
}

start_servers
