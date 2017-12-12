define([
        '../../Core/Cartesian3',
        '../../Core/defineProperties',
        '../../Core/Math',
        '../../ThirdParty/knockout',
        '../createCommand'
    ], function(
        Cartesian3,
        defineProperties,
        CesiumMath,
        knockout,
        createCommand) {
    'use strict';


    var saveGeoJsondataSourcesObject = {
        ellipse: createEllipseGeoJsonObject,
        polygon: createPolygonGeoJsonObject,
        point: createPointGeoJsonObject,
        polyline: createPolylineGeoJsonObject
    };

    function createEllipseGeoJsonObject(that, geoJsonDataSource) {

        var centerCoordinates = geoJsonDataSource._position._value;

        //var circleRadius = geoJsonDataSource.ellipse.semiMajorAxis;
        //var circleSurface = CesiumMath.PI * circleRadius * circleRadius;

        var cartographicCenterPosition = that.scene.globe._ellipsoid.cartesianToCartographic(centerCoordinates);
        var centerPositionLng = CesiumMath.toDegrees(cartographicCenterPosition.longitude);
        var centerPositionLat = CesiumMath.toDegrees(cartographicCenterPosition.latitude);

        var centerPosition = [centerPositionLng, centerPositionLat];

        var jsonCircleGeoJson = {};
        jsonCircleGeoJson.type = 'Point';
        jsonCircleGeoJson.coordinates = centerPosition;

        var featureCircleGeometry = {};
        featureCircleGeometry.type = 'Feature';
        featureCircleGeometry.geometry = jsonCircleGeoJson;
        var propertynames = geoJsonDataSource.properties._propertyNames;
        featureCircleGeometry.properties = {};
        var properties = Object.getOwnPropertyNames(geoJsonDataSource.properties);
        for (var property in propertynames) {
           var pn = "_" + propertynames[property];
           for (var pname in properties) {
               if (properties[pname]===pn) {
                  var myprop = properties[pname];
                  var value = geoJsonDataSource.properties[myprop]._value;
               }
           }
           featureCircleGeometry.properties[propertynames[property]] = value;
        }
        return featureCircleGeometry;
    }

    function createPolygonGeoJsonObject(that, geoJsonDataSource) {

        var featurePolygons = {};
        featurePolygons.type = 'Feature';

        var geoJsonPolygons = {};
        geoJsonPolygons.type = 'Polygon';
        geoJsonPolygons.coordinates = [];

        var positions = geoJsonDataSource.polygon.hierarchy._value.positions;
        var array = [];

        for (var j = 0; j < positions.length; j++) {
            var cartographicCenterPosition = that.scene.globe._ellipsoid.cartesianToCartographic(positions[j]);
            var centerPositionLng = CesiumMath.toDegrees(cartographicCenterPosition.longitude);
            var centerPositionLat = CesiumMath.toDegrees(cartographicCenterPosition.latitude);

            var centerPosition = [centerPositionLng, centerPositionLat];
            array.push(centerPosition);
        }

        geoJsonPolygons.coordinates.push(array);
        featurePolygons.geometry = geoJsonPolygons;
        featurePolygons.properties = {
            Name: 'Polygons'
        };

        return featurePolygons;
    }

    function createPolylineGeoJsonObject(that, geoJsonDataSource) {

        var featurePolylines = {};
        featurePolylines.type = 'Feature';

        var jsonPolylineGeometry = {};
        jsonPolylineGeometry.type = 'MultiLineString';
        jsonPolylineGeometry.coordinates = [];

        var positions = geoJsonDataSource.polyline.positions._value;
        //var distance = Cartesian3.distance(positions[0], positions[1]);
        //var distTrunc = distance.toFixed(2);

        var array = [];

        for (var j = 0; j < positions.length; j++) {

            var cartographicCenterPosition = that.scene.globe._ellipsoid.cartesianToCartographic(positions[j]);
            var centerPositionLng = CesiumMath.toDegrees(cartographicCenterPosition.longitude);
            var centerPositionLat = CesiumMath.toDegrees(cartographicCenterPosition.latitude);

            var vectPos = [centerPositionLng, centerPositionLat];
            array.push(vectPos);
        }

        jsonPolylineGeometry.coordinates.push(array);
        featurePolylines.geometry = jsonPolylineGeometry;
        var propertynames = geoJsonDataSource.properties._propertyNames;
        featurePolylines.properties = {};
        var properties = Object.getOwnPropertyNames(geoJsonDataSource.properties);
        for (var property in propertynames) {
           var pn = "_" + propertynames[property];
           for (var pname in properties) {
               if (properties[pname]===pn) {
                  var myprop = properties[pname];
                  var value = geoJsonDataSource.properties[myprop]._value;
               }
           }
           featurePolylines.properties[propertynames[property]] = value;
        }
        //  featurePolylines.properties.segment = 'D = '+ distTrunc + ' m';
        return featurePolylines;
    }

    function createPointGeoJsonObject(that, geoJsonDataSource) {

        var centerCoordinates = geoJsonDataSource.position._value;
        var cartographicCenterPosition = that.scene.globe._ellipsoid.cartesianToCartographic(centerCoordinates);
        var centerPositionLng = CesiumMath.toDegrees(cartographicCenterPosition.longitude);
        var centerPositionLat = CesiumMath.toDegrees(cartographicCenterPosition.latitude);

        var centerPosition = [centerPositionLng, centerPositionLat];

        var jsonCircleGeoJson = {};
        jsonCircleGeoJson.type = 'Point';
        jsonCircleGeoJson.coordinates = centerPosition;

        var featureCircleGeometry = {};
        featureCircleGeometry.type = 'Feature';
        featureCircleGeometry.geometry = jsonCircleGeoJson;

        var propertynames = geoJsonDataSource.properties._propertyNames;
        featureCircleGeometry.properties = {};
        var properties = Object.getOwnPropertyNames(geoJsonDataSource.properties);
        for (var property in propertynames) {
           var pn = "_" + propertynames[property];
           for (var pname in properties) {
               if (properties[pname]===pn) {
                  var myprop = properties[pname];
                  var value = geoJsonDataSource.properties[myprop]._value;
               }
           }
           featureCircleGeometry.properties[propertynames[property]] = value;
        }

        return featureCircleGeometry;
    }

    function saveData(that, container) {

        var primitives = that.scene._primitives._primitives;
        //var crs = GeoJsonDataSource.crsFunctionType;

        var geoJsonObject = {};
        geoJsonObject.type = 'FeatureCollection';
        geoJsonObject.features = [];
        //geoJsonObject.crs = crs.crs;

        var polylines;
        var positions;
        var firstPosition;
        var lastPosition;
        var cartographicFirstPosition;
        var cartographicLastPosition;
        var firstPositionLng;
        var firstPositionLat;
        var lastPositionLng;
        var lastPositionLat;
        var j;

        for (var i = 0; i < primitives.length; i++) {

            if (primitives[i].associatedObject === 'polylines' && primitives[i]._polylines.length > 0) {

                var featurePolylines = {};
                featurePolylines.type = 'Feature';

                var jsonPolylineGeometry = {};
                jsonPolylineGeometry.type = 'MultiLineString';
                jsonPolylineGeometry.coordinates = [];

                polylines = primitives[i]._polylines;

                var labels = primitives[i + 1]._labels;

                var totalLengthPath = labels[labels.length - 1]._text;

                //if (polylines.length > 0) {

                    for (j = 0; j < polylines.length; j++) {

                        positions = polylines[j]._positions;

                        // get start and final point

                        firstPosition = positions[0];
                        lastPosition = positions[positions.length - 1];

                        cartographicFirstPosition = that.scene.globe._ellipsoid.cartesianToCartographic(firstPosition);
                        cartographicLastPosition = that.scene.globe._ellipsoid.cartesianToCartographic(lastPosition);

                        firstPositionLng = CesiumMath.toDegrees(cartographicFirstPosition.longitude);
                        firstPositionLat = CesiumMath.toDegrees(cartographicFirstPosition.latitude);
                        lastPositionLng = CesiumMath.toDegrees(cartographicLastPosition.longitude);
                        lastPositionLat = CesiumMath.toDegrees(cartographicLastPosition.latitude);

                        var line = [[firstPositionLng, firstPositionLat], [lastPositionLng, lastPositionLat]];

                        jsonPolylineGeometry.coordinates.push(line);
                        featurePolylines.geometry = jsonPolylineGeometry;
                        featurePolylines.properties = {
                            Name: 'Line',
                            Total_distance: totalLengthPath
                        };
                    //}
                    geoJsonObject.features.push(featurePolylines);
                }
            }

            if (primitives[i].associatedObject === 'circleGeomtry') {

                var circles = primitives[i]._primitives;

                if (circles.length > 0) {

                    for (j = 0; j < circles.length; j++) {

                        var centerCoordinates = circles[j]._boundingSpheres[0].center;
                        var circleRadius = circles[j]._boundingSpheres[0].radius;
                        var circleSurface = CesiumMath.PI * circleRadius * circleRadius;

                        var cartographicCenterPosition = that.scene.globe._ellipsoid.cartesianToCartographic(centerCoordinates);
                        var centerPositionLng = CesiumMath.toDegrees(cartographicCenterPosition.longitude);
                        var centerPositionLat = CesiumMath.toDegrees(cartographicCenterPosition.latitude);

                        var centerPosition = [centerPositionLng, centerPositionLat];

                        var jsonCircleGeometry = {};
                        jsonCircleGeometry.type = 'Point';
                        jsonCircleGeometry.coordinates = centerPosition;

                        var featureCircle = {};
                        featureCircle.type = 'Feature';
                        featureCircle.geometry = jsonCircleGeometry;
                        featureCircle.properties = {
                            Name: 'Circle',
                            Center_lng: centerPositionLng.toFixed(3) + ' deg',
                            Center_lat: centerPositionLat.toFixed(3) + ' deg',
                            radius: circleRadius.toFixed(3) + ' m',
                            surface: circleSurface + ' m2'
                        };
                        geoJsonObject.features.push(featureCircle);
                    }
                }
            }

            if (primitives[i].associatedObject === 'polylinesTmpPolygons') {

                var featurePolygons = {};
                featurePolygons.type = 'Feature';

                var geoJsonPolygons = {};
                geoJsonPolygons.type = 'Polygon';
                geoJsonPolygons.coordinates = [];

                polylines = primitives[i]._polylines;
                var polygonsPoints = [];

                if (polylines.length > 0) {

                    for (j = 0; j < polylines.length - 1; j++) {

                        positions = polylines[j]._positions;

                        firstPosition = positions[0];
                        lastPosition = positions[positions.length - 1];

                        cartographicFirstPosition = that.scene.globe._ellipsoid.cartesianToCartographic(firstPosition);
                        cartographicLastPosition = that.scene.globe._ellipsoid.cartesianToCartographic(lastPosition);

                        lastPositionLng = CesiumMath.toDegrees(cartographicLastPosition.longitude);
                        lastPositionLat = CesiumMath.toDegrees(cartographicLastPosition.latitude);

                        var coordLastPoint;
                        if (j === 0) {

                            firstPositionLng = CesiumMath.toDegrees(cartographicFirstPosition.longitude);
                            firstPositionLat = CesiumMath.toDegrees(cartographicFirstPosition.latitude);

                            var coordFirstPoint = [firstPositionLng, firstPositionLat];
                            coordLastPoint = [lastPositionLng, lastPositionLat];

                            polygonsPoints.push(coordFirstPoint);
                            polygonsPoints.push(coordLastPoint);

                        } else {
                            coordLastPoint = [lastPositionLng, lastPositionLat];
                            polygonsPoints.push(coordLastPoint);
                        }
                    }

                    geoJsonPolygons.coordinates.push(polygonsPoints);
                    featurePolygons.geometry = geoJsonPolygons;
                    featurePolygons.properties = {
                        Name: 'Polygons'
                    };

                    geoJsonObject.features.push(featurePolygons);
                }
            }
        }

        var geoJsonData;

        if (that.geoJsonData) {

            var dataSources = that.dataSources._dataSources;

            for (var k = 0; k < dataSources.length; k++) {

                var geoJsonDataSource = that.dataSources._dataSources[k].entities.values;

                var dimGeoJsonDataSource = geoJsonDataSource.length;

                for (var l = 0; l < dimGeoJsonDataSource; l++) {

                    geoJsonData = geoJsonDataSource[l];

                    var dataType = ['ellipse', 'polyline', 'point', 'polygon'];

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

            geoJsonData = JSON.stringify(geoJsonObject);
            var blob = new Blob([geoJsonData], {
                type: 'application/octet-stream',
                endings: 'native'
            });
            var url = URL.createObjectURL(blob);
            var fileName = 'geoJsonFile.geojson';

            if (!that._isSaveButtonActivate) {

                that._wrapperSaveSubMenu = document.createElement('span');
                that._wrapperSaveSubMenu.className = 'cesium-button cesium-toolbar-button';
                that._wrapperSaveSubMenu.setAttribute("style", "display: flex;");
                console.log(container);
                container.appendChild(that._wrapperSaveSubMenu);

                that._linkDownload = document.createElement('a');
                //that._linkDownload.className = 'cesium-saveButtonLink';
                that._wrapperSaveSubMenu.appendChild(that._linkDownload);
                that._linkDownload.innerHTML = '<svg width="25px" height="25px" viewBox="-10 0 100 100"><g>\
                                          <path d="M84.514,49.615H67.009c-2.133,0-4.025,1.374-4.679,3.406c-1.734,5.375-6.691,8.983-12.329,8.983\
                                            c-5.64,0-10.595-3.608-12.329-8.983c-0.656-2.032-2.546-3.406-4.681-3.406H15.486c-2.716,0-4.919,2.2-4.919,4.919v28.054\
                                            c0,2.714,2.203,4.917,4.919,4.917h69.028c2.719,0,4.919-2.203,4.919-4.917V54.534C89.433,51.815,87.233,49.615,84.514,49.615z"/>\
                                            <path d="M48.968,52.237c0.247,0.346,0.651,0.553,1.076,0.553h0.003c0.428,0,0.826-0.207,1.076-0.558l13.604-19.133\
                                            c0.286-0.404,0.321-0.932,0.096-1.374c-0.225-0.442-0.682-0.716-1.177-0.716h-6.399V13.821c0-0.735-0.593-1.326-1.323-1.326H44.078\
                                            c-0.732,0-1.323,0.591-1.323,1.326v17.188h-6.404c-0.495,0-0.949,0.279-1.174,0.716c-0.229,0.442-0.19,0.97,0.098,1.374\
                                            L48.968,52.237z"/></g></svg>';
                that._linkDownload.href = url;
                that._linkDownload.download = fileName || 'unknown';
                that._linkDownload.onclick = function () {
                    this.parentElement.removeChild(this);
                    that._wrapperSaveSubMenu.parentElement.removeChild(that._wrapperSaveSubMenu);
                    that._isSaveButtonActivate = false;
                };
                that._isSaveButtonActivate = true;

            } else if (that._isSaveButtonActivate) {

                try {
                    that._linkDownload.parentElement.removeChild(that._linkDownload);
                    that._wrapperSaveSubMenu.parentElement.removeChild(that._wrapperSaveSubMenu);
                } catch (e) {
                    console.log(e);
                }

                that._isSaveButtonActivate = false;
            }
        }
    }

    /**
     * The view model for {@link SaveButton}.
     * @alias SaveButtonViewModel
     * @constructor
     */
    function SaveButtonViewModel(container,that) {
        /**
         * Gets or sets whether the save function is currently shown.  This property is observable.
         * @type {Boolean}
         * @default false
        */

        this._command = createCommand(function () {
            console.log(container);
            saveData(that, container);
        });
    }

    defineProperties(SaveButtonViewModel.prototype, {

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

    return SaveButtonViewModel;
});
