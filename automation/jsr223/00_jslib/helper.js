/**
 * Copyright (c) 2018 by Helmut Lehmeyer.
 * 
 * @author Helmut Lehmeyer 
 */

'use strict'; 
	var OPENHAB_CONF 			= Java.type("java.lang.System").getenv("OPENHAB_CONF"); // most this is /etc/openhab2
	var automationPath 			= OPENHAB_CONF+'/automation/';
	var mainPath 				= automationPath + 'jsr223/00_jslib/';

load(mainPath + 'js-joda.js');

var IP_kodi = "192.168.178.26";
var IP_sonyaudio = "192.168.178.36";

var kodiurl = "http://"+IP_kodi+":8080/jsonrpc?request=";
var broadlink_delay = 400;

var TTS_OFF = 0;
var TTS_DEFAULT = 1;

var VOL_OFF = 0;
var VOL_QUIET = 30;
var VOL_NORMAL = 40;

var Notifications = "";

function decodeKodiThumbnailURL(str)
{
    var r = str;
    r = decodeURIComponent(r);
    r = r.replace("image://","");
    r = r.replace(".jpg/",".jpg");
    //r = r.replace("/original/","/w300/");
    return r;
}

function IsAlive(target,port,timeout)
{
    try 
    {
        var state = false;
        state = Ping.checkVitality(target, port, timeout);
        return state;
    }
    catch(err) 
    {
        logInfo("IsAlive err: " + err.message);
        return false;
    } 
    return false;
}

function kodiCall(call)
{
    //logInfo("################ "+me+" Line: "+__LINE__+"  #################");	
    //print("Ping localhost: 	" + Ping.checkVitality(IP_kodi, 22, 500));

    var kodireturn = HTTP.sendHttpPostRequest(kodiurl, "application/json", call); 
    //logInfo(kodireturn);
    return JSON.parse(kodireturn);
}

function sendKodiNotification(title,msg)
{
    var call = '{"jsonrpc":"2.0","method":"GUI.ShowNotification","params":{"title":"'+title+'","message":"'+msg+'"},"id":1}';
    kodiCall(call);
}

function sendNotification(title,msg)
{
    var itemNotifications = getItem("Notifications");

    if (title != null ) title += ": ";
    else title = ""
    postUpdate(itemNotifications,itemNotifications.state + title + msg + "\n");
}

function sendMQTT(broker, topic, message, quiet)
{
    quiet = quiet || false;
    var execResult;
    var command;
    if (broker == "local")
    {
        command = "mosquitto_pub -t " + topic + " -m \"" + message + "\"";
    }
    else if (broker == "cloudmqtt")
    {
        command = "mosquitto_pub -h XXX.com -p 19777 -u XXX -P XXX -i openhab2JS -t " + topic + " -m \"" + message + "\"";
    }
    execResult = executeCommandLineAndWaitResponse(command, 1000 *3);
    if (!quiet) logInfo("sendMQTT " + topic);
    //logInfo("sendMQTT broker: " + broker + " topic: " + topic + " result: " + execResult);
}

function isNumber(n) { return !isNaN(parseFloat(n)) && !isNaN(n - 0) }

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

function containsAny(str, substrings) {
    for (var i = 0; i != substrings.length; i++) {
       var substring = substrings[i];
       if (str.indexOf(substring) != - 1) {
         return substring;
       }
    }
    return null; 
}

function sleep(ms) 
{
    java.lang.Thread.sleep(ms);
    //nope
    //return new Promise(resolve => setTimeout(resolve, ms));
}

function pad (str, max) 
{
    str = str.toString();
    return str.length < max ? pad("0" + str, max) : str;
}

function formatUITimeStampfromJodaDate(jodadate)
{
    var date = new Date(jodadate);
    return date.getFullYear() +"-"+ pad((date.getMonth()+1),2) +"-"+ pad(date.getDate(),2) +" "+ pad(date.getHours(),2) +":"+ pad(date.getMinutes(),2) +":"+ pad(date.getSeconds(),2);
}
function formatUIShortTimeStampfromJodaDate(date)
{
    return pad(date.getDate(),2) +"."+ pad((date.getMonth()+1),2) +" "+ pad(date.getHours(),2) +":"+ pad(date.getMinutes(),2);
}

function jodaDate(jodadate)
{
    var date = jodadate.toString();
    return JSJoda.LocalDateTime.parse((date).split(".")[0]);
}

function formatTimeStampfromJodaDate(jodadate)
{
    //2018-07-11T13:50:07.834+02:00
    //s
    var date = new Date(jodadate);
    return date.getFullYear() +"-"+ pad((date.getMonth()+1),2) +"-"+ pad(date.getDate(),2) +"T"+ pad(date.getHours(),2) +":"+ pad(date.getMinutes(),2) +":"+ pad(date.getSeconds(),2) +".000000Z";
}


function getWeekdayName(day)
{
    var weekdaynames = ["Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag","Sonntag"]
    //2018-07-11T13:50:07.834+02:00
    return weekdaynames[day-1];
}

function formatISOStringtoJodaDateTimeZone(isostring)
{
    //2018-07-11T13:50:07.834+02:00
    return DateTime.parse(isostring.replace(".000Z", "+02:00"));
}

	//https://wiki.shibboleth.net/confluence/display/IDP30/ScriptedAttributeDefinition
	var logger 					= Java.type("org.slf4j.LoggerFactory").getLogger("org.eclipse.smarthome.automation.module.script.rulesupport.internal.shared.SimpleRule");
	
	var RuleBuilder 			= Java.type("org.eclipse.smarthome.automation.core.util.RuleBuilder");
	var RuleManager 			= Java.type("org.eclipse.smarthome.automation.RuleManager");

	var uuid 					= Java.type("java.util.UUID");
	var ScriptExecution 		= Java.type("org.eclipse.smarthome.model.script.actions.ScriptExecution");
	var ScriptServiceUtil 		= Java.type("org.eclipse.smarthome.model.script.ScriptServiceUtil");
	var ExecUtil 				= Java.type("org.eclipse.smarthome.io.net.exec.ExecUtil");
	var HttpUtil 				= Java.type("org.eclipse.smarthome.io.net.http.HttpUtil");
	var Ping                    = Java.type('org.eclipse.smarthome.model.script.actions.Ping');
    var HTTP                    = Java.type('org.eclipse.smarthome.model.script.actions.HTTP');

	//Other
	var Modifier 				= Java.type("java.lang.reflect.Modifier");
	var InputStream				= Java.type("java.io.InputStream");
	var IOUtils					= Java.type("org.apache.commons.io.IOUtils");
	

	//Types
	var UnDefType 				= Java.type("org.eclipse.smarthome.core.types.UnDefType");
	var StringListType 			= Java.type("org.eclipse.smarthome.core.library.types.StringListType");	
	var RawType 				= Java.type("org.eclipse.smarthome.core.library.types.RawType");
	var RewindFastforwardType 	= Java.type("org.eclipse.smarthome.core.library.types.RewindFastforwardType");
	var PlayPauseType 			= Java.type("org.eclipse.smarthome.core.library.types.PlayPauseType");
	var NextPreviousType 		= Java.type("org.eclipse.smarthome.core.library.types.NextPreviousType");
		
	//Time JAVA 7 joda
	var DateTime 				= Java.type("org.joda.time.DateTime");
	//Time JAVA 8
	var LocalDate 				= Java.type("java.time.LocalDate");
	var LocalDateTime 			= Java.type("java.time.LocalDateTime");
	var LocalTime 				= Java.type("java.time.LocalTime");
	var Month 					= Java.type("java.time.Month");
	var ZoneOffset 				= Java.type("java.time.ZoneOffset");
	var ZoneId 					= Java.type("java.time.ZoneId");
	var OffsetDateTime 			= Java.type("java.time.OffsetDateTime");

	var Timer = Java.type('java.util.Timer');
	
	//var QuartzScheduler = Java.type("org.quartz.core.QuartzScheduler");
	
	load( mainPath + 'PersistenceExtensions.js');
	
(function(context) {
  'use strict';	
	context.automationPath 	= automationPath;
	context.mainPath 		= mainPath;

	//Todo missing:
	context.UnDefType 	= UnDefType;
	// context.OPEN 		= OpenClosedType.OPEN;
	// context.CLOSED		= OpenClosedType.CLOSED;
	context.REWIND 		= RewindFastforwardType.REWIND;
	context.FASTFORWARD	= RewindFastforwardType.FASTFORWARD;
	context.PLAY 		= PlayPauseType.PLAY;
	context.PAUSE		= PlayPauseType.PAUSE;
	context.NEXT		= NextPreviousType.NEXT;
    context.PREVIOUS	= NextPreviousType.PREVIOUS;
	
	context.uuid = uuid;
	
	context.logInfo = function(type , value) {
		logger.info(args(arguments));
	};
	context.logWarn = function(type , value) {
		logger.warn(args(arguments));
	};
	context.logDebug = function(type , value) {
		logger.debug(args(arguments));
	};
	context.logError = function(type , value) {
		logger.error(args(arguments));
	};
	context.logTrace = function(type , value) {
		logger.trace(args(arguments));
	};
	
	
	context.console  = {};
	context.console.info = context.logInfo;
	context.console.warn = context.logWarn;
	context.console.debug = context.logDebug;
	context.console.error = context.logError;
	
	context.console.log = function(value) {
		logger.info("console.log", value);
	};
	
	context.isUndefined = function(item) {
		return isUndefinedState(item.state);
	};
	context.isUndefinedStr = function(itemStr) {
		return ir.getItem(itemStr) ? isUndefinedState(ir.getItem(itemStr).state) : true;
	};
	
	context.isUndefinedState = function(itemState) {
		if(itemState.toString() == "Uninitialized" || itemState.toString() == "Undefined")return true;
		return false;
	};
	
	context.getItem = function(it) {
		try {
			//print("################## "+ir.getItem(it));
			return (typeof it === 'string' || it instanceof String) ? ir.getItem(it) : it;
		}catch(err) {
			context.logError("getItem "+__LINE__+": "+ it+" "+err);
		} 
		return null;
	};
	context.getItem.sendCommand = context.sendCommand;
	context.isUninitialized = function(it) {
		try {
			var item = context.getItem(it);
            if(item == null || item == undefined || item.state == undefined || item.state instanceof UnDefType)return true;
            if(item.state.toString() == "Undefined" || item.state.toString() == "Uninitialized" )return true;
            
		}catch(err) {
			context.logError("isUninitialized "+__LINE__+": "+ it+" "+err);
			return true;
		} 
		return false;
	};
	
	//returns item if exists, if got a value and this is not set, it will be updated
	context.updateIfUninitialized = function(it, val) {	
		try {
			var item = context.getItem(it);
			/*
			context.logInfo("|-|-updateIfUninitialized "+__LINE__, item +" -> "+val);	//val -> undefined
			context.logInfo("|-|-updateIfUninitialized "+__LINE__, isUninitialized(it));	//true
			context.logInfo("|-|-updateIfUninitialized "+__LINE__, val == undefined);    //true
			context.logInfo("|-|-updateIfUninitialized "+__LINE__, val == "undefined");  //false
			context.logInfo("|-|-updateIfUninitialized "+__LINE__, val === null);        //false
			context.logInfo("|-|-updateIfUninitialized "+__LINE__, val == null);         //true
			if(val){context.logInfo("|-|-updateIfUninitialized "+__LINE__, "val is defined!!!!")};
			if(item){context.logInfo("|-|-updateIfUninitialized "+__LINE__, "item is defined!!!!")}; //item is defined!!!!
			
			if(item && item.state instanceof UnDefType){
				if(item.type == 
			}
			*/
			if(item == undefined || item == null){
				//gefährlich, es fehlt dann zB intValue()
				//if(val != undefined)postUpdate( it, val);
				//return context.getItem(it);
				return item;
			}
			if( isUninitialized(it) && val != undefined){
				postUpdate( it, val);
				return item;
			}
			return item;
		}catch(err) {
			context.logError("updateIfUninitialized "+__LINE__, err);
			return null;
		} 
		return null;
	};

    
    context.getTriggeringItemStr = function(input)
    {
        var ev = input.get("event")+"";
        var evArr = ev.split("'").join("").split("Item ").join("").split(" ");
        return evArr[0];
    };

    context.MQTTpublish = function(service, topic, message) {
        getAction("Mqtt").static.publish(service,topic,message);
    };

	context.sendMail = function(mail, subject, message) {
		getAction("Mail").static.sendMail(mail, subject, message);
	};
	context.sendXMPP = function(mail, message) {
		getAction("XMPP").static.sendXMPP(mail, message);
	};
	context.transform = function(type, script, value) {
		//var myList = transform("JS", "wunderground.js", wundergr);//returns String
		//https://www.openhab.org/docs/configuration/transformations.html#usage
		context.logInfo("|-|-transform "+__LINE__, "type:" + type, "script:" + script, "content:" + value.substring(0, 40));
		var t = getAction("Transformation").static.transform;
		context.logInfo("|-|-transform "+__LINE__, "transform:" + t);

		getAction("Transformation").static.transform(type, script, value);
	};
	
	context.postUpdate = function(item, value) {
		//events.postUpdate((typeof item === 'string' || item instanceof String) ? ir.getItem(item) : item, value);
		try {
			//if(value == null || (!(Object.prototype.toString.call(value) === '[object String]') && isNaN(value) && (value+"") == "NaN")) {
			//	context.logError("helper.js postUpdate " + __LINE__ + ". Cannot execute postUpdate!. 'command' must not be null or NaN: Item: '" + item + "' with value: '" + value + "'");
			//}else{
				events.postUpdate(item, value);
			//}
		}catch(err) {
			context.logError("helper.js postUpdate " + __LINE__ + ". Item: '" + item + "' with value: '" + value + "' ' Error:" +  err);
		}
	};
	
	context.sendCommand = function(item, value) {
		//events.sendCommand((typeof item === 'string' || item instanceof String) ? ir.getItem(item) : item, value);
		//context.logError("sendCommand "+__LINE__, value, value+"" == "NaN", isNaN(value), (Object.prototype.toString.call(value) === '[object String]'));
		try {
			//if(value == null || (!(Object.prototype.toString.call(value) === '[object String]') && isNaN(value) && (value+"") == "NaN")) {
			//	context.logError("helper.js sendCommand " + __LINE__ + ". Cannot execute sendCommand!. 'command' must not be null or NaN: Item: '" + item + "' with value: '" + value + "'");
			//}else{
				events.sendCommand(item, value);
			//}
		}catch(err) {
			context.logError("helper.js sendCommand " + __LINE__ + ". Item: '" + item + "' with value: '" + value + "' ' Error:" +  err);
		}
	};
	
	//NOT TESTED YET: storeStates(Item...);
	context.storeStates = function(item) {
		events.storeStates((typeof item === 'string' || item instanceof String) ? ir.getItem(item) : item);
	};
	//NOT TESTED YET: restoreStates(Map<Item, State>);
	context.restoreStates = function(mapArray) {
		events.restoreStates(mapArray);
	};
	
	//context.createTimerOLD = function(time, runnable) {
		//return QuartzScheduler.createTimer(time, runnable);
	//	return ScriptExecution.createTimer(time, runnable);
	//};

	//https://blog.codecentric.de/en/2014/06/project-nashorn-javascript-jvm-polyglott/
	context.timerObject = {
		timerCount: 0,
		evLoops:[]
	};
	//context.setTimeout = function(fn, millis /*, args... */) {
	context.createTimer = function(fn, millis, arg) {
		// ...
		var t = context.timerObject;
		if(t.timerCount > 999) t.timerCount = 0;
		t.timerCount = t.timerCount + 1;
		t.evLoops[t.timerCount] = new Timer('jsEventLoop'+t.timerCount, false);
		t.evLoops[t.timerCount].schedule(function() {
			//context.logInfo("context.createTimer",  millis, t.timerCount, fn);
			//context.logInfo("context.createTimer " + context.now());
			fn(arg);
		  }, millis);
	   
		// ...
	};

	//round(ungerundeter Wert, Stellen nach dem Komma); round(6,66666, 2); -> 6,67
	context.round = function( x, p) { return(Math.round(Math.pow(10, p)*x)/Math.pow(10, p));};
	
	//Joda for Java 7 and openHAB2 !!!!!!NICHT AUF LocalDateTime UMSCHALTEN!!!!!!
	//https://github.com/JodaOrg/joda-time/issues/81
	context.now = function() { return DateTime.now();};
	//Java8: 
	//context.now 				= function() { return LocalDateTime.now(); };
	context.zoneOffset 			= function() { return OffsetDateTime.now().getOffset(); }; // +02:00
	context.isoDateTimeString 	= function() { return context.now() + (""+context.zoneOffset()).split(":").join(""); }; // '2018-09-11T12:39:40.004+0200'
	
	context.getObjectProperties = function(obj) {
		for (var key in obj) {
			if (obj.hasOwnProperty(key)) {
				context.logInfo("", key+" = "+obj[""+key]);
			}
		}
	};
	
	//### getTriggeredData ###
	//{d72745cd-1ed1-4eaa-980b-a7b989214b52.state=ON, state=ON, event=Light_UG_Arbeitsraum updated to ON, d72745cd-1ed1-4eaa-980b-a7b989214b52.event=Light_UG_Arbeitsraum updated to ON, module=d72745cd-1ed1-4eaa-980b-a7b989214b52}' 
	//{89bad333-ea88-47f5-9a34-3acdad672950.oldState=OFF, oldState=OFF, module=89bad333-ea88-47f5-9a34-3acdad672950, 89bad333-ea88-47f5-9a34-3acdad672950.event=Light_UG_Arbeitsraum changed from OFF to ON, 89bad333-ea88-47f5-9a34-3acdad672950.newState=ON, event=Light_UG_Arbeitsraum changed from OFF to ON, newState=ON}' 
	//{2ff317ad-e3c1-4f3e-b1fe-f7fec99b7c4c.event=Item 'Light_UG_Arbeitsraum' received command ON, 2ff317ad-e3c1-4f3e-b1fe-f7fec99b7c4c.command=ON, event=Item 'Light_UG_Arbeitsraum' received command ON, command=ON, module=2ff317ad-e3c1-4f3e-b1fe-f7fec99b7c4c}' 
	context.getTriggeredData = function(input) {
		
		//https://stackoverflow.com/questions/679915/how-do-i-test-for-an-empty-javascript-object
		//context.logInfo(typeof input);
		//context.logInfo(typeof input === "function");
		//context.logInfo(typeof input === "boolean");
		//context.logInfo(typeof input === "string");
		//context.logInfo(typeof input === "number");
		//context.logInfo(typeof input === "symbol");
		//context.logInfo(typeof input === "undefined");
		//context.logInfo(typeof input === "object");
		//context.logInfo("isEmpty: JSON.stringify(obj)="+JSON.stringify(input));
		//context.logInfo("isEmpty: JSON.stringify(obj)="+JSON.parse(input));
		//context.logInfo(isEmpty(input));
		
		context.logInfo("input", input);
		//Item 'Light_UG_Arbeitsraum' received command OFF'
		//Light_UG_Arbeitsraum updated to OFF'
		//Light_UG_Arbeitsraum changed from ON to OFF
		//context.logInfo("event",input.get("event"));
		var ev = input.get("event")+"";
		
		//Light_UG_Arbeitsraum received command OFF
		//Light_UG_Arbeitsraum updated to OFF
		//Light_UG_Arbeitsraum changed from ON to OFF
		context.logInfo("event",ev.split("'").join("").split("Item ").join("").split(" "));
		
		var evArr = ev.split("'").join("").split("Item ").join("").split(" ");
		
		//context.logInfo("size",input.size());
		//context.logInfo("isEmpty",input.isEmpty());
		//[18f2af96-36fc-4212-be9d-1a2862b34883.command, 18f2af96-36fc-4212-be9d-1a2862b34883.event, event, command, module]
		//[0529f579-8ee5-4046-95da-57bd02db859e.state, 0529f579-8ee5-4046-95da-57bd02db859e.event, state, event, module]
		//[0cc5cb66-9aff-4fe0-b071-9d560aaabc8f.event, 0cc5cb66-9aff-4fe0-b071-9d560aaabc8f.oldState, 0cc5cb66-9aff-4fe0-b071-9d560aaabc8f.newState, oldState, module, event, newState]
		//context.logInfo("keySet",input.keySet());

		var d = {
			//size: 		input.size(),
			oldState:	input.get("oldState")+"",
			newState:	input.get("newState")+"",
			receivedCommand:	null,
			receivedState:		null,
			itemName:	evArr[0]
		};
		

		//TODO: ChannelEventTrigger
		//TODO: stateCondition = ItemStateCondition; 
		//TODO: GenericCompareCondition
		//SEE Dokumentation: http://localhost:8080/rest/module-types

		// {"oldState":null,"newState":null,"receivedState":null,"itemName":"KNX_HFLPB100ZJ200_White","eventType":"command","triggerType":"CommandEventTrigger"}'
		switch (evArr[1]) {
			case "received":
				d.eventType = "command";
				d.triggerType = "ItemCommandTrigger";
				d.triggerTypeOld = "CommandEventTrigger";
				d.receivedCommand = input.get("command")+"";
				break;
			case "updated":
				d.eventType = "update";
				d.triggerType = "ItemStateUpdateTrigger";
				d.triggerTypeOld = "UpdatedEventTrigger";
				d.receivedState = input.get("state")+"";
				break;
			case "changed":
				d.eventType = "change";
				d.triggerType = "ItemStateChangeTrigger";
				d.triggerTypeOld = "ChangedEventTrigger";
				break;
			default:
				if(input.size() == 0){
					d.eventType = "time";
					d.triggerType = "GenericCronTrigger";
					d.triggerTypeOld = "TimerTrigger";
				}else{
					d.eventType = "";
					d.triggerType = "";
				}
		}		
		return d;
	};	
		
	//### Locals vars/functions
	var actions = null;
	var actionList = [];
	    	
	//### getActions ###
	context.getActions = function() {
		/*
		if(actions == null){
			actions = {};
			var services = ScriptServiceUtil.getActionServices();
			if (services != null) {
				for (var actionService in services) {
					var cn = services[actionService].getActionClassName();
					var cl = services[actionService].getActionClass();
					var className = cn.substring(cn.lastIndexOf(".") + 1);
					actions[className] = cl;
					//logWarn(className + " = " + actions[className]);
				}
			}
		}
		
		FUNKTIONIRT IN OH2:
		var XMP = ScriptServiceUtil.actionServices[6].getActionClass();//.getConstructor().newInstance();
		logInfo("################ "+me+" Line: "+__LINE__+"  #################|"+XMP.static.sendXMPP("helmutl@lewi-cleantech.net","vvvvvvvvvvv"));
		
		//OLD
		if(actions == null){
			actions = [];
			var services = ScriptServiceUtil.getActionServices();
			if (services != null) {
				for (var actionService in services) {
					var cn = services[actionService].getActionClassName();
					var className = cn.substring(cn.lastIndexOf(".") + 1);
					actions[actionService] = className;
				}
			}
		}*/
		if(actions == null){
			actions = {};
			var services = ScriptServiceUtil.getActionServices();
			if (services != null) {
				for (var actionService in services) {
					var cn = services[actionService].getActionClassName();
					var className = cn.substring(cn.lastIndexOf(".") + 1);
					actions[className] = services[actionService];
					actionList[actionService] = className;
				}
			}
		}
		//logInfo("actions = " + actions);
		//logInfo("actionList = " + actionList);
		return actions;
	};
	context.getActionList = function(str) {
		if(actions == null){
			actions = getActions();
		}
		return actionList;
	};
	context.getAction = function(str) {
		if(actions == null){
			actions = getActions();
		}
		return actions[str].getActionClass();
	};
	
	//### ExecUtil ###
	context.executeCommandLine = function(commandLine) {
		if(commandLine == null || commandLine == "" ){
			return null;
		}
		return ExecUtil.executeCommandLine(commandLine);
	};
	context.executeCommandLineAndWaitResponse = function(commandLine, timeout) {
		if(commandLine == null || commandLine == "" ){
			return null;
		}
		return ExecUtil.executeCommandLineAndWaitResponse(commandLine, timeout);
	};

	//### HttpUtil ###
	//FROM: C:\dev\workspace\Lewi_20150721\clones\lc\lewienergy-build\bundles\lewienergy-actions\src\main\java\com\lewicleantech\lewienergy\openhab\action\util\Lewi.java
	//static public String sendHttpPostRequest(String url, String contentType, String content, int timeout) { 
	//	//return HttpUtil.executeUrl("POST", url, null, IOUtils.toInputStream(content), contentType, timeout, null); 
	//	return HttpUtil.executeUrl("POST", url, null, IOUtils.toInputStream(content), contentType, timeout); 
	//}
	//var wundergr = getAction("Lewi").static.sendHttpPostRequest(posturl, header, "", timeout);

	context.HttpUtil = HttpUtil;
	//sendHttpGetRequest(String url): Sends an GET-HTTP request and returns the result as a String
	context.sendHttpGetRequest = function(url, timeout) {
		//logInfo("arguments = " + arguments, arguments.length);
		return context.executeUrl("GET", url, timeout);
	};
	//sendHttpPutRequest(String url, Sting contentType, String content): Sends a PUT-HTTP request with the given content and returns the result as a String
	//sendHttpPutRequest(String url): Sends a PUT-HTTP request and returns the result as a String
	context.sendHttpPutRequest = function(url, timeout) {
		return context.executeUrl("PUT", url, timeout);
	};
    //sendHttpPostRequest(String url, String contentType, String content): Sends a POST-HTTP request with the given content and returns the result as a String
	//sendHttpPostRequest(String url): Sends a POST-HTTP request and returns the result as a String
	context.sendHttpPostRequest = function(url, timeout) {
		return context.executeUrl("POST", url, timeout);
	};
    //sendHttpDeleteRequest(String url): Sends a DELETE-HTTP request and returns the result as a String
	context.sendHttpDeleteRequest = function(url, timeout) {
		return context.executeUrl("DELETE", url, timeout);
	};
	context.executeUrl = function(httpMethod, url, timeout) {
		if(url == undefined || url == null || url == "" ){ return null; }
		if(timeout == undefined ){ timeout = 5000; }
		return HttpUtil.executeUrl(httpMethod, url, timeout);
	};
	//like getAction("Lewi").static.sendHttpPostRequest(posturl, header, "", timeout); 
	// NOW    => executeUrlPostWithContent(posturl, "", header, timeout);
	// BETTER =>     executeUrlWithContent("POST", posturl, null, "", header, timeout);
	//context.executeUrlPostWithContent = function(url, content, contentType, timeout) {
	//	return context.executeUrlWithContent("POST", url, null, content, contentType, timeout); 
	//};
	//executeUrl(String httpMethod, String url, Properties httpHeaders, InputStream content, String contentType, int timeout) 
	context.executeUrlWithContent = function(httpMethod, url, httpHeaders, content, contentType, timeout) {
		logInfo("httpMethod = " + httpMethod);
		logInfo("url = " + url);
		logInfo("httpHeaders = " + httpHeaders);
		logInfo("content = " + content);
		logInfo("contentType = " + contentType);
		logInfo("timeout = " + timeout);
		if(httpMethod == undefined || httpMethod == null){ httpMethod = "POST"; }
		if(url == undefined || url == null || url == "" ){ return null; }
		if(httpHeaders == undefined ){ httpHeaders = null; }
		if(content == undefined || content == null ){ content = ""; }
		if(contentType == undefined || contentType == null ){ contentType = ""; }
		if(timeout == undefined || timeout == null ){ timeout = 5000; }
		return HttpUtil.executeUrl(httpMethod, url, httpHeaders, IOUtils.toInputStream(content), contentType, timeout); 
	};
	
	/** STRING FUNCTIONS **/
	context.endTrim = function(x) {
		return x.replace(/\s*$/,'');
	}
	context.endTrim = function(x) {
		return x.replace(/^\s+/g, '');
	}
	context.endAndStartTrim = function(x) {
		return x.replace(/^\s+|\s+$/gm,'');
	}
	context.allTrim = function(x) {
		return x.replace(/^\s+|\s+$/gm,'');
	}
	

	var args = function(a) {
		var um = a.length > 1 ? "\n" : "";
		var s1 = "";
		for(var i in a){
			if(i == 0){
				s1 = "|" + a[i] +"| ";
			}else{
				s1 += um + i + ":'" + a[i] +"' ";
			}
		}
		return s1 + um;
	};
	
	// Is Object empty?
	var isEmpty = function(obj) {
		for(var prop in obj) {
			if(obj.hasOwnProperty(prop)){
				context.logInfo("isEmpty: prop="+prop);
				return false;
			}
		}
		context.logInfo("isEmpty: JSON.stringify(obj)="+JSON.stringify(obj));
		context.logInfo("isEmpty: JSON.stringify({})="+JSON.stringify({}));
		return JSON.stringify(obj) === JSON.stringify({});
	}
	
	
})(this);
