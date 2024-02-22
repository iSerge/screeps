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
        buildTarget?: Id<Structure | ConstructionSite>;
        claimTarget?: Id<StructureController>;
        energyTarget?: Id<Creep | Structure | Resource | Source>;
        hauling?: boolean;
        operateInRoom: string;
        role: CreepRole;
        target?: Id<Source>;
        upgrading?: boolean;
    }

    interface FlagMemory {
        [name: string]: any;
    }

    interface SpawnMemory {
        [name: string]: any;
    }

    interface RoomMemory {
        controllerCont?: Id<StructureContainer>;
        creepCount: _.Dictionary<number>;
        repairQueue: Array<Id<Structure>>;
        spawnQueue: BodySpec[];
        towerActive: boolean;
    }
}
