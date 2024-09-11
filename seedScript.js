import "dotenv/config";
import mongoose from "mongoose";
import { Category, Product } from "./src/models/index.js";
import { categories, products } from "./seedData.js";

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // await Product.deleteMany({});
    // await Category.deleteMany({});
    const categoryDocs = await Category.insertMany(categories);

    const categoryMap = categoryDocs.reduce((acc, category) => {
      acc[category.name] = category._id;
      return acc;
    }, {});

    const productWithCategory = products.map((product) => {
      return {
        ...product,
        category: categoryMap[product.category],
      };
    });
    await Product.insertMany(productWithCategory);
    console.log({
      message: "Database seeded successfully",
    });
  } catch (error) {
    console.log(error);
  } finally {
    mongoose.connection.close();
  }
}

//invoke
seedDatabase();
