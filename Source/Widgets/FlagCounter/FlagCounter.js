/*global define*/
define([
        '../../Core/defineProperties',
        '../../DataSources/GeoJsonDataSource',
        '../../ThirdParty/knockout',
        './FlagCounterViewModel'
    ], function(
        defineProperties,
        GeoJsonDataSource,
        knockout,
        FlagCounterViewModel) {
    'use strict';

    var eyeIcon = '<g><path d="M84.448,47.672L67.712,30.936l-0.116,0.116c-4.632-4.325-10.847-6.977-17.685-6.977c-7.679,0-14.575,3.341-19.322,8.646\
		L15.013,48.298l0.012,0.012c-0.414,0.472-0.673,1.083-0.673,1.76c0,0.844,0.398,1.588,1.009,2.079l16.896,16.895l0.035-0.035\
		c4.625,4.289,10.815,6.915,17.62,6.915c7.67,0,14.559-3.333,19.305-8.627l0.062,0.062l15.479-15.479\
		c0.065-0.059,0.126-0.12,0.185-0.185l0.001-0.001v0c0.431-0.476,0.7-1.1,0.7-1.792C85.645,48.972,85.169,48.153,84.448,47.672z\
                M49.912,67.567c-9.702,0-17.567-7.865-17.567-17.567c0-9.701,7.865-17.566,17.567-17.566c9.702,0,17.568,7.865,17.568,17.566\
		C67.48,59.702,59.614,67.567,49.912,67.567z"/>\
                <circle cx="49.99" cy="50.077" r="8.512"/></g>';


    /**
     * A widget to count unflaged entities.
     *
     * @alias FlagCounter
     * @constructor
     *
     * @param {Element|String} container The DOM element or ID that will contain the widget.
     * @param {Object} Viewer.
     * @param {Object} Scene.
     * @exception {DeveloperError} Element with id "container" does not exist in the document.
     */

    // Called from ColoPicker.js

    var FlagCounter = function (viewerContainer, viewer) {

        var totalEntities;
        var flaggedEntities;

        if (!GeoJsonDataSource.counter) {
            totalEntities = 0;
        } else {
            totalEntities = GeoJsonDataSource.counter;
        }

        if (!GeoJsonDataSource.flaggedCounter) {
            flaggedEntities = 0;
        } else {
            flaggedEntities = GeoJsonDataSource.flaggedCounter;
        }

        var strIni = flaggedEntities + ' / ' + totalEntities;

        var counterContainer = document.createElement('DIV');
        counterContainer.className = 'cesium-flagCoutner-container';
        viewerContainer.appendChild(counterContainer);

        var titleContainer = document.createElement('DIV');
        titleContainer.className = 'cesium-flagCoutner-container-title';
        titleContainer.innerHTML = 'Flagged entities';
        counterContainer.appendChild(titleContainer);

        var bodyContainer = document.createElement('DIV');
        bodyContainer.className = 'cesium-flagCoutner-container-body';
        bodyContainer.innerHTML = strIni;
        counterContainer.appendChild(bodyContainer);

        var buttonContainer = document.createElement('DIV');
        buttonContainer.className = 'cesium-flagCoutner-container-button';
        counterContainer.appendChild(buttonContainer);

        var flyButton = document.createElement('div');
        flyButton.className = 'cesium-button cesium-toolbar-button';
        flyButton.innerHTML = '<svg width="35" height="35" viewBox="10 10 100 100">' + eyeIcon + ' </svg>';

        flyButton.setAttribute('data-bind', 'attr  : { title: "See unflagged entity" }, event : {click : flyCommand}');
        buttonContainer.appendChild(flyButton);



        this._counterContainer = counterContainer;
        this._viewerContainer = viewerContainer;

        var viewModel = new FlagCounterViewModel(viewerContainer, viewer, bodyContainer);
        this._viewModel = viewModel;

        knockout.applyBindings(viewModel, bodyContainer);
        knockout.applyBindings(viewModel, flyButton);

    };

    defineProperties(FlagCounter.prototype, {
        /**
         * Gets the parent container.
         * @memberof FlagCounter.prototype
         *
         * @type {Element}
         */
        container: {
            get: function () {
                return this._container;
            }
        },
        /**
         * Gets the view model.
         * @memberof Tools.prototype
         *
         * @type {FlagCounterViewModel}
         */
        viewModel: {
            get: function () {
                return this._viewModel;
            }
        },
        destroyCounterContainer: {
            get: function () {
                try {
                    this._viewerContainer.removeChild(this._counterContainer);
                } catch (e) {
                }

            }
        },
    });

    return FlagCounter;
});
