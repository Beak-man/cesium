/* Structure de base des widgets en Cesium : il faut respecter cette structure */

/*global define*/
define([
        '../../Core/Color',
        '../../Core/defineProperties',
        '../../Core/destroyObject',
        '../../Core/Math',
        '../../Core/ScreenSpaceEventHandler',
        '../../Core/ScreenSpaceEventType',
        '../../ThirdParty/knockout',
        '../createCommand'
    ], function(
        Color,
        defineProperties,
        destroyObject,
        CesiumMath,
        ScreenSpaceEventHandler,
        ScreenSpaceEventType,
        knockout,
        createCommand) {
    'use strict';

    function markerMoveView(toolbar, scene, viewer, that) {

        if (that._isActive === true) {

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


        } else if (that._isActive === false) {

            if (that._handlerLeft)
                that._handlerLeft.removeInputAction(ScreenSpaceEventType.LEFT_CLICK);
            if (that._handlerRight)
                that._handlerRight.removeInputAction(ScreenSpaceEventType.RIGHT_CLICK);
        }
    }

    var MarkerMoveViewModel = function (toolbar, container, scene, viewer) {

        this._scene = scene;
        this._toolbar = toolbar;
        this._container = container;
        this._viewer = viewer;

        this._isPanelToolVisibleMarkerMove = false;

        /**
         * Gets or sets whether the button drop-down is currently visible.  This property is observable.
         * @type {Boolean}
         * @default false
         */
        this.dropDownVisible = false;
        this._isActive = false;

        this._handlerLeft = new ScreenSpaceEventHandler(scene.canvas);
        this._handlerRight = new ScreenSpaceEventHandler(scene.canvas);

        var that = this;

        this._command = createCommand(function () {

            try {
                that._viewer.drawLines.viewModel.subMenu.viewModel.removeAllCommands;
            } catch (e) {
            }

            that._isActive = !that._isActive;
            markerMoveView(that._toolbar, that._scene, that._viewer, that);
            that.dropDownVisible = !that.dropDownVisible;
        });

        /** Gets or sets the tooltip.  This property is observable.
         *
         * @type {String}
         */
        this.tooltip = 'Marker edit';
        knockout.track(this, ['tooltip', 'dropDownVisible', 'isActive', 'isPanelToolVisibleMarkerMove']);
    };

    defineProperties(MarkerMoveViewModel.prototype, {
        /**
         * Gets the Command that is executed when the button is clicked.
         * @memberof HomeButtonViewModel.prototype
         *
         * @type {Command}
         */
        command: {
            get: function () {
                return this._command;
            }
        },
        toggleDropDown: {
            get: function () {
                return this._toggleDropDown;
            },
            isActive: {
                get: function () {
                    return this._isActive;
                },
                set: function (value) {
                    this._isActive = value;
                    console.log('valeur de _isActive = ' + this._isActive);
                }
            },
            handlerRight: {
                get: function () {
                    return this._handlerRight;
                }
            },
            handlerLeft: {
                get: function () {
                    return this._handlerLeft;
                }
            },
            dropDownVisible: {
                get: function () {
                    return this.dropDownVisible;
                },
                set: function (bool) {
                    this.dropDownVisible = bool;
                }
            },
            isPanelToolVisibleMarkerMove: {
                get: function () {
                    return this._isPanelToolVisibleMarkerMove;
                }
            }
        }
    });

    MarkerMoveViewModel.prototype.destroy = function () {

        destroyObject(this);
    };

    return MarkerMoveViewModel;

});
