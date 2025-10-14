import app from "./app.js"
const PORT = process.env.PORT || 8000; // fallback to 8000 if not set

app.listen(PORT, () => {
  console.log(`Server running on Port: ${PORT}`);
});