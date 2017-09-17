const _ = require('lodash');

const util = require('./utils');

const Role = require('./Role');

/**
 *
 * @class
 * @extends {Role}
 */
class Claimer extends Role {
    /**
     * @override
     */
    body(availEnergy) {
        return [MOVE,MOVE,CLAIM];
    }


    /**
     * @override
     */
    run(creep) {
        util.tryBuildRoad(creep);

        let flag = Game.flags['claim'];
        if(!flag){
            flag = Game.flags['reserve'];
        }

        const sameRoom = flag && creep.room.name === flag.pos.roomName;

        if(!flag){
            delete(creep.memory.claimTarget);
        }

        if(flag && !sameRoom){
            util.moveTo(creep, flag.pos);
        }

        if(flag && sameRoom){
            let structs = creep.room.lookForAt(LOOK_STRUCTURES, flag.pos);
            if(structs.length){
                _.forEach(structs, str => {
                    if(str.structureType === STRUCTURE_CONTROLLER){
                        creep.memory.claimTarget = str.id;
                    }
                });
            }
        }

        if (creep.memory.claimTarget) {
            // Move to target & claim
            const controller = Game.getObjectById(creep.memory.claimTarget);
            if(flag.name === 'claim') {
                if (creep.claimController(controller) !== OK) {
                    util.moveTo(creep, controller.pos);
                }
            } else {
                if (creep.reserveController(controller) !== OK) {
                    util.moveTo(creep, controller.pos);
                }
            }
        }
    }
}

module.exports = new Claimer();
