'use strict';
load('/etc/openhab2/automation/jsr223/00_jslib/JSRule.js');

function post_startup()
{
    logInfo("post_startup()")
    sendCommand("SysStartup",2);

    postUpdate("SpeedtestRerun",OFF);
    postUpdate("SpeedtestSummary","-");
    sendCommand("SysStartupForce",OFF);

    sendCommand("SysStartup",0);
}

post_startup();