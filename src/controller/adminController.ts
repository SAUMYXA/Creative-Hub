export {};
import { random } from 'lodash';
const Category = require('../model/categoryModel');
const sharp = require('sharp');
const bcrypt = require('bcryptjs');
const {
    S3
} = require("@aws-sdk/client-s3");
const customlog=require("../controller/loggerController")

type s3params= {
    Bucket: string,
    Key: string,
    Body: Buffer,
    ContentType: string,
    ACL: string
}
const BUCKET_NAME=process.env.BUCKET_NAME;
const BUCKET_REGION=process.env.BUCKET_REGION;    
const ACCESS_KEY=process.env.ACCESS_KEY;
const SECRET_ACCESS_KEY=process.env.SECRET_ACCESS_KEY;

const s3=new S3({
    credentials:{
        accessKeyId: ACCESS_KEY,
        secretAccessKey: SECRET_ACCESS_KEY,
    },
    region:BUCKET_REGION
})


exports.uploadCategory = async (req: any, res: any) => {
    try {
        const buffer= await sharp(req.file.buffer).resize({height:1920,width:1080,fit:"contain"}).toBuffer();
        const params: s3params={
            Bucket:BUCKET_NAME+`/main/admin/category/${req.body.name}`,
            Key: req.body.imageName,
            Body: buffer,
            ContentType: req.file.mimetype,
            ACL:'public-read'
        }

        await s3.putObject(params);

        const category=await Category.findOne({name: req.body.name});

        if(category) {
            category.imageNames.push(req.body.imageName);
            category.imageUrls.push(`https://${BUCKET_NAME}.s3.amazonaws.com/main/admin/category/${req.body.name}/${req.body.imageName}`);
            category
            .save()
            .then(
                console.log(category)
                )  
            .catch((err: any) => {
            customlog.log('error','Error Occurred while uploading Category')
            res.json({error:err})});

        }
        else{

            let newCategory = new Category({
                name: req.body.name,   
                imageNames:[req.body.imageName],
                imageUrls: [`https://${BUCKET_NAME}.s3.amazonaws.com/main/admin/category/${req.body.name}/${req.body.imageName}`],
            })
            newCategory
            .save()
            .then(
                console.log(newCategory)
                )  
            .catch((err: any) => {
                customlog.log('error','Error Occurred while uploading Category')
                res.json({error:err})});

        }
        
    customlog.log('info','route: /uploadCategories msg: success')
    res.json({msg:"Category added"});

    }
    catch(err: any){
        customlog.log('error','Error Occurred while uploading Category')
        res.send({
            success: false,
            msg: err.message || "Error Occurred while uploading Category",
        });
    }
}

exports.getCategories = async (req: any, res: any) => {
    try {
        const data=await Category.find({});
        customlog.log('info','route: /getAllCategories msg: success')
        res.json(data);

    }
    catch(err: any){
        customlog.log('error','unable to get categories')
        res.send({
            success: false,
            msg: err.message || "Error Occurred while fetching Category",
        });
    }
}


exports.upload3d = async (req: any, res: any) => {
    try {
        
        const params: s3params={
            Bucket:BUCKET_NAME+`/main/admin/3d/${req.body.name}`,
            Key: req.file.originalname,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
            ACL:'public-read'
        }
        console.log(params);
        
        await s3.putObject(params);
        let link=`https://${BUCKET_NAME}.s3.amazonaws.com/main/admin/3d/${req.body.name}/${req.file.originalname}`.replace(/ /g, '+');
        customlog.log('info','route: /upload3d msg: success,3d image uploaded')
        res.json({link:link});

    }
    catch(err: any){
        customlog.log('error','Error Occurred while uploading 3d image')
        res.send({
            success: false,
            msg: err.message || "Error Occurred while fetching Category",
        });
    }
}

exports.generatesku = async(req: any , res: any) => {
    try{
            // Function to generate a random SKU for a design
            function generateDesignSKU(prefixSKU: string, counter: number): string {
                const randomNum = random(100, 999); 
                const designCounter = counter.toString()
                const designSKU = `${prefixSKU}${randomNum}${designCounter}`; // Combine prefix SKU, random number, and design counter
                return designSKU;
            }  
            const prefixSKU: string = 'TSE'; // Prefix SKU for the object 
            //Ask how to dertermine the universal 
            const objectCounter: number = 1; // Counter value for the object 
            const designSKU: string = generateDesignSKU(prefixSKU, objectCounter); // Generate the SKU for the design

            console.log(designSKU); 
    }catch (err: any) {
        customlog.log('error','error while generating SKU Token !');
        res.send({
            success: false,
            msg: err.message || "Error Occurred while generating SKU Token.",
        });
    }
}
