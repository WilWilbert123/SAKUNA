import ExpoModulesCore
import MapKit
import UIKit

// Custom annotation to hold magnitude data
class EarthquakeAnnotation: MKPointAnnotation {
    var magnitude: Double = 0.0
}

class Expo3dMapView: ExpoView, MKMapViewDelegate {
    let mapView = MKMapView()

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
