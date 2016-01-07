/**
 * @author Omar Delaa
 */
 
define([
    '../../Core/Math',
    '../../Core/defineProperties', 
    '../../Core/ScreenSpaceEventHandler',
    '../../Core/ScreenSpaceEventType',
    '../../ThirdParty/knockout',  
    '../createCommand'], 
    function(
        CesiumMath, 
        defineProperties,
        ScreenSpaceEventHandler,
        ScreenSpaceEventType, 
        knockout,  
        createCommand) {
            "use strict"

            var coodDiv = null;

           function lngLatView(mainContainer, scene){	

                if (!coodDiv) {

                    var coordViewModel = {
                        longitude: null,
                        latitude: null
                    }

                    knockout.track(coordViewModel); 
                    var ellipsoid = scene.globe.ellipsoid;

                    var handler = new ScreenSpaceEventHandler(scene.canvas); 
                    handler.setInputAction(function(movement){

                        var cartesian = scene.camera.pickEllipsoid(movement.endPosition, ellipsoid); 
                        if (cartesian) { 
                            var cartographic = ellipsoid.cartesianToCartographic(cartesian);
                            var longitudeNumber = cartographic.longitude;

                            if (longitudeNumber < 0){
                                longitudeNumber = longitudeNumber + 2.0*Math.PI;
                            }

                            var longitudeString = CesiumMath.toDegrees(longitudeNumber).toFixed(4); 
                            var latitudeString = CesiumMath.toDegrees(cartographic.latitude).toFixed(4);
                            coordViewModel.longitude = longitudeString;
                            coordViewModel.latitude = latitudeString; 
                        }else { 
                            coordViewModel.longitude = null;
                            coordViewModel.latitude = null;
                        }
                    }, ScreenSpaceEventType.MOUSE_MOVE);
                    
                    coodDiv = document.createElement('div');
                    coodDiv.setAttribute("id", "coordinates");
                    coodDiv.className = 'coordinates';
                    coodDiv.style.cssText = 'background: rgba(42, 42, 42, 0.8);\
                                             padding: 4px; \
                                             border-radius: 4px; \
                                             color: white;\
                                             font-family: sans-serif;\
                                             position : absolute; \
                                             top : 40px;\
                                             right : 45%; \
                                             opacity: 1; \
                                             transition: opacity 1.0s linear; \
                                             -webkit-transition: opacity 1.0s linear; \
                                             -moz-transition: opacity 1.0s linear;';

                    coodDiv.innerHTML = '<table><tr><th>Longitude</th><th>Latitude</th></tr>' +
                                               '<tr><td id="longitude"><span data-bind="text: longitude"></span></td>' +
                                                   '<td id="latitude"><span data-bind="text: latitude"></span></td>';

                    mainContainer.appendChild(coodDiv);
                    
                    var coordinates = document.getElementById('coordinates');
                    knockout.applyBindings(coordViewModel, coordinates);

                } else if(coodDiv){

                    knockout.cleanNode(coodDiv);
                    mainContainer.removeChild(coodDiv);
                    coodDiv = null;
                };
           }

           var LngLatPanelViewModel = function(container, mainContainer, scene){ 

               this._container = container;
               this._mainContainer = mainContainer;
               this._scene = scene;

               var that = this;
               this._command = createCommand(function() {
                   lngLatView(that._mainContainer, that._scene);
               });

               /**
               * Gets or sets the tooltip.  This property is observable.
               *
               * @type {String}
               */
               this.tooltip = 'Coordinates';
               knockout.track(this, ['tooltip']);
           };

           defineProperties(LngLatPanelViewModel.prototype, {		
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
           });

           return LngLatPanelViewModel;
 });
