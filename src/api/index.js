const express = require('express');
const healthRoutes = require('./routes/health');
const tasksRoutes = require('./routes/tasks');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(healthRoutes);
app.use(tasksRoutes);

app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});

module.exports = app;
