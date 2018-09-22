from __future__ import print_function
from apiclient.discovery import build
from httplib2 import Http
from oauth2client import file, client, tools
import json

SCOPES = 'https://www.googleapis.com/auth/gmail.readonly'
store = file.Storage('token.json')
creds = store.get()
if not creds or creds.invalid:
    flow = client.flow_from_clientsecrets('credentials.json', SCOPES)
    creds = tools.run_flow(flow, store)
service = build('gmail', 'v1', http=creds.authorize(Http()))

results = service.users().messages().list(userId='me',includeSpamTrash=0, q="-in:chats -from:me -subject:[eclipse/smarthome] -subject:[codetheweb/tuyapi] -subject:[OH2_System_Notification] -subject:[openHAB] -subject:[openhab/openhab-distro] ", maxResults=20).execute()
#labelIds=["INBOX"], 

#bannedwords = ["[eclipse/smarthome]", "[codetheweb/tuyapi]","[OH2_System_Notification]","[openHAB]","[openhab/openhab-distro]" ]
messages = []
if 'messages' in results:
    messages.extend(results['messages'])

#for item in messages:
    #print(item)

i = 0
jsonout = []
for item in messages:
    jsontemp = {}
    message = service.users().messages().get(userId='me', id=item['id']).execute()

    if message["threadId"]:
        #jsontemp["id"] = i
        jsontemp["threadId"] = item['threadId']
        for headeritem in message["payload"]["headers"]:
            #print(headeritem)
            #if headeritem["name"] == "From":
                #jsontemp["From"] = headeritem["value"]
            #if headeritem["name"] == "Date":
                #jsontemp["Date"] = headeritem["value"]
            if headeritem["name"] == "Subject":
                jsontemp["Subject"] = headeritem["value"]
            #jsontemp["snippet"] = message['snippet']
        if not "Subject" in jsontemp: 
            continue
        #if any (word in jsontemp["Subject"] for word in bannedwords):
            #print("filtering " + jsontemp["Subject"])
         #   continue

    jsonout.append(jsontemp)
    i = i + 1
    if i == 10:
        break
#for jsonitem in jsonout:
#    print(jsonitem)
print(json.dumps(jsonout))
