class Usuario {
    private username:string;
    private admin:boolean;
    private password:string;
    private user_id:number;
    private state:string[];
    constructor(username:string,admin:boolean,password:string,user_id:number,) {
        this.username=username;
        this.admin=admin;        
        this.password=password;
        this.user_id=user_id;
        this.state=["",""]
    }
    public getUsername():string{
        return this.username;
    }
    public getPassword():string{
        return this.password;
    }
    public esAdmin():boolean{
        return this.admin;
    }

    public setUsername(username:string):void{
        this.username=username;
    }
    public setPassword(password:string):void{
        this.password=password;
    }
    public serAdmin():void{
        this.admin=true;
    }
    public quitarAdmin():void{
        this.admin=false;
    }
}
module.exports = Usuario;