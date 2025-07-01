import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef, Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  Application,
  Assets,
  Container,
  Graphics,
  Text,
  TextStyle,
  Ticker,
  BitmapText,
  AbstractText, Matrix, ObservablePoint, PointData, TextOptions
} from 'pixi.js';
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
  bitmapText:boolean = false;
  @Input()
  calcFontSize:boolean = false;
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
        antialias: true,
        autoDensity: true,
        powerPreference: 'high-performance',
        //powerPreference: 'low-power',
        //resolution: 1, //лучше не трогать, появляются тормоза и никаких улучшений
        resolution: this.bitmapText? 2 : 1,//Увеличивает четкость текста, но очень сказывается на производительности. Выставление именно у текста не помогает
        //useBackBuffer: true,
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
        const createText = (): AbstractText=>{
          let text:AbstractText;

          if(this.bitmapText) {
            text = new BitmapText({text: 'Text', style: {fontFamily: 'arial', fill: stroke, fontSize: fontSize * 10}});

            //увеличивает время создания до 24сек на 100тыс
            // BitmapFont.install({
            //   name: 'my', style: {fontFamily: 'arial', fill: stroke, fontSize: fontSize * fontEncrease}, resolution: 1,
            //   textureStyle: {
            //     scaleMode: 'linear',
            //   }
            // });
            //text = new BitmapText({text: 'Text', style: {fontFamily: 'my'}});

            // //увеличивает время создания до 50сек на 100тыс
            // text = new HTMLText({
            //   text: 'Text',
            //   style: new TextStyle({fill: stroke, fontSize: fontSize, fontFamily: 'arial'}),
            //   roundPixels: false,
            //   textureStyle: {
            //     scaleMode: 'linear',
            //   }
            // });
          }
          else {
            let textOpts = {
              text: 'Text',
              style: new TextStyle({fill: stroke, fontSize: fontSize, fontFamily: 'arial'}),
              roundPixels: true,
            };
            text = this.calcFontSize? new MyText(textOpts, fontSize) : new Text(textOpts);
          }

          return text;
        }

        if(!isCreateGroup) {
          let rect = (i % 2 === 0) ?
            new Graphics().rect(0, 0, squareSize-1, squareSize-1).fill(useRandomColors? getColor(i) : fill).stroke({width:1, color: stroke}):
            createText();

          this.setPropsAndAdd(rect, i);
        }
        else {
          let rect = new Graphics().rect(0, 0, squareSize, squareSize)
            .fill(useRandomColors? getColor(i) : fill)
            .stroke({width: 1, color: stroke});
          let text = createText();
          let scale = Math.min(squareSize / text.width / 1.5, squareSize / text.height / 1.5);

          text.scale.set(scale);
          let bounds = text.getBounds();
          text.position.set((squareSize - bounds.width) / 2 , (squareSize - bounds.height) / 2);

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

    let posDiff = correctPixels? 0.5 : 0;
    rect.position.set(c.x + (squareSize - sizeDiff) / 2 + spacing + posDiff, c.y + (squareSize - sizeDiff) / 2 + spacing + posDiff);

    if(Math.abs(scale - 1) > 0.2)
      rect.scale.set(scale);

    this.rects.push(rect);
  }

  private  animateObjects(): Ticker {
    return this.app!.ticker.add(()=> {
      this.rects.forEach((rect) => {
        rect.angle = (rect.angle + rotationAngle) % 360;
      });
    });
  }

  protected setScale(){
    for(let rect of this.rects)
      rect.scale.set(rect.scale.x*1.5);

    this.app?.render();
  }
}

export class MyText extends Text{
  constructor(options?: TextOptions, fontSize?:number){
    super(options);

    if(fontSize)
      this.userFontSize = fontSize;

    const observer = {
      _onUpdate: () => {
        this.onRender();

        this.position.set(this.position.x + this.getBounds().width * (this.userScale.x - 1) / 2, this.position.y + this.getBounds().height * (this.userScale.y - 1) / 2);
      },
    };

    this.userScale = new ObservablePoint(observer,1,1);
  }

  private readonly userScale:ObservablePoint;

  override get scale(): ObservablePoint {
    return this.userScale;
  }

  override set scale(value: PointData | number) {
    let sx = this.userScale.x;
    let sy = this.userScale.y;
    if(Number.isFinite(value))
      sx = sy = value as number;
    else if (value){
      let point = value as PointData;
      sx = point.x;
      sy = point.y;
    }
    this.userScale.set(sx, sy);
  }

  private userFontSize: number = 12;
  get fontSize(): number {
    return this.userFontSize;
  }

  set fontSize(value: number) {
    this.userFontSize = value;
  }

  override onRender =  () : void | null=> {
    let m = this.getGlobalTransform(new Matrix(), true);
    let scalex = Math.sqrt(Math.pow(m.a, 2) + Math.pow(m.c, 2));
    //let scaley = Math.sqrt(Math.pow(m.b, 2) + Math.pow(m.d, 2));

    let fs = Math.round(scalex / super.scale.x * this.userFontSize * this.userScale.x);

    if(this.style.fontSize!=fs) {
      let newScale = super.scale.x / scalex;
      //console.log("update font size", scalex, super.scale.x, this.userScale.x, this.style.fontSize,this.userFontSize, fs, newScale);
      this.renderable = false;

      this.style.fontSize = fs;

      super.scale.set(newScale);

      if(this.pivot.x)
        this.pivot.set(this.width / 2, this.height / 2);

      this.renderable = true;
    }
  }

  // override onRender =  (renderer: Renderer) : void | null=> {
  //   let m = this.getGlobalTransform(new Matrix(), true);
  //   let scalex = Math.sqrt(Math.pow(m.a, 2) + Math.pow(m.c, 2));
  //   //let scaley = Math.sqrt(Math.pow(m.b, 2) + Math.pow(m.d, 2));
  //
  //   let fs = Math.round(scalex * this.style.fontSize);
  //
  //   if(this.style.fontSize!=fs) {
  //     //console.log("update font size", scalex, this.scale.x, fontSize, this.style.fontSize, fs);
  //     this.renderable = false;
  //
  //     this.style.fontSize = fs;
  //     this.scale.set(this.scale.x/scalex);
  //
  //     if(this.pivot.x)
  //       this.pivot.set(this.width / 2, this.height / 2)
  //
  //     this.renderable = true;
  //
  //   }
  // }
}
