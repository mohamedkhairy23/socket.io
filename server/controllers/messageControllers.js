const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  try {
    let message = await Message.create(newMessage);
    let fullMessage = await Message.findOne({ _id: message._id })
      .populate("sender", "name pic")
      .populate("chat");

    fullMessage = await User.populate(fullMessage, {
      path: "chat.users",
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, {
      latestMessage: fullMessage,
    });

    res.status(201).json(fullMessage);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//@description     Get all Messages
//@route           GET /api/Message/:chatId
//@access          Protected
const getAllMessagesForSingleChat = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");

    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = {
  sendMessage,
  getAllMessagesForSingleChat,
};
