#echo $@
/usr/bin/python /etc/openhab2/scripts/python/CalSyncHAB/CalSyncHAB.py --noauth_local_webserver --id=$1 --action=$2 --summary="$3" --begin=$4 --end=$5