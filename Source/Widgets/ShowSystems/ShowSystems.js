/*global define*/
define([
        '../../Core/defineProperties',
        '../../ThirdParty/knockout',
        './ShowSystemsViewModel',
        
    ], function(
        defineProperties,
        knockout,
        ShowSystemsViewModel) {
    "use strict";

    function createUI(viewerContainer, PlanetsToolbar, footerToolbar, scene, viewer, configuration, that, isWidgetVisible) {


        var solarSystem = configuration.planetarySystem.system;
        var systemsDimensions = configuration.planetarySystem.dimension;

        var count = 0;
        var i;

        for (i in solarSystem) {

            var planetarySystem = solarSystem[i];
            var systemsDimensionsProperty = i + "System";
            var objectDimensions = systemsDimensions[systemsDimensionsProperty];

            var name = planetarySystem[0];

            var planetName = planetarySystem[0].replace(planetarySystem[0].charAt(0), planetarySystem[0].charAt(0).toUpperCase());


            // if the planet have one or several satellites
            if (planetarySystem.length > 1) {

                if (name !== '') {

                    // window[name + 'Wrapper'] allow to create variables dinamically

                    // create the container that contains the sub-buttons
                    window[name + 'Wrapper'] = document.createElement('span');
                    window[name + 'Wrapper'].className = 'cesium-planetsToolbar-button cesium-showSystems-wrapper';
                    PlanetsToolbar.appendChild(window[name + 'Wrapper']);

                    // crete button for the planetary system to acces to the planet and it stallites
                    window[name + 'SystemButton'] = document.createElement('div');
                    window[name + 'SystemButton'].className = 'cesium-button-planet cesium-planetsToolbar-button';
                    window[name + 'SystemButton'].innerHTML = planetName;
                    window[name + 'SystemButton'].style.cssText = 'font-family : Arial; position:relative; top:-2px; left:-3px;';
                    window[name + 'SystemButton'].setAttribute('data-bind', 'attr: { title: tooltip}, click: showSystem.bind($data,"' + count + '")');
                    window[name + 'Wrapper'].appendChild(window[name + 'SystemButton']);
                }

                // go throught the planetary system (j=0 is the planet. J>0 is its satellite )
                for (var j = 0; j < planetarySystem.length; j++) {

                    if (j == 0) {

                        var name = planetarySystem[j];

                        if (name != '') {

                            var dimensions = [objectDimensions[name].x, objectDimensions[name].y, objectDimensions[name].z];

                            var planetName = name.replace(name.charAt(0), name.charAt(0).toUpperCase());

                            window[name + 'Button'] = document.createElement('div');
                            window[name + 'Button'].className = 'cesium-button-planet cesium-planetsToolbar-button cesium-showSystems-dropDown-icon';
                            window[name + 'Button'].innerHTML = planetName;
                            window[name + 'Button'].style.cssText = 'font-family : Arial; position:relative; left:-3px;';
                            window[name + 'Button'].setAttribute('data-bind', 'attr: { title: tooltip2}, \
                                         click: command.bind($data, "' + planetName + '", "' + (count + 1) + '", "' + j + '", "' + dimensions + '"), \
					 css: { "cesium-showSystems-visible" : buttonVisible_' + count + ',\
					 "cesium-showSystems-hidden"  : !buttonVisible_' + count + '}');
                            window[planetarySystem[0] + 'Wrapper'].appendChild(window[name + 'Button']);
                        }

                    } else {

                        var name = planetarySystem[j];

                        if (name !== '') {

                            var astreName = name.replace(name.charAt(0), name.charAt(0).toUpperCase());
                            var dimensions = [objectDimensions[name].x, objectDimensions[name].y, objectDimensions[name].z];


                            window[name + 'Button'] = document.createElement('div');
                            window[name + 'Button'].className = 'cesium-button-planet cesium-planetsToolbar-button cesium-showSystems-dropDown-icon';
                            window[name + 'Button'].innerHTML = astreName;
                            window[name + 'Button'].style.cssText = 'font-family : Arial; position:relative; left:-3px;';
                            window[name + 'Button'].setAttribute('data-bind', 'attr: { title: tooltip3}, click: commandSatellite.bind($data, \
                                 "' + planetarySystem[0] + '","' + astreName + '", "' + (count + 1) + '", "' + j + '","' + dimensions + '"), \
				                                          css: { "cesium-showSystems-visible" :  buttonVisible_' + count + ',\
					                                        "cesium-showSystems-hidden"  : !buttonVisible_' + count + '}');
                            window[planetarySystem[0] + 'Wrapper'].appendChild(window[name + 'Button']);
                        }
                    }
                }
                ;

            } else if (planetarySystem.length == 1) {

                var name = planetarySystem[0];

                if (name !== '') {

                    var planetName = name.replace(name.charAt(0), name.charAt(0).toUpperCase());

                    var dimensions = [objectDimensions[name].x, objectDimensions[name].y, objectDimensions[name].z];

                    window[name + 'Button'] = document.createElement('div');
                    window[name + 'Button'].className = 'cesium-button-planet cesium-planetsToolbar-button';
                    window[name + 'Button'].innerHTML = planetName;
                    window[name + 'Button'].setAttribute('data-bind', 'attr: { title: tooltip}, click: command.bind($data, "\
                           ' + planetName + '","' + (count + 1) + '", "' + 0 + '", "' + dimensions + '")');             // +'", "'+x+'", "'+y+'", "'+z+'")');
                    PlanetsToolbar.appendChild(window[name + 'Button']);
                }
            }
            count++;
        }

        /* var customButton = document.createElement('div');
         customButton.className = 'cesium-button-planet cesium-planetsToolbar-button';
         customButton.innerHTML = 'Custom.';
         //customButton.setAttribute('data-bind', 'attr: { title: tooltip}, click: command.bind($data, "Custom")');
         PlanetsToolbar.appendChild(customButton); */
        
        // ============================ test WMTS ==============================

      /*  var wmtsButttn = document.createElement('div');
        wmtsButttn.className = 'cesium-button-planet cesium-planetsToolbar-button';
        wmtsButttn.innerHTML = "WMTS";
        wmtsButttn.setAttribute('data-bind', 'click: WMTSCommand');           
        PlanetsToolbar.appendChild(wmtsButttn);*/

        // =====================================================================


        var configContainer = document.createElement('div');
        configContainer.className = 'cesium-showSystems-configContainer';
        configContainer.setAttribute('id', 'configId');
        PlanetsToolbar.appendChild(configContainer);

        var listContainer = document.createElement('div');
        listContainer.className = 'cesium-showSystems-listContainer';
        listContainer.setAttribute('id', 'listId');
        configContainer.appendChild(listContainer);

        var btnContainer = document.createElement('div');
        btnContainer.className = 'cesium-showSystems-btnContainer';
        configContainer.appendChild(btnContainer);

        var btnHide = document.createElement('BUTTON');
        btnHide.className = 'cesium-showSystems-configContainer-button cesium-button-planet';
        btnHide.innerHTML = 'Hide';
        btnHide.setAttribute('data-bind', 'click: hideCommand');
        btnContainer.appendChild(btnHide);

        var btnHideVectorialData = document.createElement('BUTTON');
        btnHideVectorialData.className = 'cesium-showSystems-configContainer-button cesium-button-planet';
        btnHideVectorialData.innerHTML = 'Hide vectorial data';
        btnHideVectorialData.setAttribute('data-bind', 'click: hideDataCommand');
        btnContainer.appendChild(btnHideVectorialData);

        var viewModel = new ShowSystemsViewModel(viewer, scene, viewerContainer, footerToolbar, configContainer, listContainer, btnContainer, btnHideVectorialData, solarSystem, configuration, isWidgetVisible);
        that._viewModel = viewModel;

        knockout.applyBindings(viewModel, PlanetsToolbar);
    }

    // ================================== MAIN FUNCTION =========================================================

    var ShowSystems = function (viewerContainer, PlanetsToolbar, footerToolbar, scene, viewer, configuration, isWidgetVisible) {

        var that = this;
        createUI(viewerContainer, PlanetsToolbar, footerToolbar, scene, viewer, configuration, that, isWidgetVisible);
    };

    defineProperties(ShowSystems.prototype, {
        viewModel: {
            get: function () {
                return this._viewModel;
            }
        }
    });

    return ShowSystems;
});
