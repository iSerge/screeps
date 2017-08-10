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
     * @return {Resource|Source|Structure}
     */
    getEnergyTarget(creep) {
        let target = Game.getObjectById(creep.memory.energyTarget);

        if(target instanceof Source && creep.pos.inRangeTo(target.pos, 2)){
            target = null;
        }

        if(!target) {
            //dropped energy
            const drops = creep.room.find(FIND_DROPPED_RESOURCES, {
                filter: (drop) => {
                    return drop.resourceType === RESOURCE_ENERGY && 0 < drop.amount;
                }
            });

            target = _.sortBy(drops, (drop) => {
                return -drop.amount;
            })[0];
        }

        if(!target) {
            // containers near sources
            const sources = creep.room.find(FIND_SOURCES);
            let sourceConts = [].concat.apply([], _.map(sources, (source) => {
                return source.pos.findInRange(FIND_STRUCTURES, 3, {
                    filter: (struct) => {
                        if(struct.structureType !== STRUCTURE_CONTAINER){
                            return false;
                        }

                        const controllerCont = Memory.controllerCont[struct.pos.roomName] === struct.id;
                        if(controllerCont){
                            console.log(creep.name + ' -- Considering controller cont -- capacity: ' + struct.storeCapacity + ', stored: '+_.sum(struct.store));
                        } else {
                            console.log(creep.name + ' -- Considering cont -- capacity: ' + struct.storeCapacity + ', stored: '+_.sum(struct.store));
                        }
                        return (!controllerCont && 0 < struct.store[RESOURCE_ENERGY]) ||
                             (controllerCont && (struct.storeCapacity - _.sum(struct.store) < 50));
                    }
                });
            }));

            // most full container
            target = _.sortBy(sourceConts, (cont) => {
                return cont.storeCapacity - _.sum(cont.store);
            })[0];
        }

        if(!target){
            target = creep.room.find(FIND_STRUCTURES, {
                filter: store => {
                    return store.structureType === STRUCTURE_STORAGE && 0 < store.energy;
                }
            })[0];
        }

        if (!target) {
            target = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE, {
                maxOps: 100,
            });
            if (!target) {
                const targets = creep.room.find(FIND_SOURCES);
                target = targets[0];
            }
        }

        creep.memory.energyTarget = target.id;

        return target;
    }

    /**
     *
     * @param {Creep} creep
     * @return {Spawn|Structure}
     */
    getStoreTarget(creep) {
        let target = Game.getObjectById(creep.memory.energyTarget);

        if(!target) {
            //console.log('Carrier ' + creep.name + ' looking for spawns and extensions');
            if (creep.room.energyAvailable < creep.room.energyCapacityAvailable) {
                target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (struct) => {
                        return (struct.structureType === STRUCTURE_SPAWN || struct.structureType === STRUCTURE_EXTENSION) &&
                            struct.energy < struct.energyCapacity && creep.memory.operateInRoom === struct.pos.roomName;
                    }
                });
            }
        }
            //console.log('Harvester ' + creep.name + ' harvesting target: ' + target.id);

        if (!target) {
            // containers near controllers
            //console.log('Carrier ' + creep.name + ' looking for controller container');

            const cont = Game.getObjectById(Memory.controllerCont[creep.pos.roomName]);
            if (cont && 500 < cont.storeCapacity - _.sum(cont.store)) {
                target = cont;
            }
        }

        if(!target) {
            //console.log('Carrier ' + creep.name + ' looking for towers');
            const towers = _.filter(Game.structures, (struct) => {
                return struct.structureType === STRUCTURE_TOWER &&
                    0 <= struct.energyCapacity - struct.energy - 300;
            });

            // emptiest tower
            target = _.sortBy(towers, (tower) => {
                return tower.energyCapacity + tower.energy;
            })[0];
        }

        if (!target) {
            // looking for storage
            //console.log('Carrier ' + creep.name + ' looking for storage');
            let storages = creep.room.find(FIND_STRUCTURES, {
                filter: (struct) => {
                    return struct.structureType === STRUCTURE_STORAGE &&
                        0 < struct.storeCapacity - _.sum(struct.store);
                }
            });
            target = storages[0];
        }
        if (!target) {
            //console.log('Carrier ' + creep.name + ' looking for sources');

            const targets = creep.room.find(FIND_STRUCTURES, {
                filter: (spawn) => {
                    return (spawn.structureType === STRUCTURE_SPAWN || spawn.structureType === STRUCTURE_EXTENSION) &&
                        spawn.energy < spawn.energyCapacity && creep.memory.operateInRoom === spawn.pos.roomName;
                }
            });
            target = targets[0];
        }

        if(target) {
            creep.memory.energyTarget = target.id;
        }

        return target;
    }

    /**
     * @override
     */
    run(creep) {
        util.tryBuildRoad(creep);

        if(!creep.memory.hauling && !creep.memory.energyTarget && util.navigateToDesignatedRoom(creep)) {
            util.moveTo(creep, new RoomPosition(25, 25, creep.memory.operateInRoom));
            return;
        }

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
            if(target && util.getEnergy(creep, target) === ERR_NOT_IN_RANGE){
                util.moveTo(creep, target.pos);
            } else {
                creep.memory.energyTarget = '';
            }
        }
    }
}

module.exports = new Carrier();
