export function getCoordinates(
  index: number,
  squaresPerRow: number,
  squareSize: number,
  spacing: number
) {
  // Вычисляем координату X: остаток от деления определяет позицию в ряду
  const x = (index % squaresPerRow) * (squareSize + spacing);
  // Вычисляем координату Y: целая часть от деления определяет номер строки
  const y = Math.floor(index / squaresPerRow) * (squareSize + spacing);
  return { x, y };
}

export const squareSize = 50;
export const spacing = 5;
export const canvasWidth = 2500;
export const squaresPerRow = Math.round(canvasWidth/(squareSize +spacing));
export const canvasHeight = Math.min((squareSize +spacing)*(10000/squaresPerRow), 8000);

let rotationAngle = 5;
export {rotationAngle};
export function setRotationAngle(value: number) {
  rotationAngle = value;
}

let isSvg = true;
export {isSvg};
export function setIsSvg(value: boolean) {
  isSvg = value;
}

export const svgFilePath = 'assets/fan.svg';
