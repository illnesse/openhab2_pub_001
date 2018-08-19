'use strict';
load('/etc/openhab2/automation/jsr223/00_jslib/JSRule.js');

var MODE_DEFAULT = 0
var MODE_DONE = 1

var gmail_array = []
var gmail_array_temp = []

var init = false;

var mutedEmails = ["eclipse/smarthome", "codetheweb/tuyapi","OH2_System_Notification"];

function containsAny(str, substrings) {
    for (var i = 0; i != substrings.length; i++) {
       var substring = substrings[i];
       if (str.indexOf(substring) != - 1) {
         return substring;
       }
    }
    return null; 
}

JSRule({
    name: "GetMail",
    description: "Line: "+__LINE__,
    triggers: [
        ItemCommandTrigger("SysStartup","ON"),
        TimerTrigger("0 0/30 * * * ?"),
        ItemCommandTrigger("Mail_Account1_Update")
    ],
    execute: function( module, input)
    {
        var itemMail_Update = getItem("Mail_Account1_Update");
        var itemTTSOut2 = getItem("TTSOut2");
        postUpdate(itemMail_Update,"updating...");
        
        logInfo("GetMail: getting mails")
        var results1 = executeCommandLineAndWaitResponse("/etc/openhab2/scripts/sh/mailsync.sh", 1000 *60);
        //logInfo("GetMail: " + results1)

        if (results1 == "") return;

        gmail_array_temp = JSON.parse(results1);
        //logInfo("GetMail gmail_array_temp size: " + gmail_array_temp.length);

        for(var i = 0; i < gmail_array_temp.length; i++)
        {
            gmail_array_temp[i].state = MODE_DEFAULT;

            if (gmail_array.length > 0)
            {
                var findid = gmail_array_temp[i].threadId;
                //logInfo("findid: "+findid);
                var f;
                var found = gmail_array.some(function(item, index) { f = index; return item.threadId == findid });
                if (found) {
                    //logInfo("found: "+gmail_array[f].threadId);
                    gmail_array_temp[i].state = gmail_array[f].state;
                }
            }
        }
        gmail_array = gmail_array_temp;

        var items = 0;
        for(var i = 0; i < gmail_array.length; i++) 
        {
            var out = gmail_array[i].Subject //+" "+ gmail_array_temp[i].Date

            if ((containsAny(out, mutedEmails) == null) && (items < 10))
            {
                items++;
                //logInfo("state: "+gmail_array[i].state);
                if (gmail_array[i].state == MODE_DEFAULT)
                {
                    //logInfo("New Email: " + out);
                    if (init)
                    {
                        sendCommand(itemTTSOut2,"Neue Email: "+ out)
                    } 
                    gmail_array[i].state = MODE_DONE;
                }
                postUpdate(getItem("GMail_Acc1_Mail"+(i+1)+"__UI"),out)
            }
        }

        init = true;
        postUpdate(itemMail_Update,"OK");
    }
});