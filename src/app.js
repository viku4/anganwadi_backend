import express from "express";
import routes from "./routes/index.js";
import cors from "cors";
import { error } from "./utils/index.js";
// import swaggerUi from "swagger-ui-express";
// import swaggerSpec from "./generate-postman.js";
const app = express();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static("uploads"));
// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => {
  res.send("API Running");
});
app.use("/api", routes);
app.use((err, req, res, next) => {
  console.error("API Error:", err);

  const statusCode = err.statusCode || err.status || 500;

  error(res, err.message || "Internal Server Error", statusCode);
  // res.status(statusCode).json({
  //     success: false,
  //     message: err.message || "Internal Server Error",
  //     error: process.env.NODE_ENV === "development"
  //         ? err.stack
  //         : undefined
  // });
});
export default app;
