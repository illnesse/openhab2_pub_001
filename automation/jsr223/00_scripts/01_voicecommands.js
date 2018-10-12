'use strict';
load('/etc/openhab2/automation/jsr223/00_jslib/JSRule.js');

var echoTimer1 = null;
var echoTimer2 = null;


Array.prototype.diff = function(a) {
    return this.filter(function(i) {return a.indexOf(i) < 0;});
};

String.prototype.has = function(s) {
    return (this.indexOf(s) !== -1);
};

/*
JSRule({
    name: "AlexaCommands2",
    description: "Line: "+__LINE__,
    triggers: [
        ChannelTrigger("amazonechocontrol:echo:account1:echo1:lastVoiceCommand"),
        ChannelTrigger("amazonechocontrol:echo:account1:echo2:lastVoiceCommand")
    ],
    execute: function( module, input)
    {
        logInfo(input);
    }
});
*/

function handled(toUpdate,ok)
{
    if (ok == true) sendCommand(toUpdate+"_TTS","OK");
}

JSRule({
    name: "AlexaCommands",
    description: "Line: "+__LINE__,
    triggers: [
        ItemStateChangeTrigger("Echo1_lastVoiceCommand"),
        ItemStateChangeTrigger("Echo2_lastVoiceCommand")
    ],
    execute: function( module, input)
    {
        var triggeringItem = getItem(getTriggeringItemStr(input));
        var toUpdate = triggeringItem.name.split("_")[0]

        var cmd = triggeringItem.state.toString().toLowerCase().split(" ");
        var remove = ["alexa","der","die","das","den"];

        cmd = cmd.diff(remove)
        cmd = cmd.join(" ");

        if (cmd.has("sprich mir nach")) 
        {
            logInfo("AlexaCommands 'sprich mir nach' filter");
            return;
        }

        logInfo("AlexaCommands : "+cmd);
        if ((cmd == "stop") || (cmd == "stopp")) return;
        if ((cmd == "lauter") || (cmd == "leiser")) return;

        // to do keep as array?

        var state;
        var stateonoff;
        var action = null;

        if (cmd.has("an")) state = true;
        else if (cmd.has("aus")) state = false;

        stateonoff = (state) ? ON : OFF;

        if ((cmd.has("schalt um")) || (cmd.has("schalte um"))) action = "channelchangestate";
        else if ((cmd.has("mach")) || (cmd.has("mache")) || (cmd.has("schalt")) || (cmd.has("schalte"))) action = "changestate";
        else if ((cmd.has("switch"))) action = "switch";
        else if ((cmd.has("play"))) action = "play";
        else if ((cmd.has("pause"))) action = "pause";
        else if ((cmd.has("zurückspulen"))) action = "zurückspulen";
        else if ((cmd.has("vorspulen"))) action = "vorspulen";

        if (action == null) action = "changestate";

        if (action == "play")
        {
            if ((cmd.has("kodi")) || (cmd.has("fire tv")))
            {
                sendCommand("FireTV_CMD",85);
                handled(toUpdate,true);
                return;
            }
        }
        else if (action == "pause")
        {
            if ((cmd.has("kodi")) || (cmd.has("fire tv")))
            {
                sendCommand("FireTV_CMD",85);
                handled(toUpdate,true);
                return;
            }
        }        
        else if (action == "zurückspulen")
        {
            if ((cmd.has("kodi")) || (cmd.has("fire tv")))
            {
                sendCommand("FireTV_CMD",88);
                handled(toUpdate,true);
                return;
            }
        }
        else if (action == "vorspulen")
        {
            if ((cmd.has("kodi")) || (cmd.has("fire tv")))
            {
                sendCommand("FireTV_CMD",87);
                handled(toUpdate,true);
                return;
            }
        }
        else if (action == "changestate")
        {
            if (cmd.has("glotze"))
            {
                sendCommand("HyperionEnabled",stateonoff);
                sendCommand("LED1Power",stateonoff);
                sendMQTT("local","broadlink/audio/sony/power", "replay")
                sleep(broadlink_delay);
                sendMQTT("local","broadlink/sat/humax/power", "replay")
                sleep(broadlink_delay);
                sendMQTT("local","broadlink/tv/samsung/power", "replay")
               
                handled(toUpdate,false);
                return;
            }
            if (cmd.has("hyperion"))
            {
                sendCommand("HyperionEnabled",stateonoff);
                handled(toUpdate,true);
                return;
            }
            if ((cmd.has("computer")) || (cmd.has("pc")))
            {
                if (!state) sendMQTT("local","wt/system/commands/hibernate", "true")
                else sendCommand("WOL_PC",ON);

                handled(toUpdate,false);
                return;
            }
            if ((cmd.has("fernseher")) || (cmd.has("t. v.")))
            {
                var amt = 5;
                if ((cmd.has("ganz")) || (cmd.has("richtig")) || (cmd.has("viel"))) 
                {
                    amt = 8;
                }

                if ((cmd.has("leis")) || (cmd.has("leise")) || (cmd.has("leiser"))) 
                {
                    var i = 0
                    while((i=i+1) <= amt) 
                    {
                        sendMQTT("local","broadlink/audio/sony/volumedown", "replay");
                        sleep(200);
                    }

                    handled(toUpdate,true);
                    return;
                }
                else if ((cmd.has("laut")) || (cmd.has("lauter")) || (cmd.has("lautstärke")))
                {
                    var i = 0
                    while((i=i+1) <= amt) 
                    {
                        sendMQTT("local","broadlink/audio/sony/volumeup", "replay");
                        sleep(200);
                    }

                    handled(toUpdate,true);
                    return;
                }
                else
                {
                    sendMQTT("local","broadlink/tv/samsung/power", "replay")

                    handled(toUpdate,true);
                    return;
                }
            }
            if ((cmd.has("anlage")) || (cmd.has("audio")) || (cmd.has("sonyaudio")))
            {
                sendMQTT("local","broadlink/audio/sony/power", "replay")

                handled(toUpdate,true);
                return;
            }
            if ((cmd.has("sat")))
            {
                sendMQTT("local","broadlink/sat/humax/power", "replay")

                handled(toUpdate,true);
                return;
            }
            if ((cmd.has("sound")) || (cmd.has("ton")) || (cmd.has("mute")))
            {
                sendMQTT("local","broadlink/audio/sony/mute", "replay")

                handled(toUpdate,true);
                return;
            }
            if ((cmd.has("monitor")) || (cmd.has("bildschirm")) )
            {
                sendMQTT("local","wt/desktop/commands/set_display_sleep", "true")

                handled(toUpdate,true);
                return;
            }
            if (cmd.has("ventilator"))
            {
                if ((cmd.has("schnell")) || (cmd.has("schneller"))) sendMQTT("local","broadlink/fan/obi/up", "replay")
                else if ((cmd.has("langsam")) || (cmd.has("langsamer"))) sendMQTT("local","broadlink/fan/obi/down", "replay")
                else if ((cmd.has("drehung")) || (cmd.has("drehen"))) sendMQTT("local","broadlink/fan/obi/swivel", "replay")
                else
                {
                    sendMQTT("local","broadlink/fan/obi/power", "replay")
                }

                handled(toUpdate,true);
                return;
            }
        }
        else if (action == "switch")
        {
            if ((cmd.has("fernseher")) || (cmd.has("t. v.")))
            {
                sendMQTT("local","broadlink/hdmiswitch/" + 1, "replay")

                handled(toUpdate,true);
                return;
            }
            else if ((cmd.has("p. s. vier")) || (cmd.has("playsi")))
            {
                sendMQTT("local","broadlink/hdmiswitch/" + 2, "replay")

                handled(toUpdate,true);
                return;
            }
            else if ((cmd.has("computer")) || (cmd.has("pc")))
            {
                sendMQTT("local","broadlink/hdmiswitch/" + 3, "replay")

                handled(toUpdate,true);
                return;
            }
            else if ((cmd.has("fire tv")) || (cmd.has("kodi")))
            {
                sendMQTT("local","broadlink/hdmiswitch/" + 4, "replay")

                handled(toUpdate,true);
                return;
            }
        }
        else if (action == "channelchangestate")
        {
            var itemMQTT_SATChannel = getItem("MQTT_SATChannel");

            if      (cmd.has("a. r. d.")) { sendCommand(itemMQTT_SATChannel, 1); handled(toUpdate,true);return; }
            else if (cmd.has("z. d. f.")) { sendCommand(itemMQTT_SATChannel, 2); handled(toUpdate,true);return; }
            else if (cmd.has("r. t. l.")) { sendCommand(itemMQTT_SATChannel, 3); handled(toUpdate,true);return; }
            else if (cmd.has("sat eins")) { sendCommand(itemMQTT_SATChannel, 4); handled(toUpdate,true);return; }
            else if (cmd.has("vox")) { sendCommand(itemMQTT_SATChannel, 5); handled(toUpdate,true);return; }
            else if (cmd.has("pro sieben")) { sendCommand(itemMQTT_SATChannel, 6); handled(toUpdate,true);return; }
            else if (cmd.has("kabel eins")) { sendCommand(itemMQTT_SATChannel, 7); handled(toUpdate,true);return; }
            else if (cmd.has("r. t.")) { sendCommand(itemMQTT_SATChannel, 8); handled(toUpdate,true);return; }
            else if (cmd.has("r. t. l. zwei")) { sendCommand(itemMQTT_SATChannel, 9); handled(toUpdate,true);return; }
            else if (cmd.has("super r. t. l.")) { sendCommand(itemMQTT_SATChannel, 10); handled(toUpdate,true);return; }
            else if (cmd.has("drei sat")) { sendCommand(itemMQTT_SATChannel, 11); handled(toUpdate,true);return; }
            else if (cmd.has("w. d. r.")) { sendCommand(itemMQTT_SATChannel, 12); handled(toUpdate,true);return; }
            else if (cmd.has("b. r.")) { sendCommand(itemMQTT_SATChannel, 13); handled(toUpdate,true);return; }
            else if (cmd.has("s. w. r.")) { sendCommand(itemMQTT_SATChannel, 14); handled(toUpdate,true);return; }
            else if (cmd.has("n. d. r.")) { sendCommand(itemMQTT_SATChannel, 15); handled(toUpdate,true);return; }
            else if (cmd.has("h. r.")) { sendCommand(itemMQTT_SATChannel, 16); handled(toUpdate,true);return; }
            else if (cmd.has(" m. d. r.")) { sendCommand(itemMQTT_SATChannel, 17); handled(toUpdate,true);return; }
            else if (cmd.has("r. b. b.")) { sendCommand(itemMQTT_SATChannel, 2); handled(toUpdate,true);return; }
            else if (cmd.has("one")) { sendCommand(itemMQTT_SATChannel, 21); handled(toUpdate,true);return; }
            else if (cmd.has("tagesschau vier und zwanzig")) { sendCommand(itemMQTT_SATChannel, 23); handled(toUpdate,true);return; }
            else if (cmd.has("z. d. f. neo")) { sendCommand(itemMQTT_SATChannel, 24); handled(toUpdate,true);return; }
            else if (cmd.has("servus t. v.")) { sendCommand(itemMQTT_SATChannel, 28); handled(toUpdate,true);return; }
            else if (cmd.has("nitro")) { sendCommand(itemMQTT_SATChannel, 40); handled(toUpdate,true);return; }
            else if (cmd.has("wunder")) { sendCommand(itemMQTT_SATChannel, 41); handled(toUpdate,true);return; }
            else if (cmd.has("deluxe music")) { sendCommand(itemMQTT_SATChannel, 44); handled(toUpdate,true);return; }
            else if ((cmd.has("viva")) || (cmd.has("comedy central"))) { sendCommand(itemMQTT_SATChannel, 45); handled(toUpdate,true);return; }
            else if (cmd.has("n. t. v.")) { sendCommand(itemMQTT_SATChannel, 61); handled(toUpdate,true);return; }
            else if (cmd.has("welt")) { sendCommand(itemMQTT_SATChannel, 62); handled(toUpdate,true);return; }
            else if (cmd.has("b. b. c.")) { sendCommand(itemMQTT_SATChannel, 63); handled(toUpdate,true);return; }
            else if (cmd.has("c. n. n.")) { sendCommand(itemMQTT_SATChannel, 64); handled(toUpdate,true);return; }
            else if (cmd.has("astro t. v.")) { sendCommand(itemMQTT_SATChannel, 70); handled(toUpdate,true);return; }
        }
    }
});

JSRule({
    name: "TestAlexaDelay",
    description: "Line: "+__LINE__,
    triggers: [
        ItemCommandTrigger("TestBTN")
    ],
    execute: function( module, input)
    {
        logInfo("TestAlexaDelay 1")
        sendCommand("TTSOut2","TestAlexaDelay");
    }
});


function TTSOut(id,override,out)
{
    var itemTTSMode = getItem("TTSMode");
    var mode = (itemTTSMode.state != null) ? itemTTSMode.state : TTS_DEFAULT;
    var volTimer = (id == 1) ? echoTimer1 : echoTimer2;

    logInfo("TTSOut"+id+" override: "+override+" TTSMode:"+mode+" \""+ out +"\"")

    if (override) 
    {
        var itemVolume = getItem("Echo"+id+"_Volume");
        var VOL_BEFORE = itemVolume.state;
        sendCommand(itemVolume,VOL_NORMAL)
        sendCommand("Echo"+id+"_TTS",out);
        volTimer = createTimer(now().plusSeconds(1), function() 
        {
            sendCommand(itemVolume,VOL_BEFORE)
            volTimer = null;
        });
    }
    else
    {
        if (mode == TTS_OFF) return;
        if (volTimer == null) 
        {
            sendCommand("Echo"+id+"_TTS",out);
            volTimer = createTimer(now().plusSeconds(1), function() 
            {
                volTimer = null;
            });
        }
    }
}

/*
function TTSOut(id,quiet,out)
{
    var itemTTSMode = getItem("TTSMode");
    var mode = (itemTTSMode.state != null) ? itemTTSMode.state : TTS_DEFAULT;

    logInfo("TTSOut"+id+" quiet: "+quiet+" TTSMode: "+mode+" "+ out)

    if (mode == TTS_OFF) return;

    var itemVolume = getItem("Echo"+id+"_Volume");
    var VOL_BEFORE = itemVolume.state;

    if (volTimer != null) volTimer.cancel();
    if (quiet)
    {
        sendCommand(itemVolume,VOL_QUIET)
        createTimer(now().plusSeconds(0.1), function() 
        {
            sendCommand("Echo"+id+"_TTS",out)

            volTimer = createTimer(now().plusSeconds(10), function() 
            { 
                sendCommand(itemVolume,VOL_BEFORE)
                volTimer = null;
            });

        });
    }
    else
    {
        sendCommand(itemVolume,VOL_NORMAL)
        createTimer(now().plusSeconds(0.1), function() 
        {
            sendCommand("Echo"+id+"_TTS",out)

            volTimer = createTimer(now().plusSeconds(10), function() 
            {
                sendCommand(itemVolume,VOL_BEFORE)
                volTimer = null;
            });
        });
    }
}

*/

JSRule({
    name: "TTSOut",
    description: "Line: "+__LINE__,
    triggers: [
        ItemCommandTrigger("TTSOut1"),
        ItemCommandTrigger("TTSOut2"),
        ItemCommandTrigger("TTSOut1Override"),
        ItemCommandTrigger("TTSOut2Override")
    ],
    execute: function( module, input)
    {
        var triggeringItem = getItem(getTriggeringItemStr(input));
        if      (triggeringItem.name == "TTSOut1") TTSOut(1,false,input.command);
        else if (triggeringItem.name == "TTSOut2") TTSOut(2,false,input.command);
        else if (triggeringItem.name == "TTSOut1Override") TTSOut(1,true,input.command);
        else if (triggeringItem.name == "TTSOut2Override") TTSOut(2,true,input.command);
    }
});