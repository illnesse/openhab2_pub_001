import sys
import pytuya

#if (len(sys.argv) > 4):
#	deviceid = sys.argv[1]
#	ip = sys.argv[2]
#	localid = sys.argv[1]

if (len(sys.argv) > 2):
	if (sys.argv[1] == "1"):
		d = pytuya.OutletDevice('XXXXXXX', '192.168.178.35', 'XXXXXXX')
	elif (sys.argv[1] == "2"):
		d = pytuya.OutletDevice('XXXXXXX', '192.168.178.34', 'XXXXXXX')
		
	if (sys.argv[2] == "ON"):
		state = True
		data = d.set_status(state)
		print("ON")
	elif (sys.argv[2] == "OFF"):
		state = False
		data = d.set_status(state)
		print("OFF")
	else:
		data = d.status()
		if (data['dps']['1'] == True):
			print("ON")
		if (data['dps']['1'] == False):
			print("OFF")
else:
	print("missing parameters")

