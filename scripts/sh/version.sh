#!/usr/bin/env bash
openhab-cli info | grep -m2 "" | sed 's/.*#\(.*\))/\1/' | sed -n '1!p'