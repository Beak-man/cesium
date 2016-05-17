/*global define*/
define([
    '../../Core/Math',
    '../../Core/Color',
    '../../Core/defineProperties',
    '../getElement',
    '../../ThirdParty/knockout',
    './ShowSystemsViewModel',
], function (
        CesiumMath,
        Color,
        defineProperties,
        getElement,
        knockout,
        ShowSystemsViewModel) {
    "use strict";

    function getXMLHttpRequest() {
        if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
            var xhr = new XMLHttpRequest();
        } else if (typeof ActiveXObject !== " undefined") {
            var xhr = new ActiveXObject("Microsoft.XMLHTTP"); // activeX pour IE
        } else {
            console.log("AJAX don't available on this browser");
            var xhr = null;
        }
        return xhr;
    }

    function createUI(viewerContainer, PlanetsToolbar, footerToolbar, scene, viewer, solarSystem, systemsDimensions, that) {

        var count = 0;
        var i;

        // on parcours l'objet solarSystem construit a partir du fichier de config avec AJAX
        for (i in solarSystem) {

            var planetarySystem = solarSystem[i];
            var systemsDimensionsProperty = i + "System";
            var objectDimensions = systemsDimensions[systemsDimensionsProperty];

            // On recupere le nom de l'astre
            var name = planetarySystem[0];

            // if (name !== ''){

            var planetName = planetarySystem[0].replace(planetarySystem[0].charAt(0), planetarySystem[0].charAt(0).toUpperCase());


            // Si la planete possède un ou plusieurs satellites
            if (planetarySystem.length > 1) {

                if (name !== '') {

                    // on cree le container qui va contenir les sous-boutons 
                    window[name + 'Wrapper'] = document.createElement('span');
                    window[name + 'Wrapper'].className = 'cesium-planetsToolbar-button cesium-showSystems-wrapper';
                    PlanetsToolbar.appendChild(window[name + 'Wrapper']);

                    // on cree le bouton pour le systeme afin d'acceder à la planete et a ses satellites 
                    window[name + 'SystemButton'] = document.createElement('div');
                    window[name + 'SystemButton'].className = 'cesium-button-planet cesium-planetsToolbar-button';
                    window[name + 'SystemButton'].innerHTML = planetName;
                    window[name + 'SystemButton'].style.cssText = 'font-family : Arial; position:relative; top:-2px; left:-3px;';
                    window[name + 'SystemButton'].setAttribute('data-bind', 'attr: { title: tooltip}, click: showSystem.bind($data,"' + count + '")');
                    window[name + 'Wrapper'].appendChild(window[name + 'SystemButton']);

                }

                // On parcours le systeme planetaire (j=0 c'est la planète. J>0 ce sont les satellites
                for (var j = 0; j < planetarySystem.length; j++) {

                    // on fait un traitement specifique pour la planete 
                    if (j == 0) {

                        var name = planetarySystem[j];

                        if (name != '') {

                            var dimensions = [objectDimensions[name].x, objectDimensions[name].y, objectDimensions[name].z];

                            var planetName = name.replace(name.charAt(0), name.charAt(0).toUpperCase());

                            window[name + 'Button'] = document.createElement('div');
                            window[name + 'Button'].className = 'cesium-button-planet cesium-planetsToolbar-button cesium-showSystems-dropDown-icon';
                            window[name + 'Button'].innerHTML = planetName;
                            window[name + 'Button'].style.cssText = 'font-family : Arial; position:relative; left:-3px;';
                            window[name + 'Button'].setAttribute('data-bind', 'attr: { title: tooltip2}, click: command.bind($data, "' + planetName + '", "' + (count + 1) + '", "' + j + '", "' + dimensions + '"), \
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
                            window[name + 'Button'].setAttribute('data-bind', 'attr: { title: tooltip3}, click: commandSatellite.bind($data, "' + planetarySystem[0] + '","' + astreName + '", "' + (count + 1) + '", "' + j + '","' + dimensions + '"), \
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
                    window[name + 'Button'].setAttribute('data-bind', 'attr: { title: tooltip}, click: command.bind($data, "' + planetName + '","' + (count + 1) + '", "' + 0 + '", "' + dimensions + '")');             // +'", "'+x+'", "'+y+'", "'+z+'")');
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

        var viewModel = new ShowSystemsViewModel(viewer, scene, viewerContainer, footerToolbar, configContainer, listContainer, btnContainer, btnHideVectorialData, solarSystem);
        that._viewModel = viewModel;

        knockout.applyBindings(viewModel, PlanetsToolbar);
    }


    function getDataSolarSystem(xhr, method, url, async, viewerContainer, PlanetsToolbar, footerToolbar, scene, viewer, that) {

        xhr.open(method, url, async);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.send();
        xhr.onreadystatechange = function () {

            if (xhr.readyState == 4 && xhr.status == 200 || xhr.status == 0) {

                var data = xhr.responseText;
                var jsonData = JSON.parse(data);
                var solarSystem = jsonData.solarSystem;
                var systemsDimensions = jsonData.systemsDimensions;

                createUI(viewerContainer, PlanetsToolbar, footerToolbar, scene, viewer, solarSystem, systemsDimensions, that);
            }
        }
    }

    var ShowSystems = function (viewerContainer, PlanetsToolbar, footerToolbar, scene, viewer) {

        var that = this;
        var xhr = getXMLHttpRequest();
        // var url = 'Cesium/Widgets/ShowSystems/SolarSystemConfig.json';
        var url = '../../Source/Widgets/ConfigurationFiles/SolarSystemConfig.json';

        getDataSolarSystem(xhr, 'GET', url, true, viewerContainer, PlanetsToolbar, footerToolbar, scene, viewer, that);
    }

    defineProperties(ShowSystems.prototype, {
        viewModel: {
            get: function () {
                return this._viewModel;
            }
        },
    });

    return ShowSystems;
});