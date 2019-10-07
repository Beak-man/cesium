/*global define*/
define([
        '../../Core/BoundingRectangle',
        '../../Core/Cartesian3',
        '../../Core/Cartographic',
        '../../Core/Clock',
        '../../Core/Color',
        '../../Core/ColorGeometryInstanceAttribute',
        '../../Core/createGuid',
        '../../Core/defined',
        '../../Core/defineProperties',
        '../../Core/GeometryInstance',
        '../../Core/Math',
        '../../Core/PinBuilder',
        '../../Core/PolygonGeometry',
        '../../Core/PolylinePipeline',
        '../../Core/ScreenSpaceEventHandler',
        '../../Core/ScreenSpaceEventType',
        '../../DataSources/ColorMaterialProperty',
        '../../DataSources/ConstantPositionProperty',
        '../../DataSources/ConstantProperty',
        '../../DataSources/DataSourceCollection',
        '../../DataSources/DataSourceDisplay',
        '../../DataSources/EllipseGraphics',
        '../../DataSources/Entity',
        '../../DataSources/EntityCollection',
        '../../DataSources/PointGraphics',
        '../../DataSources/PolygonGraphics',
        '../../DataSources/PolylineGraphics',
        '../../DataSources/Property',
        '../../Scene/BillboardCollection',
        '../../Scene/Material',
        '../../Scene/PerInstanceColorAppearance',
        '../../Scene/PointPrimitiveCollection',
        '../../Scene/PolylineCollection',
        '../../Scene/Primitive',
        '../../Scene/PrimitiveCollection',
        '../../ThirdParty/knockout',
        '../createCommand'
    ], function(
        BoundingRectangle,
        Cartesian3,
        Cartographic,
        Clock,
        Color,
        ColorGeometryInstanceAttribute,
        createGuid,
        defined,
        defineProperties,
        GeometryInstance,
        CesiumMath,
        PinBuilder,
        PolygonGeometry,
        PolylinePipeline,
        ScreenSpaceEventHandler,
        ScreenSpaceEventType,
        ColorMaterialProperty,
        ConstantPositionProperty,
        ConstantProperty,
        DataSourceCollection,
        DataSourceDisplay,
        EllipseGraphics,
        Entity,
        EntityCollection,
        PointGraphics,
        PolygonGraphics,
        PolylineGraphics,
        Property,
        BillboardCollection,
        Material,
        PerInstanceColorAppearance,
        PointPrimitiveCollection,
        PolylineCollection,
        Primitive,
        PrimitiveCollection,
        knockout,
        createCommand) {
    'use strict';

    function showPanel(that, configContainer) {

        var leftPositionStr;
        var leftPositionStrTab;
        var leftPosition;
        var panelMove;

        if (!that._isVOPanelActive) {

            configContainer.className = 'cesium-voData-configContainer cesium-voData-configContainer-transition';
            leftPositionStr = configContainer.style.left;
            leftPositionStrTab = leftPositionStr.split('p');
            leftPosition = parseInt(leftPositionStrTab);

            panelMove = leftPosition - 400 + 'px';
            configContainer.style.left = panelMove;
            configContainer.style.opacity = '1';

            that._isVOPanelActive = true;

        } else if (that._isVOPanelActive) {

            configContainer.className = 'cesium-voData-configContainer cesium-voData-configContainer-transition';
            leftPositionStr = configContainer.style.left;
            leftPositionStrTab = leftPositionStr.split('p');
            leftPosition = parseInt(leftPositionStrTab);

            panelMove = leftPosition + 400 + 'px';
            configContainer.style.left = panelMove;
            configContainer.style.opacity = '0';

            that._isVOPanelActive = false;
        }
    }

    function inputValuesTest(inputField) {

        if (/^[0-9.,-]+$/g.test(inputField.value)) {
            return true;
        }
        console.log('Input Errors : ' + 'Please, enter a NUMBER type value for ' + inputField.name.toUpperCase() + ' in the format : XX.XX');
        alert('Please, enter a NUMBER type value for ' + inputField.name.toUpperCase() + ' in the format : XX.XX');
        return false;
    }

    function createQueryV2(that, viewer, resultContainer, handlerLeftClick, inputeElements, serverUrl, extension, format, color) {

        var dataSourceDisplay = new DataSourceDisplay({
            scene: viewer.scene,
            dataSourceCollection: new DataSourceCollection()
        });

        var ellipsoid = viewer.scene.globe.ellipsoid;

        var isLngMinValuesValid = inputValuesTest(inputeElements.lngMin);
        var isLngMaxValuesValid = inputValuesTest(inputeElements.lngMax);
        var isLatMinValuesValid = inputValuesTest(inputeElements.latMin);
        var isLatMaxValuesValid = inputValuesTest(inputeElements.latMax);

        var xhrVO = getRequest();

        if (isLngMinValuesValid && isLngMaxValuesValid && isLatMinValuesValid && isLatMaxValuesValid) {

            var lngMin = parseFloat(inputeElements.lngMin.value);
            var lngMax = parseFloat(inputeElements.lngMax.value);
            var latMin = parseFloat(inputeElements.latMin.value);
            var latMax = parseFloat(inputeElements.latMax.value);
            var radMin = parseFloat(inputeElements.radMin.value);
            var radMax = parseFloat(inputeElements.radMax.value);

            var queryPart1 = serverUrl + '?REQUEST=doQuery&LANG=ADQL&';
            var queryPart3 = radMin >= 0 && radMax >0 ? 'and radius>'+radMin +'and radius<' + radMax : '';
            var queryPart2 = 'QUERY=SELECT * from ' + extension + ' where c1min>' + lngMin + 'and c2min>' + latMin + 'and c1max<' + lngMax + 'and c2max<' + latMax + queryPart3 + '&FORMAT=' + format;
            var query = queryPart1 + queryPart2;

            xhrVO.open('GET', query, true);
            xhrVO.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            xhrVO.send();
            xhrVO.onreadystatechange = function () {

                if (xhrVO.readyState === 4 && xhrVO.status === 200 || xhrVO.status === 0) {

                    var data = xhrVO.responseText;

                    var jsonData = JSON.parse(data);

                    var dataTab = [];
                    dataTab = jsonData.data;

                    var columnNomTab = [];
                    columnNomTab = jsonData.columns;

                    var dimData = dataTab.length;

                    var lngMin = []; // C1Min
                    var latMin = []; // C2Min
                    var altMin = []; // C3Min
                    var lngMax = []; // C1Max
                    var latMax = []; // C2Max
                    var altMax = []; // C3Max

                    var numberColumForCvalues = checkNumColumns(columnNomTab);

                    var stockLines = [];

                    for (var i = 0; i < dimData; i++) {
                        var arr = dataTab[i]; // correspond to 1 line in the data file

                        // get longitude and latitudes data

                        var C1Min = parseFloat(arr[numberColumForCvalues.c1min]);
                        var C1Max = parseFloat(arr[numberColumForCvalues.c1max]);
                        var C2Min = parseFloat(arr[numberColumForCvalues.c2min]);
                        var C2Max = parseFloat(arr[numberColumForCvalues.c2max]);
                        var C3Min = parseFloat(arr[numberColumForCvalues.c3min]);
                        var C3Max = parseFloat(arr[numberColumForCvalues.c3max]);
                        var unitC3 = columnNomTab[numberColumForCvalues.c3max].unit;

                        // check if these data are valid (i.e between 0 and 360�)
                        var isValuesValid = checkCValues(C1Min, C1Max, C2Min, C2Max);

                        // check if the we have a point or a polygon
                        var geomType = checkGeometryType(C1Min, C1Max, C2Min, C2Max);

                        console.log(geomType, isValuesValid, arr[numberColumForCvalues.access_format]);

                        var descriptionObject;
                        var addToList;
                        // if we have a point
                        if (geomType === 'points') {

                            // if data are valid and if we have a text format or an unknown format
                            // if (isValuesValid === true && arr[numberColumForCvalues.access_format] === 'text/plain' || !arr[numberColumForCvalues.access_format]) {
                            if (isValuesValid === true) {
                                // we create the description object corresponding to the current point
                                descriptionObject = createDescriptionObject(columnNomTab, arr);

                                //we check if the coordinate are duplicated
                                addToList = selectionData(lngMin, lngMax, latMin, latMax, altMin, altMax, C1Min, C1Max, C2Min, C2Max, C3Min, C3Max);

                                // if not (i.e we don't have the coordinate in the list)
                                if (addToList === true) {

                                    // we add coord in tabs and plot data on Cesium
                                    lngMin.push(C1Min);
                                    lngMax.push(C1Max);
                                    latMin.push(C2Min);
                                    latMax.push(C2Max);
                                    altMin.push(C3Min);
                                    altMax.push(C3Max);

                                    //  console.log('avant generate point');
                                    // generate point
                                    generatePoints(C1Min, C2Min, C3Min, C3Max, unitC3, descriptionObject, dataSourceDisplay, ellipsoid, color);

                                    // we get data from requested file
                                    stockLines = arr;

                                    // add description to the current point
                                    addPropertiesInPointObject(stockLines, columnNomTab, numberColumForCvalues, dataSourceDisplay, ellipsoid);

                                } else { // else we just stock data line in the right object

                                    stockLines = arr;
                                    addPropertiesInPointObject(stockLines, columnNomTab, numberColumForCvalues, dataSourceDisplay, ellipsoid);

                                }

                            }

                        } else if (isValuesValid === true && arr[numberColumForCvalues.access_format] === 'application/x-pds' || arr[numberColumForCvalues.access_format] === 'application/x-geotiff') {

                            descriptionObject = createDescriptionObject(columnNomTab, arr);
                            addToList = selectionData(lngMin, lngMax, latMin, latMax, C1Min, C1Max, C2Min, C2Max);

                            // if not (i.e we don't have the coordinate il the list)
                            if (addToList === true) {

                                lngMin.push(C1Min);
                                lngMax.push(C1Max);
                                latMin.push(C2Min);
                                latMax.push(C2Max);

                                generatePolygons(C1Min, C1Max, C2Min, C2Max, descriptionObject, dataSourceDisplay, color);
                            }

                        }
                    }

                    pickingActivation(dataSourceDisplay, handlerLeftClick);

                }
            };
        }
    }

    /**Check values
     *
     * @param {type} C1Min
     * @param {type} C1Max
     * @param {type} C2Min
     * @param {type} C2Max
     * @returns {Boolean}
     */
    function checkCValues(C1Min, C1Max, C2Min, C2Max) {

        var dls = 361.0; // limit in degree
        var dli = 0.0; // limit in degree

        var isC1MinValid = false;
        var isC1MaxValid = false;
        var isC2MinValid = false;
        var isC2MaxValid = false;

        var isAllCValid = false;

        if (Math.abs(C1Min) <= dls && Math.abs(C1Min) >= dli && Math.abs(C1Min) <= Math.abs(C1Max)) {
            isC1MinValid = true;
        }
        if (Math.abs(C1Max) <= dls && Math.abs(C1Max) >= dli && Math.abs(C1Max) >= Math.abs(C1Min)) {
            isC1MaxValid = true;
        }

        if (Math.abs(C2Min) <= dls && Math.abs(C2Min) >= dli && Math.abs(C2Min) <= Math.abs(C2Max)) {
            isC2MinValid = true;
        }
        if (Math.abs(C2Max) <= dls && Math.abs(C2Max) >= dli && Math.abs(C2Max) >= Math.abs(C2Min)) {
            isC2MaxValid = true;
        }

        if (isC1MinValid === true && isC1MaxValid === true && isC2MinValid === true && isC2MaxValid === true) {
            isAllCValid = true;
        }
        return isAllCValid;
    }

    function checkGeometryType(C1Min, C1Max, C2Min, C2Max) {

        if (C1Min === C1Max && C2Min === C2Max) {
            return 'points';
        }
        return 'polygons';
    }

    function checkNumColumns(columnNomen) {

        var num = {};
        var ColumnIdLowerCase;

        for (var i = 0; i < columnNomen.length - 1; i++) {

            var columnI = columnNomen[i];
            var ColumnId = columnI.id;

            // C1min ou c1min mais pas les deux

            if (ColumnId === 'c1min' || ColumnId === 'C1min') {
                ColumnIdLowerCase = ColumnId.toLowerCase();
                num[ColumnIdLowerCase] = i;
            } else if (ColumnId === 'c1max' || ColumnId === 'C1max') {
                ColumnIdLowerCase = ColumnId.toLowerCase();
                num[ColumnIdLowerCase] = i;
            } else if (ColumnId === 'c2min' || ColumnId === 'C2min') {
                ColumnIdLowerCase = ColumnId.toLowerCase();
                num[ColumnIdLowerCase] = i;
            } else if (ColumnId === 'c2max' || ColumnId === 'C2max') {
                ColumnIdLowerCase = ColumnId.toLowerCase();
                num[ColumnIdLowerCase] = i;
            } else if (ColumnId === 'c3min' || ColumnId === 'C3min') {
                ColumnIdLowerCase = ColumnId.toLowerCase();
                num[ColumnIdLowerCase] = i;
            } else if (ColumnId === 'c3max' || ColumnId === 'C3max') {
                ColumnIdLowerCase = ColumnId.toLowerCase();
                num[ColumnIdLowerCase] = i;
            } else if (ColumnId === 'access_format') {
                ColumnIdLowerCase = ColumnId.toLowerCase();
                num[ColumnIdLowerCase] = i;
            } else if (ColumnId === 'measurement_type') {
                ColumnIdLowerCase = ColumnId.toLowerCase();
                num[ColumnIdLowerCase] = i;
            } else if (ColumnId === 'access_url') {
                ColumnIdLowerCase = ColumnId.toLowerCase();
                num[ColumnIdLowerCase] = i;
            }
        }

        console.log(num);

        return num;
    }

    function selectionData(lngMin, lngMax, latMin, latMax, altMin, altMax, C1Min, C1Max, C2Min, C2Max, C3Min, C3Max) {

        var dimTab = lngMin.length;

        var isC1minInList = false;
        var isC1maxInList = false;
        var isC2minInList = false;
        var isC2maxInList = false;
        var isC3minInList = false;
        var isC3maxInList = false;

        var addToList = true;

        for (var i = 0; i < dimTab; i++) {

            if (lngMin[i] === C1Min && lngMax[i] === C1Max && latMin[i] === C2Min && latMax[i] === C2Max && altMin[i] === C3Min && altMax[i] === C3Max) {
                isC1minInList = true;
                isC1maxInList = true;
                isC2minInList = true;
                isC2maxInList = true;

                break;
            }

        }

        if (isC1minInList === true && isC1maxInList === true && isC2minInList === true && isC2maxInList === true && isC3minInList === true && isC3maxInList === true) {
            addToList = false;
        }

        return addToList;
    }

    function defaultDescribe(properties, nameProperty) {

        var html = '';
        for (var key in properties) {
            if (properties.hasOwnProperty(key)) {
                if (key === nameProperty) {
                    continue;
                }
                var value = properties[key];
                if (defined(value)) {
                    if (typeof value === 'object') {

                        html += '<tr><th>' + key + '</th><td>' + defaultDescribe(value) + '</td></tr>';
                    } else if (typeof value === 'string') {

                        var beginString = value.slice(0, 7);
                        var regex1 = /http:/;
                        var regex2 = /https:/;
                        var regex3 = /www./;
                        var regex4 = /ftp:/;

                        if (regex1.test(beginString) || regex2.test(beginString) || regex3.test(beginString) || regex4.test(beginString)) {

                            html += '<tr><th>' + key + '</th><td><a href=' + value + ' target="_blank">link</a></td></tr>';

                        } else {

                            html += '<tr><th>' + key + '</th><td>' + value + '</td></tr>';

                        }
                    } else {
                        html += '<tr><th>' + key + '</th><td>' + value + '</td></tr>';
                    }
                }
            }
        }

        if (html.length > 0) {
            html = '<table class="cesium-infoBox-defaultTable"><tbody>' + html + '</tbody></table>';
        }

        return html;
    }

    function createDescriptionObject(columnNameTab, arr) {

        var descrip = {};

        for (var i = 0; i < columnNameTab.length; i++) {

            // if the value of the description is not null
            if (arr[i] !== null && arr[i] !== '') {
                descrip[columnNameTab[i].name.toLowerCase()] = arr[i];
            }
        }

        var html = defaultDescribe(descrip, 'title');

        var returnObject = {
            html: html,
            object: descrip
        };

        return returnObject;
    }

    function  generatePoints(lngMin, latMin, altMin, altMax, unitAlt, descriptionObject, dataSourceDisplay, ellipsoid, colorPoints) {

        var coordX = lngMin;
        var coordY = latMin;
        var coordZ = 0;
        if (altMin && altMax) {
            if (unitAlt === 'm') {
                coordZ = (altMax - altMin) / 2.0;
            } else if (unitAlt === 'km') {
                coordZ = (altMax - altMin) / 2.0;
                coordZ = coordZ*1000.0;
            }
        }

        var pos = Cartesian3.fromDegrees(coordX, coordY, coordZ, ellipsoid);

        var point = new PointGraphics();

        point.outline = new ConstantProperty(true);
        point.pixelSize = 5.0;
        point.color = colorPoints;
        point.outlineColor = colorPoints;
        point.outlineWidth = 1.0;
        point.properties = {};
        point.show = true;

        var position = new ConstantPositionProperty(pos);

        var id = createGuid();

        var entityParams = {
            id: id,
            point: point,
            position: position,
            show: true,
            name: 'VO data',
            description: new ConstantProperty(descriptionObject.html)
        };

        var entity = new Entity(entityParams);

        entity.descriptionTab = [];
        entity.descriptionTab.push(descriptionObject.object);

        var entities = dataSourceDisplay.defaultDataSource.entities;

        entities.add(entity);
        var clock = new Clock();
        dataSourceDisplay.update(clock.currentTime);
    }


    function generatePolygons(lngMin, lngMax, latMin, latMax, descriptionObject, dataSourceDisplay, colorPolygons) {

        // array wich contains coordinates to draw polygons
        var polygonsCoord = [];

        // points for polygons
        var point1 = [lngMin, latMin];
        var point2 = [lngMax, latMin];
        var point3 = [lngMax, latMax];
        var point4 = [lngMin, latMax];
        var point5 = point1;

        var tabPoints = [point1, point2, point3, point4, point5];

        // push points in polygonsCoord array
        for (var i = 0; i < tabPoints.length - 1; i++) {

            var pt = tabPoints[i];

            for (var j = 0; j < pt.length; j++) {
                polygonsCoord.push(pt[j] * (Math.PI / 180.0));
            }
        }

        // draw Polygons

        var polygon = new PolygonGraphics();

        colorPolygons.alpha = 0.3;

        polygon.hierarchy = Cartesian3.fromRadiansArray(polygonsCoord);
        polygon.fill = false;
        polygon.height = 0;
        polygon.show = true;
        polygon.material = colorPolygons;
        polygon.outlineColor = Color.BLUE;
        polygon.outlineWidth = 10.0;
        polygon.outline = new ConstantProperty(true);

        var id = createGuid();

        var entityParams = {
            id: id,
            polygon: polygon,
            show: true,
            name: 'VO data',
            description: new ConstantProperty(descriptionObject.html)
        };

        var entity = new Entity(entityParams);

        entity.descriptionTab = [];
        entity.descriptionTab.push(descriptionObject.object);

        var entities = dataSourceDisplay.defaultDataSource.entities;

        entities.add(entity);

        var clock = new Clock();

        dataSourceDisplay.update(clock.currentTime);
    }

    function addPropertiesInPointObject(stockLines, columnNomTab, numberColumForCvalues, dataSourceDisplay, ellipsoid) {

        var C1Min = parseFloat(stockLines[numberColumForCvalues.c1min]);
        var C2Min = parseFloat(stockLines[numberColumForCvalues.c2min]);

        var pointsTab = dataSourceDisplay.defaultDataSource.entities._entities._array;

        for (var i = 0; i < pointsTab.length; i++) {

            var position = pointsTab[i]._position._value;
            var cartPos = Cartesian3.fromDegrees(C1Min, C2Min, 0, ellipsoid);

            if (position.x.toFixed(4) === cartPos.x.toFixed(4)) {
                var descriptionObject = createDescriptionObject(columnNomTab, stockLines);
                pointsTab[i].descriptionTab.push(descriptionObject.object);
            }
        }

    }

    function pickingActivation(dataSourceDisplay, handlerLeftClick) {

        handlerLeftClick.setInputAction(function () {

            var clock = new Clock();
            dataSourceDisplay.update(clock.currentTime);

        }, ScreenSpaceEventType.LEFT_CLICK);

    }

    function getRequest() {
        var xhr;

        if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
            xhr = new XMLHttpRequest();
        } else if (typeof ActiveXObject !== 'undefined') {
            xhr = new ActiveXObject('Microsoft.XMLHTTP'); // activeX pour IE
            console.log('IE');
        } else {
            console.log('AJAX is not available on this browser');
            xhr = null;
        }
        return xhr;
    }

    /**
     * The view model for {@link VOData}.
     * @alias VODataViewModel
     * @constructor
     */
    var VODataViewModel = function (viewer, planetName, configContainer, listContainer, btnContainer, resultContainer, inputeElements, dimServers, dimData, inputTab) {

        // ************************ initialization *****************************

        this._viewer = viewer;
        this._planetName = planetName;
        this._configContainer = configContainer;
        this._listContainer = listContainer;
        this._btnContainer = btnContainer;
        this._inputeElements = inputeElements;
        this._resultContainer = resultContainer;
        this._query = null;
        this._format = 'json';
        this._divRes = null;
        this._dataSourceDisplay = null;

        for (var i = 0; i < dimServers; i++) {

            var dim = dimData[i];

            for (var j = 0; j < dim; j++) {
                this['showData_' + i + '_' + j] = knockout.observable(false); // METTRE A FALSE
            }
        }

        this._isVOPanelActive = false;

        var that = this;

        // ************************** Commands *********************************

        this._showPanelCommand = createCommand(function () {
            showPanel(that, that._configContainer);
        });

        this._getDataCommand = createCommand(function () {

            var i;

            that._previousObject = null;

            removeHandlers(that);
            that._handlerLeftClick = new ScreenSpaceEventHandler(viewer.scene.canvas);

            var tabExtension = [];
            var tabServerUrl = [];

            for ( i = 0; i < inputTab.length; i++) {

                if (inputTab[i].checked === true) {
                    tabExtension.push(inputTab[i].extension);
                    tabServerUrl.push(inputTab[i].serverUrl);
                }
            }

            if (that._viewer.scene.primitives.length > 0) {
                try {
                    that._viewer._dataSourceCollection.removeAll();
                    that._viewer.scene.primitives.removeAll();
                } catch (e) {
                }
            }

            var color = [];

            color.push(new Color(1.0, 1.0, 0.0, 1.0));
            color.push(new Color(0.0, 1.0, 0.0, 1.0));
            color.push(new Color(0.0, 0.0, 1.0, 1.0));
            color.push(new Color(1.0, 0.0, 1.0, 1.0));
            color.push(new Color(0.1, 0.4, 0.8, 1.0));
            color.push(new Color(0.5, 0.5, 1.0, 1.0));

            if (tabExtension.length > 0) {

                for ( i = 0; i < tabExtension.length; i++) {
                    createQueryV2(that, that._viewer, that._resultContainer, that._handlerLeftClick, that._inputeElements, tabServerUrl[i], tabExtension[i], that._format, color[i]);
                }
            }

        });

    };
    defineProperties(VODataViewModel.prototype, {
        /**
         * Gets the Command that is executed when the button is clicked.
         * @memberof VODataViewModel.prototype
         *
         * @type {Command}
         */
        getDataCommand: {
            get: function () {
                return this._getDataCommand;
            }
        },
        showPanelCommand: {
            get: function () {
                return this._showPanelCommand;
            }
        },
        isVOPanelActive: {
            get: function () {
                return this._isVOPanelActive;
            },
            set: function (value) {
                this._isVOPanelActive = value;
            }
        },
        hidePanel: {
            get: function () {
                if (this._isVOPanelActive) {
                    showPanel(this, this._configContainer);
                }
            }
        },
        cleanDataSourceDisplay: {
            get: function () {
                this._DataSourceDisplay.destroy();
            }
        }

    });

    function removeHandlers(that) {

        if (that._handlerLeftClick) {
            that._handlerLeftClick.removeInputAction(ScreenSpaceEventType.LEFT_CLICK);
        }
        console.log('handler removed');
    }

    return VODataViewModel;
});
