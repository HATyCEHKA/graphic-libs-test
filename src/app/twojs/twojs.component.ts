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
  squaresPerRow, stroke
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
      type:Two.Types.canvas
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

    let rects = await this.createObjects(count);
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
    this.zui!.zoomSet(zoom, 0, 0);
    this.two!.update();
  }

  private async createObjects(count: number): Promise<Shape[]> {
    if(isSvg) {
      if(count>10000) return [];
      return new Promise<Array<Shape>>((resolve) => {
        let createdCount = 0;
        for (let i = 0; i < count; i++) {
          this.two!.load(this.svgFilePath, (svg: Group) => {
            svg.center(); // I center the object's shapes
            this.setPropsAndAdd(svg, i);
            createdCount++;

            if (createdCount >= count - 1) {
              console.log("4 of 5. Created all objects");
              resolve(this.rects);
            }
          });
        }
      });
    }
    else{
      for (let i = 0; i < count; i++) {
        let shape: Shape;
        if(i % 2 === 0){
          let rect =  new Two.Rectangle(0, 0, squareSize, squareSize);
          rect.stroke = stroke;
          rect.fill = fill;
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

        // let group = new Two.Group();
        // let rect = new Two.Rectangle(0, 0, squareSize, squareSize);
        // rect.stroke = stroke;
        // rect.fill = fill;
        // let text = new Two.Text('Text');
        // text.family = 'Arial';
        // text.size = fontSize;
        // text.fill = stroke;
        // let box = (text as any).getBoundingClientRect();
        // let scale = Math.min(squareSize / box.width, squareSize / box.height);
        // text.scale = scale;
        // group.add(rect, text);
        // this.setPropsAndAdd(group, i);
      }
      console.log("4 of 5. Created all objects");
    }
    return this.rects;
  }

  private setPropsAndAdd(rect: Shape, i: number) {
    let c = getCoordinates(i, squaresPerRow, squareSize, spacing);
    let box = (rect as any).getBoundingClientRect();
    let scale = Math.min(squareSize / box.width, squareSize / box.height);
    //console.log("Size: ", box, "; Scale: ", scale);
    rect.position.set(c.x + squareSize / 2 + spacing, c.y + squareSize / 2 + spacing);
    if(Math.abs(scale - 1) > 0.3)
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
