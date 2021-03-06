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
    UPGRADE: "\u26A1 upgrade"
};

export class Utils {
    /**
     * @function
     * @param {Creep} creep
     * @param {ConstructionSite} site
     * @return {number}
     */
    private static buildPriority(creep: Creep, site: ConstructionSite) {
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

    public clearMemory() {
        _.forOwn(Memory.creeps, (creep, name: string) => {
            if (!Game.creeps.hasOwnProperty(name)) {
                if (creep.target) {
                    delete Memory.harvestedSources[creep.target];
                }

                delete Memory.creeps[name];
            }
        });

        _.forOwn(Memory.rooms, (room, name: string) => {
            if (!Game.rooms.hasOwnProperty(name)) {
                delete Memory.rooms[name];
            }
        });
    }

    /**
     * @method
     * @param {Room} room
     * @param {object} object
     * @param {string} object.id
     */
    public enqueueStructure(room: Room, object: Structure) {
        if (_.isUndefined(object)) {
            return;
        }

        if (!_.includes(room.memory.repairQueue, object.id)) {
            room.memory.repairQueue.push(object.id);
        }
    }

    /**
     * @function
     * @param {Creep} creep
     * @return {undefined|ConstructionSite}
     */
    public findConstructionSite(creep: Creep) {
        return _.sortBy(Game.constructionSites, [(site: ConstructionSite) => {
            return Utils.buildPriority(creep, site);
        }])[0];
    }

    /**
     *
     * @param {Creep} creep
     * @param {Resource|Source|Structure} target
     */
    public getEnergy(creep: Creep, target: Resource | Source | Structure) {
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
    }

    /**
     *
     * @param {Creep} creep
     * @return {RoomObject}
     */
    public getEnergyStorageTarget(creep: Creep) {
        let target: Structure | Resource | Source | null = Game.getObjectById(creep.memory.energyTarget);

        if (!target) {
            let targets: RoomObject[] = creep.room.find(FIND_DROPPED_RESOURCES, {
                filter: (res: Resource) => {
                    return res.resourceType === RESOURCE_ENERGY;
                }
            });

            targets = targets.concat(creep.room.find(FIND_MY_STRUCTURES, {
                filter: (struct: Structure) => {
                    switch (struct.structureType) {
                        case STRUCTURE_STORAGE:
                            const storage = struct as StructureStorage;
                            return 0 < storage.store[RESOURCE_ENERGY];
                        case STRUCTURE_CONTAINER:
                            const container = struct as StructureContainer;
                            return 0 < container.store[RESOURCE_ENERGY];
                        case STRUCTURE_LINK:
                            const link = struct as StructureLink;
                            return 0 < link.energy;
                        default:
                            return false;
                    }
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
    }

    /**
     *
     * @param {Creep} creep
     * @param {RoomPosition} target
     */
    public moveTo(creep: Creep, target: RoomPosition) {
        if (ERR_NOT_FOUND === creep.moveTo(target, {
                noPathFinding: true,
                visualizePathStyle: {stroke: "#ffffff"}
            })) {
            creep.moveTo(target, {
                reusePath: 20,
                visualizePathStyle: {stroke: "#ffffff"}
            });
        }
    }

    /**
     * @param {Creep} creep
     */
    public navigateToDesignatedRoom(creep: Creep) {
        return creep.memory.operateInRoom !== creep.pos.roomName;
    }

    /**
     * @function
     * @param {Creep} creep
     * @param {boolean} own
     * @return {null|RoomObject}
     */
    public shiftStructure(creep: Creep, own: boolean): Structure | null {
        const roomName = creep.memory.operateInRoom;
        if (0 < Memory.rooms[roomName].repairQueue.length) {
            let id = Game.getObjectById(Memory.rooms[roomName].repairQueue[0]);
            while (!id) {
                Memory.rooms[roomName].repairQueue.shift();
                id = Game.getObjectById(Memory.rooms[roomName].repairQueue[0]);
            }
        }

        const needsRepair = _.find(Memory.rooms[roomName].repairQueue, (id: string) => {
            const struct: RoomObject | null = _.isUndefined(id) ? null : Game.getObjectById(id);
            return !_.isNull(struct) && (!own || struct.pos.roomName === creep.memory.operateInRoom);
        });

        if (_.isUndefined(needsRepair)) {
            return null;
        }

        Memory.rooms[roomName].repairQueue = _.filter(Memory.rooms[roomName].repairQueue, (id) => id !== needsRepair);

        return Game.getObjectById(needsRepair);
    }

    /**
     * @function
     * Checks if creep stans on road and if not initiates road building
     *
     * @param {Creep} creep
     */
    public tryBuildRoad(creep: Creep) {
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
    }

    public updateInfrastructure() {
        _.forOwn(Game.rooms, (room) => {
            if (_.isUndefined(room.memory.repairQueue)) {
                room.memory.repairQueue = [];
            }
            if (_.isUndefined(room.memory.spawnQueue)) {
                room.memory.spawnQueue = [];
            }
            if (_.isUndefined(room.memory.creepCount)) {
                room.memory.creepCount = {};
            }
        });

        if (_.isUndefined(Memory.harvestedSources)) {
            Memory.harvestedSources = {};
        }
        if (_.isUndefined(Memory.autoBuildRoads)) {
            Memory.autoBuildRoads = true;
        }
        if (_.isUndefined(Memory.maxWallHits)) {
            Memory.maxWallHits = 100000;
        }
        if (_.isUndefined(Memory.maxRampartHits)) {
            Memory.maxRampartHits = 30000;
        }
    }
}

export const utils = new Utils();
