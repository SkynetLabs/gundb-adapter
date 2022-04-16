// import skynet and gun, make sure webpack does it right for nodejs vs client side
// const { SkynetClient, genKeyPairFromSeed } =
//   "undefined" !== typeof window ? window.skynet : require("skynet-js");
const Gun = "undefined" !== typeof window ? window.Gun : require("gun");

const {
  SkynetClient,
  genKeyPairFromSeed,
  getEntryLink,
} = require("@skynetlabs/skynet-nodejs");

// if this is true, we print extra logs and have debugger statements to make debugging easier
if (!Gun) {
  throw "Gun is undefined";
}
var debug = false;
/**
 * this is the schema gun uses for storage adapters. The opt object also contains user-defined settings. Example here: https://github.com/amark/gun/blob/master/lib/rs3.js
 * @param {*} opt currently `secret`, `portal`, `debug`, `skynetApiKey`, are the custom options in this storage adapter
 * @returns
 */
function factory(opt) {
  opt.file = String(opt.file || "radata");
  opt.revision = 0;
  var store = {};
  // generate the keys for skynet
  const { publicKey, privateKey } = genKeyPairFromSeed(opt.secret);
  // set the portal from the `portal` option or set it to the default portal
  const client = new SkynetClient(opt.portal || "https://siasky.net", {
    skynetApiKey: opt.skynetApiKey || undefined,
  });
  // set debug from the `debug` option
  debug = opt.debug;

  /**
   * this is the schema gun uses when it wants to save data
   * @param {*} key the key used to retreive data
   * @param {*} data the data that is set
   * @param {*} cb some gun object that returns data
   */
  store.put = function (key, data, cb) {
    // if the debug setting is on, print the key and the data we're storing to skynet, and pause execution using debugger statement
    if (debug) {
      console.log("[Put] \nKey: " + key + " \nData: ");
      // console.log(JSON.parse(data));
      // debugger;
    }
    // if there is data to be stored, pass that data to skynet
    if (data) {
      client
        .uploadData(data, key)
        .then((skylink) => {
          if (debug) {
            console.log(`${key} saved to ${skylink}`);
          }
          client.db
            .setDataLink(privateKey, key, skylink)
            .then((res) => {
              if (debug) {
                console.log(`${getEntryLink(publicKey, key)} Updated.`);
              }
              cb(null, 1);
            })
            .catch((err) => {
              cb(err, "skynet");
            });
        })
        .catch((err) => {
          // if there is an error and debugging is on, make it easier to debug
          // gun throws a lot of errors even if it succeeds though ¯\_(ツ)_/¯
          if (debug) {
            console.log("Put Error: ", err);
            // debugger;
          }
          // return the error
          cb(err, "skynet");
        });
    }
  };
  /**
   * this is the schema gun uses when it wants to retrieve data
   * @param {*} key the key used to retrieve the data
   * @param {*} cb some gun object that returns the data
   */
  store.get = function (key, cb) {
    // Get Resolver Skylink which points to the skyfile
    let resolverSkylink = getEntryLink(publicKey, key);

    // if the debug setting is on, print the key we're using to retrieve from skynet, and pause execution using debugger statement
    if (debug) {
      console.log("[Get] \nKey: " + key);
      // console.log("reading from Skylink:", resolverSkylink);
      // debugger;
    }

    client
      .downloadData(resolverSkylink)
      .then((res) => {
        if (debug) {
          console.log(`Data Downloaded from ${resolverSkylink}`);
          // console.log(String(res));
        }

        // Pass the data back to gun. In the case where the data returned is null or something we'll return undefined
        cb(null, res || undefined);
      })
      .catch((err) => {
        console.log("data not downloaded");
        // if there is an error and debugging is on, make it easier to debug
        // gun throws a lot of errors even if it succeeds though ¯\_(ツ)_/¯
        if (debug) {
          console.log("Get Error: ", JSON.stringify(err));
          debugger;
        }
        // return nothing
        cb(null, undefined);
      });
  };
  return store;
}

// more storage adapter schema
Gun.on("create", function (root) {
  this.to.next(root);
  root.opt.store = root.opt.store || factory(root.opt);
});

// if modules are available we'll make an export too
try {
  exports.zenbase = Gun;
} catch (e) {}
