/* Structure de base des widgets en Cesium : il faut respecter cette structure */

/*global define*/
define([
        '../../Core/defaultValue',
        '../../Core/defineProperties',
        '../../ThirdParty/knockout',
        '../createCommand',
    ], function(
        defaultValue,
        defineProperties,
        knockout,
        createCommand) {
    'use strict';

    var viewModel = {
        layers: [],
        baseLayers: [],
        upLayer: null,
        downLayer: null,
        selectedLayer: null,
        isSelectableLayer: function (layer) {
            return baseLayers.indexOf(layer) >= 0;
        },
    };

    function setupLayers(that, viewer, dimLayers, layerName, imageryProvidersTab) {
        for (var i = 0; i < dimLayers; i++) {
            addAdditionalLayerOption(viewer, layerName[i], imageryProvidersTab[i], that['alpha_' + i], that['show_' + i]);
        }
    }

    function updateLayerList(viewer) {
        var imageryLayers = viewer.imageryLayers;
        var numLayers = imageryLayers.length;
        viewModel.layers.splice(0, viewModel.layers.length);
        for (var i = numLayers - 1; i >= 0; --i) {
            viewModel.layers.push(imageryLayers.get(i));
        }
    }

    function addAdditionalLayerOption(viewer, name, imageryProvider, alpha, show) {

        var imageryLayers = viewer.imageryLayers;
        var layer = imageryLayers.addImageryProvider(imageryProvider);
        layer.alpha = defaultValue(alpha, 0.5);
        layer.show = defaultValue(show, false);
        layer.name = name;
        knockout.track(layer, ['alpha', 'show', 'name']);
    }

    function cleanLayers(viewer, imageryTab) {

        for (var i = 0; i < imageryTab.length; i++) {
            viewer.imageryLayers.remove(imageryTab[i], false);
        }
    }

    var ListViewModel = function (viewer, dimLayers, layerName, imageryProvidersTab) {

        viewer.imageryLayers.removeAll(true);

        var that = this;

        for (var i = 0; i < dimLayers; i++) {
            if (i === 0) {
                that['show_' + i] = knockout.observable(true);
                that['alpha_' + i] = knockout.observable(1.0);
            } else {
                that['show_' + i] = knockout.observable(false);
                that['alpha_' + i] = knockout.observable(0.5);
            }
        }

        setupLayers(that, viewer, dimLayers, layerName, imageryProvidersTab );
        updateLayerList(viewer);

        this._changeRangeValue = createCommand(function () {

        });

        /** Gets or sets the tooltip.  This property is observable.
         *
         * @type {String}
         */
        this.tooltip = 'Show this system';
        knockout.track(viewModel);
    };

    defineProperties(ListViewModel.prototype, {
        /**
         * Gets the Command that is executed when the button is clicked.
         * @memberof HomeButtonViewModel.prototype
         *
         * @type {Command}
         */
        changeRangeValue: {
            get: function () {
                return this._changeRangeValue;
           }
        },
    });

    return ListViewModel;
});
