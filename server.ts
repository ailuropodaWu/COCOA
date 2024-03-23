import * as express from 'express';    
const app = express();    
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/", (req, res) => {
  console.log(req.body);
  res.json("OK");
});

app.listen(4200, () => console.log("Server started at 4200..."));