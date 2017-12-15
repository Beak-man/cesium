/*global define*/
define([
        '../../Core/defineProperties',
        '../../Core/ScreenSpaceEventHandler',
        '../../Core/ScreenSpaceEventType',
        '../../ThirdParty/knockout',
        '../createCommand'
    ], function(
        defineProperties,
        ScreenSpaceEventHandler,
        ScreenSpaceEventType,
        knockout,
        createCommand) {
    "use strict";

    var cursor;

    // container : Element that contain the widget (i.e modificationsToolbar)
    // wrapper : modificationsToolbarWrapper

    function moveIcon(that, container, wrapper) {


        // Must be modified if the element is not in the right node
        var element = document.body.childNodes[1].firstChild.childNodes[6];

        that._handlerDownClick = new ScreenSpaceEventHandler(element);
        that._handlerMove = new ScreenSpaceEventHandler(element);
        that._handlerUpClick = new ScreenSpaceEventHandler(element);

        var sizePageX = document.documentElement.clientWidth;
        var sizePageY = document.documentElement.clientHeight;

        that._handlerDownClick.setInputAction(function () {

            document.onmousemove = getPosition;
            var cursorPosition = cursor;

            that._handlerMove.setInputAction(function (mouvement) {

                var cursorPosition = cursor;

                if (cursorPosition.x > sizePageX - wrapper.children[1].offsetWidth / 2 - 3) {

                    container.style.left = sizePageX - wrapper.children[1].offsetWidth - 3 + "px";

                } else if (cursorPosition.x < wrapper.children[1].offsetWidth / 2 || cursorPosition.x < 0) {

                    container.style.left = "0px";

                } else if (cursorPosition.x >= wrapper.children[1].offsetWidth / 2 && cursorPosition.x <= sizePageX - wrapper.children[1].offsetWidth / 2) {

                    container.style.left = cursorPosition.x - (wrapper.children[1].offsetWidth / 2) + "px";
                }

                if (cursorPosition.y > sizePageY - 2 * wrapper.children[1].offsetHeight) { // for bottom case

                    container.style.top = sizePageY - 2 * wrapper.children[1].offsetHeight + "px";

                } else if (cursorPosition.y < wrapper.children[1].offsetHeight / 2 || cursorPosition.y < 0) { // for top case

                    container.style.top = "0px";

                } else if (cursorPosition.y >= wrapper.children[1].offsetHeight / 2 && cursorPosition.y <= sizePageY - wrapper.children[1].offsetHeight / 2) {
                    container.style.top = cursorPosition.y - (wrapper.children[1].offsetHeight / 2) + "px";
                }

            }, ScreenSpaceEventType.MOUSE_MOVE);
        }, ScreenSpaceEventType.LEFT_DOWN);



        that._handlerUpClick.setInputAction(function () {

            if (that._handlerDownClick)
                that._handlerDownClick.removeInputAction(ScreenSpaceEventType.LEFT_DOWN);
            if (that._handlerMove)
                that._handlerMove.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);

        }, ScreenSpaceEventType.LEFT_UP);
    }

    function showPanel(that) {

        if (that._isPanelVisible === false) {

            that._wrapper.children[0].classeName = "";
            that._wrapper.children[0].className = 'cesium-Tools-wrapperPanel-transition-show';

            that._isPanelVisible = true;

            that._viewer.drawLines.viewModel.isPanelToolVisible = that._isPanelVisible;
            that._viewer.editDrawing.viewModel.isPanelToolVisibleEdit = that._isPanelVisible;
            that._viewer.showGrid.viewModel.isPanelToolVisibleGrid = that._isPanelVisible;
            that._viewer.pointCircleSwitch.viewModel.isPanelToolVisibleSwitch = that._isPanelVisible;
            that._viewer.lngLat.viewModel.isPanelToolVisibleLngLat = that._isPanelVisible;

            if (that._handlerDownClick)
                that._handlerDownClick.removeInputAction(ScreenSpaceEventType.MIDDLE_DOWN);
            if (that._handlerMove)
                that._handlerMove.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);

            try {
                that._viewer.drawLines.viewModel.subMenu.destroyWrapperMenu;
            } catch (e) {
            }

            try {
                that._viewer.drawLines.viewModel.subMenu.viewModel.removeAllCommands;
            } catch (e) {
            }

            try {
                that._viewer.editDrawing.viewModel.subMenu.destroyWrapperMenu;
            } catch (e) {
            }

            try {
                that._viewer.editDrawing.viewModel.subMenu.viewModel.removeAllCommands;
            } catch (e) {
            }

            try {
                that._viewer.editDrawing.viewModel.subMenu.viewModel.colorPicker.destroyColorPickerContainer;
                that._viewer.editDrawing.viewModel.subMenu.viewModel.colorPicker.viewModel.removeHandlers;
            } catch (e) {
            }

        } else if (that._isPanelVisible === true) {

            that._wrapper.children[0].classeName = "";
            that._wrapper.children[0].className = 'cesium-Tools-wrapperPanel-transition-hide';

            that._isPanelVisible = false;

            that._viewer.drawLines.viewModel.isPanelToolVisible = that._isPanelVisible;
            that._viewer.editDrawing.viewModel.isPanelToolVisibleEdit = that._isPanelVisible;
            that._viewer.showGrid.viewModel.isPanelToolVisibleGrid = that._isPanelVisible;
            that._viewer.pointCircleSwitch.viewModel.isPanelToolVisibleSwitch = that._isPanelVisible;
            that._viewer.lngLat.viewModel.isPanelToolVisibleLngLat = that._isPanelVisible;

            if (that._handlerDownClick)
                that._handlerDownClick.removeInputAction(ScreenSpaceEventType.MIDDLE_DOWN);
            if (that._handlerMove)
                that._handlerMove.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);

            try {
                that._viewer.drawLines.viewModel.subMenu.destroyWrapperMenu;
            } catch (e) {
            }

            try {
                that._viewer.drawLines.viewModel.subMenu.viewModel.removeAllCommands;
            } catch (e) {
            }

            try {
                that._viewer.editDrawing.viewModel.subMenu.destroyWrapperMenu;
            } catch (e) {
            }

            try {
                that._viewer.editDrawing.viewModel.subMenu.viewModel.removeAllCommands;
            } catch (e) {
            }

            try {
                that._viewer.editDrawing.viewModel.subMenu.viewModel.colorPicker.destroyColorPickerContainer;
                that._viewer.editDrawing.viewModel.subMenu.viewModel.colorPicker.viewModel.removeHandlers;
            } catch (e) {
            }
        }
    }

    /**
     * The view model for {@link Tools}.
     * @alias ToolsViewModel
     * @constructor
     */
    var ToolsViewModel = function (container, wrapper, viewer) {

        this._container = container;
        this._wrapper = wrapper;
        this._viewer = viewer;
        this._isPanelVisible = false;
        this.removeAllCommands;

        var that = this;
        this._moveIconCommand = createCommand(function (data, event) {
            removeHandlers(that);
            moveIcon(that, that._container, that._wrapper, that._viewer);
        });

        this._showToolPanel = createCommand(function () {
            removeHandlers(that);
            showPanel(that);
        });

        knockout.track(this, ["isPanelVisible"]);
    };

    defineProperties(ToolsViewModel.prototype, {
        /**
         * Gets the Command that is executed when the button is clicked.
         * @memberof HomeButtonViewModel.prototype
         *
         * @type {Command}
         */
        moveIconCommand: {
            get: function () {
                return this._moveIconCommand;
            }
        },
        showToolPanel: {
            get: function () {
                return this._showToolPanel;
            }
        },
        isPanelVisible: {
            set: function (value) {
                this._isPanelVisible = value;
            }
        },
        removeAllCommands: {
            get: function () {
                if (this._handlerDownClick)
                    this._handlerDownClick.removeInputAction(ScreenSpaceEventType.MIDDLE_DOWN);
                if (this._handlerUpClick)
                    this._handlerUpClick.removeInputAction(ScreenSpaceEventType.MIDDLE_UP);
                if (this._handlerMove)
                    this._handlerMove.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);
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
        if (that._handlerDownClick)
            that._handlerDownClick.removeInputAction(ScreenSpaceEventType.MIDDLE_DOWN);
        if (that._handlerUpClick)
            that._handlerUpClick.removeInputAction(ScreenSpaceEventType.MIDDLE_UP);
        if (that._handlerMove)
            that._handlerMove.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);
    }


    return ToolsViewModel;
});
