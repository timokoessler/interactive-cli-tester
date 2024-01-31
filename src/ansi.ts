const CSI = '\x1b[';

/**
 * BEL (Bell) is used to signal an alert.
 */
export const BEL = '\x07';
/**
 * BS (Backspace) moves the cursor one position to the left.
 */
export const BS = '\x08';
/**
 * HT (Horizontal Tab) moves the cursor one position to the right.
 */
export const TAB = '\x09';
export const LF = '\x0a';
export const VT = '\x0b';
export const FF = '\x0c';
export const CR = '\x0d';
export const ESC = '\x1b';
export const DEL = '\x7f';
export const SPACE = '\x20';

export const CURSOR_UP = `${CSI}A`;
export const CURSOR_DOWN = `${CSI}B`;
export const CURSOR_FORWARD = `${CSI}C`;
export const CURSOR_BACK = `${CSI}D`;
export const CURSOR_NEXT_LINE = `${CSI}E`;
export const CURSOR_PREVIOUS_LINE = `${CSI}F`;
export const CURSOR_HORIZONTAL_ABSOLUTE = `${CSI}G`;
export const CURSOR_HOME = `${CSI}H`;

// Aliases for easier use
export const ENTER = CR;
export const BACKSPACE = BS;
export const ARROW_UP = CURSOR_UP;
export const ARROW_DOWN = CURSOR_DOWN;
export const ARROW_RIGHT = CURSOR_FORWARD;
export const ARROW_LEFT = CURSOR_BACK;
