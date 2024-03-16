import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "./App.css";
import background from "./assets/background.jpg";
import logo from "./assets/logo.png";
import pattern from "./assets/pattern.png";
import CONSTANTS from "./constants";

const App = () => {
  const [lastCharacterCount, setLastCharacterCount] = useState(
    CONSTANTS.MAX_CHARACTER_COUNT
  );
  const [characters, setCharacters] = useState([]);
  const profiles = [
    require("./assets/profile1.webp"),
    require("./assets/profile2.webp"),
    require("./assets/profile3.webp"),
    require("./assets/profile4.webp"),
    require("./assets/profile5.webp"),
    require("./assets/profile6.webp"),
    require("./assets/profile7.webp"),
    require("./assets/profile8.webp"),
  ];

  useEffect(() => {
    getCharacters();
  }, []);

  const getCharacters = async () => {
    try {
      const res = await axios.get("https://swapi.dev/api/people/");
      if (res.status === CONSTANTS.STATUS_SUCCESS && res.data) {
        const characters = res.data.results.slice(
          0,
          CONSTANTS.MAX_CHARACTER_COUNT
        );
        const charactersWithFilm = await Promise.all(
          characters.map(async (character) => {
            try {
              const filmRes = await axios.get(character.films[0]);
              if (filmRes.status === CONSTANTS.STATUS_SUCCESS && filmRes.data) {
                return {
                  ...character,
                  filmName: filmRes.data.title,
                  pfp: profiles[Math.floor(Math.random() * 8)],
                };
              }
            } catch (error) {
              console.error("Error fetching film:", error);
            }
          })
        );
        setCharacters(charactersWithFilm.filter(Boolean));
      }
    } catch (error) {
      console.error("Error fetching characters:", error);
    }
  };

  const addCharacter = useCallback(async () => {
    try {
      const res = await axios.get(
        `https://swapi.dev/api/people/${lastCharacterCount + 1}`
      );
      if (res.status === CONSTANTS.STATUS_SUCCESS && res.data) {
        const character = res.data;
        const characterWithFilm = await getFilm(character);
        setCharacters((prevCharacters) => [
          ...prevCharacters,
          characterWithFilm,
        ]);
        setLastCharacterCount((prevCount) => prevCount + 1);
      }
    } catch (error) {
      console.error("Error adding character:", error);
    }
  }, [lastCharacterCount]);

  const getFilm = async (character) => {
    try {
      const res = await axios.get(character.films[0]);
      if (res.status === CONSTANTS.STATUS_SUCCESS && res.data) {
        return {
          ...character,
          filmName: res.data.title,
          pfp: profiles[Math.floor(Math.random() * 8)],
        };
      }
    } catch (error) {
      console.error("Error fetching film:", error);
    }
  };

  const removeCharacter = (characterName) => {
    setCharacters((prevCharacters) =>
      prevCharacters.filter((value) => value.name !== characterName)
    );
  };

  return (
    <div className="app-wrapper">
      <img
        src={background}
        alt="starwars background"
        className="background-img"
      />
      <div className="overlay"></div>
      <header>
        <img src={logo} alt="starwars logo" className="logo" />
      </header>
      <div className="button-container flex-center">
        {characters.length <= 3 && (
          <button onClick={addCharacter} className="flex-center">
            <span className="material-symbols-outlined">add</span>
            Add Character
          </button>
        )}
      </div>
      <section className="character-section flex-center">
        {characters.map(({ name, height, filmName, pfp }) => (
          <div className="character-card" key={name}>
            <img
              src={pattern}
              alt="pattern"
              className="character-card-pattern"
            />
            <div className="inner-container">
              {characters.length > 3 && (
                <div
                  className="close-icon flex-center"
                  onClick={() => removeCharacter(name)}
                >
                  <span className="material-symbols-outlined">close</span>
                </div>
              )}
              <img
                src={pfp}
                alt="starwars profile"
                className="character-profile-img"
              />
              <div className="character-content">
                <h1>{name.substring(0, 10)}</h1>
                <p>
                  {height} " <span>(Height)</span>
                </p>
                <p>
                  {filmName} <span>(Film)</span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default App;
