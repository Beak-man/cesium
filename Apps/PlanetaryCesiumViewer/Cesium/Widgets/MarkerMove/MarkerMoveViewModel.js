/* Structure de base des widgets en Cesium : il faut respecter cette structure */

/*global define*/
define([
    '../../Core/Math',
    '../../Core/Color',
    '../createCommand', 
	'../../DataSources/DataSourceCollection',
	'../../Core/destroyObject',
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
		destroyObject,
		EntityCollection,
		GeoJsonDataSource,
        knockout,
        defineProperties,
		ScreenSpaceEventHandler,
        ScreenSpaceEventType
        ) { // ATTENTION : il faut respecter l'ordre de déclaration coté define et coté function 
    "use strict";

 var _isActive = false;
 var activeLink = false;

        function markerMoveView(toolbar, scene, viewer, that){
			
			if (_isActive == false) {
			
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
						
						
						
						
						
						
						
						//console.log(viewer.infoBox.frame.contentDocument.body);
						
						console.log(viewer.dataSources);
						
						if (!lastEntity) { // premier coups
							lastEntity = entity;
						}
						else 
							if (lastEntity && lastEntity != entity) {
								lastEntity._billboard.color = new Color(1.0, 1.0, 1.0, 1.0);
								lastEntity = entity;
								
							}
							else 
								if (lastEntity && lastEntity == entity) {
									lastEntity._billboard.color = new Color(1.0, 0.0, 0.0, 1.0);
									lastEntity = entity;
								}
					}
				}, ScreenSpaceEventType.LEFT_CLICK);
				
				
				var handler2 = new ScreenSpaceEventHandler(scene.canvas);
				handler2.setInputAction(function(click){
				
					var cartesian = scene.camera.pickEllipsoid(click.position, ellipsoid);
					var cartographic = ellipsoid.cartesianToCartographic(cartesian);
					
					if (entity) {
					
						entity.position._value = cartesian;
						
						var longitudeRad = cartographic.longitude;
						if (longitudeRad < 0) {
							longitudeRad = longitudeRad + 2.0 * Math.PI;
						}
					//	entity.properties.center_lat = CesiumMath.toDegrees(cartographic.latitude);
					//	entity.properties.center_lon = CesiumMath.toDegrees(longitudeRad);
						
						entity._billboard.color = new Color(0.0, 1.0, 0.0, 1.0);
						
						lastEntity = null;
					}
				}, ScreenSpaceEventType.RIGHT_CLICK);
				
				_isActive = true;
			} else {
				
				var lastEntity = null;
				var entity = null;
				
			}
			
		} 
		
		/*	function markerMoveSave(toolbar, scene, viewer, that){
				
				
				var ellipsoid = scene.globe.ellipsoid;
				 var geoJson = viewer.geoJsonData;
		         _isActive = false;
			  
			     var dimArray =   viewer.dataSources._dataSources[0]._entityCollection._entities._array.length;
			  
			  for(var i=0; i<dimArray; i++){
				var modifiedProperties = viewer.dataSources._dataSources[0]._entityCollection._entities._array[i]._properties;
				var modifiedPosition = viewer.dataSources._dataSources[0]._entityCollection._entities._array[i]._position._value;
				var cartographic = ellipsoid.cartesianToCartographic(modifiedPosition);
				
				var longitudeRad = cartographic.longitude;
				var latitudeRad  = cartographic.latitude;
				
				var latitudeDeg  = CesiumMath.toDegrees(latitudeRad);
				var longitudeDeg = CesiumMath.toDegrees(longitudeRad);
				
				
				geoJson.features[i].properties = modifiedProperties;
				geoJson.features[i].geometry.coordinates = [longitudeDeg, latitudeDeg];
			  }
			
		        document.location = 'data:application/octet-stream;charset=utf-8,' +JSON.stringify(geoJson, null, '\t');  
			}*/
			
			
			function markerMoveSaveLink(toolbar, scene, viewer, that){
				
			 if (activeLink == false) {
			 
			    var ellipsoid = scene.globe.ellipsoid;
			 	var geoJson = viewer.geoJsonData;
			 	_isActive = false;
			 	
			 	var dimArray = viewer.dataSources._dataSources[0]._entityCollection._entities._array.length;
			 	
			 	for (var i = 0; i < dimArray; i++) {
				var modifiedProperties = viewer.dataSources._dataSources[0]._entityCollection._entities._array[i]._properties;
				var modifiedPosition = viewer.dataSources._dataSources[0]._entityCollection._entities._array[i]._position._value;
				var cartographic = ellipsoid.cartesianToCartographic(modifiedPosition);
				
				var longitudeRad = cartographic.longitude;
				var latitudeRad  = cartographic.latitude;
				
				var latitudeDeg  = CesiumMath.toDegrees(latitudeRad);
				var longitudeDeg = CesiumMath.toDegrees(longitudeRad);
				
				
				geoJson.features[i].properties = modifiedProperties;
				geoJson.features[i].geometry.coordinates = [longitudeDeg, latitudeDeg];
			 	}
			 	
			 	console.log(geoJson);
			 	
			 	var jsonData = JSON.stringify(geoJson);
			 	var blob     = new Blob([jsonData], {type: "application/octet-stream"}); // pass a useful mime type here
			    var url      = URL.createObjectURL(blob);
					
					var fileName = "jsonFile.json";
					
					var save = document.getElementById('saveLink');
					save.href = url;
					save.target = '_blank';
					save.download = fileName || 'unknown';
					
					
					
					
					console.log(save);
					activeLink = true;
				}
				
				else 
					if (activeLink == true) {
					
					    activeLink = false;
					}
					
			
			/*  if (!window.ActiveXObject) {
			        var save = document.getElementById('saveLink');
			        save.href = url;
			        save.target = '_blank';
			        save.download = fileName || 'unknown';

			        var event = document.createEvent('Event');
			        event.initEvent('click', true, true);
			        save.dispatchEvent(event);
			        (window.URL || window.webkitURL).revokeObjectURL(save.href);
  			  }

    		  // for IE
		      else if ( !! window.ActiveXObject && document.execCommand)     {
				        var _window = window.open(url, '_blank');
				        _window.document.close();
				        _window.document.execCommand('SaveAs', true, fileName || url)
				        _window.close();
				    }
			
		    */
			   
			}
			
			
			

   var MarkerMoveViewModel = function(toolbar, container, scene, viewer) {

               this._scene  = scene;
			   this._toolbar = toolbar;
			   this._container = container;
			   this._viewer = viewer;
			   
			    /**
		         * Gets or sets whether the button drop-down is currently visible.  This property is observable.
		         * @type {Boolean}
		         * @default false
		         */
			   this.dropDownVisible = false;

               var that = this;

               this._command = createCommand(function() {
				  	markerMoveView(that._toolbar, that._scene, that._viewer, that);
					that.dropDownVisible = !that.dropDownVisible;
				  }, !that.dropDownVisible);
				  
				  
				  
				this._saveCommand = createCommand(function() {
				  	markerMoveSave(that._toolbar, that._scene, that._viewer, that);
					//that.dropDownVisible = !that.dropDownVisible;
				  });
				  
				  this._saveCommandLink = createCommand(function() {
				  	markerMoveSaveLink(that._toolbar, that._scene, that._viewer, that);
					//that.dropDownVisible = !that.dropDownVisible;
				  });
				  
				  

               /** Gets or sets the tooltip.  This property is observable.
               *
               * @type {String}
               */
               this.tooltip         = 'Marker move';
			   this.tooltip2        = 'Marker save';
			   this.selectedTooltip = 'Marker move';
			   
               knockout.track(this, ['tooltip', 'tooltip2', 'selectedTooltip', 'dropDownVisible']);
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
			   
			   saveCommand : {
               get : function() {
                   return this._saveCommand;
                   }
               },
			   
			   saveCommandLink : {
               get : function() {
                   return this._saveCommandLink;
                   }
               },
			   
		   toggleDropDown : {
            get : function() {
                return this._toggleDropDown;
            }
        },
			   
           });
		   
		   
	 MarkerMoveViewModel.prototype.destroy = function() {

        destroyObject(this);
    };
		   
		   
		   
    return MarkerMoveViewModel;

});