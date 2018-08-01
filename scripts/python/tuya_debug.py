import pytuya
#{"devId":"0220052668c63aac2100","gwId":"0220052668c63aac2100"}
#2edc4d3b66235b59
#{"devId":"0220052668c63aacbd0c","gwId":"0220052668c63aacbd0c"}
#5d86a2e61aedcf2a
#orig d = pytuya.OutletDevice('01200701dc4f2200682e', '192.168.178.35', '428c1dcbeee12345')

d = pytuya.OutletDevice('0220052668c63aac2100', '192.168.178.35', '2edc4d3b66235b59')
#d = pytuya.OutletDevice('0220052668c63aacbd0c', '192.168.178.34', '5d86a2e61aedcf2a')
data = d.status()  # NOTE this does NOT require a valid key
print('Dictionary %r' % data)
print('state (bool, true is ON) %r' % data['dps']['1'])  # Show status of first controlled switch on device

# Toggle switch state
switch_state = data['dps']['1']
data = d.set_status(not switch_state)  # This requires a valid key
if data:
	print('set_status() result %r' % data)

# on a switch that has 4 controllable ports, turn the fourth OFF (1 is the first)
#data = d.set_status(False, 4)
#if data:
#	print('set_status() result %r' % data)
#	print('set_status() extrat %r' % data[20:-8])
