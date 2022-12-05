import loadWASM from './c++/cpp.mjs';
import { SGP4States, SatTicketStatus } from './options';
import type { Observer, SGP4Interface, SGP4Observer } from './orbitalTypes';

const DEBUG = false;

let SGP4 : SGP4Interface;
let SGP4State: SGP4States = SGP4States.OFF;
let nSats: number = 0;
let observer: Observer;

function SGP4SetState(newState: SGP4States) {
    const oldState = SGP4State;
    SGP4State = newState;
    DEBUG && console.log('Change SGP4State', oldState, newState);
    postMessage({
        type: 'SGP4StateChange',
        oldState,
        newState
    });
}


self.onmessage = (event) => {
    const type = event.data.type;
    
    if(type === 'init') {
        initFromInput(event.data.tleTxt).then((nSats) => {
            tick(new Date());
        }).catch((err) => {
            console.error(err);
        })
    } else if (type === 'tick') {
        tick(event.data.time);
    } else if (event.data.type === 'setTimeMode') {
        /*if(timeMode === 'STOP' && event.data.timeMode !== 'STOP') {
            timeMode = event.data.timeMode
            requestDataFrame();
        } else {
            timeMode = event.data.timeMode
        }*/
    } else if (type === 'startAnalysis') {
        const {observer, interval, deltaTime} = event.data;
        makeAnalysis(observer, interval, deltaTime)
    } else if(type === 'setObserver') {
        const {observer,} = event.data;
        setObserver(observer);
    }
}


loadWASM().then((_SGP4: SGP4Interface) => {
    SGP4 = _SGP4;
    SGP4SetState(SGP4States.LOADED);
});

function initFromInput(text:string) : Promise<number> {
    if (!SGP4) {
        SGP4SetState(SGP4States.ERROR_NOT_LOADED);
        return Promise.reject(-1);
    }
        
    let tleTxt = '';
    text.replace(/\r/g, "")
        .split(/\n(?=[^12])/)
        .filter((d) => d)
        .map((tle) => tle.split("\n"))
        .filter(([name, ..._]) => { //return true
            return /^(STARLINK|ONEWEB)/.test(name.trim().replace(/^0 /, ""))
        })
        .forEach(([_, ...tle]) => {
            tleTxt += `\n${tle[0]}\n${tle[1]}`;
        });
        nSats = SGP4.init(tleTxt.trim());
        SGP4SetState(SGP4States.INITIATED);
        return Promise.resolve(nSats);
}

function makeAnalysis(observer: Observer, interval: [Date, Date], deltaTime:number = 10000 /*10s*/) {
    if (!SGP4) {
        return SGP4SetState(SGP4States.ERROR_NOT_LOADED);
    }
    if(SGP4State == SGP4States.ANALYZING) {
        return SGP4SetState(SGP4States.ERROR_CANNOT_BECAUSE_IN_ANALYZING);
    }
    SGP4SetState(SGP4States.ANALYZING)
    const theSGP4Observer: SGP4Observer = {
        longitude: observer.lng,
        latitude: observer.lat,
        height: observer.alt,
        minElevation: observer.elv,
        defined: true
    }
    SGP4.setObserver(theSGP4Observer);
    SGP4.startRecording();
    const [fromTime, toTime] = interval;
    let time = fromTime;
    do {
        tick(time);
        time = new Date(+time + deltaTime);
    } while(time <= toTime);
    SGP4.endRecording();
    const satTable = SGP4.getSatTable();
    const satTableSize = satTable.size();
    const satTableJs = [];
    for(let i = 0; i < satTableSize; i++) {
        const satTableRow = Object.assign({}, satTable.get(i));
        const satTableDetailedJs = {};
        [
            'azimuth', 'eclipseDepth', 'elevation', 'rangeSat', 'sunlit', 'time'
        ].forEach((key) => {
            const detailedBykey = satTableRow.detailed[key];
            satTableDetailedJs[key] = new Array(detailedBykey.size())
                .fill(0)
                .map((_, id) => detailedBykey.get(id));
        })
        satTableRow.detailed = satTableDetailedJs;
        satTableJs.push(satTableRow);
    }
    const histogramVec = SGP4.getHistogram();
    const histogramSize = histogramVec.size();
    const histogram = [];
    for(let i = 0; i < histogramSize; i++) {
        histogram.push(histogramVec.get(i));
    }
    postMessage({
        type: 'analyzingFinished',
        satTable: satTableJs,
        histogram: histogram,
        size: satTableSize
    });
    //satTable.delete(); // not delete because is created once as "static"
}

function setObserver(observer:Observer) {
    if (!SGP4) {
        return SGP4SetState(SGP4States.ERROR_NOT_LOADED);
    }
    if(SGP4State == SGP4States.ANALYZING) {
        return SGP4SetState(SGP4States.ERROR_CANNOT_BECAUSE_IN_ANALYZING);
    }
    const theSGP4Observer: SGP4Observer = {
        longitude: observer.lng,
        latitude: observer.lat,
        height: observer.alt,
        minElevation: observer.elv,
        defined: true
    }
    SGP4.setObserver(theSGP4Observer);
}

function tick(time: Date) {
    if (!SGP4) {
        return SGP4SetState(SGP4States.ERROR_NOT_LOADED);
    }
    const _startAt = Date.now();

    const dataArraySize = nSats * 4 /* entries by sat */  + 6 /* UTC* entries */ + 2 /* sun lat,lon */;
    const dataArray = new Float32Array(dataArraySize);
    let cursor = 0;

    const UTCFullYear = time.getUTCFullYear();
    const UTCMonth = time.getUTCMonth();
    const UTCDate = time.getUTCDate();
    const UTCHours = time.getUTCHours();
    const UTCMinutes = time.getUTCMinutes();
    const UTCSeconds = time.getUTCSeconds() + (time.getUTCMilliseconds() / 1000);
    dataArray[cursor++] = UTCFullYear;
    dataArray[cursor++] = UTCMonth;
    dataArray[cursor++] = UTCDate;
    dataArray[cursor++] = UTCHours;
    dataArray[cursor++] = UTCMinutes;
    dataArray[cursor++] = UTCSeconds;

    let tickResVector = SGP4.tick(UTCFullYear, UTCMonth + 1, UTCDate, UTCHours, UTCMinutes, UTCSeconds);

    dataArray[cursor++] = tickResVector.sunLat;
    dataArray[cursor++] = tickResVector.sunLon;

    const tickResVectorSize = tickResVector.sats.size();
    for(let i = 0; i < tickResVectorSize; i++) {
        const { satnum, latitude, longitude, height, errcode, overfly, sunlit, visible } = tickResVector.sats.get(i);
        if(errcode === 0) {
            let satStatus:SatTicketStatus = SatTicketStatus.NONE;
            if(visible) {
                satStatus = SatTicketStatus.VISIBLE;
            } else if(sunlit) {
                satStatus = SatTicketStatus.SUNLIT;
            } else if(overfly) {
                satStatus = SatTicketStatus.OVERFLY;
            }
            dataArray[cursor++] = satStatus;
            dataArray[cursor++] = latitude;
            dataArray[cursor++] = longitude;
            dataArray[cursor++] = height;
        } else {
            // -1 - mean elements, ecc >= 1.0 or ecc < -0.001 or a < 0.95 er
            // -2 - mean motion less than 0.0
            // -3 - pert elements, ecc < 0.0  or  ecc > 1.0
            // -4 - semi-latus rectum < 0.0
            // -5 - epoch elements are sub-orbital
            // -6 - satellite has decayed
            dataArray[cursor++] = -1 * errcode // error no position
            dataArray[cursor++] = 0
            dataArray[cursor++] = 0
            dataArray[cursor++] = 0
        }
    };
    tickResVector.sats.delete();

    postMessage(dataArray.buffer, [dataArray.buffer]);
    DEBUG && console.log('s', (Date.now() - _startAt)/1000)
}

export { };