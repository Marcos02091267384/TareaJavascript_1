
import { Context } from 'telegraf';

class DatabaseConnection {
    private cliente: Client;

    constructor(DatabaseNombre: string) {
        

    }
    public abrir(): void {
        this.
    }
    public cerrar(): void {
        this.cliente.end;
    }

    public  async query(text: string, params?: any[]) {
        const func = async (text: string, params?: any[]): Promise<any[]> => {
            try {
                return (await this.cliente.query(text, params)).rows;
            } catch (error) {
                console.error('Error executing query', error);
                throw error;
            }
        }
        const dataReturn= await func(text,params);
        console.log(dataReturn);
        return dataReturn;
      }
      
     

    public async crearUsuario(id: number, nombreUsuario: string, clave: string){
        await this.query(`SELECT crear_usuario(${id},${nombreUsuario},${clave})`,);
    }
    public async agregarProducto(url:string, precio:number,cantidad:number,desc:string){
        await this.query(`SELECT crear_usuario(${url},${precio},${cantidad},${desc})`,);
    }

    public async ExisteUsuario(id:number){
        return  await this.query(`Select existe_usuario(${id})`);
    }
    public async listaProductos(){
        return await this.query(`Select productos()`);
    }

}


function BDConectar(baseDatos: string): DatabaseConnection {
    return new DatabaseConnection(baseDatos);
}
module.exports = { BDConectar };