import { Product } from "../../models/product.model.js";

export const getProductsByCategoryId = async (req, reply) => {
  const { categoryId } = req.params;

  // Validate categoryId (assuming it's a string or ObjectId, adapt as necessary)
  if (!categoryId) {
    return reply.status(400).send({ message: "Category ID is required" });
  }

  try {
    const products = await Product.find({ category: categoryId })
      .select("-category")
      .exec();

    if (products.length === 0) {
      return reply
        .status(404)
        .send({ message: "No products found for this category" });
    }

    return reply.send({ products });
  } catch (error) {
    console.error("Error fetching products by category:", error); // Log error for debugging

    // Check if headers have already been sent
    if (reply.sent) {
      return; // Prevent sending another response if headers are already sent
    }

    return reply.status(500).send({ message: "Internal Server Error" });
  }
};
