'use strict';
load('/etc/openhab2/automation/jsr223/00_jslib/JSRule.js');

var MODE_OFF = 0
var MODE_STANDBY = 1
var MODE_ACTIVE = 2
var MODE_FINISHED = 3

var timer = null;

var pricekWh = 0.2705; //€
var Whtotal = 5723000;

function getPricekWh(kwh)
{
    return "("+round((kwh * pricekWh),2)+" €)";
}

JSRule({
    name: "Washingmachine State",
    description: "Line: "+__LINE__,
    triggers: [
        ItemStateChangeTrigger("TPLinkPlug2_Power")
    ],
    execute: function( module, input)
    {
        var itemTPLinkPlug2_Power = getItem("TPLinkPlug2_Power");
        var itemTTSOut2 = getItem("TTSOut2");
        var itemWashingmachine_OpState = getItem("Washingmachine_OpState");

        if (itemTPLinkPlug2_Power.state < 0.2) 
        {
            postUpdate(itemWashingmachine_OpState,MODE_OFF)
            return;
        }

        if (itemTPLinkPlug2_Power.state > 10) 
        {
            postUpdate(itemWashingmachine_OpState,MODE_ACTIVE)
        } 
        else if (itemTPLinkPlug2_Power.state < 3.0) 
        {
            if (itemWashingmachine_OpState.state == MODE_OFF) postUpdate(itemWashingmachine_OpState,MODE_STANDBY)
            else if (itemWashingmachine_OpState.state == MODE_ACTIVE) 
            {
                if (isUninitialized(timer))
                {
                    // there have been periods over 10+ min < 4.5 W
                    timer = createTimer(now().plusSeconds(12*60), function() 
                    {
                        if (itemTPLinkPlug2_Power.state < 4.5)
                        {
                            sendCommand(itemTTSOut2,"Die Waschmaschine ist fertig!");
                            postUpdate(itemWashingmachine_OpState,MODE_FINISHED);
                        }
                        timer = null;
                    });
                }
            }
        }
   
    }
});


function energyUpdate(id,kilo)
{
    // id is item id, kilo is 1000 for watts, 1 for kw
    var toUpdate = id

    var itemEnergyUsage;
    var addwh = 0;

    if (id != "HM_EM")
    {
        var itemPower = getItem(toUpdate+"_Power")
        var itemUI = getItem(toUpdate+"_UI")
        var itemSignal = getItem(toUpdate+"_Signal")
        var itemCurrent = getItem(toUpdate+"_Current")
        var itemVoltage = getItem(toUpdate+"_Voltage")
        var out = round(itemPower.state,0) +" W ("+round(itemCurrent.state,2)+" A / "+round(itemVoltage.state,0)+" V) "+round(itemSignal.state,0)+" dBm"
        postUpdate(itemUI,out)

        itemEnergyUsage = getItem(toUpdate+"_EnergyUsage");
    }
    else
    {
        itemEnergyUsage = getItem(toUpdate+"_EnergyCounter");
        addwh = Whtotal;
    }

    var itemEnergyUsage_Total_UI = getItem(toUpdate+"_EnergyCounter_Total_UI");
    var itemEnergyUsage_Today = getItem(toUpdate+"_EnergyUsage_Today");
    var itemEnergyUsage_Month_UI = getItem(toUpdate+"_EnergyUsage_Month_UI");
    var itemEnergyUsage_Today_UI = getItem(toUpdate+"_EnergyUsage_Today_UI");

    var date = new Date();
    date.setHours(2,0,0,0); //midnight

    var EnergyUsage_Month = 0;

    var EnergyUsage_BeginOfDay = HistoricItem(itemEnergyUsage.name, formatISOStringtoJodaDateTimeZone(date.toISOString())).state;
    var EnergyUsage_Today = itemEnergyUsage.state - EnergyUsage_BeginOfDay;

    date = new Date();
    date.setDate(date.getDate() - 1);

    var EnergyUsage_Yesterday = HistoricItem(itemEnergyUsage_Today.name, formatISOStringtoJodaDateTimeZone(date.toISOString())).state;

    //logInfo(toUpdate +" itemEnergyUsage.state "+ itemEnergyUsage.state +" EnergyUsage_BeginOfDay "+ EnergyUsage_BeginOfDay + " since "+ formatISOStringtoJodaDateTimeZone(date.toISOString()));

    var delta = round((EnergyUsage_Today - EnergyUsage_Yesterday)/kilo,3);
    var usagetoday = round(EnergyUsage_Today/kilo,3) + " kWh (? " + ((delta > 0) ? "+":"") + delta + ") "+getPricekWh(EnergyUsage_Today/kilo);
    
    postUpdate(itemEnergyUsage_Total_UI, round(itemEnergyUsage.state + addwh,3));
    postUpdate(itemEnergyUsage_Today, EnergyUsage_Today)
    postUpdate(itemEnergyUsage_Today_UI, usagetoday)
    postUpdate(itemEnergyUsage_Month_UI, EnergyUsage_Month)
}

JSRule({
    name: "TPLinkUIUpdate",
    description: "Line: "+__LINE__,
    triggers: [
        ItemStateChangeTrigger("TPLinkPlug1_EnergyUsage"),
        ItemStateChangeTrigger("TPLinkPlug2_EnergyUsage")
    ],
    execute: function( module, input)
    {
        var triggeringItem = getItem(getTriggeringItemStr(input));
        energyUpdate(triggeringItem.name.split("_")[0],1);
    }
});

JSRule({
    name: "TPLinkUIUpdate",
    description: "Line: "+__LINE__,
    triggers: [
        TimerTrigger("0 0/10 * * * ?"),
        ItemCommandTrigger("TestBTN")
    ],
    execute: function( module, input)
    {
        energyUpdate("TPLinkPlug1",1);
        energyUpdate("TPLinkPlug2",1);
    }
});


JSRule({
    name: "Energy per Day",
    description: "Line: "+__LINE__,
    triggers: [
        ItemStateChangeTrigger("HM_EM_EnergyCounter"),
        TimerTrigger("0 0/10 * * * ?"),
        ItemCommandTrigger("TestBTN")
    ],
    execute: function( module, input)
    {
        energyUpdate("HM_EM",1000);
    }
});

