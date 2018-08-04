'use strict';
load('/etc/openhab2/automation/jsr223/00_jslib/JSRule.js');

var Echo1TitlesTriggers = [];
itemRegistry.getItem("gEchoTriggers").getMembers().forEach(function (gEchoTriggerItem) 
{
    Echo1TitlesTriggers.push(ItemStateChangeTrigger(gEchoTriggerItem.name));
});

var TTS_OFF = 0;
var TTS_DEFAULT = 1;


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

function TTSOut(id,quiet,out)
    {
    var itemTTSMode = getItem("TTSMode");
    var mode = (itemTTSMode.state != null) ? itemTTSMode.state : TTS_DEFAULT;

    logInfo("TTSOut"+id+" quiet:"+quiet+" mode: "+mode+" "+ out)

    if (mode == TTS_OFF) return;

    if (quiet)
    {
        sendCommand("Echo"+id+"_Volume",30)
        createTimer(now().plusSeconds(0.3), function() 
        {
            sendCommand("Echo"+id+"_TTS",out)
        });
    }
    else
    {
        sendCommand("Echo"+id+"_TTS",out)
    }
}

JSRule({
    name: "TTSOut1",
    description: "Line: "+__LINE__,
    triggers: [
        ItemCommandTrigger("TTSOut1"),
        ItemCommandTrigger("TTSOut2"),
        ItemCommandTrigger("TTSOut1Quiet"),
        ItemCommandTrigger("TTSOut2Quiet")
    ],
    execute: function( module, input)
    {
        var triggeringItem = getItem(getTriggeringItemStr(input));
        if      (triggeringItem.name == "TTSOut1") TTSOut(1,false,input.command);
        else if (triggeringItem.name == "TTSOut2") TTSOut(2,false,input.command);
        else if (triggeringItem.name == "TTSOut1Quiet") TTSOut(1,true,input.command);
        else if (triggeringItem.name == "TTSOut2Quiet") TTSOut(2,true,input.command);
    }
});
