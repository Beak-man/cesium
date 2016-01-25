// 275.484,39.095 ==> Coordonnees du stade
// 256.955,42.127 ==> coordonnées des cercles de cultures

/*global define*/
define([
    '../../../Core/Math',
    '../../../Core/Cartesian2',
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
    '../../../Scene/HeightReference',
    '../../../Scene/HorizontalOrigin',
    '../../../Scene/LabelCollection',
    '../../../Scene/LabelStyle',
    '../../../Scene/Material',
    '../../../Core/NearFarScalar',
    '../../../Scene/PolylineCollection',
    '../../../Core/PolylinePipeline',
    '../../../Scene/PerInstanceColorAppearance',
    '../../../Scene/Primitive',
    '../../../Scene/PrimitiveCollection',
    '../../../Core/ScreenSpaceEventHandler',
    '../../../Core/ScreenSpaceEventType',
    '../../../Core/SimplePolylineGeometry',
    '../../../Scene/VerticalOrigin',
], function (
        CesiumMath,
        Cartesian2,
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
        HeightReference,
        HorizontalOrigin,
        LabelCollection,
        LabelStyle,
        Material,
        NearFarScalar,
        PolylineCollection,
        PolylinePipeline,
        PerInstanceColorAppearance,
        Primitive,
        PrimitiveCollection,
        ScreenSpaceEventHandler,
        ScreenSpaceEventType,
        SimplePolylineGeometry,
        VerticalOrigin
        ) {
    "use strict";

    var targetMouse;

    function drawLinesFunction(that, viewer, polyLines, polyLinesLabels) {

        document.onmousemove = getPosition;

        if (that._isPolyLineActive) {

            that._handlerLeftClick = new ScreenSpaceEventHandler(viewer.scene.canvas);
            that._handlerMiddleClick = new ScreenSpaceEventHandler(viewer.scene.canvas);
            that._handlerRightClick = new ScreenSpaceEventHandler(viewer.scene.canvas);
            that._handlerDblLeftClick = new ScreenSpaceEventHandler(viewer.scene.canvas);
            that._handlerMove = new ScreenSpaceEventHandler(viewer.scene.canvas);

            var arrayRadians = [];
            var middlePoint = {};
            var oldLabel;

            that._handlerLeftClick.setInputAction(function (click) {
                that._undoIsactivated = false;
                var newPolyLine;

                var ellipsoid = viewer.scene.globe.ellipsoid;
                var cartesian = viewer.scene.camera.pickEllipsoid(click.position, ellipsoid);

                if (cartesian && targetMouse === "[object HTMLCanvasElement]") {
                    var cartographic = ellipsoid.cartesianToCartographic(cartesian);

                    if (!that._undoIsactivated) {
                        arrayRadians.push(cartographic.longitude);
                        arrayRadians.push(cartographic.latitude);
                    }

                    that._handlerMove.setInputAction(function (mouvement) {

                        var cartesianMovePosition = viewer.scene.camera.pickEllipsoid(mouvement.endPosition, ellipsoid);

                        if (cartesianMovePosition && targetMouse === "[object HTMLCanvasElement]") {

                            var cartographicMovePosition = ellipsoid.cartesianToCartographic(cartesianMovePosition);

                            if (arrayRadians[2] && arrayRadians[3]) {
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
                                material: Material.fromType('Color', {
                                    color: Color.YELLOW
                                })
                            };

                            var startPoint = Cartesian3.fromRadians(arrayRadians[0], arrayRadians[1], cartographic.height, ellipsoid);
                            var endPoint = Cartesian3.fromRadians(arrayRadians[2], arrayRadians[3], cartographicMovePosition.height, ellipsoid);
                            var distance = Cartesian3.distance(endPoint, startPoint);
                            var distanceTrunc = distance.toFixed(2);
                            
                        /*    middlePoint = {
                                x : (cartesianMovePosition.x + cartesian.x)/2.0,
                                y : (cartesianMovePosition.y + cartesian.y)/2.0,
                                z : (cartesianMovePosition.z + cartesian.z)/2.0,
                            }*/
                            

                            var newLabelPolyline = {
                                position: cartesianMovePosition,
                                text: 'D = ' + distanceTrunc + ' m',
                                scale: 0.3,
                                font: '50px arial',
                                fillColor: Color.WHITE,
                                outlineColor: Color.BLACK,
                                style: LabelStyle.FILL,
                                horizontalOrigin: HorizontalOrigin.LEFT,
                                verticalOrigin: VerticalOrigin.BOTTOM,
                                translucencyByDistance: new NearFarScalar(8.0e6, 1.0, 8.0e7, 0.0)
                            };

                            polyLines.add(newPolyLine);

                            var dim = polyLines._polylines.length;

                            if (dim > 1) {
                                var polyline = polyLines._polylines[dim - 2];
                                polyLines.remove(polyline);
                            }

                            if (oldLabel) {
                                var dimLabel = polyLinesLabels._labels.length;
                                var primitiveLabel = polyLinesLabels._labels[dimLabel - 1];
                                polyLinesLabels.remove(primitiveLabel);
                            }

                            polyLinesLabels.add(newLabelPolyline);

                            if (!that._undoIsactivated) {
                                arrayRadians = [];
                                arrayRadians.push(cartographic.longitude);
                                arrayRadians.push(cartographic.latitude);
                            } else {
                                arrayRadians = [];
                                arrayRadians.push(that._coordFirstPosition.longitude);
                                arrayRadians.push(that._coordFirstPosition.latitude);
                            }

                            oldLabel = newLabelPolyline;

                        };

                    }, ScreenSpaceEventType.MOUSE_MOVE);

                    polyLines.add(newPolyLine);        
                    polyLinesLabels.add(oldLabel);
                }

            }, ScreenSpaceEventType.LEFT_CLICK);

            that._handlerMiddleClick.setInputAction(function () {

                arrayRadians = [];

                var dim = polyLines._polylines.length;
                var dimLabel = polyLinesLabels._labels.length;

                var polyline = polyLines._polylines[dim - 1];
                var polylineLabel = polyLinesLabels._labels[dimLabel - 1];
                
                polyLines.remove(polyline);
                polyLinesLabels.remove(polylineLabel);

                that._handlerMove.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);
                that._handlerMove = new ScreenSpaceEventHandler(viewer.scene.canvas);

                var dimSegment = polyLines._polylines.length;

                var smumDistance = 0;

                for (var j = 0; j < dimSegment - 1; j++) {
                    var dimSeg = polyLines._polylines[j]._actualPositions.length;
                    var posStart = polyLines._polylines[j]._actualPositions[0];
                    var posEnd = polyLines._polylines[j]._actualPositions[dimSeg - 1];

                    smumDistance = smumDistance + Cartesian3.distance(posEnd, posStart);
                }

                var smumDistanceTrunc = smumDistance.toFixed(2);
                var beforeLastpolylineLabel = polyLinesLabels._labels[dimLabel - 2];
                
                var finalLabelPolylinePosition = {
                    x : beforeLastpolylineLabel._position.x,
                    y : beforeLastpolylineLabel._position.y - 50,
                    z : beforeLastpolylineLabel._position.z
                }

                var finalLabelPolyline = {
                    position: finalLabelPolylinePosition,
                    text: 'T = ' + smumDistanceTrunc + ' m',
                    scale: 0.3,
                    font: '50px arial',
                    fillColor: Color.RED,
                    outlineColor: Color.BLACK,
                    style: LabelStyle.FILL,
                    horizontalOrigin: HorizontalOrigin.CENTER,
                    verticalOrigin: VerticalOrigin.TOP,
                    translucencyByDistance: new NearFarScalar(8.0e6, 1.0, 8.0e7, 0.0),
                };

                 polyLinesLabels.add(finalLabelPolyline);

                polyLines = viewer.scene.primitives.add(new PolylineCollection());
                polyLines.associatedObject = 'polylines';

                polyLinesLabels = that._viewer.scene.primitives.add(new LabelCollection());
                polyLinesLabels.associatedObject = 'polyLinesLabels';

            }, ScreenSpaceEventType.MIDDLE_CLICK);

            that._handlerRightClick.setInputAction(function () {

                that._undoIsactivated = true;
                var dim = polyLines._polylines.length;
                var dimLabel = polyLinesLabels._labels.length;

                if (dim > 1) {

                    var polyline = polyLines._polylines[dim - 1];
                    var polylineLabel = polyLinesLabels._labels[dimLabel - 1];

                    var beforeLastPolyline = polyLines._polylines[dim - 2];
                    var cartesianPosition = beforeLastPolyline._actualPositions[0];
                    that._coordFirstPosition = viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesianPosition);

                    arrayRadians = [];
                    arrayRadians.push(that._coordFirstPosition.longitude);
                    arrayRadians.push(that._coordFirstPosition.latitude);

                    polyLines.remove(polyline);
                    polyLinesLabels.remove(polylineLabel);

                    //  console.log(polyLines);

                } else if (dim == 1) {

                    var polyline = polyLines._polylines[dim - 1];
                    var polylineLabel = polyLinesLabels._labels[dimLabel - 1];
                    polyLines.remove(polyline);
                    polyLinesLabels.remove(polylineLabel);

                    that._handlerMove.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);
                    that._handlerMove = new ScreenSpaceEventHandler(viewer.scene.canvas);

                    arrayRadians = [];

                } else if (dim == 0) {

                    arrayRadians = [];

                }
            }, ScreenSpaceEventType.RIGHT_CLICK);

            that._isPolyLineActive = false; // to prevent servral instance of the same Handlers
        }
    }

    function drawCircleFunction(that, viewer, ellipsoid, circleCollection, circlesLabels) {

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
                var oldLabel = null;

                var cursorCircleCenter = click.position;
                var cartesianCircleCenter = viewer.scene.camera.pickEllipsoid(cursorCircleCenter, ellipsoid);

                if (cartesianCircleCenter && targetMouse === "[object HTMLCanvasElement]") {
                    var cartographicCircleCenter = ellipsoid.cartesianToCartographic(cartesianCircleCenter);
                    cartesianCartographicCircleCenter = Cartesian3.fromRadians(cartographicCircleCenter.longitude, cartographicCircleCenter.latitude, cartographicCircleCenter.height, ellipsoid);

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

                            var radCircle = circleRadius.toFixed(2);

                            var newLabel = {
                                position: cartesianCircleCenter,
                                text: 'R = ' + radCircle + ' m',
                                scale: 0.3,
                                font: '50px arial',
                                fillColor: Color.WHITE,
                                outlineColor: Color.BLACK,
                                style: LabelStyle.FILL,
                                horizontalOrigin: HorizontalOrigin.CENTER,
                                verticalOrigin: VerticalOrigin.CENTER,
                                translucencyByDistance: new NearFarScalar(8.0e6, 1.0, 8.0e7, 0.0)
                            };

                            if (oldPrim && oldLabel) {
                                circleCollection.remove(oldPrim);
                                var dimLabel = circlesLabels._labels.length;
                                var primitiveLabel = circlesLabels._labels[dimLabel - 1];
                                circlesLabels.remove(primitiveLabel);
                            }

                            circleCollection.add(newPrim);

                            circlesLabels.add(newLabel);

                            oldPrim = newPrim;
                            oldLabel = newLabel;
                        }
                    }, ScreenSpaceEventType.MOUSE_MOVE);
                }

                that._handlerLeftDblClickCircle.setInputAction(function () {
                    if (that._handlerMouseMoveCircle)
                        that._handlerMouseMoveCircle.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);

                    var cartesianCircleCenter = newPrim._boundingSphereWC[0].center;

                    var circleGeometry = new CircleGeometry({
                        center: cartesianCircleCenter,
                        radius: circleRadius,
                        ellipsoid: ellipsoid,
                        vertexFormat: PerInstanceColorAppearance.VERTEX_FORMAT
                    });

                    var circleInstance = new GeometryInstance({
                        geometry: circleGeometry,
                        attributes: {color: ColorGeometryInstanceAttribute.fromColor(new Color(1.0, 1.0, 0.0, 0.3))}
                    });

                    var newPrimFill = new Primitive({
                        geometryInstances: [circleInstance],
                        primitiveType: "circle",
                        appearance: new PerInstanceColorAppearance({closed: true})
                    });

                    circleCollection.remove(newPrim);
                    circleCollection.add(newPrimFill)

                }, ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

            }, ScreenSpaceEventType.LEFT_CLICK);

            that._handlerRightClickCircle.setInputAction(function (click) {

                if (that._handlerMouseMoveCircle)
                    that._handlerMouseMoveCircle.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);

                that._handlerMouseMoveCircle = new ScreenSpaceEventHandler(viewer.scene.canvas);

                var dim = circleCollection._primitives.length;
                var dimLabel = circlesLabels._labels.length;

                var continueWhile = true;

                if (dim >= 1) {

                    while (continueWhile) {

                        try {
                            var primitiveObject1 = circleCollection._primitives[dim - 1];
                            var primitiveLabel1  = circlesLabels._labels[dimLabel - 1];

                            if (primitiveObject1.primitiveType === "circle") {
                                try {

                                    circleCollection.remove(primitiveObject1);
                                    circlesLabels.remove(primitiveLabel1);

                                } catch (e) {
                                }
                                continueWhile = false;
                            } else {
                                if (dim == 0) {
                                    continueWhile = false;
                                }
                                else {
                                    dim--;
                                }
                            }
                        } catch (e) {
                        }
                    }
                }
            }, ScreenSpaceEventType.RIGHT_CLICK);

            that._isCircleActive = false; // to prevent servral instance of the same Handlers
        }
    }
    
    
    
    function saveData(that){
        
        
        var primitives = that._viewer.scene.primitives._primitives;
        var geoJsonObject = {};
        geoJsonObject.features = [];

        
        for (var i = 0; i<primitives.length; i++){ 
            
            if (primitives[i].associatedObject === "polylines"){
                
                var geoJsonPolyline = {};
                geoJsonPolyline.type = "MultiLineString";
                geoJsonPolyline.coordinates = [];
                
                var polylines = primitives[i]._polylines;
                
                if (polylines.length > 0){
                
                    for (var j=0; j<polylines.length; j++){

                        var positions     = polylines[j]._positions;

                        var firstPosition = positions[0];
                        var lastPosition  = positions[positions.length - 1];

                        var cartographicFirstPosition = that._ellipsoid.cartesianToCartographic(firstPosition);
                        var cartographicLastPosition  = that._ellipsoid.cartesianToCartographic(lastPosition);

                        var firstPositionLng =  CesiumMath.toDegrees(cartographicFirstPosition.longitude);
                        var firstPositionLat =  CesiumMath.toDegrees(cartographicLastPosition.latitude);
                        var lastPositionLng  =  CesiumMath.toDegrees(cartographicLastPosition.longitude);
                        var lastPositionLat  =  CesiumMath.toDegrees(cartographicLastPosition.latitude);

                        var line = [[firstPositionLng, firstPositionLat], [lastPositionLng, lastPositionLat]];

                        geoJsonPolyline.coordinates.push(line);
                    }

                    geoJsonObject.features.push(geoJsonPolyline);
                
                }
                
            }
            
        }

        
        
          console.log(geoJsonObject);
        
        
    }
    /**
     * The view model for {@link subMenu}.
     * @alias SubMenuViewModel
     * @constructor
     */
    var SubMenuViewModel = function (viewer) {

        this._viewer = viewer;
        this._ellipsoid = viewer.scene.globe.ellipsoid;
        this._isPolyLineActive = false;
        this._isCircleActive = false;
        this._undoIsactivated = false;

        var that = this;
        var collectionsObjects = collectionsInitialization(that);

        this._drawCommand = createCommand(function () {
            that._isPolyLineActive = true;
            that._isCircleActive = false;
            removeHandlers(that);

            console.log(that._viewer.infoBox.viewModel.showInfo);

            drawLinesFunction(that, that._viewer, that._polyLinesCollection, that._polyLinesLabelsCollection);
        });

        this._circleCommand = createCommand(function () {
            that._isPolyLineActive = false;
            that._isCircleActive = true;
            removeHandlers(that);
            drawCircleFunction(that, that._viewer, that._ellipsoid, that._circleCollection, that._circlesLabelsCollection);
        });

        this._trashCommand = createCommand(function () {
            that._viewer.scene.primitives.removeAll();

            removeHandlers(that);
            var collection = collectionsInitialization(that);

         //   console.log(that._viewer.scene.primitives);
        });

        this._polygonCommand = createCommand(function () {
            console.log("I'd like to draw a polygon");
        });


        this._saveCommand = createCommand(function () {
            console.log("I'd like to save my data");
            console.log(that._viewer.scene.primitives);
            
            saveData(that);
            
        });

        this._closeSubMenu = createCommand(function () {
            try {

                // AJOUTER LA SUPPRESSION DES DONNEES LORSQUE L'ON CHANGE DE PLANETE

                removeHandlers(that);
                that._viewer.drawLines.viewModel.subMenu.destroyWrapperMenu;
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
        circleCommand: {
            get: function () {
                return this._circleCommand;
            }
        },
        polygonCommand: {
            get: function () {
                return this._polygonCommand;
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

                if (this._handlerLeftClick) this._handlerLeftClick.removeInputAction(ScreenSpaceEventType.LEFT_CLICK);
                if (this._handlerMiddleClick) this._handlerMiddleClick.removeInputAction(ScreenSpaceEventType.MIDDLE_CLICK);
                if (this._handlerRightClick) this._handlerRightClick.removeInputAction(ScreenSpaceEventType.RIGHT_CLICK);
                if (this._handlerDblLeftClick) this._handlerDblLeftClick.removeInputAction(ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
                if (this._handlerMove) this._handlerMove.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);

                if (this._handlerLeftClickCircle) this._handlerLeftClickCircle.removeInputAction(ScreenSpaceEventType.LEFT_CLICK);
                if (this._handlerRightClickCircle) this._handlerRightClickCircle.removeInputAction(ScreenSpaceEventType.RIGHT_CLICK);
                if (this._handlerLeftDblClickCircle) this._handlerLeftDblClickCircle.removeInputAction(ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
                if (this._handlerMouseMoveCircle) this._handlerMouseMoveCircle.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);
            }
        },
        removeAllHandlers: {
            get: function () {

                // console.log('all handlers remeved');

                if (this._handlerLeftClick) this._handlerLeftClick.removeInputAction(ScreenSpaceEventType.LEFT_CLICK);
                if (this._handlerMiddleClick) this._handlerMiddleClick.removeInputAction(ScreenSpaceEventType.MIDDLE_CLICK);
                if (this._handlerRightClick)  this._handlerRightClick.removeInputAction(ScreenSpaceEventType.RIGHT_CLICK);
                if (this._handlerDblLeftClick) this._handlerDblLeftClick.removeInputAction(ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
                if (this._handlerMove) this._handlerMove.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);
                
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

    function collectionsInitialization(that) {

        var polyLines;
        var circles;
        var circlesLabels;
        var polyLinesLabels;

        var primitives = that._viewer.scene.primitives._primitives;

        if (primitives.length === 0) {

            polyLines = that._viewer.scene.primitives.add(new PolylineCollection());
            polyLinesLabels = that._viewer.scene.primitives.add(new LabelCollection());
            circles = that._viewer.scene.primitives.add(new PrimitiveCollection());
            circlesLabels = that._viewer.scene.primitives.add(new LabelCollection());

            circles.associatedObject = 'circleGeomtry';
            circlesLabels.associatedObject = 'circlesLabels';
            polyLines.associatedObject = 'polylines';
            polyLinesLabels.associatedObject = 'polyLinesLabels';

         //   console.log(that._viewer.scene.primitives)

        } else if (primitives.length > 0) {

            var statusFindpolyLines = false;
            var statusFindcircle = false;
            var statusFindCirclesLabels = false;
            var statusFindpolyLinesLabels = false;

            for (var i = 0; i < primitives.length; i++) {

                if (primitives[i]._polylines) {

                    polyLines = primitives[i];
                    statusFindpolyLines = true;
                    continue;
                }

                if (primitives[i].associatedObject === 'circleGeomtry') {

                    circles = primitives[i];
                    statusFindcircle = true;
                    continue;
                }

                if (primitives[i]._labels) {

                    if (primitives[i].associatedObject === "circlesLabels") {
                        circlesLabels = primitives[i];
                        statusFindCirclesLabels = true;
                        continue;
                    };

                    if (primitives[i].associatedObject === "polyLinesLabels") {
                        polyLinesLabels = primitives[i];
                        statusFindpolyLinesLabels = true;
                        continue;
                    }
                };

                if (statusFindpolyLines && statusFindCirclesLabels && statusFindpolyLinesLabels && statusFindcircle)
                    break;

                if (i === primitives.length - 1 && !statusFindpolyLines || !statusFindCirclesLabels || !statusFindpolyLinesLabels || !statusFindcircle) {

                    if (!statusFindpolyLines) {
                        polyLines = that._viewer.scene.primitives.add(new PolylineCollection());
                        polyLines.associatedObject = 'polylines';
                    };

                    if (!statusFindpolyLinesLabels) {
                        polyLinesLabels = that._viewer.scene.primitives.add(new LabelCollection());
                        polyLinesLabels.associatedObject = 'polyLinesLabels';
                    };

                    if (!statusFindcircle) {
                        circles = that._viewer.scene.primitives.add(new PrimitiveCollection());
                        circles.associatedObject = 'circleGeomtry';
                    };

                    if (!statusFindCirclesLabels) {
                        circlesLabels = that._viewer.scene.primitives.add(new LabelCollection());
                        circlesLabels.associatedObject = 'circlesLabels';
                    };

                }
            };
        };

        var collectionsObject = {
            polylines: polyLines,
            circleLabels: circlesLabels,
            polylinesLables: polyLinesLabels,
            circles: circles
        };

        that._polyLinesCollection = collectionsObject.polylines;
        that._circlesLabelsCollection = collectionsObject.circleLabels;
        that._polyLinesLabelsCollection = collectionsObject.polylinesLables;
        that._circleCollection = collectionsObject.circles;

        return collectionsObject;
    };

    function removeHandlers(that) {

        if (that._handlerLeftClick) that._handlerLeftClick.removeInputAction(ScreenSpaceEventType.LEFT_CLICK);
        if (that._handlerMiddleClick) that._handlerMiddleClick.removeInputAction(ScreenSpaceEventType.MIDDLE_CLICK);
        if (that._handlerRightClick) that._handlerRightClick.removeInputAction(ScreenSpaceEventType.RIGHT_CLICK);
        if (that._handlerDblLeftClick) that._handlerDblLeftClick.removeInputAction(ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        if (that._handlerMove) that._handlerMove.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);

        if (that._handlerLeftClickCircle)that._handlerLeftClickCircle.removeInputAction(ScreenSpaceEventType.LEFT_CLICK);
        if (that._handlerRightClickCircle) that._handlerRightClickCircle.removeInputAction(ScreenSpaceEventType.RIGHT_CLICK);
        if (that._handlerLeftDblClickCircle) that._handlerLeftDblClickCircle.removeInputAction(ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        if (that._handlerMouseMoveCircle) that._handlerMouseMoveCircle.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);
        
         console.log('all handlers remeved');
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
