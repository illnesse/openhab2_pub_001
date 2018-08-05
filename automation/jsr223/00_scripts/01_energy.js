'use strict';
load('/etc/openhab2/automation/jsr223/00_jslib/JSRule.js');

var MODE_OFF = 0
var MODE_STANDBY = 1
var MODE_ACTIVE = 2
var MODE_FINISHED = 3

var timer = null;

var pricekWh = 0.2705; //€

function getPricekWh(kwh)
{
    return "("+round((kwh * pricekWh),2)+" € )";
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

        if (itemTPLinkPlug2_Power.state < 0.2) postUpdate(itemWashingmachine_OpState,MODE_OFF)
        else if (itemTPLinkPlug2_Power.state > 10) postUpdate(itemWashingmachine_OpState,MODE_ACTIVE)
        else if (itemTPLinkPlug2_Power.state < 3.0) {
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

JSRule({
    name: "TPLinkUIUpdate",
    description: "Line: "+__LINE__,
    triggers: [
        ItemStateChangeTrigger("TPLinkPlug1_Power"),
        ItemStateChangeTrigger("TPLinkPlug2_Power")
    ],
    execute: function( module, input)
    {
        var triggeringItem = getItem(getTriggeringItemStr(input));
        var toUpdate = triggeringItem.name.split("_")[0]

        var itemPower = triggeringItem 
        var itemUI = getItem(toUpdate+"_UI")
        var itemSignal = getItem(toUpdate+"_Signal")
        var itemCurrent = getItem(toUpdate+"_Current")
        var itemVoltage = getItem(toUpdate+"_Voltage")
        var out = round(itemPower.state,0) +" W ("+round(itemCurrent.state,2)+" A / "+round(itemVoltage.state,0)+" V) "+round(itemSignal.state,0)+" dBm"
        postUpdate(itemUI,out)

        var itemEnergyUsage = getItem(toUpdate+"_EnergyUsage");
        var itemEnergyUsage_Today = getItem(toUpdate+"_EnergyUsage_Today");
        var itemEnergyUsage_Month = getItem(toUpdate+"_EnergyUsage_Month");
        var itemEnergyUsage_Today_UI = getItem(toUpdate+"_EnergyUsage_Today_UI");

        var EnergyUsage_Month = 0;
        var EnergyUsage_PrevMonth = 0
        EnergyUsage_Month = itemEnergyUsage.state;
/*
        //uncomment this when we have a month worth of data so this isn't null
        var EnergyUsage_PrevMonth = historicState(itemEnergyUsage.name, now().minusDays(30)); //.,"influxdb"
        if (EnergyUsage_PrevMonth !== null) // if we don't have a full month of data yet
        {
            EnergyUsage_Month = itemEnergyUsage.state - EnergyUsage_PrevMonth;
        }
*/      
        var date = new Date();
        //date.setDate(date.getDate() - 1); //-1 day, yesterday
        date.setHours(0,0,0,0); //before midnight
        var itemEnergyUsage_SumYesterday = HistoricItem(itemEnergyUsage.name, now().minusDays(1));
        var itemEnergyUsage_Yesterday = HistoricItem(itemEnergyUsage_Today.name, formatISOStringtoJodaDateTimeZone(date.toISOString()));


        var EnergyUsage_SumYesterday = isUninitialized(itemEnergyUsage_SumYesterday) ? 0 : itemEnergyUsage_SumYesterday.state;
        var EnergyUsage_Yesterday = isUninitialized(itemEnergyUsage_Yesterday) ? 0 : itemEnergyUsage_Yesterday.state;
        //logInfo("formatISOStringtoJodaDateTimeZone(date.toISOString()) " + formatISOStringtoJodaDateTimeZone(date.toISOString()));
        //logInfo("itemEnergyUsage_today: " + itemEnergyUsage.state +" - "+ EnergyUsage_SumYesterday + " = " + (itemEnergyUsage.state - EnergyUsage_SumYesterday) + ", EnergyUsage_Yesterday: "+EnergyUsage_Yesterday)

        var today = (itemEnergyUsage.state - EnergyUsage_SumYesterday);
        if (isNaN(today)) today = 0;
        
        var delta = round(today - EnergyUsage_Yesterday,3);
        //logInfo("toUpdate " + toUpdate + " delta "+ delta +" today "+ today +" EnergyUsage_Yesterday "+ EnergyUsage_Yesterday);
        var usagetoday = round(today,3) + " kWh (? " + ((delta > 0) ? "+"+delta : delta ) + ") "+getPricekWh(today);

        postUpdate(itemEnergyUsage_Today,today)
        postUpdate(itemEnergyUsage_Today_UI, usagetoday )
        postUpdate(itemEnergyUsage_Month, EnergyUsage_Month )
    }
});

//var letzteAblesungWert = 561069


JSRule({
    name: "Energy per Day",
    description: "Line: "+__LINE__,
    triggers: [
        TimerTrigger("0 59 23 * * ?"),
        ItemCommandTrigger("TestBTN")
    ],
    execute: function( module, input)
    {
        var itemEnergyCounter = getItem("HM_EM_EnergyCounter");
        var itemEnergyUsage_Today = getItem("HM_EM_EnergyUsage_Today");
        var itemEnergyUsage_Month_UI = getItem("HM_EM_EnergyUsage_Month_UI");
        var itemEnergyUsage_Today_UI = getItem("HM_EM_EnergyUsage_Today_UI");
        
        var date = new Date();
        date.setHours(0,0,0,0); //before midnight

        var EnergyUsage_Month = 0;

        //today so far
        var EnergyUsage_Yesterday = HistoricItem(itemEnergyCounter.name, formatISOStringtoJodaDateTimeZone(date.toISOString())).state;
        var EnergyUsage_Today = itemEnergyCounter.state - EnergyUsage_Yesterday;
        logInfo("EnergyUsage_Today: " + EnergyUsage_Today + " at "+ formatISOStringtoJodaDateTimeZone(date.toISOString()));

        var delta = round(EnergyUsage_Today - EnergyUsage_Yesterday,3);
        //logInfo("toUpdate " + toUpdate + " delta "+ delta +" today "+ today +" EnergyUsage_Yesterday "+ EnergyUsage_Yesterday);
        var usagetoday = round(EnergyUsage_Today/1000,3) + " kWh (? " + ((delta > 0) ? "+":"") + delta/1000 + ") "+getPricekWh(EnergyUsage_Today/1000);

        postUpdate(itemEnergyUsage_Today,EnergyUsage_Today)
        postUpdate(itemEnergyUsage_Today_UI, usagetoday )
        postUpdate(itemEnergyUsage_Month_UI, EnergyUsage_Month)
        return;
    }
});
