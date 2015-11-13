/*global define*/
define([ //  Definition des dépendances
        'Cesium/Core/Cartesian3',
        'Cesium/Core/defined',
        'Cesium/Core/formatError',
        'Cesium/Core/getFilenameFromUri',
	'Cesium/Core/queryToObject',
	'Cesium/Core/Credit',
	'Cesium/Core/Color',
	'Cesium/Core/DefaultProxy',
	'Cesium/Core/defaultValue',
	'Cesium/Core/Ellipsoid',
	'Cesium/Core/EllipsoidTerrainProvider',
	'Cesium/Core/loadJson',
	'Cesium/Core/Math',
	'Cesium/Core/Rectangle',
	'Cesium/Core/GeographicProjection',
	'Cesium/Core/NearFarScalar',
	'Cesium/Core/ScreenSpaceEventHandler',
	'Cesium/Core/ScreenSpaceEventType',
        'Cesium/DataSources/CzmlDataSource',
        'Cesium/DataSources/GeoJsonDataSource',
	'Cesium/DataSources/KmlDataSource',
	'Cesium/DataSources/LabelGraphics',
	'Cesium/Scene/ImageryLayer',
        'Cesium/Scene/TileMapServiceImageryProvider',
	//'Cesium/Scene/IIPImageryProvider',
        'Cesium/Scene/GridImageryProvider',
        'Cesium/Scene/WebMapServiceImageryProvider',
        'Cesium/Scene/WebMapTileServiceImageryProvider',
	'Cesium/Scene/TileCoordinatesImageryProvider',
	'Cesium/Scene/SkyAtmosphere',
	'Cesium/Scene/SkyBox',
	'Cesium/Scene/Globe',
        //'Cesium/Core/GeoServerTerrainProvider',
        'Cesium/Widgets/Viewer/Viewer',
        'Cesium/Widgets/Viewer/viewerCesiumInspectorMixin',
        'Cesium/Widgets/Viewer/viewerDragDropMixin',
	'Cesium/Widgets/createCommand',
	//'RLayerMenu/RLayerMenu',
	//'RLayerMenu/RLayerMenuViewModel',
	'Cesium/ThirdParty/knockout',
	'Cesium/ThirdParty/when',
    ], function( // Début de la fonction
        Cartesian3,
        defined,
        formatError,
        getFilenameFromUri,
	queryToObject,
	Credit,
	Color,
        DefaultProxy,
	defaultValue,
	Ellipsoid,
	EllipsoidTerrainProvider,
	loadJson,
	CesiumMath,
        Rectangle,
	GeographicProjection,
	NearFarScalar,
	ScreenSpaceEventHandler,
	ScreenSpaceEventType,
	CzmlDataSource,
        GeoJsonDataSource,
	ImageryLayer,
	KmlDataSource,
	LabelGraphics,
        TileMapServiceImageryProvider,
        GridImageryProvider,
        WebMapServiceImageryProvider,
        WebMapTileServiceImageryProvider,
	TileCoordinatesImageryProvider,
	SkyAtmosphere,
	SkyBox,
	Globe,
        Viewer,
        viewerCesiumInspectorMixin,
        viewerDragDropMixin,
	createCommand,
	knockout,
	when) {
    "use strict";
    /*global console*/

    /*
     * 'debug'  : true/false,   // Full WebGL error reporting at substantial performance cost.
     * 'lookAt' : CZML id,      // The CZML ID of the object to track at startup.
     * 'source' : 'file.czml',  // The relative URL of the CZML file to load at startup.
     * 'stats'  : true,         // Enable the FPS performance display.
     * 'theme'  : 'lighter',    // Use the dark-text-on-light-background theme.
     * 'scene3DOnly' : false    // Enable 3D only mode.
     */
	
	// Here, we use the request to create the "endUserOptions" object.
	
	/* exemple : 
	 
	 http://localhost:8080/Apps/CesiumMarsViewer/index.html            ==> request without parameters. Hence : endUserOptions = {} 
	 http://localhost:8080/Apps/CesiumMarsViewer/index.html?map=themis ==> request with one parameter. Hence : endUserOptions = { map : "themis"}.
	 */
	
		/** Query  parameters: 
	 * 
	 * ellipsoidType = name.  Type of ellipsoid to use (predefined or customized. See here after)) 
	 * ellipsoidSize = x,y,z. (Dimensions of the ellipsoid)
	 * NAIFCodes     = a,b. Naif codes for planet ("a" parameter) and satellite ("b" parameter). for a planet (Mars for example), use a=4, b=0;
	 *                      This parameter must be used with a customized ellipsoid (so with the ellipsoidType and ellipsoidSize parameters)                         
	 */
    var endUserOptions = queryToObject(window.location.search.substring(1)); 
		
	/* *************************************************************************************************************************************** */
	/* *************************************************************** NEW *************************************************************** */
	/* *************************************************************************************************************************************** */
	
	
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
		 	
            if (typeof endUserOptions.ellipsoidSize !== 'undefined'){ 
				
                Ellipsoid.modify(Ellipsoid, endUserOptions);
            };
			
            console.log("********** Ellipsoid ins PlanetaryCesiumViewer ***********");
            console.log(Ellipsoid[endUserOptions.ellipsoidType.toString().toUpperCase()]);
            console.log("**********************************************************");
			
            Ellipsoid.used = endUserOptions.ellipsoidType.toString().toUpperCase();
		
            globeParam            = new Globe(Ellipsoid[endUserOptions.ellipsoidType.toString().toUpperCase()]);   
            mapProjectionParam    = new GeographicProjection(Ellipsoid[endUserOptions.ellipsoidType.toString().toUpperCase()]);
            terrainProviderParam  = new EllipsoidTerrainProvider({ellipsoid: Ellipsoid[endUserOptions.ellipsoidType.toString().toUpperCase()]});
            ellipsoidImageryParam = Ellipsoid[endUserOptions.ellipsoidType.toString().toUpperCase()];

        } else  if (!endUserOptions.ellipsoidType) {

            Ellipsoid.used = "WGS84";

            globeParam             = new Globe(Ellipsoid.WGS84);                             
            mapProjectionParam     = new GeographicProjection(Ellipsoid.WGS84);
            terrainProviderParam   = new EllipsoidTerrainProvider({ellipsoid: Ellipsoid.WGS84});
            ellipsoidImageryParam  = Ellipsoid.WGS84;
        };

    /* *************************************************************************************************************************************** */
    /* *********************************************************** END NEW ******************************************************************* */
    /* *************************************************************************************************************************************** */
   
    var imageryProvider; // Provides imagery to be displayed on the surface of an ellipsoid

    if (endUserOptions.tmsImageryUrl) {
        imageryProvider = new TileMapServiceImageryProvider({
            url: endUserOptions.tmsImageryUrl
        });
    }
    else {
	
		// Paramètres de la requete
		
		// SERVICE :Name of the OGC services.
		// VERSION : Number of the WMS protocol versions.
		// STYLES  : Styles lit used for each LAYERS
		// REQUEST : Three possible opérations : GetCapabilities, GetMap, GetFeatureInfo.
		// FORMAT  : type of the returned image ???
		// LAYERS  : Liste des desired layers.
		// BBOX    : the map size (longitude min,latitude min, longitude max, latitude max 
		// WIDTH   : Width of the image.
		// HEIGHT  : Height of the image.
		
		
        imageryProvider = new WebMapServiceImageryProvider({
                    url       : 'http://planetarymaps.usgs.gov/cgi-bin/mapserv?map=/maps/mars/mars_simp_cyl.map&SERVICE=WMS&VERSION=1.1.1&SRS=EPSG:4326&STYLES=&REQUEST=GetMap&FORMAT=image%2Fjpeg&LAYERS=THEMIS&BBOX=221,15,231,25&WIDTH=1000&HEIGHT=1000',
                    //url       : 'http://planetarymaps.usgs.gov/cgi-bin/mapserv?map=/maps/mars/mars_simp_cyl.map&SERVICE=WMS&VERSION=1.1.1&SRS=EPSG:4326&STYLES=&REQUEST=GetMap&FORMAT=image%2Fjpeg&LAYERS=MOLA_bw&BBOX=221,15,231,25&WIDTH=1000&HEIGHT=1000',
                    layers    : 'themis',
                    credit    : 'USGS @ planetarymaps.usgs.gov',
                    ellipsoid : ellipsoidImageryParam
		});
	};
  
    var loadingIndicator = document.getElementById('loadingIndicator');	
	
    var viewer;		
	
    try {		
        viewer = new Viewer('cesiumContainer', {
	    mapProjection      : mapProjectionParam,         // The map projection to use in 2D and Columbus View modes (class : GeographicProjection).		
	    globe              : globeParam,                 //  The globe to use in the scene. (class : Globe)
	    baseLayerPicker    : false,                      
	    imageryProvider    : imageryProvider,            // Fournit l'image à afficher sur le globe.
	    terrainProvider    : terrainProviderParam,	      
	    scene3DOnly        : endUserOptions.scene3DOnly, // show 3D scene directly.
	    skyAtmosphere      : false,                      // atm visualisation.
	    skyBox             : new SkyBox({show: false}),  // stars visualisation (calculés).
	    selectionIndicator : false, 
	    timeline           : false,                      // for files which contains the temporal dimension
	    animation          : false,                      // for animation which displayed with the time 
	    navigationInstructionsInitiallyVisible : false
        });
    } catch (exception) {
        loadingIndicator.style.display = 'none';
        var message = formatError(exception);
        console.error(message);
        if (!document.querySelector('.cesium-widget-errorPanel')) {
           window.alert(message);
        }
        return;
    }

    viewer.extend(viewerDragDropMixin);
    if (endUserOptions.inspector) {
        viewer.extend(viewerCesiumInspectorMixin);
    }

    var showLoadError = function(name, error) {
        var title = 'An error occurred while loading the file: ' + name;
        var message = 'An error occurred while loading the file, which may indicate that it is invalid.  A detailed error report is below:';
        viewer.cesiumWidget.showErrorPanel(title, message, error);
    };

    viewer.dropError.addEventListener(function(viewerArg, name, error) {
        showLoadError(name, error);
    });


/* *************************************************************************************************************************************** */
	/* *************************************************************** NEW *************************************************************** */
	/* *************************************************************************************************************************************** */
	


var wyoming = viewer.entities.add({
  name : 'Wyoming',
  polygon : {
    hierarchy : Cartesian3.fromDegreesArray([
                              -109.080842,45.002073,
                              -105.91517,45.002073,
                              -104.058488,44.996596,
                              -104.053011,43.002989,
                              -104.053011,41.003906,
                              -105.728954,40.998429,
                              -107.919731,41.003906,
                              -109.04798,40.998429,
                              -111.047063,40.998429,
                              -111.047063,42.000709,
                              -111.047063,44.476286,
                              -111.05254,45.002073]),
    material : Color.RED.withAlpha(0.5),
    outline : true,
    outlineColor : Color.BLACK
  }
});

 var scene = viewer.scene;
 
 var  handler = new ScreenSpaceEventHandler(scene.canvas);
   handler.setInputAction(function(click) {
     var entity   =  scene.pick(click.position);
	 var IdEntity = entity.id.id;
	 
	 var coordinatesEntity = entity.primitive.position;
	 var colorEntity       = entity.primitive.color;
	 
	 entity.primitive.color = { 
					 red: 1, 
					 green: 0.5, 
					 blue: 0, 
					 alpha: 1 
	 };
	 
	 
	 
	 
	  entity.primitive.scale = 2;
	   entity.primitive.translate = {
	   	x: 10 + coordinatesEntity.x,
		y: 100
		}
	 
	 
	 entity.ready;
	 
	 console.log(entity.bill);
	 
    }, ScreenSpaceEventType.LEFT_CLICK);
 
 /*
    // If the mouse is over the billboard, change its scale and color
  var  handler = new ScreenSpaceEventHandler(scene.canvas);
    handler.setInputAction(function(movement) {
        var pickedObject = scene.pick(movement.endPosition);
        if (defined(pickedObject) && (pickedObject.id === entity)) {
            entity.billboard.scale = 2.0;
            entity.billboard.color = Color.YELLOW;
        } else {
            entity.billboard.scale = 1.0;
            entity.billboard.color = Color.WHITE;
        }
    }, ScreenSpaceEventType.MOUSE_MOVE);

*/

/* *************************************************************************************************************************************** */
	/* *************************************************************** NEW *************************************************************** */
	/* *************************************************************************************************************************************** */
	



    var scene = viewer.scene;
    var context = scene.context;

    if (endUserOptions.debug) {
        context.validateShaderProgram = true;
        context.validateFramebuffer = true;
        context.logShaderCompilation = true;
        context.throwOnWebGLError = true;
    }


    if (endUserOptions.source) { 
        var source = endUserOptions.source; 
    }
    if (defined(source)) {
        var dataSource;
        var loadPromise;

        if (/\.czml$/i.test(source)) { 
            dataSource = new CzmlDataSource(getFilenameFromUri(source)); 
            loadPromise = dataSource.loadUrl(source); 
        } else if (/\.geojson$/i.test(source) || /\.json$/i.test(source) || /\.topojson$/i.test(source)) {
        
		
		console.log(source);
		
            dataSource = new GeoJsonDataSource(getFilenameFromUri(source), {
	        markerColor : Color.RED
	    });
            loadPromise = dataSource.load(source);
	} else if (/\.kml$/i.test(source) || /\.kmz$/i.test(source)) { 
	    dataSource = new KmlDataSource(getFilenameFromUri(source));
	    loadPromise = dataSource.load(source);
        } else { 
            showLoadError(source, 'Unknown format.');
        }

        if (defined(loadPromise)) {
            viewer.dataSources.add(loadPromise).then(function(dataSource) { 
                var lookAt = endUserOptions.lookAt; 
                if (defined(lookAt)) {
                    var entity = dataSource.entities.getById(lookAt); 
                    if (defined(entity)) {
                        viewer.trackedEntity = entity; 
                    } else {
                        var error = 'No entity with id "' + lookAt + '" exists in the provided data source.';
                        showLoadError(source, error);
                    }
                }
            }).otherwise(function(error) {
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
    loadingIndicator.style.display = 'none';
});