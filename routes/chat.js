import express from "express";
import Thread from "../models/Thread.js";
import getOpenAIAPIResponse from "../utils/openAi.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

//test
router.post("/test" , authMiddleware, async(req, res) => {
    try {
        const thread = new Thread({
            threadId : "Aditya",
            title : "testing new thread again"
        });

        const response = await thread.save();
        res.send(response);
    } catch(err) {
        console.log(err);
        res.status(500).json({error: "Failed to save in database"});
    }
});


//get all threads
router.get("/thread", authMiddleware, async (req, res) => {
  try {
    // Use Mongoose's sort method directly on the query
    const threads = await Thread.find({}).sort({ updatedAt: -1 });
    res.json(threads);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch threads" });
  }
});

//get thread/threadId
router.get("/thread/:threadId" , authMiddleware, async(req, res) => {
    const {threadId} = req.params; //destructure
    try {
        const thread = await Thread.findOne({threadId});
        if(!thread) {
            res.status(404).json({error : "Thread not found"});
        }
        res.json(thread.messages);
    }catch(err) {
        console.log(err);
        res.status(500).json({error: "Failed to fetch chat"});
    }
} );

//delete a thread
router.delete("/thread/:threadId", authMiddleware, async(req, res) => {
    const {threadId} = req.params;
    try {
        const deletedThread = await Thread.findOneAndDelete({threadId});

        if(!deletedThread) {
            res.status(404).json({error : "Thread not found!"});
        }

        res.status(200).json({success : "Thread deleted successfully!"});

    } catch(err) {
        console.log(err);
        res.status(500).json({error : "Failed to delete a thread"});
    }
});

//post
router.post("/chat", authMiddleware, async (req, res) => {
  const { threadId, message } = req.body;

  if (!threadId || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    let thread = await Thread.findOne({ threadId });

    if (!thread) {
      try {
        thread = await Thread.create({
          threadId,
          title: message,
          messages: [{ role: "user", content: message }],
        });
      } catch (err) {
        // Concurrent requests can both try to create the same threadId (E11000).
        if (err.code !== 11000) throw err;
        thread = await Thread.findOne({ threadId });
        if (!thread) throw err;
        thread.messages.push({ role: "user", content: message });
      }
    } else {
      thread.messages.push({ role: "user", content: message });
    }

    const assistantReply = await getOpenAIAPIResponse(thread.messages);

    thread.messages.push({ role: "assistant", content: assistantReply });
    await thread.save();

    res.json({ reply: assistantReply });
  } catch (err) {
    console.error("Chat route error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});



export default router;