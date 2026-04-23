import mongoose from "mongoose";

export const connectDB = async () => {
 
      mongoose.connection.on('connected',()=>{
        console.log("DB Connected Successfully");
      })

    await mongoose.connect(process.env.MONGO_URI);
};
