import * as _ from "lodash";

import {Messages, utils} from "./utils";

import {Role} from "./Role";

class Harvester implements Role {
    /**
     * @override
     */
    public body(availEnergy: number) {
        if (availEnergy < 350) {
            return [WORK, WORK, CARRY, MOVE]; // 300
        } else if (availEnergy < 400) {
            return [WORK, WORK, CARRY, MOVE, MOVE]; // 350
        } else if (availEnergy < 500) {
            return [WORK, WORK, CARRY, MOVE, MOVE, MOVE]; // 400
        } else if (availEnergy < 600) {
            return [WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE]; // 500
        } else if (availEnergy < 700) {
            return [WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE]; // 600
        } else {
            return [WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE]; // 700
        }
    }

    /**
     * @override
     */
    public run(creep: Creep) {
        utils.tryBuildRoad(creep);

        let target: Source | null = Game.getObjectById(creep.memory.target);

        if (!target) {
            const sources: Source[] = [];

            _.forEach(Game.rooms, (k, v) => {
                _.forEach(k.find(FIND_SOURCES, {
                    filter: (src: Source) => {
                        return !Memory.harvestedSources.hasOwnProperty(src.id);
                    }
                }), (s: Source) => { sources.push(s); });
            });

            target = sources[0];

            if (target) {
                Memory.harvestedSources[target.id] = target.id;
                creep.memory.target = target.id;
                creep.say(Messages.HARVEST);
            }
        }

        if (0 < creep.carry.energy) {
            // console.log('Harvester ' + creep.name + ' unloading');// JSON.stringify(target, null, 4));
            const dst: Structure[] = creep.pos.findInRange(FIND_STRUCTURES, 1, {
                filter: (struct: Link | Container) => {
                    return (struct.structureType === STRUCTURE_LINK && struct.energy < struct.energyCapacity) ||
                        (struct.structureType === STRUCTURE_CONTAINER && _.sum(struct.store) < struct.storeCapacity);
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
        const err = creep.harvest(target);
        if (err === ERR_NOT_IN_RANGE) {
            utils.moveTo(creep, target.pos);
        }

    }
}

export const roleHarvester: Role = new Harvester();
