/*global define*/
define([
        '../../Core/defined',
        '../../Core/defineProperties',
        '../../ThirdParty/knockout',
        '../getElement',
        './SaveButtonViewModel'
    ], function(
        defined,
        defineProperties,
        knockout,
        getElement,
        SaveButtonViewModel) {
    'use strict';

    /**
     * A widget for saving all vector entities in the scene in a geojson file.
     *
     * @alias SaveButton
     * @constructor
     *
     * @param {Element|String} container The DOM element or ID that will contain the widget.
     * @param {Object} Viewer.
     */

    var SaveButton = function (container,that) {

        var icon = '<g><path d="M340.969,0H12.105C5.423,0,0,5.423,0,12.105v328.863c0,6.68,5.423,12.105,12.105,12.105h328.864\
		c6.679,0,12.104-5.426,12.104-12.105V12.105C353.073,5.423,347.647,0,340.969,0z M67.589,18.164h217.895v101.884H67.589V18.164z\
                M296.082,327.35H57.003V176.537h239.079V327.35z M223.953,33.295h30.269v72.638h-30.269V33.295z M274.135,213.863H78.938v-12.105\
		h195.197V213.863z M274.135,256.231H78.938v-12.105h195.197V256.231z M274.135,297.087H78.938v-12.105h195.197V297.087z"/></g>';

        //>>includeStart('debug', pragmas.debug);
        if (!defined(container)) {
            throw new DeveloperError('container is required.');
        }
        //>>includeEnd('debug');

        container = getElement(container);

        var viewModel = new SaveButtonViewModel(container,that);

        this._viewModel = viewModel;

        var element = document.createElement('button');
        element.type = 'button';
        element.className = 'cesium-button cesium-toolbar-button cesium-save-button';
        element.innerHTML = '<svg width="40" height="40" viewBox="-50 -50 640 640">' + icon + ' </svg>';
        element.setAttribute('data-bind', 'attr  : { title: "Create file" }, event : {click : command}');

        container.appendChild(element);

        knockout.applyBindings(viewModel, element);

        this._container = container;
        this._viewModel = viewModel;
        this._element = element;

    };

    defineProperties(SaveButton.prototype, {
        /**
         * Gets the parent container.
         * @memberof SaveButton.prototype
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
         * @memberof SaveButton.prototype
         *
         * @type {SaveButtonViewModel}
         */
        viewModel: {
            get: function () {
                return this._viewModel;
            }
        }
    });

    return SaveButton;
});

