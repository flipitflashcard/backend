// prisma client
const { PrismaClient, Prisma } = require("@prisma/client");
const prisma = new PrismaClient();

const CreateWord = async (req, res) => {
    try {
        const { front, back, box_id, type } = req.body;
        const word = await prisma.card.create({
            data: {
                front,
                back,
                box_id,
                created_at: Date.now(),
                type
            },
        });
        res.status(201).json({
            message: "Word created successfully",
            word
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

module.exports = {
    CreateWord
};