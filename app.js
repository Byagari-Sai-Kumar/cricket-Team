const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//Get all players list AP1
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT
    *
    FROM 
    cricket_team;`;
  const playersList = await db.all(getPlayersQuery);
  response.send(
    playersList.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

//add new player API2
app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;

  const addPlayerQuery = `
    INSERT INTO 
        cricket_team (player_name,jersey_number,role)
    VALUES ('${playerName}',${jerseyNumber},'${role}');`;

  try {
    const dbResponse = await db.run(addPlayerQuery);

    response.send("Player Added to Team");
  } catch (e) {
    console.log(e.message);
  }
});

//Get single player API3
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const getSinglePlayerQuery = `
    SELECT 
    *
    FROM
    cricket_team
    WHERE 
    player_id = ${playerId}`;

  const dbResponse = await db.get(getSinglePlayerQuery);

  response.send(convertDbObjectToResponseObject(dbResponse));
});

//Update player details API4
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const { playerName, jerseyNumber, role } = request.body;

  const updatePlayerDetails = `
    UPDATE 
    cricket_team
    SET 
    player_name = '${playerName}',
    jersey_number = ${jerseyNumber},
    role = '${role}'
    WHERE 
    player_id = ${playerId};`;

  try {
    const dbResponse = await db.run(updatePlayerDetails);

    response.send("Player Details Updated");
  } catch (error) {
    console.log(error.message);
  }
});

//Delete a player API5
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const deletePlayerQuery = `
    DELETE FROM
        cricket_team
    WHERE 
        player_id = ${playerId};`;

  await db.run(deletePlayerQuery);

  response.send("Player Removed");
});

module.exports = app;
