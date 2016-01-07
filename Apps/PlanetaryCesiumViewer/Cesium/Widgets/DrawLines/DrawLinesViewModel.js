/*global define*/
define([
        '../createCommand',  
        '../../Core/defined',
        '../../Core/defineProperties',
		'../../Core/ScreenSpaceEventHandler',
        '../../Core/ScreenSpaceEventType',
        '../../ThirdParty/knockout'
    ], function(
	    createCommand,
        defined,
        defineProperties,
		ScreenSpaceEventHandler,
		ScreenSpaceEventType,
        knockout) {
    "use strict";


 var icons = '<g><g><path d="M232.491,195.859c7.978-32.608-1.617-68.425-29.02-91.425l-54.288-45.855C110.757,26.343,53.449,31.371,21.201,69.791\
				c-32.235,38.42-27.119,95.917,11.314,128.152l54.692,45.861c27.403,22.994,64.496,26.929,95.222,13.411l31.484,26.544\
				l61.584-51.679L232.491,195.859z M175.815,199.364c-13.923,16.595-38.742,18.768-55.343,4.845l-54.648-45.855\
				c-16.588-13.923-18.761-38.742-4.845-55.337s38.742-18.755,55.337-4.839l54.654,45.861\
				C187.558,157.957,189.731,182.782,175.815,199.364z"/>\
				<path d="M329.14,380.882l166.9,140.685c33.89,28.433,83.017,24.005,111.406-9.873l0,0L390.762,329.172L329.14,380.882z"/>\
			<path d="M610.321,100.308L610.321,100.308c-28.433-33.878-78.943-38.306-112.834-9.873L182.454,354.787\
				c-30.726-13.525-67.794-9.589-95.203,13.411l-54.648,45.855c-38.426,32.242-43.454,89.732-11.219,128.159\
				c32.248,38.42,89.739,43.448,128.159,11.206l54.648-45.861c27.409-22.994,37.719-58.811,29.74-91.413L610.321,100.308z\
				 M304.845,280.645c15.375,0,27.814,12.457,27.814,27.814c0,15.369-12.438,27.814-27.814,27.814\
				c-15.357,0-27.807-12.451-27.807-27.814C277.038,293.102,289.489,280.645,304.845,280.645z M170.97,467.968l-54.654,45.861\
				c-16.595,13.923-41.42,11.75-55.337-4.839c-13.923-16.595-11.75-41.414,4.845-55.33l54.648-45.861\
				c16.601-13.923,41.42-11.75,55.343,4.845C189.731,429.226,187.558,454.045,170.97,467.968z"/></g>\
		<rect x="409.858" y="299.653" width="50.536" height="25.268"/><rect x="485.662" y="299.653" width="50.536" height="25.268"/>\
		<rect x="561.466" y="299.653" width="50.536" height="25.268"/></g>';


var iconSave = '<g><path d="M340.969,0H12.105C5.423,0,0,5.423,0,12.105v328.863c0,6.68,5.423,12.105,12.105,12.105h328.864\
		c6.679,0,12.104-5.426,12.104-12.105V12.105C353.073,5.423,347.647,0,340.969,0z M67.589,18.164h217.895v101.884H67.589V18.164z\
		 M296.082,327.35H57.003V176.537h239.079V327.35z M223.953,33.295h30.269v72.638h-30.269V33.295z M274.135,213.863H78.938v-12.105\
		h195.197V213.863z M274.135,256.231H78.938v-12.105h195.197V256.231z M274.135,297.087H78.938v-12.105h195.197V297.087z"/></g>';


     function  InitializeDrawLines(that){
	 	
		that._isDrawLinesActive = true;
		
		that._wrapperPanel.className = '';
		that._wrapperPanel.className = 'cesium-Tools-wrapperPanel-transition-hide';
		that._viewer.tools.viewModel._isPanelVisible = false;
		that._viewer.drawLines.viewModel.isPanelToolVisible = false;
		
		that._wrapperMenu       = document.createElement('span');
        that._wrapperMenu.className = 'cesium-DrawLinesMenu';
        that._IconsContainer.appendChild(that._wrapperMenu);
		
		var cuteButton       = document.createElement('div');                              
        cuteButton.className = 'cesium-button cesium-toolbar-button cesium-DrawLinesMenu-button';                                                       
        cuteButton.innerHTML = '<svg width="25" height="25" viewBox="-50 -50 640 640">'+icons+' </svg>';             
	    that._wrapperMenu.appendChild(cuteButton); 
		
		var saveButton       = document.createElement('div');                              
        saveButton.className = 'cesium-button cesium-toolbar-button cesium-DrawLinesMenu-button';                                                       
        saveButton.innerHTML = '<svg width="40" height="40" viewBox="-50 -50 640 640">'+iconSave+' </svg>';             
	    that._wrapperMenu.appendChild(saveButton); 
	 }

   /**
     * The view model for {@link DrawLines}.
     * @alias DrawLinesViewModel
     * @constructor
     */
    var DrawLinesViewModel = function(IconsContainer, wrapperPanel, viewer){
	
	  
	      this._IconsContainer = IconsContainer;
          this._wrapperPanel = wrapperPanel;
          this._viewer = viewer;
		  this._isPanelToolVisible = false;
		  this._isDrawLinesActive  = false;
		   
		  var that = this;
          this._drawPolyLines = createCommand(function() {
			   InitializeDrawLines(that);
			
          });
		  
		  
		  knockout.track(this, ["isPanelToolVisible", "isDrawLinesActive"]);
		  
	};

           defineProperties(DrawLinesViewModel.prototype, {		
           /**
            * Gets the Command that is executed when the button is clicked.
            * @memberof DrawLinesViewModel.prototype
            *
            * @type {Command}
            */
           drawPolyLines : {
               get : function() {
                   return this._drawPolyLines;
                   }
               }, 
			   
		   isPanelToolVisible : {
               set : function(value) {
                    this._isPanelToolVisible = value;
                }
            },
			
			destroyWrapperMenu : {
               get : function() {
			   	    try {
						this._IconsContainer.removeChild(this._wrapperMenu);
						return true;
					} catch (e){
						return false;
					}	
                }
            }, 
           });

    return DrawLinesViewModel;
});
