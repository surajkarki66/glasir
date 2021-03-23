# Glasir
This is our first academic project. Actually, `Glasir` is freelancing website targeted for Nepalese people.
This repo contain all the endpoints of REST APIs required for `Glasir` website frontend.

## To start the node development server.
First create .env file with name `.env`. Then copy the following credentials

```
SERVER_PORT=5000
SERVER_HOSTNAME=localhost

MONGO_USERNAME=<mongodb database username> 
MONGO_PASSWORD=<mongodb database password>
MONGO_HOST=<mongodb cluster host name>

ACCESS_TOKEN_SECRET=laskdjflsdjf
REFRESH_TOKEN_SECRET=jlskadfjll
ACTIVATION_TOKEN_SECRET=jflsdkjufasdhfl
FORGOT_TOKEN_SECRET=flkjorgetlk

EMAIL = <glasir-email>
EMAIL_PASS = <glasir-password>


MESSAGEBIRD_LIVE_KEY=<messagebird-live-key>

NODE_ENV=development
CLIENT_URL=http://localhost:3000
DATABASE=glasir
SERVICE_FEE_RATE=0.1

```

 - yarn install
 - yarn run dev
 
