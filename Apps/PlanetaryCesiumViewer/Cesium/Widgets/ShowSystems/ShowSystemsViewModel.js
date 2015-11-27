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


        function showSystemsView(planetName, viewerContainer, PlanetsToolbar, scene, viewer){
			
			var configContainer = document.getElementById("configId");
			
			if (configContainer.style.left !== '-270px' && configContainer.style.left !== '') {
			
			    console.log(configContainer.style.left);
				console.log("dans if");
				
				configContainer.className = "";
				configContainer.className = "cesium-showSystems-configContainer-transition";
				configContainer.style.left = '-270px';
				
				 setTimeout(function(){
					 var configContainer = document.getElementById("configId");
					 configContainer.className = "";
					 configContainer.className = "cesium-showSystems-configContainer";
					 configContainer.style.visibility = "visible";
					 configContainer.style.left = '5px';	
			     }, 1000);
				
			}
			else {
			
			    console.log(configContainer.style.left);
				console.log("dans else");
			
				configContainer.className = "";
				configContainer.className = "cesium-showSystems-configContainer";
				configContainer.style.visibility = "visible";
				configContainer.style.left = '5px';
				
			}
		} 	


        function cancelFunction(planetName, viewerContainer, PlanetsToolbar, scene, viewer){
			
			var configContainer = document.getElementById("configId");
			configContainer.className = "";
			configContainer.className = "cesium-showSystems-configContainer-transition";
			configContainer.style.left = "-270px";
			 
		}



        var ShowSystemsViewModel = function(viewerContainer, PlanetsToolbar, scene, viewer) {

               this._scene  = scene;
			   this._viewerContainer = viewerContainer;
			   this._PlanetsToolbar = PlanetsToolbar;
			   this._viewer = viewer;
			   this.buttonVisible = false;
			    /**
		         * Gets or sets whether the button drop-down is currently visible.  This property is observable.
		         * @type {Boolean}
		         * @default false
		         */
               var that = this;

                this._command = createCommand(function(pn, id) {	
				  	showSystemsView(pn, that._viewerContainer, that._PlanetsToolbar, that._scene, that._viewer);
					// that.buttonVisible = !that.buttonVisible;
				});



				this._cancelCommand = createCommand(function() {	
				    console.log("test");
				  	cancelFunction(that._viewerContainer, that._PlanetsToolbar, that._scene, that._viewer);
				});
				  
               /** Gets or sets the tooltip.  This property is observable.
               *
               * @type {String}
               */
               this.tooltip         = 'Show this system';
               knockout.track(this, ['tooltip', 'buttonVisible']);
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
			   
			   cancelCommand : {
               get : function() {
                   return this._cancelCommand;
                   }
               }, 
			   	   	   
           });
	   	   
    return ShowSystemsViewModel;

});