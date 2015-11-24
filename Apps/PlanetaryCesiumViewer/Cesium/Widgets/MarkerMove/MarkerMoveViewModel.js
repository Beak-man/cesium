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
						
						//entity.description = "test";
						
						
						
						console.log(viewer.infoBox.frame.contentDocument.body);
						
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
						
						entity.properties.old_lat = entity.properties.center_lat;
						entity.properties.old_lon = entity.properties.center_lon;
						
						var longitudeRad = cartographic.longitude;
						if (longitudeRad < 0) {
							longitudeRad = longitudeRad + 2.0 * Math.PI;
						}
						entity.properties.center_lat = CesiumMath.toDegrees(cartographic.latitude);
						entity.properties.center_lon = CesiumMath.toDegrees(longitudeRad);
						
						entity._billboard.color = new Color(0.0, 1.0, 0.0, 1.0);
						
						lastEntity = null;
					}
				}, ScreenSpaceEventType.RIGHT_CLICK);
				
				_isActive = true;
			}
			
		} 
			
			
			
			function markerMoveSave(toolbar, scene, viewer, that){
				
				 var geoJson = viewer.geoJsonData;
		         _isActive = false;
			  
			     var dimArray =   viewer.dataSources._dataSources[0]._entityCollection._entities._array.length;
			  
			  for(var i=0; i<dimArray; i++){
				var modifiedPreperties = viewer.dataSources._dataSources[0]._entityCollection._entities._array[i]._properties;
				geoJson.features[i].properties = modifiedPreperties;
				geoJson.features[i].geometry.coordinates = [modifiedPreperties.center_lon, modifiedPreperties.center_lat];
			  }

			/*	var json = JSON.stringify(geoJson);
				var blob = new Blob([json], {type: "application/json"});
				var url  = URL.createObjectURL(blob);*/
			
		    document.location = 'data:json/octet-stream;charset=utf-8,' +JSON.stringify(geoJson, null, '\t');  
			   
			}
			
			
			function destroyClickedElement(event)
{
// remove the link from the DOM
    document.body.removeChild(event.target);
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