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
            "use strict"

            function  showPanel(that) {

                if (!that._isCustomPanelActive) {
                    that._configContainer.style.zIndex = "2";
                    that._configContainer.style.opacity = "1";
                    that._configContainer.className = 'cesium-customObject-configContainer-show';

                    that._ellipsParamContainer.style.zIndex = "2";
                    that._ellipsParamContainer.style.left = "40px";
                    that._ellipsParamContainer.className = "cesium-customObject-ellipsoidParameters-show";

                    setTimeout(function () {
                        that._ellipsTextContainer.style.zIndex = "2";
                        that._ellipsTextContainer.style.left = "330px";
                        that._ellipsTextContainer.className = "cesium-customObject-ellipsoidTexture-show";
                    }, 500);


                    that._isCustomPanelActive = true;

                } else if (that._isCustomPanelActive) {

                    that._configContainer.style.zIndex = "-1";
                    that._configContainer.style.opacity = "0";
                    that._configContainer.className = 'cesium-customObject-configContainer-show';

                    setTimeout(function () {
                        that._ellipsParamContainer.style.zIndex = "-1";
                        that._ellipsParamContainer.style.left = "-470px";
                        that._ellipsParamContainer.className = "cesium-customObject-ellipsoidParameters-hide";

                        that._ellipsTextContainer.style.zIndex = "-1";
                        that._ellipsTextContainer.style.left = "-470px";
                        that._ellipsTextContainer.className = "cesium-customObject-ellipsoidTexture-hide";
                    }, 200);

                    that._isCustomPanelActive = false;
                }
            }

            var CustomObjectViewModel = function (configContainer, ellipsParamContainer, ellipsTextContainer, viewer) {

                this._configContainer = configContainer;
                this._ellipsParamContainer = ellipsParamContainer;
                this._ellipsTextContainer = ellipsTextContainer;

                this._viewer = viewer;
                this._isCustomPanelActive = false;

                var that = this;

                this._customCommand = createCommand(function () {
                    initialization(that);
                    showPanel(that);
                });
                
                this._validateCommand = createCommand(function () {
                    
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
                
                validateCommand: {
                    get: function () {
                        return this._validateCommand;
                    }
                },
            });


            function initialization(that) {
                that._ellipsoid = freezeObject(new Ellipsoid(1000000.0, 1000000.0, 1000000.0)); // 1000 km
                Ellipsoid.WGS84 = freezeObject(that._ellipsoid); // A MODIFIER 

                try {
                    that._viewer.scene.primitives.removeAll(true);
                    that._viewer.lngLat.viewModel.removeCommand;
                    that._viewer.drawLines.viewModel.subMenu.destroyWrapperMenu;
                    that._viewer.drawLines.viewModel.subMenu.viewModel.removeAllCommands;
                } catch (e) {
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
                
                

             //   that._viewer.scene.camera.zoomIn(10000);
                
                
            }


            return CustomObjectViewModel;
        });
