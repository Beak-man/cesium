/*global define*/
define([
    '../createCommand',
    '../../Core/defined',
    '../../Core/defineProperties',
    '../../Core/ScreenSpaceEventHandler',
    '../../Core/ScreenSpaceEventType',
    '../../ThirdParty/knockout'
], function (
        createCommand,
        defined,
        defineProperties,
        ScreenSpaceEventHandler,
        ScreenSpaceEventType,
        knockout
        ) {
    "use strict";

    function showPanel(that, configContainer) {


        if (!that._isVOPanelActive) {

            configContainer.className = 'cesium-voData-configContainer cesium-voData-configContainer-transition';
            var leftPositionStr = configContainer.style.left;
            var leftPositionStrTab = leftPositionStr.split("p");
            var leftPosition = parseInt(leftPositionStrTab);

            var panelMove = leftPosition - 400 + "px";
            configContainer.style.left = panelMove;
            configContainer.style.opacity = "1";

            that._isVOPanelActive = true;
            
        } else if (that._isVOPanelActive) {
            
            configContainer.className = 'cesium-voData-configContainer cesium-voData-configContainer-transition';
            var leftPositionStr = configContainer.style.left;
            var leftPositionStrTab = leftPositionStr.split("p");
            var leftPosition = parseInt(leftPositionStrTab);

            var panelMove = leftPosition + 400 + "px";
            configContainer.style.left = panelMove;
            configContainer.style.opacity = "0";

            that._isVOPanelActive = false;
        }
    }

    function getVOData(planetName) {
        console.log(planetName);
    }

    /**
     * The view model for {@link DrawLines}.
     * @alias EditDrawingViewModel
     * @constructor
     */
    var VODataViewModel = function (viewer, planetName, configContainer, listContainer, btnContainer) {

        this._viewer = viewer;
        this._planetName = planetName;
        this._configContainer = configContainer;
        this._listContainer = listContainer;
        this._btnContainer = btnContainer;

        this._isVOPanelActive = false;

        var that = this;

        this._showPanelCommand = createCommand(function () {
            showPanel(that, that._configContainer);
        });

        this._getDataCommand = createCommand(function () {
            getVOData(that._planetName);
        });

        //  knockout.track(this, []);

    };
    defineProperties(VODataViewModel.prototype, {
        /**
         * Gets the Command that is executed when the button is clicked.
         * @memberof VODataViewModel.prototype
         *
         * @type {Command}
         */
        getDataCommand: {
            get: function () {
                return this._getDataCommand;
            }
        },
        showPanelCommand: {
            get: function () {
                return this._showPanelCommand;
            }
        },
        isVOPanelActive: {
            get: function () {
                return this._isVOPanelActive;
            }
        },
    });

    return VODataViewModel;
});
