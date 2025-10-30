# Free Plan Canonicalization & Migration

This document records the final Free Plan document and the safe migration plan to ensure all users with `subscription: 'none'` (or no `subscriptionPlan`) are converted to the canonical Free Plan pointer while preserving historical subscription dates for auditing.

Do not run any migration commands in production without following the dry-run and backup steps below.

---

## Canonical Free Plan (final)

This is the canonical Plan document that will represent the Free tier in the system. Use this object as reference when seeding, editing in admin, or using in scripts.

```json
{
  "_id": "68fe4026cd1b95b36b1f5316",
  "slug": "free",
  "__v": 0,
  "accessUntil": null,
  "active": true,
  "billingType": "duration_days",
  "createdAt": "2025-10-26T15:37:07.657Z",
  "createdBy": null,
  "currency": "INR",
  "description": "Free plan",
  "durationDays": 0,
  "features": {
    "feedbackLock": {
      "enabled": false,
      "scope": "all"
    },
    "dailyLimits": {
      "dailyRcs": null,
      "dailyAttempts": null
    },
    "archive": {
      "type": "attempted-only",
      "windowDays": null,
      "includeAttempted": true
    }
  },
  "finalPriceCents": 0,
  "markupPriceCents": null,
  "name": "Free",
  "updatedAt": "2025-10-26T15:48:55.427Z",
  "version": 1
}
```

Notes:
- `features.feedbackLock.enabled` can be toggled by admin via the Plan editor to enable/disable feedback lock for users on the Free plan. The current product decision is to enforce feedback lock for free users; admin can set `enabled: true` when ready.
- The Free plan must be protected: it should not be deletable, and billing fields should be read-only in the admin UI.

---

## Migration policy (preserve historical dates)

Goal: For any user whose effective subscription is "none" (legacy `subscription: 'none'`, `subscription == null`, or missing `subscriptionPlan`) perform the following safely:

- Preserve existing `subon` and `subexp` fields for audit.
- Set `user.subscriptionPlan = ObjectId('<freePlanId>')`.
- Set `user.issubexp = true` (if user was expired) or keep existing value when not expired.
- Do NOT erase or unset legacy `subscription` field during the initial migration run; keep it for verification and rollback.

This approach ensures plan-driven gating always finds a valid `subscriptionPlan` pointer while preserving the user's historical paid-subscription dates for audit and support.

---

## Safe migration steps (dry-run first)

1. Pre-flight checks (always run first):
   - Take a DB backup / snapshot for the target environment.
   - Confirm `free` plan exists and note its `_id` (freePlanId).

   Example Mongo command:

   ```js
   // Run in a node mongo shell or a maintenance script (do not run in prod until dry-run reviewed)
   const freePlan = db.plans.findOne({ slug: 'free' })
   printjson(freePlan)
   ```

2. Dry-run: identify candidates and sample records

   - Candidate selection rule (adjust as needed):
     - Users with `subscription == 'none'` and `issubexp: true`, or
     - Users with `subscriptionPlan` missing/null and `issubexp: true`, or
     - Users with `subscription == 'none'` regardless of issubexp if you prefer.

   Example queries (dry-run):

   ```js
   // Count candidates
   db.users.countDocuments({ $or: [{ subscription: 'none' }, { subscription: null }, { subscriptionPlan: { $exists: false } }] })

   // Show a small sample (replace limit 20 as needed)
   db.users.find({ $or: [{ subscription: 'none' }, { subscriptionPlan: { $exists: false } }] }).limit(20).pretty()
   ```

   Inspect sample rows and verify `subon` / `subexp` values are present where expected.

3. Dry-run update (simulate changes without writing)

   - Produce a report showing what would be updated. A script should list `user._id`, `subon`, `subexp`, current `subscription` and `subscriptionPlan` and proposed `newSubscriptionPlan`.

   Example pseudo-script (Node):

   - connect to DB
   - freePlanId = db.plans.findOne({ slug: 'free' })._id
   - cursor = db.users.find(criteria).batchSize(1000)
   - for each user in cursor: print({ _id: user._id, subon: user.subon, subexp: user.subexp, oldSubscription: user.subscription, oldPlan: user.subscriptionPlan, newPlan: freePlanId })

4. Apply (batched, small increments)

   - When dry-run verified, apply update in batches (e.g., 1k users at a time). Do not unset legacy `subscription` yet.

   Example update command (Mongo):

   ```js
   const freePlanId = ObjectId('68fe4026cd1b95b36b1f5316')
   db.users.updateMany(
     { subscription: 'none', issubexp: true, subscriptionPlan: { $ne: freePlanId } },
     { $set: { subscriptionPlan: freePlanId, issubexp: true } }
   )
   ```

   - Log counts of modified users and sample one or two records for verification after each batch.

5. Post-apply verification

   - Verify a random sample of updated users now has `subscriptionPlan == freePlanId` and unchanged `subon/subexp`.
   - Run end-to-end gating checks in staging-like environment or via smoke endpoints to ensure free users are subject to Plan.features.

6. Optional: cleanup legacy field

   - After a verification period (e.g., 48-72 hours), you may choose to unset legacy `subscription` field. Only do this once confident. Example:

   ```js
   db.users.updateMany({ subscription: 'none', subscriptionPlan: freePlanId }, { $unset: { subscription: 1 } })
   ```

   - Keep archives/backups of the field values before mass-unset.

---

## Rollback plan

- If an issue is found, you can revert changes by restoring DB from backup/snapshot created pre-migration. Because we keep `subscription` during initial runs, you can also re-run a script that sets `subscriptionPlan` back to null for the affected user set.

---

## Implementation notes for when you say "go"

- I can provide a ready-to-run script `server/scripts/migrateToFreePlan.js` with the following features:
  - `--dry` : prints a summary and does not write anything
  - `--apply` : performs updates in configurable batch sizes
  - safety checks: errors out if `free` plan not found
  - logging: writes a per-batch JSON summary file

- I will not create or run the script until you explicitly instruct me to `apply`.

### Run the provided migration script

I added a script at `server/scripts/migrateToFreePlan.js`. It supports these flags:

- `--dry` : only prints candidate counts and a small sample; no writes.
- `--apply` : performs batched updates (must be passed explicitly to write).
- `--only-expired` : limit candidates to users with `issubexp: true`.
- `--batch-size N` : number of users to update per batch (default 1000).
- `--mongo <uri>` : optional Mongo connection string; otherwise uses `MONGO_URI` or `MONGODB_URI` from the environment.

Example PowerShell commands:

```powershell
# Dry run (recommended first)
node .\server\scripts\migrateToFreePlan.js --dry --mongo "mongodb://user:pass@host:27017/yourdb"

# Apply in staging (small batch size)
node .\server\scripts\migrateToFreePlan.js --apply --batch-size 200 --mongo "mongodb://user:pass@host:27017/yourdb"

# Apply only expired candidates
node .\server\scripts\migrateToFreePlan.js --apply --only-expired --mongo "mongodb://..."
```

The script will always print a dry-run sample before applying. It will not remove the legacy `subscription` field; that cleanup is optional and manual after verification.

---

## Next steps (suggested immediate)

1. Confirm you want option A (preserve historical `subon/subexp`).
2. Confirm you want to keep legacy `subscription` during initial migration (we recommend yes for safety).
3. Decide a staging run window and backup cadence.
4. Tell me if you want me to create the `server/scripts/migrateToFreePlan.js` script (I will produce it as a dry-run capable tool and a PR-ready patch).

Once you confirm, I will prepare the migration script and a small checklist for running the staging dry-run.
