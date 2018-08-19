var $parentdoc = window.parent.document;
var $body = $("body",$parentdoc);
var $head = $("head",$parentdoc);
var $animationspeed = 400;
var $minimizedheight = "51px";
var $minimizedalpha = 0.7;
var $draggable_zindex = 1000;
var $refresh = true;

var LogIntervalTime = 5000;
var AllImgIntervalTime = 30000;
var ImgIntervalTime = 300;

var refreshImageItem;
var refreshImageItemURL = "https://XXXXXXX.de/out.jpg";

var syntaxhilight = true;

//hack to avoid jetty mjpeg timeout
function refreshSingleImage()
{
//    if (!$parentdoc.hasFocus()) return;
    if (!$refresh) return;
    var d = new Date();
    if (refreshImageItem === undefined) refreshImageItem = $('*[data-widget-id="0002"] img', $parentdoc);
    refreshImageItem.attr("src", refreshImageItemURL +"?nocache"+ d.getTime());
    //$('*[data-widget-id="0002"] img', $parentdoc).attr("src",  $('*[data-widget-id="0002"] img', $parentdoc).parent().data("proxied-url")+"&"+d.getTime());
}

function refreshAllImgs()
{
//    if (!$parentdoc.hasFocus()) return;
    //if (!$refresh) return;
    var d = new Date();
    $(".mdl-form__image img", $parentdoc).each(function()
    {
        $(this).attr("src", $(this).parent().data("proxied-url")+"&nocache"+d.getTime());
    });
}

function panelState(panel, state, anim)
{
    if (panel.hasClass("bg_cams"))
    {
        $refresh = state;
        console.warn("panelState() $refresh set to ",$refresh)
    } 

    if (state)
    {
        if (anim)
        {
            panel.find(".collapse_btn").removeClass("btn_rotated");
            panel.animate(
                {
                    "max-height": 1000,
                    "opacity":1.0
                },{
                    duration: $animationspeed, 
                    easing:"easeInExpo", 
                    complete: calcContainerHeight
                });
        }
        else
        {
            panel.css({"opacity":1.0,"max-height": 2000});
            panel.find(".collapse_btn").removeClass("btn_rotated");
        }
        refreshSingleImage();
        refreshAllImgs();
    }
    else
    {
        if (anim)
        {
            panel.find(".collapse_btn").addClass("btn_rotated");
            panel.animate(
                {
                    "max-height": $minimizedheight,
                    "opacity":$minimizedalpha
                },{
                    duration: $animationspeed, 
                    easing:"easeOutExpo", 
                    complete: calcContainerHeight
                });
        }
        else
        {
            panel.css({"max-height": $minimizedheight,"opacity":$minimizedalpha});
            panel.find(".collapse_btn").addClass("btn_rotated");
        }
    }
}



if($(window.frameElement).attr("data-injected") === undefined)
{
    $(window.frameElement).attr("data-injected",true);
    $head.append("<link rel=\"stylesheet\" href=\"../static/css/overrides.css\">");

    //manipulate parent doc, apply classes etc
    function panelcss(panel, h5, classname, name)
    {
        panel.addClass("panel_custom bg_"+classname);
        h5.append("<div class=\"panel_icon\"><img src=\"../static/icons/"+name+".svg\" width=\"80px\"></div>")
    }

    $("meta[name='theme-color']",$parentdoc).attr("content","#111111");
    $(".mdl-form__colorpicker--pick i",$parentdoc).css({fontSize:20}).text("colorize");
    $(".mdl-layout__header-row",$parentdoc).append("<div class=\"mdl-layout-title\" id=\"ttsinput\"><form id=\"ttsinputform\" ><input id=\"ttstext\" type=\"text\"></form></div>");
    $(".mdl-layout__header-row",$parentdoc).append("<div class=\"mdl-layout-title\" id=\"clock\"></div>");
    $(".mdl-layout__header-row",$parentdoc).append("<div class=\"top_btn\" id=\"all_min\"><i class=\"material-icons\">keyboard_arrow_up</i></div>");
    $(".mdl-layout__header-row",$parentdoc).append("<div class=\"top_btn\" id=\"all_max\"><i class=\"material-icons\">keyboard_arrow_down</i></div>");
    $("iframe").attr('scrolling', 'no');
    $(".mdl-form",$parentdoc).each(function()
    {
        $panel = $(this);
        $h5 = $panel.find("h5");
        $h5.append("<div class=\"collapse_btn btn\"><i class=\"material-icons\"></i></div><div class=\"pop_btn btn\"><i class=\"material-icons\">keyboard_capslock</i></div>")

        $h5text = $h5.text().toLowerCase();
        if ($h5text.indexOf("fritz") >= 0 ) panelcss($panel,$h5,"fritzbox","avm");
        else if ($h5text.indexOf("kodi") >= 0 ) panelcss($panel,$h5,"kodi","kodi");
        else if ($h5text.indexOf("samsung") >= 0 ) panelcss($panel,$h5,"tv","samsung");
        else if ($h5text.indexOf("sat receiver") >= 0 ) panelcss($panel,$h5,"sat","humax");
        else if ($h5text.indexOf("sony av") >= 0 ) panelcss($panel,$h5,"sony","sony");
        else if ($h5text.indexOf("hdmi") >= 0 ) panelcss($panel,$h5,"hdmi","hdmi");
        else if ($h5text.indexOf("pc wz") >= 0 ) panelcss($panel,$h5,"win","win");
        else if ($h5text.indexOf("a/c") >= 0 ) $panel.addClass("panel_custom bg_ac");
        else if ($h5text.indexOf("echo") >= 0 ) panelcss($panel,$h5,"echos","alexa");
        else if ($h5text.indexOf("tunein") >= 0 ) panelcss($panel,$h5,"tunein","tunein");
        else if ($h5text.indexOf("klima") >= 0 ) panelcss($panel,$h5,"klima","homematic");
        else if ($h5text.indexOf("calendar") >= 0 ) panelcss($panel,$h5,"gcal","google");
        else if ($h5text.indexOf("e-mail") >= 0 ) panelcss($panel,$h5,"email","google");
        else if ($h5text.indexOf("network") >= 0 ) $panel.addClass("panel_custom bg_net");
        else if ($h5text.indexOf("system") >= 0 ) panelcss($panel,$h5,"sys","raspberrypi");
        else if ($h5text.indexOf("gps") >= 0 ) $panel.addClass("panel_custom bg_gps");
        else if ($h5text.indexOf("logreader") >= 0 ) $panel.addClass("panel_custom bg_logreader");
        else if ($h5text.indexOf("alarm") >= 0 ) $panel.addClass("panel_custom bg_alarm");
        else if ($h5text.indexOf("energy") >= 0 ) panelcss($panel,$h5,"energy","tplink");
        else if ($h5text.indexOf("nas snmp") >= 0 ) panelcss($panel,$h5,"asustor","asustor");
        else if ($h5text.indexOf("ip cams") >= 0 ) 
        {
            $panel.addClass("panel_custom bg_cams");
            $panel.find(".mdl-form__image").parent().addClass("cam_panel");
        }
        
        else if ($h5text.indexOf("devices") >= 0 ) $panel.addClass("panel_custom bg_devices");
        else if ($h5text.indexOf("rss") >= 0 ) $panel.addClass("panel_custom bg_rss");
        else {$panel.addClass("bg_default");}

        // panel toggling code
        var id = $panel.data("widget-id")
        if (($.cookie('panelid_'+id+'_state')) && ($.cookie('panelid_'+id+'_state') != "true"))
        {
            panelState($panel,false,false);
        }
    });

    //button style
    $(".mdl-button--raised",$parentdoc).each(function()
    {
        $(this).addClass("cut-corner-btn");
        $(this).removeClass("mdl-js-ripple-effect");
        $(this).find("mdl-button__ripple-container").remove();
    });

    /*
    $(".mdl-form",$parentdoc).each(function()
    {
        $panel = $(this);
        var id = $panel.data("widget-id")

        if (($.cookie('panelid_'+id+'_state')) && ($.cookie('panelid_'+id+'_state') != "true"))
        {
            $panel.css({"max-height": $minimizedheight,"opacity":$minimizedalpha});
            $panel.find(".collapse_btn").addClass("btn_rotated");
        }
    });
    */

    //look for urls and link them
    $(".mdl-form__label, .mdl-form__text",$parentdoc).each(function()
    {
        var $elem = this;
        var $words = $($elem).text().split("|");
        for (i in $words)
        {
            var $word = $.trim($words[i]);
            if ($word.indexOf('^del') == 0)
            {
                console.log("^del" + $elem);
                $elem.remove();
            }
/*
            else if ($word.indexOf('^small') == 0)
            {
                console.log("^small" + $elem);
                $($elem).parent().addClass("small");
                $words[i] = "";
            }
*/
            else if (($word.indexOf('http://') == 0) || $word.indexOf('https://') == 0)
            {
                var $link = $word;
                var $title = $words[i-1];
                //console.log("link","title: "+$title,"link: "+$link);
                $words[i-1] = ""
                $words[i] = "<a target=\"_blank\" href=\"" + $link + "\" class=\"link_override\"><i class=\"material-icons\">link</i>" + $title + "</a>";
            }
        }
        $($elem).html($words.join(' '));

    });
}
else
{
    init();
    initEvents();

    function pad (str, max)
    {
        str = str.toString();
        return str.length < max ? pad("0" + str, max) : str;
    }

    function calcContainerHeight() 
    {
        var $total_panels_height = 0;
        $(".mdl-form",$parentdoc).each(function()
        {
            $panel = $(this);
            $total_panels_height += $panel.height() + 16;
            //console.log($panel.find("h5").text() + "panel height: " + $panel.height());
        });
        $total_panels_height = Math.ceil($total_panels_height);
        var $height_columns = Math.ceil((($total_panels_height/2) + 300));
        //console.log("total height: " + $total_panels_height, "column height: " + $height_columns);

        $(".page-content",$parentdoc).css({height:$height_columns});

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

    function clock()
    {
        //if (!$parentdoc.hasFocus()) return;
        var currentTime = new Date();
        var currentYear = currentTime.getFullYear();
        var currentMonth = currentTime.getMonth()+1;
        var currentDay = currentTime.getDate();
        var currentHours = currentTime.getHours();
        var currentMinutes = currentTime.getMinutes();
        var currentSeconds = currentTime.getSeconds();

        currentMinutes = (currentMinutes < 10 ? "0" : "") + currentMinutes;
        currentSeconds = (currentSeconds < 10 ? "0" : "") + currentSeconds;
        var currentTimeString = currentDay +"."+ currentMonth +"."+ currentYear +" "+ currentHours + ":" + currentMinutes + ":" + currentSeconds;
        $("#clock",$parentdoc).text(currentTimeString);
    }
   
    function init()
    {
        console.log("init");

        //multitail style logger for events.log and openhab.log
        var log1Interval = setInterval(eventlog,LogIntervalTime);
        eventlog();

        var log2Interval = setInterval(openhablog,LogIntervalTime);
        openhablog();

        //display clock in header
        var clockInterval = setInterval(clock,1000);

        //display TTS input field in header
        $("#ttsinputform",$parentdoc).submit(function( event )
        {
            event.preventDefault();
            var str = $("#ttstext",$parentdoc).val()

            $.ajax({
                url:"/rest/items/TTSOut2",
                type:"POST",
                data:str,
                contentType:"text/plain",
                dataType:"json"
                });

        });

        console.log("init end");
    }

    function initEvents()
    {
        console.log("init Events")

        // refreshSingleImage();
        // refreshAllImgs();

        var refreshAllImgInterval = setInterval(refreshAllImgs,AllImgIntervalTime);
        var refreshImgInterval = setInterval(refreshSingleImage,ImgIntervalTime);

        if ($(".mdl-form > h5",$parentdoc).length >= 1)
        {
            $($parentdoc).on("click",".mdl-form > h5", function()
            {
                $panel = $(this).parent();

                var id = $panel.data("widget-id");
                var state;

                if (($.cookie('panelid_'+id+'_state')) && ($.cookie('panelid_'+id+'_state') == "false")) state = false;
                else state = true;

                state = !state; //actual toggle
                $.cookie('panelid_'+id+'_state', state);

                if (state) panelState($panel,true,true);
                else panelState($panel,false,true);
            });

            $($parentdoc).on("click",".pop_btn", function(event)
            {
                event.preventDefault();
                event.stopPropagation();
                $panel = $(this).parent().parent();
                var id = $panel.data("widget-id");

                if ($panel.hasClass("draggable"))
                {
                    $panel.removeClass("draggable mdl-shadow--2dp_popout");
                    $panel.draggable("disable");
                    $panel.css("z-index", 1000);
                }
                else
                {
                    $panel.addClass("draggable mdl-shadow--2dp_popout");
                    $panel.css("z-index", $draggable_zindex++);
                    $panel.draggable({
                        start: function(event, ui) {
                            $(this).css("z-index", $draggable_zindex++);
                        }
                      });
                    $panel.draggable("enable");
                }
            });
            calcContainerHeight();
        }

        //header buttons to min/max all panels
        $($parentdoc).on("click","#all_min", function()
        {
            console.log("all_min");
            $(".mdl-form",$parentdoc).each(function()
            {
                $panel = $(this);
                var id = $panel.data("widget-id")
                $.cookie('panelid_'+id+'_state', false);
                panelState($panel,false,false);
            });
            calcContainerHeight();
        });

        $($parentdoc).on("click","#all_max", function()
        {
            console.log("all_max");
            $(".mdl-form",$parentdoc).each(function()
            {
                $panel = $(this);
                var id = $panel.data("widget-id")
                $.cookie('panelid_'+id+'_state', true);
                panelState($panel,true,false);
            });
            calcContainerHeight();
        });

        //remember scroll pos
        $(".mdl-layout__content, .mdl-layout",$parentdoc).on("scroll", function(ev)
        {
            var $ypos = $(this).scrollTop();
            clearTimeout($.data(this, 'scrollTimer'));
            $.data(this, 'scrollTimer', setTimeout(function()
            {
                $.cookie("scrollz", $ypos);
                //console.log("saving scroll pos: " + $.cookie("scrollz"));
            }, 200));
        });

        console.log("scrolling to saved pos: " + $.cookie("scrollz"));
        $(".mdl-layout__content",$parentdoc).scrollTop($.cookie("scrollz"));
        $(".mdl-layout",$parentdoc).scrollTop($.cookie("scrollz"));

        console.log("init Events end")
    }
}