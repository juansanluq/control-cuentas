import { Component, OnInit } from '@angular/core';
import { AppState } from 'src/app/app.reducer';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { IngresoEgreso } from '../ingreso-egreso.model';
import { MultiDataSet, Label } from 'ng2-charts';

@Component({
  selector: 'app-estadistica',
  templateUrl: './estadistica.component.html',
  styles: []
})
export class EstadisticaComponent implements OnInit {

  ingresos: number;
  egresos: number;

  contadorIngresos: number;
  contadorEgresos: number;

  subscription: Subscription = new Subscription();

  public doughnutChartLabels: Label[] = ['Ingresos', 'Egresos'];
  public doughnutChartData: number[] = [];
  private donutColors = [
    {
      backgroundColor: [
        'rgba(43, 164, 68, 1)',
        'rgba(228, 50, 66, 1)',
    ]
    }
  ];

  constructor(private store: Store<AppState>) { }

  ngOnInit() {
    this.subscription = this.store.select('ingresoEgreso')
        .subscribe( ingresoEgreso => {
          this.contarIngresoEgreso(ingresoEgreso.items);
        });
  }

  contarIngresoEgreso( items: IngresoEgreso[] ) {
    this.ingresos = 0;
    this.egresos = 0;

    this.contadorEgresos = 0;
    this.contadorIngresos = 0;

    items.forEach( item => {
      if ( item.tipo === 'ingreso' ) {
        this.contadorIngresos++;
        this.ingresos += item.monto;
      } else {
        this.contadorEgresos++;
        this.egresos += item.monto;
      }
    });

    this.doughnutChartData = [this.ingresos, this.egresos];
  }

}
