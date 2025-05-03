export class CountryISO {
  private readonly validCountries = ['PE', 'CL'];
  private readonly _value: string;

  constructor(value: string) {
    if (!this.validCountries.includes(value)) {
      throw new Error(`Invalid country ISO code: ${value}`);
    }
    this._value = value;
  }

  // Nuevo método para obtener el valor primitivo
  valueOf(): string {
    return this._value;
  }

  // Opcional: método toString para representación string
  toString(): string {
    return this._value;
  }
}
