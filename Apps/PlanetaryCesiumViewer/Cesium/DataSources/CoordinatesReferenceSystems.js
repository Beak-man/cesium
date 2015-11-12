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

		/* Si on utilise l'ellispoide standard ou bien si la requete ne contient pas d'ellipsoide particulier alors on applique
		   le cas par defaut */

		if(ellipsoidUsed === "WGS84" || typeof ellipsoidUsed ==='undefined'){
			crsNames['urn:ogc:def:crs:OGC:1.3:CRS84'] = defaultCrsFunction;
			crsNames['EPSG:4326'] = defaultCrsFunction;
			crsFunctionType.used  = defaultCrsFunction;
			crsFunctionType.crs   = {"type" : "name", "properties": {"name": 'EPSG:4326'}};
		}; 
		
		/* Si on utilise l'ellispoide de Mars alors on applique le cas par specifique */
		
		if (ellipsoidUsed === "MARSIAU2000" || ellipsoidUsed === "MARSSPHE"){
			crsNames['IAU2000:49900'] = CustomizedCrsFunction;
			crsFunctionType.used      = CustomizedCrsFunction;
			crsFunctionType.crs       = {"type": "name", "properties": {"name": 'IAU2000:49900'}};
		};
		
		/* Si on utilise l'ellispoide de Venus alors on applique le cas par specifique */
		
		if (ellipsoidUsed === "VENUS"){
			crsNames['IAU2000:29900'] =  CustomizedCrsFunction;		
			crsFunctionType.used      =  CustomizedCrsFunction;	
			crsFunctionType.crs       = {"type": "name", "properties": {"name": 'IAU2000:29900'}};
		};	
		
		if (ellipsoidUsed === "MERCURE"){
			crsNames['IAU2000:19900'] =  CustomizedCrsFunction;		
			crsFunctionType.used      =  CustomizedCrsFunction;	
			crsFunctionType.crs       = {"type": "name", "properties": {"name": 'IAU2000:19900'}};
		};
	}	
	return CoordinatesReferenceSystems;
	
});