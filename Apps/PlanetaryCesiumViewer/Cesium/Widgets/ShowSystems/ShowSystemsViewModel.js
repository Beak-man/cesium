/* Structure de base des widgets en Cesium : il faut respecter cette structure */

/*global define*/
define([
    '../../Core/BoundingSphere',
    '../../Core/CesiumTerrainProvider',
    '../../Scene/Camera',
	'../../Core/Cartesian3',
    '../../Core/Math',
    '../../Core/Color',
    '../createCommand', 
	'../../Core/destroyObject',
	'../../DataSources/DataSourceDisplay',
	'../../Core/Ellipsoid',
	'../../Core/EllipsoidTerrainProvider',
	'./FooterViewModel',
	'../../Core/freezeObject',
	'../../Core/GeographicProjection',
	'../../DataSources/GeoJsonDataSource',
	'../../Scene/Globe',
    '../../ThirdParty/knockout', 
    '../../Core/defineProperties', 
	'./ListViewModel',
	'../../Core/Matrix4',
	'../../Core/Occluder',
	 '../../Core/ScreenSpaceEventType',
	'../../Scene/WebMapServiceImageryProvider'
    ], function(
	    BoundingSphere,
	    CesiumTerrainProvider,
	    Camera,
		Cartesian3,
	    CesiumMath,
        Color,
        createCommand,
		DataSourceDisplay,
		destroyObject,
		Ellipsoid, 
		EllipsoidTerrainProvider,
		FooterViewModel,
		freezeObject,
		GeographicProjection,
		GeoJsonDataSource,
		Globe,
        knockout,
        defineProperties,
        ListViewModel,
		Matrix4,
		Occluder,
		ScreenSpaceEventType,
		WebMapServiceImageryProvider
        ) { 
    "use strict";

        function showPlanetView(that, viewer, planetName, configContainer, listContainer, btnContainer, xhr, naifCode){
			
				for (var i = 0; i < that.dim; i++) {
								that["buttonVisible_" + i] = false;
							};
				
				var sendBtn = document.getElementById('sendBtn');
				if (sendBtn) btnContainer.removeChild(sendBtn);
							
				if (configContainer.style.left !==  that._windowsMove && configContainer.style.left !== '') {
					configContainer.className = "";
					configContainer.className = "cesium-showSystems-configContainer-transition";
					configContainer.style.opacity = 0;
					configContainer.style.left = that._windowsMove;
					
					 setTimeout(function(){
					     moveAndfillPanel(that, viewer, planetName, configContainer, listContainer, xhr, naifCode)
				     }, 900);
				}
				else {
					 moveAndfillPanel(that, viewer, planetName, configContainer, listContainer, xhr, naifCode)
				}
		} 
		
		function showSatelliteView(that, viewer, planetName, satelliteName, configContainer, listContainer, btnContainer, xhr, naifCode){
			
				for (var i = 0; i < that.dim; i++) {
								that["buttonVisible_" + i] = false;
							};
							
				var sendBtn = document.getElementById('sendBtn');
				if (sendBtn) btnContainer.removeChild(sendBtn);
							
				if (configContainer.style.left !==  that._windowsMove && configContainer.style.left !== '') {
				
					configContainer.className = "";
					configContainer.className = "cesium-showSystems-configContainer-transition";
					configContainer.style.opacity = 0;
					configContainer.style.left = that._windowsMove;
					
					 setTimeout(function(){
					     moveAndfillPanelSatellite(that, viewer, planetName, satelliteName, configContainer, listContainer, xhr, naifCode)
				     }, 900);
				}
				else {
					 moveAndfillPanelSatellite(that, viewer, planetName, satelliteName, configContainer, listContainer, xhr, naifCode)
				}
		} 	
		
		function moveAndfillPanel(that, viewer,  planetName, configContainer, listContainer, xhr, naifCode){
			
				configContainer.className = "";
				configContainer.className = "cesium-showSystems-configContainer";
				configContainer.style.visibility = "visible";
				configContainer.style.opacity = 1;
				configContainer.style.left = '5px';
				
				var pn = planetName.toLowerCase();
	
				var ajaxDataRequest = 'http://planetarymaps.usgs.gov/cgi-bin/mapserv?map=/maps/'+pn+'/'+pn+'_simp_cyl.map&service=WMS&request=GetCapabilities';
				getXmlPlanetData(that, viewer, xhr, 'post', ajaxDataRequest,  true, listContainer, pn, naifCode);
		}
		
		function moveAndfillPanelSatellite(that, viewer, planetName, satelliteName, configContainer, listContainer, xhr, naifCode){
				configContainer.className = "";
				configContainer.className = "cesium-showSystems-configContainer";
				configContainer.style.visibility = "visible";
				configContainer.style.opacity = 1;
				configContainer.style.left = '5px';
				
				var pn = planetName.toLowerCase();
				var ps = satelliteName.toLowerCase();
	
				var ajaxRequest = 'http://planetarymaps.usgs.gov/cgi-bin/mapserv?map=/maps/'+pn+'/'+ps+'_simp_cyl.map&service=WMS&request=GetCapabilities';
				getXmlDataSatellite(that, viewer, xhr, 'post', ajaxRequest, true, listContainer, pn, ps, naifCode);
		}

		function getXmlPlanetData(that, viewer, xhr, method, url, async, listContainer, pn, naifCode){


            viewer.tools.viewModel.removeAllCommands;

			xhr.open(method, url, async);
			xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			xhr.send();
		
			listContainer.innerHTML = '';		
					
			xhr.onreadystatechange = function(){
				if(xhr.readyState == 4 && xhr.status == 200 || xhr.status == 0){
					var data = xhr.responseXML;
					try {
						
						var service = data.getElementsByTagName("Service");
						var serviceName = service[0].getElementsByTagName("Name")[0].textContent;
						var widthMax  = service[0].getElementsByTagName("MaxWidth")[0].textContent;
						var heightMax = service[0].getElementsByTagName("MaxHeight")[0].textContent;
						var onlineResource = service[0].getElementsByTagName("OnlineResource")[0].getAttributeNS('http://www.w3.org/1999/xlink', 'href'); 

		                var capability = data.getElementsByTagName("Capability");
						var layers = capability[0].getElementsByTagName("Layer");
						var names = [];
						var layerName = [];
						var layer = [];
						var crs;
						var bBox  = [];
						var imageryProvidersTab = [];

						var PlanetName = pn.replace(pn.charAt(0), pn.charAt(0).toUpperCase())
							
						var listContainer2   =  document.createElement('div');
				        listContainer2.setAttribute('id', 'listId');
			            listContainer.appendChild(listContainer2);
							
						listContainer2.innerHTML  = PlanetName + ' : </br>';
						listContainer2.innerHTML += '</br>';

					    var listShow   =  document.createElement('div');
						listShow.setAttribute('id', 'listShowId');
			            listContainer2.appendChild(listShow);
						  
						var tableList = document.createElement('TABLE');
                        listShow.appendChild(tableList);   

						var dimLayers = layers.length;
						for (var i=0; i < layers.length; i++) {

						names[i] = layers[i].getElementsByTagName("Name")[0].textContent;
						layer[i] = layers[i].getElementsByTagName("Name")[0].textContent;
						crs      = layers[0].getElementsByTagName("CRS")[0].textContent;
						bBox[i]  = layers[i].getElementsByTagName("BoundingBox")[0];
						  
						var nameLowCase    = names[i].toLowerCase();
						var nameLowCaseTab = nameLowCase.split("_");
						var finalLayerName='';
						  
						for (var j=0; j < nameLowCaseTab.length; j++) {
						  	if(j==0){
						  		var MajName = nameLowCaseTab[j].replace(nameLowCaseTab[j].charAt(0), nameLowCaseTab[j].charAt(0).toUpperCase())
						  		finalLayerName += MajName + ' ';
						  		
						    } else{
							   finalLayerName += nameLowCaseTab[j]+' ';
							}
						};
						  
						 var bboxString = bBox[i].attributes[2].value+','+bBox[i].attributes[1].value +','+ bBox[i].attributes[4].value+','+bBox[i].attributes[3].value; 
						 var imageryRequestParam = 'SERVICE='+serviceName+'&'+'VERSION=1.1.1'+'&'+'SRS='+crs+'&'+'STYLES='+''+'&'+'REQUEST=GetMap'+'&'+'FORMAT=image%2Fjpeg'+'&'+'LAYERS='+layer[i]+'&'+'BBOX='+bboxString+'&'+'WIDTH='+widthMax+'&'+'HEIGHT='+heightMax;

						 var objRequest = {
						  	onlineResource      : onlineResource,
							imageryRequestParam : imageryRequestParam,
							paramCesiumRequest  : {
								                  planetName  : pn,
									              naifCode    : naifCode[0] +',' + naifCode[1]
							                     }
						  }

						  var planetN      = objRequest.paramCesiumRequest.planetName;
						  var naif         = objRequest.paramCesiumRequest.naifCode;
						  var onlineResUrl = objRequest.onlineResource;
						  var finalUrl     =  onlineResUrl+'&'+imageryRequestParam; 
						   
						  var tableLine = document.createElement('TR');
                          tableList.appendChild(tableLine);
						  
						  var colomn1 = document.createElement('TD');
                          tableLine.appendChild(colomn1); 
						   
						  var btnShowLayer  =  document.createElement('INPUT');
						  btnShowLayer.type = 'checkbox'; 
				          btnShowLayer.className = 'cesium-showSystems-configContainer-button-send';
						  btnShowLayer.setAttribute('data-bind',  'checked : show_'+i);
				          colomn1.appendChild(btnShowLayer);
						  
						  var colomn2 = document.createElement('TD');
                          tableLine.appendChild(colomn2);
						  
                          colomn2.appendChild(document.createTextNode(finalLayerName));
						  
                          var colomn3 = document.createElement('TD');
						  colomn3.className = "cesium-showSystems-configContainer-colomn3";
                          tableLine.appendChild(colomn3)

						  var inputRange  = document.createElement('INPUT');
						  inputRange.type = 'range'; 
						  inputRange.min  = '0';
						  inputRange.max  = '1';
						  inputRange.step = '0.05';
						  inputRange.setAttribute('data-bind', 'value: alpha_'+i+', valueUpdate: "input"');
				          colomn3.appendChild(inputRange);
						  
						  layerName[i] = finalLayerName;
						  imageryProvidersTab[i] =  new WebMapServiceImageryProvider({
			                    url       : finalUrl,
			                    layers    : layer[i],
			                    credit    : 'USGS @ planetarymaps.usgs.gov',
								ellipsoid :  that._ellipsoid
		                        });
						};
				   
						var listViewModel = new ListViewModel(viewer, dimLayers, layerName, imageryProvidersTab);
						knockout.applyBindings(listViewModel, listContainer2);

					} catch (e) {
						
					}
				}
			}
		}
		
		function getXmlDataSatellite(that, viewer, xhr, method, url, async, listContainer, pn, sn, naifCode){

			xhr.open(method, url, async);
			xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			xhr.send();
			
			listContainer.innerHTML = '';
					
			xhr.onreadystatechange = function(){
				if(xhr.readyState == 4 && xhr.status == 200 || xhr.status == 0){
					var data = xhr.responseXML;
					
					/* ==== get informations from the XML file ==== */ 
				
					var service        = data.getElementsByTagName("Service");
					var serviceName    = service[0].getElementsByTagName("Name")[0].textContent;
					var widthMax       = service[0].getElementsByTagName("MaxWidth")[0].textContent;
					var heightMax      = service[0].getElementsByTagName("MaxHeight")[0].textContent;
					var onlineResource = service[0].getElementsByTagName("OnlineResource")[0].getAttributeNS('http://www.w3.org/1999/xlink', 'href'); 
	
					var capability = data.getElementsByTagName("Capability");
					var layers     = capability[0].getElementsByTagName("Layer");
					
					
					/* ==== declaration of variables ==== */
					
					var names     = [];
					var layerName = [];
					var layer     = [];
					var bBox      = [];
					var crs;
					var imageryProvidersTab = [];
					
					var satelliteName = sn.replace(sn.charAt(0), sn.charAt(0).toUpperCase())


                    /* === set some HTML containers for the vizualisation === */ 
				   
					var listContainer2   =  document.createElement('div');
				    listContainer2.setAttribute('id', 'listId');
			        listContainer.appendChild(listContainer2);
					
					listContainer2.innerHTML = satelliteName + ' : </br>';
					listContainer2.innerHTML += ' </br>';

                    var listShow   =  document.createElement('div');
			        listContainer2.appendChild(listShow);

                    var tableList = document.createElement('TABLE');
                    listShow.appendChild(tableList); 

					
					/* ==== get informations from tables previously built ==== */
					
					var dimLayers = layers.length;
					for (var i=0; i < layers.length; i++) {
					  names[i] = layers[i].getElementsByTagName("Name")[0].textContent;
					  layer[i] = layers[i].getElementsByTagName("Name")[0].textContent;
					  crs      = layers[0].getElementsByTagName("CRS")[0].textContent;
					  bBox[i]  = layers[i].getElementsByTagName("BoundingBox")[0];
					  
					  /* === transform the first case to UpperCase (for the vizualiation only : not Important) === */ 
					  
					  var nameLowerCase    = names[i].toLowerCase();
					  var nameLowerCaseTab =  nameLowerCase.split("_");
					  var finalLayerName='';
					  
					  for (var j=0; j < nameLowerCaseTab.length; j++) {
					  	if(j==0){
					  		var MajName = nameLowerCaseTab[j].replace(nameLowerCaseTab[j].charAt(0), nameLowerCaseTab[j].charAt(0).toUpperCase())
					  		finalLayerName += MajName + ' ';
					  		
					  	} else{
						   finalLayerName += nameLowerCaseTab[j]+' ';
						}
					  };

                      /* ==== set the imagery request parameters (WMS) === */ 
					  
					  var bboxString = bBox[i].attributes[2].value+','+bBox[i].attributes[1].value +','+ bBox[i].attributes[4].value+','+bBox[i].attributes[3].value; 
				      var imageryRequestParam = 'SERVICE='+serviceName+'&'+'VERSION=1.1.1'+'&'+'SRS='+crs+'&'+'STYLES='+''+'&'+'REQUEST=GetMap'+'&'+'FORMAT=image%2Fjpeg'+'&'+'LAYERS='+layer[i]+'&'+'BBOX='+bboxString+'&'+'WIDTH='+widthMax+'&'+'HEIGHT='+heightMax;

					  var objRequest = {
						  	onlineResource      : onlineResource,
							imageryRequestParam : imageryRequestParam,
							paramCesiumRequest  : {
								                  planetName    : pn,
								                  satelliteName : sn, 
									              naifCode      : naifCode[0] +',' + naifCode[1]
							                     }
						  }
						   
                          var satellN      = objRequest.paramCesiumRequest.planetName;
						  var naif         = objRequest.paramCesiumRequest.naifCode;
						  var onlineResUrl = objRequest.onlineResource;
						  var finalUrl     =  onlineResUrl+'&'+imageryRequestParam;  

                          /* ==== set HTML containers for the vizualition in table form ==== */  
 
						  var tableLine = document.createElement('TR');
                          tableList.appendChild(tableLine);
						  
						  var colomn1 = document.createElement('TD');
                          tableLine.appendChild(colomn1);
						  
						  var btnShowLayer  =  document.createElement('INPUT');
						  btnShowLayer.type = 'checkbox'; 
				          btnShowLayer.className = 'cesium-showSystems-configContainer-button-send';
						  btnShowLayer.setAttribute('data-bind',  'checked : show_'+i);
				          colomn1.appendChild(btnShowLayer);
						  
						  var colomn2 = document.createElement('TD');
                          tableLine.appendChild(colomn2);

                          colomn2.appendChild(document.createTextNode(finalLayerName));
						  
						  var colomn3 = document.createElement('TD');
                          tableLine.appendChild(colomn3)
						  
						  /* ==== set the range type of the input HTML tag ==== */ 
						  
						  var inputRange  =  document.createElement('INPUT');
						  inputRange.type = 'range'; 
						  inputRange.min  = '0';
						  inputRange.max  = '1';
						  inputRange.step = '0.05';
						  inputRange.setAttribute('data-bind', 'value: alpha_'+i+', valueUpdate: "input"');
				          colomn3.appendChild(inputRange);
						  
						  /* ==== set the imageryProvider ==== */ 
						  
						  layerName[i] = finalLayerName;
						  imageryProvidersTab[i] =  new WebMapServiceImageryProvider({
			                    url       : finalUrl,
			                    layers    : layer[i],
			                    credit    : 'USGS @ planetarymaps.usgs.gov',
								ellipsoid :  that._ellipsoid
		                        });
						};

                        /* ==== call of the model ==== */ 
					   
						var listViewModel = new ListViewModel(viewer, dimLayers, layerName, imageryProvidersTab);
						knockout.applyBindings(listViewModel, listContainer2);
				}
			}
		}
		
		/**
		 * function used to show or hide buttons of the planet and it's satellites for a given planetary system
		 * 
		 * @param {Object} that
		 * @param {num} index
		 */
		function showSystemButtons(that, index){
			
			if (that.isShowSystemActive && that.previousIndex == index) {
					
						for (var i = 0; i < that._solarSystemSize; i++) {
							that["buttonVisible_" + i] = false;
						};
						cancelFunction(that);
						that.isShowSystemActive = false;
						
		   }else if (!that.isShowSystemActive && that.previousIndex != index) {
						
						for (var i = 0; i < that._solarSystemSize; i++) {
							that["buttonVisible_" + i] = false;
						};
							
						that['buttonVisible_' + index] = !that['buttonVisible_' + index];
						cancelFunction(that);
						that.isShowSystemActive = true;
						that.previousIndex = index;
							
		  }else if (!that.isShowSystemActive && that.previousIndex == index) {
						
						for (var i = 0; i < that._solarSystemSize; i++) {
							that["buttonVisible_" + i] = false;
						};
								
						that['buttonVisible_' + index] = !that['buttonVisible_' + index];
						cancelFunction(that);
						that.isShowSystemActive = true;
						that.previousIndex = index;
						
		 }else if (that.isShowSystemActive && that.previousIndex != index) {
						
						for (var i = 0; i < that._solarSystemSize; i++) {
							that["buttonVisible_" + i] = false;
						};
						that['buttonVisible_' + index] = !that['buttonVisible_' + index];
						cancelFunction(that);
						that.isShowSystemActive = false;
						that.previousIndex = index;
			}
		}
		
		
		/**
		 * function to get the XMLHttpRequest for AJAX requests
		 */
		function getRequest() {
	        if (window.XMLHttpRequest ){// code for IE7+, Firefox, Chrome, Opera, Safari
	           var xhr = new XMLHttpRequest();
	         } else if(typeof ActiveXObject !== " undefined" ){
	           var xhr = new ActiveXObject( "Microsoft.XMLHTTP") ; // activeX pour IE
	        } else {
	            console.log("AJAX don't available on this browser");
	           var xhr = null;
	        }
	        return xhr ;
        }
		
		/**
		 * function to close the panel which contains the layers to display for a given celestial body 
		 * 
		 * @param {Object} that
		 */
	    function cancelFunction(that){
			var configContainer = document.getElementById("configId");
			configContainer.className = "";
			configContainer.style.opacity = 0;
			configContainer.className = "cesium-showSystems-configContainer-transition";
			configContainer.style.left = that._windowsMove;
			that.isShowSystemActive = false;
		}
		
		/**
		 * function to hide and show the panel which contains the layers to display for a given celestial body 
		 * 
		 * @param {Object} that
		 */
	    function hideFunction(that){
			var configContainer = document.getElementById("configId");
			configContainer.className = "";
			configContainer.style.opacity = 0;
			configContainer.className = "cesium-showSystems-configContainer-transition";
			configContainer.style.left = that._windowsMove;
			
			var btnShowPanel       =  document.createElement('BUTTON');
			btnShowPanel.className = 'cesium-footerToolbar-button cesium-footerToolbar-animation-show cesium-button-planet';
			btnShowPanel.innerHTML = 'show panel'; 
			btnShowPanel.setAttribute('data-bind',  'click: testCommand');
			that._footerToolbar.appendChild(btnShowPanel);
			that._btnShowPanel = btnShowPanel;
			
			var footerViewModel = new FooterViewModel(that._footerToolbar, configContainer, btnShowPanel);
			knockout.applyBindings(footerViewModel, btnShowPanel);
		}
		
		function testFunction(){
			console.log("test ok");
			return true;
		}

	/* ================================================================================================================== */
	/* ================================================ Main functions ================================================== */
	/* ================================================================================================================== */
		
		/**
		 * 
		 * Main function of the modelView. 
		 * 
		 * @param {Object} viewer
		 * @param {Object} scene
		 * @param {Object} configContainer : HTML element
		 * @param {Object} listContainer   : HTML element
		 * @param {Object} btnContainer    : HTML element
		 * @param {Object} solarSystem     : object which contains the stellar system to display
		 */
		
        var ShowSystemsViewModel = function(viewer, scene, viewerContainer, footerToolbar, configContainer, listContainer, btnContainer, solarSystem) {


               this._viewer            = viewer;
			   this._scene             = scene;
			   this._viewerContainer   = viewerContainer;
			   this._footerToolbar     = footerToolbar;
               this._configContainer   = configContainer;
			   this._listContainer     = listContainer;
			   this._btnContainer      = btnContainer;
			   this.isShowSystemActive = false;
			   this.previousIndex      = null;
			   this._windowsMove       = '-470px';
			   
			   this._solarSystemSize = getObjectSize(solarSystem);
			     
			   for (var i=0; i < this._solarSystemSize; i++) {
			   	this["buttonVisible_"+i] = false;
			   };
			   
               var that = this;
               var xhr = getRequest();

               this._command = createCommand(function(planetName,  planetIndex, satelliteIndex, vectorDimensionsString) {
                     
                     var stringVectorTab = vectorDimensionsString.split(',');
					 
                     var objectDimensions = {	
						x : parseFloat(stringVectorTab[0]),
						y : parseFloat(stringVectorTab[1]),
						z : parseFloat(stringVectorTab[2]),
					 }

					initializeScene(that, objectDimensions);
					initializeMarkerMoveWidget(that);
                    homeView(that._scene);

					var naifCode = [planetIndex, satelliteIndex];
					
					var obj = {
						naifCodes : naifCode,
						ellipsoid : that._ellipsoid
					}
					
					GeoJsonDataSource.crsModification = obj;
				  	showPlanetView(that, that._viewer,  planetName, that._configContainer, that._listContainer, that._btnContainer, xhr,  naifCode);
					
					if (planetName == 'venus'){
						
						var esri = new ArcGisMapServerImageryProvider({
                                url: '//elevation.arcgisonline.com/ArcGIS/rest/services/WorldElevation/DTMEllipsoidal/ImageServer'
                        });
					}
					
					/* to remove all butons of the planetToolBar from the view*/
				  	removeButtons(that);
				});
				
				this._commandSatellite = createCommand(function(planetName, satelliteName, planetIndex, satelliteIndex, vectorDimensionsString) {	
				
				     var stringVectorTab = vectorDimensionsString.split(',');
					 
                     var objectDimensions = {	
						x : parseFloat(stringVectorTab[0]),
						y : parseFloat(stringVectorTab[1]),
						z : parseFloat(stringVectorTab[2]),
					 }

                   initializeScene(that, objectDimensions);
				   initializeMarkerMoveWidget(that);
				   homeView(that._scene);
				
				    var naifCode = [planetIndex, satelliteIndex];
					
					var obj = {
						naifCodes  : naifCode,
						ellipsoid :  that._ellipsoid
					}
					
					GeoJsonDataSource.crsModification = obj;
					
				  	showSatelliteView(that, that._viewer, planetName, satelliteName, that._configContainer, that._listContainer, that._btnContainer, xhr, naifCode);
					removeButtons(that);
				});
				
				this._showSystem = createCommand(function(index) {
					    showSystemButtons(that, index);		
				});

				this._cancelCommand = createCommand(function() {	
				  	cancelFunction(that);
				});
				
				this._hideCommand = createCommand(function() {	
				  	hideFunction(that);
				});
				  
              /** Gets or sets the tooltip.  This property is observable.
               *
               * @type {String}
               */
               this.tooltip         = 'Show this system';
               this.tooltip2        = 'Show this planet';
			   this.tooltip3        = 'Show this satellite';
              knockout.track(this, ['tooltip', 'tooltip2', 'tooltip3', 'isActive', 'initializeCommand', 'cancelCommand2', 'buttonVisible', 'buttonVisible_0',  'buttonVisible_1',  'buttonVisible_2',  'buttonVisible_3',  'buttonVisible_4', 'buttonVisible_5', 'buttonVisible_6', 'buttonVisible_7']);
           }; 

		   defineProperties(ShowSystemsViewModel.prototype, {		
           /**
            * Gets the Command that is executed when the button is clicked.
            *
            * @type {Command}
            */
			
			 command : {
               get : function() {
                   return this._command;
                   }
               }, 
               
               commandSatellite: {
               get : function() {
                   return this._commandSatellite;
                   }
               }, 

               showSystem : {
               get : function() {
                   return this._showSystem;
                   }
               }, 
			   
			   cancelCommand : {
               get : function() {
                   return this._cancelCommand;
                   }
               }, 
			   hideCommand : {
               get : function() {
                   return this._hideCommand;
                   }
               }
			   	   	   
           });
		   
	/* ================================================================================================================== */	   
	/* ================================================= local functions ================================================ */
	/* ================================================================================================================== */ 	   
	 	   
	 function homeView(scene){
	 	var destination = scene.camera.getRectangleCameraCoordinates(Camera.DEFAULT_VIEW_RECTANGLE);
					
		var mag = Cartesian3.magnitude(destination);
		mag += mag * Camera.DEFAULT_VIEW_FACTOR;
		Cartesian3.normalize(destination, destination);
		Cartesian3.multiplyByScalar(destination, mag, destination);
					
		scene.camera.flyTo({
					destination : destination,
					duration : 2.0,
					endTransform : Matrix4.IDENTITY
				});
	 }	   
		 
     function removeButtons(that){
	 	for (var i=0; i < that._solarSystemSize; i++) {
			 that["buttonVisible_"+i] = false;
		 };	
		 that.isShowSystemActive = false;
		 
		 
		 try{
		 	that._footerToolbar.removeChild(that._btnShowPanel);
		 } catch(e){
		 	
		 }
		 
	 }		 
		
	function initializeScene(that, objectDimensions){
		that._ellipsoid =  freezeObject(new Ellipsoid(objectDimensions.x, objectDimensions.y, objectDimensions.z));
		
		try {
			that._viewer.scene.primitives.removeAll(true);
			that._viewer.lngLat.viewModel.removeCommand;			
			that._viewer.drawLines.viewModel.subMenu.destroyWrapperMenu;
			that._viewer.drawLines.viewModel.subMenu.viewModel.removeAllCommands;
		} catch (e) {};	

		var newTerrainProvider      = new EllipsoidTerrainProvider({ellipsoid: that._ellipsoid});
		var newGeographicProjection = new GeographicProjection(that._ellipsoid);
		var newGlobe                = new Globe(that._ellipsoid); 

	  /*  var newOccluder          = new Occluder(new BoundingSphere(Cartesian3.ZERO, that._ellipsoid.minimumRadius), Cartesian3.ZERO);    
		var cameraPosition         =  Cartesian3.ZERO;
		var occluderBoundingSphere = new BoundingSphere(Cartesian3.ZERO, that._ellipsoid.minimumRadius);
		Occluder.fromBoundingSphere(occluderBoundingSphere, cameraPosition, newOccluder);  */
					
		that._viewer.dataSources.removeAll(true);
        that._viewer.scene.globe              = newGlobe;
		that._viewer.scene.mapProjection      = newGeographicProjection;
		that._viewer.scene.camera.projection  = newGeographicProjection;
		that._viewer.terrainProvider          = newTerrainProvider;
		that._viewer.scene.globe.baseColor    = Color.BLACK;	
		
		
		//console.log(that._viewer.scene.globe);
		
	}	
		   	   
	function initializeMarkerMoveWidget(that){
		that._viewer.markerMove.viewModel._isActive = false;
		that._viewer.markerMove.viewModel.dropDownVisible = false;
		
		if (that._viewer.markerMove.viewModel._handlerRight) that._viewer.markerMove.viewModel._handlerRight.removeInputAction(ScreenSpaceEventType.RIGHT_CLICK);
		if( that._viewer.markerMove.viewModel._handlerLeft) that._viewer.markerMove.viewModel._handlerLeft.removeInputAction(ScreenSpaceEventType.LEFT_CLICK);
	}	   
		   
     function getObjectSize(obj){	
     	var count = 0;
		var i;
		for (i in obj) {
		    if (obj.hasOwnProperty(i)) count++;
		}
     	return count;
     }
     
     function getPLanetarySystem(obj, planetName){
     	
     	var planetarySustem = [];
		var i;
		for (i in obj) {
		   if (i === planetName) {
		   	planetarySustem = obj[i];
		   	break;
		   }
		}
		return planetarySustem;
     }


    return ShowSystemsViewModel;

});