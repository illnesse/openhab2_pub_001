#!/usr/bin/env bash
cd export
./exporter.sh

cd /etc/openhab2/misc
tar cfz grafana_backup-$(date +%Y-%m-%d_%H-%M).tar.gz grafana
rm -rf grafana