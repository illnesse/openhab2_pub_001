'use strict';
load('/etc/openhab2/automation/jsr223/00_jslib/JSRule.js');

var kodiurl = "http://192.168.178.26:8080/jsonrpc?request=";

var EchoTitlesTriggers = [];
itemRegistry.getItem("gEchoTriggers").getMembers().forEach(function (gEchoTriggerItem) 
{
    EchoTitlesTriggers.push(ItemStateChangeTrigger(gEchoTriggerItem.name));
});

var TTS_OFF = 0;
var TTS_DEFAULT = 1;



JSRule({
    name: "FireTVCmd",
    description: "Line: "+__LINE__,
    triggers: [
        ItemCommandTrigger("FireTV_CMD")
    ],
    execute: function( module, input)
    {
        var cmd = input.command;

        logInfo("FireTVCmd cmd: "+cmd);
        var results1 = executeCommandLineAndWaitResponse("/etc/openhab2/scripts/sh/firetv_keyevent.sh 192.168.178.26 "+cmd, 1000 *10);
        //logInfo("FireTVCmd result: " + results1)

        var kodireturn = HTTP.sendHttpGetRequest(kodiurl + '{"jsonrpc": "2.0", "method": "Player.GetItem", "params": { "properties": ["title", "album", "artist", "season", "episode", "duration", "showtitle", "tvshowid", "thumbnail", "file", "fanart", "streamdetails"], "playerid": 1 }, "id": "VideoGetItem"}');
        var kodiresult = JSON.parse(kodireturn)
        var label = kodiresult.item.label
        getItem("Kodi_title",label)
    }
});

JSRule({
    name: "EchoTitles",
    description: "Line: "+__LINE__,
    triggers: EchoTitlesTriggers,
    execute: function( module, input)
    {
        var triggeringItem = getItem(getTriggeringItemStr(input));
        var id = triggeringItem.name.split("_")[0];
        var itemProviderDisplayName = getItem(id+"_ProviderDisplayName");
        var itemTitle = getItem(id+"_Title");
        var itemSubtitle1 = getItem(id+"_Subtitle1");
        var itemSubtitle2 = getItem(id+"_Subtitle2");
        var itemSubtitles = getItem(id+"_Subtitles");

        createTimer(now().plusSeconds(1), function() 
        {
            var out = itemTitle.state + " - " + itemProviderDisplayName.state + " - " + itemSubtitle1.state + " - " + itemSubtitle2.state;
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
