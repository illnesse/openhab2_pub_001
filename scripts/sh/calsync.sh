#echo Syncing Calendars: $@
/usr/bin/python /etc/openhab2/scripts/python/CalSyncHAB/CalSyncJSON.py --noauth_local_webserver --id=$1 --action=$2 --prefix=$3