import {
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component, inject,
} from '@angular/core';
import {
  setRotationAngle,
  rotationAngle,
  isSvg,
  setIsSvg,
  svgFilePath_gradient,
  svgFilePath,
  useRandomColors,
  setUseRandomColors,
  correctPixels,
  setCorrectPixels,
  setFontSize,
  fontSize, isCreateGroup, setIsCreateGroup
} from "./util/coord.util";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  protected konvaJs: boolean = false;
  protected svgJs: boolean = false;
  protected fabricjs: boolean = false;
  protected pixi: boolean = false;
  protected pixi_antialis: boolean = false;
  protected twoJs_canvas: boolean = false;
  protected twoJs_webGl: boolean = false;
  protected svgPath = svgFilePath;

  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  createKonvaJs() {
    this.closeAll();
    this.konvaJs = true;

    this.cdr.detectChanges();
  }

  createSvgJs() {
    this.closeAll();
    this.svgJs = true;
    this.cdr.detectChanges();
  }

  createFabricJs() {
    this.closeAll();
    this.fabricjs = true;
    this.cdr.detectChanges();
  }

  createPixi() {
    this.closeAll();
    this.pixi = true;
    this.cdr.detectChanges();
  }

  createPixi_antialias() {
    this.closeAll();
    this.pixi_antialis = true;
    this.cdr.detectChanges();
  }

  createTwoJs_canvas() {
    this.closeAll();
    this.twoJs_canvas = true;
    this.cdr.detectChanges();
  }

  createTwoJs_webGl() {
    this.closeAll();
    this.twoJs_webGl = true;
    this.cdr.detectChanges();
  }

  private closeAll(): void {
    this.konvaJs = this.fabricjs = this.pixi = this.pixi_antialis = this.svgJs = this.twoJs_canvas = this.twoJs_webGl = false;
  }

  protected get rotationAngle() {
    return rotationAngle;
  }
  protected set rotationAngle(value) {
    setRotationAngle(value);
  }

  protected get isSvg() {
    return isSvg;
  }
  protected set isSvg(value) {
    setIsSvg(value);
  }

  protected get useRandomColors() {
    return useRandomColors;
  }
  protected set useRandomColors(value) {
    setUseRandomColors(value);
  }

  protected get correctPixels() {
    return correctPixels;
  }
  protected set correctPixels(value) {
    setCorrectPixels(value);
  }

  protected changeSvgPath(target:any){
    this.svgPath = target?.checked? svgFilePath_gradient : svgFilePath;
  }

  protected get fontSize() {
    return fontSize;
  }
  protected set fontSize(value) {
    setFontSize(value);
  }

  protected set isCreateGroup(value) {
    setIsCreateGroup(value);
  }
  protected get isCreateGroup() {
    return isCreateGroup;
  }
}
