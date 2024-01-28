const CSI = '\x1b[';

export const BEL = '\x07';
export const BS = '\x08';
export const HT = '\x09';
export const LF = '\x0a';
export const VT = '\x0b';
export const FF = '\x0c';
export const CR = '\x0d';
export const ESC = '\x1b';
export const DEL = '\x7f';

export const CURSOR_UP = `${CSI}A`;
export const CURSOR_DOWN = `${CSI}B`;
export const CURSOR_FORWARD = `${CSI}C`;
export const CURSOR_BACK = `${CSI}D`;
export const CURSOR_NEXT_LINE = `${CSI}E`;
export const CURSOR_PREVIOUS_LINE = `${CSI}F`;
export const CURSOR_HORIZONTAL_ABSOLUTE = `${CSI}G`;
export const CURSOR_HOME = `${CSI}H`;
