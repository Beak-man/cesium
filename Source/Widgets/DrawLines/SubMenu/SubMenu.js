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


    var cutIcon = '<g><g><path d="M232.491,195.859c7.978-32.608-1.617-68.425-29.02-91.425l-54.288-45.855C110.757,26.343,53.449,31.371,21.201,69.791\
				c-32.235,38.42-27.119,95.917,11.314,128.152l54.692,45.861c27.403,22.994,64.496,26.929,95.222,13.411l31.484,26.544\
				l61.584-51.679L232.491,195.859z M175.815,199.364c-13.923,16.595-38.742,18.768-55.343,4.845l-54.648-45.855\
				c-16.588-13.923-18.761-38.742-4.845-55.337s38.742-18.755,55.337-4.839l54.654,45.861\
				C187.558,157.957,189.731,182.782,175.815,199.364z"/>\
				<path d="M329.14,380.882l166.9,140.685c33.89,28.433,83.017,24.005,111.406-9.873l0,0L390.762,329.172L329.14,380.882z"/>\
			<path d="M610.321,100.308L610.321,100.308c-28.433-33.878-78.943-38.306-112.834-9.873L182.454,354.787\
				c-30.726-13.525-67.794-9.589-95.203,13.411l-54.648,45.855c-38.426,32.242-43.454,89.732-11.219,128.159\
				c32.248,38.42,89.739,43.448,128.159,11.206l54.648-45.861c27.409-22.994,37.719-58.811,29.74-91.413L610.321,100.308z\
                                M304.845,280.645c15.375,0,27.814,12.457,27.814,27.814c0,15.369-12.438,27.814-27.814,27.814\
				c-15.357,0-27.807-12.451-27.807-27.814C277.038,293.102,289.489,280.645,304.845,280.645z M170.97,467.968l-54.654,45.861\
				c-16.595,13.923-41.42,11.75-55.337-4.839c-13.923-16.595-11.75-41.414,4.845-55.33l54.648-45.861\
				c16.601-13.923,41.42-11.75,55.343,4.845C189.731,429.226,187.558,454.045,170.97,467.968z"/></g>\
		<rect x="409.858" y="299.653" width="50.536" height="25.268"/><rect x="485.662" y="299.653" width="50.536" height="25.268"/>\
		<rect x="561.466" y="299.653" width="50.536" height="25.268"/></g>';

    var closeIcon = '<path d="M84.707,68.752L65.951,49.998l18.75-18.752c0.777-0.777,0.777-2.036,0-2.813L71.566,15.295\
				c-0.777-0.777-2.037-0.777-2.814,0L49.999,34.047l-18.75-18.752c-0.746-0.747-2.067-0.747-2.814,0L15.297,28.431\
				c-0.373,0.373-0.583,0.88-0.583,1.407c0,0.527,0.21,1.034,0.583,1.407L34.05,49.998L15.294,68.753\
				c-0.373,0.374-0.583,0.88-0.583,1.407c0,0.528,0.21,1.035,0.583,1.407l13.136,13.137c0.373,0.373,0.881,0.583,1.41,0.583\
				c0.525,0,1.031-0.21,1.404-0.583l18.755-18.755l18.756,18.754c0.389,0.388,0.896,0.583,1.407,0.583c0.511,0,1.019-0.195,1.408-0.583\
				l13.138-13.137C85.484,70.789,85.484,69.53,84.707,68.752z"/></svg>';

    var DrawIcon = '<g><path d="M12.587,67.807c6.95,0,12.588-5.635,12.588-12.587c0-2.28-0.653-4.39-1.715-6.234l6.85-15.917l41.126,86.896\
			c-1.982,2.223-3.225,5.123-3.225,8.338c0,6.949,5.635,12.588,12.587,12.588c6.95,0,12.587-5.635,12.587-12.588\
			c0-2.678-0.85-5.148-2.275-7.189l19.377-23.846l9.843,22.49c-2.091,2.248-3.396,5.234-3.396,8.545\
			c0,6.949,5.635,12.588,12.588,12.588c6.949,0,12.588-5.635,12.588-12.588c0-6.117-4.366-11.207-10.149-12.342l-10.86-24.82\
			c2.428-2.295,3.959-5.523,3.959-9.123c0-6.953-5.635-12.588-12.588-12.588c-6.955,0-12.589,5.635-12.589,12.588\
			c0,2.453,0.729,4.723,1.944,6.656l-20.062,24.734L38.697,22.515c2.176-2.263,3.527-5.323,3.527-8.709\
			c0-6.952-5.635-12.587-12.587-12.587c-6.95,0-12.585,5.635-12.585,12.587c0,3.762,1.686,7.102,4.302,9.408l-8.423,19.455\
			c-0.117-0.002-0.224-0.034-0.344-0.034C5.635,42.633,0,48.267,0,55.22C0,62.169,5.635,67.807,12.587,67.807z"/></g>';

    var circleIcon = '<g><path d="M74.301,0C33.333,0,0,33.333,0,74.301c0,40.969,33.333,74.301,74.301,74.301c40.969,0,74.301-33.332,74.301-74.301C148.602,33.333,115.27,0,74.301,0z M132.768,77.954h3.537c-1.897,32.56-28.978,58.468-62.004,58.468\
				c-34.254,0-62.121-27.867-62.121-62.121c0-34.253,27.867-62.12,62.121-62.12c33.846,0,61.436,27.211,62.09,60.902h-3.623c-1.348,0-2.437,1.089-2.437,2.437S131.42,77.954,132.768,77.954z"/>\
				<path d="M110.842,73.083h-7.308c-1.349,0-2.437,1.089-2.437,2.437s1.088,2.436,2.437,2.436h7.308c1.348,0,2.438-1.088,2.438-2.436C113.277,74.172,112.189,73.083,110.842,73.083z"/>\
				<path d="M96.227,73.083h-7.309c-1.348,0-2.438,1.089-2.438,2.437s1.09,2.436,2.438,2.436h7.309c1.347,0,2.437-1.088,2.437-2.436\
				C98.662,74.172,97.572,73.083,96.227,73.083z"/><path d="M125.459,73.083h-7.309c-1.349,0-2.437,1.089-2.437,2.437s1.088,2.436,2.437,2.436h7.309c1.348,0,2.436-1.088,2.436-2.436\
                                S126.807,73.083,125.459,73.083z"/><path d="M81.609,73.083H74.3c-1.347,0-2.436,1.089-2.436,2.437s1.089,2.436,2.436,2.436h7.31c1.347,0,2.436-1.088,2.436-2.436\
				S82.956,73.083,81.609,73.083z"/></g>';

    var circle2Icon = '<g><circle style="fill:none; stroke:#fff; stroke-width:20;" cx="150" cy="150" r="145" id="circle"/>\
                          <circle style="fill:#fff; stroke:#fff; stroke-width:20;" cx="10" cy="150" r="20" id="circle"/>\\n\
                          <circle style="fill:#fff; stroke:#fff; stroke-width:20;" cx="290" cy="150" r="20" id="circle"/>\
	<path style="fill:none;stroke:#fff;stroke-width:20;" d="M 28.8,150 271.2,150 300, 150 z" id="triangle"/></g>';

    var circle3Icon = '<g><circle style="fill:none; stroke:#fff; stroke-width:20;" cx="150" cy="150" r="145" id="circle"/>\
	<path style="fill:none;stroke:#fff;stroke-width:20;" d="M 28.8,80 271.2,80 150,290 ,80 z" id="triangle"/></g>';


   var polygonIcon = '<path d="M182.857,0v36.571l310.856,341.333H512v60.953h-60.952v-18.286L60.952,298.667v6.095H0V243.81h24.381l97.523-207.238V0\
                                H182.857z M158.477,60.952h-12.19L60.952,243.81v18.286L451.048,384v-6.096L158.477,60.952z M463.238,426.667h36.571v-36.571  h-36.571V426.667z M134.096,\
                                48.762h36.571V12.19h-36.571V48.762z M48.762,292.571V256H12.19v36.571H48.762z"/>';




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
    var SubMenu = function (IconsContainer, viewer) {

        var wrapperMenu = document.createElement('span');
        wrapperMenu.className = 'cesium-DrawLinesMenu';
        IconsContainer.appendChild(wrapperMenu);

        var drawButton = document.createElement('div');
        drawButton.className = 'cesium-button cesium-toolbar-button cesium-DrawLinesMenu-show';
        drawButton.innerHTML = '<svg width="35" height="35" viewBox="-15 -11 210 210">' + DrawIcon + ' </svg>';
        drawButton.setAttribute('data-bind', 'attr  : { title: "Draw polylines" }, event : {click : drawCommand}, css: {"cesium-subMenu-focus": isPolyLineActive}');
        wrapperMenu.appendChild(drawButton);

        var wrapperCircleButton = document.createElement('span');
        wrapperCircleButton.className =  'cesium-subMenu-saveButtonWrapper';
        wrapperMenu.appendChild(wrapperCircleButton);

        var circleButton = document.createElement('div');
        circleButton.className = 'cesium-button cesium-toolbar-button cesium-DrawLinesMenu-show ';
        circleButton.innerHTML = '<svg width="30" height="30" viewBox="-10 -7 168.602  168.602">' + circleIcon + ' </svg>';
        circleButton.setAttribute('data-bind', 'attr  : { title: "Draw circles from a given radius" }, event : {click : circleCommand}, css: {"cesium-subMenu-focus": isCircleActive}');
        wrapperCircleButton.appendChild(circleButton);

        var circleTwoPointsButton = document.createElement('div');
        circleTwoPointsButton.className = 'cesium-button cesium-toolbar-button cesium-subMenu-saveButton';
        circleTwoPointsButton.innerHTML = '<svg width="30" height="30" viewBox="-10 -7 325  325">' + circle2Icon + ' </svg>';
        circleTwoPointsButton.setAttribute('data-bind', 'attr  : { title: "Draw circles with two points"}, event : {click : circleFromTwoPointsCommand}, css: {"cesium-subMenu-focus": isCircleFromTwoPointsActive}');
        wrapperCircleButton.appendChild(circleTwoPointsButton);

        var circleThreePointsButton = document.createElement('div');
        circleThreePointsButton.className = 'cesium-button cesium-toolbar-button cesium-subMenu-saveButton';
        circleThreePointsButton.innerHTML = '<svg width="30" height="30" viewBox="-10 -7 325  325">' + circle3Icon + ' </svg>';
        circleThreePointsButton.style.left = '80px';
        circleThreePointsButton.setAttribute('data-bind', 'attr  : { title: "Draw circles with three points"}, event : {click : circleFromThreePointsCommand}, css: {"cesium-subMenu-focus": isCircleFromThreePointsActive}');
        wrapperCircleButton.appendChild(circleThreePointsButton);

        var polygonButton = document.createElement('div');
        polygonButton.className = 'cesium-button cesium-toolbar-button cesium-DrawLinesMenu-show';
        polygonButton.innerHTML = '<svg width="26" height="26" viewBox="-30 0 550 438.857">' + polygonIcon + ' </svg>';
        polygonButton.setAttribute('data-bind', 'attr  : { title: "Draw polygons" }, event : {click : polygonCommand}, css: {"cesium-subMenu-focus": isPolygonsActive}');
        wrapperMenu.appendChild(polygonButton);

        var closeButton = document.createElement('div');
        closeButton.className = 'cesium-button cesium-toolbar-button cesium-DrawLinesMenu-show';
        closeButton.innerHTML = '<svg width="150" height="150" viewBox="-10 -10 640 640">' + closeIcon + ' </svg>';
        closeButton.setAttribute('data-bind', 'attr  : { title: "Close menu" }, event : {click : closeSubMenu}');
        wrapperMenu.appendChild(closeButton);

        var viewModel = new SubMenuViewModel(viewer, wrapperMenu);

        this._IconsContainer = IconsContainer;
        this._wrapperMenu = wrapperMenu;
        this._viewModel = viewModel;

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
                    return true;
                } catch (e) {
                    return false;
                }
            }
        }
    });

    return SubMenu;
});
