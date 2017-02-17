const utils = require('./utils');

const roleUpgrader = {
    body: function(availEnergy){
        if(availEnergy < 250){
            return [WORK, CARRY, MOVE];
        } else if(availEnergy < 350){
            return [WORK, CARRY, MOVE, MOVE];
        } else if(availEnergy < 450){
            return [WORK,WORK, CARRY, MOVE, MOVE];
        } else {
            return [WORK,WORK,WORK, CARRY, MOVE, MOVE];
        }
    },

    /** @param creep Creep **/
    run: function(creep) {

        if(creep.memory.upgrading && creep.carry.energy === 0) {
            creep.memory.upgrading = false;
            creep.say('🔄 harvest');
        }
        if(!creep.memory.upgrading && creep.carry.energy === creep.carryCapacity) {
            creep.memory.upgrading = true;
            creep.say('⚡ upgrade');
        }

        if(creep.memory.upgrading) {
            if(creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
        else {
            const p = utils.findPathTo(creep, FIND_SOURCES);
            if(p.path.length){
                let pos = p.path[0];
                creep.move(creep.pos.getDirectionTo(pos));
            } else {
                const src = creep.pos.findInRange(FIND_SOURCES, 1);
                if(src.length){
                    creep.harvest(src[0]);
                }
            }
        }
    }
};

module.exports = roleUpgrader;