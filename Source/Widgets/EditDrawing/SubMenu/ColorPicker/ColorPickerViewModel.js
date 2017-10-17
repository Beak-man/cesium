/*global define*/
define([
        '../../../../Core/Color',
        '../../../../Core/defined',
        '../../../../Core/defineProperties',
        '../../../../Core/ScreenSpaceEventHandler',
        '../../../../Core/ScreenSpaceEventType',
        '../../../../ThirdParty/knockout',
        '../../../createCommand',
        './TableViewModel'
    ], function(
        Color,
        defined,
        defineProperties,
        ScreenSpaceEventHandler,
        ScreenSpaceEventType,
        knockout,
        createCommand,
        TableViewModel) {
    'use strict';

    var cursor;

    // container : Element that contains the panel


    function movePanel(that, container, viewer) {


        // Must be modified if the element is not in the right node
        //  var element = document.body.childNodes[1].firstChild.childNodes[8]; // <div.cesium-ColorPickerContainer>


        console.log(container);


        that._handlerDownClick = new ScreenSpaceEventHandler(container);
        that._handlerMove = new ScreenSpaceEventHandler(container);
        that._handlerUpClick = new ScreenSpaceEventHandler(container);

        var sizePageX = document.documentElement.clientWidth;
        var sizePageY = document.documentElement.clientHeight;

        console.log(sizePageX);
        console.log(sizePageY);

        that._handlerDownClick.setInputAction(function () {

            document.onmousemove = getPosition;
            var cursorPosition = cursor;

            that._handlerMove.setInputAction(function (mouvement) {

                var cursorPosition = cursor;

                if (cursorPosition.x > sizePageX - container.offsetWidth) { // Bloque le container � droite

                    container.style.left = sizePageX - container.offsetWidth + 'px';

                } else if (cursorPosition.x < container.offsetWidth / 2 || cursorPosition.x < 0) { // Bloque le container � gauche

                    container.style.left = '0px';

                } else if (cursorPosition.x >= container.offsetWidth / 2 && cursorPosition.x <= sizePageX - container.offsetWidth / 2) { // d�placement du container

                    //    container.style.left = cursorPosition.x - (container.offsetWidth / 11) + 'px';
                    container.style.left = cursorPosition.x - 6 + 'px';
                }


                // ===================== motion in Y ======================


                if (cursorPosition.y >= 6 && cursorPosition.y <= sizePageY - container.offsetHeight) {
                    container.style.top = cursorPosition.y - 6 + 'px';
                }

            }, ScreenSpaceEventType.MOUSE_MOVE);
        }, ScreenSpaceEventType.LEFT_DOWN);

        that._handlerUpClick.setInputAction(function () {

            if (that._handlerDownClick) {
                that._handlerDownClick.removeInputAction(ScreenSpaceEventType.LEFT_DOWN);
            }
            if (that._handlerMove) {
                that._handlerMove.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);
            }
        }, ScreenSpaceEventType.LEFT_UP);
    }

    function  pickColor(that, color) {

        that._selectedColorContainer.style.background = color;
        that._selectedColorTextContainer.value = color;

        var colorStringTab = color.split(',');
        var RStringTab = colorStringTab[0];
        var RSplit = RStringTab.split('(');

        var R = parseInt(RSplit[1]);
        var G = parseInt(colorStringTab[1]);
        var B = parseInt(colorStringTab[2]);

        var RN = parseInt(RSplit[1]) / 255;
        var GN = parseInt(colorStringTab[1]) / 255;
        var BN = parseInt(colorStringTab[2]) / 255;

        var RInt = parseInt(RSplit[1]);
        var GInt = parseInt(colorStringTab[1]);
        var BInt = parseInt(colorStringTab[2]);

        that._colorProperty = 'R' + RInt + 'G' + GInt + 'B' + BInt;

        console.log('picked color : ' + that._colorProperty);

        if (!that._viewer.colorAssignation[that._colorProperty]) {
            that._propertyValueContainer.value = '';
            that._assignPropertyToColorContainer.style.visibility = 'visible';
            buildLegend(that);
        }

        if (that._viewer.colorAssignation[that._colorProperty]) {
            that._propertyValueContainer.value = that._viewer.colorAssignation[that._colorProperty].propertyValue;
            that._propertyNameContainer.value = that._viewer.colorAssignation[that._colorProperty].propertyName;
            that._assignPropertyToColorContainer.style.visibility = 'visible';
            buildLegend(that);
        }

        that._selectedColor = {
            red: R,
            green: G,
            blue: B,
            alpha: 1.0
        };

        that._colorObjectN = new Color(RN, GN, BN, 0.5);
    }

    function  colorAssignationFunction(that) {

        if (that._propertyNameContainer.value !== '' && that._propertyValueContainer.value !== '') {

            that._viewer.colorAssignation[that._colorProperty] = {
                propertyName: that._propertyNameContainer.value,
                propertyValue: that._propertyValueContainer.value,
                color: that._selectedColor
            };

            console.log(that._viewer.colorAssignation);
            that._assignPropertyToColorContainer.style.visibility = 'hidden';


        } else if (that._propertyNameContainer.value === '' || that._propertyValueContainer.value === '') {
            alert('Please, fill all fields');
        }

        buildLegend(that);
    }

    function buildLegend(that) {

        try {
            that._legendContainerMiddle.removeChild(that._tableListLegend);
        } catch (e) {
        }

        try {
            that._legendObject.bottom.removeChild(that._tableButtonsLegend);
        } catch (e) {
        }

        var dimObject = countPropertiesFunction(that._viewer.colorAssignation);

        console.log(that._viewer.colorAssignation);

        if (dimObject > 0) {

            /* ====================== tables declaration ======================= */

            that._tableListLegend = document.createElement('TABLE');
            that._tableListLegend.className = 'cesium-tableLegend';
            that._legendContainerMiddle.appendChild(that._tableListLegend);

            /* ===================== Middle table header ======================= */

            var tableLineLegendHeader = document.createElement('TR');

            var colomn1LegendHeader = document.createElement('TH');
            var headerColumn1 = document.createElement('div');
            headerColumn1.innerHTML = 'Color';

            colomn1LegendHeader.appendChild(headerColumn1);
            tableLineLegendHeader.appendChild(colomn1LegendHeader);

            var colomn2LegendHeader = document.createElement('TH');
            var headerColumn2 = document.createElement('div');
            headerColumn2.innerHTML = 'Value';

            colomn2LegendHeader.appendChild(headerColumn2);
            tableLineLegendHeader.appendChild(colomn2LegendHeader);

            var colomn3LegendHeader = document.createElement('TH');
            var headerColumn3 = document.createElement('div');
            headerColumn3.innerHTML = 'Name';

            colomn3LegendHeader.appendChild(headerColumn3);
            tableLineLegendHeader.appendChild(colomn3LegendHeader);

            that._tableListLegend.appendChild(tableLineLegendHeader);

            /* ========================== tables Body =========================== */

            for (var color in that._viewer.colorAssignation) {

                // *** create a line of the  table ***

                var tableLineLegend = document.createElement('TR');
                that._tableListLegend.appendChild(tableLineLegend);

                // *** 1st line :  the selected color ***

                var colomn1Legend = document.createElement('TD');
                tableLineLegend.appendChild(colomn1Legend);

                var propertyColorBox = document.createElement('div');
                propertyColorBox.className = 'cesium-buttonColor';
                var propertyColorBoxId = 'id_' + color;
                propertyColorBox.setAttribute('id', propertyColorBoxId);

                var clr = that._viewer.colorAssignation[color].color;
                var backgroundColor = 'rgba(' + clr.red + ',' + clr.green + ',' + clr.blue + ',' + clr.alpha + ')';

                propertyColorBox.style.background = backgroundColor;
                propertyColorBox.setAttribute('data-bind', 'attr  : { title: "Pick this color" }, event : {click : pickSelectColorCommand.bind($data,"' + backgroundColor + '")}');
                colomn1Legend.appendChild(propertyColorBox);

                // *** 2nd line : the property value ***

                var colomn2Legend = document.createElement('TD');
                tableLineLegend.appendChild(colomn2Legend);

                var propertyValue = document.createElement('div');
                propertyValue.innerHTML = that._viewer.colorAssignation[color].propertyValue;

                colomn2Legend.appendChild(propertyValue);

                // *** 3th line :the porperty name ***

                var colomn3Legend = document.createElement('TD');
                tableLineLegend.appendChild(colomn3Legend);

                var propertyName = document.createElement('div');
                propertyName.innerHTML = that._viewer.colorAssignation[color].propertyName;
                colomn3Legend.appendChild(propertyName);

                knockout.cleanNode(propertyColorBox);
                knockout.applyBindings(that._tableViewModel, propertyColorBox);
            }

            /* ========================== buttons ============================== */
        }

        that._tableButtonsLegend = document.createElement('TABLE');
        that._tableButtonsLegend.className = 'cesium-tableLegend';
        that._legendObject.bottom.appendChild(that._tableButtonsLegend);

        var tableButtonsLineLegend = document.createElement('TR');
        that._tableButtonsLegend.appendChild(tableButtonsLineLegend);

        var colomn1LegendButton = document.createElement('TD');
        tableButtonsLineLegend.appendChild(colomn1LegendButton);

        var colomn2LegendButton = document.createElement('TD');
        tableButtonsLineLegend.appendChild(colomn2LegendButton);

        if (dimObject > 0) {

            var geoJsonData = JSON.stringify(that._viewer.colorAssignation);
            var blob = new Blob([geoJsonData], {
                type: 'application/octet-stream',
                endings: 'native'
            });
            var url = URL.createObjectURL(blob);
            var fileName = 'LegendFile.legendjson';

            var linkDownload = document.createElement('a');
            linkDownload.innerHTML = '<BUTTON>Save</BUTTON>';
            linkDownload.href = url;
            linkDownload.download = fileName || 'unknown';
            colomn2LegendButton.appendChild(linkDownload);

        } else if (dimObject === 0) {

        }
    }


    function countPropertiesFunction(colorAssignation) {

        var count = 0;

        for (var color in colorAssignation) {
            count++;
        }

        return count;
    }
    /**
     * The view model for {@link ColorPicker}.
     * @alias ColorPickerViewModel
     * @constructor
     */
    var ColorPickerViewModel = function (viewerContainer, mainContainer, ColorPickerContainer, moveLegendContainerBox, selectedColorContainer, selectedColorTextContainer, assignPropertyToColorContainer, assignPropertyToColorContainerLeft, propertyNameContainer, propertyValueContainer, legendObject, viewer) {

        this._viewer = viewer;
        this._viewerContainer = viewerContainer;
        this._selectedColor = new Color(1.0, 0.5, 0, 0.5);
        this._selectedColorContainer = selectedColorContainer;
        this._selectedColorTextContainer = selectedColorTextContainer;
        this._mainContainer = mainContainer;
        this._ColorPickerContainer = ColorPickerContainer;
        this._moveLegendContainerBox = moveLegendContainerBox;
        this._assignPropertyToColorContainer = assignPropertyToColorContainer;
        this._propertyNameContainer = propertyNameContainer;
        this._propertyValueContainer = propertyValueContainer;
        this._assignPropertyToColorContainerLeft = assignPropertyToColorContainerLeft;

        this._legendContainerMiddle = legendObject.middle;
        this._legendObject = legendObject;

        this._isPanelminimized = false;
        this._isLegendPanelminimized = false;

        this._colorProperty = null;
        this._tableList = null;

        this._tableViewModel = new TableViewModel(this, this._viewer);

        if (!this._viewer.colorAssignation) {

            this._viewer.colorAssignation = {};
        } else if (this._viewer.colorAssignation) {
            buildLegend(this);
        }

        selectedColorContainer.style.background = 'rgba(255, 255, 0, 0.3)';
        selectedColorTextContainer.value = 'rgba(255, 255, 0, 0.3)';

        var that = this;
        this._selectColorCommand = createCommand(function (color) {
            pickColor(that, color);
        });

        this._colorAssignationCommand = createCommand(function () {
            colorAssignationFunction(that);
        });

        this._cancelAssignationCommand = createCommand(function () {
            that._assignPropertyToColorContainer.style.visibility = 'hidden';
            that._propertyValueContainer.value = '';
        });

        this._moveContainerCommand = createCommand(function (data, event) {
            removeHandlers(that);
            movePanel(that, that._mainContainer, that._viewer);
        });

        this._movePanelCommand = createCommand(function () {
            removeHandlers(that);
            movePanel(that, that._legendObject.container, viewer);
        });

        this._readConfigFileCommand = createCommand(function (d, e) {

        });

        this._minimizePanelCommand = createCommand(function () {

            if (!that._isPanelminimized) {

                that._mainContainer.style.height = '20px';
                that._mainContainer.className = 'cesium-MainColorPickerContainer-transition';
                that._ColorPickerContainer.style.visibility = 'hidden';
                that._isPanelminimized = true;
            } else if (that._isPanelminimized) {

                that._mainContainer.style.height = '320px';
                that._mainContainer.className = 'cesium-MainColorPickerContainer-transition';
                setTimeout(function () {
                    that._ColorPickerContainer.style.visibility = 'visible';
                }, 200);

                that._isPanelminimized = false;
            }
        });

        this._minimizeLegendPanelCommand = createCommand(function () {

            if (!that._isLegendPanelminimized) {

                that._legendObject.container.style.height = '20px';
                that._legendObject.container.className = 'cesium-legendContainer-transition';
                that._legendObject.middle.style.visibility = 'hidden';
                that._legendObject.bottom.style.visibility = 'hidden';
                that._isLegendPanelminimized = true;

            } else if (that._isLegendPanelminimized) {

                that._legendObject.container.style.height = '250px';
                that._legendObject.container.className = 'cesium-legendContainer-transition';
                setTimeout(function () {
                    that._legendObject.middle.style.visibility = 'visible';
                    that._legendObject.bottom.style.visibility = 'visible';
                }, 200);

                that._isLegendPanelminimized = false;
            }
        });

        // knockout.track(this, ['']);

    };
    defineProperties(ColorPickerViewModel.prototype, {
        /**
         * Gets the Command that is executed when the button is clicked.
         * @memberof ColorPickerViewModel.prototype
         *
         * @type {Command}
         */
        selectColorCommand: {
            get: function () {
                return this._selectColorCommand;
            }
        },
        moveContainerCommand: {
            get: function () {
                return this._moveContainerCommand;
            }
        },
        colorAssignationCommand: {
            get: function () {
                return this._colorAssignationCommand;
            }
        },
        cancelAssignationCommand: {
            get: function () {
                return this._cancelAssignationCommand;
            }
        },
        movePanelCommand: {
            get: function () {
                return this._movePanelCommand;
            }
        },
        minimizePanelCommand: {
            get: function () {
                return this._minimizePanelCommand;
            }
        },
        minimizeLegendPanelCommand: {
            get: function () {
                return this._minimizeLegendPanelCommand;
            }
        },
        tableViewModel: {
            get: function () {
                return this._tableViewModel;
            }
        },
        readConfigFileCommand: {
            get: function () {
                return this._readConfigFileCommand;
            }
        },
        buildLegend: {
            get: function () {
                buildLegend(this);
            }
        },
        removeHandlers: {
            get: function () {
                if (this._handlerDownClick) {
                    this._handlerDownClick.removeInputAction(ScreenSpaceEventType.LEFT_DOWN);
                }
                if (this._handlerUpClick) {
                    this._handlerUpClick.removeInputAction(ScreenSpaceEventType.LEFT_UP);
                }
                if (this._handlerMove) {
                    this._handlerMove.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);
                }
            }
        }
    });

    function getPosition(e) {
        e = e || window.event;

        cursor = {
            x: 0,
            y: 0
        };
        if (e.pageX || e.pageY) {
            cursor.x = e.pageX;
            cursor.y = e.pageY;

            return cursor;
        }
    }

    function removeHandlers(that) {
        if (that._handlerDownClick) {
            that._handlerDownClick.removeInputAction(ScreenSpaceEventType.LEFT_DOWN);
        }
        if (that._handlerUpClick) {
            that._handlerUpClick.removeInputAction(ScreenSpaceEventType.LEFT_UP);
        }
        if (that._handlerMove) {
            that._handlerMove.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);
        }
    }


    return ColorPickerViewModel;
});
