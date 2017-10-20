/*global define*/
define([
        '../../Core/defineProperties',
        '../../ThirdParty/knockout',
        './VODataViewModel'
    ], function(
        defineProperties,
        knockout,
        VODataViewModel) {
    'use strict';

    /**
     * A widget to show VO data. Called from ShowSystemViewModel.js (main function)
     * Must be activated in the 'viewerOptions' object located in the PlanetaryCesiumViewer.js file
     * @alias VOData
     * @constructor
     *
     * @param {Element} container The DOM element that will contain the widget.
     * @param {Object} Viewer.
     * @param {String} PlanetName.
     * @exception {DeveloperError} Element with id 'container' does not exist in the document.
     */
    var VOData = function (mainContainer, viewer, configuration, planetName) {

        var wrapperMenu = document.createElement('span');
        wrapperMenu.className = 'cesium-voData';
        mainContainer.appendChild(wrapperMenu);

        /* =====================================================================
         ======================= VO button in the Menu =========================
         ======================================================================= */

        var icone = '<g><path d="M55.533,32.246c-13.001,0-23.541,10.54-23.541,23.54h47.081C79.073,42.785,68.534,32.246,55.533,32.246z"></path>\
                        <path d="M22.775,64.357c0,1.014,0.83,1.843,1.843,1.843h61.831c1.014,0,1.843-0.829,1.843-1.843v-2.762\
                                 c0-1.014-0.829-1.844-1.843-1.844H24.618c-1.013,0-1.843,0.83-1.843,1.844V64.357z"></path>\
                        <path d="M25.612,85.861c0,1.014,0.829,1.842,1.843,1.842h56.158c1.013,0,1.843-0.828,1.843-1.842V71.844\
                                 c0-1.014-0.83-1.844-1.843-1.844H27.455c-1.014,0-1.843,0.83-1.843,1.844V85.861z"></path>\
                        <path d="M79.685,38.122c-0.061-0.083,4.743-5.854,4.743-5.854c0.545-0.643,0.348-1.69-0.441-2.328l-8.576-6.938l0,0\
                                 c-0.789-0.637-1.893-0.596-2.455,0.092c-0.066,0.081-4.615,5.644-4.615,5.644c-3.883-1.842-8.224-2.874-12.807-2.874v2.867\
                                 c14.941,0,27.055,12.113,27.055,27.055h2.867C85.455,49.179,83.312,43.072,79.685,38.122z"></path>\
                        <path d="M83.27,33.652"></path>\
                       <polygon points="19.054,21.226 27.41,16.833 25.814,26.138 32.574,32.727 23.231,34.084 19.054,42.55 14.875,34.084 5.533,32.727 \
                                        12.293,26.138 10.697,16.833 "></polygon>\
                       <polygon points="40.873,21.314 46.336,24.187 45.292,18.104 49.712,13.795 43.604,12.908 40.873,7.373 38.142,12.908 32.033,13.795 \
                                        36.453,18.104 35.41,24.187 "></polygon></g>';

        var voDataButton = document.createElement('div');
        voDataButton.className = 'cesium-button cesium-toolbar-button cesium-voData-button';
        voDataButton.innerHTML = '<svg width="35" height="35" viewBox="0 0 100 100">' + icone + ' </svg>';
        voDataButton.setAttribute('data-bind', 'attr  : { title: "Show VO data" }, event : {click : showPanelCommand}');
        wrapperMenu.appendChild(voDataButton);

        /* =====================================================================
         =========================== VO Panel ==================================
         ======================================================================= */

        // ************************ main container ****************************

        var configContainer = document.createElement('div');
        configContainer.className = 'cesium-voData-configContainer';
        configContainer.style.left = document.documentElement.clientWidth + 'px';
        mainContainer.appendChild(configContainer);

        // ************************ Title panel ********************************

        var title = document.createElement('div');
        title.className = 'cesium-voData-configContainer-title';
        title.innerHTML = 'VO data panel';
        configContainer.appendChild(title);

        // ************************ Servers Panel ******************************

        var listServer = document.createElement('div');
        listServer.className = 'cesium-voData-listServers';
        configContainer.appendChild(listServer);

        var fieldsetServers = document.createElement('FIELDSET');
        fieldsetServers.classeName = 'cesium-voData-fieldsetServers';
        listServer.appendChild(fieldsetServers);

        var listServersInField = document.createElement('div');
        listServersInField.className = 'cesium-voData-listServersInField';
        fieldsetServers.appendChild(listServersInField);

        var server = configuration.servers.VOServers[planetName.toLowerCase()];

        var listDescription = document.createElement('DL');
        listDescription.classeName = 'cesium-voData-listDescription';
        listServersInField.appendChild(listDescription);

        var inputTab = [];
        var numberOfFilesToRequestPerServer = [];
        var tableLine1;
        var colomn11;
        var colomn12;
        var listContainer;
        var lngMinInput;
        var lngMaxInput;
        var latMinInput;
        var latMaxInput;
        var btnContainer;
        var resultContainer;

        if (server) {

            for (var i = 0; i < server.length; i++) {

                var serverI = server[i];

                // console.log(serverI);

                var extension = serverI.extension;
                numberOfFilesToRequestPerServer.push(extension.length);

                var listDT = document.createElement('DT');
                listDT.innerHTML = serverI.name;
                listDescription.appendChild(listDT);

                for (var j = 0; j < extension.length; j++) {

                    //  console.log(i, j);

                    var listDD = document.createElement('DD');
                    listDescription.appendChild(listDD);

                    var tableServer = document.createElement('TABLE');
                    listDD.appendChild(tableServer);

                    tableLine1 = document.createElement('TR');
                    tableServer.appendChild(tableLine1);

                    colomn11 = document.createElement('TD');
                    tableLine1.appendChild(colomn11);

                    colomn12 = document.createElement('TD');
                    tableLine1.appendChild(colomn12);

                    var tab = extension[j].split('.');

                    var inputCheck = document.createElement('INPUT');
                    inputCheck.type = 'checkbox';
                    inputCheck.extension = extension[j];
                    inputCheck.serverUrl = serverI.url;
                    inputCheck.setAttribute('data-bind', 'attr: { title:"' + extension[j] + '"},checked : showData_' + i + '_' + j);
                    colomn11.appendChild(inputCheck);

                    inputTab.push(inputCheck);

                    colomn12.appendChild(document.createTextNode(tab[0]));
                }
            }

            var legend = document.createElement('LEGEND');
            legend.innerHTML = 'Server list';
            fieldsetServers.appendChild(legend);

            listContainer = document.createElement('div');
            listContainer.className = 'cesium-voData-listContainer';
            configContainer.appendChild(listContainer);

        } else {

            server = [];

            var infosServers = document.createElement('div');
            infosServers.className = 'cesium-voData-infosServers'; // hide what is biehind it
            infosServers.innerHTML = 'no VO server available';
            listServersInField.appendChild(infosServers);

        }

        // ************************ Request panel ******************************

       /* listContainer = document.createElement('div');
        listContainer.className = 'cesium-voData-listContainer';
        configContainer.appendChild(listContainer);*/

        if(listContainer){


        var fieldsetRequest = document.createElement('FIELDSET');
        listContainer.appendChild(fieldsetRequest);


        var legendRequest = document.createElement('LEGEND');
        legendRequest.innerHTML = 'Request parameters';
        fieldsetRequest.appendChild(legendRequest);

        /* ============================= TABLE ================================= */

        var tableCoord = document.createElement('TABLE');
        tableCoord.className = 'cesium-voData-tableCoord';
        fieldsetRequest.appendChild(tableCoord);

        /* --------------------------- 1st LINE -------------------------------- */

        tableLine1 = document.createElement('TR');
        tableCoord.appendChild(tableLine1);

        colomn11 = document.createElement('TD');
        tableLine1.appendChild(colomn11);

        var labelCell11 = document.createElement('DIV');
        labelCell11.innerHTML = '&Phi; min : ';
        colomn11.appendChild(labelCell11);

        colomn12 = document.createElement('TD');
        tableLine1.appendChild(colomn12);

        lngMinInput = document.createElement('INPUT');
        lngMinInput.className = 'cesium-voData-input';
        lngMinInput.name = 'Lng min';
        lngMinInput.value = '0';  // A COMMENTER
        colomn12.appendChild(lngMinInput);

        var colomn13 = document.createElement('TD');
        tableLine1.appendChild(colomn13);

        var labelCell13 = document.createElement('DIV');
        labelCell13.innerHTML = '&Phi; max : ';
        colomn13.appendChild(labelCell13);

        var colomn14 = document.createElement('TD');
        tableLine1.appendChild(colomn14);

        lngMaxInput = document.createElement('INPUT');
        lngMaxInput.className = 'cesium-voData-input';
        lngMaxInput.name = 'Lng max';
        lngMaxInput.value = '0'; // A COMMENTER
        colomn14.appendChild(lngMaxInput);

        /* --------------------------- 2nd LINE --------------------------------- */

        var tableLine2 = document.createElement('TR');
        tableCoord.appendChild(tableLine2);

        var colomn21 = document.createElement('TD');
        tableLine2.appendChild(colomn21);

        var labelCell21 = document.createElement('DIV');
        labelCell21.innerHTML = '&theta; min :';
        colomn21.appendChild(labelCell21);

        var colomn22 = document.createElement('TD');
        tableLine2.appendChild(colomn22);

        latMinInput = document.createElement('INPUT');
        latMinInput.className = 'cesium-voData-input';
        latMinInput.name = 'Lat min';
        latMinInput.value = '0'; // A COMMENTER
        colomn22.appendChild(latMinInput);

        var colomn23 = document.createElement('TD');
        tableLine2.appendChild(colomn23);

        var labelCell23 = document.createElement('DIV');
        labelCell23.innerHTML = '&theta; max :';
        colomn23.appendChild(labelCell23);

        var colomn24 = document.createElement('TD');
        tableLine2.appendChild(colomn24);

        latMaxInput = document.createElement('INPUT');
        latMaxInput.className = 'cesium-voData-input';
        latMaxInput.name = 'Lat max';
        latMaxInput.value = '0'; // A COMMENTER
        colomn24.appendChild(latMaxInput);

        /* ========================== BUTTONS ================================= */

        btnContainer = document.createElement('div');
        btnContainer.className = 'cesium-voData-btnContainer';
        fieldsetRequest.appendChild(btnContainer);

        var sendQueryBtn = document.createElement('BUTTON');
        sendQueryBtn.className = 'cesium-voData-configContainer-button cesium-button-planet';
        sendQueryBtn.innerHTML = 'Send Query';
        sendQueryBtn.setAttribute('data-bind', 'click: getDataCommand');
        btnContainer.appendChild(sendQueryBtn);

        /* ========================== BUTTONS ================================= */

        resultContainer = document.createElement('div');
        resultContainer.className = 'cesium-voData-resultContainer';
        configContainer.appendChild(resultContainer);
    }


        var inputObjects = {
            lngMin: lngMinInput,
            lngMax: lngMaxInput,
            latMin: latMinInput,
            latMax: latMaxInput
        };

        var viewModel = new VODataViewModel(viewer, planetName, configContainer, listContainer, btnContainer, resultContainer, inputObjects, server.length, numberOfFilesToRequestPerServer, inputTab);

        this._mainContainer = mainContainer;
        this._wrapperMenu = wrapperMenu;
        this._viewModel = viewModel;

        knockout.applyBindings(viewModel, wrapperMenu);
        knockout.applyBindings(viewModel, configContainer);
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
        }
    });

    return VOData;
});
