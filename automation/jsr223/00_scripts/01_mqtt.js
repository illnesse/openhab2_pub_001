'use strict';
load('/etc/openhab2/automation/jsr223/00_jslib/JSRule.js');

var home_lat = "12.3456789";
var home_lon = "12.3456789";

var delay = 400;

function sendMQTT(broker, topic, message)
{
    var execResult;
    var command;
    if (broker == "broadlink")
    {
        command = "mosquitto_pub -t " + topic + " -m \"" + message + "\"";
    }
    else if (broker == "cloudmqtt")
    {
        command = "mosquitto_pub -h XXXXXXX -p XXXX -u XXXXXXX -P XXXXXXXXX -i XXXXXXXXXXXX -t " + topic + " -m \"" + message + "\"";
    }
    execResult = executeCommandLineAndWaitResponse(command, 1000 *3);
    logInfo("sendMQTT broker: " + broker + " topic: " + topic + " result: " + execResult);
}

var gMQTT_CommandTriggers = [];
itemRegistry.getItem("gMQTT_CommandsStr").getMembers().forEach(function (gMQTT_CommandsStrItem) 
{
    gMQTT_CommandTriggers.push(ItemCommandTrigger(gMQTT_CommandsStrItem.name));
});
itemRegistry.getItem("gMQTT_CommandsSw").getMembers().forEach(function (gMQTT_CommandsSwItem) 
{
    gMQTT_CommandTriggers.push(ItemCommandTrigger(gMQTT_CommandsSwItem.name));
});

JSRule({
    name: "gMQTT Commands",
    description: "Line: "+__LINE__,
    triggers: gMQTT_CommandTriggers,
    execute: function( module, input)
    {
        var triggeringItem = getItem(getTriggeringItemStr(input));
        if      (triggeringItem.name == "MQTT_TV") sendMQTT("broadlink","broadlink/tv/samsung/" + input.command, "replay")
        else if (triggeringItem.name == "MQTT_AUDIO") sendMQTT("broadlink","broadlink/audio/sony/" + input.command, "replay")
        else if (triggeringItem.name == "MQTT_SWITCH") sendMQTT("broadlink","broadlink/hdmiswitch/" + input.command, "replay")
        else if (triggeringItem.name == "MQTT_AC") sendMQTT("broadlink","broadlink/ac/" + input.command, "replay")
        else if (triggeringItem.name == "MQTT_FAN") sendMQTT("broadlink","broadlink/fan/obi/" + input.command, "replay")
        else if (triggeringItem.name == "MQTT_PC_SYSTEM") sendMQTT("cloudmqtt", "wt/system/commands/" + input.command, "true")
        else if (triggeringItem.name == "MQTT_PC_DESKTOP") sendMQTT("cloudmqtt", "wt/desktop/commands/" + input.command, "true")

        else if (triggeringItem.name == "aMQTT_FAN_power") sendMQTT("broadlink","broadlink/fan/obi/power", "replay")
        else if (triggeringItem.name == "aMQTT_FAN_rot") sendMQTT("broadlink","broadlink/fan/obi/swivel", "replay")
        else if (triggeringItem.name == "aMQTT_FAN_up") sendMQTT("broadlink","broadlink/fan/obi/up", "replay")
        else if (triggeringItem.name == "aMQTT_FAN_down") sendMQTT("broadlink","broadlink/fan/obi/down", "replay")

        else if (triggeringItem.name == "aMQTT_TV") sendMQTT("broadlink","broadlink/tv/samsung/power", "replay")
        else if (triggeringItem.name == "aMQTT_SAT") sendMQTT("broadlink","broadlink/sat/humax/power", "replay")
        else if (triggeringItem.name == "aMQTT_AUDIO") sendMQTT("broadlink","broadlink/audio/sony/power", "replay")
        else if (triggeringItem.name == "aMQTT_AUDIO_MUTE") sendMQTT("broadlink","broadlink/audio/sony/mute", "replay")
        else if (triggeringItem.name == "aMQTT_ALLES")
        {
            sendMQTT("broadlink","broadlink/audio/sony/power", "replay")
            sleep(delay);
            sendMQTT("broadlink","broadlink/sat/humax/power", "replay")
            sleep(delay);
            sendMQTT("broadlink","broadlink/tv/samsung/power", "replay")
        }
    }
});

JSRule({
    name: "MQTT_SAT",
    description: "Line: "+__LINE__,
    triggers: [
        ItemCommandTrigger("MQTT_SAT"),
        ItemCommandTrigger("MQTT_SATChannel")
    ],
    execute: function( module, input)
    {
        var triggeringItem = getItem(getTriggeringItemStr(input));
        var receivedCommand = input.command;

        if (triggeringItem.name == "MQTT_SATChannel")
        {
            var ChannelNumber = parseInt(receivedCommand)
            if (ChannelNumber > 9)
            {
                sendMQTT("broadlink","broadlink/sat/humax/0", "replay")
                sleep(delay);
                sendMQTT("broadlink","broadlink/sat/humax/0", "replay")
                sleep(delay);
                sendMQTT("broadlink","broadlink/sat/humax/" + receivedCommand.toString().substring(0, 1), "replay")
                sleep(delay);
                sendMQTT("broadlink","broadlink/sat/humax/" + receivedCommand.toString().substring(1, 2), "replay")
            }
            else
            {
                sendMQTT("broadlink","broadlink/sat/humax/0", "replay")
                sleep(delay);
                sendMQTT("broadlink","broadlink/sat/humax/0", "replay")
                sleep(delay);
                sendMQTT("broadlink","broadlink/sat/humax/0", "replay")
                sleep(delay);
                sendMQTT("broadlink","broadlink/sat/humax/" + receivedCommand, "replay")
            }
        }
        else
        {
            sendMQTT("broadlink","broadlink/sat/humax/" + receivedCommand, "replay")
        }
    }
});

JSRule({
    name: "aSonyVolume",
    description: "Line: "+__LINE__,
    triggers: [
        ItemCommandTrigger("aSonyVolume")
    ],
    execute: function( module, input)
    {
        var triggeringItem = getItem("aSonyVolume");
        var receivedCommand = input.command;

		if ( receivedCommand == "ON") 
		{
			logInfo("aSonyVolume VOL UP")
            var i = 0
            while((i=i+1) < 8) 
            {
                sendMQTT("broadlink","broadlink/audio/sony/volumeup", "replay");
                sleep(200);
            }
		}
		else if ( receivedCommand == "OFF") 
		{
			logInfo("aSonyVolume VOL DN")
            var i = 0
            while((i=i+1) < 8) 
            {
                sendMQTT("broadlink","broadlink/audio/sony/volumedown", "replay");
                sleep(200);
            }
		}
    }
});

var gMQTT_SAT_chTriggers = [];
itemRegistry.getItem("gMQTT_SAT_ch").getMembers().forEach(function (gMQTT_SAT_chItem) 
{
    gMQTT_SAT_chTriggers.push(ItemCommandTrigger(gMQTT_SAT_chItem.name));
});

JSRule({
    name: "gMQTT_SAT_ch",
    description: "Line: "+__LINE__,
    triggers: gMQTT_SAT_chTriggers,
    execute: function( module, input)
    {
        var triggeringItem = getItem(getTriggeringItemStr(input));
        var itemMQTT_SATChannel = getItem("MQTT_SATChannel");

        if      (triggeringItem.name == "aMQTT_SAT_ch_ARD") sendCommand(itemMQTT_SATChannel, 1)
        else if (triggeringItem.name == "aMQTT_SAT_ch_ZDF") sendCommand(itemMQTT_SATChannel, 2)
        else if (triggeringItem.name == "aMQTT_SAT_ch_RTL") sendCommand(itemMQTT_SATChannel, 3)
        else if (triggeringItem.name == "aMQTT_SAT_ch_SAT1") sendCommand(itemMQTT_SATChannel, 4)
        else if (triggeringItem.name == "aMQTT_SAT_ch_VOX") sendCommand(itemMQTT_SATChannel, 5)
        else if (triggeringItem.name == "aMQTT_SAT_ch_PRO7") sendCommand(itemMQTT_SATChannel, 6)
        else if (triggeringItem.name == "aMQTT_SAT_ch_Kabel1") sendCommand(itemMQTT_SATChannel, 7)
        else if (triggeringItem.name == "aMQTT_SAT_ch_arte") sendCommand(itemMQTT_SATChannel, 8)
        else if (triggeringItem.name == "aMQTT_SAT_ch_RTL2") sendCommand(itemMQTT_SATChannel, 9)
        else if (triggeringItem.name == "aMQTT_SAT_ch_SuperRTL") sendCommand(itemMQTT_SATChannel, 10)
        else if (triggeringItem.name == "aMQTT_SAT_ch_3Sat") sendCommand(itemMQTT_SATChannel, 11)
        else if (triggeringItem.name == "aMQTT_SAT_ch_WDR") sendCommand(itemMQTT_SATChannel, 12)
        else if (triggeringItem.name == "aMQTT_SAT_ch_BR") sendCommand(itemMQTT_SATChannel, 13)
        else if (triggeringItem.name == "aMQTT_SAT_ch_SWR") sendCommand(itemMQTT_SATChannel, 14)
        else if (triggeringItem.name == "aMQTT_SAT_ch_NDR") sendCommand(itemMQTT_SATChannel, 15)
        else if (triggeringItem.name == "aMQTT_SAT_ch_hr") sendCommand(itemMQTT_SATChannel, 16)
        else if (triggeringItem.name == "aMQTT_SAT_ch_MDR") sendCommand(itemMQTT_SATChannel, 17)
        else if (triggeringItem.name == "aMQTT_SAT_ch_rbb") sendCommand(itemMQTT_SATChannel, 2)
        else if (triggeringItem.name == "aMQTT_SAT_ch_ONE") sendCommand(itemMQTT_SATChannel, 21)
        else if (triggeringItem.name == "aMQTT_SAT_ch_tagesschau24") sendCommand(itemMQTT_SATChannel, 23)
        else if (triggeringItem.name == "aMQTT_SAT_ch_ZDFneo") sendCommand(itemMQTT_SATChannel, 24)
        else if (triggeringItem.name == "aMQTT_SAT_ch_ServusTV") sendCommand(itemMQTT_SATChannel, 28)
        else if (triggeringItem.name == "aMQTT_SAT_ch_Nitro") sendCommand(itemMQTT_SATChannel, 40)
        else if (triggeringItem.name == "aMQTT_SAT_ch_WeltderWunder") sendCommand(itemMQTT_SATChannel, 41)
        else if (triggeringItem.name == "aMQTT_SAT_ch_DeluxeMusic") sendCommand(itemMQTT_SATChannel, 44)
        else if (triggeringItem.name == "aMQTT_SAT_ch_ComedyCentralVIVA") sendCommand(itemMQTT_SATChannel, 45)
        else if (triggeringItem.name == "aMQTT_SAT_ch_ntv") sendCommand(itemMQTT_SATChannel, 61)
        else if (triggeringItem.name == "aMQTT_SAT_ch_WELT") sendCommand(itemMQTT_SATChannel, 62)
        else if (triggeringItem.name == "aMQTT_SAT_ch_BBC") sendCommand(itemMQTT_SATChannel, 63)
        else if (triggeringItem.name == "aMQTT_SAT_ch_CNN") sendCommand(itemMQTT_SATChannel, 64)
        else if (triggeringItem.name == "aMQTT_SAT_ch_AstroTV") sendCommand(itemMQTT_SATChannel, 70)
    }
});

JSRule({
    name: "MQTT_Phone_S_Update",
    description: "Line: "+__LINE__,
    triggers: [
        ItemCommandTrigger("MQTT_Phone_S_Update"),
        ItemCommandTrigger("SysStartup","ON"),
        TimerTrigger("0 */2 * ? * *")
    ],
    execute: function( module, input)
    {
        if (input.command != null) logInfo("MQTT_Phone_S_Update reportLocation")
        sendMQTT("cloudmqtt", "owntracks/XXXXXXXXXXX/a0001/cmd", "{\"_type\":\"cmd\",\"action\":\"reportLocation\"}")
    }
});

JSRule({
    name: "MQTT_Phone_J_Update",
    description: "Line: "+__LINE__,
    triggers: [
        ItemCommandTrigger("MQTT_Phone_J_Update"),
        ItemCommandTrigger("SysStartup","ON"),
        TimerTrigger("0 */2 * ? * *")
    ],
    execute: function( module, input)
    {
        if (input.command != null) logInfo("MQTT_Phone_J_Update reportLocation")
        sendMQTT("cloudmqtt", "owntracks/XXXXXXXXXXXX/huaweip8/cmd", "{\"_type\":\"cmd\",\"action\":\"reportLocation\"}")
    }
});

JSRule({
    name: "MQTT_Phone_S_WhatsappRaw",
    description: "Line: "+__LINE__,
    triggers: [
        ItemStateChangeTrigger("MQTT_Phone_S_WhatsappRaw"),
        ItemStateChangeTrigger("MQTT_Phone_J_WhatsappRaw")
    ],
    execute: function( module, input)
    {
        var triggeringItem = getItem(getTriggeringItemStr(input));
        var toUpdate = triggeringItem.name.split("_")[2];

        var message = input.newState;
        var time  = formatUITimeStampfromJodaDate(DateTime.now());
        postUpdate("MQTT_Phone_"+toUpdate+"_WhatsappUI", time + " 　" + (message.toString()).toUpperCase());
    }
});

JSRule({
    name: "MQTT_Calls",
    description: "Line: "+__LINE__,
    triggers: [
        ItemStateChangeTrigger("MQTT_Phone_S_CallsRaw"),
        ItemStateChangeTrigger("MQTT_Phone_J_CallsRaw")
    ],
    execute: function( module, input)
    {
        //logInfo(input);
        var triggeringItem = getItem(getTriggeringItemStr(input));
        var toUpdate = triggeringItem.name.split("_")[2];

        var itemCallsIn = getItem("MQTT_Phone_"+toUpdate+"_CallsIn");
        var itemCallsOut = getItem("MQTT_Phone_"+toUpdate+"_CallsOut");

        var time = formatUITimeStampfromJodaDate(DateTime.now());
        var d = false; //true = incoming
        var json = JSON.parse(input.newState);
        var name = json.name
        var number = json.num
        d = (json.d == "i")

        if (d) postUpdate(itemCallsIn, time + " 　" + name);
        else postUpdate(itemCallsOut, time + " 　" + name);
    }
});

JSRule({
    name: "MQTT_Phone parse",
    description: "Line: "+__LINE__,
    triggers: [
        ItemStateChangeTrigger("MQTT_Phone_S_PositionRaw"),
        ItemStateChangeTrigger("MQTT_Phone_J_PositionRaw")
    ],
    execute: function( module, input)
    {
        //logInfo(input.newState);
        var triggeringItem = getItem(getTriggeringItemStr(input));
        var selector = triggeringItem.name.split("_")[2];

        var itemBtn = getItem("MQTT_Phone_"+selector+"_Update");
        var itemDistanceDuration = getItem("MQTT_Phone_"+selector+"_DistanceDuration");
        var itemInfo = getItem("MQTT_Phone_"+selector+"_Info");
        var itemTimeStamp = getItem("MQTT_Phone_"+selector+"_TimeStamp");
        var itemConn = getItem("MQTT_Phone_"+selector+"_Conn");
        var itemBattery = getItem("MQTT_Phone_"+selector+"_Battery");
        var itemLocation = getItem("MQTT_Phone_"+selector+"_location");

        var json = JSON.parse(input.newState);
        var type = json._type;//transform("JSONPATH", "$._type", json)
        
        //logInfo("MQTT_Phone jsson: " + input.newState);
        //logInfo("MQTT_Phone parse type: " + type);

        if (type == "location") 
        {
			var time  = formatUITimeStampfromJodaDate(DateTime.now());
			var trigger = json.t;
            var con  = json.conn;
			var lat  = json.lat;
            var lon  = json.lon;
            var acc  = json.acc;
            var batt = json.batt;

            var geocodeURL = "https://maps.googleapis.com/maps/api/geocode/json?latlng="+lat+","+lon+"&key=XXXXXXX"
            var geocodeJson = JSON.parse(HTTP.sendHttpGetRequest(geocodeURL));
            var formattedAddress = "?";
            if (isUninitialized(geocodeJson))
            {
                formattedAddress = geocodeJson.results[0].formatted_address;
                formattedAddress = formattedAddress.replace(", Germany", "")
            }

			var distancematrixURL = "https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins="+lat+","+lon+"&destinations="+home_lat+","+home_lon+"&key=XXXXXXX&traffic_model=best_guess&mode=driving&departure_time=now"
            var distancematrixJson = JSON.parse(HTTP.sendHttpGetRequest(distancematrixURL));
            var durationintraffic = "?";
            var distance = "?";
            if (isUninitialized(distancematrixJson))
            {
                durationintraffic = distancematrixJson.rows[0].elements[0].duration_in_traffic.text;
                distance = distancematrixJson.rows[0].elements[0].distance.text;
            }

    		postUpdate(itemDistanceDuration,distance +" / "+ durationintraffic)
            postUpdate(itemInfo,lat +", "+lon+" - "+ formattedAddress) 
            postUpdate(itemBtn,time)
            postUpdate(itemTimeStamp,time)

            var action = getAction("Transformation").static;

            var out = "";
            if (con !== undefined)
            {
                out += "Connection: " + action.transform("MAP", "mqttconn.map", con) +", "
            }
            if (acc !== undefined)
            {
                out += "Genauigkeit: "+acc+" m"
            }
            if ((trigger !== undefined) && (trigger.length == 1))
            {
                out += ", Trigger: " + action.transform("MAP", "mqtttrigger.map", trigger)
            }
			postUpdate(itemConn,out)
            postUpdate(itemLocation,lat + "," + lon)
            postUpdate(itemBattery,batt)
            
            geocodeJson = null;
            distancematrixJson = null;
        }
    }
});
