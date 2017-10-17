/*global define*/
define([
        '../../../../Core/defineProperties',
        '../../../../ThirdParty/knockout',
        '../../../FlagCounter/FlagCounter',
        './ColorPickerViewModel'
    ], function(
        defineProperties,
        knockout,
        FlagCounter,
        ColorPickerViewModel) {
    'use strict';

    var closeIcon = '<g><g><path d="M4.712,69.854l-4.69,28.273c-0.086,0.512,0.082,1.034,0.449,1.401c0.002,0.003,0.002,0.003,0.002,0.003\
			c0.37,0.368,0.893,0.535,1.406,0.447l28.197-4.765c0.594-0.1,1.081-0.525,1.264-1.1c0.185-0.572,0.031-1.202-0.396-1.628\
			l-5.513-5.513l14.802-14.802c0.63-0.629,0.63-1.647,0-2.277l-10.2-10.201c-0.63-0.629-1.648-0.629-2.278,0L12.954,74.493\
			l-5.515-5.515c-0.425-0.425-1.055-0.577-1.63-0.394C5.234,68.768,4.811,69.258,4.712,69.854z"/></g><g>\
		<path d="M95.288,30.146l4.69-28.273c0.085-0.512-0.083-1.034-0.449-1.4C99.527,0.47,99.527,0.47,99.527,0.47\
			c-0.37-0.367-0.893-0.534-1.406-0.447L69.924,4.788c-0.594,0.1-1.081,0.525-1.265,1.1c-0.185,0.572-0.031,1.202,0.396,1.628\
			l5.513,5.513L59.766,27.83c-0.629,0.629-0.629,1.648,0,2.278l10.2,10.201c0.63,0.629,1.648,0.629,2.278,0l14.802-14.802\
			l5.515,5.515c0.425,0.425,1.056,0.578,1.63,0.394C94.766,31.232,95.19,30.742,95.288,30.146z"/></g><g>\
		<path d="M69.854,95.288l28.271,4.69c0.512,0.086,1.035-0.082,1.401-0.449c0.002-0.003,0.002-0.003,0.002-0.003\
			c0.368-0.37,0.535-0.892,0.448-1.406l-4.765-28.196c-0.1-0.594-0.525-1.081-1.1-1.265c-0.572-0.185-1.202-0.031-1.628,0.396\
			l-5.513,5.513L72.169,59.765c-0.628-0.628-1.647-0.628-2.277,0.001L59.691,69.967c-0.629,0.629-0.629,1.648,0,2.277l14.802,14.802\
			l-5.515,5.515c-0.425,0.425-0.577,1.055-0.393,1.63C68.768,94.766,69.258,95.19,69.854,95.288z"/></g><g>\
		<path d="M30.146,4.712L1.874,0.022C1.361-0.064,0.84,0.104,0.473,0.471C0.47,0.474,0.47,0.474,0.47,0.474\
			C0.103,0.844-0.064,1.366,0.023,1.88l4.766,28.197c0.1,0.593,0.525,1.081,1.099,1.264c0.573,0.186,1.202,0.032,1.629-0.395\
			l5.513-5.513L27.83,40.234c0.63,0.63,1.648,0.63,2.278,0.001l10.201-10.201c0.63-0.63,0.63-1.648,0-2.278L25.507,12.954\
			l5.515-5.515c0.424-0.425,0.577-1.056,0.394-1.63C31.232,5.234,30.742,4.81,30.146,4.712z"/></g></g>';

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
        moveContainerBox.innerHTML = '<svg width="18" height="18" viewBox="-10 -20 170 170">' + closeIcon + ' </svg>';
        moveContainerBox.setAttribute('data-bind', 'attr  : { title: "move panel" }, event : {mousedown : moveContainerCommand}');
        barMenuContainerLeft.appendChild(moveContainerBox);

        var minimizeContainerBox = document.createElement('div');
        minimizeContainerBox.className = 'cesium-button cesium-toolbar-button cesium-boxMenuButton';
        minimizeContainerBox.innerHTML = '<svg width="14" height="14" viewBox="-3 -10 110 100">' + minusIcon + ' </svg>';
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
        };

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
        moveLegendContainerBox.innerHTML = '<svg width="18" height="18" viewBox="-10 -20 170 170">' + closeIcon + ' </svg>';
        moveLegendContainerBox.setAttribute('data-bind', 'attr  : { title: "close panel" }, event : {mousedown : movePanelCommand}');
        barMenuLegendContainerLeft.appendChild(moveLegendContainerBox);

        var minimizeLegendContainerBox = document.createElement('div');
        minimizeLegendContainerBox.className = 'cesium-button cesium-toolbar-button cesium-boxMenuButton';
        minimizeLegendContainerBox.innerHTML = '<svg width="14" height="14" viewBox="-3 -10 110 100">' + minusIcon + ' </svg>';
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

        var R;
        var G;
        var B;

        for (var i = 0; i < 120; i++) {

            var color;

            if (i < 10) { // red

                R = parseInt((255 / 10) * (i + 1));
                color = 'rgba(' + R + ', 0, 0, 1)';

            } else if (i < 20) { // green

                G = parseInt((255 / 10) * (i + 1 - 10));
                color = 'rgba(0, ' + G + ', 0, 1)';

            } else if (i < 30) { // blue

                B = parseInt((255 / 10) * (i + 1 - 20));
                color = 'rgba(0, 0, ' + B + ', 1)';

            } else if (i < 40) { // white

                R = parseInt((255 / 10) * (i + 1 - 30));
                G = parseInt((255 / 10) * (i + 1 - 30));
                B = parseInt((255 / 10) * (i + 1 - 30));
                color = 'rgba(' + R + ', ' + G + ', ' + B + ', 1)';

            } else if (i < 50) { // pink

                B = parseInt((255 / 10) * (i + 1 - 40));
                color = 'rgba(' + B + ', 0, ' + B + ', 1)';

            } else if (i < 60) { // Yellow 

                var Y = parseInt((255 / 10) * (i + 1 - 50));
                color = 'rgba(' + Y + ', ' + Y + ', 0, 1)';

            } else if (i < 70) { // purple

                B = parseInt((255 / 10) * (i + 1 - 60));
                color = 'rgba(0, ' + B + ', ' + B + ', 1)';

            } else if (i < 80) { // purple

                B = parseInt((255 / 10) * (i + 1 - 70));
                color = 'rgba(150, ' + B + ', ' + B + ', 1)';

            } else if (i < 90) { // purple

                B = parseInt((255 / 10) * (i + 1 - 80));
                color = 'rgba(' + B + ',100 ,' + B + ', 1)';

            } else if (i < 100) { // purple

                B = parseInt((255 / 10) * (i + 1 - 90));
                var C = parseInt((100 / 10) * (i + 1 - 90));
                color = 'rgba(' + B + ', ' + B + ',' + C + ', 1)';

            } else if (i < 110) { // purple

                B = parseInt((255 / 10) * (i + 1 - 100));
                color = 'rgba(170, ' + B + ', ' + B + ', 1)';

            } else if (i < 120) { // purple

                B = parseInt((255 / 10) * (i + 1 - 110));
                color = 'rgba(255,' + B + ',0, 1)';
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

        propertyAssignButton = document.createElement('BUTTON');
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
                    this._flagCounter.destroyCounterContainer();
                } catch (e) {
                }

            }
        },

        flagCounter: {
            get: function () {
                return this._flagCounter;
            }
        }

    });

    return ColorPicker;
});
