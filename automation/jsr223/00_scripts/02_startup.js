'use strict';
load('/etc/openhab2/automation/jsr223/00_jslib/JSRule.js');

function startup()
{
    logInfo("startup()")
    
    var itemSysStartup = getItem("SysStartup");
    sendCommand(itemSysStartup,ON);

    var itemSpeedtestRerun = getItem("SpeedtestRerun");
    postUpdate(itemSpeedtestRerun,OFF);

    var itemSpeedtestSummary = getItem("SpeedtestSummary");
    postUpdate(itemSpeedtestSummary,"-");

    var itemSysStartupForce = getItem("SysStartupForce");
    sendCommand(itemSysStartupForce,OFF);

    sendCommand(itemSysStartup,OFF);
}

startup();


/*

JSRule({
    name: "SystemStarted",
    description: "Line: "+__LINE__,
    triggers: [
        StartupTrigger()
    ],
    execute: function( module, input)
    {
        var itemSysStartup = getItem("SysStartup");
        sendCommand(itemSysStartup,ON);

        createTimer(now().plusSeconds(180), function() 
        {
            var itemSysStartupForce = getItem("SysStartupForce");
            sendCommand(itemSysStartup,OFF);
            sendCommand(itemSysStartupForce,OFF);

            var itemSpeedtestRerun = getItem("SpeedtestRerun");
            var itemSpeedtestSummary = getItem("SpeedtestSummary");

            if (itemSpeedtestRerun.state == NULL) postUpdate(itemSpeedtestRerun,OFF)
            if (itemSpeedtestSummary.state == NULL || itemSpeedtestSummary.state == "") postUpdate(itemSpeedtestSummary,"-")

            sendCommand(itemSysStartup,OFF);
            sendCommand(itemSysStartupForce,OFF);
        });
    }
});

*/
