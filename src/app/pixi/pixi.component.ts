import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {Application, Assets, Graphics, Sprite, Ticker} from 'pixi.js';
import {
  canvasHeight,
  canvasWidth,
  getCoordinates, isSvg,
  rotationAngle,
  spacing,
  squareSize,
  squaresPerRow, svgFilePath
} from '../util/coord.util';
import {ViewContainer} from "pixi.js/lib/scene/view/ViewContainer";

@Component({
  selector: 'pixi',
  templateUrl: './pixi.component.html',
  standalone: true,
  imports: [CommonModule],
})
export class PixiComponent implements OnInit, OnDestroy {
  @ViewChild('redactor', { static: true })
  protected redactor!: ElementRef;
  app: Application | undefined;
  protected isAnimation = false;
  private rects: ViewContainer[] = [];
  private animateTicker: Ticker | null = null;

  ngOnInit() {
    this.app = new Application();
    this.app
      .init({
        width: canvasWidth,
        height: canvasHeight,
        background: '#ffffff',
        //preference: 'webgpu',
        //preference: 'webgl',
        antialias: true,
        //autoDensity: true,
        powerPreference: 'high-performance',
        //powerPreference: 'low-power',
        //resolution: 1, //лучше не трогать, появляются тормоза и никаких улучшений
        useBackBuffer: true
      })
      .finally(async () => {
        this.redactor.nativeElement.appendChild(this.app!.canvas);

        //await this.createScene(1000);
      });
  }

  ngOnDestroy(): void {
    this.app!.destroy();
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

  private async createObjects(count: number = 1000): Promise<ViewContainer[]> {
    if(isSvg) {
      const promises: Promise<any>[] = [];

      for (let i = 0; i < count; i++) {
        promises.push(Assets.load({src: svgFilePath, data: {parseAsGraphicsContext: true, resolution: 5 }}));
      }

      console.log("2 of 5. Created all loadSVG promises");

      await Promise.all(promises).then((results) => {
        console.log("3 of 5. Finished all loadSVG promises");
        for (let i = 0; i < count; i++) {
          let loadedSVG = results[i];
          const rect = new Graphics(loadedSVG);
          //const rect = new Sprite(loadedSVG);

          let c = getCoordinates(i, squaresPerRow, squareSize, spacing);
          let scale = Math.min(squareSize / rect.width, squareSize / rect.height);

          //console.log("Size: ", rect.width, "; Scale: ", scale);

          rect.pivot.set(rect.width / 2, rect.height / 2);
          if(scale!==1)
            rect.scale.set(scale);
          rect.position.set(c.x + rect.width / 2 +  + spacing, c.y + rect.height / 2);

          this.rects.push(rect);
        }
        console.log("4 of 5. Created all objects");

      });
    }
    else {
      for (let i = 0; i < count; i++) {
        const rect = new Graphics().rect(0, 0, squareSize, squareSize).stroke('#951f1f');

        let c = getCoordinates(i, squaresPerRow, squareSize, spacing);

        rect.pivot.set(rect.width / 2, rect.height / 2);
        rect.position.set(c.x + rect.width / 2 + spacing, c.y + rect.height / 2);

        this.rects.push(rect);
      }
      console.log("4 of 5. Created all objects");
    }
    return this.rects;
  }

  private  animateObjects(): Ticker {
    return this.app!.ticker.add(()=> {
      this.rects.forEach((rect) => {
        rect.angle = (rect.angle + rotationAngle) % 360;
      });
    });
  }
}
