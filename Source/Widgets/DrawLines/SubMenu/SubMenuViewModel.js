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
    '../../../DataSources/GeoJsonDataSource',
    '../../../Core/GeometryInstance',
    '../../../ThirdParty/knockout',
    '../../../Scene/HeightReference',
    '../../../Scene/HorizontalOrigin',
    '../../../Scene/LabelCollection',
    '../../../Scene/LabelStyle',
    '../../../Scene/Material',
    '../../../Core/NearFarScalar',
    '../../../Core/PolygonGeometry',
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
        GeoJsonDataSource,
        GeometryInstance,
        knockout,
        HeightReference,
        HorizontalOrigin,
        LabelCollection,
        LabelStyle,
        Material,
        NearFarScalar,
        PolygonGeometry,
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

        if (that.isPolyLineActive) {

            // ====================== HANDLERS DECLARATION =====================

            that._handlerLeftClick = new ScreenSpaceEventHandler(viewer.scene.canvas);
            that._handlerMiddleClick = new ScreenSpaceEventHandler(viewer.scene.canvas);
            that._handlerRightClick = new ScreenSpaceEventHandler(viewer.scene.canvas);
            that._handlerDblLeftClick = new ScreenSpaceEventHandler(viewer.scene.canvas);
            that._handlerMove = new ScreenSpaceEventHandler(viewer.scene.canvas);

            // ====================== ARRAYS INITIALIZATION =====================

            var arrayRadians = [];
            var middlePoint = {};
            var oldLabel;

            // ============ ACTION TO PERFORM FOR THE LEFT CLICK ===============

            // Left clic is used to selection a position on the globe in order to
            // draw the line. This action is associted to the move mouse Event in
            // order to create an animation of the drawn line

            that._handlerLeftClick.setInputAction(function (click) {
                that._undoIsactivated = false;
                var newPolyLine;

                // get the current ellipsoid

                var ellipsoid = viewer.scene.globe.ellipsoid;

                // get the coordinates of the clicked position on the ellipsoid

                var cartesian = viewer.scene.camera.pickEllipsoid(click.position, ellipsoid);

                // Check if the clicked position is on the canvas and on the globe

                if (cartesian && targetMouse === "[object HTMLCanvasElement]") {

                    // From (x,y,z) coordinates (in m) to (lng, lat) coordinates (in radians)

                    var cartographic = ellipsoid.cartesianToCartographic(cartesian);

                    // if the undo option is not activated, then introduce the clicked postion in the arrayRadians

                    if (!that._undoIsactivated) {
                        arrayRadians.push(cartographic.longitude);
                        arrayRadians.push(cartographic.latitude);
                    }

                    // ======== ACTION TO PERFORM FOR THE CURSOR SHIFT =========

                    that._handlerMove.setInputAction(function (mouvement) {

                        // When the cursor is shifted, we get the coordinate of the each position

                        var cartesianMovePosition = viewer.scene.camera.pickEllipsoid(mouvement.endPosition, ellipsoid);

                        // Check if the position is on the canvas and on the globe

                        if (cartesianMovePosition && targetMouse === "[object HTMLCanvasElement]") {

                            // From (x,y,z) coordinates (in m) to (lng, lat) coordinates (in radians)

                            var cartographicMovePosition = ellipsoid.cartesianToCartographic(cartesianMovePosition);

                            // we need only 2 points to draw a line ==> 4 components for the arrayRadians (lng_1, lat_1, lng_2, lat_2) (in radians).
                            // if lng_2, lat_2 already exist, then we change it with the new coordinates. 
                            // if lng_2, lat_2 doesn't exist, we introduce the coordinate in the arrays

                            if (arrayRadians[2] && arrayRadians[3]) {
                                arrayRadians[2] = cartographicMovePosition.longitude;
                                arrayRadians[3] = cartographicMovePosition.latitude;
                            } else {
                                arrayRadians.push(cartographicMovePosition.longitude);
                                arrayRadians.push(cartographicMovePosition.latitude);
                            }
                        }

                        // If we have our 2 points (i.e 4 components in arrayRadians), then

                        if (arrayRadians.length === 4) {

                            // create an object which contains parameters to draw a line

                            newPolyLine = {
                                positions: PolylinePipeline.generateCartesianArc({
                                    positions: Cartesian3.fromRadiansArray(arrayRadians, ellipsoid),
                                    ellipsoid: ellipsoid
                                }),
                                material: Material.fromType('Color', {
                                    color: Color.BLUE
                                }),
                                asynchronous: false

                            };

                            // Compute the distance between the 2 points

                            var startPoint = Cartesian3.fromRadians(arrayRadians[0], arrayRadians[1], cartographic.height, ellipsoid);
                            var endPoint = Cartesian3.fromRadians(arrayRadians[2], arrayRadians[3], cartographicMovePosition.height, ellipsoid);
                            var distance = Cartesian3.distance(endPoint, startPoint);
                            var distanceTrunc = distance.toFixed(2);

                            // create the label associated to the line

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

                            // Add the line to the polyline Collection (draw it)

                            polyLines.add(newPolyLine);

                            // *************************************************  
                            // ** remove the old line to create the animation **
                            // ************************************************* 

                            // get the number of lines in the polyLine Collection

                            var dim = polyLines._polylines.length;

                            // If there is more than 1 line in the collection, 
                            // wer remove the before last one

                            if (dim > 1) {
                                var polyline = polyLines._polylines[dim - 2];
                                polyLines.remove(polyline);
                            }

                            // Idem for the label

                            if (oldLabel) {
                                var dimLabel = polyLinesLabels._labels.length;
                                var primitiveLabel = polyLinesLabels._labels[dimLabel - 1];
                                polyLinesLabels.remove(primitiveLabel);
                            }

                            // we add the created label in the Label collection

                            polyLinesLabels.add(newLabelPolyline);

                            // we prepare arrayRadians for the next move of the mouse


                            // if the undo option is not actived, then we clean the
                            // arrayRadians array and we push in it the last selected
                            // coordinate in order to create an unbroken line 

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
                        }

                    }, ScreenSpaceEventType.MOUSE_MOVE);

                    // we definitively add the last created line and the label
                    // assiciated with.

                    polyLines.add(newPolyLine);
                    polyLinesLabels.add(oldLabel);
                }

            }, ScreenSpaceEventType.LEFT_CLICK);


            // ========= ACTTION TO PERFORM FOR THE MIDDLE CLICK ===============

            // Middle click is used to cut the line when the user has finished to
            // draw it


            that._handlerMiddleClick.setInputAction(function () {

                // arrayRadians is cleaned

                arrayRadians = [];

                // Get the number of the of lines and labels in the line and label
                // collections

                var dim = polyLines._polylines.length;
                var dimLabel = polyLinesLabels._labels.length;

                // Get the last line and the last label

                var polyline = polyLines._polylines[dim - 1];
                var polylineLabel = polyLinesLabels._labels[dimLabel - 1];

                // remove the last line and the last label

                polyLines.remove(polyline);
                polyLinesLabels.remove(polylineLabel);

                // destroy the move Handler event and initialize it again for the 
                // the next use

                that._handlerMove.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);
                that._handlerMove = new ScreenSpaceEventHandler(viewer.scene.canvas);

                // ********* COMPUTE THE TOTAL DISTANCE OF THE LINE ************

                var dimSegment = polyLines._polylines.length;

                var smumDistance = 0;

                // get the first and last point of each line and compute the distance
                // between them and perform the sum

                for (var j = 0; j < dimSegment - 1; j++) {
                    var dimSeg = polyLines._polylines[j]._actualPositions.length;
                    var posStart = polyLines._polylines[j]._actualPositions[0];
                    var posEnd = polyLines._polylines[j]._actualPositions[dimSeg - 1];

                    smumDistance = smumDistance + Cartesian3.distance(posEnd, posStart);
                }

                var smumDistanceTrunc = smumDistance.toFixed(2);
                var beforeLastpolylineLabel = polyLinesLabels._labels[dimLabel - 2];

                // fix the position of the label for the Total distance

                var finalLabelPolylinePosition = {
                    x: beforeLastpolylineLabel._position.x,
                    y: beforeLastpolylineLabel._position.y,
                    z: beforeLastpolylineLabel._position.z
                }

                // create the label for the total distance

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
                    translucencyByDistance: new NearFarScalar(8.0e6, 1.0, 8.0e7, 0.0)
                };

                // add the final label to the label collection

                polyLinesLabels.add(finalLabelPolyline);

                // create en new collection to draw a new line

                polyLines = viewer.scene.primitives.add(new PolylineCollection());
                polyLines.associatedObject = 'polylines';

                // create a new collection for the labels associated to the new line

                polyLinesLabels = that._viewer.scene.primitives.add(new LabelCollection());
                polyLinesLabels.associatedObject = 'polyLinesLabels';

            }, ScreenSpaceEventType.MIDDLE_CLICK);

            // ============ ACTION TO PERFORM FOR THE RIGHT CLICK ==============

            // the right click is used to perform and undo

            that._handlerRightClick.setInputAction(function () {

                // set that._undoIsactivated to true (i.e the undo action is activated)

                that._undoIsactivated = true;

                // get number of line and labels in the line and labels collections

                var dimPoly = polyLines._polylines.length;
                var dimLabel = polyLinesLabels._labels.length;

                console.log(polyLines._polylines);

                // if there is at least one

                if (dimPoly > 1) {


                    console.log("dans dimPloy > 1");

                    var ua = navigator.userAgent;
                    var pattern = /Firefox/g;
                   
                   var beforeLastPolyline = polyLines._polylines[dimPoly - 2];

                    if (pattern.test(ua)) {

                        var polylineToRemove1 = polyLines._polylines[dimPoly - 1];
                        var polylineLabelToRemove = polyLinesLabels._labels[dimLabel - 1];

                        polyLines.remove(polylineToRemove1);
                        polyLinesLabels.remove(polylineLabelToRemove);

                    } else {

                        var polylineToRemove1 = polyLines._polylines[dimPoly - 1];
                        var polylineToRemove2 = polyLines._polylines[dimPoly - 2];
                        var polylineLabelToRemove = polyLinesLabels._labels[dimLabel - 1];

                        polyLines.remove(polylineToRemove1);
                        polyLines.remove(polylineToRemove2);
                        polyLinesLabels.remove(polylineLabelToRemove);
                    }

                    try {
                        //  var beforeLastPolyline = polyLines._polylines[dimPoly - 2];
                        var cartesianPosition = beforeLastPolyline._actualPositions[0];
                        that._coordFirstPosition = viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesianPosition);
                    } catch (e) {
                        console.log(e);
                    }

                    arrayRadians = [];
                    arrayRadians.push(that._coordFirstPosition.longitude);
                    arrayRadians.push(that._coordFirstPosition.latitude);

                    //  console.log(polyLines);

                } else if (dimPoly == 1) {

                    var polyline = polyLines._polylines[dimPoly - 1];
                    var polylineLabel = polyLinesLabels._labels[dimLabel - 1];

                    polyLines.remove(polyline);
                    polyLinesLabels.remove(polylineLabel);

                    that._handlerMove.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);
                    that._handlerMove = new ScreenSpaceEventHandler(viewer.scene.canvas);

                    arrayRadians = [];

                } else if (dimPoly == 0) {

                    arrayRadians = [];

                }
            }, ScreenSpaceEventType.RIGHT_CLICK);

            //    that.isPolyLineActive = false; // to prevent servral instance of the same Handlers
        }
    }

    function drawCircleFunction(that, viewer, ellipsoid, circleCollection, circlesLabels) {

        // use that to check if we are on the canvas or not (for example, on a button);
        document.onmousemove = getPosition;

        if (that.isCircleActive) {

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

                            if (circleRadius > 0) {

                                var circleOutlineGeometry = new CircleOutlineGeometry({
                                    center: cartesianCartographicCircleCenter,
                                    radius: circleRadius,
                                    ellipsoid: ellipsoid
                                });

                                var circleOutlineInstance = new GeometryInstance({
                                    geometry: circleOutlineGeometry,
                                    attributes: {color: ColorGeometryInstanceAttribute.fromColor(Color.BLUE)}
                                });

                                newPrim = new Primitive({
                                    geometryInstances: [circleOutlineInstance],
                                    primitiveType: "circle",
                                    appearance: new PerInstanceColorAppearance({
                                        flat: true,
                                        renderState: {lineWidth: Math.min(1.0, viewer.scene.maximumAliasedLineWidth)}
                                    }),
                                    asynchronous: false
                                });

                                var radCircle = circleRadius.toFixed(2);

                                var newLabel = {
                                    position: cartesianCircleCenter,
                                    text: 'D = ' + radCircle * 2 + ' m',
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
                        }
                    }, ScreenSpaceEventType.MOUSE_MOVE);
                }

                that._handlerLeftDblClickCircle.setInputAction(function () {
                    if (that._handlerMouseMoveCircle)
                        that._handlerMouseMoveCircle.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);

                    var cartesianCircleCenter = newPrim._boundingSphereWC[0].center;
                    var radius = circleRadius = newPrim._boundingSphereWC[0].radius;

                    console.log(circleRadius);

                    var circleGeometry = new CircleGeometry({
                        center: cartesianCircleCenter,
                        radius: circleRadius,
                        ellipsoid: ellipsoid,
                        vertexFormat: PerInstanceColorAppearance.VERTEX_FORMAT
                    });

                    var circleInstance = new GeometryInstance({
                        geometry: circleGeometry,
                        attributes: {color: ColorGeometryInstanceAttribute.fromColor(new Color(0.0, 0.0, 1.0, 0.3))}
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
                            var primitiveLabel1 = circlesLabels._labels[dimLabel - 1];

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

            //   that.isCircleActive = false; // to prevent servral instance of the same Handlers
        }
    }



    function drawCircleFromTwoPointsFunction(that, viewer, ellipsoid, circleCollection, circlesLabels, polyLinesTmps, polyLinesLabelsTmps) {

        // use that to check if we are on the canvas or not (for example, on a button);
        document.onmousemove = getPosition;

        if (that.isCircleFromTwoPointsActive) {

            // Initialisation des evenements de la souris

            that._handlerLeftClickCircle = new ScreenSpaceEventHandler(viewer.scene.canvas);
            that._handlerRightClickCircle = new ScreenSpaceEventHandler(viewer.scene.canvas);
            that._handlerLeftDblClickCircle = new ScreenSpaceEventHandler(viewer.scene.canvas);
            that._handlerMouseMoveCircle = new ScreenSpaceEventHandler(viewer.scene.canvas);


            // initialisation des variables

            var arrayRadians = [];
            var circleRadius;
            var cartesianCartographicCircleCenter;
            var ellipsoid = viewer.scene.globe.ellipsoid;
            var oldLabel;

            // Implementation des actions a mener lorsque l'evenement a lieu

            that._handlerLeftClickCircle.setInputAction(function (click) {
                that._undoIsactivated = false;
                var newLine;

                // on recupere les coordonnées cartésiennes du point ou l'on a cliqué.
                var cartesian = viewer.scene.camera.pickEllipsoid(click.position, ellipsoid);

                // Si les coordonnées cartésiennes existent et que l'on est sur le canvas, alors...
                if (cartesian && targetMouse === "[object HTMLCanvasElement]") {

                    // on transforme les coordonnées cartésiennes en cartographiques (lng, lat) en radians
                    var cartographic = ellipsoid.cartesianToCartographic(cartesian);

                    // on commence a remplir le tableau arrayRadians qui contiens les coordonnées 
                    // des points de départ et d'arrivé de la droite

                    arrayRadians.push(cartographic.longitude);
                    arrayRadians.push(cartographic.latitude);

                    if (arrayRadians.length === 6) {


                        var startPoint = Cartesian3.fromRadians(arrayRadians[0], arrayRadians[1], cartographic.height, ellipsoid);
                        var endPoint = Cartesian3.fromRadians(arrayRadians[2], arrayRadians[3], cartographic.height, ellipsoid);
                        var diameter = Cartesian3.distance(endPoint, startPoint);
                        var distanceTrunc = diameter.toFixed(2);

                        var middlePoint = {
                            x: (startPoint.x + endPoint.x) / 2.0,
                            y: (startPoint.y + endPoint.y) / 2.0,
                            z: (startPoint.z + endPoint.z) / 2.0
                        }

                        if (diameter > 0) {

                            var circleGeometry = new CircleGeometry({
                                center: middlePoint,
                                radius: diameter / 2.0,
                                ellipsoid: ellipsoid,
                                vertexFormat: PerInstanceColorAppearance.VERTEX_FORMAT
                            });

                            var circleInstance = new GeometryInstance({
                                geometry: circleGeometry,
                                attributes: {color: ColorGeometryInstanceAttribute.fromColor(new Color(0.0, 0.0, 1.0, 0.3))}
                            });

                            var newPrimFill = new Primitive({
                                geometryInstances: [circleInstance],
                                primitiveType: "circle",
                                appearance: new PerInstanceColorAppearance({closed: true})
                            });

                            var newLabel = {
                                position: middlePoint,
                                text: 'D = ' + distanceTrunc + ' m',
                                scale: 0.3,
                                font: '50px arial',
                                fillColor: Color.WHITE,
                                outlineColor: Color.BLACK,
                                style: LabelStyle.FILL,
                                horizontalOrigin: HorizontalOrigin.CENTER,
                                verticalOrigin: VerticalOrigin.CENTER,
                                translucencyByDistance: new NearFarScalar(8.0e6, 1.0, 8.0e7, 0.0)
                            };

                            circleCollection.add(newPrimFill);
                            circlesLabels.add(newLabel);

                            var dim = polyLinesTmps._polylines.length;

                            if (dim >= 1) {

                                var polyline = polyLinesTmps._polylines[dim - 1];
                                polyLinesTmps.remove(polyline);

                                var dimLabel = polyLinesLabelsTmps._labels.length;
                                var primitiveLabel = polyLinesLabelsTmps._labels[dimLabel - 1];
                                polyLinesLabelsTmps.remove(primitiveLabel);

                            }
                        }

                        arrayRadians = [];
                    }


                    // Implementation de l'evenement "Mouse move" pour voir apparaitre le trait. Cela falicite le tracage pour l'utilisateur

                    that._handlerMouseMoveCircle.setInputAction(function (mouvement) {

                        // on recupere les coordonnées de chaque point survolé par la souris

                        var cartesianMovePosition = viewer.scene.camera.pickEllipsoid(mouvement.endPosition, ellipsoid);

                        // si cartesianMovePosition existe et que l'on est sur le canvas, alors...

                        if (cartesianMovePosition && targetMouse === "[object HTMLCanvasElement]") {

                            // on transforme les coordonnées...

                            var cartographicMovePosition = ellipsoid.cartesianToCartographic(cartesianMovePosition);

                            // on introduit les nouvelles coordonées dans le tableau
                            // La condition if est pour dire qu'il faut remplacer systematiquement le point final de maniere
                            // a ne conserver que un seul trait



                            if (arrayRadians.length >= 2) {

                                if (arrayRadians[2] && arrayRadians[3]) {
                                    arrayRadians[2] = cartographicMovePosition.longitude;
                                    arrayRadians[3] = cartographicMovePosition.latitude;
                                } else {
                                    arrayRadians.push(cartographicMovePosition.longitude);
                                    arrayRadians.push(cartographicMovePosition.latitude);
                                }
                            }
                        }

                        // si on a le point de départ et le point d'arrivé du trait (soit 2 coordonnées pour 2 coordonnées ==> 4 ), alors...
                        if (arrayRadians.length === 4) {

                            // on fabrique la ligne 
                            newLine = {
                                positions: PolylinePipeline.generateCartesianArc({
                                    positions: Cartesian3.fromRadiansArray(arrayRadians, ellipsoid),
                                    ellipsoid: ellipsoid
                                }),
                                material: Material.fromType('Color', {
                                    color: Color.BLUE
                                })
                            };

                            // on determine la distance entre les deux points 

                            var startPoint = Cartesian3.fromRadians(arrayRadians[0], arrayRadians[1], cartographic.height, ellipsoid);
                            var endPoint = Cartesian3.fromRadians(arrayRadians[2], arrayRadians[3], cartographicMovePosition.height, ellipsoid);
                            var distance = Cartesian3.distance(endPoint, startPoint);
                            var distanceTrunc = distance.toFixed(2);

                            // creation du label pour l'aide a la visualisation 

                            var newLabelPolyline = {
                                position: cartesianMovePosition,
                                text: 'd = ' + distanceTrunc + ' m',
                                scale: 0.3,
                                font: '50px arial',
                                fillColor: Color.WHITE,
                                outlineColor: Color.BLACK,
                                style: LabelStyle.FILL,
                                horizontalOrigin: HorizontalOrigin.LEFT,
                                verticalOrigin: VerticalOrigin.BOTTOM,
                                translucencyByDistance: new NearFarScalar(8.0e6, 1.0, 8.0e7, 0.0)
                            };

                            //  ajout de la ligne 

                            polyLinesTmps.add(newLine);

                            var dim = polyLinesTmps._polylines.length;

                            if (dim > 1) {
                                var polyline = polyLinesTmps._polylines[dim - 2];
                                polyLinesTmps.remove(polyline);
                            }

                            if (oldLabel) {
                                var dimLabel = polyLinesLabelsTmps._labels.length;
                                var primitiveLabel = polyLinesLabelsTmps._labels[dimLabel - 1];
                                polyLinesLabelsTmps.remove(primitiveLabel);
                            }

                            polyLinesLabelsTmps.add(newLabelPolyline);

                            oldLabel = newLabelPolyline;
                        }
                    }, ScreenSpaceEventType.MOUSE_MOVE);
                }


            }, ScreenSpaceEventType.LEFT_CLICK);

            that._handlerRightClickCircle.setInputAction(function (click) {

                if (that._handlerMouseMoveCircle)
                    that._handlerMouseMoveCircle.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);

                that._handlerMouseMoveCircle = new ScreenSpaceEventHandler(viewer.scene.canvas);


                var dimPolyLines = polyLinesTmps._polylines.length;

                if (dimPolyLines > 0) {

                    try {
                        polyLinesTmps.removeAll();
                    } catch (e) {
                        console.log(e)
                    }
                    try {
                        polyLinesLabelsTmps.removeAll();
                    } catch (e) {
                        console.log(e)
                    }

                    arrayRadians = [];

                } else if (dimPolyLines == 0) {

                    var dim = circleCollection._primitives.length;
                    var dimLabel = circlesLabels._labels.length;

                    var continueWhile = true;

                    if (dim >= 1) {

                        while (continueWhile) {

                            try {
                                var primitiveObject1 = circleCollection._primitives[dim - 1];
                                var primitiveLabel1 = circlesLabels._labels[dimLabel - 1];

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

                    arrayRadians = [];

                }
            }, ScreenSpaceEventType.RIGHT_CLICK);

            //  that.isCircleFromTwoPointsActive = false; // to prevent servral instance of the same Handlers
        }
    }

    function  computeMedianPoint(P1, P2) {

        var C0 = (P2.x + P1.x) / 2.0;
        var C1 = (P2.y + P1.y) / 2.0;
        var C2 = (P2.z + P1.z) / 2.0;

        var medianPoint = [C0, C1, C2];

        return medianPoint;

    }

    function computeVectors(P1, P2) {

        var C0 = (P2.x - P1.x);
        var C1 = (P2.y - P1.y);
        var C2 = (P2.z - P1.z);

        var VD = [C0, C1, C2];

        return VD;
    }


    function computeNormalVector(U, V) {

        var C0 = U[1] * V[2] - U[2] * V[1];
        var C1 = U[2] * V[0] - U[0] * V[2];
        var C2 = U[0] * V[1] - U[1] * V[0];

        var N = [C0, C1, C2];

        return N;
    }

    function computePlanCoefficent(P1, N) {

        var C0 = N[0];
        var C1 = N[1];
        var C2 = N[2];
        var C3 = N[0] * P1[0] + N[1] * P1[1] + N[2] * P1[2];

        var C = [C0, C1, C2, C3];

        return C;
    }

    function extractionSubMatrix(A, indexI) {

        var selectedLine1 = indexI + 1;
        var selectedLine2 = indexI + 2;

        if (selectedLine1 > 2) {
            selectedLine1 = 0;
        }

        if (selectedLine2 > 2 && indexI != 2) {
            selectedLine2 = 0;
        }

        if (selectedLine2 > 2 && indexI == 2) {
            selectedLine2 = indexI - 1;
        }

        var line1 = A[selectedLine1];
        var line2 = A[selectedLine2];

        //  console.log(line1);
        //  console.log(line2);

        var finalLine1 = line1.slice(1, line1.length);
        var finalLine2 = line2.slice(1, line2.length);

        var subA = [finalLine1, finalLine2];

        return subA;
    }

    function computDetMatrix2x2(subA, coef) {
        var detA = subA[0][0] * subA[1][1] - subA[1][0] * subA[0][1];
        return detA * coef;
    }

    function computeDeterminant3x3(A) {

        var sumDet = 0;

        for (var i = 0; i < A.length; i++) {

            var coef = Math.pow(-1.0, i);
            var subA = extractionSubMatrix(A, i);
            var detA = computDetMatrix2x2(subA, coef);

            sumDet = sumDet + coef * detA * A[i][0];
        }

        return sumDet;
    }

    function drawCircleFromThreePointsFunction(that, viewer, ellipsoid, circleCollection, circlesLabels, polyLinesTmps, polyLinesLabelsTmps) {

        // use that to check if we are on the canvas or not (for example, on a button);
        document.onmousemove = getPosition;

        if (that.isCircleFromThreePointsActive) {

            // Initialisation des evenements de la souris

            that._handlerLeftClickCircle = new ScreenSpaceEventHandler(viewer.scene.canvas);
            that._handlerRightClickCircle = new ScreenSpaceEventHandler(viewer.scene.canvas);
            that._handlerLeftDblClickCircle = new ScreenSpaceEventHandler(viewer.scene.canvas);
            that._handlerMouseMoveCircle = new ScreenSpaceEventHandler(viewer.scene.canvas);


            // initialisation des variables

            var arrayRadians = [];
            var polyLinesCoord = [];
            var circleRadius;
            var cartesianCartographicCircleCenter;
            var ellipsoid = viewer.scene.globe.ellipsoid;
            var oldLabel;
            var cartesianMovePosition;

            // Implementation des actions a mener lorsque l'evenement a lieu

            that._handlerLeftClickCircle.setInputAction(function (click) {

                that._undoIsactivated = false;
                var newPolyLine;

                var ellipsoid = viewer.scene.globe.ellipsoid;
                var cartesian = viewer.scene.camera.pickEllipsoid(click.position, ellipsoid);

                if (cartesian && targetMouse === "[object HTMLCanvasElement]") {
                    var cartographic = ellipsoid.cartesianToCartographic(cartesian);

                    if (!that._undoIsactivated) {
                        arrayRadians.push(cartographic.longitude);
                        arrayRadians.push(cartographic.latitude);
                        polyLinesCoord.push(cartographic.longitude);
                        polyLinesCoord.push(cartographic.latitude);
                    }

                    if (polyLinesCoord.length >= 6) {

                        var firstPoint = Cartesian3.fromRadians(polyLinesCoord[0], polyLinesCoord[1], cartographic.height, ellipsoid);
                        var secondPoint = Cartesian3.fromRadians(polyLinesCoord[2], polyLinesCoord[3], cartographic.height, ellipsoid);
                        var thirdPoint = Cartesian3.fromRadians(polyLinesCoord[4], polyLinesCoord[5], cartographic.height, ellipsoid);

                        // on calcul les points médians

                        var medianPoint12 = computeMedianPoint(firstPoint, secondPoint);
                        var medianPoint23 = computeMedianPoint(secondPoint, thirdPoint);

                        // on calcul les vecteurs directeurs

                        var V12 = computeVectors(firstPoint, secondPoint);
                        var V23 = computeVectors(secondPoint, thirdPoint);

                        // on calcul le vecteur normal au plan contenant les 3 points 

                        var normalVector = computeNormalVector(V12, V23);

                        // on calcul les coefs de l'equation du plan

                        var point1 = [firstPoint.x, firstPoint.y, firstPoint.z];

                        var plan1 = computePlanCoefficent(point1, normalVector);
                        var plan2 = computePlanCoefficent(medianPoint12, V12);
                        var plan3 = computePlanCoefficent(medianPoint23, V23);

                        var arrayDelta = [[plan1[0], plan1[1], plan1[2]],
                            [plan2[0], plan2[1], plan2[2]],
                            [plan3[0], plan3[1], plan3[2]]];

                        var delta = computeDeterminant3x3(arrayDelta);

                        var arrayDeltaX = [[plan1[3], plan1[1], plan1[2]],
                            [plan2[3], plan2[1], plan2[2]],
                            [plan3[3], plan3[1], plan3[2]]];

                        var deltaX = computeDeterminant3x3(arrayDeltaX);

                        var arrayDeltaY = [[plan1[0], plan1[3], plan1[2]],
                            [plan2[0], plan2[3], plan2[2]],
                            [plan3[0], plan3[3], plan3[2]]];

                        var deltaY = computeDeterminant3x3(arrayDeltaY);

                        var arrayDeltaZ = [[plan1[0], plan1[1], plan1[3]],
                            [plan2[0], plan2[1], plan2[3]],
                            [plan3[0], plan3[1], plan3[3]]];

                        var deltaZ = computeDeterminant3x3(arrayDeltaZ);

                        var centerPosition = {
                            x: deltaX / delta,
                            y: deltaY / delta,
                            z: deltaZ / delta
                        };
                        var centerRadius = Cartesian3.distance(centerPosition, firstPoint);

                        var diameter = centerRadius * 2.0;
                        var distanceTrunc = diameter.toFixed(2);

                        if (diameter > 0) {

                            var circleGeometry = new CircleGeometry({
                                center: centerPosition,
                                radius: diameter / 2.0,
                                ellipsoid: ellipsoid,
                                vertexFormat: PerInstanceColorAppearance.VERTEX_FORMAT
                            });

                            var circleInstance = new GeometryInstance({
                                geometry: circleGeometry,
                                attributes: {color: ColorGeometryInstanceAttribute.fromColor(new Color(0.0, 0.0, 1.0, 0.3))}
                            });

                            var newPrimFill = new Primitive({
                                geometryInstances: [circleInstance],
                                primitiveType: "circle",
                                appearance: new PerInstanceColorAppearance({closed: true})
                            });

                            var newLabel = {
                                position: centerPosition,
                                text: 'D = ' + distanceTrunc + ' m',
                                scale: 0.3,
                                font: '50px arial',
                                fillColor: Color.WHITE,
                                outlineColor: Color.BLACK,
                                style: LabelStyle.FILL,
                                horizontalOrigin: HorizontalOrigin.CENTER,
                                verticalOrigin: VerticalOrigin.CENTER,
                                translucencyByDistance: new NearFarScalar(8.0e6, 1.0, 8.0e7, 0.0)
                            };

                            circleCollection.add(newPrimFill);
                            circlesLabels.add(newLabel);

                            arrayRadians = [];
                            polyLinesCoord = [];
                        }

                        polyLinesTmps.removeAll();
                        polyLinesLabelsTmps.removeAll();

                        console.log(polyLinesTmps);
                    } else {

                        that._handlerMouseMoveCircle.setInputAction(function (mouvement) {

                            cartesianMovePosition = viewer.scene.camera.pickEllipsoid(mouvement.endPosition, ellipsoid);

                            if (cartesianMovePosition && targetMouse === "[object HTMLCanvasElement]") {

                                var cartographicMovePosition = ellipsoid.cartesianToCartographic(cartesianMovePosition);

                                if (arrayRadians.length >= 2) {

                                    if (arrayRadians[2] && arrayRadians[3]) {
                                        arrayRadians[2] = cartographicMovePosition.longitude;
                                        arrayRadians[3] = cartographicMovePosition.latitude;
                                    } else {
                                        arrayRadians.push(cartographicMovePosition.longitude);
                                        arrayRadians.push(cartographicMovePosition.latitude);
                                    }
                                }
                            }

                            if (arrayRadians.length === 4) {

                                newPolyLine = {
                                    positions: PolylinePipeline.generateCartesianArc({
                                        positions: Cartesian3.fromRadiansArray(arrayRadians, ellipsoid),
                                        ellipsoid: ellipsoid
                                    }),
                                    material: Material.fromType('Color', {
                                        color: Color.BLUE
                                    })
                                };

                                var startPoint = Cartesian3.fromRadians(arrayRadians[0], arrayRadians[1], cartographic.height, ellipsoid);
                                var endPoint = Cartesian3.fromRadians(arrayRadians[2], arrayRadians[3], cartographicMovePosition.height, ellipsoid);
                                var distance = Cartesian3.distance(endPoint, startPoint);
                                var distanceTrunc = distance.toFixed(2);

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

                                polyLinesTmps.add(newPolyLine);

                                var dim = polyLinesTmps._polylines.length;

                                if (dim > 1) {
                                    var polyline = polyLinesTmps._polylines[dim - 2];
                                    polyLinesTmps.remove(polyline);
                                }

                                if (oldLabel) {
                                    var dimLabel = polyLinesLabelsTmps._labels.length;
                                    var primitiveLabel = polyLinesLabelsTmps._labels[dimLabel - 1];
                                    polyLinesLabelsTmps.remove(primitiveLabel);
                                }

                                polyLinesLabelsTmps.add(newLabelPolyline);

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
                            }

                        }, ScreenSpaceEventType.MOUSE_MOVE);

                        polyLinesTmps.add(newPolyLine);
                        polyLinesLabelsTmps.add(oldLabel);
                    }
                }

            }, ScreenSpaceEventType.LEFT_CLICK);


            that._handlerRightClickCircle.setInputAction(function (click) {

                if (that._handlerMouseMoveCircle)
                    that._handlerMouseMoveCircle.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);

                that._handlerMouseMoveCircle = new ScreenSpaceEventHandler(viewer.scene.canvas);


                var dimPolyLines = polyLinesTmps._polylines.length;

                if (dimPolyLines > 0) {

                    try {
                        polyLinesTmps.removeAll();
                    } catch (e) {
                        console.log(e)
                    }
                    try {
                        polyLinesLabelsTmps.removeAll();
                    } catch (e) {
                        console.log(e)
                    }

                    arrayRadians = [];
                    polyLinesCoord = [];

                } else if (dimPolyLines == 0) {

                    var dim = circleCollection._primitives.length;
                    var dimLabel = circlesLabels._labels.length;

                    var continueWhile = true;

                    if (dim >= 1) {

                        while (continueWhile) {

                            try {
                                var primitiveObject1 = circleCollection._primitives[dim - 1];
                                var primitiveLabel1 = circlesLabels._labels[dimLabel - 1];

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

                    arrayRadians = [];
                    polyLinesCoord = [];

                }
            }, ScreenSpaceEventType.RIGHT_CLICK);
        }

        //  that.isCircleFromThreePointsActive = false; // to prevent servral instance of the same Handlers

    }

    function drawPolygonsFunction(that, viewer, ellipsoid, polygonsCollection, polygonsLabelsCollection, polyLinesTmpPolygons, polyLinesLabelsTmPolygons) {

        document.onmousemove = getPosition;

        if (that.isPolygonsActive) {

            // initialisation des evenements 

            that._handlerLeftClick = new ScreenSpaceEventHandler(viewer.scene.canvas);
            that._handlerMiddleClick = new ScreenSpaceEventHandler(viewer.scene.canvas);
            that._handlerRightClick = new ScreenSpaceEventHandler(viewer.scene.canvas);
            that._handlerDblLeftClick = new ScreenSpaceEventHandler(viewer.scene.canvas);
            that._handlerMove = new ScreenSpaceEventHandler(viewer.scene.canvas);


            // On cree une Collection de polylines temporaires pour aider l'utilisateur a 
            // fabriquer sont polygone. l'objet polyLinesTmp est détruit a chaque fois que l'on
            // commence un nouveau polygone et est détruit quand on desactive la fonctionnalité
            // var polyLinesTmp = viewer.scene.primitives.add(new PolylineCollection());
            // var polyLinesLabelsTmp = viewer.scene.primitives.add(new LabelCollection());

            //  polyLinesTmpPolygons.associatedObject = 'polylinesTmpPolygons';
            // polyLinesLabelsTmPolygons.associatedObject = 'polyLinesLabelsTmpPolygons';

            // tableau qui va contenir les coordonnées de départ et d'arrivé d'une ligne.
            // Une lgine est construite a partir d'un point de départ et d'un point d'arrivé
            var coordLinesForPolygonsRadians = []; // ==> tableau a 4 composantes uniquement
            var polygonsCoord = []; // ==> tableau de points pour le tracé du polygon
            var oldLabel;
            var oldPolygons;

            // on recupere l'ellipsoid de référence pour obtenir les coordonnées
            var ellipsoid = viewer.scene.globe.ellipsoid;


            //  EVENEMENT : on clic sur le boutton gauche de la souris
            that._handlerLeftClick.setInputAction(function (click) {

                // On desactive le undo
                that._undoIsactivated = false;

                // Declaration de la nouvelle ligne : Objet qui va servir a tracer la ligne;
                var newPolyLine;

                // On recupere les coordonnées cartesienne du point sur lequel on a cliqué
                var cartesian = viewer.scene.camera.pickEllipsoid(click.position, ellipsoid);

                // si les coordoonées existent et que l'on est sur le canvas alors... 
                if (cartesian && targetMouse === "[object HTMLCanvasElement]") {

                    // on transforme les coordonees du point selectionnes de cartesiennes (x, y, z )
                    // à cartographique (long, lat) en radians
                    var cartographic = ellipsoid.cartesianToCartographic(cartesian);

                    // si le undo est a false (i.e inactif) alors on commence a remplir
                    // le vecteur coordLinesForPolygonsRadians. Ici on introduit dans le vecteur
                    // les cood du point de départ (ce sont les composantes [0] et [1] de 
                    // ce vecteur)
                    if (!that._undoIsactivated) {
                        coordLinesForPolygonsRadians.push(cartographic.longitude);
                        coordLinesForPolygonsRadians.push(cartographic.latitude);
                        polygonsCoord.push(cartographic.longitude);
                        polygonsCoord.push(cartographic.latitude);
                    }

                    // EVENEMENT : On deplace la souris. On introduit ce evenement dans l'evenement 
                    // "CLIC GAUCHE".
                    that._handlerMove.setInputAction(function (mouvement) {

                        // on recupere les coordonnees de chaque point survolé par la souris
                        var cartesianMovePosition = viewer.scene.camera.pickEllipsoid(mouvement.endPosition, ellipsoid);

                        // si les coordonnées existent et que l'on est sur le canvas alors...
                        if (cartesianMovePosition && targetMouse === "[object HTMLCanvasElement]") {

                            // on transforme les coordonnées du point survolé de cartisiennes (x, y, z )
                            // à cartographique (long, lat) en radians
                            var cartographicMovePosition = ellipsoid.cartesianToCartographic(cartesianMovePosition);

                            // si on a deja selectionné un point d'arrivé pour la ligne alors on les remplaces. Cela 
                            // afin de creer un dynamisme dans le rendu sinon on introduit les coordonnees du point
                            // d'arrivé dans le vecteur coordLinesForPolygonsRadians
                            if (coordLinesForPolygonsRadians[2] && coordLinesForPolygonsRadians[3]) {
                                coordLinesForPolygonsRadians[2] = cartographicMovePosition.longitude;
                                coordLinesForPolygonsRadians[3] = cartographicMovePosition.latitude;
                            } else {
                                coordLinesForPolygonsRadians.push(cartographicMovePosition.longitude);
                                coordLinesForPolygonsRadians.push(cartographicMovePosition.latitude);
                            }
                        }

                        // Si le vecteur coordPolygonsRadians possède 4 composantes (i.e coord du point de 
                        // depart et coord du point d'arrivé)
                        if (coordLinesForPolygonsRadians.length === 4) {

                            // on rempli l'objet newPolyLine pour pouvoir le tracer par la suite
                            newPolyLine = {
                                positions: PolylinePipeline.generateCartesianArc({
                                    positions: Cartesian3.fromRadiansArray(coordLinesForPolygonsRadians, ellipsoid),
                                    ellipsoid: ellipsoid
                                }),
                                material: Material.fromType('Color', {
                                    color: Color.BLUE
                                })
                            };

                            // Ici on determine la distance entre le point de depart et le point d'arrivé
                            var startPoint = Cartesian3.fromRadians(coordLinesForPolygonsRadians[0], coordLinesForPolygonsRadians[1], cartographic.height, ellipsoid);
                            var endPoint = Cartesian3.fromRadians(coordLinesForPolygonsRadians[2], coordLinesForPolygonsRadians[3], cartographicMovePosition.height, ellipsoid);
                            var distance = Cartesian3.distance(endPoint, startPoint);
                            var distanceTrunc = distance.toFixed(2);

                            /*    middlePoint = {
                             x : (cartesianMovePosition.x + cartesian.x)/2.0,
                             y : (cartesianMovePosition.y + cartesian.y)/2.0,
                             z : (cartesianMovePosition.z + cartesian.z)/2.0,
                             }*/


                            // Ici, on construit le label qui renseigne sur la distance entre les points de 
                            // depart et d'arrivé
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

                            // on ajoute la ligne dans la scene pour le rendu
                            polyLinesTmpPolygons.add(newPolyLine);

                            // on ajoute le label dans la scene pour le rendu
                            polyLinesLabelsTmPolygons.add(newLabelPolyline);

                            // Dans les lignes suivantes, on verifie si il y a déja un tracé de ligne.
                            // Si oui, alors on retir la ligne précedente ansi que son label associé.
                            // Cela donne un effet de dynamisme dans le rendu
                            var dim = polyLinesTmpPolygons._polylines.length;
                            var dimLabel = polyLinesLabelsTmPolygons._labels.length;

                            if (dim > 1) {
                                var polyline = polyLinesTmpPolygons._polylines[dim - 2];
                                polyLinesTmpPolygons.remove(polyline);

                                var primitiveLabel = polyLinesLabelsTmPolygons._labels[dimLabel - 2];
                                polyLinesLabelsTmPolygons.remove(primitiveLabel);
                            }

                            // si la fonctionnalité undo n'est pas active alors on vide le vecteur decrivant la ligne 
                            // pour pouvoir en tracer une autre. pour creer une continuité dans le tracage, on recupuère
                            // les coordonnées du point d'arrivé de la ligne precedante qui devint le point de départ
                            // de la ligne suivante

                            // Si la fonctionnalité undo est active, alors on recupere les anciennes coordonnées pour modifier
                            // la derniere ligne tracée.
                            if (!that._undoIsactivated) {
                                coordLinesForPolygonsRadians = [];
                                coordLinesForPolygonsRadians.push(cartographic.longitude);
                                coordLinesForPolygonsRadians.push(cartographic.latitude);
                            } else {
                                coordLinesForPolygonsRadians = [];
                                coordLinesForPolygonsRadians.push(that._coordFirstPosition.longitude);
                                coordLinesForPolygonsRadians.push(that._coordFirstPosition.latitude);
                            }

                            // On conserve le label pour le rendu
                            oldLabel = newLabelPolyline;
                        }

                    }, ScreenSpaceEventType.MOUSE_MOVE);

                    polyLinesTmpPolygons.add(newPolyLine);
                    polyLinesLabelsTmPolygons.add(oldLabel);

                    // Il faut au minimum 3 points afin de tracer un polygon (donc 6 coordonnées). 
                    // Donc si il y a au moins 6 composantes dans le vecteur polygonsCoord, alors 
                    // on commence le tracé du polygon
                    if (polygonsCoord.length >= 6) {

                        var polygonsCoordDegree = Cartesian3.fromRadiansArray(polygonsCoord, ellipsoid);

                        var polygonInstance = new GeometryInstance({
                            geometry: PolygonGeometry.fromPositions({
                                positions: polygonsCoordDegree,
                                vertexFormat: PerInstanceColorAppearance.VERTEX_FORMAT,
                                ellipsoid: ellipsoid, }),
                            attributes: {
                                color: ColorGeometryInstanceAttribute.fromColor(new Color(0.0, 0.0, 1.0, 0.3))
                            }
                        });

                        var newPolygon = new Primitive({
                            geometryInstances: polygonInstance,
                            appearance: new PerInstanceColorAppearance({
                                closed: true,
                                translucent: true
                            })
                        });

                        polygonsCollection.add(newPolygon);

                        var dim = polygonsCollection._primitives.length;

                        if (oldPolygons) {
                            polygonsCollection.remove(oldPolygons);
                        }

                        oldPolygons = newPolygon;
                    }
                }

            }, ScreenSpaceEventType.LEFT_CLICK);

            that._handlerMiddleClick.setInputAction(function () {

                // on vide le vevteur positions
                coordLinesForPolygonsRadians = [];
                polygonsCoord = [];
                oldPolygons = null;

                // On recupere le nombre de lignes ansi que le nombre labels
                var dim = polyLinesTmpPolygons._polylines.length;
                var dimLabel = polyLinesLabelsTmPolygons._labels.length;

                // On recupere la derniere ligne ainsi que le dernier label pour suppresion 
                var polyline = polyLinesTmpPolygons._polylines[dim - 1];
                var polylineLabel = polyLinesLabelsTmPolygons._labels[dimLabel - 1];

                polyLinesTmpPolygons.remove(polyline);
                polyLinesLabelsTmPolygons.remove(polylineLabel);

                that._handlerMove.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);
                that._handlerMove = new ScreenSpaceEventHandler(viewer.scene.canvas);

                // ajout de la deniere ligne
                var dimSegment = polyLinesTmpPolygons._polylines.length;

                var firstLine = polyLinesTmpPolygons._polylines[0];
                var lastLine = polyLinesTmpPolygons._polylines[dimSegment - 2];

                var firstLineStartPoint = firstLine._actualPositions[0];
                var lasttLineStartPoint = lastLine._actualPositions[lastLine._actualPositions.length - 1];

                var finalLine = [firstLineStartPoint, lasttLineStartPoint];

                var finalPolyLine = {
                    positions: PolylinePipeline.generateCartesianArc({
                        positions: finalLine,
                        ellipsoid: ellipsoid
                    }),
                    material: Material.fromType('Color', {
                        color: Color.BLUE
                    })
                };

                polyLinesTmpPolygons.add(finalPolyLine);

                // on reevalue la dimension de polyLinesTmp._polylines car une nouvelle
                // ligne a été introduite. Cela est important pour le calcul de la distance
                // totale

                var dimSegmentFinal = polyLinesTmpPolygons._polylines.length;

                var smumDistance = 0;

                for (var j = 0; j < dimSegmentFinal; j++) {
                    if (polyLinesTmpPolygons._polylines[j]) {
                        var dimSeg = polyLinesTmpPolygons._polylines[j]._actualPositions.length;
                        var posStart = polyLinesTmpPolygons._polylines[j]._actualPositions[0];
                        var posEnd = polyLinesTmpPolygons._polylines[j]._actualPositions[dimSeg - 1];

                        smumDistance = smumDistance + Cartesian3.distance(posEnd, posStart);
                    }
                }

                var smumDistanceTrunc = smumDistance.toFixed(2);
                /*  var beforeLastpolylineLabel = polyLinesLabelsTmp._labels[dimLabel - 2];
                 
                 var finalLabelPolylinePosition = {
                 x: beforeLastpolylineLabel._position.x,
                 y: beforeLastpolylineLabel._position.y,
                 z: beforeLastpolylineLabel._position.z
                 }*/

                var finalLabelPolyline = {
                    position: firstLineStartPoint,
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

                polyLinesLabelsTmPolygons.add(finalLabelPolyline);

                polyLinesTmpPolygons = viewer.scene.primitives.add(new PolylineCollection());
                polyLinesLabelsTmPolygons = that._viewer.scene.primitives.add(new LabelCollection());

                polyLinesTmpPolygons.associatedObject = 'polylinesTmpPolygons';
                polyLinesLabelsTmPolygons.associatedObject = 'polyLinesLabelsTmpPolygons';

            }, ScreenSpaceEventType.MIDDLE_CLICK);

            that._handlerRightClick.setInputAction(function () {

                that._undoIsactivated = true;
                var dim = polyLinesTmpPolygons._polylines.length;
                var dimLabel = polyLinesLabelsTmPolygons._labels.length;

                if (dim > 1) {

                    var polyline = polyLinesTmpPolygons._polylines[dim - 1];
                    var polylineLabel = polyLinesLabelsTmPolygons._labels[dimLabel - 1];

                    try {
                        var beforeLastPolyline = polyLinesTmpPolygons._polylines[dim - 2];
                        var cartesianPosition = beforeLastPolyline._actualPositions[0];
                        that._coordFirstPosition = viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesianPosition);
                    } catch (e) {
                    }

                    coordLinesForPolygonsRadians = [];
                    coordLinesForPolygonsRadians.push(that._coordFirstPosition.longitude);
                    coordLinesForPolygonsRadians.push(that._coordFirstPosition.latitude);

                    polyLinesTmpPolygons.remove(polyline);
                    polyLinesLabelsTmPolygons.remove(polylineLabel);

                    var lastPlygons = polygonsCollection._primitives[polygonsCollection._primitives.length - 1];
                    polygonsCollection.remove(lastPlygons);

                    var dimpolygonsCoord = polygonsCoord.length;
                    var newPolygonsCoord = polygonsCoord.slice(0, dimpolygonsCoord - 2);
                    polygonsCoord = newPolygonsCoord;

                    var polygonsCoordDegree = Cartesian3.fromRadiansArray(polygonsCoord, ellipsoid);

                    var polygonInstance = new GeometryInstance({
                        geometry: PolygonGeometry.fromPositions({
                            positions: polygonsCoordDegree,
                            vertexFormat: PerInstanceColorAppearance.VERTEX_FORMAT,
                            ellipsoid: ellipsoid, }),
                        attributes: {
                            color: ColorGeometryInstanceAttribute.fromColor(new Color(0.0, 0.0, 1.0, 0.3))
                        }
                    });

                    var newPolygon = new Primitive({
                        geometryInstances: polygonInstance,
                        appearance: new PerInstanceColorAppearance({
                            closed: true,
                            translucent: true
                        })
                    });

                    polygonsCollection.add(newPolygon);

                    oldPolygons = newPolygon;

                    //  console.log(polyLines);

                } else if (dim == 1) {

                    console.log("dim == 1");

                    var polyline = polyLinesTmpPolygons._polylines[dim - 1];
                    var polylineLabel = polyLinesLabelsTmPolygons._labels[dimLabel - 1];
                    polyLinesTmpPolygons.remove(polyline);
                    polyLinesLabelsTmPolygons.remove(polylineLabel);

                    that._handlerMove.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);
                    that._handlerMove = new ScreenSpaceEventHandler(viewer.scene.canvas);

                    coordLinesForPolygonsRadians = [];

                } else if (dim == 0) {

                    console.log("dim == 0");

                    coordLinesForPolygonsRadians = [];

                }
            }, ScreenSpaceEventType.RIGHT_CLICK);

            //  that.isPolygonsActive = false; // to prevent servral instance of the same Handlers  
        }
    }


    var saveGeoJsondataSourcesObject = {
        ellipse: createEllipseGeoJsonObect,
        polygon: createPolygonGeoJsonObect,
        point: createPointGeoJsonObect,
        polyline: createPolylineGeoJsonObect
    }

    function createEllipseGeoJsonObect(that, geoJsonDataSource) {

        // console.log(geoJsonDataSource);

        var centerCoordinates = geoJsonDataSource._position._value;

        var circleRadius = geoJsonDataSource.ellipse.semiMajorAxis;
        var circleSurface = CesiumMath.PI * circleRadius * circleRadius;

        var cartographicCenterPosition = that._ellipsoid.cartesianToCartographic(centerCoordinates);
        var centerPositionLng = CesiumMath.toDegrees(cartographicCenterPosition.longitude);
        var centerPositionLat = CesiumMath.toDegrees(cartographicCenterPosition.latitude);

        var centerPosition = [centerPositionLng, centerPositionLat];

        var jsonCircleGeoJson = {};
        jsonCircleGeoJson.type = "Point";
        jsonCircleGeoJson.coordinates = centerPosition;

        var featureCircleGeometry = {};
        featureCircleGeometry.type = "Feature";
        featureCircleGeometry.geometry = jsonCircleGeoJson;
        featureCircleGeometry.properties = geoJsonDataSource.properties;

        return featureCircleGeometry;
    }

    function createPolygonGeoJsonObect(that, geoJsonDataSource) {

        var featurePolygons = {};
        featurePolygons.type = "Feature";

        var geoJsonPolygons = {};
        geoJsonPolygons.type = "Polygon";
        geoJsonPolygons.coordinates = [];

        var positions = geoJsonDataSource.polygon.hierarchy._value.positions;
        var array = [];

        for (var j = 0; j < positions.length; j++) {
            var cartographicCenterPosition = that._ellipsoid.cartesianToCartographic(positions[j]);
            var centerPositionLng = CesiumMath.toDegrees(cartographicCenterPosition.longitude);
            var centerPositionLat = CesiumMath.toDegrees(cartographicCenterPosition.latitude);

            var centerPosition = [centerPositionLng, centerPositionLat];
            array.push(centerPosition);
        }

        geoJsonPolygons.coordinates.push(array);
        featurePolygons.geometry = geoJsonPolygons;
        featurePolygons.properties = {
            Name: "Polygons"
        }

        return featurePolygons;
    }

    function createPolylineGeoJsonObect(that, geoJsonDataSource) {

        var featurePolylines = {};
        featurePolylines.type = "Feature";

        var jsonPolylineGeometry = {};
        jsonPolylineGeometry.type = "MultiLineString";
        jsonPolylineGeometry.coordinates = [];

        var positions = geoJsonDataSource.polyline.positions._value;
        var distance = Cartesian3.distance(positions[0], positions[1]);
        var distTrunc = distance.toFixed(2);

        var array = [];

        for (var j = 0; j < positions.length; j++) {

            var cartographicCenterPosition = that._ellipsoid.cartesianToCartographic(positions[j]);
            var centerPositionLng = CesiumMath.toDegrees(cartographicCenterPosition.longitude);
            var centerPositionLat = CesiumMath.toDegrees(cartographicCenterPosition.latitude);

            var vectPos = [centerPositionLng, centerPositionLat];
            array.push(vectPos);
        }

        jsonPolylineGeometry.coordinates.push(array);
        featurePolylines.geometry = jsonPolylineGeometry;
        featurePolylines.properties = geoJsonDataSource.properties;
        //  featurePolylines.properties.segment = "D = "+ distTrunc + " m";

        return featurePolylines;
    }

    function createPointGeoJsonObect(that, geoJsonDataSource) {

        var centerCoordinates = geoJsonDataSource.position._value;

        /* var circleRadius = geoJsonDataSource.point.semiMajorAxis;
         var circleSurface = CesiumMath.PI * circleRadius * circleRadius;*/

        var cartographicCenterPosition = that._ellipsoid.cartesianToCartographic(centerCoordinates);
        var centerPositionLng = CesiumMath.toDegrees(cartographicCenterPosition.longitude);
        var centerPositionLat = CesiumMath.toDegrees(cartographicCenterPosition.latitude);

        var centerPosition = [centerPositionLng, centerPositionLat];

        var jsonCircleGeoJson = {};
        jsonCircleGeoJson.type = "Point";
        jsonCircleGeoJson.coordinates = centerPosition;

        var featureCircleGeometry = {};
        featureCircleGeometry.type = "Feature";
        featureCircleGeometry.geometry = jsonCircleGeoJson;
        featureCircleGeometry.properties = geoJsonDataSource.properties;

        return featureCircleGeometry;
    }

    function saveData(that, container) {

        // obtention de TOUTES les primitives  (polylines, labels et cerlces et autres objets)
        var primitives = that._viewer.scene.primitives._primitives;
        var crs = GeoJsonDataSource.crsFunctionType;

        // Declaration de l'Objet geoJson a enrigstrer dans un fichier
        var geoJsonObject = {};
        geoJsonObject.type = "FeatureCollection";
        geoJsonObject.features = [];
        geoJsonObject.crs = crs.crs;

        // on parcours toutes les primitives
        for (var i = 0; i < primitives.length; i++) {

            // Si la primitive est un polyline alors ...
            if (primitives[i].associatedObject === "polylines" && primitives[i]._polylines.length > 0) {

                // Declaration de l'objet featureObject contenant un ensemble de lignes continues
                var featurePolylines = {};
                featurePolylines.type = "Feature";

                // Declaration de l'objet contenant toutes les coordonnées des 
                // points de depart et d'arrivé de chaque ligne d'un meme ensemble de ligne
                var jsonPolylineGeometry = {};
                jsonPolylineGeometry.type = "MultiLineString";
                jsonPolylineGeometry.coordinates = [];

                // on recupere l'ensemble des polylines contenues dans la primitive[i]
                // Ici, polyLine est un tableau d'objet. Chaque composante du tableau
                // représente une ligne
                var polylines = primitives[i]._polylines;

                // On récupere l'objet label correspondant a la distance totale de la trajectoire
                var labels = primitives[i + 1]._labels;

                // on extrait de l'objet label l'information sur la distance totale
                var totalLengthPath = labels[labels.length - 1]._text;

                // Si il y a des lignes alors...
                if (polylines.length > 0) {

                    for (var j = 0; j < polylines.length; j++) {

                        // On récupere la ligne [j]
                        var positions = polylines[j]._positions;

                        // On recupere le point de départ et d'arrivé de la ligne
                        var firstPosition = positions[0];
                        var lastPosition = positions[positions.length - 1];

                        // On passe des coordonnées cartésiennes aux coordonnées cartographiques
                        var cartographicFirstPosition = that._ellipsoid.cartesianToCartographic(firstPosition);
                        var cartographicLastPosition = that._ellipsoid.cartesianToCartographic(lastPosition);

                        // On passe de Radians à Degrés 
                        var firstPositionLng = CesiumMath.toDegrees(cartographicFirstPosition.longitude);
                        var firstPositionLat = CesiumMath.toDegrees(cartographicFirstPosition.latitude);
                        var lastPositionLng = CesiumMath.toDegrees(cartographicLastPosition.longitude);
                        var lastPositionLat = CesiumMath.toDegrees(cartographicLastPosition.latitude);

                        // On fabrique le vecteur coordonnées contenant les points de depart et d'arrivé en coord
                        // (longitude, latitude)
                        var line = [[firstPositionLng, firstPositionLat], [lastPositionLng, lastPositionLat]];

                        // on introduit le vecteur line dans la propriété "coordinates" de l'objet geoJsonPolyline  
                        jsonPolylineGeometry.coordinates.push(line);
                        featurePolylines.geometry = jsonPolylineGeometry;
                        featurePolylines.properties = {
                            Name: "Line",
                            Total_distance: totalLengthPath
                        }
                    }

                    // Une fois l'ensemble des coordonnées récupérées, on introduit featurePolylines dans l'objet final
                    geoJsonObject.features.push(featurePolylines);
                }
            }

            if (primitives[i].associatedObject === "circleGeomtry") {

                // on recupere l'ensemble des cercles contenus dans la primitive[i]
                // Ici, circles est un tableau d'objet. Chaque composante du tableau
                // représente un circle
                var circles = primitives[i]._primitives;

                if (circles.length > 0) {

                    for (var j = 0; j < circles.length; j++) {

                        // On récupere les coordonnées du centre du cercle[j]
                        var centerCoordinates = circles[j]._boundingSpheres[0].center;
                        var circleRadius = circles[j]._boundingSpheres[0].radius;
                        var circleSurface = CesiumMath.PI * circleRadius * circleRadius;

                        var cartographicCenterPosition = that._ellipsoid.cartesianToCartographic(centerCoordinates);
                        var centerPositionLng = CesiumMath.toDegrees(cartographicCenterPosition.longitude);
                        var centerPositionLat = CesiumMath.toDegrees(cartographicCenterPosition.latitude);

                        var centerPosition = [centerPositionLng, centerPositionLat];

                        var jsonCircleGeometry = {};
                        jsonCircleGeometry.type = "Point";
                        jsonCircleGeometry.coordinates = centerPosition;

                        var featureCircle = {};
                        featureCircle.type = "Feature";
                        featureCircle.geometry = jsonCircleGeometry;
                        featureCircle.properties = {
                            Name: "Circle",
                            Center_lng: centerPositionLng.toFixed(3) + " deg",
                            Center_lat: centerPositionLat.toFixed(3) + " deg",
                            Radius: circleRadius.toFixed(3) + " m",
                            Surface: circleSurface + " m2"
                        };
                        geoJsonObject.features.push(featureCircle);
                    }
                }
            }

            // Si la primitive est un polygonsGeomtry alors ...
            if (primitives[i].associatedObject === "polylinesTmpPolygons") {

                // Declaration de l'objet featureObject contenant un ensemble de lignes continues
                var featurePolygons = {};
                featurePolygons.type = "Feature";

                // Declaration de l'objet contenant toutes les coordonnées des 
                // points de depart et d'arrivé de chaque ligne d'un meme ensemble de ligne
                var geoJsonPolygons = {};
                geoJsonPolygons.type = "Polygon";
                geoJsonPolygons.coordinates = [];

                // on recupere l'ensemble des polylines contenues dans la primitive[i]
                // Ici, polyLine est un tableau d'objet. Chaque composante du tableau
                // représente une ligne
                var polylines = primitives[i]._polylines;
                var polygonsPoints = [];

                // Si il y a des lignes alors...
                if (polylines.length > 0) {

                    for (var j = 0; j < polylines.length - 1; j++) {

                        // On récupere la ligne [j]
                        var positions = polylines[j]._positions;

                        // On recupere le point de départ et d'arrivé de la ligne
                        var firstPosition = positions[0];
                        var lastPosition = positions[positions.length - 1];

                        // On passe des coordonnées cartésiennes aux coordonnées cartographiques
                        var cartographicFirstPosition = that._ellipsoid.cartesianToCartographic(firstPosition);
                        var cartographicLastPosition = that._ellipsoid.cartesianToCartographic(lastPosition);

                        // On passe de Radians à Degrés 
                        var lastPositionLng = CesiumMath.toDegrees(cartographicLastPosition.longitude);
                        var lastPositionLat = CesiumMath.toDegrees(cartographicLastPosition.latitude);

                        // On fabrique le vecteur coordonnées contenant les points (longitude, latitude) du polygon

                        if (j == 0) { // Ici, on doit considerer le point de départ pour le premier segment

                            var firstPositionLng = CesiumMath.toDegrees(cartographicFirstPosition.longitude);
                            var firstPositionLat = CesiumMath.toDegrees(cartographicFirstPosition.latitude);

                            var coordFirstPoint = [firstPositionLng, firstPositionLat];
                            var coordLastPoint = [lastPositionLng, lastPositionLat];

                            polygonsPoints.push(coordFirstPoint);
                            polygonsPoints.push(coordLastPoint);

                        } else { // sinon, on prend que le dernier point de chaque segement
                            var coordLastPoint = [lastPositionLng, lastPositionLat];
                            polygonsPoints.push(coordLastPoint);
                        }
                    }

                    geoJsonPolygons.coordinates.push(polygonsPoints);
                    featurePolygons.geometry = geoJsonPolygons;
                    featurePolygons.properties = {
                        Name: "Polygons",
                    }

                    // Une fois l'ensemble des coordonnées récupérées, on introduit
                    geoJsonObject.features.push(featurePolygons);
                }
            }
        }

        // on verifie si il y a des données déja chargées
        if (that._viewer.geoJsonData) {

            // Si oui, alors on recupere ces données

            var dataSources = that._viewer.dataSources._dataSources;

            for (var k = 0; k < dataSources.length; k++) {

                var geoJsonDataSource = that._viewer.dataSources._dataSources[k].entities.values;

                //  console.log(geoJsonDataSource);

                // var geoJsonData = that._viewer.geoJsonData.features;
                var dimGeoJsonDataSource = geoJsonDataSource.length;

                // On parcours ces données et on verifie de quel type sont ces données
                for (var l = 0; l < dimGeoJsonDataSource; l++) {

                    var geoJsonData = geoJsonDataSource[l];
                    //  console.log(geoJsonData);

                    // on recupere le type des données
                    var dataType = ["ellipse", "polyline", "point", "polygon"];

                    var geomType;

                    for (var m = 0; m < dataType.length; m++) {

                        if (geoJsonData[dataType[m]]) {
                            geomType = dataType[m];
                            //  console.log(geomType);
                            break;
                        }
                    }

                    if (geomType) {

                        var savefunction = saveGeoJsondataSourcesObject[geomType];
                        var resObject = savefunction(that, geoJsonData);

                        // console.log(resObject);

                        geoJsonObject.features.push(resObject);
                    }
                }
            }
        }

        if (geoJsonObject.features.length > 0) {

            var geoJsonData = JSON.stringify(geoJsonObject);
            var blob = new Blob([geoJsonData], {
                type: "application/octet-stream",
                endings: "native"
            });
            var url = URL.createObjectURL(blob);
            var fileName = "geoJsonFile.geojson";

            if (!that._isSaveButtonActivate) {

                that._wrapperSaveSubMenu = document.createElement('span');
                that._wrapperSaveSubMenu.className = 'cesium-subMenu-saveButton';
                container.appendChild(that._wrapperSaveSubMenu);

                that._linkDownload = document.createElement("a");
                that._linkDownload.className = 'cesium-subMenu-saveButtonLink';
                that._wrapperSaveSubMenu.appendChild(that._linkDownload);
                that._linkDownload.innerHTML = '<svg width="25px" height="25px" viewBox="-10 0 100 100"><g>\
                                          <path d="M84.514,49.615H67.009c-2.133,0-4.025,1.374-4.679,3.406c-1.734,5.375-6.691,8.983-12.329,8.983\
                                            c-5.64,0-10.595-3.608-12.329-8.983c-0.656-2.032-2.546-3.406-4.681-3.406H15.486c-2.716,0-4.919,2.2-4.919,4.919v28.054\
                                            c0,2.714,2.203,4.917,4.919,4.917h69.028c2.719,0,4.919-2.203,4.919-4.917V54.534C89.433,51.815,87.233,49.615,84.514,49.615z"/>\
                                            <path d="M48.968,52.237c0.247,0.346,0.651,0.553,1.076,0.553h0.003c0.428,0,0.826-0.207,1.076-0.558l13.604-19.133\
                                            c0.286-0.404,0.321-0.932,0.096-1.374c-0.225-0.442-0.682-0.716-1.177-0.716h-6.399V13.821c0-0.735-0.593-1.326-1.323-1.326H44.078\
                                            c-0.732,0-1.323,0.591-1.323,1.326v17.188h-6.404c-0.495,0-0.949,0.279-1.174,0.716c-0.229,0.442-0.19,0.97,0.098,1.374\
                                            L48.968,52.237z"/></g></svg>';
                that._linkDownload.className = 'cesium-button cesium-toolbar-button';
                that._linkDownload.href = url;
                that._linkDownload.download = fileName || 'unknown';
                that._linkDownload.onclick = function () {
                    // console.log(this);
                    this.parentElement.removeChild(this);
                    that._wrapperSaveSubMenu.parentElement.removeChild(that._wrapperSaveSubMenu);
                    that._isSaveButtonActivate = false;
                };
                that._isSaveButtonActivate = true;

            } else if (that._isSaveButtonActivate) {

                try {
                    console.log(that._linkDownload.parentElement);
                    that._linkDownload.parentElement.removeChild(that._linkDownload);
                    that._wrapperSaveSubMenu.parentElement.removeChild(that._wrapperSaveSubMenu);
                } catch (e) {
                    console.log(e)
                }

                that._isSaveButtonActivate = false;
            }
        }
    }
    /**
     * The view model for {@link subMenu}.
     * @alias SubMenuViewModel
     * @constructor
     */
    var SubMenuViewModel = function (viewer, container) {

        this._viewer = viewer;
        this._container = container;
        this._ellipsoid = viewer.scene.globe.ellipsoid;
        this.isPolyLineActive = false;
        this.isCircleActive = false;
        this.isCircleFromTwoPointsActive = false;
        this.isCircleFromThreePointsActive = false;
        this.isPolygonsActive = false;

        this._undoIsactivated = false;
        this._isSaveButtonActivate = false;

        var that = this;
        var collectionsObjects = collectionsInitialization(that);

        this._drawCommand = createCommand(function () {
            that.isPolyLineActive = true;
            that.isCircleActive = false;
            that.isPolygonsActive = false;
            that.isCircleFromTwoPointsActive = false;
            that.isCircleFromThreePointsActive = false;

            removeHandlers(that);
            drawLinesFunction(that, that._viewer, that._polyLinesCollection, that._polyLinesLabelsCollection);
        });

        this._circleCommand = createCommand(function () {
            that.isPolyLineActive = false;
            that.isCircleActive = true;
            that.isPolygonsActive = false;
            that.isCircleFromTwoPointsActive = false;
            that.isCircleFromThreePointsActive = false;

            removeHandlers(that);
            drawCircleFunction(that, that._viewer, that._ellipsoid, that._circleCollection, that._circlesLabelsCollection);
        });

        this._circleFromTwoPointsCommand = createCommand(function () {

            //   console.log(that);

            that.isPolyLineActive = false;
            that.isCircleActive = false;
            that.isPolygonsActive = false;
            that.isCircleFromTwoPointsActive = true;
            that.isCircleFromThreePointsActive = false;

            removeHandlers(that);
            drawCircleFromTwoPointsFunction(that, that._viewer, that._ellipsoid, that._circleCollection, that._circlesLabelsCollection, that._polyLinesCollectionTmps, that._polyLinesLabelsCollectionTmps);
        });

        this._circleFromThreePointsCommand = createCommand(function () {
            that.isPolyLineActive = false;
            that.isCircleActive = false;
            that.isPolygonsActive = false;
            that.isCircleFromTwoPointsActive = false;
            that.isCircleFromThreePointsActive = true;

            removeHandlers(that);
            drawCircleFromThreePointsFunction(that, that._viewer, that._ellipsoid, that._circleCollection, that._circlesLabelsCollection, that._polyLinesCollectionTmps, that._polyLinesLabelsCollectionTmps);
        });

        this._polygonCommand = createCommand(function () {
            that.isPolyLineActive = false;
            that.isCircleActive = false;
            that.isPolygonsActive = true;
            that.isCircleFromTwoPointsActive = false;
            that.isCircleFromThreePointsActive = false;

            removeHandlers(that);
            drawPolygonsFunction(that, that._viewer, that._ellipsoid, that._polygonsCollection, that._polygonsLabelsCollection, that._polyLinesTmpPolygons, that._polyLinesLabelsTmpPolygons);
        });

        this._trashCommand = createCommand(function () {

            that.isPolyLineActive = false;
            that.isCircleActive = false;
            that.isCircleFromTwoPointsActive = false;
            that.isCircleFromThreePointsActive = false;
            that.isPolygonsActive = false;

            that._undoIsactivated = false;
            that._isSaveButtonActivate = false;

            if (that._viewer.scene.primitives.length > 0) {

                // console.log(that._viewer);
                // console.log(that._viewer._dataSourceCollection);

                try {
                    that._viewer._dataSourceCollection.removeAll();
                    that._viewer.scene.primitives.removeAll();
                    removeHandlers(that);
                    var collection = collectionsInitialization(that);
                    that._viewer.geoJsonData = null;
                } catch (e) {
                    console.log(e)
                }
            } else {
                try {
                    removeHandlers(that);
                    var collection = collectionsInitialization(that);
                    that._viewer.geoJsonData = null;
                } catch (e) {
                    console.log(e)
                }
            }

            try {
                that._linkDownload.parentElement.removeChild(that._linkDownload);
                that._wrapperSaveSubMenu.parentElement.removeChild(that._wrapperSaveSubMenu);
            } catch (e) {
                console.log(e)
            }


        });

        this._saveCommand = createCommand(function () {
            //   console.log(that._viewer.scene.primitives);
            saveData(that, that._container);
        });

        this._infosCommand = createCommand(function () {
            console.log(that._viewer.scene.primitives);
            var geoJson = GeoJsonDataSource.entities;
            console.log(geoJson);
            console.log(that._viewer);

            that._viewer.scene.primitives.update(that._viewer.scene.frameState);
        });

        this._closeSubMenu = createCommand(function () {
            try {

                // AJOUTER LA SUPPRESSION DES DONNEES LORSQUE L'ON CHANGE DE PLANETE

                removeHandlers(that);
                that._viewer.drawLines.viewModel.subMenu.destroyWrapperMenu;
            } catch (e) {
            }
        });

        knockout.track(this, ['isCircleActive', 'isCircleFromTwoPointsActive', 'isCircleFromThreePointsActive', 'isPolyLineActive', 'isPolygonsActive']);

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
        circleFromTwoPointsCommand: {
            get: function () {
                return this._circleFromTwoPointsCommand;
            }
        },
        circleFromThreePointsCommand: {
            get: function () {
                return this._circleFromThreePointsCommand;
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
        infosCommand: {
            get: function () {
                return this._infosCommand;
            }
        },
        closeSubMenu: {
            get: function () {
                return this._closeSubMenu;
            }
        },
        removeAllCommands: {
            get: function () {
                this.isPolyLineActive = false;
                this.isCircleActive = false;
                this.isSaveButtonActivate = false;
                this.isCircleFromTwoPointsActive = false;
                this.isCircleFromThreePointsActive = false;

                if (this._handlerLeftClick)
                    this._handlerLeftClick.removeInputAction(ScreenSpaceEventType.LEFT_CLICK);
                if (this._handlerMiddleClick)
                    this._handlerMiddleClick.removeInputAction(ScreenSpaceEventType.MIDDLE_CLICK);
                if (this._handlerRightClick)
                    this._handlerRightClick.removeInputAction(ScreenSpaceEventType.RIGHT_CLICK);
                if (this._handlerDblLeftClick)
                    this._handlerDblLeftClick.removeInputAction(ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
                if (this._handlerMove)
                    this._handlerMove.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);

                if (this._handlerLeftClickCircle)
                    this._handlerLeftClickCircle.removeInputAction(ScreenSpaceEventType.LEFT_CLICK);
                if (this._handlerRightClickCircle)
                    this._handlerRightClickCircle.removeInputAction(ScreenSpaceEventType.RIGHT_CLICK);
                if (this._handlerLeftDblClickCircle)
                    this._handlerLeftDblClickCircle.removeInputAction(ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
                if (this._handlerMouseMoveCircle)
                    this._handlerMouseMoveCircle.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);


                //   collectionsInitialization(this);
            }
        },
        removeAllHandlers: {
            get: function () {

                if (this._handlerLeftClick)
                    this._handlerLeftClick.removeInputAction(ScreenSpaceEventType.LEFT_CLICK);
                if (this._handlerMiddleClick)
                    this._handlerMiddleClick.removeInputAction(ScreenSpaceEventType.MIDDLE_CLICK);
                if (this._handlerRightClick)
                    this._handlerRightClick.removeInputAction(ScreenSpaceEventType.RIGHT_CLICK);
                if (this._handlerDblLeftClick)
                    this._handlerDblLeftClick.removeInputAction(ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
                if (this._handlerMove)
                    this._handlerMove.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);

                if (this._handlerLeftClickCircle)
                    this._handlerLeftClickCircle.removeInputAction(ScreenSpaceEventType.LEFT_CLICK);
                if (this._handlerRightClickCircle)
                    this._handlerRightClickCircle.removeInputAction(ScreenSpaceEventType.RIGHT_CLICK);
                if (this._handlerLeftDblClickCircle)
                    this._handlerLeftDblClickCircle.removeInputAction(ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
                if (this._handlerMouseMoveCircle)
                    this._handlerMouseMoveCircle.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);

                //   collectionsInitialization(this);
            }
        },
    });

// ================================================================================================================================
// ======================================================= LOCAL FUNCTIONS ========================================================
// ================================================================================================================================

    function collectionsInitialization(that) {

        var polyLines;
        var polyLinesTmps;
        var circles;
        var polygons;
        var circlesLabels;
        var polyLinesLabels;
        var polyLinesLabelsTmps;
        var polygonsLabels;
        var polyLinesTmpPolygons;
        var polyLinesLabelsTmpPolygons;

        var primitives = that._viewer.scene.primitives._primitives;

        // console.log(primitives);

        if (primitives.length === 0) {

            // respecter l'ordre de creation des collection pour la bonne sauvegarde des données
            // ==> Respecter l'ordre suivant Objet - label de l'objet - objet - label de l'objet - etc...

            polyLines = that._viewer.scene.primitives.add(new PolylineCollection());
            polyLinesLabels = that._viewer.scene.primitives.add(new LabelCollection());

            circles = that._viewer.scene.primitives.add(new PrimitiveCollection());
            circlesLabels = that._viewer.scene.primitives.add(new LabelCollection());

            polygons = that._viewer.scene.primitives.add(new PrimitiveCollection());
            polygonsLabels = that._viewer.scene.primitives.add(new LabelCollection());

            polyLinesTmpPolygons = that._viewer.scene.primitives.add(new PolylineCollection());
            polyLinesLabelsTmpPolygons = that._viewer.scene.primitives.add(new LabelCollection());

            polyLinesTmps = that._viewer.scene.primitives.add(new PolylineCollection());
            polyLinesLabelsTmps = that._viewer.scene.primitives.add(new LabelCollection());

            circles.associatedObject = 'circleGeomtry';
            circlesLabels.associatedObject = 'circlesLabels';
            polyLines.associatedObject = 'polylines';
            polyLinesTmps.associatedObject = 'polylinesTmps';
            polyLinesLabels.associatedObject = 'polyLinesLabels';
            polyLinesLabelsTmps.associatedObject = 'polyLinesLabelsTmps';
            polygons.associatedObject = 'polygonsGeomtry';
            polygonsLabels.associatedObject = 'polygonsLabels';
            polyLinesTmpPolygons.associatedObject = 'polylinesTmpPolygons';
            polyLinesLabelsTmpPolygons.associatedObject = 'polyLinesLabelsTmpPolygons';

            //   console.log(that._viewer.scene.primitives)

        } else if (primitives.length > 0) {

            var statusFindpolyLines = false;
            var statusFindpolyLinesTmps = false;
            var statusFindcircle = false;
            var statusFindCirclesLabels = false;
            var statusFindpolyLinesLabels = false;
            var statusFindpolyLinesLabelsTmps = false;
            var statusFindPolygons = false;
            var statusFindPolygonsLabels = false;
            var statusFindpolyLinesTmpPolygons = false;
            var statusFindpolyLinesLabelsTmpPolygons = false;

            for (var i = 0; i < primitives.length; i++) {

                //  console.log(i);

                if (primitives[i].associatedObject === "polylines") {

                    polyLines = primitives[i];
                    statusFindpolyLines = true;
                    console.log("polylines");
                    continue;
                }


                if (primitives[i].associatedObject === 'polylinesTmps') {

                    polyLinesTmps = primitives[i];
                    statusFindpolyLinesTmps = true;
                    console.log("polyLinesTmps");
                    continue;
                }

                if (primitives[i].associatedObject === 'circleGeomtry') {
                    circles = primitives[i];
                    statusFindcircle = true;
                    console.log("circleGeomtry");
                    continue;
                }

                if (primitives[i].associatedObject === 'polygonsGeomtry') {
                    polygons = primitives[i];
                    statusFindPolygons = true;
                    console.log("polygonsGeomtry");
                    continue;

                }

                if (primitives[i].associatedObject === 'polylinesTmpPolygons') {
                    polyLinesTmpPolygons = primitives[i];
                    statusFindpolyLinesTmpPolygons = true;
                    console.log("polylinesTmpPolygons");
                    continue;
                }

                if (primitives[i]._labels) {

                    if (primitives[i].associatedObject === "circlesLabels") {
                        circlesLabels = primitives[i];
                        statusFindCirclesLabels = true;
                        console.log("circlesLabels");
                        continue;
                    }

                    if (primitives[i].associatedObject === "polyLinesLabels") {
                        polyLinesLabels = primitives[i];
                        statusFindpolyLinesLabels = true;
                        console.log("polyLinesLabels");
                        continue;
                    }

                    if (primitives[i].associatedObject === "polyLinesLabelsTmps") {
                        polyLinesLabelsTmps = primitives[i];
                        statusFindpolyLinesLabelsTmps = true;
                        console.log("polyLinesLabelsTmps");
                        continue;
                    }

                    if (primitives[i].associatedObject === 'polygonsLabels') {
                        polygonsLabels = primitives[i];
                        statusFindPolygonsLabels = true;
                        console.log("polygonsLabels");
                        continue;
                    }

                    if (primitives[i].associatedObject === 'polyLinesLabelsTmpPolygons') {
                        polyLinesLabelsTmpPolygons = primitives[i];
                        statusFindpolyLinesLabelsTmpPolygons = true;
                        console.log("polyLinesLabelsTmpPolygons");
                        continue;
                    }
                }

                if (statusFindpolyLines && statusFindCirclesLabels && statusFindpolyLinesLabels && statusFindcircle && statusFindPolygons && statusFindPolygonsLabels && statusFindpolyLinesTmps && statusFindpolyLinesLabelsTmps && statusFindpolyLinesTmpPolygons && statusFindpolyLinesLabelsTmpPolygons)
                    break;

                if (i === primitives.length - 1) {

                    /*     console.log(statusFindpolyLines);
                     console.log(statusFindpolyLinesTmps);
                     console.log(statusFindcircle);
                     console.log(statusFindCirclesLabels);
                     console.log(statusFindpolyLinesLabels);
                     console.log(statusFindpolyLinesLabelsTmps);
                     console.log(statusFindPolygons);
                     console.log(statusFindPolygonsLabels);
                     console.log(statusFindpolyLinesTmpPolygons);
                     console.log(statusFindpolyLinesLabelsTmpPolygons);*/

                    if (!statusFindpolyLines) {
                        polyLines = that._viewer.scene.primitives.add(new PolylineCollection());
                        polyLines.associatedObject = 'polylines';
                        statusFindpolyLines = true;
                        console.log("line");
                    }

                    if (!statusFindpolyLinesLabels) {
                        polyLinesLabels = that._viewer.scene.primitives.add(new LabelCollection());
                        polyLinesLabels.associatedObject = 'polyLinesLabels';
                        statusFindpolyLinesLabels = true;
                        console.log("lineLabel");
                    }

                    if (!statusFindpolyLinesTmps) {
                        polyLinesTmps = that._viewer.scene.primitives.add(new PolylineCollection());
                        polyLinesTmps.associatedObject = 'polylinesTmps';
                        statusFindpolyLinesTmps = true;
                        console.log("lineTmps");
                    }

                    if (!statusFindpolyLinesLabelsTmps) {
                        polyLinesLabelsTmps = that._viewer.scene.primitives.add(new LabelCollection());
                        polyLinesLabelsTmps.associatedObject = 'polyLinesLabelsTmps';
                        statusFindpolyLinesLabelsTmps = true;
                        console.log("lineLabelTmps");
                    }

                    if (!statusFindcircle) {
                        circles = that._viewer.scene.primitives.add(new PrimitiveCollection());
                        circles.associatedObject = 'circleGeomtry';
                        statusFindcircle = true;
                        console.log("circle");
                    }

                    if (!statusFindCirclesLabels) {
                        circlesLabels = that._viewer.scene.primitives.add(new LabelCollection());
                        circlesLabels.associatedObject = 'circlesLabels';
                        statusFindCirclesLabels = true;
                        console.log("circlesLabels");
                    }

                    if (!statusFindPolygons) {
                        polygons = that._viewer.scene.primitives.add(new PrimitiveCollection());
                        polygons.associatedObject = 'polygonsGeomtry';
                        statusFindPolygons = true;
                        console.log("polygonsGeomtry");
                    }

                    if (!statusFindPolygonsLabels) {
                        polygonsLabels = that._viewer.scene.primitives.add(new LabelCollection());
                        polygonsLabels.associatedObject = 'polygonsLabels';
                        statusFindPolygonsLabels = true;
                        console.log("polygonsLabels");
                    }

                    if (!statusFindpolyLinesTmpPolygons) {
                        polyLinesTmpPolygons = that._viewer.scene.primitives.add(new PolylineCollection());
                        polyLinesTmpPolygons.associatedObject = 'polylinesTmpPolygons';
                        statusFindpolyLinesTmpPolygons = true;
                        console.log("polylinesTmpPolygons");
                    }

                    if (!statusFindpolyLinesLabelsTmpPolygons) {
                        polyLinesLabelsTmpPolygons = that._viewer.scene.primitives.add(new LabelCollection());
                        polyLinesLabelsTmpPolygons.associatedObject = 'polyLinesLabelsTmpPolygons';
                        statusFindpolyLinesLabelsTmpPolygons = true;
                        console.log("polyLinesLabelsTmpPolygons");
                    }
                }
            }
        }

        var collectionsObject = {
            polylines: polyLines,
            polylinesTmps: polyLinesTmps,
            polylinesLables: polyLinesLabels,
            polylinesLablesTmps: polyLinesLabelsTmps,
            circles: circles,
            circleLabels: circlesLabels,
            polygons: polygons,
            polygonsLabels: polygonsLabels,
            polyLinesTmpPolygons: polyLinesTmpPolygons,
            polyLinesLabelsTmpPolygons: polyLinesLabelsTmpPolygons
        };

        that._polyLinesCollection = collectionsObject.polylines;
        that._circlesLabelsCollection = collectionsObject.circleLabels;
        that._polyLinesLabelsCollection = collectionsObject.polylinesLables;
        that._polyLinesCollectionTmps = collectionsObject.polylinesTmps;
        that._polyLinesLabelsCollectionTmps = collectionsObject.polylinesLablesTmps;
        that._circleCollection = collectionsObject.circles;
        that._polygonsLabelsCollection = collectionsObject.polygonsLabels;
        that._polygonsCollection = collectionsObject.polygons;
        that._polyLinesTmpPolygons = collectionsObject.polyLinesTmpPolygons;
        that._polyLinesLabelsTmpPolygons = collectionsObject.polyLinesLabelsTmpPolygons;

        // console.log(that);

        return collectionsObject;
    }

    function removeHandlers(that) {

        if (that._handlerLeftClick)
            that._handlerLeftClick.removeInputAction(ScreenSpaceEventType.LEFT_CLICK);
        if (that._handlerMiddleClick)
            that._handlerMiddleClick.removeInputAction(ScreenSpaceEventType.MIDDLE_CLICK);
        if (that._handlerRightClick)
            that._handlerRightClick.removeInputAction(ScreenSpaceEventType.RIGHT_CLICK);
        if (that._handlerDblLeftClick)
            that._handlerDblLeftClick.removeInputAction(ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        if (that._handlerMove)
            that._handlerMove.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);

        if (that._handlerLeftClickCircle)
            that._handlerLeftClickCircle.removeInputAction(ScreenSpaceEventType.LEFT_CLICK);
        if (that._handlerRightClickCircle)
            that._handlerRightClickCircle.removeInputAction(ScreenSpaceEventType.RIGHT_CLICK);
        if (that._handlerLeftDblClickCircle)
            that._handlerLeftDblClickCircle.removeInputAction(ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        if (that._handlerMouseMoveCircle)
            that._handlerMouseMoveCircle.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);



        try {
            that._viewer.editDrawing.viewModel.subMenu.viewModel.removeAllCommands;
        } catch (e) {
            //  console.log(e);
        }

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
