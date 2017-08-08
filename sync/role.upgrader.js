const util = require('./utils');

const Role = require('./Role');

class Upgrader extends Role {
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
    run (creep) {
        util.tryBuildRoad(creep);

        if(util.navigateToDesignatedRoom(creep)){
            util.moveTo(creep, new RoomPosition(25,25,creep.memory.operateInRoom));
        } else {
            if(creep.memory.upgrading && creep.carry.energy === 0) {
                creep.memory.upgrading = false;
                creep.say(util.HARVEST);
            }
            if(!creep.memory.upgrading && creep.carry.energy === creep.carryCapacity) {
                creep.memory.upgrading = true;
                creep.say(util.UPGRADE);
            }

            if(creep.memory.upgrading) {
                if(creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
                    util.moveTo(creep, creep.room.controller.pos);
                }
            }
            else {
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

module.exports = new Upgrader();