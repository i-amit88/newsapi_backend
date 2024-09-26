import { errors } from "@vinejs/vine";
import vine from "@vinejs/vine";
import { newsSchema } from "../validations/newsValidation.js";
import { generateRandomNum, imageValidator, removeImage } from "../utils/helper.js";
import prisma from "../db/db.config.js";
import NewsApiTransform from "../transform/newsApiTransform.js";
import { logger } from "../config/logger.js";

class NewsController {

    static async index(req, res) {

        // * Pagination *
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 1;

        if (page <= 0)
            page = 1;
        if (limit <= 0 || limit > 100)
            limit = 10;


        const skip = (page - 1) * limit;

        // * Fetching news from db with relation to users *
        const news = await prisma.news.findMany({
            //paging logic
            take: limit,
            skip: skip,
            //query logic
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        profile: true
                    }
                }
            }
        })
        const newsTransform = news?.map((item) => NewsApiTransform.transform(item));

        const totalNews = await prisma.news.count()
        const totalPages = Math.ceil(totalNews / limit);
        res.json({
            status: 200, news: newsTransform, metadata: {
                totalPages,
                currentPage: page,
                currentlimit: limit,
            }
        })
    }
    static async store(req, res) {

        try {
            const user = req.user;
            const body = req.body;
            const validator = vine.compile(newsSchema);
            const payload = await validator.validate(body);

            if (!req.files || Object.keys(req.files).length === 0) {
                return res.status(400).json({
                    errors: {
                        image: "image is required",
                    }
                });
            }


            const image = req.files.image;
            // * Image Validator *
            const message = imageValidator(image?.size, image?.mimetype);
            if (message !== null) {
                return res.status(400).json({
                    errors: {
                        image: message
                    }
                });
            }

            // * Image Upload *
            const imgExt = image?.name.split(".");
            const imgName = generateRandomNum() + "." + imgExt[1];

            const uploadPath = process.cwd() + "/public/images/" + imgName;

            image.mv(uploadPath, (err) => {
                if (err) throw err;
            })
            payload.image = imgName;
            payload.user_id = user.id;

            // * Save to database *
            const news = await prisma.news.create({
                data: payload,
            })

            return res.json({ status: 200, message: "News created successfully" });

        } catch (error) {
            logger.error(error?.message)
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
    static async show(req, res) {

        try {
            const { id } = req.params;
            const news = await prisma.news.findUnique({
                where: {
                    id: Number(id),
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            profile: true
                        }
                    }
                }
            });
            const transformNews = news ? NewsApiTransform.transform(news) : null;
            res.json({ status: 200, news: transformNews });

        } catch (error) {
            logger.error(error?.message)
            return res.json({ status: 500, error: "somthing went wrong" });
        }

    }
    static async update(req, res) {
        try {
            const { id } = req.params; // for post id
            const user = req.user; // for the current user id
            const body = req.body;
            const news = await prisma.news.findUnique({
                where: {
                    id: Number(id),
                }
            })

            if (!news) {
                return res.status(404).json({ message: "News not found" });
            }

            const validator = vine.compile(newsSchema);
            const payload = await validator.validate(body);

            if (user.id !== news.user_id)
                return res.json({ status: 400, message: "Unauthorized" })

            const image = req.files?.image;
            if (image) {


                const message = imageValidator(image?.size, image?.mimetype)

                if (message !== null) {
                    return res.json({ status: 400, image: message })
                }

                // * Image Upload *
                const imgExt = image?.name.split(".");
                const imgName = generateRandomNum() + "." + imgExt[1];


                const uploadPath = process.cwd() + "/public/images/" + imgName;
                image.mv(uploadPath, (err) => {
                    if (err) throw err;
                })
                payload.image = imgName;
                // * Delete image *
                removeImage(news.image); // this name comes form the database where image is already stored

            }

            await prisma.news.update({
                data: payload,
                where: {
                    id: Number(id),
                }
            });

            return res.json({ status: 200, message: "News updated successfully" });
        } catch (error) {

            logger.error(error?.message)
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
    static async destroy(req, res) {
        try {
            const { id } = req.params;
            const user = req.user;

            const news = await prisma.news.findUnique({
                where: {
                    id: Number(id),
                }
            })

            if (!news) {
                return res.status(404).json({ message: "News not found" });
            }

            if (news.user_id !== user.id)
                return res.status(400).json({ message: "Unautorized" });

            removeImage(news.image);

            await prisma.news.delete({
                where: {
                    id: Number(id),
                }
            });

            return res.json({ status: 200, message: "News deleted successfully" });
        } catch (error) {

            logger.error(error?.message)
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

    
};

export default NewsController;