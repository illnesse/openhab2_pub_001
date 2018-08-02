const TuyaDevice = require('tuyapi');
const convert = require('color-convert');
var args = process.argv.slice(2);

function getArgs(allArgs, argName) {
    var nameIndex = allArgs.indexOf(argName);
    argValue = allArgs[nameIndex + 1];
    return argValue;
}
var tuyaIP = getArgs(args, "-ip");
var tuyaID = getArgs(args, "-id");
var tuyaKey = getArgs(args, "-key");
var tuyaType = getArgs(args, "-type");
var tuyaSceneID = getArgs(args, "-sceneid");
var tuyaFlashID = getArgs(args, "-flashid");
var tuyaFlashSpeed = getArgs(args, "-flashspeed");
var HSB = getArgs(args, "-hsb").split(",").map(Number);
var tuya = new TuyaDevice({
    ip: tuyaIP,
    id: tuyaID,
    key: tuyaKey,
    type: tuyaType
});

function bmap(istate) {
    return istate ? 'ON' : "OFF";
}

function set(set_options) 
{
    //console.log("set() " + JSON.stringify(set_options));
    tuya.set(set_options).then(result => 
        {
            //nada
        }, reason => {
            console.log(reason.toString());
            return;
        });
}
function setMultiple(set_options) 
{
    console.log("setMultiple() " + JSON.stringify(set_options));
    tuya.setMultiple(set_options).then(result => 
        {
            //nada
        }, reason => {
            console.log(reason.toString());
            return;
        });
}
var state = false;

tuya.resolveId().then(() => 
{
    if (args.includes("ON")) 
    {
        state = true;
    }
    else if (args.includes("OFF")) 
    {
        state = false;
    }
    else if (args.includes("TOGGLE")) 
    {
        tuya.get().then(status => 
        {
            state = !status;
        });
    }
    else if (args.includes("STATE")) 
    {
        tuya.get().then(status => 
        {
            console.log(bmap(status));
        });
        return;
    }

    if (tuyaType == "light")
    {
        if (args.includes("SCENE")) 
        {
            var type = tuyaSceneID
            //scene_1 = slow red pulse
            //scene_2 = fast flashing multi colors
            //scene_3 = slow flashing single color
            //scene_4 = slow ambient bright fades
            var dps = {1: true, 2: "scene_"+type};
            setMultiple(dps);
        }
        else if (args.includes("FLASH")) 
        {
            var type = tuyaFlashID
            var speed = Math.ceil(255/100 * tuyaFlashSpeed);
            var speed = speed.toString(16);

            var col1 = (Math.random()*0xFFFFFF<<0).toString(16);
            var set1 = "FFFF"+speed+"0"+type+col1; //7

            var col3 = (Math.random()*0xFFFFFF<<0).toString(16);
            var set3 = "FFFF"+speed+"0"+type+col3; //9

            var dps = {1: true, 2: "scene_"+type, 7: set1, 9: set3};
            setMultiple(dps);

//            tuya.get({schema: true}).then(result => {console.log(result)});

/*
            set_options = { set: "ffffFF06ff000000ff00ffff00ff00ff0000ffff0000", dps:8 };
            set(set_options);

            set_options = { set: "ffffFF06ff000000ff00ffff00ff00ff0000ffff0000", dps:10 };
            set(set_options);
*/
        }
        else if (args.includes("SETCOLOR"))  // "2: colour"
        {
            if (Array.isArray(HSB))// && (typeof HSB[0] == Number))
            {
                //console.log(typeof HSB[0]);
                //console.log(HSB);
                var colorhex = convert.hsv.hex(HSB[0],HSB[1],HSB[2]);
                var colorhsv = HSB;
                var color = colorhex +"00"+ (Math.floor(colorhsv[0] /360 *100 *2.55)).toString(16) + (Math.floor(colorhsv[1] *2.55)).toString(16) + (Math.floor(colorhsv[2] *2.55)).toString(16); 
                var dps = {1: true, 2: "colour", 5: color };
                setMultiple(dps);
            }
        }
        else
        {
            tuya.set({set:state, dps:1}).then(result => 
                {
                    if (result) console.log(bmap(state));
                    return;
                }, reason => {
                    console.log(reason.toString());
                    return;
                });
        }
    }
    else
    {
        tuya.set({set:state, dps:1}).then(result => 
            {
                if (result) console.log(bmap(state));
                return;
            }, reason => {
                console.log(reason.toString());
                return;
            });
    }
});