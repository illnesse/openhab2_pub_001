'use strict';
load('/etc/openhab2/automation/jsr223/00_jslib/JSRule.js');

var tuyaScript = "node /etc/openhab2/scripts/nodejs/njstuya.js "
var TuyaSocket1Config = "-type outlet -ip 192.168.178.35 -id XXXXXXX -key XXXXXXX "
var TuyaSocket2Config = "-type outlet -ip 192.168.178.34 -id XXXXXXX -key XXXXXXX "
var TuyaSocket3Config = "-type outlet -ip 192.168.178.40 -id XXXXXXX -key XXXXXXX "
var TuyaSocket4Config = "-type outlet -ip 192.168.178.39 -id XXXXXXX -key XXXXXXX "
var TuyaSocket5Config = "-type outlet -ip 192.168.178.41 -id XXXXXXX -key XXXXXXX "
var TuyaSocket6Config = "-type outlet -ip 192.168.178.38 -id XXXXXXX -key XXXXXXX "

var tuyaLEDScript = "node /etc/openhab2/scripts/nodejs/njstuya.js "
var TuyaLED1Config = "-type light -ip 192.168.178.43 -id XXXXXXX -key XXXXXXX "
var TuyaLED2Config = "-type light -ip 192.168.178.44 -id XXXXXXX -key XXXXXXX "

JSRule({
    name: "SysStartup_Tyua",
    description: "Line: "+__LINE__,
    triggers: [
        ItemCommandTrigger("SysStartup",2)
    ],
    execute: function( module, input)
    {
        var itemTuyaSocket1 = getItem("TuyaSocket1");
        var itemTuyaSocket2 = getItem("TuyaSocket2");
        var itemTuyaSocket3 = getItem("TuyaSocket3");
        var itemTuyaSocket4 = getItem("TuyaSocket4");
        var itemTuyaSocket5 = getItem("TuyaSocket5");
        var itemTuyaSocket6 = getItem("TuyaSocket6");

        var execResult

        execResult = executeCommandLineAndWaitResponse(tuyaScript + TuyaSocket1Config + " STATE", 1000 * 3);
        if ((execResult == "ON") || (execResult == "OFF")) 
        {
            postUpdate(itemTuyaSocket1,execResult);
            //logInfo("SocketsAtStart / TuyaSocket1 " + execResult);
        }
        sleep(2000);
        execResult = executeCommandLineAndWaitResponse(tuyaScript + TuyaSocket2Config + " STATE", 1000 * 3);
        if ((execResult == "ON") || (execResult == "OFF")) 
        {
            postUpdate(itemTuyaSocket2,execResult);
            //logInfo("SocketsAtStart / TuyaSocket2 " + execResult);
        }
        sleep(2000);
        execResult = executeCommandLineAndWaitResponse(tuyaScript + TuyaSocket3Config + " STATE", 1000 * 3);
        if ((execResult == "ON") || (execResult == "OFF")) 
        {
            postUpdate(itemTuyaSocket3,execResult);
            // logInfo("SocketsAtStart / TuyaSocket3 " + execResult);
        }
        sleep(2000);
        execResult = executeCommandLineAndWaitResponse(tuyaScript + TuyaSocket4Config + " STATE", 1000 * 3);
        if ((execResult == "ON") || (execResult == "OFF")) 
        {
            postUpdate(itemTuyaSocket4,execResult);
            // logInfo("SocketsAtStart / TuyaSocket4 " + execResult);
        }
        sleep(2000);
        execResult = executeCommandLineAndWaitResponse(tuyaScript + TuyaSocket5Config + " STATE", 1000 * 3);
        if ((execResult == "ON") || (execResult == "OFF")) 
        {
            postUpdate(itemTuyaSocket5,execResult);
            // logInfo("SocketsAtStart / TuyaSocket5 " + execResult);
        }
        sleep(2000);
        execResult = executeCommandLineAndWaitResponse(tuyaScript + TuyaSocket6Config + " STATE", 1000 * 3);
        if ((execResult == "ON") || (execResult == "OFF")) 
        {
            postUpdate(itemTuyaSocket6,execResult);
            // logInfo("SocketsAtStart / TuyaSocket6 " + execResult);
        }
        sleep(2000);
    }
});


JSRule({
    name: "TuyaSocketSwitch",
    description: "Line: "+__LINE__,
    triggers: [
        ItemCommandTrigger("TuyaSocket1"),
        ItemCommandTrigger("TuyaSocket2"),
        ItemCommandTrigger("TuyaSocket3"),
        ItemCommandTrigger("TuyaSocket4"),
        ItemCommandTrigger("TuyaSocket5"),
        ItemCommandTrigger("TuyaSocket6")
    ],
    execute: function( module, input)
    {
        var triggeringItem = getItem(getTriggeringItemStr(input));
        var execResult
        var cmd 
        var state = input.command;
        var tuyaConfig

        if      (triggeringItem.name == "TuyaSocket1") tuyaConfig = TuyaSocket1Config;
        else if (triggeringItem.name == "TuyaSocket2") tuyaConfig = TuyaSocket2Config;
        else if (triggeringItem.name == "TuyaSocket3") tuyaConfig = TuyaSocket3Config;
        else if (triggeringItem.name == "TuyaSocket4") tuyaConfig = TuyaSocket4Config;
        else if (triggeringItem.name == "TuyaSocket5") tuyaConfig = TuyaSocket5Config;
        else if (triggeringItem.name == "TuyaSocket6") tuyaConfig = TuyaSocket6Config;

        cmd = tuyaScript +  tuyaConfig + state;
        // logInfo(cmd);
        execResult = executeCommandLineAndWaitResponse(cmd, 1000 * 6);

        if (execResult.indexOf("Error") > -1)
        {
            logWarn("TUYA switch1 "+ triggeringItem.name + " ERR COMM (" + execResult +")")
        }
        else
        {
            if ((execResult != "OFF") && (execResult != "ON"))
            {
                logWarn("TUYA switch4 " + triggeringItem.name + " ERR TIMEOUT ("+ execResult +")")
            }
            else
            {
                logInfo("TUYA switch6 " + triggeringItem.name + " " + execResult)
            }
        }
    }
});


JSRule({
    name: "TuyaLEDColor",
    description: "Line: "+__LINE__,
    triggers: [
        ItemCommandTrigger("LED1_color"),
        ItemCommandTrigger("LED2_color")
    ],
    execute: function( module, input)
    {
        var triggeringItem = getItem(getTriggeringItemStr(input));
        var state = input.command;
        var execResult
        var cmd 
        var tuyaConfig

        if (triggeringItem.name == "LED1_color") tuyaConfig = TuyaLED1Config + "-hsb " + state + " SETCOLOR";
        if (triggeringItem.name == "LED2_color") tuyaConfig = TuyaLED2Config + "-hsb " + state + " SETCOLOR";

        cmd = tuyaLEDScript + tuyaConfig;
        execResult = executeCommandLineAndWaitResponse(cmd, 1000 * 6);

        //logInfo(cmd);

        if (execResult.indexOf("Error") > -1) 
        {
            logWarn("TUYA LED " + triggeringItem.name + " ERR COMM (" + execResult +")")
        }
        else
        {
            logInfo("TUYA LED " + triggeringItem.name + " " + input.command +": "+ execResult)
        }
    }
});

JSRule({
    name: "TuyaLEDScene",
    description: "Line: "+__LINE__,
    triggers: [
        ItemCommandTrigger("LED1Scene"),
        ItemCommandTrigger("LED2Scene")
    ],
    execute: function( module, input)
    {
        var triggeringItem = getItem(getTriggeringItemStr(input));
        var state = input.command;
        var execResult
        var cmd 
        var tuyaConfig

        if (triggeringItem.name == "LED1Scene") tuyaConfig = TuyaLED1Config + " SCENE -sceneid " + state;
        if (triggeringItem.name == "LED2Scene") tuyaConfig = TuyaLED2Config + " SCENE -sceneid " + state;

        cmd = tuyaLEDScript + tuyaConfig;
        execResult = executeCommandLineAndWaitResponse(cmd, 1000 * 6);

        //logInfo(cmd);

        if (execResult.indexOf("Error") > -1) 
        {
            logWarn("TUYA Flash " + triggeringItem.name + " ERR COMM (" + execResult +")")
        }
        else
        {
            logInfo("TUYA Flash " + triggeringItem.name + " " + input.command +": "+ execResult)
        }
    }
});



JSRule({
    name: "TuyaLEDFlash",
    description: "Line: "+__LINE__,
    triggers: [
        ItemCommandTrigger("LED1Flash"),
        ItemCommandTrigger("LED2Flash"),
        ItemCommandTrigger("LED1FlashSpeed"),
        ItemCommandTrigger("LED2FlashSpeed")
    ],
    execute: function( module, input)
    {
        var triggeringItem = getItem(getTriggeringItemStr(input));
        var execResult
        var cmd 
        var tuyaConfig

        var type = null;
        var speed = null;
        if ((triggeringItem.name == "LED2Flash") || (triggeringItem.name == "LED1Flash")) type = input.command;
        else if ((triggeringItem.name == "LED1FlashSpeed") || (triggeringItem.name == "LED2FlashSpeed")) speed = input.command;

        if ((triggeringItem.name == "LED1Flash") || (triggeringItem.name == "LED1FlashSpeed"))
        {   
            var itemLED1Flash = getItem("LED1Flash");
            var itemLED1FlashSpeed = getItem("LED1FlashSpeed");
            if (type == null) type = itemLED1Flash.state;
            if (type == null) type = 1;
            if (speed == null) speed = itemLED1FlashSpeed.state;
            if (speed == null) speed = 1;
            tuyaConfig = TuyaLED1Config + " FLASH -flashid " + type + " -flashspeed " + speed;
        }
        else if ((triggeringItem.name == "LED2Flash") || (triggeringItem.name == "LED2FlashSpeed"))
        {
            var itemLED2Flash = getItem("LED2Flash");
            var itemLED2FlashSpeed = getItem("LED2FlashSpeed");

            if (type == null) type = itemLED2Flash.state;
            if (type == null) type = 1;
            if (speed == null) speed = itemLED2FlashSpeed.state;
            if (speed == null) speed = 1;
            tuyaConfig = TuyaLED2Config + " FLASH -flashid " + type + " -flashspeed " + speed;
        }

        cmd = tuyaLEDScript + tuyaConfig;
        execResult = executeCommandLineAndWaitResponse(cmd, 1000 * 6);

        //logInfo(cmd);

        if (execResult.indexOf("Error") > -1) 
        {
            logWarn("TUYA Flash " + triggeringItem.name + " ERR COMM (" + execResult +")")
        }
        else
        {
            logInfo("TUYA Flash " + triggeringItem.name + " " + input.command +": "+ execResult)
        }
    }
});

JSRule({
    name: "TuyaLEDPower",
    description: "Line: "+__LINE__,
    triggers: [
        ItemCommandTrigger("LED1Power"),
        ItemCommandTrigger("LED2Power")
    ],
    execute: function( module, input)
    {
        var triggeringItem = getItem(getTriggeringItemStr(input));

        var execResult
        var cmd 
        var state = input.command;
        var tuyaConfig
        
        if (triggeringItem.name == "LED1Power") tuyaConfig = TuyaLED1Config + state;
        if (triggeringItem.name == "LED2Power") tuyaConfig = TuyaLED2Config + state;

        cmd = tuyaLEDScript + tuyaConfig;
        execResult = executeCommandLineAndWaitResponse(cmd, 1000 * 6);

        if (execResult.indexOf("Error") > -1) 
        {
            logWarn("TUYA LED " + triggeringItem.name + " ERR COMM (" + execResult +")");
        }
        else
        {
            postUpdate(triggeringItem, execResult);
            logInfo("TUYA LED " + triggeringItem.name + " " + input.command +": "+ execResult);
        }
    }
});