import {
    confirmOrder,
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
} from "../controllers/order/order.js";
import { verifyToken } from "../middleware/auth.js";

export const orderRoutes = async (fastify, options) => {
  fastify.addHook("preHandler", async (request, reply) => {
    const isAuthenticated = await verifyToken(request, reply);
    if (!isAuthenticated) {
      reply.status(401).send({ message: "Unauthorized" });
    }
  });

  fastify.post("/create-order", createOrder);

  fastify.get("/order", getAllOrders);
  fastify.get("/order/:orderId", getOrderById);
  fastify.post("/order/:orderId/confirm", confirmOrder);
  fastify.patch("/order/:orderId/status", updateOrderStatus);
};
