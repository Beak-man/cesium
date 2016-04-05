/*global define*/
define([
    '../../../../Core/defineProperties',
    '../../../../Core/destroyObject',
    '../../../../Core/DeveloperError',
    '../../../../ThirdParty/knockout',
    '../../../getElement',
    '../../../FlagCounter/FlagCounter',
    './ColorPickerViewModel'
], function (
        defineProperties,
        destroyObject,
        DeveloperError,
        knockout,
        getElement,
        FlagCounter,
        ColorPickerViewModel
        ) {
    "use strict";

    var closeIcon = '<path d="M84.707,68.752L65.951,49.998l18.75-18.752c0.777-0.777,0.777-2.036,0-2.813L71.566,15.295\
	c-0.777-0.777-2.037-0.777-2.814,0L49.999,34.047l-18.75-18.752c-0.746-0.747-2.067-0.747-2.814,0L15.297,28.431\
	c-0.373,0.373-0.583,0.88-0.583,1.407c0,0.527,0.21,1.034,0.583,1.407L34.05,49.998L15.294,68.753\
	c-0.373,0.374-0.583,0.88-0.583,1.407c0,0.528,0.21,1.035,0.583,1.407l13.136,13.137c0.373,0.373,0.881,0.583,1.41,0.583\
	c0.525,0,1.031-0.21,1.404-0.583l18.755-18.755l18.756,18.754c0.389,0.388,0.896,0.583,1.407,0.583c0.511,0,1.019-0.195,1.408-0.583\
	l13.138-13.137C85.484,70.789,85.484,69.53,84.707,68.752z"/>';

    var minusIcon = '<path d="M88.447,38.528H11.554c-1.118,0-2.024,0.907-2.024,2.024v18.896c0,1.118,0.907,2.024,2.024,2.024h76.892\
	c1.117,0,2.023-0.907,2.023-2.024V40.552C90.47,39.435,89.564,38.528,88.447,38.528z"/>';


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

        var mainContainer = document.createElement('DIV');
        mainContainer.className = 'cesium-MainColorPickerContainer';
        viewerContainer.appendChild(mainContainer);

        /* =====================================================================
         =====================  BUTTONS MENU CONTAINER =========================
         ======================================================================= */

        var barMenuContainer = document.createElement('DIV');
        barMenuContainer.className = 'cesium-BarMenuContainer';
        mainContainer.appendChild(barMenuContainer);

        var barMenuContainerLeft = document.createElement('DIV');
        barMenuContainerLeft.className = 'cesium-titleMenuLeft';
        barMenuContainer.appendChild(barMenuContainerLeft);

        var barMenuContainerRight = document.createElement('DIV');
        barMenuContainerRight.className = 'cesium-titleMenuRight';
        barMenuContainer.appendChild(barMenuContainerRight);

        var moveContainerBox = document.createElement('div');
        moveContainerBox.className = 'cesium-button cesium-toolbar-button cesium-boxMenuButton';
        moveContainerBox.innerHTML = '<svg width="14" height="14" viewBox="20 10 110 100">' + closeIcon + ' </svg>';
        moveContainerBox.setAttribute('data-bind', 'attr  : { title: "move panel" }, event : {mousedown : moveContainerCommand}');
        barMenuContainerLeft.appendChild(moveContainerBox);

        var minimizeContainerBox = document.createElement('div');
        minimizeContainerBox.className = 'cesium-button cesium-toolbar-button cesium-boxMenuButton';
        minimizeContainerBox.innerHTML = '<svg width="14" height="14" viewBox="20 -10 110 100">' + minusIcon + ' </svg>';
        minimizeContainerBox.setAttribute('data-bind', 'attr  : { title: "minimize panel" }, event : {click : minimizePanelCommand}');
        barMenuContainerLeft.appendChild(minimizeContainerBox);

        var ContainerTitleBox = document.createElement('div');
        ContainerTitleBox.className = 'cesium-titleMenu';
        ContainerTitleBox.innerHTML = 'Color picker Panel';
        barMenuContainerRight.appendChild(ContainerTitleBox);

        /* =====================================================================
         ========================  LEGEND CONTAINER ============================
         ======================================================================= */


        /* ============================ Main containers ========================= */

        var legendContainer = document.createElement('DIV');
        legendContainer.className = 'cesium-legendContainer';
        viewerContainer.appendChild(legendContainer);

        var legendContainerTop = document.createElement('DIV');
        legendContainerTop.className = 'cesium-legendContainerTop';
        legendContainer.appendChild(legendContainerTop);

        var legendContainerMiddle = document.createElement('DIV');
        legendContainerMiddle.className = 'cesium-legendContainerMiddle';
        legendContainer.appendChild(legendContainerMiddle);

        var legendContainerBottom = document.createElement('DIV');
        legendContainerBottom.className = 'cesium-legendContainerBottom';
        legendContainer.appendChild(legendContainerBottom);

        var legendObject = {
            container: legendContainer,
            top: legendContainerTop,
            middle: legendContainerMiddle,
            bottom: legendContainerBottom
        }

        /* ======================= Menu bar buttons ============================ */

        var barMenuLegendContainer = legendContainerTop;

        var barMenuLegendContainerLeft = document.createElement('DIV');
        barMenuLegendContainerLeft.className = 'cesium-titleMenuLeft';
        barMenuLegendContainer.appendChild(barMenuLegendContainerLeft);

        var barMenuLegendContainerRight = document.createElement('DIV');
        barMenuLegendContainerRight.className = 'cesium-titleMenuRight';
        barMenuLegendContainer.appendChild(barMenuLegendContainerRight);

        var moveLegendContainerBox = document.createElement('div');
        moveLegendContainerBox.className = 'cesium-button cesium-toolbar-button cesium-boxMenuButton';
        moveLegendContainerBox.innerHTML = '<svg width="14" height="14" viewBox="20 10 110 100">' + closeIcon + ' </svg>';
        moveLegendContainerBox.setAttribute('data-bind', 'attr  : { title: "close panel" }, event : {mousedown : movePanelCommand}');
        barMenuLegendContainerLeft.appendChild(moveLegendContainerBox);

        var minimizeLegendContainerBox = document.createElement('div');
        minimizeLegendContainerBox.className = 'cesium-button cesium-toolbar-button cesium-boxMenuButton';
        minimizeLegendContainerBox.innerHTML = '<svg width="14" height="14" viewBox="20 -10 110 100">' + minusIcon + ' </svg>';
        minimizeLegendContainerBox.setAttribute('data-bind', 'attr  : { title: "minimize panel" }, event : {click : minimizeLegendPanelCommand}');
        barMenuLegendContainerLeft.appendChild(minimizeLegendContainerBox);

        var legendContainerTitleBox = document.createElement('div');
        legendContainerTitleBox.className = 'cesium-titleMenu';
        legendContainerTitleBox.innerHTML = 'Color legend Panel';
        barMenuLegendContainerRight.appendChild(legendContainerTitleBox);

        /* =====================================================================
         ======================== COLOR BOXES CONTAINER ========================
         ======================================================================= */

        var ColorPickerContainer = document.createElement('DIV');
        ColorPickerContainer.className = 'cesium-ColorPickerContainer';
        mainContainer.appendChild(ColorPickerContainer);

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


        /* =====================================================================
         ===================== ASSIGN PROPERTY CONTAINER =======================
         ======================================================================= */

        var assignPropertyToColorContainer = document.createElement('div');
        assignPropertyToColorContainer.className = 'cesium-Color-assignProperty';
        viewerContainer.appendChild(assignPropertyToColorContainer);

        var assignPropertyToColorContainerLeft = document.createElement('div');
        assignPropertyToColorContainerLeft.className = 'cesium-Color-assignProperty-left';
        assignPropertyToColorContainer.appendChild(assignPropertyToColorContainerLeft);

        var assignPropertyToColorContainerRight = document.createElement('div');
        assignPropertyToColorContainerRight.className = 'cesium-Color-assignProperty-right';
        assignPropertyToColorContainer.appendChild(assignPropertyToColorContainerRight);

        var propertyNameTitleContainer = document.createElement('div');
        propertyNameTitleContainer.innerHTML = 'Property name : ';
        propertyNameTitleContainer.className = 'cesium-Color-propertyNameTitle-input';
        assignPropertyToColorContainerRight.appendChild(propertyNameTitleContainer);

        var propertyNameContainer = document.createElement('input');
        propertyNameContainer.type = 'text';
        propertyNameContainer.className = 'cesium-Color-propertyName-input';
        assignPropertyToColorContainerRight.appendChild(propertyNameContainer);

        var propertyValueTitleContainer = document.createElement('div');
        propertyValueTitleContainer.innerHTML = 'Property value : ';
        propertyValueTitleContainer.className = 'cesium-Color-propertyValueTitle-input';
        assignPropertyToColorContainerRight.appendChild(propertyValueTitleContainer);

        var propertyValueContainer = document.createElement('input');
        propertyValueContainer.type = 'text';
        propertyValueContainer.className = 'cesium-Color-propertyValue-input';
        assignPropertyToColorContainerRight.appendChild(propertyValueContainer);

        var propertyAssignButton = document.createElement('BUTTON');
        propertyAssignButton.innerHTML = 'Assign';
        propertyAssignButton.className = 'cesium-Color-propertyAssign-button';
        propertyAssignButton.setAttribute('data-bind', 'attr  : { title: "Pick this color" }, event : {click : colorAssignationCommand}');
        assignPropertyToColorContainerRight.appendChild(propertyAssignButton);

        var propertyAssignButton = document.createElement('BUTTON');
        propertyAssignButton.innerHTML = 'Cancel';
        propertyAssignButton.className = 'cesium-Color-propertyAssign-button-cancel';
        propertyAssignButton.setAttribute('data-bind', 'attr  : { title: "Pick this color" }, event : {click : cancelAssignationCommand}');
        assignPropertyToColorContainerRight.appendChild(propertyAssignButton);

        /* =====================================================================
         ============================ FLAG COUNTER =============================
         ======================================================================= */

         var flagCounter = new FlagCounter(viewerContainer, viewer);

        /* =====================================================================
         ============================== VIEW MODEL =============================
         ======================================================================= */

        var viewModel = new ColorPickerViewModel(viewerContainer, mainContainer, ColorPickerContainer, moveLegendContainerBox, selectedColorContainer, selectedColorTextContainer, assignPropertyToColorContainer, assignPropertyToColorContainerLeft, propertyNameContainer, propertyValueContainer, legendObject, viewer);

        this._viewerContainer = viewerContainer;
        this._mainContainer = mainContainer;
        this._legendContainer = legendContainer;
        this._assignPropertyToColorContainer = assignPropertyToColorContainer;
        this._viewModel = viewModel;
        this._flagCounter = flagCounter;

        knockout.applyBindings(viewModel, mainContainer);
        knockout.applyBindings(viewModel, assignPropertyToColorContainer);
        knockout.applyBindings(viewModel, moveLegendContainerBox);
        knockout.applyBindings(viewModel, minimizeLegendContainerBox);
        //  knockout.applyBindings(viewModel, legendContainer);
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
                    this._viewerContainer.removeChild(this._mainContainer);
                } catch (e) {
                }

                try {
                    this._viewerContainer.removeChild(this._legendContainer);
                } catch (e) {
                }
                
                try {
                    this._viewerContainer.removeChild(this._assignPropertyToColorContainer);
                } catch (e) {
                }
                
                try {
                    this._flagCounter.destroyCounterContainer;
                } catch (e) {
                }

            }
        },
        
        flagCounter: {
            get: function () {
                return this._flagCounter;
            }
        },
        
    });
   
    return ColorPicker;
});