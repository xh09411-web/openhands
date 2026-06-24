#!/bin/bash
set -e
cd ~/Google-AI/docker/compose
docker compose up -d
docker compose ps
cd ~/Google-AI
git add -A 2>/dev/null || true
git commit -m "Auto $(date '+%Y-%m-%d %H:%M:%S')" 2>/dev/null || true
git push origin main 2>/dev/null || true
HOST_IP=$(hostname -I | awk '{print $1}')
echo ""
echo "=== 服務狀態 ==="
echo "Open-WebUI: http://$HOST_IP:8080"
echo "OpenHands:  http://$HOST_IP:3000"
echo "n8n:        http://$HOST_IP:5678 (admin/admin123)"
echo "SearXNG:    http://$HOST_IP:8081"
echo "Qdrant:     http://$HOST_IP:6333"
echo "AnythingLLM:http://$HOST_IP:3001"
echo "LiteLLM:    http://$HOST_IP:4000"
echo "GitHub:     https://github.com/xh09411-web/Google-AI"
echo ""
echo "模型下載狀態: docker exec ollama ollama list"
echo "回到後台: tmux attach -t model-download"
