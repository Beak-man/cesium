define([
    '../../Core/Math',
    '../../Core/defineProperties',
    '../../Core/ScreenSpaceEventHandler',
    '../../Core/ScreenSpaceEventType',
    '../../ThirdParty/knockout',
    '../createCommand'],
        function (
                CesiumMath,
                defineProperties,
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
                        that._ellipsTextContainer.style.left = "280px";
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
                    initialization(that._viewer);
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
            });


            function initialization() {

            }


            return CustomObjectViewModel;
        });
