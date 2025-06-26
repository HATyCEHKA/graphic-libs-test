import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef, inject, Input,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import {Svg, Rect, SVG, Runner, Point, Element} from '@svgdotjs/svg.js';
import '@svgdotjs/svg.panzoom.js'
import {
  canvasHeight,
  canvasWidth, fill, fontSize, getColor,
  getCoordinates,
  isSvg,
  rotationAngle,
  spacing,
  squareSize,
  squaresPerRow, stroke, useRandomColors,
} from '../util/coord.util';
import {firstValueFrom} from "rxjs";
import {HttpClient} from "@angular/common/http";

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'svg-js',
  templateUrl: './svgjs.component.html',
})
export class SvgJsComponent implements AfterViewInit, OnDestroy {
  @Input()
  svgFilePath:string = '';

  @ViewChild('redactor')
  protected redactor!: ElementRef;
  protected canva: Svg | undefined;
  protected isAnimation = false;
  private animations: Runner[] = [];
  private rects: Element[] = [];
  private httpClient = inject(HttpClient);

  ngAfterViewInit(): void {
    this.canva = SVG().addTo(this.redactor.nativeElement).size(canvasWidth, canvasHeight).viewbox(0,0, canvasWidth, canvasHeight).panZoom({panning: false});
  }

  ngOnDestroy(): void {
    this.clearCanva();
  }

  protected async createScene(count: number) {
    let t = Date.now();
    console.log("=========================")
    console.log("1 of 5. Start creating...");
    if(this.rects.length)
      this.clearCanva();

    let rects = await this.createObjects(count);
    console.log("5 of 5. Finish creating!", (Date.now()-t)/ 1000 + "sec");

    if(this.isAnimation){
      this.changeAnimation();
      this.changeAnimation();
    }
  }

  protected changeAnimation(){
     this.isAnimation = !this.isAnimation;
     if(this.isAnimation)
       this.animateObjects(this.rects);
     else
       this.clearAnimations();
  }

  protected setZoom(zoom: number) {
    this.canva!.zoom(zoom, new Point(0,0));
  }

  private async createObjects(count: number): Promise<Element[]> {
    if(isSvg) {
      let svgContent = await firstValueFrom<string>(this.httpClient.get(this.svgFilePath, {responseType: 'text'}));
      for (let i = 0; i < count; i++) {
        let rect  = this.canva!.group().svg(svgContent);
        this.setPropsAndAdd(rect, i);
      }
    }
    else{
      for (let i = 0; i < count; i++) {
        let rect =  (i % 2 === 0) ?
          this.canva!.rect(squareSize, squareSize).stroke(stroke).fill(useRandomColors? getColor(i) : fill) :
          this.canva!.text('Text').font({fontSize: fontSize, family: 'arial'}).fill(stroke);
        this.setPropsAndAdd(rect, i);
      }
    }
    console.log("4 of 5. Created all objects");
    return this.rects;
  }

  private setPropsAndAdd(rect: Element, i: number) {
    let c = getCoordinates(i, squaresPerRow, squareSize, spacing);
    let box = rect.bbox();
    let scale = Math.min(squareSize / box.width, squareSize / box.height);
    //console.log("Size: ", box.width, "; Scale: ", scale);
    rect.move(c.x + spacing, c.y + spacing);
    if(scale!==1)
      rect.scale(scale, scale, c.x + spacing, c.y + spacing);
    this.rects.push(rect);
  }

  private animateObjects(rects: Element[]): void {
    rects.forEach((rect) => {
      const animation = rect.animate({
        duration: 10000/rotationAngle,
        delay: 0,
        when: 'now',
        swing: true,
        times: 1,
        wait: 0
      }).ease('-').rotate(360).loop(); // Сохраняем анимацию
      this.animations.push(animation); // Добавляем анимацию в массив
    });
  }

  private clearAnimations(){
    this.animations.forEach((animation) => animation.finish());
    this.animations = [];
  }

  private clearCanva(): void {
    this.clearAnimations();

    this.rects.forEach((rect) => rect.remove());
    this.rects = [];

    if (this.canva) {
      this.canva.clear();
    }
  }
}
