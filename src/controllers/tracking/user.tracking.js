import { Customer, DeliveryPartner } from "../../models/user.model.js";

export const updateUser = async (req, reply) => {
  const { userId } = req.user;
  const updateData = req.body;

  try {
    const user =
      (await Customer.findById(userId)) ||
      (await DeliveryPartner.findById(userId));

    if (!user) {
      return reply.status(404).send({ message: "User not found" });
    }

    let UserModel;
    if (user.role === "Customer") {
      UserModel = Customer;
    } else if (user.role === "Delivery Partner") {
      UserModel = DeliveryPartner;
    } else {
      return reply.status(400).send({ message: "Invalid user role" });
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return reply.status(500).send({ message: "Failed to update user" });
    }

    // Send response
    return reply.send({
      user: updatedUser,
      message: "User updated successfully",
    });
  } catch (error) {
    return reply.status(500).send({ message: error.message });
  }
};
