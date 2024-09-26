import { supportedMimes } from "../config/filesystem.js";
import {v4 as uuidv4} from "uuid"
import fs from "fs"
export const imageValidator = (size,mime) =>{

    if(bytesToMB(size) > 3){
        return "Image size must be less than 3 MB";
    }
    else if(!supportedMimes.includes(mime)){
            return "Image size must be jpg, gif,jpeg, png,webp, svg,"
    }
    // if all good size and type are supported
    return null;
};

export const generateRandomNum = ()=>{
    return uuidv4();
};

export const bytesToMB = (bytes)=> {
    return bytes/(1024*1024);
};


export const getImageUrl = (imgName)=>{
    return `${process.env.APP_URL}/images/${imgName}`;
}

export const removeImage = (imgName)=>{
    const path = process.cwd() + "/public/images" + imgName;
    console.log(path);
    
    if(fs.existsSync(path)){
        fs.unlinkSync(path);
    }    
}