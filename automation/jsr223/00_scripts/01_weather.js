'use strict';
load('/etc/openhab2/automation/jsr223/00_jslib/JSRule.js');

function tempUI(itemUI, itemTemperature, itemFeelsLike)
{
    var out;
    out = itemTemperature.state.toString() +" °C, feels like "+ round(itemFeelsLike.state,1) +" °C";
    postUpdate(itemUI,out);
}

function humidex(temp, hum)
{
    if ((temp == null) || (hum == null)) { return; }
    var x = 7.5 * temp/(237.7 + temp)
    var e = 6.112 * Math.pow(10, x) * hum/100
    var out = temp + (5 / 9) * (e - 10)
    return out;
}

JSRule({
    name: "tempUIOutdoor",
    description: "Line: "+__LINE__,
    triggers: [
        ItemStateUpdateTrigger("Temperature"),
        ItemStateUpdateTrigger("Humidity"),
        ItemCommandTrigger("SysStartup","ON")
    ],
    execute: function( module, input)
    {
        var itemTemperature = getItem("Temperature");
        var itemHumidity = getItem("Humidity");
        var itemFeelsLikeOutdoor = getItem("FeelsLikeOutdoor");
        var itemTemperature_UI_Outdoor = getItem("Temperature_UI_Outdoor");

        if ((itemTemperature.state == null) || (itemHumidity.state == null)) { return; }
        postUpdate(itemFeelsLikeOutdoor,humidex(itemTemperature.state, itemHumidity.state));
        tempUI(itemTemperature_UI_Outdoor, itemTemperature, itemFeelsLikeOutdoor);
    }
});

JSRule({
    name: "tempUIIndoor",
    description: "Line: "+__LINE__,
    triggers: [
        ItemStateUpdateTrigger("HMTemp1"),
        ItemStateUpdateTrigger("HMTemp1HUM"),
        ItemCommandTrigger("SysStartup","ON")
    ],
    execute: function( module, input)
    {
        var itemHMTemp1 = getItem("HMTemp1");
        var itemHMTemp1HUM = getItem("HMTemp1HUM");
        var itemFeelsLikeIndoor = getItem("FeelsLikeIndoor");
        var itemTemperature_UI_Indoor = getItem("Temperature_UI_Indoor");

        if ((itemHMTemp1.state == null) || (itemHMTemp1HUM.state == null)) { return; }
        postUpdate(itemFeelsLikeIndoor,humidex(itemHMTemp1.state, itemHMTemp1HUM.state));
        tempUI(itemTemperature_UI_Indoor, itemHMTemp1, itemFeelsLikeIndoor);
    }
});

JSRule({
    name: "PollenString",
    description: "Line: "+__LINE__,
    triggers: [
        ItemCommandTrigger("TestBTN"),
        ItemCommandTrigger("SysStartup","ON"),
        TimerTrigger("0 0 */3 ? * *")
    ],
    execute: function( module, input)
    {
        var PLZ = "90762"
        var pollenURL = "http://www.allergie.hexal.de/pollenflug/xml-interface-neu/pollen_de_7tage.php?plz="+PLZ;
        var pollenXML = HTTP.sendHttpGetRequest(pollenURL);

        if (pollenXML != null)
        {
            var action = getAction("Transformation").static;
            var pollen = "";
            pollen += action.transform("MAP", "pollen.map", action.transform("XSLT", "pollen1.xsl", pollenXML)) + " ";
            pollen += action.transform("MAP", "pollen.map", action.transform("XSLT", "pollen2.xsl", pollenXML)) + " ";
            pollen += action.transform("MAP", "pollen.map", action.transform("XSLT", "pollen3.xsl", pollenXML)) + " ";
            pollen += action.transform("MAP", "pollen.map", action.transform("XSLT", "pollen4.xsl", pollenXML)) + " ";
            pollen += action.transform("MAP", "pollen.map", action.transform("XSLT", "pollen5.xsl", pollenXML));
    
            //logInfo("Pollen: " + pollen)
            var itemPollenUI = getItem("PollenUI");
            postUpdate(itemPollenUI,pollen)
            pollenXML = null;
        }
    }
});