/**
 * @author Omar Delaa 
 */

/*global define*/
define([
    './LngLatViewModel',
    '../getElement',
    '../../ThirdParty/knockout'],
    function( 
        LngLatPanelViewModel,
        getElement,
        knockout) {
            "use strict";

            var LngLat = function(container, mainContainer, scene){

                var viewModel   = new LngLatPanelViewModel(container, mainContainer, scene);	
                this._viewModel = viewModel;
                container       = getElement(container); 

                var element           = document.createElement('div');                              
                element.className     = 'cesium-button cesium-toolbar-button cesium-home-button';   
                element.innerHTML     = 'x/y';                                                      
                element.style.cssText = 'text-align : center; font-family : Arial';                 

                element.setAttribute('data-bind', 'attr: { title: tooltip }, click: command'); 
                container.appendChild(element); 

                knockout.applyBindings(viewModel, element);
            }
            return LngLat;
});