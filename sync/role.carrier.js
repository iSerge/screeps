const _ = require('lodash');

const util = require('./utils');

const Role = require('./Role');

/**
 *
 * @class
 * @extends {Role}
 */
class Carrier extends Role {
    /**
     * @override
     */
    body(availEnergy) {
        let parts;
        if (availEnergy < 150) {
            parts = 3;
        } else if (750 < availEnergy) {
            parts = 15;
        } else {
            parts = Math.floor(availEnergy / 50);
        }

        let body = new Array(parts);
        const moveParts = Math.ceil(parts / 3);

        for (let i = 0; i < parts; ++i) {
            body[i] = i < moveParts ? MOVE : CARRY;
        }
        return body;
    }

    /**
     *
     * @param {Creep} creep
     * @return {RoomObject}
     */
    getEnergyTarget(creep) {
        let target = Game.getObjectById(creep.memory.energyTarget);

        if(target instanceof Source && creep.pos.inRangeTo(target.pos, 2)){
            target = null;
        }

        if(!target){
            let targets = creep.pos.findInRange(FIND_DROPPED_ENERGY, 1, {
                filter: (drop) => {
                    return 0 < drop.amount;
                }
            });

            targets = targets.concat(creep.pos.findInRange(FIND_STRUCTURES, 1, {
                filter: (s) => {
                    return s.structureType === STRUCTURE_CONTAINER && 0 < s.store[RESOURCE_ENERGY] &&
                        s.id !== Memory.controllerCont;
                }
            }));

            target = targets[0];

            if(!target) {
                //dropped energy
                const drops = creep.room.find(FIND_DROPPED_ENERGY, {
                    filter: (drop) => {
                        return 0 < drop.amount;
                    }
                });

                target = _.sortBy(drops, (drop) => {
                    return -drop.amount;
                })[0];

                if(!target) {
                    // containers near sources
                    const sources = creep.room.find(FIND_SOURCES);
                    let sourceConts = [].concat.apply([], _.map(sources, (source) => {
                        return source.pos.findInRange(FIND_STRUCTURES, 2, {
                            filter: (struct) => {
                                return (struct.structureType === STRUCTURE_CONTAINER &&
                                    0 < struct.store[RESOURCE_ENERGY]);
                            }
                        });
                    }));

                    // most full container
                    target = _.sortBy(sourceConts, (cont) => {
                        return cont.storeCapacity - _.sum(cont.store);
                    })[0];

                    if (!target) {
                        target = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE, {
                            maxOps: 100,
                        });
                        if (!target) {
                            const targets = creep.room.find(FIND_SOURCES);
                            target = targets[0];
                        }
                    }
                }
            }

            creep.memory.energyTarget = target.id;
        }

        return target;
    }

    /**
     *
     * @param {Creep} creep
     * @return {RoomObject}
     */
    getStoreTarget(creep) {
        let target = Game.getObjectById(creep.memory.energyTarget);

        if(!target) {
            console.log('Carrier ' + creep.name + ' looking for spawns and extensions');
            if(creep.room.energyAvailable < creep.room.energyCapacityAvailable) {
                target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (struct) => {
                        return (struct.structureType == STRUCTURE_SPAWN || struct.structureType === STRUCTURE_EXTENSION) &&
                            struct.energy < struct.energyCapacity;
                    },
                    maxOps: 100
                });
            }
            //console.log('Harvester ' + creep.name + ' harvesting target: ' + target.id);

            if(!target) {
                // links near sources
                console.log('Carrier ' + creep.name + ' looking for source links');
                const sources = creep.room.find(FIND_SOURCES);
                let sourceLinks = [].concat.apply([], _.map(sources, (source) => {
                    return source.pos.findInRange(FIND_MY_STRUCTURES, 2, {
                        filter: (struct) => {
                            return (struct.structureType === STRUCTURE_LINK &&
                                0 <  struct.energyCapacity - struct.energy);
                        }
                    });
                }));

                // emptiest link
                target = _.sortBy(sourceLinks, (link) => {
                    return link.energyCapacity + link.energy;
                })[0];

                if (!target) {
                    // containers near controllers
                    console.log('Carrier ' + creep.name + ' looking for controller container');

                    const cont = Game.getObjectById(Memory.controllerCont);
                    if(cont && 500 < cont.storeCapacity - _.sum(cont.store)){
                        target = cont;
                    }


                    if(!target) {
                        console.log('Carrier ' + creep.name + ' looking for towers');
                        const towers = _.filter(Game.structures, (struct) => {
                            return struct.structureType === STRUCTURE_TOWER &&
                                0 <= struct.energyCapacity - struct.energy - 300;
                        });

                        // emptiest tower
                        target = _.sortBy(towers, (tower) => {
                            return tower.energyCapacity + tower.energy;
                        })[0];

                        if (!target) {
                            // looking for storage
                            console.log('Carrier ' + creep.name + ' looking for storage');
                            let storages = creep.room.find(FIND_STRUCTURES, {
                                filter: (struct) => {
                                    return struct.structureType === STRUCTURE_STORAGE &&
                                        0 < struct.storeCapacity - _.sum(struct.store);
                                }
                            });
                            target = storages[0];
                            if (!target) {
                                console.log('Carrier ' + creep.name + ' looking for sources');

                                const targets = creep.room.find(FIND_SOURCES);
                                target = targets[0];
                            }
                        }
                    }
                }
            }

            creep.memory.energyTarget = target.id;
        }

        return target;
    }

    /**
     * @override
     */
    run(creep) {
        util.tryBuildRoad(creep);

        if (creep.memory.hauling && creep.carry.energy === 0) {
            creep.memory.hauling = false;
            creep.memory.energyTarget = '';
            creep.say(util.PICKUP);
        }

        if(!creep.memory.hauling && creep.carry.energy === creep.carryCapacity) {
            creep.memory.hauling = true;
            creep.memory.energyTarget = '';
            creep.say(util.DISTRIBUTE);
        }

        if (creep.memory.hauling) {
            const target = this.getStoreTarget(creep);
            if(target && creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE){
                util.moveTo(creep, target.pos);
            } else {
                creep.memory.energyTarget = '';
            }
        } else {
            const target = this.getEnergyTarget(creep);
            if(target) {
                const src = creep.pos.findInRange([target], 1);
                if (src.length) {
                    util.getEnergy(creep, src[0]);
                } else {
                    util.moveTo(creep, target.pos);
                }
            }
        }
    }
}

module.exports = new Carrier();
