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
     '../../../Scene/HorizontalOrigin',
    '../../../Scene/LabelCollection',
    '../../../Scene/LabelStyle',
    '../../../Scene/Material',
    '../../../Scene/PolylineCollection',
    '../../../Core/PolylinePipeline',
    '../../../Scene/PerInstanceColorAppearance',
    '../../../Scene/Primitive',
    '../../../Core/ScreenSpaceEventHandler',
    '../../../Core/ScreenSpaceEventType',
    '../../../Core/SimplePolylineGeometry',
     '../../../Scene/VerticalOrigin',
], function (
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
        HorizontalOrigin,
        LabelCollection,
        LabelStyle,
        Material,
        PolylineCollection,
        PolylinePipeline,
        PerInstanceColorAppearance,
        Primitive,
        ScreenSpaceEventHandler,
        ScreenSpaceEventType,
        SimplePolylineGeometry,
        VerticalOrigin
        ) {
    "use strict";

    var targetMouse;

    function drawLinesFunction(that, viewer, polyLines) {

        document.onmousemove = getPosition;
        // document.onclick     =  getPosition;

        if (that._isPolyLineActive) {

            that._handlerLeftClick = new ScreenSpaceEventHandler(viewer.scene.canvas);
            that._handlerMiddleClick = new ScreenSpaceEventHandler(viewer.scene.canvas);
            that._handlerRightClick = new ScreenSpaceEventHandler(viewer.scene.canvas);
            that._handlerDblLeftClick = new ScreenSpaceEventHandler(viewer.scene.canvas);
            that._handlerMove = new ScreenSpaceEventHandler(viewer.scene.canvas);

            var arrayRadians = [];
            var oldPolyLine;
            
            that._handlerLeftClick.setInputAction(function (click) {
                that._undoIsactivated = false;
                 var newPolyLine;
                
                var ellipsoid = viewer.scene.globe.ellipsoid;
                var cartesian = viewer.scene.camera.pickEllipsoid(click.position, ellipsoid);
                
                if (cartesian && targetMouse === "[object HTMLCanvasElement]") {
                    var cartographic = ellipsoid.cartesianToCartographic(cartesian);
                    
                  //  console.log(arrayRadians);
                    
                 //   arrayRadians.push(cartographic.longitude);
                 //   arrayRadians.push(cartographic.latitude);
                    
                    if (!that._undoIsactivated){        
                        arrayRadians.push(cartographic.longitude);
                        arrayRadians.push(cartographic.latitude);
                    }
                    
                 //   console.log(arrayRadians);
                    
                    that._handlerMove.setInputAction(function (mouvement) {

                        var cartesianMovePosition = viewer.scene.camera.pickEllipsoid(mouvement.endPosition, ellipsoid);  
                        
                        if (cartesianMovePosition && targetMouse === "[object HTMLCanvasElement]") {
                            
                                   var cartographicMovePosition = ellipsoid.cartesianToCartographic(cartesianMovePosition);

                                   if (arrayRadians[2] && arrayRadians[3]){
                                       arrayRadians[2] = cartographicMovePosition.longitude;
                                       arrayRadians[3] = cartographicMovePosition.latitude;        
                                   } else {
                                       arrayRadians.push(cartographicMovePosition.longitude);
                                       arrayRadians.push(cartographicMovePosition.latitude);
                                   }
                        }
 
                    if (arrayRadians.length === 4) {

                        newPolyLine = {
                            positions: PolylinePipeline.generateCartesianArc({
                                positions: Cartesian3.fromRadiansArray(arrayRadians, ellipsoid),
                                ellipsoid: ellipsoid
                            }),
                            material : Material.fromType('Color', {
                                color : Color.YELLOW
                            })
                        };

                        polyLines.add(newPolyLine);

                        var dim = viewer.scene.primitives._primitives[0]._polylines.length;

                        if (dim > 1) {
                               var polyline = viewer.scene.primitives._primitives[0]._polylines[dim - 2];
                               polyLines.remove(polyline);
                        }
                    
                   //     console.log(arrayRadians);   
                        
                        if (!that._undoIsactivated){ 
                            arrayRadians = [];
                            arrayRadians.push(cartographic.longitude);
                            arrayRadians.push(cartographic.latitude);
                        } else {
                            arrayRadians = [];
                            arrayRadians.push(that._coordFirstPosition.longitude);
                            arrayRadians.push(that._coordFirstPosition.latitude);
                        }
                    };
                    
                },  ScreenSpaceEventType.MOUSE_MOVE);

                 polyLines.add(newPolyLine);
                }

            }, ScreenSpaceEventType.LEFT_CLICK);

            that._handlerMiddleClick.setInputAction(function () {
                
                 arrayRadians = [];
                 var dim = viewer.scene.primitives._primitives[0]._polylines.length;
                 var polyline = viewer.scene.primitives._primitives[0]._polylines[dim-1];
                 polyLines.remove(polyline);

             //  console.log(viewer.scene.primitives._primitives[0]);

                that._handlerMove.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);
                that._handlerMove      =  new ScreenSpaceEventHandler(viewer.scene.canvas);
                
                 

            }, ScreenSpaceEventType.MIDDLE_CLICK);

            that._handlerRightClick.setInputAction(function (click) {
                that._undoIsactivated = true;
                var dim = viewer.scene.primitives._primitives[0]._polylines.length;

                if (dim > 1) {

                    var polyline = viewer.scene.primitives._primitives[0]._polylines[dim - 1];
                    
                    console.log(viewer.scene.primitives._primitives[0]._polylines);
                    
                    var beforeLastPolyline = viewer.scene.primitives._primitives[0]._polylines[dim - 2];
                    var cartesianPosition = beforeLastPolyline._actualPositions[0];
                    that._coordFirstPosition = viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesianPosition);
 
                    arrayRadians = [];
                    arrayRadians.push(that._coordFirstPosition.longitude);
                    arrayRadians.push(that._coordFirstPosition.latitude);
                    
                    
                    polyLines.remove(polyline);
                    
                    //  console.log(arrayRadians);

                } else if (dim == 1) {

                    var polyline = viewer.scene.primitives._primitives[0]._polylines[dim - 1];
                    polyLines.remove(polyline);
                    arrayRadians = [];

                } else if (dim == 0) {

                    arrayRadians = [];

                }
            }, ScreenSpaceEventType.RIGHT_CLICK);

            that._isPolyLineActive = false; // to prevent servral instance of the same Handlers
        }
    }


    function drawCircleFunction(that, viewer, ellipsoid, circlesLabels) {


        // use that to check if we are on the canvas or not (for example, on a button);
        document.onmousemove = getPosition;

        if (that._isCircleActive) {

            that._handlerLeftClickCircle = new ScreenSpaceEventHandler(viewer.scene.canvas);
            that._handlerRightClickCircle = new ScreenSpaceEventHandler(viewer.scene.canvas);
            that._handlerLeftDblClickCircle = new ScreenSpaceEventHandler(viewer.scene.canvas);
            that._handlerMouseMoveCircle = new ScreenSpaceEventHandler(viewer.scene.canvas);

            var circleRadius;
            var cartesianCartographicCircleCenter;
            var newPrim;


            that._handlerLeftClickCircle.setInputAction(function (click) {
                var oldPrim = null;
              //  var oldPrimFill = null;
              //  var oldLabel = null;
                
                var ellipsoid = viewer.scene.globe.ellipsoid;

                var cursorCircleCenter = click.position;
                var cartesianCircleCenter = viewer.scene.camera.pickEllipsoid(cursorCircleCenter, ellipsoid);

              //  var circleRadius;
               // var newPrim;

               // 275.484,39.095

                if (cartesianCircleCenter && targetMouse === "[object HTMLCanvasElement]") {
                    var cartographicCircleCenter = ellipsoid.cartesianToCartographic(cartesianCircleCenter);
                    cartesianCartographicCircleCenter = Cartesian3.fromRadians(cartographicCircleCenter.longitude, cartographicCircleCenter.latitude, cartographicCircleCenter.height, ellipsoid);

                    console.log(cartesianCartographicCircleCenter.x);

                    that._handlerMouseMoveCircle.setInputAction(function (mouvement) {

                        var cursorMovePosition = mouvement.endPosition;
                        var cartesianMovePosition = viewer.scene.camera.pickEllipsoid(cursorMovePosition, ellipsoid);

                        if (cartesianMovePosition) {
                            var cartographicMovePosition = ellipsoid.cartesianToCartographic(cartesianMovePosition);
                            var cartesianCartographicMovePosition = Cartesian3.fromRadians(cartographicMovePosition.longitude, cartographicMovePosition.latitude, cartographicMovePosition.height, ellipsoid);

                            var deltaX = Cartesian3.distance(cartesianCartographicMovePosition, cartesianCartographicCircleCenter);

                            circleRadius = deltaX;

                            var circleOutlineGeometry = new CircleOutlineGeometry({
                                center: cartesianCartographicCircleCenter,
                                radius: circleRadius,
                                ellipsoid: ellipsoid
                            });

                            var circleOutlineInstance = new GeometryInstance({
                                geometry: circleOutlineGeometry,
                                attributes: {color: ColorGeometryInstanceAttribute.fromColor(Color.YELLOW)}
                            });

                            newPrim = new Primitive({
                                geometryInstances: [circleOutlineInstance],
                                primitiveType: "circle",
                                appearance: new PerInstanceColorAppearance({
                                    flat: true,
                                    renderState: {lineWidth: Math.min(1.0, viewer.scene.maximumAliasedLineWidth)}
                                })
                            });

                         /*   var circleGeometry = new CircleGeometry({
                                center: cartesianCartographicCircleCenter,
                                radius: circleRadius,
                                ellipsoid: ellipsoid,
                                vertexFormat: PerInstanceColorAppearance.VERTEX_FORMAT
                            });

                            var redCircleInstance = new GeometryInstance({
                                geometry: circleGeometry,
                                attributes: {color: ColorGeometryInstanceAttribute.fromColor(new Color(1.0, 1.0, 0.0, 0.5))}
                            });

                            var newPrimFill = new Primitive({
                                geometryInstances: [redCircleInstance],
                                primitiveType: "circle",
                                appearance: new PerInstanceColorAppearance({closed: true})
                            });*/

                          /*  if (oldPrim && oldPrimFill) {
                                viewer.scene.primitives.remove(oldPrim);
                                viewer.scene.primitives.remove(oldPrimFill);
                             //   circlesLabels.remove(oldLabel);
                            }*/
                            
                             if (oldPrim) {
                                viewer.scene.primitives.remove(oldPrim);
                            }
                            

                            viewer.scene.primitives.add(newPrim);
                           // viewer.scene.primitives.add(newPrimFill);
                          /*  circlesLabels.add(newLabel);*/

                            oldPrim = newPrim;
                           // oldPrimFill = newPrimFill;
                           // oldLabel = newLabel;
                            
                         //   console.log(viewer.scene.primitives);
                          //  console.log(newPrim);
                        }
                    }, ScreenSpaceEventType.MOUSE_MOVE);
                }

                that._handlerLeftDblClickCircle.setInputAction(function () {
                    if (that._handlerMouseMoveCircle) that._handlerMouseMoveCircle.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);
                    
                    var radCircle =  circleRadius.toFixed(2);
                    
                    console.log(circleRadius);
                    console.log(cartesianCartographicCircleCenter.x);
                    
                    var cartesianCircleCenter = newPrim._boundingSphereWC[0].center;
                    
                    
                    var circleGeometry = new CircleGeometry({
                                center: cartesianCircleCenter,
                                radius: circleRadius,
                                ellipsoid: ellipsoid,
                                vertexFormat: PerInstanceColorAppearance.VERTEX_FORMAT
                            });

                            var redCircleInstance = new GeometryInstance({
                                geometry: circleGeometry,
                                attributes: {color: ColorGeometryInstanceAttribute.fromColor(new Color(1.0, 1.0, 0.0, 0.5))}
                            });

                            var newPrimFill = new Primitive({
                                geometryInstances: [redCircleInstance],
                                primitiveType: "circle",
                                appearance: new PerInstanceColorAppearance({closed: true})
                            });
                    
                    
                    
                     var newLabel ={
                                  position     : cartesianCircleCenter,
                                  text         : 'R = ' + radCircle + ' m',
                                  scale        : 0.5,
                                  fillColor    : Color.WHITE,
                                  outlineColor : Color.BLACK,
                                  style        : LabelStyle.FILL,
                                  horizontalOrigin : HorizontalOrigin.CENTER,
                                  verticalOrigin   : VerticalOrigin.CENTER,
                                 };
                    
                    circlesLabels.add(newLabel);
                    viewer.scene.primitives.add(newPrimFill)
                    

                }, ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

            }, ScreenSpaceEventType.LEFT_CLICK);


            that._handlerRightClickCircle.setInputAction(function (click) {

                if (that._handlerMouseMoveCircle) that._handlerMouseMoveCircle.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);
                that._handlerMouseMoveCircle = new ScreenSpaceEventHandler(viewer.scene.canvas);


                var dim = viewer.scene.primitives._primitives.length;
                var continueWhile = true;

                if (dim > 1) {

                    while (continueWhile) {
                        
                        console.log(viewer.scene.primitives);
                        
                        var primitiveObject1 = viewer.scene.primitives._primitives[dim - 1];
                        var primitiveObject2 = viewer.scene.primitives._primitives[dim - 2];

                        if (primitiveObject1.primitiveType === "circle" && primitiveObject2.primitiveType === "circle") {
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

            that._isCircleActive = false; // to prevent servral instance of the same Handlers
        }
    }



    /**
     * The view model for {@link subMenu}.
     * @alias SubMenuViewModel
     * @constructor
     */
    var SubMenuViewModel = function (viewer) {

        // A MODIFIER :  si on souhaite charger un fichier de polyLines il faut etre capable de recuperer la collection de polyLines chagree

        var polyLines;
        var primitives = viewer.scene.primitives._primitives;

        if (primitives.length == 0) {
            polyLines = viewer.scene.primitives.add(new PolylineCollection());
        } else if (primitives.length > 0) {
            for (var i = 0; i < primitives.length; i++) {
                if (primitives[i]._polylines) {
                    polyLines = primitives[i];
                    break;
                } else {
                    polyLines = viewer.scene.primitives.add(new PolylineCollection());
                }
            }
            ;
        }

        var ellipsoid = viewer.scene.globe.ellipsoid;
        var circlesLabels = viewer.scene.primitives.add(new LabelCollection());
        
        this._viewer = viewer;
        this._polyLines = polyLines;
        this._circlesLabels = circlesLabels;
        this._ellipsoid = ellipsoid;
        this._isPolyLineActive = false;
        this._isCircleActive = false;
        this._undoIsactivated = false;

        var that = this;

        this._drawCommand = createCommand(function () {
            that._isPolyLineActive = true;
            that._isCircleActive = false;
            removeHandlers(that);
            drawLinesFunction(that, that._viewer, that._polyLines);
        });

        this._circleCommand = createCommand(function () {
            that._isPolyLineActive = false;
            that._isCircleActive = true;
            removeHandlers(that);
            drawCircleFunction(that, that._viewer, that._ellipsoid,  that._circlesLabels);
        });

        this._cutCommand = createCommand(function () {

        });

        this._trashCommand = createCommand(function () {
            var primitives = viewer.scene.primitives;
            primitives.removeAll();
            that._polyLines = viewer.scene.primitives.add(new PolylineCollection());
            removeHandlers(that);
        });

        this._saveCommand = createCommand(function () {

        });

        this._closeSubMenu = createCommand(function () {
            try {
                that._viewer.drawLines.viewModel.subMenu.destroyWrapperMenu;
                that.removeAllCommands;
            } catch (e) {
            }
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

        drawCommand: {
            get: function () {
                return this._drawCommand;
            }
        },
        cutCommand: {
            get: function () {
                return this._cutCommand;
            }
        },
        circleCommand: {
            get: function () {
                return this._circleCommand;
            }
        },
        trashCommand: {
            get: function () {
                return this._trashCommand;
            }
        },
        saveCommand: {
            get: function () {
                return this._saveCommand;
            }
        },
        closeSubMenu: {
            get: function () {
                return this._closeSubMenu;
            }
        },
        removeAllCommands: {
            get: function () {
                this._isPolyLineActive = false;
                this._isCircleActive = false;

                if (this._handlerLeftClick)    this._handlerLeftClick.removeInputAction(ScreenSpaceEventType.LEFT_CLICK);
                if (this._handlerMiddleClick)  this._handlerMiddleClick.removeInputAction(ScreenSpaceEventType.MIDDLE_CLICK);
                if (this._handlerRightClick)   this._handlerRightClick.removeInputAction(ScreenSpaceEventType.RIGHT_CLICK);
                if (this._handlerDblLeftClick) this._handlerDblLeftClick.removeInputAction(ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

                if (this._handlerLeftClickCircle)    this._handlerLeftClickCircle.removeInputAction(ScreenSpaceEventType.LEFT_CLICK);
                if (this._handlerRightClickCircle)   this._handlerRightClickCircle.removeInputAction(ScreenSpaceEventType.RIGHT_CLICK);
                if (this._handlerLeftDblClickCircle) this._handlerLeftDblClickCircle.removeInputAction(ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
                if (this._handlerMouseMoveCircle)    this._handlerMouseMoveCircle.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);
            }
        },
        removeAllHandlers: {
            get: function () {

                console.log('all handlers remeved');

                if (this._handlerLeftClick)   this._handlerLeftClick.removeInputAction(ScreenSpaceEventType.LEFT_CLICK);
                if (this._handlerMiddleClick) this._handlerMiddleClick.removeInputAction(ScreenSpaceEventType.MIDDLE_CLICK);
                if (this._handlerRightClick)  this._handlerRightClick.removeInputAction(ScreenSpaceEventType.RIGHT_CLICK);
                if (this._handlerDblLeftClick) this._handlerDblLeftClick.removeInputAction(ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

                if (this._handlerLeftClickCircle)    this._handlerLeftClickCircle.removeInputAction(ScreenSpaceEventType.LEFT_CLICK);
                if (this._handlerRightClickCircle)   this._handlerRightClickCircle.removeInputAction(ScreenSpaceEventType.RIGHT_CLICK);
                if (this._handlerLeftDblClickCircle) this._handlerLeftDblClickCircle.removeInputAction(ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
                if (this._handlerMouseMoveCircle)    this._handlerMouseMoveCircle.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);
            }
        },
    });

// ================================================================================================================================
// ======================================================= LOCAL FUNCTIONS ========================================================
// ================================================================================================================================

    function removeHandlers(that) {

        console.log('all handlers remeved');

        if (that._handlerLeftClick)    that._handlerLeftClick.removeInputAction(ScreenSpaceEventType.LEFT_CLICK);
        if (that._handlerMiddleClick)  that._handlerMiddleClick.removeInputAction(ScreenSpaceEventType.MIDDLE_CLICK);
        if (that._handlerRightClick)   that._handlerRightClick.removeInputAction(ScreenSpaceEventType.RIGHT_CLICK);
        if (that._handlerDblLeftClick) that._handlerDblLeftClick.removeInputAction(ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

        if (that._handlerLeftClickCircle)    that._handlerLeftClickCircle.removeInputAction(ScreenSpaceEventType.LEFT_CLICK);
        if (that._handlerRightClickCircle)   that._handlerRightClickCircle.removeInputAction(ScreenSpaceEventType.RIGHT_CLICK);
        if (that._handlerLeftDblClickCircle) that._handlerLeftDblClickCircle.removeInputAction(ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        if (that._handlerMouseMoveCircle)    that._handlerMouseMoveCircle.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);
    }

    function getPosition(e) {
        e = e || window.event;

        targetMouse = e.target.toString();

        /*console.log(targetMouse);
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
