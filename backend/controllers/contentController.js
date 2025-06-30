// backend/controllers/contentController.js
import Content from "../models/Content.js";

export const getContentSettings = async (req, res) => {
  console.log("getContentSettings called");
  try {
    const content = await Content.findOne();
    console.log("Content settings found:", content);
    res.json(content);
  } catch (err) {
    console.error("Error in getContentSettings:", err);
    res.status(500).json({ error: err.message });
  }
};

export const updateContentSettings = async (req, res) => {
  console.log("updateContentSettings called", req.body);
  try {
    let content = await Content.findOne();
    if (!content) {
      content = new Content(req.body);
    } else {
      Object.assign(content, req.body);
    }
    await content.save();
    console.log("Content settings updated:", content);
    res.json(content);
  } catch (err) {
    console.error("Error in updateContentSettings:", err);
    res.status(400).json({ error: err.message });
  }
};
