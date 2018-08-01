'use strict';
load('/etc/openhab2/automation/jsr223/00_jslib/JSRule.js');

JSRule({
    name: "fboxRinging",
    description: "Line: "+__LINE__,
    triggers: [
        ItemStateChangeTrigger("fboxRinging"),
        ItemStateChangeTrigger("fboxRinging_Out")
    ],
    execute: function( module, input)
    {
        var triggeringItem = getItem(getTriggeringItemStr(input));

        var command;
        var execResult;
        var tempcallprefix;
        var tempcallbegin;
        var tempcallend;

        if (triggeringItem.state == ON)
        {
            var Incoming = false;
            if (triggeringItem.name == "fboxRinging") Incoming = true;
    
            var Call =                  Incoming ? getItem("fboxIncomingCall") : getItem("fboxOutgoingCall");
            var CallResolved =          Incoming ? getItem("fboxIncomingCallResolved") : getItem("fboxOutgoingCallResolved");
            var LastNumber =            Incoming ? getItem("Fritz_LastIncoming") : getItem("Fritz_LastOutgoing");
            var LastNumberResolved =    Incoming ? getItem("Fritz_LastIncomingResolved") : getItem("Fritz_LastOutgoingResolved");
            var LastNumberTimeUI =      Incoming ? getItem("Fritz_LastIncomingTimeUI") : getItem("Fritz_LastOutgoingTimeUI");
            var CallPrefix = getItem("CallPrefix");
            var itemTTSOut2 = getItem("TTSOut2");
    
            var TmpCall = Call.state;
            var CallerNumber = TmpCall.getValue(Incoming ? 1 : 0);
    
            var TmpCall2 = CallResolved.state;
            var CallerName = TmpCall2.getValue(Incoming ? 1 : 0);
        
            if (CallerName.startsWith("Name not found for")) CallerName = "Unbekannt";
            
            sendCommand(itemTTSOut2,(Incoming ? "Anruf von " : "Anruf an ") + CallerName)
            sendCommand(LastNumber,CallerNumber)
            sendCommand(LastNumberResolved,CallerName)
            tempcallprefix = (Incoming ? "Anruf von " : "Anruf an ") + LastNumberResolved.state + " ("+LastNumber.state+") ";
            postUpdate(CallPrefix, tempcallprefix);
        
            var time = formatUITimeStampfromJodaDate(now());
            postUpdate(LastNumberTimeUI,time);
        }

        if (triggeringItem.state == ON)
        {
            var CallBegin = getItem("CallBegin");
            command = "mosquitto_pub -t broadlink/audio/sony/mute -m \"replay\""
            execResult = executeCommandLineAndWaitResponse(command, 1000 * 3)
            //logInfo("fboxRinging mute audio " +execResult )
            tempcallbegin = formatTimeStampfromJodaDate(DateTime.now().minusHours(2));
            postUpdate(CallBegin, tempcallbegin);
        }
        else
        {
            var CallPrefix = getItem("CallPrefix");
            var CallBegin = getItem("CallBegin");
            var CallEnd = getItem("CallEnd");
            command = "mosquitto_pub -t broadlink/audio/sony/mute -m \"replay\""
            execResult = executeCommandLineAndWaitResponse(command, 1000 * 3)
            //logInfo("fboxRinging unmute audio " + execResult)
            tempcallend = formatTimeStampfromJodaDate(DateTime.now().minusHours(2));
            postUpdate(CallEnd, tempcallend);

            sleep(2000);
            execResult = executeCommandLineAndWaitResponse("/etc/openhab2/scripts/sh/calpost.sh XXXXXXXXXXXXXXXXXXX@group.calendar.google.com post \"" + CallPrefix.state.toString() + "\" "+ CallBegin.state.toString() +" "+ CallEnd.state.toString() +"", 1000 * 60 *2)
            //logInfo("PostCalEvents " + execResult);
        }
    }
});

/*
rule "verpasster Anruf"
when
    Item fboxMissedCalls changed  // if you didnt pick up, the missedcall item will increment
then
	// log the entry
	var String text = Fritz_LastIncomingDest.state + ": Missed Call from " + Fritz_LastIncomingResolved.state + ", " + Fritz_LastIncoming.state
	logInfo("Fritz Call", "Fritz!Box says: "+text)
end
*/