var $parentdoc = window.parent.document;
var $body = $("body",$parentdoc);
var $head = $("head",$parentdoc);
var $refresh = true;

var LogIntervalTime = 5000;
var syntaxhilight = true;

init();

function pad (str, max)
{
    str = str.toString();
    return str.length < max ? pad("0" + str, max) : str;
}


function eventlog()
{
    //if (!$parentdoc.hasFocus()) return;
    $.get( "/static/eventlog_tail.log", function( data )
    {
        //console.log(data.length);
        $("#logview1").html(data);

        $('html, body').scrollTop($(document).height());
    });
}

function openhablog() 
{
    //if (!$parentdoc.hasFocus()) return;
    var d = new Date();
    $.get( "/static/openhablog_tail.log?nocache"+d.getTime(), function( data )
    {
        if (syntaxhilight)
        {
            var lines = data.split("\n");
            var out = "";
            var class1 = "s1";

            for(n=0;n<lines.length-1;n++)
            {
                var n_fill = pad(n,3);
                var elem = lines[n];
                if (elem.indexOf("[ERROR]") >= 0) class1 = "error";
                else if (elem.indexOf("[WARN ]") >= 0) class1 = "warning";
                else class1 = "log";

                out += n_fill + "  <span class=\""+class1+"\">" + elem + "</span>\n";
            }
            //console.log(lines.length);
            $("#logview2").html(out);
        }
        else
        {
            $("#logview2").html(data);
        }

        $('html, body').scrollTop($(document).height());
    });
}

function init()
{
    if (!$("#inject_iframe",$parentdoc).length) $body.prepend("<iframe id=\"inject_iframe\" height=\"0\" src=\"../static/overrides.html\"></iframe>");

    var log1Interval = setInterval(eventlog,LogIntervalTime);
    eventlog();
    var log2Interval = setInterval(openhablog,LogIntervalTime);
    openhablog();
}
