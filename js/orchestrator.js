"use strict";
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

class Orchestrator {
  
  constructor(tenant, user, pass, url) {
  	this.url = url || 'https://platform.uipath.com/';
  	Orchestrator.token = Orchestrator.token || this.getToken(tenant, user, pass);
  }


  getToken(tenant, user, pass) {
  	let body = JSON.stringify({tenancyName: tenant, usernameOrEmailAddress: user, password: pass});
  	return this.request({ type: "POST", 
			      extension: 'api/Account/Authenticate', 
			      body: body });
  }


  request(p) {
  	var xhttp = new XMLHttpRequest();
  	xhttp.withCredentials = true;

  	// All but authentication is asynchronous. Use a callback to get the response
  	if (!!Orchestrator.token) {
	  	xhttp.onreadystatechange = function() {
	        if (this.readyState == this.DONE && this.status < 300) {
						console.log( this.responseText)
	        	let result = JSON.parse(this.responseText);
	        	p["callback"](result);
					}
	    };
		}

    // Compose request
    xhttp.open(p["type"].toUpperCase(), this.url + p["extension"], !!Orchestrator.token);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.setRequestHeader('Authorization', 'Bearer ' + (Orchestrator.token || ''));
    if( p.hasOwnProperty('ou')) {
    	xhttp.setRequestHeader('X-UIPATH-OrganizationUnitId', p["ou"]);
    }
    xhttp.send(p["body"]);

    // Authentication is synchronous, so just return the token.
    if (!Orchestrator.token) {
    	let arr = JSON.parse(xhttp.responseText);
    	return arr["result"]
    }
  }

}

module.exports = Orchestrator;

