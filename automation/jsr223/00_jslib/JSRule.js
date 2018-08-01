'use strict';

se.importPreset("RuleSupport");
se.importPreset("RuleSimple");
se.importPreset("RuleFactories");
se.importPreset("default");

load('/etc/openhab2/automation/jsr223/00_jslib/helper.js');
load('/etc/openhab2/automation/jsr223/00_jslib/triggersAndConditions.js');

(function(context) {
  'use strict';
  
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
                finally {
                    // always runs even if there was an error, good place for cleanup
                }
            
            }

            // logInfo(" -- getTriggers ", xRule.getTriggers());
            // logInfo(" -- getConditions ", xRule.getConditions());
            // logInfo(" -- getActions ", xRule.getActions());
            // logInfo(" -- getConfigurationDescriptions ", xRule.getConfigurationDescriptions());
            // logInfo(" -- getConfiguration ", xRule.getConfiguration());
            // logInfo(" -- getTemplateUID ", xRule.getTemplateUID());
            // logInfo(" -- getVisibility ", xRule.getVisibility());
        };

        if(obj.description)
        {
			rule.setDescription(obj.name +" / "+ obj.description);
        }
        
        if(obj.name)
        {
			rule.setName(obj.name);
        }
        
        /*
        triggers = TriggerBuilder.create()
        .withId("aTimerTrigger")
        .withTypeUID("timer.GenericCronTrigger")
        .withConfiguration( new Configuration({
            "cronExpression": "0 * * * * ?"
        })).build()
        */

        var triggers = obj.triggers ? obj.triggers : obj.getEventTrigger();
        if(triggers && triggers.length > 0)
        {
			rule.setTriggers(triggers);
			automationManager.addRule(rule);
		}
		return rule;
	};
  
})(this);