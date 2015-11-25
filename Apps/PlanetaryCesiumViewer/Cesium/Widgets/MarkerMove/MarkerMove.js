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
				
			//if(!window.sessionStorage.getItem("geoJsonData"))	window.sessionStorage.setItem("geoJsonData", {});
			
			    var viewModel   = new MarkerMoveViewModel(toolbar, container, scene, viewer);	
                this._viewModel = viewModel;
                container       = getElement(toolbar); 
				
				var wrapper = document.createElement('span');
                wrapper.className = 'cesium-sceneModePicker-wrapper cesium-toolbar-button';
                container.appendChild(wrapper);

			/*	var button = document.createElement('button');
				button.type = 'button';
				button.className = 'cesium-button cesium-toolbar-button';
				button.setAttribute('data-bind', '\
												css: { "cesium-sceneModePicker-selected": dropDownVisible },\
												attr: { title: selectedTooltip },\
												click: toggleDropDown');
				wrapper.appendChild(button);*/


               var modifbutton       = document.createElement('div');                              
                modifbutton.className     = 'cesium-button cesium-toolbar-button cesium-sceneModePicker-dropDown-icon';   
                modifbutton.innerHTML     = "M";                                                      
                modifbutton.style.cssText = 'text-align : center; font-family : Arial';                 

                modifbutton.setAttribute('data-bind', 'css: { "cesium-sceneModePicker-selected": dropDownVisible },\
				                                   attr: { title: tooltip },\
												   click: command');
				modifbutton.setAttribute('id', 'xxPrimeSave'); 
				wrapper.appendChild(modifbutton); 

			/*	var saveButton         = document.createElement('div');                              
                saveButton.className     =  'cesium-button cesium-toolbar-button cesium-sceneModePicker-dropDown-icon';
                saveButton.innerHTML     = "S";                                                      
                saveButton.style.cssText = 'text-align : center; font-family : Arial';                 
				saveButton.setAttribute('data-bind', '\
						css: { "cesium-sceneModePicker-visible" : dropDownVisible,\
						       "cesium-sceneModePicker-hidden" : !dropDownVisible },\
						attr: { title: tooltip2 },\
						click: saveCommand');
				saveButton.setAttribute('id', 'saveBtn');
                wrapper.appendChild(saveButton); */
				
				
				var saveLink        = document.createElement('a');                              
                saveLink.className     =  'cesium-button cesium-toolbar-button cesium-sceneModePicker-dropDown-icon';
                saveLink.innerHTML     = "Link";                                                      
                saveLink.style.cssText = 'text-align : center; font-family : Arial';                 
				saveLink.setAttribute('data-bind', '\
						css: { "cesium-sceneModePicker-visible" : dropDownVisible,\
						       "cesium-sceneModePicker-hidden" : !dropDownVisible },\
						attr: { title: tooltip2 },\
						click: saveCommandLink');
				saveLink.setAttribute('id', 'saveLink');
                wrapper.appendChild(saveLink); 


                knockout.applyBindings(viewModel, wrapper);

            }
         return MarkerMove;
});