// 275.484,39.095 ==> Coordonnees du stade
// 256.955,42.127 ==> coordonnées des cercles de cultures

/*global define*/
define([
    '../../../Core/Math',
    '../../../Core/Cartesian2',
    '../../../Core/Cartesian3',
    '../../../Core/Cartographic',
    '../../../Core/CircleGeometry',
    '../../../Core/CircleOutlineGeometry',
    '../../../Core/Color',
    '../../../Core/ColorGeometryInstanceAttribute',
    '../../createCommand',
    '../../../Core/defined',
    '../../../Core/defineProperties',
    '../../../DataSources/GeoJsonDataSource',
    '../../../Core/GeometryInstance',
    '../../../ThirdParty/knockout',
    '../../../Scene/HeightReference',
    '../../../Scene/HorizontalOrigin',
    '../../../Scene/LabelCollection',
    '../../../Scene/LabelStyle',
    '../../../Scene/Material',
    '../../../Core/NearFarScalar',
    '../../../Core/PolygonGeometry',
    '../../../Scene/PolylineCollection',
    '../../../Core/PolylinePipeline',
    '../../../Scene/PerInstanceColorAppearance',
    '../../../Scene/Primitive',
    '../../../Scene/PrimitiveCollection',
    '../../../Core/ScreenSpaceEventHandler',
    '../../../Core/ScreenSpaceEventType',
    '../../../Core/SimplePolylineGeometry',
    '../../../Scene/VerticalOrigin',
], function (
        CesiumMath,
        Cartesian2,
        Cartesian3,
        Cartographic,
        CircleGeometry,
        CircleOutlineGeometry,
        Color,
        ColorGeometryInstanceAttribute,
        createCommand,
        defined,
        defineProperties,
        GeoJsonDataSource,
        GeometryInstance,
        knockout,
        HeightReference,
        HorizontalOrigin,
        LabelCollection,
        LabelStyle,
        Material,
        NearFarScalar,
        PolygonGeometry,
        PolylineCollection,
        PolylinePipeline,
        PerInstanceColorAppearance,
        Primitive,
        PrimitiveCollection,
        ScreenSpaceEventHandler,
        ScreenSpaceEventType,
        SimplePolylineGeometry,
        VerticalOrigin
        ) {
    "use strict";

    function flagFunction(that, viewer) {

        if (!that._isflagCommandActive) {

            that._handlerLeft = new ScreenSpaceEventHandler(viewer.scene.canvas);
            that._handlerRight = new ScreenSpaceEventHandler(viewer.scene.canvas);

            that._handlerLeft.setInputAction(function (click) {

                // on retire les handlers des autres fonctionnalités afin d'éviter les conflits
                try {
                    that._viewer.drawLines.viewModel.subMenu.viewModel.removeAllCommands;
                } catch (e) {
                }

                // on recupere l'ellipsoid
                var ellipsoid = viewer.scene.globe.ellipsoid;

                var pickedObject = null;

                // on capture un objet avec le click de la souris
                pickedObject = viewer.scene.pick(click.position);

                console.log(pickedObject);
                console.log(pickedObject.primitive.id);

                var objectProperties = pickedObject.id.properties;
                var objectPrimitive = pickedObject.primitive;

                var objectId;
                var id;

                if (pickedObject.id) {
                    objectId = pickedObject.id;
                    id = pickedObject.id.id;
                }

                if (objectProperties.radius) {

                    try {
                        var radiusString = objectProperties.radius;
                        var stringSplit = radiusString.split(" ");
                        var radius = parseFloat(stringSplit[0]);
                    } catch (e) {
                        var radiusString = objectProperties.radius;
                        var radius = parseFloat(radiusString);
                    }
                }
                console.log(viewer.scene);

                var objectPosition = pickedObject.position;
                
                 pickedObject.material = new Color(1.0, 0.0, 0.0, 0.3);

                var bool = viewer.scene.primitives.contains(pickedObject.primitive);
                console.log(bool);
                
                 viewer.scene.primitives.get(1).material = new Color(0.0, 1.0, 0.0, 0.3);
                 viewer.scene.primitives.get(1).outlineColor = Color.GREEN


                // objectPrimitive.destroy();
                //viewer.scene.primitives.removeAll(); //  pickedObject;

                //console.log(viewer.scene.primitives);
                //  console.log(viewer.scene);
                //   console.log(viewer._dataSourceCollection._dataSources[0]._entityCollection._entities);

                //  viewer._dataSourceCollection._dataSources[0]._entityCollection._entities.remove(pickedObject);
                //  pickedObject.primitive.destroy();
                //  viewer.scene.primitives.remove();


                that._isflagCommandActive = true;

            }, ScreenSpaceEventType.LEFT_CLICK);


            that._handlerRight.setInputAction(function (click) {

                that._isflagCommandActive = true;

            }, ScreenSpaceEventType.RIGHT_CLICK);




        } else {
            that._isflagCommandActive = false;
        }


    }


    /**
     * The view model for {@link subMenu}.
     * @alias SubMenuViewModel
     * @constructor
     */
    var SubMenuViewModel = function (viewer, container) {

        this._viewer = viewer;
        this._container = container;
        this._isflagCommandActive = false;
        var that = this;

        this._flagCommand = createCommand(function () {

            flagFunction(that, that._viewer);

        });

        this._moveCommand = createCommand(function () {

        });

        this._saveCommand = createCommand(function () {
            console.log("je save mes donnees");
        });

        this._infosCommand = createCommand(function () {
        });

        this._closeSubMenu = createCommand(function () {
            try {

                // AJOUTER LA SUPPRESSION DES DONNEES LORSQUE L'ON CHANGE DE PLANETE

                removeHandlers(that);
                that._viewer.editDrawing.viewModel.subMenu.destroyWrapperMenu;
            } catch (e) {
            }
        });

        // knockout.track(this, []);

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
        moveCommand: {
            get: function () {
                return this._moveCommand;
            }
        },
        saveCommand: {
            get: function () {
                return this._saveCommand;
            }
        },
        infosCommand: {
            get: function () {
                return this._infosCommand;
            }
        },
        closeSubMenu: {
            get: function () {
                return this._closeSubMenu;
            }
        },
        removeAllCommands: {
            get: function () {
                this._isflagCommandActive = false;
                if (this._handlerLeft)
                    this._handlerLeft.removeInputAction(ScreenSpaceEventType.LEFT_CLICK);
                if (this._handlerRight)
                    this._handlerRight.removeInputAction(ScreenSpaceEventType.RIGHT_CLICK);

            }
        },
        removeAllHandlers: {
            get: function () {
                if (this._handlerLeft)
                    this._handlerLeft.removeInputAction(ScreenSpaceEventType.LEFT_CLICK);
                if (this._handlerRight)
                    this._handlerRight.removeInputAction(ScreenSpaceEventType.RIGHT_CLICK);
            }
        },
    });

// ================================================================================================================================
// ======================================================= LOCAL FUNCTIONS ========================================================
// ================================================================================================================================


    return SubMenuViewModel;
});
