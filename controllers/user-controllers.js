// prisma client
const { PrismaClient } = require("@prisma/client");
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
        return match === undefined ? false : true;
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

    await prisma.user.create({
        data: {
            email: email,
            password: hashedPassword,
            auth_token: hashedToken,
            created_at: Date.now()
        }
    })


    res.status(201).json({
        message: "Welocome to Flipit!",
        token
    });
}

module.exports = {
    SignUp
}