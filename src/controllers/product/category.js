import { Category } from "../../models/category.model.js";

export const getAllCategory = async (req, reply) => {
  try {
    const categories = await Category.find();
    reply.send({ categories });
  } catch (error) {
    reply.status(500).send({ message: error.message });
  }
};
