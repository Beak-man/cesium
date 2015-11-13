/*global define*/
define(['../Core/Cartesian3', 
		'../Core/Ellipsoid', 
		'../Core/queryToObject'
		], function(
			Cartesian3, 
			Ellipsoid, 
			queryToObject) { 
	
	
	// On récupere dans la requete url, l'ellipsoide utilisé. On place cette information dans la variable "ellipsoidUsed"
	
	var endUserOptions = queryToObject(window.location.search.substring(1));
	var ellipsoidUsed;
	
	if (typeof endUserOptions.ellipsoidType !== 'undefined'){
	    var  ellipsoidUsed = endUserOptions.ellipsoidType.toString().toUpperCase();	
	    }		
				
	// on définit les deux fonctions "crsFunction" : Une pour le cas par defaut ==> defaultCrsFunction	
	//                                               Une pour le cas specifique ==> CustomedCrsFunction	
		
		
	// cas par defaut : 	
				
	function defaultCrsFunction(coordinates) {
        return Cartesian3.fromDegrees(coordinates[0], coordinates[1], coordinates[2]);
    }
    
    // cas specifique : 
    
    function CustomizedCrsFunction(coordinates) {
        return Cartesian3.fromDegrees(coordinates[0], coordinates[1], coordinates[2], Ellipsoid[ellipsoidUsed]);
    }
		
 var CoordinatesReferenceSystems = function(crsNames, crsFunctionType){

		if(ellipsoidUsed === 'WGS84' || typeof ellipsoidUsed ==='undefined'){
			crsNames['urn:ogc:def:crs:OGC:1.3:CRS84'] = defaultCrsFunction;
			crsNames['EPSG:4326'] = defaultCrsFunction;
			crsFunctionType.used  = defaultCrsFunction;
			crsFunctionType.crs   = {'type': 'name', 'properties': {'name':'EPSG:4326'}};

		} else if (ellipsoidUsed === 'MARSIAU2000' || ellipsoidUsed === 'MARSSPHE'){
			
			crsNames['IAU2000:49900'] = CustomizedCrsFunction;
			crsFunctionType.used      = CustomizedCrsFunction;
			crsFunctionType.crs       = {'type': 'name', 'properties': {'name': 'IAU2000:49900'}};

		} else if (ellipsoidUsed === 'VENUS'){

			crsNames['IAU2000:29900'] =  CustomizedCrsFunction;		
			crsFunctionType.used      =  CustomizedCrsFunction;	
			crsFunctionType.crs       = {'type': 'name', 'properties': {'name': 'IAU2000:29900'}};
		} else if (ellipsoidUsed === 'MERCURE'){

			crsNames['IAU2000:19900'] =  CustomizedCrsFunction;		
			crsFunctionType.used      =  CustomizedCrsFunction;	
			crsFunctionType.crs       = {'type': 'name', 'properties': {'name': 'IAU2000:19900'}};
		} else {

            var naifCodesStrings = endUserOptions.NAIFCodes.toString();
			var naifCodesTab = naifCodesStrings.split(',');
            var naifCode         = {
                planet     : parseInt(naifCodesTab[0]),
                satellite  : parseInt(naifCodesTab[1]),
            }

            if (naifCode.satellite === 0){
                  var codeIAU = (naifCode.planet * 100 + 99)*100;
                  var SRS     = 'IAU2000:'+codeIAU;
            } else if (naifCode.satellite !== 0){
                  var codeIAU = (naifCode.planet * 100 + naifCode.satellite)*100;
                  var SRS     = 'IAU2000:'+codeIAU;
            }

            crsNames[SRS] =  CustomizedCrsFunction;		
            crsFunctionType.used      =  CustomizedCrsFunction;	
            crsFunctionType.crs       = {'type': 'name', 'properties': {'name':SRS}};
        }
		
		console.log("******************** crs ***************************")
		console.log(crsFunctionType.crs);
		console.log("****************************************************")
			
	}	
	return CoordinatesReferenceSystems;
	
});