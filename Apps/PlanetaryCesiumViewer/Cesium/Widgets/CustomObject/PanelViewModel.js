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
    '../createCommand'],
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
                createCommand) {
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


            function textureSelection(serverDataObject, solarSystem, that) {

               var server_1 = serverDataObject.server1;
               var server_2 = serverDataObject.server2;
               
               var servers = [];
               
               for (var server in serverDataObject) {
                   servers.push(server);
               }
               
               
               
               var Planets = [];
               
               for (var i in solarSystem) {
                   Planets.push(i.toString());
               }

                that.availableServers = knockout.observableArray(servers);
                that.availablePlanets = knockout.observableArray(Planets);
                
                that.selectedServer = knockout.observableArray();
                that.selectedServer.subscribe(function (data) {
                    console.log(data.url)
                });
                that.selectedPlanet = knockout.observableArray();
                that.selectedPlanet.subscribe(function (data) {
                    console.log(data)
                });
            }

            var PanelViewModel = function (serverDataObject, solarSystem, elementsForAxis, viewer) {

                this._viewer = viewer;
                this._elementsForAxis = elementsForAxis;
                this._serverDataObject = serverDataObject;
                this._solarSystem = solarSystem;

                 console.log(serverDataObject);

                var that = this;

                var url = 'Cesium/ConfigurationFiles/serverList.json';
                textureSelection(that._serverDataObject, that._solarSystem, that);

                this._validateCommand = createCommand(function () {
                    createNewEllipsoid(that, elementsForAxis);
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
                loadCommand: {
                    get: function () {
                        return this._loadCommand;
                    }
                },
            });


            return PanelViewModel;
        });
