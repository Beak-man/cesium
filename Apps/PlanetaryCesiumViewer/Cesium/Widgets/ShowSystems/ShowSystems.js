/*global define*/
define([
        '../../Core/Math',
        '../../Core/Color', 
        '../getElement',
        '../../ThirdParty/knockout',
		'./ShowSystemsViewModel',
		],function(
            CesiumMath,
            Color,
            getElement,
            knockout,
			ShowSystemsViewModel) { 
                "use strict";
			
            var ShowSystems = function(viewerContainer, PlanetsToolbar, scene, viewer){
			
			    var viewModel   = new ShowSystemsViewModel(viewerContainer, PlanetsToolbar, scene, viewer);	
                this._viewModel = viewModel;

				var mercuryButton = document.createElement('div');
                mercuryButton.className = 'cesium-button-planet cesium-planetsToolbar-button';
				mercuryButton.innerHTML = 'Mercury';
				mercuryButton.setAttribute('id', 'mercuryId');
				mercuryButton.setAttribute('data-bind', 'attr: { title: tooltip},\
				                                         click: command.bind($data, "Mercury", "mercuryId")');
                PlanetsToolbar.appendChild(mercuryButton);
				
				var venusButton = document.createElement('div');
                venusButton.className = 'cesium-button-planet cesium-planetsToolbar-button';
				venusButton.innerHTML = 'Venus';
				venusButton.setAttribute('id', 'venusId');
				venusButton.setAttribute('data-bind', 'attr: { title: tooltip},\
				                                         click: command.bind($data, "Venus", "venusId")');
                PlanetsToolbar.appendChild(venusButton);
				
				var earthButton = document.createElement('div');
                earthButton.className = 'cesium-button-planet cesium-planetsToolbar-button';
				earthButton.innerHTML = 'Earth';
				earthButton.setAttribute('id', 'earthId');
				earthButton.setAttribute('data-bind', 'attr: { title: tooltip},\
				                                        click: command.bind($data, "Earth", "earthId")');
                PlanetsToolbar.appendChild(earthButton);
				
				var marsButton = document.createElement('div');
                marsButton.className = 'cesium-button-planet cesium-planetsToolbar-button';
				marsButton.innerHTML = 'Mars';
				marsButton.setAttribute('id', 'marsId');
				marsButton.setAttribute('data-bind', 'attr: { title: tooltip},\
				                                        click: command.bind($data, "Mars", "marsId")');
                PlanetsToolbar.appendChild(marsButton);
				
				var marsButton = document.createElement('div');
                marsButton.className = 'cesium-button-planet cesium-planetsToolbar-button';
				marsButton.innerHTML = 'Custom.';
				marsButton.setAttribute('id', 'marsId');
				marsButton.setAttribute('data-bind', 'attr: { title: tooltip},\
				                                        click: command.bind($data, "Mars", "marsId")');
                PlanetsToolbar.appendChild(marsButton);
				
				
				var configContainer   =  document.createElement('div');
			    configContainer.className = 'cesium-showSystems-configContainer';
				configContainer.setAttribute('id', 'configId');
			    PlanetsToolbar.appendChild(configContainer);
				
				var btnCancel =  document.createElement('BUTTON');
				btnCancel.className = 'cesium-showSystems-configContainer-button';
				btnCancel.innerHTML = 'Cancel'; 
				btnCancel.setAttribute('data-bind', 'click: cancelCommand');
				configContainer.appendChild(btnCancel);
				
                knockout.applyBindings(viewModel, PlanetsToolbar);
            }
         return ShowSystems;
});