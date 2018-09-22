'use strict';
load('/etc/openhab2/automation/jsr223/00_jslib/JSRule.js');

function pre_startup()
{
    logInfo("pre_startup()")
    sendCommand("SysStartup",1);
}

pre_startup();