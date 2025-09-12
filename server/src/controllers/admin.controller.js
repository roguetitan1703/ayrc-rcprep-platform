import { RcPassage } from "../models/RcPassage.js";
import { success, notFoundErr, badRequest } from "../utils/http.js";

export async function listRcs(req, res, next) {
  try {
    const rcs = await RcPassage.find().sort({ createdAt: -1 });
    return success(res, rcs);
  } catch (e) {
    next(e);
  }
}

export async function createRc(req, res, next) {
  try {
    const {
      title,
      passageText,
      source,
      topicTags,
      status,
      scheduledDate,
      questions,
    } = req.body;
    if (
      !title ||
      !passageText ||
      !Array.isArray(questions) ||
      questions.length !== 4
    )
      throw badRequest("Invalid payload");
    const rc = await RcPassage.create({
      title,
      passageText,
      source,
      topicTags,
      status,
      scheduledDate,
      questions,
      createdBy: req.user.id,
    });
    return success(res, rc, 201);
  } catch (e) {
    next(e);
  }
}

export async function updateRc(req, res, next) {
  try {
    const rc = await RcPassage.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!rc) throw notFoundErr("RC not found");
    return success(res, rc);
  } catch (e) {
    next(e);
  }
}

export async function archiveRc(req, res, next) {
  try {
    const rc = await RcPassage.findByIdAndUpdate(
      req.params.id,
      { status: "archived" },
      { new: true }
    );
    if (!rc) throw notFoundErr("RC not found");
    return success(res, rc);
  } catch (e) {
    next(e);
  }
}
