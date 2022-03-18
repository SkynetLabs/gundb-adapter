# Gundb Adapter
An adapter for GunDB using Skynet

# How it works
When GunDB wants to save data, it will call the `put` function on the [adapter](https://github.com/SkynetLabs/gundb-adapter/blob/main/src/index.js). This is basically a simple wrapper around SkyDB's `setJSON` endpoint. Likewise, when GunDB wants to retrieve data, it will call the `get` function on the adapter. This is basically a simple wrapper around SkyDB's `getJSON` endpoint. Additional logging and error handling functions were also added. These can be enabled by passing in the option `debug = true`. This adapter can be used both client-side and server-side. On the client, it allows you to use Skynet to persist data without a relay. On the server, it can be used together with a relay to save data from it's peers. 

The main [index.js](https://github.com/SkynetLabs/gundb-adapter/blob/main/src/index.js) contains all the functionality. The rest are dependencies, configuration and npm package related. This library is most easily used in the form of an [npm package](https://www.npmjs.com/package/skynet-adapter)

# Options
The adapter specific options are: **Secret**, **Portal**, and **Debug**. **Until** is a GunDB specific option
```
var gun = zenbase({
    // the secret for skynet
    secret: process.env["SECRET"] || "YOUR_SECRET_HERE", 
    // the skynet portal
    portal: process.env["PORTAL"] || "https://siasky.net", 
    // whether we want additional debug settings on
    debug: process.env["DEBUG"] || true,
    // decreases the frequency that gun writes to the storage adapter. See issue here: https://github.com/Fluffy9/Zenbase/issues/1#issuecomment-823504402 
    until: process.env["UNTIL"] || 2*1000
}) 
```

## Secret 
This is used to define the seed that SkyDB will use to generate the private and public keys. These keys are used in the `put` and `get` functions GunDB calls to store and retireve data. If it is set to the same thing as someone else, you are able to read and write from the same data. This may be something you want to do if you're running multiple [relays](https://github.com/SkynetLabs/gundb-relay). If you're running a relay and the adatapter client side, you may want to ensure you're using the same secret as the one on the relay. If you want prevent other people from using the same storage as you, you're best off running a relay with a private secret.

## Portal
This determines which skynet portal to use

## Debug
This turns on logging for all data uploaded to skynet, and all errors. It also has debugger statements for easy debugging. When sending data to skynet, it will log `[put]` + `Key: the key` + `Data: json data`.
This is the key used to retrieve the data from SkyDB, and whatever json data GunDB generates. Likewise with getting data from skynet, it will log `[get]` + `Key: the key` + `Data: json data`. This is the key used to store the data in SkyDB, and whatever json data GunDB generated.

For further documentation on the structure of GunDB data, you can check the documentation [here](https://gun.eco/docs/FAQ#what-is-a-soul-what-does-a-node-look-like)

Any errors will be logged as well.

## Until
Because GunDB is very quick, it can overwhelm SkyDB. This leads to laggy data or lost data. `until` is the amount of time in milliseconds that GunDB will wait before it sends a batch of data to the adapter. It is recommended to set it at 2000 milliseconds (2 seconds) to give SkyDB plenty of time to react.


# Verification
With debugging on, the logs will print the key and data that it sent to skynet. The secret option is the seed used to generate the public key and private key from Skydb. With all three it's possible to retrieve the skynet link of the data that was stored.
![Capture3](https://user-images.githubusercontent.com/29765579/158858083-688b48f7-7d9c-4f9f-a752-437ccd6f17bf.PNG)
