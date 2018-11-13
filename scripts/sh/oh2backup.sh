#!/usr/bin/env bash
cd /etc/openhab2/scripts/sh/grafana
./grafana-export.sh

cd /etc/openhab2/misc
tar cfz grafana_backup-$(date +%Y-%m-%d_%H-%M).tar.gz grafana
rm -rf grafana

influxd backup -portable /etc/openhab2/misc/influxdb
tar cfz influxdb_backup-$(date +%Y-%m-%d_%H-%M).tar.gz influxdb
rm -rf influxdb

# backuploc="/home/openhabian/oh2bak/oh2_2"
# confdir="/etc/openhab2"

# logfolder="/home/openhabian/oh2bak/logs"
# logfilename="oh2backup_$(date +%Y%m%d_%H%M%S)"
# oh2backupresult=$logfolder/$logfilename

# mkdir -p $logfolder
# touch $oh2backupresult

# /usr/bin/rsync -r $confdir $backuploc --delete --ignore-errors

# /usr/bin/git pull --no-edit
# /usr/bin/git add openhab2
# /usr/bin/git commit -m "generated files on `date +'%Y-%m-%d %H:%M:%S'`" >> $oh2backupresult
# /usr/bin/git push >> $oh2backupresult

cd /home/openhabian/oh2backups
date=`date '+%Y-%m-%d_%H-%M-%S'`
version=`openhab-cli info | grep -m2 "" | sed 's/.*#\(.*\))/\1/' | sed -n '1!p'`
sudo openhab-cli backup $date\_oh2backup_#$version

