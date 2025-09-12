# Migration Notes

## 2025-09 Attempt Model Change (attemptType)

Added field `attemptType` (enum: `official`, `practice`) to `Attempt` and replaced unique index.

### Previous Index

```
{ userId: 1, rcPassageId: 1 } unique
```

### New Index

```
{ userId: 1, rcPassageId: 1, attemptType: 1 } unique
```

### Rationale

Allows multiple `practice` attempts per RC while restricting one `official` attempt that contributes to streaks and accuracy metrics.

### Migration Steps (Mongo Shell)

1. Connect to database.
2. Drop old index (name may vary; list first):

```
db.attempts.getIndexes()
```

Locate index with key `{ userId: 1, rcPassageId: 1 }` (example name `userId_1_rcPassageId_1`). Then:

```
db.attempts.dropIndex('userId_1_rcPassageId_1')
```

3. Ensure documents missing `attemptType` are defaulted to `official` (update in place):

```
db.attempts.updateMany({ attemptType: { $exists: false } }, { $set: { attemptType: 'official' } })
```

4. Create new index:

```
db.attempts.createIndex({ userId: 1, rcPassageId: 1, attemptType: 1 }, { unique: true })
```

### Verification

- Insert a duplicate `practice` attempt for same user/rc; should succeed (if first was also practice, but with different answers/time).
- Insert second `official` attempt for same user/rc; should fail with duplicate key error.

### Rollback

If issues arise, drop the new compound index and recreate the original:

```
db.attempts.dropIndex('userId_1_rcPassageId_1_attemptType_1')
db.attempts.createIndex({ userId: 1, rcPassageId: 1 }, { unique: true })
```

Ensure you remove any additional practice attempts before rollback to avoid conflicts.

---

## Future Considerations

- Add TTL or archival strategy for excess practice attempts if storage volume grows.
- Consider analytics index on `{ userId: 1, attemptType: 1, attemptedAt: -1 }` later.
