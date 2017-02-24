const util = require('./utils');
const roles = require('./roles');

module.exports.loop = function () {
    PathFinder.use(true);

    if(_.isUndefined(Memory.repairQueue)){
        Memory.repairQueue = [];
    }
    if(_.isUndefined(Memory.spawnQueue)){
        Memory.spawnQueue = [];
    }
    if(_.isUndefined(Memory.harvestedSources)){
        Memory.harvestedSources = {};
    }

    util.clearMemory();

    util.updateInfrastructure();

    _.forEach(Game.structures, (structure) => {
        if(structure.structureType === STRUCTURE_CONTAINER && structure.hits < structure.hitsMax / 2) {
            console.log('Broken container');
            util.enqueueStructure(structure, Memory.repairQueue);
        }
    });

    const roads = _.map(Game.rooms, (room) => {
        room.find(STRUCTURE_ROAD, {
        filter: (road) =>{
            console.log('Testing road: ' + JSON.stringify(road, null, 4));
            return road.hits < road.hitsMax / 3;
        }})});
    console.log('Broken roads: ' + JSON.stringify(roads, null, 4));

    const brokenRoads = [].concat.apply([], roads);

    _.forEach(brokenRoads, (road) => {
        console.log('Broken road');
        util.enqueueStructure(road, Memory.repairQueue);
    });

    if(Object.getOwnPropertyNames(Game.creeps).length === 0)
    {
        console.log('Tick');
        Memory.spawnQueue = [];
        Memory.spawnQueue.unshift({
            body: [CARRY, MOVE],
            role: roles.CARRIER
        });
        Memory.spawnQueue.unshift({
            body: [CARRY, WORK, WORK, MOVE],
            role: roles.HARVESTER
        });
    }
    
    Memory.creepCount = roles.count();

    _.forOwn(Game.spawns, (spawn) => {roles.processSpawnQueue(spawn);});

    roles.spawn();

    _.forOwn(Game.spawns, (spawn) => {
        if(spawn.spawning) {
            const spawningCreep = Game.creeps[spawn.spawning.name];
            spawn.room.visual.text(
                util.CONSTRUCT_SYM + '️' + spawningCreep.memory.role,
                spawn.pos.x + 1,
                spawn.pos.y,
                {align: 'left', opacity: 0.8});
        }
    });

    _.forOwn(Game.structures, (tower) => {
        if(tower.structureType === STRUCTURE_TOWER) {
            const closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.hits < structure.hitsMax / 3;
                }
            });
            if (closestDamagedStructure) {
                tower.repair(closestDamagedStructure);
            }

            const closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if (closestHostile) {
                tower.attack(closestHostile);
            }
        }
    });

    _.forOwn(Game.creeps, (creep) => {
        roles.run(creep);
    });
};
