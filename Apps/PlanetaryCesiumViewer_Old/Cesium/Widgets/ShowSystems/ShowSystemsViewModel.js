/* Structure de base des widgets en Cesium : il faut respecter cette structure */

/*global define*/
define([
    '../../Core/Math',
    '../../Core/Color',
    '../createCommand', 
	'../../Core/destroyObject',
    '../../ThirdParty/knockout', 
    '../../Core/defineProperties', 
	'./ListViewModel'
    ], function(
	    CesiumMath,
        Color,
        createCommand,
		destroyObject,
        knockout,
        defineProperties,
        ListViewModel
        ) { 
    "use strict";

 var windowsMove = '-470px';
 var _selected   = false;
 
 var isFirefox   = typeof InstallTrigger !== 'undefined';
 var isChrome    = !!window.chrome && !isOpera;   
 var isOpera     = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;

        function showSystemsView(that, planetName, configContainer, listContainer, inputTag, btnContainer, xhr, naifCode){

				for (var i = 0; i < that.dim; i++) {
								that["buttonVisible_" + i] = false;
							};
				
				var sendBtn = document.getElementById('sendBtn');
				if (sendBtn) btnContainer.removeChild(sendBtn);
							
				if (configContainer.style.left !== windowsMove && configContainer.style.left !== '') {
					configContainer.className = "";
					configContainer.className = "cesium-showSystems-configContainer-transition";
					configContainer.style.opacity = 0;
					configContainer.style.left = windowsMove;
					
					 setTimeout(function(){
					     moveAndfillPanel(that, planetName, configContainer, listContainer, inputTag, xhr, naifCode)
				     }, 900);
				}
				else {
					 moveAndfillPanel(that, planetName, configContainer, listContainer, inputTag, xhr, naifCode)
				}
		} 
		
		function showSystemsSatelliteView(that, planetName, satelliteName, configContainer, listContainer, btnContainer, xhr, naifCode){
			
				for (var i = 0; i < that.dim; i++) {
								that["buttonVisible_" + i] = false;
							};
							
				var sendBtn = document.getElementById('sendBtn');
				if (sendBtn) btnContainer.removeChild(sendBtn);
							
				if (configContainer.style.left !== windowsMove && configContainer.style.left !== '') {
				
					configContainer.className = "";
					configContainer.className = "cesium-showSystems-configContainer-transition";
					configContainer.style.opacity = 0;
					configContainer.style.left = windowsMove;
					
					 setTimeout(function(){
					     moveAndfillPanelSatellite(planetName, satelliteName, configContainer, listContainer, xhr, naifCode)
				     }, 900);
				}
				else {
					 moveAndfillPanelSatellite(planetName, satelliteName, configContainer, listContainer, xhr, naifCode)
				}
		} 	
		
		function moveAndfillPanel(that, planetName, configContainer, listContainer, inputTag, xhr, naifCode){
			
				configContainer.className = "";
				configContainer.className = "cesium-showSystems-configContainer";
				configContainer.style.visibility = "visible";
				configContainer.style.opacity = 1;
				configContainer.style.left = '5px';
				
				var pn = planetName.toLowerCase();
	
				var ajaxRequest = 'http://planetarymaps.usgs.gov/cgi-bin/mapserv?map=/maps/'+pn+'/'+pn+'_simp_cyl.map&service=WMS&request=GetCapabilities';
				getXmlData(that, xhr, 'post', ajaxRequest, true, listContainer, inputTag, pn, naifCode);
		}
		
		function moveAndfillPanelSatellite(planetName, satelliteName, configContainer, listContainer, xhr, naifCode){
				configContainer.className = "";
				configContainer.className = "cesium-showSystems-configContainer";
				configContainer.style.visibility = "visible";
				configContainer.style.opacity = 1;
				configContainer.style.left = '5px';
				
				var pn = planetName.toLowerCase();
				var ps = satelliteName.toLowerCase();
	
				var ajaxRequest = 'http://planetarymaps.usgs.gov/cgi-bin/mapserv?map=/maps/'+pn+'/'+ps+'_simp_cyl.map&service=WMS&request=GetCapabilities';
				getXmlDataSatellite(xhr, 'post', ajaxRequest, true, listContainer, pn, ps, naifCode);
		}

		function getXmlData(that, xhr, method, url, async, listContainer, inputTag, pn, naifCode){

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

		                var x = data.getElementsByTagName("Capability");
						var y = x[0].getElementsByTagName("Layer");
						var names = [];
						var layer = [];
						var crs;
						var bBox  = [];

						var PlanetName = pn.replace(pn.charAt(0), pn.charAt(0).toUpperCase())
	
						
						var listContainer2   =  document.createElement('div');
				            listContainer2.setAttribute('id', 'listId');
			                listContainer.appendChild(listContainer2);
							
							listContainer2.innerHTML  = PlanetName + ' : </br>';
							listContainer2.innerHTML += '</br>';
						    listContainer2.innerHTML += '<form>';
						
						
					    var listShow   =  document.createElement('div');
			            listContainer2.appendChild(listShow);
						  
						var dimY = y.length;
						for (var i=0; i < y.length; i++) {
							
							// var inputClone = inputTag.cloneNode(true);

						  names[i] = y[i].getElementsByTagName("Title")[0].textContent;
						  layer[i] = y[i].getElementsByTagName("Name")[0].textContent;
						  crs      = y[0].getElementsByTagName("CRS")[0].textContent;
						  bBox[i]  = y[i].getElementsByTagName("BoundingBox")[0];
						  
						  var nameLC    = names[i].toLowerCase();
						  var nameLCTab =  nameLC.split("_");
						  var finalLayerName='';
						  
						  for (var j=0; j < nameLCTab.length; j++) {
						  	if(j==0){
						  		var MajName = nameLCTab[j].replace(nameLCTab[j].charAt(0), nameLCTab[j].charAt(0).toUpperCase())
						  		finalLayerName += MajName + ' ';
						  		
						  	} else{
							   finalLayerName += nameLCTab[j]+' ';
							}
						  };
						  
						 var bboxString = bBox[i].attributes[2].value+','+bBox[i].attributes[1].value +','+ bBox[i].attributes[4].value+','+bBox[i].attributes[3].value; 
						 
						 var imageryRequestParam = serviceName + ';' + '1.1.1' + ';' +crs+ ';' + '' + ';' + 'GetMap'+ ';' +'image%2Fjpeg' + ';' + layer[i] + ';' + bboxString + ';' + widthMax + ';' +  heightMax;
						  
						 var objRequest = {
						  	onlineResource      : onlineResource,
							imageryRequestParam : imageryRequestParam,
							paramCesiumRequest  : {
								                  planetName  : pn,
									              naifCode    : naifCode[0] +',' + naifCode[1]
							                     }
						  }

						  var planetN = objRequest.paramCesiumRequest.planetName;
						  var naif = objRequest.paramCesiumRequest.naifCode;
						  var onlineResUrl    = objRequest.onlineResource.replace('=', '--');
		   		          var cesiumUrl = 'http://localhost:8080/Apps/PlanetaryCesiumViewer/index.html?ellipsoidType=' + planetN + '&NAIFCodes=' + naif;
						  var finalUrl  = cesiumUrl + '&onlineResUrl='+ onlineResUrl + 'imageryProviderParams=' + imageryRequestParam; 
						   
						  var totalImageryRequest = JSON.stringify(objRequest);
						   
						  var btnSendRequest =  document.createElement('div');
				          btnSendRequest.className = 'cesium-showSystems-configContainer-button-send';
				          btnSendRequest.innerHTML = '<a href='+finalUrl+'><button></button></a>';
				          listShow.appendChild(btnSendRequest);
	
                          listShow.appendChild(document.createTextNode(finalLayerName));
						  listShow.innerHTML += '</br>';

						
						};
						listContainer2.innerHTML += '</form>';
				   
					//	var listViewModel = new ListViewModel(listContainer2);
					//	knockout.applyBindings(listViewModel, listContainer2);
						

					} catch (e) {
						
					}
				}
			}
		}
		
		
		function getXmlDataSatellite(xhr, method, url, async, listContainer, pn, sn, naifCode){


			xhr.open(method, url, async);
			xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			xhr.send();
			
			listContainer.innerHTML = '';
					
			xhr.onreadystatechange = function(){
				if(xhr.readyState == 4 && xhr.status == 200 || xhr.status == 0){
					var data = xhr.responseXML;
					
					var service = data.getElementsByTagName("Service");
					var serviceName = service[0].getElementsByTagName("Name")[0].textContent;
					var widthMax  = service[0].getElementsByTagName("MaxWidth")[0].textContent;
					var heightMax = service[0].getElementsByTagName("MaxHeight")[0].textContent;
					var onlineResource = service[0].getElementsByTagName("OnlineResource")[0].getAttributeNS('http://www.w3.org/1999/xlink', 'href'); 
	
					var x = data.getElementsByTagName("Capability");
					var y = x[0].getElementsByTagName("Layer");
					var names = [];
					var layer = [];
					var crs;
					var bBox  = [];
					
					var satelliteName = sn.replace(sn.charAt(0), sn.charAt(0).toUpperCase())

					var listContainer2   =  document.createElement('div');
				    listContainer2.setAttribute('id', 'listId');
			        listContainer.appendChild(listContainer2);
					
					listContainer2.innerHTML = satelliteName + ' : </br>';
					listContainer2.innerHTML += ' </br>';
					listContainer2.innerHTML += '<form>';

                    var listShow   =  document.createElement('div');
			        listContainer2.appendChild(listShow);
					
					var dimY = y.length;
					for (var i=0; i < y.length; i++) {
					  names[i] = y[i].getElementsByTagName("Title")[0].textContent;
					  layer[i] = y[i].getElementsByTagName("Name")[0].textContent;
					  crs      = y[0].getElementsByTagName("CRS")[0].textContent;
					  bBox[i]  = y[i].getElementsByTagName("BoundingBox")[0];
					  
					  var nameLC    = names[i].toLowerCase();
					  var nameLCTab =  nameLC.split("_");
					  var finalLayerName='';
					  
					  for (var j=0; j < nameLCTab.length; j++) {
					  	if(j==0){
					  		var MajName = nameLCTab[j].replace(nameLCTab[j].charAt(0), nameLCTab[j].charAt(0).toUpperCase())
					  		finalLayerName += MajName + ' ';
					  		
					  	} else{
						   finalLayerName += nameLCTab[j]+' ';
						}
					  };

					  var bboxString = bBox[i].attributes[2].value+','+bBox[i].attributes[1].value +','+ bBox[i].attributes[4].value+','+bBox[i].attributes[3].value; 
					  var imageryRequestParam = serviceName + ';' + '1.1.1' + ';' +crs+ ';' + '' + ';' + 'GetMap'+ ';' +'image%2Fjpeg' + ';' + layer[i] + ';' + bboxString + ';' + widthMax + ';' +  heightMax;
  
					  var objRequest = {
						  	onlineResource      : onlineResource,
							imageryRequestParam : imageryRequestParam,
							paramCesiumRequest  : {
								                  planetName    : pn,
								                  satelliteName : sn, 
									              naifCode      : naifCode[0] +',' + naifCode[1]
							                     }
						  }
						   
					  
                          var satellN = objRequest.paramCesiumRequest.planetName;
						  var naif = objRequest.paramCesiumRequest.naifCode;
						  var onlineResUrl    = objRequest.onlineResource.replace('=', '--');
		   		          var cesiumUrl = 'http://localhost:8080/Apps/PlanetaryCesiumViewer/index.html?ellipsoidType=' + satellN + '&NAIFCodes=' + naif;
						  var finalUrl  = cesiumUrl + '&onlineResUrl='+ onlineResUrl + 'imageryProviderParams=' + imageryRequestParam; 
						   
						  var totalImageryRequest = JSON.stringify(objRequest);
						   
						  var btnSendRequest =  document.createElement('div');
				          btnSendRequest.className = 'cesium-showSystems-configContainer-button-send';
				          btnSendRequest.innerHTML = '<a href='+finalUrl+'><button></button></a>';
				          listShow.appendChild(btnSendRequest);
	
                          listShow.appendChild(document.createTextNode(finalLayerName));
						  listShow.innerHTML += '</br>';



					};
					listContainer2.innerHTML += '</form>';
				}
			}
		}
		
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
		
	    function cancelFunction(that){
			var configContainer = document.getElementById("configId");
			configContainer.className = "";
			configContainer.style.opacity = 0;
			configContainer.className = "cesium-showSystems-configContainer-transition";
			configContainer.style.left = windowsMove;
			that.isShowSystemActive = false;
		}
		
		function validateFunction(listContainer, btnContainer){	
		
			var inputTags = listContainer.getElementsByTagName("input");
			var paramsUrl;
			
			for (var i=0; i < inputTags.length; i++) {
			  if(inputTags[i].checked) {
			  	 paramsUrl = inputTags[i].value;
			  	 break;
			  };
           }
           
		   var paramsObject = JSON.parse(paramsUrl);

           if (typeof paramsUrl !== 'undefined') {
		   
		   	var onlineResUrl    = paramsObject.onlineResource.replace('=', '--');
			var imageryUrlparam = paramsObject.imageryRequestParam;
			
		   	if (paramsObject.paramCesiumRequest.satelliteName) {
		   	
		   		var sn = paramsObject.paramCesiumRequest.satelliteName;
		   		var naif = paramsObject.paramCesiumRequest.naifCode;
		   		var cesiumUrl = 'http://localhost:8080/Apps/PlanetaryCesiumViewer/index.html?ellipsoidType=' + sn + '&NAIFCodes=' + naif;
		   		
		   	} else if (!paramsObject.paramCesiumRequest.satelliteName) {
		   		var pn = paramsObject.paramCesiumRequest.planetName + 'IAU2000';
		   		var naif = paramsObject.paramCesiumRequest.naifCode;
		   		var cesiumUrl = 'http://localhost:8080/Apps/PlanetaryCesiumViewer/index.html?ellipsoidType=' + pn + '&NAIFCodes=' + naif;
		   	}
		   }

                var finalUrl = cesiumUrl + '&onlineResUrl='+ onlineResUrl + '&imageryProviderParams=' + imageryUrlparam;

                var btnSendRequest =  document.createElement('div');
				btnSendRequest.className = 'cesium-showSystems-configContainer-button-send';
				btnSendRequest.setAttribute('id', 'sendBtn')
				btnSendRequest.innerHTML = '<a href='+finalUrl+'><button>select</button></a>';
				btnContainer.appendChild(btnSendRequest);
		}
		
		

        var ShowSystemsViewModel = function(scene, configContainer, inputTag, listContainer, btnContainer, solarSystem) {

               this._scene  = scene;
               this._configContainer  = configContainer;
			   this._listContainer = listContainer;
			   this._btnContainer = btnContainer;
			   this._inputTag = inputTag
			   this.isShowSystemActive = false;
			   this.previousIndex = null;
			   this.isButtonVisible = {};
			   this.dim = getObjectSize(solarSystem);
			   
			   var dim = getObjectSize(solarSystem);
			     
			   for (var i=0; i < dim; i++) {
			   	this["buttonVisible_"+i] = false;
			   };
			   
               var that = this;
               var xhr = getRequest();

                this._command = createCommand(function(pn,  planetIndex, satelliteIndex) {
					var naifCode = [planetIndex, satelliteIndex];	
				  	showSystemsView(that, pn, that._configContainer, that._listContainer,  that._inputTag, that._btnContainer, xhr, naifCode);
				  	for (var i=0; i < dim; i++) {
			        	that["buttonVisible_"+i] = false;
			        };	
					that.isShowSystemActive = false;
				});
				
				this._commandSatellite = createCommand(function(pn, sn, planetIndex, satelliteIndex) {	
				
				    var naifCode = [planetIndex, satelliteIndex];
				  	showSystemsSatelliteView(that, pn, sn, that._configContainer, that._listContainer, that._btnContainer, xhr, naifCode);
						for (var i=0; i < dim; i++) {
			        	that["buttonVisible_"+i] = false;
			        };	
					that.isShowSystemActive = false;
				});
				
				this._showSystem = createCommand(function(index) {
					
					if (that.isShowSystemActive && that.previousIndex == index) {
						for (var i = 0; i < dim; i++) {
							that["buttonVisible_" + i] = false;
						};
						cancelFunction(that);
						that.isShowSystemActive = false;
					}else if (that.previousIndex != index){
						
						for (var i = 0; i < dim; i++) {
							that["buttonVisible_" + i] = false;
						};
						
						that['buttonVisible_' + index] = !that['buttonVisible_' + index];
						cancelFunction(that);
						that.isShowSystemActive = true;
						that.previousIndex = index;
						
					} else if (!that.isShowSystemActive){
						
						for (var i = 0; i < dim; i++) {
							that["buttonVisible_" + i] = false;
						};
						
						that['buttonVisible_' + index] = !that['buttonVisible_' + index];
						cancelFunction(that);
						that.isShowSystemActive = true;
						that.previousIndex = index;
					}					
				});

				this._cancelCommand = createCommand(function() {	
				that.isShowSystemActive = false;
				  	cancelFunction(that);
				});

				this._validateCommand = createCommand(function() {	
				  	validateFunction(that._listContainer, that._btnContainer);
				});
				  
               /** Gets or sets the tooltip.  This property is observable.
               *
               * @type {String}
               */
               this.tooltip         = 'Show this system';
               this.tooltip2        = 'Show this planet';
			   this.tooltip3        = 'Show this satellite';
              knockout.track(this, ['tooltip', 'tooltip2', 'tooltip3', 'cancelCommand2', 'buttonVisible', 'buttonVisible_0',  'buttonVisible_1',  'buttonVisible_2',  'buttonVisible_3',  'buttonVisible_4', 'buttonVisible_5', 'buttonVisible_6', 'buttonVisible_7']);
           }; 

		   defineProperties(ShowSystemsViewModel.prototype, {		
           /**
            * Gets the Command that is executed when the button is clicked.
            * @memberof HomeButtonViewModel.prototype
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
               
              /* testCommand : {
               get : function() {
                   return this._testCommand;
                   }
               }, */
               
               validateCommand : {
               get : function() {
                   return this._validateCommand;
                   }
               }, 
			   	   	   
           });


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