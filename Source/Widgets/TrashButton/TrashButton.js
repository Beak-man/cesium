/*global define*/
define([
        '../../Core/defined',
        '../../Core/defineProperties',
        '../../ThirdParty/knockout',
        '../getElement',
        './TrashButtonViewModel'
    ], function(
        defined,
        defineProperties,
        knockout,
        getElement,
        TrashButtonViewModel) {
    'use strict';

    /**
     * A widget for cleaning all vector entities in the scene.
     *
     * @alias TrashButton
     * @constructor
     *
     * @param {Element|String} container The DOM element or ID that will contain the widget.
     * @param {Object} Viewer.
     */

    var TrashButton = function (container,that) {

        var icon = '<g><g><path d="M75.834,33.388h-51.67c-1.311,0-2.375,1.058-2.375,2.373v49.887c0,1.314,1.064,2.377,2.375,2.377h51.67\
			c1.314,0,2.375-1.063,2.375-2.377V35.76C78.209,34.446,77.148,33.388,75.834,33.388z"/></g><g>\
                        <path d="M79.004,17.352H59.402v-2.999c0-1.314-1.061-2.377-2.373-2.377H42.971c-1.312,0-2.375,1.063-2.375,2.377v2.999H20.996\
			c-1.312,0-2.375,1.059-2.375,2.373v6.932c0,1.314,1.063,2.373,2.375,2.373h58.008c1.314,0,2.375-1.059,2.375-2.373v-6.932\
			C81.379,18.41,80.318,17.352,79.004,17.352z"/></g></g>';

        //>>includeStart('debug', pragmas.debug);
        if (!defined(container)) {
            throw new DeveloperError('container is required.');
        }
        //>>includeEnd('debug');

        container = getElement(container);

        var viewModel = new TrashButtonViewModel(that);

        //viewModel._svgPath = icone;
        this._viewModel = viewModel;

        var element = document.createElement('button');
        element.type = 'button';
        element.className = 'cesium-button cesium-toolbar-button cesium-trash-button';
        element.innerHTML = '<svg width="30" height="30" viewBox="0 0 100 100">' + icon + ' </svg>';
        element.setAttribute('data-bind', 'attr  : { title: "Remove all objects" }, event : {click : command}');

        container.appendChild(element);

        knockout.applyBindings(viewModel, element);

        this._container = container;
        this._viewModel = viewModel;
        this._element = element;

    };

    defineProperties(TrashButton.prototype, {
        /**
         * Gets the parent container.
         * @memberof TrashButton.prototype
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
         * @memberof TrashButton.prototype
         *
         * @type {TrashButtonViewModel}
         */
        viewModel: {
            get: function () {
                return this._viewModel;
            }
        }
    });

    return TrashButton;
});

