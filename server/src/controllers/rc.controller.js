import { RcPassage } from '../models/RcPassage.js'
import { Attempt } from '../models/Attempt.js'
import { success, notFoundErr, forbidden as forbiddenErr } from '../utils/http.js'
import { startOfIST, endOfIST } from '../utils/date.js'

export async function getTodayRcs(req, res, next) {
  try {
    const start = startOfIST()
    const end = endOfIST()
    const rcs = await RcPassage.find({
      status: { $in: ['scheduled', 'live'] },
      scheduledDate: { $gte: start, $lt: end },
    }).select('title topicTags status scheduledDate')

    const attempts = await Attempt.find({
      userId: req.user.id,
      rcPassageId: { $in: rcs.map((r) => r._id) },
    })
    const attemptMap = new Map(attempts.map((a) => [a.rcPassageId.toString(), a]))

    const data = rcs.map((rc) => ({
      id: rc._id,
      title: rc.title,
      topicTags: rc.topicTags,
      scheduledDate: rc.scheduledDate,
      status: attemptMap.get(rc._id.toString()) ? 'attempted' : 'pending',
      score: attemptMap.get(rc._id.toString())?.score ?? null,
    }))

    return success(res, data)
  } catch (e) {
    next(e)
  }
}

export async function getArchive(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || '20', 10)));
    const skip = (page - 1) * limit;
    const user = req.user;
    // Normalize subscription: treat missing, null, undefined, empty string, or 'none' as no subscription
    let subscription = user.subscription;
    if (!subscription || typeof subscription !== 'string' || !subscription.trim()) {
      subscription = 'none';
    } else {
      subscription = subscription.toLowerCase();
    }
    const joinedDate = user.subon || user.createdAt;
    const now = new Date();

    let rcQuery = { status: { $in: ['scheduled', 'live', 'archived'] } };

    // For free plan, no subscription, or empty subscription: do not return any archive RCs
    if (subscription === 'none' || subscription === 'free') {
      console.log('[getArchive] No subscription, empty, or free plan user, blocking archive RCs');
      return success(res, { data: [], message: 'Archive RCs are not available for free or unsubscribed users.' });
    }

    // Weekly and other plans
    if (subscription === 'weekly' || subscription === '1 week plan') {
      const sevenDaysAfterJoin = new Date(joinedDate);
      sevenDaysAfterJoin.setDate(sevenDaysAfterJoin.getDate() + 7);
      rcQuery.createdAt = { $gte: joinedDate, $lte: sevenDaysAfterJoin };
    }

    // Debug: log user and query
    console.log('[getArchive] user:', { id: user.id, subscription, joinedDate }, 'rcQuery:', rcQuery);

    const rcs = await RcPassage.find(rcQuery)
      .sort({ scheduledDate: -1 })
      .skip(skip)
      .limit(limit)
      .select('title scheduledDate topicTags createdAt');

    const attempts = await Attempt.find({
      userId: user.id,
      rcPassageId: { $in: rcs.map((r) => r._id) },
    });
    const attemptMap = new Map(attempts.map((a) => [a.rcPassageId.toString(), a]));

    let data = rcs.map((rc) => {
      const a = attemptMap.get(rc._id.toString());
      return {
        id: rc._id,
        title: rc.title,
        scheduledDate: rc.scheduledDate,
        topicTags: rc.topicTags,
        attempted: !!a,
        score: a?.score ?? null,
      };
    });

    // Debug: log result
    console.log('[getArchive] result:', data);
    return success(res, data);
  } catch (e) {
    next(e)
  }
}

export async function getRcById(req, res, next) {
  try {
    const rc = await RcPassage.findById(req.params.id);
    if (!rc) {
      console.error('[getRcById] RC not found for id:', req.params.id);
      throw notFoundErr('RC not found');
    }

    const user = req.user;
    const subscription = (user.subscription || 'free').toLowerCase();
    const joinedDate = user.subon || user.createdAt;
    const now = new Date();

    // Debug: log user and RC after rc is defined
    console.log('[getRcById] user:', { id: user.id, subscription, joinedDate }, 'rc:', rc._id);

    const preview = String(req.query.preview || '') === '1' || String(req.query.mode || '') === 'preview';
    const practice = String(req.query.practice || '') === '1' || String(req.query.mode || '') === 'practice';

    // Restrict access to future scheduled content (unless admin preview)
    if (!preview) {
      if (rc.scheduledDate) {
        const nowDay = startOfIST();
        const rcDayStart = startOfIST(rc.scheduledDate);
        if (rcDayStart > nowDay && rc.status !== 'live' && rc.status !== 'archived') {
          throw notFoundErr('RC not available yet');
        }
      }

      // Subscription-based access control
      if (subscription === 'free') {
        // Only RCs uploaded after user joined, and only if user has attempted (for archive), or if it's today's RC
        if (rc.createdAt < joinedDate) throw forbiddenErr('Not allowed: RC uploaded before you joined');
        // For archive, only allow if user has attempted
        // (For today, allow if scheduledDate is today)
        const today = startOfIST();
        const rcDay = startOfIST(rc.scheduledDate);
        const isToday = rcDay.getTime() === today.getTime();
        if (!isToday) {
          const attempt = await Attempt.findOne({ userId: user.id, rcPassageId: rc._id });
          if (!attempt) throw forbiddenErr('Not allowed: You can only view RCs you have attempted');
        }
      } else if (subscription === 'weekly' || subscription === '1 week plan') {
        // Only RCs uploaded after user joined, and only those within 7 days of joining
        const sevenDaysAfterJoin = new Date(joinedDate);
        sevenDaysAfterJoin.setDate(sevenDaysAfterJoin.getDate() + 7);
        if (rc.createdAt < joinedDate || rc.createdAt > sevenDaysAfterJoin) {
          throw forbiddenErr('Not allowed: RC not in your subscription window');
        }
      } // else for till CAT, allow all
    }

    const safe = rc.toObject()
    if (preview) {
      if (!req.user || req.user.role !== 'admin') throw forbiddenErr('Not allowed')
      return success(res, safe)
    }
    if (practice) {
      safe.questions = safe.questions.map((q) => ({
        questionText: q.questionText,
        options: q.options,
        correctAnswerId: q.correctAnswerId,
        explanation: q.explanation,
      }))
      return success(res, safe)
    }
    safe.questions = safe.questions.map((q) => ({
      questionText: q.questionText,
      options: q.options,
    }))
    return success(res, safe)
  } catch (e) {
    console.error('[getRcById] error:', e);
    next(e)
  }
}
