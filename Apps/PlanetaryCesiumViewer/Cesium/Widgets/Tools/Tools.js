/*global define*/
define([
        '../../Core/Color',
        '../../Core/defined',
        '../../Core/defineProperties',
        '../../Core/destroyObject',
        '../../Core/DeveloperError',
        '../../ThirdParty/knockout',
        '../getElement',
	    '../../Core/ScreenSpaceEventHandler',
        '../../Core/ScreenSpaceEventType',
		'./ToolsViewModel'
    ], function(
        Color,
        defined,
        defineProperties,
        destroyObject,
        DeveloperError,
        knockout,
        getElement,
		ScreenSpaceEventHandler,
		ScreenSpaceEventType,
		ToolsViewModel) {
    "use strict";


		var icone = '<g><path d="M86.257,23.405l-3.866,3.866l-3.737,3.737l-4.759,4.759c-2.521,0.161-5.096-0.713-7.023-2.64\
		c-1.927-1.927-2.8-4.502-2.64-7.023l4.759-4.759l3.737-3.737l3.866-3.866c0.251-0.251,0.251-0.659,0-0.911\
		c-0.046-0.046-0.101-0.074-0.155-0.103l0.001-0.001c-0.003-0.001-0.007-0.003-0.01-0.004c-0.034-0.017-0.066-0.032-0.102-0.043\
		c-2.677-1.193-5.629-1.878-8.749-1.878c-11.939,0-21.618,9.679-21.618,21.618c0,2.28,0.358,4.475,1.012,6.538L24.428,61.504\
		c-7.545,0.122-13.627,6.267-13.627,13.842c0,7.65,6.203,13.853,13.853,13.853c7.574,0,13.72-6.083,13.842-13.628l22.546-22.546\
		c2.063,0.654,4.259,1.012,6.539,1.012c11.939,0,21.618-9.679,21.618-21.618c0-3.118-0.686-6.066-1.877-8.742\
		c-0.012-0.041-0.029-0.079-0.05-0.118c-0.008-0.017-0.014-0.035-0.022-0.052l-0.007,0.007c-0.024-0.037-0.041-0.078-0.074-0.111\
		C86.916,23.153,86.509,23.153,86.257,23.405z M30.378,75.346c0,3.161-2.563,5.724-5.724,5.724c-3.161,0-5.724-2.563-5.724-5.724\
		c0-3.162,2.563-5.725,5.724-5.725C27.815,69.621,30.378,72.184,30.378,75.346z"/></g>';


    /**
     * A widget for permforming some modifications.
     *
     * @alias Tools
     * @constructor
     *
     * @param {Element|String} container The DOM element or ID that will contain the widget.
     * @param {Object} Viewer.
     * @exception {DeveloperError} Element with id "container" does not exist in the document.
     */
    var Tools = function(container, wrapperContainer, viewer, scene) {
		
		var wrapper       = document.createElement('span');
        wrapper.className = 'cesium-Tools-wrapper cesium-toolbar-button';
        container.appendChild(wrapper);
		
		var wrapperPanel       = document.createElement('div');                              
        wrapperPanel.className = 'cesium-Tools-wrapperPanel';                                                                
	    wrapper.appendChild(wrapperPanel); 
		
		var viewModel  = new ToolsViewModel(container, wrapper, viewer);	
		
		var icone = '<g><path d="M86.257,23.405l-3.866,3.866l-3.737,3.737l-4.759,4.759c-2.521,0.161-5.096-0.713-7.023-2.64\
		c-1.927-1.927-2.8-4.502-2.64-7.023l4.759-4.759l3.737-3.737l3.866-3.866c0.251-0.251,0.251-0.659,0-0.911\
		c-0.046-0.046-0.101-0.074-0.155-0.103l0.001-0.001c-0.003-0.001-0.007-0.003-0.01-0.004c-0.034-0.017-0.066-0.032-0.102-0.043\
		c-2.677-1.193-5.629-1.878-8.749-1.878c-11.939,0-21.618,9.679-21.618,21.618c0,2.28,0.358,4.475,1.012,6.538L24.428,61.504\
		c-7.545,0.122-13.627,6.267-13.627,13.842c0,7.65,6.203,13.853,13.853,13.853c7.574,0,13.72-6.083,13.842-13.628l22.546-22.546\
		c2.063,0.654,4.259,1.012,6.539,1.012c11.939,0,21.618-9.679,21.618-21.618c0-3.118-0.686-6.066-1.877-8.742\
		c-0.012-0.041-0.029-0.079-0.05-0.118c-0.008-0.017-0.014-0.035-0.022-0.052l-0.007,0.007c-0.024-0.037-0.041-0.078-0.074-0.111\
		C86.916,23.153,86.509,23.153,86.257,23.405z M30.378,75.346c0,3.161-2.563,5.724-5.724,5.724c-3.161,0-5.724-2.563-5.724-5.724\
		c0-3.162,2.563-5.725,5.724-5.725C27.815,69.621,30.378,72.184,30.378,75.346z"/></g>';
		
		 viewModel._icone = icone;
		 this._viewModel = viewModel;
		
		var toolButton           = document.createElement('div');                              
        toolButton.className     = 'cesium-button cesium-toolbar-button';                                                       
        toolButton.innerHTML = '<svg width="65" height="65" viewBox="0 0 210 210">'+icone+' </svg>';             
        toolButton.setAttribute('data-bind', 'attr: { title: "tools" },  event : {mousedown : moveIconCommand, click:showToolPanel}');
	    wrapper.appendChild(toolButton); 
		
     

       knockout.applyBindings(viewModel, wrapper);


    };

    defineProperties(Tools.prototype, {
        /**
         * Gets the parent container.
         * @memberof Tools.prototype
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
         * @memberof Tools.prototype
         *
         * @type {ToolsViewModel}
         */
        viewModel : {
            get : function() {
                return this._viewModel;
            }
        },
    });

    return Tools;
});