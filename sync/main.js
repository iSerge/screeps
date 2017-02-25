const util = require('./utils');
const roles = require('./roles');

module.exports.loop = function () {
    PathFinder.use(true);

    util.clearMemory();

    util.updateInfrastructure();

    _.forOwn(Game.rooms, (room) => {
        room.find(FIND_STRUCTURES, {
        filter: (struct) =>{
            if (struct.structureType !== STRUCTURE_RAMPART &&
                ((struct.structureType === STRUCTURE_CONTAINER && struct.hits < struct.hitsMax - 50000) ||
                (struct.structureType === STRUCTURE_WALL && struct.hits < Memory.maxWallHits) ||
                (struct.structureType === STRUCTURE_RAMPART && struct.hits < Memory.maxRampartHits / 2) ||
                struct.hits < struct.hitsMax / 2))
            {
                util.enqueueStructure(struct);
            }
            return false;
        }})});

    if(Object.getOwnPropertyNames(Game.creeps).length === 0)
    {
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
                util.CONSTRUCT_SYM + ' ' + spawningCreep.memory.role,
                spawn.pos.x + 1,
                spawn.pos.y,
                {align: 'left', opacity: 0.8});
        }
    });

    _.forOwn(Game.structures, (tower) => {
        if(tower.structureType === STRUCTURE_TOWER) {
            const closestDamagedCreep = tower.pos.findClosestByRange(FIND_MY_CREEPS, {
                filter: (creep) => {
                    return creep.hits < creep.hitsMax / 3;
                }
            });
            if (closestDamagedCreep) {
                tower.heal(closestDamagedCreep);
            }

            const closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType !== STRUCTURE_WALL && structure.hits < structure.hitsMax / 3;
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
