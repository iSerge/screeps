import * as _ from "lodash";

import {Messages, utils} from "./utils";

import {Role} from "./Role";

/**
 *
 * @class
 * @extends {Role}
 */
class Carrier implements Role {
    /**
     * @override
     */
    public body(availEnergy: number) {
        let parts;
        if (availEnergy < 300) {
            parts = 6;
        } else if (750 < availEnergy) {
            parts = 15;
        } else {
            parts = Math.floor(availEnergy / 50);
        }

        const body = new Array(parts);
        const moveParts = Math.ceil(parts / 3);

        for (let i = 0; i < parts; ++i) {
            body[i] = i < moveParts ? MOVE : CARRY;
        }
        return body;
    }

    /**
     * @override
     */
    public run(creep: Creep) {
        utils.tryBuildRoad(creep);

        if (!creep.memory.hauling && !creep.memory.energyTarget && utils.navigateToDesignatedRoom(creep)
             && creep.memory.operateInRoom) {
            utils.moveTo(creep, new RoomPosition(25, 25, creep.memory.operateInRoom));
            return;
        }

        if (creep.memory.hauling && creep.carry.energy === 0) {
            creep.memory.hauling = false;
            creep.memory.energyTarget = "";
            creep.say(Messages.PICKUP);
        }

        if (!creep.memory.hauling && creep.carry.energy === creep.carryCapacity) {
            creep.memory.hauling = true;
            creep.memory.energyTarget = "";
            creep.say(Messages.DISTRIBUTE);
        }

        if (creep.memory.hauling) {
            const target = this.getStoreTarget(creep);
            if (target && creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                utils.moveTo(creep, target.pos);
            } else {
                creep.memory.energyTarget = "";
            }
        } else {
            const target = this.getEnergyTarget(creep);
            if (target && utils.getEnergy(creep, target) === ERR_NOT_IN_RANGE) {
                utils.moveTo(creep, target.pos);
            } else {
                creep.memory.energyTarget = "";
            }
        }
    }

    /**
     *
     * @param {Creep} creep
     * @return {Resource|Source|Structure}
     */
    private getEnergyTarget(creep: Creep): Resource | Source | Structure | null {
        let target: Structure | Resource | Source | null = Game.getObjectById(creep.memory.energyTarget);

        if (target instanceof Source && creep.pos.inRangeTo(target.pos, 2)) {
            target = null;
        }

        if (!target) {
            // dropped energy
            const drops: Resource[] = creep.room.find(FIND_DROPPED_RESOURCES, {
                filter: (drop: Resource) => {
                    return drop.resourceType === RESOURCE_ENERGY && 50 < drop.amount;
                }
            });

            target = _.sortBy(drops, (drop: Resource) => {
                return -drop.amount;
            })[0];
        }

        if (!target) {
            // containers near sources
            const conts: Structure[] = creep.room.find(FIND_STRUCTURES, {
                filter: (struct: Structure) => {
                    if (struct.structureType === STRUCTURE_CONTAINER) {
                        const cont = struct as StructureContainer;
                        return cont.id !== creep.room.memory.controllerCont && 20 < cont.store.energy;
                    } else {
                        return false;
                    }
                }
            });

            // most full container
            target = _.sortBy(conts, (cont) => {
                if (cont.structureType === STRUCTURE_CONTAINER) {
                    const c = cont as StructureContainer;
                    return c.storeCapacity - c.store.energy;
                } else {
                    return 0;
                }
            })[0];
        }

        if (!target) {
            const targets: Structure[] = creep.room.find(FIND_MY_STRUCTURES, {
                filter: (struct: Structure) => {
                    if (struct.structureType === STRUCTURE_STORAGE) {
                        const store = struct as StructureStorage;
                        return store.structureType === STRUCTURE_STORAGE && 0 < store.store.energy;
                    } else {
                        return false;
                    }

                }
            });
            target = targets[0];
        }

        if (!target) {
            target = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE, {
                maxOps: 100
            });
            if (!target) {
                const targets: Source[] = creep.room.find(FIND_SOURCES);
                target = targets[0];
            }
        }

        if (target) {
            creep.memory.energyTarget = target.id;
        }

        return target;
    }

    /**
     *
     * @param {Creep} creep
     * @return {Spawn|Structure}
     */
    private getStoreTarget(creep: Creep): Creep | Structure | null {
        let target: Creep | Structure | null = Game.getObjectById(creep.memory.energyTarget);

        if (!target) {
            // console.log('Carrier ' + creep.name + ' looking for spawns and extensions');
            if (creep.room.energyAvailable < creep.room.energyCapacityAvailable) {
                target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (s: Structure) => {
                        switch (s.structureType) {
                            case STRUCTURE_SPAWN:
                                const spawn = s as StructureExtension;
                                return spawn.energy < spawn.energyCapacity
                                    && creep.memory.operateInRoom === spawn.pos.roomName;
                            case STRUCTURE_EXTENSION:
                                const ext = s as StructureExtension;
                                return ext.energy < ext.energyCapacity
                                    && creep.memory.operateInRoom === ext.pos.roomName;
                                default:
                                return false;
                        }
                    }
                });
            }
        }
            // console.log('Harvester ' + creep.name + ' harvesting target: ' + target.id);

        if (!target) {
            // containers near controllers
            // console.log('Carrier ' + creep.name + ' looking for controller container');

            const designatedRoom = Game.rooms[creep.memory.operateInRoom];

            const cont: StructureContainer | null =
                !_.isNull(designatedRoom) ? Game.getObjectById(designatedRoom.memory.controllerCont) : null;
            if (cont && 500 < cont.storeCapacity - cont.store.energy) {
                target = cont;
            }
        }

        if (!target) {
            // console.log('Carrier ' + creep.name + ' looking for towers');
            const towers: Structure[] = _.filter(Game.structures, (struct: Structure) => {
                if (STRUCTURE_TOWER === struct.structureType) {
                    const tower = struct as StructureTower;
                    return tower.room.name === creep.memory.operateInRoom &&
                    0 <= tower.energyCapacity - tower.energy - 300;
                } else {
                    return false;
                }
            });

            // emptiest tower
            target = _.sortBy(towers, (struct) => {
                if (struct.structureType === STRUCTURE_CONTAINER) {
                    const tower = struct as StructureTower;
                    return tower.energyCapacity + tower.energy;
                } else {
                    return 0;
                }
            })[0];
        }

        if (!target) {
            // looking for storage
            // console.log('Carrier ' + creep.name + ' looking for storage');
            const storages: Structure[] = creep.room.find(FIND_STRUCTURES, {
                filter: (struct: Structure) => {
                    if (struct.structureType === STRUCTURE_STORAGE) {
                        const store = struct as StructureStorage;
                        return 0 < store.storeCapacity - store.store.energy;
                    } else {
                        return false;
                    }
                }
            });
            target = storages[0];
        }
        if (!target) {
            // console.log('Carrier ' + creep.name + ' looking for sources');

            const targets: Structure[] = creep.room.find(FIND_STRUCTURES, {
                filter: (struct: Structure) => {
                    switch (struct.structureType) {
                        case STRUCTURE_EXTENSION:
                            const ext = struct as StructureExtension;
                            return ext.energy < ext.energyCapacity && creep.memory.operateInRoom === ext.pos.roomName;
                        case STRUCTURE_SPAWN:
                            const spawn = struct as StructureSpawn;
                            return spawn.energy < spawn.energyCapacity
                                && creep.memory.operateInRoom === spawn.pos.roomName;
                        default:
                            return false;
                    }

                }
            });
            target = targets[0];
        }

        if (target) {
            creep.memory.energyTarget = target.id;
        }

        return target;
    }
}

export const roleCarrier: Role = new Carrier();
