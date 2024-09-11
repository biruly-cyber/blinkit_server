import { Order } from "../../models/order.model.js";
import { Branch } from "../../models/branch.model.js";
import { Customer, DeliveryPartner } from "../../models/user.model.js";

export const createOrder = async (req, reply) => {
  try {
    const { userId } = req.user;
    const { items, branch, totalPrice } = req.body;

    // Find customer by userId
    const customerData = await Customer.findById(userId);
    if (!customerData) {
      return reply.status(404).send({ message: "Customer not found" });
    }

    // Find branch by branchId
    const branchData = await Branch.findById(branch);
    if (!branchData) {
      return reply.status(404).send({ message: "Branch not found" });
    }

    // Create new order
    const newOrder = new Order({
      customer: userId,
      items: items.map((item) => ({
        id: item.id,
        item: item.item,
        count: item.count,
      })),
      branch,
      totalAmount: totalPrice,
      deliveryLocation: {
        latitude: customerData.liveLocation.latitude,
        longitude: customerData.liveLocation.longitude,
        address: customerData.address || "No address available",
      },
      pickupLocation: {
        latitude: branchData.liveLocation.latitude,
        longitude: branchData.liveLocation.longitude,
        address: branchData.address || "No address available",
      },
    });

    // Save the order
    const savedOrder = await newOrder.save();

    // Send success response
    return reply
      .status(201)
      .send({ message: "Order created successfully", order: savedOrder });
  } catch (error) {
    console.error("Error creating order:", error);

    // Handle errors and send appropriate response
    return reply.status(500).send({ message: "Internal Server Error" });
  }
};
export const confirmOrder = async (req, reply) => {
    try {
      const { orderId } = req.params;
      const { userId } = req.user;
      const { deliveryPersonLocation } = req.body;
      
  
      // Find delivery person by userId
      const deliveryPerson = await DeliveryPartner.findById(userId);
      if (!deliveryPerson) {
        return reply.status(404).send({ message: "Delivery person not found" });
      }
  
      // Find the order by orderId
      const order = await Order.findById(orderId);
      if (!order) {
        return reply.status(404).send({ message: "Order not found" });
      }
  
      // Check if order is already confirmed
      if (order.orderStatus !== "AVAILABLE") {
        return reply.status(400).send({ message: "Order already confirmed or unavailable" });
      }
  
      // Validate the deliveryPersonLocation
      if (!deliveryPersonLocation ) {
        return reply.status(400).send({ message: "Delivery person location is required" });
      }
  
      // Update order status and assign delivery person
      order.orderStatus = "CONFIRMED";
      order.deliveryPerson = userId;
      order.deliveryPersonLocation = {
        latitude: deliveryPersonLocation.latitude,
        longitude: deliveryPersonLocation.longitude,
        address: deliveryPersonLocation.address || "No address available",
      };

      //join room using orderid and deliveryperson

      req.server.io.to(orderId).emit("Order Confirmed", order);
  
      // Save the updated order
      await order.save();
  
      // Send success response
      return reply.send({ message: "Order confirmed successfully", order });
    } catch (error) {
      console.error("Error confirming order:", error);
  
      // Handle errors and send appropriate response
      return reply.status(500).send({ message: "Internal Server Error" });
    }
  };
  export const updateOrderStatus = async (req, reply) => {
    try {
      const { orderId } = req.params;
      const { status, deliveryPersonLocation } = req.body;
      const { userId } = req.user;
  
      // Check if the delivery person exists
      const deliveryPerson = await DeliveryPartner.findById(userId);
      if (!deliveryPerson) {
        return reply.status(404).send({ message: "Delivery person not found" });
      }
  
      // Check if the order exists
      const order = await Order.findById(orderId);
      if (!order) {
        return reply.status(404).send({ message: "Order not found" });
      }
  
      // Check if the order is already delivered or cancelled
      if (["DELIVERED", "CANCELLED"].includes(order.orderStatus)) {
        return reply.status(400).send({ message: "Order cannot be updated" });
      }
  
      // Ensure the order is assigned to the current delivery person
      if (deliveryPerson._id.toString() !== userId) {
        return reply.status(403).send({ message: "Unauthorized" });
      }
  
      // Validate deliveryPersonLocation if status requires it (optional)
      if (deliveryPersonLocation && (!deliveryPersonLocation.latitude || !deliveryPersonLocation.longitude)) {
        return reply.status(400).send({ message: "Invalid delivery person location" });
      }
  
      // Update the order status and location if provided
      order.orderStatus = status;
      if (deliveryPersonLocation) {
        order.deliveryPersonLocation = {
          latitude: deliveryPersonLocation.latitude,
          longitude: deliveryPersonLocation.longitude,
          address: deliveryPersonLocation.address || "No address available",
        };
      }
  
      // Save the updated order
      await order.save();

      req.server.io.to(orderId).emit("Live tracking updated", order);
  
      // Send success response
      return reply.send({ message: "Order updated successfully", order });
    } catch (error) {
      console.error("Error updating order status:", error);
  
      // Send error response
      return reply
        .status(500)
        .send({ message: "Failed to update order status: " + error.message });
    }
  };

  export const getAllOrders = async (req, reply) => {
    try {
      const { status, customerId, deliveryPartnerId, branchId } = req.query;
  
      // Build the query object
      let query = {};
  
      // Filter by status if provided
      if (status) {
        query.status = status;
      }
  
      // Filter by customer ID if provided
      if (customerId) {
        query.customer = customerId;
      }
  
      // Filter by delivery partner and branch ID if both are provided
      if (deliveryPartnerId) {
        query.deliveryPartner = deliveryPartnerId;
      }
  
      if (branchId) {
        query.branch = branchId;
      }
  
      // Fetch orders based on the query and populate necessary fields
      const orders = await Order.find(query)
        .populate("customer")
        .populate("branch")
        .populate("items.item")
        .populate("deliveryPartner");
  
      // Send response with the fetched orders
      return reply.send({ orders });
    } catch (error) {
      console.error("Error fetching orders:", error);
  
      // Send error response
      return reply
        .status(500)
        .send({ message: "Failed to retrieve orders: " + error.message });
    }
  };

  export const getOrderById = async (req, reply) => {
    try {
      const { orderId } = req.params;
  
      // Find the order by ID and populate necessary fields
      const order = await Order.findById(orderId)
        .populate("customer")
        .populate("branch")
        .populate("items.item")
        .populate("deliveryPartner"); // Corrected the typo here
  
      // If the order is not found, return a 404 response
      if (!order) {
        return reply.status(404).send({ message: "Order not found" });
      }
  
      // Send the order as a response
      return reply.send({ order });
    } catch (error) {
      console.error("Error retrieving order:", error);
  
      // Handle any server errors and return a 500 response
      return reply
        .status(500)
        .send({ message: "Failed to retrieve order: " + error.message });
    }
  };
