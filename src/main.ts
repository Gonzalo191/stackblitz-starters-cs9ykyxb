import { bootstrapApplication } from '@angular/platform-browser';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Producto {
  id: string;
  nombre: string;
  nombreCorto: string;
  palabrasClave: string[];
  precio: number;
  stock: number;
  stockMinimo: number;
  vencimiento: string;
  vencePronto: boolean;
  diasParaVencer: number;
  diasSinRotacion: number;
  alertaStockBase: boolean;
  fechaUltimaCompra: string;
}

interface LineaVenta {
  productoId: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  stockRestante: number;
  alertaStockBajo: boolean;
  notaStockInsuficiente?: string;
}

interface VentaRegistrada {
  id: number;
  lineas: LineaVenta[];
  total: number;
  textoOriginal: string;
  origen: 'manual' | 'chat';
}

interface Gasto {
  id: number;
  concepto: string;
  monto: number;
  hora: string;
}

interface Recomendacion {
  id: string;
  titulo: string;
  motivo: string;
  impacto: string;
  accion: string;
}

interface AlertaItem {
  tipo: 'stock' | 'vencimiento' | 'rotacion';
  tituloCorto: string;
  subtitulo: string;
  detalle: string;
}

interface PuntoGrafico {
  etiqueta: string;
  valor: number;
}

interface PuntoGraficoCoordenada extends PuntoGrafico {
  x: number;
  y: number;
}

interface DatosPeriodo {
  ventas: number;
  gastos: number;
  puntosGrafico: PuntoGrafico[];
}

type Pantalla = 'registro' | 'inventario' | 'caja' | 'revisarInventario' | 'chat';
type SubVistaRegistro = 'menu' | 'mercaderia' | 'stock' | 'gasto';
type ModalTipo = 'producto' | 'alerta' | 'recomendacion' | null;
type TipoMensajeChat = 'texto' | 'resumenVenta' | 'productosBajos' | 'estadoDia' | 'alertas' | 'aclaracion';
type IntencionChat = 'venta' | 'productos' | 'estado' | 'alertas' | 'ambiguo';
type IconoHeader = 'funnel' | 'none';
type FiltroPeriodo = 'dia' | 'semana' | 'mes' | 'anio';

interface MensajeChat {
  emisor: 'bot' | 'usuario';
  tipo: TipoMensajeChat;
  texto?: string;
  venta?: VentaRegistrada;
  noReconocidos?: string[];
  hora: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="app-shell">

    <ng-template #iconMenu><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg></ng-template>
    <ng-template #iconBack><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="15,4 7,12 15,20"/></svg></ng-template>
    <ng-template #iconFunnel><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><polygon points="4,5 20,5 14,13 14,19 10,20 10,13"/></svg></ng-template>
    <ng-template #iconDots><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="12" cy="19" r="1.7"/></svg></ng-template>
    <ng-template #iconVideo><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="13" height="12" rx="2"/><polygon points="16,10 21,7 21,17 16,14" fill="currentColor" stroke="none"/></svg></ng-template>
    <ng-template #iconPhone><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h3l2 5-2.5 1.5a12 12 0 0 0 6 6L15 14l5 2v3c0 1-1 2-2 2C10 21 3 14 3 6c0-1 1-2 2-2z"/></svg></ng-template>
    <ng-template #iconChevron><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9,5 16,12 9,19"/></svg></ng-template>
    <ng-template #iconInventarioCheck><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="4" width="14" height="18" rx="2"/><rect x="9" y="2" width="6" height="4" rx="1"/><polyline points="8,13 11,16 16,10"/></svg></ng-template>
    <ng-template #iconBars><svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="13" width="4" height="7" rx="1"/><rect x="10" y="9" width="4" height="11" rx="1"/><rect x="17" y="4" width="4" height="16" rx="1"/></svg></ng-template>
    <ng-template #iconWarningTriangle><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><polygon points="12,3 22,20 2,20"/><line x1="12" y1="9" x2="12" y2="14"/><circle cx="12" cy="17" r="0.9" fill="currentColor" stroke="none"/></svg></ng-template>
    <ng-template #iconCalendar><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="3" x2="8" y2="7"/><line x1="16" y1="3" x2="16" y2="7"/></svg></ng-template>
    <ng-template #iconNoEntry><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="9"/><line x1="6" y1="18" x2="18" y2="6"/></svg></ng-template>
    <ng-template #iconCart><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h2l2.5 12h11L21 8H6"/><circle cx="10" cy="20" r="1.3" fill="currentColor" stroke="none"/><circle cx="17" cy="20" r="1.3" fill="currentColor" stroke="none"/></svg></ng-template>
    <ng-template #iconBox><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><polyline points="3,8 12,4 21,8"/><path d="M3 8v11h18V8"/><line x1="12" y1="4" x2="12" y2="19"/></svg></ng-template>
    <ng-template #iconClipboard><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="4" width="14" height="18" rx="2"/><rect x="9" y="2" width="6" height="4" rx="1"/><line x1="8" y1="11" x2="16" y2="11"/><line x1="8" y1="15" x2="16" y2="15"/></svg></ng-template>
    <ng-template #iconDollarCircle><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="9"/><text x="12" y="16.5" text-anchor="middle" font-size="10" font-weight="700" stroke="none" fill="currentColor">S</text></svg></ng-template>
    <ng-template #iconLightbulb><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="10" r="6"/><line x1="9.5" y1="17" x2="14.5" y2="17"/><line x1="10" y1="20" x2="14" y2="20"/></svg></ng-template>
    <ng-template #iconScale><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="4" x2="12" y2="20"/><line x1="5" y1="7" x2="19" y2="7"/><circle cx="6" cy="11" r="2.6"/><circle cx="18" cy="11" r="2.6"/><line x1="8" y1="20" x2="16" y2="20"/></svg></ng-template>
    <ng-template #iconMegaphone><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10v4h4l7 4V6l-7 4z"/><path d="M19 9a4 4 0 0 1 0 6"/></svg></ng-template>
    <ng-template #iconXCircle><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/></svg></ng-template>
    <ng-template #iconHeart><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20 C5 15 2 10.5 5.5 7 C8 4.5 11 6 12 8.5 C13 6 16 4.5 18.5 7 C22 10.5 19 15 12 20 Z"/></svg></ng-template>
    <ng-template #iconSmiley><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><circle cx="9" cy="10" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="10" r="1" fill="currentColor" stroke="none"/><path d="M8 14.5a5 5 0 0 0 8 0" stroke-linecap="round"/></svg></ng-template>
    <ng-template #iconPaperclip><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M7 13 L14 6a3 3 0 0 1 4 4l-8 8a5 5 0 0 1-7-7l7-7"/></svg></ng-template>
    <ng-template #iconCamera><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><polygon points="8,7 10,4 14,4 16,7"/><circle cx="12" cy="13.5" r="3.5"/></svg></ng-template>
    <ng-template #iconSend><svg viewBox="0 0 24 24" fill="currentColor"><polygon points="3,12 21,4 14,12 21,20"/></svg></ng-template>
    <ng-template #iconCheckDouble><svg viewBox="0 0 24 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1,7 5,11 12,3"/><polyline points="8,7 12,11 19,3"/></svg></ng-template>

    <ng-template #statusBar>
      <div class="status-bar">
        <span class="status-time">9:41</span>
        <span class="status-icons">
          <svg viewBox="0 0 20 12" class="icon-signal" fill="currentColor"><rect x="0" y="7" width="3" height="5"/><rect x="5" y="5" width="3" height="7"/><rect x="10" y="3" width="3" height="9"/><rect x="15" y="1" width="3" height="11"/></svg>
          <svg viewBox="0 0 20 14" class="icon-wifi" fill="none"><path d="M2 6a13 13 0 0 1 16 0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M5 9a8 8 0 0 1 10 0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="10" cy="12" r="1.4" fill="currentColor"/></svg>
          <svg viewBox="0 0 26 14" class="icon-battery" fill="none"><rect x="1" y="1" width="21" height="12" rx="2.5" stroke="currentColor" stroke-width="1.4"/><rect x="23" y="4.5" width="2" height="5" rx="1" fill="currentColor"/><rect x="3" y="3" width="16" height="8" rx="1" fill="currentColor"/></svg>
        </span>
      </div>
    </ng-template>

    <div class="phone">

      <div class="phone-header" *ngIf="pantallaActual !== 'chat'">
        <ng-container [ngTemplateOutlet]="statusBar"></ng-container>
        <div class="app-bar">
          <button type="button" class="icon-btn" (click)="abrirMenu()">
            <ng-container [ngTemplateOutlet]="iconMenu"></ng-container>
          </button>
          <div class="app-bar-title">{{ tituloPantalla() }}</div>
          <button type="button" class="icon-btn" *ngIf="headerIconDerecho() === 'funnel'">
            <ng-container [ngTemplateOutlet]="iconFunnel"></ng-container>
          </button>
          <span class="icon-btn-spacer" *ngIf="headerIconDerecho() === 'none'"></span>
        </div>
      </div>

      <div class="phone-header chat-header" *ngIf="pantallaActual === 'chat'">
        <ng-container [ngTemplateOutlet]="statusBar"></ng-container>
        <div class="app-bar app-bar-chat">
          <button type="button" class="icon-btn" (click)="irA('registro')">
            <ng-container [ngTemplateOutlet]="iconBack"></ng-container>
          </button>
          <div class="chat-avatar">B</div>
          <div class="chat-contact-info">
            <div class="chat-contact-name">BodeYa</div>
            <div class="chat-contact-status">en línea</div>
          </div>
          <button type="button" class="icon-btn"><ng-container [ngTemplateOutlet]="iconVideo"></ng-container></button>
          <button type="button" class="icon-btn"><ng-container [ngTemplateOutlet]="iconPhone"></ng-container></button>
          <button type="button" class="icon-btn" (click)="toggleGuia()"><ng-container [ngTemplateOutlet]="iconDots"></ng-container></button>
        </div>
      </div>

      <div class="phone-body">

        <div class="pantalla" *ngIf="pantallaActual === 'registro'">
          <ng-container [ngSwitch]="subVistaRegistro">

            <ng-container *ngSwitchCase="'menu'">
              <div class="registro-grid">
                <button type="button" class="tarjeta-icono" (click)="irA('chat')">
                  <span class="tarjeta-icono-circulo"><ng-container [ngTemplateOutlet]="iconCart"></ng-container></span>
                  <span class="tarjeta-icono-label">Registrar venta</span>
                </button>
                <button type="button" class="tarjeta-icono" (click)="abrirFormulario('mercaderia')">
                  <span class="tarjeta-icono-circulo"><ng-container [ngTemplateOutlet]="iconBox"></ng-container></span>
                  <span class="tarjeta-icono-label">Ingresar mercadería</span>
                </button>
                <button type="button" class="tarjeta-icono" (click)="abrirFormulario('stock')">
                  <span class="tarjeta-icono-circulo"><ng-container [ngTemplateOutlet]="iconClipboard"></ng-container></span>
                  <span class="tarjeta-icono-label">Actualizar stock</span>
                </button>
                <button type="button" class="tarjeta-icono" (click)="abrirFormulario('gasto')">
                  <span class="tarjeta-icono-circulo"><ng-container [ngTemplateOutlet]="iconDollarCircle"></ng-container></span>
                  <span class="tarjeta-icono-label">Registrar gasto</span>
                </button>
                <button type="button" class="tarjeta-icono" (click)="irA('revisarInventario')">
                  <span class="tarjeta-icono-circulo"><ng-container [ngTemplateOutlet]="iconInventarioCheck"></ng-container></span>
                  <span class="tarjeta-icono-label">Revisar Inventario</span>
                </button>
                <button type="button" class="tarjeta-icono" (click)="irA('caja')">
                  <span class="tarjeta-icono-circulo"><ng-container [ngTemplateOutlet]="iconBars"></ng-container></span>
                  <span class="tarjeta-icono-label">Estado de Cuenta</span>
                </button>
              </div>
              <div class="tip-card">
                <span class="tip-icono"><ng-container [ngTemplateOutlet]="iconLightbulb"></ng-container></span>
                <span>Tip: Mantén tu información al día y toma mejores decisiones.</span>
              </div>
              <button type="button" class="btn-principal" (click)="irA('inventario')">Ver alertas</button>
            </ng-container>

            <div *ngSwitchCase="'mercaderia'" class="formulario">
              <button type="button" class="btn-volver" (click)="volverARegistroMenu()">‹ Volver</button>
              <h3 class="formulario-titulo">Ingresar mercadería</h3>
              <div class="campo-linea">
                <select #selMercProducto class="select-campo">
                  <option *ngFor="let p of inventario; trackBy: trackByIndex" [value]="p.id">{{ p.nombre }} (stock {{ p.stock }})</option>
                </select>
              </div>
              <div class="campo-linea">
                <input #inputMercCantidad type="number" min="1" placeholder="Cantidad recibida" class="input-ancho">
              </div>
              <p class="mensaje-registro" *ngIf="mensajeRegistro">{{ mensajeRegistro }}</p>
              <button type="button" class="btn-principal" (click)="guardarMercaderia(selMercProducto.value, inputMercCantidad.value); inputMercCantidad.value=''">Guardar</button>

              <div class="seccion-divisor"><span>Recomendaciones para ti</span></div>
              <div class="lista-recomendaciones">
                <div class="recomendacion-fila" *ngFor="let r of recomendaciones; trackBy: trackByIndex" (click)="abrirDetalleRecomendacion(r)">
                  <span class="recomendacion-icono">
                    <ng-container *ngIf="r.id === 'aceite'" [ngTemplateOutlet]="iconCart"></ng-container>
                    <ng-container *ngIf="r.id === 'galletas'" [ngTemplateOutlet]="iconXCircle"></ng-container>
                    <ng-container *ngIf="r.id === 'gaseosa'" [ngTemplateOutlet]="iconMegaphone"></ng-container>
                    <ng-container *ngIf="r.id === 'caja'" [ngTemplateOutlet]="iconScale"></ng-container>
                    <ng-container *ngIf="r.id === 'general'" [ngTemplateOutlet]="iconHeart"></ng-container>
                  </span>
                  <span class="recomendacion-texto">{{ tituloRecomendacion(r) }}</span>
                </div>
              </div>
            </div>

            <div *ngSwitchCase="'stock'" class="formulario">
              <button type="button" class="btn-volver" (click)="volverARegistroMenu()">‹ Volver</button>
              <h3 class="formulario-titulo">Actualizar stock</h3>
              <div class="campo-linea">
                <select #selStockProducto class="select-campo">
                  <option *ngFor="let p of inventario; trackBy: trackByIndex" [value]="p.id">{{ p.nombre }} (actual {{ p.stock }})</option>
                </select>
              </div>
              <div class="campo-linea">
                <input #inputStockNuevo type="number" min="0" placeholder="Nuevo stock contado" class="input-ancho">
              </div>
              <p class="mensaje-registro" *ngIf="mensajeRegistro">{{ mensajeRegistro }}</p>
              <button type="button" class="btn-principal" (click)="guardarActualizacionStock(selStockProducto.value, inputStockNuevo.value); inputStockNuevo.value=''">Guardar</button>
            </div>

            <div *ngSwitchCase="'gasto'" class="formulario">
              <button type="button" class="btn-volver" (click)="volverARegistroMenu()">‹ Volver</button>
              <h3 class="formulario-titulo">Registrar gasto</h3>
              <div class="campo-linea">
                <input #inputGastoConcepto type="text" placeholder="Concepto" class="input-ancho">
              </div>
              <div class="campo-linea">
                <input #inputGastoMonto type="number" min="0" step="0.10" placeholder="Monto S/" class="input-ancho">
              </div>
              <p class="mensaje-registro" *ngIf="mensajeRegistro">{{ mensajeRegistro }}</p>
              <button type="button" class="btn-principal" (click)="guardarGasto(inputGastoConcepto.value, inputGastoMonto.value); inputGastoConcepto.value=''; inputGastoMonto.value=''">Guardar</button>
            </div>

          </ng-container>
        </div>

        <div class="pantalla" *ngIf="pantallaActual === 'inventario'">
          <div class="lista-alertas-cards">
            <div class="alerta-card" *ngFor="let a of alertasVisibles(); trackBy: trackByIndex" (click)="abrirDetalleAlerta(a)">
              <div class="alerta-card-icono">
                <ng-container *ngIf="a.tipo === 'stock'" [ngTemplateOutlet]="iconWarningTriangle"></ng-container>
                <ng-container *ngIf="a.tipo === 'vencimiento'" [ngTemplateOutlet]="iconCalendar"></ng-container>
                <ng-container *ngIf="a.tipo === 'rotacion'" [ngTemplateOutlet]="iconNoEntry"></ng-container>
              </div>
              <div class="alerta-card-texto">
                <div class="alerta-card-titulo">{{ a.tituloCorto }}</div>
                <div class="alerta-card-subtitulo">{{ a.subtitulo }}</div>
              </div>
              <div class="alerta-card-chevron"><ng-container [ngTemplateOutlet]="iconChevron"></ng-container></div>
            </div>
            <p class="sin-alertas" *ngIf="!alertasInventario().length">Sin alertas por el momento.</p>
          </div>

          <button type="button" class="btn-outline" *ngIf="alertasInventario().length > 3" (click)="mostrarTodasAlertas = !mostrarTodasAlertas">
            {{ mostrarTodasAlertas ? 'Ver menos alertas' : 'Ver todas las alertas' }}
          </button>

          <div class="tabla-inventario">
            <div class="tabla-fila tabla-header">
              <span>Producto</span><span>Stock</span><span>Mín.</span><span>Vence</span>
            </div>
            <div class="tabla-fila tabla-producto" *ngFor="let p of inventario; trackBy: trackByIndex" (click)="abrirDetalleProducto(p)">
              <span>{{ p.nombre }}</span>
              <span>{{ p.stock }}</span>
              <span>{{ p.stockMinimo }}</span>
              <span>{{ p.vencimiento }}</span>
            </div>
          </div>
        </div>

        <div class="pantalla" *ngIf="pantallaActual === 'caja'">
          <div class="lista-filas">
            <div class="fila-card">
              <div class="fila-icono"><ng-container [ngTemplateOutlet]="iconBars"></ng-container></div>
              <div class="fila-texto">Ventas registradas</div>
              <div class="fila-valor">S/ {{ entero(datosPeriodoActual().ventas) }}</div>
            </div>
            <div class="fila-card">
              <div class="fila-icono"><ng-container [ngTemplateOutlet]="iconDollarCircle"></ng-container></div>
              <div class="fila-texto">Gastos realizados</div>
              <div class="fila-valor">- S/ {{ entero(datosPeriodoActual().gastos) }}</div>
            </div>
            <div class="fila-card">
              <div class="fila-icono"><ng-container [ngTemplateOutlet]="iconScale"></ng-container></div>
              <div class="fila-texto">Ingresos</div>
              <div class="fila-valor">S/ {{ entero(ingresosPeriodoActual()) }}</div>
            </div>
          </div>

          <div class="filtros-periodo">
            <button type="button" [class.activo]="filtroPeriodo === 'dia'" (click)="cambiarFiltroPeriodo('dia')">Día</button>
            <button type="button" [class.activo]="filtroPeriodo === 'semana'" (click)="cambiarFiltroPeriodo('semana')">Semana</button>
            <button type="button" [class.activo]="filtroPeriodo === 'mes'" (click)="cambiarFiltroPeriodo('mes')">Mes</button>
            <button type="button" [class.activo]="filtroPeriodo === 'anio'" (click)="cambiarFiltroPeriodo('anio')">Año</button>
          </div>

          <div class="grafico-card">
            <div class="grafico-titulo">Ingresos (S/)</div>
            <svg viewBox="0 0 320 120" class="grafico-svg">
              <polyline [attr.points]="lineaGraficoPuntos()" fill="none" stroke="#111111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <ng-container *ngFor="let p of puntosGraficoCoordenadas(); trackBy: trackByIndex">
                <circle [attr.cx]="p.x" [attr.cy]="p.y" r="3" fill="#111111"/>
              </ng-container>
            </svg>
            <div class="grafico-etiquetas">
              <span *ngFor="let p of puntosGraficoCoordenadas(); trackBy: trackByIndex">{{ p.etiqueta }}</span>
            </div>
          </div>
        </div>

        <div class="pantalla" *ngIf="pantallaActual === 'revisarInventario'">
          <div class="tabla-inventario">
            <div class="tabla-fila tabla-fila-3col tabla-header">
              <span>Producto</span><span>Stock</span><span>Últ. compra</span>
            </div>
            <div class="tabla-fila tabla-fila-3col tabla-producto" *ngFor="let p of inventario; trackBy: trackByIndex" (click)="abrirDetalleProducto(p)">
              <span>{{ p.nombre }}</span>
              <span>{{ p.stock }}</span>
              <span>{{ p.fechaUltimaCompra }}</span>
            </div>
          </div>
        </div>

        <div class="pantalla pantalla-chat" *ngIf="pantallaActual === 'chat'">
          <div class="chat-body">
            <ng-container *ngFor="let m of mensajesChat; trackBy: trackByIndex">
              <div class="msg-row" [class.usuario]="m.emisor === 'usuario'" [class.bot]="m.emisor === 'bot'">
                <div class="bubble" [ngSwitch]="m.tipo">

                  <ng-container *ngSwitchCase="'texto'">
                    <p>{{ m.texto }}</p>
                  </ng-container>

                  <ng-container *ngSwitchCase="'aclaracion'">
                    <p>{{ m.texto }}</p>
                  </ng-container>

                  <ng-container *ngSwitchCase="'productosBajos'">
                    <p class="bubble-title">Productos bajos de stock</p>
                    <ng-container *ngIf="stockBajo().length; else sinBajos">
                      <div class="producto-linea" *ngFor="let p of stockBajo(); trackBy: trackByIndex">
                        <span>{{ p.nombre }}</span><span>quedan {{ p.stock }}</span>
                      </div>
                    </ng-container>
                    <ng-template #sinBajos><p>No tienes productos bajos de stock por ahora.</p></ng-template>
                  </ng-container>

                  <ng-container *ngSwitchCase="'estadoDia'">
                    <p class="bubble-title">Estado del día</p>
                    <p>Total vendido: S/ {{ entero(ventasHoyTotal()) }}</p>
                    <p>Número de ventas: {{ ventasRegistradas.length }}</p>
                    <p>Ticket promedio: S/ {{ ticketPromedio().toFixed(2) }}</p>
                    <p>Caja estimada: S/ {{ entero(cajaEstimadaTotal()) }}</p>
                  </ng-container>

                  <ng-container *ngSwitchCase="'alertas'">
                    <p class="bubble-title">Alertas</p>
                    <p *ngIf="stockBajo().length">Stock bajo: {{ nombresCortos(stockBajo()) }}</p>
                    <p *ngIf="porVencer().length">Por vencer: {{ nombresCortos(porVencer()) }}</p>
                    <p *ngIf="sinRotacion().length">Sin rotación: {{ nombresCortos(sinRotacion()) }}</p>
                    <p>Diferencia de caja: {{ diferenciaTexto() }}</p>
                  </ng-container>

                  <ng-container *ngSwitchCase="'resumenVenta'">
                    <p class="bubble-title">Venta registrada ✓</p>
                    <div class="linea-venta" *ngFor="let l of m.venta?.lineas; trackBy: trackByIndex">
                      <div class="linea-fila">
                        <span>{{ l.nombre }}</span>
                        <span>x{{ l.cantidad }}</span>
                      </div>
                      <div class="linea-fila detalle">
                        <span>P. unit. S/ {{ l.precioUnitario.toFixed(2) }}</span>
                        <span>Subtotal S/ {{ l.subtotal.toFixed(2) }}</span>
                      </div>
                      <div class="linea-nota" *ngIf="l.notaStockInsuficiente">{{ l.notaStockInsuficiente }}</div>
                      <div class="linea-alerta" *ngIf="l.alertaStockBajo">Este producto quedó por debajo del stock mínimo</div>
                    </div>
                    <div class="total-venta">Total: S/ {{ m.venta?.total?.toFixed(2) }}</div>
                    <p class="linea-nota" *ngIf="m.noReconocidos?.length">No reconocido: "{{ m.noReconocidos?.join('", "') }}"</p>
                    <button type="button" class="btn-corregir" *ngIf="m.venta && esUltimaVentaGlobal(m.venta.id)" (click)="corregirUltimaVentaChat(m.venta.id)">Corregir registro</button>
                  </ng-container>

                  <div class="bubble-meta">
                    <span class="check-doble" *ngIf="m.emisor === 'usuario'"><ng-container [ngTemplateOutlet]="iconCheckDouble"></ng-container></span>
                    <span class="bubble-hora">{{ m.hora }}</span>
                  </div>

                </div>
              </div>
            </ng-container>
          </div>

          <div class="quick-replies">
            <button type="button" (click)="quickReply('venta')">Registrar venta</button>
            <button type="button" (click)="quickReply('productos')">Consultar productos</button>
            <button type="button" (click)="quickReply('estado')">Estado del día</button>
            <button type="button" (click)="quickReply('alertas')">Ver alertas</button>
          </div>

          <div class="input-row">
            <span class="input-icono"><ng-container [ngTemplateOutlet]="iconSmiley"></ng-container></span>
            <input #campoChat type="text" placeholder="Escribe un mensaje" (keyup.enter)="enviarMensajeChat(campoChat)">
            <span class="input-icono"><ng-container [ngTemplateOutlet]="iconPaperclip"></ng-container></span>
            <span class="input-icono"><ng-container [ngTemplateOutlet]="iconCamera"></ng-container></span>
            <button type="button" class="btn-enviar-circular" (click)="enviarMensajeChat(campoChat)">
              <ng-container [ngTemplateOutlet]="iconSend"></ng-container>
            </button>
          </div>
        </div>

      </div>

      <div class="drawer-overlay" *ngIf="menuAbierto" (click)="cerrarMenu()">
        <div class="drawer-panel" (click)="$event.stopPropagation()">
          <div class="drawer-header">BodeYa</div>
          <button type="button" class="drawer-item" [class.activo]="pantallaActual === 'registro'" (click)="irA('registro')">Inicio</button>
          <button type="button" class="drawer-item" [class.activo]="pantallaActual === 'revisarInventario'" (click)="irA('revisarInventario')">Revisar Inventario</button>
          <button type="button" class="drawer-item" [class.activo]="pantallaActual === 'inventario'" (click)="irA('inventario')">Alertas</button>
          <button type="button" class="drawer-item" [class.activo]="pantallaActual === 'caja'" (click)="irA('caja')">Estado de Cuenta</button>
          <button type="button" class="drawer-item" [class.activo]="pantallaActual === 'chat'" (click)="irA('chat')">WhatsApp – Registro</button>
        </div>
      </div>

      <div class="modal-overlay" *ngIf="modalActivo" (click)="cerrarModal()">
        <div class="modal-card" (click)="$event.stopPropagation()">
          <ng-container [ngSwitch]="modalActivo">

            <ng-container *ngSwitchCase="'producto'">
              <ng-container *ngIf="productoSeleccionado as p">
                <h3>{{ p.nombre }}</h3>
                <p>Precio: S/ {{ p.precio.toFixed(2) }}</p>
                <p>Stock actual: {{ p.stock }}</p>
                <p>Stock mínimo: {{ p.stockMinimo }}</p>
                <p>Última compra: {{ p.fechaUltimaCompra }}</p>
                <p>Estado: {{ estadoProducto(p) }}</p>
              </ng-container>
            </ng-container>

            <ng-container *ngSwitchCase="'alerta'">
              <ng-container *ngIf="alertaSeleccionada as a">
                <h3>{{ a.subtitulo }}</h3>
                <p>{{ a.detalle }}</p>
              </ng-container>
            </ng-container>

            <ng-container *ngSwitchCase="'recomendacion'">
              <ng-container *ngIf="recomendacionSeleccionada as r">
                <h3>{{ tituloRecomendacion(r) }}</h3>
                <p><strong>Motivo:</strong> {{ r.motivo }}</p>
                <p><strong>Impacto esperado:</strong> {{ r.impacto }}</p>
                <p><strong>Acción sugerida:</strong> {{ r.accion }}</p>
              </ng-container>
            </ng-container>

          </ng-container>
          <button type="button" class="btn-cerrar-modal" (click)="cerrarModal()">Cerrar</button>
        </div>
      </div>

      <div class="modal-overlay" *ngIf="guiaVisible" (click)="toggleGuia()">
        <div class="modal-card" (click)="$event.stopPropagation()">
          <h3>Guía del entrevistador</h3>
          <p>Pide al bodeguero que registre estas ventas durante la simulación, usando Inicio o el chat:</p>
          <ol class="guia-lista">
            <li *ngFor="let v of ventasPrueba; trackBy: trackByIndex">{{ v }}</li>
          </ol>
          <button type="button" class="btn-cerrar-modal" (click)="toggleGuia()">Cerrar</button>
        </div>
      </div>

    </div>
  </div>
  `,
  styles: [`
    :host {
      display: block;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
      color: #1a1a1a;
    }

    .app-shell {
      min-height: 100vh;
      background: #ececec;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 24px 12px 60px;
      box-sizing: border-box;
    }

    .phone {
      width: 100%;
      max-width: 390px;
      background: #ffffff;
      border: 1px solid #dcdcdc;
      border-radius: 32px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      height: 730px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
      position: relative;
    }

    .status-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 20px 0;
      font-size: 13px;
      font-weight: 600;
      color: #111111;
    }

    .status-icons {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .icon-signal { width: 16px; height: 10px; }
    .icon-wifi { width: 15px; height: 11px; }
    .icon-battery { width: 22px; height: 11px; }

    .app-bar {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 10px 12px;
    }

    .app-bar-title {
      flex: 1;
      font-size: 16px;
      font-weight: 700;
      color: #111111;
    }

    .icon-btn {
      width: 34px;
      height: 34px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      color: #111111;
      cursor: pointer;
      padding: 0;
    }

    .icon-btn svg {
      width: 20px;
      height: 20px;
    }

    .icon-btn-spacer {
      width: 34px;
      flex-shrink: 0;
    }

    .chat-header .app-bar-chat {
      gap: 8px;
    }

    .chat-avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: #22262b;
      color: #ffffff;
      font-size: 14px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .chat-contact-info {
      flex: 1;
      min-width: 0;
    }

    .chat-contact-name {
      font-size: 14px;
      font-weight: 700;
      color: #111111;
    }

    .chat-contact-status {
      font-size: 11px;
      color: #6b6b6b;
    }

    .phone-body {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }

    .pantalla {
      padding: 12px 14px 18px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .pantalla-chat {
      padding: 0;
      flex: 1;
      min-height: 0;
    }

    .lista-filas {
      display: flex;
      flex-direction: column;
      gap: 9px;
    }

    .fila-card {
      display: flex;
      align-items: center;
      gap: 12px;
      background: #ffffff;
      border: 1px solid #e6e6e6;
      border-radius: 14px;
      padding: 11px 13px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.04);
      cursor: pointer;
    }

    .fila-icono {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: #f2f2f2;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      color: #1a1a1a;
    }

    .fila-icono svg {
      width: 20px;
      height: 20px;
    }

    .fila-texto {
      flex: 1;
      font-size: 13.5px;
      color: #1a1a1a;
    }

    .fila-valor {
      font-size: 15px;
      font-weight: 700;
      color: #1a1a1a;
    }

    .btn-principal {
      padding: 13px;
      background: #111111;
      color: #ffffff;
      border: none;
      border-radius: 14px;
      font-size: 14.5px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-family: inherit;
    }

    .btn-principal:disabled {
      background: #b0b0b0;
      cursor: default;
    }

    .btn-principal:hover:not(:disabled) {
      background: #2c2c2c;
    }

    .btn-outline {
      padding: 10px;
      background: #ffffff;
      border: 1.4px solid #111111;
      border-radius: 12px;
      font-size: 12.5px;
      font-weight: 700;
      color: #111111;
      cursor: pointer;
      font-family: inherit;
    }

    .btn-outline:hover {
      background: #f2f2f2;
    }

    .tip {
      font-size: 12px;
      color: #6b6b6b;
      text-align: center;
      margin-top: 2px;
    }

    .registro-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .tarjeta-icono {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: #ffffff;
      border: 1px solid #e6e6e6;
      border-radius: 16px;
      padding: 18px 10px;
      cursor: pointer;
      box-shadow: 0 1px 2px rgba(0,0,0,0.04);
      font-family: inherit;
    }

    .tarjeta-icono:hover {
      background: #fafafa;
    }

    .tarjeta-icono-circulo {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: #f2f2f2;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #1a1a1a;
    }

    .tarjeta-icono-circulo svg {
      width: 24px;
      height: 24px;
    }

    .tarjeta-icono-label {
      font-size: 12.5px;
      font-weight: 600;
      text-align: center;
      color: #1a1a1a;
    }

    .tip-card {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #fafafa;
      border: 1px dashed #c9c9c9;
      border-radius: 12px;
      padding: 10px 12px;
      font-size: 11.5px;
      color: #4a4a4a;
    }

    .tip-icono svg {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
    }

    .btn-volver {
      align-self: flex-start;
      background: none;
      border: none;
      color: #4a4a4a;
      font-size: 12px;
      padding: 0;
      cursor: pointer;
      font-family: inherit;
    }

    .formulario {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .formulario-titulo {
      font-size: 15px;
      margin: 0;
    }

    .campo-linea {
      display: flex;
      gap: 6px;
    }

    .select-campo, .input-ancho {
      flex: 1;
      padding: 10px;
      border: 1px solid #d9d9d9;
      border-radius: 10px;
      font-size: 13px;
      background: #fafafa;
      color: #1a1a1a;
      min-width: 0;
      font-family: inherit;
    }

    .mensaje-registro {
      font-size: 12px;
      font-style: italic;
      color: #1a1a1a;
      background: #f2f2f2;
      border-radius: 10px;
      padding: 8px 10px;
      margin: 0;
    }

    .lista-alertas-cards {
      display: flex;
      flex-direction: column;
      gap: 9px;
    }

    .alerta-card {
      display: flex;
      align-items: center;
      gap: 12px;
      background: #ffffff;
      border: 1px solid #e6e6e6;
      border-radius: 14px;
      padding: 11px 13px;
      cursor: pointer;
      box-shadow: 0 1px 2px rgba(0,0,0,0.04);
    }

    .alerta-card-icono {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: #f2f2f2;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      color: #1a1a1a;
    }

    .alerta-card-icono svg {
      width: 20px;
      height: 20px;
    }

    .alerta-card-texto {
      flex: 1;
      min-width: 0;
    }

    .alerta-card-titulo {
      font-weight: 700;
      font-size: 13px;
    }

    .alerta-card-subtitulo {
      font-size: 12px;
      color: #6b6b6b;
      margin-top: 2px;
    }

    .alerta-card-chevron {
      flex-shrink: 0;
      color: #9c9c9c;
    }

    .alerta-card-chevron svg {
      width: 16px;
      height: 16px;
    }

    .sin-alertas {
      font-size: 12px;
      color: #6b6b6b;
      margin: 0;
    }

    .tabla-inventario {
      border: 1px solid #e6e6e6;
      border-radius: 14px;
      overflow: hidden;
    }

    .tabla-fila {
      display: grid;
      grid-template-columns: 2fr 0.8fr 0.8fr 1fr;
      gap: 4px;
      padding: 9px 10px;
      font-size: 11px;
      border-bottom: 1px solid #eee;
      align-items: center;
    }

    .tabla-fila:last-child {
      border-bottom: none;
    }

    .tabla-header {
      background: #f5f5f5;
      color: #4a4a4a;
      font-weight: 700;
    }

    .tabla-producto {
      cursor: pointer;
      background: #ffffff;
    }

    .tabla-producto:hover {
      background: #fafafa;
    }

    .tabla-fila.tabla-fila-3col {
      grid-template-columns: 2fr 0.8fr 1.1fr;
    }

    .filtros-periodo {
      display: flex;
      background: #f2f2f2;
      border-radius: 12px;
      padding: 4px;
      gap: 4px;
    }

    .filtros-periodo button {
      flex: 1;
      padding: 8px 4px;
      background: none;
      border: none;
      border-radius: 9px;
      font-size: 12px;
      font-weight: 600;
      color: #4a4a4a;
      cursor: pointer;
      font-family: inherit;
    }

    .filtros-periodo button.activo {
      background: #111111;
      color: #ffffff;
    }

    .grafico-card {
      background: #ffffff;
      border: 1px solid #e6e6e6;
      border-radius: 14px;
      padding: 14px 12px 10px;
    }

    .grafico-titulo {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: #9c9c9c;
      margin-bottom: 6px;
    }

    .grafico-svg {
      width: 100%;
      height: auto;
      display: block;
    }

    .grafico-etiquetas {
      display: flex;
      justify-content: space-between;
      margin-top: 4px;
      padding: 0 2px;
    }

    .grafico-etiquetas span {
      font-size: 9.5px;
      color: #9c9c9c;
      flex: 1;
      text-align: center;
    }

    .seccion-divisor {
      margin-top: 6px;
      padding-top: 14px;
      border-top: 1px solid #e6e6e6;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: #9c9c9c;
    }

    .lista-recomendaciones {
      background: #ffffff;
      border: 1px solid #e6e6e6;
      border-radius: 14px;
      overflow: hidden;
    }

    .recomendacion-fila {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 13px 14px;
      border-bottom: 1px solid #eee;
      cursor: pointer;
    }

    .recomendacion-fila:last-child {
      border-bottom: none;
    }

    .recomendacion-fila:hover {
      background: #fafafa;
    }

    .recomendacion-icono svg {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
      color: #1a1a1a;
    }

    .recomendacion-texto {
      font-size: 13px;
      color: #1a1a1a;
    }

    .chat-body {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      padding: 12px 10px;
      display: flex;
      flex-direction: column;
      gap: 9px;
      background: #efefef;
    }

    .msg-row {
      display: flex;
      max-width: 82%;
    }

    .msg-row.bot {
      align-self: flex-start;
    }

    .msg-row.usuario {
      align-self: flex-end;
    }

    .bubble {
      border-radius: 14px;
      padding: 8px 10px;
      font-size: 13px;
      line-height: 1.45;
    }

    .msg-row.bot .bubble {
      background: #ffffff;
      color: #1a1a1a;
      border-bottom-left-radius: 3px;
    }

    .msg-row.usuario .bubble {
      background: #dcf4e0;
      color: #14321f;
      border-bottom-right-radius: 3px;
    }

    .bubble p {
      margin: 0 0 4px;
    }

    .bubble p:last-of-type {
      margin-bottom: 0;
    }

    .bubble-title {
      font-weight: 700;
      margin-bottom: 6px !important;
    }

    .bubble-meta {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 4px;
      margin-top: 4px;
    }

    .check-doble {
      color: #4c9a6a;
      display: flex;
      align-items: center;
    }

    .check-doble svg {
      width: 14px;
      height: 8px;
    }

    .bubble-hora {
      font-size: 10px;
      color: #8a8a8a;
    }

    .producto-linea {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      padding: 3px 0;
      border-bottom: 1px dashed #d9d9d9;
      font-size: 12px;
    }

    .producto-linea:last-child {
      border-bottom: none;
    }

    .linea-venta {
      border-top: 1px solid #e0e0e0;
      padding-top: 6px;
      margin-top: 6px;
    }

    .linea-venta:first-of-type {
      border-top: none;
      padding-top: 0;
      margin-top: 0;
    }

    .linea-fila {
      display: flex;
      justify-content: space-between;
      gap: 10px;
    }

    .linea-fila.detalle {
      font-size: 11px;
      color: #4a4a4a;
    }

    .linea-nota {
      font-size: 11px;
      font-style: italic;
      margin-top: 2px;
    }

    .linea-alerta {
      font-size: 11px;
      font-weight: 700;
      margin-top: 2px;
      padding: 2px 6px;
      background: #4a4a4a;
      color: #ffffff;
      border-radius: 6px;
      display: inline-block;
    }

    .total-venta {
      margin-top: 8px;
      padding-top: 6px;
      border-top: 1px solid #c9e6cd;
      font-weight: 700;
      font-size: 13px;
    }

    .msg-row.bot .total-venta {
      border-top: 1px solid #d9d9d9;
    }

    .btn-corregir {
      margin-top: 8px;
      font-size: 11px;
      padding: 5px 9px;
      background: #ffffff;
      border: 1px solid #1a1a1a;
      border-radius: 8px;
      color: #1a1a1a;
      cursor: pointer;
      font-family: inherit;
    }

    .quick-replies {
      display: flex;
      gap: 6px;
      padding: 8px 10px;
      background: #efefef;
      border-top: 1px solid #dcdcdc;
      overflow-x: auto;
      flex-shrink: 0;
    }

    .quick-replies button {
      flex: 0 0 auto;
      font-size: 11px;
      padding: 6px 10px;
      background: #ffffff;
      border: 1px solid #d9d9d9;
      border-radius: 16px;
      color: #1a1a1a;
      cursor: pointer;
      font-family: inherit;
    }

    .quick-replies button:hover {
      background: #f2f2f2;
    }

    .input-row {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 10px;
      border-top: 1px solid #dcdcdc;
      background: #f5f5f5;
      flex-shrink: 0;
    }

    .input-row input {
      flex: 1;
      min-width: 0;
      padding: 9px 12px;
      border: none;
      border-radius: 18px;
      font-size: 13px;
      background: #ffffff;
      color: #1a1a1a;
      font-family: inherit;
    }

    .input-row input:focus {
      outline: 1.5px solid #b9b9b9;
    }

    .input-icono {
      width: 24px;
      height: 24px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #6b6b6b;
    }

    .input-icono svg {
      width: 20px;
      height: 20px;
    }

    .btn-enviar-circular {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #3fae6f;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      cursor: pointer;
      color: #ffffff;
    }

    .btn-enviar-circular svg {
      width: 16px;
      height: 16px;
    }

    .drawer-overlay {
      position: absolute;
      inset: 0;
      background: rgba(17,17,17,0.45);
      display: flex;
      z-index: 40;
    }

    .drawer-panel {
      width: 74%;
      max-width: 280px;
      height: 100%;
      background: #ffffff;
      padding: 22px 16px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: 3px;
      box-shadow: 2px 0 12px rgba(0,0,0,0.15);
    }

    .drawer-header {
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: #9c9c9c;
      margin-bottom: 8px;
    }

    .drawer-item {
      text-align: left;
      padding: 12px 10px;
      border-radius: 10px;
      font-size: 14px;
      color: #1a1a1a;
      background: none;
      border: none;
      cursor: pointer;
      font-family: inherit;
    }

    .drawer-item.activo {
      background: #f0f0f0;
      font-weight: 700;
    }

    .modal-overlay {
      position: absolute;
      inset: 0;
      background: rgba(17,17,17,0.55);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      box-sizing: border-box;
      z-index: 50;
    }

    .modal-card {
      background: #ffffff;
      border-radius: 16px;
      padding: 16px;
      width: 100%;
      max-width: 320px;
      max-height: 85%;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .modal-card h3 {
      margin: 0 0 4px;
      font-size: 15px;
    }

    .modal-card p {
      margin: 0;
      font-size: 13px;
      line-height: 1.4;
    }

    .btn-cerrar-modal {
      margin-top: 10px;
      padding: 10px;
      background: #111111;
      color: #ffffff;
      border: none;
      border-radius: 10px;
      font-size: 13px;
      cursor: pointer;
      font-family: inherit;
    }

    .guia-lista {
      list-style: decimal;
      padding-left: 18px;
      margin: 4px 0 0;
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-size: 12.5px;
    }
  `]
})
export class AppComponent {

  pantallaActual: Pantalla = 'registro';
  subVistaRegistro: SubVistaRegistro = 'menu';
  modalActivo: ModalTipo = null;
  guiaVisible = false;
  menuAbierto = false;
  mostrarTodasAlertas = false;
  filtroPeriodo: FiltroPeriodo = 'dia';

  ventasBaseHoy = 324;
  cajaBaseEstimada = 410;
  efectivoReal = 392;

  ventasRegistradas: VentaRegistrada[] = [];
  gastosRegistrados: Gasto[] = [];
  mensajeRegistro: string | null = null;

  productoSeleccionado: Producto | null = null;
  alertaSeleccionada: AlertaItem | null = null;
  recomendacionSeleccionada: Recomendacion | null = null;

  mensajesChat: MensajeChat[] = [];

  private ultimoVentaId = 0;
  private ultimoGastoId = 0;

  inventario: Producto[] = [
    { id: 'agua-san-luis', nombre: 'Agua San Luis 625 ml', nombreCorto: 'Agua', palabrasClave: ['agua', 'san', 'luis'], precio: 2.00, stock: 18, stockMinimo: 6, vencimiento: '—', vencePronto: false, diasParaVencer: 0, diasSinRotacion: 0, alertaStockBase: false, fechaUltimaCompra: '15/06/2025' },
    { id: 'coca-cola', nombre: 'Coca-Cola 500 ml', nombreCorto: 'Coca-Cola', palabrasClave: ['coca', 'cola'], precio: 3.50, stock: 12, stockMinimo: 5, vencimiento: '—', vencePronto: false, diasParaVencer: 0, diasSinRotacion: 0, alertaStockBase: false, fechaUltimaCompra: '20/06/2025' },
    { id: 'inca-kola', nombre: 'Inca Kola 500 ml', nombreCorto: 'Inca Kola', palabrasClave: ['inca', 'kola'], precio: 3.50, stock: 10, stockMinimo: 5, vencimiento: '—', vencePronto: false, diasParaVencer: 0, diasSinRotacion: 0, alertaStockBase: false, fechaUltimaCompra: '18/06/2025' },
    { id: 'leche-gloria', nombre: 'Leche Gloria tarro', nombreCorto: 'Leche', palabrasClave: ['leche', 'gloria'], precio: 4.20, stock: 14, stockMinimo: 6, vencimiento: '28/05/2025', vencePronto: false, diasParaVencer: 0, diasSinRotacion: 0, alertaStockBase: false, fechaUltimaCompra: '25/06/2025' },
    { id: 'pan-frances', nombre: 'Pan francés unidad', nombreCorto: 'Pan', palabrasClave: ['pan', 'frances'], precio: 0.40, stock: 40, stockMinimo: 15, vencimiento: '—', vencePronto: false, diasParaVencer: 0, diasSinRotacion: 0, alertaStockBase: false, fechaUltimaCompra: '01/07/2025' },
    { id: 'arroz-costeno', nombre: 'Arroz costeño 1 kg', nombreCorto: 'Arroz', palabrasClave: ['arroz', 'costeno'], precio: 5.00, stock: 8, stockMinimo: 4, vencimiento: '15/07/2025', vencePronto: false, diasParaVencer: 0, diasSinRotacion: 8, alertaStockBase: false, fechaUltimaCompra: '10/06/2025' },
    { id: 'azucar', nombre: 'Azúcar 1 kg', nombreCorto: 'Azúcar', palabrasClave: ['azucar'], precio: 4.50, stock: 7, stockMinimo: 4, vencimiento: '—', vencePronto: false, diasParaVencer: 0, diasSinRotacion: 0, alertaStockBase: false, fechaUltimaCompra: '12/06/2025' },
    { id: 'aceite-primor', nombre: 'Aceite Primor 900 ml', nombreCorto: 'Aceite', palabrasClave: ['aceite', 'primor'], precio: 9.50, stock: 6, stockMinimo: 3, vencimiento: '10/06/2025', vencePronto: true, diasParaVencer: 5, diasSinRotacion: 0, alertaStockBase: true, fechaUltimaCompra: '05/06/2025' },
    { id: 'galleta-oreo', nombre: 'Galleta Oreo personal', nombreCorto: 'Galletas', palabrasClave: ['galleta', 'oreo'], precio: 1.50, stock: 20, stockMinimo: 8, vencimiento: '20/06/2025', vencePronto: false, diasParaVencer: 0, diasSinRotacion: 10, alertaStockBase: false, fechaUltimaCompra: '22/05/2025' },
    { id: 'fideos-vittorio', nombre: 'Fideos Don Vittorio 500 g', nombreCorto: 'Fideos', palabrasClave: ['fideos', 'vittorio', 'don'], precio: 4.00, stock: 9, stockMinimo: 4, vencimiento: '—', vencePronto: false, diasParaVencer: 0, diasSinRotacion: 12, alertaStockBase: false, fechaUltimaCompra: '28/05/2025' },
    { id: 'yogurt-gloria', nombre: 'Yogurt Gloria 1 L', nombreCorto: 'Yogurt', palabrasClave: ['yogurt', 'gloria'], precio: 7.50, stock: 5, stockMinimo: 3, vencimiento: '05/07/2025', vencePronto: true, diasParaVencer: 2, diasSinRotacion: 0, alertaStockBase: true, fechaUltimaCompra: '27/06/2025' },
    { id: 'atun-florida', nombre: 'Atún Florida lata', nombreCorto: 'Atún', palabrasClave: ['atun', 'florida'], precio: 6.50, stock: 6, stockMinimo: 3, vencimiento: '—', vencePronto: false, diasParaVencer: 0, diasSinRotacion: 9, alertaStockBase: true, fechaUltimaCompra: '02/06/2025' },
  ];

  recomendaciones: Recomendacion[] = [
    { id: 'aceite', titulo: 'Repón 12 unidades de aceite.', motivo: 'El stock está cerca del mínimo.', impacto: 'Evitar quedarse sin producto en horas de alta venta.', accion: 'Comprar 12 unidades en la próxima reposición.' },
    { id: 'galletas', titulo: 'No compres más galletas esta semana.', motivo: 'Hay stock suficiente y baja rotación.', impacto: 'Evitar dinero inmovilizado.', accion: 'Esperar antes de volver a comprar.' },
    { id: 'gaseosa', titulo: 'Promueve gaseosa 500 ml.', motivo: 'Es un producto de venta frecuente.', impacto: 'Aumentar las ventas del día.', accion: 'Ofrecerla junto con pan o snacks.' },
    { id: 'caja', titulo: 'Revisa caja: diferencia S/ 18.', motivo: 'El efectivo real no coincide con el esperado.', impacto: 'Detectar errores de registro o cobro.', accion: 'Revisar ventas, gastos y efectivo.' },
    { id: 'general', titulo: 'Pequeñas acciones, grandes resultados.', motivo: 'Mantener registros simples permite mejores decisiones.', impacto: 'Mejorar el control sin agregar complejidad.', accion: 'Registrar ventas y gastos durante el día.' },
  ];

  ventasPrueba: string[] = [
    '2 Coca-Cola 500 ml, 1 pan francés',
    '1 leche Gloria tarro, 2 galleta Oreo personal',
    '1 arroz costeño 1 kg, 1 aceite Primor 900 ml',
    '3 pan francés, 1 Inca Kola 500 ml',
    '1 yogurt Gloria 1 L, 1 azúcar 1 kg',
    '2 agua San Luis 625 ml, 1 galleta Oreo personal',
    '1 atún Florida lata, 1 fideos Don Vittorio 500 g',
    '1 Coca-Cola 500 ml, 2 pan francés, 1 leche Gloria tarro',
  ];

  constructor() {
    this.agregarMensajeChat({
      emisor: 'bot',
      tipo: 'texto',
      texto: 'Hola, soy BodeYa. ¿Qué quieres hacer? Elige una opción rápida abajo o escríbeme directamente: Registrar venta, Consultar productos, Consultar estado del día o Ver alertas.',
      hora: this.horaActual(),
    });
  }

  irA(pantalla: Pantalla): void {
    this.pantallaActual = pantalla;
    this.modalActivo = null;
    this.menuAbierto = false;
    if (pantalla !== 'registro') {
      this.subVistaRegistro = 'menu';
      this.mensajeRegistro = null;
    }
  }

  abrirMenu(): void {
    this.menuAbierto = true;
  }

  cerrarMenu(): void {
    this.menuAbierto = false;
  }

  tituloPantalla(): string {
    switch (this.pantallaActual) {
      case 'registro': return 'Inicio';
      case 'inventario': return 'Alertas';
      case 'caja': return 'Estado de Cuenta';
      case 'revisarInventario': return 'Revisar Inventario';
      default: return '';
    }
  }

  headerIconDerecho(): IconoHeader {
    if (this.pantallaActual === 'inventario') return 'funnel';
    return 'none';
  }

  entero(n: number): number {
    return Math.round(n);
  }

  diferenciaTexto(): string {
    const v = this.diferenciaCaja();
    const signo = v < 0 ? '- ' : '';
    return `${signo}S/ ${Math.round(Math.abs(v))}`;
  }

  abrirFormulario(tipo: SubVistaRegistro): void {
    this.subVistaRegistro = tipo;
    this.mensajeRegistro = null;
  }

  volverARegistroMenu(): void {
    this.subVistaRegistro = 'menu';
    this.mensajeRegistro = null;
  }

  guardarMercaderia(productoId: string, cantidadStr: string): void {
    const producto = this.inventario.find((p) => p.id === productoId);
    if (!producto) {
      return;
    }
    const cantidad = parseInt(cantidadStr, 10);
    if (!cantidad || cantidad <= 0) {
      this.mensajeRegistro = 'Ingresa una cantidad válida';
      return;
    }
    producto.stock += cantidad;
    this.mensajeRegistro = 'Mercadería ingresada';
  }

  guardarActualizacionStock(productoId: string, nuevoStockStr: string): void {
    const producto = this.inventario.find((p) => p.id === productoId);
    if (!producto) {
      return;
    }
    const nuevoStock = parseInt(nuevoStockStr, 10);
    if (isNaN(nuevoStock) || nuevoStock < 0) {
      this.mensajeRegistro = 'Ingresa un stock válido';
      return;
    }
    producto.stock = nuevoStock;
    this.mensajeRegistro = 'Stock actualizado';
  }

  guardarGasto(concepto: string, montoStr: string): void {
    const conceptoLimpio = concepto.trim();
    const monto = parseFloat(montoStr);
    if (!conceptoLimpio || isNaN(monto) || monto <= 0) {
      this.mensajeRegistro = 'Completa concepto y monto';
      return;
    }
    this.ultimoGastoId++;
    this.gastosRegistrados.push({ id: this.ultimoGastoId, concepto: conceptoLimpio, monto, hora: this.horaActual() });
    this.mensajeRegistro = 'Gasto registrado';
  }

  abrirDetalleProducto(p: Producto): void {
    this.productoSeleccionado = p;
    this.modalActivo = 'producto';
  }

  abrirDetalleAlerta(a: AlertaItem): void {
    this.alertaSeleccionada = a;
    this.modalActivo = 'alerta';
  }

  abrirDetalleRecomendacion(r: Recomendacion): void {
    this.recomendacionSeleccionada = r;
    this.modalActivo = 'recomendacion';
  }

  cerrarModal(): void {
    this.modalActivo = null;
  }

  estadoProducto(p: Producto): string {
    const tags: string[] = [];
    if (p.alertaStockBase || p.stock <= p.stockMinimo) {
      tags.push('Stock bajo');
    }
    if (p.vencePronto) {
      tags.push('Por vencer');
    }
    if (p.diasSinRotacion >= 7) {
      tags.push('Sin rotación');
    }
    return tags.length ? tags.join(' · ') : 'Normal';
  }

  alertasInventario(): AlertaItem[] {
    const lista: AlertaItem[] = [];
    for (const p of this.stockBajo()) {
      lista.push({
        tipo: 'stock',
        tituloCorto: 'Stock bajo',
        subtitulo: `${p.nombreCorto}: quedan ${p.stock}`,
        detalle: `Quedan ${p.stock} unidades y el mínimo es ${p.stockMinimo}. Conviene reponer pronto para no quedarte sin stock en horas de alta venta.`,
      });
    }
    for (const p of this.porVencer()) {
      lista.push({
        tipo: 'vencimiento',
        tituloCorto: 'Producto por vencer',
        subtitulo: `${p.nombreCorto} vence en ${p.diasParaVencer} días`,
        detalle: `Vence el ${p.vencimiento}. Prioriza su venta o alguna promoción antes de esa fecha.`,
      });
    }
    for (const p of this.sinRotacion()) {
      lista.push({
        tipo: 'rotacion',
        tituloCorto: 'Sin rotación',
        subtitulo: `${p.nombreCorto} sin rotación ${p.diasSinRotacion} días`,
        detalle: `Este producto lleva ${p.diasSinRotacion} días sin venderse. Evalúa una promoción o pausa la reposición.`,
      });
    }
    return lista;
  }

  alertasVisibles(): AlertaItem[] {
    const todas = this.alertasInventario();
    return this.mostrarTodasAlertas ? todas : todas.slice(0, 3);
  }

  tituloRecomendacion(r: Recomendacion): string {
    if (r.id === 'caja') {
      return `Revisa caja: diferencia S/ ${this.entero(Math.abs(this.diferenciaCaja()))}.`;
    }
    return r.titulo;
  }

  cambiarFiltroPeriodo(f: FiltroPeriodo): void {
    this.filtroPeriodo = f;
  }

  datosPeriodoActual(): DatosPeriodo {
    if (this.filtroPeriodo === 'semana') {
      return {
        ventas: 2450,
        gastos: 680,
        puntosGrafico: [
          { etiqueta: 'Lun', valor: 210 },
          { etiqueta: 'Mar', valor: 340 },
          { etiqueta: 'Mié', valor: 265 },
          { etiqueta: 'Jue', valor: 410 },
          { etiqueta: 'Vie', valor: 505 },
          { etiqueta: 'Sáb', valor: 590 },
          { etiqueta: 'Dom', valor: 350 },
        ],
      };
    }
    if (this.filtroPeriodo === 'mes') {
      return {
        ventas: 9800,
        gastos: 2600,
        puntosGrafico: [
          { etiqueta: 'Sem 1', valor: 1550 },
          { etiqueta: 'Sem 2', valor: 1820 },
          { etiqueta: 'Sem 3', valor: 1690 },
          { etiqueta: 'Sem 4', valor: 2140 },
        ],
      };
    }
    if (this.filtroPeriodo === 'anio') {
      return {
        ventas: 118000,
        gastos: 31000,
        puntosGrafico: [
          { etiqueta: 'Q1', valor: 19500 },
          { etiqueta: 'Q2', valor: 21800 },
          { etiqueta: 'Q3', valor: 22100 },
          { etiqueta: 'Q4', valor: 23600 },
        ],
      };
    }
    const ventas = this.ventasHoyTotal();
    const gastos = this.totalGastos();
    const ingresos = this.redondear(ventas - gastos);
    const fracciones = [0.12, 0.3, 0.5, 0.7, 0.88, 1];
    const etiquetas = ['9am', '11am', '1pm', '3pm', '5pm', '7pm'];
    return {
      ventas,
      gastos,
      puntosGrafico: fracciones.map((f, i) => ({ etiqueta: etiquetas[i], valor: this.redondear(ingresos * f) })),
    };
  }

  ingresosPeriodoActual(): number {
    const d = this.datosPeriodoActual();
    return this.redondear(d.ventas - d.gastos);
  }

  puntosGraficoCoordenadas(): PuntoGraficoCoordenada[] {
    const datos = this.datosPeriodoActual().puntosGrafico;
    if (!datos.length) {
      return [];
    }
    const valores = datos.map((d) => d.valor);
    const maxVal = Math.max(...valores, 1);
    const minVal = Math.min(0, ...valores);
    const rango = maxVal - minVal || 1;
    const anchoTotal = 300;
    const altoTotal = 90;
    const paso = datos.length > 1 ? anchoTotal / (datos.length - 1) : 0;
    return datos.map((d, i) => ({
      etiqueta: d.etiqueta,
      valor: d.valor,
      x: 10 + i * paso,
      y: 10 + altoTotal - ((d.valor - minVal) / rango) * altoTotal,
    }));
  }

  lineaGraficoPuntos(): string {
    return this.puntosGraficoCoordenadas().map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  }

  ventasHoyTotal(): number {
    return this.redondear(this.ventasBaseHoy + this.ventasRegistradas.reduce((acc, v) => acc + v.total, 0));
  }

  totalGastos(): number {
    return this.redondear(this.gastosRegistrados.reduce((acc, g) => acc + g.monto, 0));
  }

  cajaEstimadaTotal(): number {
    return this.redondear(this.cajaBaseEstimada + this.ventasRegistradas.reduce((acc, v) => acc + v.total, 0) - this.totalGastos());
  }

  diferenciaCaja(): number {
    return this.redondear(this.efectivoReal - this.cajaEstimadaTotal());
  }

  ticketPromedio(): number {
    if (!this.ventasRegistradas.length) {
      return 0;
    }
    return this.redondear(this.ventasRegistradas.reduce((acc, v) => acc + v.total, 0) / this.ventasRegistradas.length);
  }

  stockBajo(): Producto[] {
    return this.inventario.filter((p) => p.alertaStockBase || p.stock <= p.stockMinimo);
  }

  porVencer(): Producto[] {
    return this.inventario.filter((p) => p.vencePronto);
  }

  sinRotacion(): Producto[] {
    return this.inventario.filter((p) => p.diasSinRotacion >= 7);
  }

  nombresCortos(lista: Producto[]): string {
    return lista.map((p) => p.nombreCorto).join(', ');
  }

  toggleGuia(): void {
    this.guiaVisible = !this.guiaVisible;
  }

  enviarMensajeChat(input: HTMLInputElement): void {
    const texto = input.value.trim();
    if (!texto) {
      return;
    }
    input.value = '';
    this.agregarMensajeChat({ emisor: 'usuario', tipo: 'texto', texto, hora: this.horaActual() });

    const intencion = this.detectarIntencion(texto);
    if (intencion === 'estado') {
      this.responderEstadoDia();
      return;
    }
    if (intencion === 'productos') {
      this.responderProductosBajos();
      return;
    }
    if (intencion === 'alertas') {
      this.responderAlertas();
      return;
    }
    this.procesarVentaChat(texto);
  }

  quickReply(accion: 'venta' | 'productos' | 'estado' | 'alertas'): void {
    if (accion === 'venta') {
      this.agregarMensajeChat({ emisor: 'usuario', tipo: 'texto', texto: 'Registrar venta', hora: this.horaActual() });
      this.agregarMensajeChat({
        emisor: 'bot',
        tipo: 'texto',
        texto: 'Escribe la venta como quieras, por ejemplo: 2 coca cola, 1 pan francés. Puedes separar los productos con comas.',
        hora: this.horaActual(),
      });
      return;
    }
    if (accion === 'productos') {
      this.agregarMensajeChat({ emisor: 'usuario', tipo: 'texto', texto: '¿Qué productos me faltan?', hora: this.horaActual() });
      this.responderProductosBajos();
      return;
    }
    if (accion === 'estado') {
      this.agregarMensajeChat({ emisor: 'usuario', tipo: 'texto', texto: '¿Cuánto vendí hoy?', hora: this.horaActual() });
      this.responderEstadoDia();
      return;
    }
    this.agregarMensajeChat({ emisor: 'usuario', tipo: 'texto', texto: 'Ver alertas', hora: this.horaActual() });
    this.responderAlertas();
  }

  esUltimaVentaGlobal(idVenta: number): boolean {
    return !!this.ventasRegistradas.length && this.ventasRegistradas[this.ventasRegistradas.length - 1].id === idVenta;
  }

  corregirUltimaVentaChat(idVenta: number): void {
    if (!this.ventasRegistradas.length) {
      return;
    }
    const ultima = this.ventasRegistradas[this.ventasRegistradas.length - 1];
    if (ultima.id !== idVenta) {
      return;
    }
    this.ventasRegistradas.pop();
    for (const linea of ultima.lineas) {
      const producto = this.inventario.find((p) => p.id === linea.productoId);
      if (producto) {
        producto.stock += linea.cantidad;
      }
    }
    for (let i = this.mensajesChat.length - 1; i >= 0; i--) {
      const msg = this.mensajesChat[i];
      if (msg.tipo === 'resumenVenta' && msg.venta?.id === idVenta) {
        this.mensajesChat.splice(i, 1);
        break;
      }
    }
    this.agregarMensajeChat({
      emisor: 'bot',
      tipo: 'texto',
      texto: 'Registro corregido y stock restaurado. Vuelve a escribir la venta correcta.',
      hora: this.horaActual(),
    });
  }

  private responderProductosBajos(): void {
    this.agregarMensajeChat({ emisor: 'bot', tipo: 'productosBajos', hora: this.horaActual() });
  }

  private responderEstadoDia(): void {
    this.agregarMensajeChat({ emisor: 'bot', tipo: 'estadoDia', hora: this.horaActual() });
  }

  private responderAlertas(): void {
    this.agregarMensajeChat({ emisor: 'bot', tipo: 'alertas', hora: this.horaActual() });
  }

  private detectarIntencion(texto: string): IntencionChat {
    const norm = this.normalizar(texto);
    if (/cuanto vendi|como va mi caja|\bcaja\b|\bvendi\b/.test(norm)) {
      return 'estado';
    }
    if (/que me falta|\bfalta\b|bajo de stock|\bstock\b/.test(norm)) {
      return 'productos';
    }
    if (/alerta/.test(norm)) {
      return 'alertas';
    }
    const segmentos = this.extraerSegmentos(texto);
    for (const segmento of segmentos) {
      const normalizado = this.normalizar(segmento);
      const conCantidad = normalizado.match(/^(\d+)\s*(.*)$/);
      const descripcion = conCantidad ? conCantidad[2] : normalizado;
      if (this.buscarProducto(descripcion)) {
        return 'venta';
      }
    }
    return 'ambiguo';
  }

  private procesarVentaChat(texto: string): void {
    const segmentos = this.extraerSegmentos(texto);
    const lineas: LineaVenta[] = [];
    const noReconocidos: string[] = [];

    for (const segmento of segmentos) {
      const normalizado = this.normalizar(segmento);
      const conCantidad = normalizado.match(/^(\d+)\s*(.*)$/);
      let cantidad = 1;
      let descripcion = normalizado;
      if (conCantidad) {
        cantidad = parseInt(conCantidad[1], 10) || 1;
        descripcion = conCantidad[2];
      }
      const producto = this.buscarProducto(descripcion);
      if (!producto) {
        noReconocidos.push(segmento);
        continue;
      }
      lineas.push(this.construirLineaVenta(producto, cantidad));
    }

    if (!lineas.length) {
      this.agregarMensajeChat({
        emisor: 'bot',
        tipo: 'aclaracion',
        texto: `No reconocí "${noReconocidos.join('", "')}". ¿Puedes escribir el nombre del producto tal como lo conoces? Ej: coca cola, pan francés, leche gloria.`,
        hora: this.horaActual(),
      });
      return;
    }

    const venta = this.crearVentaDesdeLineas(lineas, texto, 'chat');
    this.agregarMensajeChat({
      emisor: 'bot',
      tipo: 'resumenVenta',
      venta,
      noReconocidos: noReconocidos.length ? noReconocidos : undefined,
      hora: this.horaActual(),
    });
  }

  private construirLineaVenta(producto: Producto, cantidadSolicitada: number): LineaVenta {
    let cantidad = cantidadSolicitada;
    let nota: string | undefined;
    if (cantidad > producto.stock) {
      nota = `Stock insuficiente, solo quedaban ${producto.stock} unidades`;
      cantidad = producto.stock;
    }
    producto.stock -= cantidad;
    const subtotal = this.redondear(cantidad * producto.precio);
    return {
      productoId: producto.id,
      nombre: producto.nombre,
      cantidad,
      precioUnitario: producto.precio,
      subtotal,
      stockRestante: producto.stock,
      alertaStockBajo: producto.stock <= producto.stockMinimo,
      notaStockInsuficiente: nota,
    };
  }

  private crearVentaDesdeLineas(lineas: LineaVenta[], textoOriginal: string, origen: 'manual' | 'chat'): VentaRegistrada {
    const total = this.redondear(lineas.reduce((acc, l) => acc + l.subtotal, 0));
    this.ultimoVentaId++;
    const venta: VentaRegistrada = { id: this.ultimoVentaId, lineas, total, textoOriginal, origen };
    this.ventasRegistradas.push(venta);
    return venta;
  }

  private normalizar(texto: string): string {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[.,;:]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private extraerSegmentos(texto: string): string[] {
    return texto
      .split(/,|;|\n|\sy\s/i)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  private buscarProducto(descripcionNormalizada: string): Producto | null {
    let mejor: Producto | null = null;
    let mejorPuntaje = 0;
    for (const p of this.inventario) {
      let puntaje = 0;
      for (const palabra of p.palabrasClave) {
        if (descripcionNormalizada.includes(palabra)) {
          puntaje++;
        }
      }
      if (puntaje > mejorPuntaje) {
        mejorPuntaje = puntaje;
        mejor = p;
      }
    }
    return mejorPuntaje > 0 ? mejor : null;
  }

  private agregarMensajeChat(m: MensajeChat): void {
    this.mensajesChat.push(m);
  }

  private horaActual(): string {
    const d = new Date();
    const horas = d.getHours().toString().padStart(2, '0');
    const minutos = d.getMinutes().toString().padStart(2, '0');
    return `${horas}:${minutos}`;
  }

  private redondear(n: number): number {
    return Math.round(n * 100) / 100;
  }

  trackByIndex(index: number): number {
    return index;
  }
}

bootstrapApplication(AppComponent).catch((err) => console.error(err));