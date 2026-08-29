@echo off
REM 启动安和昴常驻 TTS 服务（auto：CPU 常驻，只在说话时短暂用 GPU，空闲 60 秒自动回 CPU）
REM 说明：--device cpu 会触发 CosyVoice3 CPU 推理 bug（kernel size 报错），暂用 auto
REM 想一直留 GPU：改成 --device cuda
REM 改成你自己的 CosyVoice 目录（内含 .venv 和 subaru_tts_server.py）
cd /d D:\path\to\cosyvoice
.venv\Scripts\python.exe subaru_tts_server.py --host 0.0.0.0 --port 8001 --device auto
pause
