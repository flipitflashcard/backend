const { minioClient, bucketName } = require('../config/minio');
const { PrismaClient, Prisma } = require("@prisma/client");
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const jwt = require("jsonwebtoken");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const crypto = require("crypto");

// Existing helper functions remain the same
async function hashPassword(password) {
    try {
        const saltRounds = 12;
        return await bcrypt.hash(password, saltRounds);
    } catch (error) {
        console.error("Error hashing password:", error);
    }
}

async function comparePasswords(enteredPassword, storedHash) {
    try {
        return await bcrypt.compare(enteredPassword, storedHash);
    } catch (error) {
        console.error("Error comparing passwords:", error);
    }
}

function hashToken(token) {
    const hash = crypto.createHash('sha256');
    hash.update(token);
    return hash.digest('hex');
}

// Generate tokens
function generateTokens(user) {
    const accessToken = jwt.sign(
        { email: user.email, id: user.id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );

    const refreshToken = jwt.sign(
        { email: user.email, id: user.id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );

    return { accessToken, refreshToken };
}

const SignUp = async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = await hashPassword(password);

    try {
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                created_at: Date.now()
            }
        });

        const { accessToken, refreshToken } = generateTokens(user);
        const hashedAccessToken = hashToken(accessToken);
        const hashedRefreshToken = hashToken(refreshToken);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                access_token: hashedAccessToken,
                refresh_token: hashedRefreshToken,
            }
        });

        res.status(201).json({
            message: "Welcome to Flipit!",
            accessToken,
            refreshToken
        });
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
            return res.status(409).json({ message: "Email already exists!" });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
}

const LogIn = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: "User does not exist!" });
        }

        const accuratePassword = await comparePasswords(password, user.password);

        if (!accuratePassword) {
            return res.status(401).json({ message: "Password is incorrect!" });
        }

        const { accessToken, refreshToken } = generateTokens(user);
        const hashedAccessToken = hashToken(accessToken);
        const hashedRefreshToken = hashToken(refreshToken);

        await prisma.user.update({
            where: { email },
            data: {
                access_token: hashedAccessToken,
                refresh_token: hashedRefreshToken,
                updated_at: Date.now()
            }
        });

        res.status(200).json({
            message: "Welcome back!",
            accessToken,
            refreshToken
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}

const LogOut = async (req, res) => {
    const { email } = req.payload;

    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        await prisma.user.update({
            where: { email },
            data: {
                access_token: null,
                refresh_token: null,
                updated_at: Date.now()
            }
        });

        res.status(200).json({ message: "You have been logged out!" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}

const RefreshToken = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ message: "Refresh token required" });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const hashedRefreshToken = hashToken(refreshToken);

        const user = await prisma.user.findFirst({
            where: {
                email: decoded.email,
                refresh_token: hashedRefreshToken
            }
        });

        if (!user) {
            return res.status(401).json({ message: "Invalid refresh token" });
        }

        // Generate new access token
        const { accessToken } = generateTokens(user);
        const hashedAccessToken = hashToken(accessToken);

        await prisma.user.update({
            where: { email: user.email },
            data: {
                access_token: hashedAccessToken,
                updated_at: Date.now()
            }
        });

        res.status(200).json({
            accessToken,
            message: "New access token generated successfully"
        });
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ message: "Refresh token expired" });
        }
        return res.status(401).json({ message: "Invalid refresh token" });
    }
}

const UpdateProfilePicture = async (req, res) => {
    const { email } = req.payload;

    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        // Generate unique filename
        // const fileExtension = req.file.originalname.split('.').pop();
        const fileName = `${user.id}.png`;

        // Upload to MinIO
        await minioClient.putObject(
            bucketName,
            fileName,
            req.file.buffer,
            req.file.buffer.length
        );

        // Generate URL
        const fileUrl = `${process.env.MINIO_PUBLIC_URL}/${bucketName}/${fileName}`;

        // Update user profile in database
        await prisma.user.update({
            where: { email },
            data: {
                profile_picture: fileUrl,
                updated_at: Date.now()
            }
        });

        res.status(200).json({
            message: "Profile picture updated successfully!",
            profile_picture: fileUrl
        });
    } catch (error) {
        console.error('Error updating profile picture:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const GetUserProfile = async (req, res) => {
    const { email } = req.payload;

    try {
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                profile_picture: true,
                created_at: true,
                updated_at: true
            }
        });
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}

const UpdateUserProfile = async (req, res) => {
    const { email } = req.payload;
    const { password } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        if (password !== '') {
            const hashedPassword = await hashPassword(password);
            await prisma.user.update({
                where: { email },
                data: {
                    password: hashedPassword,
                    updated_at: Date.now()
                }
            });
            res.status(200).json({ message: "Your profile updated successfully!" });
        } else {
            res.status(200).json({ message: "Your profile updated successfully!" });
        }

    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}
module.exports = {
    SignUp,
    LogIn,
    LogOut,
    RefreshToken,
    GetUserProfile,
    UpdateUserProfile,
    UpdateProfilePicture
}