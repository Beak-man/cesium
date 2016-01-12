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

    function drawLinesFunction(that, viewer, polyLines, ellipsoid){


    that._handlerLeftClick   = new ScreenSpaceEventHandler();
	that._handlerMiddleClick = new ScreenSpaceEventHandler();
	that._handlerRightClick  = new ScreenSpaceEventHandler();
	that._handlerMove        = new ScreenSpaceEventHandler();
	
	var arrayDegrees = [] ;
		// var cursorPosition = mouvement.endPosition;
		 
		
         that._handlerLeftClick.setInputAction(function(click){
		 	
			 var cursorClickPosition = click.position;
			 var cartesian = viewer.scene.camera.pickEllipsoid(cursorClickPosition, ellipsoid); 
			 
             if (cartesian) {
			 	var cartographic = ellipsoid.cartesianToCartographic(cartesian);
			 //	var longitudeNumber = CesiumMath.toDegrees(cartographic.longitude);
			 //	var latitudeNumber = CesiumMath.toDegrees(cartographic.latitude);
			 	
			 	
			 	
			 	arrayDegrees.push(cartographic.longitude);
			 	arrayDegrees.push(cartographic.latitude);
				
				console.log(arrayDegrees);
			 	
			 	/* handlerMove.setInputAction(function(mouvement){}, ScreenSpaceEventType.MOUSE_MOVE);	*/
					
					if (arrayDegrees.length == 4) {

						// Coordinates in (Long, lat)
						   var polyline = polyLines.add({
							positions: PolylinePipeline.generateCartesianArc({
								// positions: Cartesian3.fromDegreesArray(arrayDegrees),
								positions: Cartesian3.fromRadiansArray(arrayDegrees),
								ellipsoid: ellipsoid
							}),
							material: Material.fromType('Color', {
								color: Color.YELLOW
							})
						});
						arrayDegrees = [];
						arrayDegrees.push(cartographic.longitude);
						arrayDegrees.push(cartographic.latitude);
					}
				}
			
		 }, ScreenSpaceEventType.LEFT_CLICK);


          that._handlerMiddleClick.setInputAction(function(click){
			    arrayDegrees = [] ;
		  }, ScreenSpaceEventType.MIDDLE_CLICK);
		  
		  that._handlerRightClick.setInputAction(function(click){
			   
			   var dim = viewer.scene.primitives._primitives[0]._polylines.length;
			   
			   if (dim > 1) {
			   	
				   	var polyline = viewer.scene.primitives._primitives[0]._polylines[dim - 1];
				   	polyLines.remove(polyline);
					
			   } else if (dim == 1) {
			   	
				   	var polyline = viewer.scene.primitives._primitives[0]._polylines[dim - 1];
				    polyLines.remove(polyline);
			   	    arrayDegrees = [] ;
					
			   } else if (dim == 0){
			   	
			   	    arrayDegrees = [] ;
					
			   }
		  }, ScreenSpaceEventType.RIGHT_CLICK);
	}



   /**
     * The view model for {@link subMenu}.
     * @alias SubMenuViewModel
     * @constructor
     */
    var SubMenuViewModel = function(viewer){
		
		// A MODIFIER :  si on souhaite charger un fichier de polyLines il faut etre capable de recuperer la collection de polyLines chagree
		
		var polyLines;
		var primitives = viewer.scene.primitives._primitives;

		if (primitives.length == 0) {

			polyLines = viewer.scene.primitives.add(new PolylineCollection());
			
		}else if (primitives.length > 0) {
		
			for (var i = 0; i < primitives.length; i++) {
			
				if (primitives[i]._polylines) {
				
					polyLines = primitives[i];
					break;
					
				} else {
				
					polyLines = viewer.scene.primitives.add(new PolylineCollection());
				}
			};
		}

		var ellipsoid = viewer.scene.globe.ellipsoid;
		
		this._viewer = viewer;
		this._polyLines = polyLines;
		this._ellipsoid = ellipsoid;
		
		var that = this;
		
		this._drawCommand = createCommand(function() {
             drawLinesFunction(that, that._viewer, that._polyLines,  that._ellipsoid);
		});
		
		this._cutCommand = createCommand(function() {

		});
		
		this._trashCommand = createCommand(function() {

		});
		
		this._saveCommand = createCommand(function() {

		});

		this._closeSubMenu = createCommand(function() {
			try{
				that._viewer.drawLines.viewModel.subMenu.destroyWrapperMenu;
				that.removeAllCommands;
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
			
			trashCommand : {
              get : function() {
                   return this._trashCommand;
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
			   
		   removeAllCommands  : {
               get : function() {
                   if (this._handlerLeftClick) this._handlerLeftClick.removeInputAction(ScreenSpaceEventType.LEFT_CLICK);
				   if (this._handlerMiddleClick) this._handlerMiddleClick.removeInputAction(ScreenSpaceEventType.MIDDLE_CLICK);
				   if (this._handlerRightClick) this._handlerRightClick.removeInputAction(ScreenSpaceEventType.RIGHT_CLICK);
				    }
               },  
			   
			   
		/*   handlerLeftClick : {
               get : function() {
                   return this._handlerLeftClick;
				    }
               },
			   
		   handlerMove : {
               get : function() {
                   return this._handlerMove;
				    }
               },*/
           });

    return SubMenuViewModel;
});
