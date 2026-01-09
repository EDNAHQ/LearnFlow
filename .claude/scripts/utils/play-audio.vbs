Set objPlayer = CreateObject("WMPlayer.OCX")
objPlayer.URL = "C:\Users\GGPC\CascadeProjects\EDNA-Command-Center\.claude\data\temp\audio-temp.mp3"
objPlayer.controls.play()
WScript.Sleep(5000)
objPlayer.close()
