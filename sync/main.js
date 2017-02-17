const roleHarvester = require('./role.harvester');
const roleUpgrader = require('./role.upgrader');
const roleBuilder = require('./role.builder');

module.exports.loop = function () {
        for (let name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

    let harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    console.log('Harvesters: ' + harvesters.length);

    if(harvesters.length < 2) {
        const spawn = Game.spawns['Spawn1'];
        const energy = spawn.room.energyAvailable;
        let newName = spawn.createCreep(roleHarvester.body(energy), undefined, {role: 'harvester'});
        console.log('Spawning new harvester: ' + newName);
    }

    let upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
    console.log('Upgraders: ' + upgraders.length);

    if(upgraders.length < 2) {
        const spawn = Game.spawns['Spawn1'];
        const energy = spawn.room.energyAvailable;
        let newName = spawn.createCreep(roleUpgrader.body(energy), undefined, {role: 'upgrader'});
        console.log('Spawning new upgrader: ' + newName);
    }

    let builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
    console.log('Builders: ' + builders.length);

    if(builders.length < 3) {
        const spawn = Game.spawns['Spawn1'];
        const energy = spawn.room.energyAvailable;
        let newName = spawn.createCreep(roleBuilder.body(energy), undefined, {role: 'builder'});
        console.log('Spawning new builder: ' + newName);
    }
    
    if(Game.spawns['Spawn1'].spawning) { 
        const spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
        Game.spawns['Spawn1'].room.visual.text(
            '🛠️' + spawningCreep.memory.role,
            Game.spawns['Spawn1'].pos.x + 1, 
            Game.spawns['Spawn1'].pos.y, 
            {align: 'left', opacity: 0.8});
    }


    const tower = Game.getObjectById('TOWER_ID');
    if(tower) {
        const closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax
        });
        if(closestDamagedStructure) {
            tower.repair(closestDamagedStructure);
        }

        const closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(closestHostile) {
            tower.attack(closestHostile);
        }
    }

    for(let name in Game.creeps) {
        const creep = Game.creeps[name];
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
        if(creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        }
    }
};
