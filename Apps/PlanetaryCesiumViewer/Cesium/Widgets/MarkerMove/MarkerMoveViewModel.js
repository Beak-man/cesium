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
					var lastEntityMoved;
                    var element;
                    var ellipsoid = scene.globe.ellipsoid;
					
                    var handler = new ScreenSpaceEventHandler(scene.canvas);
                    
                    
                    handler.setInputAction(function(click){

                        var pickedObject = scene.pick(click.position);
                       // console.log(viewer.selectedEntity); 
						//console.log(viewer.dataSources._dataSources[0].load);
                        if (pickedObject) {
							
                           var entity = pickedObject.primitive.id;
                            entity._billboard.color = new Color(1.0, 0.0, 0.0, 1.0);
							
							console.log(pickedObject);

							var dataSource = new GeoJsonDataSource();
							var entities = dataSource.entities.values;
							
                            if (lastEntity && lastEntity != entity) { // deuxieme coups et plus
                                lastEntity._billboard.color = new Color(1.0, 1.0, 1.0, 1.0);
                                lastEntity = entity;
								entity = null;
								
                            } else if (!lastEntity) {  // premier coups
                                    lastEntity = entity;
									entity = null;
									
                            } else if (lastEntity && lastEntity == entity) { // deuxieme coups et plus
                                        lastEntity._billboard.color = new Color(1.0, 1.0, 0.0, 1.0);
                                        lastEntity = entity;
										entity = null;
                                    }
                            
                            
                            var handler = new ScreenSpaceEventHandler(scene.canvas);
                            handler.setInputAction(function(click){
                           
							
                                var cartesian    = scene.camera.pickEllipsoid(click.position, ellipsoid);
								var cartographic = ellipsoid.cartesianToCartographic(cartesian);
                                
                                if (lastEntity) {
									
									if (!lastEntity.properties.modifed_lat) lastEntity.addProperty("modifed_lat");
									if (!lastEntity.properties.modifed_lon) lastEntity.addProperty("modifed_lon");
									
									lastEntityMoved = lastEntity;
                                    lastEntity.position._value = cartesian;
									
									
									lastEntity.properties.old_lat    = lastEntity.properties.center_lat; 
									lastEntity.properties.old_lon    = lastEntity.properties.center_lon; 
									
									
									 var longitudeRad = cartographic.longitude;
		                             if (longitudeRad < 0){
		                                  longitudeRad = longitudeRad + 2.0*Math.PI;
		                             }	
									lastEntity.properties.center_lat = CesiumMath.toDegrees(cartographic.latitude); 
									lastEntity.properties.center_lon = CesiumMath.toDegrees(longitudeRad); 
									
                                    lastEntity._billboard.color      = new Color(0.0, 1.0, 0.0, 1.0);
									lastEntityMoved._billboard.color = new Color(0.0, 1.0, 0.0, 1.0);
									
									//***************************** Pour enregistrer des données *********************************
									// document.location = 'data:json/octet-stream,' + JSON.stringify(lastEntity.properties);
									//********************************************************************************************
									
                                    entity = 'undefined'
									lastEntity = null;
									pickedObject = null;		
									
                                }
                            }, ScreenSpaceEventType.RIGHT_CLICK);
                        }    
               }, ScreenSpaceEventType.LEFT_CLICK);
			
			  _isActive = true;
			  
			 // console.log(document.getElementById('xxPrimeSave'));
			  
			  
			  
			  document.getElementById('xxPrimeSave').innerHTML = "S";
			  
			  
			} else if (_isActive == true){
				
				
				var geoJson = viewer.geoJsonData;
				 document.getElementById('xxPrimeSave').innerHTML = "x x'"
		        //_isActive = false;
			  
			var dimArray =   viewer.dataSources._dataSources[0]._entityCollection._entities._array.length;
			//console.log(dimArray);
			  
			  var StringObj = "[";
			  for(var i=0; i<dimArray; i++){
			  	//StringObj += JSON.stringify(viewer.dataSources._dataSources[0]._entityCollection._entities._array[i]._properties)+",\r\n"
				
				geoJson.features[i].properties = viewer.dataSources._dataSources[0]._entityCollection._entities._array[i]._properties;
				
				console.log(geoJson.features[i].properties);
				
			  }
			  
			  
			  console.log(geoJson);
			  
			  // document.location = 'data:json/octet-stream;charset=utf-8,' +StringObj+"]";
			   
			  // saveAs(StringObj, "test.json");
			   
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
               this.tooltip = 'save geoJson file';
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