import { KEYS, KEYS_COMMON } from './keys-template.js';

const KEY_SIZE = 50;
const pressedKeys = new Set();
const SPECIAL_KEYS = ['Tab', 'Delete', 'Backspace', 'ShiftLeft', 'ShiftRight', 'AltLeft', 'AltRight', 'MetaLeft',
  'ControlLeft', 'ControlRight', 'Escape', 'Enter', 'CapsLock',
  'ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft', 'Space'];

let CAPS = false;
let SHIFT = false;
let LANG = 'en';
let INPUT;

const saveState = () => {
  sessionStorage.setItem('keyboard-lang', LANG);
};

const restoreState = () => {
  LANG = (sessionStorage.getItem('keyboard-lang')) ? sessionStorage.getItem('keyboard-lang') : 'en';
};

const generateCommonKeyInnerHtml = (keyValue, keyAltValue) => `<pre>${keyAltValue}<br>  ${keyValue.toUpperCase()}</pre>`;

const switchKey = (lang, keyId) => {
  if (lang === 'en') return generateCommonKeyInnerHtml(KEYS_COMMON[keyId].val, KEYS_COMMON[keyId].alt);

  return generateCommonKeyInnerHtml(KEYS_COMMON[keyId].val2, KEYS_COMMON[keyId].alt2);
};

const switchKeysLang = (lang) => {
  const keys = document.querySelectorAll('.key-common');

  keys.forEach((key) => {
    const element = key;
    element.innerHTML = switchKey(lang, key.id);
  });
};

const switchLang = () => {
  LANG = (LANG === 'en' ? 'ru' : 'en');
  saveState();
  switchKeysLang(LANG);
};

const getKeyValue = (keyId) => {
  const key = document.querySelector(`#${keyId} pre`);
  let result = '';

  if (!key) return null;
  if (SHIFT && keyId.slice(0, 3) !== 'key') result = document.querySelector(`#${keyId} pre`).innerText.slice(0, 1);
  else result = document.querySelector(`#${keyId} pre`).innerText.slice(-1);
  return result;
};

const skipKeyCode = (keyCode) => (keyCode < 96 || keyCode > 154);

const movePositionUp = (cursorPosition) => {
  let newPosition = cursorPosition;
  let postLinesLenght = 0;
  const lines = INPUT.value.split('\n');
  let cursorLineOffset = 0;

  if (lines.length === 1) {
    return 0;
  }

  postLinesLenght = lines[0].length + 1;

  for (let i = 1; i < lines.length; i += 1) {
    if (postLinesLenght + lines[i].length >= cursorPosition) {
      cursorLineOffset = cursorPosition - postLinesLenght;
      if (lines[i - 1].length < cursorLineOffset) {
        newPosition = postLinesLenght - 1;
      } else newPosition = cursorPosition - lines[i - 1].length - 1;
      break;
    } else {
      postLinesLenght += lines[i].length + 1;
    }
  }
  if (newPosition === cursorPosition) {
    newPosition = cursorPosition - lines[lines.length - 1].length - 1;
  }
  if (newPosition < 0) newPosition = 0;

  return newPosition;
};

const pressedSpecialKey = (keyId) => {
  let cursorPosition = INPUT.selectionStart;
  const cursorPositionEnd = INPUT.selectionEnd;
  const beforeText = INPUT.value.slice(0, cursorPosition);
  const afterText = INPUT.value.slice(cursorPosition);
  const key = document.getElementById(keyId);

  switch (keyId) {
    case 'space':
      INPUT.value = `${INPUT.value.slice(0, cursorPosition)} ${INPUT.value.slice(cursorPositionEnd)}`;
      cursorPosition += 1;
      break;
    case 'capslock':
      CAPS = !CAPS;
      break;
    case 'tab':
      INPUT.value = `${beforeText}\t${afterText}`;
      cursorPosition += 1;
      break;
    case 'backspace':
      if (cursorPositionEnd > cursorPosition) {
        INPUT.value = INPUT.value.slice(0, cursorPosition) + INPUT.value.slice(cursorPositionEnd);
      } else {
        INPUT.value = beforeText.slice(0, -1) + afterText;
        cursorPosition -= 1;
      }
      break;
    case 'enter':
      INPUT.value = `${beforeText}\n${afterText}`;
      cursorPosition += 1;
      break;
    case 'delete':
      if (cursorPositionEnd > cursorPosition) {
        INPUT.value = INPUT.value.slice(0, cursorPosition) + INPUT.value.slice(cursorPositionEnd);
      } else INPUT.value = `${beforeText}${afterText.slice(1)}`;
      break;
    case 'arrowup':
      cursorPosition = movePositionUp(cursorPosition);
      break;
    case 'arrowleft':
      cursorPosition = cursorPosition > 0 ? cursorPosition - 1 : 0;
      break;
    case 'arrowdown':
    case 'arrowright':
      cursorPosition += 1;
      break;
    case 'metaleft':
      switchLang();
      break;
    default:
      key.classList.add('key_selected');
      break;
  }
  INPUT.focus();
  INPUT.selectionStart = cursorPosition;
  INPUT.selectionEnd = cursorPosition;
};

const pressedCommonKey = (keyId, keyValue) => {
  const cursorPosition = INPUT.selectionStart;
  const beforeText = INPUT.value.slice(0, cursorPosition);
  const efterText = INPUT.value.slice(cursorPosition);

  if (CAPS !== SHIFT) INPUT.value = beforeText + keyValue.toUpperCase() + efterText;
  else INPUT.value = beforeText + keyValue.toLowerCase() + efterText;

  INPUT.focus();
  INPUT.selectionStart = cursorPosition + 1;
  INPUT.selectionEnd = cursorPosition + 1;
};

const selectKey = (keyId) => {
  const key = document.getElementById(keyId);
  if (key) {
    switch (keyId) {
      case 'capslock':
        if (CAPS) key.classList.add('key_selected');
        break;
      default:
        key.classList.add('key_selected');
        break;
    }
  }
};

const pressKey = (keyId) => {
  const key = document.getElementById(keyId);
  if (key) key.classList.add('key_pressed');
};

const unpressKey = (keyId) => {
  const key = document.getElementById(keyId);
  if (key) key.classList.remove('key_pressed');
};

const unselectKey = (keyId) => {
  const key = document.getElementById(keyId);
  if (key) {
    switch (keyId) {
      case 'capslock':
        if (!CAPS) key.classList.remove('key_selected');
        break;
      default:
        key.classList.remove('key_selected');
        break;
    }
  }
};

const onKeyUp = (event) => {
  const { code, keyCode } = event;
  const keyId = code.toLowerCase();

  if (skipKeyCode(keyCode)) event.preventDefault();

  unselectKey(keyId);
  unpressKey(keyId);

  if (keyId === 'shiftleft' || keyId === 'shiftright') {
    SHIFT = false;
    pressedKeys.delete(keyId.slice(0, 5));
  }
  if (keyId === 'controlleft' || keyId === 'controlright') pressedKeys.delete(keyId.slice(0, 7));
};

const onKeyDown = (event) => {
  const { code, keyCode } = event;
  const keyId = code.toLowerCase();
  const keyValue = getKeyValue(keyId);

  if (skipKeyCode(keyCode)) event.preventDefault();

  if (event.repeat && skipKeyCode(keyCode)) {
    if (!SPECIAL_KEYS.includes(code)) pressedCommonKey(keyId, keyValue);
    else pressedSpecialKey(keyId);
  } else
  if (!SPECIAL_KEYS.includes(code)) pressedCommonKey(keyId, keyValue);
  else pressedSpecialKey(keyId);

  if (keyId === 'shiftleft' || keyId === 'shiftright') {
    SHIFT = true;
    pressedKeys.add(keyId.slice(0, 5));
  }
  if (keyId === 'controlleft' || keyId === 'controlright') pressedKeys.add(keyId.slice(0, 7));

  if (pressedKeys.has('control') && pressedKeys.has('shift')) {
    switchLang();
  }
  selectKey(keyId);
  pressKey(keyId);
};

const onMouseUp = (event) => {
  const keyId = event.target.closest('div').id;
  if (keyId !== 'keyboard') {
    unselectKey(keyId);
    unpressKey(keyId);
  }

  if (keyId === 'shiftleft' || keyId === 'shiftright') SHIFT = false;
};

const onMouseDown = (event) => {
  const keyId = event.target.closest('div').id;
  if (keyId !== 'keyboard') {
    selectKey(keyId);
    pressKey(keyId);
    if (keyId === 'shiftleft' || keyId === 'shiftright') SHIFT = true;
  }
};

const onMouseOut = (event) => {
  if (event.fromElement && event.toElement && event.fromElement.id && event.toElement.id) {
    if (event.target.closest('div').id !== 'capslock') unselectKey(event.target.closest('div').id);
  }
};

const onClick = (event) => {
  const elementId = event.target.closest('div').id;
  const elementType = event.target.closest('div').getAttribute('keyType');

  if (elementId !== 'keyboard') {
    if (elementType === 'common') {
      pressedCommonKey(elementId, getKeyValue(elementId));
    }
    if (elementType === 'special') pressedSpecialKey(elementId);
    if (CAPS) selectKey(elementId);
    else unselectKey(elementId);
  }
};

const createBase = () => {
  const inputBase = document.createElement('textarea');
  const keyboardBase = document.createElement('div');

  inputBase.classList.add('input-field');
  keyboardBase.classList.add('keyboard-wrapper');
  keyboardBase.id = 'keyboard';

  document.body.append(inputBase);
  document.body.append(keyboardBase);

  INPUT = document.querySelector('.input-field');
  document.addEventListener('keyup', onKeyUp);
  document.addEventListener('keydown', onKeyDown);
  const keyboard = document.getElementById('keyboard');
  keyboard.addEventListener('click', onClick);
  keyboard.addEventListener('mousedown', onMouseDown);
  keyboard.addEventListener('mouseup', onMouseUp);
  keyboard.addEventListener('mouseout', onMouseOut);
};

const createKey = (key) => {
  const elem = document.createElement('div');
  const keySize = key.size ? key.size : 1;
  const keyType = key.type ? key.type : 'common';

  elem.classList.add('key');
  elem.style.height = `${KEY_SIZE}px`;
  elem.style.width = `${KEY_SIZE * keySize}px`;
  elem.setAttribute('keyType', keyType);

  if (keyType === 'common') {
    elem.classList.add('key-common');
    elem.innerHTML = switchKey(LANG, key.id);
  } else if (key.id !== 'lang') elem.innerHTML = `<span>${key.val}</span>`;
  else elem.innerHTML = `<span>${LANG}</span>`;

  elem.id = key.id;

  document.getElementById('keyboard').append(elem);
};

const createKeys = (keys) => {
  keys.forEach((key) => {
    createKey(key);
  });
};

window.onload = () => {
  restoreState();
  createBase();
  createKeys(KEYS);
};
