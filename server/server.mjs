import app from './app.mjs';

const port = Number(process.env.PORT ?? 3001);

app.listen(port, () => {
  console.log(`Admin API listening on http://localhost:${port}`);
});
