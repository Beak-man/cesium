/**
 * @author Omar Delaa 
 */

/*global define*/
define([
    '../../Core/defineProperties', 
    './LngLatViewModel',
    '../getElement',
    '../../ThirdParty/knockout'],
    function( 
	    defineProperties,
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
			
			defineProperties(LngLat.prototype, {
        /**
         * Gets the container.
         * @memberof LngLat.prototype
         *
         * @type {Element}
         */
        container : {
            get : function() {
                return this._container;
            }
        },
		
        /**
         * Gets the view model.
         * @memberof LngLat.prototype
         *
         * @type {LngLatViewModel}
         */
        viewModel : {
            get : function() {
                return this._viewModel;
            }
        },
    });
			
			
			
            return LngLat;
});