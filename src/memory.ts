import {BodySpec, CreepRole} from "./roles";

declare global {

    export interface Memory {
        spawnQueue: BodySpec[];
        maxRampartHits: number;
    }

    interface CreepMemory {
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

    interface FlagMemory {
    }

    interface SpawnMemory {
    }

    interface RoomMemory {
    }
}