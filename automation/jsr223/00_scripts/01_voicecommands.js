'use strict';
load('/etc/openhab2/automation/jsr223/00_jslib/JSRule.js');

var TTS_OFF = 0;
var TTS_DEFAULT = 1;

Array.prototype.diff = function(a) {
    return this.filter(function(i) {return a.indexOf(i) < 0;});
};

String.prototype.has = function(s) {
    return (this.indexOf(s) !== -1);
};

JSRule({
    name: "AlexaCommands",
    description: "Line: "+__LINE__,
    triggers: [
        ItemStateChangeTrigger("Echo1_lastVoiceCommand"),
        ItemStateChangeTrigger("Echo2_lastVoiceCommand"),
        ItemCommandTrigger("TestBTN")
    ],
    execute: function( module, input)
    {
        var triggeringItem = getItem(getTriggeringItemStr(input));
        var cmd = triggeringItem.state.toString().toLowerCase().split(" ");
        var remove = ["alexa","der","die","das","den"];

        cmd = cmd.diff(remove)
        cmd = cmd.join(" ");


        logInfo("AlexaCommands : "+cmd);
        if ((cmd == "stop") || (cmd == "stopp")) return;
        if ((cmd == "lauter") || (cmd == "leiser")) return;

        // to do keep as array?

        var state;
        var stateonoff;
        var action;

        if (cmd.has("an")) state = true;
        else if (cmd.has("aus")) state = false;

        stateonoff = (state) ? ON : OFF;

        if ((cmd.has("schalt um")) || (cmd.has("schalte um"))) action = "channelchangestate";
        else if ((cmd.has("mach")) || (cmd.has("mache")) || (cmd.has("schalt")) || (cmd.has("schalte"))) action = "changestate";
        else if ((cmd.has("switch"))) action = "switch";

        if (action == "changestate")
        {
            if (cmd.has("glotze"))
            {
                sendMQTT("broadlink","broadlink/audio/sony/power", "replay")
                sleep(broadlink_delay);
                sendMQTT("broadlink","broadlink/sat/humax/power", "replay")
                sleep(broadlink_delay);
                sendMQTT("broadlink","broadlink/tv/samsung/power", "replay")
                sendCommand("LED1Power",stateonoff);
            }
            if ((cmd.has("computer")) || (cmd.has("pc")))
            {
                if (!state) sendMQTT("cloudmqtt","wt/system/commands/hibernate", "true")
                else sendCommand("WOL_PC",ON);
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
                        sendMQTT("broadlink","broadlink/audio/sony/volumedown", "replay");
                        sleep(200);
                    }
                }
                else if ((cmd.has("laut")) || (cmd.has("lauter")) || (cmd.has("lautstärke")))
                {
                    var i = 0
                    while((i=i+1) <= amt) 
                    {
                        sendMQTT("broadlink","broadlink/audio/sony/volumeup", "replay");
                        sleep(200);
                    }
                }
                else
                {
                    sendMQTT("broadlink","broadlink/tv/samsung/power", "replay")
                }
            }
            if ((cmd.has("anlage")) || (cmd.has("audio")) || (cmd.has("sonyaudio")))
            {
                sendMQTT("broadlink","broadlink/audio/sony/power", "replay")
            }
            if ((cmd.has("sat")))
            {
                sendMQTT("broadlink","broadlink/sat/humax/power", "replay")
            }
            if ((cmd.has("sound")) || (cmd.has("ton")) || (cmd.has("mute")))
            {
                sendMQTT("broadlink","broadlink/audio/sony/mute", "replay")
            }
            if ((cmd.has("monitor")) || (cmd.has("bildschirm")) )
            {
                sendMQTT("cloudmqtt","wt/desktop/commands/set_display_sleep", "true")
            }
            if (cmd.has("ventilator"))
            {
                if ((cmd.has("schnell")) || (cmd.has("schneller"))) sendMQTT("broadlink","broadlink/fan/obi/up", "replay")
                else if ((cmd.has("langsam")) || (cmd.has("langsamer"))) sendMQTT("broadlink","broadlink/fan/obi/down", "replay")
                else if ((cmd.has("drehung")) || (cmd.has("drehen"))) sendMQTT("broadlink","broadlink/fan/obi/swivel", "replay")
                else
                {
                    sendMQTT("broadlink","broadlink/fan/obi/power", "replay")
                }                
            }
        }
        else if (action == "switch")
        {
            if ((cmd.has("fernseher")) || (cmd.has("t. v.")))
            {
                sendMQTT("broadlink","broadlink/hdmiswitch/" + 1, "replay")
            }
            else if ((cmd.has("p. s. vier")) || (cmd.has("playsi")))
            {
                sendMQTT("broadlink","broadlink/hdmiswitch/" + 2, "replay")
            }
            else if ((cmd.has("computer")) || (cmd.has("pc")))
            {
                sendMQTT("broadlink","broadlink/hdmiswitch/" + 3, "replay")
            }
            else if ((cmd.has("fire tv")) || (cmd.has("kodi")))
            {
                sendMQTT("broadlink","broadlink/hdmiswitch/" + 4, "replay")
            }
        }
        else if (action == "channelchangestate")
        {
            var itemMQTT_SATChannel = getItem("MQTT_SATChannel");

            if      (cmd.has("a. r. d.")) sendCommand(itemMQTT_SATChannel, 1)
            else if (cmd.has("z. d. f.")) sendCommand(itemMQTT_SATChannel, 2)
            else if (cmd.has("r. t. l.")) sendCommand(itemMQTT_SATChannel, 3)
            else if (cmd.has("sat eins")) sendCommand(itemMQTT_SATChannel, 4)
            else if (cmd.has("vox")) sendCommand(itemMQTT_SATChannel, 5)
            else if (cmd.has("pro sieben")) sendCommand(itemMQTT_SATChannel, 6)
            else if (cmd.has("kabel eins")) sendCommand(itemMQTT_SATChannel, 7)
            else if (cmd.has("r. t.")) sendCommand(itemMQTT_SATChannel, 8)
            else if (cmd.has("r. t. l. zwei")) sendCommand(itemMQTT_SATChannel, 9)
            else if (cmd.has("super r. t. l.")) sendCommand(itemMQTT_SATChannel, 10)
            else if (cmd.has("drei sat")) sendCommand(itemMQTT_SATChannel, 11)
            else if (cmd.has("w. d. r.")) sendCommand(itemMQTT_SATChannel, 12)
            else if (cmd.has("b. r.")) sendCommand(itemMQTT_SATChannel, 13)
            else if (cmd.has("s. w. r.")) sendCommand(itemMQTT_SATChannel, 14)
            else if (cmd.has("n. d. r.")) sendCommand(itemMQTT_SATChannel, 15)
            else if (cmd.has("h. r.")) sendCommand(itemMQTT_SATChannel, 16)
            else if (cmd.has(" m. d. r.")) sendCommand(itemMQTT_SATChannel, 17)
            else if (cmd.has("r. b. b.")) sendCommand(itemMQTT_SATChannel, 2)
            else if (cmd.has("one")) sendCommand(itemMQTT_SATChannel, 21)
            else if (cmd.has("tagesschau vier und zwanzig")) sendCommand(itemMQTT_SATChannel, 23)
            else if (cmd.has("z. d. f. neo")) sendCommand(itemMQTT_SATChannel, 24)
            else if (cmd.has("servus t. v.")) sendCommand(itemMQTT_SATChannel, 28)
            else if (cmd.has("nitro")) sendCommand(itemMQTT_SATChannel, 40)
            else if (cmd.has("wunder")) sendCommand(itemMQTT_SATChannel, 41)
            else if (cmd.has("deluxe music")) sendCommand(itemMQTT_SATChannel, 44)
            else if ((cmd.has("viva")) || (cmd.has("comedy central"))) sendCommand(itemMQTT_SATChannel, 45)
            else if (cmd.has("n. t. v.")) sendCommand(itemMQTT_SATChannel, 61)
            else if (cmd.has("welt")) sendCommand(itemMQTT_SATChannel, 62)
            else if (cmd.has("b. b. c.")) sendCommand(itemMQTT_SATChannel, 63)
            else if (cmd.has("c. n. n.")) sendCommand(itemMQTT_SATChannel, 64)
            else if (cmd.has("astro t. v.")) sendCommand(itemMQTT_SATChannel, 70)
        }
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
    name: "TTSOut",
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