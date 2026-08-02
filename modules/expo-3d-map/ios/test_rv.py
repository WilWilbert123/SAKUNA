import urllib.request
import json
url = "https://api.rainviewer.com/public/weather-maps.json"
req = urllib.request.Request(url)
with urllib.request.urlopen(req) as response:
    data = json.loads(response.read().decode())
    print("Host:", data.get('host'))
    print("Sat past 0 path:", data['satellite']['infrared']['past'][0]['path'])
