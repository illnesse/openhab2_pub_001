'use strict';
load('/etc/openhab2/automation/jsr223/00_jslib/JSRule.js');

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

        if (cmd == "startkodi")
        {
            var results1 = executeCommandLineAndWaitResponse("/etc/openhab2/scripts/sh/firetv_shellstart.sh 192.168.178.26 org.xbmc.kodi/.Splash", 1000 *10);
            logInfo(results1);
        }
        else if (cmd == "scanlibrary")
        {
            var results1 = kodiCall('{ "jsonrpc": "2.0", "method": "VideoLibrary.Scan", "id": "mybash"}');
            logInfo(JSON.stringify(results1));
        }
        else
        {
            var results0 = executeCommandLineAndWaitResponse("sudo /etc/openhab2/scripts/sh/firetv_keyevent.sh 192.168.178.26 "+cmd, 1000 *10);
            logInfo(results0);
 
            logInfo("IsAlive(IP_kodi,8080,500) " + IsAlive(IP_kodi,8080,500));

            if (IsAlive(IP_kodi,8080,500))  
            {
                var results1 = kodiCall('{"jsonrpc": "2.0", "method": "Player.GetActivePlayers", "id": 1}');
                // var nullimg = "http://localhost:8080/static/null.png";
            
                if (results1.result[0] != undefined)
                {
                    if (results1.result[0].type == "video")
                    {
                        var results2 = kodiCall('{"jsonrpc": "2.0", "method": "Player.GetItem", "params": { "properties": ["title", "album", "artist", "season", "episode", "duration", "showtitle", "tvshowid", "thumbnail", "file", "fanart", "streamdetails"], "playerid": 1 }, "id": "VideoGetItem"}');
                        var label = results2.result.item.label;
                        // var thumbnail = decodeKodiThumbnailURL(results2.result.item.thumbnail);
                        postUpdate("Kodi_title",label);
                        // if (thumbnail == "") thumbnail = nullimg;
                        // postUpdate("Kodi_thumbnail",thumbnail);
                    }
                    else if (results1.result[0].type == "audio")
                    {
                        var results2 = kodiCall('{"jsonrpc": "2.0", "method": "Player.GetItem", "params": { "properties": ["title", "album", "artist", "duration", "thumbnail", "file", "fanart", "streamdetails"], "playerid": 0 }, "id": "AudioGetItem"}');
                        var label = results2.result.item.label;
                        // var thumbnail = decodeKodiThumbnailURL(results2.result.item.fanart);
                        postUpdate("Kodi_title",label);
                        // if (thumbnail == "") thumbnail = nullimg;
                        // postUpdate("Kodi_thumbnail",thumbnail);
                    }
                }
/*
                else
                {
                    postUpdate("Kodi_thumbnail",nullimg);
                }
*/
            }
        }
    }
});


var EchoTitlesTriggers = [];
itemRegistry.getItem("gEchoTriggers").getMembers().forEach(function (gEchoTriggerItem) 
{
    EchoTitlesTriggers.push(ItemStateChangeTrigger(gEchoTriggerItem.name));
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