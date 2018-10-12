# mosquitto_pub -t hdmi -m '{"state":{"selected_input":1}}'
#/etc/openhab2/scripts/python/hdmimatrix-mqtt/hdmimatrix
#python3 -m hdmimatrix -b 127.0.0.1:1883 -t hdmi -s /dev/serial/by-id/usb-1a86_USB2.0-Serial-if00-port0


#!/bin/sh

# Everything should happen relative to the application path
BASE_DIR=$(dirname $0)/../
cd $BASE_DIR

VIRTUAL_BASE=${BASE_DIR}venv/

if [ -d ${VIRTUAL_BASE} ] ; then 
    # just activate
    source ${VIRTUAL_BASE}bin/activate
else
    # creating virtual env if not present
    python3 -m venv --copies ${VIRTUAL_BASE}
    source ${VIRTUAL_BASE}bin/activate
    pip3 install -r ${BASE_DIR}requirements.txt
fi

exec python3 -m hdmimatrix $@


#./hdmimqtt -b 127.0.0.1:1883 -t hdmi -s /dev/serial/by-id/usb-1a86_USB2.0-Serial-if00-port0

#!/bin/sh
#ls venv/bin/a
#source venv/bin/activate
#exec python3 -m hdmimatrix $@
