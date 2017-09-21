define([
        '../../Core/Cartesian3',
        '../../Core/Color',
        '../../Core/defineProperties',
        '../../Core/Ellipsoid',
        '../../Core/EllipsoidTerrainProvider',
        '../../Core/freezeObject',
        '../../Core/GeographicProjection',
        '../../Core/Math',
        '../../Core/ScreenSpaceEventHandler',
        '../../Core/ScreenSpaceEventType',
        '../../Scene/Globe',
        '../../ThirdParty/knockout',
        '../createCommand'
    ], function(
        Cartesian3,
        Color,
        defineProperties,
        Ellipsoid,
        EllipsoidTerrainProvider,
        freezeObject,
        GeographicProjection,
        CesiumMath,
        ScreenSpaceEventHandler,
        ScreenSpaceEventType,
        Globe,
        knockout,
        createCommand) {
            'use strict';

            function initialization(that) {

                if (!that._isCustomWidgetActive) {

                    that._ellipsoid = freezeObject(new Ellipsoid(1000000.0, 1000000.0, 1000000.0)); // 1000 km
                    Ellipsoid.WGS84 = freezeObject(that._ellipsoid); // A MODIFIER 

                    try {
                        that._viewer.scene.primitives.removeAll(true);
                        that._viewer.lngLat.viewModel.removeCommand();

                    } catch (e) {
                        console.log(e);
                    }

                    try {
                        that._viewer.drawLines.viewModel.subMenu.destroyWrapperMenu();
                        that._viewer.drawLines.viewModel.subMenu.viewModel.removeAllCommands();
                    } catch (e) {
                        console.log(e);
                    }

                    try {
                        that._viewer.showSystems.viewModel.hidePanel();
                    } catch (e) {
                        console.log(e);
                    }

                    var newTerrainProvider = new EllipsoidTerrainProvider({ellipsoid: that._ellipsoid});
                    var newGeographicProjection = new GeographicProjection(that._ellipsoid);
                    var newGlobe = new Globe(that._ellipsoid);

                    /*  var newOccluder          = new Occluder(new BoundingSphere(Cartesian3.ZERO, that._ellipsoid.minimumRadius), Cartesian3.ZERO);    
                     var cameraPosition         =  Cartesian3.ZERO;
                     var occluderBoundingSphere = new BoundingSphere(Cartesian3.ZERO, that._ellipsoid.minimumRadius);
                     Occluder.fromBoundingSphere(occluderBoundingSphere, cameraPosition, newOccluder);  */

                    that._viewer.dataSources.removeAll(true);
                    that._viewer.scene.globe = newGlobe;
                    that._viewer.scene.mapProjection = newGeographicProjection;
                    that._viewer.scene.camera.projection = newGeographicProjection;
                    that._viewer.terrainProvider = newTerrainProvider;
                    that._viewer.scene.globe.baseColor = Color.BLUE;
                    that._viewer.scene.camera.setView({
                        destination: Cartesian3.fromDegrees(0, 0, 10.0)
                    });

                    that._isCustomWidgetActive = true;
                }
            }

            function  showPanel(that) {

                if (!that._isCustomPanelActive) {
                    that._configContainer.style.zIndex = '2';
                    that._configContainer.style.opacity = '1';
                    that._configContainer.className = 'cesium-customObject-configContainer-show';

                    that._ellipsParamContainer.style.zIndex = '2';
                    that._ellipsParamContainer.style.left = '20px';
                    that._ellipsParamContainer.className = 'cesium-customObject-ellipsoidParameters cesium-customObject-ellipsoidParameters-show';

                    setTimeout(function () {
                        that._ellipsTextContainer.style.zIndex = '2';
                        that._ellipsTextContainer.style.left = '320px';
                        that._ellipsTextContainer.className = 'cesium-customObject-ellipsoidTexture cesium-customObject-ellipsoidTexture-show';
                    }, 400);

                    setTimeout(function () {
                        that._layerInfoContainer.style.zIndex = '2';
                        that._layerInfoContainer.style.left = '320px';
                        that._layerInfoContainer.className = 'cesium-customObject-infosLayer cesium-customObject-infosLayer-show';
                    }, 600);

                    setTimeout(function () {
                        that._loadConfigContainer.style.zIndex = '2';
                        that._loadConfigContainer.style.left = '20px';
                        that._loadConfigContainer.className = 'cesium-customObject-configFile cesium-customObject-configFile-show';
                    }, 700);

                    that._isCustomPanelActive = true;

                } else if (that._isCustomPanelActive) {

                    that._configContainer.style.zIndex = '-1';
                    that._configContainer.style.opacity = '0';
                    that._configContainer.className = 'cesium-customObject-configContainer-show';

                    setTimeout(function () {
                        that._ellipsParamContainer.style.zIndex = '-1';
                        that._ellipsParamContainer.style.left = '-470px';
                        that._ellipsParamContainer.className = 'cesium-customObject-ellipsoidParameters cesium-customObject-ellipsoidParameters-hide';

                        that._ellipsTextContainer.style.zIndex = '-1';
                        that._ellipsTextContainer.style.left = '-570px';
                        that._ellipsTextContainer.className = 'cesium-customObject-ellipsoidTexture cesium-customObject-ellipsoidTexture-hide';

                        that._layerInfoContainer.style.zIndex = '-1';
                        that._layerInfoContainer.style.left = '-570px';
                        that._layerInfoContainer.className = 'cesium-customObject-infosLayer cesium-customObject-infosLayer-hide';

                        that._loadConfigContainer.style.zIndex = '-1';
                        that._loadConfigContainer.style.left = '-470px';
                        that._loadConfigContainer.className = 'cesium-customObject-configFile cesium-customObject-configFile-hide';
                    }, 300);

                    that._isCustomPanelActive = false;
                }
            }

            function hidePanel(that) {

                if (that._isCustomPanelActive) {

                    that._configContainer.style.zIndex = '-1';
                    that._configContainer.style.opacity = '0';
                    that._configContainer.className = 'cesium-customObject-configContainer-show';

                    setTimeout(function () {
                        that._ellipsParamContainer.style.zIndex = '-1';
                        that._ellipsParamContainer.style.left = '-570px';
                        that._ellipsParamContainer.className = 'cesium-customObject-ellipsoidParameters cesium-customObject-ellipsoidParameters-hide';

                        that._ellipsTextContainer.style.zIndex = '-1';
                        that._ellipsTextContainer.style.left = '-570px';
                        that._ellipsTextContainer.className = 'cesium-customObject-ellipsoidTexture cesium-customObject-ellipsoidTexture-hide';

                        that._layerInfoContainer.style.zIndex = '-1';
                        that._layerInfoContainer.style.left = '-570px';
                        that._layerInfoContainer.className = 'cesium-customObject-infosLayer cesium-customObject-infosLayer-hide';

                        that._loadConfigContainer.style.zIndex = '-1';
                        that._loadConfigContainer.style.left = '-570px';
                        that._loadConfigContainer.className = 'cesium-customObject-configFile cesium-customObject-configFile-hide';
                    }, 300);

                    that._isCustomPanelActive = false;
                    that._isCustomWidgetActive = false;
                }
            }

            function listInitialisation(that) {

                that.availableObjects = knockout.observableArray([]);
                that.selectedObject = knockout.observableArray();
                that.selectedObject.subscribe(function (data) {
                    //console.log(data);

                    if (that._isCustomPanelActive) {
                        hidePanel(that);
                    }

                });
            }

            var CustomObjectViewModel = function (configContainer, ellipsParamContainer, ellipsTextContainer, layerInformationContainer, loadConfigContainer, viewer) {

                this._configContainer = configContainer;
                this._ellipsParamContainer = ellipsParamContainer;
                this._ellipsTextContainer = ellipsTextContainer;
                this._loadConfigContainer = loadConfigContainer;
                this._layerInfoContainer = layerInformationContainer;

                this._viewer = viewer;
                this._isCustomPanelActive = false;
                this._isCustomWidgetActive = false;

                var that = this;

                listInitialisation(that);

                this._customCommand = createCommand(function () {
                    initialization(that);
                    showPanel(that);
                });

                /**
                 * Gets or sets the tooltip.  This property is observable.
                 *
                 * @type {String}
                 */

                knockout.track(this, ['isCustomPanelActive']);
            };

            defineProperties(CustomObjectViewModel.prototype, {
                /**
                 * Gets the Command that is executed when the button is clicked.
                 * @memberof LngLatPanelViewModel.prototype
                 *
                 * @type {Command}
                 */
                customCommand: {
                    get: function () {
                        return this._customCommand;
                    }
                },
                isCustomWidgetActive: {
                    get: function () {
                        return this._isCustomWidgetActive;
                    },
                    set: function (boolean_value) {
                        this._isCustomWidgetActive = boolean_value;
                    }
                },
                hideCustomPanelCommand: {
                    get: function () {
                        this._isCustomWidgetActive = false;
                        hidePanel(this);
                    }
                },
                setAvailableObjects: {
                    set: function (Object) {
                        this.availableObjects.push(Object);
                        console.log(this.availableObjects());
                    }
                },
            });

            return CustomObjectViewModel;
        });
