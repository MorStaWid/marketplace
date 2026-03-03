const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.route");
const adminRoutes = require("./routes/admin.route");
const listingRoutes = require("./routes/listing.route");
const cartRoutes = require("./routes/cart.route");
const orderRoutes = require("./routes/order.route");

const app = express();
const PORT = 6700;

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/listings", listingRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);

app.listen(PORT, () =>{
    console.log(`Server is running on http://localhost:${PORT}`);
})