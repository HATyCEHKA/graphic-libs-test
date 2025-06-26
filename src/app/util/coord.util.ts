export function getCoordinates(
  index: number,
  squaresPerRow: number,
  squareSize: number,
  spacing: number
) {
  // Вычисляем координату X: остаток от деления определяет позицию в ряду
  let x = (index % squaresPerRow) * (squareSize + spacing);
  // Вычисляем координату Y: целая часть от деления определяет номер строки
  const rowsPerHeight = Math.round(canvasHeight / (squareSize + spacing))
  const rowNumber = Math.floor(index / squaresPerRow);

  let dif = Math.floor(rowNumber/rowsPerHeight) * spacing;
  let y = (rowNumber % rowsPerHeight) * (squareSize + spacing) + dif;
  x = x + dif;

  return { x, y };
}

export const canvasWidth = 2500;
export const canvasHeight = 1140;

export const squareSize = 50;
export const spacing = 5;

export const squaresPerRow = Math.round(canvasWidth/(squareSize +spacing));
//export const canvasHeight = Math.min((squareSize +spacing)*(10000/squaresPerRow), 8000);


let rotationAngle = 5;
export {rotationAngle};
export function setRotationAngle(value: number) {
  rotationAngle = value;
}

let isSvg = false;
export {isSvg,};
export function setIsSvg(value: boolean) {
  isSvg = value;
}

let useRandomColors = true;
export {useRandomColors,};
export function setUseRandomColors(value: boolean) {
  useRandomColors = value;
}

export const isCreateGroup = true;
export const svgFilePath_gradient = 'assets/fan_old.svg';
export const svgFilePath = 'assets/fan.svg';
export const stroke='#951f1f';
export const fill='transparent';
export const fontSize = 20;

export function getColor(index: number){
  let max = Math.round(500/squaresPerRow) * squaresPerRow;
  let v = index % max;
  let tt = index / 10;
  return `hsl(${tt}, 100%, ${(1-v/max) * 100*0.7 + 15}%, 0.4)`
}
