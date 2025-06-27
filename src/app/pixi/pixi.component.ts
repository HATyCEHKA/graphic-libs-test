import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef, Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {Application, Assets, Container, Graphics, Text, TextStyle, Ticker} from 'pixi.js';
import {
  canvasHeight,
  canvasWidth, correctPixels, fill, fontSize, getColor,
  getCoordinates, isCreateGroup, isSvg,
  rotationAngle,
  spacing,
  squareSize,
  squaresPerRow, stroke, useRandomColors
} from '../util/coord.util';

@Component({
  selector: 'pixi',
  templateUrl: './pixi.component.html',
  standalone: true,
  imports: [CommonModule],
})
export class PixiComponent implements OnInit, OnDestroy {
  @Input()
  isAntialias:boolean = false;
  @Input()
  svgFilePath:string = '';

  @ViewChild('redactor', { static: true })
  protected redactor!: ElementRef;
  app: Application | undefined;
  protected isAnimation = false;
  private rects: Container[] = [];
  private animateTicker: Ticker | null = null;

  async ngOnInit() {
    this.app = new Application();
    await this.app.init({
        width: canvasWidth,
        height: canvasHeight,
        background: '#ffffff',
        //preference: 'webgpu',
        //preference: 'webgl',
        antialias: this.isAntialias,
        //autoDensity: true,
        powerPreference: 'high-performance',
        //powerPreference: 'low-power',
        //resolution: 1, //лучше не трогать, появляются тормоза и никаких улучшений
        //useBackBuffer: true
      });
    this.redactor.nativeElement.appendChild(this.app!.canvas);
  }

  ngOnDestroy(): void {
    this.app!.stage.destroy();
    this.app!.destroy();
    Assets.cache.reset();
  }

  protected async createScene(count: number) {
    let t = Date.now();
    console.log("=========================")
    console.log("1 of 5. Start creating...");

    if(this.rects.length > 0) {

      this.app!.stage.removeChildren().forEach((ch) => ch.destroy());
      this.rects=[];
      this.app!.render();
    }
    const rects = await this.createObjects(count);
    this.app!.stage.addChild(...rects);
    this.app!.render();
    console.log("5 of 5. Finish creating!", (Date.now()-t)/ 1000 + "sec");
  }

  protected changeAnimation(): void {
    this.isAnimation = !this.isAnimation;
    if(this.isAnimation){
      if(!this.animateTicker)
        this.animateTicker = this.animateObjects();
      else
        this.animateTicker.start();
    }
    else
      this.animateTicker?.stop();
  }

  protected setZoom(zoom: number) {
    this.app!.stage.scale.set(zoom);
    this.app!.render();
  }

  private async createObjects(count: number = 1000): Promise<Container[]> {
    if(isSvg) {
      const promises: Promise<any>[] = [];

      for (let i = 0; i < count; i++) {
        promises.push(Assets.load({src: this.svgFilePath, data: {parseAsGraphicsContext: true, resolution: 5 }}));
      }

      console.log("2 of 5. Created all loadSVG promises");

      await Promise.all(promises).then((results) => {
        console.log("3 of 5. Finished all loadSVG promises");
        for (let i = 0; i < count; i++) {
          const rect = new Graphics(results[i]);
          this.setPropsAndAdd(rect, i);
        }
      });
    }
    else {
      for (let i = 0; i < count; i++) {
        if(!isCreateGroup) {
          let rect =  (i % 2 === 0) ?
            new Graphics().rect(0, 0, squareSize-1, squareSize-1).stroke({width:1, color: stroke/*, pixelLine: true*/}).fill(useRandomColors? getColor(i) : fill) :
            new Text({text: 'Text', style: new TextStyle({fill: stroke, fontSize: fontSize, fontFamily: 'arial'})});
          this.setPropsAndAdd(rect, i);
        }
        else {
          let rect = new Graphics().rect(0, 0, squareSize, squareSize).stroke({
            width: 1,
            color: stroke/*, pixelLine: true*/
          }).fill(useRandomColors? getColor(i) : fill);
          let text = new Text({
            text: 'Text',
            style: new TextStyle({fill: stroke, fontSize: fontSize, fontFamily: 'arial'})
          });
          let scale = Math.min(squareSize / text.width / 1.5, squareSize / text.height / 1.5);

          text.scale.set(scale);
          text.position.set((squareSize - text.width) / 2 , (squareSize - text.height - 2) / 2);

          let group = new Container();
          group.addChild(rect);
          group.addChild(text);
          this.setPropsAndAdd(group, i);
        }
      }
    }
    console.log("4 of 5. Created all objects");

    return this.rects;
  }

  private setPropsAndAdd(rect: Container, i: number) {
    let c = getCoordinates(i, squaresPerRow, squareSize, spacing);
    let sizeDiff = isCreateGroup ? 1: 0;
    let scale = Math.min(squareSize / (rect.width - sizeDiff), squareSize / (rect.height - sizeDiff));
    //console.log("Size: ", rect.width, "; Scale: ", scale);
    rect.pivot.set(rect.width / 2, rect.height / 2);
    if(Math.abs(scale - 1) > 0.2)
      rect.scale.set(scale);

    let posDiff = correctPixels? 0.5 : 0;
    rect.position.set(c.x + (squareSize - sizeDiff) / 2 + spacing + posDiff, c.y + (squareSize - sizeDiff) / 2 + spacing + posDiff);

    this.rects.push(rect);
  }

  private  animateObjects(): Ticker {
    return this.app!.ticker.add(()=> {
      this.rects.forEach((rect) => {
        rect.angle = (rect.angle + rotationAngle) % 360;
      });
    });
  }
}
