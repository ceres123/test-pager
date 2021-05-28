
# Aircall Technical Test - Aircall Pager


Technical test to implement [`Aircall Pager`](https://github.com/aircall/technical-test-pager).


## Running Tests

To run tests, run the following command

```bash
  yarn
  yarn test 
```

  
## Implementation
I have created 4 handler in order to manage 4 type of `event`
 - `AcknowledgeAlert` ->  handleAcknowledgedAlertEventAsync
 - `Alert` ->  handleAlertEventAsync
 - `CloseIncident` ->  handleConsoleHealthyEventAsync
 - `TimeoutExpired` ->  handleTimeoutExpiredEventAsync
 
  
## Concurrency

I assume read committed isolation level for the database, so that I have manged precondition in a way is not possible to have incosistent data.

  
## TODO

- Add test in `NotificationManager`.
- Pass `correlation_id` calling other services. 
- Move `action` inside `Context` for `NotificationSystemEvent` interface.
- Add ts doc.
