import ExpoModulesCore

public class Expo3dMapModule: Module {
  public func definition() -> ModuleDefinition {
    Name("Expo3dMap")

    View(Expo3dMapView.self) {
    }
  }
}
