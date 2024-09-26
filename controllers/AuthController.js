import prisma from "../db/db.config.js";
import vine, { errors } from "@vinejs/vine";
import { login, registerSchema } from "../validations/authValidation.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { logger } from "../config/logger.js";
import { sendEmail } from "../config/mailer.js";
class AuthController {
    static async register(req, res) {
        try {
            const body = req.body;
            const validator = vine.compile(registerSchema);
            const payload = await validator.validate(body);

            const salt = bcrypt.genSaltSync(10);
            payload.password = bcrypt.hashSync(payload.password, salt)

            // check user exists
            const findUser = await prisma.users.findUnique({
                where: {
                    email: payload.email,
                }
            })

            if (findUser) {
                return res.status(400).json({
                    errors: {
                        email: "Email already taken. Please use another one",
                    }
                })
            }
            // save to the db
            const user = await prisma.users.create({ data: payload })
            return res.json({ status: 200, message: "user craeted successfully", user })

        } catch (error) {
            console.log("error in authenticate", error);

            if (error instanceof errors.E_VALIDATION_ERROR) {
                return res.status(400).json({ errors: error.messages });
            } else {
                return res.status(500).json({
                    status: 500,
                    message: "Internal Server Error",
                });
            }
        }
    }

    static async login(req, res) {

        try {
            const body = req.body;
            const validator = vine.compile(login);
            const payload = await validator.validate(body);

            // FIND THE USER

            const findUser = await prisma.users.findUnique({
                where: { email: payload.email },
            });

            if (findUser) {

                // validate the password
                if (!bcrypt.compareSync(payload.password, findUser.password)) {
                    return res.status(400).json({
                        errors: {
                            email: "Invalid Credentials",
                        }
                    })
                }

                const tokenData = {
                    id: findUser.id,
                    email: findUser.email,
                    name: findUser.name,
                    profile: findUser.profile
                }
                //generating token
                const token = jwt.sign(tokenData, process.env.JWT_SECRET, {
                    expiresIn: "365d"
                })

                // user found
                return res.status(200).json({ messages: "Logged IN", access_token: `Bearer ${token}` })
            }
            else {
                return res.status(400).json({
                    errors: {
                        email: "User not found. Please register first",
                    }
                })
            }

        } catch (error) {
            console.log("error in authenticate", error);

            if (error instanceof errors.E_VALIDATION_ERROR) {
                return res.status(400).json({ errors: error.messages });
            } else {
                return res.status(500).json({
                    status: 500,
                    message: "Internal Server Error",
                });
            }
        }
    }

    static async sendTestEmail(req, res) {
        try {
            const { email } = req.query;

            const payload = {
                toEmail: email,
                subject: "Test Email",
                body: "This is a test email",

            }
            await sendEmail(payload.toEmail, payload.subject, payload.body);
            return res.status(200).json({ message:"Email sent successfully"})

        } catch (error) {
            logger.error({type: "error",  body: error})
            res.status(500).json({message:"Something went wrong"})
        }

    }

}

export default AuthController;