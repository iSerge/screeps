const roleHarvester = require('./role.harvester');
const roleUpgrader = require('./role.upgrader');
const roleBuilder = require('./role.builder');

module.exports.loop = function () {
    PathFinder.use(true);

    for (let name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

    const spawn = Game.spawns['Spawn1'];

    let harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    console.log('Harvesters: ' + harvesters.length);

    if(!spawn.spawning && harvesters.length < 2) {
        const energy = spawn.room.energyAvailable;
        let newName = spawn.createCreep(roleHarvester.body(energy), undefined, {role: 'harvester'});
        console.log('Spawning new harvester: ' + newName);
    }

    let upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
    console.log('Upgraders: ' + upgraders.length);

    if(!spawn.spawning && upgraders.length < 2) {
        const energy = spawn.room.energyAvailable;
        let newName = spawn.createCreep(roleUpgrader.body(energy), undefined, {role: 'upgrader'});
        console.log('Spawning new upgrader: ' + newName);
    }

    let builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
    console.log('Builders: ' + builders.length);

    if(!spawn.spawning && builders.length < 3) {
        const energy = spawn.room.energyAvailable;
        let newName = spawn.createCreep(roleBuilder.body(energy), undefined, {role: 'builder'});
        console.log('Spawning new builder: ' + newName);
    }

    if(spawn.spawning) {
        const spawningCreep = Game.creeps[spawn.spawning.name];
        spawn.room.visual.text(
            '🛠️' + spawningCreep.memory.role,
            spawn.pos.x + 1,
            spawn.pos.y,
            {align: 'left', opacity: 0.8});
    }


    const towers = spawn.room.find(FIND_STRUCTURES, {filter: (struct) => {
        return struct.structureType === STRUCTURE_TOWER;
    }});
    for(let name in towers){
        const tower = towers[name];
        const closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => {return structure.hits < structure.hitsMax / 2;}
        });
        if (closestDamagedStructure) {
            tower.repair(closestDamagedStructure);
        }

        const closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (closestHostile) {
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
