const roleHarvester = require('./role.harvester');
const roleUpgrader = require('./role.upgrader');
const roleBuilder = require('./role.builder');
const roleCarrier = require('./role.carrier');

const roles = {
    'harvester': roleHarvester,
    'carrier':   roleCarrier,
    'upgrader':  roleUpgrader,
    'builder':   roleBuilder
};

const limits = {
    'harvester': 2,
    'carrier':   3,
    'upgrader':  2,
    'builder':   2
};

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

    /** @const */
    roles: roles,

    /** @const */
    limits: limits,

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
                if(Memory.creepCount[name] < limits[name]){
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
