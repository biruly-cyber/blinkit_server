import { authRoutes } from "./auth.routes.js";
import { orderRoutes } from "./order.routes.js";
import { categoryRoutes, productRouts } from "./product.routes.js";

const prefix = "/api/v1";

export const registerRoutes = async (fastify, options) => {
  fastify.register(authRoutes, { prefix : prefix });
  fastify.register(productRouts, { prefix : prefix });
  fastify.register(categoryRoutes, { prefix : prefix });
  fastify.register(orderRoutes, { prefix : prefix });
};




