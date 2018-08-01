OUT=`sudo du -sh /var/lib/influxdb/data/openhab_db | sed 's/M.*//g' `
echo $OUT
