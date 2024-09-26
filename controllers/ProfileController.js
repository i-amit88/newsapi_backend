import { errors } from "@vinejs/vine";
import { generateRandomNum, imageValidator } from "../utils/helper.js";
import prisma from "../db/db.config.js";

class ProfileController {

    static async index(req, res) {
        try {
            const user = req.user;
            return res.json({
                status: 200,
                user,
            });
        } catch (error) {
            return res.json({
                status: 500,
                message: "Internal Server Error",
            })
        }
    }
    static async show() { }
    static async destroy() { }
    static async store() { }
    static async update(req, res) {

        try {
            const { id } = req.params;
            // req will consist the files that will be uploaded 
            if (!req.files || Object.keys(req.files).length === 0) {
                return res.status(400).json({ status: 400, message: 'Profile image is required' });
            }
            //profile is the input field name
            const profile = req.files.profile;
            const message = imageValidator(profile.size, profile.mimetype,);
            if (message !== null) {
                return res.status(400).json({
                    errors: {
                        profile: message
                    }
                });
            }

            const imgExt = profile?.name.split(".");
            const imgName = generateRandomNum() + "." + imgExt[1];

            const uploadPath = process.cwd() + "/public/images/" + imgName;

            profile.mv(uploadPath, (err) => {
                if (err) throw err;
            })

            //update to database also
            await prisma.users.update({
                data: {
                    profile: imgName,
                },
                where: {
                    id: Number(id),
                }
            })

            return res.json({
                status: 200,
                message: 'Profile updated successfully'
            })
        } catch (error) {
            return res.json({
                status: 500,
                message: "Internal Server Error"
            })
        }
    }
};

export default ProfileController;