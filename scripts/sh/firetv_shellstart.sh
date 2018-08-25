#echo firecmd: $@
#adb tcpip 5555
adb connect $1
#:5555
adb shell am start -n $2
adb disconnect