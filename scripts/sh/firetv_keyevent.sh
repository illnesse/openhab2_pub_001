#!/usr/bin/env bash
ip=$1
key=$2
devices=$(adb devices)

#echo $devices

if [[ $devices != *$ip* ]]; then
    echo "restarting adb server"
    adb kill-server
    adb start-server
    adb connect $ip
    sleep 1
fi

adb shell input keyevent $key
#adb disconnect