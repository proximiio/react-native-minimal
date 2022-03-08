import MapboxGL from '@react-native-mapbox-gl/maps';
import * as React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  EmitterSubscription,
  StyleSheet,
} from 'react-native';
import Proximiio, {
  NotificationMode,
  ProximiioContextProvider,
} from 'react-native-proximiio';
import ProximiioMapbox, {
  AmenitySource,
  Feature,
  GeoJSONSource,
  ProximiioMapboxEvents,
  ProximiioMapboxSyncStatus,
  RoutingSource,
  UserLocationSource,
} from 'react-native-proximiio-mapbox';

const PROXIMIIO_TOKEN = 'INSERT_PROXIMIO_APPLICATION_TOKEN_HERE';

const TILES_URL = '';

MapboxGL.setAccessToken('123456789');

export interface Props {}

export interface State {
  proximiioReady: boolean;
  mapLoaded: boolean;
  mapLevel: number;
  userLevel: number;
}

const styles = {
  container: {
    height: '100%',
  },
};

export default class App extends React.Component<Props, State> {
  private syncListener?: EmitterSubscription;
  private map: MapboxGL.MapView | null = null;
  private camera: MapboxGL.Camera | null = null;

  constructor(props: Props) {
    super(props);

    this.state = {
      proximiioReady: false,
      mapLoaded: false,
      mapLevel: 0,
      userLevel: 0,
    };
  }

  componentDidMount() {
    this.initProximiio();
  }

  /**
   * Initializes Proximi.io location and mapbox libraries.
   */
  private async initProximiio() {
    // Proximi.io mapbox library sync listener
    this.syncListener = ProximiioMapbox.subscribe(
      ProximiioMapboxEvents.SYNC_STATUS,
      (status: ProximiioMapboxSyncStatus) => {
        if (
          status === ProximiioMapboxSyncStatus.INITIAL_ERROR ||
          status === ProximiioMapboxSyncStatus.INITIAL_NETWORK_ERROR
        ) {
          setTimeout(() => {
            ProximiioMapbox.startSyncNow();
          }, 5000);
        }
      },
    );
    Proximiio.setNotificationMode(NotificationMode.Enabled);
    // Authorize libraries with token
    await Proximiio.authorize(PROXIMIIO_TOKEN);
    Proximiio.setPdr(true, 4);
    Proximiio.setSnapToRoute(true, 20);
    await ProximiioMapbox.authorize(PROXIMIIO_TOKEN);
    ProximiioMapbox.setRerouteEnabled(true);
    ProximiioMapbox.setReRouteThreshold(6);
    ProximiioMapbox.setRouteFinishThreshold(2.5);
    ProximiioMapbox.setStepImmediateThreshold(3.5);
    ProximiioMapbox.setStepPreparationThreshold(3.0);
    ProximiioMapbox.setUserLocationToRouteSnappingEnabled(true);
    ProximiioMapbox.setUserLocationToRouteSnappingThreshold(6.0);
    ProximiioMapbox.ttsHeadingCorrectionThresholds(8, 90);
    // Request permissions needed for localization
    Proximiio.requestPermissions();
    // When ready, change state to show UI.
    this.setState({
      proximiioReady: true,
    });
  }

  private onMapPress = (feature: Feature[]) => {
    console.log('feature', feature);
  };

  public render() {
    return (
      <SafeAreaView>
        <View style={styles.container}>
          <Text>ready: {this.state.proximiioReady ? 'true' : 'false'}</Text>
          {this.state.proximiioReady && (
            <MapboxGL.MapView
              ref={map => (this.map = map)}
              style={StyleSheet.absoluteFillObject}
              scrollEnabled={true}
              compassEnabled={false}
              styleURL={ProximiioMapbox.styleURL}
              onDidFinishLoadingMap={() => this.setState({mapLoaded: true})}>
              <MapboxGL.Camera
                ref={camera => {
                  this.camera = camera;
                }}
                minZoomLevel={1}
                maxZoomLevel={24}
                animationMode={'flyTo'}
                animationDuration={250}
                zoomLevel={15}
                centerCoordinate={[19.4095276, 49.99953235]}
              />
              {this.state.mapLoaded && TILES_URL.length > 0 && (
                <MapboxGL.RasterSource
                  id="simple-tiles-source"
                  tileUrlTemplates={[TILES_URL]}
                  tileSize={256}>
                  <MapboxGL.RasterLayer
                    id="simple-tiles"
                    belowLayerID="proximiio-floors"
                    minZoomLevel={14}
                    maxZoomLevel={22}
                  />
                </MapboxGL.RasterSource>
              )}
              {this.state.mapLoaded && (
                <ProximiioContextProvider>
                  <AmenitySource />
                  <GeoJSONSource
                    level={this.state.mapLevel}
                    onPress={this.onMapPress}>
                    <RoutingSource
                      level={this.state.mapLevel}
                      aboveLayerID={'simple-tiles'}
                    />
                    <UserLocationSource
                      onAccuracyChanged={accuracy =>
                        console.log('accuracy: ', accuracy)
                      }
                      visible={this.state.mapLevel === this.state.userLevel}
                    />
                  </GeoJSONSource>
                </ProximiioContextProvider>
              )}
            </MapboxGL.MapView>
          )}
        </View>
      </SafeAreaView>
    );
  }
}
