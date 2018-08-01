IP="192.168.178.27"

wget --output-document /etc/openhab2/html/_cam1.jpg "http://192.168.178.27:8081/"
mv /etc/openhab2/html/_cam1.jpg /etc/openhab2/html/cam1.jpg

wget --output-document /etc/openhab2/html/_cam2.jpg "http://192.168.178.27:8082/"
mv /etc/openhab2/html/_cam2.jpg /etc/openhab2/html/cam2.jpg

