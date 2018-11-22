'use strict';
load('/etc/openhab2/automation/jsr223/00_jslib/JSRule.js');

JSRule({
    name: "Backupbtn",
    description: "Line: "+__LINE__,
    triggers: [
        ItemCommandTrigger("Backupbtn")
    ],
    execute: function( module, input)
    {
        var itemBackupbtn = getItem("Backupbtn");
        var itemTTSOut2 = getItem("TTSOut2");

        sendCommand(itemTTSOut2,"Backup Prozess gestartet");
        postUpdate(itemBackupbtn,"creating backup...");
        logInfo("starting backup...");
        var execResult = executeCommandLineAndWaitResponse("sudo /etc/openhab2/scripts/sh/oh2backup.sh", 60*1000 * 10);
        logInfo(execResult);
        sendCommand(itemTTSOut2,"Backup Prozess abgeschlossen");
        postUpdate(itemBackupbtn,"OK");
    }
});

JSRule({
    name: "Resetbtn",
    description: "Line: "+__LINE__,
    triggers: [
        ItemCommandTrigger("Resetbtn")
    ],
    execute: function( module, input)
    {
        var itemResetbtn = getItem("Resetbtn");
        var itemTTSOut2 = getItem("TTSOut2");

        sendCommand(itemTTSOut2,"System wird neu gestartet");
        postUpdate(itemResetbtn,"restarting...");
        var execResult = executeCommandLineAndWaitResponse("sudo systemctl restart openhab2.service",60*1000);
        logInfo(execResult);
        postUpdate(itemResetbtn,"OK");
    }
});

JSRule({
    name: "ClearCacheBtn",
    description: "Line: "+__LINE__,
    triggers: [
        ItemCommandTrigger("ClearCacheBtn")
    ],
    execute: function( module, input)
    {
        var itemClearCacheBtn = getItem("ClearCacheBtn");
        var itemTTSOut2 = getItem("TTSOut2");

        sendCommand(itemTTSOut2,"Cache wird gelöscht und System wird neu gestartet");
        postUpdate(itemClearCacheBtn,"restarting...");
        var execResult = executeCommandLineAndWaitResponse("sudo /etc/openhab2/scripts/sh/clearcache.sh",60*1000);
        logInfo(execResult);
        postUpdate(itemClearCacheBtn,"OK");
    }
});

JSRule({
    name: "fboxReboot",
    description: "Line: "+__LINE__,
    triggers: [
        ItemCommandTrigger("fboxReboot")
    ],
    execute: function( module, input)
    {
        var itemTTSOut2 = getItem("TTSOut2");

        sendCommand(itemTTSOut2,"Router wird neu gestartet");
        var execResult = executeCommandLineAndWaitResponse("/etc/openhab2/scripts/sh/rebootfritzbox.sh",60*1000);
        logInfo(execResult);
    }
});


JSRule({
    name: "piReboot",
    description: "Line: "+__LINE__,
    triggers: [
        ItemCommandTrigger("piReboot")
    ],
    execute: function( module, input)
    {
        var itemTTSOut2 = getItem("TTSOut2");

        sendCommand(itemTTSOut2,"Raspberry Pi wird neu gestartet");
        var execResult = executeCommandLineAndWaitResponse("sudo reboot",60*1000);
        logInfo(execResult);
    }
});



JSRule({
    name: "SysStartupForce",
    description: "Line: "+__LINE__,
    triggers: [
        ItemStateChangeTrigger("SysStartupForce")
    ],
    execute: function( module, input)
    {
        var itemSysStartupForce = getItem("SysStartupForce");
        if (itemSysStartupForce.state == ON)
        {
            var itemSysStartup = getItem("SysStartup");
            var itemTTSOut2 = getItem("TTSOut2");

            sendCommand(itemSysStartup,2);

            createTimer(now().plusSeconds(1), function() 
            {
                sendCommand(itemTTSOut2,"Force Reset test!");
                sendCommand(itemSysStartup,0);
                sendCommand(itemSysStartupForce,OFF);
            });

            sendNotification("SysStartupForce","SysStartupForce");
        }
    }
});

JSRule({
    name: "SystemInfo UI",
    description: "Line: "+__LINE__,
    triggers: [
        ItemStateUpdateTrigger("CPU_Load")
    ],
    execute: function( module, input)
    {
        var itemCPU_UI = getItem("CPU_UI");
        var itemCPU_Load = getItem("CPU_Load");
        var itemCPU_Load1 = getItem("CPU_Load1");
        var itemCPU_Load5 = getItem("CPU_Load5");
        var itemCPU_Load15 = getItem("CPU_Load15");
        var itemCPU_Name = getItem("CPU_Name");

        var itemStorage_UI = getItem("Storage_UI");
        var itemStorage_Used = getItem("Storage_Used");
        var itemStorage_Total = getItem("Storage_Total");

        var itemMemory_UI = getItem("Memory_UI");
        var itemMemory_Used = getItem("Memory_Used");
        var itemMemory_Total = getItem("Memory_Total");

        var itemNetwork_UI = getItem("Network_UI");
        var itemNetwork_DataSent = getItem("Network_DataSent");
        var itemNetwork_DataRecevied = getItem("Network_DataRecevied");

        postUpdate(itemStorage_UI,round((itemStorage_Used.state / 1000),2) +" GB used of "+round((itemStorage_Total.state / 1000),2) +" GB ("+round((itemStorage_Used.state / itemStorage_Total.state * 100),1) +"%) ");
        postUpdate(itemMemory_UI,itemMemory_Used.state +" MB used of "+itemMemory_Total.state+" MB ("+round((itemMemory_Used.state / itemMemory_Total.state * 100),1) +"%) ");
        postUpdate(itemNetwork_UI,round((itemNetwork_DataSent.state / 1000),2) +" GB sent / "+round((itemNetwork_DataRecevied.state / 1000),2) +" GB received");

        postUpdate(itemCPU_UI,itemCPU_Name.state +" / "+itemCPU_Load.state+"% / "+itemCPU_Load1.state+" / "+itemCPU_Load5.state+" / "+itemCPU_Load15.state);
    }
});

/*
var logTimer = null;
function scheduleLogTimer()
{
    if (logTimer == null)
    {
        logTimer = createTimer(now().plusSeconds(2), function() 
        {
            var execResult = executeCommandLineAndWaitResponse("/etc/openhab2/scripts/sh/logtail.sh",1000);
            if (execResult != "" ) logInfo("logtail:" + execResult);
            //logInfo("logtail exec");
            logTimer = null;
            scheduleLogTimer();
        });
    }
    else
    {
        logError("scheduleLogTimer logTimer not null!")
    }
}
scheduleLogTimer();
*/

JSRule({
    name: "LogTail",
    description: "Line: "+__LINE__,
    triggers: [
        //TimerTrigger("0/2 * * ? * * *")
        TimerTrigger("0/5 * * * * ?")
    ],
    execute: function( module, input)
    {
        //logTimer = null;
        //scheduleLogTimer();
        var execResult = executeCommandLineAndWaitResponse("/etc/openhab2/scripts/sh/logtail.sh",3000);
        if (execResult != "" ) logInfo("logtail:" + execResult);
    }
});

JSRule({
    name: "RefreshGrafanaImgs",
    description: "Line: "+__LINE__,
    triggers: [
        TimerTrigger("0 0/5 * * * ?")
    ],
    execute: function( module, input)
    {
        var execResult = executeCommandLineAndWaitResponse("/etc/openhab2/scripts/sh/grafana/grafana.sh",60*1000 *4);
        //logInfo("generated Grafana images")
    }
});

JSRule({
    name: "SystemStats high",
    description: "Line: "+__LINE__,
    triggers: [
        TimerTrigger("0 0/1 * * * ?")
    ],
    execute: function( module, input)
    {
        var execResultUptime = executeCommandLineAndWaitResponse("/etc/openhab2/scripts/sh/uptime.sh",1000*3);
        //logInfo("stats uptime '"+execResultUptime + "'")
        //logInfo ("isNaN " + isNumber("123") +" - "+ isNumber(123) +" - "+ isNumber("") +" - "+ isNumber(null) );
        if (isNumber(parseFloat(execResultUptime))) postUpdate( "System_openHAB_Uptime", execResultUptime);

        var execResultMemory = executeCommandLineAndWaitResponse("/etc/openhab2/scripts/sh/memory.sh",1000*3);
        //logInfo("stats mem '"+execResultMemory + "'")
        if (isNumber(parseFloat(execResultMemory))) postUpdate( "System_openHAB_Memory", execResultMemory );
    }
});


JSRule({
    name: "SystemStats low",
    description: "Line: "+__LINE__,
    triggers: [
        TimerTrigger("0 0/30 * * * ?")
    ],
    execute: function( module, input)
    {
        var execResultDBSize = executeCommandLineAndWaitResponse("/etc/openhab2/scripts/sh/dbsize.sh",1000*3);
        //logInfo("stats dbsize '"+execResultDBSize + "'")
        if (isNumber(parseFloat(execResultDBSize))) postUpdate( "System_openHAB_DBSize", execResultDBSize );

        var execResultVersion = executeCommandLineAndWaitResponse("/etc/openhab2/scripts/sh/version.sh",1000*3);
        //logInfo("stats version '"+execResultVersion + "'")
        if (isNumber(parseFloat(execResultVersion))) postUpdate( "System_openHAB_Version", execResultVersion );

    }
});

JSRule({
    name: "Reset Log Errors",
    description: "Line: "+__LINE__,
    triggers: [
        ItemCommandTrigger("ResetLogErrorsbtn")
    ],
    execute: function( module, input)
    {
        logInfo("Resetting Log Errors & Warnings");
        postUpdate( "logreaderLastError", "-" );
        postUpdate( "logreaderLastWarning", "-" );
        postUpdate( "logreaderErrors", 0 );
        postUpdate( "logreaderWarnings", 0 );
    }
});


JSRule({
    name: "logreaderUI",
    description: "Line: "+__LINE__,
    triggers: [
        ItemStateChangeTrigger("logreaderErrors"),
        ItemStateChangeTrigger("logreaderWarnings")
    ],
    execute: function( module, input)
    {
        sleep(100);
        var itemlogreaderErrors = getItem("logreaderErrors");
        var itemlogreaderWarnings = getItem("logreaderWarnings");

        postUpdate( "logreaderUI", itemlogreaderErrors.state + " / " + itemlogreaderWarnings.state );
    }
});

JSRule({
    name: "LogReaderErrors",
    description: "Line: "+__LINE__,
    triggers: [
        ChannelTrigger("logreader:reader:openhablog:newErrorEvent")
    ],
    execute: function( module, input)
    {
        var itemlogreaderError = getItem("logreaderError");
        var itemlogreaderErrors = getItem("logreaderErrors");
        var itemlogreaderLastError = getItem("logreaderLastError");

        var errorstring = "";
        if (itemlogreaderLastError.state != null)
        {
            errorstring = itemlogreaderLastError.state.toString().split("] - ")[1]
        }

        postUpdate(itemlogreaderError,1);
        createTimer(now().plusSeconds(5), function() 
        {
            postUpdate(itemlogreaderError,0);
        });

        var msg = "ERROR " + itemlogreaderErrors.state.toString() + ": " + errorstring;
        sendNotification(null, msg);
    }
});

JSRule({
    name: "LogReaderWarnings",
    description: "Line: "+__LINE__,
    triggers: [
        ChannelTrigger("logreader:reader:openhablog:newWarningEvent")
    ],
    execute: function( module, input)
    {
        var itemlogreaderWarning = getItem("logreaderWarning");
        var itemlogreaderWarnings = getItem("logreaderWarnings");
        var itemlogreaderLastWarning = getItem("logreaderLastWarning");

        var errorstring = "";
        if (itemlogreaderLastWarning.state != null)
        {
            errorstring = itemlogreaderLastWarning.state.toString().split("] - ")[1]
        }

        postUpdate(itemlogreaderWarning,1);
        createTimer(now().plusSeconds(5), function() 
        {
            postUpdate(itemlogreaderWarning,0);
        });
        
        var msg = "WARNING " + itemlogreaderWarnings.state.toString() + ": " + errorstring;
        sendNotification(null, msg);
    }
});


JSRule({
    name: "NAS Power",
    description: "Line: "+__LINE__,
    triggers: [
        ItemCommandTrigger("NAS_Power")
    ],
    execute: function( module, input)
    {
        if (input.command == ON)
        {
            sendCommand("WOL_NAS",ON);
        }
        else
        {
            var execResultUptime = executeCommandLineAndWaitResponse("/etc/openhab2/scripts/sh/poweroffnas.sh",1000*3);
            logInfo("NAS Power Result: " + execResultUptime);
        }
        logInfo("NAS Power: " + input.command);
    }
});
