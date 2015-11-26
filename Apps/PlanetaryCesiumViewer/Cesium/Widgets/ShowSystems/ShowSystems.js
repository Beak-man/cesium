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
			
            var MarkerMove = function(PlanetsToolbar, scene, viewer){
			
			    var viewModel   = new ShowSystemsViewModel(PlanetsToolbar, scene, viewer);	
                this._viewModel = viewModel;

				var mercuryButton = document.createElement('div');
                mercuryButton.className = 'cesium-button-planet cesium-planetsToolbar-button';
				mercuryButton.innerHTML = "Mercury";
                PlanetsToolbar.appendChild(mercuryButton);
				
				var venusButton = document.createElement('div');
                venusButton.className = 'cesium-button-planet cesium-planetsToolbar-button';
				venusButton.innerHTML = "Venus";
                PlanetsToolbar.appendChild(venusButton);
				
				var earthButton = document.createElement('div');
                earthButton.className = 'cesium-button-planet cesium-planetsToolbar-button';
				earthButton.innerHTML = "Earth";
                PlanetsToolbar.appendChild(earthButton);
				
				var marsButton = document.createElement('div');
                marsButton.className = 'cesium-button-planet cesium-planetsToolbar-button';
				marsButton.innerHTML = "Mars";
                PlanetsToolbar.appendChild(marsButton);
				
                knockout.applyBindings(viewModel, PlanetsToolbar);
            }
         return MarkerMove;
});