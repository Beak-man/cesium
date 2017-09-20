/*global define*/
define([
        '../../Core/Color',
        '../../Core/defined',
        '../../Core/defineProperties',
        '../../Core/destroyObject',
        '../../Core/DeveloperError',
        '../../Core/ScreenSpaceEventHandler',
        '../../Core/ScreenSpaceEventType',
        '../../ThirdParty/knockout',
        '../getElement',
        './DrawLinesViewModel'
    ], function(
        Color,
        defined,
        defineProperties,
        destroyObject,
        DeveloperError,
        ScreenSpaceEventHandler,
        ScreenSpaceEventType,
        knockout,
        getElement,
        DrawLinesViewModel) {
    'use strict';

    /**
     * A widget to draw polylines.
     *
     * @alias DrawLines
     * @constructor
     *
     * @param {Element|String} container The DOM element or ID that will contain the widget.
     * @param {Object} Viewer.
     * @param {Object} Scene.
     * @exception {DeveloperError} Element with id "container" does not exist in the document.
     */
    var DrawLines = function (IconsContainer, wrapperPanel, viewer) {

        var viewModel = new DrawLinesViewModel(IconsContainer, wrapperPanel, viewer);

        var icone = '<g><path d="M12.587,67.807c6.95,0,12.588-5.635,12.588-12.587c0-2.28-0.653-4.39-1.715-6.234l6.85-15.917l41.126,86.896\
			c-1.982,2.223-3.225,5.123-3.225,8.338c0,6.949,5.635,12.588,12.587,12.588c6.95,0,12.587-5.635,12.587-12.588\
			c0-2.678-0.85-5.148-2.275-7.189l19.377-23.846l9.843,22.49c-2.091,2.248-3.396,5.234-3.396,8.545\
			c0,6.949,5.635,12.588,12.588,12.588c6.949,0,12.588-5.635,12.588-12.588c0-6.117-4.366-11.207-10.149-12.342l-10.86-24.82\
			c2.428-2.295,3.959-5.523,3.959-9.123c0-6.953-5.635-12.588-12.588-12.588c-6.955,0-12.589,5.635-12.589,12.588\
			c0,2.453,0.729,4.723,1.944,6.656l-20.062,24.734L38.697,22.515c2.176-2.263,3.527-5.323,3.527-8.709\
			c0-6.952-5.635-12.587-12.587-12.587c-6.95,0-12.585,5.635-12.585,12.587c0,3.762,1.686,7.102,4.302,9.408l-8.423,19.455\
			c-0.117-0.002-0.224-0.034-0.344-0.034C5.635,42.633,0,48.267,0,55.22C0,62.169,5.635,67.807,12.587,67.807z"/></g>';

        viewModel._icone = icone;
        this._viewModel = viewModel;

        // For the icon inside the main menu panel

        var DrawLineButton = document.createElement('div');
        DrawLineButton.className = 'cesium-button cesium-toolbar-button cesium-modificationsToolbar-button';
        DrawLineButton.innerHTML = '<svg width="35" height="35" viewBox="-15 -11 210 210">' + icone + ' </svg>';
        DrawLineButton.setAttribute('data-bind', 'attr  : { title: "Draw" },\
                                                  css   : { "cesium-modificationsToolbar-button-hidden"  : !isPanelToolVisible,\
                                                            "cesium-modificationsToolbar-button-visible" : isPanelToolVisible },\
                                                  event : {click : drawPolyLines}');
        wrapperPanel.appendChild(DrawLineButton);

        knockout.applyBindings(viewModel, DrawLineButton);



    };

    defineProperties(DrawLines.prototype, {
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

    return DrawLines;
});
