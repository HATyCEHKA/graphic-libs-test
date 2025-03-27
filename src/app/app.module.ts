import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { SvgJsComponent } from './svgjs/svgjs.component';
import { FabricjsComponent } from './fabricjs/fabricjs.component';
import { PixiComponent } from './pixi/pixi.component';
import {HttpClientModule} from "@angular/common/http";
import {FormsModule} from "@angular/forms";
import {KonvaComponent} from "./konvajs/konva.component";
import {TwojsComponent} from "./twojs/twojs.component";

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, HttpClientModule, SvgJsComponent, FabricjsComponent, PixiComponent, KonvaComponent, TwojsComponent, FormsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
