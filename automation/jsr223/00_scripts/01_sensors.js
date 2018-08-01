'use strict';
load('/etc/openhab2/automation/jsr223/00_jslib/JSRule.js');

JSRule({
    name: "DoorSensor",
    description: "Line: "+__LINE__,
    triggers: [
        ItemStateChangeTrigger("HMDoor1"),
        ItemCommandTrigger("SysStartup","ON")
    ],
    execute: function( module, input)
    {
        var itemHMDoor1 = getItem("HMDoor1");
        var itemTTSOut2 = getItem("TTSOut2");
        var itemHMDoor1UI = getItem("HMDoor1UI");

        var state = input.newState;
        if (state === null) state = itemHMDoor1.state;

        if (state == OPEN)
        {
            sendCommand(itemTTSOut2,"Haustüre geöffnet.")
        }
        else
        {
            sendCommand(itemTTSOut2,"Haustüre geschlossen.")
        }
        persist(itemHMDoor1);
        postUpdate(itemHMDoor1UI,formatUITimeStampfromJodaDate(DateTime.now()) + " 　" + state)
    }
});

JSRule({
    name: "MotionSensor",
    description: "Line: "+__LINE__,
    triggers: [
        ItemStateUpdateTrigger("OsramSensorTriggered"),
        ItemCommandTrigger("SysStartup","ON")
    ],
    execute: function( module, input)
    {
        var itemOsramSensorTriggered = getItem("OsramSensorTriggered");
        var itemOsramSensorTriggeredUI = getItem("OsramSensorTriggeredUI");

        var state = input.state;
        if (state === null) state = itemOsramSensorTriggered.state;

        persist(itemOsramSensorTriggered);
        postUpdate(itemOsramSensorTriggeredUI,formatUITimeStampfromJodaDate(DateTime.now()) + " 　" + state)
    }
});
