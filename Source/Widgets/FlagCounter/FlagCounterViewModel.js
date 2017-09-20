/*global define*/
define([
        '../../Core/Cartesian3',
        '../../Core/defineProperties',
        '../../ThirdParty/knockout',
        '../createCommand',
    ], function(
        Cartesian3,
        defineProperties,
        knockout,
        createCommand) {
    'use strict';

    function initialization(that) {

        var dataSources = that._viewer.dataSources._dataSources;
        var count = 0;
        var countFlagged = 0;

        console.log(that._viewer);

        for (var i = 0; i < dataSources.length; i++) {
            var entities = dataSources[i]._entityCollection._entities._array;

            for (var j = 0; j < entities.length; j++) {

                count = count + 1;

                if (entities[j].properties.flagColor) {
                    countFlagged = countFlagged + 1;
                }
            }
        }


        that._totalEntities = count;
        that._flaggedEntities = countFlagged;

        that.str = countFlagged + ' / ' + count;
        countUpdateOnLoad(that);
    }

    function flyToUnflaggedEntity(that) {

        var dataSources = that._viewer.dataSources._dataSources;

        for (var i = 0; i < dataSources.length; i++) {
            var entities = dataSources[i]._entityCollection._entities._array;

            for (var j = 0; j < entities.length; j++) {

                if (!entities[j].properties.flagColor) {
                    var position = entities[j].position._value;

                    var ellipsoid = that._viewer.scene.globe.ellipsoid;
                    var cartographic = ellipsoid.cartesianToCartographic(position);

                    var longitude = cartographic.longitude * (180.0 / Math.PI);
                    var latitude = cartographic.latitude * (180.0 / Math.PI);

                    that._viewer.camera.flyTo({
                           destination: Cartesian3.fromDegrees(longitude, latitude, 40000.0, ellipsoid),
                        duration: 1.0,
                    });

                    break;
                }

                if (that._totalEntities === that._flaggedEntities && that._totalEntities > 0) {
                    alert('All entities haves been flagged !');
                    break;
                }
            }
        }
    }


    function  countUpdateOnLoad(that) {
        that._bodyContainer.innerHTML = that.str;
    }

    function  countUpdate(that, entities) {

        var countFlagged = 0;

        for (var i = 0; i < entities.length; i++) {
            if (entities[i].properties.flagColor) {
                countFlagged = countFlagged + 1;
            }
        }

        that._totalEntities = entities.length;
        that._flaggedEntities = countFlagged;

        that.str = countFlagged + ' / ' + entities.length;
        countUpdateOnLoad(that);
    }

    /**
     * The view model for {@link DrawLines}.
     * @alias FlagCounterViewModel
     * @constructor
     */
    var FlagCounterViewModel = function (viewerContainer, viewer, bodyContainer) {

        this._viewer = viewer;
        this._viewerContainer = viewerContainer;
        this._bodyContainer = bodyContainer;

        this._totalEntities = 0;
        this._flaggedEntities = 0;
        this.str = '';

        initialization(this);

        var that = this;

        this._flyCommand = createCommand(function () {
            flyToUnflaggedEntity(that);
        });


        // knockout.track(this, ['str']);

    };
    defineProperties(FlagCounterViewModel.prototype, {
        /**
         * Gets the Command that is executed when the button is clicked.
         * @memberof FlagCounterViewModel.prototype
         *
         * @type {Command}
         */

        counterUpdateOnLoad: {
            set: function (object) {
                this.str = object.flagged + ' / ' + object.total;
                this._totalEntities = object.total;
                this._flaggedEntities = object.flagged;
                countUpdateOnLoad(this);
            }
        },
        counterUpdate: {
            set: function (entities) {
                countUpdate(this, entities);
            }
        },
        flyCommand: {
            get: function () {
                return this._flyCommand;
            }
        },
    });

    return FlagCounterViewModel;
});
