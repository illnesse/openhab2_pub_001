'use strict';
load('/etc/openhab2/automation/jsr223/00_jslib/JSRule.js');

JSRule({
    name: "Kodi_Play",
    description: "Line: "+__LINE__,
    triggers: [
        ItemCommandTrigger("Kodi_Play")
    ],
    execute: function( module, input)
    {
        var itemKodi_Play = getItem("Kodi_Play");
        var itemKodi_control = getItem("Kodi_control");

		logInfo("Kodi_Play" + Kodi_Play.state)
		if (itemKodi_Play.state == ON)  sendCommand(itemKodi_control,PLAY)
		if (itemKodi_Play.state == OFF) sendCommand(itemKodi_control,PAUSE)
    }
});
 