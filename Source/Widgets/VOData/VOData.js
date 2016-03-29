/*global define*/
define([
    '../../Core/Color',
    '../../Core/defined',
    '../../Core/defineProperties',
    '../../Core/destroyObject',
    '../../Core/DeveloperError',
    '../../ThirdParty/knockout',
    '../getElement',
    './VODataViewModel'
], function (
        Color,
        defined,
        defineProperties,
        destroyObject,
        DeveloperError,
        knockout,
        getElement,
        VODataViewModel
        ) {
    "use strict";

    /**
     * A widget to show VO data.
     *
     * @alias VOData
     * @constructor
     *
     * @param {Element} container The DOM element that will contain the widget.
     * @param {Object} Viewer.
     * @param {String} PlanetName.
     * @exception {DeveloperError} Element with id "container" does not exist in the document.
     */
    var VOData = function (mainContainer, viewer, planetName) {

        var wrapperMenu = document.createElement('span');
        wrapperMenu.className = 'cesium-voData';
        mainContainer.appendChild(wrapperMenu);

        /* =====================================================================
         ======================= VO button in the Menu =========================
         ======================================================================= */

        var voDataButton = document.createElement('div');
        voDataButton.className = 'cesium-button cesium-toolbar-button cesium-voData-button';
        voDataButton.innerHTML = 'VO data';
        voDataButton.setAttribute('data-bind', 'attr  : { title: "Show VO data" }, event : {click : showPanelCommand}');
        wrapperMenu.appendChild(voDataButton);

        /* =====================================================================
         =========================== VO Panel ==================================
         ======================================================================= */

        var configContainer = document.createElement('div');
        configContainer.className = 'cesium-voData-configContainer';
        configContainer.style.left = document.documentElement.clientWidth + "px";
        mainContainer.appendChild(configContainer);

        var listContainer = document.createElement('div');
        listContainer.className = 'cesium-voData-listContainer';
        configContainer.appendChild(listContainer);

        var title = document.createElement('div');
        title.className = 'cesium-voData-configContainer-title';
        title.innerHTML = "VO paris-cdpp VVEX";
        configContainer.appendChild(title);
        
        /* ============================= TABLE ================================= */

        var tableCoord = document.createElement('TABLE');
        configContainer.appendChild(tableCoord);

        /* --------------------------- 1st LINE -------------------------------- */

        var tableLine1 = document.createElement('TR');
        tableCoord.appendChild(tableLine1);

        var colomn11 = document.createElement('TD');
        tableLine1.appendChild(colomn11);

        var labelCell11 = document.createElement('DIV');
        labelCell11.innerHTML = "Lng min : ";
        colomn11.appendChild(labelCell11);

        var colomn12 = document.createElement('TD');
        tableLine1.appendChild(colomn12);

        var lngMinInput = document.createElement('INPUT');
        lngMinInput.className = 'cesium-voData-input';
        colomn12.appendChild(lngMinInput);

        var colomn13 = document.createElement('TD');
        tableLine1.appendChild(colomn13);

        var labelCell13 = document.createElement('DIV');
        labelCell13.innerHTML = "Lng max : ";
        colomn13.appendChild(labelCell13);

        var colomn14 = document.createElement('TD');
        tableLine1.appendChild(colomn14);

        var lngMaxInput = document.createElement('INPUT');
        lngMaxInput.className = 'cesium-voData-input';
        colomn14.appendChild(lngMaxInput);

       /* --------------------------- 2nd LINE --------------------------------- */

        var tableLine2 = document.createElement('TR');
        tableCoord.appendChild(tableLine2);

        var colomn21 = document.createElement('TD');
        tableLine2.appendChild(colomn21);

        var labelCell21 = document.createElement('DIV');
        labelCell21.innerHTML = "Lat min :";
        colomn21.appendChild(labelCell21);

        var colomn22 = document.createElement('TD');
        tableLine2.appendChild(colomn22);

        var latMinInput = document.createElement('INPUT');
        latMinInput.className = 'cesium-voData-input';
        colomn22.appendChild(latMinInput);

        var colomn23 = document.createElement('TD');
        tableLine2.appendChild(colomn23);

        var labelCell23 = document.createElement('DIV');
        labelCell23.innerHTML = "Lat max :";
        colomn23.appendChild(labelCell23);

        var colomn24 = document.createElement('TD');
        tableLine2.appendChild(colomn24);

        var latMaxInput = document.createElement('INPUT');
        latMaxInput.className = 'cesium-voData-input';
        colomn24.appendChild(latMaxInput);

        /* ========================== BUTTONS ================================= */

        var btnContainer = document.createElement('div');
        btnContainer.className = 'cesium-voData-btnContainer';
        configContainer.appendChild(btnContainer);

        var sendQueryBtn = document.createElement('BUTTON');
        sendQueryBtn.className = 'cesium-voData-configContainer-button cesium-button-planet';
        sendQueryBtn.innerHTML = 'Send Query';
        sendQueryBtn.setAttribute('data-bind', 'click: getDataCommand');
        btnContainer.appendChild(sendQueryBtn);

        /*  var btnHide = document.createElement('BUTTON');
         btnHide.className = 'cesium-voData-configContainer-button cesium-button-planet';
         btnHide.innerHTML = 'Hide';
         btnHide.setAttribute('data-bind', 'click: hideCommand');
         btnContainer.appendChild(btnHide);*/

           var inputObjects = {
         lngMin : lngMinInput,
         lngMax : lngMaxInput,
         latMin : latMinInput,
         latMax : latMaxInput
         }


        var viewModel = new VODataViewModel(viewer, planetName, configContainer, listContainer, btnContainer, inputObjects);

        this._mainContainer = mainContainer;
        this._wrapperMenu = wrapperMenu;
        this._viewModel = viewModel;

        knockout.applyBindings(viewModel, wrapperMenu);
        knockout.applyBindings(viewModel, sendQueryBtn);
    };


      







    defineProperties(VOData.prototype, {
        /**
         * Gets the parent container.
         * @memberof VOData.prototype
         *
         * @type {Element}
         */
        container: {
            get: function () {
                return this._mainContainer;
            }
        },
        /**
         * Gets the view model.
         * @memberof SubMenu.prototype
         *
         * @type {SubMenuViewModel}
         */
        viewModel: {
            get: function () {
                return this._viewModel;
            }
        },
        destroyWrapperMenu: {
            get: function () {
                try {
                    knockout.cleanNode(this._wrapperMenu);
                    this._mainContainer.removeChild(this._wrapperMenu);
                    return true;
                } catch (e) {
                    return false;
                }
            }
        },
    });

    return VOData;
});