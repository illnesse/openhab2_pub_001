'use strict';
load('/etc/openhab2/automation/jsr223/00_jslib/JSRule.js');

var AtHomeSTimer = null;
var AtHomeJTimer = null;

function checkLatency(toUpdate)
{
    //var triggeringItem = getItem(getTriggeringItemStr(input));
    //var toUpdate = triggeringItem.name.split("Latency")[0]
    var online = (getItem(toUpdate+"Latency").state == "UNDEF") ? false : true;

    //logInfo("HandySLatency changedsince 1min? "+changedSince(getItem("HandySLatency"),now().minusSeconds(6)));
    //logInfo("HandyJLatency changedsince 1min? "+changedSince(getItem("HandyJLatency"),now().minusSeconds(6)));

    if (online)
    {
        if (toUpdate == "HandyS")
        {
            var itemAtHomeS = getItem("AtHomeS");
            if (itemAtHomeS.state != ON) postUpdate(itemAtHomeS,ON)
            if (!isUninitialized(AtHomeSTimer)) {
                AtHomeSTimer.cancel();
                AtHomeSTimer = null;
            }
        }
        else if (toUpdate == "HandyJ")
        {
            var itemAtHomeJ = getItem("AtHomeJ");
            if (itemAtHomeJ.state != ON) postUpdate(itemAtHomeJ,ON)
            if (!isUninitialized(AtHomeJTimer)) {
                AtHomeJTimer.cancel();
                AtHomeJTimer = null;
            }
        }
    }
    else
    {
        if ((toUpdate == "HandyS") && isUninitialized(AtHomeSTimer))
        {
            var itemAtHomeS = getItem("AtHomeS");
            if (itemAtHomeS.state != OFF)
            {
                logInfo(toUpdate +" debug 1: "+ online);
                AtHomeSTimer = createTimer(now().plusSeconds(3*60), function() 
                {
                    var itemAtHomeS = getItem("AtHomeS");
                    var itemLatency = getItem("HandySLatency");
                    logInfo(toUpdate +" debug 2: "+ (itemLatency.state != "UNDEF"));
                    if (itemLatency.state == "UNDEF")
                    {
                        logInfo(toUpdate +" debug 3: "+ (itemLatency.state != "UNDEF"));
                        postUpdate(itemAtHomeS,OFF)
                    } 
                    if (!isUninitialized(AtHomeSTimer)) 
                    {
                        AtHomeSTimer.cancel();
                        AtHomeSTimer = null;
                    }
                });
            }
        }
        else if ((toUpdate == "HandyJ") && isUninitialized(AtHomeJTimer))
        {
            var itemAtHomeJ = getItem("AtHomeJ");
            if (itemAtHomeJ.state != OFF)
            {
                logInfo(toUpdate +" debug 1: "+ online);
                AtHomeJTimer = createTimer(now().plusSeconds(3*60), function() 
                {
                    var itemAtHomeJ = getItem("AtHomeJ");
                    var itemLatency = getItem("HandyJLatency");
                    logInfo(toUpdate +" debug 2: "+ itemLatency.state);
                    if (itemLatency.state == "UNDEF")
                    {
                        logInfo(toUpdate +" debug 3: "+ (itemLatency.state != "UNDEF"));
                        postUpdate(itemAtHomeJ,OFF)
                    }
                    if (!isUninitialized(AtHomeJTimer))
                    {
                        AtHomeJTimer.cancel();
                        AtHomeJTimer = null;
                    }
                });
            }
        }
    }
}

JSRule({
    name: "gOnlineTriggersEvent",
    description: "Line: "+__LINE__,
    triggers: [
        ItemStateChangeTrigger("HandySLatency"),
        ItemStateChangeTrigger("HandyJLatency")
    ],
    execute: function( module, input)
    {
        var triggeringItem = getItem(getTriggeringItemStr(input));
        var toUpdate = triggeringItem.name.split("Latency")[0]
        checkLatency(toUpdate);
    }
});

JSRule({
    name: "gOnlineTriggersCron",
    description: "Line: "+__LINE__,
    triggers: [
        TimerTrigger("0 0/5 * * * ?")
    ],
    execute: function( module, input)
    {
        checkLatency("HandyS");
        checkLatency("HandyJ");
    }
});

JSRule({
    name: "Welcome Msg",
    description: "Line: "+__LINE__,
    triggers: [
        ItemStateChangeTrigger("HMDoor1"),
        ItemStateChangeTrigger("OsramSensorTriggered"),
        ItemStateChangeTrigger("OsramSensor_2_Triggered"),
        ItemStateChangeTrigger("OsramSensor_3_Triggered"),
        ItemStateChangeTrigger("MQTT_NodeMCU_MultiSensor_1_Motion"),
        ItemStateChangeTrigger("AtHomeS"),
        ItemStateChangeTrigger("AtHomeJ")
    ],
    execute: function( module, input)
    {
        //logInfo(input + " - " + getTriggeringItemStr(input))
        var JsJodaNow = JSJoda.LocalDateTime.now();
        var AtHome = false;
        var id = "";

        if (getTriggeringItemStr(input) == "AtHomeS")
        {
            id == "S";
            if (input.newState == ON) AtHome = true;
            else presenceChanged(id,false);
        }
        else if (getTriggeringItemStr(input) == "AtHomeJ")
        {
            id == "J";
            if (input.newState == ON) AtHome = true;
            else presenceChanged(id,false);
        }
        else
        {
            var AtHome_minutes;
            var AtHomeS_minutes = (JSJoda.convert(jodaDate(JsJodaNow)).toEpochMilli() - JSJoda.convert(jodaDate(lastUpdate("AtHomeS"))).toEpochMilli()) /1000 / 60;
            var AtHomeJ_minutes = (JSJoda.convert(jodaDate(JsJodaNow)).toEpochMilli() - JSJoda.convert(jodaDate(lastUpdate("AtHomeJ"))).toEpochMilli()) /1000 / 60;

            if (AtHomeS_minutes > AtHomeJ_minutes)
            {
                id = "J";
                AtHome_minutes = AtHomeJ_minutes;
            }
            else
            {
                id = "S";
                AtHome_minutes = AtHomeS_minutes;
            }

            if (AtHome_minutes > 10) return;                
        }

        if (!AtHome)
        {
            return;
        } 
        else
        {
            var Sensor_minutes;
            if (getTriggeringItemStr(input) == "OsramSensorTriggered")
            {
                Sensor_minutes = (JSJoda.convert(jodaDate(JsJodaNow)).toEpochMilli() - JSJoda.convert(jodaDate(lastUpdate("OsramSensorTriggered"))).toEpochMilli()) /1000 / 60;
            }
            else if (getTriggeringItemStr(input) == "OsramSensor_2_Triggered")
            {
                Sensor_minutes = (JSJoda.convert(jodaDate(JsJodaNow)).toEpochMilli() - JSJoda.convert(jodaDate(lastUpdate("OsramSensor_2_Triggered"))).toEpochMilli()) /1000 / 60;
            }
            else if (getTriggeringItemStr(input) == "OsramSensor_3_Triggered")
            {
                Sensor_minutes = (JSJoda.convert(jodaDate(JsJodaNow)).toEpochMilli() - JSJoda.convert(jodaDate(lastUpdate("OsramSensor_3_Triggered"))).toEpochMilli()) /1000 / 60;
            }
            else if (getTriggeringItemStr(input) == "MQTT_NodeMCU_MultiSensor_1_Motion")
            {
                Sensor_minutes = (JSJoda.convert(jodaDate(JsJodaNow)).toEpochMilli() - JSJoda.convert(jodaDate(lastUpdate("MQTT_NodeMCU_MultiSensor_1_Motion"))).toEpochMilli()) /1000 / 60;
            }

            var HMDoor1_minutes = (JSJoda.convert(jodaDate(JsJodaNow)).toEpochMilli() - JSJoda.convert(jodaDate(lastUpdate("HMDoor1"))).toEpochMilli()) /1000 / 60;


            //logInfo(HMDoor1_minutes);

            if ((HMDoor1_minutes < 10) && (Sensor_minutes < 10))
            {
                logInfos(id + " zuhause " + getTriggeringItemStr(input))
                presenceChanged(id,false);
            }
        }
    }
});


function presenceChanged(id,state)
{
    var name;
    if (id == "S") name = "Sebastian";
    else if (id == "J") name = "Janine";

    var itemfboxMissedCalls = getItem("fboxMissedCalls");

    var itemAtHomeBegin = getItem("AtHome"+id+"Begin");
    var itemAtHomeEnd = getItem("AtHome"+id+"End");
    var itemTTSOut2 = getItem("TTSOut2");

    var MissedCalls = ""
    if (itemfboxMissedCalls.state > 0)
    {
        MissedCalls = "Es gibt "
        if (itemfboxMissedCalls.state == 1)
        {
            MissedCalls += "einen verpassten Anruf. "
        }
        else
        {
            MissedCalls += itemfboxMissedCalls.state + " verpasste Anrufe. "
        }
    }

    var JsJodaNow = JSJoda.LocalDateTime.now();
    var currentTime = "Es ist "+JsJodaNow.hour() +" Uhr "+ JsJodaNow.minute();
    var minutes

    if (state != true) //gone
    {
        minutes = (JSJoda.convert(jodaDate(JsJodaNow)).toEpochMilli() - JSJoda.convert(jodaDate(itemAtHomeBegin.state)).toEpochMilli()) /1000 / 60; //= jodaDate(itemAtHomeBegin.state).compareTo(JsJodaNow) / 1000 / 60;
        var hours = round(minutes/60,2);
        logInfo(id + " is away, has been home for " + hours + " h");

        postUpdate(itemAtHomeEnd, JsJodaNow + "Z" );
        var execResult = executeCommandLineAndWaitResponse("/etc/openhab2/scripts/sh/calpost.sh XXXXXXXXXXX@group.calendar.google.com post \""+id+" zu Hause ("+hours+" h)\" "+ jodaDate(itemAtHomeBegin.state).minusHours(2) +"Z"+" "+ JsJodaNow.minusHours(2) + "Z", 120*1000);
        //logInfo("PostCalEvents", execResult);
    }
    else //home
    {
        minutes = (JSJoda.convert(jodaDate(JsJodaNow)).toEpochMilli() - JSJoda.convert(jodaDate(itemAtHomeEnd.state)).toEpochMilli()) / 1000 / 60;//jodaDate(itemAtHomeEnd.state).compareTo(JsJodaNow) / 1000 / 60;
        var hours = round(minutes/60,2);
        logInfo(id + " is home, has been away for "+ hours +" h")

        postUpdate(itemAtHomeBegin, JsJodaNow + "Z" );
        if (minutes > 10) 
        {
            var timeout = hours +" Stunden"
            var  out = "Willkommen Daheim "+name+", du warst " + timeout.replace(".", ",") + " lang weg. " + MissedCalls + currentTime
            sendCommand(itemTTSOut2,out)
        }
    }
}