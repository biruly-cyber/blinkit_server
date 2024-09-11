import { getAllCategory } from "../controllers/product/category.js";
import { getProductsByCategoryId } from "../controllers/product/product.js";


export const categoryRoutes = async (fastify, options) => {
    fastify.get("/categories", getAllCategory);
}
export const productRouts = async (fastify, options) => {
    fastify.get("/products/:categoryId", getProductsByCategoryId);
}







