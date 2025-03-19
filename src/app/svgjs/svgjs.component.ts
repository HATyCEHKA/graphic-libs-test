import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Svg, Rect, SVG, Runner } from '@svgdotjs/svg.js';
import { getCoordinates } from '../util/coord.util';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'svg-js',
  templateUrl: './svgjs.component.html',
})
export class SvgJsComponent implements AfterViewInit, OnDestroy {
  @ViewChild('redactor')
  protected redactor!: ElementRef;

  protected canva: Svg | undefined;
  private animations: Runner[] = [];
  private rects: Rect[] = [];

  ngAfterViewInit(): void {
    this.createSvgJs();
  }

  createSvgJs() {
    this.canva = SVG().addTo(this.redactor.nativeElement).size(1000, 10000);
    if (this.canva) {
      this.animateAllRects(this.createManyRect());
    }
  }

  private createManyRect(count: number = 1000): Rect[] {
    const rects: Rect[] = [];
    const squareSize = 10;
    const spacing = 5;
    const squaresPerRow = 50;

    for (let i = 0; i < count; i++) {
      const { x, y } = getCoordinates(i, squaresPerRow, squareSize, spacing);

      // Создаём квадрат с заданными размерами, цветом и позицией
      const rect = this.canva!.rect(squareSize, squareSize)
        .fill('#3498db')
        .move(x, y);
      rects.push(rect);
    }
    return rects;
  }

  private animateAllRects(rects: Rect[]): void {
    rects.forEach((rect) => {
      const animation = rect.animate().rotate(360).loop(); // Сохраняем анимацию
      this.animations.push(animation); // Добавляем анимацию в массив
    });
  }

  createAnimations(count: number) {
    this.clearCanva(); // Очищаем холст перед созданием новых анимаций
    this.animateAllRects(this.createManyRect(count));
  }

  private clearCanva(): void {
    this.animations.forEach((animation) => animation.finish());
    this.animations = [];

    this.rects.forEach((rect) => rect.remove());
    this.rects = [];

    if (this.canva) {
      this.canva.clear();
    }
  }

  ngOnDestroy(): void {
    this.clearCanva();
  }
}
