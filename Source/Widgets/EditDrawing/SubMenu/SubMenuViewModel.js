// 275.484,39.095 ==> Coordonnees du stade
// 256.955,42.127 ==> coordonn�es des cercles de cultures

/*global define*/
define([
        '../../../Core/Cartesian3',
        '../../../Core/Color',
        '../../../Core/defineProperties',
        '../../../Core/Math',
        '../../../Core/ScreenSpaceEventHandler',
        '../../../Core/ScreenSpaceEventType',
        '../../../DataSources/GeoJsonDataSource',
        '../../../Scene/Material',
        '../../../Scene/MaterialAppearance',
        '../../../ThirdParty/knockout',
        '../../createCommand',
        './ColorPicker/ColorPicker'
    ], function(
        Cartesian3,
        Color,
        defineProperties,
        CesiumMath,
        ScreenSpaceEventHandler,
        ScreenSpaceEventType,
        GeoJsonDataSource,
        Material,
        MaterialAppearance,
        knockout,
        createCommand,
        ColorPicker) {
    'use strict';

    function flagFunctionV2(that, viewer) {

        try {
            that._viewer.drawLines.viewModel.subMenu.viewModel.removeAllCommands();
        } catch (e) {
        }

        try {
            that._viewer.editDrawing.viewModel.subMenu.viewModel.colorPicker.destroyColorPickerContainer();
        } catch (e) {
        }

        try {
            that._viewer.editDrawing.viewModel.subMenu.viewModel.colorPicker.viewModel.removeHandlers();
        } catch (e) {
        }

        if (!that._isflagCommandActive) {

            that._handlerLeft = new ScreenSpaceEventHandler(viewer.scene.canvas);
            that._handlerRight = new ScreenSpaceEventHandler(viewer.scene.canvas);

            /*==================================================================
             ========================== REMOVE OBJECT ==========================
             =================================================================== */

            that._handlerRight.setInputAction(function (click) {

                var pickedObject = null;

                // we pick an object with a click mouse
                pickedObject = viewer.scene.pick(click.position);

                var objectId;

                if (pickedObject.id) {
                    objectId = pickedObject.id;
                }

                objectId.entityCollection.remove(objectId);

            }, ScreenSpaceEventType.RIGHT_CLICK);

            /*==================================================================
             ===================================================================
             =================================================================== */

            that._handlerLeft.setInputAction(function (click) {


                var pickedObject = null;

                // we pick an object with a click mouse
                pickedObject = viewer.scene.pick(click.position);

                var objectId;

                if (pickedObject.id) {
                    objectId = pickedObject.id;
                }

                var getColorObject;
                var colorObject;
                var colorObjectN;
                var colorProperty;

                if (pickedObject.id) {

                    for (var i = 0; i < that._propertiesNames.length; i++) {

                        if (objectId[that._propertiesNames[i]]) {

                            var objectType = objectId[that._propertiesNames[i]];

                            if (that._propertiesNames[i] === 'ellipse' || that._propertiesNames[i] === 'point') {

                                var objectTypeEllipse = objectId['ellipse'];
                                var objectTypePoint = objectId['point'];
                                var rgba;

                                try {
                                    getColorObject = that._viewer.editDrawing.viewModel.subMenu.viewModel.colorPicker.viewModel.tableViewModel.selectedColor;

                                    if (getColorObject !== null) {

                                        colorObjectN = getColorObject.normalizedColor;
                                        colorObject = getColorObject.color;
                                        colorProperty = getColorObject.property;

                                        objectTypeEllipse.material.color = colorObjectN;

                                        objectTypePoint.color = colorObjectN;
                                        objectTypePoint.outlineColor._value = colorObjectN;
                                        objectTypePoint.outlineWidth._value = 3;


                                        rgba = parseInt(colorObject.red) + ', ' + parseInt(colorObject.green) + ', ' + parseInt(colorObject.blue) + ', ' + colorObject.alpha;
                                        objectId.properties.flagColor = rgba;
                                        objectId.properties[colorProperty.propertyName] = colorProperty.propertyValue;


                                        var entities = objectId.entityCollection._entities._array;
                                        that._viewer.editDrawing.viewModel.subMenu.viewModel.colorPicker.flagCounter.viewModel.counterUpdate = entities;

                                        break;

                                    }
                                } catch (e) {

                                    getColorObject = that._viewer.editDrawing.viewModel.subMenu.viewModel.colorPicker.viewModel.tableViewModel.selectedColor;

                                    if (getColorObject !== null) {

                                        colorObjectN = getColorObject.normalizedColor;
                                        colorObject = getColorObject.color;
                                        colorProperty = getColorObject.property;

                                        objectType.color = colorObjectN;
                                        objectType.outlineColor._value = colorObjectN;
                                        objectType.outlineWidth._value = 1;

                                        if (!objectId.properties) {
                                            objectId.properties = {};
                                        }


                                        rgba = parseInt(colorObject.red) + ', ' + parseInt(colorObject.green) + ', ' + parseInt(colorObject.blue) + ', ' + colorObject.alpha;
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

                    getColorObject = that._viewer.editDrawing.viewModel.subMenu.viewModel.colorPicker.viewModel.tableViewModel.selectedColor;

                    if (getColorObject !== null) {

                        colorObjectN = getColorObject.normalizedColor;
                        colorObject = getColorObject.color;
                        colorProperty = getColorObject.property;

                        var appearance = new MaterialAppearance({
                            material: Material.fromType('Color', {color: colorObjectN}),
                            faceForward: true
                        });

                        if (objectPrimitive.material) { // for polylines

                            objectPrimitive.material.uniforms.color = colorObjectN;

                        } else {

                            objectPrimitive.appearance = appearance; // for circles and polygons
                        }

                    }
                }

            }, ScreenSpaceEventType.LEFT_CLICK);

            that._isflagCommandActive = true;
        }
    }

    function markerMoveView(toolbar, viewer, that) {

        var scene = viewer._cesiumWidget._scene;

        if (that._ismarkeditCommandActive === true) {

            // Mouse Event initialization
            that._handlerLeft = new ScreenSpaceEventHandler(scene.canvas);
            that._handlerRight = new ScreenSpaceEventHandler(scene.canvas);

            var lastEntity;
            var entity = null;

            // Left click event :  
            that._handlerLeft.setInputAction(function (click) {

                // remove all handlers of others widget to avoid conflics
                try {
                    that._viewer.drawLines.viewModel.subMenu.viewModel.removeAllCommands;
                } catch (e) {
                }

                entity = null;
                var pickedObject = null;


                // pick an object with a mouse clic
                pickedObject = viewer.scene.pick(click.position);

                // if we get an object then...
                if (pickedObject) {

                    entity = pickedObject.primitive.id;
                    if (entity._billboard) {
                        entity._billboard.color = new Color(1.0, 0.0, 0.0, 1.0);
                    } else {
                        entity._point.color = new Color(1.0, 0.0, 0.0, 1.0);
                    }

                    /* *************** COMMANDE A UTILISER POUR MODIFIER LE CONTENU DU INFOBOX *************** */

                    viewer.infoBox.frame.contentDocument.body.contentEditable = false;

                    /* *************************************************************************************** */

                    if (!lastEntity) {
                        lastEntity = entity;
                    } else if (lastEntity && lastEntity !== entity) {
                        if (lastEntity._billboard) {
                            lastEntity._billboard.color = new Color(1.0, 1.0, 1.0, 1.0);
                        } else {
                            lastEntity._point.color = new Color(1.0, 1.0, 1.0, 1.0);
                        }
                        lastEntity = entity;
                    } else if (lastEntity && lastEntity === entity) {
                        if (lastEntity._billboard) {
                            lastEntity._billboard.color = new Color(1.0, 0.0, 0.0, 1.0);
                        } else {
                            lastEntity._point.color = new Color(1.0, 0.0, 0.0, 1.0);
                        }
                        lastEntity = entity;
                    }
                }
            }, ScreenSpaceEventType.LEFT_CLICK);

            that._handlerRight.setInputAction(function (click) {

                var ellipsoid = viewer.scene.globe.ellipsoid;
                var cartesian = viewer.scene.camera.pickEllipsoid(click.position, ellipsoid);
                var cartographic = ellipsoid.cartesianToCartographic(cartesian);

                if (entity) {

                    entity.position._value = cartesian;

                    var longitudeRad = cartographic.longitude;
                    if (longitudeRad < 0) {
                        longitudeRad = longitudeRad + 2.0 * Math.PI;
                    }
                    if (entity._billboard) {
                        entity._billboard.color = new Color(0.0, 1.0, 0.0, 1.0);
                    } else {
                        entity._point.color = new Color(0.0, 1.0, 0.0, 1.0);
                    }
                    entity.properties.flagColor = '0.0, 1.0, 0.0, 1.0';
                    lastEntity = null;
                }
            }, ScreenSpaceEventType.RIGHT_CLICK);


        } else if (that._ismarkeditCommandActive === false) {

            if (that._handlerLeft)
                that._handlerLeft.removeInputAction(ScreenSpaceEventType.LEFT_CLICK);
            if (that._handlerRight)
                that._handlerRight.removeInputAction(ScreenSpaceEventType.RIGHT_CLICK);
        }
    }

    /**
     * The view model for {@link subMenu}.
     * @alias SubMenuViewModel
     * @constructor
     */
    var SubMenuViewModel = function (viewer, viewerContainer) {

        this._viewer = viewer;
        this._viewerContainer = viewerContainer;
        this._isflagCommandActive = false;
        this._ismarkeditCommandActive = false;
        this._ellipsoid = viewer.scene.globe.ellipsoid;
        this._propertiesNames = ['point', 'ellipse', 'polygon', 'polyline'];

        var that = this;

        viewer.infoBox.viewModel.showInfo = false;

        this._flagCommand = createCommand(function () {

            flagFunctionV2(that, that._viewer);
            that._colorPicker = new ColorPicker(that._viewerContainer, that._viewer);
        });

        this._markeditCommand = createCommand(function () {

            try {
                that._viewer.drawLines.viewModel.subMenu.viewModel.removeAllCommands;
            } catch (e) {
            }

            that._ismarkeditCommandActive = !that._ismarkeditCommandActive;
            markerMoveView(that._toolbar, that._viewer, that);
            that.dropDownVisible = !that.dropDownVisible;
        });

        this._closeSubMenu = createCommand(function () {

            removeHandlers(that);

            try {
                that._viewer.editDrawing.viewModel.subMenu.destroyWrapperMenu;
            } catch (e) {
            }

            try {
                that._viewer.editDrawing.viewModel.subMenu.viewModel.colorPicker.destroyColorPickerContainer();
            } catch (e) {
            }
        });

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
        markeditCommand: {
            get: function () {
                return this._markeditCommand;
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
                if (this._handlerLeft) {
                    this._handlerLeft.removeInputAction(ScreenSpaceEventType.LEFT_CLICK);
                }
                if (this._handlerRight) {
                    this._handlerRight.removeInputAction(ScreenSpaceEventType.RIGHT_CLICK);
                }
            }
        },
        removeAllHandlers: {
            get: function () {
                if (this._handlerLeft) {
                    this._handlerLeft.removeInputAction(ScreenSpaceEventType.LEFT_CLICK);
                }
                if (this._handlerRight) {
                    this._handlerRight.removeInputAction(ScreenSpaceEventType.RIGHT_CLICK);
                }
            }
        }
    });

// ================================================================================================================================
// ======================================================= LOCAL FUNCTIONS ========================================================
// ================================================================================================================================

    function removeHandlers(that) {

        if (that._handlerLeft) {
            that._handlerLeft.removeInputAction(ScreenSpaceEventType.LEFT_CLICK);
        }
        if (that._handlerRight) {
            that._handlerRight.removeInputAction(ScreenSpaceEventType.RIGHT_CLICK);
        }
    }

    return SubMenuViewModel;
});
