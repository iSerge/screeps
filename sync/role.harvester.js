const util = require('./utils');

const Role = require('./Role');

class Harvester extends Role {
    /**
     * @override
     */
    body (availEnergy) {
        if(availEnergy < 350){
            return [WORK,WORK, CARRY, MOVE]; //300
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

        let target = Game.getObjectById(creep.memory.target);

        if (!target) {
            const sources = creep.room.find(FIND_SOURCES, {
                filter: (src) => {
                    return !Memory.harvestedSources.hasOwnProperty(src.id);
                }
            });

            target = sources[0];

            if(target) {
                Memory.harvestedSources[target.id] = target.id;
                creep.memory.target = target.id;
                creep.say(util.HARVEST);
            }
        }

        if (0 < creep.carry.energy) {
            //console.log('Harvester ' + creep.name + ' unloading');// JSON.stringify(target, null, 4));
            const dst = creep.pos.findInRange(FIND_STRUCTURES, 1, {
                filter: (struct) => {
                    return (struct.structureType === STRUCTURE_LINK && struct.energy < struct.energyCapacity) ||
                        (struct.structureType === STRUCTURE_CONTAINER && _.sum(struct.store) < struct.storeCapacity);
                }
            });

            if(dst.length){
                creep.transfer(dst[0], RESOURCE_ENERGY);
            } else {
                creep.drop(RESOURCE_ENERGY);
            }
        }
        //console.log('Harvester ' + creep.name + ' harvesting target: ' + target.id);// JSON.stringify(target, null, 4));
        const err = creep.harvest(target);
        if (err === ERR_NOT_IN_RANGE) {
            util.moveTo(creep, target.pos);
        }

    }
}

module.exports = new Harvester();
