import ExpoModulesCore
import MapKit
import UIKit

// Custom Tile Overlay to gracefully handle OpenWeatherMap 401 Unauthorized errors
// so that VectorKit doesn't crash trying to decode JSON error messages as PNG images.
class WeatherTileOverlay: MKTileOverlay {
    override func loadTile(at path: MKTileOverlayPath, result: @escaping (Data?, Error?) -> Void) {
        let url = self.url(forTilePath: path)
        let request = URLRequest(url: url)
        
        let task = URLSession.shared.dataTask(with: request) { data, response, error in
            let transparentPNG = Data(base64Encoded: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=")!
            
            if error != nil {
                result(transparentPNG, nil)
                return
            }
            
            if let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode != 200 {
                // Return a transparent 1x1 PNG so VectorKit decodes an invisible image instead of an error/JSON.
                result(transparentPNG, nil)
                return
            }
            
            result(data, nil)
        }
        task.resume()
    }
}

// Custom annotation to hold magnitude data
class EarthquakeAnnotation: MKPointAnnotation {
    var magnitude: Double = 0.0
}

class Expo3dMapView: ExpoView, MKMapViewDelegate {
    let mapView = MKMapView()
    var activeWeatherOverlay: MKTileOverlay?

    required init(appContext: AppContext? = nil) {
        super.init(appContext: appContext)
        clipsToBounds = true
        
        mapView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        mapView.delegate = self
        addSubview(mapView)
        
        if #available(iOS 17.0, *) {
            let config = MKImageryMapConfiguration(elevationStyle: .realistic)
            mapView.preferredConfiguration = config
            
            let camera = MKMapCamera(
                lookingAtCenter: CLLocationCoordinate2D(latitude: 0, longitude: 0),
                fromDistance: 250000000, // Zoom out to ~25,000 km to see the whole earth
                pitch: 0, // Look straight down for full earth view
                heading: 0
            )
            mapView.camera = camera
        }
    }

    func updateEarthquakes(_ data: [[String: Any]]) {
        // Clear existing annotations
        mapView.removeAnnotations(mapView.annotations)
        
        var annotations: [EarthquakeAnnotation] = []
        for eq in data {
            if let lat = eq["lat"] as? Double,
               let lng = eq["lng"] as? Double,
               let mag = eq["mag"] as? Double {
                let annotation = EarthquakeAnnotation()
                annotation.coordinate = CLLocationCoordinate2D(latitude: lat, longitude: lng)
                annotation.magnitude = mag
                annotations.append(annotation)
            }
        }
        
        mapView.addAnnotations(annotations)
    }

    func updateWeatherLayer(_ layerType: String?) {
        // Remove existing weather overlay
        if let currentOverlay = activeWeatherOverlay {
            mapView.removeOverlay(currentOverlay)
            activeWeatherOverlay = nil
        }
        
        guard let layerType = layerType, !layerType.isEmpty else { return }
        
        if layerType == "precipitation_new" {
            // Use RainViewer API for free, live radar (No API key needed!)
            fetchRainViewerOverlay()
        } else {
            // Using OpenWeatherMap format for layers (e.g. clouds_new, wind_new)
            // Note: New OpenWeatherMap API keys take up to 2 hours to activate!
            let apiKey = "01c153ace018135dea34596d064e9f78"
            let urlTemplate = "https://tile.openweathermap.org/map/\(layerType)/{z}/{x}/{y}.png?appid=\(apiKey)"
            
            let overlay = WeatherTileOverlay(urlTemplate: urlTemplate)
            overlay.canReplaceMapContent = false // Keep the globe visible underneath
            overlay.maximumZ = 6 // Stop fetching new tiles after zoom 6, just stretch them!
            
            mapView.addOverlay(overlay)
            activeWeatherOverlay = overlay
        }
    }

    private func fetchRainViewerOverlay() {
        guard let url = URL(string: "https://api.rainviewer.com/public/weather-maps.json") else { return }
        let task = URLSession.shared.dataTask(with: url) { [weak self] data, response, error in
            guard let self = self, let data = data, error == nil else { return }
            
            do {
                if let json = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any],
                   let host = json["host"] as? String,
                   let radar = json["radar"] as? [String: Any],
                   let past = radar["past"] as? [[String: Any]],
                   let latest = past.last,
                   let path = latest["path"] as? String {
                    
                    // RainViewer URL format: {host}{path}/256/{z}/{x}/{y}/2/1_1.png
                    let urlTemplate = "\(host)\(path)/256/{z}/{x}/{y}/2/1_1.png"
                    
                    DispatchQueue.main.async {
                        // Ensure we don't accidentally add if user already cleared it
                        if let currentOverlay = self.activeWeatherOverlay {
                            self.mapView.removeOverlay(currentOverlay)
                        }
                        
                        let overlay = MKTileOverlay(urlTemplate: urlTemplate)
                        overlay.canReplaceMapContent = false
                        overlay.maximumZ = 6 // Stretch radar images when zooming in close
                        self.mapView.addOverlay(overlay)
                        self.activeWeatherOverlay = overlay
                    }
                }
            } catch {
                print("Failed to parse RainViewer JSON")
            }
        }
        task.resume()
    }

    // MKMapViewDelegate method for custom overlays
    func mapView(_ mapView: MKMapView, rendererFor overlay: MKOverlay) -> MKOverlayRenderer {
        if let tileOverlay = overlay as? MKTileOverlay {
            return MKTileOverlayRenderer(tileOverlay: tileOverlay)
        }
        return MKOverlayRenderer(overlay: overlay)
    }

    // MKMapViewDelegate method for custom annotation views
    func mapView(_ mapView: MKMapView, viewFor annotation: MKAnnotation) -> MKAnnotationView? {
        guard let eqAnnotation = annotation as? EarthquakeAnnotation else { return nil }
        
        let identifier = "EarthquakePulse"
        var view = mapView.dequeueReusableAnnotationView(withIdentifier: identifier)
        
        if view == nil {
            view = MKAnnotationView(annotation: annotation, reuseIdentifier: identifier)
            view?.canShowCallout = false
        } else {
            view?.annotation = annotation
        }
        
        // Clear old sublayers
        view?.layer.sublayers?.forEach { $0.removeFromSuperlayer() }
        
        let mag = eqAnnotation.magnitude
        let baseRadius: CGFloat = CGFloat(max(mag * 4.0, 5.0))
        
        // Create pulsing circle layer
        let circleLayer = CALayer()
        circleLayer.frame = CGRect(x: -baseRadius, y: -baseRadius, width: baseRadius * 2, height: baseRadius * 2)
        circleLayer.cornerRadius = baseRadius
        circleLayer.backgroundColor = UIColor.red.withAlphaComponent(0.6).cgColor
        
        // Animation
        let scaleAnimation = CABasicAnimation(keyPath: "transform.scale")
        scaleAnimation.fromValue = 1.0
        scaleAnimation.toValue = 2.5
        
        let opacityAnimation = CABasicAnimation(keyPath: "opacity")
        opacityAnimation.fromValue = 0.6
        opacityAnimation.toValue = 0.0
        
        let animationGroup = CAAnimationGroup()
        animationGroup.animations = [scaleAnimation, opacityAnimation]
        animationGroup.duration = 1.5
        animationGroup.repeatCount = .infinity
        animationGroup.timingFunction = CAMediaTimingFunction(name: .easeOut)
        
        circleLayer.add(animationGroup, forKey: "pulse")
        view?.layer.addSublayer(circleLayer)
        
        // Create text layer for magnitude
        let textLayer = CATextLayer()
        let textString = String(format: "%.1f", mag)
        textLayer.string = textString
        
        // Calculate font size relative to magnitude, but keep it readable
        let fontSize: CGFloat = CGFloat(max(mag * 2.5, 10.0))
        textLayer.fontSize = fontSize
        
        // Choose font
        let font = UIFont.boldSystemFont(ofSize: fontSize)
        textLayer.font = font
        
        // Calculate size of text
        let attributes = [NSAttributedString.Key.font: font]
        let textSize = textString.size(withAttributes: attributes)
        
        // Position text centered in the pulse
        textLayer.frame = CGRect(x: -(textSize.width / 2), y: -(textSize.height / 2), width: textSize.width, height: textSize.height)
        
        // Styling text
        textLayer.alignmentMode = .center
        textLayer.foregroundColor = UIColor.white.cgColor
        textLayer.contentsScale = UIScreen.main.scale // To prevent blurry text
        
        // Add a subtle shadow for readability
        textLayer.shadowColor = UIColor.black.cgColor
        textLayer.shadowOpacity = 0.8
        textLayer.shadowOffset = CGSize(width: 1, height: 1)
        textLayer.shadowRadius = 1
        
        view?.layer.addSublayer(textLayer)
        
        return view
    }
}
