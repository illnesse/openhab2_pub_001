/**
 * Copyright (c) 2018 by Helmut Lehmeyer.
 * 
 * @author Helmut Lehmeyer 
 */

'use strict';

se.importPreset("RuleSupport");
se.importPreset("RuleSimple");
se.importPreset("RuleFactories");
se.importPreset("default");

var OPENHAB_CONF = Java.type("java.lang.System").getenv("OPENHAB_CONF"); // most this is /etc/openhab2
load(OPENHAB_CONF+'/automation/jsr223/00_jslib/helper.js');
load(OPENHAB_CONF+'/automation/jsr223/00_jslib/triggersAndConditions.js');

//https://docs.oracle.com/javase/8/docs/technotes/guides/scripting/nashorn/api.html
//var StSimpleRule = Java.type("org.eclipse.smarthome.automation.module.script.rulesupport.shared.simple.SimpleRule");
//var StSimpleRuleExt = new StSimpleRule();
//var ExtendedSimpleRule = Java.extend(SimpleRule, {
//    setUID: function(i) {
//		//print("Run in separate thread");
//		this.uid = i;
//    }
//});
//var Thread = Java.type("java.lang.Thread");
//var th = new Thread(new MyRun());


//if(RuleBuilder == undefined)var RuleBuilder = Java.type("org.eclipse.smarthome.automation.core.util.RuleBuilder");

/*

if(RuleBuilder == undefined)var RuleBuilder = Java.type("org.eclipse.smarthome.automation.core.util.RuleBuilder");

In future better do it by org.eclipse.smarthome.automation.core.util.RuleBuilder like in 
org.eclipse.smarthome.automation.core.dto.RuleDTOMapper Don't know
return RuleBuilder.create(ruleDto.uid)
				.withActions(ActionDTOMapper.mapDto(ruleDto.actions))
                .withConditions(ConditionDTOMapper.mapDto(ruleDto.conditions))
                .withTriggers(TriggerDTOMapper.mapDto(ruleDto.triggers))
                .withConfiguration(new Configuration(ruleDto.configuration))
                .withConfigurationDescriptions(ConfigDescriptionDTOMapper.map(ruleDto.configDescriptions))
				.withTemplateUID(ruleDto.templateUID)
				.withVisibility(ruleDto.visibility)
				.withTags(ruleDto.tags)
				.withName(ruleDto.name)
				.withDescription(ruleDto.description).build();

//  UNTESTED UNTESTED UNTESTED 
//Simplifies spelling for rules.
(function(context) {
	'use strict';
	
	  context.JSRuleNew = function(obj) {
		  //logInfo("################  JSRule Line: "+__LINE__+"  #################");
		  //2. OR second option, to add Rules in rulefile. Is not needed.
		  var triggers = obj.triggers ? obj.triggers : obj.getEventTrigger();
		  return RuleBuilder.create( obj.uid ? obj.uid : uuid.randomUUID()+me.replace(/[^\w]/g, "-"))
		  .withActions( obj.actions ? obj.actions : null)
		  .withConditions( obj.conditions ? obj.conditions : null)
		  .withTriggers( triggers && triggers.length > 0 ? triggers : null)
		  .withConfiguration(new Configuration(ruleDto.configuration))
		  .withConfigurationDescriptions( obj.configurationDescription ? [obj.configurationDescription] : null)
		  .withTemplateUID( obj.templateUID ? obj.templateUID : null)
		  .withVisibility( obj.visibility ? obj.visibility : null)
		  .withTags( obj.tags ? obj.tags : null)
		  .withName( obj.name ? obj.name : null)
		  .withDescription(obj.description ? obj.description : null)
		  .build();
	  };
	
  })(this);
//  UNTESTED UNTESTED UNTESTED 
*/


//Simplifies spelling for rules.
(function (context) {
	'use strict';

/*	
	context.JSRule = function(obj) {
		logInfo("JSRule added: '"+obj.name+"' "+obj.description);
        var rule = new SimpleRule()
        {
            execute: function(module,input)
            {
                try {
                    obj.execute(module,input);
                    //logInfo("'"+obj.name+"' executed");
                }
                catch(e) {
                    var out =""
                    if (e instanceof TypeError) {
                        out+="TypeError"
                    } else if (e instanceof RangeError) {
                        out+="RanegError"
                    } else if (e instanceof EvalError) {
                        out+="EvalError"
                    } else {
                        out+="Error"
                    }
                    logError(obj.name+" "+out+": "+e.toString());
                }
            }
        };
*/
	context.JSRule = function (obj, line) {
		try{
			var ruid = uuid.randomUUID() + "-" + obj.name.replace(/[^\w]/g, "-");
			//logInfo("################  JSRule Line: "+__LINE__+"  ################# ruid:" + ruid);
			//var rule = new SimpleRule({ setUID: function(i) { uid = i; } })
		var rule = new SimpleRule(){
				execute: obj.execute //DOES THIS WORK? AND IF YES, WHY? => execute is found in implemented SimpleRuleActionHandler
		};
		var triggers = obj.triggers ? obj.triggers : obj.getEventTrigger();

			rule.setTemplateUID(ruid);

		if (obj.description) {
			rule.setDescription(obj.description);
		}
		if (obj.name) {
			rule.setName(obj.name);
		}

		//1. Register rule here
		if (triggers && triggers.length > 0) {
			rule.setTriggers(triggers);
			automationManager.addRule(rule);
		}

		//2. OR second option, to add Rules in rulefile. Is not needed.
		return rule;
		}catch(err) {
			context.logError("JSRule " + __LINE__ + ". obj: '" + obj + "' Error:" +  err);
		}
		return null;
	},

	//TODO like in org.eclipse.smarthome.automation.core.dto.RuleDTOMapper 
	// or org.eclipse.smarthome.automation.sample.extension.java.internal.WelcomeHomeRulesProvider
	//Missing SimpleRuleActionHandler!!
	context.JSRuleNew = function (obj) {
		//logInfo("################  JSRule Line: "+__LINE__+"  #################");
		//2. OR second option, to add Rules in rulefile. Is not needed.
		var rname =  obj.name ? obj.name.replace(/[^\w]/g, "-") : "nameless-generic";
		var ruid = obj.uid ? obj.uid : uuid.randomUUID() + "-" + rname;
		var triggers = obj.triggers ? obj.triggers : obj.getEventTrigger();
		return RuleBuilder.create(ruid)
			.withActions(obj.execute ? [obj.execute] : null)
			//.withConditions(obj.conditions ? obj.conditions : [])
			.withTriggers(triggers && triggers.length > 0 ? triggers : null)
			.withConfiguration(new Configuration(obj.configuration))
			.withConfigurationDescriptions(obj.configurationDescription ? [obj.configurationDescription] : null)
			.withTemplateUID(obj.templateUID ? obj.templateUID : ruid)
			.withVisibility(obj.visibility ? obj.visibility : null)
			.withTags(obj.tags ? obj.tags : null)
			.withName(obj.name ? obj.name : null)
			.withDescription(obj.description ? obj.description : null)
			.build();
	}
	
}) (this);