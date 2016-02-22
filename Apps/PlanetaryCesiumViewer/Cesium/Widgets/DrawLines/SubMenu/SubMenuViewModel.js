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
                        }

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
                    x: beforeLastpolylineLabel._position.x,
                    y: beforeLastpolylineLabel._position.y,
                    z: beforeLastpolylineLabel._position.z
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


                    try {
                        var beforeLastPolyline = polyLines._polylines[dim - 2];
                        var cartesianPosition = beforeLastPolyline._actualPositions[0];
                        that._coordFirstPosition = viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesianPosition);
                    } catch (e) {
                    }

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

            that.isPolyLineActive = false; // to prevent servral instance of the same Handlers
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

            that.isCircleActive = false; // to prevent servral instance of the same Handlers
        }
    }











    function drawCircleFromTwoPointsFunction(that, viewer, ellipsoid, circleCollection, circlesLabels, polyLinesTmps, polyLinesLabelsTmps) {

        // use that to check if we are on the canvas or not (for example, on a button);
        document.onmousemove = getPosition;

        if (that.isCircleActive) {

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
                        
                        console.log(startPoint);
                        
                        
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
                                    color: Color.YELLOW
                                })
                            };

                            // on determine la distance entre les deux points 

                            var startPoint = Cartesian3.fromRadians(arrayRadians[0], arrayRadians[1], cartographic.height, ellipsoid);
                            var endPoint = Cartesian3.fromRadians(arrayRadians[2], arrayRadians[3], cartographicMovePosition.height, ellipsoid);
                            var distance = Cartesian3.distance(endPoint, startPoint);
                            var distanceTrunc = distance.toFixed(2);

                            // on détermine le milieu du segement

                            var middlePoint = {
                                x: (cartesianMovePosition.x + cartesian.x) / 2.0,
                                y: (cartesianMovePosition.y + cartesian.y) / 2.0,
                                z: (cartesianMovePosition.z + cartesian.z) / 2.0,
                            }

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

                            /*   if (!that._undoIsactivated) {
                             arrayRadians = [];
                             arrayRadians.push(cartographic.longitude);
                             arrayRadians.push(cartographic.latitude);
                             } else {
                             arrayRadians = [];
                             arrayRadians.push(that._coordFirstPosition.longitude);
                             arrayRadians.push(that._coordFirstPosition.latitude);
                             }*/

                            oldLabel = newLabelPolyline;
                        }
                    }, ScreenSpaceEventType.MOUSE_MOVE);
                }


            }, ScreenSpaceEventType.LEFT_CLICK);
        }
    }

























    function drawPolygonsFunction(that, viewer, ellipsoid, polygonsCollection, polygonsLabelsCollection) {

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
            var polyLinesTmp = viewer.scene.primitives.add(new PolylineCollection());
            var polyLinesLabelsTmp = viewer.scene.primitives.add(new LabelCollection());

            polyLinesTmp.associatedObject = 'polylinesTmpPolygons';
            polyLinesLabelsTmp.associatedObject = 'polyLinesLabelsTmpPolygons';

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
                                    color: Color.YELLOW
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
                            polyLinesTmp.add(newPolyLine);

                            // on ajoute le label dans la scene pour le rendu
                            polyLinesLabelsTmp.add(newLabelPolyline);

                            // Dans les lignes suivantes, on verifie si il y a déja un tracé de ligne.
                            // Si oui, alors on retir la ligne précedente ansi que son label associé.
                            // Cela donne un effet de dynamisme dans le rendu
                            var dim = polyLinesTmp._polylines.length;
                            var dimLabel = polyLinesLabelsTmp._labels.length;

                            if (dim > 1) {
                                var polyline = polyLinesTmp._polylines[dim - 2];
                                polyLinesTmp.remove(polyline);

                                var primitiveLabel = polyLinesLabelsTmp._labels[dimLabel - 2];
                                polyLinesLabelsTmp.remove(primitiveLabel);
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

                    polyLinesTmp.add(newPolyLine);
                    polyLinesLabelsTmp.add(oldLabel);

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
                                color: ColorGeometryInstanceAttribute.fromColor(new Color(1.0, 1.0, 0.0, 0.3))
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
                var dim = polyLinesTmp._polylines.length;
                var dimLabel = polyLinesLabelsTmp._labels.length;

                // On recupere la derniere ligne ainsi que le dernier label pour suppresion 
                var polyline = polyLinesTmp._polylines[dim - 1];
                var polylineLabel = polyLinesLabelsTmp._labels[dimLabel - 1];

                polyLinesTmp.remove(polyline);
                polyLinesLabelsTmp.remove(polylineLabel);

                that._handlerMove.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);
                that._handlerMove = new ScreenSpaceEventHandler(viewer.scene.canvas);

                // ajout de la deniere ligne
                var dimSegment = polyLinesTmp._polylines.length;

                var firstLine = polyLinesTmp._polylines[0];
                var lastLine = polyLinesTmp._polylines[dimSegment - 2];

                var firstLineStartPoint = firstLine._actualPositions[0];
                var lasttLineStartPoint = lastLine._actualPositions[lastLine._actualPositions.length - 1];

                var finalLine = [firstLineStartPoint, lasttLineStartPoint];

                var finalPolyLine = {
                    positions: PolylinePipeline.generateCartesianArc({
                        positions: finalLine,
                        ellipsoid: ellipsoid
                    }),
                    material: Material.fromType('Color', {
                        color: Color.YELLOW
                    })
                };

                polyLinesTmp.add(finalPolyLine);

                // on reevalue la dimension de polyLinesTmp._polylines car une nouvelle
                // ligne a été introduite. Cela est important pour le calcul de la distance
                // totale

                var dimSegmentFinal = polyLinesTmp._polylines.length;

                var smumDistance = 0;

                for (var j = 0; j < dimSegmentFinal; j++) {
                    if (polyLinesTmp._polylines[j]) {
                        var dimSeg = polyLinesTmp._polylines[j]._actualPositions.length;
                        var posStart = polyLinesTmp._polylines[j]._actualPositions[0];
                        var posEnd = polyLinesTmp._polylines[j]._actualPositions[dimSeg - 1];

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

                polyLinesLabelsTmp.add(finalLabelPolyline);

                polyLinesTmp = viewer.scene.primitives.add(new PolylineCollection());
                polyLinesLabelsTmp = that._viewer.scene.primitives.add(new LabelCollection());

                polyLinesTmp.associatedObject = 'polylinesTmpPolygons';
                polyLinesLabelsTmp.associatedObject = 'polyLinesLabelsTmpPolygons';

            }, ScreenSpaceEventType.MIDDLE_CLICK);

            that._handlerRightClick.setInputAction(function () {

                that._undoIsactivated = true;
                var dim = polyLinesTmp._polylines.length;
                var dimLabel = polyLinesLabelsTmp._labels.length;

                if (dim > 1) {

                    var polyline = polyLinesTmp._polylines[dim - 1];
                    var polylineLabel = polyLinesLabelsTmp._labels[dimLabel - 1];

                    try {
                        var beforeLastPolyline = polyLinesTmp._polylines[dim - 2];
                        var cartesianPosition = beforeLastPolyline._actualPositions[0];
                        that._coordFirstPosition = viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesianPosition);
                    } catch (e) {
                    }

                    coordLinesForPolygonsRadians = [];
                    coordLinesForPolygonsRadians.push(that._coordFirstPosition.longitude);
                    coordLinesForPolygonsRadians.push(that._coordFirstPosition.latitude);

                    polyLinesTmp.remove(polyline);
                    polyLinesLabelsTmp.remove(polylineLabel);

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
                            color: ColorGeometryInstanceAttribute.fromColor(new Color(1.0, 1.0, 0.0, 0.3))
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

                    var polyline = polyLinesTmp._polylines[dim - 1];
                    var polylineLabel = polyLinesLabelsTmp._labels[dimLabel - 1];
                    polyLinesTmp.remove(polyline);
                    polyLinesLabelsTmp.remove(polylineLabel);

                    that._handlerMove.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);
                    that._handlerMove = new ScreenSpaceEventHandler(viewer.scene.canvas);

                    coordLinesForPolygonsRadians = [];

                } else if (dim == 0) {

                    console.log("dim == 0");

                    coordLinesForPolygonsRadians = [];

                }
            }, ScreenSpaceEventType.RIGHT_CLICK);

            that.isPolygonsActive = false; // to prevent servral instance of the same Handlers  
        }
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

                console.log(primitives[i]);

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

                console.log(totalLengthPath);

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
                            radius: circleRadius.toFixed(3) + " m",
                            surface: circleSurface + " m2"
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


                        // on introduit le vecteur line dans la propriété "coordinates" de l'objet geoJsonPolyline  
                        /*   geoJsonPolygons.coordinates.push(line);
                         featurePolygons.geometry = geoJsonPolygons;*/
                    }

                    geoJsonPolygons.coordinates.push(polygonsPoints);
                    featurePolygons.geometry = geoJsonPolygons;
                    featurePolygons.properties = {
                        Name: "Polygons"
                    }

                    // Une fois l'ensemble des coordonnées récupérées, on introduit
                    geoJsonObject.features.push(featurePolygons);
                }
            }

        }
        console.log(geoJsonObject);


        // on verifie si il y a des données déja chargées
        if (that._viewer.geoJsonData) {

            // Si oui, alors on recupere ces données
            var geoJsonData = that._viewer.geoJsonData.features;
            var dimGeoJsonData = geoJsonData.length;

            // On parcours ces données et on verifie de quel type sont ces données
            for (var l = 0; l < dimGeoJsonData; l++) {

                // on recupere le type des données
                var geomType = geoJsonData[l].geometry.type;

                if (geomType === "Polygon" || geomType === "LineString" || geomType === "MultiLineString" || geomType === "MultiPoint") {
                    geoJsonObject.features.push(geoJsonData[l]);
                }

                if (geomType === "Point") {
                    if (geoJsonData[l].properties.radius) {
                        geoJsonObject.features.push(geoJsonData[l]);
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
                    console.log(this);
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
        this.isPolygonsActive = false;

        this._undoIsactivated = false;
        this._isSaveButtonActivate = false;

        var that = this;
        var collectionsObjects = collectionsInitialization(that);

        this._drawCommand = createCommand(function () {
            that.isPolyLineActive = true;
            that.isCircleActive = false;
            that.isPolygonsActive = false;
            removeHandlers(that);
            drawLinesFunction(that, that._viewer, that._polyLinesCollection, that._polyLinesLabelsCollection);
        });

        this._circleCommand = createCommand(function () {
            that.isPolyLineActive = false;
            that.isCircleActive = true;
            that.isPolygonsActive = false;

            removeHandlers(that);
            drawCircleFunction(that, that._viewer, that._ellipsoid, that._circleCollection, that._circlesLabelsCollection);
        });

        this._circleFromTwoPointsCommand = createCommand(function () {
            that.isPolyLineActive = false;
            that.isCircleActive = true;
            that.isPolygonsActive = false;

            removeHandlers(that);
            drawCircleFromTwoPointsFunction(that, that._viewer, that._ellipsoid, that._circleCollection, that._circlesLabelsCollection, that._polyLinesCollectionTmps, that._polyLinesLabelsCollectionTmps);
        });

        this._polygonCommand = createCommand(function () {
            that.isPolyLineActive = false;
            that.isCircleActive = false;
            that.isPolygonsActive = true;
            removeHandlers(that);
            drawPolygonsFunction(that, that._viewer, that._ellipsoid, that._polygonsCollection, that._polygonsLabelsCollection);
        });

        this._trashCommand = createCommand(function () {

            if (that._viewer.scene.primitives.length > 0) {

                try {
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
        });

        this._saveCommand = createCommand(function () {
            console.log(that._viewer.scene.primitives);
            saveData(that, that._container);
        });

        this._infosCommand = createCommand(function () {
            console.log(that._viewer.scene.primitives);
            var geoJson = GeoJsonDataSource.entities;
            console.log(geoJson);
            console.log(that._viewer.imageryLayers);

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

        knockout.track(this, ['isCircleActive', 'isPolyLineActive', 'isPolygonsActive']);

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

        var primitives = that._viewer.scene.primitives._primitives;

        if (primitives.length === 0) {

            polyLines = that._viewer.scene.primitives.add(new PolylineCollection());
            polyLinesTmps = that._viewer.scene.primitives.add(new PolylineCollection());
            polyLinesLabels = that._viewer.scene.primitives.add(new LabelCollection());
            polyLinesLabelsTmps = that._viewer.scene.primitives.add(new LabelCollection());
            circles = that._viewer.scene.primitives.add(new PrimitiveCollection());
            circlesLabels = that._viewer.scene.primitives.add(new LabelCollection());
            polygons = that._viewer.scene.primitives.add(new PrimitiveCollection());
            polygonsLabels = that._viewer.scene.primitives.add(new LabelCollection());

            circles.associatedObject = 'circleGeomtry';
            circlesLabels.associatedObject = 'circlesLabels';
            polyLines.associatedObject = 'polylines';
            polyLinesTmps.associatedObject = 'polylinesTmps';
            polyLinesLabels.associatedObject = 'polyLinesLabels';
            polyLinesLabelsTmps.associatedObject = 'polyLinesLabelsTmps';
            polygons.associatedObject = 'polygonsGeomtry';
            polygonsLabels.associatedObject = 'polygonsLabels';

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

            for (var i = 0; i < primitives.length; i++) {


                if (primitives[i]._polylines) {

                    polyLines = primitives[i];
                    statusFindpolyLines = true;
                    continue;
                }


                if (primitives[i].associatedObject === 'polyLinesTmps') {

                    polyLinesTmps = primitives[i];
                    statusFindpolyLinesTmps = true;
                    continue;
                }

                if (primitives[i].associatedObject === 'circleGeomtry') {
                    circles = primitives[i];
                    statusFindcircle = true;
                    continue;
                }

                if (primitives[i].associatedObject === 'polygonsGeomtry') {
                    polygons = primitives[i];
                    statusFindPolygons = true;
                    continue;
                }

                if (primitives[i]._labels) {

                    if (primitives[i].associatedObject === "circlesLabels") {
                        circlesLabels = primitives[i];
                        statusFindCirclesLabels = true;
                        continue;
                    }

                    if (primitives[i].associatedObject === "polyLinesLabels") {
                        polyLinesLabels = primitives[i];
                        statusFindpolyLinesLabels = true;
                        continue;
                    }

                    if (primitives[i].associatedObject === "polyLinesLabelsTmps") {
                        polyLinesLabelsTmps = primitives[i];
                        statusFindpolyLinesLabelsTmps = true;
                        continue;
                    }

                    if (primitives[i].associatedObject === 'polygonsLabels') {
                        polygonsLabels = primitives[i];
                        statusFindPolygonsLabels = true;
                        continue;
                    }
                }

                if (statusFindpolyLines && statusFindCirclesLabels && statusFindpolyLinesLabels && statusFindcircle && statusFindPolygons && statusFindPolygonsLabels && statusFindpolyLinesTmps && statusFindpolyLinesLabelsTmps)
                    break;

                if (i === primitives.length - 1) {

                    if (!statusFindpolyLines) {
                        polyLines = that._viewer.scene.primitives.add(new PolylineCollection());
                        polyLines.associatedObject = 'polylines';
                        statusFindpolyLines = true;
                        console.log("line");
                    }

                    if (!statusFindpolyLinesTmps) {
                        polyLinesTmps = that._viewer.scene.primitives.add(new PolylineCollection());
                        polyLinesTmps.associatedObject = 'polyLinesTmps';
                        statusFindpolyLinesTmps = true;
                        console.log("lineTmps");
                    }

                    if (!statusFindpolyLinesLabels) {
                        polyLinesLabels = that._viewer.scene.primitives.add(new LabelCollection());
                        polyLinesLabels.associatedObject = 'polyLinesLabels';
                        statusFindpolyLinesLabels = true;
                        console.log("lineLabel");
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
            polygonsLabels: polygonsLabels

        };

        that._polyLinesCollection = collectionsObject.polylines;
        that._polyLinesCollectionTmps = collectionsObject.polylinesTmps;
        that._circlesLabelsCollection = collectionsObject.circleLabels;
        that._polyLinesLabelsCollection = collectionsObject.polylinesLables;
        that._polyLinesLabelsCollectionTmps = collectionsObject.polylinesLablesTmps;
        that._circleCollection = collectionsObject.circles;
        that._polygonsLabelsCollection = collectionsObject.polygonsLabels;
        that._polygonsCollection = collectionsObject.polygons;

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
