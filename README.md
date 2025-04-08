# Nage Warzone Backend

## Install & Run

```bash
npm install
node index.js
```

## API Routes

- `POST /api/register` - username, password
- `POST /api/login` - username, password
- `POST /api/roll` - username, characterName
- `POST /api/admin/token` - username, amount
- `POST /api/admin/rates` - { itemName: rate }
- `GET /api/admin/logs`
- `GET /api/tokens/:username`

Deployed version available at: https://warzonebackend-3il3.onrender.com
