/* Structure de base des widgets en Cesium : il faut respecter cette structure */

/*global define*/
define([
    '../../Core/Math',
    '../createCommand', 
	'../../Core/destroyObject',
    '../../ThirdParty/knockout', 
    '../../Core/defineProperties',
    ], function(
	    CesiumMath,
        createCommand,
		destroyObject,
        knockout,
        defineProperties
        ) { 
    "use strict";

 var windowsMove = '-470px';
 var _selected  = false;

        function listView(container){
               console.log("dans list view model");
		} 

        var ListViewModel = function(container) {

                this._container  = container;
                var that = this;

                this._testCommand = createCommand(function() {
					
					console.log("dans command");
				  	listView(that._container);	
				});
				  
               /** Gets or sets the tooltip.  This property is observable.
               *
               * @type {String}
               */
               this.tooltip  = 'Show this system';
              knockout.track(this, ['tooltip']);
	     }; 

		   defineProperties(ListViewModel.prototype, {		
           /**
            * Gets the Command that is executed when the button is clicked.
            * @memberof HomeButtonViewModel.prototype
            *
            * @type {Command}
            */
			 testCommand : {
               get : function() {
                   return this._testCommand;
                   }
               }, 
			   	   	   
           });

    return ListViewModel;
});