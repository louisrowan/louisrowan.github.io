/******/ (function(modules) { // webpackBootstrap
/******/    // The module cache
/******/    var installedModules = {};
/******/
/******/    // The require function
/******/    function __webpack_require__(moduleId) {
/******/
/******/        // Check if module is in cache
/******/        if(installedModules[moduleId]) {
/******/            return installedModules[moduleId].exports;
/******/        }
/******/        // Create a new module (and put it into the cache)
/******/        var module = installedModules[moduleId] = {
/******/            i: moduleId,
/******/            l: false,
/******/            exports: {}
/******/        };
/******/
/******/        // Execute the module function
/******/        modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/        // Flag the module as loaded
/******/        module.l = true;
/******/
/******/        // Return the exports of the module
/******/        return module.exports;
/******/    }
/******/
/******/
/******/    // expose the modules object (__webpack_modules__)
/******/    __webpack_require__.m = modules;
/******/
/******/    // expose the module cache
/******/    __webpack_require__.c = installedModules;
/******/
/******/    // define getter function for harmony exports
/******/    __webpack_require__.d = function(exports, name, getter) {
/******/        if(!__webpack_require__.o(exports, name)) {
/******/            Object.defineProperty(exports, name, {
/******/                configurable: false,
/******/                enumerable: true,
/******/                get: getter
/******/            });
/******/        }
/******/    };
/******/
/******/    // getDefaultExport function for compatibility with non-harmony modules
/******/    __webpack_require__.n = function(module) {
/******/        var getter = module && module.__esModule ?
/******/            function getDefault() { return module['default']; } :
/******/            function getModuleExports() { return module; };
/******/        __webpack_require__.d(getter, 'a', getter);
/******/        return getter;
/******/    };
/******/
/******/    // Object.prototype.hasOwnProperty.call
/******/    __webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/    // __webpack_public_path__
/******/    __webpack_require__.p = "";
/******/
/******/    // Load entry module and return exports
/******/    return __webpack_require__(__webpack_require__.s = 11);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const _state = {
    allCells: {}, // object containing all cells.  key: id, value: cell
    activeCells: [], // array of cell object id's that are currently 'active'
    mousedown: false, // boolean to determine when mouseover is a drag event
    colDrag: false, // false or col header index to determine if column width drag is active
    rowDrag: false, // false or row header index to determine if row height drag is active
    colHeaderDiv: {}, // div container for column headers
    rowHeaderDiv: {}, // div container for row headers
    cellDrag: false,
    draggableDiv: {}, // htmlElement that is used to show multi-selection and drag events
    spreadsheetContainer: {}, // div surrounding all cells
    startCellRect: {}, // cell at start of draggableDiv
    endCellRect: {}, // cell at end of draggableDiv
    cutCopyType: '', // string indicating if action is cut or copy
    cutCopyCells: [], // array of cell objects containing cells on cut/copy clipboard
    commandActive: false, // boolean to determine if command key is being held down
    shiftActive: false, // boolean to determine if shift is being held down
    columnHeaders: [], // array of column header objects
    rowHeaders: [], //  array of row header objects,
    funcCellOutput: {}, // obj containing summed cells by id with array of cells to sum
    funcCellInput: {} // obj containing cells by id with array of funcCellOutput linked
};


const $setState = (args) => {

    return Object.assign(_state, args);
};


const $updateCell = (cell, newProps) => {

    let tmp = cell;
    if (typeof cell === 'string') {
        cell = _state.allCells[cell];
    }

    if (!cell) {
        console.warn('no cell found for', tmp); // eslint-disable-line
    }

    if (newProps.style) {
        Object.assign(cell.input.style, newProps.style);
        delete newProps.style;
    }

    if (newProps.divStyle) {
        Object.assign(cell.div.style, newProps.divStyle);
        delete newProps.divStyle;
    }

    if (newProps.value || newProps.value === '') {
        cell.input.value = newProps.value;
    }

    Object.assign(cell, newProps);
    return cell;
};


const $updateFuncCellOutput = (cellId, newvalue, del) => {

    if (del) {
        delete _state.funcCellOutput[cellId];
        return;
    }

    return _state.funcCellOutput[cellId] = newvalue;
};


const $updateFuncCellInput = (cellId, newvalue) => {

    return _state.funcCellInput[cellId] = newvalue;
};


const $updateDraggable = (styles) => {

    if (typeof styles !== 'object') {
        console.warn('bad input for update draggable', styles); // eslint-disable-line
    }

    Object.assign(_state.draggableDiv.style, styles);
};


const $updateElementStyle = (element, styles) => {

    return Object.assign(element.style, styles);
};


module.exports = {
    $setState,
    $updateCell,
    _state,
    $updateDraggable,
    $updateElementStyle,
    $updateFuncCellOutput,
    $updateFuncCellInput
};


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const ROW_COUNT = 20;
const COL_COUNT = 20;
const CELL_WIDTH = 80;
const CELL_HEIGHT = 40;
const COLUMN_HEADER_HEIGHT = 20;
const ROW_HEADER_WIDTH = 40;
const TOOLBAR_HEIGHT = 100;

module.exports = {
    ROW_COUNT,
    COL_COUNT,
    CELL_WIDTH,
    CELL_HEIGHT,
    COLUMN_HEADER_HEIGHT,
    ROW_HEADER_WIDTH,
    TOOLBAR_HEIGHT
};


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const { $updateCell } = __webpack_require__(0);
const { ROW_HEADER_WIDTH } = __webpack_require__(1);
const Common = __webpack_require__(6);
const CellElement = __webpack_require__(8);
const Prehandler = __webpack_require__(7);
const CellStateUpdate = __webpack_require__(3);
const WindowStateUpdate = __webpack_require__(5);


const internals = {};

// internal-only


// internal and external functions

internals.newSelectedCell = exports.newSelectedCell = (state, cell) => {

    CellStateUpdate.deactivateAllCells(state);
    CellStateUpdate.addToActiveCells(state, cell);
    CellStateUpdate.styleSelectedCell(cell);
    CellStateUpdate.updateStartCellRect(cell);
    CellStateUpdate.updateEndCellRect();

    const bound = internals.getCellBounding(state, cell);
    WindowStateUpdate.setDraggableDivToCell(bound);

    return;
};


internals.getCellBounding = exports.getCellBounding = (state, cell) => {

    let column = state.columnHeaders[cell.column - 1];
    const row = state.rowHeaders[cell.row];

    if (!column) {
        column = {
            position: () => ROW_HEADER_WIDTH
        };
    }

    return {
        x: column.position(),
        y: row.position(),
        width: Common.translatePxToNum(cell.div.style.width),
        height: Common.translatePxToNum(cell.div.style.height)
    };
};


internals.parseRow = exports.parseRow = (id) => +id.substr(1).split('.c')[0];


internals.parseColumn = exports.parseColumn = (id) => +id.substr(1).split('.c')[1];


// external functions

exports.copyCell = (cell) => {

    const newCell = new CellElement.Cell(cell.row, cell.column);
    newCell.input.style = Object.assign({}, cell.input.style);
    newCell.input.value = cell.input.value;
    newCell.copied = true;

    return newCell;
};


exports.overwriteCellProps = (origin, source) => {

    const sourceStyle = source.input.style;

    $updateCell(origin, {
        style: {
            fontWeight: sourceStyle.fontWeight,
            fontStyle: sourceStyle.fontStyle,
            textDecoration: sourceStyle.textDecoration,
            textAlign: sourceStyle.textAlign
        },
        value: source.input.value
    });
};


exports.sortCellIdsByPosition = (cellIds) => {

    return cellIds.sort((a, b) => {

        return internals.parseRow(a) - internals.parseRow(b) || internals.parseColumn(a) - internals.parseColumn(b);
    });
};


exports.isSameCell = (cell1, cell2) => {

    return cell1.row === cell2.row && cell1.column === cell2.column;
};


exports.clearCell = (state, cell) => {

    Prehandler.cellInput({
        state,
        e: {},
        cell,
        clear: true
    });
};


exports.getMultiCellDimensions = (state, startCell, endCell) => {

    const startBounding = internals.getCellBounding(state, startCell);
    const endBounding = internals.getCellBounding(state, endCell);

    const left = Math.min(startBounding.x, endBounding.x);
    const top = Math.min(startBounding.y, endBounding.y);
    const maxWidth = Math.max(startBounding.x + startBounding.width, endBounding.x + endBounding.width);
    const maxHeight = Math.max(startBounding.y + startBounding.height, endBounding.y + endBounding.height);
    const width = maxWidth - left;
    const height = maxHeight - top;

    return {
        left,
        top,
        width,
        height
    };
};


exports.getMultiCellRowCol = (cell1, cell2) => {

    const leftCol = Math.min(cell1.column, cell2.column);
    const rightCol = Math.max(cell1.column, cell2.column);
    const topRow = Math.min(cell1.row, cell2.row);
    const botRow = Math.max(cell1.row, cell2.row);

    return { leftCol, rightCol, topRow, botRow };
};


exports.getArrayofCellIdsFromRowCol = (leftCol, rightCol, topRow, botRow) => {

    const cellIds = [];

    for (let c = leftCol; c <= rightCol; ++c) {

        for (let r = topRow; r <= botRow; ++r) {

            cellIds.push(`r${r}.c${c}`);
        }
    }
    return cellIds;
};


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const { $setState, $updateCell, $updateFuncCellOutput, $updateFuncCellInput } = __webpack_require__(0);

const addToActiveCells = (state, cell) => {

    if (!state.activeCells.find((active) => active === cell.id)) {
        $setState({ activeCells: state.activeCells.concat(cell.id)});
        $updateCell(cell, { active: true });
    }
};


const removeFromActiveCells = (state, cell) => {

    const index = state.activeCells.indexOf(cell.id);
    if (index > -1) {
        const activeCells = state.activeCells.concat(); // clone
        activeCells.splice(index, 1);
        $setState({ activeCells: activeCells });
        $updateCell(cell, {
            style: {
                border: '1px solid rgb(238, 238, 238)',
                background: 'white'
            },
            active: false
        });
    }
};


const deactivateAllCells = (state) => {

    state.activeCells.forEach((id) => {

        const cell = state.allCells[id];
        removeFromActiveCells(state, cell);
    });
};


const styleSelectedCell = (cell) => {

    $updateCell(cell, { style: { border: '2px solid green' }});
};


const updateStartCellRect = (cell = {}) => {

    $setState({ startCellRect: cell });
};


const updateEndCellRect = (cell = {}) => {

    $setState({ endCellRect: cell });
};


const updateFuncCellInputValue = (state, cell) => {

    const newValue = state.funcCellOutput[cell.id].reduce((a, b) => {

        const cellToSum = state.allCells[b];
        if (isNaN(+cellToSum.input.value)) {
            return a;
        }
        return a += +cellToSum.input.value;
    }, 0);

    $updateCell(cell, { value: newValue });
};


const updateFuncCellOutputValue = (state, cell) => {

    $updateFuncCellOutput(cell.id, null, true);
    Object.keys(state.funcCellInput).forEach((id) => {

        if (state.funcCellInput[id].includes(cell.id)) {
            const index = state.funcCellInput[id].indexOf(cell.id);
            const newInputArray = state.funcCellInput[id].concat();
            newInputArray.splice(index, 1);
            $updateFuncCellInput(id, newInputArray);
        }
    });
};


module.exports = {
    addToActiveCells,
    removeFromActiveCells,
    deactivateAllCells,
    styleSelectedCell,
    updateStartCellRect,
    updateEndCellRect,
    updateFuncCellInputValue,
    updateFuncCellOutputValue
};


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const { CELL_WIDTH, CELL_HEIGHT, COL_COUNT, ROW_COUNT, TOOLBAR_HEIGHT, COLUMN_HEADER_HEIGHT, ROW_HEADER_WIDTH } = __webpack_require__(1);
const CellCommon = __webpack_require__(2);
const CellStateUpdate = __webpack_require__(3);
const { $setState } = __webpack_require__(0);

exports.handleCellDragEnd = (state) => {

    const cell1 = state.startCellRect;
    const cell2 = state.endCellRect;
    const { leftCol, rightCol, topRow, botRow } = CellCommon.getMultiCellRowCol(cell1, cell2);

    const relevantCells = CellCommon.getArrayofCellIdsFromRowCol(leftCol - 5, rightCol + 5, topRow - 5, botRow + 5);

    const len = relevantCells.length;
    for (let i = 0; i < len; ++i) {

        const id = relevantCells[i];
        const cell = state.allCells[id];
        if (!cell) continue;

        if (topRow <= cell.row &&
            leftCol <= cell.column &&
            botRow >= cell.row &&
            rightCol >= cell.column)
        {
            CellStateUpdate.addToActiveCells(state, cell);
        }
        else if (cell.active) {
            CellStateUpdate.removeFromActiveCells(state, cell);
        }
    }
    $setState({ cellDrag: false });
};


exports.getNewCellIdFromKeydown = (startCell, key) => {

    let row = startCell.row;
    let column = startCell.column;

    switch (key) {
        case 'ArrowLeft':
            column = column > 0 ? --column : 0;
            break;
        case 'ArrowRight':
            column = column < COL_COUNT - 1 ? ++column : COL_COUNT - 1;
            break;
        case 'ArrowUp':
            row = row > 0 ? --row : 0;
            break;
        case 'ArrowDown':
            row = row < ROW_COUNT - 1 ? ++row : ROW_COUNT - 1;
            break;
    }

    return { row, column };
};


exports.scrollToNewCell = (cell, offset = 0) => {

    const cellTop = cell.div.offsetTop;
    const cellBottom = cellTop + cell.div.offsetHeight;
    const cellLeft = cell.div.offsetLeft;
    const cellRight = cellLeft + cell.div.offsetWidth;

    const windowTop = window.pageYOffset;
    const windowBottom = windowTop + window.innerHeight;
    const windowLeft = window.pageXOffset;
    const windowRight = window.pageXOffset + window.innerWidth;

    if (offset > 0) {

        if (cellTop - (TOOLBAR_HEIGHT + COLUMN_HEADER_HEIGHT + (offset * CELL_HEIGHT)) <= windowTop) {
            window.scrollTo(windowLeft, cellTop - (TOOLBAR_HEIGHT + COLUMN_HEADER_HEIGHT + CELL_HEIGHT));
        }
        if (cellBottom + (offset * CELL_HEIGHT) >= windowBottom) {
            window.scrollTo(windowLeft, cellBottom + CELL_HEIGHT - window.innerHeight);
        }

        if (cellLeft - (offset * CELL_WIDTH) <= windowLeft) {
            window.scrollTo(cellLeft - ROW_HEADER_WIDTH - CELL_WIDTH, windowTop);
        }
        if (cellRight + (offset * CELL_WIDTH) >= windowRight) {
            window.scrollTo(cellRight - window.innerWidth + CELL_WIDTH, windowTop);
        }
        return;
    }


    if (cellTop - (TOOLBAR_HEIGHT + COLUMN_HEADER_HEIGHT) < windowTop) {
        window.scrollTo(windowLeft, cellTop - (TOOLBAR_HEIGHT + COLUMN_HEADER_HEIGHT));
    }
    if (cellBottom > windowBottom) {
        window.scrollTo(windowLeft, cellBottom - window.innerHeight);
    }

    if (cellLeft - ROW_HEADER_WIDTH < windowLeft) {
        window.scrollTo(cellLeft - ROW_HEADER_WIDTH, windowTop);
    }
    if (cellRight > windowRight) {
        window.scrollTo(cellRight - window.innerWidth, windowTop);
    }

    return;
};


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const { $setState, $updateDraggable } = __webpack_require__(0);


const setDraggableDivToCell = (cellBounding) => {

    $updateDraggable({
        visibility: 'visible',
        left: cellBounding.x + 'px',
        top: cellBounding.y + 'px',
        width: '0px',
        height: '0px'
    });
};


const setDraggableDivToDimensions = (left, top, width, height) => {

    $updateDraggable({
        left: left + 'px',
        top: top + 'px',
        width: width + 'px',
        height: height + 'px',
    });
};


const toggleMousedown = (value) => {

    $setState({ mousedown: value });
};


module.exports = {
    setDraggableDivToCell,
    setDraggableDivToDimensions,
    toggleMousedown
};


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const getNewHeightWidth = (element, diff, property) => {

    const original = translatePxToNum(element.style[property]);
    return { [property]: `${+original + +diff}px` };
};


const translatePxToNum = (px) => {

    return +(px.slice(0, -2));
};


const validate = (args, funcName) => {

    if (typeof args !== 'object') {
        console.warn('invalid args given from', funcName, args); // eslint-disable-line
    }

    Object.keys(args).forEach((k) => {

        const type = typeof args[k];
        if (type !== typeof k) {
            console.warn('invalid args given from', funcName, args); // eslint-disable-line
        }
    });
    return;
};


module.exports = {
    getNewHeightWidth,
    translatePxToNum,
    validate
};


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const Handlers = __webpack_require__(19);

// Declare internals

const internals = {};


exports.cellInput = internals.cellInput = (args) => {

    const { state, e, clear } = args;

    const cell = args.cell || state.startCellRect;
    if (!cell) return;

    Handlers.cellInput(cell, e, clear);

    if (state.funcCellOutput[cell.id]) {
        Handlers.funcCellOutput(state, cell);
    }
    if (state.funcCellInput[cell.id]) {
        Handlers.funcCellInput(state, cell);
    }
    return;
};


exports.cellMousedown = (state, cell) => {

    return Handlers.cellMousedown(state, cell);
};


exports.cellMouseover = (state, cell) => {

    return Handlers.cellDrag(state, cell);
};


exports.commandActiveKeydown = (state, e) => {

    if (e.key === 'c') {
        e.preventDefault();
        return Handlers.clickCutCopy(state, 'copy');
    }
    else if (e.key === 'x') {
        e.preventDefault();
        return Handlers.clickCutCopy(state, 'cut');
    }
    else if (e.key === 'v') {
        e.preventDefault();
        return Handlers.clickPaste(state);
    }
    return;
};


exports.enableCommandActive = () => {

    return Handlers.enableCommandActive();
};


exports.enableShiftActive = () => {

    return Handlers.enableShiftActive();
};


exports.headerMousedown = (type, e) => {

    let id = e.target.id.split('.');
    id = id[1];

    return Handlers.headerMousedown(type, id);
};


exports.keyup = (e) => {

    return Handlers.keyup(e);
};


exports.mouseup = (state) => {

    return Handlers.mouseup(state);
};


exports.navigateCells = (state, e) => {

    return Handlers.navigateCells(state, e);
};


exports.resizeRowColumn = (state, e, value) => {

    return Handlers.resizeRowColumn(state, e, value);
};


exports.scroll = (state) => {

    return Handlers.scroll(state);
};


exports.shiftActiveKeydown = (state, e) => {

    if (e.key === 'ArrowLeft' ||
        e.key === 'ArrowRight' ||
        e.key === 'ArrowUp' ||
        e.key === 'ArrowDown') {
        return Handlers.keydownExpandCellRect(state, e);
    }
    else {
        return internals.cellInput({ state, e });
    }
};


exports.toolbarButtonClick = (state, e) => {

    if (!e.target.id) return;

    switch (e.target.id) {
        case 'deleteButton':
            return Handlers.clickDelete(state);
        case 'textSize11Button':
            return Handlers.clickCss(state, { key: 'fontSize', value: '11px' });
       case 'textSize16Button':
            return Handlers.clickCss(state, { key: 'fontSize', value: '16px' });
       case 'textSize20Button':
            return Handlers.clickCss(state, { key: 'fontSize', value: '20px' });
        case 'boldButton':
            return Handlers.clickCss(state, { key: 'fontWeight', value: 'bold' });
        case 'italicButton':
            return Handlers.clickCss(state, { key: 'fontStyle', value: 'italic' });
        case 'underlineButton':
            return Handlers.clickCss(state, { key: 'textDecoration', value: 'underline' });
        case 'leftalignButton':
            return Handlers.clickCss(state, { key: 'textAlign', value: 'left' });
        case 'centeralignButton':
            return Handlers.clickCss(state, { key: 'textAlign', value: 'center' });
        case 'rightalignButton':
            return Handlers.clickCss(state, { key: 'textAlign', value: 'right' });
        case 'cutButton':
            return Handlers.clickCutCopy(state, 'cut');
        case 'copyButton':
            return Handlers.clickCutCopy(state, 'copy');
        case 'pasteButton':
            return Handlers.clickPaste(state);
        case 'sumButton':
            return Handlers.clickSum(state);
        default:
            return console.warn('Bad button click in toolbarButtonClick handler', e); // eslint-disable-line
    }
};


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const Styles = __webpack_require__(16);
const { _state } = __webpack_require__(0);
const Common = __webpack_require__(6);
const { CELL_HEIGHT, CELL_WIDTH, COL_COUNT, COLUMN_HEADER_HEIGHT, ROW_HEADER_WIDTH, TOOLBAR_HEIGHT } = __webpack_require__(1);

function Cell (row, column) {

    // create elements
    this.div = document.createElement('div');
    this.input = document.createElement('input');
    
    // set props
    this.id = `r${row}.c${column}`;
    this.input.setAttribute('id', `cell-${this.id}`);
    this.row = row;
    this.column = column;
    this.active = false;

    this.input.setAttribute('readonly', 'true');

    // add styles
    Styles.cellStyle(this.div);
    Styles.inputStyle(this.input);

    // connect elements and add cell to allCells array
    this.div.appendChild(this.input);

    return this;
}


function ColumnHeader (column) {

    // create elements
    this.div = document.createElement('div');
    this.span = document.createElement('div');
    this.textElement = document.createElement('td');

    // set props
    this.column = column;
    this.textElement.innerText = column < 0 ? '' : getLetter();
    this.position = () => {

        return _state.columnHeaders.slice(0, column + 1).reduce((a, b) => {

            return a += Common.translatePxToNum(b.div.style.width);
        }, ROW_HEADER_WIDTH);
    };

    // add styles
    this.div.style.height = COLUMN_HEADER_HEIGHT + 'px';
    this.div.style.width = CELL_WIDTH + 'px';
    Styles.headerCellStyle(this.div);
    this.span.style.height = this.div.style.height;
    Styles.columnHeaderSpanStyle(this.span);
    Styles.columnHeaderTextStyle(this.textElement);

    this.span.setAttribute('id', `colHeader.${column}`);
    this.span.setAttribute('class', 'colHeader');

    // connect elements
    this.div.appendChild(this.span);
    this.div.appendChild(this.textElement);

    return this;
}


const getLetter = (function() {

    const letters = 'abcdefghijklmnopqrstuvwxyz'.toUpperCase();
    let prefixIndex = -1;
    let prefix = '';
    let letterIndex = 0;

    return () => {

        let result;
        if (letters[letterIndex]) {
            result = prefix + letters[letterIndex];
        }
        else {
            letterIndex = 0;
            ++prefixIndex;
            prefix = letters[prefixIndex];
            result = prefix + letters[letterIndex];
        }
        ++letterIndex;
        return result;
    };
}());


function RowHeader (row) {

    // create elements
    this.div = document.createElement('div');
    this.span = document.createElement('div');
    this.textElement = document.createElement('td');

    // set props
    this.row = row;
    this.position = () => {

        return _state.rowHeaders.slice(0, row).reduce((a, b) => {

            return a += Common.translatePxToNum(b.div.style.height);
        }, TOOLBAR_HEIGHT + COLUMN_HEADER_HEIGHT);
    };
    this.textElement.innerText = row + 1 > 0 ? row + 1 : '';

    // add Styles
    this.div.style.height = CELL_HEIGHT + 'px';
    this.div.style.width = ROW_HEADER_WIDTH + 'px';
    Styles.headerCellStyle(this.div);
    Styles.columnHeaderTextStyle(this.textElement);
    Styles.rowHeaderSpanStyle(this.span, this.div);

    this.span.setAttribute('id', `rowHeader.${row}`);
    this.span.setAttribute('class', 'rowHeader');

    // connect elements
    this.div.appendChild(this.span);
    this.div.appendChild(this.textElement);

    return this;
}


function SpreadsheetContainer () {

    this.div = document.createElement('div');
    this.div.setAttribute('id', 'spreadsheet-div');
    this.div.style.padding = '0px';
    this.div.style.margin = '0px';
    this.div.style.width = `${CELL_WIDTH * (COL_COUNT + 1)}px`;

    return this.div;
}


function ColumnCellBuffer () {

    this.div = document.createElement('div');
    this.div.style.height = COLUMN_HEADER_HEIGHT + 'px';
    this.div.style.width = ROW_HEADER_WIDTH + 'px';
    Styles.headerCellStyle(this.div);
    this.div.style.position = 'fixed';
    this.div.style['zIndex'] = 9999;
    this.div.style.border = 'none';

    return this.div;
}


function ColumnHeaderDiv () {

    this.div = document.createElement('div');
    this.div.setAttribute('id', 'column-header-div');
    Styles.columnHeaderDivStyle(this.div);

    return this.div;
}


function ColumnHeaderDivBuffer () {

    this.div = document.createElement('div');
    Styles.columnHeaderDivBufferStyle(this.div);

    return this.div;
}


function RowHeaderDiv () {

    this.div = document.createElement('div');
    this.div.setAttribute('id', 'row-header-div');
    Styles.rowHeaderDivStyle(this.div);

    return this.div;
}


function RowHeaderDivBuffer () {

    this.div = document.createElement('div');
    Styles.rowHeaderDivBufferStyle(this.div);

    return this.div;
}


module.exports = {
    Cell,
    ColumnHeader,
    RowHeader,
    SpreadsheetContainer,
    ColumnCellBuffer,
    ColumnHeaderDiv,
    ColumnHeaderDivBuffer,
    RowHeaderDiv,
    RowHeaderDivBuffer
};


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const { $setState, $updateDraggable } = __webpack_require__(0);

function DraggableDiv() {

    this.div = document.createElement('div');
    this.div.style.position = 'absolute';
    this.div.style['pointerEvents'] = 'none';
    this.div.style.background = 'transparent';
    this.div.style.border = '2px solid green';
    this.div.style['boxSizing'] = 'border-box';
    $setState({ draggableDiv: this.div });
    hideDraggableDiv(this.div);

    return this.div;
}

const hideDraggableDiv = () => {

    $updateDraggable({ visibility: 'hidden'});
};

module.exports = {
    DraggableDiv,
    hideDraggableDiv
};


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const { $updateCell, $setState } = __webpack_require__(0);
const CellCommon = __webpack_require__(2);
const CellStateUpdate = __webpack_require__(3);
const CommonHandler = __webpack_require__(4);
const WindowStateUpdate = __webpack_require__(5);

module.exports = (state, cell) => {

    if (!state.cellDrag) {
        $setState({ cellDrag: true });
    }

    CommonHandler.scrollToNewCell(cell, 1);

    const start = state.startCellRect;
    const { left, top, width, height } = CellCommon.getMultiCellDimensions(state, start, cell);

    $updateCell(start, { style: { border: '1px solid rgb(238, 238, 238)' }});
    CellStateUpdate.updateEndCellRect(cell);
    WindowStateUpdate.setDraggableDivToDimensions(left, top, width, height);

    const { leftCol, rightCol, topRow, botRow } = CellCommon.getMultiCellRowCol(start, cell);

    const relevantCells = CellCommon.getArrayofCellIdsFromRowCol(leftCol - 5, rightCol + 5, topRow - 5, botRow + 5);

    const len = relevantCells.length;
    for (let i = 0; i < len; ++i) {

        const id = relevantCells[i];
        const cell = state.allCells[id];
        if (!cell) continue;

        let backgroundColor;
        // if cell is start cell, set background to white
        if (CellCommon.isSameCell(cell, start)) {
            backgroundColor = 'white';
        }
        // else if cell is within start-end row-col grid, add to active cells
        else if (topRow <= cell.row &&
            leftCol <= cell.column &&
            botRow >= cell.row &&
            rightCol >= cell.column)
        {
            // CellStateUpdate.addToActiveCells(state, cell);
            backgroundColor = 'lightgray';
        }
        // else if cell was marked as active, remove from active cells
        else {
            // CellStateUpdate.removeFromActiveCells(state, cell);
            backgroundColor = 'white';
        }
        // if background color set, call update function
        if (backgroundColor) {
            $updateCell(cell, { style: { background: backgroundColor }});
        }
    }
    return;
};


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(12);


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {

const { COL_COUNT, ROW_COUNT } = __webpack_require__(1);
// const LoggerObject = require('./logger.js');
const ToolbarElement = __webpack_require__(14);
const CellElement = __webpack_require__(8);
const { _state } = __webpack_require__(0);
const DraggableDiv = __webpack_require__(9).DraggableDiv;


// const Logger = new LoggerObject();
const main = document.getElementById('main');

const body = document.body;
body.style.padding = '0px';
body.style.margin = '0px';


// add nav bar
const _toolbar = new ToolbarElement.Toolbar();
main.appendChild(_toolbar);
main.appendChild(new ToolbarElement.ToolbarBuffer());

// add spreadsheet container
const _spreadsheetContainer = new CellElement.SpreadsheetContainer();
main.appendChild(_spreadsheetContainer);
_state.spreadsheetContainer = _spreadsheetContainer;


// add column headers
_state.spreadsheetContainer.appendChild(new CellElement.ColumnCellBuffer());
const _columnHeaderDiv = new CellElement.ColumnHeaderDiv();
_state.columnHeaderDiv = _columnHeaderDiv;
_state.spreadsheetContainer.appendChild(_columnHeaderDiv);
for (let i = 0; i < COL_COUNT; ++i) {

    const _header = new CellElement.ColumnHeader(i);
    _columnHeaderDiv.appendChild(_header.div);
    _state.columnHeaders.push(_header);
}
_state.spreadsheetContainer.appendChild(new CellElement.ColumnHeaderDivBuffer());

// add row headers
const _rowHeaderDiv = new CellElement.RowHeaderDiv();
_state.rowHeaderDiv = _rowHeaderDiv;
_state.spreadsheetContainer.appendChild(_rowHeaderDiv);
_state.spreadsheetContainer.appendChild(new CellElement.RowHeaderDivBuffer());
for (let i = 0; i < ROW_COUNT; ++i) {

    const _row = new CellElement.RowHeader(i);
    _rowHeaderDiv.appendChild(_row.div);
     _state.rowHeaders.push(_row);
}

// timeout to paint screen and then add cells
process.nextTick(() => {
    for (let i = 0; i < ROW_COUNT; ++i) {

        for (let j = 0; j < COL_COUNT; ++j) {

            const _cell = new CellElement.Cell(i, j);
            _spreadsheetContainer.appendChild(_cell.div);
            _state.allCells[_cell.id] = _cell;
        }
    }
});

main.appendChild(new DraggableDiv());
__webpack_require__(17);



/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(13)))

/***/ }),
/* 13 */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const Styles = __webpack_require__(15);

function Toolbar () {

    this.toolbar = document.createElement('div');
    this.toolbar.setAttribute('id', 'toolbar-div');
    Styles.styleToolbar(this.toolbar);

    internals.addButtons(this.toolbar);

    return this.toolbar;
}


function ToolbarBuffer () {

    this.div = document.createElement('div');
    this.div.style.height = document.getElementById('toolbar-div').style.height;

    return this.div;
}


function EraseButton() {

    this.button = document.createElement('button');
    this.button.innerText = 'Delete';
    this.button.setAttribute('id', 'deleteButton');
    Styles.commonButtonStyle(this.button);

    return this.button;
}


function DropdownButton(atts) {

    this.button = document.createElement('button');
    this.button.innerText = atts.text;
    Styles.commonButtonStyle(this.button);
    this.button.style[atts.key] = 'red';

    return this.button;
}


function CssButton(atts) {

    this.button = document.createElement('button');
    this.button.innerText = atts.text;
    this.button.setAttribute('id', atts.id);
    this.button.style[atts.key] = atts.value;
    Styles.commonButtonStyle(this.button);

    return this.button;
}


function CutCopyButton (type) {

    this.button = document.createElement('button');
    this.button.innerText = type;
    this.button.setAttribute('id', `${type}Button`);
    Styles.commonButtonStyle(this.button);

    return this.button;
}


function PasteButton () {

    this.button = document.createElement('button');
    this.button.innerText = 'paste';
    this.button.setAttribute('id', 'pasteButton');
    Styles.commonButtonStyle(this.button);

    return this.button;
}


function SumButton () {

    this.button = document.createElement('button');
    this.button.innerText = 'sum';
    this.button.setAttribute('id', 'sumButton');
    Styles.commonButtonStyle(this.button);

    return this.button;
}


const internals = {};

internals.addButtons = function (toolbar) {

    const buttonAttributes = [
        {
            key: 'fontSize',
            value: '11px',
            text: 'A',
            id: 'textSize11Button'
        },
                {
            key: 'fontSize',
            value: '16px',
            text: 'A',
            id: 'textSize16Button'
        },
                {
            key: 'fontSize',
            value: '20px',
            text: 'A',
            id: 'textSize20Button'
        },
        {
            key: 'fontWeight',
            value: 'bold',
            text: 'B',
            id: 'boldButton'
        },
        {
            key: 'fontStyle',
            value: 'italic',
            text: 'I',
            id: 'italicButton'
        },
        {
            key: 'textDecoration',
            value: 'underline',
            text: 'U',
            id: 'underlineButton'
        },
        {
            key: 'textAlign',
            value: 'left',
            text: '=',
            id: 'leftalignButton'
        },
        {
            key: 'textAlign',
            value: 'center',
            text: '=',
            id: 'centeralignButton'
        },
        {
            key: 'textAlign',
            value: 'right',
            text: '=',
            id: 'rightalignButton'
        }
    ];

    // add basic styling buttons
    buttonAttributes.forEach((atts) => toolbar.appendChild(new CssButton(atts)));

    // const dropdownButtonAttributes = [
    //     {
    //         key: 'color',
    //         text: 'A'
    //     },
    //     {
    //         key: 'background',
    //         text: 'A'
    //     }
    // ];

    // add dropdown styling buttons
    // dropdownButtonAttributes.forEach((atts) => toolbar.appendChild(new DropdownButton(atts)));

    toolbar.appendChild(new EraseButton());

    toolbar.appendChild(new CutCopyButton('cut'));
    toolbar.appendChild(new CutCopyButton('copy'));
    toolbar.appendChild(new PasteButton());
    toolbar.appendChild(new SumButton());
};


module.exports = {
    Toolbar,
    ToolbarBuffer,
    EraseButton,
    DropdownButton,
    CssButton,
    CutCopyButton,
    PasteButton,
    SumButton
};


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const { TOOLBAR_HEIGHT } = __webpack_require__(1);

const styleToolbar = (toolbar) => {

    const style = toolbar.style;

    style.background = 'white';
    style.height = TOOLBAR_HEIGHT + 'px';
    style.border = '1px solid black';
    style.position = 'fixed';
    style.width = '100%';
    style['zIndex'] = '999';
    style['minWidth'] = '500px';
    style['boxSizing'] = 'border-box';
};


const commonButtonStyle = (button) => {

    button.style.width = '70px';
    button.style.height = '35px';
    button.style.float = 'left';
};


module.exports = {
    styleToolbar,
    commonButtonStyle
};


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const { CELL_HEIGHT, CELL_WIDTH, COL_COUNT, ROW_COUNT, COLUMN_HEADER_HEIGHT, ROW_HEADER_WIDTH, TOOLBAR_HEIGHT } = __webpack_require__(1);


exports.cellStyle = (div) => {

    const style = div.style;
    
    style.width = CELL_WIDTH + 'px';
    style.height = CELL_HEIGHT + 'px';
    style.float = 'left';
    return;
};


exports.inputStyle = (input) => {

    const style = input.style;
    
    style.width = '100%';
    style.height = '100%';
    style.outline = 'none';
    style.border = '1px solid rgb(238, 238, 238)';
    style.cursor = 'cell';
    style['boxSizing'] = 'border-box';
    style['fontWeight'] = 'normal';
    style['fontStyle'] = 'normal';
    style['textDecoration'] = 'none';
    style['textAlign'] = 'left';
    return;
};


exports.headerCellStyle = (div) => {

    const style = div.style;

    style.float = 'left';
    style.border = '1px solid rgb(238, 238, 238)';
    style.background = 'whitesmoke';
    style.position = 'relative';
    style['boxSizing'] = 'border-box';
    return;
};


exports.columnHeaderSpanStyle = (div) => {

    const style = div.style;

    style.width = '2px';
    style.background = 'gray';
    style.position = 'relative';
    style.display = 'inline-block';
    style.right = '2px';
    style.top = '-1px';
    style.cursor = 'col-resize';
    style['boxSizing'] = 'border-box';
    return;
};


exports.rowHeaderSpanStyle = (span, div) => {

    const style = span.style;

    style.width = div.style.width;
    style.height = '2px';
    style.background = 'gray';
    style.position = 'absolute';
    style.top = '-2px';
    style.left = '-1px';
    style.cursor = 'row-resize';
    style['boxSizing'] = 'border-box';
    return;
};


exports.columnHeaderTextStyle = (element) => {

    const style = element.style;

    style.width = '100%';
    style.height = '100%';
    style.position = 'absolute';
    style.left = '0px';
    style.right = '0px';
    style.top = '0px';
    style.bottom = '0px';
    style['textAlign'] = 'center';
    style['pointerEvents'] = 'none';
    style['paddingTop'] = (COLUMN_HEADER_HEIGHT/5) + 'px';
    return;
};


exports.columnHeaderDivStyle = (element) => {

    const style = element.style;

    style.width = CELL_WIDTH * (COL_COUNT + 1) + 'px';
    style.height = COLUMN_HEADER_HEIGHT + 'px';
    style.position = 'fixed';
    style.left = ROW_HEADER_WIDTH + 'px';
    style.top = '100px';

    return;
};


exports.columnHeaderDivBufferStyle = (element) => {

    const style = element.style;

    style.width = '100%';
    style.height = COLUMN_HEADER_HEIGHT + 'px';

    return;
};


exports.rowHeaderDivStyle = (element) => {

    const style = element.style;

    style.height = ROW_COUNT * CELL_HEIGHT + 'px';
    style.width = ROW_HEADER_WIDTH + 'px';
    style.position = 'fixed';
    style.top = TOOLBAR_HEIGHT + COLUMN_HEADER_HEIGHT + 'px';

    return;
};


exports.rowHeaderDivBufferStyle = (element) => {

    const style = element.style;

    style.width = ROW_HEADER_WIDTH + 'px';
    style.height = ROW_COUNT * CELL_HEIGHT + 'px';
    style.float = 'left';

    return;
};


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const { _state } = __webpack_require__(0);
const Router = __webpack_require__(18).router;

// Internals
const internals = {};

internals.getCell = (state, e) => {

    const input = e.target.id;
    if (!input) return;
    const cell = state.allCells[input.slice(5)]; // input id are prefaced with 'cell-' to slice first 5 char
    if (!cell) return;
    return cell;
};


window.addEventListener('click', (e) => windowClick(e));
window.addEventListener('keydown', (e) => windowKeydown(e));
window.addEventListener('keyup', (e) => windowKeyup(e));
window.addEventListener('mousedown', (e) => windowMousedown(e));
window.addEventListener('mousemove', (e) => windowMousemove(e));
window.addEventListener('mouseover', (e) => windowMouseover(e));
window.addEventListener('mouseup', () => windowMouseup());
window.addEventListener('scroll', () => windowScroll());


const windowClick = (e) => {

    if (e.target.nodeName === 'BUTTON') {

        return new Router({
            state: _state,
            type: 'buttonClick',
            e
        });
    }
};


const windowKeydown = (e) => {

    if (e.key === 'Shift') {

        return new Router({
            state: _state,
            type: 'enableShiftActive'
        });
    }

    if (e.key === 'Meta') {

        return new Router({
            state: _state,
            type: 'enableCommandActive'
        });
    }

    if (_state.commandActive) {

        return new Router({
            state: _state,
            type: 'commandActiveKeydown',
            e
        });
    }

    if (_state.shiftActive) {

        return new Router({
            state: _state,
            type: 'shiftActiveKeydown',
            e
        });
    }

    if (e.key === 'ArrowLeft' ||
        e.key === 'ArrowRight' ||
        e.key === 'ArrowUp' ||
        e.key === 'ArrowDown') {

        e.preventDefault();

        return new Router({
            state: _state,
            type: 'navigateCells',
            e
        });
    }

    if (_state.startCellRect && _state.startCellRect.id) {

        return new Router({
            state: _state,
            type: 'cellInput',
            e
        });
    }
};


const windowKeyup = (e) => {

    new Router({ state: _state, type: 'windowKeyup', e });
};


const windowMousedown = (e) => {

    const cell = internals.getCell(_state, e);

    const colHeader = e.target.className === 'colHeader';
    if (colHeader) {

        return new Router({
            state: _state,
            type: 'colHeaderMousedown',
            e
        });
    }

    const rowHeader = e.target.className === 'rowHeader';
    if (rowHeader) {

        return new Router({
            state: _state,
            type: 'rowHeaderMousedown',
            e
        });
    }
    
    if (!cell) return;

    return new Router({
        state: _state,
        type: 'cellMousedown',
        cell
    });
};


const windowMousemove = (e) => {

    if (_state.colDrag) {

        return new Router({
            state: _state,
            type: 'resizeRowColumn',
            value: 'column',
            e
        });
    }
    else if (_state.rowDrag) {

        return new Router({
            state: _state,
            type: 'resizeRowColumn',
            value: 'row',
            e
        });
    }
};


const windowMouseover = (e) => {

    const cell = internals.getCell(_state, e);

    if (!cell || !_state.mousedown) return;

    return new Router({
        state: _state,
        type: 'cellMouseover',
        cell
    });
};


const windowMouseup = () => {

    return new Router({ state: _state, type: 'windowMouseup' });
};


const windowScroll = () => {

    return new Router({ state:_state, type: 'windowScroll' });
};


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const Prehandler = __webpack_require__(7);


function router (args) {

    const { type, value, e, cell, state } = args;

    switch (type) {
        case 'buttonClick':
            Prehandler.toolbarButtonClick(state, e);
            break;
        case 'cellInput':
            Prehandler.cellInput({state, e});
            break;
        case 'cellMousedown':
            Prehandler.cellMousedown(state, cell);
            break;
        case 'cellMouseover':
            Prehandler.cellMouseover(state, cell);
            break;
        case 'colHeaderMousedown':
            Prehandler.headerMousedown('col', e);
            break;
        case 'commandActiveKeydown':
            Prehandler.commandActiveKeydown(state, e);
            break;
        case 'enableCommandActive':
            Prehandler.enableCommandActive();
            break;
        case 'enableShiftActive':
            Prehandler.enableShiftActive();
            break;
        case 'navigateCells':
            Prehandler.navigateCells(state, e);
            break;
        case 'resizeRowColumn':
            Prehandler.resizeRowColumn(state, e, value);
            break;
        case 'rowHeaderMousedown':
            Prehandler.headerMousedown('row', e);
            break;
        case 'shiftActiveKeydown':
            Prehandler.shiftActiveKeydown(state, e);
            break;
        case 'windowKeyup':
            Prehandler.keyup(e);
            break;
        case 'windowMouseup':
            Prehandler.mouseup(state);
            break;
        case 'windowScroll':
            Prehandler.scroll(state);
            break;
        default:
            console.warn('Router error: Unknown event', args); // eslint-disable-line
    }
    return;
}

module.exports = {
    router
};


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.cellDrag = __webpack_require__(10);
exports.cellInput = __webpack_require__(20);
exports.cellMousedown = __webpack_require__(21);
exports.clickCss = __webpack_require__(22);
exports.clickCutCopy = __webpack_require__(23);
exports.clickDelete = __webpack_require__(24);
exports.clickPaste = __webpack_require__(25);
exports.clickSum = __webpack_require__(26);
exports.commandActiveKeydown = __webpack_require__(27);
exports.common = __webpack_require__(4);
exports.enableCommandActive = __webpack_require__(28);
exports.enableShiftActive = __webpack_require__(29);
exports.funcCellInput = __webpack_require__(30);
exports.funcCellOutput = __webpack_require__(31);
exports.headerMousedown = __webpack_require__(32);
exports.keyup = __webpack_require__(33);
exports.keydownExpandCellRect = __webpack_require__(34);
exports.mouseup = __webpack_require__(35);
exports.navigateCells = __webpack_require__(36);
exports.resizeRowColumn = __webpack_require__(37);
exports.scroll = __webpack_require__(38); // no test yet


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const { $updateCell } = __webpack_require__(0);

// Declare internals

const internals = {
    validInput: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()-_=+]}{| [;:\'"/\\?.>,<Backspace'
};


module.exports = (cell, e, clear) => {

    if (clear) {
        return $updateCell(cell, { value: '' });
    }

    if (!internals.validInput.includes(e.key)) {
        return;
    }

    const value = e.key;
    let currentVal = cell.input.value;

    if (value === 'Backspace') {
        if (!currentVal) return;
        return $updateCell(cell, { value: currentVal.slice(0,-1) });
    }
    $updateCell(cell, { value: currentVal ? currentVal += value : value });
    return;
};


/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const CellCommon = __webpack_require__(2);
const WindowStateUpdate = __webpack_require__(5);


module.exports = (state, cell) => {

    CellCommon.newSelectedCell(state, cell);
    WindowStateUpdate.toggleMousedown(true);
};


/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const { $updateCell } = __webpack_require__(0);

module.exports = (state, atts) => {

    let hasStyle = false;

    for (let i = 0; i < state.activeCells.length; ++i) {

        const cell = state.allCells[state.activeCells[i]];
        const style = cell.input.style;
        if (style[atts.key] && style[atts.key] === atts.value) {
            hasStyle = true;
            break;
        }
    }

    let style = {};
    if (hasStyle) {
        style[atts.key] = '';
    }
    else {
        style[atts.key] = atts.value;
    }

    state.activeCells.forEach((id) => {

        const cell = state.allCells[id];
        $updateCell(cell, { style });
    });
};


/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const { $setState } = __webpack_require__(0);
const CellCommon = __webpack_require__(2);


module.exports = (state, type) => {

    state.activeCells = CellCommon.sortCellIdsByPosition(state.activeCells);
    $setState({ cutCopyCells: [], cutCopyType: type });

    let currentRow = [];
    let row = +state.allCells[state.activeCells[0]].row;
    state.activeCells.forEach((id) => {

        const cell = state.allCells[id];

        if (row !== cell.row) {
            // clone array and push new row array into it
            const addedLastRow = state.cutCopyCells.concat();
            addedLastRow.push(currentRow);
            $setState({ cutCopyCells: addedLastRow });
            currentRow = [];
            row = cell.row;
        }
        currentRow.push(CellCommon.copyCell(cell));
    });

    // clone array and push new row array into it
    const addedLastRow = state.cutCopyCells.concat();
    addedLastRow.push(currentRow);
    $setState({ cutCopyCells: addedLastRow });
    return;
};


/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const Prehandler = __webpack_require__(7);


module.exports = (state) => {

    state.activeCells.forEach((id) => {

        const cell = state.allCells[id];

        Prehandler.cellInput({
            state,
            e: {},
            cell,
            clear: true
        });
    });
};


/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const { $setState } = __webpack_require__(0);
const CellCommon = __webpack_require__(2);

module.exports = (state) => {

    // return if no active cells
    if (state.activeCells.length < 1) {
        return;
    }

    // step 1: find 'first' active elemnt
    const firstActive = CellCommon.sortCellIdsByPosition(state.activeCells)[0];
    const firstRow = CellCommon.parseRow(firstActive);
    const firstColumn = CellCommon.parseColumn(firstActive);

    // step 2: set up looping of copy/paste rows (outer array)
    for (let r = 0; r < state.cutCopyCells.length; ++r) {

        const currentRow = state.cutCopyCells[r];
        for (let c = 0; c < currentRow.length; ++c) {

            const allCell = state.allCells[`r${firstRow + r}.c${firstColumn + c}`];
            if (!allCell) {
                break;
            }

            CellCommon.overwriteCellProps(allCell, state.cutCopyCells[r][c]);

            if (state.cutCopyType === 'cut') {
                const cutCell = state.allCells[state.cutCopyCells[r][c].id];
                CellCommon.clearCell(state, cutCell);
            }
        }
    }

    if (state.cutCopyType === 'cut') {
        $setState({ cutCopyType: 'copy' });
    }
};


/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const { $updateFuncCellOutput, $updateFuncCellInput, $updateCell } = __webpack_require__(0);


module.exports = (state) => {

    if (!state.activeCells || state.activeCells.length < 2) {
        return;
    }

    const cellsByCol = {};
    let finalRow = state.allCells[state.activeCells[0]].row;
    state.activeCells.forEach((id) => {

        const cell = state.allCells[id];

        finalRow = cell.row > finalRow ? cell.row : finalRow;

        if (!cellsByCol[cell.column]) {
            cellsByCol[cell.column] = [];
        }
        cellsByCol[cell.column].push({
            val: cell.input.value || 0,
            column: cell.column,
            row: cell.row,
            id: cell.id
        });
    });

    Object.keys(cellsByCol).forEach((i) => {

        const sum = cellsByCol[i].reduce((a, b) => a += +b.val, 0);
        const column = cellsByCol[i][0].column;
        const cellToSum = state.allCells[`r${finalRow + 1}.c${column}`];

        const outputArray = cellsByCol[i].map((i) => i.id);
        $updateFuncCellOutput(cellToSum.id, outputArray);

        cellsByCol[i].forEach((e) => {

            const inputArray = state.funcCellInput[e.id] ? state.funcCellInput[e.id].concat() : [];
            inputArray.push(cellToSum.id);
            $updateFuncCellInput(e.id, inputArray);
        });
        $updateCell(cellToSum, { value: sum });
    });
};


/***/ }),
/* 27 */
/***/ (function(module, exports) {

// 'use strict';

// const ToolbarListeners = require('../toolbar/eventListeners');
// const Common = require('../common');


// module.exports = (state, e) => {

//     if (e.key === 'c') {
//         e.preventDefault();
//         ToolbarListeners.cutCopyButtonClick(state, 'copy');
//         return;
//     }
//     else if (e.key === 'x') {
//         e.preventDefault();
//         ToolbarListeners.cutCopyButtonClick(state, 'cut');
//         return;
//     }
//     else if (e.key === 'v') {
//         e.preventDefault();
//         ToolbarListeners.pasteButtonClick(state);
//         return;
//     }
//     return;
// };


/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const { $setState } = __webpack_require__(0);


module.exports = () => {

    $setState({ commandActive: true });

    return;
};


/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const { $setState } = __webpack_require__(0);


module.exports = () => {

    $setState({ shiftActive: true });

    return;
};


/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const CellStateUpdate = __webpack_require__(3);


module.exports = (state, cell) => {

    state.funcCellInput[cell.id].forEach((inputCellId) => {

        const cellToUpdate = state.allCells[inputCellId];
        CellStateUpdate.updateFuncCellInputValue(state, cellToUpdate);
    });
};


/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const CellStateUpdate = __webpack_require__(3);

module.exports = (state, cell) => {

    CellStateUpdate.updateFuncCellOutputValue(state, cell);
};


/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const { $setState } = __webpack_require__(0);
const WindowStateUpdate = __webpack_require__(5);

module.exports = (type, id) => {

    WindowStateUpdate.toggleMousedown(true);
    switch (type) {
        case 'col':
            return $setState({ colDrag: +id });
        case 'row':
            return $setState({ rowDrag: +id });
        default:
            return;
    }
};


/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const { $setState } = __webpack_require__(0);


module.exports = (e) => {

    const options = {};

    switch (e.key) {
        case 'Meta':
            options.commandActive = false;
            break;
        case 'Shift':
            options.shiftActive = false;
            break;
        default:
            break;
    }

    $setState(options);

    return;
};


/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const CellDrag = __webpack_require__(10);
const CommonHandler = __webpack_require__(4);
const { $setState } = __webpack_require__(0);

module.exports = (state, e) => {

    const dragEnd = state.endCellRect.id ? state.endCellRect : state.startCellRect;

    const { row, column } = CommonHandler.getNewCellIdFromKeydown(dragEnd, e.key);

    const cell = state.allCells[`r${row}.c${column}`];

    $setState({ cellDrag: true });
    CellDrag(state, cell);
    CommonHandler.handleCellDragEnd(state);
};


/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const { $setState } = __webpack_require__(0);
const CommonHandler = __webpack_require__(4);

module.exports = (state) => {

    if (state.cellDrag) {
        CommonHandler.handleCellDragEnd(state);
    }

    $setState({
        mousedown: false,
        colDrag: false,
        rowDrag: false
    });

    return;
};


/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const CellCommon = __webpack_require__(2);
const CommonHandler = __webpack_require__(4);


module.exports = (state, e) => {

    const activeElement = state.startCellRect;
    if (!activeElement) return;

    const { row, column } = CommonHandler.getNewCellIdFromKeydown(activeElement, e.key);

    const cell = state.allCells[`r${row}.c${column}`];
    CellCommon.newSelectedCell(state, cell);

    CommonHandler.scrollToNewCell(cell);


    // const cellTop = cell.div.offsetTop;
    // const cellBottom = cellTop + cell.div.offsetHeight;
    // const cellLeft = cell.div.offsetLeft;
    // const cellRight = cellLeft + cell.div.offsetWidth;

    // const windowTop = window.pageYOffset;
    // const windowBottom = windowTop + window.innerHeight;
    // const windowLeft = window.pageXOffset;
    // const windowRight = window.pageXOffset + window.innerWidth;


    // if (cellTop - 140 < windowTop) {
    //     window.scrollTo(windowLeft, cellTop - 140);
    // }
    // if (cellBottom > windowBottom) {
    //     window.scrollTo(windowLeft, cellBottom - window.innerHeight);
    // }

    // if (cellLeft - 80 < windowLeft) {
    //     window.scrollTo(cellLeft - 80, windowTop);
    // }
    // if (cellRight > windowRight) {
    //     window.scrollTo(cellRight - window.innerWidth, windowTop)
    // }

    return;
};


/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const { TOOLBAR_HEIGHT, COLUMN_HEADER_HEIGHT, ROW_HEADER_WIDTH } = __webpack_require__(1);
const CellStateUpdate = __webpack_require__(3);
const Common = __webpack_require__(6);
const DraggableDiv = __webpack_require__(9);
const { $updateElementStyle, $updateCell } = __webpack_require__(0);


module.exports = (state, e, type) => {

    DraggableDiv.hideDraggableDiv();
    CellStateUpdate.deactivateAllCells(state);

    let marker;
    let mousePosition;
    let headerArray;
    let prop;
    let offset;
    if (type === 'row') {
        marker = state.rowDrag;
        mousePosition = e.clientY + window.scrollY;
        headerArray = state.rowHeaders;
        prop = 'height';
        offset = TOOLBAR_HEIGHT + COLUMN_HEADER_HEIGHT;
    }
    else if (type === 'column') {
        marker = state.colDrag;
        mousePosition = e.clientX + window.scrollX;
        headerArray = state.columnHeaders;
        prop = 'width';
        offset = ROW_HEADER_WIDTH;
    }
    else {
        console.error('ERROR handleResizeRowColumn, type = ', type); // eslint-disable-line
    }

    const i = +marker;
    const headerToMove = headerArray[i - 1];

    const position = headerArray.slice(0, i).reduce((a, b) => a += Common.translatePxToNum(b.div.style[prop]), offset);
    const movement = mousePosition - position;

    if (type === 'column' && Common.translatePxToNum(headerToMove.div.style[prop]) <= 50 && movement < 0) return;
    if (type === 'row' && Common.translatePxToNum(headerToMove.div.style[prop]) <= 25 && movement < 0) return;

    const headerChange = Common.getNewHeightWidth(headerToMove.div, movement, prop);
    $updateElementStyle(headerToMove.div, headerChange);

    const containerChange = Common.getNewHeightWidth(state.spreadsheetContainer, movement, prop);
    $updateElementStyle(state.spreadsheetContainer, containerChange);

    const headerContainerEl = document.getElementById(`${type}-header-div`);
    const headerContainerChange = Common.getNewHeightWidth(headerContainerEl, movement, prop);
    $updateElementStyle(headerContainerEl, headerContainerChange);

    const cells = Object.keys(state.allCells).filter((c) => {

        const cell = state.allCells[c];
        return cell[type] === marker - 1;
    });
    cells.forEach((c) => {

        const cell = state.allCells[c];
        const cellChange = Common.getNewHeightWidth(cell.div, movement, prop);
        $updateCell(cell, { divStyle: cellChange });
    });
    return;
};


/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const { TOOLBAR_HEIGHT, COLUMN_HEADER_HEIGHT, ROW_HEADER_WIDTH } = __webpack_require__(1);
const { $updateElementStyle } = __webpack_require__(0);

module.exports = (state) => {

    const columnHeaderDiv = state.columnHeaderDiv;
    $updateElementStyle(columnHeaderDiv, { left: -window.scrollX + ROW_HEADER_WIDTH + 'px' });

    const rowHeaderDiv = state.rowHeaderDiv;
    $updateElementStyle(rowHeaderDiv, { top: -window.scrollY + TOOLBAR_HEIGHT + COLUMN_HEADER_HEIGHT + 'px' });

    return;
};


// to do get these items from state so that i am not accessing the dom this deep

/***/ })
/******/ ]);