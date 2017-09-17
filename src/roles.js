const _ = require('lodash');

const limits = require('./limits');
const roleHarvester = require('./role.harvester');
const roleUpgrader = require('./role.upgrader');
const roleBuilder = require('./role.builder');
const roleCarrier = require('./role.carrier');
const roleClaimer = require('./role.claimer');

const roles = {
    'harvester': roleHarvester,
    'carrier':   roleCarrier,
    'upgrader':  roleUpgrader,
    'builder':   roleBuilder,
    'claimer':   roleClaimer
};

/**
 *
 * @returns {number}
 */
function countControllers() {
    let controllers = 0;
    _.forOwn(Game.rooms, (room) => {
        if (!_.isUndefined(room.controller) && room.controller.my){
            controllers += 1;
        }
    });
    return controllers;
}

/**
 *
 * @param {string} role
 * @returns {number}
 */
function limit(role){
    if(role === 'claimer'){
        return _.isUndefined(Game.flags['claim']) && _.isUndefined(Game.flags['reserve'])  ? 0 : limits[role];
    } else {
        return limits[role] * Memory.controllerCount;
    }
}

/**
 * @returns {StructureSpawn}
 */
function getMaxEnergySpawn () {
    let spawns = [];
    _.forOwn(Game.spawns, (spawn) => {spawns.push(spawn)});
    spawns.sort((a,b) => { return b.room.energyAvailable - a.room.energyAvailable;});
    return spawns[0];
}

const rolesModule = {
    /** @const {string} */
    HARVESTER: 'harvester',
    /** @const {string} */
    CARRIER: 'carrier',
    /** @const {string} */
    BUILDER: 'builder',
    /** @const {string} */
    UPGRADER: 'upgrader',
    /** @const {string} */
    CLAIMER: 'claimer',

    /** @const */
    roles: roles,

    /** @const */
    limit: limit,

    /**
     *  @type {function}
     *
     *  @param {string|object} [role] Role of the new creep
     *  @param {Array<string>} role.body Body of spawning creep
     *  @param {string} role.role Role of spawning creep
     */
    spawn: (role) => {
        if(_.isUndefined(role)){
            _.forOwn(roles, (role, name) => {
                if(Memory.creepCount[name] < limit(name)){
                    const energy = getMaxEnergySpawn().room.energyAvailable;

                    const body = role.body(energy);
                    Memory.spawnQueue.push({
                        body: body,
                        role: name
                    });
                }
            });
        } else if(typeof role === 'string') {
            const energy = getMaxEnergySpawn().room.energyAvailable;

            const body = roles[role].body(energy);
            Memory.spawnQueue.push({
                body: body,
                role: role
            });
        } else {
            Memory.spawnQueue.push(role);
        }
    },

    /**
     *  @type {function}
     *
     *  @param {StructureSpawn} spawn Spawn on which start spawning
     */
    processSpawnQueue: (spawn) => {
        if(!Memory.spawnQueue.length){
            return;
        }
        console.log('Processing spawn Q ' + spawn.name);

        let spec = Memory.spawnQueue.shift();
        if(spawn.canCreateCreep(spec.body) === OK){
            const newName = spawn.createCreep(spec.body, undefined, {role: spec.role});
            console.log('Spawning new ' + spec.role + ': ' + newName);
        } else if('claimer' === spec.role) {
            Memory.spawnQueue.push(spec);
        } else {
            Memory.spawnQueue.unshift(spec);
        }
    },

    /**
     * @param {Creep} creep
     * */
    run: (creep) => {
        roles[creep.memory.role].run(creep);
    },

    count: () => {
        let count = {};
        _.forOwn(roles, (role, name) => {count[name] = 0;});

        _.forEach(Game.creeps, (creep) => { count[creep.memory.role] += 1; });
        _.forEach(Memory.spawnQueue, (spec) => { count[spec.role] += 1; } );

        return count;
    }
};

module.exports = rolesModule;
