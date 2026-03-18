import app from "./app.js";
import "dotenv/config"
const PORT=process.env.PORT || 3000;
app.listen(PORT,()=>{console.log(`The app is start and listen On ${PORT}`)});