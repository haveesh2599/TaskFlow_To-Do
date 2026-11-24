# TaskFlow Security Specification (Payload-First Security TDD)

## 1. Data Invariants

1. **Strict Ownership**: A user document at `users/{userId}` can only be read, created, or updated by the authenticated user whose `request.auth.uid == userId` and `request.auth.token.email_verified == true`. No cross-user reads or collection-wide `list` queries on `users` are permitted (PII isolation for `email`).
2. **Master Gate for Tasks**: A task document at `users/{userId}/tasks/{taskId}` cannot exist or be written unless the parent user document `users/{userId}` exists (`exists(/databases/$(database)/documents/users/$(userId))`), and `request.auth.uid == userId`, and `incoming().userId == userId`.
3. **Path & ID Hardening**: Both `{userId}` and `{taskId}` must match `^[a-zA-Z0-9_\-]+$` with length `<= 128` on single-document operations (`get`, `create`, `update`, `delete`).
4. **Schema & Boundary Enforcement**:
   - `title`: non-empty string, `1 <= size <= 200`.
   - `description`: string, `size <= 2000`.
   - `category`: strictly in `['Personal', 'Study', 'Work', 'Shopping', 'Health', 'Other']`.
   - `priority`: strictly in `['Low', 'Medium', 'High']`.
   - `dueDate`: Firestore `timestamp`.
   - `dueTime`: string matching `^(|([01]\d|2[0-3]):[0-5]\d)$` (`size <= 5`).
   - `completed`: `bool`.
   - Exact allowed keys checked with `hasAll` and `hasOnly` on create, and `affectedKeys().hasOnly(...)` on named update actions.
5. **Temporal Integrity & Immortality**:
   - On `create`: `createdAt == request.time && updatedAt == request.time`.
   - On `update`: `createdAt == existing().createdAt && updatedAt == request.time`, and `userId == existing().userId` (`uid == existing().uid` on `users`).

## 2. The "Dirty Dozen" Adversarial Payloads (Must All Return PERMISSION_DENIED)

1. **Cross-User Read (`GET` `users/otherUid/tasks/task1`)**: Authenticated as `userA`, attempt to read `userB`'s task.
2. **Cross-User List (`LIST` `users/otherUid/tasks`)**: Authenticated as `userA`, attempt to list `userB`'s tasks collection.
3. **Blanket User Directory Scrape (`LIST` `users`)**: Authenticated as `userA`, attempt to list `/users` to harvest emails.
4. **Unverified Email Write (`CREATE` `users/userA/tasks/task1`)**: Authenticated with `email_verified: false`, attempt to create a task.
5. **Identity Spoofing on Create (`CREATE` `users/userA/tasks/task1`)**: `userId` in payload set to `userB` instead of `request.auth.uid`.
6. **Shadow / Ghost Field Injection (`CREATE` `users/userA/tasks/task1`)**: Valid fields plus `"isAdmin": true` or `"role": "superadmin"`.
7. **Orphaned Task Write (`CREATE` `users/userA/tasks/task1`)**: Parent `users/userA` document does not exist in Firestore.
8. **ID Poisoning (`CREATE` `users/userA/tasks/bad..id$123`)**: Document ID contains invalid characters or exceeds 128 bytes.
9. **Resource Exhaustion / Value Poisoning (`CREATE` `users/userA/tasks/task1`)**: `title` is empty `""` or > 200 chars, or `description` > 2000 chars.
10. **Invalid Enum Injection (`UPDATE` `users/userA/tasks/task1`)**: `priority` set to `"Critical"` or `category` set to `"Hacked"`.
11. **Timestamp Forgery / Immortal Field Tampering (`UPDATE` `users/userA/tasks/task1`)**: Attempt to alter `createdAt` or `userId`, or set `updatedAt` to a backdated client timestamp instead of `serverTimestamp()`.
12. **Unlisted Update Action (`UPDATE` `users/userA/tasks/task1`)**: Attempt to inject an unknown field during a partial update (`affectedKeys` includes `"ghostField"`).
