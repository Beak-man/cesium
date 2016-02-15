/*global define*/
define([
    '../createCommand',
    '../../Core/defined',
    '../../Core/defineProperties',
    '../../Core/ScreenSpaceEventHandler',
    '../../Core/ScreenSpaceEventType',
    '../../ThirdParty/knockout',
    './SubMenu/SubMenu'
], function (
        createCommand,
        defined,
        defineProperties,
        ScreenSpaceEventHandler,
        ScreenSpaceEventType,
        knockout,
        SubMenu
        ) {
    "use strict";

    function  InitializeDrawLines(that) {

        that._isDrawLinesActive = true;

        that._wrapperPanel.className = '';
        that._wrapperPanel.className = 'cesium-Tools-wrapperPanel-transition-hide';
        that._viewer.tools.viewModel._isPanelVisible = false;
        that._viewer.drawLines.viewModel.isPanelToolVisible = false;

        // Activate the sub-menu of the drawLines widget

        try {
            that._viewer.drawLines.viewModel.subMenu.destroyWrapperMenu;
            that._viewer.drawLines.viewModel.subMenu.viewModel.removeAllCommands;
        } catch (e) {
        }

        that._subMenu = new SubMenu(that._IconsContainer, that._viewer);

        /*var subMenuViewModel = SubMenuViewModel();
         knockout.applyBindings(subMenuViewModel, that._wrapperMenu);*/
    }

    /**
     * The view model for {@link DrawLines}.
     * @alias DrawLinesViewModel
     * @constructor
     */
    var DrawLinesViewModel = function (IconsContainer, wrapperPanel, viewer) {


        this._IconsContainer = IconsContainer;
        this._wrapperPanel = wrapperPanel;
        this._viewer = viewer;
        this._isPanelToolVisible = false;
        this._isDrawLinesActive = false;

        var that = this;
        this._drawPolyLines = createCommand(function () {
            InitializeDrawLines(that);
        });

        knockout.track(this, ["isPanelToolVisible", "isDrawLinesActive"]);

    };
    defineProperties(DrawLinesViewModel.prototype, {
        /**
         * Gets the Command that is executed when the button is clicked.
         * @memberof DrawLinesViewModel.prototype
         *
         * @type {Command}
         */
        drawPolyLines: {
            get: function () {
                return this._drawPolyLines;
            }
       },
        isPanelToolVisible: {
            set: function (value) {
                this._isPanelToolVisible = value;
            }
        },
        subMenu: {
            get: function () {
                return this._subMenu;
            }
        },
    });

    return DrawLinesViewModel;
});
