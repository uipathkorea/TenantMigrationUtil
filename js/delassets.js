'use strict';
const Orchestrator = require('./orchestrator.js')

var orch = new Orchestrator('charles', 'user', 'user', 'https://uipath.myrobots.co.kr/' )

let units = orch.getOUs()['value']
units.forEach( (elm) => {
    let assets = orch.getAssets( elm.Id)['value']
    assets.forEach( (ass) => {
        let res = orch.deleteAsset( ass.Id, elm.Id)
        console.log(res)
    });
});