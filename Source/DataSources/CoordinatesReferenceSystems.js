/*global define*/
define([
        '../Core/Cartesian3',
        '../Core/Ellipsoid',
        '../Core/queryToObject'
    ], function(
        Cartesian3,
        Ellipsoid,
        queryToObject) {
    'use strict';


    // we define two "crsFunction" functions : One for the default case  ==> defaultCrsFunction
    //                                         One for the specific case ==> CustomedCrsFunction


    // dafault case :

    function defaultCrsFunction(coordinates) {
        return Cartesian3.fromDegrees(coordinates[0], coordinates[1], coordinates[2]);
    }

    // specific case :

    function CustomizedCrsFunction(coordinates, ellipsoid) {
        return Cartesian3.fromDegrees(coordinates[0], coordinates[1], coordinates[2], ellipsoid);
    }

    var CoordinatesReferenceSystems = function CoordinatesReferenceSystems(crsNames, crsFunctionType, naifCodes) {

        if (!naifCodes) {

            crsNames['urn:ogc:def:crs:OGC:1.3:CRS84'] = defaultCrsFunction;
            crsNames['EPSG:4326'] = defaultCrsFunction;
            crsFunctionType.used = defaultCrsFunction;
            crsFunctionType.crs = {
                'type': 'name',
                'properties': {
                    'name': 'EPSG:4326'
                }
            };

        } else if (naifCodes) {

         var SRS;
         var codeIAU;

            var naifCode = {
                planet: parseInt(naifCodes[0]),
                satellite: parseInt(naifCodes[1])
            };

            if (naifCode.satellite === 0) {
                codeIAU = (naifCode.planet * 100 + 99) * 100;
                SRS = 'IAU2000:' + codeIAU;

            } else if (naifCode.satellite !== 0) {
                codeIAU = (naifCode.planet * 100 + naifCode.satellite) * 100;
                SRS = 'IAU2000:' + codeIAU;
            }

            crsNames[SRS] = CustomizedCrsFunction;
            crsFunctionType.used = CustomizedCrsFunction;
            crsFunctionType.crs = {
                'type': 'name',
                'properties': {
                    'name': SRS
                }
            };
        }

        /*
         console.log("******************** crs ***************************");
         console.log(crsFunctionType.used);
         console.log("****************************************************");
         */


    };
    return CoordinatesReferenceSystems;

});
