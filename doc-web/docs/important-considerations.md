---
sidebar_position: 2
---

# Important Considerations

### Browser events and blocked popups

To avoid popup spam, all browsers have restricted the use of popups. In order to use them, each popup must be opened inside a function that has been triggered in an onClick event. Each function can only open one popup, if it tries to open a second popup, it will be blocked by the browser. Therefore, connect and signTransaction methods must be called in two different actions.

### Firefox and Safari issues

Firefox and Safari browsers have a different behavior on managing DOM events. For both browsers, an onClick event will disappear after an asynchronous function is called. Therefore, it is important for all MyAlgo Connect methods to be the first asynchronous function to be called in the onClick event. If this does not happen, the browser will block the popup opened by MyAlgo Connect and the user must manually allow the popup to interact with it through the browser settings.

### Hardware wallet issues

Unfortunately, Ledger Nano has hardware limitations that limit some transaction fields, especially for application transactions. Furthermore, signing stateless teal is not implemented yet in the Algorand ledger application. MyAlgo Connect team is pushing Ledger to add full functionality for Algorand applications. This section will be updated once this has changed.

| Transaction field | Value         | Notes         |
| :---              |    :----:     |    :----: |
| note             |   32 bytes for Ledger Nano S and 512 bytes for Ledger Nano X    | Currently, MyAlgo Connect only allows 32 bytes for both devices |
| appAccounts      |    2     |      |
| appForeignAssets |    1     |      |
| appForeignApps   |    1     |      |
| appArgs          |    2     |   32 bytes max length per argument   |

