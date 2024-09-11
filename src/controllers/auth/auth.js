import { Customer, DeliveryPartner } from "../../models/user.model.js";
import jwt from "jsonwebtoken";

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    {
      userId: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );

  const refreshToken = jwt.sign(
    {
      userId: user._id,
      role: user.role,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "7d",
    }
  );

  return { accessToken, refreshToken };
};

export const loginCustomer = async (req, reply) => {
  try {
    const { phone } = req.body;
    let customer = await Customer.findOne({ phone });

    if (!customer) {
      // If customer doesn't exist, create a new one
      customer = new Customer({
        phone,
        role: "Customer",
        isActivated: true,
      });
      await customer.save();
    }

    // GENERATE TOKEN
    const { accessToken, refreshToken } = generateTokens(customer);

    return reply.send({
      accessToken,
      refreshToken,
      customer,
      message: customer ? "Login successful" : "Customer created and logged in",
    });
  } catch (error) {
    return reply.status(500).send({ message: error.message });
  }
};

export const loginDeliveryPartner = async (req, reply) => {
  try {
    const { email, password } = req.body;
    const deliveryPartner = await DeliveryPartner.findOne({ email });

    if (!deliveryPartner) {
      return reply.status(401).send({ message: "Invalid email or password" });
    }

    // DELIVERY PARTNER ACTIVATION
    if (!deliveryPartner.isActived) {
      return reply
        .status(401)
        .send({ message: "Please activate your account" });
    }

    // PASSWORD VALIDATION
    const isMatch = password === deliveryPartner.password; // Consider hashing passwords
    if (!isMatch) {
      return reply.status(401).send({ message: "Invalid password" });
    }

    // GENERATE TOKEN
    const { accessToken, refreshToken } = generateTokens(deliveryPartner);

    return reply.send({
      accessToken,
      refreshToken,
      deliveryPartner,
      message: "Login successful",
    });
  } catch (error) {
    return reply.status(500).send({ message: error.message });
  }
};

export const refreshToken = async (req, reply) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return reply.status(401).send({ message: "Refresh token required" });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    let user;

    if (decoded.role === "Customer") {
      // Validate customer
      user = await Customer.findById(decoded.userId);
    } else if (decoded.role === "DeliveryPartner") {
      // Validate delivery partner
      user = await DeliveryPartner.findById(decoded.userId);
    } else {
      return reply.status(401).send({ message: "Invalid role" });
    }

    if (!user) {
      return reply.status(401).send({ message: "Invalid refresh token" });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    return reply.send({
      accessToken,
      refreshToken: newRefreshToken,
      message: "Token refreshed",
    });
  } catch (error) {
    return reply.status(500).send({ message: error.message });
  }
};

export const fetchUser = async (req, reply) => {
  try {
    const { userId, role } = req.user;

    // Validate user role
    let user;
    if (role === "Customer") {
      user = await Customer.findById(userId);
    } else if (role === "DeliveryPartner") {
      user = await DeliveryPartner.findById(userId);
    } else {
      return reply.status(401).send({ message: "Invalid role" });
    }

    if (!user) {
      return reply.status(401).send({ message: "Invalid refresh token" });
    }

    return reply.send({ user, message: "User fetched successfully" });
  } catch (error) {
    return reply.status(500).send({ message: error.message });
  }
};


