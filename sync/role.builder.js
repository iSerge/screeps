const util = require('./utils');

const Role = require('./Role');

class Builder extends Role {
    /**
     * @override
     */
    body (availEnergy) {
        if(availEnergy < 250){
            return [WORK, CARRY, MOVE]; //200
        } else if(availEnergy < 350){
            return [WORK, CARRY, MOVE,MOVE]; //250
        } else if(availEnergy < 400){
            return [WORK,WORK, CARRY, MOVE,MOVE]; //350
        } else if(availEnergy < 500){
            return [WORK,WORK, CARRY, MOVE,MOVE,MOVE]; //400
        } else if(availEnergy < 600){
            return [WORK,WORK,WORK, CARRY, MOVE,MOVE,MOVE]; //500
        } else if(availEnergy < 700){
            return [WORK,WORK,WORK,WORK, CARRY, MOVE,MOVE,MOVE]; //600
        } else {
            return [WORK,WORK,WORK,WORK,WORK, CARRY, MOVE,MOVE,MOVE]; //700
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
                if(target === undefined){
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
            } else if(target instanceof Structure) {
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
