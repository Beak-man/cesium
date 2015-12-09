/*global define*/
define([
        '../../Core/Math',
        '../../Core/Color', 
		'../../Core/defineProperties', 
        '../getElement',
        '../../ThirdParty/knockout',
		'./ShowSystemsViewModel',
		],function(
            CesiumMath,
            Color,
			defineProperties,
            getElement,
            knockout,
			ShowSystemsViewModel) { 
                "use strict";
	
			var solarSystem = {
				mercury : ['mercury'],
				venus   : ['venus'],
				earth   : ['earth', 'moon'],
				mars    : ['mars', 'deimos', 'phobos'],
				jupiter : ['jupiter', 'ganymede', 'callisto', 'io', 'europa'],
				saturn  : ['saturn', 'titan', 'rhea', 'lapetus', 'dione', 'tethys', 'enceladus', 'mimas'],
				uranus  : ['uranus', 'titania', 'oberon', 'umbriel', 'Ariel', 'miranda'],
				neptune : ['neptune', 'triton']
			}	
				
			
            var ShowSystems = function(viewerContainer, PlanetsToolbar, scene, viewer){
     	    var count = 0;
			var i;
			for (i in solarSystem) {
				
			   var planetarySystem = solarSystem[i];
			    
			   var name       = planetarySystem[0]; 
			   var planetName = planetarySystem[0].replace(planetarySystem[0].charAt(0), planetarySystem[0].charAt(0).toUpperCase());
               
               if (planetarySystem.length > 1){
               
	                window[name + 'Wrapper'] = document.createElement('span');
	                window[name + 'Wrapper'].className  = 'cesium-planetsToolbar-button cesium-showSystems-wrapper';
	                PlanetsToolbar.appendChild(window[name + 'Wrapper']);
	                
	                window[name + 'SystemButton'] = document.createElement('div');
	                window[name + 'SystemButton'].className = 'cesium-button-planet cesium-planetsToolbar-button';
					window[name + 'SystemButton'].innerHTML = planetName;
					window[name + 'SystemButton'].style.cssText = 'font-family : Arial; position:relative; top:-2px; left:-3px;';
					window[name + 'SystemButton'].setAttribute('data-bind', 'attr: { title: tooltip}, click: showSystem.bind($data,"'+count+'")');
					window[name + 'Wrapper'].appendChild(window[name + 'SystemButton']);
					
					for (var j=0; j < planetarySystem.length; j++) {
						
						if (j == 0){
						
						var name       = planetarySystem[j]; 
			            var planetName = name.replace(name.charAt(0), name.charAt(0).toUpperCase());
						
						window[name + 'Button'] = document.createElement('div');
		                window[name + 'Button'].className = 'cesium-button-planet cesium-planetsToolbar-button cesium-showSystems-dropDown-icon';
						window[name + 'Button'].innerHTML = planetName;
						window[name + 'Button'].style.cssText = 'font-family : Arial; position:relative; left:-3px;';
						window[name + 'Button'].setAttribute('data-bind', 'attr: { title: tooltip2}, click: command.bind($data, "'+planetName+'", "'+(count+1)+'", "'+j+'"), \
						                                                               css: { "cesium-showSystems-visible" : buttonVisible_'+count+',\
								                                                              "cesium-showSystems-hidden"  : !buttonVisible_'+count+'}');
						window[planetarySystem[0] + 'Wrapper'].appendChild(window[name + 'Button']);
						
						} else {

							var name       = planetarySystem[j]; 
				            var astreName = name.replace(name.charAt(0), name.charAt(0).toUpperCase());
							
							if (name !== ''){
						
								window[name + 'Button'] = document.createElement('div');
				                window[name + 'Button'].className = 'cesium-button-planet cesium-planetsToolbar-button cesium-showSystems-dropDown-icon';
								window[name + 'Button'].innerHTML = astreName;
								window[name + 'Button'].style.cssText = 'font-family : Arial; position:relative; left:-3px;';
								window[name + 'Button'].setAttribute('data-bind', 'attr: { title: tooltip3}, click: commandSatellite.bind($data, "'+planetarySystem[0]+'","'+astreName+'", "'+(count+1)+'", "'+j+'"), \
								                                                               css: { "cesium-showSystems-visible" :  buttonVisible_'+count+',\
										                                                              "cesium-showSystems-hidden"  : !buttonVisible_'+count+'}');
								window[planetarySystem[0] + 'Wrapper'].appendChild(window[name + 'Button']);
						    }
						}
					};
					
				} else if (planetarySystem.length == 1){
					
                   var name       = planetarySystem[0]; 
			       var planetName = name.replace(name.charAt(0), name.charAt(0).toUpperCase());

	               window[name+ 'Button'] = document.createElement('div');
	               window[name+ 'Button'].className = 'cesium-button-planet cesium-planetsToolbar-button';
				   window[name+ 'Button'].innerHTML = planetName;
				   window[name+ 'Button'].setAttribute('data-bind', 'attr: { title: tooltip}, click: command.bind($data, "'+planetName+'","'+(count+1)+'", "'+0+'")');
	               PlanetsToolbar.appendChild(window[name+ 'Button']);
			   }
			   
			   count++;

            }

				var customButton = document.createElement('div');
                customButton.className = 'cesium-button-planet cesium-planetsToolbar-button';
				customButton.innerHTML = 'Custom.';
				//customButton.setAttribute('data-bind', 'attr: { title: tooltip}, click: command.bind($data, "Custom")');
                PlanetsToolbar.appendChild(customButton); 
				
				var configContainer   =  document.createElement('div');
			    configContainer.className = 'cesium-showSystems-configContainer';
				configContainer.setAttribute('id', 'configId');
			    PlanetsToolbar.appendChild(configContainer);
			    
			    var listContainer   =  document.createElement('div');
			    listContainer.className = 'cesium-showSystems-listContainer';
				listContainer.setAttribute('id', 'listId');
			    configContainer.appendChild(listContainer);
				
				var inputTag   =  document.createElement('INPUT');
                inputTag.type = 'radio';
			    inputTag.className = 'cesium-showSystems-configContainer-button';
				inputTag.setAttribute('data-bind', 'click: testCommand');
			  //  listContainer.appendChild(inputTag);

				var btnContainer =  document.createElement('div');
				btnContainer.className = 'cesium-showSystems-btnContainer';
				configContainer.appendChild(btnContainer);
				
				var btnCancel =  document.createElement('BUTTON');
				btnCancel.className = 'cesium-showSystems-configContainer-button';
				btnCancel.innerHTML = 'Close'; 
				btnCancel.setAttribute('data-bind', 'click: cancelCommand');
				btnContainer.appendChild(btnCancel);
				
				var viewModel   = new ShowSystemsViewModel(viewer, scene, configContainer, inputTag, listContainer, btnContainer, solarSystem);	
                this._viewModel = viewModel;
				
                knockout.applyBindings(viewModel, PlanetsToolbar);
            }
			
			
	  defineProperties(ShowSystems.prototype, {
				
	  viewModel : {
            get : function() {
                return this._viewModel;
            }
        },		
	});
				
    return ShowSystems;
});