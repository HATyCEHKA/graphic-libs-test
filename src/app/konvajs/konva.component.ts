import { CommonModule } from '@angular/common';
import {
  Component, Input,
  OnDestroy,
  OnInit,
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
import Konva from "konva";
import Layer = Konva.Layer;
import {Shape} from "konva/lib/Shape";
import Stage = Konva.Stage;

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'konva-js',
  templateUrl: './konva.component.html'
})
export class KonvaComponent implements OnInit, OnDestroy {
  @Input()
  svgFilePath:string = '';

  protected isAnimation = false;
  protected isInteractive = false;
  private rects: Shape[] = [];
  private animationFrameId: number = 0;

  private layer?: Layer;
  private stage?: Stage;
  private selectionRectangle?: Shape;
  private tr?: Konva.Transformer;

  async ngOnInit() {
    Konva.autoDrawEnabled = false;

    this.stage = new Konva.Stage({
      container: 'container',   // id of container <div>
      width: canvasWidth,
      height: canvasHeight
    });

    this.stage!.listening(this.isInteractive);

    this.tr = new Konva.Transformer();
    this.selectionRectangle = new Konva.Rect({
      fill: 'rgba(0,0,255,0.5)',
      visible: false,
    });

    this.initLayer();

    this.createInteractive();
    // await this.createScene(1000);
  }

  ngOnDestroy(): void {
    this.clearAnimations();
  }

  protected async createScene(count: number) {
    let t = Date.now();
    console.log("=========================")
    console.log("1 of 5. Start creating...");
    if (this.rects.length) {
      this.initLayer();
      this.rects = [];
    }

    let rects = await this.createObjects(count);
    this.layer!.batchDraw();
    console.log("5 of 5. Finish creating!", (Date.now() - t) / 1000 + "sec");

    if (this.isAnimation) {
      this.changeAnimation();
      this.changeAnimation();
    }
  }

  protected changeAnimation() {
    this.isAnimation = !this.isAnimation;
    if (this.isAnimation) {
      this.animateObjects(this.rects);
    } else
      this.clearAnimations();
  }

  protected changeInteraction() {
    this.isInteractive = !this.isInteractive;
    this.layer!.listening(this.isInteractive);
    this.stage!.listening(this.isInteractive);

    for (let rect of this.rects) {
      rect.draggable(this.isInteractive);
    }
    if (!this.isInteractive) {
      this.selectionRectangle?.visible(false);
      this.tr?.nodes([]);
    }
  }

  protected setZoom(zoom: number) {
    this.stage?.scale({x: zoom, y: zoom});

    if (isSvg) {
      for (let rect of this.rects) {
        rect.cache({pixelRatio: zoom});
      }
    }

    this.layer!.batchDraw();
  }

  private async createObjects(count: number): Promise<Shape[]> {
    if (isSvg) {
      return new Promise<Shape[]>((resolve) => {
        let createdCount = 0;
        for (let i = 0; i < count; i++) {
          Konva.Image.fromURL(this.svgFilePath, (rect) => {
            rect.perfectDrawEnabled(false);
            rect.cache({pixelRatio: this.stage!.scaleX()});
            this.setPropsAndAdd(rect, i, this.isInteractive);
            createdCount++;

            if (createdCount === count)
            {
              console.log("4 of 5. Created all objects");
              this.layer?.draw();
              resolve(this.rects);
            }
          });
        }
      });
    } else {
      for (let i = 0; i < count; i++) {
        let rect =  (i % 2 === 0) ?
          new Konva.Rect({
            width: squareSize,
            height: squareSize,
            stroke: stroke,
            fill: fill,
            strokeWidth: 1
          }) :
          new Konva.Text({text: 'Text', fill: stroke, fontSize: fontSize, fontFamily: 'arial'});
        this.setPropsAndAdd(rect, i, this.isInteractive);
      }
    }
    console.log("4 of 5. Created all objects");
    return this.rects;
  }

  private setPropsAndAdd(rect: Shape, i: number, selectable:boolean) {
    rect.offsetX(rect.width() / 2);
    rect.offsetY(rect.height() / 2);

    let c = getCoordinates(i, squaresPerRow, squareSize, spacing);
    let scale = Math.min(squareSize / rect.width(), squareSize / rect.height());
    //console.log("Size: ", rect.width(), "; Scale: ", scale);
    rect.setPosition({x: c.x + squareSize / 2 + spacing, y: c.y + squareSize / 2 + spacing});
    if(scale!==1)
      rect.scale({x: scale, y: scale});
    rect.draggable(this.isInteractive);
    this.layer?.add(rect);
    this.rects.push(rect);
  }

  private animateObjects(rects: Shape[]): void {
    const changeAngle = () => {
      rects.forEach((rect) => {
        rect.rotate(rotationAngle);
      });

      this.layer!.batchDraw();
      this.animationFrameId = requestAnimationFrame(changeAngle);
    };

    this.animationFrameId = requestAnimationFrame(changeAngle);
  }

  private clearAnimations() {
    cancelAnimationFrame(this.animationFrameId);
  }

  private initLayer() {
    this.layer?.destroy();
    this.layer = new Konva.Layer({});
    this.layer.listening(this.isInteractive);
    this.stage?.add(this.layer);

    this.layer.add(this.tr!);
    this.layer.add(this.selectionRectangle!);
  }

  private createInteractive() {
    let tr = this.tr!;
    let selectionRectangle = this.selectionRectangle!;
    let stage = this.stage!;

    let x1: number, y1: number, x2, y2;
    stage.on('mousedown touchstart', (e) => {
      if (!this.isInteractive)
        return;
      // do nothing if we mousedown on any shape
      if (e.target !== stage) {
        return;
      }
      x1 = stage.getPointerPosition()!.x;
      y1 = stage.getPointerPosition()!.y;
      x2 = stage.getPointerPosition()!.x;
      y2 = stage.getPointerPosition()!.y;

      selectionRectangle.visible(true);
      selectionRectangle.width(0);
      selectionRectangle.height(0);
    });

    stage.on('mousemove touchmove', () => {
      if (!this.isInteractive)
        return;
      // do nothing if we didn't start selection
      if (!selectionRectangle.visible()) {
        return;
      }
      x2 = stage.getPointerPosition()!.x;
      y2 = stage.getPointerPosition()!.y;

      selectionRectangle.setAttrs({
        x: Math.min(x1, x2),
        y: Math.min(y1, y2),
        width: Math.abs(x2 - x1),
        height: Math.abs(y2 - y1),
      });
      this.layer?.batchDraw();
    });

    stage.on('mouseup touchend', () => {
      if (!this.isInteractive)
        return;
      // do nothing if we didn't start selection
      if (!selectionRectangle.visible()) {
        return;
      }
      // update visibility in timeout, so we can check it in click event
      setTimeout(() => {
        selectionRectangle.visible(false);
        this.layer?.batchDraw();
      });
      //var shapes = stage.find('.rect');
      var shapes = this.rects;
      var box = selectionRectangle.getClientRect();
      var selected = shapes.filter((shape) =>
        Konva.Util.haveIntersection(box, shape.getClientRect())
      );
      tr.nodes(selected);
    });

    // clicks should select/deselect shapes
    stage.on('click tap', (e) => {

      if (!this.isInteractive)
        return;
      // if we are selecting with rect, do nothing
      if (selectionRectangle.visible()) {
        return;
      }
      // if click on empty area - remove all selections
      if (e.target === stage) {
        tr.nodes([]);
        return;
      }

      // do nothing if clicked NOT on our rectangles
      //       if (!e.target.hasName('rect')) {
      //         return;
      //       }

      // do we pressed shift or ctrl?
      const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
      const isSelected = tr.nodes().indexOf(e.target) >= 0;

      if (!metaPressed && !isSelected) {
        // if no key pressed and the node is not selected select just one
        tr.nodes([e.target]);
      } else if (metaPressed && isSelected) {
        // if we pressed keys and node was selected
        // we need to remove it from selection:
        const nodes = tr.nodes().slice(); // use slice to have new copy of array
        // remove node from array
        nodes.splice(nodes.indexOf(e.target), 1);
        tr.nodes(nodes);
      } else if (metaPressed && !isSelected) {
        // add the node into selection
        const nodes = tr.nodes().concat([e.target]);
        tr.nodes(nodes);
      }
    });
  }
}
