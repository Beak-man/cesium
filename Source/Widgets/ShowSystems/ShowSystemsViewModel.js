/*global define*/
define([
        '../../Core/Cartesian3',
        '../../Core/Color',
        '../../Core/defineProperties',
        '../../Core/Ellipsoid',
        '../../Core/EllipsoidTerrainProvider',
        '../../Core/freezeObject',
        '../../Core/GeographicProjection',
        '../../Core/GeographicTilingScheme',
        '../../Core/Matrix4',
        '../../Core/Rectangle',
        '../../Core/ScreenSpaceEventType',
        '../../Core/StereographicTilingScheme',
        '../../Core/WebMercatorProjection',
        '../../Core/WebMercatorTilingScheme',
        '../../DataSources/GeoJsonDataSource',
        '../../Scene/Camera',
        '../../Scene/Globe',
        '../../Scene/SingleTileImageryProvider',
        '../../Scene/WebMapServiceImageryProvider',
        '../../Scene/WebMapTileServiceImageryProvider',
        '../../ThirdParty/knockout',
        '../createCommand',
        '../VOData/VOData',
        './FooterViewModel',
        './ListViewModel'
    ], function(
        Cartesian3,
        Color,
        defineProperties,
        Ellipsoid,
        EllipsoidTerrainProvider,
        freezeObject,
        GeographicProjection,
        GeographicTilingScheme,
        Matrix4,
        Rectangle,
        ScreenSpaceEventType,
        StereographicTilingScheme,
        WebMercatorProjection,
        WebMercatorTilingScheme,
        GeoJsonDataSource,
        Camera,
        Globe,
        SingleTileImageryProvider,
        WebMapServiceImageryProvider,
        WebMapTileServiceImageryProvider,
        knockout,
        createCommand,
        VOData,
        FooterViewModel,
        ListViewModel) {
    'use strict';

    // Call function order : 

    // showPlanetView   : This function is used to show the layer list panel for a given planet and call 'moveAndfillPanel'
    // moveAndfillPanel : This function is used to move the layer list panel far a given planet and create the Ajax request to get 'capabilities'. Then 'getXmlPlanetData'.
    // getXmlPlanetData : This function is used to get the response of the capabilities request and parse the xml response to create the url for each layer.

    function showPlanetView(that, viewer, planetName, configContainer, listContainer, btnContainer, xhr, xhrNomen) {

        for (var i = 0; i < that.dim; i++) {
            that['buttonVisible_' + i] = false;
        }

        var sendBtn = document.getElementById('sendBtn');

        if (sendBtn) {
            btnContainer.removeChild(sendBtn);
        }

        if (configContainer.style.left !== that._windowsMove && configContainer.style.left !== '') {
            configContainer.className = '';
            configContainer.className = 'cesium-showSystems-configContainer-transition';
            configContainer.style.opacity = 0;
            configContainer.style.left = that._windowsMove;

            setTimeout(function () {
                moveAndfillPanel(that, viewer, planetName, configContainer, listContainer, xhr, xhrNomen);
            }, 900);
        }
        else {
            moveAndfillPanel(that, viewer, planetName, configContainer, listContainer, xhr, xhrNomen);
        }
    }

    function showSatelliteView(that, viewer, planetName, satelliteName, configContainer, listContainer, btnContainer, xhr, xhrNomen) {

        for (var i = 0; i < that.dim; i++) {
            that['buttonVisible_' + i] = false;
        }

        var sendBtn = document.getElementById('sendBtn');
        if (sendBtn) {
            btnContainer.removeChild(sendBtn);
        }

        if (configContainer.style.left !== that._windowsMove && configContainer.style.left !== '') {

            configContainer.className = '';
            configContainer.className = 'cesium-showSystems-configContainer-transition';
            configContainer.style.opacity = 0;
            configContainer.style.left = that._windowsMove;

            setTimeout(function () {
                moveAndfillPanelSatellite(that, viewer, planetName, satelliteName, configContainer, listContainer, xhr, xhrNomen);
            }, 900);
        }
        else {
            moveAndfillPanelSatellite(that, viewer, planetName, satelliteName, configContainer, listContainer, xhr, xhrNomen);
        }
    }

    function moveAndfillPanel(that, viewer, planetName, configContainer, listContainer, xhr, xhrNomen) {

        configContainer.className = '';
        configContainer.className = 'cesium-showSystems-configContainer';
        configContainer.style.visibility = 'visible';
        configContainer.style.opacity = 1;
        configContainer.style.left = '5px';

        var pn = planetName.toLowerCase();

        var mapType = that.configuration.servers.USGSserver.extension;

        var ajaxDataRequest = 'https://planetarymaps.usgs.gov/cgi-bin/mapserv?map=/maps/' + pn + '/' + pn + mapType[0] + '&service=WMS&request=GetCapabilities';

        var ajaxDataRequestNomen = 'https://wms.wr.usgs.gov/cgi-bin/mapserv?map=/var/www/html/mapfiles/' + pn + '/' + pn + '_nomen_wms.map&service=WMS&request=GetCapabilities';

        getXmlPlanetData(that, viewer, xhr, xhrNomen, 'post', ajaxDataRequest, ajaxDataRequestNomen, true, listContainer, pn);
    }

    function moveAndfillPanelSatellite(that, viewer, planetName, satelliteName, configContainer, listContainer, xhr, xhrNomen) {
        configContainer.className = '';
        configContainer.className = 'cesium-showSystems-configContainer';
        configContainer.style.visibility = 'visible';
        configContainer.style.opacity = 1;
        configContainer.style.left = '5px';

        var pn = planetName.toLowerCase();
        var ps = satelliteName.toLowerCase();

        var mapType = that.configuration.servers.USGSserver.extension;

        var ajaxRequest = 'https://planetarymaps.usgs.gov/cgi-bin/mapserv?map=/maps/' + pn + '/' + ps + mapType[0] + '&service=WMS&request=GetCapabilities';
        var ajaxDataRequestNomen = 'https://wms.wr.usgs.gov/cgi-bin/mapserv?map=/var/www/html/mapfiles/' + pn + '/' + ps + '_nomen_wms.map&service=WMS&request=GetCapabilities';

        getXmlDataSatellite(that, viewer, xhr, xhrNomen, 'post', ajaxRequest, ajaxDataRequestNomen, true, listContainer, pn, ps);
    }

    function getXmlPlanetData(that, viewer, xhr, xhrNomen, method, url, urlNomen, async, listContainer, pn) {

        if (viewer.tools) {
            viewer.tools.viewModel.removeAllCommands;
        }

        var listViewModel;
        var listContainer2;

        xhr.open(method, url, async);
        xhr.withCredentials = false;
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send();

        listContainer.innerHTML = '';

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200 || xhr.status === 0) {
                var data = xhr.responseXML;
                try {

                    var service = data.getElementsByTagName('Service');
                    var onlineResource = service[0].getElementsByTagName('OnlineResource')[0].getAttributeNS('http://www.w3.org/1999/xlink', 'href');
                    var capability = data.getElementsByTagName('Capability');
                    var layersIni = capability[0].getElementsByTagName('Layer');

                    var names = [];
                    var title = [];
                    var abstract = [];
                    var layerName = [];
                    var layer = [];
                    var imageryProvidersTab = [];

                    var crs = layersIni[0].getElementsByTagName('CRS')[0].textContent;

                    var PlanetName = pn.replace(pn.charAt(0), pn.charAt(0).toUpperCase());

                    listContainer2 = document.createElement('div');
                    listContainer2.setAttribute('id', 'listId');
                    listContainer.appendChild(listContainer2);

                    listContainer2.innerHTML = PlanetName + ' : </br>';
                    listContainer2.innerHTML += '</br>';

                    var listShow = document.createElement('div');
                    listShow.setAttribute('id', 'listShowId');
                    listContainer2.appendChild(listShow);

                    var tableList = document.createElement('TABLE');
                    listShow.appendChild(tableList);

                    var layers = [];

                    for (var i = 0; i < layersIni.length; i++) {

                        if (layersIni[i].getAttribute('queryable')) {
                            layers.push(layersIni[i]);
                        }
                    }
                    var dimLayers = layers.length;

                    for (var i = 0; i < layers.length; i++) {

                        names[i] = layers[i].getElementsByTagName('Name')[0].textContent;
                        layer[i] = layers[i].getElementsByTagName('Name')[0].textContent;
                        title[i] = layers[i].getElementsByTagName('Title')[0].textContent;
                        abstract[i] = layers[i].getElementsByTagName('Abstract')[0].textContent;

                        var abstr = abstract[i].toString();

                        // ======================= test for '\n' ==========================

                        var testReg = new RegExp('\n');

                        if (testReg.test(abstr)) {
                            var abstr = abstract[i].replace(/\n/g, ' ');
                        }

                        var nameLowCase = names[i].toLowerCase();
                        var nameLowCaseTab = nameLowCase.split('_');
                        var finalLayerName = '';

                        for (var j = 0; j < nameLowCaseTab.length; j++) {
                            if (j === 0) {
                                var MajName = nameLowCaseTab[j].replace(nameLowCaseTab[j].charAt(0), nameLowCaseTab[j].charAt(0).toUpperCase());
                                finalLayerName += MajName + ' ';

                            } else {
                                finalLayerName += nameLowCaseTab[j] + ' ';
                            }
                        }

                        var tableLine = document.createElement('TR');
                        tableList.appendChild(tableLine);

                        var colomn1 = document.createElement('TD');
                        tableLine.appendChild(colomn1);

                        var btnShowLayer = document.createElement('INPUT');
                        btnShowLayer.type = 'checkbox';
                        btnShowLayer.className = 'cesium-showSystems-configContainer-button-send';
                        btnShowLayer.setAttribute('data-bind', 'attr: { title:\"' + abstr + '\"},checked : show_' + i);
                        colomn1.appendChild(btnShowLayer);

                        var colomn2 = document.createElement('TD');
                        tableLine.appendChild(colomn2);

                        colomn2.appendChild(document.createTextNode(finalLayerName));

                        var colomn3 = document.createElement('TD');
                        colomn3.className = 'cesium-showSystems-configContainer-colomn3';
                        tableLine.appendChild(colomn3);

                        var inputRange = document.createElement('INPUT');
                        inputRange.type = 'range';
                        inputRange.min = '0';
                        inputRange.max = '1';
                        inputRange.step = '0.05';
                        inputRange.setAttribute('data-bind', 'value: alpha_' + i + ', valueUpdate: \"input\"');
                        colomn3.appendChild(inputRange);

                        layerName[i] = finalLayerName;

                        var strTest = 'Quad';

                        if (names[i].indexOf(strTest) > -1) { // for quads

                            imageryProvidersTab[i] = new WebMapServiceImageryProvider({
                                url: onlineResource,
                                parameters: {format: 'image/png; mode=8bit'},
                                layers: layer[i],
                                credit: 'USGS @ wms.wr.usgs.gov',
                                ellipsoid: that._ellipsoid,
                                enablePickFeatures: false
                            });




                        } else if (names[i].indexOf(strTest) === -1) { // for npoles et spoles maps

                            if (crs === 'EPSG:32761' || crs === 'EPSG:32661') {

                                var bboxAttributesTab = layersIni[0].getElementsByTagName('BoundingBox')[0].attributes;

                                var minx = convertToDecimal(bboxAttributesTab[1].nodeValue); // following the xml file
                                var miny = convertToDecimal(bboxAttributesTab[2].nodeValue); // following the xml file
                                var maxx = convertToDecimal(bboxAttributesTab[3].nodeValue); // following the xml file
                                var maxy = convertToDecimal(bboxAttributesTab[4].nodeValue); // following the xml file

                                var bboxString = minx + ',' + miny + ',' + maxx + ',' + maxy;

                                //                         W = -220.96  S =38.2  E = 135  N = 86.78
                                var rect = Rectangle.fromDegrees(-180., 38.2, 180., 89.999999);
                                //  var rect = Rectangle.fromDegrees(-220.96, 38.2, 135, 86.78);

                                var tilngSchemeOptions = {
                                    ellipsoid: that._ellipsoid,
                                    rectangle: rect,
                                    numberOfLevelZeroTilesX: 1,
                                    numberOfLevelZeroTilesY: 1
                                };

                                //   console.log(tilngSchemeOptions);
                                //  console.log('before imageryProvidersTab');

                                /*   imageryProvidersTab[i] = new WebMapServiceImageryProvider({
                                 url: onlineResource,
                                 parameters: {
                                 format: 'image/jpeg',
                                 service: 'WMS',
                                 bbox: bboxString,
                                 //    bbox: '0,0,1000000,1000000',
                                 srs: crs},
                                 layers: layer[i],
                                 credit: 'USGS @ wms.wr.usgs.gov',
                                 ellipsoid: that._ellipsoid,
                                 enablePickFeatures: false,
                                 rectangle: rect,
                                 tilingScheme: new StereographicTilingScheme(tilngSchemeOptions),
                                 // tilingScheme: new GeographicTilingScheme(tilngSchemeOptions),
                                 //  tileWidth : 2048,
                                 //  tileHeight : 2048
                                 });*/

                                //  console.log('before SingleTileImageryProvider');

                                /*      imageryProvidersTab[i] = new SingleTileImageryProvider({
                                 url: 'http://planetarymaps.usgs.gov/cgi-bin/mapserv?format=image/jpeg&service=WMS&bbox=-2357030,-2357030,2357030,2357030&srs=EPSG:32661&version=1.1.1&request=GetMap&styles=&map=/maps/mars/mars_npole.map&=&layers=MOLA_color_north&width=2048&height=2048',
                                 rectangle: rect,
                                 ellipsoid: that._ellipsoid,
                                 });*/


                                //    console.log(imageryProvidersTab[i]);

                            } else { // pour les autres maps

                                imageryProvidersTab[i] = new WebMapServiceImageryProvider({
                                    url: onlineResource,
                                    parameters: {format: 'image/jpeg'},
                                    layers: layer[i],
                                    credit: 'USGS @ wms.wr.usgs.gov',
                                    ellipsoid: that._ellipsoid,
                                    enablePickFeatures: false
                                });
                                //    console.log(imageryProvidersTab[i]);
                            }
                        }
                    }

                    /* ========================================================= 
                     =================== NOMENCLATURE LAYERS =================== 
                     =========================================================== */

                    xhrNomen.open(method, urlNomen, async);
                    xhrNomen.withCredentials = false;
                    xhrNomen.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                    xhrNomen.send();

                    xhrNomen.onreadystatechange = function () {
                        if (xhrNomen.readyState === 4 && xhrNomen.status === 200 || xhrNomen.status === 0) {

                            var data = xhrNomen.responseXML;
                            
                            console.log(data);

                            try {

                                var nomenNames = [];
                                var nomenTitle = [];
                                var nomenAbstract = [];
                                var nomenLayerName = [];
                                var nomenLayer = [];
                                var nomenImageryProvidersTab = [];

                                var layerNomenCount = 0;

                                var service = data.getElementsByTagName('Service');
                                var onlineResource = service[0].getElementsByTagName('OnlineResource')[0].getAttributeNS('http://www.w3.org/1999/xlink', 'href');
                                var capability = data.getElementsByTagName('Capability');
                                var layersIni = capability[0].getElementsByTagName('Layer');

                                var nomenclatureLayers = [];

                                for (var i = 0; i < layersIni.length; i++) {

                                    if (layersIni[i].getAttribute('queryable')) {
                                        nomenclatureLayers.push(layersIni[i]);
                                    }
                                }

                                for (var i = 0; i < nomenclatureLayers.length; i++) {

                                    nomenNames[i] = nomenclatureLayers[i].getElementsByTagName('Name')[0].textContent;
                                    nomenLayer[i] = nomenclatureLayers[i].getElementsByTagName('Name')[0].textContent;
                                    nomenTitle[i] = nomenclatureLayers[i].getElementsByTagName('Title')[0].textContent;
                                    nomenAbstract[i] = nomenclatureLayers[i].getElementsByTagName('Abstract')[0].textContent;

                                    var abstrNomm = nomenAbstract[i].toString();
                                    var testReg = new RegExp('\n');

                                    if (testReg.test(abstrNomm)) {
                                        abstrNomm = nomenAbstract[i].replace(/\n/g, ' ');
                                    }

                                    if (nomenNames[i] === 'NOMENCLATURE_180') {

                                        var nameLowCase = nomenNames[i].toLowerCase();
                                        var nameLowCaseTab = nameLowCase.split('_');
                                        var finalNomenLayerName = '';

                                        for (var j = 0; j < nameLowCaseTab.length; j++) {
                                            if (j === 0) {
                                                var MajName = nameLowCaseTab[j].replace(nameLowCaseTab[j].charAt(0), nameLowCaseTab[j].charAt(0).toUpperCase());
                                                finalNomenLayerName += MajName + ' ';

                                            } else {
                                                finalNomenLayerName += nameLowCaseTab[j] + ' ';
                                            }
                                        }

                                        // create a ligne for the nomenclature

                                        var tableLine = document.createElement('TR');
                                        tableList.appendChild(tableLine);

                                        // chekbox

                                        var colomn1 = document.createElement('TD');
                                        tableLine.appendChild(colomn1);

                                        layerNomenCount = layerNomenCount + 1;
                                        var showIndex = dimLayers + layerNomenCount - 1;

                                        var btnShowLayer = document.createElement('INPUT');
                                        btnShowLayer.type = 'checkbox';
                                        btnShowLayer.className = 'cesium-showSystems-configContainer-button-send';
                                        btnShowLayer.setAttribute('data-bind', 'attr: { title:\"' + abstrNomm + '\"},checked : show_' + showIndex);
                                        colomn1.appendChild(btnShowLayer);

                                        // Layer name

                                        var colomn2 = document.createElement('TD');
                                        tableLine.appendChild(colomn2);

                                        colomn2.appendChild(document.createTextNode(finalNomenLayerName));

                                        // range to manage the opacity

                                        var colomn3 = document.createElement('TD');
                                        colomn3.className = 'cesium-showSystems-configContainer-colomn3';
                                        tableLine.appendChild(colomn3);

                                        var inputRange = document.createElement('INPUT');
                                        inputRange.type = 'range';
                                        inputRange.min = '0';
                                        inputRange.max = '1';
                                        inputRange.step = '0.05';
                                        inputRange.setAttribute('data-bind', 'value: alpha_' + showIndex + ', valueUpdate: \"input\"');
                                        colomn3.appendChild(inputRange);

                                        var nomenImageryProvider = new WebMapServiceImageryProvider({
                                            url: onlineResource,
                                            parameters: {format: 'image/png; mode=8bit'},
                                            layers: nomenLayer[i],
                                            credit: 'USGS @ wms.wr.usgs.gov',
                                            ellipsoid: that._ellipsoid,
                                            enablePickFeatures: false
                                        });

                                        nomenLayerName.push(finalNomenLayerName);
                                        nomenImageryProvidersTab.push(nomenImageryProvider);
                                    }
                                }

                                for (var k = 0; k < nomenLayerName.length; k++) {
                                    layerName.push(nomenLayerName[k]);
                                    imageryProvidersTab.push(nomenImageryProvidersTab[k]);
                                }

                                //  Create the model and binding

                                listViewModel = new ListViewModel(viewer, layerName.length, layerName, imageryProvidersTab);
                                knockout.cleanNode(listContainer2);
                                knockout.applyBindings(listViewModel, listContainer2);

                            } catch (e) {

                                 console.log(e);

                                listViewModel = new ListViewModel(viewer, layerName.length, layerName, imageryProvidersTab);
                                knockout.cleanNode(listContainer2);
                                knockout.applyBindings(listViewModel, listContainer2);
                            }
                        }
                    };
                } catch (e) {
                      console.log(e);
                }
            }
        };
    }


    function  convertToDecimal(str) {

        var expr = 'e+';
        if (str.indexOf(expr) > -1) {

            var strSplitedTab = str.split(expr);
            var val = parseFloat(strSplitedTab[0]);
            var exp = parseFloat(strSplitedTab[1]);
            var decimaleValue = val * Math.pow(10, exp);

            return decimaleValue.toString();
        } else {

            console.log('bounding box values incorrect');
            return null;

        }
    }


    function getXmlDataSatellite(that, viewer, xhr, xhrNomen, method, url, urlNomen, async, listContainer, pn, sn) {

        xhr.open(method, url, async);
        xhr.withCredentials = false;
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send();

        listContainer.innerHTML = '';
        var satelliteName = sn.replace(sn.charAt(0), sn.charAt(0).toUpperCase());

        /* === set some HTML containers for the vizualisation === */

        var listContainer2 = document.createElement('div');
        listContainer2.setAttribute('id', 'listId');
        listContainer.appendChild(listContainer2);

        listContainer2.innerHTML = satelliteName + ' : </br>';
        listContainer2.innerHTML += ' </br>';

        var listShow = document.createElement('div');
        listContainer2.appendChild(listShow);

        var tableList = document.createElement('TABLE');
        listShow.appendChild(tableList);

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200 || xhr.status === 0) {
                var data = xhr.responseXML;

                try {

                    /* ==== get informations from the XML file ==== */

                    var service = data.getElementsByTagName('Service');
                    var onlineResource = service[0].getElementsByTagName('OnlineResource')[0].getAttributeNS('http://www.w3.org/1999/xlink', 'href');
                    var capability = data.getElementsByTagName('Capability');
                    var layersIni = capability[0].getElementsByTagName('Layer');


                    /* ==== declaration of variables ==== */

                    var names = [];
                    var title = [];
                    var abstract = [];
                    var layerName = [];
                    var layer = [];
                    var imageryProvidersTab = [];

                    /* ==== get informations from tables previously built ==== */

                    var layers = [];

                    for (var i = 0; i < layersIni.length; i++) {

                        if (layersIni[i].getAttribute('queryable')) {
                            layers.push(layersIni[i]);
                        }
                    }

                    var dimLayers = layers.length;

                    for (var i = 0; i < layers.length; i++) {

                        if (layers[i].getAttribute('queryable')) {

                            names[i] = layers[i].getElementsByTagName('Name')[0].textContent;
                            title[i] = layers[i].getElementsByTagName('Title')[0].textContent;
                            abstract[i] = layers[i].getElementsByTagName('Abstract')[0].textContent;
                            layer[i] = layers[i].getElementsByTagName('Name')[0].textContent;

                            var abstr = abstract[i].toString();

                            // ======================= test for '\n' ==========================

                            var testReg = new RegExp('\n');

                            if (testReg.test(abstr)) {
                                var abstr = abstract[i].replace(/\n/g, ' ');
                            }


                            /* === transform the first case to UpperCase (for the vizualiation only : not Important) === */

                            var nameLowerCase = names[i].toLowerCase();
                            var nameLowerCaseTab = nameLowerCase.split('_');
                            var finalLayerName = '';

                            for (var j = 0; j < nameLowerCaseTab.length; j++) {
                                if (j === 0) {
                                    var MajName = nameLowerCaseTab[j].replace(nameLowerCaseTab[j].charAt(0), nameLowerCaseTab[j].charAt(0).toUpperCase());
                                    finalLayerName += MajName + ' ';

                                } else {
                                    finalLayerName += nameLowerCaseTab[j] + ' ';
                                }
                            }

                            /* ==== set HTML containers for the vizualition in table form ==== */

                            var tableLine = document.createElement('TR');
                            tableList.appendChild(tableLine);

                            var colomn1 = document.createElement('TD');
                            tableLine.appendChild(colomn1);

                            var btnShowLayer = document.createElement('INPUT');
                            btnShowLayer.type = 'checkbox';
                            btnShowLayer.className = 'cesium-showSystems-configContainer-button-send';
                            btnShowLayer.setAttribute('data-bind', 'attr: { title:\"' + abstr + '\"}, checked : show_' + i);
                            colomn1.appendChild(btnShowLayer);

                            var colomn2 = document.createElement('TD');
                            tableLine.appendChild(colomn2);

                            colomn2.appendChild(document.createTextNode(finalLayerName));

                            var colomn3 = document.createElement('TD');
                            tableLine.appendChild(colomn3);

                            /* ==== set the range type of the input HTML tag ==== */

                            var inputRange = document.createElement('INPUT');
                            inputRange.type = 'range';
                            inputRange.min = '0';
                            inputRange.max = '1';
                            inputRange.step = '0.05';
                            inputRange.setAttribute('data-bind', 'value: alpha_' + i + ', valueUpdate: \"input\"');
                            colomn3.appendChild(inputRange);

                            /* ==== set the imageryProvider ==== */

                            layerName[i] = finalLayerName;

                            imageryProvidersTab[i] = new WebMapServiceImageryProvider({
                                url: onlineResource,
                                parameters: {format: 'image/jpeg'},
                                layers: layer[i],
                                credit: 'USGS @ wms.wr.usgs.gov',
                                ellipsoid: that._ellipsoid,
                                enablePickFeatures: false
                            });
                        }
                    }

                    /* ========================================================= 
                     =================== NOMENCLATURE LAYERS =================== 
                     =========================================================== */

                    // Requete AJAX

                    xhrNomen.open(method, urlNomen, async);
                    xhrNomen.withCredentials = false;
                    xhrNomen.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                    xhrNomen.send();

                    xhrNomen.onreadystatechange = function () {
                        if (xhrNomen.readyState === 4 && xhrNomen.status === 200 || xhrNomen.status === 0) {

                            var data = xhrNomen.responseXML;

                            try {

                                // Declaration of arrays 

                                var nomenNames = [];
                                var nomenTitle = [];
                                var nomenAbstract = [];
                                var nomenLayerName = [];
                                var nomenLayer = [];
                                var nomenImageryProvidersTab = [];

                                var layerNomenCount = 0;

                                // read some part of the XML file

                                var service = data.getElementsByTagName('Service');
                                var onlineResource = service[0].getElementsByTagName('OnlineResource')[0].getAttributeNS('http://www.w3.org/1999/xlink', 'href');
                                var capability = data.getElementsByTagName('Capability');
                                var layersIni = capability[0].getElementsByTagName('Layer');

                                // we get the layers that contains the attribute 'queryable'

                                var nomenclatureLayers = [];

                                for (var i = 0; i < layersIni.length; i++) {

                                    if (layersIni[i].getAttribute('queryable')) {
                                        nomenclatureLayers.push(layersIni[i]);
                                    }
                                }

                                var dimNomenLayers = nomenclatureLayers.length;

                                // build the url

                                for (var i = 0; i < nomenclatureLayers.length; i++) {

                                    // we get the name, title; abstract and bbox of each layer

                                    nomenNames[i] = nomenclatureLayers[i].getElementsByTagName('Name')[0].textContent;
                                    nomenLayer[i] = nomenclatureLayers[i].getElementsByTagName('Name')[0].textContent;
                                    nomenTitle[i] = nomenclatureLayers[i].getElementsByTagName('Title')[0].textContent;
                                    nomenAbstract[i] = nomenclatureLayers[i].getElementsByTagName('Abstract')[0].textContent;

                                    // ======================= test for '\n' in the abstract ==========================

                                    var abstrNomm = nomenAbstract[i].toString();
                                    var testReg = new RegExp('\n');


                                    if (testReg.test(abstrNomm)) {
                                        abstrNomm = nomenAbstract[i].replace(/\n/g, ' ');
                                    }

                                    // first letter in MAJ

                                    if (nomenNames[i] === 'NOMENCLATURE_180') {

                                        var nameLowCase = nomenNames[i].toLowerCase();
                                        var nameLowCaseTab = nameLowCase.split('_');
                                        var finalNomenLayerName = '';

                                        for (var j = 0; j < nameLowCaseTab.length; j++) {
                                            if (j === 0) {
                                                var MajName = nameLowCaseTab[j].replace(nameLowCaseTab[j].charAt(0), nameLowCaseTab[j].charAt(0).toUpperCase());
                                                finalNomenLayerName += MajName + ' ';

                                            } else {
                                                finalNomenLayerName += nameLowCaseTab[j] + ' ';
                                            }
                                        }

                                        // create a line for the nomenclature in the array tableList;

                                        var tableLine = document.createElement('TR');
                                        tableList.appendChild(tableLine);

                                        // chekbox

                                        var colomn1 = document.createElement('TD');
                                        tableLine.appendChild(colomn1);

                                        layerNomenCount = layerNomenCount + 1;
                                        var showIndex = dimLayers + layerNomenCount - 1;

                                        var btnShowLayer = document.createElement('INPUT');
                                        btnShowLayer.type = 'checkbox';
                                        btnShowLayer.className = 'cesium-showSystems-configContainer-button-send';
                                        btnShowLayer.setAttribute('data-bind', 'attr: { title:\"' + abstrNomm + '\"},checked : show_' + showIndex);
                                        colomn1.appendChild(btnShowLayer);

                                        // Layer name

                                        var colomn2 = document.createElement('TD');
                                        tableLine.appendChild(colomn2);

                                        colomn2.appendChild(document.createTextNode(finalNomenLayerName));

                                        // Range to manage the opacity

                                        var colomn3 = document.createElement('TD');
                                        colomn3.className = 'cesium-showSystems-configContainer-colomn3';
                                        tableLine.appendChild(colomn3);

                                        var inputRange = document.createElement('INPUT');
                                        inputRange.type = 'range';
                                        inputRange.min = '0';
                                        inputRange.max = '1';
                                        inputRange.step = '0.05';
                                        inputRange.setAttribute('data-bind', 'value: alpha_' + showIndex + ', valueUpdate: \"input\"');
                                        colomn3.appendChild(inputRange);

                                        // Create the layer

                                        var nomenImageryProvider = new WebMapServiceImageryProvider({
                                            url: onlineResource,
                                            parameters: {format: 'image/png'},
                                            layers: nomenLayer[i],
                                            credit: 'USGS @ wms.wr.usgs.gov',
                                            ellipsoid: that._ellipsoid,
                                            enablePickFeatures: false
                                        });


                                        nomenLayerName.push(finalNomenLayerName);
                                        nomenImageryProvidersTab.push(nomenImageryProvider);
                                    }
                                }

                                // push  nomenclature layers in imageryproviders

                                for (var k = 0; k < nomenLayerName.length; k++) {
                                    layerName.push(nomenLayerName[k]);
                                    imageryProvidersTab.push(nomenImageryProvidersTab[k]);
                                }

                                //  Create the model and binding

                                var listViewModel = new ListViewModel(viewer, layerName.length, layerName, imageryProvidersTab);
                                knockout.cleanNode(listContainer2);
                                knockout.applyBindings(listViewModel, listContainer2);

                            } catch (e) {
                                var listViewModel = new ListViewModel(viewer, layerName.length, layerName, imageryProvidersTab);
                                knockout.cleanNode(listContainer2);
                                knockout.applyBindings(listViewModel, listContainer2);
                            }
                        }
                    };
                } catch (e) {

                }
            }
        };
    }

    /**
     * function used to show or hide buttons of the planet and it's satellites for a given planetary system
     * 
     * @param {Object} that
     * @param {num} index
     */
    function showSystemButtons(that, index) {

        if (that.isShowSystemActive && that.previousIndex === index) {

            for (var i = 0; i < that._solarSystemSize; i++) {
                that['buttonVisible_' + i] = false;
            }
            ;
            cancelFunction(that);
            that.isShowSystemActive = false;

        } else if (!that.isShowSystemActive && that.previousIndex !== index) {

            for (var i = 0; i < that._solarSystemSize; i++) {
                that['buttonVisible_' + i] = false;
            }
            ;

            that['buttonVisible_' + index] = !that['buttonVisible_' + index];
            cancelFunction(that);
            that.isShowSystemActive = true;
            that.previousIndex = index;

        } else if (!that.isShowSystemActive && that.previousIndex === index) {

            for (var i = 0; i < that._solarSystemSize; i++) {
                that['buttonVisible_' + i] = false;
            }
            ;

            that['buttonVisible_' + index] = !that['buttonVisible_' + index];
            cancelFunction(that);
            that.isShowSystemActive = true;
            that.previousIndex = index;

        } else if (that.isShowSystemActive && that.previousIndex !== index) {

            for (var i = 0; i < that._solarSystemSize; i++) {
                that['buttonVisible_' + i] = false;
            }
            ;

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
        if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
            var xhr = new XMLHttpRequest();
        } else if (typeof ActiveXObject !== ' undefined') {
            var xhr = new ActiveXObject('Microsoft.XMLHTTP'); // activeX pour IE
            console.log('IE');
        } else {
            console.log('AJAX don\'t available on this browser');
            var xhr = null;
        }
        return xhr;
    }

    /**
     * function to close the panel which contains the layers to display for a given celestial body 
     * 
     * @param {Object} that
     */
    function cancelFunction(that) {
        var configContainer = document.getElementById('configId');
        configContainer.className = '';
        configContainer.style.opacity = 0;
        configContainer.className = 'cesium-showSystems-configContainer-transition';
        configContainer.style.left = that._windowsMove;
        that.isShowSystemActive = false;
    }

    /**
     * function to hide and show the panel which contains the layers to display for a given celestial body 
     * 
     * @param {Object} that
     */
    function hideFunction(that) {
        var configContainer = document.getElementById('configId');
        configContainer.className = '';
        configContainer.style.opacity = 0;
        configContainer.className = 'cesium-showSystems-configContainer-transition';
        configContainer.style.left = that._windowsMove;

        that._btnShowPanel = document.createElement('BUTTON');
        that._btnShowPanel.className = 'cesium-footerToolbar-button cesium-footerToolbar-animation-show cesium-button-planet';
        that._btnShowPanel.innerHTML = 'show panel';
        that._btnShowPanel.setAttribute('data-bind', 'click: testCommand');
        that._footerToolbar.appendChild(that._btnShowPanel);
        that._btnShowPanel = that._btnShowPanel;

        var footerViewModel = new FooterViewModel(that._footerToolbar, configContainer, that._btnShowPanel);
        knockout.applyBindings(footerViewModel, that._btnShowPanel);
    }


    function homePlanetShow(configuration, xhr, xhrNomen, that) {

        var homePlanet = configuration.homePlanet;

        // Naif code determination 

        var count = 1;
        var naifCode = [];

        for (var planet in configuration.planetarySystem.system) {

            if (planet === homePlanet) {
                naifCode = [count, 0];
                break;
            } else {
                count++;
            }
        }

        var planetarySystem = configuration.planetarySystem.system[homePlanet];
        var planetarySystemDimension = configuration.planetarySystem.dimension[homePlanet + 'System'];
        var planetDimension = planetarySystemDimension[homePlanet];

        initializeScene(that, planetDimension);
        initializeMarkerMoveWidget(that);
        homeView(that._scene);


        try {
            that._viewer.showSystems.viewModel.voData.destroyWrapperMenu;
        } catch (e) {
        }

        try {
            that._voData.viewModel.hidePanel;
        } catch (e) {
        }

        /* ================================================================= 
         ========================= VO WIDGET CALL ==========================
         =================================================================== */

        if (that._isVOWidgetVisible === true) {

            that._voData = new VOData(that._viewerContainer, that._viewer, that.configuration, homePlanet);

        }

        /* ================================================================= 
         ===================================================================
         =================================================================== */

        var obj = {
            naifCodes: naifCode,
            ellipsoid: that._ellipsoid
        };

        GeoJsonDataSource.crsModification = obj;
        showPlanetView(that, that._viewer, homePlanet, that._configContainer, that._listContainer, that._btnContainer, xhr, xhrNomen);


    }


    /*
     function getWMTSFunction(that) {
     
     console.log(that._ellipsoid);
     
     var planetMars = new WebMapTileServiceImageryProvider({
     url:  'https://api.nasa.gov/mars-wmts/catalog/Mars_MO_THEMIS-IR-Day_mosaic_global_100m_v12_clon0_ly',
     ellipsoid: that._ellipsoid,
     style: 'default',
     tileMatrixSetID: 'default028mm',
     layer: ' Mars_MO_THEMIS-IR-Day_mosaic_global_100m_v12_clon0_ly',
     format: 'image/jpg',
     });
     
     console.log(planetMars.url);
     
     that._viewer.imageryLayers.addImageryProvider(planetMars);
     console.log(that._viewer.imageryLayers);
     }
     
     */
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

    var ShowSystemsViewModel = function (viewer, scene, viewerContainer, footerToolbar, configContainer, listContainer, btnContainer, btnHideVectorialData, solarSystem, configuration, isVOWidgetVisible) {

        this._viewer = viewer;
        this._scene = scene;
        this.configuration = configuration;
        this._viewerContainer = viewerContainer;
        this._footerToolbar = footerToolbar;
        this._configContainer = configContainer;
        this._listContainer = listContainer;
        this._btnContainer = btnContainer;
        this.isShowSystemActive = false;
        this.previousIndex = null;
        this._windowsMove = '-470px';
        this._isVOWidgetVisible = isVOWidgetVisible;

        this._voData = null;

        this._solarSystemSize = getObjectSize(solarSystem);

        for (var i = 0; i < this._solarSystemSize; i++) {
            this['buttonVisible_' + i] = false;
        }

        var that = this;
        var xhr = getRequest();
        var xhrNomen = getRequest();

        homePlanetShow(configuration, xhr, xhrNomen, that);

        // ************************** WMTS TESTS *******************************

        this._wmtsCommand = createCommand(function () {

            // INITIALISATION DU PANNEAU GAUCHE DU GLOBE

            hideFunction(that);

            var objectDimensions = {
                x: 3390000,
                y: 3390000,
                z: 3360000
            };

            listContainer.innerHTML = '';
            //  configContainer.innerHTML = '';

            initializeScene(that, objectDimensions);
            initializeMarkerMoveWidget(that);
            homeView(that._scene);

            try {
                that._viewer.showSystems.viewModel.voData.destroyWrapperMenu;
            } catch (e) {
            }

            var naifCode = [4, 0];

            var obj = {
                naifCodes: naifCode,
                ellipsoid: that._ellipsoid
            };

            GeoJsonDataSource.crsModification = obj;

            // FONCTION DE RECUPERATION DES WMTS

            //   getWMTSFunction(that);


        });

        // *********************************************************************

        this._command = createCommand(function (planetName, planetIndex, satelliteIndex, vectorDimensionsString) {

            var stringVectorTab = vectorDimensionsString.split(',');
            var objectDimensions = {
                x: parseFloat(stringVectorTab[0]),
                y: parseFloat(stringVectorTab[1]),
                z: parseFloat(stringVectorTab[2])
            };

            initializeScene(that, objectDimensions);
            initializeMarkerMoveWidget(that);
            homeView(that._scene);


            try {
                that._viewer.showSystems.viewModel.voData.destroyWrapperMenu;
            } catch (e) {
            }

            try {
                that._voData.viewModel.hidePanel;
            } catch (e) {
            }

            /* ================================================================= 
             ========================= VO WIDGET CALL ==========================
             =================================================================== */

            if (that._isVOWidgetVisible === true) {
                that._voData = new VOData(that._viewerContainer, that._viewer, that.configuration, planetName);
            }

            /* ================================================================= 
             ===================================================================
             =================================================================== */

            var naifCode = [planetIndex, satelliteIndex];

            var obj = {
                naifCodes: naifCode,
                ellipsoid: that._ellipsoid
            };

            GeoJsonDataSource.crsModification = obj;
            showPlanetView(that, that._viewer, planetName, that._configContainer, that._listContainer, that._btnContainer, xhr, xhrNomen);

            /* to remove all butons of the planetToolBar from the view*/

            removeButtons(that);
        });

        this._commandSatellite = createCommand(function (planetName, satelliteName, planetIndex, satelliteIndex, vectorDimensionsString) {

            var stringVectorTab = vectorDimensionsString.split(',');

            var objectDimensions = {
                x: parseFloat(stringVectorTab[0]),
                y: parseFloat(stringVectorTab[1]),
                z: parseFloat(stringVectorTab[2])
            };

            initializeScene(that, objectDimensions);
            initializeMarkerMoveWidget(that);
            homeView(that._scene);

            var naifCode = [planetIndex, satelliteIndex];

            var obj = {
                naifCodes: naifCode,
                ellipsoid: that._ellipsoid
            };

            try {
                that._voData.viewModel.hidePanel;
            } catch (e) {
            }

            GeoJsonDataSource.crsModification = obj;

            /* ================================================================= 
             ========================= VO WIDGET CALL ==========================
             =================================================================== */

            if (that._isVOWidgetVisible === true) {
                console.log(that.configuration);
                that._voData = new VOData(that._viewerContainer, that._viewer, that.configuration, satelliteName);
            }

            /* ================================================================= 
             ===================================================================
             =================================================================== */

            console.log(GeoJsonDataSource.crsFunctionType);

            showSatelliteView(that, that._viewer, planetName, satelliteName, that._configContainer, that._listContainer, that._btnContainer, xhr, xhrNomen, naifCode);
            removeButtons(that);
        });

        this._showSystem = createCommand(function (index) {
            showSystemButtons(that, index);
            try {
                that._viewer.customObject.viewModel.hideCustomPanelCommand;
            } catch (e) {
            }
        });

        this._cancelCommand = createCommand(function () {
            cancelFunction(that);
        });

        this._hideCommand = createCommand(function () {
            hideFunction(that);
        });

        this._hideDataCommand = createCommand(function () {

            var booleanShow = false;

            if (viewer.scene.primitives.length > 0) {
                viewer.scene.primitives.show = !viewer.scene.primitives.show;
                booleanShow = viewer.scene.primitives.show;


                if (booleanShow) {
                    btnHideVectorialData.innerHTML = 'Hide vectorial data';
                }

                if (!booleanShow) {
                    btnHideVectorialData.innerHTML = 'Show vectorial data';
                }
            }


        });

        /** Gets or sets the tooltip.  This property is observable.
         *
         * @type {String}
         */
        this.tooltip = 'Show this system';
        this.tooltip2 = 'Show this planet';
        this.tooltip3 = 'Show this satellite';
        knockout.track(this, ['tooltip', 'tooltip2', 'tooltip3', 'isActive', 'initializeCommand', 'cancelCommand2', 'buttonVisible', 'buttonVisible_0', 'buttonVisible_1', 'buttonVisible_2', 'buttonVisible_3', 'buttonVisible_4', 'buttonVisible_5', 'buttonVisible_6', 'buttonVisible_7']);
    };

    defineProperties(ShowSystemsViewModel.prototype, {
        /**
         * Gets the Command that is executed when the button is clicked.
         *
         * @type {Command}
         */

        command: {
            get: function () {
                return this._command;
            }
        },
        commandSatellite: {
            get: function () {
                return this._commandSatellite;
            }
        },
        showSystem: {
            get: function () {
                return this._showSystem;
            }
        },
        cancelCommand: {
            get: function () {
                return this._cancelCommand;
            }
        },
        hideCommand: {
            get: function () {
                return this._hideCommand;
            }
        },
        hideDataCommand: {
            get: function () {
                return this._hideDataCommand;
            }
        },
        voData: {
            get: function () {
                return this._voData;
            }
        },
        hidePanel: {
            get: function () {
                var configContainer = document.getElementById('configId');
                configContainer.className = '';
                configContainer.style.opacity = 0;
                configContainer.className = 'cesium-showSystems-configContainer-transition';
                configContainer.style.left = this._windowsMove;

                try {
                    this._btnShowPanel.parentElement.removeChild(this._btnShowPanel);
                } catch (e) {
                }

            }
        },
        WMTSCommand: {
            get: function () {
                return this._wmtsCommand;
            }
        }
    });

    /* ================================================================================================================== */
    /* ================================================= local functions ================================================ */
    /* ================================================================================================================== */

    function homeView(scene) {
        var destination = scene.camera.getRectangleCameraCoordinates(Camera.DEFAULT_VIEW_RECTANGLE);

        var mag = Cartesian3.magnitude(destination);
        mag += mag * Camera.DEFAULT_VIEW_FACTOR;
        Cartesian3.normalize(destination, destination);
        Cartesian3.multiplyByScalar(destination, mag, destination);

        scene.camera.flyTo({
            destination: destination,
            duration: 2.0,
            endTransform: Matrix4.IDENTITY
        });
    }

    function removeButtons(that) {
        for (var i = 0; i < that._solarSystemSize; i++) {
            that['buttonVisible_' + i] = false;
        }
        ;
        that.isShowSystemActive = false;


        try {
            that._footerToolbar.removeChild(that._btnShowPanel);
        } catch (e) {

        }
    }

    function initializeScene(that, objectDimensions) {
        that._ellipsoid = freezeObject(new Ellipsoid(objectDimensions.x, objectDimensions.y, objectDimensions.z));
        Ellipsoid.WGS84 = freezeObject(that._ellipsoid); // A MODIFIER 

        if (that._viewer.geoJsonData) {
            that._viewer.geoJsonData = null;
        }


        try {
            that._viewer.scene.primitives.removeAll(true);
            that._viewer.lngLat.viewModel.removeCommand;

        } catch (e) {
        }

        try {
            that._viewer.drawLines.viewModel.subMenu.destroyWrapperMenu;
            that._viewer.drawLines.viewModel.subMenu.viewModel.removeAllCommands;
        } catch (e) {
        }

        try {
            that._viewer.customObject.viewModel.hideCustomPanelCommand;
        } catch (e) {
        }

        try {
            that._viewer.showGrid.viewModel.deleteGrid;
        } catch (e) {
        }


        var newTerrainProvider = new EllipsoidTerrainProvider({ellipsoid: that._ellipsoid});

        /*  var newTerrainProvider = new CesiumTerrainProvider({
         url : 'https://assets.agi.com/stk-terrain/world',
         //url : '//localhost:8080/tilesets/MOLA-terrain-tiles/',
         ellipsoid : that._ellipsoid,
         requestWaterMask : false,
         requestVertexNormals : false
         });*/

        var newGeographicProjection = new GeographicProjection(that._ellipsoid);
        var newGlobe = new Globe(that._ellipsoid);

        if (that._viewer.dataSources && that._viewer.scene) {
            that._viewer.dataSources.removeAll(true);
            that._viewer.scene.globe = newGlobe;
            that._viewer.scene.mapProjection = newGeographicProjection;
            that._viewer.scene.camera.projection = newGeographicProjection;
            that._viewer.terrainProvider = newTerrainProvider;
            that._viewer.scene.globe.baseColor = Color.BLACK;
            that._viewer.scene.camera.ellipsoid = that._ellipsoid;

        } else {

            that._scene.globe = newGlobe;
            that._scene.mapProjection = newGeographicProjection;
            that._scene.camera.projection = newGeographicProjection;
            that._scene.globe.baseColor = Color.BLACK;
            that._scene.camera.ellipsoid = that._ellipsoid;

        }
    }

    function initializeMarkerMoveWidget(that) {

        if (that._viewer.markerMove) {

            that._viewer.markerMove.viewModel._isActive = false;
            that._viewer.markerMove.viewModel.dropDownVisible = false;

            if (that._viewer.markerMove.viewModel._handlerRight)
                that._viewer.markerMove.viewModel._handlerRight.removeInputAction(ScreenSpaceEventType.RIGHT_CLICK);
            if (that._viewer.markerMove.viewModel._handlerLeft)
                that._viewer.markerMove.viewModel._handlerLeft.removeInputAction(ScreenSpaceEventType.LEFT_CLICK);

        }
    }

    function getObjectSize(obj) {
        var count = 0;
        var i;
        for (i in obj) {
            if (obj.hasOwnProperty(i))
                count++;
        }
        return count;
    }

    function getPLanetarySystem(obj, planetName) {

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
