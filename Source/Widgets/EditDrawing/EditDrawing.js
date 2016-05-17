/*global define*/
define([
    '../../Core/Color',
    '../../Core/defined',
    '../../Core/defineProperties',
    '../../Core/destroyObject',
    '../../Core/DeveloperError',
    '../../ThirdParty/knockout',
    '../getElement',
    '../../Core/ScreenSpaceEventHandler',
    '../../Core/ScreenSpaceEventType',
    './EditDrawingViewModel'
], function (
        Color,
        defined,
        defineProperties,
        destroyObject,
        DeveloperError,
        knockout,
        getElement,
        ScreenSpaceEventHandler,
        ScreenSpaceEventType,
        EditDrawingViewModel
        ) {
    "use strict";

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
    var EditDrawing = function (IconsContainer, wrapperPanel, viewerContainer, viewer) {

        var viewModel = new EditDrawingViewModel(IconsContainer, wrapperPanel, viewerContainer,  viewer);

        var icone = '<g><path d="M14,23c0-4.973,4.027-9,9-9l0,0c4.971,0,8.998,4.027,9,9l0,0c-0.002,4.971-4.029,8.998-9,9l0,0   C18.027,31.998,14,27.971,14,23L14,23z M16.116,23c0.008,3.799,3.083,6.874,6.884,6.883l0,0c3.799-0.009,6.874-3.084,6.883-6.883   l0,0c-0.009-3.801-3.084-6.876-6.883-6.885l0,0C19.199,16.124,16.124,19.199,16.116,23L16.116,23z"/><polygon points="22,27 19,27 19,24  "/><rect height="4.243" transform="matrix(-0.7071 0.7071 -0.7071 -0.7071 56.5269 20.5858)" width="7.071" x="20.464" y="19.879"/></g>';
        viewModel._icone = icone;
        this._viewModel = viewModel;

        // For the icon inside the main menu panel


        var editDrawButton = document.createElement('div');
        editDrawButton.className = 'cesium-button cesium-toolbar-button cesium-modificationsToolbar-button';
        editDrawButton.innerHTML = '<svg width="305" height="305" viewBox="12.5 12.5 210 210">' + icone + ' </svg>';
        editDrawButton.setAttribute('data-bind', 'attr  : { title: "Edit draw" },\
		                                          css   : { "cesium-drawEdit-button-hidden"  : !isPanelToolVisibleEdit,\
						                    "cesium-drawEdit-button-visible" : isPanelToolVisibleEdit },\
							             event : {click : editCommand}');
        wrapperPanel.appendChild(editDrawButton);

        knockout.applyBindings(viewModel, editDrawButton);


    };

    defineProperties(EditDrawing.prototype, {
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

    return EditDrawing;
});