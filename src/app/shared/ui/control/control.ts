import { Directive, inject, input, signal } from '@angular/core';
import { ControlValueAccessor, NgControl, ValidationErrors, Validators } from '@angular/forms';

const MENSAJES: Record<string, (error: any) => string> = {
  required: () => 'El campo es obligatorio',
  email: () => 'El correo no es válido',
  pattern: () => 'Formato no válido',
  min: (e) => `Debe ser mayor o igual a ${e.min}`,
  max: (e) => `Debe ser menor o igual a ${e.max}`,
  minlength: (e) => `El campo debe tener un mínimo de ${e.requiredLength} caracteres`,
  maxlength: (e) => `El campo debe tener un maximo de ${e.requiredLength} caracteres`,
};

@Directive()
export abstract class GmControl<T> implements ControlValueAccessor {
  readonly mensajes = input<Record<string, string>>({});
  protected abstract readonly vacio: T;
  protected readonly valor = signal<T | null>(null);
  protected readonly deshabilitadoPorFormulario = signal(false);
  private readonly ngControl = inject(NgControl, { self: true, optional: true });
  private alCambiar: (valor: T) => void = () => {};
  private alTocar: () => void = () => {};

  constructor() {
    if (this.ngControl) this.ngControl.valueAccessor = this;
  }

  writeValue(valor: T | null): void {
    this.valor.set(valor ?? this.vacio);
  }

  registerOnChange(fn: (valor: T) => void): void {
    this.alCambiar = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.alTocar = fn;
  }

  setDisabledState(deshabilitado: boolean): void {
    this.deshabilitadoPorFormulario.set(deshabilitado);
  }

  protected cambiar(valor: T): void {
    this.valor.set(valor);
    this.alCambiar(valor);
  }

  protected tocar(): void {
    this.alTocar();
  }

  protected conAsterisco(etiqueta: string): string {
    return this.ngControl?.control?.hasValidator(Validators.required) ? `${etiqueta} *` : etiqueta;
  }

  protected error(): string | null {
    const control = this.ngControl?.control;
    if (!control || !control.invalid || !control.touched) return null;
    return mensajeDeError(control.errors, this.mensajes());
  }
}

function mensajeDeError(
  errores: ValidationErrors | null,
  propios: Record<string, string>,
): string | null {
  if (!errores) return null;
  const [clave, detalle] = Object.entries(errores)[0];
  return propios[clave] ?? MENSAJES[clave]?.(detalle) ?? 'Valor no válido';
}

export const ESTILOS_CONTROL = `
  :host {
    display: block;
    min-width: 0;
  }
  .error {
    display: block;
    margin-top: 4px;
    overflow: hidden;
    color: var(--peligro);
    font-size: var(--texto-sm);
    line-height: 1.2;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;
