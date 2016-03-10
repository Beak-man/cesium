/*global define*/
define([
    '../../../../Core/Color',
    '../../../createCommand',
    '../../../../Core/defined',
    '../../../../Core/defineProperties',
    '../../../../Core/ScreenSpaceEventHandler',
    '../../../../Core/ScreenSpaceEventType',
    '../../../../ThirdParty/knockout'
], function (
        Color,
        createCommand,
        defined,
        defineProperties,
        ScreenSpaceEventHandler,
        ScreenSpaceEventType,
        knockout
        ) {
    "use strict";

    var cursor;

    // container : Element that contains the panel


    function movePanel(that, ColorPickerContainer, viewer) {


        // Must be modified if the element is not in the right node
      //  var element = document.body.childNodes[1].firstChild.childNodes[8]; // <div.cesium-ColorPickerContainer>

        that._handlerDownClick = new ScreenSpaceEventHandler(ColorPickerContainer);
        that._handlerMove = new ScreenSpaceEventHandler(ColorPickerContainer);
        that._handlerUpClick = new ScreenSpaceEventHandler(ColorPickerContainer);

        var sizePageX = document.documentElement.clientWidth;
        var sizePageY = document.documentElement.clientHeight;
        
        console.log(ColorPickerContainer);
        
         that._handlerDownClick.setInputAction(function () {

            document.onmousemove = getPosition;
            var cursorPosition = cursor;    
            
          that._handlerMove.setInputAction(function (mouvement) {
              
              console.log(mouvement);

                var cursorPosition = cursor;

                //  var offsetY = cursorPosition.y - (wrapper.children[1].offsetHeight / 2) - (wrapper.children[0].offsetHeight);
                //  var offsetX = cursorPosition.x - (wrapper.children[1].offsetWidth / 2);
                
                console.log(cursorPosition.x);

          /*      if (cursorPosition.x > sizePageX - ColorPickerContainer.offsetWidth / 2 - 3) {

                    ColorPickerContainer.style.left = sizePageX - ColorPickerContainer.offsetWidth - 3 + "px";

                } else if (cursorPosition.x < ColorPickerContainer.offsetWidth / 2 || cursorPosition.x < 0) {

                    ColorPickerContainer.style.left = "0px";

                } else if (cursorPosition.x >= ColorPickerContainer.offsetWidth / 2 && cursorPosition.x <= sizePageX -ColorPickerContainer.offsetWidth / 2) {

                    ColorPickerContainer.style.left = cursorPosition.x - (ColorPickerContainer.offsetWidth / 2) + "px";
                }

                if (cursorPosition.y > sizePageY - 2 * ColorPickerContainer.offsetHeight) { // for bottom case

                    ColorPickerContainer.style.top = sizePageY - 2 * ColorPickerContainer.offsetHeight + "px";

                } else if (cursorPosition.y < ColorPickerContainer.offsetHeight / 2 || cursorPosition.y < 0) { // for top case

                    ColorPickerContainer.style.top = "0px";

                } else if (cursorPosition.y >= ColorPickerContainer.offsetHeight / 2 && cursorPosition.y <= sizePageY - ColorPickerContainer.offsetHeight / 2) {
                    ColorPickerContainer.style.top = cursorPosition.y - (ColorPickerContainer.offsetHeight / 2) + "px";

                }*/

            }, ScreenSpaceEventType.MOUSE_MOVE);
        }, ScreenSpaceEventType.MIDDLE_DOWN);

      /*  that._handlerUpClick.setInputAction(function () {

            if (that._handlerDownClick)
                that._handlerDownClick.removeInputAction(ScreenSpaceEventType.MIDDLE_DOWN);
            if (that._handlerMove)
                that._handlerMove.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);

        }, ScreenSpaceEventType.MIDDLE_UP);*/


    }


    function  InitializeDrawEdit(that, color) {

        that._selectedColorContainer.style.background = color;
        that._selectedColorTextContainer.value = color;

        var colorStringTab = color.split(",");
        var RStringTab = colorStringTab[0];
        var RSplit = RStringTab.split("(");

        var R = parseInt(RSplit[1]) / 255.0;
        var G = parseInt(colorStringTab[1]) / 255.0;
        var B = parseInt(colorStringTab[2]) / 255.0;

        that._selectedColor = new Color(R, G, B, 0.5);
    }

    /**
     * The view model for {@link ColorPicker}.
     * @alias ColorPickerViewModel
     * @constructor
     */
    var ColorPickerViewModel = function (viewerContainer, ColorPickerContainer, selectedColorContainer, selectedColorTextContainer, viewer) {

        this._viewer = viewer;
        this._viewerContainer = viewerContainer;
        this._selectedColor = new Color(1.0, 0.5, 0, 0.5);
        this._selectedColorContainer = selectedColorContainer;
        this._selectedColorTextContainer = selectedColorTextContainer;
        this._ColorPickerContainer = ColorPickerContainer;
        selectedColorContainer.style.background = 'rgba(255, 255, 0, 0.3)';
        selectedColorTextContainer.value = 'rgba(255, 255, 0, 0.3)';

        var that = this;
        this._selectColorCommand = createCommand(function (color) {
            InitializeDrawEdit(that, color);
        });

        this._moveContainerCommand = createCommand(function (data, event) {
            removeHandlers(that);
            movePanel(that, that._ColorPickerContainer, that._viewer);
        });

        // knockout.track(this, ['']);

    };
    defineProperties(ColorPickerViewModel.prototype, {
        /**
         * Gets the Command that is executed when the button is clicked.
         * @memberof DrawLinesViewModel.prototype
         *
         * @type {Command}
         */
        selectColorCommand: {
            get: function () {
                return this._selectColorCommand;
            }
        },
        
        selectedColor: {
            get: function () {
                return this._selectedColor;
            }
        },
        
        moveContainerCommand: {
            get: function () {
                return this._moveContainerCommand;
            }
        },
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
        if (that._handlerDownClick)
            that._handlerDownClick.removeInputAction(ScreenSpaceEventType.MIDDLE_DOWN);
        if (that._handlerUpClick)
            that._handlerUpClick.removeInputAction(ScreenSpaceEventType.MIDDLE_UP);
        if (that._handlerMove)
            that._handlerMove.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);
    }


    return ColorPickerViewModel;
});
