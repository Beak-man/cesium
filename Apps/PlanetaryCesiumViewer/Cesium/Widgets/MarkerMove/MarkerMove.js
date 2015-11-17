/*global define*/
define([
        '../../Core/Color',
        '../../Core/defineProperties', 
        '../getElement',
        '../../ThirdParty/knockout',
        '../../Core/ScreenSpaceEventHandler',
        '../../Core/ScreenSpaceEventType'
		],function(
            Color,
            defineProperties,
            getElement,
            knockout,
            ScreenSpaceEventHandler,
            ScreenSpaceEventType) { 
                "use strict";

                var selectMarker = function(toolbar, container, scene){

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
                            
                                var cartesian = scene.camera.pickEllipsoid(click.position, ellipsoid);
                               // console.log(entity);
                                
                                if (lastEntity) {
									
									lastEntityMoved = lastEntity;
                                    lastEntity.position._value = cartesian;
                                    lastEntity._billboard.color = new Color(0.0, 1.0, 0.0, 1.0);
									lastEntityMoved._billboard.color = new Color(0.0, 1.0, 0.0, 1.0);
                                    entity = 'undefined'
									lastEntity = null;
									pickedObject = null;
                                }
                            }, ScreenSpaceEventType.RIGHT_CLICK);
                            
							
							
							
                        }    
               }, ScreenSpaceEventType.LEFT_CLICK);
            }

            var MarkerMove = function(toolbar, container, scene){
               var sm = selectMarker(toolbar, container, scene);
            }
         return MarkerMove;
});