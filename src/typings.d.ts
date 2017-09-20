declare namespace NodeJS {
    export interface Global {
        Profiler: Profiler;
    }
}

interface Profiler {
    toString(): void;
}
