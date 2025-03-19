import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef, inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {BaseFabricObject, Canvas, Point, Rect, util, FabricObject, loadSVGFromString} from 'fabric';
import {
  canvasHeight,
  canvasWidth,
  getCoordinates, isSvg,
  rotationAngle,
  spacing,
  squareSize,
  squaresPerRow, svgFilePath
} from '../util/coord.util';
import {HttpClient} from "@angular/common/http";
import {firstValueFrom} from "rxjs";

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'fabric-js',
  templateUrl: './fabricjs.component.html',
})
export class FabricjsComponent implements OnInit, OnDestroy {
  @ViewChild('redactor', { static: true })
  protected redactor!: ElementRef;
  protected canvas: Canvas | undefined;
  private httpClient = inject(HttpClient);
  protected isAnimation = false;
  private rects: FabricObject[] = [];
  private animationFrameId:number = 0;

  async ngOnInit() {
    BaseFabricObject.ownDefaults.originX = 'center';
    BaseFabricObject.ownDefaults.originY = 'center';
    this.canvas = new Canvas(this.redactor.nativeElement, {
      width: canvasWidth,
      height: canvasHeight,
      renderOnAddRemove: false,
      hoverCursor: 'default',
      moveCursor: 'default',
      selection: false,
    });
    //await this.createScene(1000);
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationFrameId);
  }

  protected async createScene(count: number) {
    let t = Date.now();
    console.log("=========================")
    console.log("1 of 5. Start creating...");
    if(this.rects.length) {
      this.canvas?.clear();
      this.rects=[];
    }

    let rects = await this.createObjects(count);
    this.canvas!.requestRenderAll();
    console.log("5 of 5. Finish creating!", (Date.now()-t)/ 1000 + "sec");

    if(this.isAnimation){
      this.isAnimation = false;
      this.changeAnimation();
    }
  }

  protected changeAnimation(){
    this.isAnimation = !this.isAnimation;
    if(this.isAnimation){
      this.animateObjects(this.rects);
    }
    else
      cancelAnimationFrame(this.animationFrameId);
  }

  protected changeInteraction(){
    if(this.canvas) {
      let sel = !this.canvas.selection;
      if(!sel) {
        this.canvas.discardActiveObject();
        this.canvas!.requestRenderAll();
      }

      this.canvas.selection = sel;
      for(let obj of this.canvas.getObjects()){
        obj.selectable = sel;
      }
    }
  }

  protected setZoom(zoom: number) {
    this.canvas!.setZoom(zoom);
    this.canvas!.requestRenderAll();
  }

  private async createObjects(count: number): Promise<FabricObject[]> {
    if(isSvg) {
      const promises: Promise<any>[] = [];
      let svgContent = await firstValueFrom<string>(this.httpClient.get(svgFilePath, {responseType: 'text'}));

      for (let i = 0; i < count; i++) {
        promises.push(loadSVGFromString(svgContent));
      }
      console.log("2 of 5. Created all loadSVG promises");

      await Promise.all(promises).then((results) => {
        console.log("3 of 5. Finished all loadSVG promises");
        let sel = this.canvas?.selection!;
        for (let i = 0; i < count; i++) {
          let loadedSVG = results[i];
          let rect = util.groupSVGElements(loadedSVG.objects, loadedSVG.options);

          let c = getCoordinates(i, squaresPerRow, squareSize, spacing);
          let scale = Math.min(squareSize / rect.width, squareSize / rect.height);

          //console.log("Size: ", rect.width, "; Scale: ", scale);

          rect.setXY(new Point(c.x + squareSize / 2 + spacing, c.y + squareSize / 2));
          rect.scale(scale);

          rect.selectable = sel;
          this.canvas?.add(rect);
          this.rects.push(rect);
        }
        console.log("4 of 5. Created all objects");
      });
    }
    else{
      let sel = this.canvas?.selection!;
      for (let i = 0; i < count; i++) {
        let rect = new Rect({width: squareSize, height: squareSize, stroke: '#951f1f', fill: 'transparent'});

        let c = getCoordinates(i, squaresPerRow, squareSize, spacing);
        rect.setXY(new Point(c.x + squareSize / 2 + spacing, c.y + squareSize / 2));

        rect.selectable = sel;
        this.canvas?.add(rect);
        this.rects.push(rect);
      }
      console.log("4 of 5. Created all objects");
    }
    return this.rects;
  }

  private animateObjects(rects: FabricObject[]): void {
    const changeAngle = () => {
      rects.forEach((rect) => {
        rect.angle = (rect.angle + rotationAngle) % 360;
      });

      this.canvas!.requestRenderAll();
      this.animationFrameId = requestAnimationFrame(changeAngle);
    };

    this.animationFrameId = requestAnimationFrame(changeAngle);
  }
}
