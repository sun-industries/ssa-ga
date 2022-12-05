
export interface Time {
    year:number,
    mon:number,
    day:number,
    hr:number,
    mi:number,
    sec:number
}

export interface TickResult {
    satnum: string,
    longitude: number,
    latitude: number,
    height: number,
    errcode: number,
    overfly: boolean,
    sunlit: boolean,
    visible: boolean 
}

export interface TickResults {
    sats: Vector<TickResult>,
    sunLat: number,
    sunLon: number
}

export interface Vector<T> {
    size(): number;
    get(i: number): T;
    delete(): void;
}

export interface SatTableRow {
    id:string,
    transit:number,
    starting:object,
    ending:object,
    maxElevation:number
    apexAzimuth:number
    detailed:object
    sunlitRatio:number
}

export interface HistogramItem{
    time:Time,
    overflyCount:number,
    sunlitCount:number
    visibleCount:number
}

export interface SGP4Interface {
    init(tleTxt: string): number;
    tick(UTCFullYear:number, UTCMonth:number, UTCDate:number, UTCHours:number, UTCMinutes:number, UTCSeconds:number): TickResults;
    startRecording():boolean;
    endRecording():void;
    setObserver(observer:SGP4Observer):boolean;
    getSatTable(): Vector<SatTableRow>;
    getHistogram(): Vector<HistogramItem>;
}

export interface Observer {
    name: string,
    lat: number, // degrees
    lng: number, // degrees
    alt: number, // km
    elv: number // degrees (90 is zenith)
}

export interface SGP4Observer {
    longitude: number,
    latitude: number,
    height: number,
    minElevation: number,
    defined: true
}

export default {};