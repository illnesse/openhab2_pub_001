'use strict';
load('/etc/openhab2/automation/jsr223/00_jslib/JSRule.js');

function pre_startup()
{
    logInfo("pre_startup()")
    sendCommand("SysStartup",1);

    postUpdate("logreaderErrors", 0);
    postUpdate("logreaderWarnings", 0);
    postUpdate("logreaderUI", "0 / 0");

}

pre_startup();