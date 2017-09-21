/*global define*/
define([
        './PanelViewModel',
        '../../Core/defineProperties',
        '../../ThirdParty/knockout',
        '../getElement',
        './CustomObjectViewModel'
    ], function(
        PanelViewModel,
        defineProperties,
        knockout,
        getElement,
        CustomObjectViewModel) {
            'use strict';

            function createPanel(jsonData, solarSystem, viewerContainer, customToolbar, viewer, that) {

                var container = getElement(customToolbar);

                // creation de la liste pour afficher les diff�rentes configurations
                var selectElement = document.createElement('SELECT');
                selectElement.className = 'cesium-customObject-select';
                selectElement.style.cssText = 'text-align : center; font-family : Arial';
                selectElement.setAttribute('data-bind', 'options: availableObjects, optionsText : "objectName", value: selectedObject, optionsCaption: "Select a custom object"');
                container.appendChild(selectElement);

                // premier element de la liste
               /* var option = document.createElement('option');
                option.value = 0;
                option.text = '------------------------';
                selectElement.appendChild(option);*/

                // creation du bouton custom pour activer la fonctionnalit� 
                var btnElement = document.createElement('div');
                btnElement.className = 'cesium-planetsToolbar-button cesium-button-planet';
                btnElement.innerHTML = 'Custom';
                btnElement.style.cssText = 'text-align : center; font-family : Arial';
                btnElement.setAttribute('data-bind', 'attr: { title: "Create or load a custom object" }, click: customCommand');
                container.appendChild(btnElement);

                // creation du panneau pour l'affichage des param�tres : containr principal
                var configContainer = document.createElement('div');
                configContainer.className = 'cesium-customObject-configContainer';
                viewerContainer.appendChild(configContainer);

                // container qui contient tous les containers de parametres (ellipsoidParameter et textureParameters)
                var parametersContainer = document.createElement('div');
                parametersContainer.className = 'cesium-customObject-listContainer';
                configContainer.appendChild(parametersContainer);

                var configContainerTitle = document.createElement('div');
                configContainerTitle.className = 'cesium-customObject-configContainer-title';
                configContainerTitle.innerHTML = 'Custom ellispoid factory';
                parametersContainer.appendChild(configContainerTitle);

                /* ============================================================= 
                 * ================== Ellipsoid parameters =====================
                 * ============================================================= */

                var ellipsoidParametersContainer = document.createElement('div');
                ellipsoidParametersContainer.className = 'cesium-customObject-ellipsoidParameters';
                parametersContainer.appendChild(ellipsoidParametersContainer);

                var FieldSetEllipsParameters = document.createElement('fieldset');
                ellipsoidParametersContainer.appendChild(FieldSetEllipsParameters);

                var FieldSetLegend = document.createElement('legend');
                FieldSetLegend.innerHTML = 'Ellipsoid axis';
                FieldSetEllipsParameters.appendChild(FieldSetLegend);

                var tableParameters = document.createElement('table');
                FieldSetEllipsParameters.appendChild(tableParameters);

                // ======================= FIRST Line ==========================

                var tableLine1 = document.createElement('TR');
                tableParameters.appendChild(tableLine1);

                var colomn1Line1 = document.createElement('TD');
                colomn1Line1.innerHTML = 'X axis (in m) : ';
                tableLine1.appendChild(colomn1Line1);

                var inputXparameter = document.createElement('input');
                inputXparameter.type = 'text';
                inputXparameter.name = 'x';
                inputXparameter.value = 1000000.0;

                var colomn2Line1 = document.createElement('TD');
                colomn2Line1.appendChild(inputXparameter);
                tableLine1.appendChild(colomn2Line1);

                // ======================= SECOND Line ==========================

                var tableLine2 = document.createElement('TR');
                tableParameters.appendChild(tableLine2);

                var colomn1Line2 = document.createElement('TD');
                colomn1Line2.innerHTML = 'Y axis (in m) : ';
                tableLine2.appendChild(colomn1Line2);

                var inputYparameter = document.createElement('input');
                inputYparameter.type = 'text';
                inputYparameter.name = 'y';
                inputYparameter.value = 1000000.0;

                var colomn2Line2 = document.createElement('TD');
                colomn2Line2.appendChild(inputYparameter);
                tableLine2.appendChild(colomn2Line2);

                // ======================== THIRD Line ==========================

                var tableLine3 = document.createElement('TR');
                tableParameters.appendChild(tableLine3);

                var colomn1Line3 = document.createElement('TD');
                colomn1Line3.innerHTML = 'Z axis (in m) : ';
                tableLine3.appendChild(colomn1Line3);

                var inputZparameter = document.createElement('input');
                inputZparameter.type = 'text';
                inputZparameter.name = 'z';
                inputZparameter.value = 1000000.0;

                var colomn2Line3 = document.createElement('TD');
                colomn2Line3.appendChild(inputZparameter);
                tableLine3.appendChild(colomn2Line3);

                // ======================== LAST Line ==========================

                var tableLine4 = document.createElement('TR');
                tableParameters.appendChild(tableLine4);

                var colomn1Line4 = document.createElement('TD');
                colomn1Line4.innerHTML = ' ';
                tableLine4.appendChild(colomn1Line4);

                var validationBtn = document.createElement('BUTTON');
                validationBtn.innerHTML = 'Validate';
                validationBtn.setAttribute('data-bind', 'attr: { title: "Create object" }, click: validateCommand');

                var colomn2Line4 = document.createElement('TD');
                colomn2Line4.appendChild(validationBtn);
                tableLine4.appendChild(colomn2Line4);

                /* ============================================================== 
                 * ==================== Ellipsoid Textures ======================
                 * ============================================================== */

                var ellipsoidTextureContainer = document.createElement('div');
                ellipsoidTextureContainer.className = 'cesium-customObject-ellipsoidTexture';
                parametersContainer.appendChild(ellipsoidTextureContainer);

                var FieldSetTexture = document.createElement('fieldset');
                ellipsoidTextureContainer.appendChild(FieldSetTexture);

                var FieldSetLegendTexture = document.createElement('legend');
                FieldSetLegendTexture.innerHTML = 'Texture selection';
                FieldSetTexture.appendChild(FieldSetLegendTexture);

                var tableTexture = document.createElement('table');
                FieldSetTexture.appendChild(tableTexture);

                // ======================= FIRST Line ==========================

                var tableTextureLine1 = document.createElement('TR');
                tableTexture.appendChild(tableTextureLine1);

                var colomn1Line1Texture = document.createElement('TD');
                colomn1Line1Texture.innerHTML = 'WMS server : ';
                tableTextureLine1.appendChild(colomn1Line1Texture);

                var selectElementServerTexture = document.createElement('SELECT');
                selectElementServerTexture.className = 'cesium-customObject-select';
                selectElementServerTexture.style.cssText = 'text-align : center; font-family : Arial';
                selectElementServerTexture.setAttribute('data-bind', 'options: availableServers, optionsText : "name", value: selectedServer, optionsCaption: "Select a server"');

                var colomn2Line1Texture = document.createElement('TD');
                colomn2Line1Texture.appendChild(selectElementServerTexture);
                tableTextureLine1.appendChild(colomn2Line1Texture);


                // ======================= SECOND Line ==========================

                var tableTextureLine2 = document.createElement('TR');
                tableTexture.appendChild(tableTextureLine2);

                var colomn1Line2Texture = document.createElement('TD');
                colomn1Line2Texture.innerHTML = 'Planet and satellite : ';
                tableTextureLine2.appendChild(colomn1Line2Texture);

                var selectElementPlanetTexture = document.createElement('SELECT');
                selectElementPlanetTexture.className = 'cesium-customObject-select';
                selectElementPlanetTexture.style.cssText = 'text-align : center; font-family : Arial';
                selectElementPlanetTexture.setAttribute('data-bind', 'options: availablePlanets, value: selectedPlanet, optionsCaption: "Select a planet"');

                var selectElementSatelliteTexture = document.createElement('SELECT');
                selectElementSatelliteTexture.className = 'cesium-customObject-select';
                selectElementSatelliteTexture.style.cssText = 'text-align : center; font-family : Arial;  visibility: hidden;';
                selectElementSatelliteTexture.setAttribute('data-bind', 'options: availableSatellites, value: selectedSatellite, optionsCaption: "Select a satellite"');

                var colomn2Line2Texture = document.createElement('TD');
                colomn2Line2Texture.appendChild(selectElementPlanetTexture);
                colomn2Line2Texture.appendChild(selectElementSatelliteTexture);
                tableTextureLine2.appendChild(colomn2Line2Texture);

                 // ======================= SECOND Line ==========================

                var tableTextureLine3 = document.createElement('TR');
                tableTexture.appendChild(tableTextureLine3);

                var colomn1Line3Texture = document.createElement('TD');
                colomn1Line3Texture.innerHTML = 'Available layers : ';
                tableTextureLine3.appendChild(colomn1Line3Texture);

                var selectElementLayers = document.createElement('SELECT');
                selectElementLayers.className = 'cesium-customObject-select';
                selectElementLayers.style.cssText = 'text-align : center; font-family : Arial';
                selectElementLayers.setAttribute('data-bind', 'options: availableLayers, optionsText : "layerName", value: selectedLayer, optionsCaption: "Select a layer"');

                var addLayerBtn = document.createElement('BUTTON');
                addLayerBtn.innerHTML = 'add layer';
                addLayerBtn.style.visibility = 'visible';
                addLayerBtn.setAttribute('data-bind', 'attr: { title: "Create object" }, click: addLayerCommand');

                var colomn2Line3Texture = document.createElement('TD');
                colomn2Line3Texture.appendChild(selectElementLayers);
                 colomn2Line3Texture.appendChild(addLayerBtn);
                tableTextureLine3.appendChild(colomn2Line3Texture);

                // ======================== LAST Line ==========================

                var tableLineLAST = document.createElement('TR');
                tableTexture.appendChild(tableLineLAST);

                var colomn1LineLAST = document.createElement('TD');
                colomn1LineLAST.innerHTML = ' ';
                tableLineLAST.appendChild(colomn1LineLAST);

                var validationTextureBtn = document.createElement('BUTTON');
                validationTextureBtn.innerHTML = 'Validate configuration';
                validationTextureBtn.setAttribute('data-bind', 'attr: { title: "Create object" }, click: validateTextureCommand');

                var colomn2LineLAST = document.createElement('TD');
                colomn2LineLAST.appendChild(validationTextureBtn);
                tableLineLAST.appendChild(colomn2LineLAST);

                /* ============================================================= 
                 * ======================== Layer added ========================
                 * ============================================================= */

                var layerInformationContainer = document.createElement('div');
                layerInformationContainer.className = 'cesium-customObject-infosLayer';
                parametersContainer.appendChild(layerInformationContainer);

                var FieldSetLayerInfo = document.createElement('fieldset');
                layerInformationContainer.appendChild(FieldSetLayerInfo);

                var FieldSetLegendLayerInfo = document.createElement('legend');
                FieldSetLegendLayerInfo.innerHTML = 'Layer added';
                FieldSetLayerInfo.appendChild(FieldSetLegendLayerInfo);

                var tableLayerInfo = document.createElement('table');
                tableLayerInfo.className = 'cesium-customObject-infosLayer-table';
                FieldSetLayerInfo.appendChild(tableLayerInfo);

                var tableLineLayerInfo = document.createElement('TR');
                tableLayerInfo.appendChild(tableLineLayerInfo);
                tableLayerInfo.setAttribute('data-bind', 'foreach: addedLayerObject');

                var colomn1Line1LayerInfo = document.createElement('TD');
                colomn1Line1LayerInfo.setAttribute('data-bind','text:serverName');
                tableLineLayerInfo.appendChild(colomn1Line1LayerInfo);

                var colomn2Line1LayerInfo = document.createElement('TD');
                colomn2Line1LayerInfo.setAttribute('data-bind','text:object');
                tableLineLayerInfo.appendChild(colomn2Line1LayerInfo);

                var colomn3Line1LayerInfo = document.createElement('TD');
                colomn3Line1LayerInfo.setAttribute('data-bind','text:layerName');
                tableLineLayerInfo.appendChild(colomn3Line1LayerInfo);

                var colomn4Line1LayerInfo = document.createElement('TD');
                tableLineLayerInfo.appendChild(colomn4Line1LayerInfo);

                var removeLayerBtn = document.createElement('BUTTON');
                removeLayerBtn.innerHTML = 'Remove';
                removeLayerBtn.setAttribute('data-bind', 'click: $parent.removeLayerCommand');
                colomn4Line1LayerInfo.appendChild(removeLayerBtn);


                /* ============================================================= 
                 * ================== Load configuration file ==================
                 * ============================================================= */

                var loadConfigContainer = document.createElement('div');
                loadConfigContainer.className = 'cesium-customObject-configFile';
                parametersContainer.appendChild(loadConfigContainer);

                var FieldSetLoadFile = document.createElement('fieldset');
                loadConfigContainer.appendChild(FieldSetLoadFile);

                var FieldSetLegendLoadFile = document.createElement('legend');
                FieldSetLegendLoadFile.innerHTML = 'Load configuration file';
                FieldSetLoadFile.appendChild(FieldSetLegendLoadFile);

                var loadBtn = document.createElement('BUTTON');
                loadBtn.innerHTML = 'Load';
                loadBtn.setAttribute('data-bind', 'attr: { title: "Load a config file" }, click: loadCommand');
                FieldSetLoadFile.appendChild(loadBtn);

                var inputloadFile = document.createElement('input');
                inputloadFile.type = 'text';
                inputloadFile.name = 'loadFile';
                FieldSetLoadFile.appendChild(inputloadFile);

                /* ============================================================= 
                 * ==================== Buttons container ======================
                 * ============================================================= */

                var btnContainer = document.createElement('div');
                btnContainer.className = 'cesium-customObject-btnContainer';
                configContainer.appendChild(btnContainer);

                var elementsForAxis = {
                    x: inputXparameter,
                    y: inputYparameter,
                    z: inputZparameter
                };

                // creation du model pour cette vue (i.e CustomObject)
                var viewModel = new CustomObjectViewModel(configContainer, ellipsoidParametersContainer, ellipsoidTextureContainer, layerInformationContainer, loadConfigContainer, viewer);
                that._viewModel = viewModel;

                var panelViewModel = new PanelViewModel(jsonData, solarSystem, elementsForAxis, selectElementSatelliteTexture, tableLayerInfo, viewer);
                that._panelViewModel = panelViewModel;

                // application du binding pour attacher le model � la vue
                knockout.applyBindings(viewModel, container);
                knockout.applyBindings(panelViewModel, configContainer);

            }

            function getServerData(xhr, xhrPlanetarSystem, method, urlServer, urlPlanetarySystem, async, viewerContainer, customToolbar, viewer, that) {

                xhr.open(method, urlServer, async);
                xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                xhr.send();
                xhr.onreadystatechange = function () {

                    if (xhr.readyState === 4 && xhr.status === 200 || xhr.status === 0) {

                        var data = xhr.responseText;
                        var jsonData = JSON.parse(data);


                        xhrPlanetarSystem.open(method, urlPlanetarySystem, async);
                        xhrPlanetarSystem.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                        xhrPlanetarSystem.send();
                        xhrPlanetarSystem.onreadystatechange = function () {

                            if (xhrPlanetarSystem.readyState === 4 && xhrPlanetarSystem.status === 200 || xhrPlanetarSystem.status === 0) {

                                var data = xhrPlanetarSystem.responseText;
                                var jsonDataPlanets = JSON.parse(data);
                                var solarSystem = jsonDataPlanets.solarSystem;

                                createPanel(jsonData, solarSystem, viewerContainer, customToolbar, viewer, that);
                            }
                        };
                    }
                };
            }

            function getXMLHttpRequest() {
                var xhr;
                if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
                    xhr = new XMLHttpRequest();
                } else if (typeof ActiveXObject !== 'undefined') {
                    xhr = new ActiveXObject('Microsoft.XMLHTTP'); // activeX pour IE
                } else {
                    console.log('AJAX is not available on this browser');
                    xhr = null;
                }
                return xhr;
            }

            var CustomObject = function (viewerContainer, customToolbar, viewer) {

                var that = this;
                var xhr = getXMLHttpRequest();
                var xhrPlanetarySystem = getXMLHttpRequest();
                var urlServer = '../../Source/Widgets/ConfigurationFiles/serverList.json';
                var urlPlanetarySystem = '../../Source/Widgets/ConfigurationFiles/SolarSystemConfig.json';

                getServerData(xhr, xhrPlanetarySystem, 'GET', urlServer, urlPlanetarySystem, true, viewerContainer, customToolbar, viewer, that);
            };

            defineProperties(CustomObject.prototype, {
                /**
                 * Gets the container.
                 * @memberof LngLat.prototype
                 *
                 * @type {Element}
                 */
                container: {
                    get: function () {
                        return this._container;
                    }
                },
                /**
                 * Gets the view model.
                 * @memberof CustomObject.prototype
                 *
                 * @type {CustomObjectViewModel}
                 */
                viewModel: {
                    get: function () {
                        return this._viewModel;
                    }
                },
                panelViewModel: {
                    get: function () {
                        return this._panelViewModel;
                    }
                }
            });

            return CustomObject;
        });
