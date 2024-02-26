import { Messages, utils } from "./utils";

import { Role } from "./Role";

class Upgrader implements Role {
  /**
   * @override
   */
  public body(availEnergy: number) {
    if (availEnergy < 350) {
      return [WORK, CARRY, MOVE, MOVE]; // 250
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

    if (utils.navigateToDesignatedRoom(creep) && creep.memory.operateInRoom) {
      utils.moveTo(creep, new RoomPosition(25, 25, creep.memory.operateInRoom));
    } else {
      if (creep.memory.upgrading && creep.store[RESOURCE_ENERGY] === 0) {
        creep.memory.upgrading = false;
        creep.say(Messages.HARVEST);
      }
      if (!creep.memory.upgrading && creep.store[RESOURCE_ENERGY] === creep.store.getCapacity()) {
        creep.memory.upgrading = true;
        creep.memory.energyTarget = undefined;
        creep.say(Messages.UPGRADE);
      }

      if (creep.memory.upgrading && creep.room.controller) {
        if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
          utils.moveTo(creep, creep.room.controller.pos);
        }
      } else {
        const target = utils.getEnergyStorageTarget(creep);
        if (target) {
          const src = creep.pos.findInRange([target], 1);
          if (src.length) {
            utils.getEnergy(creep, src[0]);
          } else {
            utils.moveTo(creep, target.pos);
          }
        }
      }
    }
  }
}

export const roleUpgrader: Role = new Upgrader();
