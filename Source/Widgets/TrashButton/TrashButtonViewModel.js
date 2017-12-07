define([
        '../../Core/defineProperties',
        '../../ThirdParty/knockout',
        '../createCommand'
    ], function(
        defineProperties,
        knockout,
        createCommand) {
    'use strict';

    /**
     * The view model for {@link TrashButton}.
     * @alias TrashButtonViewModel
     * @constructor
     */
    function TrashButtonViewModel(that) {
        /**
         * Gets or sets whether the trash are currently shown.  This property is observable.
         * @type {Boolean}
         * @default false
        */

        //var that = this;

        this._command = createCommand(function () {

            if (that.scene.primitives.length > 0) {

                try {
                    that._dataSourceCollection.removeAll();
                    that.scene.primitives.removeAll();
                    removeHandlers(that);
                    var collection = collectionsInitialization(that);
                    that.geoJsonData = null;
                } catch (e) {
                    //  console.log(e)
                }
            } else {
                try {
                    removeHandlers(that);
                    that.geoJsonData = null;
                } catch (e) {
                    //  console.log(e)
                }
            }

            try {
                that._linkDownload.parentElement.removeChild(that._linkDownload);
                that._wrapperSaveSubMenu.parentElement.removeChild(that._wrapperSaveSubMenu);
            } catch (e) {
                // console.log(e)
            }
        });
    }

    defineProperties(TrashButtonViewModel.prototype, {

        /**
         * Gets the Command that is executed when the button is clicked.
         * @memberof HomeButtonViewModel.prototype
         *
         * @type {Command}
         */
        command : {
            get : function() {
                return this._command;
            }
        },

    });

    return TrashButtonViewModel;
});
