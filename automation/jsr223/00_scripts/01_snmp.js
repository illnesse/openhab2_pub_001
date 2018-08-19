'use strict';
load('/etc/openhab2/automation/jsr223/00_jslib/JSRule.js');

function querySNMP()
{
    var execResult = executeCommandLineAndWaitResponse("/etc/openhab2/scripts/sh/snmpnas.sh",1000 * 10);
    if (execResult == null) return;

    //logInfo(execResult);

    var arr = execResult.split("\n");

    if (arr.length <3)
    {
        return; // offline
    }

    for (var i = 0; i < arr.length; i++) 
    {
        arr[i] = arr[i].replace(/"/g, "");//.replace("\"", "");
    }

    var freemem = parseFloat(arr[9]);
    var totalmem = parseFloat(arr[8]);
    var usedspace = parseFloat(arr[29]);
    var totalspace = parseFloat(arr[28]);

    //logInfo("freemem " + freemem + " totalmem " + totalmem + " usedspace " + usedspace + " totalspace " + totalspace);

    postUpdate(getItem("SNMP_NAS_sysSerialNumber"), arr[0]);
    postUpdate(getItem("SNMP_NAS_sysADMVersion"), arr[1]);
    postUpdate(getItem("SNMP_NAS_sysUptime"), arr[3]);
    postUpdate(getItem("SNMP_NAS_sysTime"), arr[4]);
    postUpdate(getItem("SNMP_NAS_sysAsustorID"), arr[6]);
    postUpdate(getItem("SNMP_NAS_hwModelName"), arr[7]);
    postUpdate(getItem("SNMP_NAS_hwTotalMem"), freemem + " MB / " + totalmem + " MB, free: " + round((freemem/totalmem)*100,0) + " %" );
    postUpdate(getItem("SNMP_NAS_hwProcessor"), arr[10]);
    postUpdate(getItem("SNMP_NAS_cpuUsage"), arr[11] + " %");
    postUpdate(getItem("SNMP_NAS_fanSpeed"), arr[12] + " rpm");
    postUpdate(getItem("SNMP_NAS_netPacketSent"), arr[17] + " / " + arr[18]);
    postUpdate(getItem("SNMP_NAS_diskID"), arr[19]);
    postUpdate(getItem("SNMP_NAS_diskModel"), arr[20] + " " + arr[21]);
    postUpdate(getItem("SNMP_NAS_diskStatus"), arr[22] + ", " +arr[23] + "°");
    postUpdate(getItem("SNMP_NAS_volumeName"), arr[24] + " (" + arr[25].replace(" ", "") +")"); //1.1.2
    postUpdate(getItem("SNMP_NAS_volumeFileSystem"), arr[27] + " (" + arr[26].replace(" ", "") + ")");
    postUpdate(getItem("SNMP_NAS_volumeTotalSize"), usedspace + " MB / " + totalspace + " MB, free: " + round(100-(usedspace/totalspace*100),0) + " %");

    //logInfo("parsed SNMP");
    execResult = null;
}

JSRule({
    name: "SNMP parse manual",
    description: "Line: "+__LINE__,
    triggers: [
        //ItemCommandTrigger("TestBTN"),
        ItemCommandTrigger("WOL_NAS"),
        ItemCommandTrigger("SysStartup","ON")
    ],
    execute: function( module, input)
    {
        createTimer(now().plusSeconds(20), function() 
        {
            querySNMP();
        });
    }
});

JSRule({
    name: "SNMP parse",
    description: "Line: "+__LINE__,
    triggers: [
        TimerTrigger("0 0/5 * * * ?")
    ],
    execute: function( module, input)
    {
        var itemNASLatency = getItem("NASLatency");
        if (itemNASLatency.state != "UNDEF") querySNMP();
    }
});
