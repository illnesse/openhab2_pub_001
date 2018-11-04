'use strict';
load('/etc/openhab2/automation/jsr223/00_jslib/JSRule.js');

JSRule({
    name: "DoorSensor",
    description: "Line: "+__LINE__,
    triggers: [
        ItemStateChangeTrigger("HMDoor1")
    ],
    execute: function( module, input)
    {
        var itemHMDoor1 = getItem("HMDoor1");
        var itemTTSOut2 = getItem("TTSOut2");
        var itemHMDoor1UI = getItem("HMDoor1UI");

        var state = input.newState;
        if (isUninitialized(state)) state = itemHMDoor1.state;

        if (state == OPEN)
        {
            sendCommand(itemTTSOut2,"Haustüre geöffnet.")
        }
        else
        {
            sendCommand(itemTTSOut2,"Haustüre geschlossen.")
        }
        //persist(itemHMDoor1);
        postUpdate(itemHMDoor1UI,formatUITimeStampfromJodaDate(DateTime.now()) + " 　" + state)
    }
});

JSRule({
    name: "MotionSensor",
    description: "Line: "+__LINE__,
    triggers: [
        ItemStateChangeTrigger("OsramSensorTriggered"),
        ItemStateChangeTrigger("OsramSensor_2_Triggered"),
        ItemStateChangeTrigger("OsramSensor_3_Triggered"),
        ItemStateChangeTrigger("MQTT_NodeMCU_MultiSensor_1_Motion")
    ],
    execute: function( module, input)
    {
        var triggeringItem = getItem(getTriggeringItemStr(input));
        var state = input.state;
        if (isUninitialized(state)) state = triggeringItem.state;

        // if ((getItem("HourNow").state >= 23) || (getItem("HourNow").state <= 7))
        // {
            if (triggeringItem.name == "OsramSensorTriggered")
            {
                sendCommand("MQTT_Shelly_Gang",state);
            }
            else if (triggeringItem.name == "OsramSensor_2_Triggered")
            {
                sendCommand("MQTT_Shelly_KWand",state);
            }
        // }
        var itemSensorTriggeredUI = getItem(triggeringItem.name+"UI");
        postUpdate(itemSensorTriggeredUI,formatUITimeStampfromJodaDate(DateTime.now()) + " 　" + state)
    }
});


JSRule({
    name: "HMKeymatic1State",
    description: "Line: "+__LINE__,
    triggers: [
        ItemStateChangeTrigger("HMKeymatic1State")
    ],
    execute: function( module, input)
    {
        var triggeringItem = getItem(getTriggeringItemStr(input));
        //var itemTTSOut2 = getItem("TTSOut2");
        var state = input.state;
        if (isUninitialized(state)) state = triggeringItem.state;

        logInfo("keymatic " + state)

        /*
        if (state == ON)
        {
            sendCommand(itemTTSOut2,"Haustüre entriegelt");
        }
        else if (state == OFF)
        {
            sendCommand(itemTTSOut2,"Haustüre verriegelt");
        }
        */
    }
});


var ringTimer = null;
var klingelmsg = "Es hat geklingelt";

JSRule({
    name: "HMKlingelSensorPress",
    description: "Line: "+__LINE__,
    triggers: [
        ItemStateChangeTrigger("HMKlingelSensorPressShort")
    ],
    execute: function( module, input)
    {
        if (ringTimer == null)
        {
            var triggeringItem = getItem(getTriggeringItemStr(input));
            var state = input.state;
            if (isUninitialized(state)) state = triggeringItem.state;
    
            if ((triggeringItem.name == "HMKlingelSensorPressShort") && (state == ON))
            {
                logInfo("HMKlingelSensorPressShort " + state)
                sendCommand("TTSOut2Override",klingelmsg);
                ringTimer = createTimer(now().plusSeconds(2), function() 
                {
                    sendCommand("TTSOut1Override",klingelmsg);
                    ringTimer = null;
                });
            }
        }
    }
});

