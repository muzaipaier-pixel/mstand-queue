#!/bin/bash
# Restart guard for pause_worker.js (+ keeps the CDP Chrome on :9226 up). Stop: touch /workspace/uber-sync/PAUSE_STOP
cd /workspace/uber-sync
exec 8>pause_loop.lock; flock -n 8 || { echo "already running"; exit 0; }
echo $$ > pause_loop.pid
while [ ! -f PAUSE_STOP ]; do
  curl -s -m 5 localhost:9226/json/version >/dev/null || { DISPLAY=:4 nohup google-chrome --user-data-dir=/home/box/chrome-profile/Fork-4 --remote-debugging-port=9226 --no-first-run --no-default-browser-check about:blank >/tmp/chrome9226.log 2>&1 & sleep 8; }
  node pause_worker.js >> pause.out 2>&1
  echo "$(TZ=Asia/Tokyo date '+%F %T') JST worker exit=$?" >> pause.log
  sleep 10
done
rm -f pause_loop.pid
