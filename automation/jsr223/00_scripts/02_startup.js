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
