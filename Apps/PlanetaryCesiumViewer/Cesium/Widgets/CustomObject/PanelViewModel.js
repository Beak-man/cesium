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

            }

            var PanelViewModel = function (elementsForAxis, viewer) {

                this._viewer = viewer;
                this._elementsForAxis = elementsForAxis;
                var that = this;
                
                this._validateCommand = createCommand(function () {
                    
                  //  console.log("dans PanelViewModel");
                    console.log(parseFloat(that._elementsForAxis.x.value));
                    console.log(parseFloat(that._elementsForAxis.y.value));
                    console.log(parseFloat(that._elementsForAxis.z.value));
                    
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
            });


            return PanelViewModel;
        });
