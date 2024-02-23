import * as _ from "lodash";

import {limits} from "./limits";
import {Role} from "./Role";

import {roleBuilder} from "./role.builder";
import {roleCarrier} from "./role.carrier";
import {roleClaimer} from "./role.claimer";
import {roleHarvester} from "./role.harvester";
import {roleUpgrader} from "./role.upgrader";

export interface Roles extends _.Dictionary<Role> {
    builder: Role;
    carrier: Role;
    claimer: Role;
    harvester: Role;
    upgrader: Role;
}

export type CreepRole = keyof Roles;

export const BUILDER: CreepRole = "builder";
export const CARRIER: CreepRole = "carrier";
export const CLAIMER: CreepRole = "claimer";
export const HARVESTER: CreepRole = "harvester";
export const UPGRADER: CreepRole = "upgrader";

export const roles: Roles = {
    builder:   roleBuilder,
    carrier:   roleCarrier,
    claimer:   roleClaimer,
    harvester: roleHarvester,
    upgrader:  roleUpgrader
};

export interface BodySpec {
    body: BodyPartConstant[];
    role: CreepRole;
}

export class RolesModule {
    public countCreeps() {
        _.forOwn(roles, (_role, roleName) => {
            _.forOwn(Memory.rooms, (roomMem) => {
                if (undefined !== roleName) {
                    roomMem.creepCount[roleName] = 0;
                }
            });
        });

        _.forOwn(Game.creeps, (creep) => {
            if (!creep.memory.operateInRoom) {
                Memory.rooms[creep.room.name].creepCount[creep.memory.role] += 1;
            } else {
                Memory.rooms[creep.memory.operateInRoom].creepCount[creep.memory.role] += 1;
            }
        });

        _.forOwn(Memory.rooms, (roomMem) => {
            _.forEach(roomMem.spawnQueue, (spec) => {
                roomMem.creepCount[spec.role] += 1;
            });
        });
    }

    /**
     *  @type {function}
     *
     *  @param {StructureSpawn} spawn Spawn on which start spawning
     */
    public processSpawnQueue(spawn: StructureSpawn) {
        if (spawn.spawning) {
            return;
        }

        const room = spawn.room;
        const spec = room.memory.spawnQueue.shift();
        if (spec) {
            console.log(`Processing spawn Q ${spawn.name} ${JSON.stringify({room: room.name, role: spec.role})}`);

            if (spawn.spawnCreep(spec.body, 'test_spawn', {dryRun:true}) === OK) {
                const newName = spawn.createCreep(spec.body, undefined, {operateInRoom: room.name, role: spec.role});
                console.log(`Spawning new ${spec.role}: ${newName}`);
            } else if ("claimer" === spec.role) {
                room.memory.spawnQueue.push(spec);
            } else {
                room.memory.spawnQueue.unshift(spec);
            }
        }
    }

    /**
     * @param {Creep} creep
     */
    public run(creep: Creep) {
        roles[creep.memory.role].run(creep);
    }

    /**
     *  @type {function}
     *
     *  @param {Room} room
     *  @param {string|object} [role] Role of the new creep
     *  @param {Array<string>} role.body Body of spawning creep
     *  @param {string} role.role Role of spawning creep
     */
    public spawn(room: Room, role?: CreepRole | BodySpec) {
        if (!role) {
            _.forOwn(roles, (r, name) => {
                if (name && room.memory.creepCount[name] < this.limit(name)) {
                    const energy = room.energyAvailable;

                    const body = r.body(energy);
                    room.memory.spawnQueue.push({ body, role: name });
                }
            });
        } else if (typeof role === "string") {
            const energy = room.energyAvailable;

            const body = roles[role].body(energy);
            room.memory.spawnQueue.push({ body, role });
        } else {
            room.memory.spawnQueue.push(role as BodySpec);
        }
    }

    /**
     *
     * @param {string} role
     * @returns {number}
     */
    private limit(role: CreepRole): number {
        if (role === "claimer") {
            return _.isUndefined(Game.flags.claim) && _.isUndefined(Game.flags.reserve)  ? 0 : limits[role];
        }

        return limits[role];
    }
}

export const rolesModule = new RolesModule();
