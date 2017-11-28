/*global define*/
define([
        'Cesium/Core/Cartesian3',
        'Cesium/Core/Color',
        'Cesium/Core/defined',
        'Cesium/Core/Ellipsoid',
        'Cesium/Core/EllipsoidTerrainProvider',
        'Cesium/Core/formatError',
        'Cesium/Core/GeographicProjection',
        'Cesium/Core/getFilenameFromUri',
        'Cesium/Core/Math',
        'Cesium/Core/objectToQuery',
        'Cesium/Core/queryToObject',
        'Cesium/DataSources/CzmlDataSource',
        'Cesium/DataSources/GeoJsonDataSource',
        'Cesium/DataSources/KmlDataSource',
        'Cesium/Scene/createOpenStreetMapImageryProvider',
        'Cesium/Scene/createTileMapServiceImageryProvider',
        'Cesium/Scene/Globe',
        'Cesium/Scene/SkyBox',
        'Cesium/Widgets/ConfigurationFile/ConfigurationFile',
        'Cesium/Widgets/Viewer/Viewer',
        'Cesium/Widgets/Viewer/viewerCesiumInspectorMixin',
        'Cesium/Widgets/Viewer/viewerDragDropMixin',
        'domReady!'
    ], function(
        Cartesian3,
        Color,
        defined,
        Ellipsoid,
        EllipsoidTerrainProvider,
        formatError,
        GeographicProjection,
        getFilenameFromUri,
        CesiumMath,
        objectToQuery,
        queryToObject,
        CzmlDataSource,
        GeoJsonDataSource,
        KmlDataSource,
        createOpenStreetMapImageryProvider,
        createTileMapServiceImageryProvider,
        Globe,
        SkyBox,
        ConfigurationFile,
        Viewer,
        viewerCesiumInspectorMixin,
        viewerDragDropMixin) {
    'use strict';

    /*global console*/

    /*
     * 'debug'  : true/false,   // Full WebGL error reporting at substantial performance cost.
     * 'lookAt' : CZML id,      // The CZML ID of the object to track at startup.
     * 'source' : 'file.czml',  // The relative URL of the CZML file to load at startup.
     * 'stats'  : true,         // Enable the FPS performance display.
     * 'theme'  : 'lighter',    // Use the dark-text-on-light-background theme.
     * 'scene3DOnly' : false    // Enable 3D only mode.
     */

    // URL of the configuration file

    //var urlConfig = '../../Source/Widgets/ConfigurationFiles/ConfigurationFile.json';


    // Here, we use the request to create the "endUserOptions" object.

    /* example :

     http://localhost:8080/Apps/CesiumMarsViewer/index.html            ==> request without parameters. Hence : endUserOptions = {}
     http://localhost:8080/Apps/CesiumMarsViewer/index.html?map=themis ==> request with one parameter. Hence : endUserOptions = { map : "themis"}.
     */

    /** Query  parameters:
     *
     * ellipsoidType         = name.  Type of ellipsoid to use (predefined or customized. See here after))
     * ellipsoidSize         = x,y,z. (Dimensions of the ellipsoid)
     * NAIFCodes             = a,b. Naif codes for planet ("a" parameter) and satellite ("b" parameter). for a planet (Mars for example), use a=4, b=0;
     * imageryProviderParams = params for the imagery provider.
     *                         Example : SERVICE=WMS&VERSION=1.1.1&SRS=EPSG:4326&STYLES=&REQUEST=GetMap&FORMAT=image%2Fjpeg&LAYERS=THEMIS&BBOX=221,15,231,25&WIDTH=1000&HEIGHT=1000'
     * onlineResUrl          = url of the online ressource.
     *                         Example : http://planetarymaps.usgs.gov/cgi-bin/mapserv?map=/maps/mars/mars_simp_cyl.map
     */
    var endUserOptions = queryToObject(window.location.search.substring(1));

    /*
     - Implementation of the selection of the predefined ellipsoid from the request. 1 parameter must be used : ellipsoidType.
     example of use : http://localhost:8080/Apps/PlanetaryCesiumViewer/index.html?ellipsoidType=MARSIAU2000.
     predefined ellipsoid names availables : WGS84, MARSIAU2000, MARSSPHE, MOON, UNIT_SPHERE.

     ==> htmlRequest?ellipsoidType=ellipsoidName

     - Implementation of the customized ellipsoid from the request. 2 parameter must be used : ellipsoidType and ellipsoidSize.
     ellipsoidSize is the dimensions of the ellipsoid. ellipsoidSize=x,y,z

     example of use : http://localhost:8080/Apps/PlanetaryCesiumViewer/index.html?ellipsoidType=ELLIPSOID_1&&ellipsoidSize=1.0,1.2 1.4

     If ellipsoidType is equal to one of the predefined ellipsoid then the second parameter is ignored.

     example:         http://localhost:8080/Apps/PlanetaryCesiumViewer/index.html?ellipsoidType=WGS84&ellipsoidSize=1.0,1.2 1.4 will
     return  http://localhost:8080/Apps/PlanetaryCesiumViewer/index.html?ellipsoidType=WGS84

     ==> htmlRequest?ellipsoidType=ellipsoidName&ellipsoidSize=x,y,z
     */

    var globeParam;              /* *** NEW *** */
    var mapProjectionParam;      /* *** NEW *** */
    var terrainProviderParam;    /* *** NEW *** */
    var ellipsoidImageryParam;   /* *** NEW *** */

    if (typeof endUserOptions.ellipsoidType !== 'undefined') {

        Ellipsoid.modify(Ellipsoid, endUserOptions);

        Ellipsoid.used = endUserOptions.ellipsoidType.toString().toUpperCase();
        ellipsoidImageryParam = Ellipsoid[endUserOptions.ellipsoidType.toString().toUpperCase()];

    } else if (!endUserOptions.ellipsoidType) {

        Ellipsoid.used = 'WGS84';
        ellipsoidImageryParam = Ellipsoid.WGS84;

    }

    globeParam = new Globe(ellipsoidImageryParam);
    mapProjectionParam = new GeographicProjection(ellipsoidImageryParam);
    terrainProviderParam = new EllipsoidTerrainProvider({ellipsoid: ellipsoidImageryParam});

    var imageryProvider;

    /*

     // request parameters to get a Map :

     // SERVICE : Name of the OGC services.
     // VERSION : Number of the WMS protocol versions.
     // STYLES  : Styles lit used for each LAYERS
     // REQUEST : Three possible operations : GetCapabilities, GetMap, GetFeatureInfo.
     // FORMAT  : type of the returned image ???
     // LAYERS  : Liste des desired layers.
     // BBOX    : the map size (longitude min,latitude min, longitude max, latitude max
     // WIDTH   : Width of the image.
     // HEIGHT  : Height of the image.

     var urlParams        = endUserOptions.imageryProviderParams;
     var onlineResUrl     = endUserOptions.onlineResUrl;
     var tabParams        = urlParams.split(';');
     var propretiesObject = ['SERVICE', 'VERSION', 'SRS', 'STYLES', 'REQUEST', 'FORMAT', 'LAYERS', 'BBOX', 'WIDTH', 'HEIGHT'];
     var urlParam         = "";
     */

    var loadingIndicator = document.getElementById('loadingIndicator');

    var viewer;

    var viewerOptions = {
        mapProjection: mapProjectionParam, // The map projection to use in 2D and Columbus View modes (class : GeographicProjection).
        globe: globeParam, //  The globe to use in the scene. (class : Globe)
        baseLayerPicker: false,
        imageryProvider: imageryProvider, // Fournit l'image a afficher sur le globe.
        terrainProvider: terrainProviderParam,
        scene3DOnly: endUserOptions.scene3DOnly, // show 3D scene directly.
        skyAtmosphere: false, // atm visualisation.
        skyBox: new SkyBox({show: false}), // stars visualisation.
        selectionIndicator: false,
        timeline: false, // for files which contains the temporal dimension
        animation: false, // for animation which displayed with the time
        navigationInstructionsInitiallyVisible: false,
        showSystems: true,
        tools: true,
        VOData: true,
        geocoder : false
    };

    /* =========================================================================
     ======================== READ CONFIGURATION FILES =========================
     =========================================================================== */


    // Solar system configuration :
    var configuration;

    if (viewerOptions.showSystems === true) {

        var conf = new ConfigurationFile();
        configuration = conf.config;

    } else if (viewerOptions.showSystems === false || viewerOptions.showSystems === 'undefined') {

        imageryProvider = new createOpenStreetMapImageryProvider({
            url: 'https://a.tile.openstreetmap.org/'
        });

        viewerOptions.imageryProvider = imageryProvider;

        configuration = null;
    }

    try {
        viewerOptions.configuration = configuration ;// contains configuration (see ./sources/widget/ConfigurationFiles/ )
        viewer = new Viewer('cesiumContainer', viewerOptions);

    } catch (exception) {
        loadingIndicator.style.display = 'none';
        var message = formatError(exception);
        console.error(message);
        if (!document.querySelector('.cesium-widget-errorPanel')) {
            window.alert(message); //eslint-disable-line no-alert
        }
        return;
    }

    viewer.extend(viewerDragDropMixin);
    if (endUserOptions.inspector) {
        viewer.extend(viewerCesiumInspectorMixin);
    }

    var showLoadError = function (name, error) {
        var title = 'An error occurred while loading the file: ' + name;
        var message = 'An error occurred while loading the file, which may indicate that it is invalid.  A detailed error report is below:';
        viewer.cesiumWidget.showErrorPanel(title, message, error);
    };

    viewer.dropError.addEventListener(function (viewerArg, name, error) {
        showLoadError(name, error);
    });

    var scene = viewer.scene;
    var context = scene.context;

    // =================== default color of the globe ======================

    scene.globe.baseColor = Color.BLACK;

    // ==================== unable fog, moon and sun =======================

    scene.fog.enabled = false;
    scene.moon.show = false;
    scene.sun.show = false;

    // =====================================================================

    if (endUserOptions.debug) {
        context.validateShaderProgram = true;
        context.validateFramebuffer = true;
        context.logShaderCompilation = true;
        context.throwOnWebGLError = true;
    }

    var view = endUserOptions.view;

    var source;

    if (endUserOptions.source) {
        source = endUserOptions.source;
    }
    if (defined(source)) {
        var dataSource;
        var loadPromise;

        if (/\.czml$/i.test(source)) {
            loadPromise = CzmlDataSource.load(source);
        } else if (/\.geojson$/i.test(source) || /\.json$/i.test(source) || /\.topojson$/i.test(source)) {
            dataSource = new GeoJsonDataSource(getFilenameFromUri(source), {
                markerColor: Color.RED
            });
            loadPromise = dataSource.load(source);
        } else if (/\.kml$/i.test(source) || /\.kmz$/i.test(source)) {
            loadPromise = KmlDataSource.load(source, {
                camera: scene.camera,
                canvas: scene.canvas
            });
        } else {
            showLoadError(source, 'Unknown format.');
        }

        if (defined(loadPromise)) {
            viewer.dataSources.add(loadPromise).then(function (dataSource) {
                var lookAt = endUserOptions.lookAt;
                if (defined(lookAt)) {
                    var entity = dataSource.entities.getById(lookAt);
                    if (defined(entity)) {
                        viewer.trackedEntity = entity;
                    } else {
                        var error = 'No entity with id "' + lookAt + '" exists in the provided data source.';
                        showLoadError(source, error);
                    }
                } else if (!defined(view)) {
                    viewer.flyTo(dataSource);
                }
            }).otherwise(function (error) {
                showLoadError(source, error);
            });
        }
    }

    if (endUserOptions.stats) {
        scene.debugShowFramesPerSecond = true;
    }

    var theme = endUserOptions.theme;
    if (defined(theme)) {
        if (endUserOptions.theme === 'lighter') {
            document.body.classList.add('cesium-lighter');
            viewer.animation.applyThemeChanges();
        } else {
            var error = 'Unknown theme: ' + theme;
            viewer.cesiumWidget.showErrorPanel(error, '');
        }
    }

    if (defined(view)) {
        var splitQuery = view.split(/[ ,]+/);
        if (splitQuery.length > 1) {
            var longitude = !isNaN(+splitQuery[0]) ? +splitQuery[0] : 0.0;
            var latitude = !isNaN(+splitQuery[1]) ? +splitQuery[1] : 0.0;
            var height = ((splitQuery.length > 2) && (!isNaN(+splitQuery[2]))) ? +splitQuery[2] : 300.0;
            var heading = ((splitQuery.length > 3) && (!isNaN(+splitQuery[3]))) ? CesiumMath.toRadians(+splitQuery[3]) : undefined;
            var pitch = ((splitQuery.length > 4) && (!isNaN(+splitQuery[4]))) ? CesiumMath.toRadians(+splitQuery[4]) : undefined;
            var roll = ((splitQuery.length > 5) && (!isNaN(+splitQuery[5]))) ? CesiumMath.toRadians(+splitQuery[5]) : undefined;

            viewer.camera.setView({
                destination: Cartesian3.fromDegrees(longitude, latitude, height),
                orientation: {
                    heading: heading,
                    pitch: pitch,
                    roll: roll
                }
            });
        }
    }

    var camera = viewer.camera;
    function saveCamera() {
        var position = camera.positionCartographic;
        var hpr = '';
        if (defined(camera.heading)) {
            hpr = ',' + CesiumMath.toDegrees(camera.heading) + ',' + CesiumMath.toDegrees(camera.pitch) + ',' + CesiumMath.toDegrees(camera.roll);
        }
        endUserOptions.view = CesiumMath.toDegrees(position.longitude) + ',' + CesiumMath.toDegrees(position.latitude) + ',' + position.height + hpr;
        history.replaceState(undefined, '', '?' + objectToQuery(endUserOptions));
    }

    var timeout;
    if (endUserOptions.saveCamera !== 'false') {
        camera.changed.addEventListener(function() {
            window.clearTimeout(timeout);
            timeout = window.setTimeout(saveCamera, 1000);
        });
    }

    loadingIndicator.style.display = 'none';

});

