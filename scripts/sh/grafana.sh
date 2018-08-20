WIDTH="1324"

IP="127.0.0.1"
ID="-8mo5BRgk"

sudo chmod 777 /etc/openhab2/html/*.png

wget --output-document /etc/openhab2/html/_2.png "http://$IP:3000/render/d-solo/$ID/grafana_home?panelId=2&width=$WIDTH&height=300&theme=light"
mv /etc/openhab2/html/_2.png /etc/openhab2/html/2.png

wget --output-document /etc/openhab2/html/_4.png "http://$IP:3000/render/d-solo/$ID/grafana_home?panelId=4&width=$WIDTH&height=300&theme=light"
mv /etc/openhab2/html/_4.png /etc/openhab2/html/4.png

wget --output-document /etc/openhab2/html/_6.png "http://$IP:3000/render/d-solo/$ID/grafana_home?panelId=18&width=$WIDTH&height=400&theme=light"
mv /etc/openhab2/html/_6.png /etc/openhab2/html/6.png

wget --output-document /etc/openhab2/html/_8.png "http://$IP:3000/render/d-solo/$ID/grafana_home?panelId=8&width=$WIDTH&height=300&theme=light"
mv /etc/openhab2/html/_8.png /etc/openhab2/html/8.png

wget --output-document /etc/openhab2/html/_10.png "http://$IP:3000/render/d-solo/$ID/grafana_home?panelId=10&width=$WIDTH&height=300&theme=light"
mv /etc/openhab2/html/_10.png /etc/openhab2/html/10.png

wget --output-document /etc/openhab2/html/_12.png "http://$IP:3000/render/d-solo/$ID/grafana_home?panelId=12&width=$WIDTH&height=300&theme=light"
mv /etc/openhab2/html/_12.png /etc/openhab2/html/12.png

wget --output-document /etc/openhab2/html/_14.png "http://$IP:3000/render/d-solo/$ID/grafana_home?panelId=14&width=$WIDTH&height=300&theme=light"
mv /etc/openhab2/html/_14.png /etc/openhab2/html/14.png
