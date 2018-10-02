import * as _ from "lodash";

import {CARRIER, HARVESTER, rolesModule as roles} from "./roles";
import {Messages, utils} from "./utils";

class LoopFunctions {
    public findDamagedStructures() {
        _.forOwn(Game.rooms, (room) => {
            room.find(FIND_STRUCTURES, {
                filter: (struct: Structure) => {
                    if ((struct.structureType === STRUCTURE_WALL && struct.hits < Memory.maxWallHits) ||
                        (struct.structureType === STRUCTURE_RAMPART && struct.hits < Memory.maxRampartHits / 2) ||
                        (struct.structureType === STRUCTURE_CONTAINER && struct.hits < struct.hitsMax - 50000) ||
                        (struct.structureType !== STRUCTURE_RAMPART && struct.structureType !== STRUCTURE_WALL &&
                            struct.hits < struct.hitsMax / 2)) { utils.enqueueStructure(room, struct); }
                    return false;
                }}); });
    }

    public towerLogic() {
        _.forOwn(Game.structures, (struct: Structure) => {
            if (struct.structureType === STRUCTURE_TOWER) {
                const tower = struct as StructureTower;
                const closestHostile: Creep | null = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
                    filter: (creep: Creep) => {
                        return creep.pos.inRangeTo(tower.pos, tower.room.memory.towerActive ? 15 : 7);
                    }
                });
                if (closestHostile) {
                    tower.room.memory.towerActive = true;
                    tower.attack(closestHostile);
                } else {
                    tower.room.memory.towerActive = false;
                }

                const closestDamagedCreep: Creep | null = tower.pos.findClosestByRange(FIND_MY_CREEPS, {
                    filter: (creep: Creep) => {
                        return creep.hits < creep.hitsMax / 3;
                    }
                });
                if (closestDamagedCreep) {
                    tower.heal(closestDamagedCreep);
                }

                if (700 < tower.energy) {
                    const closestDamagedStructure: Structure | null = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                        filter: (structure: Structure) => {
                            return (structure.structureType === STRUCTURE_RAMPART &&
                                    structure.hits < Memory.maxRampartHits)
                                || (structure.structureType !== STRUCTURE_WALL &&
                                    structure.structureType !== STRUCTURE_RAMPART &&
                                    structure.hits < structure.hitsMax / 3);
                        }
                    });
                    if (closestDamagedStructure) {
                        tower.repair(closestDamagedStructure);
                    }
                }

                // if nothing to do heal damaged creeps
                const damagedCreep: Creep | null = tower.pos.findClosestByRange(FIND_MY_CREEPS, {
                    filter: (creep: Creep) => {
                        return creep.hits < creep.hitsMax;
                    }
                });
                if (damagedCreep) {
                    tower.heal(damagedCreep);
                }
            }
        });
    }

    public creepActions() {
        _.forOwn(Game.creeps, (creep) => {
            roles.run(creep);
        });
    }
}

const main = new LoopFunctions();

module.exports.loop = () => {
    utils.updateInfrastructure();

    utils.clearMemory();

    main.findDamagedStructures();

    roles.countCreeps();

    _.forOwn(Game.rooms, (room) => {
        if (room.controller) {

            if (Object.getOwnPropertyNames(Game.creeps).length === 0) {
                room.memory.spawnQueue = [];
                room.memory.spawnQueue.unshift({
                    body: [CARRY, MOVE],
                    role: CARRIER
                });
                room.memory.spawnQueue.unshift({
                    body: [CARRY, WORK, WORK, MOVE],
                    role: HARVESTER
                });
            }

            roles.spawn(room);
        }
    });

    _.forOwn(Game.spawns, (spawn) => {
        roles.processSpawnQueue(spawn);

        if (spawn.spawning) {
            const spawningCreep = Game.creeps[spawn.spawning.name];
            spawn.room.visual.text(
                Messages.CONSTRUCT_SYM + " " + spawningCreep.memory.role,
                spawn.pos.x + 1,
                spawn.pos.y,
                {align: "left", opacity: 0.8});
        }
    });

    main.towerLogic();

    main.creepActions();
};
