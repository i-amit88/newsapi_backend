import jwt from 'jsonwebtoken'

const authMiddleware = (req,res,next)=>{
    //taking token from header to authenticate in different routes this will come from fronted
    const authHeader = req.headers.authorization;
    if(authHeader === null || authHeader === 'undefined'){
        return res.status(401).json({message: 'UnAuthorized'});
    }
        const token = authHeader.split(' ')[1];
        jwt.verify(token,process.env.JWT_SECRET,(err,user)=>{
            if(err){
                return res.status(403).json({message: 'Forbidden'});
            }
            req.user=user;
            next(); 
        })
}
export default authMiddleware;