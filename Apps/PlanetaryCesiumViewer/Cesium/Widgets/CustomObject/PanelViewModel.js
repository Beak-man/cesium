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
            
            
            function testInputValues(inputField){
                
                if (/^[0-9.,]+$/g.test(inputField.value)) {
                    return true;
                } else {
                    
                    console.log("pas que des chiffres");
                    alert("Please, enter a NUMBER type value for the " +inputField.name.toUpperCase() +" axis");
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

            var PanelViewModel = function (elementsForAxis, viewer) {

                this._viewer = viewer;
                this._elementsForAxis = elementsForAxis;
                var that = this;

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
