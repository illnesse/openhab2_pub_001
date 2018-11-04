'use strict';
load('/etc/openhab2/automation/jsr223/00_jslib/JSRule.js');

function post_startup()
{
    logInfo("post_startup()")
    sendCommand("SysStartup",2);

    postUpdate("SpeedtestRerun",OFF);
    postUpdate("SpeedtestSummary","-");

    var execResultVersion = executeCommandLineAndWaitResponse("/etc/openhab2/scripts/sh/version.sh",1000*3);
    if (execResultVersion != "") postUpdate( "System_openHAB_Version", execResultVersion );


    sendCommand("SysStartupForce",OFF);
    sendCommand("SysStartup",0);

    postUpdate("Echo1_TTSVolume",60);
    postUpdate("Echo2_TTSVolume",60);    
}

post_startup(); 