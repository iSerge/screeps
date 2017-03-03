/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('utils');
 * mod.thing == 'a thing'; // true
 */

let rampartHits = 0;
let wallHits = 0;

function calcToughHits(){
    let firstWall = true;
    let firstRmpart = true;
    _.forOwn(Game.rooms, (room) => {
       room.find(FIND_STRUCTURES, {
           filter: (s) => {
               if(s.structureType === STRUCTURE_WALL) {
                   if (firstWall) {
                       wallHits = s.hits;
                       firstWall = false;
                   } else {
                       wallHits = Math.min(s.hits, wallHits);
                   }
               }
               if(s.structureType === STRUCTURE_RAMPART) {
                   if (firstRmpart) {
                       rampartHits = s.hits;
                       firstRmpart = false;
                   } else {
                       rampartHits = Math.min(s.hits, rampartHits);
                   }
               }
               return false;
           }
        });
    });
}

module.exports = {
    /**
     * @const
     * @type {string}
     */
    HARVEST: '\uD83D\uDD04 harvest',
    /**
     * @const
     * @type {string}
     */
    BUILD: '\uD83D\uDEA7 build',
    /**
     * @const
     * @type {string}
     */
    UPGRADE: '\u26A1 upgrade',
    /**
     * @const
     * @type {string}
     */
    CONSTRUCT_SYM: '\uD83D\uDEE0',
    /**
     * @const
     * @type {string}
     */
    DISTRIBUTE: '\u2194 distr',
    /**
     * @const
     * @type {string}
     */
    PICKUP: '\u2B06 pickup',

    /**
     * @function
     * @param {object} object
     * @param {string} object.id
     */
    enqueueStructure: (object) => {
        if(_.isUndefined(object)){
            return;
        }

        if(!_.includes(Memory.repairQueue, object.id)){
            Memory.repairQueue.push(object.id);
        }
    },

    /**
     * @function
     * @return {undefined|RoomObject}
     */
    shiftStructure: () => {
        const id = Memory.repairQueue.shift();

        if(_.isUndefined(id)){
            return undefined;
        }

        return Game.getObjectById(id);
    },

    /**
     * @function
     * @param {Creep} creep
     * @param {number} target One of the FIND_* constants.
     *
     * @return {{path:Array<RoomPosition>,opts:number}} An object containing: path - An array of RoomPosition objects; ops - Total number of operations performed before this path was calculated.
     */
    findPathTo: function(creep, target) {
        let goals = _.map(creep.room.find(target), function(source) {
            // We can't actually walk on sources-- set `range` to 1 so we path
            // next to it.
            return { pos: source.pos, range: 1 };
        });

        return PathFinder.search(
            creep.pos, goals,
            {
                // We need to set the defaults costs higher so that we
                // can set the road cost lower in `roomCallback`
                plainCost: 2,
                swampCost: 10,

                roomCallback: function (roomName) {

                    let room = Game.rooms[roomName];
                    // In this example `room` will always exist, but since PathFinder
                    // supports searches which span multiple rooms you should be careful!
                    if (!room) return;
                    let costs = new PathFinder.CostMatrix;

                    room.find(FIND_STRUCTURES).forEach(function (structure) {
                        if (structure.structureType === STRUCTURE_ROAD) {
                            // Favor roads over plain tiles
                            costs.set(structure.pos.x, structure.pos.y, 1);
                        } else if (structure.structureType !== STRUCTURE_CONTAINER &&
                            (structure.structureType !== STRUCTURE_RAMPART || !structure.my)) {
                            // Can't walk through non-walkable buildings
                            costs.set(structure.pos.x, structure.pos.y, 0xff);
                        }
                    });

                    // Avoid creeps in the room
                    room.find(FIND_CREEPS).forEach(function (creep) {
                        costs.set(creep.pos.x, creep.pos.y, 0xff);
                    });

                    return costs;
                },
            }
        );
    },

    clearMemory: () => {
        _.forOwn(Memory.creeps, (creep, name) => {
           if(!Game.creeps.hasOwnProperty(name)){
               if(creep.hasOwnProperty('target')) {
                   delete Memory.harvestedSources[creep.target];
               }

               delete Memory.creeps[name];
               console.log('Clearing non-existing creep memory:', name);
           }
        });
    },

    /**
     * @function
     * Checks if creep stans on road and if not initiates road building
     *
     * @param {Creep} creep
     */
    tryBuildRoad: (creep) => {
        if(Memory.autoBuildRoads) {
            const road = _.filter(creep.room.lookAt(creep.pos), (obj) => {

                return !_.isUndefined(obj) &&
                    ((obj.type === LOOK_STRUCTURES && obj.structure.structureType === STRUCTURE_ROAD) ||
                    obj.type === LOOK_CONSTRUCTION_SITES);
            });

            if (!road.length) {
                creep.room.createConstructionSite(creep.pos, STRUCTURE_ROAD);
            }
        }
    },

    /**
     *
     * @param {Creep} creep
     * @param {RoomPosition} target
     */
    moveTo: (creep, target) => {
        if(ERR_NOT_FOUND === creep.moveTo(target, {
            noPathFinding: true,
            visualizePathStyle: {stroke: '#ffffff'}
        })) {
            creep.moveTo(target, {
                reusePath: 20,
                visualizePathStyle: {stroke: '#ffffff'}
            })
        }
    },

    /**
     *
     * @param {Creep} creep
     * @return {RoomObject}
     */
    getEnergyStorageTarget: (creep) => {
        let target = Game.getObjectById(creep.memory.energyTarget);

        if(!target) {
            let storages = creep.room.find(FIND_STRUCTURES, {
                filter: (store) => {
                    return store.structureType === STRUCTURE_STORAGE && creep.carryCapacity <= store.store[RESOURCE_ENERGY];
                }
            });

            if (storages.length) {
            }

            target = storages[0];
        }

        if(!target) {
            let targets = creep.room.find(FIND_DROPPED_RESOURCES, {
                filter: (res) => {
                    return res.resourceType === RESOURCE_ENERGY;
                }
            });

            targets = targets.concat(creep.room.find(FIND_STRUCTURES, {
                filter: (struct) => {
                    return ((struct.structureType === STRUCTURE_STORAGE ||
                    struct.structureType === STRUCTURE_CONTAINER) &&
                    0 < struct.store[RESOURCE_ENERGY]);
                }}));

            targets = targets.concat(creep.room.find(FIND_STRUCTURES, {
                filter: (struct) => {
                    return ((struct.structureType === STRUCTURE_STORAGE ||
                    struct.structureType === STRUCTURE_CONTAINER) &&
                    0 < struct.store[RESOURCE_ENERGY]) ||
                        (struct.structureType == STRUCTURE_LINK && 0 < struct.energy);
                }}));

            target = creep.pos.findClosestByPath(targets, {
                maxOps: 500
            });

            if (!target) {
                const targets = creep.room.find(FIND_SOURCES);
                target = targets[0];
            }

            creep.memory.energyTarget = target.id;
        }

        return target;
    },

    /**
     *
     * @param {Creep} creep
     * @param {Resource|Source|Structure} target
     */
    getEnergy: (creep, target) => {
        let result;
        if(target instanceof Resource){
            result = creep.pickup(target);
            if(result === OK){
                creep.memory.energyTarget = '';
            }
        } else if(target instanceof Source) {
            result = creep.harvest(target);
        } else {
            result = creep.withdraw(target, RESOURCE_ENERGY);
            if(result === OK){
                creep.memory.energyTarget = '';
            }
        }
        return result;
    },

    updateInfrastructure: () => {
        if(_.isUndefined(Memory.repairQueue)){
            Memory.repairQueue = [];
        }
        if(_.isUndefined(Memory.spawnQueue)){
            Memory.spawnQueue = [];
        }
        if(_.isUndefined(Memory.harvestedSources)){
            Memory.harvestedSources = {};
        }
        if(_.isUndefined(Memory.autoBuildRoads)){
            Memory.autoBuildRoads = true;
        }
        if(_.isUndefined(Memory.controllerCont)){
            Memory.controllerCont = '';
        }
        if(_.isUndefined(Memory.maxWallHits)){
            Memory.maxWallHits = 100000;
        }
        if(_.isUndefined(Memory.maxRampartHits)){
            Memory.maxRampartHits = 30000;
        }

        const controllerCont = Game.getObjectById(Memory.controllerCont);
        if(!controllerCont){
            const controllers = _.map(Game.rooms, (room) => {
                return room.controller;
            });

            let controllerConts = [].concat.apply([], _.map(controllers, (source) => {
                return source.pos.findInRange(FIND_STRUCTURES, 3, {
                    filter: (cont) => {
                        return cont.structureType === STRUCTURE_CONTAINER;
                    }
                });
            }));

            if(controllerConts.length) {
                Memory.controllerCont = controllerConts[0].id;
            }
        }

        // calcToughHits();
        // if(Memory.maxWallHits <= wallHits){
        //     Memory.maxWallHits += 100000;
        // }
        //
        // if(Memory.maxRampartHits <= rampartHits){
        //     Memory.maxRampartHits += 10000;
        // }
    }
};