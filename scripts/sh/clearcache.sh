sudo systemctl stop openhab2.service
sudo rm -rf /var/lib/openhab2/cache/*
sudo rm -rf /var/lib/openhab2/tmp/*
sudo systemctl start openhab2.service