export {};

const fs =require('fs')
const path=require('path')

const dir = path.join(__dirname,'..','..');  
var ErrorPath = path.join(dir,'/logs/error-log.log');
var GeneralPath = path.join(dir,'/logs/general-log.log');
if (!fs.existsSync(path.join(dir, '/logs'))) {
  fs.mkdirSync(path.join(dir, '/logs'), { recursive: true });
}
if(!fs.existsSync(ErrorPath)) fs.writeFileSync(ErrorPath, '',{flag: 'wx'})
if(!fs.existsSync(GeneralPath)) fs.writeFileSync(GeneralPath, '',{flag: 'wx'})

 const log=async (type: string,info: string)=>{
        let object='empty';
        const datetime=new Date().toLocaleString();
        if (type=="info") {   
            object=`[${type},message:${info},time:${datetime}]`;
        }
        else{
            object=`[${type},message:${info}},time:${datetime}]`;
            fs.appendFile(ErrorPath, object+ ",\n" , function (err: any) {
                if (err) throw err;
             })
        }
        fs.appendFile(GeneralPath, object+ ",\n" , function (err: any) {
            if (err) throw err;
         })
        
    }
    

module.exports={log}
