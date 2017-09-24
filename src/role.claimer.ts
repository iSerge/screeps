import * as _ from "lodash";

import {utils} from "./utils";

import {Role} from "./Role";

import { profile } from "../screeps-typescript-profiler";

/**
 *
 * @class
 * @extends {Role}
 */
@profile
class Claimer implements Role {
    /**
     * @override
     */
    public body(availEnergy: number) {
        return [MOVE, MOVE, CLAIM];
    }

    /**
     * @override
     */
    public run(creep: Creep) {
        utils.tryBuildRoad(creep);

        let flag = Game.flags["claim"];
        if (!flag) {
            flag = Game.flags["reserve"];
        }

        const sameRoom = flag && creep.room.name === flag.pos.roomName;

        if (!flag) {
            delete(creep.memory.claimTarget);
        }

        if (flag && !sameRoom) {
            utils.moveTo(creep, flag.pos);
        }

        if (flag && sameRoom) {
            const structs = creep.room.lookForAt(LOOK_STRUCTURES, flag.pos);
            if (structs.length) {
                _.forEach(structs, (str: Structure) => {
                    if (str.structureType === STRUCTURE_CONTROLLER) {
                        creep.memory.claimTarget = str.id;
                    }
                });
            }
        }

        if (creep.memory.claimTarget) {
            // Move to target & claim
            const controller: Controller | null = Game.getObjectById(creep.memory.claimTarget);
            if (controller) {
                if (flag.name === "claim") {
                    if (creep.claimController(controller) !== OK) {
                        utils.moveTo(creep, controller.pos);
                    }
                } else {
                    if (creep.reserveController(controller) !== OK) {
                        utils.moveTo(creep, controller.pos);
                    }
                }
            }
        }
    }
}

export const roleClaimer: Role = new Claimer();
