## openhab2_pub_001

## based on OpenHAB2 2.4.0+ using JSR223 Javascript for rules. You need a current openhab2-2.4.0.* snapshot to run, due to changes in the JSR223 Scripting engine. 

**this is a work in progress, don't hesitate to file issues for any questions / bugs / ideas or contact me over at the OpenHAB community site https://community.openhab.org/t/hacking-basicui-my-basicui-theme-update/45850**

Due to popular demand i just put up my current config as is, there may be a few unfinished things but all in all it's a pretty decent and stable openhab setup. I (hopefully) redacted all personal info with "XXXXXX" or "123456", you should replace those. There are no .rules because Xtext DSL sucks. There's probably a bunch of unused stuff too, idk.. I might clean up later, Enjoy!

  - Heavily modified Basic UI via injected JS/CSS
  - Parses sitemap for strings for special formatting, links etc
  - InfluxDB + Grafana, (replace grafana.light.css with my modified version in html/ to render transparent pngs for the sitemap
  - mapdb for restoreonstartup values / UI
  - Amazon Echos for TTS
  - Amazon Echo Voice Command Interpreter
  - Broadlink RM3 Mini via MQTT to control TV, SAT, Audio and other devices, switches eg TV channels via alexa commands
  - Lightify Sensors 
  - ESP Multisensors via MQTT
  - Homematic Sensors & Actors
  - Homematic Keymatic access control
  - Homematic Door Bell Logic
  - Shelly 1 Actors via MQTT
  - Stats and Reminders for all battery powered devices
  - Fritzbox TR064 Interface implementation for last caller display, mute audio etc during call etc
  - Amazon Fire TV via ADB / KODI Remote Interface via RPC
  - Tuya Lights/LEDStrips and Sockets via modified Tuyapi / Node.js for color settings and scenes
  - Hyperion Ambilight Control
  - Google calendar and Mail via python scripts, with reminders etc
  - Owntracks implementation with Address/Location/Traffic info from Google, Connection/Battery Info etc
  - GoogleMap Iframe with Owntracks GPS beacons / implemented via MQTT
  - TuneIn Iframe with Channel list to send channel IDs to nearby devices
  - Alarm Clock with reminders
  - SNMP data display and latency info of network devices
  - Speed test functionality
  - Network Latency "heatmap"
  - Logtail/Multitail style Iframe to display current events.log and openhab.log with some basic syntax highlighting
  - RSS Reader Iframe, needs more work, maybe TTS notifications
  - Logreader to notify you of system issues (needs more work)
  - Energy sensor stats for single sockets and the whole house (needs more work)
  - Temperature/Humidity info for inside & outside, Pollen Warning
  - Presence detection via DHCP packets which works reliably (but needs more work)
  - Commits to bitbucket repo as backup method
  - Scripts to restart OH2 service, Reboot Raspberry, Reboot Fritzbox, Clear Cache and restart, Openhab Memory Usage, Uptimes, InfluxDB size etc. etc.
  - Wake on LAN
   
  
  
**used extensions:**
  - binding-amazonechocontrol - 2.4.0.SNAPSHOT
  - binding-astro - 2.4.0.SNAPSHOT
  - binding-fritzboxtr0641 - 1.13.0.SNAPSHOT
  - binding-homematic - 2.4.0.SNAPSHOT
  - binding-logreader - 2.4.0.SNAPSHOT
  - binding-mqtt1 - 1.13.0.SNAPSHOT
  - binding-network - 2.4.0.SNAPSHOT
  - market:binding-3560149 - 1.0 (OSRAM/Sylvania Lightify/SMART+ Binding, might replace that too)
  - binding-systeminfo - 2.4.0.SNAPSHOT
  - binding-tplinksmarthome - 2.4.0.SNAPSHOT
  - binding-wol1 - 1.13.0.SNAPSHOT
  - binding-openweathermap

  - Misc
    - ui-basic - 2.4.0.SNAPSHOT
    - ui-paper - 2.4.0.SNAPSHOT

    - misc-market - 2.4.0.SNAPSHOT
    - misc-openhabcloud - 2.4.0.SNAPSHOT
    - misc-ruleengine - 2.4.0.SNAPSHOT

    - persistence-influxdb - 1.13.0.SNAPSHOT
    - persistence-mapdb - 1.13.0.SNAPSHOT

    - transformation-javascript - 2.4.0.SNAPSHOT
    - transformation-map - 2.4.0.SNAPSHOT
    - transformation-xslt - 2.4.0.SNAPSHOT
