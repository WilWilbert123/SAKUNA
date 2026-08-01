import ExpoModulesCore
import MapKit

class Expo3dMapView: ExpoView {
    let mapView = MKMapView()

    required init(appContext: AppContext? = nil) {
        super.init(appContext: appContext)
        clipsToBounds = true
        
        mapView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
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
}
