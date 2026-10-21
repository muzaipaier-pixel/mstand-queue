#!/bin/bash
# Uber store online-state poller, every 3 min (read-only). Started/guarded by pause_loop.sh. Stop: touch STATUS_STOP
cd "$(dirname "$0")"; exec 9>uber_status.lock; flock -n 9 || exit 0
while [ ! -f STATUS_STOP ]; do timeout 60 node uber_status.js --cdp >> uber_status.log 2>&1; tail -n 300 uber_status.log > uber_status.log.t && mv uber_status.log.t uber_status.log; sleep 180; done
