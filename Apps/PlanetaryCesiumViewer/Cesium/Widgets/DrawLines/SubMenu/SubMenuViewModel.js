/*global define*/
define([
        '../../../Core/Math',
        '../../../Core/Cartesian3',
        '../../../Core/Cartographic',
		'../../../Core/CircleGeometry',
		'../../../Core/CircleOutlineGeometry',
		'../../../Core/Color',
		'../../../Core/ColorGeometryInstanceAttribute',
        '../../createCommand',  
        '../../../Core/defined',
        '../../../Core/defineProperties',
		'../../../Core/GeometryInstance',
	    '../../../ThirdParty/knockout',
		'../../../Scene/Material',
		'../../../Scene/PolylineCollection',
		'../../../Core/PolylinePipeline',
		'../../../Scene/PerInstanceColorAppearance',
		'../../../Scene/Primitive',
		'../../../Core/ScreenSpaceEventHandler',
        '../../../Core/ScreenSpaceEventType',
		'../../../Core/SimplePolylineGeometry'
    ], function(
	    CesiumMath,
	    Cartesian3,
	    Cartographic,
		CircleGeometry,
		CircleOutlineGeometry,
		Color,
		ColorGeometryInstanceAttribute,
	    createCommand,
        defined,
        defineProperties,
		GeometryInstance,
		knockout,
		Material,
		PolylineCollection,
		PolylinePipeline,
		PerInstanceColorAppearance,
		Primitive,
		ScreenSpaceEventHandler,
		ScreenSpaceEventType,
		SimplePolylineGeometry
		) {
    "use strict";

    var targetMouse;

    function drawLinesFunction(that, viewer, polyLines, ellipsoid){


    document.onmousemove =  getPosition;
	// document.onclick     =  getPosition;


     if (that._isPolyLineActive) {
	 
	 	that._handlerLeftClick   = new ScreenSpaceEventHandler();
	 	that._handlerMiddleClick = new ScreenSpaceEventHandler();
	 	that._handlerRightClick  = new ScreenSpaceEventHandler();
	 	that._handlerMove        = new ScreenSpaceEventHandler();
	 	
	 	var arrayRadians = [];
			
			that._handlerLeftClick.setInputAction(function(click){
			
			    var ellipsoid = viewer.scene.globe.ellipsoid;
				var cursorClickPosition = click.position;
				
				var cartesian = viewer.scene.camera.pickEllipsoid(cursorClickPosition, ellipsoid);
				
				if (cartesian && targetMouse === "[object HTMLCanvasElement]" ) {
					var cartographic = ellipsoid.cartesianToCartographic(cartesian);
					arrayRadians.push(cartographic.longitude);
					arrayRadians.push(cartographic.latitude);

					if (arrayRadians.length == 4) {

						var polyline = polyLines.add({
							positions: PolylinePipeline.generateCartesianArc({
								   positions: Cartesian3.fromRadiansArray(arrayRadians, ellipsoid),
								   ellipsoid: ellipsoid
							}),
							material: Material.fromType('Color', {
								color: Color.YELLOW
							})
						});
						arrayRadians = [];
						arrayRadians.push(cartographic.longitude);
						arrayRadians.push(cartographic.latitude);
					}
				}
				
				console.log( polyline = viewer.scene.primitives);
				
			}, ScreenSpaceEventType.LEFT_CLICK);
			
			
			that._handlerMiddleClick.setInputAction(function(click){
				arrayRadians = [];
				
				var polyline = viewer.scene.primitives._primitives[0]._polylines[dim - 1];
				
				
				
				var polyline = polyLines.add({
							positions: PolylinePipeline.generateCartesianArc({
								   positions: Cartesian3.fromRadiansArray(arrayRadians, ellipsoid),
								   ellipsoid: ellipsoid
							}),
							material: Material.fromType('Color', {
								color: Color.YELLOW
							})
						});

			}, ScreenSpaceEventType.MIDDLE_CLICK);
			
			that._handlerRightClick.setInputAction(function(click){
			
				var dim = viewer.scene.primitives._primitives[0]._polylines.length;
				
				if (dim > 1) {
				
					var polyline = viewer.scene.primitives._primitives[0]._polylines[dim - 1];
					polyLines.remove(polyline);
					var beforeLastPolyline = viewer.scene.primitives._primitives[0]._polylines[dim - 2];
					
					arrayRadians = [];
					
				} else if (dim == 1) {
					
						var polyline = viewer.scene.primitives._primitives[0]._polylines[dim - 1];
						polyLines.remove(polyline);
						arrayRadians = [];
						
					}else if (dim == 0) {
						
							arrayRadians = [];
							
						}
			}, ScreenSpaceEventType.RIGHT_CLICK);
			
			that._isPolyLineActive = false; // to prevent servral instance of the same Handlers
			
		}
	}


     function drawCircleFunction(that, viewer, ellipsoid){

             document.onmousemove =  getPosition;

            if (that._isCircleActive){

		    that._handlerLeftClickCircle     = new ScreenSpaceEventHandler();
			that._handlerRightClickCircle    = new ScreenSpaceEventHandler();
			that._handlerLeftDblClickCircle  = new ScreenSpaceEventHandler();
		    that._handlerMouseMoveCircle     = new ScreenSpaceEventHandler();
				
			that._handlerLeftClickCircle.setInputAction(function(click){
					 var oldPrim = null; 
					 var oldPrimFill = null;
					 var ellipsoid = viewer.scene.globe.ellipsoid;
					 
					 var cursorCircleCenter = click.position;
					 var cartesianCircleCenter = viewer.scene.camera.pickEllipsoid(cursorCircleCenter, ellipsoid); 
			 
			 
			          var circleRadius;
					  var newPrim;
			 
			 
                     if (cartesianCircleCenter && targetMouse === "[object HTMLCanvasElement]") {
					 	var cartographicCircleCenter = ellipsoid.cartesianToCartographic(cartesianCircleCenter);
						var cartesianCartographicCircleCenter = Cartesian3.fromRadians(cartographicCircleCenter.longitude, cartographicCircleCenter.latitude, cartographicCircleCenter.height, ellipsoid);

					 	that._handlerMouseMoveCircle.setInputAction(function(mouvement){
					 	
					 		var cursorMovePosition = mouvement.endPosition;
							var cartesianMovePosition = viewer.scene.camera.pickEllipsoid(cursorMovePosition, ellipsoid); 

                           if (cartesianMovePosition) {
						   	  var cartographicMovePosition = ellipsoid.cartesianToCartographic(cartesianMovePosition);
							  var cartesianCartographicMovePosition = Cartesian3.fromRadians(cartographicMovePosition.longitude, cartographicMovePosition.latitude, cartographicMovePosition.height, ellipsoid);
							
							  var deltaX = Cartesian3.distance(cartesianCartographicMovePosition, cartesianCartographicCircleCenter);

							  circleRadius = deltaX; 
								
							  var circleOutlineGeometry = new CircleOutlineGeometry({
						             center :cartesianCartographicCircleCenter,
						             radius : circleRadius,
									 ellipsoid : ellipsoid
						        });
								
							  var circleOutlineInstance = new GeometryInstance({
						         geometry : circleOutlineGeometry,
						         attributes : { color : ColorGeometryInstanceAttribute.fromColor(Color.YELLOW) }
						      });
							  
							  newPrim = new Primitive({
						          geometryInstances : [circleOutlineInstance],
								  primitiveType     : "circle",
						          appearance        : new PerInstanceColorAppearance({
								        flat        : true,
								        renderState : {lineWidth : Math.min(1.0, viewer.scene.maximumAliasedLineWidth)}
						          })
						      });
							  
							 var circleGeometry = new CircleGeometry({
				                 center       : cartesianCartographicCircleCenter,
				                 radius       : circleRadius,
							     ellipsoid    : ellipsoid,
				                 vertexFormat : PerInstanceColorAppearance.VERTEX_FORMAT
				             });
		
		                     var redCircleInstance = new GeometryInstance({
				                 geometry : circleGeometry,
				                 attributes : { color : ColorGeometryInstanceAttribute.fromColor(new Color(1.0, 1.0, 0.0, 0.4))}
				             });

					        var newPrimFill = new Primitive({
					          geometryInstances: [redCircleInstance],
							  primitiveType     : "circle",
					          appearance: new PerInstanceColorAppearance({closed: true })
					        });  


							  if (oldPrim && oldPrimFill) {
							  	//viewer.scene.primitives.remove(oldPrim);
							  	//viewer.scene.primitives.remove(oldPrimFill);
								
								viewer.scene.primitives.update(newPrim);
							  	viewer.scene.primitives.update(newPrimFill);
								
							  }
							  else {
							  
							  	viewer.scene.primitives.add(newPrim);
							  	viewer.scene.primitives.add(newPrimFill);
							  	
							  }
							  // console.log(newPrimFill);
							   
							   oldPrim = newPrim;
							   oldPrimFill = newPrimFill;
						   }
					 	}, ScreenSpaceEventType.MOUSE_MOVE);
					 }

				  that._handlerLeftDblClickCircle.setInputAction(function(){
					     if (that._handlerMouseMoveCircle) that._handlerMouseMoveCircle.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);
						 
			      }, ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
					 
				}, ScreenSpaceEventType.LEFT_CLICK);
				

				that._handlerRightClickCircle.setInputAction(function(click){
			
				var dim = viewer.scene.primitives._primitives.length;
				var continueWhile = true;
				
				if (dim > 1) {

				while(continueWhile){
					var primitiveObject1 = viewer.scene.primitives._primitives[dim - 1];
					var primitiveObject2 = viewer.scene.primitives._primitives[dim - 2];
		
				    if (primitiveObject1.primitiveType === "circle" && primitiveObject2.primitiveType === "circle"){
					     viewer.scene.primitives.remove(primitiveObject1);
						 viewer.scene.primitives.remove(primitiveObject2);
						 continueWhile = false;
					    } else {
							if (dim < 1) {
								continueWhile = false;
							}
							else {
								dim--;
						  }
						} 	
					  }
					}
						
			}, ScreenSpaceEventType.RIGHT_CLICK);
				
				
				
				
				
				
				
				
				
				
					
					
					/*	// Example 1: Draw a circle outline on the globe surface.
						// Create the circle outline geometry.
						var circleOutlineGeometry = new CircleOutlineGeometry({
						    center : Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, cartographic.height, ellipsoid),
						    radius : circleRadius
						});
						
						// Create a geometry instance using the circle outline
						// created above.
						var circleOutlineInstance = new GeometryInstance({
						    geometry : circleOutlineGeometry,
						    attributes : { color : ColorGeometryInstanceAttribute.fromColor(Color.YELLOW) }
						});
						
						// Add the geometry instance to primitives.
						viewer.scene.primitives.add(new Primitive({
						    geometryInstances : [circleOutlineInstance],
						    appearance : new PerInstanceColorAppearance({
						        flat : true,
						        renderState : {lineWidth : Math.min(2.0, viewer.scene.maximumAliasedLineWidth)}
						    })
						}));
					
				 }, ScreenSpaceEventType.LEFT_UP);*/

				
			/*	var circleGeometry = new CircleGeometry({
				    center : Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, cartographic.height, ellipsoid),
				    radius : 250000.0,
				    vertexFormat : PerInstanceColorAppearance.VERTEX_FORMAT
				});
		
		       var redCircleInstance = new GeometryInstance({
				    geometry : circleGeometry,
				    attributes : {
				        color : ColorGeometryInstanceAttribute.fromColor(new Color(1.0, 1.0, 0.0, 0.4))
				    }
				});
				
				viewer.scene.primitives.add(new Primitive({
				    geometryInstances: [redCircleInstance],
				    appearance: new PerInstanceColorAppearance({closed: true })
				}));
		
		
		      //  console.log(viewer.scene.primitives);
	    	}
		
	    }, ScreenSpaceEventType.LEFT_CLICK);*/
		
		
	      that._isCircleActive = false; // to prevent servral instance of the same Handlers
	 
	   }
	 
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
		this._isPolyLineActive = false;
		this._isCircleActive = false;
		
		var that = this;
		
		this._drawCommand = createCommand(function() {
			 that._isPolyLineActive = true;
		     that._isCircleActive = false;
			removeHandlers(that);
             drawLinesFunction(that, that._viewer, that._polyLines);
		});
		
		this._circleCommand = createCommand(function() {
			 that._isPolyLineActive = false;
		     that._isCircleActive = true;
			 removeHandlers(that);
			 drawCircleFunction(that, that._viewer,  that._ellipsoid);
		});
		
		this._cutCommand = createCommand(function() {

		});
		
		this._trashCommand = createCommand(function() {
              var primitives = viewer.scene.primitives;
				primitives.removeAll();
			   that._polyLines = viewer.scene.primitives.add(new PolylineCollection());
			   removeHandlers (that);
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
			
			circleCommand : {
               get : function() {
                   return this._circleCommand;
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
			   	   this._isPolyLineActive = false;
		           this._isCircleActive = false;
					
                   if (this._handlerLeftClick) this._handlerLeftClick.removeInputAction(ScreenSpaceEventType.LEFT_CLICK);
				   if (this._handlerMiddleClick) this._handlerMiddleClick.removeInputAction(ScreenSpaceEventType.MIDDLE_CLICK);
				   if (this._handlerRightClick) this._handlerRightClick.removeInputAction(ScreenSpaceEventType.RIGHT_CLICK);
				   
				   if (this._handlerLeftClickCircle) this._handlerLeftClickCircle.removeInputAction(ScreenSpaceEventType.LEFT_CLICK);
				   if (this._handlerRightClickCircle) this._handlerRightClickCircle.removeInputAction(ScreenSpaceEventType.RIGHT_CLICK);
				   if (this._handlerLeftDblClickCircle) this._handlerLeftDblClickCircle.removeInputAction(ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
				   if (this._handlerMouseMoveCircle) this._handlerMouseMoveCircle.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);
				    }
               },
			   
		   removeAllHandlers  : {
               get : function() {
			   	
				    console.log('all handlers remeved');
				
                   if (this._handlerLeftClick) this._handlerLeftClick.removeInputAction(ScreenSpaceEventType.LEFT_CLICK);
				   if (this._handlerMiddleClick) this._handlerMiddleClick.removeInputAction(ScreenSpaceEventType.MIDDLE_CLICK);
				   if (this._handlerRightClick) this._handlerRightClick.removeInputAction(ScreenSpaceEventType.RIGHT_CLICK);
				   
				   if (this._handlerLeftClickCircle) this._handlerLeftClickCircle.removeInputAction(ScreenSpaceEventType.LEFT_CLICK);
				   if (this._handlerRightClickCircle) this._handlerRightClickCircle.removeInputAction(ScreenSpaceEventType.RIGHT_CLICK);
				   if (this._handlerLeftDblClickCircle) this._handlerLeftDblClickCircle.removeInputAction(ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
				   if (this._handlerMouseMoveCircle) this._handlerMouseMoveCircle.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);
				    }
               },  
           });

// ================================================================================================================================
// ======================================================= LOCAL FUNCTIONS ========================================================
// ================================================================================================================================

function removeHandlers (that){
	
	  console.log('all handlers remeved');
				
      if (that._handlerLeftClick) that._handlerLeftClick.removeInputAction(ScreenSpaceEventType.LEFT_CLICK);
	  if (that._handlerMiddleClick) that._handlerMiddleClick.removeInputAction(ScreenSpaceEventType.MIDDLE_CLICK);
	  if (that._handlerRightClick) that._handlerRightClick.removeInputAction(ScreenSpaceEventType.RIGHT_CLICK);
	  
	  if (that._handlerLeftClickCircle) that._handlerLeftClickCircle.removeInputAction(ScreenSpaceEventType.LEFT_CLICK);
	  if (that._handlerRightClickCircle) that._handlerRightClickCircle.removeInputAction(ScreenSpaceEventType.RIGHT_CLICK);
	  if (that._handlerLeftDblClickCircle) that._handlerLeftDblClickCircle.removeInputAction(ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
	  if (that._handlerMouseMoveCircle) that._handlerMouseMoveCircle.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);
	 
}

function getPosition(e){
	e = e || window.event;
	
	 targetMouse = e.target.toString();
	
	//console.log(targetMouse);
	
	/*var cursor = {
		x: 0,
		y: 0
	};
	if (e.pageX || e.pageY) {
		cursor.x = e.pageX;
		cursor.y = e.pageY;
		
		console.log(cursor);
	}*/
	
}

    return SubMenuViewModel;
});
