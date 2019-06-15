'use strict';
const Orchestrator = require('./orchestrator.js');	

var orch = new Orchestrator("default", "user", "password!", "https://uipath.myrobots.co.kr/");

var newor = new Orchestrator("charles", "user", "password", "https://uipath.myrobots.co.kr/");
orch.migrateUnits( newor)
orch.migrateAssets( newor)