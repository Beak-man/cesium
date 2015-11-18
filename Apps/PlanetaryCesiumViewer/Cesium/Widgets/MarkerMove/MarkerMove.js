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

            /*    var selectMarker = function(toolbar, container, scene){

                    var lastEntity;
					var lastEntityMoved;
                    var element;
                    var ellipsoid = scene.globe.ellipsoid;
					
                    var handler = new ScreenSpaceEventHandler(scene.canvas);
                    
                    
                    handler.setInputAction(function(click){

                        var pickedObject = scene.pick(click.position);

                        if (pickedObject) {
							
                           var entity = pickedObject.primitive.id;
                            entity._billboard.color = new Color(1.0, 1.0, 0.0, 1.0);
							
							console.log(pickedObject);
							
							
                            if (lastEntity && lastEntity != entity) { // deuxieme coups et plus
                                lastEntity._billboard.color = new Color(1.0, 1.0, 1.0, 1.0);
                                lastEntity = entity;
								entity = null;
								
                            } else if (!lastEntity) {  // premier coups
                                    lastEntity = entity;
									entity = null;
									
                            } else if (lastEntity && lastEntity == entity) { // deuxieme coups et plus
                                        lastEntity._billboard.color = new Color(1.0, 1.0, 0.0, 1.0);
                                        lastEntity = entity;
										entity = null;
                                    }
                            
                            
                            var handler = new ScreenSpaceEventHandler(scene.canvas);
                            handler.setInputAction(function(click){
                            
                                var cartesian    = scene.camera.pickEllipsoid(click.position, ellipsoid);
								var cartographic = ellipsoid.cartesianToCartographic(cartesian);
                                
                                if (lastEntity) {
									
									
									if (!lastEntity.properties.modifed_lat) lastEntity.addProperty("modifed_lat");
									if (!lastEntity.properties.modifed_lon) lastEntity.addProperty("modifed_lon");
									
									lastEntityMoved = lastEntity;
                                    lastEntity.position._value = cartesian;
									
									
									lastEntity.properties.modifed_lat = CesiumMath.toDegrees(cartographic.latitude); 
									lastEntity.properties.modifed_lon = CesiumMath.toDegrees(cartographic.longitude); ; 
									
									console.log(lastEntity.features);
									
                                    lastEntity._billboard.color      = new Color(0.0, 1.0, 0.0, 1.0);
									lastEntityMoved._billboard.color = new Color(0.0, 1.0, 0.0, 1.0);
									
									// document.location = 'data:json/octet-stream,' + JSON.stringify(lastEntity.properties);
									
                                    entity = 'undefined'
									lastEntity = null;
									pickedObject = null;
									
									
									var txtData = "toto";
                                }
                            }, ScreenSpaceEventType.RIGHT_CLICK);	
							
                        }    
               }, ScreenSpaceEventType.LEFT_CLICK);
            }*/

            var MarkerMove = function(toolbar, container, scene, viewer){
				
				
			if(!window.sessionStorage.getItem("geoJsonData"))	window.sessionStorage.setItem("geoJsonData", {});
				
            //var sm = selectMarker(toolbar, container, scene);
			
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