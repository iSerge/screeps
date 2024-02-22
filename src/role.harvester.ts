import _ from "lodash";

import {Messages, utils} from "./utils";

import {Role} from "./Role";

class Harvester implements Role {
    /**
     * @override
     */
    public body(availEnergy: number) {
        if (availEnergy < 350) {
            return [WORK, WORK, CARRY, MOVE]; // 300
        }
        
        if (availEnergy < 400) {
            return [WORK, WORK, CARRY, MOVE, MOVE]; // 350
        }
        
        if (availEnergy < 500) {
            return [WORK, WORK, CARRY, MOVE, MOVE, MOVE]; // 400
        }
        
        if (availEnergy < 600) {
            return [WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE]; // 500
        } 
        
        if (availEnergy < 700) {
            return [WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE]; // 600
        }

        return [WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE]; // 700
    }

    /**
     * @override
     */
    public run(creep: Creep) {
        utils.tryBuildRoad(creep);

        let target: Source | null = Game.getObjectById(creep.memory.target);

        if (!target) {

            target = this.findSource(creep);

            if (target) {

                if (target.room.name !== creep.room.name) {
                    console.log(`Harvester found target in other room: ${target.room}`);
                }

                Memory.harvestedSources[target.id] = target.id;
                creep.memory.target = target.id;
                creep.say(Messages.HARVEST);
            }
        }

        if (0 < creep.carry.energy) {
            // console.log('Harvester ' + creep.name + ' unloading');// JSON.stringify(target, null, 4));
            const dst: Structure[] = creep.pos.findInRange(FIND_STRUCTURES, 1, {
                filter: (struct: StructureLink | StructureContainer) => {
                    return (struct.structureType === STRUCTURE_LINK && struct.energy < struct.energyCapacity) ||
                        (struct.structureType === STRUCTURE_CONTAINER && struct.store.energy < struct.storeCapacity);
                }
            });

            if (dst.length) {
                creep.transfer(dst[0], RESOURCE_ENERGY);
            } else {
                creep.drop(RESOURCE_ENERGY);
            }
        }
        // console.log('Harvester ' + creep.name + ' harvesting target: ' + target.id);
        // JSON.stringify(target, null, 4));
        if (target) {
            const err = creep.harvest(target);
            if (err === ERR_NOT_IN_RANGE) {
                utils.moveTo(creep, target.pos);
            }
        }

    }

    private findSource(creep: Creep): Source | null {
        const sources: Source[] = creep.room.find(FIND_SOURCES, {
            filter: (src: Source) => {
                return !Memory.harvestedSources.hasOwnProperty(src.id);
            }
        });

        return sources[0];
    }
}

export const roleHarvester: Role = new Harvester();
