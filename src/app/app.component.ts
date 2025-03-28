import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
} from '@angular/core';
import {
  setRotationAngle,
  rotationAngle,
  isSvg,
  setIsSvg,
  svgFilePath_gradient, svgFilePath
} from "./util/coord.util";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements AfterViewInit {
  protected konvaJs: boolean = false;
  protected svgJs: boolean = false;
  protected fabricjs: boolean = false;
  protected pixi: boolean = false;
  protected twoJs: boolean = false;
  protected isPixiAntialias = false;
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

  createTwoJs() {
    this.closeAll();
    this.twoJs = true;
    this.cdr.detectChanges();
  }

  private closeAll(): void {
    this.konvaJs = this.fabricjs = this.pixi = this.svgJs = false;
  }

  ngAfterViewInit(): void {
    // const rect = canva.rect(300, 300).attr({ fill: '#f06' });
    // setInterval(() => {
    //   rect.animate().rotate(1).active();
    // }, 100);
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

  protected changeSvgPath(target:any){
    this.svgPath = target?.checked? svgFilePath_gradient : svgFilePath;
  }
}
