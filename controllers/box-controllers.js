// prisma client
const { PrismaClient, Prisma } = require("@prisma/client");
const prisma = new PrismaClient();

// Create a new box
const CreateBox = async (req, res) => {
    try {
        const { name } = req.body;

        const { id } = req.payload;

        const box = await prisma.box.create({
            data: {
                user_id: id,
                name,
                language_code: 'en',
                created_at: Date.now()
            },
        });

        // Send response
        res.status(201).json({
            message: "Box created successfully",
            box
        });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all boxes
const GetBoxes = async (req, res) => {
    const { id } = req.payload;
    try {
        const boxes = await prisma.box.findMany({
            where: { user_id: parseInt(id) },
            include: {
                _count: {
                    select: {
                        cards: true
                    }
                }
            }
        });
        res.status(200).json(boxes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single box by ID
const GetBox = async (req, res) => {
    try {
        const { id } = req.params;
        const { id: userId } = req.payload;

        const box = await prisma.box.findUnique({
            where: { id: parseInt(id) },
        });

        if (parseInt(box.user_id) !== userId) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        if (!box) {
            return res.status(404).json({ error: "Box not found" });
        }
        res.status(200).json(box);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a box
const UpdateBox = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const { id: userId } = req.payload;

        const updatedBox = await prisma.box.update({
            where: {
                id: parseInt(id),
                user_id: parseInt(userId),
            },
            data: {
                name,
                updated_at: Date.now()
            },
        });
        res.status(200).json(updatedBox);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete a box
const DeleteBox = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.box.delete({
            where: { id: parseInt(id) },
        });
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    CreateBox,
    GetBoxes,
    GetBox,
    UpdateBox,
    DeleteBox,
};
