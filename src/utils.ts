/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('utils');
 * mod.thing == 'a thing'; // true
 */

import * as _ from "lodash";

import {limits} from "./limits";

export const Messages = {
    BUILD: "\uD83D\uDEA7 build",
    CONSTRUCT_SYM: "\uD83D\uDEE0",
    DISTRIBUTE: "\u2194 distr",
    HARVEST: "\uD83D\uDD04 harvest",
    PICKUP: "\u2B06 pickup",
    UPGRADE: "\u26A1 upgrade",
};

/**
 * @function
 * @param {Creep} creep
 * @param {ConstructionSite} site
 * @return {number}
 */
function buildPriority(creep: Creep, site: ConstructionSite) {
    let priority;
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
}

export const utils = {
    clearMemory: () => {
        _.forOwn(Memory.creeps, (creep, name: string) => {
            if (!Game.creeps.hasOwnProperty(name)) {
                if (creep.target) {
                    delete Memory.harvestedSources[creep.target];
                }

                delete Memory.creeps[name];
                console.log("Clearing non-existing creep memory:", name);
            }
        });
    },

    /**
     * @function
     * @param {object} object
     * @param {string} object.id
     */
    enqueueStructure: (object: Structure) => {
        if (_.isUndefined(object)) {
            return;
        }

        if (!_.includes(Memory.repairQueue, object.id)) {
            Memory.repairQueue.push(object.id);
        }
    },

    /**
     * @function
     * @param {Creep} creep
     * @return {undefined|ConstructionSite}
     */
    findConstructionSite: (creep: Creep) => {
        return _.sortBy(Game.constructionSites, [(site: ConstructionSite) => {
            return buildPriority(creep, site);
        }])[0];
    },

    /**
     *
     * @param {Creep} creep
     * @param {Resource|Source|Structure} target
     */
    getEnergy: (creep: Creep, target: Resource | Source | Structure) => {
        let result;
        if (target instanceof Resource) {
            result = creep.pickup(target);
            if (result === OK) {
                creep.memory.energyTarget = "";
            }
        } else if (target instanceof Source) {
            result = creep.harvest(target);
        } else {
            result = creep.withdraw(target, RESOURCE_ENERGY);
            if (result === OK) {
                creep.memory.energyTarget = "";
            }
        }
        return result;
    },

    /**
     *
     * @param {Creep} creep
     * @return {RoomObject}
     */
    getEnergyStorageTarget: (creep: Creep) => {
        let target: Structure | null = Game.getObjectById(creep.memory.energyTarget);

        if (!target) {
            let targets = creep.room.find(FIND_DROPPED_RESOURCES, {
                filter: (res: Resource) => {
                    return res.resourceType === RESOURCE_ENERGY;
                }
            });

            targets = targets.concat(creep.room.find(FIND_STRUCTURES, {
                filter: (struct: StructureStorage | StructureLink | StructureContainer) => {
                    return ((struct.structureType === STRUCTURE_STORAGE ||
                        struct.structureType === STRUCTURE_CONTAINER) &&
                        0 < struct.store[RESOURCE_ENERGY]) ||
                        (struct.structureType === STRUCTURE_LINK && 0 < struct.energy);
                }
            }));

            target = creep.pos.findClosestByPath(targets, {
                maxOps: 1000
            }) as Structure;
        }

        if (!target) {
            target = creep.pos.findClosestByPath(FIND_SOURCES);
        }

        if (target) {
            creep.memory.energyTarget = target.id;
        }

        return target;
    },

    /**
     *
     * @param {Creep} creep
     * @param {RoomPosition} target
     */
    moveTo: (creep: Creep, target: RoomPosition) => {
        if (ERR_NOT_FOUND === creep.moveTo(target, {
                noPathFinding: true,
                visualizePathStyle: {stroke: "#ffffff"}
            })) {
            creep.moveTo(target, {
                reusePath: 20,
                visualizePathStyle: {stroke: "#ffffff"}
            });
        }
    },

    /**
     * @param {Creep} creep
     */
    navigateToDesignatedRoom: (creep: Creep) => {
        if (!creep.memory.operateInRoom) {
            const rooms = _.map(_.filter(Game.structures, (o, k) => o.structureType === STRUCTURE_CONTROLLER),
                (s) => s.pos.roomName);
            const creepCount = _.reduce(Game.creeps, (result, c) => {
                if (c.memory.role === creep.memory.role && c.memory.operateInRoom) {
                    const room = c.memory.operateInRoom;
                    result[room] = (result[room] || (result[room] = 0)) + 1;
                }
                return result;
            }, {} as _.Dictionary<number>);
            const limit = limits[creep.memory.role];
            creep.memory.operateInRoom = _.filter(rooms, (room) => {
                return !creepCount.hasOwnProperty(room) || creepCount[room] < limit;
            })[0];
        }
        return creep.memory.operateInRoom !== creep.pos.roomName;
    },

    /**
     * @function
     * @param {Creep} creep
     * @param {boolean} own
     * @return {null|RoomObject}
     */
    shiftStructure: (creep: Creep, own: boolean): Structure | null => {
        if (0 < Memory.repairQueue.length) {
            let id = Game.getObjectById(Memory.repairQueue[0]);
            while (!id) {
                Memory.repairQueue.shift();
                id = Game.getObjectById(Memory.repairQueue[0]);
            }
        }

        const needsRepair: string | undefined = _.find(Memory.repairQueue, (id: string) => {
            const struct: RoomObject | null = _.isUndefined(id) ? null : Game.getObjectById(id);
            return struct && (!own || struct.pos.roomName === creep.memory.operateInRoom);
        });

        if (_.isUndefined(needsRepair)) {
            return null;
        }

        Memory.repairQueue = _.filter(Memory.repairQueue, (id) => id !== needsRepair);

        return Game.getObjectById(needsRepair);
    },

    /**
     * @function
     * Checks if creep stans on road and if not initiates road building
     *
     * @param {Creep} creep
     */
    tryBuildRoad: (creep: Creep) => {
        if (Memory.autoBuildRoads) {
            const road = _.filter(creep.room.lookAt(creep.pos), (obj: LookAtResult) => {

                return obj && obj.structure &&
                    ((obj.type === LOOK_STRUCTURES && obj.structure.structureType === STRUCTURE_ROAD) ||
                        obj.type === LOOK_CONSTRUCTION_SITES);
            });

            if (!road.length) {
                creep.room.createConstructionSite(creep.pos, STRUCTURE_ROAD);
            }
        }
    },

    updateInfrastructure: () => {
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

        Memory.controllerCount = _.size(_.filter(Game.structures, (o, k) => o.structureType === STRUCTURE_CONTROLLER));
    }
};
