# Textualize

Pulling out insights from message history.

### Prerequisites

This project only works for iOS devices. Android is unsupported.
Theoretically the analysis platform should be able to run on any OS. However,
the app has been tested only on MacOS. Certain features like the location of
the backup will require additional configuration.

## Installation

### Common Errors
1. If you a warning regarding NODE_MODULE_VERSION 72 vs 73 follow the instructions
regarding electron-rebuild

https://stackoverflow.com/questions/46384591/node-was-compiled-against-a-different-node-js-version-using-node-module-versio

2. If the server fails to connect 10000ms
https://github.com/fyears/electron-python-example/issues/28

pip install zerorpc and make sure you are running the command from the correct
virtual-env

## Future Work
- Robust Logger for the Backend
- Smoother User Onboarding
    - Guess Sources
    - Select
- Select Date Range
- Performance (correct caching and preprocessing)
- More Stats!
    - Group Analysis
    - Wordcloud Component
- Videos
- Abstract data fetching from Components
    - Redux?

