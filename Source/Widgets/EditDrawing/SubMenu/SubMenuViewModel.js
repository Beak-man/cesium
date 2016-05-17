// 275.484,39.095 ==> Coordonnees du stade
// 256.955,42.127 ==> coordonnées des cercles de cultures

/*global define*/
define([
    '../../../Core/Math',
    '../../../Core/Cartesian2',
    '../../../Core/Cartesian3',
    '../../../Core/Color',
    './ColorPicker/ColorPicker',
    '../../createCommand',
    '../../../Core/defined',
    '../../../Core/defineProperties',
    '../../../DataSources/EntityCollection',
    '../../../DataSources/GeoJsonDataSource',
    '../../../Core/KeyboardEventModifier',
    '../../../ThirdParty/knockout',
    '../../../Scene/Material',
    '../../../Scene/MaterialAppearance',
    '../../../Core/ScreenSpaceEventHandler',
    '../../../Core/ScreenSpaceEventType'
], function (
        CesiumMath,
        Cartesian2,
        Cartesian3,
        Color,
        ColorPicker,
        createCommand,
        defined,
        defineProperties,
        EntityCollection,
        GeoJsonDataSource,
        KeyboardEventModifier,
        knockout,
        Material,
        MaterialAppearance,
        ScreenSpaceEventHandler,
        ScreenSpaceEventType
        ) {
    "use strict";

    function flagFunctionV2(that, viewer) {

        try {
            that._viewer.drawLines.viewModel.subMenu.viewModel.removeAllCommands;
        } catch (e) {
        }

        try {
            that._viewer.editDrawing.viewModel.subMenu.viewModel.colorPicker.destroyColorPickerContainer;
        } catch (e) {
        }

        try {

            that._viewer.editDrawing.viewModel.subMenu.viewModel.colorPicker.viewModel.removeHandlers;
        } catch (e) {
        }

        if (!that._isflagCommandActive) {

            that._handlerLeft = new ScreenSpaceEventHandler(viewer.scene.canvas);
            that._handlerRight = new ScreenSpaceEventHandler(viewer.scene.canvas);

            /*==================================================================
             ====================== SUPRESSION DE L'OBJET ======================
             =================================================================== */

            that._handlerRight.setInputAction(function (click) {

                var ellipsoid = viewer.scene.globe.ellipsoid;

                var pickedObject = null;

                // on capture un objet avec le click de la souris
                pickedObject = viewer.scene.pick(click.position);

                var objectId;
                var id;

                if (pickedObject.id) {
                    objectId = pickedObject.id;
                    id = pickedObject.id.id;
                }

                objectId.entityCollection.remove(objectId);
                console.log("suppression done");

            }, ScreenSpaceEventType.RIGHT_CLICK);

            /*==================================================================
             ========================= Valid (VERT) ============================
             =================================================================== */

            that._handlerLeft.setInputAction(function (click) {

                // on recupere l'ellipsoid
                var ellipsoid = viewer.scene.globe.ellipsoid;

                var pickedObject = null;

                // on capture un objet avec le click de la souris
                pickedObject = viewer.scene.pick(click.position);

                //  console.log(pickedObject);

                var objectId;
                var id;

                if (pickedObject.id) {
                    objectId = pickedObject.id;
                    id = pickedObject.id.id;
                }

                //  objectId.ellipse.material.color = that._viewer.editDrawing.viewModel.subMenu.viewModel.colorPicker.viewModel.selectedColor;

                if (pickedObject.id) {

                    for (var i = 0; i < that._propertiesNames.length; i++) {

                        if (objectId[that._propertiesNames[i]]) {

                            var objectType = objectId[that._propertiesNames[i]];

                            if (that._propertiesNames[i] == "ellipse" || that._propertiesNames[i] == 'point') {

                                var objectTypeEllipse = objectId['ellipse'];
                                var objectTypePoint = objectId['point'];

                                try {
                                    var getColorObject = that._viewer.editDrawing.viewModel.subMenu.viewModel.colorPicker.viewModel.tableViewModel.selectedColor;

                                    if (getColorObject != null) {

                                        var colorObjectN = getColorObject.normalizedColor;
                                        var colorObject = getColorObject.color;
                                        var colorProperty = getColorObject.property;

                                        objectTypeEllipse.material.color = colorObjectN;

                                        objectTypePoint.color = colorObjectN;
                                        objectTypePoint.outlineColor._value = colorObjectN;
                                        objectTypePoint.outlineWidth._value = 3;


                                        var rgba = parseInt(colorObject.red) + ", " + parseInt(colorObject.green) + ", " + parseInt(colorObject.blue) + ", " + colorObject.alpha;
                                        objectId.properties.flagColor = rgba;
                                        objectId.properties[colorProperty.propertyName] = colorProperty.propertyValue;


                                        var entities = objectId.entityCollection._entities._array;
                                        that._viewer.editDrawing.viewModel.subMenu.viewModel.colorPicker.flagCounter.viewModel.counterUpdate = entities;

                                        break;

                                    }
                                } catch (e) {
                                    //console.log(that._viewer.editDrawing.viewModel.subMenu.viewModel);
                                    var getColorObject = that._viewer.editDrawing.viewModel.subMenu.viewModel.colorPicker.viewModel.tableViewModel.selectedColor;

                                    if (getColorObject != null) {

                                        var colorObjectN = getColorObject.normalizedColor;
                                        var colorObject = getColorObject.color;
                                        var colorProperty = getColorObject.property;

                                        objectType.color = colorObjectN;
                                        objectType.outlineColor._value = colorObjectN;
                                        objectType.outlineWidth._value = 3;

                                        var rgba = parseInt(colorObject.red) + ", " + parseInt(colorObject.green) + ", " + parseInt(colorObject.blue) + ", " + colorObject.alpha;
                                        objectId.properties.flagColor = rgba;
                                        objectId.properties[colorProperty.PropertyName] = colorProperty.PropertyValue;

                                        break;
                                    }
                                }
                            }
                        }
                    }
                } else {

                    var objectPrimitive = pickedObject.primitive;

                    var getColorObject = that._viewer.editDrawing.viewModel.subMenu.viewModel.colorPicker.viewModel.tableViewModel.selectedColor;

                    if (getColorObject != null) {

                        var colorObjectN = getColorObject.normalizedColor;
                        var colorObject = getColorObject.color;
                        var colorProperty = getColorObject.property;

                        var appearance = new MaterialAppearance({
                            material: Material.fromType('Color', {color: colorObjectN}),
                            faceForward: true
                        })

                        if (objectPrimitive.material) { // for polylines

                            console.log(objectPrimitive.material);
                            objectPrimitive.material.uniforms.color = colorObjectN;

                        } else {

                            objectPrimitive.appearance = appearance; // for circles and polygons
                        }

                    }
                }

                console.log("flag done");

            }, ScreenSpaceEventType.LEFT_CLICK);

            that._isflagCommandActive = true;
        }
    }

    var saveGeoJsondataSourcesObject = {
        ellipse: createEllipseGeoJsonObect,
        polygon: createPolygonGeoJsonObect,
        point: createPointGeoJsonObect,
        polyline: createPolylineGeoJsonObect
    }

    function createEllipseGeoJsonObect(that, geoJsonDataSource) {

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

        //  console.log(geoJsonDataSource);

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

        // console.log(distance);

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

                //  console.log(primitives[i]);

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

                //  console.log(totalLengthPath);

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

        // on verifie si il y a des données déja chargées
        if (that._viewer.geoJsonData) {

            // Si oui, alors on recupere ces données IL FAUT GENERALISER LA PROCEDURE A L'ENSEMBLE DES DATASOURCES En REMPLAANT
            // [0] par [i] ET METTRE UNE BOUCLE FOR A CE NIVEAU (ICI)


            var dataSources = that._viewer.dataSources._dataSources;

            for (var k = 0; k < dataSources.length; k++) {

                var geoJsonDataSource = that._viewer.dataSources._dataSources[k].entities.values;

                // var geoJsonData = that._viewer.geoJsonData.features;
                var dimGeoJsonDataSource = geoJsonDataSource.length;

                // On parcours ces données et on verifie de quel type sont ces données
                for (var l = 0; l < dimGeoJsonDataSource; l++) {

                    var geoJsonData = geoJsonDataSource[l];

                    // on recupere le type des données
                    var dataType = ["ellipse", "polyline", "point", "polygon"];

                    var geomType;

                    for (var m = 0; m < dataType.length; m++) {

                        if (geoJsonData[dataType[m]]) {
                            geomType = dataType[m];
                            break;
                        }
                    }

                    if (geomType) {
                        var savefunction = saveGeoJsondataSourcesObject[geomType];
                        var resObject = savefunction(that, geoJsonData);

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
    var SubMenuViewModel = function (viewer, container, viewerContainer) {

        this._viewer = viewer;
        this._container = container;
        this._viewerContainer = viewerContainer;
        this._isflagCommandActive = false;
        this._ellipsoid = viewer.scene.globe.ellipsoid;
        this._propertiesNames = ['point', 'ellipse', 'polygon', 'polyline'];

        var that = this;

        viewer.infoBox.viewModel.showInfo = false;

        this._flagCommand = createCommand(function () {

            flagFunctionV2(that, that._viewer);
            that._colorPicker = new ColorPicker(that._viewerContainer, that._viewer);
        });

        this._moveCommand = createCommand(function () {
        });

        this._saveCommand = createCommand(function () {
            saveData(that, that._container);
        });

        this._infosCommand = createCommand(function () {
        });

        this._closeSubMenu = createCommand(function () {

            removeHandlers(that);

            try {

                // AJOUTER LA SUPPRESSION DES DONNEES LORSQUE L'ON CHANGE DE PLANETE

                that._viewer.editDrawing.viewModel.subMenu.destroyWrapperMenu;
            } catch (e) {
            }

            try {
                that._viewer.editDrawing.viewModel.subMenu.viewModel.colorPicker.destroyColorPickerContainer;
            } catch (e) {
            }
        });
        // knockout.track(this, []);

    };
    defineProperties(SubMenuViewModel.prototype, {
        /**
         * Gets the Command that is executed when the button is clicked.
         * @memberof SubMenuViewModel.prototype
         *
         * @type {Command}
         */

        flagCommand: {
            get: function () {
                return this._flagCommand;
            }
        },
        moveCommand: {
            get: function () {
                return this._moveCommand;
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
        /* colorPicker widget 
         * 
         */
        colorPicker: {
            get: function () {
                return this._colorPicker;
            }
        },
        removeAllCommands: {
            get: function () {
                //  this._isflagCommandActive = false;
                if (this._handlerLeft)
                    this._handlerLeft.removeInputAction(ScreenSpaceEventType.LEFT_CLICK);
                /*   if (this._handlerCtrlLeft)
                 this._handlerLeft.removeInputAction(ScreenSpaceEventType.LEFT_CLICK, KeyboardEventModifier.CTRL);
                 if (this._handlerAltLeft)
                 this._handlerAltLeft.removeInputAction(ScreenSpaceEventType.LEFT_CLICK, KeyboardEventModifier.ALT);
                 if (this._handlerCtrlRight)
                 this._handlerLeft.removeInputAction(ScreenSpaceEventType.RIGHT_CLICK, KeyboardEventModifier.CTRL);*/
                if (this._handlerRight)
                    this._handlerRight.removeInputAction(ScreenSpaceEventType.RIGHT_CLICK);
                /*   if (this._handlerMiddle)
                 this._handlerMiddle.removeInputAction(ScreenSpaceEventType.MIDDLE_CLICK);*/
            }
        },
        removeAllHandlers: {
            get: function () {
                if (this._handlerLeft)
                    this._handlerLeft.removeInputAction(ScreenSpaceEventType.LEFT_CLICK);
                /*  if (this._handlerCtrlLeft)
                 this._handlerLeft.removeInputAction(ScreenSpaceEventType.LEFT_CLICK, KeyboardEventModifier.CTRL);
                 if (this._handlerAltLeft)
                 this._handlerAltLeft.removeInputAction(ScreenSpaceEventType.LEFT_CLICK, KeyboardEventModifier.ALT);
                 if (this._handlerCtrlRight)
                 this._handlerLeft.removeInputAction(ScreenSpaceEventType.RIGHT_CLICK, KeyboardEventModifier.CTRL);*/
                if (this._handlerRight)
                    this._handlerRight.removeInputAction(ScreenSpaceEventType.RIGHT_CLICK);
                /*  if (this._handlerMiddle)
                 this._handlerMiddle.removeInputAction(ScreenSpaceEventType.MIDDLE_CLICK);*/
            }
        },
    });

// ================================================================================================================================
// ======================================================= LOCAL FUNCTIONS ========================================================
// ================================================================================================================================

    function removeHandlers(that) {

        if (that._handlerLeft)
            that._handlerLeft.removeInputAction(ScreenSpaceEventType.LEFT_CLICK);
        /* if (that._handlerCtrlLeft)
         that._handlerLeft.removeInputAction(ScreenSpaceEventType.LEFT_CLICK, KeyboardEventModifier.CTRL);
         if (that._handlerAltLeft)
         that._handlerAltLeft.removeInputAction(ScreenSpaceEventType.LEFT_CLICK, KeyboardEventModifier.ALT);
         if (that._handlerCtrlRight)
         that._handlerLeft.removeInputAction(ScreenSpaceEventType.RIGHT_CLICK, KeyboardEventModifier.CTRL);*/
        if (that._handlerRight)
            that._handlerRight.removeInputAction(ScreenSpaceEventType.RIGHT_CLICK);
        /*  if (that._handlerMiddle)
         that._handlerMiddle.removeInputAction(ScreenSpaceEventType.MIDDLE_CLICK);*/
    }

    return SubMenuViewModel;
});
