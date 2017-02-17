const utils = require('./utils');

const roleHarvester = {
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
    
    /** @param {Creep} creep **/
    run: function(creep) {
        const sites = creep.room.find(FIND_CONSTRUCTION_SITES);
        const toRepair = creep.room.find(FIND_STRUCTURES, { filter: function(object){
                            return object.structureType !== STRUCTURE_WALL && object.hits < (object.hitsMax / 2);
                        }
                    });
        const walls = creep.room.find(FIND_STRUCTURES, { filter: function(object){
                            return object.structureType === STRUCTURE_WALL && object.hits < 6000;
                        }
                    });


        if((creep.memory.building || creep.memory.upgrading) && creep.carry.energy === 0) 
        {
            creep.memory.building = false;
            creep.memory.upgrading = false;
            creep.say('🔄 harvest');
        }

        if(!creep.memory.building && creep.carry.energy === creep.carryCapacity && (sites.length || toRepair.length || walls.length)) {
            creep.memory.building = true;
            creep.say('🚧 build');
        }

        if(!creep.memory.upgrading && !creep.memory.building && creep.carry.energy === creep.carryCapacity) {
            creep.memory.upgrading = true;
            creep.say('⚡ upgrade');
        }

        if(creep.memory.upgrading){
            if(creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        } else if(creep.memory.building) {
            if(sites.length){
                const t = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES, {maxOps: 500});
                if(creep.build(t) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(t, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            } else if(toRepair.length){
                if(creep.repair(toRepair[0]) === ERR_NOT_IN_RANGE){
                    creep.moveTo(toRepair[0], {visualizePathStyle: {stroke: '#ffefef'}});
                }
            } else if(walls.length){
                if(creep.repair(walls[0]) === ERR_NOT_IN_RANGE){
                    creep.moveTo(walls[0], {visualizePathStyle: {stroke: '#ffefef'}});
                }
            } else {
                creep.memory.building = false;
                creep.memory.upgrading = false;
                creep.say('🔄 harvest');
            }
        } else {
            if(creep.carry.energy < creep.carryCapacity) {
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
            else {
                const targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION ||
                            structure.structureType == STRUCTURE_SPAWN ||
                            structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
                    }
                });
                if(targets.length > 0) {
                    if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                } else {
                    creep.memory.building = true;
                }
            }
        }
    }
};

module.exports = roleHarvester;
