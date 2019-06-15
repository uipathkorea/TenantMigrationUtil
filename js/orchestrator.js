"use strict";
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

class Orchestrator {
  
  constructor(tenant, user, pass, url) {
		this.url = url || 'https://platform.uipath.com/';
		this.token = this.token || this.getToken(tenant,user,pass) 
  	//Orchestrator.token = Orchestrator.token || this.getToken(tenant, user, pass);
  }


  getToken(tenant, user, pass) {
  	let body = JSON.stringify({tenancyName: tenant, usernameOrEmailAddress: user, password: pass});
  	return this.requestAuth({ type: "POST", 
			      extension: 'api/Account/Authenticate', 
			      body: body });
  }

  createOU( data) {
	let body = JSON.stringify( data)
	let result = this.requestSync( { type: 'POST',
					extension: 'odata/OrganizationUnits',
					body: body});
	return result;
  }

  getOUs() {
  	let result = this.requestSync( {type: 'GET',
						extension: 'odata/OrganizationUnits'});
	return result;
  }

  createAsset( data, ou ) {
	  let body = JSON.stringify(data)
	  let res = this.requestSync( { type: 'POST',
					extension: 'odata/Assets',
					ou: ou,
					body: body});
  	return res;
  }

  getAssets( unit) {
	  let res = this.requestSync( {
			type: 'GET',
			extension: 'odata/Assets',
			ou: unit.Id});
	  return res;
  }

  migrateUnits( newTenantOrch) {
	 let units = this.getOUs()['value']
	 units.forEach( (elm,idx) => {
		newTenantOrch.createOU( {'DisplayName': elm.DisplayName})
	 });
  }

  migrateAssets( newTenantOrch ) {
	  let units = this.getOUs()["value"];
	  let targetou = newTenantOrch.getOUs()['value'];
	  units.forEach( (elm,idx) => {
		  let assets = this.getAssets( elm)['value'];
		  assets.forEach( ass => {
			var body = { 
				Name: ass.Name,
				ValueScope: ass.ValueScope,
				ValueType: ass.ValueType }
			if ( ass.ValueType == 'Text')	
				body["StringValue"] = ass.StringValue;
			else if ( ass.ValueType == 'Bool')
				body["BoolValue"] = ass.BoolValue;
			else if ( ass.ValueType == 'Integer')
				body['IntValue'] = ass.IntValue;
			//console.log( targetou[0])
			let err = newTenantOrch.createAsset( body, targetou[idx].Id)
			//console.log(err)
		  });  
	  });
  }

	printToken() {
		console.log( this.token)
	}

	requestAsync(p) {
		var xhttp = new XMLHttpRequest();
		xhttp.withCredentials = true;

		// All but authentication is asynchronous. Use a callback to get the response
		if ( true) {
			xhttp.onreadystatechange = function() {
				if (this.readyState == this.DONE && this.status < 300) {
					let result = JSON.parse(this.responseText);
					p["callback"](result);
				}
			};
		}

		// Compose request
		xhttp.open(p["type"].toUpperCase(), this.url + p["extension"], true);
		xhttp.setRequestHeader('Content-Type', 'application/json');
		xhttp.setRequestHeader('Authorization', 'Bearer ' + (this.token || ''));
		if( p.hasOwnProperty('ou')) {
			xhttp.setRequestHeader('X-UIPATH-OrganizationUnitId', p["ou"]);
		}

		xhttp.send(p["body"]);
  }

  requestAuth(p) {
  	var xhttp = new XMLHttpRequest();
  	xhttp.withCredentials = true;

    // Compose request
    xhttp.open(p["type"].toUpperCase(), this.url + p["extension"], false);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.setRequestHeader('Authorization', 'Bearer ' + (this.token || ''));
    xhttp.send(p["body"]);

    // Authentication is synchronous, so just return the token.
    if (true) {
		console.log( xhttp.responseText)
		let arr = JSON.parse(xhttp.responseText);
		if( !this.token)
			return arr["result"]
		else
			return arr;
    }
  }

  requestSync(p) {
  	var xhttp = new XMLHttpRequest();
  	xhttp.withCredentials = true;

    // Compose request
    xhttp.open(p["type"].toUpperCase(), this.url + p["extension"], false);
    xhttp.setRequestHeader('Content-Type', 'application/json');
	xhttp.setRequestHeader('Authorization', 'Bearer ' + (this.token || ''));
    if( p.hasOwnProperty('ou')) {
      xhttp.setRequestHeader('X-UIPATH-OrganizationUnitId', p["ou"]);
    }
    xhttp.send(p["body"]);

    if ( xhttp.status >= 200 && xhttp.status < 300) {
	  let resp= JSON.parse(xhttp.responseText);
	  //console.log(resp)
	  return resp;
    }
  }

}

module.exports = Orchestrator;

