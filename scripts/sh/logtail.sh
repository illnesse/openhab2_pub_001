tail -33 /var/log/openhab2/openhab.log > /etc/openhab2/html/_openhablog_tail.log
mv /etc/openhab2/html/_openhablog_tail.log /etc/openhab2/html/openhablog_tail.log

tail -20 /var/log/openhab2/events.log > /etc/openhab2/html/_eventlog_tail.log
mv /etc/openhab2/html/_eventlog_tail.log /etc/openhab2/html/eventlog_tail.log