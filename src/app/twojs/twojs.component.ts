import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef, Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  canvasHeight,
  canvasWidth, fill, fontSize,
  getCoordinates, isSvg,
  rotationAngle,
  spacing,
  squareSize,
  squaresPerRow, stroke, isCreateGroup, getColor, useRandomColors, correctPixels
} from '../util/coord.util';

import Two from 'two.js';
import {Shape} from "two.js/src/shape";
import {Group} from "two.js/src/group";
import {ZUI} from "two.js/extras/jsm/zui";

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'two-js',
  templateUrl: './twojs.component.html',
})
export class TwojsComponent implements OnInit, OnDestroy {
  @Input()
  svgFilePath:string = '';

  @Input()
  useWebGl:boolean = false;

  @ViewChild('redactor', { static: true })
  protected redactor!: ElementRef;
  protected isAnimation = false;
  private rects: Shape[] = [];
  private animationFrameId:number = 0;

  private two: Two | undefined;
  private zui:ZUI | undefined;

  async ngOnInit() {
    this.two = new Two({
      fullscreen: false,
      autostart: false,
      width: canvasWidth,
      height: canvasHeight,
      //type:Two.Types.svg
      //type:Two.Types.webgl
      //type:Two.Types.canvas
      type: this.useWebGl? Two.Types.webgl : Two.Types.canvas
    }).appendTo(this.redactor.nativeElement);

    this.zui = new ZUI(this.two.scene);
    this.zui.addLimits(0.06, 8);
  }

  ngOnDestroy(): void {
    this.clearAnimations();
  }

  protected async createScene(count: number) {
    let t = Date.now();
    console.log("=========================")
    console.log("1 of 5. Start creating...");
    if(this.rects.length) {
      this.two?.clear();

      this.rects=[];
    }

    await this.createObjects(count);
    this.two?.update();
    console.log("5 of 5. Finish creating!", (Date.now()-t)/ 1000 + "sec");

    if(this.isAnimation){
      this.changeAnimation();
      this.changeAnimation();
    }
  }

  protected changeAnimation(){
    this.isAnimation = !this.isAnimation;
    if(this.isAnimation){
      this.animateObjects(this.rects);
    }
    else
      this.clearAnimations();
  }

  protected setZoom(zoom: number) {
    this.zui!.zoomSet(zoom, spacing, spacing);
    this.two!.update();
  }

  private async createObjects(count: number): Promise<Shape[]> {
    if(isSvg) {
      if(count>10000) return [];
      return new Promise<Array<Shape>>((resolve) => {
        this.two!.load(this.svgFilePath, (svg_original: Group) => {
          svg_original.center();

          for (let i = 0; i < count; i++) {
            let svg = svg_original.clone();
            this.setPropsAndAdd(svg, i);
          }

          console.log("4 of 5. Created all objects");
          resolve(this.rects);
        });
      });
    }
    else{
      for (let i = 0; i < count; i++) {
        if (!isCreateGroup) {
          let shape: Shape;
          if(i % 2 === 0){
            let rect =  new Two.Rectangle(0, 0, squareSize, squareSize);
            rect.stroke = stroke;
            rect.fill = useRandomColors? getColor(i) : fill;
            rect.linewidth = 1;
            shape = rect;
          }
          else{
            let text = new Two.Text('Text');
            text.family = 'Arial';
            text.size = fontSize;
            text.fill = stroke;
            shape = text;
          }
          this.setPropsAndAdd(shape, i);
        } else {
          let group = new Two.Group();
          let rect = new Two.Rectangle(0, 0, squareSize, squareSize);
          rect.stroke = stroke;
          rect.fill = useRandomColors? getColor(i) : fill;
          rect.linewidth = 1;
          let text = new Two.Text('Text');
          text.family = 'Arial';
          text.size = fontSize;
          text.fill = stroke;
          let box = text.getBoundingClientRect();
          text.scale = Math.min(squareSize / (box.width - 1) / 1.5, squareSize / (box.height - 1) / 1.5);
          group.add(rect, text);
          this.setPropsAndAdd(group, i);
        }
      }
      console.log("4 of 5. Created all objects");
    }
    return this.rects;
  }

  private setPropsAndAdd(rect: Shape, i: number) {
    let c = getCoordinates(i, squaresPerRow, squareSize, spacing);
    let box = (rect as any).getBoundingClientRect();
    let sizeDiff = isCreateGroup ? 1: 0;
    let scale = Math.min(squareSize / (box.width - sizeDiff), squareSize / (box.height - sizeDiff));
    //console.log("Size: ", box, "; Scale: ", scale);
    let posDiff = correctPixels && !this.useWebGl? 0.5 : 0;
    rect.position.set(c.x + squareSize / 2 + spacing - posDiff, c.y + squareSize / 2 + spacing - posDiff);
    if(Math.abs(scale - 1) > 0.2)
      rect.scale = scale;

    this.two!.add(rect);
    this.rects.push(rect);
  }

  private animateObjects(rects: Shape[]): void {
    const changeAngle = () => {
      rects.forEach((rect) => {
        rect.rotation = (rect.rotation + rotationAngle*Math.PI/180) % 360;
      });
      this.two!.update();
      this.animationFrameId = requestAnimationFrame(changeAngle);
    };

    this.animationFrameId = requestAnimationFrame(changeAngle);
  }

  private clearAnimations(){
    cancelAnimationFrame(this.animationFrameId);
  }
}
