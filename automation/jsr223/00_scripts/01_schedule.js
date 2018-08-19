'use strict';
load('/etc/openhab2/automation/jsr223/00_jslib/JSRule.js');

var gcal_array = [];
var gcal_array_temp = [];

var MODE_DEFAULT = 0;
var MODE_TODAY = 1;
var MODE_WITHIN_NEXT_HOUR = 2;
var MODE_NOW = 3;
var MODE_OVER = 4;

var TTS_OFF = 0;
var TTS_DEFAULT = 1;

function custom_sort(a, b) {
    return jodaDate(a.start.dateTime).compareTo(jodaDate(b.start.dateTime));
}

function arrayUnique(array) {
    var a = array.concat();
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) 
        {
            if((a[i].id) === (a[j].id))
                logInfo(a[i].summary +" state: "+ a[i].state);
                a.splice(j--, 1);
        }
    }
    return a;
}


JSRule({
    name: "GetCalEvents",
    description: "Line: "+__LINE__,
    triggers: [
        ItemCommandTrigger("SysStartup","ON"),
        TimerTrigger("0 0/30 * * * ?"),
        ItemCommandTrigger("Cal_Update")
    ],
    execute: function( module, input)
    {
        var itemCal_Update = getItem("Cal_Update");
        postUpdate(itemCal_Update,"updating...");
        
        var results1 = executeCommandLineAndWaitResponse("/etc/openhab2/scripts/sh/calsync.sh XXXXXXX1@gmail.com list Cal_illnesse_", 1000 *5);
        //logInfo("GetCalEvents: " + results1)
        var results2 = executeCommandLineAndWaitResponse("/etc/openhab2/scripts/sh/calsync.sh XXXXXXX2@googlemail.com list Cal_janine_", 1000 *5);
        //logInfo("GetCalEvents: " + results2)

        if ((results1 == "") || (results2 == "")) return;

        gcal_array_temp = JSON.parse(results1).concat(JSON.parse(results2));
        //logInfo("gcal_array_temp size: " + gcal_array_temp.length);

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

        //calendar shit
        var itemTTSOut2 = getItem("TTSOut2");
        var JsJodaNow = JSJoda.LocalDateTime.now();
        var hour_now = JsJodaNow.hour();
        var minute_now = JsJodaNow.minute();

        ScheduleCalEvents();

        var Echo1_Volume = getItem("Echo1_Volume");
        var Echo2_Volume = getItem("Echo2_Volume");

        //turn off tts
        var itemTTSMode = getItem("TTSMode");
        if ((hour_now >= 23) && (hour_now <= 5))
        {
            if (itemTTSMode.state != TTS_OFF)
            {
                sendCommand(itemTTSOut2,"TTS deaktiviert");
                postUpdate(itemTTSMode,TTS_OFF);
            }
            
            //reset shit late night
            if ((hour_now == 3) && (minute_now == 0))
            {
                logInfo("Resetting Echo Volume")
                sendCommand(Echo1_Volume,30)
                sendCommand(Echo2_Volume,50)
            }
        }
        else 
        {
            var itemAtHomeS = getItem("AtHomeS");
            var itemAtHomeJ = getItem("AtHomeJ");

            if ((itemAtHomeJ.state == OFF) && (itemAtHomeS.state == OFF))
            {
                if (itemTTSMode.state != TTS_OFF)
                {
                    sendCommand(itemTTSOut2,"TTS deaktiviert");
                    postUpdate(itemTTSMode,TTS_OFF);
                }
            }
            else
            {
                if (itemTTSMode.state != TTS_DEFAULT) 
                {
                    postUpdate(itemTTSMode,TTS_DEFAULT);
                    sendCommand(itemTTSOut2,"TTS aktiviert");
                }
            }
        }

        //alarm
        var ALARM1_PERSON1_H = getItem("ALARM1_PERSON1_H");
        var ALARM1_PERSON1_M = getItem("ALARM1_PERSON1_M");
        var ALARM1_PERSON1_D = getItem("ALARM1_PERSON1_D");

        //logInfo("ALARM1_PERSON1_H.state " + ALARM1_PERSON1_H.state +" ALARM1_PERSON1_M.state " + ALARM1_PERSON1_M.state + " ALARM1_PERSON1_D.state " + ALARM1_PERSON1_D.state);
        if ((ALARM1_PERSON1_H.state == null) || (ALARM1_PERSON1_M.state == null) || (ALARM1_PERSON1_D.state == null)) return;
        //logInfo("im here");

        var minute = parseInt(ALARM1_PERSON1_M.state)
        var m_match = (minute == minute_now)
        if (m_match)
        {
            var bedtime_hours = 9;
            var hour = parseInt(ALARM1_PERSON1_H.state)
            var TTSOut1Quiet = getItem("TTSOut1Quiet");
    
            var day_number = JsJodaNow.dayOfWeek().value()
            var d_begin = parseInt(ALARM1_PERSON1_D.state.toString().substr(0,1));
            var d_end = parseInt(ALARM1_PERSON1_D.state.toString().substr(1,2));
            var d_match = ((day_number >= d_begin) && (day_number <= d_end));
            var h_match = (hour == hour_now)

            //logInfo(" d_begin "+d_begin+" d_end "+d_end+" d_match "+d_match+" h_match "+h_match+" m_match "+m_match);

            if (d_match && m_match)
            {
                var magic = (hour < bedtime_hours) ? 24 : 0
                if ((hour - bedtime_hours + magic) == hour_now)
                {
                    sendCommand(itemTTSOut2,"In "+bedtime_hours+" Stunden klingelt der Wecker. Zeit ins Bett zu gehen!")
                    logInfo("Alarm: go to bed reminder")
                }
                if(h_match)
                {
                    var currentTime = "Es ist " + hour_now +" Uhr " + ((minute_now != 0) ? minute_now : "");
                    //var String pollen = "Die heutige Pollenbelastung ist " + transform("MAP", "pollen.map", Pollen_1.state.toString) + "."
                    var todaysEvents = getTodaysEvents();
                    var out = "Guten Morgen. " + currentTime + ", Zeit zum Aufstehen. " + todaysEvents;
                    logInfo("Alarm: " + out );
                    var AlarmTimer = null

                    var Echo1_RadioStationId = getItem("Echo1_RadioStationId");
                    var Echo2_RadioStationId = getItem("Echo2_RadioStationId");
                    sendCommand(Echo1_Volume,30)
                    sendCommand(Echo2_Volume,30)
                    sendCommand(Echo1_RadioStationId,"s2585")
                    sendCommand(Echo2_RadioStationId,"s2585")
                        
                    AlarmTimer = createTimer(now().plusSeconds(60), function() 
                    {
                        var TuyaSocket2 = getItem("TuyaSocket2");
                        sendCommand(TTSOut1Quiet,out)
                        sendCommand(itemTTSOut2,out)
                        postUpdate(TuyaSocket2,ON);
    
                        AlarmTimer = null;
                    });
                }
            }
        }
    }
});
