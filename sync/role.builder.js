const util = require('./utils');

const Role = require('./Role');

/**
 *
 * @param {string} type
 * @param {Creep} creep
 * @returns {ConstructionSite}
 */
function findConstructionSite(type, creep){
    let target = null;

    const sites = creep.room.find(FIND_CONSTRUCTION_SITES, {
        filter: (site) => {
            return site.structureType === type;
        }
    });

    if(sites.length){
        target = creep.pos.findClosestByPath(sites);
    }

    return target;
}

class Builder extends Role {
    /**
     * @override
     */
    body (availEnergy) {
        if(availEnergy < 250){
            return [WORK, CARRY, MOVE]; //200
        } else if(availEnergy < 350){
            return [WORK, CARRY,CARRY, MOVE]; //250
        } else if(availEnergy < 450){
            return [WORK, CARRY,CARRY, MOVE,MOVE]; //350
        } else if(availEnergy < 550){
            return [WORK,WORK, CARRY,CARRY, MOVE,MOVE,MOVE]; //450
        } else if(availEnergy < 600){
            return [WORK,WORK,WORK, CARRY,CARRY, MOVE,MOVE,MOVE]; //550
        } else if(availEnergy < 650){
            return [WORK,WORK,WORK, CARRY,CARRY,CARRY, MOVE,MOVE,MOVE]; //600
        } else if(availEnergy < 750){
            return [WORK,WORK,WORK, CARRY,CARRY,CARRY, MOVE,MOVE,MOVE,MOVE]; //650
        } else {
            return [WORK,WORK,WORK,WORK, CARRY,CARRY,CARRY, MOVE,MOVE,MOVE,MOVE]; //750
        }
    }

    /**
     * @override
     */
    run(creep) {
        util.tryBuildRoad(creep);

        if(creep.memory.building && creep.carry.energy === 0)
        {
            creep.memory.building = false;
            creep.memory.energyTarget = '';
            creep.say(util.HARVEST);
        }

        if(!creep.memory.building && creep.carry.energy === creep.carryCapacity) {
            creep.memory.building = true;
            creep.say(util.BUILD);
        }

        if(creep.memory.building) {
            let target = Game.getObjectById(creep.memory.buildTarget);
            if(!target){
                target = util.shiftStructure(Memory.repairQueue);
                if(!target){
                    target = findConstructionSite(STRUCTURE_EXTENSION, creep);
                }

                if(!target){
                    target = findConstructionSite(STRUCTURE_CONTAINER, creep);
                }

                if(!target){
                    target = findConstructionSite(STRUCTURE_LINK, creep);
                }

                if(!target){
                    target = findConstructionSite(STRUCTURE_TOWER, creep);
                }

                if(!target){
                    target = findConstructionSite(STRUCTURE_STORAGE, creep);
                }

                if(!target) {
                    target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
                }

                if(target){
                    creep.memory.buildTarget = target.id;
                } else {
                    creep.say(util.HARVEST);
                    creep.memory.buildTarget = '';
                    creep.memory.energyTarget = '';
                    creep.memory.building = false;
                }
            }
            if(target instanceof Structure) {
                if(target.hits < target.hitsMax){
                    if(creep.repair(target) === ERR_NOT_IN_RANGE){
                        util.moveTo(creep, target.pos);
                    }
                } else {
                    creep.memory.buildTarget = '';
                }
            } else if(target instanceof ConstructionSite){
                if(creep.build(target) === ERR_NOT_IN_RANGE){
                    util.moveTo(creep, target.pos);
                }
            } else {
                creep.memory.buildTarget = '';
            }
        } else {
            if(creep.carry.energy < creep.carryCapacity) {
                const target = util.getEnergyStorageTarget(creep);
                const src = creep.pos.findInRange([target], 1);
                if(src.length){
                    util.getEnergy(creep, src[0]);
                } else {
                    util.moveTo(creep, target.pos);
                }
            }
        }
    }
}

module.exports = new Builder();
