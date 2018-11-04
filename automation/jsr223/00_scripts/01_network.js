'use strict';
load('/etc/openhab2/automation/jsr223/00_jslib/JSRule.js');


JSRule({
    name: "SpeedtestRerun",
    description: "Line: "+__LINE__,
    triggers: [
        ItemCommandTrigger("SpeedtestRerun")
    ],
    execute: function( module, input)
    {
        //logInfo(input.command);

        if(input.command == "ON")
        {
            logInfo("speedtest executed");

            var itemSpeedtestRerun = getItem("SpeedtestRerun");
            var itemTTSOut2 = getItem("TTSOut2");
            var itemSpeedtestSummary = getItem("SpeedtestSummary");
            
            postUpdate(itemSpeedtestRerun,"Messung läuft");
            sendCommand(itemTTSOut2,"Messung läuft.");
    
            var speedtestCliOutput = executeCommandLineAndWaitResponse("/usr/local/bin/speedtest-cli@@--simple", 1000 * 120);
    
            if (speedtestCliOutput.startsWith("Ping") && speedtestCliOutput.endsWith("Mbit/s")) 
            {
                var results = speedtestCliOutput.split("\n");
                logInfo(results);
    
                var ping = parseFloat(results[0].split(" ")[1]);
                var down = parseFloat(results[1].split(" ")[1]);
                var up   = parseFloat(results[2].split(" ")[1]);
    
                var strdown = round(down,1).toString().replace('.', ',');
                var strup = round(up,1).toString().replace('.', ',');
                var strping = round(ping,0).toString().replace('.', ',');
                
                postUpdate(itemSpeedtestSummary,"?  "+strdown+" Mbit/s  ? "+strup+" Mbit/s ("+strping+" ms)");
                logInfo("speedtest finished.");
                sendCommand(itemTTSOut2,"Speedtest Ergebnis ist "+strdown+" Megabit Downstream, und "+strup+" Megabit Upstream, mit "+strping+" Millisekunden Ping");
            } 
            else
            {
                postUpdate(itemSpeedtestSummary,"(unbekannt)");
                logError("speedtest failed. Output:\n" + speedtestCliOutput + "\n\n");
                sendCommand(itemTTSOut2,"Fehler bei der Ausführung von Speedtest");
            }
    
            var currentTime = formatUITimeStampfromJodaDate(DateTime.now());
            postUpdate(itemSpeedtestRerun,"last run: " + currentTime);
        }
    }
});