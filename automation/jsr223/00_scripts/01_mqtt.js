'use strict';
load('/etc/openhab2/automation/jsr223/00_jslib/JSRule.js');

var home_lat = "12.3456789";
var home_lon = "12.3456789";

var gMQTT_CommandTriggers = [];
itemRegistry.getItem("gMQTT_CommandsStr").getMembers().forEach(function (gMQTT_CommandsStrItem) 
{
    gMQTT_CommandTriggers.push(ItemCommandTrigger(gMQTT_CommandsStrItem.name));
});

JSRule({
    name: "gMQTT Commands",
    description: "Line: "+__LINE__,
    triggers: gMQTT_CommandTriggers,
    execute: function( module, input)
    {
        var triggeringItem = getItem(getTriggeringItemStr(input));
        if      (triggeringItem.name == "MQTT_TV") sendMQTT("local","broadlink/tv/samsung/" + input.command, "replay")
        else if (triggeringItem.name == "MQTT_AUDIO") sendMQTT("local","broadlink/audio/sony/" + input.command, "replay")
        else if (triggeringItem.name == "MQTT_SWITCH") sendMQTT("local","broadlink/hdmiswitch/" + input.command, "replay")
        else if (triggeringItem.name == "MQTT_AC") sendMQTT("local","broadlink/ac/" + input.command, "replay")
        else if (triggeringItem.name == "MQTT_FAN") sendMQTT("local","broadlink/fan/obi/" + input.command, "replay")
        else if (triggeringItem.name == "MQTT_PC_SYSTEM") sendMQTT("local", "wt/system/commands/" + input.command, "true")
        else if (triggeringItem.name == "MQTT_PC_DESKTOP") sendMQTT("local", "wt/desktop/commands/" + input.command, "true")
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
                sendMQTT("local","broadlink/sat/humax/0", "replay")
                sleep(broadlink_delay);
                sendMQTT("local","broadlink/sat/humax/0", "replay")
                sleep(broadlink_delay);
                sendMQTT("local","broadlink/sat/humax/" + receivedCommand.toString().substring(0, 1), "replay")
                sleep(broadlink_delay);
                sendMQTT("local","broadlink/sat/humax/" + receivedCommand.toString().substring(1, 2), "replay")
            }
            else
            {
                sendMQTT("local","broadlink/sat/humax/0", "replay")
                sleep(broadlink_delay);
                sendMQTT("local","broadlink/sat/humax/0", "replay")
                sleep(broadlink_delay);
                sendMQTT("local","broadlink/sat/humax/0", "replay")
                sleep(broadlink_delay);
                sendMQTT("local","broadlink/sat/humax/" + receivedCommand, "replay")
            }
        }
        else
        {
            sendMQTT("local","broadlink/sat/humax/" + receivedCommand, "replay")
        }
    }
});

JSRule({
    name: "MQTT_Phone_S_Update",
    description: "Line: "+__LINE__,
    triggers: [
        ItemCommandTrigger("MQTT_Phone_S_Update"),
        ItemCommandTrigger("SysStartup",2),
        TimerTrigger("0 */15 * ? * *")
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
        ItemCommandTrigger("SysStartup",2),
        TimerTrigger("0 */15 * ? * *")
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
    name: "MQTT_NodeMCU_MultiSensor_1 parse",
    description: "Line: "+__LINE__,
    triggers: [
        ItemStateChangeTrigger("MQTT_NodeMCU_MultiSensor_1")
    ],
    execute: function( module, input)
    {
        //logInfo(input.newState);
        var triggeringItem = getItem(getTriggeringItemStr(input));
        var selector = triggeringItem.name;

        var itemTemp = getItem(selector+"_Temp");
        var itemHum = getItem(selector+"_Hum");
        var itemMotion = getItem(selector+"_Motion");

        var json = JSON.parse(input.newState);
        postUpdate(itemTemp,json.temperature);
        postUpdate(itemHum,json.humidity);
        postUpdate(itemMotion,((json.motion == "motion detected")?ON:OFF));
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
        var itemAcc = getItem("MQTT_Phone_"+selector+"_Acc");
        var itemBattery = getItem("MQTT_Phone_"+selector+"_Batt");
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
            var batt = parseInt(json.batt);

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
            postUpdate(itemAcc,acc)
            postUpdate(itemLocation,lat + "," + lon)
            postUpdate(itemBattery,batt);
            
            geocodeJson = null;
            distancematrixJson = null;
        }
    }
});

JSRule({
    name: "MQTT_Shellys",
    description: "Line: "+__LINE__,
    triggers: [
        ItemCommandTrigger("MQTT_Shelly_Heizung"),
        ItemCommandTrigger("MQTT_Shelly_KWand"),
        ItemCommandTrigger("MQTT_Shelly_Gang")
    ],
    execute: function( module, input)
    {
        var toUpdate  = getTriggeringItemStr(input).split("_")[2];
        var state;

        //logInfo("MQTT_Shelly_" + toUpdate + ": input: " + input.command)
       
        if (input.command == ON) state = "on";
        else if (input.command == OFF) state = "off";
        else state = input.command;

        //logInfo("MQTT_Shelly_" + toUpdate + ": " + state)
        if (toUpdate == "Heizung") sendMQTT("local", "shellies/shelly1-0592EC/relay/0/command", state, true)
        else if (toUpdate == "KWand") sendMQTT("local", "shellies/shelly1-5BABCD/relay/0/command", state, true)
        else if (toUpdate == "Gang") sendMQTT("local", "shellies/shelly1-4A59EF/relay/0/command", state, true)
    }
});
