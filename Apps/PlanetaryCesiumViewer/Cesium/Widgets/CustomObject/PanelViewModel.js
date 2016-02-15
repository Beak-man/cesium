define([
    '../../Core/Cartesian3',
    '../../Core/Math',
    '../../Core/Color',
    '../../Core/defineProperties',
    '../../Core/Ellipsoid',
    '../../Core/EllipsoidTerrainProvider',
    '../../Core/freezeObject',
    '../../Core/GeographicProjection',
    '../../Scene/Globe',
    '../../Core/ScreenSpaceEventHandler',
    '../../Core/ScreenSpaceEventType',
    '../../ThirdParty/knockout',
    '../createCommand',
    '../../Scene/WebMapServiceImageryProvider'],
        function (
                Cartesian3,
                CesiumMath,
                Color,
                defineProperties,
                Ellipsoid,
                EllipsoidTerrainProvider,
                freezeObject,
                GeographicProjection,
                Globe,
                ScreenSpaceEventHandler,
                ScreenSpaceEventType,
                knockout,
                createCommand,
                WebMapServiceImageryProvider) {
            'use strict'


            function testInputValues(inputField) {

                if (/^[0-9.,]+$/g.test(inputField.value)) {
                    return true;
                } else {

                    console.log("pas que des chiffres");
                    alert("Please, enter a NUMBER type value for the " + inputField.name.toUpperCase() + " axis");
                    return false
                }
            }

            function  createNewEllipsoid(that, elementsForAxis) {

                var xTest = testInputValues(elementsForAxis.x);
                var yTest = testInputValues(elementsForAxis.y);
                var zTest = testInputValues(elementsForAxis.z);

                if (xTest && yTest && zTest) {

                    var axisParameters = {
                        x: parseFloat(that._elementsForAxis.x.value),
                        y: parseFloat(that._elementsForAxis.y.value),
                        z: parseFloat(that._elementsForAxis.z.value)
                    }

                    that._ellipsoid = freezeObject(new Ellipsoid(axisParameters.x, axisParameters.y, axisParameters.z));
                    var newTerrainProvider = new EllipsoidTerrainProvider({ellipsoid: that._ellipsoid});
                    var newGeographicProjection = new GeographicProjection(that._ellipsoid);
                    var newGlobe = new Globe(that._ellipsoid);

                    that._viewer.scene.globe = newGlobe;
                    that._viewer.scene.mapProjection = newGeographicProjection;
                    that._viewer.scene.camera.projection = newGeographicProjection;
                    that._viewer.terrainProvider = newTerrainProvider;
                }
            }


            function textureSelection(serverDataObject, solarSystem, selectElementSatelliteTexture, that) {

                var servers = [];

                for (var server in serverDataObject) {
                    servers.push(serverDataObject[server]);
                }

                var Planets = [];

                for (var i in solarSystem) {
                    Planets.push(i.toString());
                }

                that.availableServers = knockout.observableArray(servers);
                that.availablePlanets = knockout.observableArray(Planets);

                that.selectedServer = knockout.observableArray();
                that.selectedServer.subscribe(function (data) {

                    that._urlServer = data.url;
                    that._serverDir = data.dir;
                    that._serverMapExtension = data.extension;
                    that._server = data;

                    try {
                        var adressGetCapabilities = that._urlServer + "?map=" + that._serverDir + that._planet + "/" + that._planet + that._serverMapExtension + "&service=WMS&request=GetCapabilities";

                        var xhr = getXMLHttpRequest();
                        getXmlData(xhr, 'post', adressGetCapabilities, true, that);
                        console.log(that.availableSatellites); 
                        that.selectedSatellite.indexOf = 0 ;
                        
                        

                    } catch (e) {

                    }


                });

                that.selectedPlanet = knockout.observableArray();
                that.availableSatellites = knockout.observableArray([]);
                that.availableLayers = knockout.observableArray([]);

                that.selectedPlanet.subscribe(function (data) {

                    that._planet = data;

                    var satellites = solarSystem[data];
                   // satellites[0] = "";

                    that.availableSatellites.removeAll();
                    if (satellites.length > 1) {
                        selectElementSatelliteTexture.style.visibility = "visible";
                        for (var j = 1; j < satellites.length; j++) {
                            that.availableSatellites.push(satellites[j]);
                        }
                    } else {
                        selectElementSatelliteTexture.style.visibility = "hidden";
                    }

                    var adressGetCapabilities = that._urlServer + "?map=" + that._serverDir + that._planet + "/" + that._planet + that._serverMapExtension + "&service=WMS&request=GetCapabilities";

                    var xhr = getXMLHttpRequest();
                    getXmlData(xhr, 'post', adressGetCapabilities, true, that);
                });

                that.selectedSatellite = knockout.observableArray();
                that.selectedSatellite.subscribe(function (data) {
                    that._satellite = data;
console.log(data);
                    var adressGetCapabilities = that._urlServer + "?map=" + that._serverDir + that._planet + "/" + that._satellite + that._serverMapExtension + "&service=WMS&request=GetCapabilities";

                    var xhr = getXMLHttpRequest();
                    getXmlData(xhr, 'post', adressGetCapabilities, true, that);
                });

                that.selectedLayer = knockout.observableArray();
                that.selectedLayer.subscribe(function (data) {
                    that._layer = data;

                    //   console.log(data);

                    var imageryProvider = new WebMapServiceImageryProvider({
                        url: data.layerUrl,
                        layers: data.layer,
                        credit: 'USGS @ planetarymaps.usgs.gov',
                        ellipsoid: that._ellipsoid,
                        enablePickFeatures: false
                    });

                    that._viewer.imageryLayers.removeAll();
                    var imageryLayers = that._viewer.imageryLayers;
                    var layer = imageryLayers.addImageryProvider(imageryProvider);
                });
            }

            function getXmlData(xhr, method, url, async, that) {

                that.availableLayers.removeAll();
                
                console.log(url);

                xhr.open(method, url, async);
                xhr.withCredentials = false;
                xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                //   xhr.send();

                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4 && xhr.status == 200 || xhr.status == 0) {

                        var data = xhr.responseXML;
                        try {

                            var service = data.getElementsByTagName("Service");
                            var serviceName = service[0].getElementsByTagName("Name")[0].textContent;
                            var widthMax = service[0].getElementsByTagName("MaxWidth")[0].textContent;
                            var heightMax = service[0].getElementsByTagName("MaxHeight")[0].textContent;
                            var onlineResource = service[0].getElementsByTagName("OnlineResource")[0].getAttributeNS('http://www.w3.org/1999/xlink', 'href');

                            var capability = data.getElementsByTagName("Capability");
                            var layers = capability[0].getElementsByTagName("Layer");

                            var names = [];
                            var title = []
                            var abstract = [];
                            var layerName = [];
                            var layer = [];
                            var crs;
                            var bBox = [];
                            var imageryProvidersTab = [];

                            for (var i = 0; i < layers.length; i++) {

                                names[i] = layers[i].getElementsByTagName("Title")[0].textContent;
                                layer[i] = layers[i].getElementsByTagName("Name")[0].textContent;
                                title[i] = layers[i].getElementsByTagName("Title")[0].textContent;

                                try {
                                    abstract[i] = layers[i].getElementsByTagName("Abstract")[0].textContent;
                                } catch (e) {
                                    abstract[i] = "abstract unavailable"
                                }

                                crs = layers[0].getElementsByTagName("CRS")[0].textContent;
                                bBox[i] = layers[i].getElementsByTagName("BoundingBox")[0];

                                var nameLowCase = names[i].toLowerCase();
                                var nameLowCaseTab = nameLowCase.split("_");
                                var finalLayerName = '';

                                for (var j = 0; j < nameLowCaseTab.length; j++) {
                                    if (j == 0) {
                                        var MajName = nameLowCaseTab[j].replace(nameLowCaseTab[j].charAt(0), nameLowCaseTab[j].charAt(0).toUpperCase())
                                        finalLayerName += MajName + ' ';

                                    } else {
                                        finalLayerName += nameLowCaseTab[j] + ' ';
                                    }
                                }

                                var bboxString = bBox[i].attributes[2].value + ',' + bBox[i].attributes[1].value + ',' + bBox[i].attributes[4].value + ',' + bBox[i].attributes[3].value;
                                var imageryRequestParam = 'SERVICE=' + serviceName + '&' + 'VERSION=1.1.1' + '&' + 'SRS=' + crs + '&' + 'STYLES=' + '' + '&' + 'REQUEST=GetMap' + '&' + 'FORMAT=image%2Fjpeg' + '&' + 'LAYERS=' + layer[i] + '&' + 'BBOX=' + bboxString + '&' + 'WIDTH=' + widthMax + '&' + 'HEIGHT=' + heightMax;

                                var finalUrl = onlineResource + '&' + imageryRequestParam;

                                var infosLayers = {
                                    layerName: finalLayerName,
                                    layerUrl: finalUrl,
                                    layer: layer[i]
                                }

                                that.availableLayers.push(infosLayers);

                            }

                        } catch (e) {
                            console.log(e);
                        }

                    } else if (xhr.readyState == 4 && xhr.status == 404) {
                        console.log("Oh no, it does not exist!");
                    }
                }
                xhr.send();
            }

            function getXMLHttpRequest() {
                if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
                    var xhr = new XMLHttpRequest();
                } else if (typeof ActiveXObject !== " undefined") {
                    var xhr = new ActiveXObject("Microsoft.XMLHTTP"); // activeX pour IE
                } else {
                    console.log("AJAX don't available on this browser");
                    var xhr = null;
                }
                return xhr;
            }

            var PanelViewModel = function (serverDataObject, solarSystem, elementsForAxis, selectElementSatelliteTexture, viewer) {

                this._viewer = viewer;
                this._elementsForAxis = elementsForAxis;
                this._serverDataObject = serverDataObject;
                this._solarSystem = solarSystem;
                this._selectElementSatelliteTexture = selectElementSatelliteTexture;

                console.log(serverDataObject);

                var that = this;

                var url = 'Cesium/ConfigurationFiles/serverList.json';
                textureSelection(that._serverDataObject, that._solarSystem, that._selectElementSatelliteTexture, that);

                this._validateCommand = createCommand(function () {
                    createNewEllipsoid(that, elementsForAxis);
                });

                this._validateTextureCommand = createCommand(function () {
                });

                this._loadCommand = createCommand(function () {
                    console.log("je charge un fichier");
                });


                /**
                 * Gets or sets the tooltip.  This property is observable.
                 *
                 * @type {String}
                 */

                knockout.track(this, ['isCustomPanelActive', "xAxisValue", "yAxisValue", "zAxisValue"]);
            };

            defineProperties(PanelViewModel.prototype, {
                /**
                 * Gets the Command that is executed when the button is clicked.
                 * @memberof PanelViewModel.prototype
                 *
                 * @type {Command}
                 */
                validateCommand: {
                    get: function () {
                        return this._validateCommand;
                    }
                },
                validateTextureCommand: {
                    get: function () {
                        return this._validateTextureCommand;
                    }
                },
                loadCommand: {
                    get: function () {
                        return this._loadCommand;
                    }
                },
            });


            return PanelViewModel;
        });
