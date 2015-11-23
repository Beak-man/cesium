/* Structure de base des widgets en Cesium : il faut respecter cette structure */

/*global define*/
define([
    '../../Core/Math',
    '../../Core/Color',
    '../createCommand', 
	'../../DataSources/DataSourceCollection',
	'../../DataSources/EntityCollection',
	'../../DataSources/GeoJsonDataSource',
    '../../ThirdParty/knockout', 
    '../../Core/defineProperties', 
    '../../Core/ScreenSpaceEventHandler',
    '../../Core/ScreenSpaceEventType',
    ], function(
	    CesiumMath,
        Color,
        createCommand,
		DataSourceCollection,
		EntityCollection,
		GeoJsonDataSource,
        knockout,
        defineProperties,
		ScreenSpaceEventHandler,
        ScreenSpaceEventType
        ) { // ATTENTION : il faut respecter l'ordre de déclaration coté define et coté function 
    "use strict";


var _isActive = false;

        function markerMoveView(toolbar, scene, viewer){
			
			if(_isActive ==false){
			
			        var lastEntity;
					var entity = null;
                    var ellipsoid = scene.globe.ellipsoid;
					
                    var handler = new ScreenSpaceEventHandler(scene.canvas);
                    handler.setInputAction(function(click){

						entity = null;
						var pickedObject = null;

                         pickedObject = scene.pick(click.position);
						
                        if (pickedObject) {
							
                            entity = pickedObject.primitive.id;
                            entity._billboard.color = new Color(1.0, 0.0, 0.0, 1.0);
							
							if (!lastEntity) { // premier coups
								lastEntity = entity;
							} else if (lastEntity && lastEntity != entity) { 
                                lastEntity._billboard.color = new Color(1.0, 1.0, 1.0, 1.0);
                                lastEntity = entity;

                            } else if (lastEntity && lastEntity == entity) { 
                                        lastEntity._billboard.color = new Color(1.0, 0.0, 0.0, 1.0);
                                        lastEntity = entity;
                                    } 
                        }    
               }, ScreenSpaceEventType.LEFT_CLICK);
			   
			   
			  var handler2 = new ScreenSpaceEventHandler(scene.canvas);
                     handler2.setInputAction(function(click){
							
                                var cartesian    = scene.camera.pickEllipsoid(click.position, ellipsoid);
								var cartographic = ellipsoid.cartesianToCartographic(cartesian);
								
                                if (entity) {
									
									 entity.position._value = cartesian;

									entity.properties.old_lat    = entity.properties.center_lat; 
									entity.properties.old_lon    = entity.properties.center_lon; 
									
									 var longitudeRad = cartographic.longitude;
		                             if (longitudeRad < 0){
		                                  longitudeRad = longitudeRad + 2.0*Math.PI;
		                             }	
									entity.properties.center_lat = CesiumMath.toDegrees(cartographic.latitude); 
									entity.properties.center_lon = CesiumMath.toDegrees(longitudeRad); 
									
                                    entity._billboard.color      = new Color(0.0, 1.0, 0.0, 1.0);

									lastEntity = null;
                                }
                            }, ScreenSpaceEventType.RIGHT_CLICK);
			   
			  _isActive = true;
			  document.getElementById('xxPrimeSave').innerHTML = "S";
			  
			} else if (_isActive == true){
				
				 var geoJson = viewer.geoJsonData;
				// document.getElementById('xxPrimeSave').innerHTML = "x x'"
		         _isActive = false;
			  
			     var dimArray =   viewer.dataSources._dataSources[0]._entityCollection._entities._array.length;
			  
			  for(var i=0; i<dimArray; i++){
				var modifiedPreperties = viewer.dataSources._dataSources[0]._entityCollection._entities._array[i]._properties;
				geoJson.features[i].properties = modifiedPreperties;
				geoJson.features[i].geometry.coordinates = [modifiedPreperties.center_lon, modifiedPreperties.center_lat];
				
			  }

			  var downloadedData = 'data:json/octet-stream;charset=utf-8,' +JSON.stringify(geoJson, null, '\t');
			
			console.log(downloadedData);
			
			
			  document.location = 'data:application/octet-stream;charset=utf-8,' +JSON.stringify(geoJson, null, '\n');  
			   
			}
        }

        var MarkerMoveViewModel = function(toolbar, container, scene, viewer) {


				console.log(viewer.DataSourceCollection);

               this._scene  = scene;
			   this._toolbar = toolbar;
			   this._container = container;
			   this._viewer = viewer;

               var that = this;

               this._command = createCommand(function() {
				  	markerMoveView(that._toolbar, that._scene, that._viewer);
				  });

               /**
               * Gets or sets the tooltip.  This property is observable.
               *
               * @type {String}
               */
               this.tooltip = 'Marker move';
               knockout.track(this, ['tooltip']);
			   
           };
		   
		   defineProperties(MarkerMoveViewModel.prototype, {		
           /**
            * Gets the Command that is executed when the button is clicked.
            * @memberof HomeButtonViewModel.prototype
            *
            * @type {Command}
            */
           command : {
               get : function() {
                   return this._command;
                   }
               },
           });
		   
		   
    return MarkerMoveViewModel;

});