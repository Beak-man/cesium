/*global define*/
define([
    '../createCommand',
    '../../Core/defined',
    '../../Core/defineProperties',
    '../../Core/ScreenSpaceEventHandler',
    '../../Core/ScreenSpaceEventType',
    '../../ThirdParty/knockout'
], function (
        createCommand,
        defined,
        defineProperties,
        ScreenSpaceEventHandler,
        ScreenSpaceEventType,
        knockout
        ) {
    "use strict";

    function showPanel(that, configContainer) {

        if (!that._isVOPanelActive) {

            configContainer.className = 'cesium-voData-configContainer cesium-voData-configContainer-transition';
            var leftPositionStr = configContainer.style.left;
            var leftPositionStrTab = leftPositionStr.split("p");
            var leftPosition = parseInt(leftPositionStrTab);

            var panelMove = leftPosition - 400 + "px";
            configContainer.style.left = panelMove;
            configContainer.style.opacity = "1";

            that._isVOPanelActive = true;

        } else if (that._isVOPanelActive) {

            configContainer.className = 'cesium-voData-configContainer cesium-voData-configContainer-transition';
            var leftPositionStr = configContainer.style.left;
            var leftPositionStrTab = leftPositionStr.split("p");
            var leftPosition = parseInt(leftPositionStrTab);

            var panelMove = leftPosition + 400 + "px";
            configContainer.style.left = panelMove;
            configContainer.style.opacity = "0";

            that._isVOPanelActive = false;
        }
    }

    function inputValuesTest(inputField) {

        if (/^[0-9.,-]+$/g.test(inputField.value)) {
            return true;
        } else {

            console.log("pas que des chiffres");
            alert("Please, enter a NUMBER type value for the " + inputField.name.toUpperCase() + "in the format : XX.XX");
            return false;
        }
    }

    function createQuery(that, planetName, inputObjects, serverUrl, format) {

        var serverName = "serverVO" + planetName;
        var xhr = getRequest();
        var xhrVO = getRequest();

        var isLngMinValuesValid = inputValuesTest(inputObjects.lngMin);
        var isLngMaxValuesValid = inputValuesTest(inputObjects.lngMax);
        var isLatMinValuesValid = inputValuesTest(inputObjects.latMin);
        var isLatMaxValuesValid = inputValuesTest(inputObjects.latMax);

        if (isLngMinValuesValid && isLngMaxValuesValid && isLatMinValuesValid && isLatMaxValuesValid) {

            var lngMin = parseFloat(inputObjects.lngMin.value);
            var lngMax = parseFloat(inputObjects.lngMax.value);
            var latMin = parseFloat(inputObjects.latMin.value);
            var latMax = parseFloat(inputObjects.latMax.value);

            var p1 = new Promise(
                    // La fonction de résolution est appelée avec la capacité de  tenir ou de rompre la promesse
                            function (resolve, reject) {

                                xhr.open('GET', serverUrl, true);
                                xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                                xhr.send();
                                xhr.onload = function () {

                                    if (xhr.readyState == 4 && xhr.status == 200 || xhr.status == 0) {

                                        var data = xhr.responseText;
                                        var jsonData = JSON.parse(data);
                                        var server = jsonData[serverName];
                                        
                                      //  console.log(jsonData);

                                        var queryPart1 = server.url + "?REQUEST=doQuery&LANG=ADQL&";

                                        var queryPart2 = "QUERY=SELECT * from vvex" + server.extension + " where c1min>" + lngMin + "and c2min>" + latMin + "and c1max<" + lngMax + "and c2max<" + latMax + "&FORMAT=" + format;

                                        var query = queryPart1 + queryPart2;

                                        xhrVO.open('GET', query, true);
                                        xhrVO.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                                        xhrVO.send();
                                        xhrVO.onreadystatechange = function () {

                                            if (xhrVO.readyState == 4 && xhrVO.status == 200 || xhrVO.status == 0) {

                                                var data = xhrVO.responseText;
                                               
                                               console.log(data);
                                               
                                            }
                                        }

                                        resolve(query)
                                                ;

                                    } else { // On utilise la fonction "reject" lorsque this.status est différent de 2xx
                                        reject(xhr.status);
                                    }
                                }
                            });

                    p1.then(
                            function (result) {

                                that._query = result;
                              //  getVOData(that._query);

                                console.log(result);

                            }).catch(
                            // Promesse rejetée
                                    function () {
                                        console.log("promesse rompue");
                                    });
                        }
            }


            function getVOData(query) {

                var xhr = getRequest();

                xhr.open('GET', query, true);
                xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                xhr.withCredentials = false;
                xhr.send();
                xhr.onreadystatechange = function () {

                    if (xhr.readyState == 4 && xhr.status == 200 || xhr.status == 0) {

                        var data = xhr.responseText;
                        //    var jsonData = JSON.parse(data);

                        console.log(data);
                    }
                }
            }

            function getRequest() {
                if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
                    var xhr = new XMLHttpRequest();
                } else if (typeof ActiveXObject !== " undefined") {
                    var xhr = new ActiveXObject("Microsoft.XMLHTTP"); // activeX pour IE
                    console.log("IE");
                } else {
                    console.log("AJAX don't available on this browser");
                    var xhr = null;
                }
                return xhr;
            }

            /**
             * The view model for {@link DrawLines}.
             * @alias EditDrawingViewModel
             * @constructor
             */
            var VODataViewModel = function (viewer, planetName, configContainer, listContainer, btnContainer, inputObjects) {

                this._viewer = viewer;
                this._planetName = planetName;
                this._configContainer = configContainer;
                this._listContainer = listContainer;
                this._btnContainer = btnContainer;
                this._inputObjects = inputObjects;
                this._query = null;
                this._format = "json";

                this._serverUrl = '../../Source/Widgets/ConfigurationFiles/serverList.json';

                this._isVOPanelActive = false;

                var that = this;

                this._showPanelCommand = createCommand(function () {
                    showPanel(that, that._configContainer);
                });

                this._getDataCommand = createCommand(function () {
                    createQuery(that, that._planetName, that._inputObjects, that._serverUrl, that._format);
                    getVOData(that._query);
                });

                //  knockout.track(this, []);

            };
            defineProperties(VODataViewModel.prototype, {
                /**
                 * Gets the Command that is executed when the button is clicked.
                 * @memberof VODataViewModel.prototype
                 *
                 * @type {Command}
                 */
                getDataCommand: {
                    get: function () {
                        return this._getDataCommand;
                    }
                },
                showPanelCommand: {
                    get: function () {
                        return this._showPanelCommand;
                    }
                },
                isVOPanelActive: {
                    get: function () {
                        return this._isVOPanelActive;
                    }
                },
                hidePanel: {
                    get: function () {
                        if (this._isVOPanelActive) {
                            showPanel(this, this._configContainer);
                        }
                    }
                },
            });

            return VODataViewModel;
        });
