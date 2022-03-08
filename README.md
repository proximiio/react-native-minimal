# Minimal React Native Proximiio Maps Implementation

### Create Project
`npx react-native init RNTest --template react-native-template-typescript`

### Install Proximi.io Core Library
`npm i https://github.com/proximiio/react-native-proximiio`

### Install Proximi.io Mapbox/MapLibre library
`npm i https://github.com/proximiio/react-native-proximiio-mapbox`

### Install Mapbox/MapLibre for React Native
`npm install @react-native-mapbox-gl/maps --save`

### Install React Native Async Storage
`npm i -s @react-native-async-storage/async-storage`

### Install React Native Compass Heading
`npm i -s react-native-compass-heading`

## IOS Setup

On M! Macs, run both pod install (terminal) and xcode in rosetta mode

Add following lines to ios/Podfile

```
platform :ios, '13.0'
use_frameworks!
$RNMBGL_Use_SPM = true
$RNMGL_USE_MAPLIBRE = true
install! 'cocoapods', :disable_input_output_paths => true`

```

In Target block, add pre_install and post_install tasks

```
pre_install do |installer|
  $RNMapboxMaps.pre_install(installer)
end

post_install do |installer|
  $RNMapboxMaps.post_install(installer)
  # Comment out following line
  #__apply_Xcode_12_5_M1_post_install_workaround(installer)
end
```

remove or comment following line
```
use_flipper!() 
```

run pod install inside the ios folder
```
pod install
```

Add following lines at the end of Info.plist files in ios/$APP_NAME/Info.plist,
its also good idea to provide more meaningful explanation for the privecy requests according to the app use.
```
  ...
  <key>NSBluetoothAlwaysUsageDescription</key>
	<string>Bluetooth is used for positioning</string>
	<key>NSBluetoothPeripheralUsageDescription</key>
	<string>Bluetooth is used for positioning</string>
	<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
	<string>Location is used for positioning</string>
	<key>NSLocationWhenInUseUsageDescription</key>
	<string>Location is used for positioning</string>
</dict>
</plist>
```

## Android Setup

set compileSdkVersion and add Proximi.io Repository to android/build.gradle
```
buildscript {
  ext {
    ...
    compileSdkVersion = 31
    ...
  }
  ...
}

...

allProjects {
  ....
  repositories {
      ....
      maven { url "https://maven.proximi.io/repository/android-releases/" }
  }
}

```

in android/app/build.gradle add following block above the android {....

```
...

configurations.all {
    resolutionStrategy { force 'androidx.core:core-ktx:1.6.0' }
}


android {
....
```

## App Setup

Paste Proximi.io Application token in src/App.tsx file.
```
const PROXIMIIO_TOKEN = ''
``` 


If you use custom tiles, supply the TILES URL in in src/App.tsx file.

```
const TILES_URL = ''
```
