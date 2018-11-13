/**
 * Copyright (c) 2018 by Helmut Lehmeyer.
 * 
 * @author Helmut Lehmeyer 
 */

'use strict';
se.importPreset("RuleSupport");
se.importPreset("RuleFactories");

// Get Triggers and Conditions module output
// http://localhost:8080/rest/module-types

// Examles:
// see: org.eclipse.smarthome.automation.sample.extension.java.internal.WelcomeHomeRulesProvider.createLightsRule()

if(HashSet == undefined)var HashSet = Java.type("java.util.HashSet");
if(Visibility == undefined)var Visibility = Java.type("org.eclipse.smarthome.automation.Visibility");
if(TriggerHandler == undefined)var TriggerHandler = Java.type("org.eclipse.smarthome.automation.handler.TriggerHandler");
if(Trigger == undefined)var Trigger = Java.type("org.eclipse.smarthome.automation.Trigger");
if(ModuleBuilder == undefined)var ModuleBuilder = Java.type("org.eclipse.smarthome.automation.core.util.ModuleBuilder");

//Handlers 
if(ChannelEventTriggerHandler   == undefined)var ChannelEventTriggerHandler     = Java.type("org.eclipse.smarthome.automation.module.core.handler.ChannelEventTriggerHandler");
if(CompareConditionHandler      == undefined)var CompareConditionHandler        = Java.type("org.eclipse.smarthome.automation.module.core.handler.CompareConditionHandler");
//if(GenericEventConditionHandler == undefined)var GenericEventConditionHandler   = Java.type("org.eclipse.smarthome.automation.module.core.handler.GenericEventConditionHandler");
//if(GenericEventTriggerHandler   == undefined)var GenericEventTriggerHandler     = Java.type("org.eclipse.smarthome.automation.module.core.handler.GenericEventTriggerHandler");
//if(ItemCommandActionHandler     == undefined)var ItemCommandActionHandler       = Java.type("org.eclipse.smarthome.automation.module.core.handler.ItemCommandActionHandler");
if(ItemCommandTriggerHandler    == undefined)var ItemCommandTriggerHandler      = Java.type("org.eclipse.smarthome.automation.module.core.handler.ItemCommandTriggerHandler");
if(ItemStateConditionHandler    == undefined)var ItemStateConditionHandler      = Java.type("org.eclipse.smarthome.automation.module.core.handler.ItemStateConditionHandler");
if(ItemStateTriggerHandler      == undefined)var ItemStateTriggerHandler        = Java.type("org.eclipse.smarthome.automation.module.core.handler.ItemStateTriggerHandler");
//if(RuleEnablementActionHandler  == undefined)var RuleEnablementActionHandler    = Java.type("org.eclipse.smarthome.automation.module.core.handler.RuleEnablementActionHandler");
//if(RunRuleActionHandler         == undefined)var RunRuleActionHandler           = Java.type("org.eclipse.smarthome.automation.module.core.handler.RunRuleActionHandler");
//if(DayOfWeekConditionHandler    == undefined)var DayOfWeekConditionHandler      = Java.type("org.eclipse.smarthome.automation.module.timer.handler.DayOfWeekConditionHandler");
if(GenericCronTriggerHandler    == undefined)var GenericCronTriggerHandler      = Java.type("org.eclipse.smarthome.automation.module.timer.handler.GenericCronTriggerHandler");
//if(TimeOfDayTriggerHandler      == undefined)var TimeOfDayTriggerHandler        = Java.type("org.eclipse.smarthome.automation.module.timer.handler.TimeOfDayTriggerHandler");


// ### StartupTrigger ### DOES NOT WORK!! TODO?!
/*
var _StartupTriggerHandlerFactory = new TriggerHandlerFactory(){
	get: function(trigger){
		logWarn(" -#### #### #### #### #### get trigger "+__LINE__, trigger); 
		//return _StartupTriggerHandlerFactory.handler(trigger);
		return  new TriggerHandler(){
			setRuleEngineCallback: function(rule_engine_callback){
				logWarn(" -#### TriggerHandler setRuleEngineCallback "+__LINE__, " setRuleEngineCallback ");
				rule_engine_callback.triggered(trigger, {});
			}, 
			dispose: function(){
				logWarn(" -#### TriggerHandler dispose "+__LINE__, " dispose ");
			}
		};
	},
	ungetHandler: function( module, ruleUID, handler){ 
		logWarn(" -#### ungetHandler "+__LINE__, module);
		logWarn(" -#### ungetHandler "+__LINE__, ruleUID);
		logWarn(" -#### ungetHandler "+__LINE__, handler);
	},
	dispose: function(){
		logWarn(" -#### dispose "+__LINE__, " dispose ");
	}
};
var STARTUP_MODULE_ID = "jsr223.StartupTrigger";

automationManager.addTriggerType(new TriggerType(
    STARTUP_MODULE_ID, 
	[],
    "the rule is activated", 
    "Triggers when a rule is activated the first time",
    new HashSet(), 
	Visibility.VISIBLE, 
	[]));
	
automationManager.addTriggerHandler(STARTUP_MODULE_ID, _StartupTriggerHandlerFactory);
*/
var StartupTrigger = function(triggerName){
    //DOES NOT WORK - TODO: return new Trigger( getTrName(triggerName), "jsr223.StartupTrigger", new Configuration());
}

// ### ChannelEventTriggerHandler ###
// TODO: test this: https://community.openhab.org/t/two-trigger-with-a-condition-each-in-one-single-rule/30225/17?u=lewie
// ‘astro:sun:home:rise#event’ triggered event -> START
// https://github.com/lewie/openhab2-javascript/issues/1
var ChannelEventTrigger = function(channel, event, triggerName) {
    return ModuleBuilder.createTrigger().withId(getTrName(triggerName)).withTypeUID(ChannelEventTriggerHandler.MODULE_TYPE_ID).withConfiguration( new Configuration({
        "channelUID": channel,
        "event": event
    })).build();
}
var ChannelTrigger = ChannelEventTrigger; 

// ### ChangedEventTrigger ###
var ItemStateChangeTrigger = function(itemName, oldState, newState, triggerName){
    return ModuleBuilder.createTrigger().withId(getTrName(triggerName)).withTypeUID(ItemStateTriggerHandler.CHANGE_MODULE_TYPE_ID).withConfiguration( new Configuration({
        "itemName": itemName,
        "state": newState,
        "oldState": oldState
    })).build();
}
var ChangedEventTrigger = ItemStateChangeTrigger; 


// ### UpdatedEventTrigger ###
var ItemStateUpdateTrigger = function(itemName, state, triggerName){
    return ModuleBuilder.createTrigger().withId(getTrName(triggerName)).withTypeUID(ItemStateTriggerHandler.UPDATE_MODULE_TYPE_ID).withConfiguration( new Configuration({
        "itemName": itemName,
        "state": state
    })).build();
}
var UpdatedEventTrigger = ItemStateUpdateTrigger; 


// ### CommandEventTrigger ###
var ItemCommandTrigger = function(itemName, command, triggerName){
	//logWarn("#### CommandEventTrigger "+__LINE__, triggerName);
    return ModuleBuilder.createTrigger().withId(getTrName(triggerName)).withTypeUID(ItemCommandTriggerHandler.MODULE_TYPE_ID).withConfiguration( new Configuration({
        "itemName": itemName,
        "command": command
    })).build();
}
var CommandEventTrigger = ItemCommandTrigger; 

// ### TimerTrigger ###
//!!!!!!!! timer.GenericCronTrigger !!!!!!!!!!!!!
var GenericCronTrigger = function(expression, triggerName){
	//logWarn("#### GenericCronTrigger "+__LINE__, expression, getTrName(triggerName), Trigger);  // see: org.eclipse.smarthome.automation.sample.extension.java.internal.WelcomeHomeRulesProvider.createLightsRule()
    return ModuleBuilder.createTrigger().withId(getTrName(triggerName)).withTypeUID(GenericCronTriggerHandler.MODULE_TYPE_ID).withConfiguration( new Configuration({
        "cronExpression": expression
    })).build();
}
var TimerTrigger = GenericCronTrigger; 


// ### stateCondition ###
var ItemStateCondition = function(itemName, state, condName){
    return ModuleBuilder.createCondition().withId(getTrName(condName)).withTypeUID(ItemStateConditionHandler.ITEM_STATE_CONDITION).withConfiguration( new Configuration({
        "itemName": itemName,
        "operator": "=",
        "state": state
    })).build();
}
var stateCondition = ItemStateCondition; 

// ### GenericCompareCondition ###
var GenericCompareCondition = function(itemName, state, operator, condName){
    return ModuleBuilder.createCondition().withId(getTrName(condName)).withTypeUID(CompareConditionHandler.MODULE_TYPE).withConfiguration( new Configuration({
        "itemName": itemName,
        "operator": operator,// matches, ==, <, >, =<, =>
        "state": state
    })).build();
}
//compareCondition("itemName", OFF, "==", "condNameOfCompareCondition")
var compareCondition = GenericCompareCondition; 


/*
var getTrName = function(trn){
	return trn == undefined || trn == null || trn == "" ? uuid.randomUUID() + "-" + me.replace(/[^\w]/g, "-") : trn;
	//return trn == undefined || trn == null || trn == "" ? uuid.randomUUID() : trn;
}
*/

var getTrName = function(trn){
	return trn == undefined || trn == null || trn == "" ? uuid.randomUUID() : trn;
}
