import loadWASM from './c++/cpp.mjs';
import { SGP4States } from './options';

const DEBUG = false;

interface TickResult {
    satnum: string,
    longitude: number,
    latitude: number,
    height: number,
    overfly: boolean,
    visible: boolean 
}
interface TickResultVector {
    size(): number;
    get(i: number): TickResult;
    delete(): void;
}
interface SGP4Interface {
    init(tleTxt: string): number;
    tick(UTCFullYear:number, UTCMonth:number, UTCDate:number, UTCHours:number, UTCMinutes:number, UTCSeconds:number): TickResultVector;
}

let SGP4 : SGP4Interface;
let SGP4State: SGP4States = SGP4States.OFF;
let nSats: number = 0;

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
    } else if (type === 'startPrediction') {
        /*const {name, from, date, mode} = event.data;
        requestDataPrediction(name, from, date, mode);
        */
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

function tick(time: Date) {

    const _startAt = Date.now();

    const dataArraySize = nSats * 4 + 6;
    const dataArray = new Float32Array(dataArraySize);
    let cursor = 0;

    const UTCFullYear = time.getUTCFullYear();
    const UTCMonth = time.getUTCMonth();
    const UTCDate = time.getUTCDate();
    const UTCHours = time.getUTCHours();
    const UTCMinutes = time.getUTCMinutes();
    const UTCSeconds = time.getUTCSeconds();
    dataArray[cursor++] = UTCFullYear;
    dataArray[cursor++] = UTCMonth;
    dataArray[cursor++] = UTCDate;
    dataArray[cursor++] = UTCHours;
    dataArray[cursor++] = UTCMinutes;
    dataArray[cursor++] = UTCSeconds;

    let tickResVector = SGP4.tick(UTCFullYear, UTCMonth + 1, UTCDate, UTCHours, UTCMinutes, UTCSeconds);

    for(let i = 0; i < tickResVector.size(); i++) {
        const { satnum, latitude, longitude, height, overfly, visible } = tickResVector.get(i);
        
        if(longitude) {
            dataArray[cursor++] = 1// TODO
            dataArray[cursor++] = latitude;
            dataArray[cursor++] = longitude;
            dataArray[cursor++] = height;
        } else {
            dataArray[cursor++] = -1 // error no position
            dataArray[cursor++] = 0
            dataArray[cursor++] = 0
            dataArray[cursor++] = 0
        }
    };
    tickResVector.delete();

    postMessage(dataArray.buffer, [dataArray.buffer]);
    const _endAt = Date.now();
    DEBUG && console.log('s', (_endAt - _startAt)/1000)
}

export { };