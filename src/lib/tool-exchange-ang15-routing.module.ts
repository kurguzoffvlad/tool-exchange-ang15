import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ToolExchangeAng15Component } from './tool-exchange-ang15.component';

const routes: Routes = [
	{
		path: '',
		component: ToolExchangeAng15Component,
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class ToolExchangeAng15RoutingModule {
}
