## 0.0.1
Features:

- supported modules: logger, collectionAccess, email, validation, utils, request, moment, async, backendContext.
- collectionAccess supports objectID, find, findOne, insert, remove, save, update. (unsupported: everything else)
- exception: utils module does not support `tempObjectStore` (no work with hooks yet).
- support user login & logout (unsupported: update, email verification, password reset, forgot username).
- Kinvey-local object map: appKey, appSecret, masterSecret, setOptions, Error, User, init, ping, getActiveUser, setActiveUser, execute.
- Kinvey full object map: appKey, appSecret, masterSecret, getActiveUser, setActiveUser, init, ping, Error, Defer, Acl, Group, execute, DataStore, File, Metadata, Social, User, Query, Persistence, Sync.