/*global define*/
define([
        '../../Core/defineProperties',
        '../../ThirdParty/knockout',
        '../createCommand',
        './SubMenu/SubMenu'
    ], function(
        defineProperties,
        knockout,
        createCommand,
        SubMenu) {
    'use strict';

    function  InitializeDrawLines(that) {

        that._isDrawLinesActive = true;

        // Here, we set severval parameters to false in order to hide butons in the tool panel

        that._wrapperPanel.className = '';
        that._wrapperPanel.className = 'cesium-Tools-wrapperPanel-transition-hide';
        that._viewer.tools.viewModel._isPanelVisible = false;
        that._viewer.drawLines.viewModel.isPanelToolVisible = false;
        that._viewer.editDrawing.viewModel.isPanelToolVisibleEdit = false;
        that._viewer.showGrid.viewModel.isPanelToolVisibleGrid = false;
        that._viewer.pointCircleSwitch.viewModel.isPanelToolVisibleSwitch = false;
        that._viewer.lngLat.viewModel.isPanelToolVisibleLngLat = false;
        that._viewer.markerMove.viewModel.isPanelToolVisibleMarkerMove = false;

        that._subMenu = new SubMenu(that._IconsContainer, that._viewer);
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

        knockout.track(this, ['isPanelToolVisible', 'isDrawLinesActive']);

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
