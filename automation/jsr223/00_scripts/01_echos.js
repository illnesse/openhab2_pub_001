'use strict';
load('/etc/openhab2/automation/jsr223/00_jslib/JSRule.js');

var Echo1TitlesTriggers = [];
itemRegistry.getItem("gEchoTriggers").getMembers().forEach(function (gEchoTriggerItem) 
{
    Echo1TitlesTriggers.push(ItemStateChangeTrigger(gEchoTriggerItem.name));
});

JSRule({
    name: "Echo1Titles",
    description: "Line: "+__LINE__,
    triggers: Echo1TitlesTriggers,
    execute: function( module, input)
    {
        var triggeringItem = getItem(getTriggeringItemStr(input));
        var id = triggeringItem.name.split("_")[0];
        var itemProviderDisplayName = getItem(id+"_ProviderDisplayName");
        var itemSubtitle1 = getItem(id+"_Subtitle1");
        var itemSubtitle2 = getItem(id+"_Subtitle2");
        var itemSubtitles = getItem(id+"_Subtitles");

        createTimer(now().plusSeconds(1), function() 
        {
            var out = itemProviderDisplayName.state + " - " + itemSubtitle1.state + " - " + itemSubtitle2.state;
            //logInfo(itemProviderDisplayName.state + " /////// "+ itemSubtitle1.state + " ///// " + itemSubtitle2.state +" ///// " + itemSubtitles.state);
            postUpdate(itemSubtitles,out);
        });
    }
});

JSRule({
    name: "TTSOut1",
    description: "Line: "+__LINE__,
    triggers: [
        ItemCommandTrigger("TTSOut1")
    ],
    execute: function( module, input)
    {
        var itemTTSOut1 = getItem("TTSOut1");
        var itemEcho1_TTS = getItem("Echo1_TTS");

		var out = input.command
		logInfo(itemTTSOut1.name +": "+ out)
        sendCommand(itemEcho1_TTS,out)
    }
});

JSRule({
    name: "TTSOut2",
    description: "Line: "+__LINE__,
    triggers: [
        ItemCommandTrigger("TTSOut2")
    ],
    execute: function( module, input)
    {
        var itemTTSOut2 = getItem("TTSOut2");
        var itemEcho2_TTS = getItem("Echo2_TTS");

		var out = input.command
		logInfo(itemTTSOut2.name +": "+ out)
        sendCommand(itemEcho2_TTS,out)
    }
});

JSRule({
    name: "TTSOut1Quiet",
    description: "Line: "+__LINE__,
    triggers: [
        ItemCommandTrigger("TTSOut1Quiet")
    ],
    execute: function( module, input)
    {
        var itemTTSOut1Quiet = getItem("TTSOut1Quiet");
        var itemEcho1_TTS = getItem("Echo1_TTS");
        var itemEcho1_Volume = getItem("Echo1_Volume");

		var out = input.command
		logInfo(itemTTSOut1Quiet.name +": "+ out)
        sendCommand(itemEcho1_Volume,30)
        createTimer(now().plusSeconds(0.3), function() 
        {
            sendCommand(itemEcho1_TTS,out)
        });
    }
});

JSRule({
    name: "TTSOut2Quiet",
    description: "Line: "+__LINE__,
    triggers: [
        ItemCommandTrigger("TTSOut2Quiet")
    ],
    execute: function( module, input)
    {
        var itemTTSOut2Quiet = getItem("TTSOut2Quiet");
        var itemEcho2_TTS = getItem("Echo2_TTS");
        var itemEcho2_Volume = getItem("Echo2_Volume");

		var out = input.command
		logInfo(itemTTSOut2Quiet.name +": "+ out)
        sendCommand(itemEcho2_Volume,30)
        createTimer(now().plusSeconds(0.3), function() 
        {
            sendCommand(itemEcho2_TTS,out)
        });
    }
});