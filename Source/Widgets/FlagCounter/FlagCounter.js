/*global define*/
define([
    '../../Core/Color',
    '../../Core/defined',
    '../../Core/defineProperties',
    '../../Core/destroyObject',
    '../../Core/DeveloperError',
    '../../DataSources/GeoJsonDataSource',
    '../../ThirdParty/knockout',
    '../getElement',
    '../../Core/ScreenSpaceEventHandler',
    '../../Core/ScreenSpaceEventType'
  //  './FlagCounterViewModel'
], function (
        Color,
        defined,
        defineProperties,
        destroyObject,
        DeveloperError,
        GeoJsonDataSource,
        knockout,
        getElement,
        ScreenSpaceEventHandler,
        ScreenSpaceEventType
    //    FlagCounterViewModel
        ) {
    "use strict";

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
    var FlagCounter = function (viewerContainer, viewer) {

      //  var viewModel = new FlagCounterViewModel(viewerContainer,  viewer);
      //  this._viewModel = viewModel;
      
      var totalEntities = GeoJsonDataSource.counter;
      var flaggedEntities = GeoJsonDataSource.flaggedCounter;
      
      var str = flaggedEntities +" / "+ totalEntities;
        
        var counterContainer = document.createElement('DIV');
        counterContainer.className = 'cesium-flagCoutner-container';
        viewerContainer.appendChild(counterContainer);
        
        var titleContainer =  document.createElement('DIV');
        titleContainer.className = 'cesium-flagCoutner-container-title';
        titleContainer.innerHTML = 'Flagged entities';
        counterContainer.appendChild(titleContainer);
        
        var bodyContainer =  document.createElement('DIV');
        bodyContainer.className = 'cesium-flagCoutner-container-body';
        bodyContainer.innerHTML = str;
        counterContainer.appendChild(bodyContainer);

        // For the icon inside the main menu panel

       // wrapperPanel.appendChild(editDrawButton);

       // knockout.applyBindings(viewModel, editDrawButton);

    };

    defineProperties(FlagCounter.prototype, {
        /**
         * Gets the parent container.
         * @memberof Tools.prototype
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
         * @type {ToolsViewModel}
         */
        viewModel: {
            get: function () {
                return this._viewModel;
            }
        },
    });

    return FlagCounter;
});