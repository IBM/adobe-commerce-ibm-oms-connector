const stateLib = require("@adobe/aio-lib-state");
var state = null;
// init when running in an Adobe I/O Runtime action (OpenWhisk) (uses env vars __OW_API_KEY and __OW_NAMESPACE automatically)
async function init() {
  state = await stateLib.init();
}
// or if you want to use your own cloud DB account (make sure your partition key path is /partitionKey)
//const state = await stateLib.init({ cosmos: { endpoint, masterKey, databaseId, containerId, partitionKey } })

//save
async function save(key, value) {
  var result = await state.put(key, value);
  return result;
}

// put
async function update(key, value) {
  var result = await state.put(key, value);
  //await state.put('key', { anObject: 'value' }, { ttl: -1 }) // -1 for no expiry, defaults to 86400 (24 hours)
  return result;
}

// get
async function get(key) {
  try {
    const res = await state.get(key); // res = { value, expiration }
    const value = res && res.value ? res.value : undefined;
    console.log("LOCAL STORAGE: Key" + key + "  Value" + res);
    return value;
  } catch (ex) {
    console.log(ex);
    return undefined;
  }
}

// delete
async function remove(key) {
  var result = await state.delete("key");
  return result;
}

module.exports = {
  save,
  get,
  remove,
  update,
  init,
};
