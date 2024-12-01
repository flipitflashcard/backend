// prisma client
const { PrismaClient, Prisma } = require("@prisma/client");
const prisma = new PrismaClient();

class SRSCalculator {
    constructor() {
        this.params = {
            minimumInterval: 1,
            maximumInterval: 365,
            initialEaseFactor: 2.5,
            intervalModifier: 1,
            easeBonus: 0.15,
            easePenalty: 0.2
        };
    }

    calculateNextReview(currentInterval, easeFactor, rating) {
        // Calculate new ease factor
        let newEaseFactor = easeFactor;
        if (rating === 'KNOW') {
            newEaseFactor += this.params.easeBonus;
        } else {
            newEaseFactor -= this.params.easePenalty;
        }
        newEaseFactor = Math.max(1.3, newEaseFactor);

        // Calculate next interval
        let nextInterval;
        if (rating === 'FORGET') {
            nextInterval = this.params.minimumInterval;
        } else if (currentInterval === 0) {
            nextInterval = 1;
        } else {
            nextInterval = Math.round(currentInterval * newEaseFactor * this.params.intervalModifier);
        }
        nextInterval = Math.min(this.params.maximumInterval, Math.max(this.params.minimumInterval, nextInterval));

        // Calculate due date
        const dueDate = Date.now() + nextInterval * 24 * 60 * 60 * 1000;

        return { nextInterval, newEaseFactor, dueDate };
    }
}

const CreateWord = async (req, res) => {
    try {
        const { front, back, box_id, type } = req.body;

        // Initialize SRS calculator
        const srs = new SRSCalculator();
        const now = Date.now();

        // Create word with initial SRS values
        const word = await prisma.card.create({
            data: {
                front,
                back,
                box_id: BigInt(box_id),
                type,
                created_at: BigInt(now),
                srs_interval: 0,
                ease_factor: srs.params.initialEaseFactor,
                due_date: BigInt(now)
            },
        });

        res.status(201).json({
            message: "Word created successfully",
            word
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const UpdateWord = async (req, res) => {
    try {
        const { id } = req.params;
        const { front, back, type, is_favorite, box_id } = req.body;

        // Check if card exists and get current values
        const existingCard = await prisma.card.findUnique({
            where: { id: BigInt(id) },
        });

        if (!existingCard) {
            return res.status(404).json({ error: "Card not found" });
        }

        // Prepare update data
        const updateData = {
            updated_at: BigInt(Date.now())
        };

        // Only include fields that are provided in the request
        if (front !== undefined) updateData.front = front;
        if (back !== undefined) updateData.back = back;
        if (type !== undefined) updateData.type = type;
        if (is_favorite !== undefined) updateData.is_favorite = is_favorite;
        if (box_id !== undefined) updateData.box_id = BigInt(box_id);

        // Update the card
        const updatedWord = await prisma.card.update({
            where: {
                id: BigInt(id)
            },
            data: updateData
        });

        // Send response
        res.status(200).json({
            message: "Word updated successfully",
            word: updatedWord
        });

    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2012') {
                return res.status(400).json({
                    error: "Invalid card type. Must be one of: NOUN, ADJ, ADV, VERB"
                });
            }
        }

        res.status(400).json({ error: error.message });
    }
};

const ReviewWord = async (req, res) => {
    try {
        const { cardId } = req.params;
        const { rating, duration } = req.body;
        const now = Date.now();

        // Fetch current card data
        const card = await prisma.card.findUnique({
            where: { id: BigInt(cardId) },
            select: {
                srs_interval: true,
                ease_factor: true,
            },
        });

        if (!card) {
            return res.status(404).json({ error: "Card not found" });
        }

        // Calculate next review details
        const srs = new SRSCalculator();
        const { nextInterval, newEaseFactor, dueDate } = srs.calculateNextReview(
            card.srs_interval,
            Number(card.ease_factor),
            rating
        );

        // Update card with new SRS values
        const updatedCard = await prisma.card.update({
            where: { id: BigInt(cardId) },
            data: {
                srs_interval: nextInterval,
                ease_factor: newEaseFactor,
                due_date: BigInt(dueDate),
                updated_at: BigInt(now)
            },
        });

        // Record the review
        await prisma.review.create({
            data: {
                card_id: BigInt(cardId),
                rating,
                duration,
                reviewed_at: BigInt(now),
            },
        });

        res.status(200).json({
            message: "Review recorded successfully",
            card: updatedCard
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const GetDueCards = async (req, res) => {
    try {
        const { boxId } = req.params;
                
        const box = await prisma.box.findFirst({
            where: { name: boxId },
        })

        const now = Date.now();

        const dueCards = await prisma.card.findMany({
            where: {
                box_id: BigInt(box.id),
                due_date: {
                    lte: BigInt(now)
                },
                deleted_at: null
            },
            orderBy: {
                due_date: 'asc'
            }
        });

        res.status(200).json(dueCards);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const setFavorite = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_favorite } = req.body;
        const card = await prisma.card.update({
            where: { id: BigInt(id) },
            data: { is_favorite: is_favorite },
        });
        res.status(200).json({
            message: "Your favorite card has been selected successfully!",
            card
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const GetCards = async (req, res) => {
    try {
        const { name } = req.params;

        const box = await prisma.box.findFirst({
            where: { name: name },
        });

        const cards = await prisma.card.findMany({
            where: { box_id: box.id },
        });

        res.status(200).json(cards);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const GetCard = async (req, res) => {
    try {
        const { id } = req.params;
        const card = await prisma.card.findFirst({
            where: { id: parseInt(id) },
        });

        res.status(200).json(card);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const GetAllOfCards = async (req, res) => {
    try {
        const cards = await prisma.card.findMany();
        res.status(200).json(cards);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const DeleteCard = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.card.delete({
            where: { id: parseInt(id) },
        });
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    CreateWord,
    ReviewWord,
    GetDueCards,
    GetCards,
    DeleteCard,
    GetCard,
    UpdateWord,
    GetAllOfCards,
    setFavorite
};