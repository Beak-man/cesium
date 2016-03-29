/*global define*/
define([
    '../createCommand',
    '../../Core/defined',
    '../../Core/defineProperties',
    '../../Core/ScreenSpaceEventHandler',
    '../../Core/ScreenSpaceEventType',
    '../../ThirdParty/knockout',
], function (
        createCommand,
        defined,
        defineProperties,
        ScreenSpaceEventHandler,
        ScreenSpaceEventType,
        knockout
        ) {
    "use strict";

    function  Initialize(that) {

        var dataSources = that._viewer.dataSources;

        for (var i = 0; i < dataSources.length; i++) {
            var dataSource = dataSources._dataSources[i];
            var entities = dataSource._entityCollection._entities._array;

            for (var j = 0; j < entities.length; j++) {
                var entity = entities[j];
                if (entity.ellipse && entity.point) {
                    entity.point.show = that._switchBoolean;
                    entity.ellipse.show = !that._switchBoolean;
                }

            }

        }

        that._switchBoolean = !that._switchBoolean;

    }

    /**
     * The view model for {@link DrawLines}.
     * @alias EditDrawingViewModel
     * @constructor
     */
    var PointCircleSwitchViewModel = function (IconsContainer, wrapperPanel, viewerContainer, viewer) {

        this._IconsContainer = IconsContainer;
        this._wrapperPanel = wrapperPanel;
        this._viewer = viewer;
        this._isPanelToolVisibleSwitch = false;
        this._isSwitchActive = false;
        this._viewerContainer = viewerContainer;
        
        this._switchBoolean = false;

        var that = this;
        this._switchCommand = createCommand(function () {
            Initialize(that);
        });

        knockout.track(this, ['isPanelToolVisibleSwitch', 'isSwitchActive']);

    };
    defineProperties(PointCircleSwitchViewModel.prototype, {
        /**
         * Gets the Command that is executed when the button is clicked.
         * @memberof DrawLinesViewModel.prototype
         *
         * @type {Command}
         */
        switchCommand: {
            get: function () {
                return this._switchCommand;
            }
        },
        isPanelToolVisibleSwitch: {
            set: function (value) {
                this._isPanelToolVisibleSwitch = value;
            }
        },
        subMenu: {
            get: function () {
                return this._subMenu;
            }
        },
    });

    return PointCircleSwitchViewModel;
});
