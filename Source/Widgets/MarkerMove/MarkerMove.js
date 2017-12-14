/*global define*/
define([
        '../../Core/defineProperties',
        '../../ThirdParty/knockout',
        '../getElement',
        './MarkerMoveViewModel'
    ], function(
        defineProperties,
        knockout,
        getElement,
        MarkerMoveViewModel) {
    'use strict';


    var file = 'M67.041,78.553h-6.49h0c-0.956,0-1.73,0.774-1.73,1.73h-0.007v3.01H18.173V36.16h17.723c0.956,0,1.73-0.774,1.73-1.73 \
			V16.707h21.188l0,12.34h0.016c0.047,0.913,0.796,1.641,1.721,1.641h6.49c0.925,0,1.674-0.728,1.721-1.641h0.009v-0.088\
			c0,0,0-0.001,0-0.001c0-0.001,0-0.001,0-0.002l0-16.457h-0.005V8.48c0-0.956-0.774-1.73-1.73-1.73h-2.45v0H35.895v0h-1.73\
			L8.216,32.7v2.447v1.013v52.912v2.447c0,0.956,0.774,1.73,1.73,1.73h1.582h53.925h1.582c0.956,0,1.73-0.774,1.73-1.73v-2.448\
			h0.005l0-8.789l0-0.001C68.771,79.328,67.997,78.553,67.041,78.553z';

    var pen = 'M91.277,39.04L79.656,27.419c-0.676-0.676-1.771-0.676-2.447,0L45.404,59.224l0.069,0.069l-0.109-0.029l-4.351,16.237 \
			l0.003,0.001c-0.199,0.601-0.066,1.287,0.412,1.765c0.528,0.528,1.309,0.638,1.948,0.341l0.002,0.006l16.08-4.309l-0.01-0.037 \
			l0.023,0.024l31.806-31.806C91.953,40.811,91.953,39.716,91.277,39.04z M46.305,72.353l2.584-9.643l7.059,7.059L46.305,72.353z';

    var pencil = 'M88.79,29.297L70.702,11.209c-1.052-1.052-2.756-1.052-3.808,0L17.389,60.713l0.109,0.109l-0.171-0.046l-6.772,25.272 \
		l0.004,0.001c-0.309,0.935-0.103,2.004,0.642,2.748c0.822,0.822,2.038,0.993,3.033,0.531l0.002,0.009l25.027-6.706l-0.016-0.059 \
		l0.038,0.038L88.79,33.105C89.842,32.053,89.842,30.349,88.79,29.297z M18.792,81.147l4.022-15.009l10.988,10.988L18.792,81.147z';



    var MarkerMove = function (toolbar, container, scene, viewer) {

        var viewModel = new MarkerMoveViewModel(toolbar, container, scene, viewer);
        this._viewModel = viewModel;

        viewModel._fileAndPen = file + pen;
        viewModel._pencil = pencil;

        container = getElement(toolbar);

        var wrapper = document.createElement('span');
        wrapper.setAttribute('id', 'wrapper');
        container.appendChild(wrapper);

        var modifbutton = document.createElement('div');
        modifbutton.className = 'cesium-button cesium-toolbar-button cesium-modificationsToolbar-button';
        modifbutton.setAttribute('data-bind',   'css: { "cesium-sceneModePicker-selected": dropDownVisible, \
                                                        "cesium-drawEdit-button-hidden"  : !isPanelToolVisibleMarkerMove,\
                                                        "cesium-drawEdit-button-visible" : isPanelToolVisibleMarkerMove},\
                                                 attr: { title: tooltip },\
                                                 click: command, \
                                                 cesiumSvgPath: { path: _pencil, width: 110, height: 110}');
        modifbutton.setAttribute('id', 'xxPrimeSave');
        wrapper.appendChild(modifbutton);

        knockout.applyBindings(viewModel, wrapper);
    };


    defineProperties(MarkerMove.prototype, {
        /**
         * Gets the view model.
         * @memberof HomeButton.prototype
         *
         * @type {HomeButtonViewModel}
         */
        viewModel: {
            get: function () {
                return this._viewModel;
            }
        }
    });


    return MarkerMove;
});
