const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
//const arraySort = require('array-sort');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Gmail API.
  authorize(JSON.parse(content), getMails);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listLabels(auth) {
  const gmail = google.gmail({version: 'v1', auth});
  gmail.users.labels.list({
    userId: 'me',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const labels = res.data.labels;
    if (labels.length) {
      console.log('Labels:');
      labels.forEach((label) => {
        console.log(`- ${label.name}`);
      });
    } else {
      console.log('No labels found.');
    }
  });
}

var objsort = function (prop, arr) {
    prop = prop.split('.');
    var len = prop.length;

    arr.sort(function (a, b) {
        var i = 0;
        while( i < len ) { a = a[prop[i]]; b = b[prop[i]]; i++; }
        if (a < b) {
            return -1;
        } else if (a > b) {
            return 1;
        } else {
            return 0;
        }
    });
    return arr;
};

var arrmails = [];
var max = 200;
var jsonout = [];
//var interval = null;

function getMails(auth) {
    const gmail = google.gmail({version: 'v1', auth});
    var list = gmail.users.messages.list({
        includeSpamTrash: false,
        maxResults: max,
        q: "",
        userId: "me"
      }, function (err, res) {
        if (err) return console.log('The API returned an error: ' + err);
        const mails = res.data.messages;
        if (mails.length) 
        {
          //console.log(mails);
          mails.forEach((mail) => {
            gmail.users.messages.get({
                id: mail.threadId,
                userId: "me"
            }, function (err, results) {
                if (err != null) return true; //console.log(err);

                //console.log(mail.threadId);
                results.data.threadId = mail.threadId;
                arrmails.push(results.data);
            });
          });
        } 
        else 
        {
          console.log('No mails found.');
        }
    });
    setTimeout(printResult,4000);
}

var mutedEmails = ["[eclipse/smarthome]", "[codetheweb/tuyapi]","[OH2_System_Notification]","[openHAB]","[openhab/openhab-distro]" ];

function containsAny(str, substrings) {
    for (var i = 0; i != substrings.length; i++) {
       var substring = substrings[i];
       if (str.indexOf(substring) != - 1) {
         return substring;
       }
    }
    return null; 
}

var sort = function (prop, arr) {
    prop = prop.split('.');
    var len = prop.length;

    arr.sort(function (a, b) {
        var i = 0;
        while( i < len ) { a = a[prop[i]]; b = b[prop[i]]; i++; }
        if (a < b) {
            return -1;
        } else if (a > b) {
            return 1;
        } else {
            return 0;
        }
    });
    return arr;
};

//var intervaliter = 0;
//var intervalitermax = 10; //interval time limit 10s
function printResult()
{
    //var len = arrmails.length;
    //console.log("length " + len);
    //arrmails = sort("internalDate",arrmails);
    arrmails.some(function(h)
    {
        var jsontemp = {};
        //jsontemp["internalDate"] = h.internalDate;
        jsontemp["threadId"] = h.threadId;

        if (h.payload && h.payload.headers)
        {
            // console.log(h.historyId);
            h.payload.headers.some(function(k)
            {
                //console.log(h.threadId +">>>>"+ k.name +">>>"+k.value);
                //if (h.name == "From") from = h.value;
                if (k.name == "Subject") 
                {
                    jsontemp["Subject"] = k.value;
                    // return true;
                }
                else if (k.name == "Date") 
                {
                    jsontemp["Date"] = new Date(k.value);
                    // return true;
                }
                /*
                else if (k.name == "From") 
                {
                    jsontemp["From"] = k.value;
                    // return true;
                }
                */
            });

            // console.log(jsontemp)
    
            if ((jsontemp["Subject"] != null) && (containsAny(jsontemp["Subject"], mutedEmails) == null))
            {
                // console.log(JSON.stringify(h));
                console.log(jsontemp["internalDate"] + " - " + jsontemp["threadId"] +" - "+jsontemp["Date"] +" - "+jsontemp["From"] +" - "+jsontemp["Subject"] );
                jsonout.push(jsontemp);
            }
        }
    });

    if ((jsonout.length >= 10))
    {
        jsonout.sort(function(a,b){
            // Turn your strings into dates, and then subtract them
            // to get a value that is either negative, positive, or zero.
            return new Date(b.Date) - new Date(a.Date);
          });

        //var jsonout2 = sort("internalDate",jsonout).reverse();
        var out = jsonout.slice(0, 10);
        console.log(out);
        //console.log(JSON.stringify());
        //clearInterval(interval);
    }
    //intervaliter++;
}