#echo firecmd: $@
#adb tcpip 5555
adb connect $1
#:5555
adb shell input keyevent $2
#adb disconnect