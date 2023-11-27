import { Client } from 'pg';

class DatabaseConnection {
    private cliente: Client;

    constructor(DatabaseNombre: string) {
        this.cliente = new Client({
            user: 'postgres',
            host: 'localhost',
            database: DatabaseNombre,
            password: '02091267384',
            port: 5432,
        });

    }
    public abrir(): void {
        this.cliente.connect()
            .then(() => console.log('Connected to the database'))
            .catch(err => console.error('Connection error', err.stack));
    }
    public cerrar(): void {
        this.cliente.end;
    }

    private async query(text: string, params?: any[]): Promise<JSON[]> {
        const fun = async (text: string, params?: any[]): Promise<JSON[]> => {
            try {
                return (await this.cliente.query(text, params)).rows;
            } catch (error) {
                console.error('Error executing query', error);
                throw error;
            }
        }
        let dataReturn: any[]=[];
        dataReturn.push(await fun(text, params));
        console.log(dataReturn);
        return dataReturn;
      }
      
     

    public crearUsuario(id: number, nombreUsuario: string, clave: string):Promise<any> {
        return  this.query(`SELECT *from usuario`,);
    }
    //SELECT crear_usuario(1,'')

}


function BDConectar(baseDatos: string): DatabaseConnection {
    return new DatabaseConnection(baseDatos);
}
module.exports = { BDConectar };