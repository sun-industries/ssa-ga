
export enum SGP4States {
    OFF='OFF',
    LOADED='LOADED',
    ERROR_NOT_LOADED='ERROR_NOT_LOADED',
    ERROR_CANNOT_BECAUSE_IN_ANALYZING='ERROR_CANNOT_BECAUSE_IN_ANALYZING',
    INITIATED='INITIATED',
    ANALYZING='ANALYZING'
}

export enum Modes {
    STOP,
    PAUSED,
    PLAY,
    REV,
    ANALYZING,
    ANALYZING_RESULTS,
    INIT_ANALYZING
}

export enum SatTicketStatus {
    // ERROR is any number < 0
    NONE = 0,
    OVERFLY = 1001,
    SUNLIT  = 1011, // then also is OVERFLY
    VISIBLE = 1111,  // then also is OVERFLY and SUNLIT
}

export function satTicketStatusToColor(status: SatTicketStatus):number {
    switch(status) {
        case SatTicketStatus.VISIBLE:
            return 0x22c55e;
        case SatTicketStatus.SUNLIT:
            return 0xea580c;
        case SatTicketStatus.OVERFLY:
            return 0x64748b;
        case SatTicketStatus.NONE:
            return 0x475569;
        default:
            return 0xd946ef;
    }
}