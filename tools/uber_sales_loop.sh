#!/bin/bash
# every 30 min, 09:00-23:59 JST; restart-guarded by cron @reboot/*/10 check. Stop: touch SALES_STOP
cd "$(dirname "$0")"; exec 9>uber_sales.lock; flock -n 9 || exit 0
while [ ! -f SALES_STOP ]; do H=$(TZ=Asia/Tokyo date +%H); if [ "$H" -ge 9 ]; then timeout 150 node uber_sales_push.js >/dev/null 2>&1; fi; sleep 1800; done
