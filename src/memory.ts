import {BodySpec, CreepRole} from "./roles";

declare global {

    export interface Memory {
        autoBuildRoads: boolean;
        harvestedSources: _.Dictionary<string>;
        maxRampartHits: number;
        maxWallHits: number;
    }

    interface CreepMemory {
        building?: boolean;
        buildTarget?: string;
        claimTarget?: string;
        energyTarget?: string;
        hauling?: boolean;
        operateInRoom: string;
        role: CreepRole;
        target?: string;
        upgrading?: boolean;
    }

    interface FlagMemory {
        [name: string]: any;
    }

    interface SpawnMemory {
        [name: string]: any;
    }

    interface RoomMemory {
        controllerCont?: string;
        creepCount: _.Dictionary<number>;
        repairQueue: string[];
        spawnQueue: BodySpec[];
        towerActive: boolean;
    }
}
