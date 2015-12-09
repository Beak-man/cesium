/*global define*/
define(['../Core/Cartesian3', 
		'../Core/Ellipsoid', 
		'../Core/queryToObject'
		], function(
			Cartesian3, 
			Ellipsoid, 
			queryToObject) { 
	
	
	// We pick from the url the ellipsoid used. We put this information in the "ellipsoidUsed" variable.
	
	var endUserOptions = queryToObject(window.location.search.substring(1));
	var ellipsoidUsed;
	
	if (typeof endUserOptions.ellipsoidType !== 'undefined'){
	    var  ellipsoidUsed = endUserOptions.ellipsoidType.toString().toUpperCase();	
	    }		
				
	// we define two "crsFunction" functions : One for the default case  ==> defaultCrsFunction	
	//                                         One for the specific case ==> CustomedCrsFunction	
		
		
	// dafault case : 	
				
	function defaultCrsFunction(coordinates) {
        return Cartesian3.fromDegrees(coordinates[0], coordinates[1], coordinates[2]);
    }
    
    // specific case : 
    
    function CustomizedCrsFunction(coordinates) {
        return Cartesian3.fromDegrees(coordinates[0], coordinates[1], coordinates[2], Ellipsoid[ellipsoidUsed]);
    }
		
 var CoordinatesReferenceSystems = function(crsNames, crsFunctionType, naifCodes){

      if (!naifCodes) {
	  
	  	if (typeof ellipsoidUsed === 'undefined') {
	  		crsNames['urn:ogc:def:crs:OGC:1.3:CRS84'] = defaultCrsFunction;
	  		crsNames['EPSG:4326'] = defaultCrsFunction;
	  		crsFunctionType.used = defaultCrsFunction;
	  		crsFunctionType.crs = {
	  			'type': 'name',
	  			'properties': {
	  				'name': 'EPSG:4326'
	  			}
	  		};
	  	}
	  	
	  	if (endUserOptions.NAIFCodes) {
	  		var naifCodesStrings = endUserOptions.NAIFCodes.toString();
	  		var naifCodesTab = naifCodesStrings.split(',');
	  		var naifCode = {
	  			planet: parseInt(naifCodesTab[0]),
	  			satellite: parseInt(naifCodesTab[1]),
	  		}
	  		
	  		if (naifCode.satellite === 0) {
	  			var codeIAU = (naifCode.planet * 100 + 99) * 100;
	  			var SRS = 'IAU2000:' + codeIAU; 
				
	  		}else if (naifCode.satellite !== 0) {
	  				var codeIAU = (naifCode.planet * 100 + naifCode.satellite) * 100;
	  				var SRS = 'IAU2000:' + codeIAU;
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
	  	
	  } else if (naifCodes){

	  		var naifCode = {
	  			planet    : parseInt(naifCodes[0]),
	  			satellite :  parseInt(naifCodes[1])
	  		}
	  		
	  		if (naifCode.satellite === 0) {
	  			var codeIAU = (naifCode.planet * 100 + 99) * 100;
	  			var SRS = 'IAU2000:' + codeIAU; 
				
	  		}else if (naifCode.satellite !== 0) {
	  				var codeIAU = (naifCode.planet * 100 + naifCode.satellite) * 100;
	  				var SRS = 'IAU2000:' + codeIAU;
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
		
	/* console.log("******************** crs ***************************")
	   console.log(crsFunctionType.crs);
	   console.log("****************************************************") */
		
			
	}	
	return CoordinatesReferenceSystems;
	
});