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
                    entity._billboard.color = new Color(1.0, 0.0, 0.0, 1.0);


                    /* *************** COMMANDE A UTILISER POUR MODIFIER LE CONTENU DU INFOBOX *************** */

                    viewer.infoBox.frame.contentDocument.body.contentEditable = false;

                    /* *************************************************************************************** */

                    if (!lastEntity) {
                        lastEntity = entity;
                    } else if (lastEntity && lastEntity !== entity) {
                        lastEntity._billboard.color = new Color(1.0, 1.0, 1.0, 1.0);
                        lastEntity = entity;

                    } else if (lastEntity && lastEntity === entity) {
                        lastEntity._billboard.color = new Color(1.0, 0.0, 0.0, 1.0);
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
                    entity._billboard.color = new Color(0.0, 1.0, 0.0, 1.0);

                    lastEntity = null;
                }
            }, ScreenSpaceEventType.RIGHT_CLICK);


        } else if (that._isActive === false) {

            if (that._handlerLeft)
                that._handlerLeft.removeInputAction(ScreenSpaceEventType.LEFT_CLICK);
            if (that._handlerRight)
                that._handlerRight.removeInputAction(ScreenSpaceEventType.RIGHT_CLICK);

            var link = document.getElementById('saveFile');
            var wrapper = document.getElementById('wrapper');

            if (link) {
                wrapper.removeChild(link);
            }
        }
    }

    function createFile(toolbar, scene, viewer, that) {

        if (viewer.dataSources._dataSources[0]) {

            var ellipsoid = scene.globe.ellipsoid;
            var geoJson = viewer.geoJsonData;

            var dimArray = viewer.dataSources._dataSources[0]._entityCollection._entities._array.length;

            for (var i = 0; i < dimArray; i++) {
                var modifiedProperties = viewer.dataSources._dataSources[0]._entityCollection._entities._array[i]._properties;
                var modifiedPosition = viewer.dataSources._dataSources[0]._entityCollection._entities._array[i]._position._value;
                var cartographic = ellipsoid.cartesianToCartographic(modifiedPosition);

                var longitudeRad = cartographic.longitude;
                var latitudeRad = cartographic.latitude;

                var latitudeDeg = CesiumMath.toDegrees(latitudeRad);
                var longitudeDeg = CesiumMath.toDegrees(longitudeRad);

                geoJson.features[i].properties = modifiedProperties;
                geoJson.features[i].geometry.coordinates = [longitudeDeg, latitudeDeg];
            }

            var jsonData = JSON.stringify(geoJson);
            var blob = new Blob([jsonData], {
                type: 'application/octet-stream'
            });
            var url = URL.createObjectURL(blob);

            var fileName = 'jsonFile.json';

            try {
                that._saveLink.parentElement.removeChild(that._saveLink);
            } catch (e) {
            }

            that._wrapper = document.getElementById('wrapper');
            that._saveLink = document.createElement('a');
            that._saveLink.className = 'cesium-button cesium-toolbar-button cesium-sceneModePicker-dropDown-icon';
            that._saveLink.innerHTML = '<svg width="25px" height="25px" viewBox="-10 0 100 100">\
												<g>\
													<path d="M84.514,49.615H67.009c-2.133,0-4.025,1.374-4.679,3.406c-1.734,5.375-6.691,8.983-12.329,8.983\
														c-5.64,0-10.595-3.608-12.329-8.983c-0.656-2.032-2.546-3.406-4.681-3.406H15.486c-2.716,0-4.919,2.2-4.919,4.919v28.054\
														c0,2.714,2.203,4.917,4.919,4.917h69.028c2.719,0,4.919-2.203,4.919-4.917V54.534C89.433,51.815,87.233,49.615,84.514,49.615z"/>\
													<path d="M48.968,52.237c0.247,0.346,0.651,0.553,1.076,0.553h0.003c0.428,0,0.826-0.207,1.076-0.558l13.604-19.133\
														c0.286-0.404,0.321-0.932,0.096-1.374c-0.225-0.442-0.682-0.716-1.177-0.716h-6.399V13.821c0-0.735-0.593-1.326-1.323-1.326H44.078\
														c-0.732,0-1.323,0.591-1.323,1.326v17.188h-6.404c-0.495,0-0.949,0.279-1.174,0.716c-0.229,0.442-0.19,0.97,0.098,1.374\
														L48.968,52.237z"/>\
												</g>\
												</svg>';
            that._saveLink.href = url;
            that._saveLink.target = '_blank';
            that._saveLink.download = fileName || 'unknown';
            that._saveLink.setAttribute('id', 'saveFile');
            that._saveLink.onclick = function () {
                this.parentElement.removeChild(this);
            };
            that._wrapper.appendChild(that._saveLink);

        } else {
            alert('Load a file in first');
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

        this._saveCommand = createCommand(function () {
            markerMoveSave(that._toolbar, that._scene, that._viewer, that);
        });

        this._saveCommandLink = createCommand(function () {
            createFile(that._toolbar, that._scene, that._viewer, that);
        });

        this._destroyCommandLink = createCommand(function () {
            destroyLink(that._toolbar, that._scene, that._viewer, that);
        });

        /** Gets or sets the tooltip.  This property is observable.
         *
         * @type {String}
         */
        this.tooltip = 'Marker edit';
        this.tooltip2 = 'Create file';
        this.selectedTooltip = 'Marker edit';

        knockout.track(this, ['tooltip', 'tooltip2', 'selectedTooltip', 'dropDownVisible', 'isActive', 'destroyLink', 'isPanelToolVisibleMarkerMove']);
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
        saveCommand: {
            get: function () {
                return this._saveCommand;
            }
        },
        saveCommandLink: {
            get: function () {
                return this._saveCommandLink;
            }
        },
        destroyCommandLink: {
            get: function () {
                return this._destroyCommandLink;
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
