// prisma client
const { PrismaClient, Prisma } = require("@prisma/client");
const prisma = new PrismaClient();

// express validator
const { validationResult } = require("express-validator");

// bcrypt for password hashing
const bcrypt = require("bcrypt");

// crypto for token hashing
const crypto = require("crypto");

// jsonwebtoken
const jwt = require("jsonwebtoken");

// function to hash password
async function hashPassword(password) {
    try {
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    } catch (error) {
        console.error("Error hashing password:", error);
    }
}

// function to compare passwords
async function comparePasswords(enteredPassword, storedHash) {
    try {
        const match = await bcrypt.compare(enteredPassword, storedHash);
        return match;
    } catch (error) {
        console.error("Error comparing passwords:", error);
    }
}

// function to hash jwt
function hashJwtToken(token) {
    const hash = crypto.createHash('sha256');
    hash.update(token);
    return hash.digest('hex');
}

const SignUp = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = errors.array()[0];
        return res.status(422).json({
            message: error.msg,
            field: error.param
        });
    }

    const { email, password } = req.body;
    const hashedPassword = await hashPassword(password);

    const token = jwt.sign({ email }, process.env.SECRET_KEY);
    const hashedToken = hashJwtToken(token);

    try {
        await prisma.user.create({
            data: {
                email: email,
                password: hashedPassword,
                auth_token: hashedToken,
                created_at: Date.now()
            }
        })
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            if (e.code === 'P2002') {
                res.status(409).json({
                    message: "Email already exists!"
                })
            }
        }
    }

    res.status(201).json({
        message: "Welocome to Flipit!",
        token
    });
}

const LogIn = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = errors.array()[0];
        return res.status(422).json({
            message: error.msg,
            field: error.param
        });
    }

    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
        where: {
            email
        }
    })

    if (user) {
        const accuratePassword = await comparePasswords(password, user.password);
        if (accuratePassword) {
            const token = jwt.sign({ email }, process.env.SECRET_KEY);
            const hashedToken = hashJwtToken(token);
            await prisma.user.update({
                where: {
                    email
                },
                data: {
                    auth_token: hashedToken
                }
            })
            res.status(200).json({
                message: "Welcome back!",
                token
            })
        } else {
            res.status(401).json({
                message: "Password is incorrect!"
            })
        }
    } else {
        res.status(404).json({
            message: "The user does not exist!"
        })
    }
}

module.exports = {
    SignUp,
    LogIn
}