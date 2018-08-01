#!/usr/bin/env bash

PID=`ps aux --sort=start_time | grep openhab.*java | grep -v grep | awk '{print $2}' | tail -1`
UPTIME=`ps -o etimes= -p "${PID}"`
echo $UPTIME/60 | bc