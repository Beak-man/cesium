/*global define*/
define([
        '../../../../Core/Color',
        '../../../../Core/defineProperties',
        '../../../../ThirdParty/knockout',
        '../../../createCommand'
    ], function(
        Color,
        defineProperties,
        knockout,
        createCommand) {
    'use strict';

    function  pickColor(that, color) {

        var colorStringTab = color.split(',');
        var RStringTab = colorStringTab[0];
        var RSplit = RStringTab.split('(');

        var R = parseInt(RSplit[1]);
        var G = parseInt(colorStringTab[1]);
        var B = parseInt(colorStringTab[2]);

        var RN = parseInt(RSplit[1]) / 255;
        var GN = parseInt(colorStringTab[1]) / 255;
        var BN = parseInt(colorStringTab[2]) / 255;

        var RInt = parseInt(RSplit[1]);
        var GInt = parseInt(colorStringTab[1]);
        var BInt = parseInt(colorStringTab[2]);

        that._colorProperty = 'R' + RInt + 'G' + GInt + 'B' + BInt;

        console.log('picked color : ' + that._colorProperty);

        that._selectedColor = {
            red: R,
            green: G,
            blue: B,
            alpha: 1.0
        };

        that._colorObjectN = new Color(RN, GN, BN, 0.5);
    }

    /**
     * The view model for {@link Table of the ColorLegendPicker}.
     * @alias TableViewModel
     * @constructor
     */
    var TableViewModel = function (mainViewModel, viewer) {

        this._mainViewModel = mainViewModel;
        this._viewer = viewer;

        var that = this;

        this._pickSelectColorCommand = createCommand(function (color) {
            pickColor(that, color);
        });

        this._saveLegendCommand = createCommand(function (blob, filename) {
            console.log('save legend');
        });

        this._loadLegendCommand = createCommand(function (data, event) {
            console.log('load legend');
            console.log(data);
            console.log(event);
        });

        // knockout.track(this, ['']);
    };

    defineProperties(TableViewModel.prototype, {
        /**
         * Gets the Command that is executed when the button is clicked.
         * @memberof TableViewModel.prototype
         *
         * @type {Command}
         */

        pickSelectColorCommand: {
            get: function () {
                return this._pickSelectColorCommand;
            }
        },

        saveLegendCommand: {
            get: function () {
                return this._saveLegendCommand;
            }
        },

        loadLegendCommand: {
            get: function () {
                return this._loadLegendCommand;
            }
        },

        selectedColor: {
            get: function () {

                if (this._selectedColor){

                  var colorPropertyString = 'R' + this._selectedColor.red + 'G' + this._selectedColor.green + 'B' + this._selectedColor.blue;
                  var colorProperty = this._viewer.colorAssignation[colorPropertyString];

                  var returnObject = {
                    color: this._selectedColor,
                    normalizedColor: this._colorObjectN,
                    property: colorProperty
                  };
                  return returnObject;
                }
                return null;
            }
        }
    });

    return TableViewModel;
});
