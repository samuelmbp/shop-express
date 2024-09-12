export const addToCart = async (req, res) => {
    try {
        const { productId } = req.body;
        const user = req.user;

        const existingItem = user.cartItems.find(
            (item) => item.id === productId
        );

        if (existingItem) existingItem.quantity += 1;
        else user.cartItems.push(productId);

        await user.save();
        res.json(user.cartItems);
    } catch (error) {
        console.log("Error in add to cart controller: ", error);
        res.status(500).json({ message: error.message });
    }
};

export const getCartProducts = async (req, res) => {};

export const updateQuantity = async (req, res) => {};

export const removeAllFromCart = async (req, res) => {};
