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
        ) { 
    "use strict";

        function shoSystemsView(toolbar, scene, viewer){
			
		} 	

        var ShowSystemsViewModel = function(PlanetsToolbar, scene, viewer) {

               this._scene  = scene;
			   this._PlanetsToolbar = PlanetsToolbar;
			   this._viewer = viewer;
			   
			    /**
		         * Gets or sets whether the button drop-down is currently visible.  This property is observable.
		         * @type {Boolean}
		         * @default false
		         */
               var that = this;

               this._command = createCommand(function() {
				  	shoSystemsView(that._PlanetsToolbar, that._scene, that._viewer);
				  });
				  
               /** Gets or sets the tooltip.  This property is observable.
               *
               * @type {String}
               */
               this.tooltip         = 'Show system';
               knockout.track(this, ['tooltip']);
           }; 

		   defineProperties(ShowSystemsViewModel.prototype, {		
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
	   	   
    return ShowSystemsViewModel;

});