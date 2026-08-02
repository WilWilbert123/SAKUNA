import urllib.request
import json
url = "https://api.rainviewer.com/public/weather-maps.json"
req = urllib.request.Request(url)
with urllib.request.urlopen(req) as response:
    data = json.loads(response.read().decode())
    print("RainViewer API returned:")
    print("Host:", data.get('host'))
    print("Path:", data.get('radar', {}).get('past', [{}])[-1].get('path'))
