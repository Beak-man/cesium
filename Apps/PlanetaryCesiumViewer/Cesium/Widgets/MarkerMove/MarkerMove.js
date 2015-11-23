/*global define*/
define([
        '../../Core/Math',
        '../../Core/Color', 
        '../getElement',
        '../../ThirdParty/knockout',
		'./MarkerMoveViewModel',
        '../../Core/ScreenSpaceEventHandler',
        '../../Core/ScreenSpaceEventType'
		],function(
            CesiumMath,
            Color,
            getElement,
            knockout,
			MarkerMoveViewModel,
            ScreenSpaceEventHandler,
            ScreenSpaceEventType) { 
                "use strict";


            var MarkerMove = function(toolbar, container, scene, viewer){
				
			if(!window.sessionStorage.getItem("geoJsonData"))	window.sessionStorage.setItem("geoJsonData", {});
			
			var viewModel   = new MarkerMoveViewModel(toolbar, container, scene, viewer);	
                this._viewModel = viewModel;
                container       = getElement(toolbar); 

                var element           = document.createElement('div');                              
                element.className     = 'cesium-button cesium-toolbar-button cesium-home-button';   
                element.innerHTML     = "x x'";                                                      
                element.style.cssText = 'text-align : center; font-family : Arial';                 

                element.setAttribute('data-bind', 'attr: { title: tooltip }, click: command');
				element.setAttribute('id', 'xxPrimeSave'); 
				
                container.appendChild(element); 

                knockout.applyBindings(viewModel, element);

            }
         return MarkerMove;
});