/*global define*/
define([
        '../../../Core/defineProperties',
        '../../../ThirdParty/knockout',
        './SubMenuViewModel'
    ], function(
        defineProperties,
        knockout,
        SubMenuViewModel) {
    'use strict';


    var flagIcon = '<g><path d="M84.772,23.937c-0.21,0-0.41,0.043-0.593,0.118v-0.009c-3.37,1.756-7.191,2.764-11.253,2.764\
		c-7.52,0-14.244-3.401-18.724-8.747c-4.048-3.82-9.5-6.167-15.504-6.167c-5.782,0-11.054,2.174-15.052,5.745\
		c-0.842-1.774-2.635-3.009-4.729-3.009c-2.898,0-5.248,2.349-5.248,5.247v62.974c0,2.898,2.35,5.248,5.248,5.248\
		c2.898,0,5.248-2.35,5.248-5.248V54.497c3.302-1.668,7.031-2.614,10.984-2.614c7.53,0,14.261,3.41,18.741,8.767\
		c4.045,3.809,9.492,6.146,15.487,6.146c6.49,0,12.328-2.747,16.451-7.128c0.308-0.285,0.504-0.689,0.504-1.142V25.496\
		C86.331,24.635,85.633,23.937,84.772,23.937z"/></g>';


    var moveIcon = '<g><path d="M0 499.968l171.864 -171.864l0 119.133l275.373 0l0 -275.373l-119.133 0l171.864 -171.864 171.864 171.864l-119.133 0l0 275.373l275.373 0l0 -119.133l171.864 171.864 -171.864 171.864l0 -119.133l-275.373 0l0 275.373l119.133 0l-171.864 171.864 -171.864 -171.864l119.133 0l0 -275.373l-275.373 0l0 119.133z"/></g>';

    var closeIcon = '<path d="M84.707,68.752L65.951,49.998l18.75-18.752c0.777-0.777,0.777-2.036,0-2.813L71.566,15.295\
				c-0.777-0.777-2.037-0.777-2.814,0L49.999,34.047l-18.75-18.752c-0.746-0.747-2.067-0.747-2.814,0L15.297,28.431\
				c-0.373,0.373-0.583,0.88-0.583,1.407c0,0.527,0.21,1.034,0.583,1.407L34.05,49.998L15.294,68.753\
				c-0.373,0.374-0.583,0.88-0.583,1.407c0,0.528,0.21,1.035,0.583,1.407l13.136,13.137c0.373,0.373,0.881,0.583,1.41,0.583\
				c0.525,0,1.031-0.21,1.404-0.583l18.755-18.755l18.756,18.754c0.389,0.388,0.896,0.583,1.407,0.583c0.511,0,1.019-0.195,1.408-0.583\
				l13.138-13.137C85.484,70.789,85.484,69.53,84.707,68.752z"/></svg>';


    /**
     * A widget to show the subMenu of the draw polylines widget.
     *
     * @alias DrawLines
     * @constructor
     *
     * @param {Element|String} container The DOM element or ID that will contain the widget.
     * @param {Object} Viewer.
     * @param {Object} Scene.
     * @exception {DeveloperError} Element with id "container" does not exist in the document.
     */
    var SubMenu = function (IconsContainer, viewerContainer, viewer) {

        var wrapperMenu = document.createElement('span');
        wrapperMenu.className = 'cesium-DrawLinesMenu';
        IconsContainer.appendChild(wrapperMenu);

        var flagButton = document.createElement('div');
        flagButton.className = 'cesium-button cesium-toolbar-button cesium-DrawLinesMenu-show';
        flagButton.innerHTML = '<svg width="50" height="50" viewBox="-15 -11 210 210">' + flagIcon + ' </svg>';
        flagButton.setAttribute('data-bind', 'attr  : { title: "Flag entity" }, event : {click : flagCommand}');
        wrapperMenu.appendChild(flagButton);

        var closeButton = document.createElement('div');
        closeButton.className = 'cesium-button cesium-toolbar-button cesium-DrawLinesMenu-show';
        closeButton.innerHTML = '<svg width="150" height="150" viewBox="-10 -10 640 640">' + closeIcon + ' </svg>';
        closeButton.setAttribute('data-bind', 'attr  : { title: "Close menu" }, event : {click : closeSubMenu}');
        wrapperMenu.appendChild(closeButton);

        //var viewModel = new SubMenuViewModel(viewer, wrapperSaveButtonMenu, viewerContainer);
        var viewModel = new SubMenuViewModel(viewer, viewerContainer);

        this._IconsContainer = IconsContainer;
        this._wrapperMenu = wrapperMenu;
        this._viewModel = viewModel;
        this._viewer = viewer;

        knockout.applyBindings(viewModel, wrapperMenu);
    };

    defineProperties(SubMenu.prototype, {
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
         * @memberof SubMenu.prototype
         *
         * @type {SubMenuViewModel}
         */
        viewModel: {
            get: function () {
                return this._viewModel;
            }
        },
        destroyWrapperMenu: {
            get: function () {
                try {
                    knockout.cleanNode(this._wrapperMenu);
                    this._IconsContainer.removeChild(this._wrapperMenu);
                } catch (e) {
                }

                try {
                    console.log(this._viewer.editDrawing.viewModel.subMenu.viewModel);
                    this._viewer.editDrawing.viewModel.subMenu.viewModel.colorPicker.destroyColorPickerContainer();
                } catch (e) {
                    console.log(e);
                }

            }
        }
    });

    return SubMenu;
});
