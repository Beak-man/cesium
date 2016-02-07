/*global define*/
define([
    '../../Core/defineProperties',
    './CustomObjectViewModel',
    '../getElement',
    '../../ThirdParty/knockout'],
        function (
                defineProperties,
                CustomObjectViewModel,
                getElement,
                knockout) {
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
                
                var ellipsoidTextureContainer = document.createElement('div');
                ellipsoidTextureContainer.className = 'cesium-customObject-ellipsoidTexture';
                parametersContainer.appendChild(ellipsoidTextureContainer);

                var btnContainer = document.createElement('div');
                btnContainer.className = 'cesium-customObject-btnContainer';
                configContainer.appendChild(btnContainer);

                // creation du model pour cette vue (i.e CustomObject)
                var viewModel = new CustomObjectViewModel(configContainer, ellipsoidParametersContainer, ellipsoidTextureContainer, viewer);
                this._viewModel = viewModel;

                // application du binding pour attacher le model à la vue
                knockout.applyBindings(viewModel, container);
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