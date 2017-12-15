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

    function  InitializeDrawEdit(that) {

        that._isDrawEditActive = true;

        // Here, we set severval parameters to false in order to hide butons in the tool panel

        that._wrapperPanel.className = '';
        that._wrapperPanel.className = 'cesium-Tools-wrapperPanel-transition-hide';

        that._viewer.tools.viewModel._isPanelVisible = false;
        that._viewer.drawLines.viewModel.isPanelToolVisible = false;
        that._viewer.editDrawing.viewModel.isPanelToolVisibleEdit = false;
        that._viewer.showGrid.viewModel.isPanelToolVisibleGrid = false;
        that._viewer.pointCircleSwitch.viewModel.isPanelToolVisibleSwitch = false;
        that._viewer.lngLat.viewModel.isPanelToolVisibleLngLat = false;

        // Activate the sub-menu of the drawLines widget

        try {
            that._viewer.drawLines.viewModel.subMenu.destroyWrapperMenu();
            that._viewer.drawLines.viewModel.subMenu.viewModel.removeAllCommands();
        } catch (e) {
        }

        that._subMenu = new SubMenu(that._IconsContainer, that._viewerContainer, that._viewer);
    }

    /**
     * The view model for {@link DrawLines}.
     * @alias EditDrawingViewModel
     * @constructor
     */
    var EditDrawingViewModel = function (IconsContainer, wrapperPanel, viewerContainer, viewer) {

        this._IconsContainer = IconsContainer;
        this._wrapperPanel = wrapperPanel;
        this._viewer = viewer;
        this._isPanelToolVisibleEdit = false;
        this._isDrawEditActive = false;
        this._viewerContainer = viewerContainer;
        this._subMenu = null;

        var that = this;
        this._editCommand = createCommand(function () {
            InitializeDrawEdit(that);
        });

        knockout.track(this, ['isPanelToolVisibleEdit', 'isDrawEditActive']);

    };
    defineProperties(EditDrawingViewModel.prototype, {
        /**
         * Gets the Command that is executed when the button is clicked.
         * @memberof DrawLinesViewModel.prototype
         *
         * @type {Command}
         */
        editCommand: {
            get: function () {
                return this._editCommand;
            }
        },
        isPanelToolVisibleEdit: {
            set: function (value) {
                this._isPanelToolVisibleEdit = value;
            }
        },
        subMenu: {
            get: function () {
                return this._subMenu;
            }
        },
    });

    return EditDrawingViewModel;
});
