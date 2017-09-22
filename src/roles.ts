import * as _ from "lodash";

import { profile } from "../screeps-typescript-profiler";

declare interface CreepMemory {
    building?: boolean;
    buildTarget?: string;
    claimTarget?: string;
    energyTarget?: string;
    hauling?: boolean;
    operateInRoom?: string;
    role: CreepRole;
    target?: string;
    upgrading?: boolean;
}

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

@profile
export class RolesModule {
    /**
     *
     * @returns {number}
     */
    private static countControllers() {
        let controllers = 0;
        _.forOwn(Game.rooms, (room) => {
            if (room.controller && room.controller.my) {
                controllers += 1;
            }
        });
        return controllers;
    }

    /**
     *
     * @param {string} role
     * @returns {number}
     */
    private static limit(role: CreepRole): number {
        if (role === "claimer") {
            return _.isUndefined(Game.flags["claim"]) && _.isUndefined(Game.flags["reserve"])  ? 0 : limits[role];
        } else {
            return limits[role] * Memory.controllerCount;
        }
    }

    /**
     * @returns {StructureSpawn}
     */
    private static getMaxEnergySpawn(): Spawn | undefined {
        const spawns: Spawn[] = [];
        _.forOwn(Game.spawns, (spawn) => {spawns.push(spawn); });
        spawns.sort((a, b) => b.room.energyAvailable - a.room.energyAvailable);
        return spawns[0];
    }

    public count() {
        const count: {[name: string]: number} = {};
        _.forOwn(roles, (role, name: string) => {count[name] = 0; });

        _.forEach(Game.creeps, (creep) => { count[creep.memory.role] += 1; });
        _.forEach(Memory.spawnQueue, (spec) => { count[spec.role] += 1; });

        return count;
    }

    /**
     *  @type {function}
     *
     *  @param {StructureSpawn} spawn Spawn on which start spawning
     */
    public processSpawnQueue(spawn: Spawn) {
        const spec = Memory.spawnQueue.shift();
        if (spec) {
            console.log("Processing spawn Q " + spawn.name);

            if (spawn.canCreateCreep(spec.body) === OK) {
                const newName = spawn.createCreep(spec.body, undefined, {role: spec.role});
                console.log("Spawning new " + spec.role + ": " + newName);
            } else if ("claimer" === spec.role) {
                Memory.spawnQueue.push(spec);
            } else {
                Memory.spawnQueue.unshift(spec);
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
     *  @param {string|object} [role] Role of the new creep
     *  @param {Array<string>} role.body Body of spawning creep
     *  @param {string} role.role Role of spawning creep
     */
    public spawn(role?: CreepRole | BodySpec) {
        if (!role) {
            _.forOwn(roles, (r, name: CreepRole) => {
                if (name && Memory.creepCount[name] < RolesModule.limit(name)) {
                    const spawn = RolesModule.getMaxEnergySpawn();
                    if (!spawn) {
                        return;
                    }
                    const energy = spawn.room.energyAvailable;

                    const body = r.body(energy);
                    Memory.spawnQueue.push({ body, role: name });
                }
            });
        } else if (typeof role === "string") {
            const spawn = RolesModule.getMaxEnergySpawn();
            if (!spawn) {
                return;
            }
            const energy = spawn.room.energyAvailable;

            const body = roles[role].body(energy);
            Memory.spawnQueue.push({ body, role });
        } else {
            Memory.spawnQueue.push(role);
        }
    }
}

export const rolesModule = new RolesModule();
