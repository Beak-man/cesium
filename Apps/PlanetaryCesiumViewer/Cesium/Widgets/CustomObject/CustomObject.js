/*global define*/
define([
    '../../Core/defineProperties',
    './CustomObjectViewModel',
    '../getElement',
    '../../ThirdParty/knockout',
    "./PanelViewModel"],
        function (
                defineProperties,
                CustomObjectViewModel,
                getElement,
                knockout,
                PanelViewModel) {
            "use strict";

            var CustomObject = function (viewerContainer, customToolbar, viewer) {

                var container = getElement(customToolbar);

                // creation de la liste pour afficher les différentes configurations
                var selectElement = document.createElement('SELECT');
                selectElement.className = 'cesium-customObject-select';
                selectElement.style.cssText = 'text-align : center; font-family : Arial';
                container.appendChild(selectElement);

                // premier element de la liste
                var option = document.createElement("option");
                option.value = 0;
                option.text = "------------------------";
                selectElement.appendChild(option);

                // creation du bouton custom pour activer la fonctionnalité 
                var btnElement = document.createElement('div');
                btnElement.className = 'cesium-planetsToolbar-button cesium-button-planet';
                btnElement.innerHTML = 'Custom';
                btnElement.style.cssText = 'text-align : center; font-family : Arial';
                btnElement.setAttribute('data-bind', 'attr: { title: "Create or load a custom object" }, click: customCommand');
                container.appendChild(btnElement);

                // creation du panneau pour l'affichage des paramètres
                var configContainer = document.createElement('div');
                configContainer.className = 'cesium-customObject-configContainer';
                viewerContainer.appendChild(configContainer);

                var parametersContainer = document.createElement('div');
                parametersContainer.className = 'cesium-customObject-listContainer';
                configContainer.appendChild(parametersContainer);

                var ellipsoidParametersContainer = document.createElement('div');
                ellipsoidParametersContainer.className = 'cesium-customObject-ellipsoidParameters';
                parametersContainer.appendChild(ellipsoidParametersContainer);


                var FieldSetEllipsParameters = document.createElement('fieldset');
                ellipsoidParametersContainer.appendChild(FieldSetEllipsParameters)

                var FieldSetLegend = document.createElement('legend');
                FieldSetLegend.innerHTML = "Ellipsoid parameters";
                FieldSetEllipsParameters.appendChild(FieldSetLegend);



                var tableParameters = document.createElement('table');
                FieldSetEllipsParameters.appendChild(tableParameters)


                // ======================= FIRST Line ==========================

                var tableLine1 = document.createElement('TR');
                tableParameters.appendChild(tableLine1);

                var colomn1Line1 = document.createElement('TD');
                colomn1Line1.innerHTML = "X axis (in m) : ";
                tableLine1.appendChild(colomn1Line1);

                var inputXparameter = document.createElement('input');
                inputXparameter.type = 'text';
                inputXparameter.value = 0;

                var colomn2Line1 = document.createElement('TD');
                colomn2Line1.appendChild(inputXparameter);
                tableLine1.appendChild(colomn2Line1);

                // ======================= SECOND Line ==========================

                var tableLine2 = document.createElement('TR');
                tableParameters.appendChild(tableLine2);

                var colomn1Line2 = document.createElement('TD');
                colomn1Line2.innerHTML = "Y axis (in m) : ";
                tableLine2.appendChild(colomn1Line2);

                var inputYparameter = document.createElement('input');
                inputYparameter.type = 'text';
                inputYparameter.value = 0;

                var colomn2Line2 = document.createElement('TD');
                colomn2Line2.appendChild(inputYparameter);
                tableLine2.appendChild(colomn2Line2);

                // ======================== THIRD Line ==========================

                var tableLine3 = document.createElement('TR');
                tableParameters.appendChild(tableLine3);

                var colomn1Line3 = document.createElement('TD');
                colomn1Line3.innerHTML = "Z axis (in m) : ";
                tableLine3.appendChild(colomn1Line3);

                var inputZparameter = document.createElement('input');
                inputZparameter.type = 'text';
                inputZparameter.value = 0;

                var colomn2Line3 = document.createElement('TD');
                colomn2Line3.appendChild(inputZparameter);
                tableLine3.appendChild(colomn2Line3);

                // ======================== LAST Line ==========================

                var tableLine4 = document.createElement('TR');
                tableParameters.appendChild(tableLine4);

                var colomn1Line4 = document.createElement('TD');
                colomn1Line4.innerHTML = " ";
                tableLine4.appendChild(colomn1Line4);

                var validationBtn = document.createElement('BUTTON');
                validationBtn.innerHTML = "Validate";
                validationBtn.setAttribute('data-bind', 'attr: { title: "Create object" }, click: validateCommand');

                var colomn2Line4 = document.createElement('TD');
                colomn2Line4.appendChild(validationBtn);
                tableLine4.appendChild(colomn2Line4);

                // ==============================================================

                var ellipsoidTextureContainer = document.createElement('div');
                ellipsoidTextureContainer.className = 'cesium-customObject-ellipsoidTexture';
                parametersContainer.appendChild(ellipsoidTextureContainer);

                var btnContainer = document.createElement('div');
                btnContainer.className = 'cesium-customObject-btnContainer';
                configContainer.appendChild(btnContainer);
                
                var elementsForAxis = {
                    x : inputXparameter,
                    y : inputYparameter,
                    z : inputZparameter,
                }

                // creation du model pour cette vue (i.e CustomObject)
                var viewModel = new CustomObjectViewModel(configContainer, ellipsoidParametersContainer, ellipsoidTextureContainer, viewer);
                this._viewModel = viewModel;

                var panelViewModel = new PanelViewModel(elementsForAxis, viewer);
                this._panelViewModel = panelViewModel;
                
                

                // application du binding pour attacher le model à la vue
                knockout.applyBindings(viewModel, container);
                knockout.applyBindings(panelViewModel, configContainer);


            }

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
            });

            return CustomObject;
        });