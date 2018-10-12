import * as _ from "lodash";

import {utils} from "./utils";

import {Role} from "./Role";

/**
 *
 * @class
 * @extends {Role}
 */
class Claimer implements Role {
    /**
     * @override
     */
    public body(availEnergy: number) {
        if (availEnergy < 1400) {
            return [MOVE, MOVE, CLAIM];
        } else if (availEnergy < 2100) {
            return [MOVE, MOVE, MOVE, MOVE, CLAIM, CLAIM];
        } else if (availEnergy < 2800) {
            return [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CLAIM, CLAIM, CLAIM];
        } else {
            return [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CLAIM, CLAIM, CLAIM, CLAIM];
        }
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
            const controller: StructureController | null = Game.getObjectById(creep.memory.claimTarget);
            if (controller) {
                if (flag.name === "claim") {
                    if (creep.room.controller && !creep.room.controller.my) {
                        if (creep.attackController(creep.room.controller) === ERR_NOT_IN_RANGE) {
                            creep.moveTo(creep.room.controller);
                        }
                    } else {
                        if (creep.claimController(controller) !== OK) {
                            utils.moveTo(creep, controller.pos);
                        }
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
