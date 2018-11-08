'use strict';
load('/etc/openhab2/automation/jsr223/00_jslib/JSRule.js');

var gcal_array = [];
var gcal_array_temp = [];
var gcal_array_cmd = [];

var MODE_DEFAULT = 0;
var MODE_TODAY = 1;
var MODE_WITHIN_NEXT_HOUR = 2;
var MODE_NOW = 3;
var MODE_OVER = 4;

var AtHome;

JSRule({
    name: "GetCalEvents",
    description: "Line: "+__LINE__,
    triggers: [
        ItemCommandTrigger("SysStartup",2),
        TimerTrigger("0 0/30 * * * ?"),
        ItemCommandTrigger("Cal_Update")
    ],
    execute: function( module, input)
    {
        var itemCal_Update = getItem("Cal_Update");
        postUpdate(itemCal_Update,"updating...");
        
        var results1 = executeCommandLineAndWaitResponse("/etc/openhab2/scripts/sh/calsync.sh XXX@gmail.com list", 1000 *5);
        var results2 = executeCommandLineAndWaitResponse("/etc/openhab2/scripts/sh/calsync.sh XXX@googlemail.com list", 1000 *5);
        var results3 = executeCommandLineAndWaitResponse("/etc/openhab2/scripts/sh/calsync.sh XXX@group.calendar.google.com list", 1000 *5); //müll
        var results4 = executeCommandLineAndWaitResponse("/etc/openhab2/scripts/sh/calsync.sh XXX@group.calendar.google.com list", 1000 *5); //cmd

        if ((results1 == "") || (results2 == "") || (results3 == "") || (results4 == "")) return;

        gcal_array_cmd = JSON.parse(results4)
        for(var i = 0; i < gcal_array_cmd.length; i++)
        {
            if (gcal_array_cmd[i].start.dateTime == null) gcal_array_cmd[i].start.dateTime = gcal_array_cmd[i].start.date + "T00:00:00"; // all day event
            else gcal_array_cmd[i].start.dateTime = gcal_array_cmd[i].start.dateTime.split("+")[0];
            if (gcal_array_cmd[i].end.dateTime == null) gcal_array_cmd[i].end.dateTime = gcal_array_cmd[i].end.date + "T00:00:00"; // all day event
            else gcal_array_cmd[i].end.dateTime = gcal_array_cmd[i].end.dateTime.split("+")[0];
        }


        gcal_array_temp = JSON.parse(results1).concat(JSON.parse(results2)).concat(JSON.parse(results3));
        // logInfo("gcal_array_temp size: " + gcal_array_temp.length);

        for(var i = 0; i < gcal_array_temp.length; i++)
        {
            gcal_array_temp[i].state = MODE_DEFAULT;

            if (gcal_array_temp[i].start.dateTime == null) gcal_array_temp[i].start.dateTime = gcal_array_temp[i].start.date + "T00:00:00"; // all day event
            else gcal_array_temp[i].start.dateTime = gcal_array_temp[i].start.dateTime.split("+")[0];

            if (gcal_array.length > 0)
            {
                var findid = gcal_array_temp[i].id;
                var f;
                var found = gcal_array.some(function(item, index) { f = index; return item.id == findid });
                if (found) {
                    gcal_array_temp[i].state = gcal_array[f].state;
                }
            }
        }

        gcal_array = gcal_array_temp;
        //gcal_array = arrayUnique(gcal_array.concat(gcal_array_temp));

        gcal_array.sort(custom_sort);
        gcal_array = gcal_array.slice(0,8);
        ScheduleCalEvents();

        //logInfo("gcal_array size: " + gcal_array.length);

        for(var i = 0; i < gcal_array.length; i++) 
        {
            gcal_array[i].calitemid = i+1;
            
            var obj = gcal_array[i];
            var toUpdate = "Cal_Event" + obj.calitemid;
            var itemUI = getItem(toUpdate + "__UI");
            //var itemSummary = getItem(toUpdate + "__Summary");
            var itemStartTime = getItem(toUpdate + "__StartTime");
            var itemToday = getItem(toUpdate + "__Today");
   
            itemUI.label = obj.summary;
            //logInfo("1>" + obj.summary +" state: "+ obj.state);

            var status = "";
            if (obj.state == 1) status = "TODAY "
            else if (obj.state == 2) status = "COMING UP "
            else if (obj.state == 3) status = "NOW "

            var starttime = jodaDate(obj.start.dateTime);
            var weekday = starttime.dayOfWeek().value();
            var weekdayname = getWeekdayName(weekday);

            var out = status + weekdayname +" "+ pad(starttime.dayOfMonth(),2)+"."+pad(starttime.monthValue(),2)+
                      " " +
                      pad(starttime.hour(),2)+":"+pad(starttime.minute(),2)
    
            //postUpdate(itemSummary,obj.summary)
            postUpdate(itemStartTime,obj.start.dateTime)
            postUpdate(itemUI, out)
            postUpdate(itemToday, obj.state)
        }
        postUpdate(itemCal_Update,"OK");
    }
});

function ScheduleCalEvents()
{
    var itemTTSOut2 = getItem("TTSOut2");
    var JsJodaNow = JSJoda.LocalDateTime.now();
    var month_now = JsJodaNow.monthValue()
    var day_now = JsJodaNow.dayOfMonth()
    var hour_now = JsJodaNow.hour();
    var minute_now = JsJodaNow.minute();

    for(var i = 0; i < gcal_array.length; i++) 
    {
        var obj = gcal_array[i];
        var date = jodaDate(obj.start.dateTime)

        if ((date.monthValue() == month_now) && (date.dayOfMonth() == day_now)) // it's today
        {
            if (gcal_array[i].state < MODE_TODAY)
            {
                gcal_array[i].state = MODE_TODAY;
            }

            if ((gcal_array[i].state < MODE_WITHIN_NEXT_HOUR) && (JsJodaNow.plusHours(1).compareTo(date) > 0)) //it's within in the next hour, set 2
            {
                gcal_array[i].state = MODE_WITHIN_NEXT_HOUR;
                logInfo("gCal_DateTimes termin beginnt in einer Stunde")
                sendCommand(itemTTSOut2,"Der Termin "+obj.summary+" beginnt in einer Stunde.")
            }
            
            if ((gcal_array[i].state < MODE_NOW) && ((date.hour() == hour_now) && (date.minute() == minute_now))) // time matches, it's now!
            {
                gcal_array[i].state = MODE_NOW;
                logInfo("gCal_DateTimes termin beginnt jetzt")
                sendCommand(itemTTSOut2, "Der Termin "+obj.summary+" beginnt jetzt.")
            }
        }
        else
        {
            gcal_array[i].state = MODE_DEFAULT;
        }
        //if (obj.state != 0) logInfo("2>" + obj.summary +" state: "+ obj.state);
    }
}

function getTodaysEvents()
{
    var out = "Keine Termine heute.";
    var events = [];
    var sum = 0;
    for(var i = 0; i < gcal_array.length; i++) 
    {
        var obj = gcal_array[i];

        if ((obj.state >= MODE_TODAY) && (obj.state < MODE_OVER))
        {
            //logInfo("getTodaysEvents sum" + obj.summary);
            sum++;
            events.push(obj.summary);
        }
    }
    if (sum > 0)
    {
        out = "Es gibt " + ((sum == 1) ? "einen Termin" : (sum + " Termine")) + " heute. ";

        for(var j = 0; j < events.length; j++) 
        {
            if ((events.length > 1) && (j == events.length -1)) 
            {
                out += "und " + events[j] +". ";
            }
            else if (events.length == 1)
            {
                out += events[j] +". ";
            }
            else
            {
                out += events[j] +", ";
            }
        }
        // logInfo("getTodaysEvents " + out)
        // var itemTTSOut2 = getItem("TTSOut2");
        // sendCommand(itemTTSOut2,out);
    }
    logInfo("getTodaysEvents " + out)
    return out;
}


JSRule({
    name: "Scheduler",
    description: "Line: "+__LINE__,
    triggers: [
        TimerTrigger("0 * * * * ?")
    ],
    execute: function( module, input)
    {
        var itemTTSMode = getItem("TTSMode");
        var itemTTSOut2 = getItem("TTSOut2");
        var Echo1_Volume = getItem("Echo1_Volume");
        var Echo2_Volume = getItem("Echo2_Volume");

        var JsJodaNow = JSJoda.LocalDateTime.now();
        var month_now = JsJodaNow.monthValue()
        var day_now = JsJodaNow.dayOfMonth()
        var hour_now = JsJodaNow.hour();
        var minute_now = JsJodaNow.minute();

        if (getItem("HourNow").state != hour_now) postUpdate("HourNow",hour_now);
        ScheduleCalEvents();

        var itemHMKeymatic1State = getItem("HMKeymatic1State");
        var itemAtHomeS = getItem("AtHomeS");
        var itemAtHomeJ = getItem("AtHomeJ");

        AtHome = ((itemAtHomeJ.state == ON) || (itemAtHomeS.state == ON));
        if (AtHome && (itemTTSMode.state != TTS_DEFAULT)) exec_events("tts_mute",false);
        else if (!AtHome && (itemTTSMode.state != TTS_OFF)) exec_events("tts_mute",true);

        /////////////////////////////////////////////////////
        
        for(var i = 0; i < gcal_array_cmd.length; i++) 
        {
            var obj = gcal_array_cmd[i];
            var startdate = jodaDate(obj.start.dateTime)
            var enddate = jodaDate(obj.end.dateTime)
            var cmd = obj.summary.toLowerCase();

            if ((startdate.monthValue() == month_now) && (startdate.dayOfMonth() == day_now)) // it's today
            {
                if ((startdate.hour() == hour_now) && (startdate.minute() == minute_now))
                {
                    logInfo("exec event: " + cmd);
                    if (cmd == "alarm")
                    {
                        var TTSOut1Override = getItem("TTSOut1Override");
                        var currentTime = "Es ist " + hour_now +" Uhr " + ((minute_now != 0) ? minute_now : "");
                        //var String pollen = "Die heutige Pollenbelastung ist " + transform("MAP", "pollen.map", Pollen_1.state.toString) + "."
                        var todaysEvents = getTodaysEvents();
                        var out = "Guten Morgen. " + currentTime + ", Zeit zum Aufstehen. " + todaysEvents;
                        logInfo("Alarm: " + out );
    
                        var Echo1_RadioStationId = getItem("Echo1_RadioStationId");
                        var Echo2_RadioStationId = getItem("Echo2_RadioStationId");
                        sendCommand(Echo1_Volume,30)
                        sendCommand(Echo2_Volume,30)
                        sendCommand(Echo1_RadioStationId,"s2585")
                        sendCommand(Echo2_RadioStationId,"s2585")
                            
                        var AlarmTimer = createTimer(now().plusSeconds(60), function() 
                        {
                            var TuyaSocket2 = getItem("TuyaSocket2");
                            sendCommand(TTSOut1Override,out)
                            sendCommand(itemTTSOut2,out)
                            postUpdate(TuyaSocket2,ON);
        
                            AlarmTimer = null;
                        });
                    }
                    else
                    {
                        exec_events(cmd,true)
                    }
                }
                else if ((enddate.hour() == hour_now) && (enddate.minute() == minute_now))
                {
                    exec_events(cmd,false)
                }
                // logInfo("sched event: " + cmd);
            }
        }
    }
});


function exec_events(id,on) 
{
    if (id == "tts_mute")
    {
        if (on)
        {
            sendCommand("TTSOut2","TTS deaktiviert");
            postUpdate("TTSMode",TTS_OFF);
        }
        else
        {
            if (AtHome)
            {
                postUpdate("TTSMode",TTS_DEFAULT);
                sendCommand("TTSOut2","TTS aktiviert");
            }
        }
    }
    else if (id == "lock_doors")
    {
        if (on)
        {
            if (AtHome)
            {
                sendCommand("TTSOut2","Türen verriegelt");
                sendCommand("HMKeymatic1State",OFF); //lock
            }
        }
    }
    else if (id == "reset_echo_vol")
    {
        if (on)
        {
            logInfo("Resetting Echo Volume")
            sendCommand("Echo1_Volume",VOL_QUIET)
            sendCommand("Echo2_Volume",VOL_NORMAL)

            //sendCommand("Echo1_TTSVolume",VOL_QUIET)
            //sendCommand("Echo2_TTSVolume",VOL_NORMAL)
        }
    }
    else if (id == "fb_heizung")
    {
        if (on)
        {
            postUpdate("MQTT_Shelly_Heizung",ON);
            sendCommand("TTSOut2","Fussbodenheizung an");
        }
        else
        {
            postUpdate("MQTT_Shelly_Heizung",OFF);
            sendCommand("TTSOut2","Fussbodenheizung aus");
        }
    }
}