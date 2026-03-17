# Firebase Forum Migration TODO

## Completed
- [x] Firebase config file

## Plan Steps
1. Install Firebase SDK (no npm, CDN modules)
2. auth.html (signup/login)
3. dashboard.html (user stats)
4. Refactor forum to firebase-forum.js
5. Update index/forum.html for auth
6. Firestore security rules (manual)
7. Test auth/posts/likes (no duplicates)

## Progress
- [x] firebase-config.js
- [x] auth.html + firebase-auth.js (signup/login, user doc)
- [x] dashboard.html + firebase-dashboard.js (stats, user posts realtime)
- [x] firebase-forum.js (Firestore posts/comments/likes, auth guards)
- [x] index/forum.html integrated Firebase modules/auth nav



