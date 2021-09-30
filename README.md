# Glasir
`Glasir` is a Nepali freelancing platform. Here you can find jobs and also applied for job as freelancer. As employer you can also hire freelancer for your jobs. It is built in MERN stack.

## To start the node development server.
First create .env file with name `.env`. Then copy the following credentials

```
SERVER_PORT=5000
SERVER_HOSTNAME=localhost

MONGO_USERNAME=<mongodb database username> 
MONGO_PASSWORD=<mongodb database password>
MONGO_HOST=<mongodb cluster host name>

ACCESS_TOKEN_SECRET=laskdjflsdjf
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

```bash
  $ yarn install
  $ yarn run dev
```

 
 
## To start client side

```bash
  $ cd client
  $ yarn install
  $ yarn run dev
```




