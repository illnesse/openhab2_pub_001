#!/usr/bin/env bash
#======================================== ==================================
#     FILE:             fritzBoxReboot.sh
#     AUTHOR:           Helpi_Stone
#     EMAIL:            helpi9007@gmail.com
#     CREATED:          2018-01-26
#
#     MODIFIED BY:      Helpi_Stone
#     MODIFIED DATE:    2018-01-26
#
#     DESCRIPTION:      "Beschreibung"
#
#     VERSION:           1.0
#======================================== ==================================
#######################################################
### Autor: Nico Hartung <nicohartung1@googlemail.com> #
#######################################################

# Skript sollte ab FritzOS 6.0 (2013) funktioneren - also auch für die 6.8x und 6.9x
# Dieses Bash-Skript nutzt das Protokoll TR-064 nicht die WEBCM-Schnittstelle

# http://fritz.box:49000/tr64desc.xml
# https://wiki.fhem.de/wiki/FRITZBOX#TR-064
# https://avm.de/service/schnittstellen/

# Thanks to Dragonfly (https://homematic-forum.de/forum/viewtopic.php?t=27994)


###=======###
# Variablen #
###=======###

IPS="192.168.178.1"

FRITZUSER="XXXXXXX"
FRITZPW="XXXXXXX"


###====###
# Skript #
###====###

location="/upnp/control/deviceconfig"
uri="urn:dslforum-org:service:DeviceConfig:1"
action='Reboot'

for IP in ${IPS}; do
        curl -k -m 5 --anyauth -u "$FRITZUSER:$FRITZPW" http://$IP:49000$location -H 'Content-Type: text/xml; charset="utf-8"' -H "SoapAction:$uri#$action" -d "<?xml version='1.0' encoding='utf-8'?><s:Envelope s:encodingStyle='http://schemas.xmlsoap.org/soap/encoding/' xmlns:s='http://schemas.xmlsoap.org/soap/envelope/'><s:Body><u:$action xmlns:u='$uri'></u:$action></s:Body></s:Envelope>" -s > /dev/null
done