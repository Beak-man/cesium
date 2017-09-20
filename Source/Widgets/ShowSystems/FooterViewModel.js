/* Structure de base des widgets en Cesium : il faut respecter cette structure */

/*global define*/
define([
        '../../Core/defineProperties',
        '../../ThirdParty/knockout',
        '../createCommand',
    ], function(
        defineProperties,
        knockout,
        createCommand) {
    'use strict';

    function showPanel(footerToolbar, configContainer, btnShowPanel) {

        configContainer.className = '';
        configContainer.className = 'cesium-showSystems-configContainer-transition';
        configContainer.style.opacity = 1;
        configContainer.style.left = '5px';

        footerToolbar.removeChild(btnShowPanel);
    }

    var FooterViewModel = function (footerToolbar, configContainer, btnShowPanel) {

        this._footerToolbar = footerToolbar;
        this._configContainer = configContainer;
        this._btnShowPanel = btnShowPanel;

        var that = this;

        this._testCommand = createCommand(function () {
            showPanel(that._footerToolbar, that._configContainer, that._btnShowPanel);
        });

        /** Gets or sets the tooltip.  This property is observable.
         *
         * @type {String}
         */

        //   knockout.track();
    };

    defineProperties(FooterViewModel.prototype, {
        /**
         * Gets the Command that is executed when the button is clicked.
         * @memberof FooterViewModel.prototype
         *
         * @type {Command}
         */
        testCommand: {
            get: function () {
                return this._testCommand;
           }
        },
    });

    return FooterViewModel;
});
