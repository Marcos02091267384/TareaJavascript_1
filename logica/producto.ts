class producto{
    private _descripcion:string;
    private _precio:number;
    private _urlImagen:string;
    private _cantidad:number;
    constructor(descripcion:string, precio:number,urlImagen:string,cantidad:number){
        this._descripcion=descripcion;
        this._precio=precio;
        this._urlImagen=urlImagen;
        this._cantidad=cantidad;
    }
    get descripcion(): string {
        return this._descripcion;
      }
     
      set descripcion(value: string) {
        this._descripcion = value;
      }
     
      // Getter y Setter para precio
      get precio(): number {
        return this._precio;
      }
     
      set precio(value: number) {
        this._precio = value;
      }
     
      // Getter y Setter para urlImagen
      get urlImagen(): string {
        return this._urlImagen;
      }
     
      set urlImagen(value: string) {
        this._urlImagen = value;
      }
     
      // Getter y Setter para cantidad
      get cantidad(): number {
        return this._cantidad;
      }
     
      set cantidad(value: number) {
        this._cantidad = value;
      }
}