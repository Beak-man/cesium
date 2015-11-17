/* Structure de base des widgets en Cesium : il faut respecter cette structure */

/*global define*/
define([
    '../../Core/Color',
    '../createCommand', 
    '../../ThirdParty/knockout', 
    '../../Core/defineProperties', 
    '../../Core/ScreenSpaceEventHandler',
    '../../Core/ScreenSpaceEventType',
    ], function(
        Color,
        createCommand,
        knockout,
        defineProperties,
		ScreenSpaceEventHandler,
        ScreenSpaceEventType
        ) { // ATTENTION : il faut respecter l'ordre de déclaration coté define et coté function 
    "use strict";

        function markerMoveView(scene, container, entity, element){

             var ellipsoid = scene.globe.ellipsoid;
            // console.log(entity.position._value);

              entity._billboard.color = new Color(1.0, 0.0, 0.0, 1.0);
			  
			  var handler = new ScreenSpaceEventHandler(scene.canvas);
			  handler.setInputAction(function(click){
                        
						var cartesian = scene.camera.pickEllipsoid(click.position, ellipsoid); 
						console.log(cartesian);
						
						 entity.position._value = cartesian;
						 entity._billboard.color = new Color(0.0, 1.0, 0.0, 1.0);
						
						
                        }, ScreenSpaceEventType.RIGHT_CLICK);

			  knockout.cleanNode(element);
             // container.removeChild(element);	  
        }

        var MarkerMoveViewModel = function(scene, container, entity, element) {

               this._scene  = scene;
			   this._entity = entity;
			   this._element = element;
			   this._container = container;

               var that = this;
               this._command = createCommand(function() {
                   markerMoveView(that._scene, that._container, that._entity, that._element);
               });

               /**
               * Gets or sets the tooltip.  This property is observable.
               *
               * @type {String}
               */
               this.tooltip = 'Marker change position';
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