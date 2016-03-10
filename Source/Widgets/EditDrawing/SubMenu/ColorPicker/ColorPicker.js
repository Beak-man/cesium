/*global define*/
define([
    '../../../../Core/defineProperties',
    '../../../../Core/destroyObject',
    '../../../../Core/DeveloperError',
    '../../../../ThirdParty/knockout',
    '../../../getElement',
    './ColorPickerViewModel'
], function (
        defineProperties,
        destroyObject,
        DeveloperError,
        knockout,
        getElement,
        ColorPickerViewModel
        ) {
    "use strict";

    /**
     * A widget to show the colorPicker widget.
     *
     * @alias colorPicker
     * @constructor
     *
     * @param {Element|String} container The DOM element contain the widget.
     * @param {Object} Viewer.
     */
    var ColorPicker = function (viewerContainer, viewer) {

        var ColorPickerContainer = document.createElement('DIV');
        ColorPickerContainer.className = 'cesium-ColorPickerContainer';
        ColorPickerContainer.setAttribute('data-bind', ' event : {mousedown : moveContainerCommand}');
        viewerContainer.appendChild(ColorPickerContainer);

        for (var i = 0; i < 120; i++) {

            var color;

            if (i < 10) { // red

                var R = parseInt((255 / 10) * (i + 1));
                color = "rgba(" + R + ", 0, 0, 1)";

            } else if (i < 20) { // green

                var G = parseInt((255 / 10) * (i + 1 - 10));
                color = "rgba(0, " + G + ", 0, 1)";

            } else if (i < 30) { // blue

                var B = parseInt((255 / 10) * (i + 1 - 20));
                color = "rgba(0, 0, " + B + ", 1)";

            } else if (i < 40) { // white

                var R = parseInt((255 / 10) * (i + 1 - 30));
                var G = parseInt((255 / 10) * (i + 1 - 30));
                var B = parseInt((255 / 10) * (i + 1 - 30));
                color = "rgba(" + R + ", " + G + ", " + B + ", 1)";

            } else if (i < 50) { // pink

                var B = parseInt((255 / 10) * (i + 1 - 40));
                color = "rgba(" + B + ", 0, " + B + ", 1)";

            } else if (i < 60) { // Yellow 

                var Y = parseInt((255 / 10) * (i + 1 - 50));
                color = "rgba(" + Y + ", " + Y + ", 0, 1)";

            } else if (i < 70) { // purple

                var B = parseInt((255 / 10) * (i + 1 - 60));
                color = "rgba(0, " + B + ", " + B + ", 1)";

            } else if (i < 80) { // purple

                var B = parseInt((255 / 10) * (i + 1 - 70));
                color = "rgba(150, " + B + ", " + B + ", 1)";

            } else if (i < 90) { // purple

                var B = parseInt((255 / 10) * (i + 1 - 80));
                color = "rgba(" + B + ",100 ," + B + ", 1)";

            } else if (i < 100) { // purple

                var B = parseInt((255 / 10) * (i + 1 - 90));
                var C = parseInt((100 / 10) * (i + 1 - 90));
                color = "rgba(" + B + ", " + B + "," + C + ", 1)";

            } else if (i < 110) { // purple

                var B = parseInt((255 / 10) * (i + 1 - 100));
                color = "rgba(170, " + B + ", " + B + ", 1)";

            } else if (i < 120) { // purple

                var B = parseInt((255 / 10) * (i + 1 - 110));
                color = "rgba(255," + B + ",0, 1)";

            }

            var colorButton = document.createElement('div');
            colorButton.className = 'cesium-buttonColor';
            colorButton.style.background = color;
            colorButton.setAttribute('data-bind', 'attr  : { title: "Pick this color" }, event : {click : selectColorCommand.bind($data,"' + color + '")}');
            ColorPickerContainer.appendChild(colorButton);
        }

        var selectedColorContainer = document.createElement('div');
        selectedColorContainer.className = 'cesium-buttonColor-selected';
        ColorPickerContainer.appendChild(selectedColorContainer);
        
        var selectedColorTextContainer = document.createElement('input');
        selectedColorTextContainer.type = 'text';
        selectedColorTextContainer.className = 'cesium-buttonColor-selected-text';
        ColorPickerContainer.appendChild(selectedColorTextContainer);


        var viewModel = new ColorPickerViewModel(viewerContainer, ColorPickerContainer, selectedColorContainer, selectedColorTextContainer, viewer);
        this._viewerContainer = viewerContainer;
        this._ColorPickerContainer = ColorPickerContainer;
        this._viewModel = viewModel;
        knockout.applyBindings(viewModel, ColorPickerContainer);
    };
    defineProperties(ColorPicker.prototype, {
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
        destroyColorPickerContainer: {
            get: function () {
                try {
                    this._viewerContainer.removeChild(this._ColorPickerContainer);
                    return true;
                } catch (e) {
                    return false;
                    console.log(e)
                }
            }
        },
    });
    return ColorPicker;
});