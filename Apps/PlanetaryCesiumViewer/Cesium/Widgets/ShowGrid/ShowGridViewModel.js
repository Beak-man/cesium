/*global define*/
define([
    '../createCommand',
    '../../Core/defineProperties',
    '../../ThirdParty/knockout',
    '../../Scene/GridImageryProvider'
], function (
        createCommand,
        defineProperties,
        knockout,
        GridImageryProvider
        ) {
    "use strict";
    
    function addAdditionalLayerOption(imageryLayers, name, imageryProvider, alpha, show) {
    var layer = imageryLayers.addImageryProvider(imageryProvider);
    layer.alpha = defaultValue(alpha, 0.5);
    layer.show = defaultValue(show, true);
    layer.name = name;
    knockout.track(layer, ['alpha', 'show', 'name']);
}
    
    

    function  InitializeDrawEdit(that, imageryLayers) {

        if (that._isShowGridActive) {
            
            console.log(that._viewer.scene.globe.ellipsoid);
            
            var imageryLayers = that._viewer.imageryLayers;
            var imageryProvider = GridImageryProvider();
            addAdditionalLayerOption(imageryLayers, that.name, imageryProvider,  that.alphaGrid,  that.showGrid);

            that._wrapperPanel.className = '';
            that._wrapperPanel.className = 'cesium-Tools-wrapperPanel-transition-hide';
            that._viewer.tools.viewModel._isPanelVisible = false;
            that._viewer.drawLines.viewModel.isPanelToolVisible = false;
            that._viewer.editDrawing.viewModel.isPanelToolVisibleEdit = false;
            that._viewer.showGrid.viewModel.isPanelToolVisibleGrid = false;

            console.log(that._viewer.showGrid.viewModel.isPanelToolVisibleGrid);

            try {
                that._viewer.drawLines.viewModel.subMenu.destroyWrapperMenu;
                that._viewer.drawLines.viewModel.subMenu.viewModel.removeAllCommands;
            } catch (e) {
            }

        }


    }

    /**
     * The view model for {@link DrawLines}.
     * @alias ShowGridViewModel
     * @constructor
     */
    var ShowGridViewModel = function (IconsContainer, wrapperPanel, viewer) {

        console.log("dans ShowGridViewModel");

        this._IconsContainer = IconsContainer;
        this._wrapperPanel = wrapperPanel;
        this._viewer = viewer;
        this._isShowGridActive = false;
        
      //  var imageryLayers = viewer.imageryLayers;
        
        this.name = 'grid';
        this.alphaGrid = 0.5;
        this.showGrid = true;
        var that = this;

        this._showGridCommand = createCommand(function () {
            that._isShowGridActive =  !that._isShowGridActive;
            InitializeDrawEdit(that);
        });

        knockout.track(this, ['isPanelToolVisibleGrid', 'isShowGridActive', 'showGrid', 'alphaGrid']);

    };
    defineProperties(ShowGridViewModel.prototype, {
        /**
         * Gets the Command that is executed when the button is clicked.
         * @memberof DrawLinesViewModel.prototype
         *
         * @type {Command}
         */
        showGridCommand: {
            get: function () {
                return this._showGridCommand;
            }
        },
        isPanelToolVisibleGrid: {
            set: function (value) {
                this._isPanelToolVisibleGrid = value;
            }
        },
        subMenu: {
            get: function () {
                return this._subMenu;
            }
        },
    });

    return ShowGridViewModel;
});
