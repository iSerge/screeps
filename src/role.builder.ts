import * as _ from "lodash";

import {Messages, utils} from "./utils";

import {Role} from "./Role";

class Builder implements Role {
    /**
     * @override
     */
    public body(availEnergy: number) {
        if (availEnergy < 350) {
            return [WORK, CARRY, CARRY, MOVE]; // 250
        } else if (availEnergy < 450) {
            return [WORK, CARRY, CARRY, MOVE, MOVE]; // 350
        } else if (availEnergy < 550) {
            return [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE]; // 450
        } else if (availEnergy < 600) {
            return [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE]; // 550
        } else if (availEnergy < 650) {
            return [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE]; // 600
        } else if (availEnergy < 750) {
            return [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE]; // 650
        } else {
            return [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE]; // 750
        }
    }

    /**
     * @override
     */
    public run(creep: Creep) {
        utils.tryBuildRoad(creep);

        if (!creep.memory.building && !creep.memory.energyTarget && utils.navigateToDesignatedRoom(creep)
            && creep.memory.operateInRoom) {
            utils.moveTo(creep, new RoomPosition(25, 25, creep.memory.operateInRoom));
            return;
        }

        if (creep.memory.building && creep.carry.energy === 0) {
            creep.memory.building = false;
            creep.memory.energyTarget = "";
            creep.say(Messages.HARVEST);
        }

        if (!creep.memory.building && creep.carry.energy === creep.carryCapacity) {
            creep.memory.building = true;
            creep.say(Messages.BUILD);
        }

        if (creep.memory.building) {
            let target = Game.getObjectById(creep.memory.buildTarget) as Structure | ConstructionSite | null;
            if (!target) {
                target = utils.shiftStructure(creep, true);

                if (!target) {
                    target = utils.findConstructionSite(creep);
                }

                if (!target) {
                    target = utils.shiftStructure(creep, false);
                }

                if (target) {
                    creep.memory.buildTarget = target.id;
                } else {
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
                        utils.moveTo(creep, target.pos);
                    }
                } else {
                    creep.memory.buildTarget = "";
                    creep.memory.building = false;
                }
            } else if (target instanceof ConstructionSite) {
                if (creep.build(target) === ERR_NOT_IN_RANGE) {
                    utils.moveTo(creep, target.pos);
                }
            } else {
                creep.memory.buildTarget = "";
                creep.memory.building = false;
            }
        } else {
            if (creep.carry.energy < creep.carryCapacity) {
                const target = utils.getEnergyStorageTarget(creep);
                if (target) {
                    const src = creep.pos.findInRange([target], 1);
                    if (src.length) {
                        utils.getEnergy(creep, src[0]);
                    } else {
                        utils.moveTo(creep, target.pos);
                    }
                } else {
                    creep.say("No energy");
                }
            }
        }
    }

    /**
     *
     * @param {string} type
     * @param {Creep} creep
     * @returns {ConstructionSite}
     */
    private findConstructionSite(type: StructureConstant, creep: Creep) {
        let target = null;

        const sites = _.filter(Game.constructionSites, (site: ConstructionSite) => {
            return  site.structureType === type && site.pos.roomName === creep.memory.operateInRoom;
        });

        if (sites.length) {
            target = creep.pos.findClosestByPath(sites);
            if (!target) {
                target = sites[0];
            }
        }

        return target;
    }

}

export const roleBuilder: Role = new Builder();
