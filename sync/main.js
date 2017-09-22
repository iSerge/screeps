module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 12);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(5));


/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = require("lodash");

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var _ = __webpack_require__(1);
var limits_1 = __webpack_require__(3);
var screeps_typescript_profiler_1 = __webpack_require__(0);
exports.Messages = {
    BUILD: "\uD83D\uDEA7 build",
    CONSTRUCT_SYM: "\uD83D\uDEE0",
    DISTRIBUTE: "\u2194 distr",
    HARVEST: "\uD83D\uDD04 harvest",
    PICKUP: "\u2B06 pickup",
    UPGRADE: "\u26A1 upgrade"
};
var Utils = (function () {
    function Utils() {
    }
    Utils_1 = Utils;
    Utils.buildPriority = function (creep, site) {
        var priority;
        switch (site.structureType) {
            case STRUCTURE_SPAWN:
                priority = 1;
                break;
            case STRUCTURE_EXTENSION:
                priority = 2;
                break;
            case STRUCTURE_CONTAINER:
                priority = 3;
                break;
            case STRUCTURE_LINK:
                priority = 4;
                break;
            case STRUCTURE_TOWER:
                priority = 5;
                break;
            case STRUCTURE_STORAGE:
                priority = 6;
                break;
            default:
                priority = 7;
                break;
        }
        return creep.memory.operateInRoom === site.pos.roomName ? priority : priority + 20;
    };
    Utils.prototype.clearMemory = function () {
        _.forOwn(Memory.creeps, function (creep, name) {
            if (!Game.creeps.hasOwnProperty(name)) {
                if (creep.target) {
                    delete Memory.harvestedSources[creep.target];
                }
                delete Memory.creeps[name];
                console.log("Clearing non-existing creep memory:", name);
            }
        });
    };
    Utils.prototype.enqueueStructure = function (object) {
        if (_.isUndefined(object)) {
            return;
        }
        if (!_.includes(Memory.repairQueue, object.id)) {
            Memory.repairQueue.push(object.id);
        }
    };
    Utils.prototype.findConstructionSite = function (creep) {
        return _.sortBy(Game.constructionSites, [function (site) {
                return Utils_1.buildPriority(creep, site);
            }])[0];
    };
    Utils.prototype.getEnergy = function (creep, target) {
        var result;
        if (target instanceof Resource) {
            result = creep.pickup(target);
            if (result === OK) {
                creep.memory.energyTarget = "";
            }
        }
        else if (target instanceof Source) {
            result = creep.harvest(target);
        }
        else {
            result = creep.withdraw(target, RESOURCE_ENERGY);
            if (result === OK) {
                creep.memory.energyTarget = "";
            }
        }
        return result;
    };
    Utils.prototype.getEnergyStorageTarget = function (creep) {
        var target = Game.getObjectById(creep.memory.energyTarget);
        if (!target) {
            var targets = creep.room.find(FIND_DROPPED_RESOURCES, {
                filter: function (res) {
                    return res.resourceType === RESOURCE_ENERGY;
                }
            });
            targets = targets.concat(creep.room.find(FIND_STRUCTURES, {
                filter: function (struct) {
                    return ((struct.structureType === STRUCTURE_STORAGE ||
                        struct.structureType === STRUCTURE_CONTAINER) &&
                        0 < struct.store[RESOURCE_ENERGY]) ||
                        (struct.structureType === STRUCTURE_LINK && 0 < struct.energy);
                }
            }));
            target = creep.pos.findClosestByPath(targets, {
                maxOps: 1000
            });
        }
        if (!target) {
            target = creep.pos.findClosestByPath(FIND_SOURCES);
        }
        if (target) {
            creep.memory.energyTarget = target.id;
        }
        return target;
    };
    Utils.prototype.moveTo = function (creep, target) {
        if (ERR_NOT_FOUND === creep.moveTo(target, {
            noPathFinding: true,
            visualizePathStyle: { stroke: "#ffffff" }
        })) {
            creep.moveTo(target, {
                reusePath: 20,
                visualizePathStyle: { stroke: "#ffffff" }
            });
        }
    };
    Utils.prototype.navigateToDesignatedRoom = function (creep) {
        if (!creep.memory.operateInRoom) {
            var rooms = _.map(_.filter(Game.structures, function (o, k) { return o.structureType === STRUCTURE_CONTROLLER; }), function (s) { return s.pos.roomName; });
            var creepCount_1 = _.reduce(Game.creeps, function (result, c) {
                if (c.memory.role === creep.memory.role && c.memory.operateInRoom) {
                    var room = c.memory.operateInRoom;
                    result[room] = (result[room] || (result[room] = 0)) + 1;
                }
                return result;
            }, {});
            var limit_1 = limits_1.limits[creep.memory.role];
            creep.memory.operateInRoom = _.filter(rooms, function (room) {
                return !creepCount_1.hasOwnProperty(room) || creepCount_1[room] < limit_1;
            })[0];
        }
        return creep.memory.operateInRoom !== creep.pos.roomName;
    };
    Utils.prototype.shiftStructure = function (creep, own) {
        if (0 < Memory.repairQueue.length) {
            var id = Game.getObjectById(Memory.repairQueue[0]);
            while (!id) {
                Memory.repairQueue.shift();
                id = Game.getObjectById(Memory.repairQueue[0]);
            }
        }
        var needsRepair = _.find(Memory.repairQueue, function (id) {
            var struct = _.isUndefined(id) ? null : Game.getObjectById(id);
            return struct && (!own || struct.pos.roomName === creep.memory.operateInRoom);
        });
        if (_.isUndefined(needsRepair)) {
            return null;
        }
        Memory.repairQueue = _.filter(Memory.repairQueue, function (id) { return id !== needsRepair; });
        return Game.getObjectById(needsRepair);
    };
    Utils.prototype.tryBuildRoad = function (creep) {
        if (Memory.autoBuildRoads) {
            var road = _.filter(creep.room.lookAt(creep.pos), function (obj) {
                return obj && obj.structure &&
                    ((obj.type === LOOK_STRUCTURES && obj.structure.structureType === STRUCTURE_ROAD) ||
                        obj.type === LOOK_CONSTRUCTION_SITES);
            });
            if (!road.length) {
                creep.room.createConstructionSite(creep.pos, STRUCTURE_ROAD);
            }
        }
    };
    Utils.prototype.updateInfrastructure = function () {
        if (_.isUndefined(Memory.repairQueue)) {
            Memory.repairQueue = [];
        }
        if (_.isUndefined(Memory.spawnQueue)) {
            Memory.spawnQueue = [];
        }
        if (_.isUndefined(Memory.harvestedSources)) {
            Memory.harvestedSources = {};
        }
        if (_.isUndefined(Memory.autoBuildRoads)) {
            Memory.autoBuildRoads = true;
        }
        if (_.isUndefined(Memory.controllerCont)) {
            Memory.controllerCont = {};
        }
        if (_.isUndefined(Memory.maxWallHits)) {
            Memory.maxWallHits = 100000;
        }
        if (_.isUndefined(Memory.maxRampartHits)) {
            Memory.maxRampartHits = 30000;
        }
        Memory.controllerCount = _.size(_.filter(Game.structures, function (o, k) { return o.structureType === STRUCTURE_CONTROLLER; }));
    };
    Utils = Utils_1 = __decorate([
        screeps_typescript_profiler_1.profile
    ], Utils);
    return Utils;
    var Utils_1;
}());
exports.Utils = Utils;
exports.utils = new Utils();


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.limits = {
    builder: 2,
    carrier: 3,
    claimer: 2,
    harvester: 2,
    upgrader: 3
};


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var _ = __webpack_require__(1);
var Profiler = __webpack_require__(0);
var roles_1 = __webpack_require__(11);
var utils_1 = __webpack_require__(2);
global.Profiler = Profiler.init();
var LoopFunctions = (function () {
    function LoopFunctions() {
    }
    LoopFunctions.findDamagedStructures = function () {
        _.forOwn(Game.rooms, function (room) {
            room.find(FIND_STRUCTURES, {
                filter: function (struct) {
                    if ((struct.structureType === STRUCTURE_WALL && struct.hits < Memory.maxWallHits) ||
                        (struct.structureType === STRUCTURE_RAMPART && struct.hits < Memory.maxRampartHits / 2) ||
                        (struct.structureType === STRUCTURE_CONTAINER && struct.hits < struct.hitsMax - 50000) ||
                        (struct.structureType !== STRUCTURE_RAMPART && struct.structureType !== STRUCTURE_WALL &&
                            struct.hits < struct.hitsMax / 2)) {
                        utils_1.utils.enqueueStructure(struct);
                    }
                    return false;
                }
            });
        });
    };
    LoopFunctions.towerLogic = function () {
        _.forOwn(Game.structures, function (tower) {
            if (tower.structureType === STRUCTURE_TOWER) {
                var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
                    filter: function (creep) {
                        return creep.pos.inRangeTo(tower.pos, 15);
                    }
                });
                if (closestHostile) {
                    tower.attack(closestHostile);
                }
                var closestDamagedCreep = tower.pos.findClosestByRange(FIND_MY_CREEPS, {
                    filter: function (creep) {
                        return creep.hits < creep.hitsMax / 3;
                    }
                });
                if (closestDamagedCreep) {
                    tower.heal(closestDamagedCreep);
                }
                if (700 < tower.energy) {
                    var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                        filter: function (structure) {
                            return (structure.structureType === STRUCTURE_RAMPART &&
                                structure.hits < Memory.maxRampartHits)
                                || (structure.structureType !== STRUCTURE_WALL &&
                                    structure.structureType !== STRUCTURE_RAMPART &&
                                    structure.hits < structure.hitsMax / 3);
                        }
                    });
                    if (closestDamagedStructure) {
                        tower.repair(closestDamagedStructure);
                    }
                }
                var damagedCreep = tower.pos.findClosestByRange(FIND_MY_CREEPS, {
                    filter: function (creep) {
                        return creep.hits < creep.hitsMax;
                    }
                });
                if (damagedCreep) {
                    tower.heal(damagedCreep);
                }
            }
        });
    };
    LoopFunctions.creepActions = function () {
        _.forOwn(Game.creeps, function (creep) {
            roles_1.rolesModule.run(creep);
        });
    };
    LoopFunctions = __decorate([
        Profiler.profile
    ], LoopFunctions);
    return LoopFunctions;
}());
module.exports.loop = function () {
    utils_1.utils.clearMemory();
    utils_1.utils.updateInfrastructure();
    LoopFunctions.findDamagedStructures();
    if (Object.getOwnPropertyNames(Game.creeps).length === 0) {
        Memory.spawnQueue = [];
        Memory.spawnQueue.unshift({
            body: [CARRY, MOVE],
            role: roles_1.CARRIER
        });
        Memory.spawnQueue.unshift({
            body: [CARRY, WORK, WORK, MOVE],
            role: roles_1.HARVESTER
        });
    }
    Memory.creepCount = roles_1.rolesModule.count();
    _.forOwn(Game.spawns, function (spawn) {
        roles_1.rolesModule.processSpawnQueue(spawn);
        if (spawn.spawning) {
            var spawningCreep = Game.creeps[spawn.spawning.name];
            spawn.room.visual.text(utils_1.Messages.CONSTRUCT_SYM + " " + spawningCreep.memory.role, spawn.pos.x + 1, spawn.pos.y, { align: "left", opacity: 0.8 });
        }
    });
    roles_1.rolesModule.spawn();
    LoopFunctions.towerLogic();
    LoopFunctions.creepActions();
};


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function init() {
    var defaults = {
        data: {},
        total: 0,
    };
    if (!Memory.profiler) {
        Memory.profiler = defaults;
    }
    var cli = {
        clear: function () {
            var running = isEnabled();
            Memory.profiler = defaults;
            if (running) {
                Memory.profiler.start = Game.time;
            }
            return "Profiler Memory cleared";
        },
        output: function () {
            outputProfilerData();
            return "Done";
        },
        start: function () {
            Memory.profiler.start = Game.time;
            return "Profiler started";
        },
        status: function () {
            if (isEnabled()) {
                return "Profiler is running";
            }
            return "Profiler is stopped";
        },
        stop: function () {
            if (!isEnabled()) {
                return;
            }
            var timeRunning = Game.time - Memory.profiler.start;
            Memory.profiler.total += timeRunning;
            delete Memory.profiler.start;
            return "Profiler stopped";
        },
        toString: function () {
            return "Profiler.start() - Starts the profiler\n" +
                "Profiler.stop() - Stops/Pauses the profiler\n" +
                "Profiler.status() - Returns whether is profiler is currently running or not\n" +
                "Profiler.output() - Pretty-prints the collected profiler data to the console\n" +
                this.status();
        },
    };
    return cli;
}
exports.init = init;
function wrapFunction(obj, key, className) {
    var descriptor = Reflect.getOwnPropertyDescriptor(obj, key);
    if (!descriptor || descriptor.get || descriptor.set) {
        return;
    }
    if (key === "constructor") {
        return;
    }
    var originalFunction = descriptor.value;
    if (!originalFunction || typeof originalFunction !== "function") {
        return;
    }
    if (!className) {
        className = obj.constructor ? "" + obj.constructor.name : "";
    }
    var memKey = className + (":" + key);
    var savedName = "__" + key + "__";
    if (Reflect.has(obj, savedName)) {
        return;
    }
    Reflect.set(obj, savedName, originalFunction);
    Reflect.set(obj, key, function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (isEnabled()) {
            var start = Game.cpu.getUsed();
            var result = originalFunction.apply(this, args);
            var end = Game.cpu.getUsed();
            record(memKey, end - start);
            return result;
        }
        return originalFunction.apply(this, args);
    });
}
function profile(target, key, _descriptor) {
    if (false) {
        return;
    }
    if (key) {
        wrapFunction(target, key);
        return;
    }
    var ctor = target;
    if (!ctor.prototype) {
        return;
    }
    var className = ctor.name;
    Reflect.ownKeys(ctor.prototype).forEach(function (k) {
        wrapFunction(ctor.prototype, k, className);
    });
}
exports.profile = profile;
function isEnabled() {
    return Memory.profiler.start !== undefined;
}
function record(key, time) {
    if (!Memory.profiler.data[key]) {
        Memory.profiler.data[key] = {
            calls: 0,
            time: 0,
        };
    }
    Memory.profiler.data[key].calls++;
    Memory.profiler.data[key].time += time;
}
function outputProfilerData() {
    var totalTicks = Memory.profiler.total;
    if (Memory.profiler.start) {
        totalTicks += Game.time - Memory.profiler.start;
    }
    var totalCpu = 0;
    var calls;
    var time;
    var result;
    var data = Reflect.ownKeys(Memory.profiler.data).map(function (key) {
        calls = Memory.profiler.data[key].calls;
        time = Memory.profiler.data[key].time;
        result = {};
        result.name = "" + key;
        result.calls = calls;
        result.cpuPerCall = time / calls;
        result.callsPerTick = calls / totalTicks;
        result.cpuPerTick = time / totalTicks;
        totalCpu += result.cpuPerTick;
        return result;
    });
    data.sort(function (lhs, rhs) { return rhs.cpuPerTick - lhs.cpuPerTick; });
    var output = "";
    var longestName = (_.max(data, function (d) { return d.name.length; })).name.length + 2;
    output += _.padRight("Function", longestName);
    output += _.padLeft("Tot Calls", 12);
    output += _.padLeft("CPU/Call", 12);
    output += _.padLeft("Calls/Tick", 12);
    output += _.padLeft("CPU/Tick", 12);
    output += _.padLeft("% of Tot\n", 12);
    data.forEach(function (d) {
        output += _.padRight("" + d.name, longestName);
        output += _.padLeft("" + d.calls, 12);
        output += _.padLeft(d.cpuPerCall.toFixed(2) + "ms", 12);
        output += _.padLeft("" + d.callsPerTick.toFixed(2), 12);
        output += _.padLeft(d.cpuPerTick.toFixed(2) + "ms", 12);
        output += _.padLeft((d.cpuPerTick / totalCpu * 100).toFixed(0) + " %\n", 12);
    });
    output += totalTicks + " total ticks measured";
    output += "\t\t\t" + totalCpu.toFixed(2) + " average CPU profiled per tick";
    console.log(output);
}


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var _ = __webpack_require__(1);
var utils_1 = __webpack_require__(2);
var screeps_typescript_profiler_1 = __webpack_require__(0);
var Builder = (function () {
    function Builder() {
    }
    Builder.prototype.body = function (availEnergy) {
        if (availEnergy < 350) {
            return [WORK, CARRY, CARRY, MOVE];
        }
        else if (availEnergy < 450) {
            return [WORK, CARRY, CARRY, MOVE, MOVE];
        }
        else if (availEnergy < 550) {
            return [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE];
        }
        else if (availEnergy < 600) {
            return [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE];
        }
        else if (availEnergy < 650) {
            return [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
        }
        else if (availEnergy < 750) {
            return [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE];
        }
        else {
            return [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE];
        }
    };
    Builder.prototype.run = function (creep) {
        utils_1.utils.tryBuildRoad(creep);
        if (!creep.memory.building && !creep.memory.energyTarget && utils_1.utils.navigateToDesignatedRoom(creep)
            && creep.memory.operateInRoom) {
            utils_1.utils.moveTo(creep, new RoomPosition(25, 25, creep.memory.operateInRoom));
            return;
        }
        if (creep.memory.building && creep.carry.energy === 0) {
            creep.memory.building = false;
            creep.memory.energyTarget = "";
            creep.say(utils_1.Messages.HARVEST);
        }
        if (!creep.memory.building && creep.carry.energy === creep.carryCapacity) {
            creep.memory.building = true;
            creep.say(utils_1.Messages.BUILD);
        }
        if (creep.memory.building) {
            var target = Game.getObjectById(creep.memory.buildTarget);
            if (!target) {
                target = utils_1.utils.shiftStructure(creep, true);
                if (!target) {
                    target = utils_1.utils.findConstructionSite(creep);
                }
                if (!target) {
                    target = utils_1.utils.shiftStructure(creep, false);
                }
                if (target) {
                    creep.memory.buildTarget = target.id;
                }
                else {
                    creep.say("\uD83D\uDEA7 nothing");
                    creep.memory.buildTarget = "";
                    creep.memory.energyTarget = "";
                    creep.memory.building = false;
                }
            }
            if (target instanceof Structure) {
                if ((target.structureType !== STRUCTURE_WALL &&
                    target.structureType !== STRUCTURE_RAMPART && target.hits < target.hitsMax) ||
                    (target.structureType === STRUCTURE_WALL && target.hits < Memory.maxWallHits) ||
                    (target.structureType === STRUCTURE_RAMPART && target.hits < Memory.maxRampartHits)) {
                    if (creep.repair(target) === ERR_NOT_IN_RANGE) {
                        utils_1.utils.moveTo(creep, target.pos);
                    }
                }
                else {
                    creep.memory.buildTarget = "";
                    creep.memory.building = false;
                }
            }
            else if (target instanceof ConstructionSite) {
                if (creep.build(target) === ERR_NOT_IN_RANGE) {
                    utils_1.utils.moveTo(creep, target.pos);
                }
            }
            else {
                creep.say("\uD83D\uDEA7 strange");
                creep.memory.buildTarget = "";
                creep.memory.building = false;
            }
        }
        else {
            if (creep.carry.energy < creep.carryCapacity) {
                var target = utils_1.utils.getEnergyStorageTarget(creep);
                if (target) {
                    var src = creep.pos.findInRange([target], 1);
                    if (src.length) {
                        utils_1.utils.getEnergy(creep, src[0]);
                    }
                    else {
                        utils_1.utils.moveTo(creep, target.pos);
                    }
                }
                else {
                    creep.say("No energy");
                }
            }
        }
    };
    Builder.prototype.findConstructionSite = function (type, creep) {
        var target = null;
        var sites = _.filter(Game.constructionSites, function (site) {
            return site.structureType === type && site.pos.roomName === creep.memory.operateInRoom;
        });
        if (sites.length) {
            target = creep.pos.findClosestByPath(sites);
            if (!target) {
                target = sites[0];
            }
        }
        return target;
    };
    Builder = __decorate([
        screeps_typescript_profiler_1.profile
    ], Builder);
    return Builder;
}());
exports.roleBuilder = new Builder();


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var _ = __webpack_require__(1);
var utils_1 = __webpack_require__(2);
var screeps_typescript_profiler_1 = __webpack_require__(0);
var Carrier = (function () {
    function Carrier() {
    }
    Carrier.prototype.body = function (availEnergy) {
        var parts;
        if (availEnergy < 300) {
            parts = 6;
        }
        else if (750 < availEnergy) {
            parts = 15;
        }
        else {
            parts = Math.floor(availEnergy / 50);
        }
        var body = new Array(parts);
        var moveParts = Math.ceil(parts / 3);
        for (var i = 0; i < parts; ++i) {
            body[i] = i < moveParts ? MOVE : CARRY;
        }
        return body;
    };
    Carrier.prototype.run = function (creep) {
        utils_1.utils.tryBuildRoad(creep);
        if (!creep.memory.hauling && !creep.memory.energyTarget && utils_1.utils.navigateToDesignatedRoom(creep)
            && creep.memory.operateInRoom) {
            utils_1.utils.moveTo(creep, new RoomPosition(25, 25, creep.memory.operateInRoom));
            return;
        }
        if (creep.memory.hauling && creep.carry.energy === 0) {
            creep.memory.hauling = false;
            creep.memory.energyTarget = "";
            creep.say(utils_1.Messages.PICKUP);
        }
        if (!creep.memory.hauling && creep.carry.energy === creep.carryCapacity) {
            creep.memory.hauling = true;
            creep.memory.energyTarget = "";
            creep.say(utils_1.Messages.DISTRIBUTE);
        }
        if (creep.memory.hauling) {
            var target = this.getStoreTarget(creep);
            if (target && creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                utils_1.utils.moveTo(creep, target.pos);
            }
            else {
                creep.memory.energyTarget = "";
            }
        }
        else {
            var target = this.getEnergyTarget(creep);
            if (target && utils_1.utils.getEnergy(creep, target) === ERR_NOT_IN_RANGE) {
                utils_1.utils.moveTo(creep, target.pos);
            }
            else {
                creep.memory.energyTarget = "";
            }
        }
    };
    Carrier.prototype.getEnergyTarget = function (creep) {
        var target = Game.getObjectById(creep.memory.energyTarget);
        if (target instanceof Source && creep.pos.inRangeTo(target.pos, 2)) {
            target = null;
        }
        if (!target) {
            var drops = creep.room.find(FIND_DROPPED_RESOURCES, {
                filter: function (drop) {
                    return drop.resourceType === RESOURCE_ENERGY && 0 < drop.amount;
                }
            });
            target = _.sortBy(drops, function (drop) {
                return -drop.amount;
            })[0];
        }
        if (!target) {
            var sources = creep.room.find(FIND_SOURCES);
            var sourceConts = [].concat.apply([], _.map(sources, function (source) {
                return source.pos.findInRange(FIND_STRUCTURES, 3, {
                    filter: function (struct) {
                        if (struct.structureType !== STRUCTURE_CONTAINER) {
                            return false;
                        }
                        var controllerCont = Memory.controllerCont[struct.pos.roomName] === struct.id;
                        return (!controllerCont && 0 < struct.store[RESOURCE_ENERGY]) ||
                            (controllerCont && (struct.storeCapacity - _.sum(struct.store) < 50));
                    }
                });
            }));
            target = _.sortBy(sourceConts, function (cont) {
                return cont.storeCapacity - _.sum(cont.store);
            })[0];
        }
        if (!target) {
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: function (store) {
                    return store.structureType === STRUCTURE_STORAGE && 0 < store.energy;
                }
            });
            target = targets[0];
        }
        if (!target) {
            target = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE, {
                maxOps: 100
            });
            if (!target) {
                var targets = creep.room.find(FIND_SOURCES);
                target = targets[0];
            }
        }
        if (target) {
            creep.memory.energyTarget = target.id;
        }
        return target;
    };
    Carrier.prototype.getStoreTarget = function (creep) {
        var target = Game.getObjectById(creep.memory.energyTarget);
        if (!target) {
            if (creep.room.energyAvailable < creep.room.energyCapacityAvailable) {
                target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: function (struct) {
                        return (struct.structureType === STRUCTURE_SPAWN ||
                            struct.structureType === STRUCTURE_EXTENSION)
                            && struct.energy < struct.energyCapacity &&
                            creep.memory.operateInRoom === struct.pos.roomName;
                    }
                });
            }
        }
        if (!target) {
            var cont = Game.getObjectById(Memory.controllerCont[creep.pos.roomName]);
            if (cont && 500 < cont.storeCapacity - _.sum(cont.store)) {
                target = cont;
            }
        }
        if (!target) {
            var towers = _.filter(Game.structures, function (struct) {
                return struct.structureType === STRUCTURE_TOWER &&
                    0 <= struct.energyCapacity - struct.energy - 300;
            });
            target = _.sortBy(towers, function (tower) {
                return tower.energyCapacity + tower.energy;
            })[0];
        }
        if (!target) {
            var storages = creep.room.find(FIND_STRUCTURES, {
                filter: function (struct) {
                    return struct.structureType === STRUCTURE_STORAGE &&
                        0 < struct.storeCapacity - _.sum(struct.store);
                }
            });
            target = storages[0];
        }
        if (!target) {
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: function (spawn) {
                    return (spawn.structureType === STRUCTURE_SPAWN || spawn.structureType === STRUCTURE_EXTENSION) &&
                        spawn.energy < spawn.energyCapacity && creep.memory.operateInRoom === spawn.pos.roomName;
                }
            });
            target = targets[0];
        }
        if (target) {
            creep.memory.energyTarget = target.id;
        }
        return target;
    };
    Carrier = __decorate([
        screeps_typescript_profiler_1.profile
    ], Carrier);
    return Carrier;
}());
exports.roleCarrier = new Carrier();


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var _ = __webpack_require__(1);
var utils_1 = __webpack_require__(2);
var screeps_typescript_profiler_1 = __webpack_require__(0);
var Claimer = (function () {
    function Claimer() {
    }
    Claimer.prototype.body = function (availEnergy) {
        return [MOVE, MOVE, CLAIM];
    };
    Claimer.prototype.run = function (creep) {
        utils_1.utils.tryBuildRoad(creep);
        var flag = Game.flags["claim"];
        if (!flag) {
            flag = Game.flags["reserve"];
        }
        var sameRoom = flag && creep.room.name === flag.pos.roomName;
        if (!flag) {
            delete (creep.memory.claimTarget);
        }
        if (flag && !sameRoom) {
            utils_1.utils.moveTo(creep, flag.pos);
        }
        if (flag && sameRoom) {
            var structs = creep.room.lookForAt(LOOK_STRUCTURES, flag.pos);
            if (structs.length) {
                _.forEach(structs, function (str) {
                    if (str.structureType === STRUCTURE_CONTROLLER) {
                        creep.memory.claimTarget = str.id;
                    }
                });
            }
        }
        if (creep.memory.claimTarget) {
            var controller = Game.getObjectById(creep.memory.claimTarget);
            if (controller) {
                if (flag.name === "claim") {
                    if (creep.claimController(controller) !== OK) {
                        utils_1.utils.moveTo(creep, controller.pos);
                    }
                }
                else {
                    if (creep.reserveController(controller) !== OK) {
                        utils_1.utils.moveTo(creep, controller.pos);
                    }
                }
            }
        }
    };
    Claimer = __decorate([
        screeps_typescript_profiler_1.profile
    ], Claimer);
    return Claimer;
}());
exports.roleClaimer = new Claimer();


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var _ = __webpack_require__(1);
var utils_1 = __webpack_require__(2);
var screeps_typescript_profiler_1 = __webpack_require__(0);
var Harvester = (function () {
    function Harvester() {
    }
    Harvester.prototype.body = function (availEnergy) {
        if (availEnergy < 350) {
            return [WORK, WORK, CARRY, MOVE];
        }
        else if (availEnergy < 400) {
            return [WORK, WORK, CARRY, MOVE, MOVE];
        }
        else if (availEnergy < 500) {
            return [WORK, WORK, CARRY, MOVE, MOVE, MOVE];
        }
        else if (availEnergy < 600) {
            return [WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE];
        }
        else if (availEnergy < 700) {
            return [WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE];
        }
        else {
            return [WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE];
        }
    };
    Harvester.prototype.run = function (creep) {
        utils_1.utils.tryBuildRoad(creep);
        var target = Game.getObjectById(creep.memory.target);
        if (!target) {
            var sources_1 = [];
            _.forEach(Game.rooms, function (k, v) {
                _.forEach(k.find(FIND_SOURCES, {
                    filter: function (src) {
                        return !Memory.harvestedSources.hasOwnProperty(src.id);
                    }
                }), function (s) { sources_1.push(s); });
            });
            target = sources_1[0];
            if (target) {
                Memory.harvestedSources[target.id] = target.id;
                creep.memory.target = target.id;
                creep.say(utils_1.Messages.HARVEST);
            }
        }
        if (0 < creep.carry.energy) {
            var dst = creep.pos.findInRange(FIND_STRUCTURES, 1, {
                filter: function (struct) {
                    return (struct.structureType === STRUCTURE_LINK && struct.energy < struct.energyCapacity) ||
                        (struct.structureType === STRUCTURE_CONTAINER && _.sum(struct.store) < struct.storeCapacity);
                }
            });
            if (dst.length) {
                creep.transfer(dst[0], RESOURCE_ENERGY);
            }
            else {
                creep.drop(RESOURCE_ENERGY);
            }
        }
        var err = creep.harvest(target);
        if (err === ERR_NOT_IN_RANGE) {
            utils_1.utils.moveTo(creep, target.pos);
        }
    };
    Harvester = __decorate([
        screeps_typescript_profiler_1.profile
    ], Harvester);
    return Harvester;
}());
exports.roleHarvester = new Harvester();


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = __webpack_require__(2);
var screeps_typescript_profiler_1 = __webpack_require__(0);
var Upgrader = (function () {
    function Upgrader() {
    }
    Upgrader.prototype.body = function (availEnergy) {
        if (availEnergy < 350) {
            return [WORK, CARRY, MOVE, MOVE];
        }
        else if (availEnergy < 400) {
            return [WORK, WORK, CARRY, MOVE, MOVE];
        }
        else if (availEnergy < 500) {
            return [WORK, WORK, CARRY, MOVE, MOVE, MOVE];
        }
        else if (availEnergy < 600) {
            return [WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE];
        }
        else if (availEnergy < 700) {
            return [WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE];
        }
        else {
            return [WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE];
        }
    };
    Upgrader.prototype.run = function (creep) {
        utils_1.utils.tryBuildRoad(creep);
        if (utils_1.utils.navigateToDesignatedRoom(creep) && creep.memory.operateInRoom) {
            utils_1.utils.moveTo(creep, new RoomPosition(25, 25, creep.memory.operateInRoom));
        }
        else {
            if (creep.memory.upgrading && creep.carry.energy === 0) {
                creep.memory.upgrading = false;
                creep.say(utils_1.Messages.HARVEST);
            }
            if (!creep.memory.upgrading && creep.carry.energy === creep.carryCapacity) {
                creep.memory.upgrading = true;
                creep.memory.energyTarget = "";
                creep.say(utils_1.Messages.UPGRADE);
            }
            if (creep.memory.upgrading && creep.room.controller) {
                if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
                    utils_1.utils.moveTo(creep, creep.room.controller.pos);
                }
            }
            else {
                var target = utils_1.utils.getEnergyStorageTarget(creep);
                if (target) {
                    var src = creep.pos.findInRange([target], 1);
                    if (src.length) {
                        utils_1.utils.getEnergy(creep, src[0]);
                    }
                    else {
                        utils_1.utils.moveTo(creep, target.pos);
                    }
                }
            }
        }
    };
    __decorate([
        screeps_typescript_profiler_1.profile,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Number]),
        __metadata("design:returntype", void 0)
    ], Upgrader.prototype, "body", null);
    __decorate([
        screeps_typescript_profiler_1.profile,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Creep]),
        __metadata("design:returntype", void 0)
    ], Upgrader.prototype, "run", null);
    return Upgrader;
}());
exports.roleUpgrader = new Upgrader();


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var _ = __webpack_require__(1);
var screeps_typescript_profiler_1 = __webpack_require__(0);
var limits_1 = __webpack_require__(3);
var role_builder_1 = __webpack_require__(6);
var role_carrier_1 = __webpack_require__(7);
var role_claimer_1 = __webpack_require__(8);
var role_harvester_1 = __webpack_require__(9);
var role_upgrader_1 = __webpack_require__(10);
exports.BUILDER = "builder";
exports.CARRIER = "carrier";
exports.CLAIMER = "claimer";
exports.HARVESTER = "harvester";
exports.UPGRADER = "upgrader";
exports.roles = {
    builder: role_builder_1.roleBuilder,
    carrier: role_carrier_1.roleCarrier,
    claimer: role_claimer_1.roleClaimer,
    harvester: role_harvester_1.roleHarvester,
    upgrader: role_upgrader_1.roleUpgrader
};
var RolesModule = (function () {
    function RolesModule() {
    }
    RolesModule_1 = RolesModule;
    RolesModule.countControllers = function () {
        var controllers = 0;
        _.forOwn(Game.rooms, function (room) {
            if (room.controller && room.controller.my) {
                controllers += 1;
            }
        });
        return controllers;
    };
    RolesModule.limit = function (role) {
        if (role === "claimer") {
            return _.isUndefined(Game.flags["claim"]) && _.isUndefined(Game.flags["reserve"]) ? 0 : limits_1.limits[role];
        }
        else {
            return limits_1.limits[role] * Memory.controllerCount;
        }
    };
    RolesModule.getMaxEnergySpawn = function () {
        var spawns = [];
        _.forOwn(Game.spawns, function (spawn) { spawns.push(spawn); });
        spawns.sort(function (a, b) { return b.room.energyAvailable - a.room.energyAvailable; });
        return spawns[0];
    };
    RolesModule.prototype.count = function () {
        var count = {};
        _.forOwn(exports.roles, function (role, name) { count[name] = 0; });
        _.forEach(Game.creeps, function (creep) { count[creep.memory.role] += 1; });
        _.forEach(Memory.spawnQueue, function (spec) { count[spec.role] += 1; });
        return count;
    };
    RolesModule.prototype.processSpawnQueue = function (spawn) {
        var spec = Memory.spawnQueue.shift();
        if (spec) {
            console.log("Processing spawn Q " + spawn.name);
            if (spawn.canCreateCreep(spec.body) === OK) {
                var newName = spawn.createCreep(spec.body, undefined, { role: spec.role });
                console.log("Spawning new " + spec.role + ": " + newName);
            }
            else if ("claimer" === spec.role) {
                Memory.spawnQueue.push(spec);
            }
            else {
                Memory.spawnQueue.unshift(spec);
            }
        }
    };
    RolesModule.prototype.run = function (creep) {
        exports.roles[creep.memory.role].run(creep);
    };
    RolesModule.prototype.spawn = function (role) {
        if (!role) {
            _.forOwn(exports.roles, function (r, name) {
                if (name && Memory.creepCount[name] < RolesModule_1.limit(name)) {
                    var spawn = RolesModule_1.getMaxEnergySpawn();
                    if (!spawn) {
                        return;
                    }
                    var energy = spawn.room.energyAvailable;
                    var body = r.body(energy);
                    Memory.spawnQueue.push({ body: body, role: name });
                }
            });
        }
        else if (typeof role === "string") {
            var spawn = RolesModule_1.getMaxEnergySpawn();
            if (!spawn) {
                return;
            }
            var energy = spawn.room.energyAvailable;
            var body = exports.roles[role].body(energy);
            Memory.spawnQueue.push({ body: body, role: role });
        }
        else {
            Memory.spawnQueue.push(role);
        }
    };
    RolesModule = RolesModule_1 = __decorate([
        screeps_typescript_profiler_1.profile
    ], RolesModule);
    return RolesModule;
    var RolesModule_1;
}());
exports.RolesModule = RolesModule;
exports.rolesModule = new RolesModule();


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(4);


/***/ })
/******/ ]);
//# sourceMappingURL=main.js.map.js