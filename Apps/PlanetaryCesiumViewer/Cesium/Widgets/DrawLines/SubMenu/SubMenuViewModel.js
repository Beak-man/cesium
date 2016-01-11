/*global define*/
define([
        '../../../Core/Math',
        '../../../Core/Cartesian3',
        '../../../Core/Cartographic',
		'../../../Core/Color',
        '../../createCommand',  
        '../../../Core/defined',
        '../../../Core/defineProperties',
	    '../../../ThirdParty/knockout',
		'../../../Scene/Material',
		'../../../Scene/PolylineCollection',
		'../../../Core/PolylinePipeline',
		'../../../Core/ScreenSpaceEventHandler',
        '../../../Core/ScreenSpaceEventType',
		'../../../Core/SimplePolylineGeometry'
    ], function(
	    CesiumMath,
	    Cartesian3,
	    Cartographic,
		Color,
	    createCommand,
        defined,
        defineProperties,
		knockout,
		Material,
		PolylineCollection,
		PolylinePipeline,
		ScreenSpaceEventHandler,
		ScreenSpaceEventType,
		SimplePolylineGeometry
		) {
    "use strict";

     var arrayDegrees = [] ;

    function drawLinesFunction(viewer, polyLines, ellipsoid){


    var handlerLeftClick = new ScreenSpaceEventHandler();
	var handlerMove      = new ScreenSpaceEventHandler();
	
	var segment = []
	 	
		// var cursorPosition = mouvement.endPosition;
		 
		
         handlerLeftClick.setInputAction(function(click){
		 	
			 var cursorClickPosition = click.position;
			 var cartesian = viewer.scene.camera.pickEllipsoid(cursorClickPosition, ellipsoid); 
                        if (cartesian) {
							var cartographic = ellipsoid.cartesianToCartographic(cartesian);
							var longitudeNumber =  CesiumMath.toDegrees(cartographic.longitude);
							var latitudeNumber =  CesiumMath.toDegrees(cartographic.latitude);
						}
			
			console.log(longitudeNumber +" "+latitudeNumber);
			
			
			
			arrayDegrees.push(longitudeNumber)
			arrayDegrees.push(latitudeNumber)
			
			
			/* handlerMove.setInputAction(function(mouvement){}, ScreenSpaceEventType.MOUSE_MOVE);	*/
				
			
			if (arrayDegrees.length == 4) {
			
			
			console.log(arrayDegrees.length);
			
				// Coordinates in (Long, lat)
				var polyline = polyLines.add({
					positions: PolylinePipeline.generateCartesianArc({
						positions: Cartesian3.fromDegreesArray(arrayDegrees),
						ellipsoid: ellipsoid
					}),
					material: Material.fromType('Color', {
						color: Color.YELLOW
					})
				});
				
				arrayDegrees = [];
				
			}	
			
			
			
			
			
		 }, ScreenSpaceEventType.LEFT_CLICK);


	console.log(viewer.scene.primitives);
	}



   /**
     * The view model for {@link subMenu}.
     * @alias SubMenuViewModel
     * @constructor
     */
    var SubMenuViewModel = function(viewer){
		
		// A MODIFIER :  si on souhaite charger un fichier de polyLines il faut etre capable de recuperer la collection de polyLines chagree
		
		var polyLines = viewer.scene.primitives.add(new PolylineCollection());
		var ellipsoid = viewer.scene.globe.ellipsoid;
		
		this._viewer = viewer;
		this._polyLines = polyLines;
		this._ellipsoid = ellipsoid;
		
		var that = this;
		
		this._drawCommand = createCommand(function() {

             drawLinesFunction(that._viewer, that._polyLines,  that._ellipsoid);

		});
		
		this._cutCommand = createCommand(function() {

		});
		
		this._saveCommand = createCommand(function() {

		});

		this._closeSubMenu = createCommand(function() {
			try{
				that._viewer.drawLines.viewModel.subMenu.destroyWrapperMenu;
			} catch (e){} 
		});
		  
		//  knockout.track(this, ["", ""]);
		  
	};
           defineProperties(SubMenuViewModel.prototype, {		
           /**
            * Gets the Command that is executed when the button is clicked.
            * @memberof SubMenuViewModel.prototype
            *
            * @type {Command}
            */
			
			drawCommand : {
               get : function() {
                   return this._drawCommand;
                }
            },
			
			cutCommand : {
               get : function() {
                   return this._cutCommand;
                }
            },
			
			saveCommand : {
              get : function() {
                   return this._saveCommand;
                }
            },
			
           closeSubMenu : {
               get : function() {
                   return this._closeSubMenu;
                   }
               }, 
           });

    return SubMenuViewModel;
});
