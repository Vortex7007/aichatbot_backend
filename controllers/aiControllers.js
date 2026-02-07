import axios from "axios";
import Chat from "../models/Chat.js";

export const queryLLM = async (req, res) => {
  try {
    const { prompt, chatId } = req.body;
    const userId = req.currentUser._id;

    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required" });
    }

    let messages = [
      { role: "system", content: "You are a helpful assistant." }
    ];

    let chat;
    if (chatId) {
      // Fetch previous messages for context
      chat = await Chat.findOne({ _id: chatId, userId });
      if (!chat) return res.status(404).json({ message: "Chat not found" });
      messages = [
        { role: "system", content: "You are a helpful assistant." },
        ...chat.chat, // all previous messages
        { role: "user", content: prompt } // add the new prompt
      ];
    } else {
      // New chat
      messages.push({ role: "user", content: prompt });
    }

    // Query the LLM with full context
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "nvidia/nemotron-nano-9b-v2:free",
        messages,
        max_tokens: 8000,
        temperature: 0.4,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPEN_ROUTER_KEY}`,
        },
      }
    );

    const reply = response.data.choices[0].message.content;

    // Save chat history
    if (chatId) {
      chat.chat.push(
        { role: "user", content: prompt },
        { role: "assistant", content: reply }
      );
      await chat.save();
    } else {
      const chatTitle = prompt.split(" ").slice(0, 5).join(" ") || "New Chat";
      chat = await Chat.create({
        userId,
        title: chatTitle,
        chat: [
          { role: "user", content: prompt },
          { role: "assistant", content: reply },
        ],
      });
    }

    res.status(200).json({ reply, chatId: chat._id });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error querying LLM", error: error.message });
  }
};
